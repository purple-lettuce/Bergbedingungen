# Roadmap — Alpine Risk Intelligence

**Mission:** Mountain Radar entwickelt sich von einer reinen Kartenapplikation zu einer **Risikobewertungs- und Warnplattform für alpine Touren**.

**Vision:** Ein Nutzer lädt einen GPX Track hoch oder plant eine Route. Mountain Radar analysiert über 14 verschiedene Risikofaktoren und erstellt daraus eine evidenzbasierte Risikobewertung mit konkreten Warnungen und Empfehlungen.

---

# 📊 Roadmap-Übersicht

```
Phase 1: Grundlagen (Q4 2026 - Q1 2027)
├─ DEM, OSM, Kartografie
├─ Geländeanalyse-Module
└─ GPX-Import & Visualisierung

Phase 2: Wetterintegration (Q1 - Q2 2027)
├─ GeoSphere-Integration
├─ ALBINA & SLF Lawinenlage
└─ Tourenwarnungen

Phase 3: Gefahrenmodellierung (Q2 - Q3 2027)
├─ Unfallanalyse-Engine
├─ Steinschlag- & Muren-Indikatoren
├─ Regionale Daten (Tirol)
└─ Alpine Risk Engine (Beta)

Phase 4: Internationale Expansion (Q4 2027 - Q1 2028)
├─ Météo-France Integration
├─ AINEVA Integration
├─ ARSO Integration
└─ Multi-Land Coverage

Phase 5: Production & Optimierung (Q1 2028+)
├─ Alpine Risk Engine (GA)
├─ Performance-Optimierung
├─ Benutzerforschung & Refinement
└─ Community-Features (Echtzeit-Meldungen, etc.)
```

---

# 🎯 Kernmodule

Diese Module sind das Rückgrat der Alpine Risk Intelligence:

| Modul | Status | Phase | Datenquellen | Priorität |
|---|---|---|---|---|
| **Geländeanalyse** | In Arbeit | 1 | DEM, OSM | 🔴 Sehr hoch |
| **GPX Analyse** | In Arbeit | 1 | DEM, OSM, Basemap | 🔴 Sehr hoch |
| **Infrastruktur** | In Arbeit | 1 | OSM, Tirol Hub | 🔴 Sehr hoch |
| **Wetterrisiko** | Geplant | 2 | GeoSphere, Meteostat | 🔴 Sehr hoch |
| **Lawinenlage** | In Umsetzung | 2 | ALBINA, SLF, Météo-FR, AINEVA, ARSO | 🔴 Sehr hoch |
| **Unfallanalyse** | Geplant | 3 | BMI, SLF Forschung | 🟠 Hoch |
| **Schutzgebiete** | Recherche | 3 | Tirol Hub, Regional | 🟡 Mittel |
| **Wildlife** | Recherche | 3 | Tirol Hub, Regional | 🟡 Mittel |
| **Alpine Risk Engine** | Design | 3-5 | Alle Module | 🔴 Sehr hoch |

---

# 🔄 Phasen im Detail

## **Phase 1: Grundlagen (Q4 2026 - Q1 2027)**

### Ziel
Schaffung der fundamentalen Dateninfrastruktur für alle Folgephasen. Basis für Geländeanalyse, Infrastruktur-Kontext und GPX-Verarbeitung.

### Datenquellen
- ✅ DEM (Austrian) — in Umsetzung
- ✅ OSM Overpass API — in Umsetzung
- ✅ Basemap.at — geplant
- ✅ Leaflet Plugins — in Umsetzung

### Zu liefernde Module
- [x] **Geländeanalyse-Engine**
  - Hangneigung (slope)
  - Exposition (aspect)
  - Steilheit-Klassifizierung
  - Absturzrisiko-Heuristiken
  
- [x] **Infrastruktur-Datenbank**
  - Alpine Hütten (tourism=alpine_hut)
  - Unterkünfte (amenity=shelter)
  - Trinkwasser (natural=spring, amenity=drinking_water)
  - Notfallpunkte (emergency=*)
  - Klettersteige (via_ferrata)
  
- [x] **GPX-Analyse-Pipeline**
  - GPX-Import & Parsing
  - Höhenprofil-Berechnung
  - Streckenlänge & Dauer-Prognose
  - Segmentweise Geländeklassifizierung
  - Wegschwierigkeit (sac_scale-Matching)

- [x] **Kartografische Grundlagen**
  - Basemap.at als Hintergrund
  - Orthofotos für Kontext
  - Schummerung für Geländeverstehen

### Abhängigkeiten
- Keine (unabhängig)

### Akzeptanzkriterien
- [ ] DEM-Daten in Prozess-Pipeline integriert
- [ ] OSM-Queries für alle 10+ Infrastrukturtypen aktiv
- [ ] GPX-Analyse zeigt Höhenprofil + Geländeklassifizierung
- [ ] Wegschwierigkeit wird korrekt erkannt (sac_scale I-VI)
- [ ] Infrastruktur-Layering funktioniert

### Risiken
- OSM-Datenqualität stark variabel (besonders remote areas)
- DEM-Auflösung (10m?) könnte für sehr steile Geländeanalyse ungenügend sein
- Performance bei großen Tracks

---

## **Phase 2: Wetterintegration (Q1 - Q2 2027)**

### Ziel
Echtzeitwarnungen basierend auf Wetterdaten und Lawinenlage. Basis für operative Tourenwarnungen und Risikokalibrierung.

### Datenquellen
- 🟠 GeoSphere Austria — Recherche + Integration
- ✅ ALBINA Euregio — in Umsetzung
- ✅ SLF Schweiz — in Umsetzung
- 🟡 Meteostat — Historische Kalibrierung

### Zu liefernde Module
- **Wetter-Cache & -Aktualisierung**
  - GeoSphere API-Integration
  - Wetterdaten-Caching (TTL 15-60 min)
  - Warnungs-Parser (Gewitter, Starkregen, Wind, Hitze)
  
- **Lawinenlage-Integration**
  - ALBINA CAAML-Parser
  - SLF CAAML-Parser
  - Lawinenstufe nach Exposition/Höhe
  - Gefahrenzone-Visualisierung
  
- **Tourenwarnungen**
  - Wetter + Lawinenlage + Route → Warnung
  - Warnschwellen kalibrieren (basierend auf Phase 3 Unfallanalyse)
  - Echtzeit-Pushs (später)

### Abhängigkeiten
- Phase 1 (Geländeanalyse für Exposition)
- Phase 1 (OSM für Kontext)

### Akzeptanzkriterien
- [ ] GeoSphere-Warnungen werden in Echtzeit abgerufen
- [ ] ALBINA-Lawinenlage wird korrekt geparst und nach Exposition gefiltert
- [ ] SLF-Lawinenlage ebenso
- [ ] Tourenwarnungen zeigen mindestens 3 Risikofaktoren
- [ ] API-Fehlertoleranz getestet (Fallback auf gecachte Daten)

### Risiken
- ALBINA/SLF APIs könnten zeitweise nicht verfügbar sein (Wartung)
- Georeferenzierung der Lawinenwarnungen (Höhenstufen-Polygone)
- Koordination zwischen Österreich/Schweiz bei Grenzregionen

---

## **Phase 3: Gefahrenmodellierung (Q2 - Q3 2027)**

### Ziel
Integration von Unfalldaten, regionale Spezialisierung und erste Iteration der **Alpine Risk Engine**. Übergang von Warnungen zu probabilistischen Risikobewertungen.

### Datenquellen
- 🟠 BMI Alpinpolizei Statistiken — Georeferenzierung erforderlich
- ✅ SLF Forschungsdaten — Unfalldatenbank
- 🟡 Meteostat — Steinschlag-/Muren-Indikatoren
- 🟡 Tirol Data Hub — Schutzgebiete, Wildlife, Sperrungen

### Zu liefernde Module
- **Unfallanalyse-Engine**
  - BMI-Daten georeferenzieren
  - SLF-Unfalldatenbank integrieren
  - Unfall-Hotspots nach Exposition/Höhe/Terrain-Typ identifizieren
  - Zeitliche Muster (Jahreszeit, Wochenende, Wetter)
  
- **Steinschlag- & Muren-Indikatoren**
  - Meteostat-Historisierung (Niederschlag → Gefahr)
  - Hangneigung + Geologie (aus DEM) → Prädisposition
  - Triggering-Schwellen definieren
  
- **Schutzgebiete-Modul** *(optional für Phase 3)*
  - Tirol Data Hub Schutzgebiete laden
  - Nationale Schutzgebiete (AT, CH)
  - Jagdgebiete (Wildnis-Kontext)
  
- **Wildlife-Modul** *(optional für Phase 3)*
  - Tirol Data Hub Wildnis-Daten
  - Begegnungshäufungen nach Jahreszeit
  - Migrationskorridore
  
- **Alpine Risk Engine (Beta)**
  - Zusammenführung aller Module
  - Risikoscore pro Segment: 0-100
  - Faktoren: Wetter (40%), Lawinenlage (25%), Unfallhistorie (15%), Gelände (15%), Infrastruktur (5%)
  - Schwellwerte für Warnungen
  - Datenstempel (letzte Aktualisierung)

### Abhängigkeiten
- Phase 1 ✅ (Gelände, OSM, GPX)
- Phase 2 ✅ (Wetter, Lawinenlage)

### Akzeptanzkriterien
- [ ] BMI-Daten sind georeferenziert (mindestens auf Gemeinde-Ebene)
- [ ] Unfall-Hotspots können visualisiert werden
- [ ] Muren-/Steinschlag-Indikatoren reagieren auf Wetter-Änderungen
- [ ] Schutzgebiete & Wildlife werden angezeigt
- [ ] Alpine Risk Engine berechnet Risikoscore pro Segment
- [ ] Warnungs-Schwellwerte sind evidenzbasiert (aus Unfallanalyse kalibriert)

### Risiken
- BMI-Daten könnten nur PDF-Reports sein (keine API)
- Lizenzfragen bei SLF-Forschungsdaten klären
- Unfall-Kausalitäten sind komplex (nicht immer korreliert mit Topografie)

---

## **Phase 4: Internationale Expansion (Q4 2027 - Q1 2028)**

### Ziel
Erweiterung der Abdeckung auf Frankreich, Italien und Slowenien. Alpine Risk Engine wird europaweit einsetzbar.

### Datenquellen
- 🟠 Météo-France Lawinenbulletin — Lizenz klären + Integration
- 🟠 AINEVA (Italien) — Lizenz klären + Integration
- 🟠 ARSO (Slowenien) — Lizenz klären + Integration

### Zu liefernde Module
- **Météo-France Integration**
  - CAAML-Parser (wie ALBINA/SLF)
  - Französische Alpen Coverage
  - DEM-Zuordnung (ggf. französisches DEM)
  
- **AINEVA Integration**
  - Italienische Lawinenlage
  - DEM-Zuordnung (italienisches DEM)
  - Regionale Spezialisierung
  
- **ARSO Integration**
  - Slowenische Alpen Coverage
  - Sprache/Lokalisierung

- **Multi-Land Risk Engine**
  - Regionale Faktoren-Gewichtung
  - Kulturelle Unterschiede in Risikowarnehmung

### Abhängigkeiten
- Phase 2 ✅ (CAAML-Parsing established)
- Phase 3 ✅ (Alpine Risk Engine)

### Akzeptanzkriterien
- [ ] Météo-France Lawinenlage wird korrekt geparst
- [ ] AINEVA & ARSO ebenso
- [ ] Coverage-Karte zeigt: Österreich, Schweiz, Frankreich, Italien, Slowenien
- [ ] Risk Engine funktioniert grenzübergreifend

### Risiken
- Unterschiedliche Datenformate zwischen Ländern
- Lizenzen unklar (besonders Italien/Slowenien)

---

## **Phase 5: Production & Optimierung (Q1 2028+)**

### Ziel
Alpine Risk Engine in Production; Community-Features & Echtzeit-Feedback.

### Zu liefernde Module
- **Alpine Risk Engine (GA)**
  - Performance-Optimierung (Caching, Indexing)
  - Genauigkeits-Validierung (Vergleich mit echten Unfällen)
  - Monitoring & Observability
  
- **Benutzerforschung**
  - Nutzer-Feedback zu Warnungs-Sensitivität
  - Kalibrierung der Schwellwerte
  
- **Community-Features** *(optional)*
  - Echtzeit-Meldungen (vor Ort)
  - Feedback auf Touren (Bestätigung/Widerlegung von Warnungen)
  - Leaderboards / Achievements (für Sicherheitsbewusstsein)

### Abhängigkeiten
- Alle bisherigen Phasen

---

# 📈 Feature-Priorisierung (nach Roadmap)

## P0 (Phase 1-3: Basis-Features)

1. **GPX-Import & Höhenprofil** ← Phase 1
2. **Geländeanalyse (Hangneigung, Exposition)** ← Phase 1
3. **Infrastruktur-Punkte** ← Phase 1
4. **Wegschwierigkeit (sac_scale)** ← Phase 1
5. **Live Wetterwarnungen** ← Phase 2
6. **Live Lawinenlage (ALBINA/SLF)** ← Phase 2
7. **Unfall-Hotspots** ← Phase 3
8. **Alpine Risk Engine (MVP)** ← Phase 3

## P1 (Phase 4: Internationale Features)

9. Météo-France Integration
10. AINEVA Integration
11. ARSO Integration
12. Schutzgebiete & Wildlife

## P2 (Phase 5: Optimierung & Nice-to-have)

13. Echtzeit-Community-Meldungen
14. Detaillierte Wetter-Prognosen (Meteomatics fallback)
15. Unfall-Feedback-Loop

---

# 🛠️ Abhängigkeitsdiagramm

```
┌──────────────────────────────────────────────────────────────┐
│            Alpine Risk Engine (Phase 5)                      │
│  Integriert alle Module für Risikobewertung                  │
└──────────────────────┬───────────────────────────────────────┘
                       │
        ┌──────────────┼──────────────┐
        │              │              │
        ▼              ▼              ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ Phase 3      │  │ Phase 2      │  │ Phase 1      │
│ Gefahr-      │  │ Wetter +     │  │ Gelände +    │
│ modellierung │  │ Lawinenlage  │  │ Infrastruktur
├──────────────┤  ├──────────────┤  ├──────────────┤
│ BMI Statistik│  │ GeoSphere    │  │ DEM          │
│ SLF Unfall-DB│  │ ALBINA       │  │ OSM          │
│ Meteostat    │  │ SLF          │  │ Basemap      │
│ Tirol Hub    │  └──────────────┘  │ Leaflet      │
│ Schutzgebiete│         │           └──────────────┘
│ Wildlife     │         │                  │
└──────────────┘         │                  │
        │                │                  │
        └────────────────┴──────────────────┘
               Abhängigkeitsfluss
         Phase 1 < Phase 2 < Phase 3 < Phase 5
```

---

# 📋 Implementierungs-Checkliste

### Phase 1 — Status: IN PROGRESS
- [x] DEM-Integration
- [x] OSM Overpass API Integration
- [x] GPX-Parser
- [x] Höhenprofil-Berechnung
- [ ] Wegschwierigkeit-Matching (sac_scale)
- [ ] Infrastruktur-Layer (Hütten, Wasser, etc.)
- [ ] Basemap.at Integration

### Phase 2 — Status: IN PROGRESS
- [x] ALBINA CAAML-Parser
- [x] SLF CAAML-Parser
- [ ] GeoSphere API Integration
- [ ] Lawinenlage-Visualisierung
- [ ] Tourenwarnungen-Logik
- [ ] Wetterdaten-Caching

### Phase 3 — Status: PLANNED
- [ ] BMI-Daten georeferenzieren
- [ ] SLF-Unfalldatenbank normalisieren
- [ ] Unfall-Hotspot-Algorithmus
- [ ] Steinschlag-/Muren-Indikatoren
- [ ] Schutzgebiete-Modul
- [ ] Wildlife-Modul
- [ ] Alpine Risk Engine (Beta)
- [ ] Warnungs-Schwellwerte kalibrieren

### Phase 4 — Status: FUTURE
- [ ] Météo-France Lizenz klären
- [ ] Météo-France Integration
- [ ] AINEVA Lizenz klären
- [ ] AINEVA Integration
- [ ] ARSO Lizenz klären
- [ ] ARSO Integration

### Phase 5 — Status: FUTURE
- [ ] Alpine Risk Engine GA (Performance)
- [ ] Benutzerforschung & A/B Tests
- [ ] Community-Features
- [ ] Monitoring & Observability

---

# 🔗 Arbeitspaket-Generator

Aus dieser Roadmap können folgende Arbeitspakete abgeleitet werden:

```
AP-1.1: DEM-Integration (Phase 1)
  ├─ Datenquelle: Austrian DEM
  ├─ Ziel: Hangneigung, Exposition berechenbar
  └─ Module: Geländeanalyse
  
AP-1.2: OSM Infrastruktur-Abfragen (Phase 1)
  ├─ Datenquellen: OSM (10+ Objekttypen)
  ├─ Ziel: Hütten, Wasser, Notfälle sichtbar
  └─ Module: Infrastruktur
  
AP-1.3: GPX-Analyse-Pipeline (Phase 1)
  ├─ Datenquellen: DEM, OSM
  ├─ Ziel: Höhenprofil, Schwierigkeit, Gefahren
  └─ Module: GPX Analyse
  
AP-2.1: GeoSphere Integration (Phase 2)
  ├─ Datenquelle: GeoSphere Austria
  ├─ Ziel: Wetterwarnungen in Echtzeit
  └─ Module: Wetterrisiko
  
AP-2.2: ALBINA & SLF Parser (Phase 2)
  ├─ Datenquellen: ALBINA, SLF
  ├─ Ziel: Lawinenlage nach Exposition filtern
  └─ Module: Lawinenlage
  
AP-3.1: BMI-Daten Georeferenzierung (Phase 3)
  ├─ Datenquelle: BMI Alpinpolizei
  ├─ Ziel: Unfall-Hotspots identifizieren
  └─ Module: Unfallanalyse
  
AP-3.2: Alpine Risk Engine (Phase 3)
  ├─ Abhängigkeiten: AP-1.*, AP-2.*
  ├─ Ziel: Segmentweise Risikobewertung
  └─ Module: Alpine Risk Engine
```

---

# 🎓 Qualitätsmetriken

Diese Metriken werden pro Phase gemessen:

| Metrik | Phase 1 | Phase 2 | Phase 3 | Phase 4 | Phase 5 |
|--------|---------|---------|---------|---------|---------|
| **Datenquellen aktiv** | 4 | 6 | 8+ | 11+ | 11+ |
| **Risikofaktoren integriert** | 3 | 5 | 8+ | 8+ | 14 |
| **Coverage (Länder)** | AT | AT, CH | AT, CH | AT, CH, FR, IT, SI | AT, CH, FR, IT, SI |
| **Touren/Tag analysierbar** | TBD | TBD | TBD | TBD | >1000 |
| **Warnungs-Genauigkeit** | N/A | >70% | >80% | >80% | >85% |
| **API Verfügbarkeit** | >99% | >99.5% | >99.5% | >99.5% | >99.9% |

---

# 📚 Versionshistorie

| Version | Datum | Änderung |
|---------|-------|----------|
| 1.0 | 2026-10-29 | Initial consolidated roadmap |

