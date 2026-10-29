"""Kleine Tests für fetch_avalanche.py (ohne Netzwerk): python3 scripts/test_fetch_avalanche.py"""

import os
import sys

sys.path.insert(0, os.path.dirname(__file__))
import fetch_avalanche as a

SQ = [[11, 47], [11.1, 47], [11.1, 47.1], [11, 47.1], [11, 47]]


def feat(rid, start=None, end=None, geom=None):
    return {"type": "Feature", "properties": {"id": rid, "start_date": start, "end_date": end},
            "geometry": geom or {"type": "MultiPolygon", "coordinates": [[SQ]]}}


def bulletin(bid, regions, ratings=None, publication="2026-01-10T15:00:00Z", **extra):
    b = {"bulletinID": bid, "publicationTime": publication,
         "validTime": {"startTime": publication, "endTime": "2026-01-11T15:00:00Z"},
         "unscheduled": False, "avalancheProblems": [], "lang": "de",
         "customData": {"ALBINA": {"mainDate": "2026-01-11"}},
         "dangerRatings": ratings or [{"mainValue": "moderate", "validTimePeriod": "all_day"}],
         "regions": [{"regionID": r, "name": "Name " + r} for r in regions]}
    b.update(extra)
    return b


def test_polygon_validity_boundaries():
    p = {"start_date": "2022-10-01", "end_date": "2025-10-01"}
    assert not a.polygon_valid(p, "2022-09-30")
    assert a.polygon_valid(p, "2022-10-01")
    assert a.polygon_valid(p, "2025-09-30")
    assert not a.polygon_valid(p, "2025-10-01")   # end_date ist exklusiv
    assert a.polygon_valid({}, "2026-01-01") and a.polygon_valid({"start_date": None, "end_date": None}, "2026-01-01")


def test_round_ring_dedup_and_degenerate():
    ring = [[11.000001, 47.000001], [11.000002, 47.000002], [11.1, 47], [11.1, 47.1], [11.000001, 47.000001]]
    assert a.round_ring(ring) == [[11.0, 47.0], [11.1, 47.0], [11.1, 47.1], [11.0, 47.0]]
    assert a.round_ring([[11, 47], [11.000001, 47], [11, 47.000001], [11, 47]]) is None


def test_round_geometry_polygon_becomes_multipolygon_and_drops_degenerate_hole():
    hole = [[11.05, 47.05], [11.050001, 47.05], [11.05, 47.050001], [11.05, 47.05]]
    g = a.round_geometry({"type": "Polygon", "coordinates": [SQ, hole]})
    assert g["type"] == "MultiPolygon" and len(g["coordinates"]) == 1 and len(g["coordinates"][0]) == 1


def test_build_regions_scope_validity_and_sorting():
    fs = [feat("AT-07-02"), feat("AT-02-01"), feat("IT-32-TN-01"), feat("AT-07-01"),
          feat("AT-07-03", end="2022-10-01"), feat("AT-07-04", start="2030-01-01")]
    ids = [f["properties"]["id"] for f in a.build_regions(fs, "2026-01-11")]
    assert ids == ["AT-07-01", "AT-07-02", "IT-32-TN-01"], ids


def test_build_regions_same_id_old_and_new_polygon():
    fs = [feat("AT-07-05", end="2022-10-01"), feat("AT-07-05", start="2022-10-01")]
    assert len(a.build_regions(fs, "2026-01-11")) == 1
    assert len(a.build_regions(fs, "2022-01-01")) == 1


def test_build_regions_duplicate_valid_polygon_fails():
    try:
        a.build_regions([feat("AT-07-05"), feat("AT-07-05")], "2026-01-11")
    except ValueError:
        return
    raise AssertionError("doppelte gültige Polygone müssen abbrechen")


def test_paragraphs_split_on_br_and_nothing_invented():
    assert a.paragraphs("Eins <br/> Zwei<br>Drei <BR />") == ["Eins", "Zwei", "Drei"]
    assert a.paragraphs(None) == [] and a.paragraphs("") == [] and a.paragraphs(5) == []


def test_text_block_empty_is_none():
    assert a.text_block({}) is None and a.text_block({"highlights": " ", "comment": ""}) is None
    assert a.text_block({"highlights": "H", "comment": "a<br/>b"}) == {"highlights": "H", "comment": ["a", "b"]}


def test_rating_levels_treeline_and_defaults():
    r = a.slim_rating({"mainValue": "considerable", "elevation": {"lowerBound": "2000"}})
    assert r == {"value": "considerable", "level": 3, "period": "all_day", "elevation": {"lowerBound": 2000}}
    r = a.slim_rating({"mainValue": "low", "elevation": {"upperBound": "treeline"}, "validTimePeriod": "later"})
    assert r["elevation"] == {"upperBound": "treeline"} and r["period"] == "later"
    assert a.slim_rating({"mainValue": "no_snow"})["level"] is None
    assert a.slim_rating({"mainValue": "very_high"})["level"] == 5


def test_slim_bulletin_max_level_over_elevation_and_periods():
    b = bulletin("b1", ["AT-07-01"], ratings=[
        {"mainValue": "low", "elevation": {"upperBound": "2600"}, "validTimePeriod": "later"},
        {"mainValue": "moderate", "elevation": {"lowerBound": "2600"}, "validTimePeriod": "later"},
        {"mainValue": "low", "validTimePeriod": "earlier"}])
    s = a.slim_bulletin(b)
    assert s["maxLevel"] == 2 and len(s["dangerRatings"]) == 3 and s["mainDate"] == "2026-01-11"
    assert a.slim_bulletin(bulletin("b2", ["AT-07-01"], ratings=[{"mainValue": "no_snow"}]))["maxLevel"] is None


def test_slim_problem_aspects_sorted_and_optional_fields():
    p = a.slim_problem({"problemType": "wind_slab", "aspects": ["NW", "N", "E"], "avalancheSize": 2,
                        "elevation": {"lowerBound": "treeline"}})
    assert p == {"type": "wind_slab", "period": "all_day", "elevation": {"lowerBound": "treeline"},
                 "avalancheSize": 2, "aspects": ["N", "E", "NW"]}
    assert a.slim_problem({"problemType": "new_snow"}) == {"type": "new_snow", "period": "all_day"}


def test_bulletin_text_fields_and_tendency():
    b = bulletin("b1", ["AT-07-01"],
                 avalancheActivity={"highlights": "Kurz", "comment": "A<br/>B"},
                 snowpackStructure={"comment": "Schnee"}, weatherForecast={}, travelAdvisory={},
                 tendency=[{"highlights": "Tendenz", "tendencyType": "steady",
                            "validTime": {"startTime": "x", "endTime": "y"}}],
                 customData={"ALBINA": {"mainDate": "2026-01-11"}, "LWD_Tyrol": {"dangerPatterns": ["DP10"]}})
    s = a.slim_bulletin(b)
    assert s["activity"] == {"highlights": "Kurz", "comment": ["A", "B"]}
    assert s["snowpack"] == {"comment": ["Schnee"]}
    assert "weather" not in s and "travelAdvisory" not in s     # leere Blöcke entfallen
    assert s["tendency"][0]["type"] == "steady" and s["dangerPatterns"] == ["DP10"]


def test_build_bulletin_scope_and_missing_polygon():
    doc = {"bulletins": [bulletin("b1", ["AT-07-01", "IT-32-BZ-02", "AT-07-99"]), bulletin("b2", ["AT-02-01"])]}
    bs, regions, missing, skipped = a.build_bulletin(doc, ["AT-07-01", "IT-32-BZ-02"])
    assert len(bs) == 1 and skipped == 1 and sorted(regions) == ["AT-07-01", "AT-07-99", "IT-32-BZ-02"]
    assert missing == ["AT-07-99"] and regions["AT-07-01"] == {"name": "Name AT-07-01", "b": 0}


def test_build_bulletin_newer_publication_wins_and_reindexes():
    old = bulletin("old", ["AT-07-01", "AT-07-02"], publication="2026-01-10T15:00:00Z")
    new = bulletin("new", ["AT-07-01"], publication="2026-01-11T05:00:00Z")
    bs, regions, _, _ = a.build_bulletin({"bulletins": [old, new]}, [])
    assert [b["id"] for b in bs] == ["old", "new"] and regions["AT-07-01"]["b"] == 1 and regions["AT-07-02"]["b"] == 0
    only_new = bulletin("new2", ["AT-07-01"], publication="2026-01-11T05:00:00Z")
    bs, regions, _, _ = a.build_bulletin({"bulletins": [old, only_new]}, [])
    assert regions["AT-07-01"]["b"] == 1
    old1 = bulletin("old1", ["AT-07-01"], publication="2026-01-10T15:00:00Z")
    bs, regions, _, _ = a.build_bulletin({"bulletins": [old1, new]}, [])
    assert [b["id"] for b in bs] == ["new"] and regions["AT-07-01"]["b"] == 0   # überschriebenes Bulletin entfällt


def test_build_bulletin_same_age_duplicate_fails():
    try:
        a.build_bulletin({"bulletins": [bulletin("x", ["AT-07-01"]), bulletin("y", ["AT-07-01"])]}, [])
    except ValueError:
        return
    raise AssertionError("gleich alte Bulletins für dieselbe Region müssen abbrechen")


def test_bulletin_without_ratings_fails():
    b = bulletin("x", ["AT-07-01"])
    b["dangerRatings"] = []
    try:
        a.build_bulletin({"bulletins": [b]}, [])
    except ValueError:
        return
    raise AssertionError("Bulletin ohne Gefahrenstufen darf nicht still übernommen werden")


def test_validity_spans_all_bulletins():
    b1, b2 = a.slim_bulletin(bulletin("1", ["AT-07-01"])), a.slim_bulletin(bulletin("2", ["AT-07-02"]))
    b2["validTime"] = {"startTime": "2026-01-09T15:00:00Z", "endTime": "2026-01-12T15:00:00Z"}
    assert a.validity([b1, b2]) == {"startTime": "2026-01-09T15:00:00Z", "endTime": "2026-01-12T15:00:00Z"}


if __name__ == "__main__":
    tests = [(n, f) for n, f in sorted(globals().items()) if n.startswith("test_") and callable(f)]
    for name, fn in tests:
        fn()
        print("ok", name)
    print("%d Tests bestanden" % len(tests))