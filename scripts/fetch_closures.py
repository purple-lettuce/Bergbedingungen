#!/usr/bin/env python3
"""Holt alle aktuellen und kommenden Sperrungen und Hinweise von der Digitize API
und speichert sie als data/closures.json. Die Seite liest diese Datei, weil der
Browser die API nicht direkt abfragen darf.

Es werden nur Abfragen verwendet, die bekanntermaßen funktionieren:
  1. Standardliste ohne Parameter (Namen, Texte, Zeiträume, Aktivitäten)
  2. Liste mit fields=uuid,name,type,geometry (Geometrie)
Beides wird über die UUID zusammengeführt.

Datenquelle: Digitize the Planet e.V., Lizenz CC0 1.0.
"""
import datetime
import json
import os
import sys
import time
import urllib.error
import urllib.request

BASE = os.environ.get("DTP_API", "https://platform.digitizetheplanet.org/api/v2").rstrip("/")
OUT = os.environ.get("DTP_OUT", os.path.join(os.path.dirname(__file__), "..", "data", "closures.json"))
HEARTBEAT_HOURS = 24      # Datei höchstens so alt lassen, auch wenn sich nichts geändert hat
MAX_PAGES = 400
PAUSE = 0.3               # Sekunden zwischen Abfragen (faire Nutzung)
UA = "bergbedingungen-snapshot (+https://github.com/purple-lettuce/Bergbedingungen)"

DROP = {"name_sl", "created_at", "source_id", "license"}


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


def fetch_all(url):
    rows = []
    pages = 0
    declared = None
    while url and pages < MAX_PAGES:
        data = get_json(url)
        if isinstance(data, list):   # einfache Liste ohne Seiten
            rows.extend(data)
            break
        if declared is None:
            declared = data.get("count")
        rows.extend(data.get("results") or [])
        url = data.get("next")
        pages += 1
        time.sleep(PAUSE)
    return rows, declared, pages


def is_position(x):
    return isinstance(x, list) and len(x) >= 2 and all(isinstance(v, (int, float)) for v in x[:2])


def clean(coords):
    """Rundet Koordinaten auf 5 Nachkommastellen (ca. 1 m) und entfernt direkt aufeinanderfolgende Duplikate."""
    if is_position(coords):
        return [round(coords[0], 5), round(coords[1], 5)]
    if isinstance(coords, list):
        out = [clean(c) for c in coords]
        if out and all(is_position(c) for c in out):
            dedup = [out[0]]
            for c in out[1:]:
                if c != dedup[-1]:
                    dedup.append(c)
            return dedup
        return out
    return coords


def positions(coords):
    if is_position(coords):
        yield coords
    elif isinstance(coords, list):
        for c in coords:
            yield from positions(c)


def main():
    geo_rows, geo_declared, geo_pages = fetch_all(BASE + "/closures-and-notices?fields=uuid,name,type,geometry")
    base_rows, base_declared, base_pages = fetch_all(BASE + "/closures-and-notices")
    print("Geometrie: %d Datensätze (%s angekündigt, %d Seiten)" % (len(geo_rows), geo_declared, geo_pages))
    print("Details:   %d Datensätze (%s angekündigt, %d Seiten)" % (len(base_rows), base_declared, base_pages))

    geometry = {r["uuid"]: r.get("geometry") for r in geo_rows if r.get("uuid")}
    results, without_geometry = [], 0
    for r in base_rows:
        uuid = r.get("uuid")
        geom = geometry.get(uuid)
        pts = list(positions(geom.get("coordinates"))) if geom else []
        if not pts:
            without_geometry += 1
            continue
        rec = {k: v for k, v in r.items() if k not in DROP}
        geom = dict(geom)
        geom["coordinates"] = clean(geom["coordinates"])
        pts = list(positions(geom["coordinates"]))
        lons = [p[0] for p in pts]
        lats = [p[1] for p in pts]
        rec["geometry"] = geom
        rec["bbox"] = [min(lons), min(lats), max(lons), max(lats)]
        rec["centroid"] = [round((min(lons) + max(lons)) / 2, 5), round((min(lats) + max(lats)) / 2, 5)]
        results.append(rec)

    print("Mit Geometrie: %d, ohne Geometrie (übersprungen): %d" % (len(results), without_geometry))
    if not results:
        print("FEHLER: Keine Datensätze mit Geometrie erhalten. Bestehende Datei bleibt unverändert.", file=sys.stderr)
        sys.exit(1)

    activities = {}
    try:
        act_rows, _, _ = fetch_all(BASE + "/activities")
        for a in act_rows:
            if isinstance(a, dict) and a.get("id") is not None:
                name = a.get("name_de") or a.get("name_en") or a.get("name")
                if name:
                    activities[str(a["id"])] = name
        print("Aktivitäten: %d" % len(activities))
    except Exception as e:  # nicht kritisch, die Seite hat Ersatznamen
        print("Hinweis: Aktivitäten konnten nicht geladen werden (%s)" % e)

    results.sort(key=lambda r: r["uuid"])
    now = datetime.datetime.now(datetime.timezone.utc).replace(microsecond=0)

    out_path = os.path.abspath(OUT)
    keep_old = False
    if os.path.exists(out_path):
        try:
            with open(out_path, encoding="utf-8") as f:
                old = json.load(f)
            old_time = datetime.datetime.fromisoformat(old["generated"].replace("Z", "+00:00")) if old.get("generated") else None
            fresh = old_time is not None and (now - old_time) < datetime.timedelta(hours=HEARTBEAT_HOURS)
            if old.get("results") == results and fresh:
                keep_old = True
        except Exception:
            pass
    if keep_old:
        print("Keine Änderungen, Datei bleibt unverändert.")
        return

    doc = {
        "generated": now.isoformat().replace("+00:00", "Z"),
        "source": "https://platform.digitizetheplanet.org/api/v2/closures-and-notices",
        "license": "CC0 1.0",
        "attribution": "Digitize the Planet e.V.",
        "count": len(results),
        "activities": activities,
        "results": results,
    }
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    tmp = out_path + ".tmp"
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump(doc, f, ensure_ascii=False, separators=(",", ":"))
    os.replace(tmp, out_path)
    print("Geschrieben: %s (%d Datensätze, %.1f KB)" % (out_path, len(results), os.path.getsize(out_path) / 1024))


if __name__ == "__main__":
    main()
