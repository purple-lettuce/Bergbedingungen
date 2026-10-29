# Datenquellen — Alpine Risk Intelligence

**Vision:** Ein Nutzer lädt einen GPX Track hoch oder plant eine Route. Mountain Radar analysiert über 14 verschiedene Risikofaktoren und erstellt daraus eine Risikobewertung.

---

## 1. WETTER & UNWETTERWARNUNGEN

### GeoSphere Austria (🇦🇹 prioritär)

| Eigenschaft | Wert |
|---|---|
| **URL** | https://data.hub.geosphere.at/ |
| **Beschreibung** | Österreichisches Meteorologisches Warnungssystem |
| **Fachlicher Nutzen** | Gewitterwarnungen, Starkregenwarnungen, Windwarnungen, Hitzewarnungen, generische Unwetterwarnungen |
| **Geplanter Einsatz** | Wetterrisiko, Gewitterrisiko, Tourenwarnungen |
| **Lizenzsituation** | Open Data (CC BY 4.0) |
| **Priorität** | 🔴 Sehr hoch |
| **Roadmap-Phase** | Phase 2 (Wetterintegration) |
| **Zugeordnete Module** | Wetterrisiko, Alpine Risk Engine |
| **Status** | Nicht gestartet |
| **Abhängigkeiten** | Keine |
| **Notizen** | Grundlage für Tourenwarnungen und die Risikobewertung |

### Meteostat

| Eigenschaft | Wert |
|---|---|
| **URL** | https://meteostat.net/ |
| **Beschreibung** | Historische Wetterdaten-Plattform |
| **Fachlicher Nutzen** | Historische Wetterdaten, Niederschlagsverlauf, Wetterhistorie zur Detektion von Steinschlag- und Murenereignissen |
| **Geplanter Einsatz** | Steinschlagindikatoren, Murenindikatoren |
| **Lizenzsituation** | Open Data (kostenlos) |
| **Priorität** | 🟡 Mittel-Hoch |
| **Roadmap-Phase** | Phase 3 (Gefahrenmodellierung) |
| **Zugeordnete Module** | Geländeanalyse, Alpine Risk Engine |
| **Status** | Nicht gestartet |
| **Abhängigkeiten** | DEM (für Steinschlag-/Murensimulation) |
| **Notizen** | Historische Kontextualisierung für Risikokalibrierung |

---

## 2. GELÄNDEMODELLE & TOPOGRAPHIE

### Austrian DEM / DGM (🇦🇹 Basis)

| Eigenschaft | Wert |
|---|---|
| **URL** | https://www.data.gv.at/ |
| **Beschreibung** | Österreichisches Digitales Höhenmodell |
| **Fachlicher Nutzen** | Hangneigung, Exposition, Steilheit, Geländeanalyse, Absturzrisiko-Berechnung |
| **Geplanter Einsatz** | Risk Engine, GPX Analyse, Gefahrenmodelle |
| **Lizenzsituation** | Open Data (CC BY 4.0) |
| **Priorität** | 🔴 Sehr hoch |
| **Roadmap-Phase** | Phase 1 (Grundlagen) |
| **Zugeordnete Module** | Geländeanalyse, GPX Analyse, Alpine Risk Engine |
| **Status** | In Umsetzung |
| **Abhängigkeiten** | Keine (unabhängig) |
| **Notizen** | Fundamentales Datenset für alle geometrischen Analysen |

---

## 3. INFRASTRUKTUR & WEGE

### OpenStreetMap — Overpass API (🌍 umfassend)

| Eigenschaft | Wert |
|---|---|
| **URL** | https://wiki.openstreetmap.org/wiki/Overpass_API |
| **Test-Tool** | https://overpass-turbo.eu/ |
| **Beschreibung** | Globales Vektordatennetz mit Wegen, Hütten, Infrastruktur |
| **Fachlicher Nutzen** | Wegschwierigkeit (sac_scale), Wegsichtbarkeit (trail_visibility), Oberflächentyp (surface), alpine Infrastruktur, Notunterkünfte, Trinkwasser, Klettersteige |
| **Relevante OSM-Tags** | sac_scale, trail_visibility, surface, tourism=alpine_hut, amenity=shelter, natural=spring, amenity=drinking_water, emergency=*, highway=via_ferrata, via_ferrata_scale |
| **Geplanter Einsatz** | Wegschwierigkeit, Infrastruktur, Notunterkünfte, Trinkwasserversorgung, Klettersteige, Alpine Risk Engine |
| **Lizenzsituation** | Open Data (ODbL 1.0) |
| **Priorität** | 🔴 Sehr hoch |
| **Roadmap-Phase** | Phase 1 (Grundlagen) |
| **Zugeordnete Module** | Infrastruktur, GPX Analyse, Alpine Risk Engine |
| **Status** | In Umsetzung |
| **Abhängigkeiten** | Keine (unabhängig) |
| **Notizen** | Deckt 80% der relevanten Infrastruktur ab; Datenqualität variabel nach Region |

---

## 4. LAWINENLAGE & SCHNEE

### ALBINA — Euregio Lawinenlage (🇦🇹🇮🇹 operativ)

| Eigenschaft | Wert |
|---|---|
| **URL** | https://lawis.at/lawis_api/public/swagger/ |
| **Beschreibung** | Gemeinsames Lawinenwarnungssystem Euregio (Österreich, Südtirol, Liechtenstein) |
| **Fachlicher Nutzen** | Operative Lawinenwarnungen, Lawinenlage nach Höhenstufe und Exposition, regionale Risikomodelle |
| **Geplanter Einsatz** | Lawinenlage in Euregio, Tourenwarnungen, Alpine Risk Engine |
| **Lizenzsituation** | Frei zugänglich (CAAML-Standard) |
| **Priorität** | 🔴 Sehr hoch |
| **Roadmap-Phase** | Phase 2 (Wetterintegration) |
| **Zugeordnete Module** | Lawinenlage, Alpine Risk Engine |
| **Status** | In Umsetzung |
| **Abhängigkeiten** | OSM (Infrastruktur-Kontext), DEM (Exposition) |
| **Notizen** | Saisonale Verfügbarkeit (Winter) |

### SLF Schweiz — CAAML Bulletin (🇨🇭 operativ)

| Eigenschaft | Wert |
|---|---|
| **URL** | https://aws.slf.ch/api/bulletin/caaml |
| **Beschreibung** | Schweizer Lawinenwarnungssystem des SLF |
| **Fachlicher Nutzen** | Schweizer Lawinenlage, regionale Warnungen, Ausbildungsstufen (EAWS) |
| **Geplanter Einsatz** | Lawinenlage in Schweiz, Tourenwarnungen, Alpine Risk Engine |
| **Lizenzsituation** | Frei zugänglich (CAAML-Standard) |
| **Priorität** | 🔴 Sehr hoch |
| **Roadmap-Phase** | Phase 2 (Wetterintegration) |
| **Zugeordnete Module** | Lawinenlage, Alpine Risk Engine |
| **Status** | In Umsetzung |
| **Abhängigkeiten** | OSM, DEM |
| **Notizen** | Komplementär zu ALBINA; erweitert Coverage auf Schweiz |

### SLF Forschungsdaten — Lawinenunfälle (🇨🇭 historisch)

| Eigenschaft | Wert |
|---|---|
| **URL** | https://www.slf.ch/ |
| **Beschreibung** | Historische Datenbank von Lawinenunfällen und Ereignissen |
| **Fachlicher Nutzen** | Unfall-Hotspots, historische Analyse, Häufungen nach Exposition/Höhe |
| **Geplanter Einsatz** | Unfallanalyse, Lawinengefahr-Hotspots, Alpine Risk Engine |
| **Lizenzsituation** | Forschungsdaten (Lizenz zu klären) |
| **Priorität** | 🔴 Sehr hoch |
| **Roadmap-Phase** | Phase 3 (Gefahrenmodellierung) |
| **Zugeordnete Module** | Unfallanalyse, Alpine Risk Engine |
| **Status** | Nicht gestartet |
| **Abhängigkeiten** | DEM, OSM (Kontext) |
| **Notizen** | Enables evidence-based risk calibration |

---

## 5. LAWINENLAGE — FOLGEQUELLEN

### Météo-France — Lawinenbulletin (🇫🇷 geplant)

| Eigenschaft | Wert |
|---|---|
| **URL** | https://meteofrance.com/ |
| **Beschreibung** | Französisches Lawinenwarnungssystem |
| **Fachlicher Nutzen** | Lawinenlage in Französischen Alpen |
| **Geplanter Einsatz** | Erweiterung Coverage auf Frankreich |
| **Lizenzsituation** | ⚠️ **Zu recherchieren** |
| **Priorität** | 🟠 Mittel |
| **Roadmap-Phase** | Phase 4 (Internationale Expansion) |
| **Zugeordnete Module** | Lawinenlage, Alpine Risk Engine |
| **Status** | Nicht gestartet |
| **Abhängigkeiten** | ALBINA/SLF-Integration (precedent) |
| **Notizen** | Regionale Erweiterung |

### AINEVA — Italien (🇮🇹 geplant)

| Eigenschaft | Wert |
|---|---|
| **URL** | https://www.aineva.it/ |
| **Beschreibung** | Italienische Lawinen-Datenbank und Warnsystem |
| **Fachlicher Nutzen** | Lawinenlage in italienischen Alpen |
| **Geplanter Einsatz** | Erweiterung Coverage auf Italien |
| **Lizenzsituation** | ⚠️ **Zu recherchieren** |
| **Priorität** | 🟠 Mittel |
| **Roadmap-Phase** | Phase 4 (Internationale Expansion) |
| **Zugeordnete Module** | Lawinenlage, Alpine Risk Engine |
| **Status** | Nicht gestartet |
| **Abhängigkeiten** | ALBINA/SLF-Integration |
| **Notizen** | Regionale Erweiterung |

### ARSO — Slowenien (🇸🇮 geplant)

| Eigenschaft | Wert |
|---|---|
| **URL** | https://www.arso.gov.si/ |
| **Beschreibung** | Slowenisches Lawinenwarnungssystem |
| **Fachlicher Nutzen** | Lawinenlage in slowenischen Alpen |
| **Geplanter Einsatz** | Erweiterung Coverage auf Slowenien |
| **Lizenzsituation** | ⚠️ **Zu recherchieren** |
| **Priorität** | 🟠 Mittel |
| **Roadmap-Phase** | Phase 4 (Internationale Expansion) |
| **Zugeordnete Module** | Lawinenlage, Alpine Risk Engine |
| **Status** | Nicht gestartet |
| **Abhängigkeiten** | ALBINA/SLF-Integration |
| **Notizen** | Regionale Erweiterung |

---

## 6. UNFÄLLE & EREIGNISSE

### BMI Alpinpolizei — Alpinstatistik (🇦🇹 jährlich)

| Eigenschaft | Wert |
|---|---|
| **URL** | https://www.bmi.gv.at/202/alpinpolizei/ |
| **Beschreibung** | Jährliche Statistik von Alpin- und Bergunfällen in Österreich |
| **Fachlicher Nutzen** | Alpine Unfallstatistiken, Unfalltypen (Sturz, Absturz, Erfrierung, etc.), Häufungen |
| **Geplanter Einsatz** | Unfallanalyse, Risikokalibrierung, Warnsysteme |
| **Lizenzsituation** | Open Data |
| **Priorität** | 🟠 Hoch |
| **Roadmap-Phase** | Phase 3 (Gefahrenmodellierung) |
| **Zugeordnete Module** | Unfallanalyse, Alpine Risk Engine |
| **Status** | Nicht gestartet |
| **Abhängigkeiten** | Georeferenzierung notwendig |
| **Offen** | Gibt es georeferenzierte Unfalldaten? (nur PDF-Reports verfügbar?) |
| **Notizen** | Statistiken werden ca. März des Folgejahrs veröffentlicht |

---

## 7. KARTOGRAPHISCHE GRUNDLAGEN

### Basemap.at (🇦🇹 Kartografik)

| Eigenschaft | Wert |
|---|---|
| **URL** | https://basemap.at/#anwendungen |
| **Beschreibung** | Österreichische Grundkarten und Hintergrundlayer |
| **Fachlicher Nutzen** | Hintergrundkarten, Orthofotos, Schummerung, Terrain-Kontext |
| **Geplanter Einsatz** | Kartendarstellung, UI/UX-Kontext |
| **Lizenzsituation** | Open Data (CC BY 4.0) |
| **Priorität** | 🟡 Mittel |
| **Roadmap-Phase** | Phase 1 (Grundlagen) |
| **Zugeordnete Module** | GPX Analyse (UI) |
| **Status** | Nicht gestartet |
| **Abhängigkeiten** | Keine |
| **Notizen** | Ergänzt OSM-Daten mit amtlichen Kartographien |

---

## 8. REGIONAL OPEN DATA

### Tirol Data Hub (🇦🇹 regional)

| Eigenschaft | Wert |
|---|---|
| **URL** | https://www.datahub.tirol/leistungen/datenkatalog |
| **Beschreibung** | Open Data Portal des Landes Tirol |
| **Potenziale** | Sperrungen, Forstwege, Infrastruktur, Rettungspunkte, Wildnis-Daten |
| **Geplanter Einsatz** | Wildlife (Jagdgebiete, Schutzgebiete), Infrastruktur-Verfeinerung, Sperrungen |
| **Lizenzsituation** | Überwiegend CC BY 4.0 |
| **Priorität** | 🟡 Mittel |
| **Roadmap-Phase** | Phase 3 (Gefahrenmodellierung) |
| **Zugeordnete Module** | Schutzgebiete, Wildlife, Infrastruktur |
| **Status** | Recherche erforderlich |
| **Abhängigkeiten** | Keine |
| **Notizen** | Regionale Vertiefung; weitere Recherche erforderlich |

---

## 9. WETTER — ERWEITERTE QUELLEN

### Meteomatics Weather API

| Eigenschaft | Wert |
|---|---|
| **URL** | https://www.meteomatics.com/en/weather-api/ |
| **Beschreibung** | Kommerzielle erweiterte Wetterdaten und Prognosen |
| **Fachlicher Nutzen** | Hochauflösende Wetter-Prognosen, Windmodelle, Temperaturgradienten |
| **Geplanter Einsatz** | Alternative/Ergänzung zu GeoSphere, Mikroklima-Modellierung |
| **Lizenzsituation** | Kommerziell (API-Schlüssel erforderlich) |
| **Priorität** | 🟢 Niedrig-Mittel |
| **Roadmap-Phase** | Phase 3+ (Optional) |
| **Zugeordnete Module** | Wetterrisiko, Alpine Risk Engine |
| **Status** | Alternative Quelle |
| **Abhängigkeiten** | GeoSphere (Primär) |
| **Notizen** | Fallback/Ergänzung; höhere Granularität, aber kommerziell |

---

## 10. FRONTEND-INFRASTRUKTUR

### Leaflet Plugins

| Eigenschaft | Wert |
|---|---|
| **URL** | https://leafletjs.com/plugins.html |
| **Beschreibung** | Umfangreiche Plugin-Bibliothek für Kartenvisualisierung |
| **Fachlicher Nutzen** | Kartenfunktionen, GPX-Import, Analysewerkzeuge, Layer-Management |
| **Geplanter Einsatz** | Frontend-Komponenten für GPX-Visualisierung und -Analyse |
| **Lizenzsituation** | Gemischt (meist Open Source) |
| **Priorität** | 🟡 Mittel |
| **Roadmap-Phase** | Phase 1+ (Durchgehend) |
| **Zugeordnete Module** | GPX Analyse, UI |
| **Status** | In Umsetzung |
| **Abhängigkeiten** | Keine |
| **Notizen** | Technischer Stack für Kartendarstellung |

---

## Abhängigkeitsmatrix

```
┌─────────────────────────────────────────────────────────────┐
│ Datenquellen-Abhängigkeiten für Alpine Risk Engine          │
└─────────────────────────────────────────────────────────────┘

Alpine Risk Engine (Zielmodul)
├── Geländeanalyse
│   ├── DEM ✓ (Foundation)
│   ├── Meteostat (Steinschlag/Muren)
│   └── Exposition (aus DEM)
│
├── Wetterrisiko
│   ├── GeoSphere ✓ (Primary)
│   └── Meteostat (Historisch)
│
├── Lawinenlage
│   ├── ALBINA ✓ (Euregio)
│   ├── SLF ✓ (Schweiz)
│   ├── Météo-France (Frankreich)
│   ├── AINEVA (Italien)
│   └── ARSO (Slowenien)
│
├── Infrastruktur
│   ├── OSM ✓ (Primary)
│   ├── Tirol Data Hub (Regional)
│   └── Basemap.at (Context)
│
└── Unfallanalyse
    ├── SLF Forschungsdaten ✓
    └── BMI Alpinpolizei (AT)
```

---

## Priorisierungslogik

🔴 **Sehr hoch**: Foundation (DEM, OSM, GeoSphere, ALBINA/SLF)  
🟠 **Hoch**: Unfallanalyse, Erweiterung (Méteo-France, AINEVA, ARSO)  
🟡 **Mittel**: Kontext/Verfeinerung (Basemap, Tirol Hub, Meteostat, Meteomatics)  
🟢 **Niedrig**: Optional/Zukunft (Commercials)

---

## Lizenzsituation Übersicht

| Quelle | Lizenz | Status |
|---|---|---|
| DEM AT | CC BY 4.0 ✅ | Klar |
| OSM | ODbL 1.0 ✅ | Klar |
| GeoSphere | CC BY 4.0 ✅ | Klar |
| Basemap.at | CC BY 4.0 ✅ | Klar |
| ALBINA/SLF | Public API ✅ | Klar |
| Meteostat | CC0 ✅ | Klar |
| Tirol Hub | CC BY 4.0 (meist) ✅ | Klar |
| Leaflet | MIT/gemischt ✅ | Klar |
| **Météo-France** | ⚠️ **Zu klären** | Offen |
| **AINEVA** | ⚠️ **Zu klären** | Offen |
| **ARSO** | ⚠️ **Zu klären** | Offen |
| **BMI** (georeferenziert?) | ⚠️ **Zu klären** | Offen |
| Meteomatics | Kommerziell 💰 | Klar |

---

## 11. TOOLBOX-DATENQUELLEN

Datenquellen speziell für die Mountain Radar Toolbox.

### Browser Geolocation API

| Eigenschaft | Wert |
|---|---|
| **Beschreibung** | Standard-Browser-API für Standorterkennung |
| **Fachlicher Nutzen** | Nutzer-Standort für Entfernungsmessung, Wetterprognose am aktuellen Ort |
| **Geplanter Einsatz** | WEB-T4, MOB-T4, MOB-T5, Standort-basierte Werkzeuge |
| **Lizenzsituation** | Open Standard (W3C Geolocation API) ✅ |
| **Priorität** | 🔴 Sehr hoch |
| **Roadmap-Phase** | Phase 1 (Website Toolbox) |
| **Zugeordnete Module** | Mountain Radar Toolbox (Website) |
| **Status** | ✅ Verfügbar in allen modernen Browsern |
| **Abhängigkeiten** | HTTPS-Verbindung, Nutzer-Erlaubnis |
| **Notizen** | Genauigkeit 10-100m je nach Device/Location |

### Ephemeris-Daten für Sonnenstand & Mondphasen

| Eigenschaft | Wert |
|---|---|
| **URL** | https://github.com/mourner/suncalc (JavaScript Library) |
| **Beschreibung** | Berechnung von Sonnenaufgang, Sonnenuntergang, Mondphasen, Golden Hour für beliebige Koordinaten |
| **Fachlicher Nutzen** | Touren-Planung nach Lichtverhältnissen, Fotografie, Sicherheit |
| **Geplanter Einsatz** | MOB-T6 (Sonnenstand), Zukünftig: Mondphase & Zeiten, Golden Hour |
| **Lizenzsituation** | MIT ✅ (Open Source) |
| **Priorität** | 🟢 Niedrig-Mittel |
| **Roadmap-Phase** | Phase 5 (Mobile App Erweiterte Werkzeuge) |
| **Zugeordnete Module** | Mountain Radar Toolbox (Mobile) |
| **Status** | 🟡 Geplant |
| **Abhängigkeiten** | Keine (nur Koordinaten + Zeit) |
| **Notizen** | SunCalc.js ist leicht und offline-fähig |

### OSM Emergency Tags & Rettungspunkte

| Eigenschaft | Wert |
|---|---|
| **URL** | https://wiki.openstreetmap.org/wiki/Key:emergency |
| **Beschreibung** | OpenStreetMap-Tags für Notfallpunkte, Rettungsstationen, Notrufnummern nach Land |
| **Fachlicher Nutzen** | Notruf-Information, nächste Rettungsstation, Biwak-Finder |
| **Geplanter Einsatz** | Zukünftig: MOB-T5 Rettungspunkt-Finder, Notrufnummern |
| **Lizenzsituation** | ODbL 1.0 ✅ (wie OSM) |
| **Priorität** | 🔴 Sehr hoch |
| **Roadmap-Phase** | Phase 4 (Mobile App Grundlagen) |
| **Zugeordnete Module** | Mountain Radar Toolbox (Mobile), Alpine Risk Engine |
| **Status** | ✅ Bereits in OSM vorhanden |
| **Abhängigkeiten** | OSM Overpass API |
| **Notizen** | Kritisch für Notfall-Szenarien |

### Smartphone Sensor APIs

| Eigenschaft | Wert |
|---|---|
| **Beschreibung** | Smartphone-Sensoren für Mobile App (Magnetometer, Accelerometer, Gyroskop, GPS) |
| **Fachlicher Nutzen** | Kompass, Hangneigungsmesser, Standort-Sensoren |
| **Geplanter Einsatz** | MOB-T1, MOB-T2, MOB-T3, MOB-T5 |
| **Lizenzsituation** | Native APIs (Android, iOS) ✅ |
| **Priorität** | 🔴 Sehr hoch |
| **Roadmap-Phase** | Phase 4 (Mobile App) |
| **Zugeordnete Module** | Mountain Radar Toolbox (Mobile) |
| **Status** | 🟡 Geplant |
| **Abhängigkeiten** | Mobile App Framework (React Native, Flutter o.ä.) |
| **Notizen** | Erfordert OS-Erlaubnis, Batterieintensiv |

---

## Legende

- ✅ Eingegriffene Quellen (bereits teilweise integriert oder in Roadmap)
- ⚠️ Offen (Recherche erforderlich)
- 💰 Kommerziell
- 🔴 🟠 🟡 🟢 = Priorität
- 🇦🇹 🇨🇭 🇮🇹 🇫🇷 🇸🇮 = Geografische Relevanz
