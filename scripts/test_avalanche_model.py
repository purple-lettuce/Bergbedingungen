"""Tests für avalanche_model.py (ohne Netzwerk): python3 scripts/test_avalanche_model.py"""

import os
import sys

sys.path.insert(0, os.path.dirname(__file__))
import avalanche_model as m

SQ = [[11, 47], [11.1, 47], [11.1, 47.1], [11, 47.1], [11, 47]]


def feat(rid, start=None, end=None, geom=None):
    return {"type": "Feature", "properties": {"id": rid, "start_date": start, "end_date": end},
            "geometry": geom or {"type": "MultiPolygon", "coordinates": [[SQ]]}}


# SLF-Bulletin in der Struktur von aws.slf.ch/api/bulletin/caaml/v4/de/json (Stand 15.03.2025, gekürzt)
def slf_bulletin(bid="slf-1", regions=("CH-4115", "CH-4116"), publication="2025-03-14T16:00:00Z"):
    return {
        "bulletinID": bid, "lang": "de", "publicationTime": publication, "nextUpdate": "2025-03-15T16:00:00Z",
        "validTime": {"startTime": publication, "endTime": "2025-03-15T16:00:00Z"}, "unscheduled": False,
        "regions": [{"regionID": r, "name": "Name " + r} for r in regions],
        "dangerRatings": [{"mainValue": "considerable", "validTimePeriod": "all_day",
                           "customData": {"CH": {"subdivision": "plus"}}}],
        "avalancheProblems": [
            {"problemType": "new_snow", "comment": "Erster Absatz. <br/> Zweiter Absatz.", "dangerRatingValue": "considerable",
             "validTimePeriod": "all_day", "elevation": {"lowerBound": "2200"}, "aspects": ["NW", "N", "NE"],
             "customData": {"CH": {"subdivision": "plus", "coreZoneText": "Gefahrenstufe \"erheblich\" (3+) über 2200m."}}},
            {"problemType": "persistent_weak_layers", "comment": "Erster Absatz. <br/> Zweiter Absatz.",
             "dangerRatingValue": "considerable", "validTimePeriod": "all_day", "elevation": {"lowerBound": "2200"},
             "aspects": ["N"], "customData": {"CH": {"subdivision": "plus"}}},
            {"problemType": "wet_snow", "comment": "Nass.", "dangerRatingValue": "moderate", "validTimePeriod": "all_day",
             "elevation": {"upperBound": "1800"}, "aspects": ["N", "S"], "customData": {"CH": {}}},
        ],
        "customData": {"CH": {"aggregation": [
            {"category": "dry", "validTimePeriod": "all_day", "problemTypes": ["new_snow", "persistent_weak_layers"],
             "title": "Trockene Lawinen"},
            {"category": "wet", "validTimePeriod": "all_day", "problemTypes": ["wet_snow"], "title": "Nasse Lawinen"}]}},
        "weatherForecast": {"comment": "<h1>Wetter</h1><p>Es schneit <span>stark</span> &amp; weht.</p>"
                                       "<h2>Neuschnee</h2><ul><li>Norden: 10 cm</li><li>Süden: 20 cm</li></ul>"},
        "snowpackStructure": {"comment": "<p>Schwachschichten.</p>"},
        "tendency": [{"comment": "<h1>Tendenz</h1><p>Abnehmend.</p>"}],
    }


def euregio_bulletin(bid="eu-1", regions=("AT-07-01",), publication="2026-01-14T16:00:00Z"):
    return {
        "bulletinID": bid, "publicationTime": publication, "unscheduled": True, "highlights": "Heikle Verhältnisse.",
        "validTime": {"startTime": publication, "endTime": "2026-01-15T16:00:00Z"},
        "customData": {"ALBINA": {"mainDate": "2026-01-15"}, "LWD_Tyrol": {"dangerPatterns": ["DP10"]}},
        "regions": [{"regionID": r, "name": "Name " + r} for r in regions],
        "dangerRatings": [
            {"mainValue": "low", "elevation": {"upperBound": "2600"}, "validTimePeriod": "later"},
            {"mainValue": "moderate", "elevation": {"lowerBound": "2600"}, "validTimePeriod": "later"},
            {"mainValue": "low", "validTimePeriod": "earlier"}],
        "avalancheProblems": [{"problemType": "wind_slab", "aspects": ["NW", "N", "E"], "avalancheSize": 2,
                               "snowpackStability": "poor", "frequency": "few", "elevation": {"lowerBound": "treeline"}}],
        "avalancheActivity": {"highlights": "Kurz.", "comment": "A<br/>B"},
        "snowpackStructure": {"comment": "Schnee"}, "weatherForecast": {}, "travelAdvisory": {},
        "tendency": [{"highlights": "Tendenz", "tendencyType": "steady",
                      "validTime": {"startTime": "2026-01-15T16:00:00Z", "endTime": "2026-01-16T16:00:00Z"}}],
    }


# ---------- Texte ----------

def test_blocks_from_slf_html():
    blocks = m.blocks_from(slf_bulletin()["weatherForecast"]["comment"])
    assert blocks == [{"type": "heading", "level": 1, "text": "Wetter"},
                      {"type": "paragraph", "text": "Es schneit stark & weht."},
                      {"type": "heading", "level": 2, "text": "Neuschnee"},
                      {"type": "list", "items": ["Norden: 10 cm", "Süden: 20 cm"]}], blocks


def test_blocks_from_br_separates_paragraphs_and_never_keeps_markup():
    assert [b["text"] for b in m.blocks_from("Eins <br/> Zwei<br>Drei <BR />")] == ["Eins", "Zwei", "Drei"]
    nasty = m.blocks_from('<p onclick="x()">Hallo <a href="javascript:1">Link</a><script>alert(1)</script><style>p{}</style></p>')
    assert nasty == [{"type": "paragraph", "text": "Hallo Link"}], nasty
    assert m.blocks_from(None) == [] and m.blocks_from("") == [] and m.blocks_from(5) == []


def test_blocks_from_list_without_ul_and_unclosed_tags():
    assert m.blocks_from("<li>A</li><li>B")[0] == {"type": "list", "items": ["A", "B"]}
    assert m.blocks_from("<p>Offen")[0]["text"] == "Offen"


def test_plain_and_text_block():
    assert m.plain("<h1>Titel</h1><p>Text</p>") == "Titel Text"
    assert m.text_block({}) is None and m.text_block({"highlights": " ", "comment": ""}) is None
    assert m.text_block({"highlights": "H", "comment": "a<br/>b"}) == {
        "highlights": "H", "blocks": [{"type": "paragraph", "text": "a"}, {"type": "paragraph", "text": "b"}]}


# ---------- Stufen und Höhen ----------

def test_elevation_variants():
    assert m.elevation({}) is None and m.elevation(None) is None
    assert m.elevation({"lowerBound": "2000"}) == {"lower_bound": 2000}
    assert m.elevation({"lowerBound": "treeline", "upperBound": "2400"}) == {"lower_bound": "treeline", "upper_bound": 2400}
    assert m.elevation({"lowerBound": 0, "upperBound": None}) is None          # SLF V3: ganzer Berg
    assert m.elevation({"lowerBound": 1800, "upperBound": 2400}) == {"lower_bound": 1800, "upper_bound": 2400}


def test_danger_rating_levels_subdivision_defaults():
    r = m.danger_rating({"mainValue": "considerable", "customData": {"CH": {"subdivision": "plus"}},
                         "elevation": {"lowerBound": "2000"}})
    assert r == {"value": "considerable", "level": 3, "period": "all_day", "subdivision": "plus",
                 "elevation": {"lower_bound": 2000}}
    assert "subdivision" not in m.danger_rating({"mainValue": "low", "customData": {"CH": {"subdivision": "x"}}})
    assert m.danger_rating({"mainValue": "no_snow"})["level"] is None
    assert m.danger_rating({"mainValue": "very_high", "validTimePeriod": "later"})["level"] == 5


def test_max_rating_prefers_level_then_subdivision():
    rs = [m.danger_rating({"mainValue": "considerable", "customData": {"CH": {"subdivision": "minus"}}}),
          m.danger_rating({"mainValue": "considerable", "customData": {"CH": {"subdivision": "plus"}}}),
          m.danger_rating({"mainValue": "moderate", "customData": {"CH": {"subdivision": "plus"}}})]
    assert m.max_rating(rs) == (3, "plus")
    assert m.max_rating([m.danger_rating({"mainValue": "no_snow"})]) == (None, None)
    assert m.max_rating([]) == (None, None)


def test_avalanche_problem_slf_fields():
    p = m.avalanche_problem(slf_bulletin()["avalancheProblems"][0])
    assert p["type"] == "new_snow" and p["aspects"] == ["N", "NE", "NW"] and p["elevation"] == {"lower_bound": 2200}
    assert p["danger_rating"] == {"value": "considerable", "level": 3, "subdivision": "plus"}
    assert p["comment"] == [{"type": "paragraph", "text": "Erster Absatz."}, {"type": "paragraph", "text": "Zweiter Absatz."}]
    assert p["core_zone_text"] == 'Gefahrenstufe "erheblich" (3+) über 2200m.'
    assert m.avalanche_problem({"problemType": "new_snow"}) == {"type": "new_snow", "period": "all_day"}


def test_danger_by_elevation_uses_ratings_when_they_carry_elevation():
    b = m.normalize_bulletin(euregio_bulletin(), "euregio")
    bands = b["danger_by_elevation"]
    assert [x["basis"] for x in bands] == ["danger_rating"] * 3
    assert [(x["period"], x.get("elevation")) for x in bands] == [
        ("earlier", None), ("later", {"lower_bound": 2600}), ("later", {"upper_bound": 2600})]
    assert b["max_level"] == 2 and b["elevation_thresholds"] == [2600, "treeline"]


def test_danger_by_elevation_falls_back_to_problems_slf():
    b = m.normalize_bulletin(slf_bulletin(), "slf")
    assert b["danger_ratings"][0].get("elevation") is None
    assert b["danger_by_elevation"] == [
        {"basis": "avalanche_problem", "period": "all_day", "value": "considerable", "level": 3, "subdivision": "plus",
         "elevation": {"lower_bound": 2200}, "problem_types": ["new_snow", "persistent_weak_layers"]},
        {"basis": "avalanche_problem", "period": "all_day", "value": "moderate", "level": 2,
         "elevation": {"upper_bound": 1800}, "problem_types": ["wet_snow"]}]
    assert b["max_level"] == 3 and b["max_subdivision"] == "plus" and b["elevation_thresholds"] == [1800, 2200]


def test_danger_by_elevation_single_rating_without_any_elevation():
    b = {"bulletinID": "x", "publicationTime": "2026-01-01T00:00:00Z",
         "validTime": {"startTime": "2026-01-01T00:00:00Z", "endTime": "2026-01-02T00:00:00Z"},
         "dangerRatings": [{"mainValue": "low"}], "avalancheProblems": [{"problemType": "wind_slab"}]}
    n = m.normalize_bulletin(b, "euregio")
    assert n["danger_by_elevation"] == [{"basis": "danger_rating", "period": "all_day", "value": "low", "level": 1}]
    assert n["elevation_thresholds"] == []


def test_normalize_euregio_text_and_extras():
    n = m.normalize_bulletin(euregio_bulletin(), "euregio")
    assert n["main_date"] == "2026-01-15" and n["unscheduled"] is True and n["danger_patterns"] == ["DP10"]
    t = n["text"]
    assert t["headline"] == "Heikle Verhältnisse." and t["summary"] == "Kurz."
    assert [s["key"] for s in t["sections"]] == ["activity", "snowpack"]          # leere Blöcke entfallen
    assert t["sections"][0] == {"blocks": [{"type": "paragraph", "text": "A"}, {"type": "paragraph", "text": "B"}], "key": "activity"}
    assert t["tendency"][0]["type"] == "steady" and t["tendency"][0]["validity_period"]["end"] == "2026-01-16T16:00:00Z"
    assert n["validity_period"] == {"start": "2026-01-14T16:00:00Z", "end": "2026-01-15T16:00:00Z"}


def test_normalize_slf_text_groups_and_no_main_date():
    n = m.normalize_bulletin(slf_bulletin(), "slf")
    assert "main_date" not in n and n["source"] == "slf" and n["next_update"] == "2025-03-15T16:00:00Z"
    assert [s["key"] for s in n["text"]["sections"]] == ["snowpack", "weather_forecast"]
    assert "summary" not in n["text"]                                                # SLF liefert keine Zusammenfassung
    assert n["problem_groups"][0] == {"types": ["new_snow", "persistent_weak_layers"], "period": "all_day",
                                      "category": "dry", "title": "Trockene Lawinen"}
    assert n["text"]["tendency"] == [{"highlights": "Tendenz", "blocks": [{"type": "paragraph", "text": "Abnehmend."}]}] or \
        n["text"]["tendency"][0]["blocks"][-1]["text"] == "Abnehmend."


# ---------- Regionenindex ----------

def scope(rid):
    return rid.startswith(("AT-07", "CH"))


def test_build_index_scope_names_and_country():
    doc = {"bulletins": [slf_bulletin(regions=["CH-4115", "AT-07-01"]), slf_bulletin("x", ["IT-21-01"])]}
    bs, regions, skipped = m.build_index(doc, "slf", scope)
    assert len(bs) == 1 and skipped == 1 and sorted(regions) == ["AT-07-01", "CH-4115"]
    assert regions["CH-4115"] == {"name": "Name CH-4115", "country": "CH", "bulletin": 0}


def test_build_index_name_fallback_to_names_then_id():
    b = slf_bulletin()
    b["regions"] = [{"regionID": "CH-4115"}, {"regionID": "CH-4116"}]
    _, regions, _ = m.build_index({"bulletins": [b]}, "slf", scope, {"CH-4115": "Glarus Nord"})
    assert regions["CH-4115"]["name"] == "Glarus Nord" and regions["CH-4116"]["name"] == "CH-4116"


def test_build_index_newer_publication_wins_and_reindexes():
    old = slf_bulletin("old", ["CH-1", "CH-2"], "2026-01-10T15:00:00Z")
    new = slf_bulletin("new", ["CH-1"], "2026-01-11T05:00:00Z")
    bs, regions, _ = m.build_index({"bulletins": [old, new]}, "slf", scope)
    assert [b["id"] for b in bs] == ["old", "new"] and regions["CH-1"]["bulletin"] == 1 and regions["CH-2"]["bulletin"] == 0
    only_old = slf_bulletin("o2", ["CH-1"], "2026-01-10T15:00:00Z")
    bs, regions, _ = m.build_index({"bulletins": [only_old, new]}, "slf", scope)
    assert [b["id"] for b in bs] == ["new"] and regions["CH-1"]["bulletin"] == 0


def test_build_index_failures():
    for bad in ([slf_bulletin("a", ["CH-1"]), slf_bulletin("b", ["CH-1"])],):
        try:
            m.build_index({"bulletins": bad}, "slf", scope)
        except ValueError:
            continue
        raise AssertionError("gleich alte Bulletins für dieselbe Region müssen abbrechen")
    b = slf_bulletin()
    b["dangerRatings"] = []
    try:
        m.build_index({"bulletins": [b]}, "slf", scope)
    except ValueError:
        return
    raise AssertionError("Bulletin ohne Gefahrenstufen darf nicht still übernommen werden")


def test_validity_and_empty():
    assert m.validity([]) is None
    a = m.normalize_bulletin(slf_bulletin(), "slf")
    b = m.normalize_bulletin(slf_bulletin("y", publication="2025-03-13T16:00:00Z"), "slf")
    assert m.validity([a, b]) == {"start": "2025-03-13T16:00:00Z", "end": "2025-03-15T16:00:00Z"}


def test_region_country():
    assert m.region_country("AT-07-14-01") == "AT" and m.region_country("CH-1111") == "CH" and m.region_country("IT-32-BZ-08") == "IT"


# ---------- Geometrie ----------

def test_polygon_validity_boundaries():
    p = {"start_date": "2022-10-01", "end_date": "2025-10-01"}
    assert not m.polygon_valid(p, "2022-09-30") and m.polygon_valid(p, "2022-10-01")
    assert m.polygon_valid(p, "2025-09-30") and not m.polygon_valid(p, "2025-10-01")
    assert m.polygon_valid({}, "2026-01-01") and m.polygon_valid({"start_date": None, "end_date": None}, "2026-01-01")


def test_round_ring_and_geometry():
    ring = [[11.000001, 47.000001], [11.000002, 47.000002], [11.1, 47], [11.1, 47.1], [11.000001, 47.000001]]
    assert m.round_ring(ring, 5) == [[11.0, 47.0], [11.1, 47.0], [11.1, 47.1], [11.0, 47.0]]
    assert m.round_ring([[11, 47], [11.000001, 47], [11, 47.000001], [11, 47]], 5) is None
    hole = [[11.05, 47.05], [11.050001, 47.05], [11.05, 47.050001], [11.05, 47.05]]
    g = m.round_geometry({"type": "Polygon", "coordinates": [SQ, hole]})
    assert g["type"] == "MultiPolygon" and len(g["coordinates"][0]) == 1


def inside(x, y, rings):
    return m._dist_to_polygon(x, y, rings) > 0


def test_polylabel_square_center():
    x, y = m.polylabel([[[0, 0], [10, 0], [10, 10], [0, 10], [0, 0]]])
    assert abs(x - 5) < 0.01 and abs(y - 5) < 0.01


def test_polylabel_concave_c_shape_is_inside_where_centroid_is_not():
    c = [[0, 0], [10, 0], [10, 2], [2, 2], [2, 8], [10, 8], [10, 10], [0, 10], [0, 0]]
    assert not inside(7, 5, [c])                                           # Mittelpunkt der Hülle liegt im Loch
    x, y = m.polylabel([c])
    assert inside(x, y, [c]) and m._dist_to_polygon(x, y, [c]) > 0.95   # Balkenbreite 2 -> Radius 1


def test_polylabel_respects_holes():
    outer = [[0, 0], [10, 0], [10, 10], [0, 10], [0, 0]]
    hole = [[3, 3], [3, 7], [7, 7], [7, 3], [3, 3]]
    x, y = m.polylabel([outer, hole])
    assert m._dist_to_polygon(x, y, [outer, hole]) > 1.4 and not (3 <= x <= 7 and 3 <= y <= 7)


def test_label_point_multipolygon_uses_largest_part():
    small = [[[12, 47], [12.01, 47], [12.01, 47.01], [12, 47.01], [12, 47]]]
    big = [[[11, 47], [11.2, 47], [11.2, 47.2], [11, 47.2], [11, 47]]]
    x, y = m.label_point({"type": "MultiPolygon", "coordinates": [small, big]})
    assert abs(x - 11.1) < 0.002 and abs(y - 47.1) < 0.002


def test_build_regions_scope_validity_country_label_and_sorting():
    fs = [feat("AT-07-02"), feat("AT-02-01"), feat("CH-1111"), feat("AT-07-01"),
          feat("AT-07-03", end="2022-10-01"), feat("AT-07-04", start="2030-01-01")]
    out = m.build_regions(fs, "2026-01-11", scope)
    assert [f["properties"]["id"] for f in out] == ["AT-07-01", "AT-07-02", "CH-1111"]
    p = out[0]["properties"]
    assert p["country"] == "AT" and abs(p["label_point"][0] - 11.05) < 0.002 and abs(p["label_point"][1] - 47.05) < 0.002


def test_build_regions_old_and_new_polygon_and_duplicates():
    fs = [feat("AT-07-05", end="2022-10-01"), feat("AT-07-05", start="2022-10-01")]
    assert len(m.build_regions(fs, "2026-01-11", scope)) == 1 and len(m.build_regions(fs, "2022-01-01", scope)) == 1
    try:
        m.build_regions([feat("AT-07-05"), feat("AT-07-05")], "2026-01-11", scope)
    except ValueError:
        return
    raise AssertionError("doppelte gültige Polygone müssen abbrechen")


if __name__ == "__main__":
    tests = [(n, f) for n, f in sorted(globals().items()) if n.startswith("test_") and callable(f)]
    for name, fn in tests:
        fn()
        print("ok", name)
    print("%d Tests bestanden" % len(tests))