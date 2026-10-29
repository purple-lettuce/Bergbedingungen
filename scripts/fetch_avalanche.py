#!/usr/bin/env python3
"""Lawinenlage: zentrale Pipeline. Holt über die Provider (avalanche_sources.py) Bulletins und Regionspolygone.

Je Quelle entstehen zwei Dateien im Standardmodell (avalanche_schema.py, Beschreibung: docs/AVALANCHE_ARCHITECTURE.md):

  data/avalanche/<id>.json            Bulletins + Regionenindex (täglich)
  data/avalanche/<id>_regions.geojson Polygone mit Identifikation und Symbolposition (ändert sich selten)

und data/avalanche/index.json als Verzeichnis der Quellen für das Frontend. Fällt eine Quelle aus, bleiben ihre
Dateien unverändert, die übrigen Quellen werden trotzdem geschrieben, der Lauf endet dann mit Fehler.

Aufruf: python3 scripts/fetch_avalanche.py [Quelle ...]
Datenquellen und Lizenzen: docs/DATENQUELLEN.md
"""
import datetime
import json
import os
import sys
import time
import urllib.error
import urllib.request

sys.path.insert(0, os.path.dirname(__file__))
import avalanche_model as m
import avalanche_providers as providers
import avalanche_schema as schema
import avalanche_sources as s

DATA_DIR = os.environ.get("AVALANCHE_DATA_DIR", os.path.join(os.path.dirname(__file__), "..", "data", "avalanche"))
REGIONS_URL = os.environ.get("AVALANCHE_REGIONS_URL", providers.REGIONS_URL)
HEARTBEAT_DAYS = 7        # Datei spätestens so oft neu schreiben, damit das Repository auch außerhalb der Saison aktiv bleibt
PAUSE = 0.5               # Sekunden zwischen Abfragen beim selben Dienst (SLF bittet um Schonung der Schnittstelle)
UA = "bergbedingungen-snapshot (+https://github.com/purple-lettuce/Bergbedingungen)"
META_KEYS = providers.META_KEYS


def get_json(url):
    last = None
    for attempt in range(4):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept": "application/json"})
            with urllib.request.urlopen(req, timeout=60) as r:
                return json.load(r)
        except urllib.error.HTTPError as e:
            last = e
            if e.code < 500 and e.code != 429:
                break
        except Exception as e:  # Netzwerk, Timeout, kaputtes JSON
            last = e
        time.sleep(2 * (attempt + 1))
    raise RuntimeError("Abruf fehlgeschlagen: %s (%s)" % (url, last))


def write_json(path, doc):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    tmp = path + ".tmp"
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump(doc, f, ensure_ascii=False, separators=(",", ":"))
    os.replace(tmp, path)


def read_json(path):
    try:
        with open(path, encoding="utf-8") as f:
            return json.load(f)
    except (OSError, ValueError):
        return None


def parse_time(t):
    return datetime.datetime.fromisoformat(t.replace("Z", "+00:00"))


def write_if_changed(path, doc, now, heartbeat=False):
    """Schreibt nur bei neuem Inhalt. Mit heartbeat zusätzlich, wenn die Datei älter als HEARTBEAT_DAYS ist."""
    old = read_json(path)
    if old is not None:
        same = {k: v for k, v in old.items() if k != "generated"} == {k: v for k, v in doc.items() if k != "generated"}
        fresh = (not heartbeat) or (old.get("generated") and
                                    now - parse_time(old["generated"]) < datetime.timedelta(days=HEARTBEAT_DAYS))
        if same and fresh:
            return False
    write_json(path, doc)
    return True


def make_fetcher():
    """get_json für einen Provider: Pause vor jeder Abfrage außer der ersten (Schonung des Dienstes)."""
    state = {"first": True}

    def fetch(url):
        if not state["first"]:
            time.sleep(PAUSE)
        state["first"] = False
        return get_json(url)    # zur Laufzeit gebunden, damit Tests get_json ersetzen können
    return fetch


def fetch_source(provider, now):
    """Zentrale Pipeline einer Quelle: Provider holt und übersetzt, alle weiteren Schritte sind für jede Quelle gleich."""
    sid = provider.id
    fetch = make_fetcher()

    # 1. Abruf und Übersetzung ins gemeinsame Modell (quellenspezifisch, im Provider)
    raw = provider.fetch_bulletins(fetch, os.environ.get("AVALANCHE_URL_" + sid.upper()))
    items, _skipped = provider.parse_bulletins(raw)
    if not items and not provider.empty_ok:
        raise RuntimeError("Keine Regionen aus %s im Bulletin" % ", ".join(provider.region_codes))
    date = max((i["date"] for i in items), default=now.date().isoformat())
    names = {}
    try:
        names = provider.fetch_names(fetch)
    except Exception as e:   # Namen sind nicht kritisch, ohne sie zeigt das Popup die Kennung
        print("[%s] Hinweis: Regionsnamen nicht geladen (%s)" % (sid, e))

    # 2. Geometrie (für alle Quellen gleich: gültige Polygone zum Datum, gerundet, mit Symbolposition)
    regions = m.build_regions(provider.fetch_geometries(fetch, REGIONS_URL), date, provider.in_scope)
    if not regions:
        raise RuntimeError("Keine gültigen Polygone für %s" % date)
    region_ids = {f["properties"]["region_id"] for f in regions}

    # 3. Regionenindex: jüngstes Bulletin je Region, Polygone ohne Bericht bleiben als "kein Bericht" sichtbar
    in_bulletin = {r["id"] for i in items for r in i["regions"]}
    missing_polygon = sorted(in_bulletin - region_ids)   # ohne Polygon nicht darstellbar
    for i in items:
        i["regions"] = [r for r in i["regions"] if r["id"] in region_ids]
    items = [i for i in items if i["regions"]]
    bulletins, index = m.index_bulletins(items, names)
    for rid in sorted(region_ids - set(index)):
        index[rid] = {"name": names.get(rid) or rid, "country": m.region_country(rid), "bulletin": None}
    index = {k: index[k] for k in sorted(index)}
    with_report = sum(1 for v in index.values() if v["bulletin"] is not None)

    # 4. Standardmodell: ein Datensatz je Region, gegen das Schema geprüft (ein Verstoß bricht diese Quelle ab)
    records = schema.build_region_records(sid, bulletins, index, regions)
    for rec in records:
        schema.validate_record(rec)

    print("[%s] Datum %s: %d Bulletins, %d Regionen mit Bericht, %d Polygone ohne Bericht"
          % (sid, date, len(bulletins), with_report, len(index) - with_report))
    if missing_polygon:
        print("[%s] WARNUNG: Regionen im Bulletin ohne Polygon (nicht dargestellt): %s" % (sid, ", ".join(missing_polygon)))
    if not bulletins:
        print("[%s] Kein aktives Bulletin (Saisonpause)." % sid)

    # 5. Schreiben
    out_dir = os.path.abspath(DATA_DIR)
    regions_doc = {"type": "FeatureCollection", "schema": schema.SCHEMA, "source": sid,
                   "geometry_source": providers.GEOMETRY_SOURCE, "geometry_license": providers.GEOMETRY_LICENSE,
                   "features": [schema.geometry_feature(r) for r in records]}
    for f in regions_doc["features"]:
        schema.validate_feature(f, schema.GEOMETRY_PROPERTIES)
    changed = write_if_changed(os.path.join(out_dir, sid + "_regions.geojson"), regions_doc, now)
    bulletin_doc = {
        "schema": schema.SCHEMA,
        "source": provider.meta(),
        "generated": now.isoformat().replace("+00:00", "Z"),
        "status": "active" if bulletins else "no_active_bulletin",
        "reference_date": date,
        "validity_period": m.validity(bulletins),
        "bulletins": bulletins,
        "regions": index,
    }
    changed |= write_if_changed(os.path.join(out_dir, sid + ".json"), bulletin_doc, now, heartbeat=True)
    print("[%s] %s" % (sid, "Dateien geschrieben." if changed else "unverändert."))


def write_index(now):
    """Verzeichnis der Quellen, deren Dateien vorhanden sind (auch wenn der heutige Abruf fehlschlug)."""
    out_dir = os.path.abspath(DATA_DIR)
    entries = []
    for provider in s.PROVIDERS:
        sid = provider.id
        if read_json(os.path.join(out_dir, sid + ".json")) and read_json(os.path.join(out_dir, sid + "_regions.geojson")):
            entries.append({"id": sid, "bulletin_file": sid + ".json", "regions_file": sid + "_regions.geojson"})
    write_if_changed(os.path.join(out_dir, "index.json"), {"schema": schema.SCHEMA, "sources": entries}, now)


def main(argv):
    wanted = set(argv)
    unknown = wanted - {p.id for p in s.PROVIDERS}
    if unknown:
        print("Unbekannte Quelle: %s" % ", ".join(sorted(unknown)), file=sys.stderr)
        return 2
    now = datetime.datetime.now(datetime.timezone.utc).replace(microsecond=0)
    failed = []
    for provider in s.PROVIDERS:
        if wanted and provider.id not in wanted:
            continue
        try:
            fetch_source(provider, now)
        except Exception as e:
            failed.append(provider.id)
            print("[%s] FEHLER: %s. Bestehende Dateien bleiben unverändert." % (provider.id, e), file=sys.stderr)
    write_index(now)
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
