"""Tests für fetch_wildlife.py / wildlife_lookup.py ohne Netzwerk: python3 scripts/test_fetch_wildlife.py"""

import os
import sys

sys.path.insert(0, os.path.dirname(__file__))
import fetch_wildlife as fw
from wildlife_lookup import entity_pairs

SCHEMA = {
    "paths": {
        "/wildlife": {"get": {"responses": {"200": {"content": {"application/json": {"schema": {
            "type": "object", "properties": {"results": {"type": "array", "items": {"$ref": "#/components/schemas/W"}}}}}}}}}},
        "/protected-entities": {"get": {"responses": {"200": {"content": {"application/json": {"schema": {
            "type": "array", "items": {"$ref": "#/components/schemas/E"}}}}}}}},
        "/protected-entities/{id}": {"get": {"responses": {"200": {}}}},
        "/protected-areas/{uuid}/wildlife": {"get": {"responses": {"200": {}}}},
        "/activities": {"get": {"responses": {"200": {}}}},
    },
    "components": {"schemas": {
        "W": {"type": "object", "properties": {"id": {}, "protected_entity_id": {}}},
        "E": {"type": "object", "properties": {"id": {}, "name_de": {}}},
    }},
}


def test_schema_paths_and_endpoints():
    paths = fw.relevant_paths(SCHEMA)
    assert set(paths) == {"/wildlife", "/protected-entities", "/protected-entities/{id}", "/protected-areas/{uuid}/wildlife"}
    assert paths["/wildlife"]["get"] == ["id", "protected_entity_id"]
    assert paths["/protected-entities"]["get"] == ["id", "name_de"]
    assert fw.entity_endpoints(paths) == ["/protected-entities"]   # ohne Pfadparameter, nicht /wildlife


def test_pairs_link_row_with_name_and_nested():
    assert list(entity_pairs({"id": 9, "protected_entity_id": 4, "name_de": "Gams"})) == [(4, "Gams")]
    assert list(entity_pairs({"id": 9, "protected_entity": {"id": 4, "name_de": "Gams"}})) == [(4, "Gams")]
    assert list(entity_pairs({"id": 9, "protected_entity_id": 4, "protected_entity": {"name": "Gams"}})) == [(4, "Gams")]


def test_pairs_never_use_link_id_or_area_name():
    assert list(entity_pairs({"id": 9, "protected_entity_id": 4})) == []
    assert list(entity_pairs({"id": 9, "name_de": "Gams"})) == []                       # kein Verweis -> nicht eindeutig
    assert list(entity_pairs({"id": 9, "protected_entity_id": 4, "protected_area": {"id": 1, "name_de": "Karwendel"}})) == []
    assert list(entity_pairs({"id": 9, "name_de": "Gams"}, bare_id_is_entity=True)) == [(9, "Gams")]   # Schutzgut-Endpunkt


def test_main_flow_uses_wildlife_fields_all(tmp=None):
    import tempfile
    calls = []
    link = [{"id": 1, "protected_area_uuid": "a", "protected_entity_id": 4}, {"id": 2, "protected_area_uuid": "b", "protected_entity_id": 5}]

    def fake_fetch_all(url):
        calls.append(url.replace(fw.BASE, ""))
        if url.endswith("/wildlife?fields=all"):
            return [dict(r, protected_entity={"id": r["protected_entity_id"], "name_de": {4: "Steinadler", 5: "Gams"}[r["protected_entity_id"]]}) for r in link]
        raise AssertionError("weitere Quellen dürfen nicht nötig sein: " + url)

    run(fake_fetch_all, tempfile)
    assert calls == ["/wildlife?fields=all"], calls


def test_main_flow_falls_back_to_entity_endpoint_then_nested():
    import tempfile
    link = [{"id": 1, "protected_area_uuid": "a", "protected_entity_id": 4}, {"id": 2, "protected_area_uuid": "b", "protected_entity_id": 5}]
    calls = []

    def fake_fetch_all(url):
        calls.append(url.replace(fw.BASE, ""))
        if "/protected-areas/" in url:
            return [{"id": 2, "protected_entity_id": 5, "protected_entity": {"id": 5, "name_de": "Gams"}}] if "/b/" in url else []
        if url.endswith("/wildlife?fields=all"):
            return link
        if url.endswith("/protected-entities?fields=all"):
            return [{"id": 4, "name_de": "Steinadler"}]          # nur eines der beiden Schutzgüter
        return []

    out = run(fake_fetch_all, tempfile, schema=SCHEMA)
    assert out["entities"] == {"4": "Steinadler", "5": "Gams"}, out
    assert "/protected-entities?fields=all" in calls and "/protected-areas/b/wildlife?fields=all" in calls


def test_nothing_resolvable_writes_diagnosis_and_no_names():
    import tempfile
    link = [{"id": 1, "protected_area_uuid": "a", "protected_entity_id": 4}]
    out = run(lambda url: link if url.endswith("/api/v2/wildlife?fields=all") else [], tempfile, schema=SCHEMA)
    assert out["entities"] == {} and out["probe"]["result"]["entities_resolved"] == 0
    assert out["probe"]["wildlife_sample"] == link[0]


def run(fake_fetch_all, tempfile, schema=None):
    import json
    with tempfile.TemporaryDirectory() as d:
        fw.OUT_ENTITIES = os.path.join(d, "e.json")
        fw.OUT_PROBE = os.path.join(d, "p.json")
        fw.DATA_DIR = d
        fw.fetch_all = fake_fetch_all
        fw.load_schema = lambda: schema
        fw.PAUSE = 0
        fw.main()
        ent = json.load(open(fw.OUT_ENTITIES))
        ent["probe"] = json.load(open(fw.OUT_PROBE))
        return ent


if __name__ == "__main__":
    tests = [v for k, v in sorted(globals().items()) if k.startswith("test_")]
    for t in tests:
        t()
        print("ok", t.__name__)
    print(len(tests), "Tests bestanden")
