#!/usr/bin/env python3
"""Lawinenlage: holt Bulletins und Regionspolygone aller Quellen aus avalanche_sources.py.

Je Quelle entstehen zwei Dateien im gemeinsamen Modell (siehe avalanche_model.py):

  data/avalanche/<id>.json            Bulletins + Regionenindex (täglich)
  data/avalanche/<id>_regions.geojson Polygone mit Land und Symbolposition (ändert sich selten)

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
import avalanche_sources as s

DATA_DIR = os.environ.get("AVALANCHE_DATA_DIR", os.path.join(os.path.dirname(__file__), "..", "data", "avalanche"))
REGIONS_URL = os.environ.get("AVALANCHE_REGIONS_URL", s.REGIONS_URL)
HEARTBEAT_DAYS = 7        # Datei spätestens so oft neu schreiben, damit das Repository auch außerhalb der Saison aktiv bleibt
PAUSE = 0.5               # Sekunden zwischen Abfragen beim selben Dienst (SLF bittet um Schonung der Schnittstelle)
UA = "bergbedingungen-snapshot (+https://github.com/purple-lettuce/Bergbedingungen)"
META_KEYS = ("id", "name", "provider", "countries", "attribution", "attribution_url", "license", "license_url",
             "report_url", "report_url_fallback", "bulletin_url")


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


def get_bulletin(url):
    doc = get_json(url)
    if not isinstance(doc, dict) or not isinstance(doc.get("bulletins"), list):
        raise RuntimeError("Unerwartetes Format von %s" % url)
    return doc


def fetch_source(source, now):
    sid = source["id"]
    url = os.environ.get("AVALANCHE_URL_" + sid.upper(), source["bulletin_url"])
    doc = get_bulletin(url)
    scoped = [b for b in doc["bulletins"] if any(s.in_scope(source, r["regionID"]) for r in b.get("regions") or [])]
    if not scoped and not source["empty_ok"]:
        raise RuntimeError("Keine Regionen aus %s im Bulletin" % ", ".join(source["region_codes"]))
    date = max((m.bulletin_date(b) for b in scoped), default=now.date().isoformat())

    names = {}
    if source.get("names_url"):
        time.sleep(PAUSE)
        try:
            names = s.NAME_PARSERS[sid](get_json(source["names_url"]))
        except Exception as e:   # Namen sind nicht kritisch, ohne sie zeigt das Popup die Kennung
            print("[%s] Hinweis: Regionsnamen nicht geladen (%s)" % (sid, e))

    features = []
    for code in source["geometry_codes"]:
        time.sleep(PAUSE)
        features.extend(get_json(REGIONS_URL.format(code=code))["features"])
    regions = m.build_regions(features, date, lambda rid: s.in_scope(source, rid))
    if not regions:
        raise RuntimeError("Keine gültigen Polygone für %s" % date)
    region_ids = {f["properties"]["id"] for f in regions}

    in_bulletin = {r["regionID"] for b in scoped for r in b.get("regions") or [] if s.in_scope(source, r["regionID"])}
    missing_polygon = sorted(in_bulletin - region_ids)   # ohne Polygon nicht darstellbar
    bulletins, index, skipped = m.build_index({"bulletins": scoped}, sid, lambda rid: rid in region_ids, names)
    for rid in sorted(region_ids - set(index)):   # Polygone ohne Bulletin bleiben als "kein Bericht" sichtbar
        index[rid] = {"name": names.get(rid) or rid, "country": m.region_country(rid), "bulletin": None}
    index = {k: index[k] for k in sorted(index)}
    with_report = sum(1 for v in index.values() if v["bulletin"] is not None)

    print("[%s] Datum %s: %d Bulletins, %d Regionen mit Bericht, %d Polygone ohne Bericht"
          % (sid, date, len(bulletins), with_report, len(index) - with_report))
    if missing_polygon:
        print("[%s] WARNUNG: Regionen im Bulletin ohne Polygon (nicht dargestellt): %s" % (sid, ", ".join(missing_polygon)))
    if not bulletins:
        print("[%s] Kein aktives Bulletin (Saisonpause)." % sid)

    out_dir = os.path.abspath(DATA_DIR)
    regions_doc = {"type": "FeatureCollection", "schema": m.SCHEMA, "source": sid,
                   "geometry_source": "https://gitlab.com/eaws/eaws-regions", "geometry_license": "CC0 1.0",
                   "features": regions}
    changed = write_if_changed(os.path.join(out_dir, sid + "_regions.geojson"), regions_doc, now)
    bulletin_doc = {
        "schema": m.SCHEMA,
        "source": {k: source[k] for k in META_KEYS},
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
    for source in s.SOURCES:
        sid = source["id"]
        if read_json(os.path.join(out_dir, sid + ".json")) and read_json(os.path.join(out_dir, sid + "_regions.geojson")):
            entries.append({"id": sid, "bulletin_file": sid + ".json", "regions_file": sid + "_regions.geojson"})
    write_if_changed(os.path.join(out_dir, "index.json"), {"schema": m.SCHEMA, "sources": entries}, now)


def main(argv):
    wanted = set(argv)
    unknown = wanted - {x["id"] for x in s.SOURCES}
    if unknown:
        print("Unbekannte Quelle: %s" % ", ".join(sorted(unknown)), file=sys.stderr)
        return 2
    now = datetime.datetime.now(datetime.timezone.utc).replace(microsecond=0)
    failed = []
    for source in s.SOURCES:
        if wanted and source["id"] not in wanted:
            continue
        try:
            fetch_source(source, now)
        except Exception as e:
            failed.append(source["id"])
            print("[%s] FEHLER: %s. Bestehende Dateien bleiben unverändert." % (source["id"], e), file=sys.stderr)
    write_index(now)
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))