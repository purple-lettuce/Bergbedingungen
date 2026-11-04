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

- Startseite (Landing Page, LP1/LP2) mit Produktname, Claim, Slogan, dem Link „Zur Karte“ zur Kartenanwendung (`app.html`), der Erklärung „Was ist Mountain Radar?“ und den Zielgruppen
- Karte mit relevanten Inhalten für alpine Regionen
- Anzeige von Sperrungen und Hinweisen aus aktuellen Daten
- Schutzgebietskarten mit Kategorien, Regeln und Wildlife-Informationen, mit Symbolen im Popup und Filter nach Schutzgebietskategorie
- Layer-basierte Darstellung für schnellere Orientierung auf der Karte
- Bedienfeld „Karten & Layer” für Kartenstil, Ebenen, Filter und Legenden, per Klick bedienbar (auch auf Touchgeräten)
- Legendenkarte unten rechts: kompakte Legende, zeigt nur die eingeblendeten Ebenen, einklappbar
- Am Desktop (ab 1200 px) füllt die Karte die ganze Fläche; Wetter und Sperrungen schweben links, Bedienfeld und Legendenkarte rechts in einem Dock (unter 1200 px bleibt das bisherige Layout)
- Auf dem Smartphone (bis 820 px) füllt die Karte den Bildschirm; Wetter und Sperrungen sind ein Bottom Sheet (Griff antippen oder wischen: zu, halb, voll), „Karten & Layer“ öffnet als Sheet über der Karte, die Statusleiste läuft einzeilig
- Lawinenlage für Euregio (Tirol, Südtirol, Trentino) und Schweiz als gemeinsamer Layer: Warnregionen nach Gefahrenstufe, ein Symbol je Region, vollständiger Lagebericht mit Höhenangaben im Popup (aktuelle Berichte ab Saisonstart der Lawinenwarndienste)
- Globale Suche im Header: Schutzgebiete, Sperrungen und Hinweise aus den geladenen Daten, Treffer in Gruppen, per Tastatur bedienbar, Klick springt zur Karte (keine Ortssuche)
- Datenstatus-Leiste unter dem Header: je Quelle (Sperrungen, Schutzgebiete, Lawinenlage, Wetter) Ladezustand und, wo die Daten einen Zeitstempel liefern, der Datenstand; nur echte Werte

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

- **[docs/AVALANCHE_ARCHITECTURE.md](docs/AVALANCHE_ARCHITECTURE.md)** — Lawinen-Framework: Datenfluss, Provider-Konzept, Standardmodell, GeoJSON-Schema, Anleitung für neue Länder
- **[docs/LAWINENLAGE_ANALYSE.md](docs/LAWINENLAGE_ANALYSE.md)** — Lawinenlage Euregio und Schweiz: Quellen, API-Endpunkte, Höhenanalyse, Befunde, Empfehlungen für weitere Länder
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
| `index.html` | Startseite (Landing Page, LP1/LP2): Produktname, Claim, Slogan, Produkterklärung, Zielgruppen und der Link „Zur Karte“ |
| `app.html`, `style.css` | Kartenanwendung und Styling von Startseite und Anwendung |
| `js/` | Frontend-Programmcode der Map-Anwendung |
| `scripts/fetch_closures.py` | Abruf von Sperrungen und Hinweisen |
| `data/closures.json` | aktuelle Sperrungen und Hinweise |
| `scripts/fetch_protected_areas.py`, `scripts/fetch_protected_area_details_v2.py`, `scripts/fetch_wildlife.py`, `scripts/build_geojson.py` | Schutzgebiets-Pipeline |
| `data/protected_areas_alps.geojson` | kompaktes GeoJSON für Schutzgebiete auf der Karte |
| `data/wildlife_entities.json` | aufgelöste Schutzgüter: Kennung → Name, Kennung → Art (`FAUNA`, `FLORA`, `HABITAT`) und Verknüpfung → Kennung, nur aus der Digitize API |
| `data/wildlife_probe.json` | Diagnosebericht der Wildlife-Auflösung (was die API geliefert hat, was fehlt) |
| `scripts/avalanche_providers.py`, `scripts/avalanche_sources.py`, `scripts/avalanche_model.py`, `scripts/avalanche_schema.py`, `scripts/fetch_avalanche.py` | Lawinen-Framework: Provider je Quelle, Registry, Normalisierung, Standardmodell und GeoJSON-Schema, zentrale Pipeline ([docs/AVALANCHE_ARCHITECTURE.md](docs/AVALANCHE_ARCHITECTURE.md)) |
| `scripts/test_avalanche_model.py`, `scripts/test_fetch_avalanche.py`, `scripts/test_avalanche_framework.py`, `scripts/test_avalanche_logic.html`, `scripts/test_avalanche_frontend.html`, `scripts/test_protected_areas.html`, `scripts/test_layout.html`, `scripts/test_sheet_logic.html`, `scripts/run_js_tests.py` | Tests der Lawinenlage, der Schutzgebiets-Oberfläche, des Layouts und des Bottom Sheets (Python und JavaScript im Headless-Browser) |
| `data/avalanche/` | Lawinenlage: `index.json`, je Quelle `<id>.json` (Bulletins) und `<id>_regions.geojson` (Polygone) für `euregio` und `slf` |
| `vendor/inter/` | Schrift Inter (variable, SIL OFL 1.1), selbst gehostet, Lizenz in `vendor/inter/OFL.txt` |
| `docs/design/komponenten.html` | Referenzseite der gemeinsamen UI-Komponenten (`.mr-*`), nur zur Ansicht, nicht Teil der Anwendung |
| `docs/design/mountain-radar-emblem.svg` | Emblem für den Header der Anwendung (Ausschnitt aus `mountain-radar-main-hauptlogo.svg`, ohne Schrift) |
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
| `js/status_bar.js` | Datenstatus-Leiste unter dem Header: je Quelle Zustand und Text; Module melden mit `setSourceStatus()` |
| `js/status_bar_logic.js` | reine Logik der Statusleiste: Zustand und Text aus echten Werten (Anzahl, Zeitstempel, Berichtsstatus), getestet mit `scripts/test_status_bar_logic.html` |
| `js/protected_areas.js` | Schutzgebiete aus `data/protected_areas_alps.geojson` als Ebene, Farben nach Kategorie, bindet Popup, Legende und Filter an |
| `js/protected_areas_popup.js` | Popup der Schutzgebiete als HTML-Text (rein): Kategorie, Beschreibung, Wildlife-Schilder, Regeln mit Symbol |
| `js/popup_icons.js` | Symbole für die Popups (rein): Wildlife nach Art und Tiername (unbekannt: Pfotensymbol), Regeln nach Thema und Art (Verbot, eingeschränkt, erlaubt) aus dem Wortlaut |
| `js/protected_areas_filter.js` | Filterlogik nach Schutzgebietskategorie: blendet die vorhandenen Flächen ein und aus, ohne neu zu laden |
| `js/protected_areas_legend.js` | Legende der Schutzgebiete (Abschnitt im Bedienfeld „Karten & Layer“): Farben der Kategorien, die in den Daten vorkommen |
| `js/layers.js` | Register des Bedienfelds „Karten & Layer“: meldet Kartenstile, Ebenen, Filter und Legenden an (neue Ebene: eine Zeile `panel.addOverlay(...)`, Filter: `panel.addFilter(...)`) |
| `js/layer_panel.js` | Bedienfeld „Karten & Layer“ (Kartenelement oben rechts, ab 1200 px zusammen mit der Legendenkarte in einem Dock, mobil ein Knopf oben rechts, aufgeklappt ein Sheet über der Karte): Layer, Kartenstil, einklappbare Filter und Legenden, alles per Klick, ohne Fachlogik; dazu die Legendenkarte (nur eingeblendete Ebenen; unter 1200 px eigenes Element unten rechts) |
| `js/layout.js` | Layout mit schwebenden Karten (ab 1200 px, Klasse `mr-floating` am `body`) und mobiles Layout (bis 820 px): Layout-Zustand, Abstand und Höhe der Popups (Autopan) gegenüber schwebenden Karten und Bottom Sheet, Kartengröße bei Layoutänderungen; getestet mit `scripts/test_layout.html` |
| `js/sheet.js` | Bottom Sheet (mobil, bis 820 px): Seitenleiste als Sheet mit den Zuständen peek, half, full (Griff, Wischen, Tastatur), Fußzeile am Ende des Sheets; ohne Fachlogik |
| `js/sheet_logic.js` | Bottom Sheet: reine Berechnung von Höhen und Zuständen; getestet mit `scripts/test_sheet_logic.html` |
| `js/search.js` | Globale Suche (Header): Suchfeld, gruppierte Trefferliste, Tastaturbedienung; ohne Fachdaten, Quellen kommen aus `closures.js` und `protected_areas.js` |
| `js/search_logic.js` | Globale Suche: Index und Suche (ohne Akzente, ab 2 Zeichen, Rang); getestet mit `scripts/test_search_logic.html` |
| `js/closures_legend.js` | Legende der Sperrungen und Hinweise (Abschnitt im Bedienfeld) |
| `js/closures_filter.js` | Filter Sperrungen, Hinweise und Geplant (Abschnitt „Filter Sperrungen & Hinweise“ im Bedienfeld) |
| `js/avalanche.js` | Lawinenlage aller Quellen (Karte): Datensatz je Region aufbauen, Polygone nach Gefahrenstufe einfärben (Stufe 5 als Schachbrett), Regionssymbol mit Stufe, Höhenwahl; lädt erst beim ersten Einblenden |
| `js/avalanche_popup.js` | dieselbe Popup-Komponente für jede Quelle: Lagebericht aus einem Regionsdatensatz, rein (ohne DOM und Leaflet) |
| `js/avalanche_symbols.js` | gemeinsames Symbolmodell: Gefahrenstufen, Expositionen, Lawinenprobleme, Gefahrenmuster, Höhenangaben, Piktogramme, deutsche Bezeichnungen |
| `js/avalanche_model.js` | Regionsdatensatz im Browser (Standardmodell aus Polygon-Properties und Bulletin) |
| `js/html.js` | HTML-Maskierung `esc` ohne Abhängigkeiten (`map.js` exportiert sie weiter) |
| `js/avalanche_legend.js` | Legende der Lawinenlage mit Berichtsstatus je Quelle, Stufenfarben, Höhenwahl, Hinweisen und Namensnennung (Abschnitt im Bedienfeld „Karten & Layer“) |
| `js/avalanche_logic.js` | reine Logik ohne DOM und Leaflet auf dem Regionsdatensatz: Gefahrenstufe je Höhe, Gültigkeit, Gruppierung, Link zum Lagebericht (getestet mit `scripts/run_js_tests.py`) |

Abhängigkeiten: `app.js` → alle anderen; `closures.js` → `map.js`, `weather.js`; `weather.js` → `map.js`;
`protected_areas.js` → `map.js`, `layers.js`, `protected_areas_legend.js`, `protected_areas_filter.js`, `protected_areas_popup.js`; `protected_areas_popup.js` → `html.js`, `popup_icons.js`; `avalanche.js` → `map.js`, `html.js`, `avalanche_legend.js`, `avalanche_symbols.js`, `avalanche_logic.js`, `avalanche_model.js`, `avalanche_popup.js`;
`avalanche_popup.js` → `html.js`, `avalanche_symbols.js`, `avalanche_logic.js`; `avalanche_symbols.js` → `html.js`;
`avalanche_legend.js` → `html.js`, `layers.js`, `avalanche_logic.js`, `avalanche_symbols.js`; `layers.js` → `map.js`, `layer_panel.js`; die Legendenmodule `protected_areas_legend.js` und `closures_legend.js` → `layers.js`. `map.js` → `html.js`. `layer_panel.js`, `closures.js`, `sheet.js` und `app.js` → `layout.js`. `sheet.js` → `sheet_logic.js`; `closures.js` und `app.js` → `sheet.js`. `html.js`, `layout.js`, `sheet_logic.js`, `popup_icons.js`, `protected_areas_filter.js`, `avalanche_logic.js` und `avalanche_model.js` hängen von keiner
anderen Datei ab.

Hinweis: Wegen der Module muss die Seite über einen Webserver (zum Beispiel GitHub Pages) geöffnet
werden, nicht per Doppelklick als lokale Datei. Das galt für Karte und Daten schon vorher.

## Schutzgebiete: Datenpipeline, Wildlife und Regeln

Die Popups der Schutzgebiete zeigen Kategorie, Beschreibung, **Wildlife** und **Regeln**, jeweils mit Symbolen. Im Bedienfeld „Karten & Layer“ lassen sich die Schutzgebiete unter **Filter Schutzgebiete** nach Kategorie ein- und ausblenden.

**Filter:** Ein Schalter je Kategorie, die in den Daten vorkommt (mit Farbfeld und Anzahl), dazu „Alle“ und „Keine“ und eine Statuszeile („10 von 11 sichtbar“). Der Filter blendet nur die vorhandenen Flächen ein und aus, ohne neu zu laden. Er bleibt beim Zoomen und Verschieben erhalten und gilt auch, wenn die Ebene „Schutzgebiete“ aus- und wieder eingeschaltet wird. Der Abschnitt ist zunächst eingeklappt.

**Symbole im Popup:** Regeln bekommen ein Themensymbol (Hunde, Drohnen, Zelten, Radfahren, ...) und einen farbigen Rand nach Art der Regel (Verbot, eingeschränkt, erlaubt), ein Zeitraum steht in einer eigenen Zeile. Wildlife erscheint als Schilder mit Symbol: Tiere (Art `FAUNA`) unter „Wildlife“ mit einem Symbol nach dem Tiernamen, Pflanzen und Lebensräume (`FLORA`, `HABITAT`) getrennt darunter mit festem Symbol. Die Art stammt aus der Digitize API, die Symbole sind reine Darstellung, der Text bleibt unverändert. Nicht erkannte Tiernamen bekommen ein neutrales Pfotensymbol, nichts wird geraten.

```
fetch_protected_areas.py            Liste aller Schutzgebiete -> data/protected_areas.json
fetch_protected_area_details_v2.py  Details je Gebiet (fields=all, mit "wildlife" und "rules")
                                    -> data/protected_areas_alps.json (nicht im Repo, groß)
fetch_wildlife.py                   Namen, Arten und Verknüpfungen der Schutzgüter aus der API
                                    -> data/wildlife_entities.json, data/wildlife_probe.json
build_geojson.py                    alles zusammenführen -> data/protected_areas_alps.geojson
```

**Woher kommen die Tiernamen?** Ein Schutzgebiet verweist bei `wildlife` nur auf Verknüpfungseinträge. Deren
`id` ist die id der Verknüpfung (`GET /api/v2/wildlife`: `id`, `protected_area_uuid`, `protected_entity_id`),
nicht die der Tierart. `fetch_wildlife.py` speichert diese Verknüpfungen (`links`) und holt Namen und Art
(`type`) der Schutzgüter ausschließlich aus offiziellen DTP-Quellen (zum Beispiel `GET /protected-entities`).
`build_geojson.py` löst über die Verknüpfungs-ID auf: Wildlife-Eintrag → Verknüpfung → `protected_entity_id`
→ Name und Art. Diesen Weg haben wir an den echten Daten geprüft (alle 1315 prüfbaren Verknüpfungen gehören zum
richtigen Schutzgebiet). Es gibt keine eigenen Zuordnungstabellen, und was die API nicht liefert, wird nicht
angezeigt. Ob und wie weit die Auflösung gelingt, steht im Protokoll des Workflows und in
`data/wildlife_probe.json`. Ausführliche Analyse: [docs/WILDLIFE_ANALYSE.md](docs/WILDLIFE_ANALYSE.md).

**Regeln** werden mit dem ausgeschriebenen Text der API übernommen (`text_de`, sonst `text`, sonst
`text_en`), wichtige Regeln (`is_important`) zuerst, ohne Doppelte, höchstens 8 je Gebiet,
saisonale Regeln mit Zeitraum (z. B. „01.12.–30.04.\"). Regeln ohne Text werden ausgelassen, weil sich
aus Aktivität und Bedingungen allein nicht sicher ableiten lässt, ob etwas erlaubt oder verboten ist.

**Kompakte Datei:** Namen, Arten und Regeltexte stehen einmal in Tabellen am Ende der GeoJSON-Datei
(`wildlife_names`, dazu parallel `wildlife_types`, und `rule_texts`), die Gebiete verweisen per Index darauf
(`properties.w`, `properties.r`). Interne IDs gelangen nicht in die Datei. Das Frontend
(`js/protected_areas_popup.js`) zeigt die Einträge maskiert im Popup an; bei Gebieten ohne Angaben bleibt das Popup wie bisher.

**Daten erzeugen:** Reiter **Actions** → **Schutzgebiete aktualisieren** → **Run workflow**
(`.github/workflows/update-protected-areas.yml`, dauert länger, weil jedes Gebiet einzeln abgefragt
wird). Das Ergebnis wird als Commit gespeichert. Lokal: die Skripte in der oben stehenden
Reihenfolge ausführen (`fetch_wildlife.py` liest das OpenAPI-Schema der API als YAML, dafür braucht es das Python-Paket
`pyyaml`, auf den GitHub-Runnern ist es vorhanden; ohne lesbares Schema fragt das Skript den bekannten Endpunkt
`/protected-entities` ab und lässt eine vorhandene Namensdatei unverändert, wenn ein Lauf keine Namen liefert). Tests: `python3 scripts/test_build_geojson.py`,
`python3 scripts/test_fetch_wildlife.py` und, mit installiertem Chrome oder Edge, `python3 scripts/run_js_tests.py`.

## Lawinenlage (Euregio und Schweiz)

Die Ebene **Lawinenlage** (Bedienfeld „Karten & Layer“ oben rechts, standardmäßig aus; die Legende steht im selben Bedienfeld) zeigt die Warnregionen von Tirol, Südtirol und Trentino (90) und der Schweiz (149) in den offiziellen Farben der Gefahrenskala (Stufe 5 als rot-schwarzes Schachbrett). Jede Region hat ein anklickbares Symbol mit Stufe (Schweiz mit Teilstufe, z. B. 3+) ab Zoomstufe 9. Ein Klick öffnet den Lagebericht: Veröffentlichung und Gültigkeit, Zusammenfassung, Gefahrenstufen nach Höhe, Lawinenprobleme mit Höhenbereich und Expositionen, Bulletintext, Tendenz, mit den offiziellen ALBINA-Symbolen. Beispiele: [Übersicht](docs/screenshots/lawinenlage_uebersicht.jpg), [Popup Schweiz](docs/screenshots/lawinenlage_schweiz_popup.jpg), [Popup Euregio](docs/screenshots/lawinenlage_euregio_popup.jpg) (archivierte Berichte vom 15.03.2026).

```
static.avalanche.report (CAAML v6)  aws.slf.ch (CAAML v6, V4)  eaws-regions (Polygone)
  -> scripts/fetch_avalanche.py  (GitHub Action "Lawinenlage aktualisieren", 07:20 und 16:20 UTC)
  -> data/avalanche/index.json, <quelle>.json, <quelle>_regions.geojson  (ein gemeinsames Datenmodell)
  -> js/avalanche.js
```

**Ein System für mehrere Länder:** Jede Quelle ist ein Provider (eine Klasse in `scripts/avalanche_providers.py`) und wird auf dasselbe Standardmodell und GeoJSON-Schema abgebildet, geprüft in der Pipeline. Das Frontend kennt keine Quelle: ein Regionsdatensatz, ein Popup, ein Symbolmodell. Ein neues Land ist eine Provider-Klasse und eine Zeile in `scripts/avalanche_sources.py`, Frontend und Workflow bleiben unverändert. Architektur, Datenmodell, GeoJSON-Schema und Anleitung für neue Länder: [docs/AVALANCHE_ARCHITECTURE.md](docs/AVALANCHE_ARCHITECTURE.md). Befunde zu den Daten und Empfehlungen für Frankreich, Italien und Slowenien: [docs/LAWINENLAGE_ANALYSE.md](docs/LAWINENLAGE_ANALYSE.md).

**Höhenabhängige Gefahrenstufen:** Eine echte Teilung der Polygone ist mit den offenen Daten nicht möglich. Die Karte färbt wie die offiziellen Karten nach der **höchsten** Stufe. Das Popup zeigt die Höhenaufteilung: bei Euregio aus den Gefahrenstufen (mit offiziellem Piktogramm), bei der Schweiz aus den Lawinenproblemen, weil der SLF seine Gefahrenstufen ohne Höhengrenze angibt. Die Legende erlaubt eine Höhenwahl, die nur bei Quellen mit Höhe in den Gefahrenstufen (Euregio) wirkt.

**Außerhalb der Saison:** Nach Ablauf eines Berichts werden die Regionen grau ohne Gefahrenstufe dargestellt, ein alter Bericht wird nie als aktuell gezeigt. Der Euregio-Bericht ist der letzte des Winters 2025/26, der SLF liefert derzeit keinen aktiven Bericht.

**Daten erzeugen:** Reiter **Actions** → **Lawinenlage aktualisieren** → **Run workflow**. Lokal: `python3 scripts/fetch_avalanche.py [euregio|slf]`. Tests: `python3 scripts/test_avalanche_model.py`, `python3 scripts/test_fetch_avalanche.py`, `python3 scripts/test_avalanche_framework.py` und, mit installiertem Chrome oder Edge, `python3 scripts/run_js_tests.py`.

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