# Mountain Radar

ALPINE RISK INTELLIGENCE

Know before you go.

Repository:
Bergbedingungen

Status:
Übergangsphase vor möglichem Rebranding.

# 🏔️ Mountain Radar Roadmap

> Version: 2.0
>
> Letzte Aktualisierung: Oktober 2026
>
> Dieses Dokument beschreibt die langfristige Vision, die strategische Ausrichtung und die technische Roadmap der Entwicklung von Mountain Radar / Bergbedingungen.
>
> Technische Details, Datenquellen und APIs sind in DATENQUELLEN.md dokumentiert.

---

## Dokumentationsregel

Nach Abschluss eines Arbeitspakets müssen folgende Dokumente geprüft werden:

- ROADMAP.md (dieses Dokument)
- DATENQUELLEN.md
- docs/WORKFLOW.md

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
| 3 | Lawinenlage | In Arbeit (Euregio und Schweiz umgesetzt, Test mit aktuellen Berichten ab Saisonstart) |
| 4 | Unfalllayer | Recherche |
| 5 | Unfall-Heatmap | Konzept |
| 6 | Digiway Absturzrisiko | Konzept |
| 7 | GPX Upload & Tourenanalyse | Geplant |
| 8 | Mountain Radar Toolbox | Planung (Website + Mobile) |
| 9 | Alpine Risk Engine | Planung (Phase 3) |
| 10 | Design & UX | Geplant |
| 11 | PWA & Offline | Zukunft |
| 12 | Mobile App | Zukunft (Phase 4+) |

---

# 📊 Roadmap-Übersicht — Alpine Risk Intelligence

Mountain Radar wird in **5 technischen Phasen** entwickelt:

```
Phase 1: Grundlagen (Q4 2026 - Q1 2027)
├─ DEM, OSM, Kartografie
├─ Geländeanalyse-Module
├─ Website Toolbox (Koordinaten, Höhe, Entfernungen)
└─ GPX-Import & Visualisierung

Phase 2: Wetterintegration (Q1 - Q2 2027)
├─ GeoSphere-Integration
├─ ALBINA & SLF Lawinenlage
├─ Tourenwarnungen
└─ Website Wetter-am-Punkt erweitert

Phase 3: Gefahrenmodellierung (Q2 - Q3 2027)
├─ Unfallanalyse-Engine
├─ Steinschlag- & Muren-Indikatoren
├─ Regionale Daten (Tirol)
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
| **Geländeanalyse** | In Arbeit | 1 | 🔴 Sehr hoch |
| **GPX Analyse** | In Arbeit | 1 | 🔴 Sehr hoch |
| **Infrastruktur** | In Arbeit | 1 | 🔴 Sehr hoch |
| **Wetterrisiko** | Geplant | 2 | 🔴 Sehr hoch |
| **Lawinenlage** | In Umsetzung | 2 | 🔴 Sehr hoch |
| **Unfallanalyse** | Geplant | 3 | 🟠 Hoch |
| **Schutzgebiete** | Recherche | 3 | 🟡 Mittel |
| **Wildlife** | Recherche | 3 | 🟡 Mittel |
| **Alpine Risk Engine** | Design | 3-5 | 🔴 Sehr hoch |
| **Mountain Radar Toolbox** | Design | 1-5 | 🟡 Mittel-Hoch |

Datenquellen für alle Module sind in **DATENQUELLEN.md** dokumentiert.

---

# 🧰 Mountain Radar Toolbox

**Mission:** Eine zentrale Sammlung alpiner Werkzeuge für Tourenplanung, Orientierung und Risikobeurteilung — sowohl in der Web-App als auch in der zukünftigen Mobile App.

**Vision:** Know before you go. — Mit der Toolbox können Nutzer schnell Koordinaten prüfen, Entfernungen messen, Höhen bestimmen und GPS-Daten validieren.

## Website Toolbox (Phase 1-2)

- **WEB-T1:** Wetter am Punkt ✅ (Existierend, Phase 2)
- **WEB-T2:** Koordinaten anzeigen (Phase 1)
- **WEB-T3:** Höhe anzeigen (Phase 1)
- **WEB-T4:** Entfernung zum Standort (Phase 1)
- **WEB-T5:** Entfernung zwischen zwei Punkten (Phase 1)
- **WEB-T6:** Höhenprofil entlang Linie (Phase 1)

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

### Phase 1 — Status: IN PROGRESS
- [x] DEM-Integration
- [x] OSM Overpass API Integration
- [x] GPX-Parser
- [x] Höhenprofil-Berechnung
- [ ] Wegschwierigkeit-Matching (sac_scale)
- [ ] Website Toolbox: Koordinaten & Höhe
- [ ] Website Toolbox: Entfernungsmessungen
- [ ] Basemap.at Integration

### Phase 2 — Status: IN PROGRESS
- [x] ALBINA CAAML-Parser
- [x] SLF CAAML-Parser
- [x] Mehrländriges Lawinenframework (siehe Technische Meilensteine)
- [ ] GeoSphere API Integration
- [ ] Lawinenlage-Visualisierung: Euregio und Schweiz umgesetzt, Test mit aktuellen Berichten ab Saisonstart 2026/27 offen
- [ ] Tourenwarnungen-Logik
- [ ] Website Wetter-am-Punkt erweitert

### Phase 3 — Status: PLANNED
- [ ] BMI-Daten georeferenzieren
- [ ] Unfall-Hotspot-Algorithmus
- [ ] Steinschlag-/Muren-Indikatoren
- [ ] Schutzgebiete-Modul
- [ ] Wildlife-Modul
- [ ] Alpine Risk Engine (Beta)

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
- AP-2.2: ALBINA & SLF Parser
- AP-2.3: Website Wetter-am-Punkt erweitert

**Phase 3 Arbeitspakete:**
- AP-3.1: BMI-Daten Georeferenzierung
- AP-3.2: Alpine Risk Engine (Beta)

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

---

# 📚 Versionshistorie

| Version | Datum | Änderung |
|---------|-------|----------|
| 2.2 | 2026-10-29 | Schutzgebiete: Filter, Symbole, Wildlife-Namen |
| 2.1 | 2026-10-29 | Meilenstein „Mehrländriges Lawinenframework“ |
| 2.0 | 2026-10-29 | Konsolidation: Alpine Risk Intelligence Roadmap + Mountain Radar Toolbox integriert |
| 1.0 | 2026-10 | Initial Bergbedingungen Roadmap |

---

# 🔗 Zusätzliche Dokumentation

Diese Roadmap ist Teil eines größeren Dokumentationssystems:

- **DATENQUELLEN.md** — Vollständiger Katalog aller Datenquellen (15+) mit URLs, Lizenzen und Phasen
- **docs/WORKFLOW.md** — Entwicklungs-Workflow und Definition of Done
- **docs/LAWINENLAGE_ANALYSE.md** — Detaillierte Analyse der Lawinenlage-Integration
- **docs/AVALANCHE_ARCHITECTURE.md** — Lawinen-Framework: Provider, Datenmodell, GeoJSON-Schema, Erweiterung um neue Länder
- **docs/WILDLIFE_ANALYSE.md** — Analyse und Dokumentation der Wildlife-Daten