# Lawinenlage Euregio (ALBINA): Analyse, Entscheidungen und Datenmodell

> Stand: Oktober 2026
>
> Dieses Dokument hält fest, was die Datenquellen tatsächlich liefern, welche Darstellungsentscheidungen daraus folgen und wie die Daten im Projekt fließen. Aussagen sind als **verifiziert** (an echten Daten geprüft), **abgeleitet** (aus dem Quelltext der ALBINA-Projekte) oder **offen** gekennzeichnet.
>
> Zugehörige Dokumente: [DATENQUELLEN.md](DATENQUELLEN.md) (Quellen, Lizenzen), [ROADMAP.md](ROADMAP.md) (Status).

---

# Ergebnis in Kürze

- Umfang: Euregio Tirol, Südtirol und Trentino, 90 Mikroregionen (`AT-07`, `IT-32-BZ`, `IT-32-TN`).
- Gefahrenstufen, Höhen, Lawinenprobleme, Expositionen und Texte kommen unverändert aus dem offiziellen CAAML-v6-Bulletin. Abgeleitet wird nur die höchste Gefahrenstufe je Bulletin.
- **Eine echte Höhenaufteilung der Polygone ist mit den offenen Daten nicht möglich** (Begründung in Abschnitt 3). Umgesetzt ist die Darstellungslogik der ALBINA-Website (Färbung nach höchster Stufe) plus die offiziellen Höhen-Piktogramme, Höhenangaben im Popup und eine Höhenwahl in der Legende.
- Abgelaufene Berichte werden **nicht** als Gefahrenstufe dargestellt. Der aktuell veröffentlichte Bericht ist der letzte des Winters 2025/26 (gültig bis 03.05.2026).

---

# 1. Verwendete Quellen

| Quelle | Inhalt | Lizenz | Verwendung |
|---|---|---|---|
| `https://static.avalanche.report/bulletins/latest/EUREGIO_de_CAAMLv6.json` | aktuelles Bulletin, CAAML v6, deutsch | CC BY 4.0 | Gefahrenstufen, Probleme, Texte |
| `https://gitlab.com/eaws/eaws-regions` (`public/micro-regions/{AT-07,IT-32-BZ,IT-32-TN}_micro-regions.geojson.json`) | Polygone der Mikroregionen mit Gültigkeitszeitraum | CC0 1.0 | Geometrie |
| `https://gitlab.com/albina-euregio/albina-website` (`public/images/pro/...`, `app/i18n/caaml/de.json`, `app/css/scss/abstracts/_variables.scss`) | offizielle Symbole, deutsche Bezeichnungen, Farben | AGPL-3.0 (Repository), Grafiklizenz **offen** | Symbole, Beschriftung, Farben |
| `https://gitlab.com/albina-euregio/avalanche-warning-maps` | Geodaten für ALBINAs Gefahrenstufenkarten | GPL-3.0-or-later | nur Referenz für die offizielle Darstellungslogik, keine Daten übernommen |
| `https://gitlab.com/albina-euregio/base-map` | Grundkarte | nicht geprüft | nicht verwendet (Projekt nutzt OpenStreetMap/OpenTopoMap) |

Lizenzhinweis der Open-Data-Seite (`lawinen.report/more/open-data`, Quelltext in `albina-website/public/content/more/open-data/de.html`): „Sämtliche Daten, wie der Lawinen.report, Wetterstationsdaten, etc., stehen unter der Lizenz CC BY 4.0.“ Die Namensnennung steht in der Legende, im Popup, in der Kartenquellenangabe und im Seitenfuß.

Ansprechpartner laut ALBINA-README: lawine@tirol.gv.at.

---

# 2. Befunde zu den Daten

Stichprobe: das aktuelle `latest`-Bulletin sowie die archivierten Bulletins von 2025-03-10, 2025-12-20, 2026-01-15, 2026-02-10, 2026-03-05, 2026-03-25, 2026-04-15 und 2026-05-02 (zusammen 53 Bulletins).

| Befund | Status |
|---|---|
| Archiv-URL: `https://static.avalanche.report/bulletins/{Datum}/{Datum}_EUREGIO_de_CAAMLv6.json`; für Tage ohne Bericht (z. B. Sommer) HTTP 404 | verifiziert |
| `latest` ist derzeit das letzte Bulletin des Winters (Text: „Dies ist die letzte Gefahrenkarte des Winters 2025/26“), `Last-Modified` 02.05.2026 | verifiziert |
| Die EUREGIO-Datei enthält teils auch Kärnten (`AT-02-...`). Diese Regionen werden bewusst nicht übernommen (Umfang: Tirol, Südtirol, Trentino) | verifiziert |
| Jedes Bulletin gilt für mehrere Regionen (5 bis 10 Bulletins je Tag, 2 bis 61 Regionen je Bulletin, einschließlich Kärnten) | verifiziert |
| Alle Regionen im Bulletin haben genau ein gültiges Polygon und umgekehrt (86 bis 90 Regionen an den 8 archivierten Stichtagen, 90 im aktuellen Bulletin) | verifiziert |
| Polygon-Gültigkeit steht in `start_date` / `end_date` (das README von eaws-regions nennt `valid_from` / `valid_until`, die Daten verwenden aber `start_date` / `end_date`). Auswahl wie in der ALBINA-Website: `start_date <= Datum < end_date`, fehlende Grenzen sind offen | verifiziert |
| Polygonkoordinaten sind WGS84 (`urn:ogc:def:crs:OGC:1.3:CRS84`), Typ `MultiPolygon` | verifiziert |
| Regionsnamen stehen nur im Bulletin (`regions[].name`), nicht in den Polygondateien | verifiziert |
| Regelbericht: veröffentlicht um 17:00 Ortszeit des Vortags (16:00Z Winterzeit, 15:00Z Sommerzeit), gültig 24 Stunden | verifiziert |
| Außerplanmäßige Berichte kommen vor (`unscheduled: true`, 15.04.2026, veröffentlicht um 06:00Z) | verifiziert |
| Beobachtete Gefahrenstufen in der Stichprobe: `low`, `moderate`, `considerable`. Stufen 4 und 5 (`high`, `very_high`) wurden nicht beobachtet, die Darstellung folgt der Gefahrenskala | verifiziert / nicht beobachtet |
| Beobachtete Lawinenprobleme: `wet_snow`, `wind_slab`, `persistent_weak_layers`. Die übrigen Typen (`new_snow`, `gliding_snow`, `cornices`, `favourable_situation`, `no_distinct_avalanche_problem`) stammen aus der ALBINA-Übersetzungsdatei | verifiziert / abgeleitet |
| In Texten kommt als HTML nur `<br/>` vor (Absatztrenner) | verifiziert |
| `weatherForecast` und `travelAdvisory` waren in der Stichprobe in allen 6 Fällen leere Objekte; werden angezeigt, sobald sie Text enthalten (mit echtem Inhalt nicht geprüft) | offen |
| Top-Level-Feld `highlights` (Kernaussage, 4 von 53 Bulletins) und `customData.LWD_Tyrol.dangerPatterns` (Gefahrenmuster, z. B. `DP10`) kommen vor | verifiziert |

---

# 3. Höhenabhängige Gefahrenstufen

## 3.1 Was ALBINA tatsächlich liefert

Im Bulletin steht je Gefahrenstufe (`dangerRatings[]`) **eine** Höhenangabe:

```json
{ "mainValue": "low",      "elevation": { "upperBound": "2600" }, "validTimePeriod": "later" }
{ "mainValue": "moderate", "elevation": { "lowerBound": "2600" }, "validTimePeriod": "later" }
```

- `upperBound` = „unter“, `lowerBound` = „über“ dieser Höhe.
- Der Wert ist eine Zahl in Metern **oder** der Text `treeline` (Waldgrenze). Für die Waldgrenze enthalten die Daten keinen Zahlenwert.
- Die Schwelle ändert sich von Bericht zu Bericht (beobachtet z. B. 2000, 2600, 2800 m und `treeline`).
- Zusätzlich gibt es die Tageszeit `validTimePeriod`: `all_day`, `earlier` (früher am Tag), `later` (später am Tag). Beobachtet: 76 / 10 / 12 Einträge.
- Auch Lawinenprobleme tragen eigene Höhenangaben (`lowerBound` / `upperBound`, ebenfalls mit `treeline`).
- Die Polygone sind rein zweidimensional und enthalten keine Höhen.

## 3.2 Optionen

| Option | Machbar? | Bewertung |
|---|---|---|
| A. ALBINAs vorberechnete Höhen-Polygone (`eaws-regions/public/micro-regions_elevation`) verwenden | nein | Je Region gibt es genau ein Paar `low`/`high` mit **einer festen** Schwelle (`threshold`, `elevation line_visualization`), nicht die täglich wechselnde Schwelle des Berichts. Die Bedeutung der beiden Felder ist nicht dokumentiert. ALBINA selbst führt die zugehörigen Layer im README von `avalanche-warning-maps` als **obsolet** („no longer used by albina-server“). Eine Verwendung würde Höhengrenzen vortäuschen, die der Bericht nicht nennt. |
| B. Polygone selbst per Geländemodell an der Schwelle des Tages teilen | technisch ja, jetzt nicht | Braucht ein Höhenmodell (z. B. EU-DEM, CC BY 4.0), tägliche Neuberechnung und Polygonisierung der Höhenlinie. Für `treeline` fehlt der Zahlenwert weiterhin. ALBINA selbst stellt die Gefahrenstufe nicht so dar. Als Idee in [IDEENSAMMLUNG.md](IDEENSAMMLUNG.md) festgehalten. |
| C. Färbung nach höchster Stufe, Höhenaufteilung als Piktogramm und Text im Popup | ja | **Umgesetzt.** Das ist die Logik der offiziellen ALBINA-Karten (`micro_regions_a`: „colored by the highest danger rating of the bulletin … no distinction between elevations“; Website: `maxDangerRatings`). Vorsichtig und fachlich korrekt, weil die höchste Stufe irgendwo in der Region gilt. |
| D. Höhenwahl in der Legende | ja | **Umgesetzt.** Nutzer wählen eine Höhe (1000 bis 3500 m), die Karte zeigt die dort mögliche höchste Stufe. Nutzt ausschließlich die Bulletin-Daten. |

## 3.3 Entscheidung

- **Standardansicht:** Füllfarbe nach höchster Gefahrenstufe des Bulletins (alle Höhen, alle Tageszeiten). Im Popup steht die Aufteilung nach Höhe und Tageszeit, mit dem offiziellen Piktogramm `levels_<unten>_<oben>` (zeigt z. B. unten Stufe 2, oben Stufe 3 mit Höhenlinie).
- **Höhenwahl:** Für eine gewählte Höhe zählen alle Gefahrenstufen, die dort gelten können (alle Tageszeiten, vorsichtig). Grenzen werden beidseitig als eingeschlossen behandelt (Annahme, auf der sicheren Seite).
- **Waldgrenze:** Ohne Zahlenwert in den Daten wird die Waldgrenze **nicht geschätzt**. Hängt das Ergebnis davon ab, gilt die höchste mögliche Stufe, und die Region erhält einen gestrichelten Rand. Die Legende erklärt das.
- **Kein Schnee / keine Beurteilung:** `no_snow` und `no_rating` werden wie in ALBINAs Karte ohne Füllung dargestellt.

## 3.4 Grenzen dieser Lösung

- Eine Region kann in tiefen Lagen deutlich geringere Gefahr haben, als die Füllfarbe zeigt. Die Farbe ist die Obergrenze, nicht ein Mittelwert.
- Bei Berichten mit `treeline`-Grenze ist die Höhenwahl nur eingeschränkt aussagekräftig (siehe oben). In der Stichprobe nutzen 14 von 70 Gefahrenstufen mit Höhengrenze (von 98 insgesamt) `treeline`.

---

# 4. Darstellung

| Stufe | Name (offiziell) | Farbe | Quelle der Farbe |
|---|---|---|---|
| 1 | Gering | `#ccff66` | ALBINA `_variables.scss` |
| 2 | Mäßig | `#ffff00` | ALBINA `_variables.scss` |
| 3 | Erheblich | `#ff9900` | ALBINA `_variables.scss` |
| 4 | Groß | `#ff0000` | ALBINA `_variables.scss` |
| 5 | Sehr groß | `#ff0000` mit schwarz-rotem Schachbrett | ALBINA (`bg_checkered`), hier als SVG-Muster |

- Die Farben der Europäischen Gefahrenskala bleiben bewusst unverändert und weichen von den allgemeinen Warnfarben im [STYLEGUIDE.md](STYLEGUIDE.md) ab (Wiedererkennung, Sicherheit).
- **Abgelaufene Berichte:** Nach Ende der Gültigkeit (`validTime.endTime`) gilt der Bericht noch 6 Stunden als „abgelaufen, neuer folgt“ (Farben bleiben, Hinweis im Popup und in der Legende). Danach werden die Regionen grau und gestrichelt ohne Gefahrenstufe dargestellt, und das Popup nennt nur den Ablauf. Ein alter Bericht darf nicht wie ein aktueller aussehen. Die 6 Stunden decken Verzögerungen der GitHub-Actions-Zeitplanung ab (Annahme).
- **Ebene standardmäßig aus:** Wegen der Überlagerung mit Schutzgebietspolygonen und weil außerhalb der Saison kein aktueller Bericht vorliegt. Die Daten laden erst beim ersten Einblenden.
- **Offizielle Symbole:** Gefahrenstufen-Piktogramme (`levels_<unten>_<oben>.webp`), Lawinenproblem-Icons (8 Typen), Expositionsrose und Höhen-Piktogramm. Piktogramme und Icons liegen unter `vendor/albina/`, Rose und Höhen-Piktogramm sind als SVG nach den Pfaddaten der ALBINA-Website im Code. Es werden alle sichtbaren Textelemente aus dem Bulletin übernommen: Gültigkeit, Zusammenfassung, Gefahrenstufen nach Höhe/Tageszeit, Lawinenprobleme (Höhenbereich, Expositionen, Schneedeckenstabilität, Gefahrenstellen, Lawinengröße), Lawinensituation, Schneedecke, Tendenz, Wetter, Tourenempfehlung, Gefahrenmuster.

---

# 5. Datenmodell

## 5.1 `data/avalanche_regions.geojson` (Geometrie, ändert sich selten)

```json
{
  "type": "FeatureCollection",
  "source": "https://gitlab.com/eaws/eaws-regions",
  "license": "CC0 1.0",
  "features": [
    { "type": "Feature", "properties": { "id": "AT-07-02-02" },
      "geometry": { "type": "MultiPolygon", "coordinates": [ ... ] } }
  ]
}
```

- Nur die zum Bulletin-Datum gültigen Polygone, sortiert nach `id`, höchstens ein Polygon je `id`.
- Koordinaten auf 5 Nachkommastellen gerundet (ca. 1 m), entartete Ringe entfernt, sonst keine Vereinfachung.
- Größe: ca. 343 KB.

## 5.2 `data/avalanche_bulletin.json` (täglich)

```json
{
  "generated": "2026-10-29T10:37:56Z",
  "source": "https://static.avalanche.report/bulletins/latest/EUREGIO_de_CAAMLv6.json",
  "license": "CC BY 4.0",
  "attribution": "Lawinenwarndienste Tirol, Südtirol und Trentino (Euregio, avalanche.report)",
  "lang": "de",
  "mainDate": "2026-05-03",
  "validTime": { "startTime": "2026-05-02T15:00:00Z", "endTime": "2026-05-03T15:00:00Z" },
  "bulletins": [ { "...": "siehe unten" } ],
  "regions": { "AT-07-14-01": { "name": "Region …", "b": 3 } }
}
```

| Feld | Bedeutung |
|---|---|
| `regions[id].b` | Index in `bulletins`. Ein Bulletin gilt für viele Regionen, deshalb steht es nur einmal in der Datei |
| `bulletins[].id`, `publicationTime`, `validTime`, `mainDate`, `unscheduled` | Identität und Gültigkeit laut CAAML (`mainDate` = ALBINA-Hauptdatum) |
| `bulletins[].maxLevel` | höchste Gefahrenstufe 1 bis 5 (einzige abgeleitete Größe), `null` bei `no_snow`/`no_rating` |
| `bulletins[].dangerRatings[]` | `{ value, level, period, elevation? }`; `value` = CAAML-Wert, `level` = 1 bis 5 oder `null`, `period` = `all_day`/`earlier`/`later` (Standard `all_day`), `elevation` = `{ lowerBound?, upperBound? }` mit Meterzahl oder `"treeline"` |
| `bulletins[].avalancheProblems[]` | `{ type, period, elevation?, snowpackStability?, frequency?, avalancheSize?, aspects? }`; `aspects` in Reihenfolge N, NE, E, SE, S, SW, W, NW |
| `bulletins[].highlights` | Kernaussage des Berichts (nur wenn vorhanden) |
| `bulletins[].activity` / `snowpack` / `weather` / `travelAdvisory` | Textblöcke `{ highlights?, comment? }`, `comment` als Liste von Absätzen (`<br/>` getrennt); leere Blöcke entfallen |
| `bulletins[].tendency[]` | `{ type, highlights?, comment?, validTime }` |
| `bulletins[].dangerPatterns` | Gefahrenmuster-Kennungen, z. B. `["DP10"]` (Tirol-spezifisch, `customData.LWD_Tyrol`) |

Regeln der Pipeline: Texte werden nicht verändert (nur `<br/>` in Absätze geteilt). Fehlende Felder bleiben fehlend. Kommt eine Region in zwei Bulletins vor, gilt das jüngere; bei gleichem Veröffentlichungszeitpunkt bricht die Pipeline ab. Ein Bulletin ohne Gefahrenstufen bricht die Pipeline ab. In beiden Fällen bleiben die bestehenden Dateien unverändert.

Das Frontend maskiert alle Texte vor der Anzeige (`esc` aus `js/map.js`). Deutsche Bezeichnungen stammen aus `albina-website/app/i18n/caaml/de.json` und stehen in `js/avalanche_logic.js`.

---

# 6. Datenfluss und Aktualisierung

```text
static.avalanche.report  (CAAML v6 JSON, CC BY 4.0)
gitlab.com/eaws/eaws-regions  (Polygone, CC0)
        ↓
GitHub Action "Lawinenlage aktualisieren"  (.github/workflows/update-avalanche.yml)
  1. scripts/test_fetch_avalanche.py
  2. scripts/fetch_avalanche.py
        ↓
data/avalanche_regions.geojson + data/avalanche_bulletin.json  (Commit nur bei Änderung)
        ↓
Browser: js/avalanche.js  (lädt beim ersten Einblenden der Ebene "Lawinenlage (Euregio)")
```

- **Zeitplan:** täglich 06:30 UTC und 16:20 UTC, zusätzlich manuell startbar. Der Regelbericht erscheint um 16:00Z (Winter) bzw. 15:00Z (Sommerzeit), das außerplanmäßige Update am 15.04.2026 kam um 06:00Z. Die Zeiten sind eine Projektentscheidung auf Basis dieser Beobachtungen, die Quelle nennt keine festen Zeiten.
- **Commits:** Die Dateien werden nur bei neuem Inhalt geschrieben, spätestens nach 7 Tagen (damit das Repository auch außerhalb der Saison aktiv bleibt und der Zeitplan nicht von GitHub deaktiviert wird).
- **Fehlerverhalten:** Schlägt ein Abruf fehl oder ist das Bulletin unplausibel, endet die Action mit Fehler, die bestehenden Dateien bleiben unverändert. Der Browser zeigt dann irgendwann „abgelaufen“, nie veraltete Stufen als aktuell.
- **Außerhalb der Saison:** `latest` bleibt der letzte Winterbericht. Die Pipeline schreibt ihn unverändert, das Frontend stellt ihn nach Ablauf grau dar.
- **Lokal:** `python3 scripts/fetch_avalanche.py`, Tests mit `python3 scripts/test_fetch_avalanche.py`.

---

# 7. Annahmen und offene Punkte

| Punkt | Status |
|---|---|
| Lizenz der Grafiken in `vendor/albina/` (Pictos, Problem-Icons): Die Daten stehen unter CC BY 4.0, das ALBINA-Repository unter AGPL-3.0, eine eigene Grafiklizenz nennt das Repository nicht. Vor einer öffentlichen Veröffentlichung beim Lawinenwarndienst Tirol klären (lawine@tirol.gv.at) | offen |
| Verlinkung auf den Lagebericht: `https://lawinen.report/{Datum}` ist aus dem Routing der ALBINA-Website abgeleitet (Datums-Umschalter), nicht im Browser geprüft | offen |
| Zeitpunkt der Veröffentlichung im Winter ist an 8 Stichtagen beobachtet, nicht zugesichert | Annahme |
| Grenzen der Höhenbereiche gelten beidseitig als eingeschlossen | Annahme |
| Frist von 6 Stunden für „abgelaufen, neuer folgt“ | Annahme |
| Gefahrenstufen 4 und 5 sowie `weatherForecast`/`travelAdvisory` mit Inhalt wurden an keinem Bulletin der Stichprobe gesehen | offen |
| Waldgrenze ohne Zahlenwert: eine Näherung (z. B. aus Höhenmodell oder Regionsangabe) wäre erfunden und fehlt bewusst | bewusst offen |
| Kärnten (`AT-02`) und weitere Bundesländer liegen in anderen Warndiensten bzw. der EUREGIO-Datei nur teilweise vor | später |

---

# 8. Teststand

- Pipeline: 17 Tests (`scripts/test_fetch_avalanche.py`), Live-Lauf gegen die echten Quellen erfolgreich (90 Regionen, 5 Bulletins, zweiter Lauf unverändert).
- Frontend (`js/avalanche*.js`): **im Browser noch nicht geprüft.** Es gibt keine automatisierten JavaScript-Tests im Projekt und keine Node-Installation. Der Test mit echten, gültigen Berichten ist erst nach dem Saisonstart des Lawinenwarndienstes möglich. Bis dahin lässt sich die Darstellung mit dem archivierten Bericht prüfen, wenn die Browseruhr auf den 03.05.2026 gesetzt wird.