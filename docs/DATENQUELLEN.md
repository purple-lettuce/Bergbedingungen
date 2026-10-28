Projekt:
Mountain Radar

Interner Repositoryname:
Bergbedingungen

# 📚 Datenquellen

> Version: 0.1
>
> Letzte Aktualisierung: Oktober 2026
>
> Dieses Dokument dokumentiert alle aktuell verwendeten und zukünftig geplanten Datenquellen von Bergbedingungen.
>
> Für jede Datenquelle werden Quelle, Lizenz, API, Datenfelder, Update-Strategie und geplanter Einsatzzweck dokumentiert.
>
> Informationen, die noch nicht verifiziert wurden, sind ausdrücklich als Recherchepunkte gekennzeichnet.

---

# Statusübersicht

| Datenquelle | Status | Verwendung |
|------------|------------|------------|
| Digitize The Planet | ✅ Produktiv | Schutzgebiete |
| Closures | ✅ Produktiv | Sperrungen |
| Wetter | ✅ Produktiv | Wetter |
| Lawinenlage Alpenraum | 🔬 Recherche | Risikoanalyse |
| Kuratorium für Alpine Sicherheit | 🔬 Recherche | Unfalllayer |
| Bayerisches Kuratorium für Alpine Sicherheit | 🔬 Recherche | Unfalllayer |
| Digiway Absturzrisiko | 🔬 Recherche | Risikolayer |

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

- Tierarten
- Schutzgüter

### Regeln

- Verhaltensregeln
- Schutzvorschriften

---

## Lokale Dateien

```text
data/protected_areas_alps.geojson
```

```text
data/wildlife.json
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

# 4. Lawinenlage Alpenraum

## Status

🔬 Recherche

---

## Ziel

Darstellung aktueller Lawineninformationen.

---

## Regionen

- Österreich
- Schweiz
- Frankreich
- Italien
- Slowenien

---

## Mögliche Datenquellen

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

- Region
- Gefahrenstufe
- Lagebericht
- Gültigkeitsdatum
- Höhenbereich
- Exposition

---

## Geplante Verwendung

- Lawinenlayer
- Tourenanalyse
- KI-Assistent

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

- [ ] Lawinenlage Österreich
- [ ] Lawinenlage Schweiz
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