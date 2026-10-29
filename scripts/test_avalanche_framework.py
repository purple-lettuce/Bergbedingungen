"""Tests des Lawinen-Frameworks: Standardmodell, Provider-Vertrag, GeoJSON-Schema (ohne Netzwerk).

Aufruf: python3 scripts/test_avalanche_framework.py
Deckt die Akzeptanztests AT-1 (einheitliches Modell), AT-4 (neuer Provider mit einer Klasse) und AT-5 (GeoJSON-Schema) ab.
"""
import copy
import datetime
import json
import os
import sys
import tempfile

sys.path.insert(0, os.path.dirname(__file__))
import avalanche_model as m
import avalanche_providers as p
import avalanche_schema as sc
import avalanche_sources as s
import fetch_avalanche as fa
import test_avalanche_model as tm
import test_fetch_avalanche as tf

NOW = datetime.datetime(2026, 1, 15, 8, 0, tzinfo=datetime.timezone.utc)


def run_source(provider, table):
    """Läuft die zentrale Pipeline mit simuliertem Netzwerk und gibt (bulletin_doc, regions_doc) zurück."""
    tmp = tf.setup(table)
    fa.fetch_source(provider, NOW)
    out = tf.load(provider.id + ".json"), tf.load(provider.id + "_regions.geojson")
    tmp.cleanup()
    return out


def records_of(provider, table):
    bdoc, gdoc = run_source(provider, table)
    return sc.build_region_records(provider.id, bdoc["bulletins"], bdoc["regions"], [
        {"properties": {"region_id": f["properties"]["region_id"], "label_point": f["properties"]["label_point"]},
         "geometry": f["geometry"]} for f in gdoc["features"]])


def euregio_records():
    return records_of(tf.EUREGIO, tf.euregio_table([tm.euregio_bulletin()]))


def slf_records():
    return records_of(tf.SLF, tf.slf_table([tm.slf_bulletin()]))


# ---------- AT-1: identisches Modell ----------

REQUIRED = ("source", "country", "region_id", "region_name", "geometry", "danger_ratings", "publication_time",
            "valid_from", "valid_until", "elevation_thresholds", "avalanche_problems", "aspects", "danger_patterns",
            "highlights", "bulletin_text")


def test_euregio_and_slf_records_have_identical_model():
    eu, ch = euregio_records()[0], slf_records()[0]
    assert list(eu) == list(ch) == list(sc.RECORD_FIELDS)                    # gleiche Felder, gleiche Reihenfolge
    for k in REQUIRED:
        assert k in eu and k in ch
    assert (eu["source"], eu["country"], eu["region_id"]) == ("euregio", "AT", "AT-07-01")
    assert (ch["source"], ch["country"], ch["region_id"]) == ("slf", "CH", "CH-4115")
    for rec in (eu, ch):
        sc.validate_record(rec)
        assert rec["publication_time"] and rec["valid_from"] and rec["valid_until"] and rec["danger_ratings"]
        assert rec["geometry"]["type"] == "MultiPolygon"
    assert eu["valid_from"] == "2026-01-14T16:00:00Z" and eu["valid_until"] == "2026-01-15T16:00:00Z"
    assert eu["highlights"] == "Heikle Verhältnisse." and eu["danger_patterns"] == ["DP10"] and eu["aspects"] == ["N", "E", "NW"]
    assert ch["aspects"] == ["N", "NE", "S", "NW"] and ch["highlights"] is None and ch["elevation_thresholds"] == [1800, 2200]


def test_record_types_are_identical_across_providers():
    eu, ch = euregio_records()[0], slf_records()[0]
    for k in sc.RECORD_FIELDS:
        a, b = eu[k], ch[k]
        if a is None or b is None:        # None ist je Feld zulässig, wo das Schema es erlaubt
            continue
        assert type(a) is type(b), (k, type(a), type(b))


def test_region_without_report_has_same_keys_and_empty_content():
    tmp = tf.setup(tf.slf_table([]))
    fa.fetch_source(tf.SLF, NOW)
    bdoc, gdoc = tf.load("slf.json"), tf.load("slf_regions.geojson")
    tmp.cleanup()
    recs = sc.build_region_records("slf", bdoc["bulletins"], bdoc["regions"], [
        {"properties": f["properties"], "geometry": f["geometry"]} for f in gdoc["features"]])
    assert recs and list(recs[0]) == list(sc.RECORD_FIELDS)
    r = recs[0]
    sc.validate_record(r)
    assert r["bulletin_id"] is None and r["publication_time"] is None and r["danger_ratings"] == [] and r["max_level"] is None


# ---------- AT-5: GeoJSON-Schema ----------

def test_full_geojson_has_identical_properties_and_structure_for_all_providers():
    docs = [sc.to_geojson(euregio_records(), "euregio"), sc.to_geojson(slf_records(), "slf")]
    key_sets, geometry_types = set(), set()
    for d in docs:
        assert d["type"] == "FeatureCollection" and d["schema"] == sc.SCHEMA and d["features"]
        for f in d["features"]:
            sc.validate_feature(f)
            key_sets.add(tuple(f["properties"]))
            geometry_types.add(f["geometry"]["type"])
            assert "geometry" not in f["properties"]
    assert len(key_sets) == 1 and key_sets == {sc.PROPERTY_FIELDS} and geometry_types == {"MultiPolygon"}
    json.dumps(docs)                                                           # serialisierbar, keine Sonderobjekte


def test_browser_geojson_files_have_identical_properties_for_all_providers():
    eu = run_source(tf.EUREGIO, tf.euregio_table([tm.euregio_bulletin()]))[1]
    ch = run_source(tf.SLF, tf.slf_table([tm.slf_bulletin()]))[1]
    for doc in (eu, ch):
        assert doc["schema"] == sc.SCHEMA and doc["geometry_license"] == "CC0 1.0"
        for f in doc["features"]:
            sc.validate_feature(f, sc.GEOMETRY_PROPERTIES)
            assert tuple(f["properties"]) == tuple(sc.GEOMETRY_PROPERTIES)
            assert isinstance(f["properties"]["region_name"], str) and f["properties"]["source"] == doc["source"]
    assert eu["features"][0]["properties"]["region_name"] == "Name AT-07-01"


def expect_schema_error(rec, fragment=None):
    try:
        sc.validate_record(rec)
    except sc.SchemaError as e:
        assert fragment is None or fragment in str(e), str(e)
        return
    raise AssertionError("Verstoß gegen das Schema wurde nicht erkannt: %s" % fragment)


def test_validator_rejects_deviations():
    good = slf_records()[0]
    for field in sc.RECORD_FIELDS:
        bad = {k: v for k, v in good.items() if k != field}
        expect_schema_error(bad, "fehlende Felder")
    expect_schema_error(dict(good, source_extra=1), "unbekannte Felder")
    expect_schema_error(dict(good, max_level="3"), "max_level")
    expect_schema_error(dict(good, max_level=True), "bool")
    expect_schema_error(dict(good, max_level=6), "max_level")
    expect_schema_error(dict(good, unscheduled=1), "unscheduled")
    expect_schema_error(dict(good, aspects=["Nord"]), "aspects")
    expect_schema_error(dict(good, publication_time=None), "Zeitangaben")
    expect_schema_error(dict(good, danger_ratings=[]), "ohne Gefahrenstufen")
    expect_schema_error(dict(good, geometry={"type": "Polygon", "coordinates": []}), "MultiPolygon")
    bad = copy.deepcopy(good)
    bad["danger_ratings"][0]["period"] = "morgens"
    expect_schema_error(bad, "Tageszeit")
    bad = copy.deepcopy(good)
    bad["danger_ratings"][0]["elevation"] = {"lower_bound": "2000"}
    expect_schema_error(bad, "Höhengrenze")
    bad = copy.deepcopy(good)
    bad["avalanche_problems"][0]["comment"] = [{"type": "html", "text": "<b>x</b>"}]
    expect_schema_error(bad, "Textblock")
    bad = copy.deepcopy(good)
    bad["bulletin_text"]["sections"][0]["key"] = "wetter"
    expect_schema_error(bad, "Textabschnitt")
    try:
        sc.validate_feature({"type": "Feature", "properties": {"region_id": "x"}, "geometry": good["geometry"]})
    except sc.SchemaError:
        pass
    else:
        raise AssertionError("Feature mit fehlenden Properties muss abgelehnt werden")


# ---------- AT-4: neuer Provider mit einer Klasse ----------

class FranceLikeProvider(p.AvalancheProvider):
    """Test-Provider für eine Quelle ohne CAAML: eine Klasse, nur Metadaten, parse_bulletins und fetch_bulletins."""

    id = "fr-test"
    name = "Testdienst Frankreich"
    provider = "Testanbieter"
    countries = ["FR"]
    attribution = "Testanbieter (Test)"
    attribution_url = "https://example.test/"
    license = "Etalab 2.0"
    license_url = "https://example.test/licence"
    report_url = "https://example.test/bra"
    report_url_fallback = "https://example.test/bra"
    bulletin_url = "https://example.test/bra.json"
    region_codes = ("FR",)
    geometry_codes = ("FR",)
    empty_ok = True

    def parse_bulletins(self, raw):
        items = []
        for massif in raw["massifs"]:
            ratings = [m.danger_rating({"mainValue": massif["risque"], "elevation": massif.get("altitude")})]
            problems = [m.avalanche_problem({"problemType": "wind_slab", "aspects": massif["expo"], "dangerRatingValue": massif["risque"]})]
            bulletin = m.make_bulletin(self.id, "bra-" + massif["code"], raw["date"], raw["date"], raw["fin"], ratings, problems,
                                       text={"summary": massif["resume"]}, danger_patterns=["DP6"])
            items.append({"bulletin": bulletin, "regions": [{"id": massif["code"], "name": massif["nom"]}],
                          "date": raw["date"][:10]})
        return items, 0


def france_table():
    raw = {"date": "2026-01-14T16:00:00Z", "fin": "2026-01-15T16:00:00Z", "massifs": [
        {"code": "FR-01", "nom": "Chablais", "risque": "considerable", "expo": ["N", "NE"], "resume": "Plaques à vent."},
        {"code": "FR-02", "nom": "Aravis", "risque": "moderate", "expo": ["S"], "resume": "Calme."}]}
    sq = tf.square
    return {FranceLikeProvider.bulletin_url: raw,
            fa.REGIONS_URL.format(code="FR"): {"features": [sq("FR-01", 6.0), sq("FR-02", 6.5), sq("FR-03", 7.0)]}}


def test_new_provider_runs_through_central_pipeline_without_other_changes():
    provider = FranceLikeProvider()
    provider.validate()
    bdoc, gdoc = run_source(provider, france_table())
    assert bdoc["source"]["id"] == "fr-test" and bdoc["status"] == "active" and len(bdoc["bulletins"]) == 2
    assert bdoc["regions"]["FR-01"] == {"name": "Chablais", "country": "FR", "bulletin": 0}
    assert bdoc["regions"]["FR-03"]["bulletin"] is None                         # Polygon ohne Bericht bleibt sichtbar
    assert bdoc["bulletins"][0]["max_level"] == 3 and bdoc["bulletins"][0]["elevation_thresholds"] == []
    tmp = tf.setup(france_table())
    fa.fetch_source(provider, NOW)
    recs = records_of_files(provider.id)
    tmp.cleanup()
    assert [r["region_id"] for r in recs] == ["FR-01", "FR-02", "FR-03"]
    for r in recs:
        sc.validate_record(r)
    assert recs[0]["aspects"] == ["N", "NE"] and recs[0]["danger_patterns"] == ["DP6"]
    # identische Felder wie die beiden produktiven Provider
    assert list(recs[0]) == list(euregio_records()[0]) == list(slf_records()[0])


def records_of_files(source_id):
    bdoc, gdoc = tf.load(source_id + ".json"), tf.load(source_id + "_regions.geojson")
    return sc.build_region_records(source_id, bdoc["bulletins"], bdoc["regions"], [
        {"properties": f["properties"], "geometry": f["geometry"]} for f in gdoc["features"]])


def test_pipeline_rejects_provider_output_that_violates_the_schema():
    class Broken(FranceLikeProvider):
        def parse_bulletins(self, raw):
            items, n = super().parse_bulletins(raw)
            items[0]["bulletin"]["danger_ratings"][0]["period"] = "mittags"        # kein gültiger Wert
            return items, n

    tmp = tf.setup(france_table())
    try:
        fa.fetch_source(Broken(), NOW)
    except sc.SchemaError:
        assert not os.path.exists(os.path.join(fa.DATA_DIR, "fr-test.json"))        # nichts geschrieben
        tmp.cleanup()
        return
    raise AssertionError("Schemaverstoß eines Providers muss die Quelle abbrechen")


def test_provider_contract_enforced():
    class Empty(p.AvalancheProvider):
        id = "x"
    try:
        Empty().validate()
    except ValueError:
        pass
    else:
        raise AssertionError("Provider ohne Metadaten ist ungültig")
    try:
        p.AvalancheProvider.parse_bulletins(FranceLikeProvider(), {})
    except NotImplementedError:
        pass
    else:
        raise AssertionError("parse_bulletins ist Pflicht")
    bad = FranceLikeProvider()
    bad.license = ""
    try:
        bad.validate()
    except ValueError:
        return
    raise AssertionError("Lizenz ist Pflicht")


def test_make_bulletin_derives_same_fields_as_caaml_normalization():
    a = m.normalize_bulletin(tm.slf_bulletin(), "slf")
    b = m.make_bulletin("slf", a["id"], a["publication_time"], a["validity_period"]["start"], a["validity_period"]["end"],
                        a["danger_ratings"], a["avalanche_problems"], next_update=a["next_update"],
                        problem_groups=a["problem_groups"], text=a["text"])
    assert a == b and list(a) == list(b)


def test_registered_providers_are_independent_classes_of_the_base():
    assert all(isinstance(x, p.AvalancheProvider) for x in s.PROVIDERS)
    assert type(s.get_provider("euregio")).__name__ == "AlbinaProvider" and type(s.get_provider("slf")).__name__ == "SLFProvider"


if __name__ == "__main__":
    tests = [(n, f) for n, f in sorted(globals().items()) if n.startswith("test_") and callable(f)]
    for name, fn in tests:
        fn()
        print("ok", name)
    print("%d Tests bestanden" % len(tests))
