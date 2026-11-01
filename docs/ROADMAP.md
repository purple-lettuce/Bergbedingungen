# Mountain Radar

ALPINE RISK INTELLIGENCE

Know before you go.

Technischer Projektname (Repository):
Bergbedingungen

# 🏔️ Mountain Radar Roadmap

> Version: 2.4 (aktuelle Version siehe Versionshistorie am Ende)
>
> Letzte Aktualisierung: 30.10.2026
>
> Dieses Dokument ist die Single Source of Truth für Vision, Prioritäten, Phasen und Projektstatus von Mountain Radar. Alle Statusangaben stehen in den Abschnitten „Aktuelle Prioritäten“, „Kernmodule“ und „Implementierungs-Checkliste“ und sind dort aufeinander abgestimmt.
>
> Technische Details, Datenquellen und APIs sind in DATENQUELLEN.md dokumentiert.

---

## Branding

- **Mountain Radar** ist der offizielle Produktname (Claim: ALPINE RISK INTELLIGENCE, Slogan: „Know before you go.“).
- **Bergbedingungen** ist der technische Projektname (Repository). Das Rebranding ist in der Dokumentation vollzogen (README, ROADMAP, DATENQUELLEN, STYLEGUIDE).
- In der Anwendung tritt der Produktname „Mountain Radar“ auf (Seitentitel, Meta-Beschreibung, Header, Favicon; Design-Migrationsplan D1 erledigt). Weitere Design-Schritte gehören zum Arbeitspaket „Design & Branding“ (siehe Prioritäten, Punkt 10). Der schrittweise Umsetzungsplan (kleine PRs D1–D13) steht in docs/design/DESIGN_MIGRATIONSPLAN.md.
- Das visuelle Design System (Farben, Typografie, Komponenten) ist in STYLEGUIDE.md beschrieben. Die Umsetzung in der Oberfläche ist noch nicht abgeschlossen.

---

## Dokumentationsregel

Nach Abschluss eines Arbeitspakets müssen folgende Dokumente geprüft werden (Ablauf: docs/WORKFLOW.md):

- ROADMAP.md (dieses Dokument)
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

# Aktuelle Prioritäten

| Priorität | Thema | Status |
|------------|------------|------------|
| 1 | Legende für Schutzgebiete | Erledigt |
| 2 | Filter nach Schutzgebietstyp | Erledigt (Filter im Bedienfeld „Karten & Layer“, Symbole für Wildlife und Regeln im Popup) |
| 3 | Lawinenlage | In Arbeit (Euregio und Schweiz umgesetzt, Test mit aktuellen Berichten ab Saisonstart 2026/27) |
| 4 | Unfalllayer | Recherche (Phase 3) |
| 5 | Unfall-Heatmap | Konzept (Phase 3) |
| 6 | Digiway Absturzrisiko | Konzept (Phase 3) |
| 7 | GPX Upload & Tourenanalyse | Geplant (Phase 1) |
| 8 | Mountain Radar Toolbox | Website: Wetter am Punkt vorhanden, übrige Werkzeuge geplant (Phase 1), Weather Intelligence Popup geplant (niedrige Priorität, WEB-T7); Mobile: Zukunft (Phase 4-5) |
| 9 | Alpine Risk Engine | Design (Beta Phase 3, GA Phase 5) |
| 10 | Design & Branding | In Arbeit (Styleguide vorhanden, Branding in der Anwendung mit D1 umgesetzt, Design-Tokens und Inter mit D2, Komponenten-CSS mit D3, Header mit D4, Datenstatus-Leiste mit D5, Seitenleisten-Karten mit D6, Layer-Panel mit D7, Schutzgebiets-Popups mit D8a, Lawinenlage-Popups mit D8b, Sperrungen- und Hinweise-Popups mit D8c umgesetzt (alle Popups auf dem gemeinsamen System), Legendenkarte mit D9 umgesetzt, Layout offen) |
| 11 | PWA & Offline | Zukunft (nach Phase 4) |
| 12 | Mobile App | Zukunft (Phase 4) |

---

# 📊 Roadmap-Übersicht — Alpine Risk Intelligence

Mountain Radar wird in **5 technischen Phasen** entwickelt:

```
Phase 1: Grundlagen (Q4 2026 - Q1 2027)
├─ Bereits umgesetzt: Schutzgebiete, Wildlife, Sperrungen & Hinweise, Wetter am Punkt (Open-Meteo)
├─ DEM, OSM, Kartografie
├─ Geländeanalyse-Module
├─ Website Toolbox (Koordinaten, Höhe, Entfernungen)
└─ GPX-Import & Visualisierung

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

| Modul | Status | Phase | Priorität |
|---|---|---|---|
| **Geländeanalyse** (DEM) | Geplant | 1 | 🔴 Sehr hoch |
| **GPX Analyse** | Geplant | 1 | 🔴 Sehr hoch |
| **Infrastruktur** (OSM) | Geplant | 1 | 🔴 Sehr hoch |
| **Wetterrisiko** | Geplant | 2 | 🔴 Sehr hoch |
| **Lawinenlage** | In Arbeit | 2 | 🔴 Sehr hoch |
| **Unfallanalyse** | Recherche | 3 | 🟠 Hoch |
| **Schutzgebiete** | Umgesetzt als Kartenebene (Layer, Legende, Filter, Popup mit Regeln); Risikomodul geplant | 1 (Anzeige), 3 (Risikomodul) | 🟡 Mittel |
| **Wildlife** | Umgesetzt als Teil der Schutzgebiete (Namen, Symbole, Popup); Darstellung wird verbessert, Risikomodul geplant | 1 (Anzeige), 3 (Risikomodul) | 🟡 Mittel |
| **Alpine Risk Engine** | Design | 3 (Beta), 5 (GA) | 🔴 Sehr hoch |
| **Mountain Radar Toolbox** | Website: teilweise (Wetter am Punkt), Mobile: Design | 1-2 (Website), 4-5 (Mobile) | 🟡 Mittel-Hoch |

Die Alpine Risk Engine setzt auf DEM, OSM, Wetterintegration (GeoSphere), Lawinenlage, Unfallanalyse und GPX Analyse auf. Deshalb startet sie erst nach Phase 1-2 mit der Beta in Phase 3. Detailkonzept: ALPINE_RISK_ENGINE.md (deren Phasenliste ist älter und gilt nicht, maßgeblich sind die Phasen dieser Roadmap).

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

**Status:** Geplant, nicht implementiert. **Priorität:** niedriger als die laufende Design-Migration (D10–D13); Start frühestens danach.

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

Stand der Prüfung am 30.10.2026: Im Repository gibt es keinen Code für DEM, OSM Overpass, GPX-Parser und Höhenprofil. Diese Punkte sind daher offen.

### Phase 1 — Status: IN PROGRESS
- [x] Schutzgebiete (Layer, Legende, Filter, Popup mit Regeln), Wildlife (Namen, Symbole), Sperrungen & Hinweise als Kartenebenen
- [x] Wetter am Punkt (Open-Meteo, WEB-T1)
- [ ] DEM-Integration
- [ ] OSM Overpass API Integration
- [ ] GPX-Parser
- [ ] Höhenprofil-Berechnung
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
- [ ] Umsetzung des Design Systems in der Oberfläche (weitere Schritte D10–D13 laut DESIGN_MIGRATIONSPLAN.md)
- [x] Produktname „Mountain Radar“ in der Anwendung (D1: Titel, Meta-Beschreibung, Header, Favicon)

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
- AP-1.1: DEM-Integration
- AP-1.2: OSM Infrastruktur-Abfragen
- AP-1.3: GPX-Analyse-Pipeline
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
- **docs/ALPINE_RISK_ENGINE.md** — Konzept der Alpine Risk Engine
- **docs/IDEENSAMMLUNG.md** — Ideen, die noch nicht in der Roadmap stehen
- **docs/LAWINENLAGE_ANALYSE.md** — Detaillierte Analyse der Lawinenlage-Integration
- **docs/AVALANCHE_ARCHITECTURE.md** — Lawinen-Framework: Provider, Datenmodell, GeoJSON-Schema, Erweiterung um neue Länder
- **docs/WILDLIFE_ANALYSE.md** — Analyse und Dokumentation der Wildlife-Daten