# Mountain Radar

ALPINE RISK INTELLIGENCE

Know before you go.

Technischer Projektname (Repository):
Bergbedingungen

# 🏔️ Mountain Radar Roadmap

> Version: siehe Versionshistorie am Ende
>
> Letzte Aktualisierung: 27.11.2026
>
> Dieses Dokument ist die **Landkarte** von Mountain Radar: Es zeigt, welche Bereiche es gibt, was in jedem Bereich fertig ist und wo es weitergeht. Der Stand steht an genau einer Stelle, in der **Plattform-Landkarte** (unten); „Kernmodule“, Phasen und Checkliste verweisen darauf und führen keinen eigenen Status. Detailpläne (z. B. ROUTE_INTELLIGENCE_PLAN.md) sind Arbeitsdokumente für die Umsetzung und können nach Abschluss gelöscht werden; was daraus dauerhaft gilt, steht in dieser Roadmap, in DATENQUELLEN.md oder STYLEGUIDE.md.
>
> Technische Details, Datenquellen und APIs sind in DATENQUELLEN.md dokumentiert.

---

## Branding

- **Mountain Radar** ist der offizielle Produktname (Claim: ALPINE RISK INTELLIGENCE, Slogan: „Know before you go.“).
- **Bergbedingungen** ist der technische Projektname (Repository). Das Rebranding ist in der Dokumentation vollzogen (README, ROADMAP, DATENQUELLEN, STYLEGUIDE).
- In der Anwendung tritt der Produktname „Mountain Radar“ auf (Seitentitel, Meta-Beschreibung, Header, Favicon; Design-Migration D1 erledigt). Weitere Design-Schritte gehören zum Arbeitspaket „Design & Branding“ (siehe Plattform-Landkarte, Zeile „Design & Branding“). Die Design-Migration wurde in kleinen PRs (D1–D13) umgesetzt; der Plan ist abgeschlossen und gelöscht, die bleibenden Regeln stehen im STYLEGUIDE („Regeln für Design-Änderungen“).
- Das visuelle Design System (Farben, Typografie, Komponenten) ist in STYLEGUIDE.md beschrieben. Die Umsetzung in der Oberfläche ist noch nicht abgeschlossen.

---

## Dokumentationsregel

Nach Abschluss eines Arbeitspakets müssen folgende Dokumente geprüft werden (Ablauf: docs/WORKFLOW.md):

- ROADMAP.md (dieses Dokument): Plattform-Landkarte und Checkliste
- DATENQUELLEN.md
- IDEENSAMMLUNG.md
- README.md
- STYLEGUIDE.md

Die Dokumentation ist die maßgebliche Quelle für den Projektstatus.

---

# Vision

Mountain Radar entwickelt sich von einer Kartenanwendung zu einem digitalen Tourenassistenten für den Alpenraum.

Die langfristige Mission ist **ALPINE RISK INTELLIGENCE**: Ein Nutzer lädt einen GPX Track hoch oder plant eine Route. Mountain Radar analysiert über 14 verschiedene Risikofaktoren und erstellt daraus eine evidenzbasierte Risikobewertung mit konkreten Warnungen und Empfehlungen.

**Zentrale Frage für den Nutzer:**
> "Wenn ich diese Tour morgen gehe, worauf muss ich achten?"

---

# Produktphilosophie

## Daten vor KI

Die Qualität der Daten hat höchste Priorität.

Neue Datenquellen werden zuerst vollständig integriert, bevor KI-Funktionen entwickelt werden.

Die KI soll bestehende Daten interpretieren und verständlich aufbereiten, nicht ersetzen.

---

## Nutzernutzen vor Komplexität

Neue Funktionen werden vorrangig umgesetzt, wenn sie Bergsportlern einen direkten Mehrwert liefern.

---

## Qualität vor Geschwindigkeit

Lieber wenige, zuverlässige Datenquellen vollständig integrieren als viele halb funktionierende Features bereitstellen.

---

## Karte als zentrale Arbeitsfläche

Die Karte bleibt das Herzstück der Anwendung.

Neue Funktionen sollen möglichst als Layer oder Kartenanalyse eingebunden werden.

---

# Plattform-Landkarte

Stand: 27.11.2026. Dies ist die einzige Stelle mit dem aktuellen Stand je Bereich. Nach jedem Arbeitspaket wird die Zeile des betroffenen Bereichs aktualisiert (docs/WORKFLOW.md).

| Bereich | Stand heute | Als Nächstes | Detail |
|---|---|---|---|
| **Kartenebenen** (Schutzgebiete, Wildlife, Sperrungen & Hinweise) | Umgesetzt: Layer, Legende, Filter nach Typ, Popups mit Regeln und Wildlife-Symbolen, globale Suche (Phase 1, nur vorhandene Daten) | Wildlife-Darstellung verbessern; Suche Phase 2 (Geocoding, eigenes Paket); Risikomodule (Phase 3) | DATENQUELLEN, WILDLIFE_ANALYSE |
| **Lawinenlage** | Umgesetzt für Euregio und Schweiz (Provider-Framework, Popup, Layer); getestet mit archivierten Berichten | Test mit aktuellen Berichten ab Saisonstart 2026/27; weitere Länder als Provider (Phase 4) | AVALANCHE_ARCHITECTURE, LAWINENLAGE_ANALYSE |
| **Wetter** | Wetter am Punkt (Open-Meteo, WEB-T1) und Wetter entlang der Route (RI10) | GeoSphere (Phase 2), Weather Intelligence Popup (WEB-T7, niedrige Priorität) | DATENQUELLEN |
| **Route Intelligence, Ebene 2: eigene Route** | Umgesetzt (RI1–RI10): GPX lokal laden, Karte, Statistik, Höhenprofil, Routenverwaltung im Browser, Schutzgebiete, Sperrungen, Lawinenlage und Wetter entlang der Route | Saisontest der Lawinenanzeige (RI9b); Wegschwierigkeit (sac_scale, OSM) zurückgestellt | ROUTE_INTELLIGENCE_PLAN |
| **Route Intelligence, Ebene 3: Gelände** | DEM-Quelle entschieden (RI11), DEM-Zugriff umgesetzt (RI12: Höhe an einem Punkt, Copernicus GLO-30 über OpenTopography, Terrain Tiles als Ersatz), noch ohne Anzeige | RI13 Steigung, RI14 Exposition, RI15 Gelände im Profil; danach Land Cover (RI15a–e) und Sonne/Schatten (RI15f–k); swissALTI3D (Schweiz) und BEV (Österreich, nachrangig) als bessere Quelle je Region | ROUTE_INTELLIGENCE_PLAN |
| **Route Intelligence, Ebene 4 / Alpine Risk Engine** | Konzept (Design) | Befundmodell und Befundliste (RI16, RI17), Orchestrierung (RI18, interne Vorstufe „Alpha“ ohne Oberfläche); erst mit Befundliste die Engine „Beta“ (Phase 3); GA Phase 5 | ROUTE_INTELLIGENCE_PLAN, ALPINE_RISK_ENGINE |
| **Mountain Radar Toolbox** | Website: nur Wetter am Punkt; Mobile: Zukunft | Website-Werkzeuge WEB-T2 bis T6 (Phase 1), Mobile MOB-T1 bis T6 (Phase 4–5) | Abschnitt Toolbox, DATENQUELLEN |
| **Design & Branding** | Design-Migration D1–D13 abgeschlossen (Branding, Tokens, Komponenten, Header, Statusleiste, Karten, Popups, Layout, mobil, Suche) | Weitere Design-Schritte nur mit neuem Arbeitspaket | STYLEGUIDE |
| **Landing Experience** | LP1–LP8b erledigt: Startseite mit Erklärung, Quellen, Vision, Navigation, SEO, absolute Metadaten (öffentliche Adresse GitHub Pages) | Texte an ausgelieferte Funktionen anpassen (RI-L); Sharing-Vorschau mit Debugger prüfen | Checkliste, Abschnitt „Landing Experience“ |
| **Daten und Infrastruktur** | DTP, Closures, Euregio, SLF, Open-Meteo, OSM-Kacheln produktiv | OSM Overpass, Basemap.at, GeoSphere; Unfalllayer, Unfall-Heatmap, Digiway Absturzrisiko (Recherche und Konzept, Phase 3) | DATENQUELLEN |
| **Mobile App, PWA, Offline** | Zukunft | Nach Phase 4 | – |

---

# 📊 Roadmap-Übersicht — Alpine Risk Intelligence

Mountain Radar wird in **5 technischen Phasen** entwickelt:

```
Phase 1: Grundlagen (Q4 2026 - Q1 2027)
├─ Bereits umgesetzt: Schutzgebiete, Wildlife, Sperrungen & Hinweise, Wetter am Punkt (Open-Meteo)
├─ Bereits umgesetzt: GPX-Import, Karte, Statistik, Höhenprofil, Routenverwaltung, Kontext entlang der Route (RI1–RI10)
├─ Bereits umgesetzt: DEM-Zugriff (RI12, Höhe an einem Punkt)
├─ Offen: OSM, Kartografie, Geländeanalyse-Module (Steigung, Exposition: RI13, RI14)
└─ Offen: Website Toolbox (Koordinaten, Höhe, Entfernungen)

Phase 2: Wetterintegration (Q1 - Q2 2027)
├─ GeoSphere-Integration
├─ ALBINA & SLF Lawinenlage (Euregio und Schweiz umgesetzt, Test ab Saisonstart)
├─ Tourenwarnungen
└─ Website Wetter-am-Punkt erweitert

Phase 3: Gefahrenmodellierung (Q2 - Q3 2027)
├─ Unfallanalyse-Engine (Unfalllayer, Heatmap, Digiway Absturzrisiko)
├─ Steinschlag- & Muren-Indikatoren
├─ Regionale Daten (Tirol)
├─ Schutzgebiete und Wildlife als Risikomodule
└─ Alpine Risk Engine (Beta)

Phase 4: Mobile App & Internationale Expansion (Q4 2027 - Q1 2028)
├─ Mobile App Framework
├─ Mobile Toolbox (Kompass, Hangneigungsmesser, GPS Status, etc.)
├─ Smartphone Sensor Integration
├─ Météo-France, AINEVA, ARSO Integration
└─ Multi-Land Coverage

Phase 5: Production & Optimierung (Q1 2028+)
├─ Alpine Risk Engine (GA)
├─ Performance-Optimierung
├─ Benutzerforschung & Refinement
├─ Community-Features
└─ Erweiterte Toolbox-Features (Sonnenstand, Offline-Nav, etc.)
```

---

# 🎯 Kernmodule

Diese 10 Module sind das Rückgrat der Alpine Risk Intelligence:

| Modul | Phase | Priorität | Stand |
|---|---|---|---|
| **Geländeanalyse** (DEM) | 1 | 🔴 Sehr hoch | Landkarte: Route Intelligence, Ebene 3 |
| **GPX Analyse** | 1 | 🔴 Sehr hoch | Landkarte: Route Intelligence, Ebene 2 |
| **Infrastruktur** (OSM) | 1 | 🔴 Sehr hoch | Landkarte: Daten und Infrastruktur |
| **Wetterrisiko** | 2 | 🔴 Sehr hoch | Landkarte: Wetter |
| **Lawinenlage** | 2 | 🔴 Sehr hoch | Landkarte: Lawinenlage |
| **Unfallanalyse** | 3 | 🟠 Hoch | Landkarte: Daten und Infrastruktur |
| **Schutzgebiete** | 1 (Anzeige), 3 (Risikomodul) | 🟡 Mittel | Landkarte: Kartenebenen |
| **Wildlife** | 1 (Anzeige), 3 (Risikomodul) | 🟡 Mittel | Landkarte: Kartenebenen |
| **Alpine Risk Engine** | 3 (Beta), 5 (GA) | 🔴 Sehr hoch | Landkarte: Ebene 4 |
| **Mountain Radar Toolbox** | 1-2 (Website), 4-5 (Mobile) | 🟡 Mittel-Hoch | Landkarte: Toolbox |

Die Alpine Risk Engine setzt auf DEM, OSM, Wetterintegration (GeoSphere), Lawinenlage, Unfallanalyse und GPX Analyse auf. Deshalb startet sie erst nach Phase 1-2 mit der Beta in Phase 3. Detailkonzept: ALPINE_RISK_ENGINE.md (Phasenliste dort mit dieser Roadmap abgeglichen).

Datenquellen für alle Module sind in **DATENQUELLEN.md** dokumentiert.

---

# 🧰 Mountain Radar Toolbox

**Mission:** Eine zentrale Sammlung alpiner Werkzeuge für Tourenplanung, Orientierung und Risikobeurteilung — sowohl in der Web-App als auch in der zukünftigen Mobile App.

**Vision:** Know before you go. — Mit der Toolbox können Nutzer schnell Koordinaten prüfen, Entfernungen messen, Höhen bestimmen und GPS-Daten validieren.

## Website Toolbox (Phase 1-2)

- **WEB-T1:** Wetter am Punkt ✅ (vorhanden, Open-Meteo; Erweiterung Phase 2)
- **WEB-T2:** Koordinaten anzeigen (Phase 1)
- **WEB-T3:** Höhe anzeigen (Phase 1)
- **WEB-T4:** Entfernung zum Standort (Phase 1)
- **WEB-T5:** Entfernung zwischen zwei Punkten (Phase 1)
- **WEB-T6:** Höhenprofil entlang Linie (Phase 1)
- **WEB-T7:** Weather Intelligence Popup 🟡 Geplant (nicht implementiert, Priorität niedriger als die laufende Design-Migration; siehe unten)

### WEB-T7 — Weather Intelligence Popup (geplant)

**Beschreibung:** Beim Klick auf die Karte erscheint optional ein Wetter-Popup direkt an der gewählten Position. Es baut auf dem gemeinsamen Popup-System von D8a–D8c auf (`mr-popup`, `.pa-pop`, `.pa-pop-head`, `.mr-kv`) und zeigt nur reale Wetterdaten, die heute bereits vorhanden sind.

**Status:** Geplant, nicht implementiert. **Priorität:** nach der abgeschlossenen Design-Migration (D1–D13) frei planbar.

**Einordnung:** Toolbox (WEB-T1 „Wetter am Punkt“ zeigt die Werte heute nur in der Wetter-Karte der Seitenleiste). Bewusst *nicht* unter „Wetterintegration (Phase 2)“: Phase 2 (GeoSphere, „Wetter-am-Punkt erweitert“, Wetterrisiko) bringt neue Daten und Modelle, dieses Feature stellt nur vorhandene Daten an der Kartenposition dar.

**Bereits vorhandene Daten (wiederverwendbar, `js/weather.js`, eine Open-Meteo-Abfrage je Punkt):**

| Anzeige | Quelle in der Antwort | Heute sichtbar in |
|---|---|---|
| Temperatur, gefühlte Temperatur | `current.temperature_2m`, `current.apparent_temperature` | Wetter-Karte |
| Wetterzustand (Text) | `current.weather_code` (Zuordnung `WX_CODES`) | Wetter-Karte |
| Wind und Böen | `current.wind_speed_10m`, `current.wind_gusts_10m` | Wetter-Karte |
| Nullgradgrenze | `hourly.freezing_level_height` zur aktuellen Stunde | Wetter-Karte |
| Standorthöhe (Geländehöhe laut Modell) | `elevation` (mit Hinweis „kann von der Gipfelhöhe abweichen“) | Wetter-Karte |
| Zeitstempel | `current.time` (heute: Datenstatus-Leiste, „Stand HH:MM“) | Datenstatus-Leiste |
| Quelle | Open-Meteo (Namensnennung im Fußbereich) | Fußbereich |
| Niederschlag aktuell | `current.precipitation` (wird bereits abgefragt, aber nirgends angezeigt) | – |

Der Viertagesausblick (`daily.*`) ist ebenfalls vorhanden, gehört aber nicht zum Umfang eines Popups.

**Regeln:**
- Keine Platzhalter, keine neuen Wettermodelle, keine neuen Datenquellen, keine Erweiterung der Wetterlogik. Fehlende Werte werden weggelassen oder wie heute mit „–“ gezeigt.
- Keine zweite Abfrage: Der Klick lädt das Wetter heute schon (`map.on('click', …)` in `js/app.js`); das Popup nutzt dieselbe Antwort.
- Sperrungen, Schutzgebiete und Lawinenlage behalten Vorrang: deren Popups werden nicht verdrängt.
- Fehlerzustand wie heute („Wetterdaten sind gerade nicht abrufbar“), Zustand und Zeitstempel weiter über die Datenstatus-Leiste.

**Offene Punkte für die Umsetzung:** „Optional“ (Schalter oder dauerhafte Einstellung?); Verhalten bei „Mein Standort“ und „Für Kartenmitte“; ob `current.precipitation` angezeigt wird (bereits abgefragt, aber heute unsichtbar); Abstimmung mit dem Wetter-Pin (heute nicht anklickbar).

## Mobile Toolbox (Phase 4-5)

- **MOB-T1:** Kompass (Phase 4)
- **MOB-T2:** Peilkompass (Phase 4)
- **MOB-T3:** Hangneigungsmesser — 🔴 Kritisch für Lawinenbeurteilung (Phase 4)
- **MOB-T4:** Entfernungsmesser (Phase 4)
- **MOB-T5:** Standortwerkzeuge / GPS Status (Phase 4)
- **MOB-T6:** Sonnenstand & Dämmerung (Phase 5)

**Zukünftige Erweiterungen:** Mondphase, Wettertrend, Notrufinformationen, Rettungspunkt-Finder, Offline-Navigation, Schneefall-Prognose, Wind-Daten, UV-Index.

Details finden sich in DATENQUELLEN.md (Abschnitt 11. TOOLBOX-DATENQUELLEN).

---

# 📋 Implementierungs-Checkliste

Die Checkliste führt die einzelnen Arbeitspakete; den Stand je Bereich zeigt die Plattform-Landkarte. Noch ohne Code sind OSM Overpass, Wegschwierigkeit, Toolbox-Werkzeuge WEB-T2 bis T6 und Basemap.at.

### Phase 1 — Status: IN PROGRESS
- [x] Schutzgebiete (Layer, Legende, Filter, Popup mit Regeln), Wildlife (Namen, Symbole), Sperrungen & Hinweise als Kartenebenen
- [x] Wetter am Punkt (Open-Meteo, WEB-T1)
- [x] DEM-Integration (RI12 erledigt: `elevationAt` und `elevationsAlong`, eigener GeoTIFF-Leser, Copernicus GLO-30 von OpenTopography mit Terrain Tiles als Ersatz; Schweiz und Österreich später; RI13 als Nächstes)
- [ ] OSM Overpass API Integration
- [x] GPX-Parser (RI1, reine Logik `js/gpx.js` mit Tests)
- [x] Routenmodell und Geometrie (RI2, reine Logik js/route_model.js und js/geo.js mit Tests)
- [x] GPX laden und auf der Karte anzeigen (RI3, Karte „Route“ mit js/route.js und js/route_logic.js, lokal im Browser)
- [x] Routenstatistik aus den GPX-Höhen (RI4, reine Logik js/route_stats.js mit Tests, Anzeige in der Routenkarte)
- [x] Höhenprofil (RI5, SVG ohne Bibliothek in der Routenkarte: js/elevation_profile.js und reine Logik js/profile_logic.js mit Tests; Hover, Touch und Tastatur zeigen die Stelle auf der Karte)
- [x] Routenverwaltung lokal (RI6, IndexedDB im Browser: speichern, öffnen, umbenennen, als GPX exportieren, löschen; js/route_store.js, js/route_store_logic.js, js/route_saved.js mit Tests)
- [x] Räumlicher Schnitt Route × Polygone (RI7, reine Logik js/route_overlay.js mit Tests und Laufzeitmessung an den Schutzgebieten; noch keine Anzeige, die folgt mit RI8)
- [x] Schutzgebiete und Sperrungen entlang der Route (RI8, Block „Entlang der Route“ in der Routenkarte: js/route_context.js, js/route_context_logic.js, js/route_sources.js mit Tests; Linien und Punkte der Sperrungen gelten bis 30 m Abstand als berührt; Klick öffnet das Popup, Abschnitte auf der Karte hervorgehoben)
- [x] Lawinenlage entlang der Route, Logik (RI9a, reine Logik js/route_avalanche.js mit Tests: Region je Abschnitt, Stufe nach Höhe der Route, vorsichtig bei Höhenunsicherheit; noch keine Anzeige, die folgt mit RI9b)
- [x] Lawinenlage entlang der Route, Anzeige (RI9b, Block „Lawinenlage entlang der Route“: js/route_avalanche_view.js, js/route_avalanche_logic.js mit Tests; geprüft nur mit archiviertem Euregio-Bericht, **Test mit aktuellen Berichten steht aus**; vor dem Test gemergt, weil die Seite noch nicht öffentlich ist)
- [x] Wetter entlang der Route, Datenzugriff (RI10a, js/weather_api.js und js/route_weather.js mit Tests: höchstens 6 gerundete Stützpunkte, eine Abfrage je Route, Zwischenspeicher je Punkt und Stunde; Wetterkarte nachweislich unverändert; noch keine Anzeige, die folgt mit RI10b)
- [x] Wetter entlang der Route, Anzeige (RI10b, Block „Wetter entlang der Route“: js/route_weather_view.js, js/route_weather_logic.js mit Tests; Abruf erst auf Knopfdruck mit Datenschutzhinweis; Nullgradgrenze neben der Höhe der Route ohne Wertung; mit echten Open-Meteo-Daten geprüft)
- [ ] Wegschwierigkeit-Matching (sac_scale)
- [ ] Website Toolbox: Koordinaten & Höhe
- [ ] Website Toolbox: Entfernungsmessungen
- [ ] Website Toolbox: Weather Intelligence Popup (WEB-T7, geplant, niedrige Priorität, nach der Design-Migration)
- [ ] Basemap.at Integration

### Phase 2 — Status: IN PROGRESS
- [x] ALBINA CAAML-Parser
- [x] SLF CAAML-Parser
- [x] Mehrländriges Lawinenframework (siehe Technische Meilensteine)
- [ ] GeoSphere API Integration
- [x] Lawinenlage-Visualisierung für Euregio und Schweiz umgesetzt
- [ ] Lawinenlage: Test mit aktuellen Berichten im Browser ab Saisonstart 2026/27
- [ ] Tourenwarnungen-Logik
- [ ] Website Wetter-am-Punkt erweitert

### Phase 3 — Status: PLANNED
- [ ] BMI-Daten georeferenzieren
- [ ] Unfalllayer, Unfall-Heatmap, Unfall-Hotspot-Algorithmus
- [ ] Digiway Absturzrisiko
- [ ] Steinschlag-/Muren-Indikatoren
- [ ] Regionale Daten (Tirol)
- [ ] Schutzgebiete und Wildlife als Risikomodule der Engine (die Kartenebenen sind umgesetzt, siehe Phase 1)
- [ ] Alpine Risk Engine (Beta)

### Design & Branding — Status: IN PROGRESS (phasenunabhängig)
- [x] Styleguide (STYLEGUIDE.md)
- [x] Produktname und Claim in der Dokumentation
- [x] Design-Tokens und Typografie (D2): `--mr-*`-Tokens, Inter selbst gehostet
- [x] Gemeinsame Komponenten-CSS (D3): `.mr-card`, `.mr-label`, `.mr-badge`, `.mr-switch`, `.mr-kv`, `.mr-segment`, Hilfsklassen
- [x] Header als App-Shell (D4): Emblem, Wortmarke, Claim, Slogan, ohne Navigation
- [x] Datenstatus-Leiste (D5): Status je Quelle mit echten Zeitstempeln und Anzahlen
- [x] Seitenleisten-Karten „Wetter“ und „Sperrungen und Hinweise“ im neuen Stil (D6)
- [x] Layer-Panel „Karten & Layer“ im neuen Stil (D7): Schalter, Segment-Control, Layer-Karten mit Status
- [x] Schutzgebiets-Popups im neuen Stil (D8a): Kopf, Regeln mit Statusschild, Wildlife, folgt Hell/Dunkel
- [x] Lawinenlage-Popups auf das gemeinsame Popup-System migriert (D8b): gleiche Gerüst-Klassen wie D8a, Lawinenfarben unverändert
- [x] Sperrungen- und Hinweise-Popups auf das gemeinsame Popup-System migriert (D8c); ein Wetter-Pin-Popup existiert nicht
- [x] Legendenkarte unten rechts (D9): kompakte Legende, zeigt nur eingeblendete Ebenen, einklappbar
- [x] Vollflächige Karte mit schwebenden Karten (D10, Desktop ≥ 1200 px): Wetter und Sperrungen links, Bedienfeld und Legendenkarte rechts in einem Dock (keine Überlagerung), Popups mit Autopan-Abstand
- [x] Mobiles Layout und Bottom Sheet (D11, bis 820 px): Karte füllt den Bildschirm, Seitenleiste als Bottom Sheet (peek, half, full), „Karten & Layer“ als Sheet über der Karte, einzeilige Statusleiste, Popups begrenzt und scrollbar, Touch-Ziele mind. 44 px; Desktop unverändert
- [x] Gedämpfte Kartenoptik (D12): Sättigungsfilter auf OSM und Topo (Hell und Dunkel), Overlays und Warnfarben unverändert, keine neue Kartenquelle
- [x] Globale Suche Phase 1 (D13): Suchfeld im Header, gruppierte Treffer aus Schutzgebieten, Sperrungen und Hinweisen (nur vorhandene Daten, kein Geocoding, kein ⌘K), Tastaturbedienung, Sprung zur Karte mit vorhandenem Verhalten
- [x] Umsetzung des Design Systems in der Oberfläche abgeschlossen (D1–D13; Plan abgeschlossen, Regeln im STYLEGUIDE)
- [ ] Globale Suche Phase 2: Orts-, Gipfel- und Adresssuche per Geocoding (eigenes Arbeitspaket, neue Datenquelle mit Lizenz- und Datenschutzentscheidung)
- [x] Produktname „Mountain Radar“ in der Anwendung (D1: Titel, Meta-Beschreibung, Header, Favicon)

### Landing Experience — Status: LP1–LP8b erledigt (phasenunabhängig; Plan abgeschlossen und gelöscht, bleibende Regeln im folgenden Abschnitt)
- [x] LP1 Hero & Landing-Struktur: Startseite `index.html` mit Marke, Claim, Slogan, kurzer Einleitung und genau einem Link „Zur Karte“; Kartenanwendung unter `app.html`, Rückweg über die Marke im Header
- [x] LP2 Was ist Mountain Radar?: Abschnitt mit Kurzerklärung und fünf Infokarten (Wetter, Lawinenlage, Schutzgebiete, Wildlife, Sperrungen & Hinweise), Abschnitt „Für wen?“ mit den Zielgruppen und einem Satz „Warum Mountain Radar?“; nur heutige Funktionen, ohne JavaScript
- [x] LP3 Aktuelle Informationsquellen: Abschnitt mit fünf Infokarten (Wetter, Lawinenlage, Schutzgebiete, Wildlife, Sperrungen & Hinweise), je Titel und kurze Beschreibung; nur reale Funktionen, bestehendes Designsystem, ohne JavaScript
- [x] LP4 Alpine Risk Intelligence: Abschnitt mit drei Erklärungen und den Zukunftsthemen GPX-Analyse, Risikoanalyse, Terrain Intelligence und Alpine Risk Engine, ausdrücklich als „Vision – noch nicht verfügbar“ von den heutigen Funktionen getrennt; ohne JavaScript
- [x] LP5 Datenquellen & Transparenz: Abschnitt mit den realen Quellen je Bereich (Open-Meteo, Euregio-Lawinenwarndienste und SLF, Digitize the Planet, OpenStreetMap/OpenTopoMap) und dem Hinweis „ersetzt keine Tourenplanung vor Ort, Quellen können sich ändern, Aktuelles prüfen“; keine geplanten Quellen; ohne JavaScript
- [x] LP6 Produktvision: Abschnitt „Produktvision“ (warum es Mountain Radar gibt: bessere Entscheidungen, Transparenz, Risikobewusstsein, Zugang zu Informationen) mit dem Slogan als Schlussgedanken; ohne Versprechen, ohne JavaScript
- [x] LP7 Navigation & Unterseiten: Hauptnavigation im Header der Startseite (Karte, Alpine Risk Intelligence, Datenquellen, Über Mountain Radar) als reine Links auf `app.html` und die vorhandenen Abschnitte; bewusst keine neuen Unterseiten, keine Inhalte doppelt; ohne JavaScript
- [x] LP8 SEO & Sharing: Titel, Beschreibung, Open Graph und Twitter/X-Karte in `index.html` und `app.html`; Vorschaubild `docs/design/mountain-radar-social-preview.png` (1200 × 630); keine Keyword-Listen, keine Funktionsänderung
- [x] LP8b Produkt-Metadaten finalisieren: `canonical` und `og:url` in `index.html` und `app.html`, `og:image` und `twitter:image` mit absoluter Adresse (öffentliche Adresse: GitHub Pages `https://purple-lettuce.github.io/Bergbedingungen/`); Robots, Sitemap, Icons nur dokumentiert; keine neuen Inhalte, kein Design, keine Funktionsänderung; Vorschaubild öffentlich erst nach dem Deploy prüfbar
- [x] LP1b Hero Visual & Landing-Hintergrund: Hero mit Foto (`docs/design/mountain-radar-hero.jpg`) und Overlay, wärmerer Sandton `#EFE5CF` als Fläche nur auf der Startseite, weiße Karten bleiben weiß; keine neuen Inhalte, Kartenanwendung unverändert

#### Landing Experience: bleibende Regeln (aus dem Landing-Page-Plan)

- **Grundsätze:** Produkt vor Karte (Besucher sollen zuerst verstehen, was Mountain Radar ist; die Karte ist ein Werkzeug). Realität vor Vision (vorhandene Funktionen vorn, Zukünftiges nur klar als Vision erkennbar, keine Fake-Features, keine Attrappen). Vertrauen durch Transparenz (Quellen, Aktualität und Herkunft offen nennen). Moderne Produktkommunikation (Vorbilder: Linear, Stripe, Arc, Mapbox, Komoot), nicht wie eine Behördenseite.
- **Zielgruppen:** primär Wanderer, Bergsteiger, Skitourengeher, Trailrunner; sekundär Bergführer, Vereine, Rettungsorganisationen, Naturschutzakteure.
- **Aufbau der Startseite:** Hero, Was ist Mountain Radar?, Aktuelle Informationsquellen, Alpine Risk Intelligence (als Vision gekennzeichnet), Datenquellen & Transparenz, Produktvision, Einstieg in die Karte. Gestaltung und Komponenten: STYLEGUIDE, Abschnitt „Landing Page“.
- **Fertig, wenn** ein Besucher in wenigen Sekunden beantworten kann: Was ist Mountain Radar? Wer sollte es verwenden? Welche Informationen liefert es heute? Welche Vision verfolgt es?
- **Metadaten (LP8, LP8b):** Titel Startseite „Mountain Radar – Alpine Risk Intelligence“, Karte „Karte – Mountain Radar“; Beschreibung (beide Seiten) „Sperrungen, Hinweise, Schutzgebiete, Wetter und Lawinenlage für den Alpenraum auf einer Karte. Know before you go.“ (nur, was die Karte tatsächlich zeigt, keine Keyword-Listen). Open Graph und Twitter/X (große Karte) wiederholen denselben Text. Vorschaubild `docs/design/mountain-radar-social-preview.png` (1200 × 630), Quelle `docs/design/social-preview.html` (neu erzeugen: Edge/Chrome headless, Fenster 1200 × 630, Screenshot).
- **Öffentliche Adresse:** `https://purple-lettuce.github.io/Bergbedingungen/` (GitHub Pages); `canonical` und `og:url` je Seite, `og:image` und `twitter:image` absolut. Bei eigener Domain oder Umbenennung des Repositorys müssen diese vier Angaben und `PUBLIC_BASE` in `scripts/test_landing.html` angepasst werden.
- **Bewusst nicht vorhanden:** strukturierte Daten (JSON-LD, bringt bei einer Startseite ohne Suche nichts), `robots`-Meta und `robots.txt` (Standardverhalten gewollt), Sitemap (für zwei Seiten nicht nötig; sinnvoll bei weiteren öffentlichen Unterseiten), Apple Touch Icon und Web Manifest (bräuchten neue Grafiken; eigenes Paket bei Bedarf).
- **Offen:** Vorschaubild nach dem Deploy mit einem Sharing-Debugger (LinkedIn Post Inspector, Facebook Sharing Debugger) prüfen; Landing-Texte an neu ausgelieferte Funktionen anpassen (RI-L im ROUTE_INTELLIGENCE_PLAN: Texte entsprechen exakt dem Stand, keine Fake-Features).
- **Test:** `scripts/test_landing.html` (in `scripts/run_js_tests.py`).

### Phase 4 — Status: FUTURE
- [ ] Mobile App Framework
- [ ] Smartphone Sensor Integration
- [ ] Mobile Toolbox (Kompass, Hangneigungsmesser, etc.)
- [ ] Météo-France Integration
- [ ] AINEVA Integration
- [ ] ARSO Integration

### Phase 5 — Status: FUTURE
- [ ] Alpine Risk Engine GA
- [ ] Benutzerforschung & Refinement
- [ ] Community-Features
- [ ] Erweiterte Toolbox-Features

---

# 🔗 Arbeitspaket-Generator

Aus dieser Roadmap können neue Arbeitspakete abgeleitet werden:

**Phase 1 Arbeitspakete:**
- AP-1.1: DEM-Integration ✅ (RI12 umgesetzt; Steigung und Exposition: RI13, RI14)
- AP-1.2: OSM Infrastruktur-Abfragen
- AP-1.3: GPX-Analyse-Pipeline ✅ (RI1–RI10 umgesetzt; Terrain- und Befundebenen siehe ROUTE_INTELLIGENCE_PLAN.md)
- AP-1.4: Website Koordinaten- & Höhen-Werkzeuge
- AP-1.5: Website Distanz-Werkzeuge

**Phase 2 Arbeitspakete:**
- AP-2.1: GeoSphere Integration
- AP-2.2: ALBINA & SLF Parser ✅ (umgesetzt, siehe Technische Meilensteine)
- AP-2.3: Website Wetter-am-Punkt erweitert

**Phase 3 Arbeitspakete:**
- AP-3.1: BMI-Daten Georeferenzierung
- AP-3.2: Alpine Risk Engine (Beta)

**Phasenunabhängig:**
- AP-D.1: Design & Branding (Design System, Umbenennung in der Anwendung)

**Phase 4+ Arbeitspakete:**
- AP-4.1: Mobile App Sensor Integration
- AP-4.2: Internationale Lawinenlage (je Land ein Provider, Anleitung in AVALANCHE_ARCHITECTURE.md)
- AP-5.1: Alpine Risk Engine (GA) & Community

---

# 🏗️ Technische Meilensteine

## Mehrländriges Lawinenframework ✅

Technische Grundlage aller aktuellen und künftigen Lawinenquellen. Details: [AVALANCHE_ARCHITECTURE.md](AVALANCHE_ARCHITECTURE.md).

- [x] Provider-Architektur: `AvalancheProvider`, `CaamlV6Provider`, `AlbinaProvider`, `SLFProvider`, Registry; ein neues Land ist eine Klasse und eine Zeile
- [x] Standardmodell je Region (Quelle, Land, Region, Geometrie, Zeiten, Gefahrenstufen, Höhengrenzen, Lawinenprobleme, Expositionen, Gefahrenmuster, Kernaussage, Bulletintext) mit Schema-Prüfung in der Pipeline
- [x] Standardisiertes GeoJSON (Schema `mountain-radar/avalanche/2`), identische Properties für jede Quelle
- [x] Quellenunabhängiges Frontend: ein Regionsdatensatz, ein Popup, ein Symbolmodell (Gefahrenstufen, Expositionen, Lawinenprobleme, Gefahrenmuster), kein Quellenbezug im Code (per Test geprüft)
- [x] Euregio und Schweiz ohne Änderung der Bulletin-Daten migriert, GitHub Action unverändert, Tests erweitert
- [ ] Weitere Länder (Frankreich, Italien, Slowenien, übrige Bundesländer) als Provider, Lizenzen vorher klären
- [ ] Archiv der Bulletins (historische Lawinenlage), Lawinenunfälle, Risikobewertung, GPX-Tourenanalyse und KI-Auswertung auf Basis des Standardmodells (Konzept: Architektur, Abschnitt 12)

## Schutzgebiete: Filter, Symbole, Wildlife-Namen ✅

- [x] Filter nach Schutzgebietskategorie als Abschnitt „Filter Schutzgebiete“ im Bedienfeld „Karten & Layer“ (Schalter je Kategorie mit Farbfeld und Anzahl, „Alle“ und „Keine“, Statuszeile; gilt auch nach Aus- und Einschalten der Ebene)
- [x] Regeln im Popup mit Themensymbol und farbigem Rand nach Art der Regel (Verbot, eingeschränkt, erlaubt)
- [x] Wildlife im Popup als Schilder mit Symbol, Pflanzen und Lebensräume getrennt (Art laut Digitize API)
- [x] Tiernamen aufgelöst: Verknüpfungs-ID → Schutzgut → Name und Art, an echten Daten geprüft (Details: [WILDLIFE_ANALYSE.md](WILDLIFE_ANALYSE.md), Abschnitt 7)
- [x] Wildlife-Daten im Repository aktualisiert (Lauf „Schutzgebiete aktualisieren“ am 29.10.2026: 685 Gebiete mit Wildlife, 187 Namen)
- [ ] Darstellung der Wildlife-Einträge verbessern (lange Habitatnamen, Gruppierung)

## Kartenfilter im Bedienfeld „Karten & Layer“ ✅

- [x] Filter Sperrungen, Hinweise und Geplant als Abschnitt „Filter Sperrungen & Hinweise“ ins Bedienfeld verschoben (bestehende Filterlogik in `js/closures.js` unverändert, Suche bleibt im rechten Panel)
- [x] Checkboxen im rechten Seitenpanel entfernt, es gibt nur noch eine Bedienstelle für Kartenfilter

---

# 📚 Versionshistorie

| Version | Datum | Änderung |
|---------|-------|----------|
| 4.36 | 2026-11-27 | Dokumentation: Landing-Page-Plan und Design-Migrationsplan abgeschlossen und gelöscht; Dauerhaftes in ROADMAP (Landing Experience: bleibende Regeln) und STYLEGUIDE (Regeln für Design-Änderungen) übernommen |
| 4.35 | 2026-11-27 | Dokumentation: Plattform-Landkarte statt vier Statussichten, veraltete Statusangaben in ROADMAP, README, DATENQUELLEN, Plänen und IDEENSAMMLUNG korrigiert, WORKFLOW-Regel zur Landkarte |
| 4.34 | 2026-11-27 | Landing Experience: LP8b (Produkt-Metadaten finalisieren) umgesetzt: canonical, og:url, absolute Bildadressen |
| 4.33 | 2026-11-26 | RI12: Vergleichsseite um Höchstwert in der Umgebung (±100 m) erweitert, erste Messung gegen die echte Copernicus-Datei eingetragen (Gipfel 14 bis 232 m unter der Karte, erwartbar bei 30 m) |
| 4.32 | 2026-11-26 | RI12 erledigt: DEM-Zugriff (`js/dem.js`, `js/dem_tiff.js`, `js/dem_logic.js`), E18 entschieden (eigener Code), Statuseintrag und Lizenzhinweis; RI13 als Nächstes |
| 4.31 | 2026-11-26 | RI11 erledigt: Messlauf im Browser ausgewertet (OpenTopography-Kopie von Copernicus GLO-30 abrufbar, 57,4 MB je Kachel; swissALTI3D 2 m 177 KB je km²; BEV 8,09 GB je Kachel), E7 bestätigt; RI12 freigegeben |
| 4.30 | 2026-11-26 | RI11: Recherche abgeschlossen (swissALTI3D-Lizenz OGD, BEV-Kachelschema und CC BY 4.0, OpenTopography-Bucket), Messseite sucht den OpenTopography-Dateipfad selbst, E7 als Entscheidungsvorlage mit Rückfallregel; Messlauf im Browser und Bestätigung offen |
| 4.29 | 2026-11-17 | RI11: zweite Messung dokumentiert (swissALTI3D-Kachel aus dem Browser abrufbar, OpenTopography-Kopie mit CORS, Pfad offen); E7 weiter offen, BEV ungemessen |
| 4.28 | 2026-11-17 | RI11: erstes Messergebnis im Browser dokumentiert (Copernicus-Direktabruf von AWS scheitert wegen fehlendem CORS (bestätigt), AWS Terrain Tiles funktionieren), Messseite um swissALTI3D-Kachel und Direktlinks erweitert; E7 weiter offen |
| 4.27 | 2026-11-17 | RI11: DEM-Quellenvergleich und Vorschlag für E7 (beste Auflösung je Region, Copernicus als Rückfall, Bewuchs aus Land Cover; E18 Bibliotheksfrage offen) im Route Intelligence Plan, DEM-Eintrag in DATENQUELLEN korrigiert (10 m / CC BY 4.0 nicht belegt), Messseite `scripts/spike_dem_cors.html` außerhalb der Anwendung; Messwerte (CORS, Range, Datenmenge) stehen aus |
| 4.26 | 2026-11-17 | Route Intelligence Plan: Entscheidung E16 (Sonnenstand im eigenen Code, keine Bibliothek) bestätigt, DATENQUELLEN-Notiz zu SunCalc angepasst; nur Dokumentation |
| 4.25 | 2026-11-17 | Route Intelligence Plan: Entscheidung E17 (Zeitbezug der Sonnenanalyse: Nutzer wählt Datum und Uhrzeit) bestätigt; nur Dokumentation |
| 4.24 | 2026-11-16 | Route Intelligence Plan: Geländebedeckung (Land Cover, RI15a–RI15e) und Sonneneinstrahlung/Schatten (RI15f–RI15k) in Stufe 3.3 ergänzt, Entscheidungen E15–E17 offen; nur Dokumentation |
| 4.23 | 2026-11-16 | Route Intelligence: RI10b (Wetter entlang der Route: Anzeige je Stützpunkt auf Knopfdruck, Datenschutzhinweis, Nullgradgrenze neben der Routenhöhe) umgesetzt; Stufe 2.2 damit abgeschlossen |
| 4.22 | 2026-11-16 | Route Intelligence: RI10a (Wetter entlang der Route, Datenzugriff: Stützpunkte, Abruf in einer Abfrage, Zwischenspeicher; Wetterkarte unverändert) umgesetzt |
| 4.21 | 2026-11-15 | Route Intelligence: RI9b (Lawinenlage entlang der Route: Abschnitte mit Stufe nach Höhe, Probleme, Quelle, Regionalhinweis; nur mit archiviertem Bericht geprüft, Saisontest offen) umgesetzt |
| 4.20 | 2026-11-15 | Route Intelligence: RI9a (Lawinenlage entlang der Route als reine Logik: Region je Abschnitt, Stufe nach Höhe der Route) umgesetzt |
| 4.19 | 2026-11-15 | Route Intelligence: RI8 (Schutzgebiete und Sperrungen entlang der Route: Liste mit km-Bereichen, Popup, Hervorhebung auf der Karte; Schnitt um Linien und Punkte erweitert) umgesetzt |
| 4.18 | 2026-11-15 | Route Intelligence: RI7 (räumlicher Schnitt Route × Polygone als reine Logik, Abschnitte von km bis km, Messung an den Schutzgebieten) umgesetzt |
| 4.17 | 2026-11-15 | Route Intelligence: RI6 (lokale Routenverwaltung: speichern, öffnen, umbenennen, als GPX exportieren, löschen; IndexedDB, nichts wird übertragen) umgesetzt |
| 4.16 | 2026-11-15 | Route Intelligence: RI5 (Höhenprofil in der Routenkarte, verbunden mit der Karte) umgesetzt |
| 4.15 | 2026-11-15 | Route Intelligence: RI4 (Routenstatistik aus den GPX-Höhen: Länge, Anstieg/Abstieg mit Hysterese, höchster/tiefster Punkt, Dauer) umgesetzt |
| 4.14 | 2026-11-15 | Route Intelligence: RI3 (GPX laden und auf der Karte anzeigen, lokal im Browser) umgesetzt |
| 4.13 | 2026-11-15 | Dokumentation: README, DATENQUELLEN und ALPINE_RISK_ENGINE mit der ROADMAP abgeglichen (Status DEM/OSM, Phasen, Modulanzahl) |
| 4.13b | 2026-11-15 | Route Intelligence: RI2 (Routenmodell und Geometrie, reine Logik ohne Oberfläche) umgesetzt |
| 4.12 | 2026-11-15 | Route Intelligence: RI1 (GPX-Parser, reine Logik ohne Oberfläche) umgesetzt |
| 4.11 | 2026-11-13 | Route Intelligence: RI0 (Grundsatzentscheidungen E1–E14) bestätigt, GPX nur lokal im Browser, nur Dokumentation |
| 4.10 | 2026-11-13 | Route Intelligence Plan (docs/ROUTE_INTELLIGENCE_PLAN.md) ergänzt, nur Dokumentation |
| 4.9 | 2026-11-13 | Landing Experience: LP1b (Hero Visual & Landing-Hintergrund) umgesetzt |
| 4.8 | 2026-11-04 | Landing Experience: LP8 (SEO & Sharing) umgesetzt |
| 4.7 | 2026-11-04 | Landing Experience: LP7 (Navigation & Unterseiten) umgesetzt |
| 4.6 | 2026-11-04 | Landing Experience: LP6 (Produktvision) umgesetzt |
| 4.5 | 2026-11-04 | Landing Experience: LP5 (Datenquellen & Transparenz) umgesetzt |
| 4.4 | 2026-11-04 | Landing Experience: LP4 (Alpine Risk Intelligence) umgesetzt |
| 4.3 | 2026-11-04 | Landing Experience: LP3 (Aktuelle Informationsquellen) umgesetzt |
| 4.2 | 2026-11-04 | Landing Experience: LP2 (Was ist Mountain Radar?) umgesetzt |
| 4.1 | 2026-11-04 | Landing Experience: LP1 (Hero & Landing-Struktur) umgesetzt, Startseite `index.html`, Anwendung nach `app.html` verschoben |
| 4.0 | 2026-11-03 | Design-Migrationsplan D13 (globale Suche, Phase 1) umgesetzt, Design-Migration D1–D13 abgeschlossen |
| 3.9 | 2026-11-03 | Design-Migrationsplan D12 (gedämpfte Kartenoptik) umgesetzt |
| 3.8 | 2026-11-03 | Design-Migrationsplan D11 (mobiles Layout mit Bottom Sheet, bis 820 px) umgesetzt |
| 3.7 | 2026-11-03 | Design-Migrationsplan D10 (vollflächige Karte, schwebende Karten ab 1200 px) umgesetzt |
| 3.6 | 2026-11-01 | Weather Intelligence Popup (WEB-T7) als geplantes Feature in der Toolbox ergänzt (nur Dokumentation) |
| 3.5 | 2026-11-01 | Design-Migrationsplan D9 (Legendenkarte) umgesetzt |
| 3.4 | 2026-11-01 | Design-Migrationsplan D8c (Sperrungen- und Hinweise-Popups) umgesetzt |
| 3.3 | 2026-10-31 | Design-Migrationsplan D8b (Lawinenlage-Popups) umgesetzt |
| 3.2 | 2026-10-31 | Design-Migrationsplan D8a (Schutzgebiets-Popups) umgesetzt |
| 3.1 | 2026-10-31 | Design-Migrationsplan D7 (Layer-Panel „Intelligence Layers“) umgesetzt |
| 3.0 | 2026-10-31 | Design-Migrationsplan D6 (Seitenleisten-Karten im neuen Stil) umgesetzt |
| 2.9 | 2026-10-31 | Design-Migrationsplan D5 (Datenstatus-Leiste) umgesetzt |
| 2.8 | 2026-10-30 | Design-Migrationsplan D4 (Header als App-Shell) umgesetzt |
| 2.7 | 2026-10-30 | Design-Migrationsplan D3 (gemeinsame Komponenten-CSS) umgesetzt |
| 2.6 | 2026-10-30 | Design-Migrationsplan D2 (Design-Tokens, Inter selbst gehostet) umgesetzt |
| 2.5 | 2026-10-30 | Design-Migrationsplan D1 (Branding, Titel, Favicon) umgesetzt |
| 2.4 | 2026-10-30 | Konsistenzprüfung: Status von DEM, GPX, OSM, Schutzgebiete und Wildlife korrigiert, Branding-Abschnitt, Phasen und Prioritäten abgeglichen |
| 2.3 | 2026-10-30 | Filter Sperrungen & Hinweise im Bedienfeld „Karten & Layer“ |
| 2.2 | 2026-10-29 | Schutzgebiete: Filter, Symbole, Wildlife-Namen |
| 2.1 | 2026-10-29 | Meilenstein „Mehrländriges Lawinenframework“ |
| 2.0 | 2026-10-29 | Konsolidation: Alpine Risk Intelligence Roadmap + Mountain Radar Toolbox integriert |
| 1.0 | 2026-10 | Initial Bergbedingungen Roadmap |

---

# 🔗 Zusätzliche Dokumentation

Diese Roadmap ist Teil eines größeren Dokumentationssystems:

- **DATENQUELLEN.md** — Vollständiger Katalog aller Datenquellen (15+) mit URLs, Lizenzen und Phasen
- **docs/WORKFLOW.md** — Entwicklungs-Workflow und Definition of Done
- **docs/STYLEGUIDE.md** — Design System von Mountain Radar
- **docs/ROUTE_INTELLIGENCE_PLAN.md** — Entwicklungsplan Route Intelligence: GPX, Höhenprofil, Kontext entlang der Route, DEM, Geländebedeckung (Land Cover, RI15a–RI15e), Sonne und Schatten (RI15f–RI15k), Befunde (RI1–RI12 umgesetzt, Rest Plan; Arbeitsdokument)
- **docs/ALPINE_RISK_ENGINE.md** — Konzept der Alpine Risk Engine
- **docs/IDEENSAMMLUNG.md** — Ideen, die noch nicht in der Roadmap stehen
- **docs/LAWINENLAGE_ANALYSE.md** — Detaillierte Analyse der Lawinenlage-Integration
- **docs/AVALANCHE_ARCHITECTURE.md** — Lawinen-Framework: Provider, Datenmodell, GeoJSON-Schema, Erweiterung um neue Länder
- **docs/WILDLIFE_ANALYSE.md** — Analyse und Dokumentation der Wildlife-Daten