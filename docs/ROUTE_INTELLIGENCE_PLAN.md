# Mountain Radar – Route Intelligence Plan

> Status: Plan (kein Code geändert). Stand: 13.11.2026.
>
> Ziel: Mountain Radar entwickelt sich in kleinen, einzeln mergebaren Schritten von der Kartenplattform zur Verarbeitung eigener Touren (Route Intelligence) und darauf aufbauend zur Alpine Risk Intelligence.
>
> Dieses Dokument ist ein Arbeitsplan, keine Zusage. Es beschreibt nur Geplantes. Was heute existiert, steht in ROADMAP und README. Maßgeblich für Phasen und Priorität bleibt die ROADMAP (die technischen Phasen 1–5 der ROADMAP und die vier Produktebenen dieses Plans sind zwei verschiedene Gliederungen: Ebene 2 und 3 liegen überwiegend in Phase 1–2, Ebene 4 in Phase 3 und später) (Phase 1: GPX, DEM, Höhenprofil; Phase 2: Wetter, Lawinenlage, Tourenwarnungen; Phase 3: Alpine Risk Engine Beta).

```
Ebene 1                Ebene 2                Ebene 3                Ebene 4
Kartenplattform   →    Route Intelligence  →  Terrain Intelligence → Alpine Risk Intelligence
(heute)                eine konkrete Tour     Gelände entlang        Quellen zusammenführen,
                                              der Route              später bewerten
```

---

# Produktevolution: vier Ebenen

Der Plan folgt einer Produktentwicklung in vier aufeinander aufbauenden Ebenen. Jede Ebene beantwortet eine andere Frage, nutzt die darunterliegende und ist für sich nützlich, auch wenn die nächste nie gebaut würde. Pakete (RI…) sind die Bausteine; **Stufen** (z. B. 2.1) gliedern die Ebenen in mergebare Zwischenschritte.

| Ebene | Leitfrage | Gegenstand | Ergebnis für Nutzer | Status |
|---|---|---|---|---|
| **1 Kartenplattform** | „Was ist hier?“ | ein Ort bzw. Kartenausschnitt | Karte mit Wetter, Lawinenlage, Schutzgebieten, Wildlife, Sperrungen & Hinweisen | **heute verfügbar** |
| **2 Route Intelligence** | „Was ist das für eine Tour?“ | eine konkrete Route (GPX) | eigene Tour auf der Karte, Länge, Höhenmeter, Höhenprofil; die vorhandenen Datenebenen entlang der Route | geplant (RI1–RI10) |
| **3 Terrain Intelligence** | „Wie ist das Gelände entlang der Tour?“ | Gelände unter und neben der Route | Steigung, Exposition, Hangneigung, Geländecharakteristik aus einem Höhenmodell | geplant (RI11–RI15, RI20) |
| **4 Alpine Risk Intelligence** | „Worauf muss ich achten?“ | alle Quellen zusammen | einheitliche, erklärbare Befunde; später eine Risikobewertung | geplant (RI16–RI19, RI21) |

## Was jede Ebene ausmacht

### Ebene 1 – Kartenplattform (heute)

Ein Ort oder Ausschnitt wird betrachtet; jede Datenquelle steht für sich: Wetter am Punkt (Open-Meteo), Lawinenlage (Euregio, Schweiz), Schutzgebiete mit Regeln, Wildlife, Sperrungen & Hinweise; dazu Layer-System, Popup-System, Datenstatus, globale Suche, mobile Bedienung. **Liefert den späteren Ebenen:** Layer- und Popup-Gerüst, Standardmodell der Lawinenlage mit `levelAtAltitude`, Geometrien der Schutzgebiete und Sperrungen, Wetterabruf, Testmuster. Im Plan nur eine Aufgabe: Grundsatzentscheidungen (RI0).

### Ebene 2 – Route Intelligence

Der Gegenstand wechselt vom Ort zur **Tour**: Eine eigene Route wird geladen, dargestellt und gemessen. Danach wird sie mit den Quellen der Ebene 1 verknüpft („Route trifft Karte“). Die Ebene arbeitet mit dem, was in der GPX-Datei und in den vorhandenen Daten steht; sie berechnet kein Gelände und bewertet nichts.
- **Stufe 2.1 – Route als Objekt:** GPX-Parser, Routenmodell, Anzeige, Statistik, Höhenprofil, lokale Verwaltung (RI1–RI6).
- **Stufe 2.2 – Route trifft Kartenplattform (Übergangsphase):** Die bestehenden Quellen werden entlang der Route ausgewertet, **jede für sich und ohne Zusammenführung**: Schutzgebiete und Sperrungen, Lawinenlage, Wetter (RI7–RI10). Das ist das Verbindungsglied zwischen Ebene 1 und den höheren Ebenen: Es nutzt nur vorhandene Daten, bringt aber erstmals Routenpositionen (km) in alle Ergebnisse.

### Ebene 3 – Terrain Intelligence

Neue Information entsteht, die weder in der GPX-Datei noch in den vorhandenen Daten steht: aus einem **Höhenmodell** (DEM).
- **Stufe 3.1 – Höhenmodell:** Quelle klären, Zugriff bauen (RI11, RI12).
- **Stufe 3.2 – Geländeanalyse:** Steigung/Hangneigung und Exposition entlang der Route (RI13, RI14).
- **Stufe 3.3 – Darstellung:** Gelände im Höhenprofil (RI15).
- **Stufe 3.4 – Geländecharakteristik:** Geländeformen wie Grat, Steilstufe, Mulde (RI20, zurückgestellt).

Terrain Intelligence **beschreibt** das Gelände (Zahlen, Klassen, Abschnitte). Sie sagt nichts über Gefahr; die Deutung gehört zu Ebene 4.

### Ebene 4 – Alpine Risk Intelligence

Hier werden die Ergebnisse der Ebenen 2 und 3 und der Plattformdaten **zusammengeführt**: Route, Wetter, Lawinenlage, Schutzgebiete, Terrain. Der Unterschied zu Stufe 2.2 ist die gemeinsame Sprache: ein Befundmodell, eine Liste, eine Engine, die Module nacheinander ausführt und Ausfälle sichtbar macht.
- **Stufe 4.1 – Befunde:** Befundmodell und Befundliste „Worauf achten?“ (RI16, RI17).
- **Stufe 4.2 – Zusammenführung:** Engine-Orchestrierung (RI18).
- **Stufe 4.3 – Terrain in der Zusammenführung:** Terrain-Befunde (RI19).
- **Stufe 4.4 – Risikobewertung (Konzept):** Ob und wie bewertet wird, ist offen; zunächst nur ein Konzept auf Basis der gesammelten Erfahrung (RI21, zurückgestellt).

Bis einschließlich Stufe 4.3 gilt: informieren, nicht entscheiden; kein Gesamtrisiko. Die Risikobewertung ist ausdrücklich das **spätere Ziel**, nicht Teil der ersten Engine.

## Übergänge zwischen den Ebenen (Gates)

Eine Ebene gilt als erreicht, wenn ihre Kriterien erfüllt sind; erst dann beginnt die nächste inhaltlich (Vorarbeiten wie RI0, RI7, RI11 dürfen früher laufen, weil sie keine Nutzerfunktion ändern).

| Übergang | Kriterien |
|---|---|
| **1 → 2** | RI0 entschieden; GPX-Verarbeitung läuft vollständig lokal; Route kann geladen und entfernt werden, ohne die vorhandene Anwendung zu verändern (RI1–RI3). |
| **2.1 → 2.2** | Routenobjekt mit km-Position stabil (RI2); Statistik und Profil liefern verlässliche Werte (RI4, RI5). |
| **2 → 3** | Mindestens Schutzgebiete/Sperrungen entlang der Route (RI8) sind nutzbar und das Muster „Route × Datenquelle“ hat sich bewährt; DEM-Quelle entschieden (RI11). |
| **3 → 4** | Mindestens zwei unabhängige Analysen liefern Ergebnisse mit km-Position (aus RI8, RI9, RI10 und/oder RI13/RI14); das Befundmodell kann an echten Ergebnissen geprüft werden. |
| **Innerhalb 4** | Risikobewertung (RI21) erst, wenn Befunde im Einsatz sind und Rückmeldungen vorliegen; Entscheidung E9 (Skala, Gewichtung) vorher getroffen. |

Hinweis zur Reihenfolge: Die Befunde (Ebene 4) brauchen Terrain nicht zwingend. RI16 bis RI18 können schon mit den Ergebnissen aus Stufe 2.2 starten, Terrain-Befunde (RI19) kommen nach. Ebene 4 beginnt also vor dem Ende von Ebene 3, ohne dass sich die Reihenfolge der Ergebnisse ändert.

---

# 1. Ausgangslage (Analyse)
## Was heute vorhanden ist und wiederverwendet wird

| Baustein | Stand | Bedeutung für Routen |
|---|---|---|
| Hosting | Statische Seite (GitHub Pages), kein Backend, ES-Module ohne Build, Leaflet 1.9.4 selbst gehostet | Alles Neue läuft zunächst **lokal im Browser**. Ein Backend ist eine eigene Entscheidung (E1, E10). |
| Karte | `js/map.js` (Karte, Kachelebenen, Ebenengruppen), `js/app.js` (Einstieg, Ereignisse) | Eine Route wird eine weitere Ebenengruppe, kein Umbau. |
| Layer-System | `js/layers.js`: `panel.addOverlay`, `addFilter`, `addLegend`; Panel in `js/layer_panel.js` | Die Routenebene wird mit einer Zeile angemeldet, die Legende über denselben Weg. |
| Popup-System | `mr-popup`, `.pa-pop`, `.pa-pop-head`, `.mr-kv`, `.mr-badge` (D8a–D8c), `esc()` in `js/html.js` | Routen- und Befund-Popups nutzen das Gerüst. Jeder Text aus einer GPX-Datei (Name, Beschreibung) läuft durch `esc()`. |
| Seitenleiste und Bottom Sheet | Karten `.mr-card`; Desktop schwebend (D10), mobil Sheet (D11); Überdeckungsabstände in `js/layout.js` (`coveredInsets`, `fitPadded`) | Eine „Route“-Karte passt in die Seitenleiste; Sprünge zur Route halten die Abstände bereits ein. |
| Datenstatus-Leiste | `js/status_bar.js` mit `setSourceStatus` | Analysen melden echte Zustände (lädt, Fehler, Quelle nicht erreichbar). |
| Globale Suche | `js/search.js`, `js/search_logic.js` mit Quellen-Schnittstelle | Später eine Gruppe „Meine Routen“ möglich (E13). |
| Wetter | `js/weather.js`: Open-Meteo, eine Abfrage je Punkt, inkl. `freezing_level_height` | Wetter entlang der Route = wenige Punktabfragen, keine neue Quelle. |
| Lawinenlage | Standardmodell mit Regionspolygonen (`data/avalanche/*_regions.geojson`); reine Logik `js/avalanche_logic.js` mit `levelAtAltitude(bulletin, altitude)` und `bulletinStatus` | Die Höhenlogik „Stufe in Höhe X“ existiert; es fehlt nur die Zuordnung Routenpunkt → Region. |
| Schutzgebiete, Sperrungen | GeoJSON-Geometrien in `data/`, Kategorien, Regeln, Wildlife | Der räumliche Schnitt mit einer Route ist reine Geometrie auf vorhandenen Daten. |
| Tests | Reine Logikmodule mit Browser-Testseiten `scripts/test_*.html`, gesammelt in `scripts/run_js_tests.py`; Python-Tests für die Pipeline | Das Muster „reine Logik ohne DOM + Testseite“ gilt für jedes Paket. |
| Risk-Engine-Konzept | `docs/ALPINE_RISK_ENGINE.md`: Module, Segmentierung, „Informieren statt entscheiden“, **kein Gesamtrisiko** | Die Prinzipien werden übernommen (Abschnitt 2). |

## Was fehlt (laut ROADMAP offen)

GPX-Parser, Höhenprofil, DEM-Integration, OSM Overpass, Wegschwierigkeit, Toolbox-Werkzeuge WEB-T2 bis T6, Tourenwarnungen, jede Form von Routenobjekt oder Speicherung.

Hinweis: `DATENQUELLEN.md` führt „Austrian DEM“ und „OSM Overpass“ mit Status „In Umsetzung“, die ROADMAP-Checkliste (Prüfung 30.10.2026) dagegen „kein Code vorhanden“. Es gibt keinen Code; die Angabe in `DATENQUELLEN.md` wird im ersten DEM-Paket (RI11) korrigiert.

## Kommunikation nach außen (Landing)

Die Landing Page benennt GPX-Analyse, Risikoanalyse, Terrain Intelligence und Alpine Risk Engine ausdrücklich als „Vision – noch nicht verfügbar“ (LP4). Kein Paket dieses Plans ändert die Landing Page, bevor eine Funktion nutzbar ist. Danach passt das Paket RI-L den Text an.

---

# 2. Grundprinzipien

1. **Eine Schicht pro Paket.** Jedes Paket gehört genau einer Schicht an: *Parser*, *Modell/Geometrie*, *Anzeige*, *Datenzugriff (DEM, Wetter)*, *Analyse-Logik*, *Befunde*. Kein Paket mischt GPX, DEM, Risk Engine, Analyse und UI. Wo UI nötig ist, steht die Logik vorher getestet bereit; das UI-Paket enthält keine neue Rechenlogik.
2. **Reine Logik zuerst.** Berechnungen liegen in Modulen ohne DOM und ohne Leaflet, mit Testseite (wie `avalanche_logic.js`, `search_logic.js`).
3. **Nur reale Daten.** Keine Platzhalter, keine erfundenen Werte, keine Beispielrouten im Produkt. Testdaten liegen unter `scripts/`. Fehlende Werte erscheinen als „unbekannt“, nie als Schätzung.
4. **Daten vor KI.** Die Engine liefert Befunde mit Quelle. KI-Erklärungen setzen belastbare Befunde voraus (Zurückgestellt, Abschnitt 9).
5. **Informieren statt entscheiden.** Keine Freigabe, keine Verbote, **kein Gesamtrisiko und keine Ampel für die ganze Tour**, solange nicht ausdrücklich entschieden (ALPINE_RISK_ENGINE.md: „Zu hohe Vereinfachung“).
6. **Erklärbar.** Jeder Befund nennt: was, wo (Abschnitt in km), woher (Quelle, Stand), was nicht bekannt ist.
7. **Karte bleibt Arbeitsfläche.** Neues erscheint als Layer, Seitenleisten-Karte oder Popup im bestehenden Designsystem (Komponenten aus D3), mit Hell/Dunkel, Mobil (Bottom Sheet), Tastatur und Touch-Zielen ab 44 px.
8. **Datenschutz.** Eine GPX-Datei verlässt den Browser nicht (E1). Abfragen an externe Dienste senden nur gerundete Koordinaten einzelner Stützpunkte.
9. **Rückbaubar.** Jedes Paket lässt sich per Revert entfernen. Neue UI-Elemente bleiben unsichtbar, solange keine Route geladen ist.

## Paketregeln für jeden PR

- Ein PR, ein Paket, eine Schicht; Ziel unter ca. 600 geänderten Zeilen ohne Testdaten. Große Pakete werden in a/b geteilt.
- PR immer gegen `main`; nach dem Merge prüfen, ob die Änderung wirklich in `main` liegt. Abhängige Pakete beginnen erst nach dem Merge ihrer Voraussetzung (keine gestapelten PRs).
- Tests: reine Logik per Testseite in `scripts/run_js_tests.py`; UI per Browser-Prüfung (Desktop 1440, Mobil 390 und 320, hell und dunkel) mit Screenshots unter `docs/screenshots/`.
- Dokumentation nach docs/WORKFLOW.md (ROADMAP, DATENQUELLEN, IDEENSAMMLUNG, README, STYLEGUIDE).
- Lawinen- und Warnfarben bleiben unverändert (STYLEGUIDE). Keine externen Ressourcen ohne Self-Hosting.

---

# 3. Ebenen, Stufen und Pakete

| Ebene | Stufe | Pakete | Schicht(en) | Nutzer sieht | Neue externe Daten |
|---|---|---|---|---|---|
| 1 Kartenplattform | 1.1 Entscheidungen | RI0 | Dokumentation | nichts | – |
| 2 Route Intelligence | 2.1 Route als Objekt | RI1–RI6 | Parser, Modell, Anzeige, Speicherung | eigene GPX-Route, Statistik, Höhenprofil | keine |
| 2 Route Intelligence | 2.2 Route trifft Kartenplattform | RI7–RI10 | Analyse-Logik, Anzeige, Datenzugriff | Schutzgebiete, Sperrungen, Lawinenlage, Wetter entlang der Route (je Quelle getrennt) | keine neue Quelle |
| 3 Terrain Intelligence | 3.1 Höhenmodell | RI11–RI12 | Entscheidung, Datenzugriff | nichts (Grundlage) | DEM |
| 3 Terrain Intelligence | 3.2 Geländeanalyse | RI13–RI14 | Analyse-Logik, Anzeige | Steigung, Exposition | – |
| 3 Terrain Intelligence | 3.3 Darstellung | RI15 | Anzeige | Gelände im Profil | – |
| 3 Terrain Intelligence | 3.4 Geländecharakteristik | RI20 (zurückgestellt) | Analyse-Logik | Geländeformen | ggf. DEM mit höherer Auflösung |
| 4 Alpine Risk Intelligence | 4.1 Befunde | RI16–RI17 | Modell, Anzeige | Liste „Worauf achten?“ | – |
| 4 Alpine Risk Intelligence | 4.2 Zusammenführung | RI18 | Orchestrierung | Einstieg „Route analysieren“ | – |
| 4 Alpine Risk Intelligence | 4.3 Terrain-Befunde | RI19 | Analyse-Logik | Gelände in der Befundliste | – |
| 4 Alpine Risk Intelligence | 4.4 Risikobewertung | RI21 (Konzept, zurückgestellt) | Konzept | – | – |
| übergreifend | Kommunikation | RI-L | Dokumentation | Landing, README | – |

Warum diese Reihenfolge: Ebene 2 ist ohne Datenquelle machbar und liefert sofort Nutzen (Toolbox WEB-T6). Stufe 2.2 nutzt nur Daten, die heute im Repository liegen, und liefert den ersten Mehrwert gegenüber einer normalen GPX-Anzeige. Ebene 3 braucht eine Quellen-, Lizenz- und Cache-Entscheidung und kommt erst, wenn Ebene 2 trägt. Ebene 4 bündelt, was vorher einzeln nachvollziehbar gebaut wurde; ihre Befundmodell-Pakete können bereits auf den Ergebnissen der Stufe 2.2 aufsetzen (siehe Gates).

**Abgrenzung 2.2 gegen Ebene 4:** In 2.2 zeigt jede Quelle ihr eigenes Ergebnis in ihrer eigenen Form (Schutzgebietsliste, Lawinenstufen je Abschnitt, Wetterwerte je Stützpunkt). Erst Ebene 4 übersetzt alle in ein gemeinsames Befundformat und führt sie zusammen.

---
# 4. Ebene 1 – Kartenplattform: Entscheidungen (Stufe 1.1)

### RI0 – Grundsatzentscheidungen festhalten

Ebene 1 · Stufe 1.1. Status: Erledigt (13.11.2026). Schicht: Dokumentation. Ergebnis: Abschnitt 13.

**Ziel:** Die Entscheidungen E1 bis E14 (Abschnitt 13) vor dem ersten Code bestätigen oder ändern. Ergebnis: E1 bis E6, E8, E10, E11, E13, E14 bestätigt (E4, E5, E6, E8 vorläufig bis zur Prüfung in RI1, RI4, RI7, RI10/RI11), E7 und E12 offen mit Frist, E9 Skala bestätigt.

**Umfang:** Eintrag der Entscheidungen im Plan; kein Code.

**Voraussetzungen:** keine.

**Risiken:** Entscheidungen werden verschoben. Gegenmaßnahme: Die Empfehlungen in Abschnitt 13 gelten, solange nichts anderes entschieden ist.

**Abhängigkeiten:** keine.

**Definition of Done:** Entscheidungen stehen im Plan, PR gemerged. (Erfüllt.)

---

# 5. Ebene 2 – Route Intelligence, Stufe 2.1: Route als Objekt

Ziel: Eine eigene Tour laden, auf der Karte sehen und messen. Keine externen Daten, keine Bewertung.

### RI1 – GPX-Parser (reine Logik)

Ebene 2 · Stufe 2.1. Status: Erledigt (15.11.2026). Schicht: Parser.

**Ziel:** GPX-Text in ein Rohmodell umwandeln.

**Umfang:**
- Neues Modul `js/gpx.js` ohne Karten- und DOM-Bezug; Eingabe ein String, Ausgabe `{ name, tracks[{ segments[[{lat, lon, ele?, time?}]] }], waypoints[], warnings[] }`.
- Unterstützt `trk/trkseg/trkpt`, optional `rte/rtept` und `wpt`; `ele` und `time` optional.
- Fehlerfälle liefern verständliche Meldungen statt Ausnahmen: ungültiges XML, leere Datei, Koordinaten außerhalb des Bereichs, fehlende Höhen.
- Sicherheit: XML nur über `DOMParser`, keine Auswertung von Inhalten, Größenlimit (E4).
- Testseite `scripts/test_gpx.html` mit kleinen synthetischen GPX-Strings (gültig, mehrere Segmente, ohne Höhe, ohne Zeit, defekt, sehr groß), aufgenommen in `scripts/run_js_tests.py`.

**Nicht im Umfang:** Datei-Auswahl, Anzeige, Statistik, Glättung, Speichern.

**Voraussetzungen:** RI0.

**Risiken:** GPX-Varianten (Garmin-, Komoot-, Strava-Erweiterungen, Namensräume), Mehrdeutigkeit Track/Route, große Dateien blockieren den Hauptthread. Gegenmaßnahme: nur Kernelemente lesen, Erweiterungen ignorieren, Limit mit klarer Meldung.

**Abhängigkeiten:** keine.

**Definition of Done:** Testseite grün, Fehlerfälle getestet, keine Änderung der Oberfläche, ROADMAP („GPX-Parser“) und Plan aktualisiert, PR gemerged.

**Umsetzungshinweise (15.11.2026):**
- `js/gpx.js` exportiert `parseGpx(text)`, `MAX_BYTES` (10 MB) und `MAX_POINTS` (200 000) nach E4. Ergebnis: `{ ok, error, name, tracks, routes, waypoints, warnings }`; bei Fehlern `ok: false` mit deutscher Meldung und leeren Listen, es wird nie geworfen. `routes` (rte/rtept) kam zum Rohmodell des Plans hinzu, `name` ist `null`, wenn die Datei keinen Namen enthält. `time` ist ein Zeitpunkt in Millisekunden seit 1970 oder `null`, `ele` Meter oder `null` (E3).
- Gelesen wird nur über direkte Kindelemente (`trk/trkseg/trkpt`, `rte/rtept`, `wpt`, `metadata/name`), unabhängig von Namensraum und Präfix; Erweiterungen (`extensions`) bleiben unbeachtet, auch gleichnamige Elemente darin. Punkte mit unlesbaren oder außerhalb des Bereichs liegenden Koordinaten werden übersprungen und als Warnung gezählt; ein Track ohne gültigen Punkt gilt als Fehler. Dateien mit Dokumenttyp-Deklaration oder Entitäten werden abgelehnt.
- Messung zu E4 (Headless-Browser, synthetische Datei): 200 000 Punkte (6,5 MB, kompakte Punkte) werden in rund 2 s gelesen; 200 001 Punkte und Dateien über 10 MB werden abgelehnt. Bei üblichen Punkten mit Höhe und Zeit (rund 100 Byte je Punkt) greift die Größengrenze schon bei etwa 100 000 Punkten. **Die Werte aus E4 bleiben unverändert**; die Lesezeit von rund 2 s am Limit blockiert den Hauptthread und ist bei RI3 (Laden) mit einem Hinweis „Datei wird gelesen“ zu beachten.
- Ein Segment wird nicht zusammengesetzt (RI2); mehrere Segmente erzeugen die Warnung „Lücken in der Aufzeichnung“. Sind Track und Route vorhanden, werden beide geliefert, RI2 wählt den Track.

### RI2 – Routenmodell und Geometrie (reine Logik)

Ebene 2 · Stufe 2.1. Status: Erledigt (15.11.2026). Schicht: Modell/Geometrie.

**Ziel:** Aus dem Rohmodell ein einheitliches Routenobjekt bilden, auf dem alle späteren Analysen aufsetzen (Entwurf in Abschnitt 11).

**Umfang:**
- `js/route_model.js`: `createRoute(gpxModel)`; mehrere Segmente werden zu einer Linie zusammengesetzt, Lücken werden vermerkt.
- `js/geo.js`: Haversine-Distanz, kumulierte Strecke, Punkt bei Streckenkilometer, Abstand Punkt–Linie, Vereinfachung (Douglas-Peucker) für die Darstellung, Abtastung in festen Abständen.
- Testseite `scripts/test_route_model.html` mit bekannten Referenzdistanzen.

**Nicht im Umfang:** Höhenstatistik, Anzeige.

**Voraussetzungen:** RI1.

**Risiken:** Genauigkeit bei Sprüngen und Duplikaten. Gegenmaßnahme: Toleranzen im Test dokumentieren.

**Abhängigkeiten:** RI1.

**Definition of Done:** Funktionen getestet, Modellfelder dokumentiert, keine UI-Änderung, PR gemerged.

**Umsetzungshinweise (15.11.2026):**
- js/route_model.js exportiert createRoute(gpxModel) (Ergebnis { ok, error, route }, wirft nie) und displayLines(route, toleranceM) (Linien für die Karte, an Lücken getrennt, vereinfacht). Das Routenobjekt entspricht dem Entwurf in Abschnitt 11; ergänzt um lengthM und warnings. hasElevation/hasTime sind wahr, wenn mindestens ein Punkt Höhe bzw. Zeit hat; einzelne fehlende Höhen bleiben 
ull (RI4 muss damit umgehen).
- Auswahl: der erste Track mit allen Segmenten, ohne Track die erste Route; weitere Tracks/Routen werden nicht verwendet und als Warnung vermerkt. Lücken zwischen Segmenten werden in gaps vermerkt und **zählen nicht zur Strecke** (dist springt dort nicht); Abstands- und Darstellungsfunktionen behandeln den Sprung nicht als Linie.
- js/geo.js: haversine, cumulativeDistances, pointAtKm, sampleAlong, distanceToLine (liefert Abstand und Streckenkilometer), simplify (Douglas-Peucker, iterativ, gibt Indizes zurück). Kugelmodell (R = 6 371 008,8 m), lokale ebene Projektion für Abstand und Vereinfachung. Toleranzen im Test: 0,5 m bei Kilometerstrecken, Zentimeter bei Abstand und Interpolation. Höhen werden bei pointAtKm nur interpoliert, wenn beide Nachbarn eine Höhe haben.
- Getestet mit scripts/test_route_model.html (16 Tests, analytische Referenzwerte, 200 000 Punkte für simplify).
### RI3 – GPX laden und auf der Karte anzeigen

Ebene 2 · Stufe 2.1. Status: Erledigt (15.11.2026). Schicht: Anzeige.

**Ziel:** Der Nutzer wählt eine GPX-Datei, die Route erscheint als Ebene auf der Karte.

**Umfang:**
- Knopf „GPX laden“ (Dateiauswahl, am Desktop optional Drag & Drop) und „Route entfernen“ in einer Karte „Route“ der Seitenleiste bzw. des Sheets; ohne Route erscheint nur der Knopf, kein Platzhaltertext.
- Neue Ebenengruppe in `js/map.js`, Anmeldung in `js/layers.js` („Meine Route“), Legendenzeile, Linie, Start- und Zielmarker, Zoom auf die Route mit `fitPadded`.
- Fehler über `warn`/`unwarn`, Zustand über die Datenstatus-Leiste („Route: geladen“, ohne erfundenen Zeitstempel).
- Ladehinweis: Während die Datei gelesen wird, erscheint „Datei wird gelesen“ (Zustand „lädt“ in der Datenstatus-Leiste bzw. in der Routenkarte), danach Erfolg oder Fehlermeldung. Grund: Der Parser braucht bei Dateien am Limit (E4) rund 2 s und blockiert dabei den Hauptthread (Messung in RI1). Der Hinweis muss vor dem Parsen sichtbar gezeichnet sein (z. B. ein Frame Pause vor `parseGpx`).
- Nur eine Route gleichzeitig geöffnet (Verwaltung in RI6). Popup mit Namen über `esc()`.

**Nicht im Umfang:** Statistik, Profil, Speichern, Analyse.

**Voraussetzungen:** RI1, RI2.

**Risiken:** Überdeckung durch schwebende Karten, Performance bei sehr vielen Punkten (vereinfachte Darstellung aus RI2), Kontrast der Linie in Hell/Dunkel, Dateidialog auf iOS/Android.

**Abhängigkeiten:** RI1, RI2.

**Definition of Done:** Route lädt, wird angezeigt und lässt sich entfernen; ohne Route ist die Anwendung unverändert; Screenshots Desktop/Mobil, hell/dunkel; STYLEGUIDE ergänzt; ROADMAP aktualisiert; PR gemerged.

**Umsetzungshinweise (15.11.2026):**
- `js/route.js` (Oberfläche und Karte) und `js/route_logic.js` (rein: `checkFile`, `routeTitle`, `routeStatus`, `STATUS_LOADING`; getestet mit `scripts/test_route_load.html`). Die Karte „Route“ steht in `app.html` zwischen Wetter und Sperrungen; „Route entfernen“ erscheint erst mit einer Route, der Knopf heißt danach „Andere GPX laden“.
- Ablauf: Dateiprüfung vor dem Lesen (leer oder über 10 MB wird gar nicht gelesen), Ladehinweis „Datei wird gelesen …“ (Routenkarte und Datenstatus-Leiste), ein Frame Pause, dann `file.text()` → `parseGpx` → `createRoute`. Schlägt das Laden fehl, bleibt eine bereits geladene Route bestehen; die Meldung kommt über `warn('route', …)`. Während des Lesens ist der Knopf gesperrt.
- Anzeige: Linie aus `displayLines` (Vereinfachung 3 m, an Lücken getrennt) mit heller Kontur, Start und Ziel als Punkte mit Tooltip, Popup mit Namen über `esc()`; Zoom mit `fitPadded` (höchstens Zoomstufe 15), mobil gibt das Sheet vorher die Karte frei. Ebene „Meine Route“ und Legende werden erst beim ersten Laden im Bedienfeld angemeldet (ohne Route bleibt die Oberfläche unverändert) und bleiben nach „Route entfernen“ als leere Ebene bestehen, der Statuseintrag „Route“ verschwindet wieder (neuer Zustand `none` in `status_bar.js`). Drag & Drop der Datei auf die Karte ist umgesetzt.
- Die Datenstatus-Leiste zeigt „Route: geladen“ mit Punktzahl; Lücken und Warnungen des Parsers machen den Zustand „eingeschränkt“. Es gibt keinen Zeitstempel. Länge und Höhenmeter folgen mit RI4, nicht hier.
- Seitenleiste jetzt mit drei Karten: Auf 900 px hohen Desktops scrollt die Seitenleiste, die Liste der Sperrungen liegt unter der Routenkarte; `scripts/test_layout.html` prüft drei statt zwei Karten. Der Titel des Sheets lautet weiterhin „Wetter und Sperrungen“.
- Geprüft in einem Headless-Browser (CDP) mit synthetischer GPX (zwei Segmente, Name mit HTML-Zeichen, defekte Datei): Laden, Fehlermeldung, Entfernen, Popup maskiert; Desktop 1440 und Mobil 390 und 320, hell und dunkel. Screenshots: `docs/screenshots/route-*.png`. Echtgerät-Test (iOS/Android Dateidialog) steht aus.

### RI4 – Routenstatistik (aus den GPX-Höhen)

Ebene 2 · Stufe 2.1. Status: Erledigt (15.11.2026). Schicht: Analyse-Logik mit kleiner Anzeige.

**Ziel:** Länge, Höhenmeter und Höhenbereich der Route zeigen.

**Umfang:**
- `js/route_stats.js`: Länge, Anstieg, Abstieg, höchster und tiefster Punkt, Dauer nur bei vorhandenen Zeitstempeln. Höhen aus der Datei, mit dokumentierter Glättung (E5); fehlende Höhen als „keine Höhendaten in der Datei“.
- Anzeige als `.mr-kv`-Zeilen in der Routenkarte, mit Hinweis zur Methode.
- Testseite `scripts/test_route_stats.html`.

**Nicht im Umfang:** DEM-Höhen, Steigung, Profil, Gehzeitschätzung.

**Voraussetzungen:** RI2, RI3.

**Risiken:** Abweichung der Höhenmeter zu anderen Apps. Gegenmaßnahme: Methode im UI nennen.

**Abhängigkeiten:** RI2, RI3.

**Definition of Done:** Werte gegen Referenzstrecken getestet, Methodenhinweis sichtbar, Dokumentation und ROADMAP aktualisiert, PR gemerged.

**Umsetzungshinweise (15.11.2026):**
- `js/route_stats.js` (rein): `routeStats(route, hysteresisM)` liefert Länge, Anstieg, Abstieg, höchsten und tiefsten Punkt, Zahl der Punkte mit und ohne Höhe und die Dauer; `statsRows(stats)` liefert die Anzeigezeilen, den Methodenhinweis und einen Datenhinweis. Getestet mit `scripts/test_route_stats.html` (12 Tests). Die Oberfläche (`js/route.js`) berechnet die Statistik einmal beim Laden und zeigt sie als `.mr-kv` in der Routenkarte; Analyseergebnisse hängen nicht an der Route.
- Verfahren (E5): Hysterese mit Bezugspunkt, Schwelle `HYSTERESIS_M = 5`. Eine Änderung zählt, sobald sie seit dem letzten gezählten Bezugspunkt mindestens 5 m beträgt (genau 5 m zählt, 4,9 m nicht). Der Bezugspunkt wird an Lücken zurückgesetzt, ein Höhensprung über eine Lücke zählt nicht. Eine am Ende noch unter der Schwelle liegende Änderung zählt nicht. Höchster und tiefster Punkt sind ungeglättete Rohwerte der Datei.
- Fehlende Höhen: Einzelne fehlende Höhen werden übersprungen, die Zahl steht als Hinweis in der Anzeige („x von n Punkten haben keine Höhe“). Ohne jede Höhe erscheint nur die Länge und „Höhen: keine Höhendaten in der Datei“, kein Methodenhinweis. Die Dauer („Dauer der Aufzeichnung“, erster bis letzter Zeitstempel, Pausen eingeschlossen) erscheint nur mit mindestens zwei verschiedenen Zeitstempeln in richtiger Reihenfolge.
- Länge ist `route.lengthM` aus RI2 (Lücken zählen nicht). Anzeige in Metern unter 1 km, sonst Kilometer mit einer Nachkommastelle.
- Kalibrierung zu E5: Geprüft an synthetischen Referenzstrecken mit bekanntem Anstieg (glatt exakt; mit ±2 m Rauschen bleibt der Anstieg bei 500 m innerhalb von 6 m, auf flacher Strecke werden 0 m gezählt, eine Rohsumme käme dort auf 4 m je Punkt). **E5 bleibt „bestätigt, vorläufig“**: Echte Aufzeichnungen (Smartphone, Barometer, Uhr) und der Vergleich mit anderen Apps stehen aus; der Wert 5 m ist eine benannte Konstante und lässt sich ändern.
- Geprüft in einem Headless-Browser mit synthetischer GPX (60 Punkte, Höhen, Zeitstempel, Name mit HTML-Zeichen): Statistik erscheint, der Name bleibt als Text. Screenshots stehen aus.
### RI5 – Höhenprofil

Ebene 2 · Stufe 2.1. Status: Erledigt (15.11.2026). Schicht: Anzeige (Diagramm).

**Ziel:** Profil Höhe über Strecke, verbunden mit der Karte (Toolbox WEB-T6).

**Umfang:**
- `js/elevation_profile.js`: SVG-Diagramm ohne Chart-Bibliothek, Achsenbeschriftung, Hover/Touch zeigt die Position auf der Karte, Tastaturbedienung, Textalternative mit Kerndaten.
- Platz in der Routenkarte; keine neue schwebende Karte.
- Skalierung und Abtastung als getestete Logik.

**Nicht im Umfang:** Steigungsfärbung (RI15), Befundmarker (RI17).

**Voraussetzungen:** RI4.

**Risiken:** Platz mobil, Touch-Genauigkeit, Performance (Abtastung auf Pixelbreite).

**Abhängigkeiten:** RI4.

**Definition of Done:** Profil Desktop und Mobil lesbar, Karte und Diagramm verbunden, Kontrast AA, Screenshots, Dokumentation, PR gemerged.

**Umsetzungshinweise (15.11.2026):**
- `js/profile_logic.js` (rein, getestet mit `scripts/test_profile.html`, 13 Tests): `profileSeries` (Linienzüge aus den Punkten mit Höhe, getrennt an Lücken; einzelne fehlende Höhen werden übersprungen, nie als 0 gezeichnet; ohne mindestens zwei Höhenwerte kein Profil), `decimate` (Abtastung auf Pixelbreite: je Pixelspalte höchstens kleinster und größter Wert, Spitzen bleiben erhalten), `niceTicks` und `makeScale` (1-2-5-Achsenmarken, mindestens 20 m Höhenbereich, damit flache Strecken nicht aufgeblasen werden), `profilePaths`, `stepPosition` (Tastaturschritte), `positionText`, `profileSummary`. Beim Test fiel ein Gleitkommarest in den Achsenmarken (0,30000000000000004) auf; behoben.
- `js/elevation_profile.js` (Oberfläche): SVG in der Routenkarte unter der Statistik, keine neue schwebende Karte. Maus (Hover), Touch (waagerechtes Wischen, `touch-action: pan-y`) und Tastatur (Pfeile 1 %, Bild 10 %, Pos1/Ende, Esc) melden die Position an `js/route.js`; dort erscheint ein Marker in der Routenebene. Der Marker wird bei Bedarf mit `panInside` und den überdeckten Rändern aus `coveredInsets` ins freie Kartenfeld geholt (mobil verdeckt das Sheet einen Teil der Karte). Die Breite folgt der Karte (ResizeObserver); ohne Höhendaten bleibt der Bereich verborgen (die Statistik nennt „keine Höhendaten in der Datei“).
- Barrierefreiheit: Das Diagramm ist ein `role="slider"` mit `aria-valuetext` („km 7,1 · 1.457 m“), sichtbarem Textfeld mit derselben Angabe und einer Textalternative mit Kerndaten (Länge, tiefster/höchster Punkt, Anstieg, Abstieg). Linie und Beschriftung nutzen die vorhandenen Farben `--mr-route`/`--mr-text-muted`; ein gesonderter Kontrastnachweis (AA) mit Messwerten steht noch aus. STYLEGUIDE ergänzt.
- Geprüft in einem Headless-Browser (CDP) mit synthetischer GPX (300 Punkte, eine Lücke): Desktop 1440, Mobil 390 und 320, hell und dunkel; Maus-Hover, Touch, Tastatur, Marker auf der Karte, Entfernen der Route (Profil und Marker verschwinden). Screenshots: `docs/screenshots/profil-*.png`. Dabei fiel ein Fehler auf (der Marker erschien nach dem Ausblenden nicht wieder) und wurde behoben. Echtgerät-Test (Touch-Genauigkeit, iOS/Android) steht aus.

### RI6 – Routenverwaltung (lokal)

Ebene 2 · Stufe 2.1. Status: Erledigt (15.11.2026), auf ausdrücklichen Wunsch vor der Rückmeldung zu RI3 bis RI5 umgesetzt. Schicht: Speicherung.

**Ziel:** Mehrere Routen im Browser behalten, wechseln, benennen, löschen, exportieren.

**Umfang:** Speicherung nach E2 (Empfehlung IndexedDB), Liste „Meine Routen“, Umbenennen, Löschen, GPX-Export; Hinweis, dass Daten nur auf diesem Gerät liegen. Test der Speicherlogik inklusive Fehlerfälle (Speicher voll, privater Modus).

**Nicht im Umfang:** Konto, Synchronisation, Teilen, Server.

**Voraussetzungen:** RI3, E2.

**Risiken:** Datenverlust durch Browserbereinigung, Speicherlimits, Datenschutz (Routen verraten Wohnorte). Gegenmaßnahme: Export, deutliche Hinweise, keine Übertragung.

**Abhängigkeiten:** RI3, E2.

**Definition of Done:** Routen überleben Neuladen, Löschen entfernt sie vollständig, Fehlerfälle sichtbar, Dokumentation, PR gemerged.

**Umsetzungshinweise (15.11.2026):**
- Speicher (E2): IndexedDB-Datenbank `bergbedingungen-routes` (Version 1) mit zwei Speichern: `routes` (Kopfdaten: `id`, `name`, `lengthM`, `points`, `bytes`, `savedAt`) und `files` (Originaltext der GPX-Datei unter derselben `id`). Beide werden in **einer** Transaktion geschrieben und gelöscht, sodass nichts halb gespeichert wird und nach dem Löschen nichts zurückbleibt (im Test auch im Rohspeicher geprüft). Gespeichert wird der Originaltext, nicht das Routenobjekt: Der Export ist verlustfrei, und Parser und Statistik können sich ändern, ohne dass ein Datenformat migriert werden muss. Beim Öffnen wird die Datei wie beim Laden neu gelesen (`parseGpx` → `createRoute`).
- Module: `js/route_store.js` (IndexedDB, `createStore`: `list`, `add`, `getFile`, `rename`, `remove`), `js/route_store_logic.js` (rein: Namen, Grenzen, Sortierung, Dateiname, Fehlertexte, Hinweistext), `js/route_saved.js` (Liste „Meine Routen“), Anbindung in `js/route.js`. Getestet mit `scripts/test_route_store.html` (11 Tests, echtes IndexedDB mit eigener Test-Datenbank: Neuladen simuliert durch neue Verbindung, Umbenennen, doppelte Kennung, vollständiges Löschen, fehlendes IndexedDB). Weil IndexedDB in einem eigenen Thread läuft, wartet der Modus `--dump-dom` mit virtueller Zeit nicht darauf; `scripts/run_js_tests.py` führt diese Seite daher über den kleinen Chrome-DevTools-Client `scripts/cdp_client.py` (nur Standardbibliothek) in echter Zeit aus.
- Bedienung: Speichern ist **ausdrücklich** („Auf diesem Gerät speichern“ erscheint, sobald eine nicht gespeicherte Route geöffnet ist); nichts wird automatisch abgelegt, weil Routen Wohnorte verraten können. Die Karte „Meine Routen“ erscheint erst mit mindestens einer gespeicherten Route (ohne Routen bleibt die Oberfläche unverändert) und zeigt je Route Name, Länge und Speicherdatum (das Datum des Speicherns, kein erfundener Zeitstempel). Aktionen: Öffnen, Umbenennen (Eingabefeld in der Zeile, Enter/Esc), Exportieren (Originaldatei, Dateiname aus dem Namen), Löschen (mit Rückfrage). Die geöffnete Route ist als „Geöffnet“ markiert. Hinweis in der Liste: Routen liegen nur in diesem Browser auf diesem Gerät, nichts wird übertragen, eine Browserbereinigung kann sie löschen, daher Export.
- Grenzen: höchstens 20 gespeicherte Routen (`MAX_ROUTES`), Namen höchstens 80 Zeichen; je Datei gilt weiter die Grenze von 10 MB aus E4. Der Export gibt die Originaldatei zurück; ein nach dem Speichern geänderter Name steht nur im Dateinamen und in der Liste, nicht im `<name>` der GPX-Datei.
- Fehlerfälle: Speicher voll (`QuotaExceededError`), IndexedDB nicht verfügbar (fehlt, gesperrt, privater Modus), Route nicht gefunden und Limit erreicht erscheinen als Meldung über `warn('route', …)`; die geöffnete Route bleibt dabei unverändert. Ist der Speicher beim Start nicht verfügbar, bleibt die Oberfläche still, der Hinweis erscheint erst beim Versuch zu speichern.
- Geprüft in einem Headless-Browser (CDP): Laden → Speichern → Neuladen → Öffnen → Umbenennen → Exportieren → Löschen (danach 0 Köpfe und 0 Dateien im Speicher); Name mit HTML-Zeichen bleibt Text; Fehlertext bei nicht verfügbarem IndexedDB; Desktop 1440 hell und dunkel, Mobil 390 dunkel. Screenshots: `docs/screenshots/verwaltung-*.png`. **Nicht geprüft:** echter privater Modus und echter voller Speicher, Echtgerät (iOS/Android; Safari löscht Website-Daten nach längerer Nichtnutzung), Verhalten bei mehreren offenen Tabs.
- Offen: Rückmeldung zu Bedienung und Grenzen (20 Routen). `navigator.storage.persist()` wurde bewusst nicht eingebaut, weil die Anfrage ein Bestätigungsfenster auslösen kann.

---
# 6. Ebene 2 – Route Intelligence, Stufe 2.2: Route trifft Kartenplattform (Übergangsphase)

Ziel: Die Route mit Daten verknüpfen, die Mountain Radar schon besitzt. Keine neue Datenquelle, kein DEM. Logik und Anzeige kommen in getrennten PRs.

### RI7 – Räumlicher Schnitt Route × Polygone (reine Logik)

Ebene 2 · Stufe 2.2. Status: Erledigt (15.11.2026). Schicht: Analyse-Logik.

**Ziel:** Berechnen, welche Streckenabschnitte (von km bis km) in welchen Polygonen liegen.

**Umfang:**
- `js/route_overlay.js`: Punkt-in-Polygon (Löcher, MultiPolygon), Bounding-Box-Vorauswahl, Abschnittsbildung entlang der Route; Abtastung in festen Abständen (E6).
- Allgemein gehalten: Eingabe Route plus GeoJSON-Features, Ausgabe `{ featureId, fromKm, toKm }`. Kennt weder Schutzgebiete noch Lawinen.
- Testseite `scripts/test_route_overlay.html`.

**Nicht im Umfang:** Daten laden, Anzeige, Regeln der Gebiete.

**Voraussetzungen:** RI2.

**Risiken:** Performance mit `data/protected_areas_alps.geojson`, Randfälle an Polygongrenzen. Gegenmaßnahme: Bounding-Box-Filter, Messung an der echten Datei.

**Abhängigkeiten:** RI2.

**Definition of Done:** Logik inklusive Randfällen getestet, Laufzeitmessung dokumentiert, keine UI-Änderung, PR gemerged.

**Umsetzungshinweise (15.11.2026):**
- `js/route_overlay.js` (rein, keine UI-Änderung): `routeOverlay(route, features, opts)` liefert `{ sections: [{ featureId, fromKm, toKm }], skipped }`, sortiert nach `fromKm`; `prepareFeatures(features, idOf)` bereitet die Features einmal vor (flache Ringe, Umgebungsrechteck je Polygon und Feature) und lässt sich für mehrere Routen wiederverwenden; `pointInPolygon(lon, lat, polygon)` (Strahlverfahren, Löcher, MultiPolygon). Unterstützt `Polygon` und `MultiPolygon` (seit RI8 auch Linien und Punkte, siehe dort); andere oder ungültige Geometrien werden übersprungen und in `skipped` gezählt, die Funktionen werfen nie. Kennung: `feature.id`, sonst `properties.uuid` (so heißt sie in `protected_areas_alps.geojson`), sonst `properties.id`, sonst der Index; mit `opts.idOf` überschreibbar.
- Verfahren (E6): Abtastung je zusammenhängendem Routenstück (an Lücken getrennt) alle 25 m (`SAMPLE_STEP_M`, mit `opts.stepM` änderbar). Je Probe werden nur Features geprüft, deren Umgebungsrechteck sie enthält; Features außerhalb der Routen-Begrenzung entfallen vorab. Aufeinanderfolgende Proben innerhalb eines Features bilden einen Abschnitt; Ein- und Austritt werden zwischen der letzten Probe außen und der ersten innen durch Halbieren auf rund 1,5 mm eingegrenzt. Abschnitte entstehen also aus Ereignissen, die Genauigkeit der Grenzen hängt nicht vom Abtastabstand ab (Test mit 7, 25 und 100 m). Abschnitte reichen nie über eine Lücke der Route hinweg; die Kilometerangaben sind Streckenkilometer des Routenobjekts (Lücken zählen nicht zur Strecke).
- **Bekannte Grenze:** Eine Durchquerung, die kürzer als der Abtastabstand ist und zwischen zwei Proben liegt, wird nicht gefunden (im Test: 5 m breites Polygon zwischen zwei Proben entgeht, 60 m breites wird gefunden). Ein Punkt genau auf dem Polygonrand gilt je nach Kante als innen oder außen; das wirkt sich nur im Millimeterbereich aus.
- Messung an der echten Datei (Headless-Browser, `data/protected_areas_alps.geojson`, 2 551 Features, 15,8 MB; synthetische Route Garmisch bis Meran, 111 km, 1 001 Punkte): Vorbereitung aller Features rund 280 ms (einmalig), Schnitt rund 80 bis 90 ms, 3 Abschnitte. Mit 5 m statt 25 m Abtastung ergeben sich dieselben 3 Abschnitte mit derselben Gesamtlänge; E6 (25 m) bleibt damit für diese Strecke bestätigt. **Das ist eine einzelne Strecke**: ein Vergleich an mehreren echten Touren in dichten Schutzgebietsgebieten steht aus, E6 bleibt „bestätigt, vorläufig“.
- Getestet mit `scripts/test_route_overlay.html` (14 Tests; laufen im Runner über den DevTools-Client in echter Zeit, weil die Laufzeit gemessen wird): Punkt in Polygon (Loch, konkave Form), Ein- und Austritt, Start oder Ziel im Polygon, MultiPolygon, Loch trennt Abschnitt, überlappende Features, Lücke, Unabhängigkeit vom Abtastabstand, Abtastgrenze, ungültige Eingaben, leere Eingaben, einzelner Punkt, echte Daten.

### RI8 – Schutzgebiete und Sperrungen entlang der Route

Ebene 2 · Stufe 2.2. Status: Erledigt (15.11.2026). Schicht: Anzeige auf vorhandener Logik.

**Ziel:** „Diese Route berührt folgende Schutzgebiete und Sperrungen“ mit Abschnitt und Regeln.

**Umfang:**
- RI7 auf die bereits geladenen Schutzgebiete und Sperrungen/Hinweise anwenden (kein neuer Abruf); Liste „Entlang der Route“ mit Namen, Kategorie, km-Bereich; Klick springt zum Abschnitt und öffnet das vorhandene Popup.
- Betroffene Streckenabschnitte auf der Karte hervorheben (ohne Änderung der Warnfarben).
- Neutrale Sprache („berührt“), Regeln wie im Popup mit Quelle und Stand.
- Zustand „noch nicht geladen“ statt leerem „keine Treffer“.

**Nicht im Umfang:** Bewertung („Konflikt“), Empfehlungen, Gesamturteil.

**Voraussetzungen:** RI3, RI7.

**Risiken:** „Keine Treffer“ wirkt wie „kein Risiko“. Gegenmaßnahme: Formulierung „In den geladenen Daten keine Überschneidung“ mit Datenstand.

**Abhängigkeiten:** RI3, RI7.

**Definition of Done:** Treffer stimmen mit der Kartendarstellung überein (Stichproben an echten Gebieten), Lade- und Fehlerzustände, Screenshots, Dokumentation, PR gemerged.

**Umsetzungshinweise (15.11.2026):**
- Aufbau: `js/route_sources.js` (Anmeldestelle ohne Abhängigkeiten: Quellen melden `{ state, features, describe(index), count, stand }`), `js/route_context_logic.js` (rein: Einträge bilden, Texte, Zusammenfassung, Linienzug eines Abschnitts), `js/route_context.js` (Oberfläche und Hervorhebung auf der Karte). `js/protected_areas.js` und `js/closures.js` melden nach dem Laden bzw. bei Fehlern ihre bereits geladenen Daten; es gibt keinen neuen Abruf. Ein `describe` liefert Titel, Kategorie bzw. Zeitraum und genau das Popup-HTML der Karte; Flächen desselben Gebiets (Name und Kategorie wie in der globalen Suche) werden zu einem Eintrag vereint, berührende Abschnitte verschmelzen.
- **Erweiterung von RI7 (nötig, weil Sperrungen fast nur Linien und Punkte sind):** In den Daten stehen 1 046 Sperrungen als MultiLineString, 184 als Punkt und nur 9 als Fläche. `route_overlay.js` behandelt deshalb auch Linien und Punkte: berührt, wenn die Route höchstens `NEAR_M = 30` m entfernt ist (vorläufig, in Höhe der GPS-Genauigkeit; änderbar über `opts.nearM`). Das 60 m breite Band ist breiter als der Abtastabstand von 25 m, eine Kreuzung entgeht also nicht (Test über 25 Lagen). Außerdem wird je Routenstück nur einmal abgetastet statt je Feature. Zusätzliche Tests in `scripts/test_route_overlay.html` (jetzt 19).
- Anzeige: Block „Entlang der Route“ in der Routenkarte unter dem Profil, nur mit geöffneter Route. Kopfzeile neutral („Die Route berührt 2 Schutzgebiete und 1 Sperrung oder Hinweis.“), darunter je Quelle eine Liste mit Name, Kategorie bzw. Typ und Zeitraum, Kilometerbereich. Klick auf einen Eintrag springt zum ersten Abschnitt (mit `fitPadded`, mobil gibt das Sheet vorher die Karte frei) und öffnet dasselbe Popup wie in der Karte, mit Regeln bzw. Quelle. Betroffene Abschnitte sind auf der Karte als gepunktete Linie in der Oberflächenfarbe (`--mr-surface`) über der Routenlinie hervorgehoben; die Warnfarben bleiben unverändert. Mit „Route entfernen“ verschwinden Block und Hervorhebung.
- **Zustände und Formulierung:** „In den geladenen Daten keine Überschneidung.“ erscheint nur, wenn beide Quellen geladen sind, und trägt immer den Zusatz, dass das keine Aussage über Risiken ist, die in diesen Daten fehlen. Solange eine Quelle noch lädt oder gescheitert ist, steht „Noch nicht vollständig geprüft.“ mit der Zeile „… werden noch geladen / nicht verfügbar, hier nicht geprüft“; vorhandene Treffer der anderen Quelle werden trotzdem gezeigt. Datenstand: Sperrungen mit dem Zeitstempel der Datei, Schutzgebiete „ohne Zeitangabe in der Datei“ (wie in der Datenstatus-Leiste, nichts erfunden). Sperrungen ohne Daten (leere Datei) gelten als nicht verfügbar. Abgelaufene Sperrungen zählen nicht; der Filter im Bedienfeld und der Kartenausschnitt wirken nicht auf die Auswertung.
- Getestet mit `scripts/test_route_context.html` (8 Tests: Bereiche und Formate, Vereinigung und Verschmelzen, alle Zusammenfassungs-Zustände, Datenstand, Linienzug, Zusammenspiel mit dem Schnitt, Anmeldestelle) und an den echten Daten in `scripts/test_route_overlay.html`: Route entlang einer echten Sperrlinie findet sie über die ganze Länge (1 239 Einträge: Vorbereitung rund 75 ms, Schnitt wenige ms). Geprüft in einem Headless-Browser (CDP) mit der echten App: Route entlang der Sperrung „Sperre Schutzsteig Nasskamm - GH Moassa“ und durch das Schutzgebiet „Hochreuthe“ (Punkt per RI7-Funktion als innen bestätigt): jeweils genau ein Eintrag, nach Klick öffnet sich das Popup mit demselben Titel; Route in der Nordsee: „keine Überschneidung“; blockierte Sperrungsdatei: „nicht verfügbar, hier nicht geprüft“, Schutzgebiets-Treffer bleiben sichtbar; Desktop 1440 und Mobil 390, hell und dunkel. Screenshots: `docs/screenshots/entlang-route-*.png`.
- **Nicht geprüft / offen:** Stichproben an mehreren echten Touren (bisher zwei Beispiele); Echtgerät; Grenzwert 30 m ist ungeprüft gegen echte GPS-Spuren (E6 und `NEAR_M` bleiben vorläufig). Kontrastnachweis (AA) für die gepunktete Hervorhebung steht aus. Die Auswertung gilt für die beim Laden vorhandenen Daten; wird die Seite lange offen gelassen, ändert sich der Status „aktuell/geplant“ einer Sperrung nicht mehr.

### RI9 – Lawinenlage entlang der Route

Ebene 2 · Stufe 2.2. Status: Geplant. Zwei PRs: RI9a Analyse-Logik, RI9b Anzeige.

**Ziel:** Für Routenabschnitte Region und Gefahrenstufe in der jeweiligen Höhe nennen.

**Umfang:**
- RI9a (`js/route_avalanche.js`): Region je Abschnitt über RI7 mit den Regionspolygonen; Stufe je Abschnitt mit `levelAtAltitude(bulletin, ele)`; Ergebnis enthält `uncertain` (Waldgrenze ohne Zahl), Berichtsstatus (`bulletinStatus`) und Quelle. Ohne Höhe in der Route: höchste Stufe der Region, so gekennzeichnet.
- RI9b: Abschnitte mit km-Bereich, Stufe (bestehende Chips und Farben), Lawinenprobleme der Region, Link zur Quelle. Nebensaison: „Kein aktueller Lawinenbericht“, nicht „keine Gefahr“. Hinweis, dass die Lawinenlage ein Regionalbericht ist und keine einzelne Route beschreibt.

**Nicht im Umfang:** Exposition und Hangneigung (Ebene 3), Empfehlung zum Gehen oder Lassen.

**Voraussetzungen:** RI3, RI7. Der Browser-Test der Lawinenlage mit echten Berichten ist ab Saisonstart 2026/27 offen (ROADMAP); RI9b wird erst danach gemergt, RI9a kann vorher mit Testdaten entstehen.

**Risiken:** Region ohne Bericht, Waldgrenze ohne Zahl, abgelaufene Berichte, Missverständnis als Freigabe. Gegenmaßnahme: neutrale Texte, Quelle und Stand in jeder Zeile.

**Abhängigkeiten:** RI3, RI7; für RI9b der Saisontest.

**Definition of Done:** Logik gegen Testdaten mit Höhengrenzen getestet, Anzeige mit echtem Bericht geprüft, Hinweistexte abgestimmt, Dokumentation, PR gemerged.

### RI10 – Wetter entlang der Route

Ebene 2 · Stufe 2.2. Status: Geplant. Zwei PRs: RI10a Datenzugriff, RI10b Anzeige.

**Ziel:** Wetterlage an wenigen Stützpunkten, keine Prognose für die ganze Tour.

**Umfang:**
- RI10a: Auswahl von höchstens 5 bis 8 Stützpunkten (Start, Ziel, höchster Punkt, Zwischenpunkte); Abruf- und Auswertefunktion aus `js/weather.js` als wiederverwendbares Modul herauslösen (Verhalten der Wetterkarte unverändert); Zwischenspeicher je Punkt und Stunde.
- RI10b: Anzeige je Stützpunkt (Temperatur, Wind, Böen, Nullgradgrenze, Niederschlag); Nullgradgrenze neben der Höhe des Abschnitts als reine Gegenüberstellung.
- Zunächst nur „jetzt“ und die vorhandenen Tageswerte; eine Startzeit-Auswahl ist ein späteres Paket.

**Nicht im Umfang:** neue Wettermodelle, GeoSphere (AP-2.1), Gewitterrisiko, „Wetterfenster“.

**Voraussetzungen:** RI3 (RI4 für den höchsten Punkt).

**Risiken:** Abfragelimits, Datenschutz (Stützpunkte gehen an Open-Meteo), Aussagekraft von Modellpunkten im Hochgebirge. Gegenmaßnahme: wenige, gerundete Punkte, Hinweis zur Modellhöhe wie in der Wetterkarte, Quelle sichtbar.

**Abhängigkeiten:** RI3.

**Definition of Done:** Abfragen gedrosselt und zwischengespeichert, Fehlerzustände sichtbar, Datenschutzhinweis, DATENQUELLEN aktualisiert, bestehende Wetterkarte unverändert, PR gemerged.

---

# 7. Ebene 3 – Terrain Intelligence (Stufen 3.1 bis 3.4)

Ziel: Eigene Geländeinformation aus einem Höhenmodell. Hier liegt das größte technische und rechtliche Risiko; die Ebene beginnt mit Entscheidung und Prototyp, nicht mit Produktcode.

### RI11 – DEM-Quellenentscheidung und Spike

Ebene 3 · Stufe 3.1. Status: Geplant. Schicht: Recherche/Entscheidung.

**Ziel:** Quelle, Format, Abruf, Lizenz und Cache festlegen (E7, E8).

**Umfang:**
- Vergleich der Optionen: Österreichisches DGM (data.gv.at, 10 m, CC BY 4.0, nur Österreich), alpenweite Modelle (z. B. Copernicus GLO-30), swisstopo swissALTI3D für die Schweiz; Abruf als Kacheln direkt im Browser, als vorberechnete statische Kacheln oder über einen Dienst.
- Gemessen werden: Auflösung, Abdeckung (Ost-, West-, Südalpen), Datenmenge je Tour, Abruf ohne Backend (CORS), Lizenz und Namensnennung, Aktualität.
- Ergebnis: Entscheidungsvorlage in Abschnitt 13 und Korrektur des Eintrags in DATENQUELLEN. Der Prototyp bleibt außerhalb der Anwendung.

**Nicht im Umfang:** Einbindung in die Anwendung.

**Voraussetzungen:** RI0; sinnvoll nach RI5 (GPX-Höhen als Vergleich).

**Risiken:** Keine Quelle erfüllt „frei, ohne Backend, alpenweit“; Namensnennungspflicht; Datenmenge.

**Abhängigkeiten:** RI0.

**Definition of Done:** Entscheidung dokumentiert, DATENQUELLEN korrigiert, Folgepakete bei Bedarf angepasst, PR gemerged.

### RI12 – DEM-Zugriff (Höhe an einem Punkt)

Ebene 3 · Stufe 3.1. Status: Geplant. Schicht: Datenzugriff.

**Ziel:** Modul, das für Koordinaten die Geländehöhe liefert.

**Umfang:** `js/dem.js` mit `elevationAt(lat, lon)` und `elevationsAlong(points)`, bilineare Interpolation, Kachel-Zwischenspeicher, klare Fehler („Kachel nicht verfügbar“, „außerhalb der Abdeckung“); NoData wird „unbekannt“, nie 0. Statusmeldung in der Datenstatus-Leiste. Interpolation als getestete Logik; Vergleichsseite für Entwickler (GPX-Höhen gegen DEM an bekannten Gipfeln).

**Nicht im Umfang:** Steigung, Exposition, Anzeige.

**Voraussetzungen:** RI11.

**Risiken:** Kachelgrenzen, Cache-Größe, Dienstausfall.

**Abhängigkeiten:** RI11.

**Definition of Done:** Höhen an Referenzpunkten innerhalb dokumentierter Toleranz, Fehlerfälle getestet, Lizenzhinweis im Fußbereich, DATENQUELLEN aktualisiert, PR gemerged.

### RI13 – Steigung entlang der Route

Ebene 3 · Stufe 3.2. Status: Geplant. Zwei PRs: RI13a Logik, RI13b Anzeige.

**Ziel:** Hangneigung des Geländes je Routenabschnitt.

**Umfang:**
- RI13a: Neigung aus dem DEM (Umfeld des Punktes, nicht aus der verrauschten GPX-Linie); Methode dokumentiert (Fenstergröße, Unterschied Wegneigung/Hangneigung); je Abschnitt Mittel und Maximum.
- RI13b: Anzeige in Klassen (z. B. unter 30°, 30° bis 35°, 35° bis 40°, über 40°; Klassengrenzen mit Quelle) in Liste und Profil.
- Hinweis: Neigung aus einem Modell begrenzter Auflösung; keine Aussage über Lawinengefahr.

**Nicht im Umfang:** Exposition, Lawinengelände-Klassifikation, Bewertung.

**Voraussetzungen:** RI12, RI5.

**Risiken:** Auflösung glättet Steilstufen und Grate; Zahlen werden als Gefahrenurteil missverstanden. Gegenmaßnahme: Hinweistext, Methodenbeschreibung.

**Abhängigkeiten:** RI12.

**Definition of Done:** Logik gegen synthetische Hänge getestet, Stichproben gegen eine Referenzkarte dokumentiert, Anzeige in Hell/Dunkel/Mobil, PR gemerged.

### RI14 – Exposition entlang der Route

Ebene 3 · Stufe 3.2. Status: Geplant. Zwei PRs: RI14a Logik, RI14b Anzeige.

**Ziel:** Himmelsrichtung, in die das Gelände an der Route abfällt.

**Umfang:**
- RI14a: Exposition aus dem DEM in acht Sektoren (wie die Lawinenrose); bei flachem Gelände „flach“ statt einer Richtung.
- RI14b: Anzeige je Abschnitt; Gegenüberstellung mit den im Bericht genannten Expositionen als Information („Lawinenproblem betrifft N, NO, O; Abschnitt exponiert NO“), ohne Schlussfolgerung.

**Nicht im Umfang:** automatische Einstufung, Gesamtwertung.

**Voraussetzungen:** RI13; RI9 für die Gegenüberstellung.

**Risiken:** Exposition an flachem Gelände und Graten instabil. Gegenmaßnahme: Mindestneigung.

**Abhängigkeiten:** RI13, RI9.

**Definition of Done:** Logik inklusive Randfällen getestet, Anzeige geprüft, Dokumentation, PR gemerged.

### RI15 – Gelände im Höhenprofil

Ebene 3 · Stufe 3.3. Status: Geplant. Schicht: Anzeige.

**Ziel:** Steigung und Exposition im bestehenden Profil.

**Umfang:** Band oder Färbung nach Neigungsklasse, Hover zeigt Neigung und Exposition, schaltbar. Keine neue Berechnung.

**Voraussetzungen:** RI5, RI13 (RI14).

**Risiken:** Farbkonflikt mit Lawinenfarben (unverändert laut STYLEGUIDE). Gegenmaßnahme: eigene Palette, die nicht mit Lawinenstufen verwechselt wird, im STYLEGUIDE dokumentiert.

**Abhängigkeiten:** RI5, RI13.

**Definition of Done:** Umschaltbar, Kontrast AA, Screenshots, PR gemerged.

### RI20 – Geländecharakteristik (zurückgestellt)

Ebene 3 · Stufe 3.4. Status: Zurückgestellt. Schicht: Analyse-Logik.

**Ziel:** Geländeformen entlang der Route beschreiben (Grat, Steilstufe, Mulde, Rinne), soweit das Höhenmodell das verlässlich hergibt.

**Umfang:** Nur Konzept und Machbarkeitsprüfung mit Stichproben; Entscheidung, ob die Auflösung der gewählten DEM-Quelle ausreicht. Kein Produktcode, bevor das nachgewiesen ist.

**Voraussetzungen:** RI13, RI14 im Einsatz; DEM-Auflösung aus RI11 bekannt.

**Risiken:** 10 bis 30 m Auflösung bildet Grate, Rinnen und Steilstufen oft nicht ab; Ergebnisse wirken genauer, als sie sind. Gegenmaßnahme: Wenn die Auflösung nicht reicht, bleibt das Paket zurückgestellt.

**Abhängigkeiten:** RI13, RI14.

**Definition of Done:** Entscheidung „machbar/nicht machbar“ mit Stichproben dokumentiert; bei „machbar“ folgen eigene Pakete.
---

# 8. Ebene 4 – Alpine Risk Intelligence (Stufen 4.1 bis 4.4)

Ziel: Die Ergebnisse der Einzelanalysen einheitlich als **Befunde** darstellen, ohne Gesamtnote. Erst hier wird aus Route Intelligence die Alpine Risk Engine (Beta, ROADMAP Phase 3).

### RI16 – Befundmodell (Schema, keine UI)

Ebene 4 · Stufe 4.1. Status: Geplant. Schicht: Modell.

**Ziel:** Gemeinsame Form für alle Aussagen der Engine.

**Umfang:**
- Schema `Finding`: `id`, `module` (`protected_area`, `closure`, `avalanche`, `weather`, `terrain`), `severity` (`info`, `hinweis`, `beachten`; bewusst keine Zahlen 0–5, solange E9 offen ist), `fromKm`, `toKm`, `title`, `explanation`, `evidence` (Rohwerte), `source` (Name, URL, Stand), `limits` (was nicht bekannt ist).
- Adapter je Modul, die Ergebnisse aus RI8, RI9, RI10, RI13/14 in Befunde übersetzen, ohne die Analysemodule zu ändern.
- Testseite mit Beispielbefunden; Schema dokumentiert in `docs/ALPINE_RISK_ENGINE.md` (neuer Abschnitt, bestehender Text bleibt).

**Nicht im Umfang:** Darstellung, Gewichtung, Gesamtwert.

**Voraussetzungen:** mindestens zwei der Pakete RI8, RI9, RI10, damit das Schema an echten Ergebnissen geprüft wird.

**Risiken:** Schema zu früh festgelegt. Gegenmaßnahme: Schemaversion (`mountain-radar/finding/1`), Änderungen per eigenem PR.

**Abhängigkeiten:** RI8 bis RI10.

**Definition of Done:** Schema dokumentiert, Adapter getestet, PR gemerged.

### RI17 – Befundliste „Worauf achten?“

Ebene 4 · Stufe 4.1. Status: Geplant. Schicht: Anzeige.

**Ziel:** Die zentrale Frage der Roadmap beantworten: „Wenn ich diese Tour morgen gehe, worauf muss ich achten?“

**Umfang:**
- Karte „Worauf achten?“: Befunde nach Kilometer sortiert, je Befund Titel, Abschnitt, Quelle und Stand, aufklappbare Erklärung; Klick springt zu Karte und Profil; Markierungen im Profil; Filter nach Modul.
- Kein Befund ohne Quelle. Kein Gesamtrisiko, keine Ampel, keine Empfehlung. Dauerhafter Hinweis: „Informiert, entscheidet nicht. Ersetzt keine Tourenplanung vor Ort.“

**Nicht im Umfang:** neue Analysen, PDF, Teilen.

**Voraussetzungen:** RI16.

**Risiken:** Informationsflut, Missverständnis als Freigabe. Gegenmaßnahme: Sortierung nach Position, neutrale Texte, Prüfung der Texte mit Nutzern.

**Abhängigkeiten:** RI16.

**Definition of Done:** Alle Befundtypen der ausgelieferten Pakete erscheinen; Screenshots Desktop/Mobil, hell/dunkel; Tastatur und Screenreader geprüft; PR gemerged.

### RI18 – Engine-Orchestrierung (Alpine Risk Engine Alpha)

Ebene 4 · Stufe 4.2. Status: Geplant. Schicht: Orchestrierung.

**Ziel:** Ein Einstieg „Route analysieren“, der die vorhandenen Module ausführt.

**Umfang:** `js/route_engine.js` mit Modulregister (analog zum Provider-Muster der Lawinenlage: ein Modul ist eine Datei und eine Zeile), Fortschritt und Fehlerzustand je Modul; Ausfall eines Moduls erscheint als Hinweis „nicht ausgewertet“, die übrigen Ergebnisse bleiben nutzbar; Abbruch beim Wechsel oder Entfernen der Route. Einzelansichten bleiben bestehen. Testseite mit Attrappen-Modulen.

**Nicht im Umfang:** Gewichtung, Gesamtwert, KI.

**Voraussetzungen:** RI16, RI17.

**Risiken:** Laufzeit, Abfragelast, Teilergebnisse. Gegenmaßnahme: Zeitlimits und Zustände je Modul.

**Abhängigkeiten:** RI16, RI17.

**Definition of Done:** Engine ohne UI testbar, Fehlerfälle getestet, ROADMAP („Alpine Risk Engine (Beta)“) aktualisiert, PR gemerged.

### RI19 – Terrain-Befunde

Ebene 4 · Stufe 4.3. Status: Geplant, optional. Schicht: Analyse-Logik.

**Ziel:** Aus Neigung und Exposition Befunde bilden (Beispiel aus der Engine-Dokumentation: „3 Abschnitte > 35° Hangneigung“).

**Umfang:** Schwellen aus RI13, nur Beschreibung der Geländeform; Kopplung mit dem Lawinenbericht nur als Gegenüberstellung (RI14b).

**Voraussetzungen:** RI13, RI14, RI16.

**Risiken:** Schwellen werden als Gefahrenurteil missverstanden. Gegenmaßnahme: Formulierung „Gelände steiler als …“ mit Quelle der Schwelle.

**Abhängigkeiten:** RI13, RI14, RI16.

**Definition of Done:** Befunde getestet und in RI17 sichtbar, PR gemerged.

### RI21 – Risikobewertung: Konzept (zurückgestellt)

Ebene 4 · Stufe 4.4. Status: Zurückgestellt. Schicht: Konzept (kein Code).

**Ziel:** Klären, ob und in welcher Form Befunde zu einer Bewertung verdichtet werden (Skala, Gewichtung, Umgang mit widersprüchlichen Daten; E9, E12).

**Umfang:** Konzeptdokument auf Basis realer Befunde und Rückmeldungen, mit Begründung, wie eine Bewertung erklärbar bleibt und wie Fehlinterpretation („Freigabe“) verhindert wird; ausdrücklich auch die Möglichkeit „keine Gesamtbewertung“.

**Voraussetzungen:** RI17 im Einsatz mit Rückmeldungen, RI18; Entscheidung E9.

**Risiken:** Sicherheitsrelevante Vereinfachung, Haftungsfragen, falsche Präzision. Gegenmaßnahme: Fachliche Prüfung vor jeder Umsetzung; Umsetzung nur als eigenes Paket nach Freigabe des Konzepts.

**Abhängigkeiten:** RI16 bis RI18.

**Definition of Done:** Konzept liegt vor und ist entschieden; erst danach werden Umsetzungspakete geschnitten.
### RI-L – Landing und Dokumentation anpassen

ebenenübergreifend. Status: Geplant, erst wenn Funktionen nutzbar sind.

**Ziel:** Landing, README und ROADMAP spiegeln den echten Stand.

**Umfang:** LP4 („Vision – noch nicht verfügbar“) nur für tatsächlich ausgelieferte Teile anpassen, LP5 um das DEM ergänzen, README-Funktionsliste, Screenshots. Keine Fake-Features; Vision bleibt als solche erkennbar.

**Voraussetzungen:** Die beschriebenen Funktionen sind gemerged und produktiv.

**Risiken:** Versprechen, die der Stand nicht hält.

**Abhängigkeiten:** jeweilige Funktionspakete.

**Definition of Done:** Texte entsprechen exakt dem Stand, LANDINGPAGE_PLAN und ROADMAP aktualisiert, PR gemerged.

---
# 9. Zurückgestellt (Ausblick über alle Ebenen)

| Thema | Warum später | Voraussetzung |
|---|---|---|
| OSM-Wege und Infrastruktur (`sac_scale`, Hütten, Wasser) | Overpass-Last, Datenqualität, widersprüchliche Wegedaten (ALPINE_RISK_ENGINE.md, offene Fragen); eigenes Abfrage- und Cache-Konzept nötig | stabile Stufe 2.2, E8 |
| Unfallanalyse, Digiway Absturzrisiko | Daten noch in Recherche (ROADMAP Phase 3) | georeferenzierte Daten |
| Steinschlag-, Muren-Indikatoren | Datengrundlage fehlt | DEM, Daten |
| GeoSphere (Wetter Österreich) | eigenes Wetterpaket AP-2.1 | Entscheidung zu Zugang |
| Gewitter-/Wetterfensterlogik, Startzeit-Auswahl | Modelllogik statt Anzeige | ROADMAP Phase 2 |
| Routenplanung (Linie zeichnen, Routing) | Routing-Quelle, Lizenz, Aufwand; GPX-Verarbeitung kommt zuerst | Ebene 2 und 3 |
| Tourenvergleich, Alternativrouten, GPX-Qualitätsbewertung | setzt Befundmodell voraus | RI16 |
| Personalisierte Tourenbewertung | setzt Profile und Konto voraus (IDEENSAMMLUNG) | Konto, Datenschutzkonzept |
| PDF-Tourenbericht, Teilen | setzt stabile Befunde voraus | RI17 |
| KI-Erklärungen (ARI) | „Daten vor KI“ | RI18 und Evaluation |
| Offline/PWA, Mobile App | ROADMAP Phase 4, Cache- und Plattformkonzept | Ebene 2 und 3 stabil |
| Backend, Konten, Synchronisation | Betrieb, Datenschutz, Kosten | E1, E2, E10 |
| Weitere Länder (DEM, Lawinen) | Lizenzen je Land | Provider-Muster, E7 |

---

# 10. Empfohlene Reihenfolge

```
Ebene 1   RI0
Ebene 2.1 RI1 → RI2 → RI3 → RI4 → RI5            (RI6 auf Wunsch vorgezogen)
Ebene 2.2 RI2 → RI7 → RI8
                    └→ RI9a → (Saisontest) → RI9b
          RI3 → RI10a → RI10b
Ebene 3   RI4 + RI5 → RI11 → RI12 → RI13a → RI13b → RI14a → RI14b → RI15   (RI20 zurückgestellt)
Ebene 4   RI8 + RI9 + RI10 → RI16 → RI17 → RI18 → RI19   (RI21 zurückgestellt)
RI-L      nach jedem ausgelieferten Funktionsblock
```

1. **Ebene 1 → 2 (RI0 bis RI3):** Nach RI3 ist die erste sichtbare Verbesserung da (eigene GPX auf der Karte), ohne externe Daten.
2. **Ebene 2.1 (RI4, RI5):** Statistik und Profil liefern den Toolbox-Nutzen (WEB-T6) und die Anzeigeposition, an der später alles hängt.
3. **Ebene 2.2 (RI7, RI8):** Erste Intelligenz aus vorhandenen Daten, ohne neue Quelle und ohne Saisonabhängigkeit.
4. **RI9:** Lawinenlage; die Logik darf vorher entstehen, die Anzeige erst nach dem Browser-Test mit echten Berichten.
5. **RI10:** Wetter, getrennt von der Geometrie, wegen externer Abfragen und Limits.
6. **Ebene 3 (RI11 bis RI15):** DEM erst jetzt, weil Quelle, Lizenz und Datenmenge nicht vor Paketen stehen sollen, die ohne sie auskommen.
7. **Ebene 4 (RI16 bis RI19):** Befunde, sobald mehrere Module real vorliegen. RI16 bis RI18 können bereits mit den Ergebnissen der Stufe 2.2 starten; RI19 folgt, wenn Ebene 3 liefert.
8. **RI6:** Speicherung bindet Datenformate und war für nach der Rückmeldung zu den Anzeigepaketen vorgesehen; sie wurde auf Wunsch vorgezogen. Das Datenformat ist bewusst der Originaltext der GPX-Datei, damit sich später nichts migrieren lässt.

## Kurzfristig realistisch

RI0 bis RI5 sowie die Logikpakete RI7, RI9a und RI10a. Sie brauchen keine neue Datenquelle, keine Lizenzentscheidung und keinen Server und lassen sich als kleine PRs umsetzen. Grobe Schätzung: eine bis zwei Arbeitssitzungen je Paket, die Anzeigepakete (RI3, RI5) eher zwei.

## Mittelfristig

RI8, RI9b (nach Saisontest), RI10b, RI11, RI12, RI6.

## Bewusst weiter in der Zukunft

RI13 bis RI21 (hängen an der DEM-Entscheidung bzw. an der Reife von Stufe 2.2) und alles aus Abschnitt 9.

---

# 11. Datenmodell der Route (Entwurf)

Wird mit RI2 verbindlich und dort dokumentiert.

```
Route {
  id: string                   // lokal erzeugt
  name: string                 // aus der Datei, immer mit esc() ausgeben
  source: 'gpx'                // später ggf. 'planned'
  points: [{ lat, lon, ele?, time?, dist }]   // dist = Strecke ab Start in Metern
  bounds: [[south, west], [north, east]]
  hasElevation: boolean
  hasTime: boolean
  gaps: [{ afterIndex }]       // Lücken zwischen GPX-Segmenten
}
```

Analyseergebnisse hängen nie an der Route selbst, sondern sind getrennte Ergebnisobjekte (Berechnung ohne Nebenwirkung). Ein Befund (RI16) verweist auf Streckenkilometer, nicht auf Punktindizes.

---

# 12. Nicht Bestandteil

**Aktuelles Produkt (Stand dieses Plans):** Karte mit OpenStreetMap und OpenTopoMap; Ebenen für Schutzgebiete, Wildlife, Sperrungen und Hinweise, Lawinenlage (Euregio, Schweiz); Wetter am Punkt; globale Suche über vorhandene Daten; Landing Page; mobiles Layout.

**Dieser Plan führt nichts davon ein und ändert keinen Code.** Heute gibt es **nicht**: GPX-Import, Routen, Höhenprofil, DEM, Hangneigung, Exposition, Befunde, Risikoanalyse, Alpine Risk Engine, Konto, Speicherung eigener Daten, Offline-Nutzung.

**Auch in den Ebenen 2 bis 4 (bis einschließlich RI19) nicht vorgesehen:**
- ein Gesamtrisiko, eine Note oder Ampel für eine Tour
- Empfehlungen oder Freigaben („geeignet“, „nicht geeignet“)
- Gehzeit-, Konditions- oder Zeitprognosen
- KI-generierte Texte
- Routing und Routenplanung
- Konten, Synchronisation, Teilen, Community
- neue Kartenanbieter (Satellit, Basemap.at) ohne eigene Lizenzentscheidung
- eine native Mobile App

Bis ein Paket gemerged ist, bleibt seine Funktion in Landing, README und ROADMAP als geplant gekennzeichnet.

---

# 13. Entscheidungen E1–E14

Stand: 13.11.2026 (RI0). Statuswerte: **Bestätigt** (gilt verbindlich für die genannten Pakete), **Bestätigt, vorläufig** (Grundsatz gilt, ein Zahlenwert wird im genannten Paket an echten Daten geprüft), **Offen** (bewusst vertagt, mit Frist). Eine Änderung einer bestätigten Entscheidung braucht einen eigenen Dokumentations-PR.

## Bestätigte Grundsatzentscheidung E1

**E1 – GPX-Verarbeitung: ausschließlich lokal im Browser. Bestätigt.**

- GPX-Dateien werden nur im Browser des Nutzers gelesen und verarbeitet (Dateiauswahl über das Dateisystem-Dialogelement, Inhalt per `File`-API). Die Datei und ihr Inhalt werden nicht übertragen.
- **Keine Server-Komponente** für GPX, Routen oder Analyse. Die Anwendung bleibt statisch (GitHub Pages).
- **Keine Benutzerkonten**, keine Anmeldung.
- **Keine Speicherung auf dem Server.** Die lokale Speicherung im Browser (RI6, E2) ist davon getrennt, geschieht nur auf ausdrücklichen Wunsch und bleibt auf dem Gerät.
- Externe Abfragen für Routen sind nur zulässig, wenn sie einzelne, gerundete Stützpunkte senden, nie die Datei oder die Linie als Ganzes (Wetter, RI10; DEM-Kacheln, RI12, werden nach Kachelkoordinate abgerufen, nicht nach Routenverlauf, soweit die Quelle das erlaubt; Prüfung in RI11).
- **Begründung:** Eine GPX-Datei enthält Aufenthaltsorte und Zeiten und ist damit personenbezogen und sensibel. Lokale Verarbeitung vermeidet Datenschutz-, Konto- und Betriebsfragen und passt zur statischen Architektur (kein Backend vorhanden). Alle geplanten Pakete bis einschließlich RI10 sind lokal machbar; die Wetter- und Höhenmodellabfragen sind die einzigen Außenkontakte und unterliegen der Stützpunktregel.
- **Änderung** (z. B. ein Backend für große DEM-Daten oder Konten) wäre eine eigene Architekturentscheidung (siehe E10) mit Datenschutzbewertung und kein Nebeneffekt eines Funktionspakets.

## Übersicht

| Nr. | Frage | Entscheidung | Status | Begründung und Hinweise | Nötig vor |
|---|---|---|---|---|---|
| E1 | GPX lokal oder serverseitig? | Nur lokal im Browser; kein Server, keine Konten, keine Serverspeicherung (siehe oben) | **Bestätigt** | Datenschutz (Standortdaten), statische Architektur | RI1 |
| E2 | Wo werden Routen gespeichert? | RI1–RI5: nirgends, genau eine Route im Arbeitsspeicher der Sitzung (Neuladen verwirft sie). RI6: IndexedDB im Browser mit GPX-Export, kein Server | **Bestätigt, in RI6 umgesetzt** | Kein Datenformat festlegen, bevor die Anzeigepakete bewährt sind; `localStorage` ist für große Tracks zu klein. Entschieden in RI6: Originaltext der GPX-Datei plus Kopfdaten, Schema siehe RI6 | RI6 |
| E3 | Koordinaten, Einheiten, Höhenbezug | WGS84; Koordinaten intern als `lat`, `lon` in Grad; Strecken in Metern (Anzeige in km); Höhen in Metern wie in der Datei. GPX-Höhen werden nicht umgerechnet oder korrigiert; fehlende Höhe ist `null`, nie 0. Ellipsoid/Geoid wird erst beim DEM-Vergleich (RI12) betrachtet | **Bestätigt** | Entspricht der GPX-Spezifikation (WGS84) und dem Leaflet-Standard; keine Umrechnung vermeidet Scheinpräzision | RI1 |
| E4 | Größenlimit der GPX-Datei | 10 MB und 200 000 Trackpunkte; Überschreitung wird abgelehnt (nicht abgeschnitten) mit klarer Meldung. Beide Werte stehen als benannte Konstanten im Parser | **Bestätigt, vorläufig** | Reicht für lange Mehrtagestouren. Die Grenzen werden mit dem Parser (RI1) an einer großen Testdatei auf Laufzeit geprüft und nur bei Bedarf in einem Dokumentations-PR angepasst | RI1 |
| E5 | Glättung der GPX-Höhen | Anstieg/Abstieg per Hysterese (Höhenänderung zählt erst ab einer Schwelle); Startwert 5 m als benannte Konstante. Die Methode wird im UI genannt, keine versteckte Filterung | **Bestätigt, vorläufig** | Rohsummen überzeichnen durch GPS-Rauschen. Der Zahlenwert wird in RI4 an Referenzstrecken kalibriert | RI4 |
| E6 | Abtastabstand für Flächenschnitte | 25 m; Abschnitte entstehen aus Ereignissen (Ein-/Austritt), nicht aus festen Längen | **Bestätigt, vorläufig** | Wert wird in RI7 gegen die echten Geometrien (Schutzgebiete, Regionen) und Laufzeit geprüft | RI7 |
| E7 | DEM-Quelle | Keine Entscheidung | **Offen** (bewusst vertagt) | Lizenz, Abdeckung Alpenraum und Abruf ohne Backend sind ungeklärt; Spike in RI11. Bis dahin wird kein DEM-Code geschrieben | RI11 |
| E8 | Cache-Strategie (DEM, Wetter, Overpass) | Grundsatz: Zwischenspeicher je Sitzung plus normaler Browser-Cache; vorberechnete statische Kacheln im Repository nur bei vertretbarer Datenmenge. Details je Quelle in RI10 bzw. RI11 | **Bestätigt, vorläufig** | Für RI1–RI5 ohne Bedeutung (keine externen Daten) | RI10, RI11 |
| E9 | Skala und Gewichtung von Befunden | Keine Zahlenskala, kein Gesamtwert; drei Stufen `info`, `hinweis`, `beachten`. Gewichtung bleibt offen | **Bestätigt** (Skala), Gewichtung **offen** | Folgt `ALPINE_RISK_ENGINE.md` („kein Gesamtrisiko“). Gewichtung gehört zu RI21 | RI16 |
| E10 | Analyse lokal oder backendgestützt? | Lokal im Browser. Ein Backend nur nach eigener Architekturentscheidung (große DEM-Daten, Archive, Konten) | **Bestätigt** | Folgt aus E1; bis einschließlich Ebene 4 (RI19) ist kein Backend vorgesehen | RI18 |
| E11 | Offline-Unterstützung | Nicht in den Ebenen 2 bis 4. Die Logik bleibt serverunabhängig und ohne DOM, damit PWA/Offline später möglich ist | **Bestätigt** | ROADMAP: PWA/Offline „Zukunft (nach Phase 4)“ | später |
| E12 | Umgang mit widersprüchlichen Daten | Jedes Modul liefert eigene Befunde; keine Auflösung der Widersprüche | **Offen** | Offene Frage in `ALPINE_RISK_ENGINE.md`; gehört zu RI21 | RI21 |
| E13 | Suche in eigenen Routen | Nicht in den Ebenen 2 bis 4; später als zusätzliche Gruppe der globalen Suche | **Bestätigt** | Eigene Routen sind lokal und privat; die Suche indexiert sie nicht | später |
| E14 | Bibliotheken | Keine neuen Bibliotheken; Parser, Geometrie und Diagramm als eigener Code (Leaflet bleibt). Falls später doch nötig: Self-Hosting unter `vendor/`, Lizenzprüfung, eigener Beschluss | **Bestätigt** | Keine externen Ressourcen ohne Self-Hosting; kleiner Umfang, volle Kontrolle über Sicherheit (`esc()`, XML-Parser) | RI1 |

## Festlegungen für RI1 bis RI5

Aus den bestätigten Entscheidungen folgen diese Vorgaben. Sie ändern weder Umfang noch Reihenfolge der Pakete, sondern konkretisieren sie.

| Thema | Festlegung | Grundlage |
|---|---|---|
| Datenfluss | Dateiauswahl → Text per `File`-API im Browser → Parser → Routenobjekt im Arbeitsspeicher. Kein `fetch`/Upload mit Routeninhalt, kein Cookie, keine Speicherung in RI1–RI5; ab RI6 nur auf ausdrücklichen Wunsch im Browser (IndexedDB) | E1, E2 |
| Parser (RI1) | Reine Funktion `Text → Ergebnisobjekt` ohne DOM-Zugriff auf die Seite; Parsing über `DOMParser` (XML). Fehler werden als Ergebnis zurückgegeben (Meldung), nicht geworfen; Limits aus E4 als benannte Konstanten | E1, E4, E14 |
| Koordinaten und Einheiten | `lat`, `lon` in Grad (WGS84); `dist` in Metern; `ele` in Metern oder `null`; `time` als Zeitpunkt oder `null`. Anzeige in km und m | E3 |
| Routenmodell (RI2) | Eine zusammenhängende Punktliste mit Streckenposition je Punkt, Lücken vermerkt (Entwurf Abschnitt 11). Keine Analyseergebnisse im Routenobjekt | E3 |
| Anzahl Routen (RI3) | Genau eine Route zugleich; „Route entfernen“ verwirft sie vollständig. Texte aus der Datei nur über `esc()` | E2 |
| Statistik (RI4) | Höhen nur aus der Datei; Hysterese-Schwelle als benannte Konstante (Startwert 5 m), Methode im UI genannt; ohne Höhen: „keine Höhendaten in der Datei“ | E3, E5 |
| Höhenprofil (RI5) | Eigenes SVG ohne Diagrammbibliothek; Logik (Skalierung, Abtastung) getrennt und getestet | E14 |
| Externe Dienste | RI1–RI5 sprechen mit keinem externen Dienst | E1 |
| Tests | Logik als Testseite in `scripts/run_js_tests.py`, Testdaten synthetisch unter `scripts/`; keine echten Fremdtracks im Repository | Prinzip 3 |

---
# 14. Risiken des Gesamtvorhabens

| Risiko | Wirkung | Gegenmaßnahme |
|---|---|---|
| Befunde werden als Freigabe verstanden | sicherheitsrelevant | neutrale Sprache, kein Gesamturteil, Dauerhinweis, Quelle und Stand je Befund |
| „Keine Treffer“ wirkt wie „kein Risiko“ | falsche Sicherheit | immer „in den geladenen Daten“, Stand nennen, Nebensaison und Ladefehler als eigener Zustand |
| DEM-Lizenz oder Datenmenge tragen nicht | Ebene 3 blockiert | Spike RI11 vor Produktcode; Ebene 2 bleibt ohne DEM nutzbar |
| GPX-Varianten, Fehlerdateien | Ausfälle, Sicherheit | Parser mit Limits und Tests, `esc()` für alle Texte |
| Datenschutz der Routen | Standortdaten verraten Gewohnheiten | lokal, Datei wird nicht übertragen, nur einzelne gerundete Stützpunkte an den Wetterdienst, Hinweis im UI |
| Pakete wachsen | große, riskante PRs | Paketregeln, eine Schicht je Paket, Teilung in a/b |
| Lawinen-Browser-Test steht aus | RI9b nicht verifizierbar | RI9b erst nach dem Saisontest |
| Performance bei langen Tracks und großen Polygonen | träge Oberfläche | vereinfachte Darstellung, Bounding-Box-Filter, Messungen in den PRs |
| Platz mobil | überladene Karte | alles in vorhandenen Karten und im Sheet, kein neues schwebendes Panel |

---

# 15. Dokumentationspflege je Paket

Nach docs/WORKFLOW.md bei jedem Paket prüfen und, falls betroffen, aktualisieren:

- **ROADMAP.md:** Checkliste (GPX-Parser, Höhenprofil, DEM-Integration, Tourenwarnungen), Versionshistorie; bestehende Inhalte werden nur abgehakt oder ergänzt.
- **DATENQUELLEN.md:** DEM (Status korrigieren), Open-Meteo-Nutzung für Routen, spätere OSM-Abfragen.
- **STYLEGUIDE.md:** Routenlinie, Befundkomponenten, Neigungsfarben.
- **ALPINE_RISK_ENGINE.md:** Befundmodell (RI16), Modulstatus.
- **IDEENSAMMLUNG.md:** umgesetzte Ideen (GPX Upload, GPX Statistik) entfernen oder verschieben.
- **README.md:** sichtbare Funktionen, Dateiübersicht.
- **Dieser Plan:** Status je Paket (Geplant, In Arbeit, Erledigt mit Datum) und Umsetzungshinweise, wie im Design-Migrationsplan.