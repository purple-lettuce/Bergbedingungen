"""Kleine Tests für build_geojson.py (ohne Netzwerk): python3 scripts/test_build_geojson.py"""

import json
import os
import sys

sys.path.insert(0, os.path.dirname(__file__))
import build_geojson as b

GEOM = {"type": "Polygon", "coordinates": [[[11, 47], [11.1, 47], [11.1, 47.1], [11, 47]]]}
LOOKUP = {1: "Steinadler", 2: "Birkhuhn", 3: "Gams"}


def area(**kw):
    base = {"uuid": "u", "name": "Karwendel", "category_id": 2, "summary_de": "Beschreibung",
            "geodata": {"geometry": GEOM}}
    base.update(kw)
    return base


def test_wildlife_via_reference_field():
    geo, st = b.build([area(wildlife=[{"id": 3320, "wildlife_id": 1}, {"id": 3321, "wildlife_id": 3}])], LOOKUP)
    f = geo["features"][0]["properties"]
    assert [geo["wildlife_names"][i] for i in f["w"]] == ["Steinadler", "Gams"]
    assert st["wildlife_resolved"] == 2


def test_bare_id_is_never_used_as_reference():
    # id 1 existiert in der Referenzliste, bezeichnet hier aber die Verknüpfung -> darf nicht aufgelöst werden
    geo, st = b.build([area(wildlife=[{"id": 1}])], LOOKUP)
    assert "w" not in geo["features"][0]["properties"] and "wildlife_names" not in geo
    assert st["wildlife_resolved"] == 0 and len(st["wildlife_unresolved_samples"]) == 1


def test_forced_key_id():
    geo, st = b.build([area(wildlife=[{"id": 2}])], LOOKUP, forced_key="id")
    assert geo["wildlife_names"] == ["Birkhuhn"]


def test_name_in_item_and_nested_and_dedup():
    geo, _ = b.build([area(wildlife=[{"id": 9, "name_de": "Auerhuhn"},
                                      {"wildlife": {"id": 9, "name_de": "Auerhuhn"}},
                                      {"species_id": "2"}])], LOOKUP)
    names = [geo["wildlife_names"][i] for i in geo["features"][0]["properties"]["w"]]
    assert names == ["Auerhuhn", "Birkhuhn"]


def test_rules_text_only_important_first_dedup_limit():
    rules = [{"text_de": "Wege nicht verlassen"},
             {"text_de": "Hunde an der Leine", "is_important": True},
             {"text_de": "Wege nicht verlassen"},
             {"activity_id": 27},                       # kein Text -> weglassen, nichts erfinden
             {"text": "  Kein   Drohnenflug "}]
    geo, st = b.build([area(rules=rules)], {})
    texts = [geo["rule_texts"][i] for i in geo["features"][0]["properties"]["r"]]
    assert texts == ["Hunde an der Leine", "Wege nicht verlassen", "Kein Drohnenflug"], texts
    many = [{"text_de": f"Regel {i}"} for i in range(30)]
    geo, _ = b.build([area(rules=many)], {})
    assert len(geo["features"][0]["properties"]["r"]) == b.MAX_RULES


def test_season_appended_once():
    r = [{"text_de": "Betreten verboten", "season_start": "2000-12-01", "season_end": "2000-04-30"},
         {"text_de": "Skitouren nur bis 01.12.–30.04.", "season_start": "2000-12-01", "season_end": "2000-04-30"}]
    geo, _ = b.build([area(rules=r)], {})
    texts = [geo["rule_texts"][i] for i in geo["features"][0]["properties"]["r"]]
    assert texts == ["Betreten verboten (01.12.–30.04.)", "Skitouren nur bis 01.12.–30.04."], texts


def test_tables_shared_and_no_ids_leaked():
    a = area(wildlife=[{"wildlife_id": 1}], rules=[{"text_de": "X"}])
    geo, _ = b.build([a, dict(a, uuid="v")], LOOKUP)
    assert geo["wildlife_names"] == ["Steinadler"] and geo["rule_texts"] == ["X"]
    p = geo["features"][0]["properties"]
    assert set(p) == {"uuid", "name", "category_id", "summary", "w", "r"}


def test_area_without_extras_unchanged():
    geo, _ = b.build([area()], LOOKUP)
    assert geo["features"][0]["properties"] == {"uuid": "u", "name": "Karwendel", "category_id": 2, "summary": "Beschreibung"}
    assert "wildlife_names" not in geo and "rule_texts" not in geo


def test_protected_entity_id_resolves_via_entities():
    # Verknüpfungseintrag: id = Verknüpfung (3320), protected_entity_id = Schutzgut. Nur Letzteres zählt.
    lookup = {4626: "Steinadler", 3320: "FALSCH"}
    geo, st = b.build([area(wildlife=[{"id": 3320, "protected_area_uuid": "u", "protected_entity_id": 4626}])], lookup)
    assert geo["wildlife_names"] == ["Steinadler"] and st["wildlife_resolved"] == 1


def test_unknown_entity_is_not_invented():
    geo, st = b.build([area(wildlife=[{"id": 1, "protected_entity_id": 999}])], {4626: "Steinadler"})
    assert "wildlife_names" not in geo and st["wildlife_resolved"] == 0


def test_nested_entity_object():
    item = {"id": 5, "protected_entity": {"id": 4626, "name_de": "Steinadler"}}
    geo, _ = b.build([area(wildlife=[item])], {})
    assert geo["wildlife_names"] == ["Steinadler"]


def test_nested_area_name_is_not_taken_as_wildlife():
    item = {"id": 5, "protected_entity_id": 4626, "protected_area": {"uuid": "u", "name_de": "Karwendel"}}
    geo, st = b.build([area(wildlife=[item])], {})
    assert "wildlife_names" not in geo and st["wildlife_resolved"] == 0


def test_entities_file_loaded(tmp=None):
    import tempfile
    with tempfile.TemporaryDirectory() as d:
        path = os.path.join(d, "e.json")
        json.dump({"entities": {"4626": "Steinadler", "x": "ignoriert", "7": "  "}}, open(path, "w"))
        assert b.load_wildlife_lookup(path) == {4626: "Steinadler"}
        assert b.load_wildlife_lookup(os.path.join(d, "fehlt.json")) == {}
        assert b.load_wildlife_extras(path) == ({}, {})                       # ältere Datei ohne links und types
        assert b.load_wildlife_extras(os.path.join(d, "fehlt.json")) == ({}, {})


def test_links_and_types_file_loaded():
    import tempfile
    with tempfile.TemporaryDirectory() as d:
        path = os.path.join(d, "e.json")
        json.dump({"entities": {"4626": "Steinadler"}, "types": {"4626": "fauna", "x": "FLORA", "5": ""},
                   "links": {"3320": 4626, "y": 1, "3321": "x"}}, open(path, "w"))
        assert b.load_wildlife_extras(path) == ({3320: 4626}, {4626: "FAUNA"})


# ---------- Verknüpfungen: id des Wildlife-Eintrags -> Schutzgut ----------

ENT = {4626: "Steinadler", 4700: "Arnika", 4800: "Hochmoore", 3320: "FALSCH"}
LINKS = {3320: 4626, 3321: 4700, 3322: 4800, 3323: 4626}
TYPES = {4626: "FAUNA", 4700: "FLORA", 4800: "HABITAT"}


def test_link_id_resolves_to_entity_name_and_type():
    a = area(wildlife=[{"id": 3320, "presence_from": None}, {"id": 3321}, {"id": 3322}, {"id": 3323}])
    geo, st = b.build([a], ENT, links=LINKS, types=TYPES)
    p = geo["features"][0]["properties"]
    assert [geo["wildlife_names"][i] for i in p["w"]] == ["Steinadler", "Arnika", "Hochmoore"]    # Duplikat nur einmal
    assert [geo["wildlife_types"][i] for i in p["w"]] == ["FAUNA", "FLORA", "HABITAT"]
    assert st["wildlife_resolved"] == 4 and st["wildlife_keys"] == {"verknüpfung": 4}
    assert geo["wildlife_names"] != ["FALSCH"]            # die id selbst (3320) ist keine Schutzgut-Kennung


def test_link_with_known_id_never_falls_back_to_heuristic_keys():
    # season_id 4626 kollidiert mit einer Schutzgut-Kennung: Die Verknüpfung (id 3321) gehört zu Arnika, nicht zum Steinadler
    geo, _ = b.build([area(wildlife=[{"id": 3321, "season_id": 4626, "connected_rule_id": 4626}])], ENT, links=LINKS, types=TYPES)
    assert geo["wildlife_names"] == ["Arnika"]
    # Entität ohne Namen: unaufgelöst, kein Raten über andere Felder
    geo, st = b.build([area(wildlife=[{"id": 3399, "season_id": 4626}])], ENT, links={3399: 9999}, types=TYPES)
    assert "wildlife_names" not in geo and st["wildlife_resolved"] == 0


def test_rule_season_weather_ids_are_not_references():
    geo, st = b.build([area(wildlife=[{"id": 5, "season_id": 4626, "daytime_id": 4626, "weathercondition_id": 4626,
                                      "connected_rule_id": 4626}])], ENT)
    assert "wildlife_names" not in geo and st["wildlife_resolved"] == 0


def test_unknown_link_id_is_not_resolved_by_id():
    geo, st = b.build([area(wildlife=[{"id": 4626}])], ENT, links=LINKS, types=TYPES)         # 4626 ist Schutzgut, keine Verknüpfung
    assert "wildlife_names" not in geo and st["wildlife_resolved"] == 0


def test_same_name_with_different_type_is_kept_apart_and_types_optional():
    ent = {1: "Moor", 2: "Moor"}
    geo, _ = b.build([area(wildlife=[{"id": 10}, {"id": 11}])], ent, links={10: 1, 11: 2}, types={1: "FLORA", 2: "HABITAT"})
    assert geo["wildlife_names"] == ["Moor", "Moor"] and geo["wildlife_types"] == ["FLORA", "HABITAT"]
    geo, _ = b.build([area(wildlife=[{"id": 10}])], ent, links={10: 1})                         # ohne Arten
    assert geo["wildlife_names"] == ["Moor"] and "wildlife_types" not in geo


if __name__ == "__main__":
    tests = [v for k, v in sorted(globals().items()) if k.startswith("test_")]
    for t in tests:
        t()
        print("ok", t.__name__)
    print(len(tests), "Tests bestanden")
