# Mountain Radar

ALPINE RISK INTELLIGENCE

Know before you go.

Mountain Radar ist der öffentliche Produktname des Projekts. Der interne Repository-Name lautet derzeit weiterhin "Bergbedingungen".

## Projektvision

Mountain Radar soll Bergsportlern eine klare, verständliche Lagebild-Übersicht für den Alpenraum liefern: Wetter, Schutzgebiete, Sperrungen, Risiken und relevante Hinweise an einem Ort.

Die Vision ist ein digitaler Tourenassistent, der vor einer Tour sofort beantwortet:

> "Wenn ich diese Tour morgen gehe, worauf muss ich achten?"

Ziel ist es, Entscheidungshilfe zu bieten, ohne dass Nutzer mehrere Websites, Karten oder Informationsquellen manuell zusammenführen müssen. Die Plattform soll dabei besonders für alpine Touren, Wanderungen und Bergaktivitäten im Alltag und im Vorfeld einer Tour relevant sein.

## Features

**Aktuell implementiert:**

- Karte mit relevanten Inhalten für alpine Regionen
- Anzeige von Sperrungen und Hinweisen aus aktuellen Daten
- Schutzgebietskarten mit Kategorien, Regeln und Wildlife-Informationen
- Layer-basierte Darstellung für schnellere Orientierung auf der Karte
- Bedienfeld „Karten & Layer” für Kartenstil, Ebenen und Legenden, per Klick bedienbar (auch auf Touchgeräten)
- Lawinenlage für Euregio (Tirol, Südtirol, Trentino) und Schweiz als gemeinsamer Layer: Warnregionen nach Gefahrenstufe, ein Symbol je Region, vollständiger Lagebericht mit Höhenangaben im Popup (aktuelle Berichte ab Saisonstart der Lawinenwarndienste)

**Geplant (Roadmap Phase 1-2):**

- Website Toolbox: Koordinaten anzeigen, Höhe anzeigen, Entfernungsmessungen, Höhenprofil
- GPX-Upload und Tourenanalyse
- Wetterrisiko-Integration (GeoSphere)
- Geländeanalyse-Engine (Hangneigung, Exposition, Absturzrisiko)

**Zukünftig (Roadmap Phase 3-5):**

- Alpine Risk Engine (Risikobewertung basierend auf 14 Faktoren)
- Unfallanalyse und Unfall-Hotspot-Visualisierung
- Mobile App mit Toolbox (Kompass, Hangneigungsmesser, Standort-Sensoren)
- Internationale Expansion (Frankreich, Italien, Slowenien)
- Community-Features (Echtzeit-Meldungen)

## Screenshots

Derzeit noch kein Final-Design. Der Platz für Screenshots ist hier reserviert:

```text
[ Screenshot 1: Kartenansicht mit Sperrungen und Wetter ]
[ Screenshot 2: Schutzgebiete mit Popup-Informationen ]
[ Screenshot 3: Filter- und Lageansicht auf der Karte ]
```

## Roadmap und Dokumentation

Mountain Radar entwickelt sich schrittweise zu einer **Alpine Risk Intelligence Plattform**. Die langfristige Produkt- und Entwicklungsplanung, einschließlich der Kernmodule und technischen Phasen, findet sich in [docs/ROADMAP.md](docs/ROADMAP.md).

**Roadmap-Übersicht (Alpine Risk Intelligence):**

Die Entwicklung erfolgt in **5 technischen Phasen** (bis Q1 2028+):

1. **Phase 1 — Grundlagen** (Q4 2026 - Q1 2027): DEM, OSM, Kartografie, Website Toolbox
2. **Phase 2 — Wetterintegration** (Q1 - Q2 2027): GeoSphere, ALBINA/SLF Lawinenlage, Wetterwarnungen
3. **Phase 3 — Gefahrenmodellierung** (Q2 - Q3 2027): Unfallanalyse, Alpine Risk Engine (Beta)
4. **Phase 4 — Mobile App & Internationale Expansion** (Q4 2027 - Q1 2028): Mobile Toolbox, Météo-France, AINEVA, ARSO
5. **Phase 5 — Production & Optimierung** (Q1 2028+): Alpine Risk Engine (GA), Community-Features

**Kernmodule:**
- Geländeanalyse
- GPX Analyse
- Infrastruktur
- Wetterrisiko
- Lawinenlage
- Unfallanalyse
- Schutzgebiete & Wildlife
- Alpine Risk Engine
- **Mountain Radar Toolbox** (Website + Mobile)

Die Kernfrage für den Nutzer:
> "Wenn ich diese Tour morgen gehe, worauf muss ich achten?"

## Dokumentationsübersicht

Die Dokumentation des Projekts liegt im Ordner [docs/](docs/):

### Hauptdokumentation (Source of Truth)

- **[docs/ROADMAP.md](docs/ROADMAP.md)** — Alpine Risk Intelligence Roadmap mit 5 Phasen, 9 Kernmodulen, Mountain Radar Toolbox (Website + Mobile), Abhängigkeiten und Akzeptanzkriterien
- **[docs/DATENQUELLEN.md](docs/DATENQUELLEN.md)** — Vollständiger Katalog aller Datenquellen (20+) mit URLs, Lizenzen, Prioritäten, Roadmap-Phasen, lokalen Dateien und Skripten
- **[docs/WORKFLOW.md](docs/WORKFLOW.md)** — Arbeitsabläufe, Definition of Done, Dokumentations-Prozesse

### Fachliche Analysen

- **[docs/LAWINENLAGE_ANALYSE.md](docs/LAWINENLAGE_ANALYSE.md)** — Lawinenlage Euregio und Schweiz: Quellen, API-Endpunkte, Höhenanalyse, gemeinsames Datenmodell, Empfehlungen für weitere Länder
- **[docs/WILDLIFE_ANALYSE.md](docs/WILDLIFE_ANALYSE.md)** — Wildlife-Daten: Tiernamen-Auflösung, Datenquellen, Lösungswege
- **[docs/RECHERCHE_LAWINEN.md](docs/RECHERCHE_LAWINEN.md)** — Recherche zu Lawinen- und Risikodaten

### Richtlinien

- **[docs/STYLEGUIDE.md](docs/STYLEGUIDE.md)** — Visuelle und inhaltliche Richtlinien

## Produktüberblick

Mountain Radar kombiniert eine interaktive Kartenoberfläche mit relevanten Berg- und Sicherheitsinformationen. Die Anwendung nutzt OpenStreetMap-, OpenTopoMap- und Leaflet-Technologien und verarbeitet strukturierte Geodaten für die Karte.

### Kernbereiche

- **Karte:** OpenStreetMap und OpenTopoMap, dargestellt mit Leaflet (im Ordner `vendor/leaflet`)
- **Sperrungen und Hinweise:** Daten von [Digitize the Planet e.V.](https://platform.digitizetheplanet.org/en/api/docs/) (Lizenz CC0)
- **Wetter:** [Open-Meteo](https://open-meteo.com/), ohne Schlüssel
- **Schutzgebiete:** regionale Informationen aus GeoJSON- und API-Daten mit Wildlife- und Regeltexten
- **Lawinenlage:** Lawinenreport der Euregio ([avalanche.report](https://lawinen.report/more/open-data), CC BY 4.0) und Lawinenbulletin des [WSL-Instituts für Schnee- und Lawinenforschung SLF](https://www.slf.ch) (CC BY 4.0), Polygone aus [EAWS Regions](https://gitlab.com/eaws/eaws-regions) (CC0)

## So kommen die Daten auf die Seite

Der Browser darf die Digitize API nicht direkt abfragen. Deshalb holt die GitHub Action
`Sperrungen aktualisieren` (`.github/workflows/update-data.yml`) alle drei Stunden die Daten
und speichert sie in `data/closures.json`. Die Seite liest nur diese Datei.

Sofort aktualisieren: Reiter **Actions** → **Sperrungen aktualisieren** → **Run workflow**.

## Projektstruktur

| Datei / Ordner | Inhalt |
| --- | --- |
| `index.html`, `style.css` | Einstieg und Styling der Oberfläche |
| `js/` | Frontend-Programmcode der Map-Anwendung |
| `scripts/fetch_closures.py` | Abruf von Sperrungen und Hinweisen |
| `data/closures.json` | aktuelle Sperrungen und Hinweise |
| `scripts/fetch_protected_areas.py`, `scripts/fetch_protected_area_details_v2.py`, `scripts/fetch_wildlife.py`, `scripts/build_geojson.py` | Schutzgebiets-Pipeline |
| `data/protected_areas_alps.geojson` | kompaktes GeoJSON für Schutzgebiete auf der Karte |
| `data/wildlife_entities.json` | aufgelöste Namen der Schutzgüter (Kennung → Name), nur aus der Digitize API |
| `data/wildlife_probe.json` | Diagnosebericht der Wildlife-Auflösung (was die API geliefert hat, was fehlt) |
| `scripts/avalanche_sources.py`, `scripts/avalanche_model.py`, `scripts/fetch_avalanche.py` | Lawinenlage-Pipeline: Registry der Quellen, gemeinsames Datenmodell, Abruf |
| `scripts/test_avalanche_model.py`, `scripts/test_fetch_avalanche.py`, `scripts/test_avalanche_logic.html`, `scripts/run_js_tests.py` | Tests der Lawinenlage (Python und JavaScript im Headless-Browser) |
| `data/avalanche/` | Lawinenlage: `index.json`, je Quelle `<id>.json` (Bulletins) und `<id>_regions.geojson` (Polygone) für `euregio` und `slf` |
| `vendor/albina/` | offizielle ALBINA-Symbole (Gefahrenstufen, Lawinenprobleme), Herkunft in `vendor/albina/README.md` |

## Aufbau des Programmcodes (`js/`)

Die Seite lädt `js/app.js` als ES-Modul (`<script type="module">`). Leaflet wird davor klassisch
geladen und steht als globales `L` zur Verfügung.

| Datei | Zuständig für |
| --- | --- |
| `js/app.js` | Einstieg: Ereignisse verbinden (Kartenbewegung, Klick, Suche, Filter, Wetterknöpfe) und das Laden starten (Wetter, Schutzgebiete, Sperrungen) |
| `js/map.js` | Leaflet-Karte, Kachelebenen (OpenStreetMap, OpenTopoMap), Ebenengruppen, Warnhinweise sowie gemeinsame Hilfen (`el`, `esc`, `setStatus`) |
| `js/closures.js` | Sperrungen und Hinweise: `data/closures.json` laden, filtern, auf der Karte und in der Liste darstellen, Popups, Sprung zu einem Eintrag |
| `js/weather.js` | Wetterwidget mit Open-Meteo und Standortmarker |
| `js/protected_areas.js` | Schutzgebiete aus `data/protected_areas_alps.geojson` als Ebene |
| `js/protected_areas_legend.js` | Legende der Schutzgebiete (Abschnitt im Bedienfeld „Karten & Layer“): Farben der Kategorien, die in den Daten vorkommen |
| `js/layers.js` | Register des Bedienfelds „Karten & Layer“: meldet Kartenstile, Ebenen und Legenden an (neue Ebene: eine Zeile `panel.addOverlay(...)`) |
| `js/layer_panel.js` | Bedienfeld „Karten & Layer“ (Kartenelement oben rechts): Layer, Kartenstil und einklappbare Legenden, alles per Klick, ohne Fachlogik |
| `js/closures_legend.js` | Legende der Sperrungen und Hinweise (Abschnitt im Bedienfeld) |
| `js/avalanche.js` | Lawinenlage aller Quellen: Polygone nach Gefahrenstufe einfärben (Stufe 5 als Schachbrett), Regionssymbol mit Stufe, Popup mit Lagebericht, Höhenwahl; lädt erst beim ersten Einblenden |
| `js/avalanche_legend.js` | Legende der Lawinenlage mit Berichtsstatus je Quelle, Stufenfarben, Höhenwahl und Namensnennung (Abschnitt im Bedienfeld „Karten & Layer“) |
| `js/avalanche_logic.js` | reine Logik ohne DOM und Leaflet auf dem gemeinsamen Datenmodell: Gefahrenstufe je Höhe, Teilstufen, Gültigkeit, Gruppierung, deutsche Bezeichnungen (getestet mit `scripts/run_js_tests.py`) |

Abhängigkeiten: `app.js` → alle anderen; `closures.js` → `map.js`, `weather.js`; `weather.js` und
`protected_areas.js` → `map.js`; `avalanche.js` → `map.js`, `avalanche_legend.js`, `avalanche_logic.js`;
`avalanche_legend.js` → `map.js`, `layers.js`, `avalanche_logic.js`; `layers.js` → `map.js`, `layer_panel.js`; die Legendenmodule `protected_areas_legend.js` und `closures_legend.js` → `layers.js`. `map.js`, `layer_panel.js` und `avalanche_logic.js` hängen von keiner
anderen Datei ab.

Hinweis: Wegen der Module muss die Seite über einen Webserver (zum Beispiel GitHub Pages) geöffnet
werden, nicht per Doppelklick als lokale Datei. Das galt für Karte und Daten schon vorher.

## Schutzgebiete: Datenpipeline, Wildlife und Regeln

Die Popups der Schutzgebiete zeigen Kategorie, Beschreibung, **Wildlife** und **Regeln**.

```
fetch_protected_areas.py            Liste aller Schutzgebiete -> data/protected_areas.json
fetch_protected_area_details_v2.py  Details je Gebiet (fields=all, mit "wildlife" und "rules")
                                    -> data/protected_areas_alps.json (nicht im Repo, groß)
fetch_wildlife.py                   Wildlife-Namen aus der API -> data/wildlife_entities.json, data/wildlife_probe.json
build_geojson.py                    alles zusammenführen -> data/protected_areas_alps.geojson
```

**Woher kommen die Tiernamen?** Ein Schutzgebiet verweist bei `wildlife` nur auf Verknüpfungseinträge
(`id`, `protected_area_uuid`, `protected_entity_id`), auch `GET /api/v2/wildlife` liefert in der
Grundeinstellung nur diese Verknüpfungen, keine Namen. `fetch_wildlife.py` sucht die Namen deshalb
ausschließlich in offiziellen DTP-Quellen: `GET /wildlife?fields=all`, danach Endpunkte für Schutzgüter,
die das offizielle OpenAPI-Schema (`/schema/`) deklariert, danach `GET /protected-areas/{uuid}/wildlife`.
`build_geojson.py` löst `protected_entity_id` damit auf. Es gibt keine eigenen Zuordnungstabellen, und
was die API nicht liefert, wird nicht angezeigt (das Wildlife-Feld im Popup bleibt dann weg). Ob und wie
weit die Auflösung gelingt, steht im Protokoll des Workflows und in `data/wildlife_probe.json`.
Ausführliche Analyse, offene Punkte und Lösungswege: [docs/WILDLIFE_ANALYSE.md](docs/WILDLIFE_ANALYSE.md).

**Regeln** werden mit dem ausgeschriebenen Text der API übernommen (`text_de`, sonst `text`, sonst
`text_en`), wichtige Regeln (`is_important`) zuerst, ohne Doppelte, höchstens 8 je Gebiet,
saisonale Regeln mit Zeitraum (z. B. „01.12.–30.04.\"). Regeln ohne Text werden ausgelassen, weil sich
aus Aktivität und Bedingungen allein nicht sicher ableiten lässt, ob etwas erlaubt oder verboten ist.

**Kompakte Datei:** Namen und Regeltexte stehen einmal in Tabellen am Ende der GeoJSON-Datei
(`wildlife_names`, `rule_texts`), die Gebiete verweisen per Index darauf (`properties.w`,
`properties.r`). Interne IDs gelangen nicht in die Datei. Das Frontend (`js/protected_areas.js`)
zeigt die Einträge maskiert im Popup an; bei Gebieten ohne Angaben bleibt das Popup wie bisher.

**Daten erzeugen:** Reiter **Actions** → **Schutzgebiete aktualisieren** → **Run workflow**
(`.github/workflows/update-protected-areas.yml`, dauert länger, weil jedes Gebiet einzeln abgefragt
wird). Das Ergebnis wird als Commit gespeichert. Lokal: die Skripte in der oben stehenden
Reihenfolge ausführen. Tests: `python3 scripts/test_build_geojson.py` und `python3 scripts/test_fetch_wildlife.py`.

## Lawinenlage (Euregio und Schweiz)

Die Ebene **Lawinenlage** (Bedienfeld „Karten & Layer“ oben rechts, standardmäßig aus; die Legende steht im selben Bedienfeld) zeigt die Warnregionen von Tirol, Südtirol und Trentino (90) und der Schweiz (149) in den offiziellen Farben der Gefahrenskala (Stufe 5 als rot-schwarzes Schachbrett). Jede Region hat ein anklickbares Symbol mit Stufe (Schweiz mit Teilstufe, z. B. 3+) ab Zoomstufe 9. Ein Klick öffnet den Lagebericht: Veröffentlichung und Gültigkeit, Zusammenfassung, Gefahrenstufen nach Höhe, Lawinenprobleme mit Höhenbereich und Expositionen, Bulletintext, Tendenz, mit den offiziellen ALBINA-Symbolen. Beispiele: [Übersicht](docs/screenshots/lawinenlage_uebersicht.jpg), [Popup Schweiz](docs/screenshots/lawinenlage_schweiz_popup.jpg), [Popup Euregio](docs/screenshots/lawinenlage_euregio_popup.jpg) (archivierte Berichte vom 15.03.2026).

```
static.avalanche.report (CAAML v6)  aws.slf.ch (CAAML v6, V4)  eaws-regions (Polygone)
  -> scripts/fetch_avalanche.py  (GitHub Action "Lawinenlage aktualisieren", 07:20 und 16:20 UTC)
  -> data/avalanche/index.json, <quelle>.json, <quelle>_regions.geojson  (ein gemeinsames Datenmodell)
  -> js/avalanche.js
```

**Ein System für mehrere Länder:** Beide Dienste liefern CAAML v6 und werden auf dasselbe Datenmodell abgebildet (Beschreibung und Felder: [docs/LAWINENLAGE_ANALYSE.md](docs/LAWINENLAGE_ANALYSE.md)). Ein neues Land ist ein Eintrag in `scripts/avalanche_sources.py`, Frontend und Workflow bleiben unverändert. Empfehlungen für Frankreich, Italien und Slowenien stehen in der Analyse, Abschnitt 9.

**Höhenabhängige Gefahrenstufen:** Eine echte Teilung der Polygone ist mit den offenen Daten nicht möglich. Die Karte färbt wie die offiziellen Karten nach der **höchsten** Stufe. Das Popup zeigt die Höhenaufteilung: bei Euregio aus den Gefahrenstufen (mit offiziellem Piktogramm), bei der Schweiz aus den Lawinenproblemen, weil der SLF seine Gefahrenstufen ohne Höhengrenze angibt. Die Legende erlaubt eine Höhenwahl, die nur bei Quellen mit Höhe in den Gefahrenstufen (Euregio) wirkt.

**Außerhalb der Saison:** Nach Ablauf eines Berichts werden die Regionen grau ohne Gefahrenstufe dargestellt, ein alter Bericht wird nie als aktuell gezeigt. Der Euregio-Bericht ist der letzte des Winters 2025/26, der SLF liefert derzeit keinen aktiven Bericht.

**Daten erzeugen:** Reiter **Actions** → **Lawinenlage aktualisieren** → **Run workflow**. Lokal: `python3 scripts/fetch_avalanche.py [euregio|slf]`. Tests: `python3 scripts/test_avalanche_model.py`, `python3 scripts/test_fetch_avalanche.py` und, mit installiertem Chrome oder Edge, `python3 scripts/run_js_tests.py`.

**Namensnennung (CC BY 4.0):** Euregio-Lawinenwarndienste und WSL-Institut für Schnee- und Lawinenforschung SLF (Link auf www.slf.ch) stehen in Legende, Popup, Kartenquellenangabe und Seitenfuß. Der Browser fragt die Dienste nie direkt ab, das SLF verlangt das für seine Schnittstellen.

**Teststand:** Pipeline und JavaScript-Logik getestet, das Frontend mit archivierten Berichten vom 15.03.2026 beider Dienste in einem Headless-Browser geprüft. Der Test mit aktuellen Berichten ist erst nach dem Saisonstart der Lawinenwarndienste möglich.
## Status

Das Projekt befindet sich in der **Entwicklung zur Alpine Risk Intelligence Plattform**:

- ✅ **Phase 1 (Grundlagen):** DEM, OSM, Kartografie teilweise umgesetzt
- 🟡 **Phase 2 (Wetterintegration):** ALBINA/SLF Lawinenlage in Umsetzung, GeoSphere geplant
- 🔬 **Phase 3+ (Gefahrenmodellierung, Mobile App, Internationale Expansion):** In Planung

Die Roadmap, Datenquellen und Entwicklungs-Workflows sind vollständig dokumentiert. Neue Arbeitspakete können direkt aus [docs/ROADMAP.md](docs/ROADMAP.md) und [docs/DATENQUELLEN.md](docs/DATENQUELLEN.md) abgeleitet werden.

Der Repository-Name ist weiterhin "Bergbedingungen", der öffentliche Produktname ist **Mountain Radar**.

## Lizenz und Hinweise

Die Anwendung und die enthaltenen Projektdateien werden gemäß den jeweiligen Datenquellen und Repository-Regeln gepflegt. Für externe Datenquellen gelten die jeweiligen Lizenz- und Nutzungsbedingungen, insbesondere bei Digitize the Planet, Open-Meteo, dem Euregio-Lawinenreport und dem SLF-Lawinenbulletin (beide CC BY 4.0, Namensnennung erforderlich).