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

- Karte mit relevanten Inhalten für alpine Regionen
- Anzeige von Sperrungen und Hinweisen aus aktuellen Daten
- Wetterinformationen mit lokaler Lage- und Umfeldsicht
- Schutzgebietskarten mit Kategorien, Regeln und Wildlife-Informationen
- Layer-basierte Darstellung für schnellere Orientierung auf der Karte
- Zukunftsfähige Erweiterung um Lawinenlage, Risiken und Tourenanalysen

## Screenshots

Derzeit noch kein Final-Design. Der Platz für Screenshots ist hier reserviert:

```text
[ Screenshot 1: Kartenansicht mit Sperrungen und Wetter ]
[ Screenshot 2: Schutzgebiete mit Popup-Informationen ]
[ Screenshot 3: Filter- und Lageansicht auf der Karte ]
```

## Roadmap-Verweis

Die langfristige Produkt- und Entwicklungsplanung findet sich in [docs/ROADMAP.md](docs/ROADMAP.md).

Dort werden Vision, Priorisierung, Phasen und geplante Erweiterungen beschrieben, etwa:

- Schutzgebiete und Kartenlayer
- Alpine Risiken
- Lawinenlage
- Unfall- und Sicherheitsdaten
- Tourenanalyse, Routing und KI-gestützte Hilfen

## Dokumentationsübersicht

Die Dokumentation des Projekts liegt im Ordner [docs/](docs/):

- [docs/ROADMAP.md](docs/ROADMAP.md) — Produktvision, Phasen, Prioritäten und langfristige Planung
- [docs/DATENQUELLEN.md](docs/DATENQUELLEN.md) — Überblick über Datenquellen, APIs und Integrationen
- [docs/IDEENSAMMLUNG.md](docs/IDEENSAMMLUNG.md) — Ideen, Konzepte und mögliche Erweiterungen
- [docs/RECHERCHE_LAWINEN.md](docs/RECHERCHE_LAWINEN.md) — Recherche zu Lawinen- und Risikodaten
- [docs/STYLEGUIDE.md](docs/STYLEGUIDE.md) — visuelle und inhaltliche Richtlinien
- [docs/WORKFLOW.md](docs/WORKFLOW.md) — Arbeitsabläufe und Projektprozesse

## Produktüberblick

Mountain Radar kombiniert eine interaktive Kartenoberfläche mit relevanten Berg- und Sicherheitsinformationen. Die Anwendung nutzt OpenStreetMap-, OpenTopoMap- und Leaflet-Technologien und verarbeitet strukturierte Geodaten für die Karte.

### Kernbereiche

- **Karte:** OpenStreetMap und OpenTopoMap, dargestellt mit Leaflet (im Ordner `vendor/leaflet`)
- **Sperrungen und Hinweise:** Daten von [Digitize the Planet e.V.](https://platform.digitizetheplanet.org/en/api/docs/) (Lizenz CC0)
- **Wetter:** [Open-Meteo](https://open-meteo.com/), ohne Schlüssel
- **Schutzgebiete:** regionale Informationen aus GeoJSON- und API-Daten mit Wildlife- und Regeltexten

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

## Aufbau des Programmcodes (`js/`)

Die Seite lädt `js/app.js` als ES-Modul (`<script type="module">`). Leaflet wird davor klassisch
geladen und steht als globales `L` zur Verfügung.

| Datei | Zuständig für |
| --- | --- |
| `js/app.js` | Einstieg: Ereignisse verbinden (Kartenbewegung, Klick, Suche, Filter, Wetterknöpfe) und das Laden starten (Wetter, Schutzgebiete, Sperrungen) |
| `js/map.js` | Leaflet-Karte, Kachelebenen (OpenStreetMap, OpenTopoMap), Ebenengruppen, Ebenenauswahl, Warnhinweise sowie gemeinsame Hilfen (`el`, `esc`, `setStatus`) |
| `js/closures.js` | Sperrungen und Hinweise: `data/closures.json` laden, filtern, auf der Karte und in der Liste darstellen, Popups, Sprung zu einem Eintrag |
| `js/weather.js` | Wetterwidget mit Open-Meteo und Standortmarker |
| `js/protected_areas.js` | Schutzgebiete aus `data/protected_areas_alps.geojson` als Ebene |
| `js/protected_areas_legend.js` | Legende der Schutzgebiete (Kartenelement unten links): Farben der Kategorien, die in den Daten vorkommen; folgt der Ebene „Schutzgebiete“ |

Abhängigkeiten: `app.js` → alle anderen; `closures.js` → `map.js`, `weather.js`; `weather.js` und
`protected_areas.js` → `map.js`. `map.js` hängt von keiner anderen Datei ab.

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

## Status

Das Projekt befindet sich in einer Übergangsphase vor einem möglichen Rebranding und einer weiteren Produktreife. Die Kernfunktionalitäten sind bereits in der Kartenanwendung sichtbar, während die langfristige Ausrichtung in der Roadmap und Dokumentation beschrieben wird.

## Lizenz und Hinweise

Die Anwendung und die enthaltenen Projektdateien werden gemäß den jeweiligen Datenquellen und Repository-Regeln gepflegt. Für externe Datenquellen gelten die jeweiligen Lizenz- und Nutzungsbedingungen, insbesondere bei Digitize the Planet sowie Open-Meteo.