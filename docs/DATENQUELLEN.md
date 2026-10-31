Projekt:
Mountain Radar

Interner Repositoryname:
Bergbedingungen

# 📚 Datenquellen — Mountain Radar / Alpine Risk Intelligence

> Version: 2.0
>
> Letzte Aktualisierung: Oktober 2026
>
> Dieses Dokument dokumentiert alle aktuell verwendeten, in Arbeit befindlichen und zukünftig geplanten Datenquellen von Mountain Radar.
>
> Für jede Datenquelle werden Beschreibung, Fachlicher Nutzen, URL, Lizenz, Priorität, Roadmap-Phase, Abhängigkeiten und lokale Dateien dokumentiert.

---

# Statusübersicht — Alle Datenquellen

| Datenquelle | Status | Verwendung | Priorität |
|------------|------------|------------|------------|
| Austrian DEM / DGM | ✅ In Umsetzung | Geländeanalyse | 🔴 Sehr hoch |
| OpenStreetMap (OSM) | ✅ In Umsetzung | Infrastruktur | 🔴 Sehr hoch |
| Digitize The Planet (DTP) | ✅ Produktiv | Schutzgebiete | 🔴 Sehr hoch |
| Closures | ✅ Produktiv | Sperrungen | 🟡 Mittel |
| GeoSphere Austria | 🟡 Geplant | Wetterrisiko | 🔴 Sehr hoch |
| Meteostat | 🟡 Geplant | Historische Wetterdaten | 🟡 Mittel-Hoch |
| ALBINA Euregio | 🟡 In Umsetzung | Lawinenlage | 🔴 Sehr hoch |
| SLF Schweiz | 🟡 In Umsetzung | Lawinenlage | 🔴 Sehr hoch |
| SLF Forschungsdaten | 🔬 Geplant | Unfall-Hotspots | 🔴 Sehr hoch |
| BMI Alpinpolizei | 🔬 Recherche | Unfallstatistiken | 🟠 Hoch |
| Tirol Data Hub | 🔬 Recherche | Schutzgebiete, Wildlife | 🟡 Mittel |
| Basemap.at | 🟡 Geplant | Kartografie | 🟡 Mittel |
| Leaflet Plugins | ✅ In Umsetzung | Frontend | 🟡 Mittel |
| Météo-France Lawinenlage | 🔬 Recherche | Lawinenlage FR | 🟠 Mittel |
| AINEVA (Italien) | 🔬 Recherche | Lawinenlage IT | 🟠 Mittel |
| ARSO (Slowenien) | 🔬 Recherche | Lawinenlage SI | 🟠 Mittel |
| Meteomatics | 🟢 Optional | Erweiterte Wetterdaten | 🟢 Niedrig |
| Browser Geolocation API | ✅ Verfügbar | Toolbox | 🔴 Sehr hoch |
| Ephemeris-Daten (SunCalc) | 🟡 Geplant | Toolbox | 🟢 Niedrig-Mittel |
| Smartphone Sensor APIs | 🟡 Geplant | Mobile Toolbox | 🔴 Sehr hoch |

---

# Zeitstempel und Datenstatus (seit D5)

Die Datenstatus-Leiste (siehe STYLEGUIDE.md, „Datenstatus-Leiste“) zeigt nur Werte, die in den geladenen Daten oder im Ladezustand der Module stehen. Was die Quellen tatsächlich hergeben:

| Quelle (Datei) | Zeitstempel | Bedeutung | In der Leiste |
|---|---|---|---|
| Sperrungen und Hinweise (`data/closures.json`) | `generated` (UTC, ISO 8601), dazu `count` | Zeitpunkt, zu dem die Datei zuletzt geschrieben wurde. Der Workflow läuft alle 3 Stunden, schreibt aber nur bei geänderten Einträgen oder wenn die Datei älter als 24 Stunden ist (`HEARTBEAT_HOURS` in `scripts/fetch_closures.py`). `generated` ist damit der **Datenstand** (letzte Änderung oder Bestätigung), nicht der Zeitpunkt der letzten Abfrage. Ein Abrufzeitpunkt wird nicht gespeichert. | Anzahl der Einträge und „Stand“; gelb, wenn `generated` älter als 48 Stunden ist (doppelte Heartbeat-Zeit, Hinweis auf stehende Pipeline) |
| Lawinenlage (`data/avalanche/<quelle>.json`) | `bulletins[].publication_time` (vom Lawinenwarndienst), `validity_period`; zusätzlich `generated` | `publication_time` und `validity_period` stammen vom Warndienst und sind belastbar. `generated` ist nur Änderung oder Wochen-Heartbeat (`HEARTBEAT_DAYS` = 7 in `scripts/fetch_avalanche.py`) und sagt nichts über die Aktualität des Berichts. `index.json` hat keinen Zeitstempel. | Veröffentlichung des neuesten gültigen Berichts; ohne gültigen Bericht „Kein aktueller Bericht · zuletzt <Datum>“ (gelb). Die Daten laden erst beim ersten Einblenden der Ebene, vorher steht „wird beim Einblenden geladen“ |
| Schutzgebiete (`data/protected_areas_alps.geojson`) | **keiner** | Die geladene Datei ist eine FeatureCollection ohne Zeitfeld (nur `features`, `wildlife_*`, `rule_texts`). `data/protected_areas.json` hat zwar `generated`, ist aber die Rohdatei der Abfrage, wird von der App nicht geladen und ist nicht der Stand der GeoJSON. Das Commit-Datum ist im Browser nicht verfügbar. | nur die Anzahl der Gebiete; **kein** Datum (nichts simuliert) |
| Wetter (Open-Meteo, Live-Abruf) | `current.time` in der Antwort | Zeitpunkt der aktuellen Werte in Ortszeit des abgefragten Punkts. Die Abfrage ist punktbezogen (Kartenmitte, Klick, Standort) und wird bei jeder neuen Abfrage aktualisiert. | „Stand HH:MM“ aus `current.time`; „nicht abrufbar“ (grau) bei Fehler |

Nicht dargestellt, weil keine belastbare Grundlage existiert:

- „Aktualisiert vor X Min.“: Es gibt nirgends einen gespeicherten Abrufzeitpunkt, nur den Datenstand.
- Ein Datum für die Schutzgebiete. Abhilfe wäre ein `generated`-Feld in `scripts/build_geojson.py` (eigenes Arbeitspaket an der Datenpipeline, nicht Teil von D5).
- Kartenkacheln (OpenStreetMap, OpenTopoMap): kein Status außer der bestehenden Warnung bei Ladefehlern.

---

# 1. WETTER & UNWETTERWARNUNGEN

### GeoSphere Austria (🇦🇹 prioritär)

| Eigenschaft | Wert |
|---|---|
| **URL** | https://data.hub.geosphere.at/ |
| **Beschreibung** | Österreichisches Meteorologisches Warnungssystem |
| **Fachlicher Nutzen** | Gewitterwarnungen, Starkregenwarnungen, Windwarnungen, Hitzewarnungen |
| **Geplanter Einsatz** | Wetterrisiko, Gewitterrisiko, Tourenwarnungen |
| **Lizenzsituation** | Open Data (CC BY 4.0) ✅ |
| **Priorität** | 🔴 Sehr hoch |
| **Roadmap-Phase** | Phase 2 (Wetterintegration) |
| **Zugeordnete Module** | Wetterrisiko, Alpine Risk Engine |
| **Status** | Geplant |
| **Abhängigkeiten** | Keine |
| **Notizen** | Grundlage für Tourenwarnungen und die Risikobewertung |

### Meteostat

| Eigenschaft | Wert |
|---|---|
| **URL** | https://meteostat.net/ |
| **Beschreibung** | Historische Wetterdaten-Plattform |
| **Fachlicher Nutzen** | Historische Wetterdaten, Niederschlagsverlauf, Steinschlag-/Murenerkennung |
| **Geplanter Einsatz** | Indikatoren für Steinschlag/Muren |
| **Lizenzsituation** | Open Data (kostenlos) ✅ |
| **Priorität** | 🟡 Mittel-Hoch |
| **Roadmap-Phase** | Phase 3 (Gefahrenmodellierung) |
| **Zugeordnete Module** | Geländeanalyse, Alpine Risk Engine |
| **Status** | Geplant |
| **Abhängigkeiten** | DEM (für Murensimulation) |
| **Notizen** | Historische Kontextualisierung für Risikokalibrierung |

---

# 2. GELÄNDEMODELLE & TOPOGRAPHIE

### Austrian DEM / DGM (🇦🇹 Basis)

| Eigenschaft | Wert |
|---|---|
| **URL** | https://www.data.gv.at/ |
| **Beschreibung** | Österreichisches Digitales Höhenmodell (10m-Auflösung) |
| **Fachlicher Nutzen** | Hangneigung, Exposition, Steilheit, Geländeanalyse, Absturzrisiko-Berechnung |
| **Geplanter Einsatz** | Risk Engine, GPX Analyse, Gefahrenmodelle |
| **Lizenzsituation** | Open Data (CC BY 4.0) ✅ |
| **Priorität** | 🔴 Sehr hoch |
| **Roadmap-Phase** | Phase 1 (Grundlagen) |
| **Zugeordnete Module** | Geländeanalyse, GPX Analyse, Alpine Risk Engine |
| **Status** | In Umsetzung |
| **Abhängigkeiten** | Keine (unabhängig) |
| **Notizen** | Fundamentales Datenset für alle geometrischen Analysen |

---

# 3. SCHUTZGEBIETE & REGELN

### Digitize The Planet (DTP)

| Eigenschaft | Wert |
|---|---|
| **URL** | https://digitizetheplanet.org/ |
| **API** | https://platform.digitizetheplanet.org/api/v2/ |
| **Beschreibung** | Globale Schutzgebietsdatenbank |
| **Fachlicher Nutzen** | Schutzgebiete (Nationalpark, Naturschutzgebiet, Wildruhezone, Winterruhezone) mit Regeln und Wildlife |
| **Geplanter Einsatz** | Schutzgebietslayer, Popupinformationen, Tourenanalyse |
| **Lizenzsituation** | 🔬 Zu recherchieren |
| **Priorität** | 🔴 Sehr hoch |
| **Roadmap-Phase** | Phase 1 (Grundlagen) |
| **Zugeordnete Module** | Schutzgebiete, Alpine Risk Engine |
| **Status** | ✅ Produktiv |
| **Abhängigkeiten** | Keine |

**Lokale Dateien:**
```
data/protected_areas_alps.geojson
data/wildlife_entities.json
data/wildlife_probe.json
```

**Skripte:**
```
scripts/fetch_wildlife.py
scripts/fetch_protected_area_details_v2.py
scripts/build_geojson.py
scripts/test_build_geojson.py
```

**Aktualisierung:** Manuelle Aktualisierung über GitHub Action ✅

**Details:** Siehe [WILDLIFE_ANALYSE.md](WILDLIFE_ANALYSE.md) für Tiernamen-Auflösung (Verknüpfungen, Namen, Art `FAUNA`/`FLORA`/`HABITAT`)

---

# 4. INFRASTRUKTUR & WEGE

### OpenStreetMap — Overpass API (🌍 umfassend)

| Eigenschaft | Wert |
|---|---|
| **URL** | https://wiki.openstreetmap.org/wiki/Overpass_API |
| **Test-Tool** | https://overpass-turbo.eu/ |
| **Beschreibung** | Globales Vektordatennetz mit Wegen, Hütten, Infrastruktur |
| **Fachlicher Nutzen** | Wegschwierigkeit (sac_scale), Oberflächentyp, alpine Infrastruktur, Hütten, Trinkwasser, Klettersteige |
| **Relevante Tags** | sac_scale, trail_visibility, surface, tourism=alpine_hut, amenity=shelter, natural=spring, amenity=drinking_water, emergency=*, highway=via_ferrata |
| **Geplanter Einsatz** | Wegschwierigkeit, Infrastruktur, Notunterkünfte, Klettersteige, Alpine Risk Engine |
| **Lizenzsituation** | Open Data (ODbL 1.0) ✅ |
| **Priorität** | 🔴 Sehr hoch |
| **Roadmap-Phase** | Phase 1 (Grundlagen) |
| **Zugeordnete Module** | Infrastruktur, GPX Analyse, Alpine Risk Engine |
| **Status** | In Umsetzung |
| **Abhängigkeiten** | Keine (unabhängig) |
| **Notizen** | Deckt 80% der relevanten Infrastruktur ab; Datenqualität variabel nach Region |

### Closures (Sperrungen)

| Eigenschaft | Wert |
|---|---|
| **Beschreibung** | Wege- und Gebietsperrungen |
| **Fachlicher Nutzen** | Sperrungen, Wegsperren, Einschränkungen |
| **Geplanter Einsatz** | Closures Layer, Tourenanalyse |
| **Lizenzsituation** | 🔬 Zu recherchieren |
| **Priorität** | 🟡 Mittel |
| **Status** | ✅ Produktiv |
| **Aktualisierung** | Automatisch ✅ |

### Tirol Data Hub (🇦🇹 regional)

| Eigenschaft | Wert |
|---|---|
| **URL** | https://www.datahub.tirol/leistungen/datenkatalog |
| **Beschreibung** | Open Data Portal des Landes Tirol |
| **Potenziale** | Sperrungen, Forstwege, Infrastruktur, Rettungspunkte, Wildnis-Daten |
| **Geplanter Einsatz** | Infrastruktur-Verfeinerung, Wildlife, Schutzgebiete |
| **Lizenzsituation** | CC BY 4.0 (meist) ✅ |
| **Priorität** | 🟡 Mittel |
| **Roadmap-Phase** | Phase 3 (Gefahrenmodellierung) |
| **Status** | 🔬 Recherche erforderlich |

---

# 5. LAWINENLAGE & SCHNEE

### ALBINA — Euregio Lawinenlage (🇦🇹🇮🇹 operativ)

| Eigenschaft | Wert |
|---|---|
| **URL** | https://lawis.at/lawis_api/public/swagger/ |
| **Bulletin** | https://static.avalanche.report/bulletins/latest/EUREGIO_de_CAAMLv6.json |
| **Beschreibung** | Gemeinsames Lawinenwarnungssystem Euregio (Österreich, Südtirol, Liechtenstein) |
| **Fachlicher Nutzen** | Operative Lawinenwarnungen nach Höhenstufe und Exposition |
| **Geplanter Einsatz** | Lawinenlage-Layer, Tourenwarnungen, Alpine Risk Engine |
| **Lizenzsituation** | CC BY 4.0 ✅ |
| **Priorität** | 🔴 Sehr hoch |
| **Roadmap-Phase** | Phase 2 (Wetterintegration) |
| **Zugeordnete Module** | Lawinenlage, Alpine Risk Engine |
| **Status** | 🟡 In Umsetzung (Test ab Wintersaison 2026/27) |
| **Abhängigkeiten** | OSM (Kontext), DEM (Exposition) |
| **Notizen** | Saisonale Verfügbarkeit (Winter); CC BY 4.0 Lizenz beachten |

**Lokale Dateien:**
```
data/avalanche/euregio.json
data/avalanche/euregio_regions.geojson
```

**Details:** Siehe [LAWINENLAGE_ANALYSE.md](LAWINENLAGE_ANALYSE.md)

### SLF Schweiz — CAAML Bulletin (🇨🇭 operativ)

| Eigenschaft | Wert |
|---|---|
| **URL** | https://aws.slf.ch/api/bulletin/caaml/v4/de/json |
| **Beschreibung** | Schweizer Lawinenwarnungssystem des SLF |
| **Fachlicher Nutzen** | Schweizer Lawinenlage mit Teilstufen (-, =, +) |
| **Geplanter Einsatz** | Lawinenlage-Layer, Tourenwarnungen, Alpine Risk Engine |
| **Lizenzsituation** | CC BY 4.0 ✅ |
| **Priorität** | 🔴 Sehr hoch |
| **Roadmap-Phase** | Phase 2 (Wetterintegration) |
| **Zugeordnete Module** | Lawinenlage, Alpine Risk Engine |
| **Status** | 🟡 In Umsetzung (Test mit archivierten Berichten) |
| **Abhängigkeiten** | OSM, DEM |
| **Notizen** | Komplementär zu ALBINA; erweitert Coverage auf Schweiz; CC BY 4.0 Lizenz |

**Lokale Dateien:**
```
data/avalanche/slf.json
data/avalanche/slf_regions.geojson
```

**Details:** Siehe [LAWINENLAGE_ANALYSE.md](LAWINENLAGE_ANALYSE.md)

**Gemeinsame Pipeline:** Alle Lawinenquellen durchlaufen dasselbe Datenmodell, siehe Abschnitt „Gemeinsame Lawinen-Pipeline“ und [AVALANCHE_ARCHITECTURE.md](AVALANCHE_ARCHITECTURE.md):
```
scripts/avalanche_providers.py     (Provider je Quelle)
scripts/avalanche_sources.py       (Registry der Provider)
scripts/avalanche_model.py         (Normalisierung)
scripts/avalanche_schema.py        (Standardmodell, GeoJSON-Schema)
scripts/fetch_avalanche.py         (zentrale Pipeline)
scripts/test_avalanche_model.py    (Tests)
data/avalanche/index.json          (Verzeichnis für Frontend)
```

---

# 5b. LAWINENLAGE — FOLGEQUELLEN

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
| **Status** | 🔬 Nicht gestartet |
| **Abhängigkeiten** | ALBINA/SLF-Integration (precedent) |
| **Notizen** | Regionale Erweiterung; Lizenz und Nutzungsbedingungen zu klären |

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
| **Status** | 🔬 Nicht gestartet |
| **Abhängigkeiten** | ALBINA/SLF-Integration |

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
| **Status** | 🔬 Nicht gestartet |

### SLF Forschungsdaten — Lawinenunfälle (🇨🇭 historisch)

| Eigenschaft | Wert |
|---|---|
| **URL** | https://www.slf.ch/ |
| **Beschreibung** | Historische Datenbank von Lawinenunfällen und Ereignissen |
| **Fachlicher Nutzen** | Unfall-Hotspots, historische Analyse, Häufungen nach Exposition/Höhe |
| **Geplanter Einsatz** | Unfallanalyse, Lawinengefahr-Hotspots, Alpine Risk Engine |
| **Lizenzsituation** | 🔬 Zu klären |
| **Priorität** | 🔴 Sehr hoch |
| **Roadmap-Phase** | Phase 3 (Gefahrenmodellierung) |
| **Zugeordnete Module** | Unfallanalyse, Alpine Risk Engine |
| **Status** | 🔬 Geplant |
| **Abhängigkeiten** | DEM, OSM (Kontext) |
| **Notizen** | Enables evidence-based risk calibration |

---

# 6. UNFÄLLE & EREIGNISSE

### BMI Alpinpolizei — Alpinstatistik (🇦🇹 jährlich)

| Eigenschaft | Wert |
|---|---|
| **URL** | https://www.bmi.gv.at/202/alpinpolizei/ |
| **Beschreibung** | Jährliche Statistik von Alpin- und Bergunfällen in Österreich |
| **Fachlicher Nutzen** | Alpine Unfallstatistiken, Unfalltypen (Sturz, Absturz, Erfrierung, etc.) |
| **Geplanter Einsatz** | Unfallanalyse, Risikokalibrierung, Warnsysteme |
| **Lizenzsituation** | Open Data ✅ |
| **Priorität** | 🟠 Hoch |
| **Roadmap-Phase** | Phase 3 (Gefahrenmodellierung) |
| **Zugeordnete Module** | Unfallanalyse, Alpine Risk Engine |
| **Status** | 🔬 Recherche |
| **Abhängigkeiten** | Georeferenzierung notwendig |
| **Offen** | Gibt es georeferenzierte Unfalldaten? (nur PDF-Reports verfügbar?) |
| **Notizen** | Statistiken werden ca. März des Folgejahrs veröffentlicht |

### Kuratorium für Alpine Sicherheit (Österreich)

| Eigenschaft | Wert |
|---|---|
| **URL** | https://alpinesicherheit.at/ |
| **Beschreibung** | Österreichische Unfalldatenbank |
| **Geplanter Einsatz** | Unfalllayer, Unfall-Heatmap |
| **Lizenzsituation** | 🔬 Zu recherchieren |
| **Priorität** | 🟠 Hoch |
| **Status** | 🔬 Recherche |
| **Abhängigkeiten** | API oder Datenexport erforderlich |

---

# 7. KARTOGRAPHISCHE GRUNDLAGEN

### Basemap.at (🇦🇹 Kartografik)

| Eigenschaft | Wert |
|---|---|
| **URL** | https://basemap.at/#anwendungen |
| **Beschreibung** | Österreichische Grundkarten und Hintergrundlayer |
| **Fachlicher Nutzen** | Hintergrundkarten, Orthofotos, Schummerung, Terrain-Kontext |
| **Geplanter Einsatz** | Kartendarstellung, UI/UX-Kontext |
| **Lizenzsituation** | Open Data (CC BY 4.0) ✅ |
| **Priorität** | 🟡 Mittel |
| **Roadmap-Phase** | Phase 1 (Grundlagen) |
| **Zugeordnete Module** | GPX Analyse (UI) |
| **Status** | Geplant |
| **Notizen** | Ergänzt OSM-Daten mit amtlichen Kartographien |

### Leaflet Plugins

| Eigenschaft | Wert |
|---|---|
| **URL** | https://leafletjs.com/plugins.html |
| **Beschreibung** | Umfangreiche Plugin-Bibliothek für Kartenvisualisierung |
| **Fachlicher Nutzen** | Kartenfunktionen, GPX-Import, Analysewerkzeuge, Layer-Management |
| **Geplanter Einsatz** | Frontend-Komponenten für GPX-Visualisierung und -Analyse |
| **Lizenzsituation** | Gemischt (meist Open Source) ✅ |
| **Priorität** | 🟡 Mittel |
| **Status** | In Umsetzung |
| **Abhängigkeiten** | Keine |

---

# 8. WETTER — ERWEITERTE QUELLEN

### Meteomatics Weather API

| Eigenschaft | Wert |
|---|---|
| **URL** | https://www.meteomatics.com/en/weather-api/ |
| **Beschreibung** | Kommerzielle erweiterte Wetterdaten und Prognosen |
| **Fachlicher Nutzen** | Hochauflösende Wetter-Prognosen, Windmodelle, Temperaturgradienten |
| **Geplanter Einsatz** | Alternative/Ergänzung zu GeoSphere, Mikroklima-Modellierung |
| **Lizenzsituation** | Kommerziell 💰 |
| **Priorität** | 🟢 Niedrig-Mittel |
| **Roadmap-Phase** | Phase 3+ (Optional) |
| **Status** | Alternative Quelle |
| **Abhängigkeiten** | GeoSphere (Primär) |
| **Notizen** | Fallback/Ergänzung; höhere Granularität, aber kommerziell |

---

# 9. TOOLBOX-DATENQUELLEN

Datenquellen speziell für die Mountain Radar Toolbox (Website + Mobile App).

### Browser Geolocation API

| Eigenschaft | Wert |
|---|---|
| **Beschreibung** | Standard-Browser-API für Standorterkennung |
| **Fachlicher Nutzen** | Nutzer-Standort für Entfernungsmessung |
| **Geplanter Einsatz** | WEB-T4, MOB-T4, MOB-T5 — Standort-basierte Werkzeuge |
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
| **URL** | https://github.com/mourner/suncalc |
| **Beschreibung** | Berechnung von Sonnenaufgang, Sonnenuntergang, Mondphasen |
| **Fachlicher Nutzen** | Touren-Planung nach Lichtverhältnissen, Fotografie |
| **Geplanter Einsatz** | MOB-T6 (Sonnenstand), Mondphase, Golden Hour |
| **Lizenzsituation** | MIT ✅ (Open Source) |
| **Priorität** | 🟢 Niedrig-Mittel |
| **Roadmap-Phase** | Phase 5 (Mobile App Erweiterte Werkzeuge) |
| **Status** | 🟡 Geplant |
| **Abhängigkeiten** | Keine (nur Koordinaten + Zeit) |
| **Notizen** | SunCalc.js ist leicht und offline-fähig |

### OSM Emergency Tags & Rettungspunkte

| Eigenschaft | Wert |
|---|---|
| **URL** | https://wiki.openstreetmap.org/wiki/Key:emergency |
| **Beschreibung** | OpenStreetMap-Tags für Notfallpunkte und Rettungsstationen |
| **Fachlicher Nutzen** | Notruf-Information, nächste Rettungsstation, Biwak-Finder |
| **Geplanter Einsatz** | MOB-T5 Rettungspunkt-Finder, Notrufnummern |
| **Lizenzsituation** | ODbL 1.0 ✅ (wie OSM) |
| **Priorität** | 🔴 Sehr hoch |
| **Roadmap-Phase** | Phase 4 (Mobile App) |
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
| **Status** | 🟡 Geplant |
| **Abhängigkeiten** | Mobile App Framework (React Native, Flutter o.ä.) |
| **Notizen** | Erfordert OS-Erlaubnis, Batterieintensiv |

---

# Abhängigkeitsmatrix

```
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

# Lizenzsituation Übersicht

| Quelle | Lizenz | Status |
|---|---|---|
| DEM AT | CC BY 4.0 ✅ | Klar |
| OSM | ODbL 1.0 ✅ | Klar |
| GeoSphere | CC BY 4.0 ✅ | Klar |
| Basemap.at | CC BY 4.0 ✅ | Klar |
| ALBINA/SLF | CC BY 4.0 ✅ | Klar |
| Meteostat | CC0 ✅ | Klar |
| Tirol Hub | CC BY 4.0 (meist) ✅ | Klar |
| Leaflet | MIT/gemischt ✅ | Klar |
| Browser APIs | Open Standards ✅ | Klar |
| Ephemeris-Daten | MIT ✅ | Klar |
| **Digitize The Planet** | ⚠️ **Zu recherchieren** | Offen |
| **Closures** | ⚠️ **Zu recherchieren** | Offen |
| **Météo-France** | ⚠️ **Zu recherchieren** | Offen |
| **AINEVA** | ⚠️ **Zu recherchieren** | Offen |
| **ARSO** | ⚠️ **Zu recherchieren** | Offen |
| **BMI** | ⚠️ **Zu recherchieren** | Offen |
| Meteomatics | Kommerziell 💰 | Klar |

---

# Priorisierungslogik

🔴 **Sehr hoch**: Foundation (DEM, OSM, GeoSphere, ALBINA/SLF, Browser APIs)  
🟠 **Hoch**: Unfallanalyse, Erweiterung (Météo-France, AINEVA, ARSO)  
🟡 **Mittel**: Kontext/Verfeinerung (Basemap, Tirol Hub, Meteostat, Leaflet)  
🟢 **Niedrig**: Optional/Zukunft (Meteomatics, Ephemeris für Toolbox)

---

# Offene Rechercheaufgaben

## Sehr hohe Priorität
- [x] ALBINA Euregio
- [x] SLF Schweiz
- [ ] Digitize The Planet Lizenz
- [ ] Closures Details
- [ ] GeoSphere Integration

## Hohe Priorität
- [ ] SLF Forschungsdaten Lizenz
- [ ] BMI Daten Georeferenzierung
- [ ] Méteo-France Lizenz & API
- [ ] AINEVA Lizenz & API
- [ ] ARSO Lizenz & API

## Mittlere Priorität
- [ ] Tirol Data Hub Details
- [ ] Zusätzliche DEM für andere Länder
- [ ] Kuratorium für Alpine Sicherheit

---

# Versionshistorie

| Version | Datum | Änderung |
|---------|-------|----------|
| 2.1 | 2026-10-31 | Abschnitt „Zeitstempel und Datenstatus“ (D5) |
| 2.0 | 2026-10-29 | Konsolidation: Neue strukturierte Datenquellen mit allen Details + alte Workflow-Informationen |
| 1.0 | 2026-10 | Initial Bergbedingungen Datenquellen |



---

# 1. Digitize The Planet (DTP)

## Status

✅ Produktiv

---

## Quelle

Website:

https://digitizetheplanet.org/

Plattform:

https://platform.digitizetheplanet.org/

API:

https://platform.digitizetheplanet.org/api/v2/

---

## Lizenz

🔬 Lizenzbedingungen dokumentieren

Zu prüfen:

- Nutzungsbedingungen
- Veröffentlichungsrechte
- Kartenintegration
- Attribution

---

## Aktualisierungsintervall

Quelle:

Unbekannt

Projektseitig:

Manuelle Aktualisierung über GitHub Action.

---

## Aktualisierung

### Workflow

```text
GitHub Actions
↓
Schutzgebiete aktualisieren
↓
Run workflow
```

### Status

✅ Funktioniert

### Automatisch

❌ Nein

### Manuell

✅ Ja

---

## Verwendete Daten

### Schutzgebiete

- UUID
- Name
- Kategorie
- Beschreibung

### Kategorien

- Nationalpark
- Naturschutzgebiet
- Wildruhezone
- Winterruhezone
- weitere Kategorien

### Wildlife

- Verknüpfungen Schutzgebiet → Schutzgut (`protected_entity_id`) über `GET /wildlife` (`id` = Verknüpfung, `protected_area_uuid`, `protected_entity_id`). Die `id` eines Wildlife-Eintrags in den Gebietsdetails ist die Verknüpfungs-ID.
- Namen und Art der Schutzgüter (`type`: `FAUNA`, `FLORA`, `HABITAT`) über `GET /protected-entities` (8079 Einträge, alle 564 benötigten aufgelöst)
- Details, Prüfung der Zuordnung an echten Daten und Grenzen: [WILDLIFE_ANALYSE.md](WILDLIFE_ANALYSE.md), Abschnitt 7

### Regeln

- Verhaltensregeln
- Schutzvorschriften

---

## Lokale Dateien

```text
data/protected_areas_alps.geojson
```

```text
data/wildlife_entities.json
```

```text
data/wildlife_probe.json
```

---

## Skripte

```text
scripts/fetch_wildlife.py
```

```text
scripts/fetch_protected_area_details_v2.py
```

```text
scripts/build_geojson.py
```

```text
scripts/test_build_geojson.py
```

---

## Verwendung im Projekt

- Schutzgebietslayer
- Popupinformationen
- Wildlife
- Regeln
- Tourenanalyse (zukünftig)

---

# 2. Closures

## Status

✅ Produktiv

---

## Quelle

🔬 Dokumentation ergänzen

---

## Lizenz

🔬 Recherche erforderlich

---

## API

🔬 Dokumentation ergänzen

---

## Aktualisierungsintervall

✅ Automatisch

---

## Verwendete Daten

- Sperrungen
- Wegsperren
- Einschränkungen

---

## Verwendung im Projekt

- Closures Layer
- Popupinformationen
- Tourenanalyse (zukünftig)

---

# 3. Wetter

## Status

✅ Produktiv

---

## Quelle

🔬 Dokumentation ergänzen

---

## Lizenz

🔬 Recherche erforderlich

---

## API

🔬 Dokumentation ergänzen

---

## Aktualisierungsintervall

✅ Automatisch

---

## Verwendete Daten

- Temperatur
- Niederschlag
- Wind
- Wetterlage

---

## Verwendung im Projekt

- Wetterlayer
- Tourenanalyse
- KI-Auswertung

---

# 4. Lawinenlage Euregio Tirol, Südtirol, Trentino (ALBINA)

## Status

🟡 Umgesetzt. Pipeline, Workflow und Frontend sind getestet (Frontend mit archivierten Berichten vom 15.03.2026 in einem Headless-Browser). Der Test mit aktuellen Berichten steht aus, weil der Lawinenwarndienst die Saison 2026/27 noch nicht begonnen hat: Der aktuell veröffentlichte Bericht ist der letzte des Winters 2025/26 (gültig bis 03.05.2026).

Analyse, Datenmodell, Unterschiede zur Schweiz: [LAWINENLAGE_ANALYSE.md](LAWINENLAGE_ANALYSE.md)

---

## Quellen

| Quelle | URL | Lizenz |
|---|---|---|
| Bulletin (CAAML v6, deutsch) | https://static.avalanche.report/bulletins/latest/EUREGIO_de_CAAMLv6.json | CC BY 4.0 |
| Bulletin-Archiv | `https://static.avalanche.report/bulletins/{Datum}/{Datum}_EUREGIO_de_CAAMLv6.json` | CC BY 4.0 |
| Mikroregion-Polygone | https://gitlab.com/eaws/eaws-regions (`public/micro-regions/{AT-07,IT-32-BZ,IT-32-TN}_micro-regions.geojson.json`) | CC0 1.0 |
| Symbole, Bezeichnungen, Farben | https://gitlab.com/albina-euregio/albina-website (`public/images/pro/`, `app/i18n/caaml/de.json`) | AGPL-3.0, Grafiklizenz offen |
| Open-Data-Übersicht | https://lawinen.report/more/open-data | |

Namensnennung: „Lawinenwarndienste Tirol, Südtirol und Trentino (Euregio, avalanche.report)“, CC BY 4.0. Sie steht in Legende, Popup, Kartenquellenangabe und Seitenfuß.

## Aktualisierungsintervall

Quelle: Regelbericht täglich um 17:00 Ortszeit für den Folgetag (beobachtet), bei Bedarf außerplanmäßige Updates. Außerhalb der Wintersaison keine neuen Berichte, `latest` bleibt auf dem letzten Bericht stehen.

Projektseitig: GitHub Action `Lawinenlage aktualisieren` (`.github/workflows/update-avalanche.yml`) für alle Lawinenquellen gemeinsam, täglich 07:20 und 16:20 UTC sowie manuell. ✅ Automatisch, ✅ Manuell.

## Verwendete Daten

- Region (`regionID`, Name), Mikroregion-Polygone
- Gefahrenstufen (1 bis 5, `no_snow`, `no_rating`) mit Höhengrenze (Meter oder Waldgrenze) und Tageszeit
- Lawinenprobleme mit Höhenbereich, Expositionen, Schneedeckenstabilität, Gefahrenstellen, Lawinengröße
- Gültigkeit und Veröffentlichungszeit, außerplanmäßige Berichte
- Texte: Kernaussage, Zusammenfassung, Lawinensituation, Schneedecke, Tendenz, Wetter, Tourenempfehlung, Gefahrenmuster

Nicht übernommen: Kärnten (`AT-02`) und weitere Regionen der EUREGIO-Datei, Sprachen außer Deutsch.

## Lokale Dateien

```text
data/avalanche/euregio.json
data/avalanche/euregio_regions.geojson
```

## Wichtige Erkenntnisse

- Ein Bericht liefert je Gefahrenstufe **eine** Höhengrenze (Zahl oder Waldgrenze ohne Wert). Eine echte Höhenaufteilung der Polygone ist nicht möglich, ALBINA färbt selbst nach der höchsten Stufe.
- Die Polygon-Gültigkeit heißt in den Daten `start_date` / `end_date` (nicht `valid_from` / `valid_until` wie im README von eaws-regions).

---

# 4a. Lawinenlage Schweiz (SLF)

## Status

🟡 Umgesetzt wie Euregio. Der SLF-Dienst liefert derzeit keinen aktiven Bericht (`{"bulletins":[]}`, Saisonpause); mit archivierten Berichten (`activeAt`) getestet.

## Quelle

WSL-Institut für Schnee- und Lawinenforschung SLF, https://www.slf.ch, Datenservice: https://www.slf.ch/en/services-and-products/slf-data-service/ (Kontakt data@slf.ch).

## API-Endpunkte

| Zweck | URL |
|---|---|
| Bulletin CAAML v6, V4 (verwendet) | `https://aws.slf.ch/api/bulletin/caaml/v4/{lang}/json` |
| Bulletin V3 (Standardversion) | `https://aws.slf.ch/api/bulletin/caaml/{lang}/json` |
| Bulletin als GeoJSON | `https://aws.slf.ch/api/bulletin/caaml/{lang}/geojson`, `.../caaml/v4/{lang}/geojson` |
| frühere Bulletins | Parameter `?activeAt=<ISO-Zeitpunkt>` |
| Liste veröffentlichter Bulletins | `https://aws.slf.ch/api/bulletin-list/caaml/{lang}/json` |
| Warnregionen (Namen, verwendet) | `https://aws.slf.ch/api/warningregion/warnregionDefinition/current` |
| Warnregionen GeoJSON / KML | `https://aws.slf.ch/api/warningregion/warnregionDefinition/current/geojson`, `.../current/kml` |
| Polygone (verwendet, identisch zur SLF-Geometrie) | https://gitlab.com/eaws/eaws-regions, `public/micro-regions/CH_micro-regions.geojson.json` (CC0 1.0) |
| API-Dokumentation | https://aws.slf.ch/api/bulletin/caaml (OpenAPI), https://aws.slf.ch/api/warningregion/ (Swagger UI) |

Sprachen `de`, `fr`, `it`, `en`, verwendet wird `de`. Keine Anmeldung.

## Lizenz und Pflichten

CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/). Verlangt: ein deutlich sichtbarer Verweis auf die Datenquelle (WSL-Institut für Schnee- und Lawinenforschung SLF), bei digitalen Produkten als Link auf www.slf.ch. Weitere Bedingungen: Das Bulletin ist eine sicherheitsrelevante Warnung des Bundes, die Inhalte sind korrekt und aktuell zu halten. Keine Haftung des SLF, kein Bereitschaftsdienst. **Die Schnittstellen sind nicht dafür ausgelegt, Anfragen aus Informationssystemen der Kunden direkt zu bedienen.** Deshalb holt nur die GitHub Action die Daten, der Browser fragt das SLF nie ab. Namensnennung in Legende, Popup, Kartenquellenangabe und Seitenfuß.

Offen: eine Nachricht an data@slf.ch, um in die Mailingliste „Avalanche Bulletin“ (Hinweise zu Änderungen und Unterbrüchen) aufgenommen zu werden.

## Aktualisierungsintervall

Quelle: Regel-Ausgabe täglich 17 Uhr, gültig bis 17 Uhr des Folgetags. Update um 8 Uhr vor allem im Winter, im Sommer und Herbst nur bei starkem Schneefall. Beobachtet: Veröffentlichung 07:00Z, 16:00Z (Winter), 15:00Z (Sommerzeit).

Projektseitig: dieselbe GitHub Action wie Euregio (07:20 und 16:20 UTC). ✅ Automatisch, ✅ Manuell.

## Verwendete Daten

- Region (`CH-<sector_id>`, Name), Polygone
- Gefahrenstufe je Region und Tageszeit mit Teilstufe (`-`, `=`, `+`), **ohne Höhengrenze**
- Lawinenprobleme mit Höhe, Expositionen, eigener Gefahrenstufe, Beschreibung und Kernzonen-Text, Gruppierung nach trockenen und nassen Lawinen
- Gültigkeit, Veröffentlichung, nächste Aktualisierung
- Texte (HTML): Schneedecke, Wetter-Prognose, Wetter-Rückblick, Tendenz

Nicht vorhanden: Zusammenfassung, Lawinengröße, Stabilität, Häufigkeit, Tourenempfehlung.

## Lokale Dateien

```text
data/avalanche/slf.json
data/avalanche/slf_regions.geojson
```

## Unterschiede zu Euregio

Siehe [LAWINENLAGE_ANALYSE.md](LAWINENLAGE_ANALYSE.md), Abschnitt 3.

---

# Gemeinsame Lawinen-Pipeline

Alle Lawinenquellen laufen durch dieselbe Pipeline und dasselbe Datenmodell (Schema `mountain-radar/avalanche/2`). Architektur, Provider-Konzept, Datenmodell, GeoJSON-Schema und die Anleitung für neue Länder: [AVALANCHE_ARCHITECTURE.md](AVALANCHE_ARCHITECTURE.md). Befunde zu den Daten: [LAWINENLAGE_ANALYSE.md](LAWINENLAGE_ANALYSE.md).

```text
scripts/avalanche_providers.py    Provider je Quelle (AvalancheProvider, CaamlV6Provider, AlbinaProvider, SLFProvider)
scripts/avalanche_sources.py      Registry der Provider (neues Land = eine Klasse + eine Zeile)
scripts/avalanche_model.py        Normalisierung CAAML v6 -> gemeinsames Modell, Geometrie, Symbolposition
scripts/avalanche_schema.py       Standardmodell je Region, GeoJSON-Schema, Prüfung
scripts/fetch_avalanche.py        zentrale Pipeline: Abruf über die Provider, Prüfung, Schreiben (data/avalanche/)
scripts/test_avalanche_model.py   Tests des Modells
scripts/test_fetch_avalanche.py   Tests der Pipeline (Netzwerk simuliert)
scripts/test_avalanche_framework.py  Tests von Standardmodell, GeoJSON-Schema und Provider-Vertrag
scripts/test_avalanche_logic.html, scripts/test_avalanche_frontend.html  JavaScript-Tests, ausgeführt mit scripts/run_js_tests.py
data/avalanche/index.json         Verzeichnis der Quellen für das Frontend
```

---
# 4b. Lawinenlage weitere Länder

## Status

🔬 Recherche

## Regionen

- Österreich (übrige Bundesländer)
- Frankreich
- Italien (außerhalb der Euregio)
- Slowenien

## Hinweis

Die ALBINA-Website zeigt weitere Regionen als `extraRegions` (u. a. `AT-02`, `AT-03` bis `AT-06`, `AT-08`, `DE-BY`, `IT-21`, `IT-23`, `IT-25`, `IT-34`, `IT-36`, `IT-57`, `SI`) und lädt dafür ebenfalls CAAML. Die Quelle und Lizenz dieser Bulletins ist nicht geprüft.

Erste Recherche und Empfehlung für Frankreich, Italien und Slowenien: [LAWINENLAGE_ANALYSE.md](LAWINENLAGE_ANALYSE.md), Abschnitt 9. Belegt: ALBINA veröffentlicht täglich eine `ratings.json` mit der höchsten Gefahrenstufe je EAWS-Region (`https://static.avalanche.report/eaws_bulletins/{Datum}/{Datum}.ratings.json`), und pyAvaCore (GPL-3.0) parst die Dienste von Météo-France, AINEVA und ARSO. 🔬 Offen: Lizenz und Nutzungsbedingungen der ursprünglichen Warndienste, Bedeutung der Schlüssel `high`/`low`.

---
# 5. Kuratorium für Alpine Sicherheit (Österreich)

## Status

🔬 Recherche

---

## Quelle

https://alpinesicherheit.at/

---

## Lizenz

🔬 Recherche erforderlich

---

## API

🔬 Recherche erforderlich

---

## Aktualisierungsintervall

🔬 Recherche erforderlich

---

## Geplante Datenfelder

- Unfallort
- Unfalltyp
- Datum
- Beschreibung
- Schweregrad

---

## Geplante Verwendung

- Unfalllayer
- Unfall-Heatmap
- Tourenanalyse

---

# 6. Bayerisches Kuratorium für Alpine Sicherheit

## Status

🔬 Recherche

---

## Quelle

🔬 Recherche erforderlich

---

## Lizenz

🔬 Recherche erforderlich

---

## API

🔬 Recherche erforderlich

---

## Aktualisierungsintervall

🔬 Recherche erforderlich

---

## Geplante Datenfelder

- Unfallort
- Unfalltyp
- Datum
- Beschreibung

---

## Geplante Verwendung

- Unfalllayer
- Unfall-Heatmap
- Tourenanalyse

---

# 7. Unfall-Heatmap

## Status

📝 Konzept

---

## Datenbasis

Geplant:

- Österreichische Unfalldaten
- Bayerische Unfalldaten

---

## Geplante Layer

- Gesamtunfälle
- Lawinenunfälle
- Absturzunfälle
- Rettungseinsätze

---

## Verwendung

- Risikobewertung
- Tourenanalyse
- KI-Auswertung

---

# 8. Digiway Absturzrisiko

## Status

🔬 Recherche

---

## Quelle

Projekt Digiway

---

## Lizenz

🔬 Recherche erforderlich

---

## API

🔬 Recherche erforderlich

---

## Aktualisierungsintervall

🔬 Recherche erforderlich

---

## Geplante Datenfelder

- Risikoklasse
- Wegsegment
- Geometrie
- Bewertung

---

## Geplante Geometrie

Vermutlich:

- Liniengeometrien
- Wegsegmente

🔬 Verifizieren

---

## Verwendung

- Risikolayer
- GPX Analyse
- Routing
- Tourenbewertung

---

# Offene Rechercheaufgaben

## Hohe Priorität

- [x] Lawinenlage Euregio Tirol, Südtirol, Trentino (siehe 4.)
- [x] Lawinenlage Schweiz (siehe 4a.)
- [ ] Lawinenlage Österreich (übrige Bundesländer)
- [ ] Lawinenlage Frankreich
- [ ] Lawinenlage Italien
- [ ] Lawinenlage Slowenien

---

## Mittlere Priorität

- [ ] Kuratorium für Alpine Sicherheit
- [ ] Bayerisches Kuratorium für Alpine Sicherheit

---

## Danach

- [ ] Digiway Absturzrisiko

---

# Zielarchitektur

```text
Wetter
+
Sperrungen
+
Schutzgebiete
+
Wildlife
+
Regeln
+
Lawinenlage
+
Unfallereignisse
+
Absturzrisiko
↓
Tourenanalyse
↓
KI-Assistent
```