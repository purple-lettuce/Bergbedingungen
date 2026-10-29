"""Standardmodell der Lawinenlage (Mountain Radar): ein Datensatz je Region, identisch für alle Quellen.

Die Provider (avalanche_providers.py) normalisieren ihre Quelle in Bulletins des gemeinsamen Modells
(avalanche_model.py). Dieses Modul fügt Bulletin, Regionenindex und Polygon zum Regionsdatensatz (RegionRecord)
zusammen, erzeugt daraus das standardisierte GeoJSON und prüft beides gegen ein festes Schema. Ein Provider, der vom
Schema abweicht, bricht die Pipeline für seine Quelle ab, statt Daten mit anderer Form zu speichern.

Beschreibung: docs/AVALANCHE_ARCHITECTURE.md. Das Modul arbeitet ohne Netzwerk und ohne Dateizugriff.
"""

SCHEMA = "mountain-radar/avalanche/2"

# Feldname -> (zulässige Typen, Beschreibung). Alle Felder sind in jedem Datensatz vorhanden; fehlende Werte sind
# None (Zeiten, Stufen) bzw. leer ([] oder {}), nie ein fehlender Schlüssel. Ein Datensatz ohne Bericht hat `bulletin_id`
# None und leere Berichtsfelder.
_STR = (str,)
_STR_OR_NONE = (str, type(None))
_INT_OR_NONE = (int, type(None))
_LIST = (list,)
RECORD_FIELDS = {
    "source": (_STR, "Kennung der Quelle (euregio, slf, ...)"),
    "country": (_STR, "Ländercode nach EAWS-Schema (AT, CH, IT, ...)"),
    "region_id": (_STR, "EAWS-Regionskennung (AT-07-14-01, CH-1111)"),
    "region_name": (_STR, "Name der Region, sonst die Kennung"),
    "geometry": ((dict,), "GeoJSON-MultiPolygon, Längengrad vor Breitengrad"),
    "label_point": (_LIST, "[Länge, Breite] für das Regionssymbol, liegt im Polygon"),
    "bulletin_id": (_STR_OR_NONE, "Kennung des Bulletins, None ohne Bericht"),
    "publication_time": (_STR_OR_NONE, "Veröffentlichung, ISO 8601 UTC"),
    "valid_from": (_STR_OR_NONE, "Beginn der Gültigkeit, ISO 8601 UTC"),
    "valid_until": (_STR_OR_NONE, "Ende der Gültigkeit, ISO 8601 UTC"),
    "next_update": (_STR_OR_NONE, "geplante Aktualisierung, ISO 8601 UTC"),
    "main_date": (_STR_OR_NONE, "Hauptdatum des Berichts JJJJ-MM-TT, nur Quellen, die eines nennen (für Links)"),
    "unscheduled": ((bool,), "außerplanmäßiger Bericht"),
    "max_level": (_INT_OR_NONE, "höchste Gefahrenstufe 1 bis 5, None bei Kein Schnee / keine Beurteilung"),
    "max_subdivision": (_STR_OR_NONE, "Teilstufe der höchsten Stufe: minus, neutral, plus"),
    "danger_ratings": (_LIST, "Gefahrenstufen der Quelle: {value, level, period, subdivision?, elevation?}"),
    "danger_by_elevation": (_LIST, "Gefahrenstufe nach Höhe und Tageszeit für die Anzeige (abgeleitet)"),
    "elevation_thresholds": (_LIST, "alle Höhengrenzen: Meter aufsteigend, 'treeline' zuletzt (abgeleitet)"),
    "avalanche_problems": (_LIST, "Lawinenprobleme: {type, period, elevation?, aspects?, ...}"),
    "aspects": (_LIST, "Vereinigung der Expositionen aller Lawinenprobleme, N bis NW (abgeleitet)"),
    "problem_groups": (_LIST, "Gruppierung gleichartiger Probleme (nur Quellen, die das liefern)"),
    "danger_patterns": (_LIST, "Gefahrenmuster-Kennungen (DP1 bis DP10), nur Quellen, die das liefern"),
    "highlights": (_STR_OR_NONE, "Kernaussage des Berichts, einzeilig"),
    "bulletin_text": ((dict,), "Berichtstexte als Blöcke: {summary?, sections[], tendency[]}"),
}
# Felder, die im GeoJSON als Property stehen (alles außer der Geometrie, die das Feature selbst trägt)
PROPERTY_FIELDS = tuple(k for k in RECORD_FIELDS if k != "geometry")
ASPECTS = ("N", "NE", "E", "SE", "S", "SW", "W", "NW")
SUBDIVISIONS = ("minus", "neutral", "plus")
PERIODS = ("all_day", "earlier", "later")
TEXT_KEYS = {"headline", "summary", "sections", "tendency"}
SECTION_KEYS = {"activity", "snowpack", "weather_forecast", "weather_review", "travel_advisory"}
BLOCK_TYPES = {"paragraph", "heading", "list"}


class SchemaError(ValueError):
    """Ein Datensatz oder Feature entspricht nicht dem Standardschema."""


def _text_for_record(text):
    """Das Bulletin-Feld `text` -> bulletin_text ohne die Kernaussage (die steht als highlights im Datensatz)."""
    return {k: v for k, v in (text or {}).items() if k != "headline"}


def _union_aspects(problems):
    seen = {a for p in problems for a in p.get("aspects") or []}
    return [a for a in ASPECTS if a in seen]


def build_record(region_id, region, bulletin, source_id, feature):
    """Ein Regionsdatensatz aus Regionenindex-Eintrag, Bulletin (oder None) und Polygon-Feature."""
    b = bulletin
    return {
        "source": source_id,
        "country": region["country"],
        "region_id": region_id,
        "region_name": region["name"],
        "geometry": feature["geometry"],
        "label_point": list(feature["properties"]["label_point"]),
        "bulletin_id": b["id"] if b else None,
        "publication_time": b["publication_time"] if b else None,
        "valid_from": b["validity_period"]["start"] if b else None,
        "valid_until": b["validity_period"]["end"] if b else None,
        "next_update": b.get("next_update") if b else None,
        "main_date": b.get("main_date") if b else None,
        "unscheduled": bool(b and b.get("unscheduled")),
        "max_level": b["max_level"] if b else None,
        "max_subdivision": b.get("max_subdivision") if b else None,
        "danger_ratings": list(b["danger_ratings"]) if b else [],
        "danger_by_elevation": list(b["danger_by_elevation"]) if b else [],
        "elevation_thresholds": list(b["elevation_thresholds"]) if b else [],
        "avalanche_problems": list(b["avalanche_problems"]) if b else [],
        "aspects": _union_aspects(b["avalanche_problems"]) if b else [],
        "problem_groups": list(b.get("problem_groups") or []) if b else [],
        "danger_patterns": list(b.get("danger_patterns") or []) if b else [],
        "highlights": (b.get("text") or {}).get("headline") if b else None,
        "bulletin_text": _text_for_record(b.get("text")) if b else {},
    }


def build_region_records(source_id, bulletins, regions, features):
    """Alle Regionsdatensätze einer Quelle, sortiert nach Kennung.

    bulletins: Liste der Bulletins im gemeinsamen Modell; regions: Regionenindex {id: {name, country, bulletin}};
    features: Polygon-Features (properties.region_id, properties.label_point). Regionen ohne Polygon entfallen.
    """
    by_id = {f["properties"]["region_id"]: f for f in features}
    out = []
    for rid in sorted(regions):
        feature = by_id.get(rid)
        if feature is None:
            continue
        idx = regions[rid]["bulletin"]
        out.append(build_record(rid, regions[rid], bulletins[idx] if idx is not None else None, source_id, feature))
    return out


def to_feature(record):
    """Regionsdatensatz -> GeoJSON-Feature mit allen Standard-Properties."""
    return {"type": "Feature", "properties": {k: record[k] for k in PROPERTY_FIELDS}, "geometry": record["geometry"]}


def to_geojson(records, source_id=None):
    """Standardisiertes GeoJSON (Vollform): eine FeatureCollection mit allen Feldern des Standardmodells je Region.

    Die Browser-Datei <id>_regions.geojson trägt nur die Geometrie-Ebene (siehe geometry_feature), die Vollform dient
    Auswertungen (Tourenanalyse, Unfallabgleich, KI) und Tests.
    """
    doc = {"type": "FeatureCollection", "schema": SCHEMA, "features": [to_feature(r) for r in records]}
    if source_id:
        doc["source"] = source_id
    return doc


# ---------- Geometrie-Ebene (Datei <id>_regions.geojson) ----------

GEOMETRY_PROPERTIES = {
    "source": _STR, "country": _STR, "region_id": _STR, "region_name": _STR, "label_point": _LIST,
}


def geometry_feature(record):
    """Feature der Browser-Datei: Identifikation und Symbolposition, ohne Berichtsinhalt (ändert sich selten)."""
    return {"type": "Feature", "properties": {k: record[k] for k in GEOMETRY_PROPERTIES}, "geometry": record["geometry"]}


# ---------- Prüfung ----------

def _check_type(name, value, types):
    # bool ist in Python ein int: Zahlenfelder dürfen kein bool sein, und umgekehrt
    if isinstance(value, bool) and bool not in types:
        raise SchemaError("%s: bool statt %s" % (name, "/".join(t.__name__ for t in types)))
    if not isinstance(value, types):
        raise SchemaError("%s: %s statt %s" % (name, type(value).__name__, "/".join(t.__name__ for t in types)))


def _check_rating(where, r, allow_value_only=False):
    for k in ("value", "level"):
        if k not in r:
            raise SchemaError("%s: Feld %s fehlt" % (where, k))
    if r["level"] is not None and (isinstance(r["level"], bool) or r["level"] not in (1, 2, 3, 4, 5)):
        raise SchemaError("%s: Stufe %r" % (where, r["level"]))
    if r.get("subdivision") is not None and r["subdivision"] not in SUBDIVISIONS:
        raise SchemaError("%s: Teilstufe %r" % (where, r["subdivision"]))
    if not allow_value_only and r.get("period") not in PERIODS:
        raise SchemaError("%s: Tageszeit %r" % (where, r.get("period")))
    el = r.get("elevation")
    if el is not None:
        if not isinstance(el, dict) or not set(el) <= {"lower_bound", "upper_bound"} or not el:
            raise SchemaError("%s: Höhe %r" % (where, el))
        for v in el.values():
            if not (v == "treeline" or (isinstance(v, int) and not isinstance(v, bool))):
                raise SchemaError("%s: Höhengrenze %r" % (where, v))


def _check_blocks(where, blocks):
    for b in blocks or []:
        if not isinstance(b, dict) or b.get("type") not in BLOCK_TYPES:
            raise SchemaError("%s: Textblock %r" % (where, b))
        if b["type"] == "list":
            if not isinstance(b.get("items"), list) or not all(isinstance(i, str) for i in b["items"]):
                raise SchemaError("%s: Liste ohne Einträge" % where)
        elif not isinstance(b.get("text"), str):
            raise SchemaError("%s: Textblock ohne Text" % where)


def validate_record(rec):
    """Prüft einen Regionsdatensatz auf Schlüssel, Typen und Wertebereiche; wirft SchemaError."""
    missing = [k for k in RECORD_FIELDS if k not in rec]
    extra = [k for k in rec if k not in RECORD_FIELDS]
    if missing or extra:
        raise SchemaError("%s: fehlende Felder %s, unbekannte Felder %s" % (rec.get("region_id"), missing, extra))
    rid = rec["region_id"]
    for name, (types, _) in RECORD_FIELDS.items():
        try:
            _check_type(name, rec[name], types)
        except SchemaError as e:
            raise SchemaError("%s: %s" % (rid, e))
    if rec["geometry"].get("type") != "MultiPolygon":
        raise SchemaError("%s: Geometrie ist kein MultiPolygon" % rid)
    if len(rec["label_point"]) != 2 or not all(isinstance(x, (int, float)) for x in rec["label_point"]):
        raise SchemaError("%s: label_point" % rid)
    if rec["max_subdivision"] is not None and rec["max_subdivision"] not in SUBDIVISIONS:
        raise SchemaError("%s: Teilstufe %r" % (rid, rec["max_subdivision"]))
    md = rec["main_date"]
    if md is not None and not (len(md) == 10 and md[4] == "-" and md[7] == "-"):
        raise SchemaError("%s: main_date %r" % (rid, md))
    if rec["max_level"] is not None and (isinstance(rec["max_level"], bool) or rec["max_level"] not in (1, 2, 3, 4, 5)):
        raise SchemaError("%s: max_level %r" % (rid, rec["max_level"]))
    has_bulletin = rec["bulletin_id"] is not None
    times = [rec["publication_time"], rec["valid_from"], rec["valid_until"]]
    if has_bulletin != all(t is not None for t in times) or (not has_bulletin and any(t is not None for t in times)):
        raise SchemaError("%s: Bulletin und Zeitangaben passen nicht zusammen" % rid)
    if has_bulletin and not rec["danger_ratings"]:
        raise SchemaError("%s: Bericht ohne Gefahrenstufen" % rid)
    if not has_bulletin and (rec["danger_ratings"] or rec["avalanche_problems"] or rec["max_level"] is not None):
        raise SchemaError("%s: Region ohne Bericht trägt Berichtsinhalt" % rid)
    for r in rec["danger_ratings"]:
        _check_rating("%s danger_ratings" % rid, r)
    for r in rec["danger_by_elevation"]:
        _check_rating("%s danger_by_elevation" % rid, r)
        if r.get("basis") not in ("danger_rating", "avalanche_problem"):
            raise SchemaError("%s danger_by_elevation: basis %r" % (rid, r.get("basis")))
    for t in rec["elevation_thresholds"]:
        if not (t == "treeline" or (isinstance(t, int) and not isinstance(t, bool))):
            raise SchemaError("%s: Höhengrenze %r" % (rid, t))
    for p in rec["avalanche_problems"]:
        if not isinstance(p.get("type"), str) or p.get("period") not in PERIODS:
            raise SchemaError("%s: Lawinenproblem %r" % (rid, p))
        if not set(p.get("aspects") or []) <= set(ASPECTS):
            raise SchemaError("%s: Expositionen %r" % (rid, p.get("aspects")))
        if p.get("danger_rating"):
            _check_rating("%s Problem" % rid, p["danger_rating"], allow_value_only=True)
        _check_blocks("%s Problem" % rid, p.get("comment"))
    if not set(rec["aspects"]) <= set(ASPECTS):
        raise SchemaError("%s: aspects %r" % (rid, rec["aspects"]))
    if not all(isinstance(d, str) for d in rec["danger_patterns"]):
        raise SchemaError("%s: danger_patterns" % rid)
    text = rec["bulletin_text"]
    if not set(text) <= TEXT_KEYS - {"headline"}:
        raise SchemaError("%s: bulletin_text mit unbekannten Schlüsseln %s" % (rid, sorted(set(text) - TEXT_KEYS)))
    for s in text.get("sections") or []:
        if s.get("key") not in SECTION_KEYS:
            raise SchemaError("%s: Textabschnitt %r" % (rid, s.get("key")))
        _check_blocks("%s Abschnitt" % rid, s.get("blocks"))
    for t in text.get("tendency") or []:
        _check_blocks("%s Tendenz" % rid, t.get("blocks"))


def validate_feature(feature, properties=None):
    """Prüft ein GeoJSON-Feature (Vollform: PROPERTY_FIELDS, Geometrie-Ebene: GEOMETRY_PROPERTIES)."""
    if feature.get("type") != "Feature" or not isinstance(feature.get("properties"), dict):
        raise SchemaError("kein GeoJSON-Feature")
    props = feature["properties"]
    expected = set(properties if properties is not None else PROPERTY_FIELDS)
    if set(props) != expected:
        raise SchemaError("Properties %s, erwartet %s" % (sorted(props), sorted(expected)))
    geom = feature.get("geometry") or {}
    if geom.get("type") != "MultiPolygon" or not geom.get("coordinates"):
        raise SchemaError("%s: Geometrie ist kein MultiPolygon" % props.get("region_id"))
    if properties is None:
        validate_record(dict(props, geometry=geom))
    else:
        for k, types in GEOMETRY_PROPERTIES.items():
            _check_type(k, props[k], types)
