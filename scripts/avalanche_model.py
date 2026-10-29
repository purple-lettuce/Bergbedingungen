"""Gemeinsames Datenmodell der Lawinenlage (Mountain Radar) und Normalisierung von CAAML-v6-Bulletins.

Alle Quellen (Euregio/ALBINA, SLF, später weitere) werden auf dasselbe Modell abgebildet, siehe
docs/LAWINENLAGE_ANALYSE.md. Das Modul arbeitet ohne Netzwerk und ohne Dateizugriff.

Grundsätze: Werte der Quelle bleiben unverändert (nur Umbenennung auf snake_case), abgeleitet werden nur
max_level, danger_by_elevation und elevation_thresholds. Fehlende Felder bleiben fehlend.
"""
import heapq
import math
import re
from html.parser import HTMLParser

SCHEMA = "mountain-radar/avalanche/1"

LEVELS = {"low": 1, "moderate": 2, "considerable": 3, "high": 4, "very_high": 5}
SUBDIVISION_ORDER = {"minus": 1, "neutral": 2, "plus": 3}
ASPECT_ORDER = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"]
PERIOD_ORDER = ["all_day", "earlier", "later"]
SECTION_SOURCES = (("activity", "avalancheActivity"), ("snowpack", "snowpackStructure"),
                   ("weather_forecast", "weatherForecast"), ("weather_review", "weatherReview"),
                   ("travel_advisory", "travelAdvisory"))
HEADINGS = ("h1", "h2", "h3", "h4", "h5", "h6")


# ---------- Texte: eingeschränktes HTML -> Blöcke ----------

class _BlockParser(HTMLParser):
    """Wandelt die in CAAML erlaubten HTML-Tags (br, p, h1-h6, ul, li, b) in Textblöcke um.

    Alle anderen Tags entfallen, ihr Text bleibt. Das Ergebnis enthält nie Markup, das Frontend zeigt Text an.
    """

    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.blocks = []
        self.buf = []
        self.heading = None
        self.items = None
        self.item = None
        self.skip = 0

    def _flush(self):
        text = " ".join("".join(self.buf).split())
        self.buf = []
        if not text:
            return
        if self.item is not None:
            self.item.append(text)
        elif self.heading:
            self.blocks.append({"type": "heading", "level": self.heading, "text": text})
        else:
            self.blocks.append({"type": "paragraph", "text": text})

    def _end_item(self):
        if self.item is not None:
            text = " ".join(self.item)
            if text and self.items is not None:
                self.items.append(text)
            self.item = None

    def _end_list(self):
        self._end_item()
        if self.items:
            self.blocks.append({"type": "list", "items": self.items})
        self.items = None

    def handle_starttag(self, tag, attrs):
        if tag in ("script", "style"):
            self.skip += 1
        elif tag in HEADINGS:
            self._flush()
            self.heading = int(tag[1])
        elif tag in ("p", "div", "br"):
            self._flush()
        elif tag in ("ul", "ol"):
            self._flush()
            self._end_list()
            self.items = []
        elif tag == "li":
            self._flush()
            self._end_item()
            if self.items is None:
                self.items = []
            self.item = []

    def handle_endtag(self, tag):
        if tag in ("script", "style"):
            self.skip = max(0, self.skip - 1)
        elif tag in HEADINGS:
            self._flush()
            self.heading = None
        elif tag in ("p", "div"):
            self._flush()
        elif tag == "li":
            self._flush()
            self._end_item()
        elif tag in ("ul", "ol"):
            self._flush()
            self._end_list()

    def handle_data(self, data):
        if not self.skip:
            self.buf.append(data)

    def result(self):
        self._flush()
        self._end_list()
        return self.blocks


def blocks_from(text):
    """CAAML-Text (mit erlaubtem HTML) -> Liste von Blöcken {type: paragraph|heading|list, ...}."""
    if not text or not isinstance(text, str):
        return []
    parser = _BlockParser()
    parser.feed(text)
    parser.close()
    return parser.result()


def plain(text):
    """Einzeiliger Text ohne Markup (für Überschriften wie highlights)."""
    out = []
    for b in blocks_from(text):
        out.append(" ".join(b["items"]) if b["type"] == "list" else b["text"])
    return " ".join(out)


def text_block(d):
    """CAAML-Textblock {highlights, comment} -> {"highlights": str, "blocks": [...]}; leer -> None."""
    if not isinstance(d, dict):
        return None
    out = {}
    hl = plain(d.get("highlights"))
    if hl:
        out["highlights"] = hl
    blocks = blocks_from(d.get("comment"))
    if blocks:
        out["blocks"] = blocks
    return out or None


# ---------- Gefahrenstufen, Höhen, Probleme ----------

def bound(value):
    """Höhengrenze: Meter als Zahl oder 'treeline' (Waldgrenze, ohne Zahlenwert in den Daten)."""
    return "treeline" if value == "treeline" else int(value)


def elevation(e):
    """CAAML-Höhe -> {"lower_bound"?, "upper_bound"?}. Leer ({} oder None) bedeutet alle Höhen -> None."""
    if not isinstance(e, dict):
        return None
    out = {}
    for src, dst in (("lowerBound", "lower_bound"), ("upperBound", "upper_bound")):
        if e.get(src) not in (None, ""):
            out[dst] = bound(e[src])
    if out.get("lower_bound") == 0:   # CAAML v3-Schreibweise für "ab Meereshöhe"
        del out["lower_bound"]
    return out or None


def subdivision(d):
    """Teilstufe der Schweiz (customData.CH.subdivision): minus, neutral, plus."""
    s = (((d or {}).get("customData") or {}).get("CH") or {}).get("subdivision")
    return s if s in SUBDIVISION_ORDER else None


def danger_rating(r):
    value = r["mainValue"]
    out = {"value": value, "level": LEVELS.get(value), "period": r.get("validTimePeriod") or "all_day"}
    sub = subdivision(r)
    if sub:
        out["subdivision"] = sub
    el = elevation(r.get("elevation"))
    if el:
        out["elevation"] = el
    return out


def avalanche_problem(p):
    out = {"type": p["problemType"], "period": p.get("validTimePeriod") or "all_day"}
    el = elevation(p.get("elevation"))
    if el:
        out["elevation"] = el
    aspects = [a for a in ASPECT_ORDER if a in (p.get("aspects") or [])]
    if aspects:
        out["aspects"] = aspects
    for src, dst in (("snowpackStability", "snowpack_stability"), ("frequency", "frequency")):
        if p.get(src):
            out[dst] = p[src]
    if p.get("avalancheSize") is not None:
        out["avalanche_size"] = int(p["avalancheSize"])
    if p.get("dangerRatingValue"):
        value = p["dangerRatingValue"]
        rating = {"value": value, "level": LEVELS.get(value)}
        sub = subdivision(p)
        if sub:
            rating["subdivision"] = sub
        out["danger_rating"] = rating
    comment = blocks_from(p.get("comment"))
    if comment:
        out["comment"] = comment
    core = ((p.get("customData") or {}).get("CH") or {}).get("coreZoneText")
    if core:
        out["core_zone_text"] = plain(core)
    return out


def max_rating(ratings):
    """Höchste Stufe und deren Teilstufe (plus vor neutral vor minus)."""
    best = None
    for r in ratings:
        if not r["level"]:
            continue
        key = (r["level"], SUBDIVISION_ORDER.get(r.get("subdivision"), 0))
        if best is None or key > best[0]:
            best = (key, r)
    if best is None:
        return None, None
    return best[1]["level"], best[1].get("subdivision")


def _band_sort_key(band):
    el = band.get("elevation") or {}
    return (PERIOD_ORDER.index(band["period"]) if band["period"] in PERIOD_ORDER else len(PERIOD_ORDER),
            0 if "lower_bound" in el else 1, str(el))


def danger_by_elevation(ratings, problems):
    """Gefahrenstufe nach Höhe und Tageszeit für die Anzeige.

    basis "danger_rating": Die Stufen der Quelle tragen selbst Höhenangaben (oder nur eine Stufe für alle Höhen), Euregio.
    basis "avalanche_problem": Die Stufen tragen keine Höhe, aber die Lawinenprobleme haben je eine eigene Stufe und
    Höhe, SLF. Dann werden gleiche Kombinationen aus Höhe, Stufe und Tageszeit zusammengefasst.
    """
    if any(r.get("elevation") for r in ratings) or not any(p.get("danger_rating") for p in problems):
        bands = []
        for r in ratings:
            band = {"basis": "danger_rating", "period": r["period"], "value": r["value"], "level": r["level"]}
            if r.get("subdivision"):
                band["subdivision"] = r["subdivision"]
            if r.get("elevation"):
                band["elevation"] = r["elevation"]
            bands.append(band)
        return sorted(bands, key=_band_sort_key)
    merged = {}
    for p in problems:
        pr = p.get("danger_rating")
        if not pr:
            continue
        key = (p["period"], repr(p.get("elevation")), pr["value"], pr.get("subdivision"))
        band = merged.get(key)
        if band is None:
            band = {"basis": "avalanche_problem", "period": p["period"], "value": pr["value"], "level": pr["level"],
                    "problem_types": []}
            if pr.get("subdivision"):
                band["subdivision"] = pr["subdivision"]
            if p.get("elevation"):
                band["elevation"] = p["elevation"]
            merged[key] = band
        if p["type"] not in band["problem_types"]:
            band["problem_types"].append(p["type"])
    return sorted(merged.values(), key=_band_sort_key)


def elevation_thresholds(ratings, problems):
    """Alle Höhengrenzen des Bulletins: Meter aufsteigend, 'treeline' zuletzt. Abgeleitet, ohne Doppelte."""
    found = set()
    for item in list(ratings) + list(problems):
        for v in (item.get("elevation") or {}).values():
            found.add(v)
    numbers = sorted(v for v in found if v != "treeline")
    return numbers + (["treeline"] if "treeline" in found else [])


# ---------- Bulletin ----------

def main_date(b):
    """Hauptdatum laut ALBINA (customData.ALBINA.mainDate), sonst None."""
    return ((b.get("customData") or {}).get("ALBINA") or {}).get("mainDate")


def bulletin_date(b):
    """Kalendertag, für den das Bulletin steht: Hauptdatum, sonst Enddatum der Gültigkeit."""
    return main_date(b) or b["validTime"]["endTime"][:10]


def region_country(region_id):
    """Ländercode nach EAWS-Schema: erste zwei Zeichen der regionID (AT-07-01 -> AT, CH-1111 -> CH)."""
    return region_id[:2]


def text_content(b):
    text = {}
    headline = plain(b.get("highlights"))
    if headline:
        text["headline"] = headline
    activity = text_block(b.get("avalancheActivity"))
    sections = []
    if activity and activity.get("highlights"):
        text["summary"] = activity["highlights"]
    for key, src in SECTION_SOURCES:
        blk = activity if src == "avalancheActivity" else text_block(b.get(src))
        if not blk:
            continue
        section = {k: v for k, v in blk.items() if k != "highlights" or src != "avalancheActivity"}
        if section:
            section["key"] = key
            sections.append(section)
    if sections:
        text["sections"] = sections
    tendency = []
    for t in b.get("tendency") or []:
        item = text_block(t) or {}
        if t.get("tendencyType"):
            item["type"] = t["tendencyType"]
        if t.get("validTime"):
            item["validity_period"] = {"start": t["validTime"]["startTime"], "end": t["validTime"]["endTime"]}
        if item:
            tendency.append(item)
    if tendency:
        text["tendency"] = tendency
    return text


def problem_groups(b):
    """SLF fasst Lawinenprobleme mit gleichem Inhalt zusammen (customData.CH.aggregation)."""
    groups = []
    for g in (((b.get("customData") or {}).get("CH") or {}).get("aggregation") or []):
        types = list(g.get("problemTypes") or [])
        if not types:
            continue
        group = {"types": types, "period": g.get("validTimePeriod") or "all_day"}
        for src, dst in (("category", "category"), ("title", "title")):
            if g.get(src):
                group[dst] = g[src]
        groups.append(group)
    return groups


def normalize_bulletin(b, source_id):
    """Ein CAAML-v6-Bulletin -> Bulletin des gemeinsamen Modells (ohne Regionen, die stehen im Index)."""
    ratings = [danger_rating(r) for r in b.get("dangerRatings") or []]
    problems = [avalanche_problem(p) for p in b.get("avalancheProblems") or []]
    level, sub = max_rating(ratings)
    out = {
        "id": b["bulletinID"],
        "source": source_id,
        "publication_time": b["publicationTime"],
        "validity_period": {"start": b["validTime"]["startTime"], "end": b["validTime"]["endTime"]},
        "unscheduled": bool(b.get("unscheduled")),
        "max_level": level,
    }
    if sub:
        out["max_subdivision"] = sub
    if b.get("nextUpdate"):
        out["next_update"] = b["nextUpdate"]
    md = main_date(b)
    if md:
        out["main_date"] = md
    out["danger_ratings"] = ratings
    out["danger_by_elevation"] = danger_by_elevation(ratings, problems)
    out["elevation_thresholds"] = elevation_thresholds(ratings, problems)
    out["avalanche_problems"] = problems
    groups = problem_groups(b)
    if groups:
        out["problem_groups"] = groups
    text = text_content(b)
    if text:
        out["text"] = text
    patterns = ((b.get("customData") or {}).get("LWD_Tyrol") or {}).get("dangerPatterns")
    if patterns:
        out["danger_patterns"] = list(patterns)
    return out


def build_index(doc, source_id, in_scope, names=None):
    """Bulletins und Regionenindex einer Quelle.

    Rückgabe (bulletins, regions, skipped): regions = {regionID: {"name", "country", "bulletin"}}, bulletin ist der
    Index in bulletins. Kommt eine Region in zwei Bulletins vor, gilt das jüngere; bei gleichem
    Veröffentlichungszeitpunkt bricht die Funktion mit ValueError ab. Ein Bulletin ohne Gefahrenstufen ebenso.
    """
    bulletins, regions, skipped = [], {}, 0
    for b in doc.get("bulletins") or []:
        scoped = [r for r in b.get("regions") or [] if in_scope(r["regionID"])]
        if not scoped:
            skipped += 1
            continue
        if not b.get("dangerRatings"):
            raise ValueError("Bulletin %s ohne Gefahrenstufen" % b.get("bulletinID"))
        slim = normalize_bulletin(b, source_id)
        idx = len(bulletins)
        bulletins.append(slim)
        for r in scoped:
            rid = r["regionID"]
            if rid in regions:
                other = bulletins[regions[rid]["bulletin"]]
                if other["publication_time"] == slim["publication_time"]:
                    raise ValueError("Region %s in zwei gleich alten Bulletins" % rid)
                if other["publication_time"] > slim["publication_time"]:
                    continue
            regions[rid] = {"name": r.get("name") or (names or {}).get(rid) or rid,
                            "country": region_country(rid), "bulletin": idx}
    used = sorted({v["bulletin"] for v in regions.values()})   # überschriebene Bulletins entfallen
    remap = {old: new for new, old in enumerate(used)}
    bulletins = [bulletins[i] for i in used]
    for v in regions.values():
        v["bulletin"] = remap[v["bulletin"]]
    return bulletins, {k: regions[k] for k in sorted(regions)}, skipped


def validity(bulletins):
    if not bulletins:
        return None
    return {"start": min(b["validity_period"]["start"] for b in bulletins),
            "end": max(b["validity_period"]["end"] for b in bulletins)}


# ---------- Geometrie ----------

def polygon_valid(props, date):
    """Wie albina-website (stores/microRegions.ts): start_date <= Datum < end_date, fehlende Grenzen sind offen."""
    start, end = props.get("start_date"), props.get("end_date")
    return (not start or start <= date) and (not end or end > date)


def round_ring(ring, decimals):
    out = []
    for x, y in ring:
        p = [round(x, decimals), round(y, decimals)]
        if not out or p != out[-1]:
            out.append(p)
    return out if len(out) >= 4 else None


def round_geometry(geom, decimals=5):
    """Rundet Koordinaten (5 Stellen = ca. 1 m), entfernt entartete Ringe, liefert MultiPolygon oder None."""
    if geom["type"] == "Polygon":
        polys = [geom["coordinates"]]
    elif geom["type"] == "MultiPolygon":
        polys = geom["coordinates"]
    else:
        raise ValueError("Unerwarteter Geometrietyp: %s" % geom["type"])
    result = []
    for poly in polys:
        rings = [round_ring(r, decimals) for r in poly]
        if rings and rings[0] is not None:
            result.append([r for r in rings if r is not None])
    return {"type": "MultiPolygon", "coordinates": result} if result else None


def _ring_area(ring):
    return sum(ring[i][0] * ring[i + 1][1] - ring[i + 1][0] * ring[i][1] for i in range(len(ring) - 1)) / 2


def _dist_to_polygon(x, y, rings):
    """Vorzeichenbehafteter Abstand zum Polygonrand, positiv innerhalb."""
    inside = False
    best = float("inf")
    for ring in rings:
        for i in range(len(ring) - 1):
            ax, ay = ring[i]
            bx, by = ring[i + 1]
            if (ay > y) != (by > y) and x < (bx - ax) * (y - ay) / (by - ay) + ax:
                inside = not inside
            dx, dy = bx - ax, by - ay
            t = 0.0 if dx == 0 and dy == 0 else max(0.0, min(1.0, ((x - ax) * dx + (y - ay) * dy) / (dx * dx + dy * dy)))
            best = min(best, math.hypot(x - (ax + t * dx), y - (ay + t * dy)))
    return best if inside else -best


def polylabel(rings, precision=1e-4):
    """Pol der Unzugänglichkeit: der Punkt im Polygon mit größtem Abstand zum Rand (Algorithmus von Mapbox)."""
    xs = [p[0] for p in rings[0]]
    ys = [p[1] for p in rings[0]]
    minx, miny, maxx, maxy = min(xs), min(ys), max(xs), max(ys)
    size = min(maxx - minx, maxy - miny)
    if size == 0:
        return [minx, miny]
    counter = 0
    queue = []

    def cell(cx, cy, h):
        nonlocal counter
        d = _dist_to_polygon(cx, cy, rings)
        counter += 1
        return (-(d + h * math.sqrt(2)), counter, cx, cy, h, d)

    x = minx
    while x < maxx:
        y = miny
        while y < maxy:
            heapq.heappush(queue, cell(x + size / 2, y + size / 2, size / 2))
            y += size
        x += size
    best = cell((minx + maxx) / 2, (miny + maxy) / 2, 0)
    area = _ring_area(rings[0])
    if area:   # Schwerpunkt als zweiter Startwert
        cx = cy = 0.0
        ring = rings[0]
        for i in range(len(ring) - 1):
            f = ring[i][0] * ring[i + 1][1] - ring[i + 1][0] * ring[i][1]
            cx += (ring[i][0] + ring[i + 1][0]) * f
            cy += (ring[i][1] + ring[i + 1][1]) * f
        cand = cell(cx / (6 * area), cy / (6 * area), 0)
        if cand[5] > best[5]:
            best = cand
    while queue:
        c = heapq.heappop(queue)
        if c[5] > best[5]:
            best = c
        if -c[0] - best[5] <= precision:
            continue
        h = c[4] / 2
        for dx in (-h, h):
            for dy in (-h, h):
                heapq.heappush(queue, cell(c[2] + dx, c[3] + dy, h))
    return [best[2], best[3]]


def label_point(geom, decimals=5):
    """Position für das Regionssymbol: Pol der Unzugänglichkeit des größten Teilpolygons.

    Längen werden mit cos(Breite) gestaucht, damit Abstände in Grad ungefähr isotrop sind.
    """
    polys = geom["coordinates"] if geom["type"] == "MultiPolygon" else [geom["coordinates"]]
    lat0 = sum(p[1] for p in polys[0][0]) / len(polys[0][0])
    k = math.cos(math.radians(lat0))
    scaled = [[[[x * k, y] for x, y in ring] for ring in poly] for poly in polys]
    biggest = max(scaled, key=lambda poly: abs(_ring_area(poly[0])))
    x, y = polylabel(biggest)
    return [round(x / k, decimals), round(y, decimals)]


def build_regions(features, date, in_scope):
    """Gültige Polygone zum Datum mit Land und Symbolposition; eine Kennung genau einmal, sortiert."""
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
        by_id[rid] = {"type": "Feature",
                      "properties": {"id": rid, "country": region_country(rid), "label_point": label_point(geom)},
                      "geometry": geom}
    return [by_id[k] for k in sorted(by_id)]