#!/usr/bin/env python3
"""Lawinenlage Euregio Tirol - Südtirol - Trentino (ALBINA).

Holt das aktuelle Lawinenlagebericht-Bulletin (CAAML v6, deutsch) und die Mikroregion-Polygone
(eaws-regions) und schreibt zwei Dateien:

  data/avalanche_regions.geojson   Polygone, nur Kennung "id" (ändert sich selten)
  data/avalanche_bulletin.json     Bulletins + Zuordnung regionID -> Bulletin (täglich)

Der Browser verknüpft beide über die Kennung. Gefahrenstufen, Höhen, Lawinenprobleme und Texte werden
unverändert aus dem Bulletin übernommen, abgeleitet wird nur die höchste Gefahrenstufe.

Datenquellen: Lawinenwarndienste Tirol, Südtirol und Trentino (avalanche.report, CC BY 4.0),
Polygone: EAWS Regions (CC0 1.0). Siehe docs/DATENQUELLEN.md.
"""
import datetime
import json
import os
import re
import sys
import time
import urllib.error
import urllib.request

BULLETIN_URL = os.environ.get(
    "AVALANCHE_BULLETIN_URL", "https://static.avalanche.report/bulletins/latest/EUREGIO_de_CAAMLv6.json")
REGIONS_URL = os.environ.get(
    "AVALANCHE_REGIONS_URL",
    "https://gitlab.com/eaws/eaws-regions/-/raw/master/public/micro-regions/{code}_micro-regions.geojson.json")
REGION_CODES = ("AT-07", "IT-32-BZ", "IT-32-TN")   # Tirol, Südtirol, Trentino; die EUREGIO-Datei enthält auch AT-02 (Kärnten)
DATA_DIR = os.environ.get("AVALANCHE_DATA_DIR", os.path.join(os.path.dirname(__file__), "..", "data"))
REGIONS_OUT = "avalanche_regions.geojson"
BULLETIN_OUT = "avalanche_bulletin.json"
HEARTBEAT_DAYS = 7        # Datei spätestens so oft neu schreiben, damit das Repository auch außerhalb der Saison aktiv bleibt
COORD_DECIMALS = 5        # ca. 1 m
UA = "bergbedingungen-snapshot (+https://github.com/purple-lettuce/Bergbedingungen)"

LEVELS = {"low": 1, "moderate": 2, "considerable": 3, "high": 4, "very_high": 5}
ASPECT_ORDER = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"]
BR = re.compile(r"\s*<br\s*/?>\s*", re.IGNORECASE)


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


def in_scope(region_id):
    return any(region_id == c or region_id.startswith(c + "-") for c in REGION_CODES)


# ---------- Polygone ----------

def polygon_valid(props, date):
    """Wie albina-website (stores/microRegions.ts): start_date <= Datum < end_date, fehlende Grenzen sind offen."""
    start, end = props.get("start_date"), props.get("end_date")
    return (not start or start <= date) and (not end or end > date)


def round_ring(ring):
    out = []
    for x, y in ring:
        p = [round(x, COORD_DECIMALS), round(y, COORD_DECIMALS)]
        if not out or p != out[-1]:
            out.append(p)
    return out if len(out) >= 4 else None   # weniger als vier Punkte ist kein gültiger Ring


def round_geometry(geom):
    """Rundet Koordinaten; entfernt entartete Ringe. Gibt None zurück, wenn nichts übrig bleibt."""
    if geom["type"] == "Polygon":
        polys = [geom["coordinates"]]
    elif geom["type"] == "MultiPolygon":
        polys = geom["coordinates"]
    else:
        raise ValueError("Unerwarteter Geometrietyp: %s" % geom["type"])
    result = []
    for poly in polys:
        rings = [round_ring(r) for r in poly]
        if rings and rings[0] is not None:             # Außenring muss bleiben, entartete Löcher entfallen
            result.append([r for r in rings if r is not None])
    return {"type": "MultiPolygon", "coordinates": result} if result else None


def build_regions(features, date):
    """Gültige Polygone zum Datum, eine Kennung genau einmal, sortiert nach Kennung."""
    by_id = {}
    for f in features:
        props = f.get("properties") or {}
        rid = props.get("id")
        if not rid or not in_scope(rid) or not polygon_valid(props, date):
            continue
        if rid in by_id:
            raise ValueError("Kennung %s hat am %s mehrere gültige Polygone" % (rid, date))
        geom = round_geometry(f["geometry"])
        if geom is None:
            raise ValueError("Kennung %s: Geometrie nach dem Runden leer" % rid)
        by_id[rid] = {"type": "Feature", "properties": {"id": rid}, "geometry": geom}
    return [by_id[k] for k in sorted(by_id)]


# ---------- Bulletin ----------

def paragraphs(text):
    """CAAML-Texte trennen Absätze mit <br/>; Ergebnis ist eine Liste reiner Textabsätze."""
    if not text or not isinstance(text, str):
        return []
    return [p.strip() for p in BR.split(text) if p.strip()]


def text_block(d):
    """CAAML-Textblock {highlights, comment} -> {"highlights": str, "comment": [Absätze]}; leer -> None."""
    if not isinstance(d, dict):
        return None
    out = {}
    hl = " ".join(paragraphs(d.get("highlights")))
    if hl:
        out["highlights"] = hl
    comment = paragraphs(d.get("comment"))
    if comment:
        out["comment"] = comment
    return out or None


def bound(value):
    """Höhengrenze: Zahl in Metern oder 'treeline' (Waldgrenze, ohne Zahlenwert in den Daten)."""
    if value == "treeline":
        return "treeline"
    return int(value)


def elevation(e):
    if not isinstance(e, dict):
        return None
    out = {k: bound(e[k]) for k in ("lowerBound", "upperBound") if e.get(k) not in (None, "")}
    return out or None


def slim_rating(r):
    value = r["mainValue"]
    out = {"value": value, "level": LEVELS.get(value), "period": r.get("validTimePeriod") or "all_day"}
    el = elevation(r.get("elevation"))
    if el:
        out["elevation"] = el
    return out


def slim_problem(p):
    out = {"type": p["problemType"], "period": p.get("validTimePeriod") or "all_day"}
    el = elevation(p.get("elevation"))
    if el:
        out["elevation"] = el
    for key in ("snowpackStability", "frequency"):
        if p.get(key):
            out[key] = p[key]
    if p.get("avalancheSize") is not None:
        out["avalancheSize"] = int(p["avalancheSize"])
    aspects = [a for a in ASPECT_ORDER if a in (p.get("aspects") or [])]
    if aspects:
        out["aspects"] = aspects
    return out



def main_date(b):
    d = ((b.get("customData") or {}).get("ALBINA") or {}).get("mainDate")
    return d or b["validTime"]["endTime"][:10]


def slim_bulletin(b):
    ratings = [slim_rating(r) for r in b.get("dangerRatings") or []]
    levels = [r["level"] for r in ratings if r["level"]]
    out = {
        "id": b["bulletinID"],
        "publicationTime": b["publicationTime"],
        "validTime": {"startTime": b["validTime"]["startTime"], "endTime": b["validTime"]["endTime"]},
        "mainDate": main_date(b),
        "unscheduled": bool(b.get("unscheduled")),
        "maxLevel": max(levels) if levels else None,
        "dangerRatings": ratings,
        "avalancheProblems": [slim_problem(p) for p in b.get("avalancheProblems") or []],
    }
    headline = " ".join(paragraphs(b.get("highlights")))
    if headline:
        out["highlights"] = headline
    for key, src in (("activity", "avalancheActivity"), ("snowpack", "snowpackStructure"),
                     ("weather", "weatherForecast"), ("travelAdvisory", "travelAdvisory")):
        blk = text_block(b.get(src))
        if blk:
            out[key] = blk
    tendency = []
    for t in b.get("tendency") or []:
        blk = text_block(t) or {}
        if t.get("tendencyType"):
            blk["type"] = t["tendencyType"]
        if t.get("validTime"):
            blk["validTime"] = t["validTime"]
        if blk:
            tendency.append(blk)
    if tendency:
        out["tendency"] = tendency
    patterns = ((b.get("customData") or {}).get("LWD_Tyrol") or {}).get("dangerPatterns")
    if patterns:
        out["dangerPatterns"] = list(patterns)
    return out


def build_bulletin(doc, region_ids):
    """Verdichtet das CAAML-Dokument auf die Regionen im Umfang. region_ids: Kennungen mit Polygon."""
    bulletins, regions = [], {}
    skipped = 0
    for b in doc["bulletins"]:
        scoped = [r for r in b.get("regions") or [] if in_scope(r["regionID"])]
        if not scoped:
            skipped += 1
            continue
        if not b.get("dangerRatings"):
            raise ValueError("Bulletin %s ohne Gefahrenstufen" % b.get("bulletinID"))
        slim = slim_bulletin(b)
        idx = len(bulletins)
        bulletins.append(slim)
        for r in scoped:
            rid = r["regionID"]
            if rid in regions:   # selten: Region in zwei Bulletins, dann gilt das jüngere
                other = bulletins[regions[rid]["b"]]
                if other["publicationTime"] == slim["publicationTime"]:
                    raise ValueError("Region %s in zwei gleich alten Bulletins" % rid)
                if other["publicationTime"] > slim["publicationTime"]:
                    continue
            regions[rid] = {"name": r.get("name") or rid, "b": idx}
    # Bulletins ohne zugeordnete Region (alle überschrieben) entfernen, Indizes neu vergeben
    used = sorted({v["b"] for v in regions.values()})
    remap = {old: new for new, old in enumerate(used)}
    bulletins = [bulletins[i] for i in used]
    for v in regions.values():
        v["b"] = remap[v["b"]]
    missing_polygon = sorted(set(regions) - set(region_ids))
    return bulletins, {k: regions[k] for k in sorted(regions)}, missing_polygon, skipped


def validity(bulletins):
    return {"startTime": min(b["validTime"]["startTime"] for b in bulletins),
            "endTime": max(b["validTime"]["endTime"] for b in bulletins)}


# ---------- Schreiben ----------

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


def parse_time(s):
    return datetime.datetime.fromisoformat(s.replace("Z", "+00:00"))


def main():
    doc = get_json(BULLETIN_URL)
    if not isinstance(doc, dict) or not doc.get("bulletins"):
        raise RuntimeError("Bulletin-Datei enthält keine Bulletins")
    scoped = [b for b in doc["bulletins"] if any(in_scope(r["regionID"]) for r in b.get("regions") or [])]
    if not scoped:
        raise RuntimeError("Keine Regionen aus %s im Bulletin" % ", ".join(REGION_CODES))
    date = max(main_date(b) for b in scoped)

    features = []
    for code in REGION_CODES:
        features.extend(get_json(REGIONS_URL.format(code=code))["features"])
    regions = build_regions(features, date)
    if not regions:
        raise RuntimeError("Keine gültigen Polygone für %s" % date)
    region_ids = [f["properties"]["id"] for f in regions]

    bulletins, mapping, missing_polygon, skipped = build_bulletin(doc, region_ids)
    print("Bulletin-Datum: %s, %d Bulletins, %d Regionen im Umfang (%d Bulletins außerhalb übersprungen)"
          % (date, len(bulletins), len(mapping), skipped))
    print("Polygone gültig am %s: %d, ohne Bulletin: %d" % (date, len(regions), len(set(region_ids) - set(mapping))))
    if missing_polygon:
        print("WARNUNG: Regionen im Bulletin ohne Polygon (werden nicht dargestellt): %s" % ", ".join(missing_polygon))

    now = datetime.datetime.now(datetime.timezone.utc).replace(microsecond=0)
    out_dir = os.path.abspath(DATA_DIR)

    regions_doc = {
        "type": "FeatureCollection",
        "source": "https://gitlab.com/eaws/eaws-regions",
        "license": "CC0 1.0",
        "features": regions,
    }
    regions_path = os.path.join(out_dir, REGIONS_OUT)
    if read_json(regions_path) != regions_doc:
        write_json(regions_path, regions_doc)
        print("Geschrieben: %s (%.1f KB)" % (regions_path, os.path.getsize(regions_path) / 1024))
    else:
        print("Polygone unverändert.")

    bulletin_doc = {
        "generated": now.isoformat().replace("+00:00", "Z"),
        "source": BULLETIN_URL,
        "license": "CC BY 4.0",
        "attribution": "Lawinenwarndienste Tirol, Südtirol und Trentino (Euregio, avalanche.report)",
        "lang": "de",
        "mainDate": date,
        "validTime": validity(bulletins),
        "bulletins": bulletins,
        "regions": mapping,
    }
    bulletin_path = os.path.join(out_dir, BULLETIN_OUT)
    old = read_json(bulletin_path)
    if old:
        comparable = {k: v for k, v in old.items() if k != "generated"}
        fresh = old.get("generated") and (now - parse_time(old["generated"])) < datetime.timedelta(days=HEARTBEAT_DAYS)
        if fresh and comparable == {k: v for k, v in bulletin_doc.items() if k != "generated"}:
            print("Bulletin unverändert.")
            return
    write_json(bulletin_path, bulletin_doc)
    print("Geschrieben: %s (%.1f KB)" % (bulletin_path, os.path.getsize(bulletin_path) / 1024))


if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print("FEHLER: %s. Bestehende Dateien bleiben unverändert." % e, file=sys.stderr)
        sys.exit(1)