"""Registry der Lawinenwarndienste. Eine neue Quelle (Land) ist ein Eintrag hier, ohne Änderung an Pipeline oder Frontend.

Voraussetzung: Die Quelle liefert CAAML v6 (EAWS-Schema) mit regionID nach EAWS-Schema und die Polygone liegen in
https://gitlab.com/eaws/eaws-regions. Quellen mit anderem Format brauchen zusätzlich einen Normalisierer in
avalanche_model.py. Hinweise zu weiteren Ländern: docs/LAWINENLAGE_ANALYSE.md.
"""

SOURCES = [
    {
        "id": "euregio",
        "name": "Euregio-Lawinenreport",
        "provider": "Lawinenwarndienste Tirol, Südtirol und Trentino (ALBINA)",
        "countries": ["AT", "IT"],
        "attribution": "Lawinenwarndienste Tirol, Südtirol und Trentino (Euregio-Lawinenreport, avalanche.report)",
        "attribution_url": "https://lawinen.report/more/open-data",
        "license": "CC BY 4.0",
        "license_url": "https://creativecommons.org/licenses/by/4.0/",
        # {main_date}: Hauptdatum des Bulletins (customData.ALBINA.mainDate)
        "report_url": "https://lawinen.report/{main_date}",
        "report_url_fallback": "https://lawinen.report/",
        "bulletin_url": "https://static.avalanche.report/bulletins/latest/EUREGIO_de_CAAMLv6.json",
        "region_codes": ("AT-07", "IT-32-BZ", "IT-32-TN"),
        "geometry_codes": ("AT-07", "IT-32-BZ", "IT-32-TN"),
        "names_url": None,
        # "latest" bleibt außerhalb der Saison auf dem letzten Bericht stehen, ein leeres Bulletin ist ein Fehler
        "empty_ok": False,
    },
    {
        "id": "slf",
        "name": "SLF Lawinenbulletin Schweiz",
        "provider": "WSL-Institut für Schnee- und Lawinenforschung SLF",
        "countries": ["CH"],
        "attribution": "WSL-Institut für Schnee- und Lawinenforschung SLF",
        "attribution_url": "https://www.slf.ch",
        "license": "CC BY 4.0",
        "license_url": "https://creativecommons.org/licenses/by/4.0/",
        "report_url": "https://www.slf.ch/de/lawinenbulletin-und-schneesituation/",
        "report_url_fallback": "https://www.slf.ch/de/lawinenbulletin-und-schneesituation/",
        # V4 des SLF-Dienstes: CAAML-konforme Höhen (Text statt Zahl), leere Werte entfernt
        "bulletin_url": "https://aws.slf.ch/api/bulletin/caaml/v4/de/json",
        "region_codes": ("CH",),
        "geometry_codes": ("CH",),
        "names_url": "https://aws.slf.ch/api/warningregion/warnregionDefinition/current",
        # ohne aktives Bulletin (Sommer, Herbst) liefert der Dienst {"bulletins": []}
        "empty_ok": True,
    },
]

REGIONS_URL = "https://gitlab.com/eaws/eaws-regions/-/raw/master/public/micro-regions/{code}_micro-regions.geojson.json"


def in_scope(source, region_id):
    return any(region_id == c or region_id.startswith(c + "-") for c in source["region_codes"])


def slf_names(doc):
    """Namen der Warnregionen (deutsch) aus warnregionDefinition/current: {"CH-1111": "Waadtländer Voralpen"}."""
    names = {}
    for s in doc.get("sectors") or []:
        name = (s.get("sector_names") or {}).get("de") or s.get("sector_name")
        if s.get("sector_id") and name:
            names["CH-%s" % s["sector_id"]] = name
    return names


NAME_PARSERS = {"slf": slf_names}