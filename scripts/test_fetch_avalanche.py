"""Tests für fetch_avalanche.py und avalanche_sources.py (Netzwerk simuliert): python3 scripts/test_fetch_avalanche.py"""

import datetime
import json
import os
import sys
import tempfile

sys.path.insert(0, os.path.dirname(__file__))
import avalanche_sources as s
import fetch_avalanche as fa
import test_avalanche_model as tm

NOW = datetime.datetime(2026, 1, 15, 8, 0, tzinfo=datetime.timezone.utc)
SLF = s.get_provider("slf")
EUREGIO = s.get_provider("euregio")
SLF_NAMES = {"sectors": [{"sector_id": "4115", "sector_name": "Glarus Nord", "sector_names": {"de": "Glarus Nord (de)"}},
                         {"sector_id": "4116", "sector_name": "Glarus Süd", "sector_names": {}}]}


def square(rid, x=11.0):
    ring = [[x, 47], [x + .1, 47], [x + .1, 47.1], [x, 47.1], [x, 47]]
    return {"type": "Feature", "properties": {"id": rid}, "geometry": {"type": "MultiPolygon", "coordinates": [[ring]]}}


class Fake:
    """Ersetzt fa.get_json: URL -> Dokument oder Exception."""

    def __init__(self, table):
        self.table, self.calls = table, []

    def __call__(self, url):
        self.calls.append(url)
        v = self.table[url]
        if isinstance(v, Exception):
            raise v
        return v


def setup(table):
    tmp = tempfile.TemporaryDirectory()
    fa.DATA_DIR = tmp.name
    fa.PAUSE = 0
    fa.get_json = Fake(table)
    return tmp


def slf_table(bulletins, polygons=("CH-4115", "CH-4116")):
    return {SLF.bulletin_url: {"bulletins": bulletins}, SLF.names_url: SLF_NAMES,
            fa.REGIONS_URL.format(code="CH"): {"features": [square(p, 8 + i * .2) for i, p in enumerate(polygons)]}}


def euregio_table(bulletins):
    t = {EUREGIO.bulletin_url: {"bulletins": bulletins}}
    for code in EUREGIO.geometry_codes:
        t[fa.REGIONS_URL.format(code=code)] = {"features": [square("AT-07-01")] if code == "AT-07" else []}
    return t


def load(name):
    with open(os.path.join(fa.DATA_DIR, name), encoding="utf-8") as f:
        return json.load(f)


def test_slf_off_season_writes_polygons_without_bulletins():
    tmp = setup(slf_table([]))
    fa.fetch_source(SLF, NOW)
    doc = load("slf.json")
    assert doc["status"] == "no_active_bulletin" and doc["bulletins"] == [] and doc["validity_period"] is None
    assert doc["source"]["attribution"] == "WSL-Institut für Schnee- und Lawinenforschung SLF" and doc["schema"] == tm.m.SCHEMA
    assert doc["reference_date"] == "2026-01-15"
    assert doc["regions"] == {"CH-4115": {"name": "Glarus Nord (de)", "country": "CH", "bulletin": None},
                              "CH-4116": {"name": "Glarus Süd", "country": "CH", "bulletin": None}}
    geo = load("slf_regions.geojson")
    assert [f["properties"]["region_id"] for f in geo["features"]] == ["CH-4115", "CH-4116"] and geo["source"] == "slf"
    assert all(len(f["properties"]["label_point"]) == 2 for f in geo["features"])
    tmp.cleanup()


def test_slf_active_bulletin_and_idempotence():
    tmp = setup(slf_table([tm.slf_bulletin()]))
    fa.fetch_source(SLF, NOW)
    doc = load("slf.json")
    assert doc["status"] == "active" and doc["reference_date"] == "2025-03-15" and len(doc["bulletins"]) == 1
    assert doc["regions"]["CH-4115"]["bulletin"] == 0 and doc["regions"]["CH-4115"]["name"] == "Name CH-4115"
    assert doc["bulletins"][0]["max_subdivision"] == "plus"
    before = os.path.getmtime(os.path.join(fa.DATA_DIR, "slf.json"))
    fa.fetch_source(SLF, NOW + datetime.timedelta(hours=9))
    assert os.path.getmtime(os.path.join(fa.DATA_DIR, "slf.json")) == before        # unverändert, kein Schreiben
    tmp.cleanup()


def test_region_without_polygon_is_dropped_and_bulletin_only_for_them_skipped():
    tmp = setup(slf_table([tm.slf_bulletin(regions=["CH-4115", "CH-9999"]), tm.slf_bulletin("only-missing", ["CH-8888"])]))
    fa.fetch_source(SLF, NOW)
    doc = load("slf.json")
    assert sorted(doc["regions"]) == ["CH-4115", "CH-4116"] and len(doc["bulletins"]) == 1
    assert doc["regions"]["CH-4116"]["bulletin"] is None
    tmp.cleanup()


def test_euregio_without_regions_is_an_error():
    tmp = setup(euregio_table([]))
    try:
        fa.fetch_source(EUREGIO, NOW)
    except RuntimeError:
        tmp.cleanup()
        return
    raise AssertionError("leeres Euregio-Bulletin ist kein gültiger Zustand")


def test_names_failure_is_not_fatal():
    t = slf_table([tm.slf_bulletin()])
    t[SLF.names_url] = RuntimeError("down")
    tmp = setup(t)
    fa.fetch_source(SLF, NOW)
    assert load("slf.json")["regions"]["CH-4116"]["name"] == "Name CH-4116"
    tmp.cleanup()


def test_source_failure_is_isolated_and_reported():
    table = euregio_table([tm.euregio_bulletin()])
    table.update(slf_table([]))
    table[SLF.bulletin_url] = RuntimeError("SLF down")
    tmp = setup(table)
    argv_status = fa.main([])
    assert argv_status == 1                                                       # Fehler gemeldet
    assert os.path.exists(os.path.join(fa.DATA_DIR, "euregio.json"))              # Euregio trotzdem geschrieben
    assert not os.path.exists(os.path.join(fa.DATA_DIR, "slf.json"))
    assert [x["id"] for x in load("index.json")["sources"]] == ["euregio"]
    tmp.cleanup()


def test_failed_source_keeps_previous_files_and_index_entry():
    table = euregio_table([tm.euregio_bulletin()])
    table.update(slf_table([tm.slf_bulletin()]))
    tmp = setup(table)
    assert fa.main([]) == 0
    old = load("slf.json")
    table[SLF.bulletin_url] = RuntimeError("SLF down")
    assert fa.main([]) == 1
    assert load("slf.json") == old and [x["id"] for x in load("index.json")["sources"]] == ["euregio", "slf"]
    tmp.cleanup()


def test_main_argument_selects_source_and_rejects_unknown():
    table = euregio_table([tm.euregio_bulletin()])
    table.update(slf_table([]))
    tmp = setup(table)
    assert fa.main(["slf"]) == 0 and not os.path.exists(os.path.join(fa.DATA_DIR, "euregio.json"))
    assert fa.main(["gibtesnicht"]) == 2
    tmp.cleanup()


def test_write_if_changed_heartbeat():
    with tempfile.TemporaryDirectory() as d:
        path = os.path.join(d, "x.json")
        assert fa.write_if_changed(path, {"generated": "2026-01-15T00:00:00Z", "a": 1}, NOW, heartbeat=True)   # neu
        # gleicher Inhalt: bei 8 Tagen Alter neu geschrieben (Heartbeat), bei 1 Tag nicht
        fa.write_json(path, {"generated": "2026-01-07T00:00:00Z", "a": 1})
        assert fa.write_if_changed(path, {"generated": "x", "a": 1}, NOW, heartbeat=True)
        fa.write_json(path, {"generated": "2026-01-14T08:00:00Z", "a": 1})
        assert not fa.write_if_changed(path, {"generated": "x", "a": 1}, NOW, heartbeat=True)
        assert fa.write_if_changed(path, {"generated": "x", "a": 2}, NOW, heartbeat=True)   # anderer Inhalt
        fa.write_json(path, {"generated": "2020-01-01T00:00:00Z", "a": 1})
        assert not fa.write_if_changed(path, {"generated": "x", "a": 1}, NOW)               # ohne Heartbeat nie nur wegen Alter


def test_in_scope_and_slf_names():
    assert SLF.in_scope("CH-1111") and not SLF.in_scope("CHX-1") and not SLF.in_scope("AT-07-01")
    assert EUREGIO.in_scope("IT-32-BZ-08-03") and EUREGIO.in_scope("AT-07") and not EUREGIO.in_scope("AT-02-01")
    assert SLF.parse_names(SLF_NAMES) == {"CH-4115": "Glarus Nord (de)", "CH-4116": "Glarus Süd"}


def test_registry_is_consistent():
    ids = [p.id for p in s.PROVIDERS]
    assert len(ids) == len(set(ids)) and ids == ["euregio", "slf"]
    for p in s.PROVIDERS:
        p.validate()
        assert set(fa.META_KEYS) <= set(p.meta()) and set(p.meta()) - set(fa.META_KEYS) <= {"notes"}
        assert all(p.meta()[k] for k in fa.META_KEYS)
    assert s.get_provider("slf") is SLF and s.get_provider("gibtesnicht") is None


if __name__ == "__main__":
    tests = [(n, f) for n, f in sorted(globals().items()) if n.startswith("test_") and callable(f)]
    for name, fn in tests:
        fn()
        print("ok", name)
    print("%d Tests bestanden" % len(tests))