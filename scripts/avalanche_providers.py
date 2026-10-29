"""Provider der Lawinenwarndienste. Ein Land (eine Quelle) ist eine Klasse, abgeleitet von AvalancheProvider.

Ein Provider kennt nur seine Quelle: wo die Daten liegen, wie sie in das gemeinsame Modell (avalanche_model.py) übersetzt
werden und wie seine Regionen heißen. Alles Übrige macht die gemeinsame Pipeline (fetch_avalanche.py): Geometrie,
Regionenindex, Standardschema und Prüfung, Schreiben der Dateien, Index fürs Frontend. Das Frontend kennt keinen Provider.

Vertrag (Pflicht: Metadaten und parse_bulletins; alles andere hat eine Standardimplementierung):

  Metadaten    id, name, provider, countries, attribution, attribution_url, license, license_url, report_url,
               report_url_fallback, bulletin_url, region_codes, geometry_codes, empty_ok
  fetch_bulletins(get_json, url=None) -> rohes Dokument der Quelle              (Standard: GET bulletin_url; CAAML: Format geprüft)
  parse_bulletins(raw)                -> (items, skipped)                       (Pflicht; Form der Items: avalanche_model.parse_caaml)
  fetch_names(get_json)               -> {region_id: Name}                      (Standard: leer)
  fetch_geometries(get_json, regions_url) -> Polygon-Features (EAWS-Format)     (Standard: eaws-regions je geometry_code)
  in_scope(region_id)                 -> gehört die Region zur Quelle?          (Standard: Präfix aus region_codes)

get_json ist die Abruffunktion der Pipeline (Wiederholungen, Fehlerbehandlung, Schonung der Dienste); ein Provider ruft
das Netz nie selbst. Neue Länder: docs/AVALANCHE_ARCHITECTURE.md, Abschnitt "Neuen Provider anlegen".
"""
import avalanche_model as m

# Polygone aller Länder: https://gitlab.com/eaws/eaws-regions (CC0 1.0)
REGIONS_URL = "https://gitlab.com/eaws/eaws-regions/-/raw/master/public/micro-regions/{code}_micro-regions.geojson.json"
GEOMETRY_SOURCE = "https://gitlab.com/eaws/eaws-regions"
GEOMETRY_LICENSE = "CC0 1.0"

META_KEYS = ("id", "name", "provider", "countries", "attribution", "attribution_url", "license", "license_url",
             "report_url", "report_url_fallback", "bulletin_url")
_REQUIRED = META_KEYS + ("region_codes", "geometry_codes")


class AvalancheProvider:
    """Basisklasse. Eine Instanz je Quelle; Unterklassen setzen die Metadaten und implementieren parse_bulletins."""

    id = name = provider = attribution = attribution_url = license = license_url = None
    report_url = report_url_fallback = bulletin_url = None
    countries = ()
    region_codes = ()      # EAWS-Präfixe der Regionen dieser Quelle, z. B. ("AT-07", "IT-32-BZ")
    geometry_codes = ()    # Dateien in eaws-regions, aus denen die Polygone kommen, z. B. ("AT-07", "CH")
    empty_ok = False       # True: ein Bulletin ohne Regionen ist die Saisonpause, False: ein Fehler
    notes = ()             # optional: Hinweise zur Quelle für die Legende, [{"text", "url"?, "url_label"?}]

    def meta(self):
        """Metadaten der Quelle für <id>.json und das Frontend (Namensnennung, Lizenz, Link auf den Lagebericht)."""
        out = {k: getattr(self, k) for k in META_KEYS}
        if self.notes:
            out["notes"] = [dict(n) for n in self.notes]
        return out

    def validate(self):
        """Prüft, dass alle Pflichtangaben gesetzt sind (Namensnennung und Lizenz sind Pflicht, nicht optional)."""
        for k in _REQUIRED:
            if not getattr(self, k):
                raise ValueError("Provider %s: Angabe %s fehlt" % (self.id, k))
        if not all(isinstance(c, str) and len(c) == 2 for c in self.countries):
            raise ValueError("Provider %s: countries sind zweistellige Ländercodes" % self.id)
        if not self.report_url_fallback.startswith("https://") or not self.attribution_url.startswith("https://"):
            raise ValueError("Provider %s: Links müssen https sein" % self.id)
        for n in self.notes:
            if not n.get("text") or (n.get("url") and not n["url"].startswith("https://")):
                raise ValueError("Provider %s: Hinweis ohne Text oder mit Link ohne https" % self.id)

    def in_scope(self, region_id):
        return any(region_id == c or region_id.startswith(c + "-") for c in self.region_codes)

    def fetch_bulletins(self, get_json, url=None):
        return get_json(url or self.bulletin_url)

    def parse_bulletins(self, raw):
        raise NotImplementedError("%s muss parse_bulletins implementieren" % type(self).__name__)

    def fetch_names(self, get_json):
        return {}

    def fetch_geometries(self, get_json, regions_url=REGIONS_URL):
        features = []
        for code in self.geometry_codes:
            features.extend(get_json(regions_url.format(code=code))["features"])
        return features


class CaamlV6Provider(AvalancheProvider):
    """Dienste, die CAAML v6 (EAWS-Schema) mit EAWS-Regionskennungen liefern: nur Metadaten nötig."""

    def fetch_bulletins(self, get_json, url=None):
        doc = super().fetch_bulletins(get_json, url)
        if not isinstance(doc, dict) or not isinstance(doc.get("bulletins"), list):
            raise RuntimeError("Unerwartetes Format von %s" % (url or self.bulletin_url))
        return doc

    def parse_bulletins(self, raw):
        return m.parse_caaml(raw, self.id, self.in_scope)


class AlbinaProvider(CaamlV6Provider):
    """Euregio-Lawinenreport (ALBINA): Tirol, Südtirol, Trentino."""

    id = "euregio"
    name = "Euregio-Lawinenreport"
    provider = "Lawinenwarndienste Tirol, Südtirol und Trentino (ALBINA)"
    countries = ["AT", "IT"]
    attribution = "Lawinenwarndienste Tirol, Südtirol und Trentino (Euregio-Lawinenreport, avalanche.report)"
    attribution_url = "https://lawinen.report/more/open-data"
    license = "CC BY 4.0"
    license_url = "https://creativecommons.org/licenses/by/4.0/"
    # {main_date}: Hauptdatum des Bulletins (customData.ALBINA.mainDate)
    report_url = "https://lawinen.report/{main_date}"
    report_url_fallback = "https://lawinen.report/"
    bulletin_url = "https://static.avalanche.report/bulletins/latest/EUREGIO_de_CAAMLv6.json"
    region_codes = ("AT-07", "IT-32-BZ", "IT-32-TN")
    geometry_codes = ("AT-07", "IT-32-BZ", "IT-32-TN")
    # "latest" bleibt außerhalb der Saison auf dem letzten Bericht stehen, ein leeres Bulletin ist ein Fehler
    empty_ok = False


class SLFProvider(CaamlV6Provider):
    """SLF Lawinenbulletin Schweiz. Die Warnregion-API liefert die Namen der Regionen ohne Bericht."""

    id = "slf"
    name = "SLF Lawinenbulletin Schweiz"
    provider = "WSL-Institut für Schnee- und Lawinenforschung SLF"
    countries = ["CH"]
    attribution = "WSL-Institut für Schnee- und Lawinenforschung SLF"
    attribution_url = "https://www.slf.ch"
    license = "CC BY 4.0"
    license_url = "https://creativecommons.org/licenses/by/4.0/"
    report_url = "https://www.slf.ch/de/lawinenbulletin-und-schneesituation/"
    report_url_fallback = "https://www.slf.ch/de/lawinenbulletin-und-schneesituation/"
    # V4 des SLF-Dienstes: CAAML-konforme Höhen (Text statt Zahl), leere Werte entfernt
    bulletin_url = "https://aws.slf.ch/api/bulletin/caaml/v4/de/json"
    region_codes = ("CH",)
    geometry_codes = ("CH",)
    names_url = "https://aws.slf.ch/api/warningregion/warnregionDefinition/current"
    # ohne aktives Bulletin (Sommer, Herbst) liefert der Dienst {"bulletins": []}
    empty_ok = True
    notes = (
        {"text": "Schweiz: Teilstufen - (unteres Ende), = (Mitte), + (oberes Ende) der Stufe, bei Trockenschneelawinen ab Stufe 2",
         "url": "https://www.slf.ch/en/avalanche-bulletin-and-snow-situation/about-the-avalanche-bulletin/danger-levels/",
         "url_label": "SLF"},
    )

    def fetch_names(self, get_json):
        return self.parse_names(get_json(self.names_url))

    @staticmethod
    def parse_names(doc):
        """Namen der Warnregionen (deutsch) aus warnregionDefinition/current: {"CH-1111": "Waadtländer Voralpen"}."""
        names = {}
        for s in doc.get("sectors") or []:
            name = (s.get("sector_names") or {}).get("de") or s.get("sector_name")
            if s.get("sector_id") and name:
                names["CH-%s" % s["sector_id"]] = name
        return names
