# Bergbedingungen

Kartenseite mit Sperrungen und Hinweisen im Gebirge, dazu ein Wetterwidget.

- **Karte:** OpenStreetMap und OpenTopoMap, dargestellt mit Leaflet (liegt unter `vendor/leaflet`).
- **Sperrungen und Hinweise:** Daten von [Digitize the Planet e.V.](https://platform.digitizetheplanet.org/en/api/docs/) (Lizenz CC0).
- **Wetter:** [Open-Meteo](https://open-meteo.com/), ohne Schlüssel.

## So kommen die Daten auf die Seite

Der Browser darf die Digitize API nicht direkt abfragen. Deshalb holt die GitHub Action
`Sperrungen aktualisieren` (`.github/workflows/update-data.yml`) alle drei Stunden die Daten
und speichert sie in `data/closures.json`. Die Seite liest nur diese Datei.

Sofort aktualisieren: Reiter **Actions** → **Sperrungen aktualisieren** → **Run workflow**.

## Dateien

| Datei | Inhalt |
| --- | --- |
| `index.html`, `style.css` | die Seite |
| `js/` | der Programmcode der Seite, siehe unten |
| `scripts/fetch_closures.py` | Datenabruf aus der Digitize API |
| `data/closures.json` | abgerufene Sperrungen und Hinweise |
| `scripts/fetch_protected_areas.py`, `scripts/fetch_protected_area_details_v2.py`, `scripts/fetch_wildlife.py`, `scripts/build_geojson.py` | Schutzgebiets-Pipeline, siehe unten |
| `data/protected_areas_alps.geojson` | Schutzgebiete für die Karte (kompakt, inklusive Wildlife und Regeln) |
| `data/wildlife.json` | Wildlife-Referenzliste der Digitize API (IDs → Namen) |

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
fetch_wildlife.py                   Wildlife-Referenzliste (GET /wildlife) -> data/wildlife.json
build_geojson.py                    alles zusammenführen -> data/protected_areas_alps.geojson
```

**Woher kommen die Tiernamen?** Ein Schutzgebiet enthält bei `wildlife` nur Verweise (IDs), keine
Namen. Die lesbaren Namen stehen in der Referenzliste `GET /api/v2/wildlife`. `build_geojson.py` löst
die Verweise damit auf. Die `id` des Eintrags selbst wird dabei nie verwendet, weil sie bei einer
Verknüpfung nicht die Tierart bezeichnen muss und sonst falsche Tiernamen entstehen könnten.
Steht der Verweis in einem Feld, das die automatische Erkennung nicht findet, nennt das Protokoll des
Skripts die nicht aufgelösten Beispiele. Dann das Feld mit `--wildlife-key <Feld>` angeben.

**Regeln** werden mit dem ausgeschriebenen Text der API übernommen (`text_de`, sonst `text`, sonst
`text_en`), wichtige Regeln (`is_important`) zuerst, ohne Doppelte, höchstens 8 je Gebiet,
saisonale Regeln mit Zeitraum (z. B. „01.12.–30.04."). Regeln ohne Text werden ausgelassen, weil sich
aus Aktivität und Bedingungen allein nicht sicher ableiten lässt, ob etwas erlaubt oder verboten ist.

**Kompakte Datei:** Namen und Regeltexte stehen einmal in Tabellen am Ende der GeoJSON-Datei
(`wildlife_names`, `rule_texts`), die Gebiete verweisen per Index darauf (`properties.w`,
`properties.r`). Interne IDs gelangen nicht in die Datei. Das Frontend (`js/protected_areas.js`)
zeigt die Einträge maskiert im Popup an; bei Gebieten ohne Angaben bleibt das Popup wie bisher.

**Daten erzeugen:** Reiter **Actions** → **Schutzgebiete aktualisieren** → **Run workflow**
(`.github/workflows/update-protected-areas.yml`, dauert länger, weil jedes Gebiet einzeln abgefragt
wird). Das Ergebnis wird als Commit gespeichert. Lokal: die Skripte in der oben stehenden
Reihenfolge ausführen. Tests des Bauskripts: `python3 scripts/test_build_geojson.py`.
