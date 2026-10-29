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
| Lawinenlage Euregio (ALBINA) | 🟡 Umgesetzt, Browser-Test ab Saisonstart | Lawinenlayer |
| Lawinenlage übrige Alpenregionen | 🔬 Recherche | Risikoanalyse |
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

- Verknüpfungen Schutzgebiet → Schutzgut (`protected_entity_id`) über `/wildlife` und `/protected-areas/{uuid}/wildlife`
- Namen der Schutzgüter: Quelle noch zu bestätigen, Details und Lösungswege in [WILDLIFE_ANALYSE.md](WILDLIFE_ANALYSE.md)

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

🟡 Umgesetzt. Pipeline und Workflow getestet, Frontend noch nicht im Browser geprüft: Der Lawinenwarndienst hat die Saison 2026/27 noch nicht begonnen, der aktuell veröffentlichte Bericht ist der letzte des Winters 2025/26 (gültig bis 03.05.2026).

Ausführliche Analyse, Entscheidungen zur Höhendarstellung und Datenmodell: [LAWINENLAGE_ANALYSE.md](LAWINENLAGE_ANALYSE.md)

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

---

## Aktualisierungsintervall

Quelle: Regelbericht täglich um 17:00 Ortszeit für den Folgetag (beobachtet), bei Bedarf außerplanmäßige Updates. Außerhalb der Wintersaison keine neuen Berichte.

Projektseitig: GitHub Action `Lawinenlage aktualisieren` (`.github/workflows/update-avalanche.yml`), täglich 06:30 und 16:20 UTC sowie manuell. ✅ Automatisch, ✅ Manuell.

---

## Verwendete Daten

- Region (`regionID`, Name), Mikroregion-Polygone
- Gefahrenstufen (1 bis 5, `no_snow`, `no_rating`) mit Höhengrenze (Meter oder Waldgrenze) und Tageszeit
- Lawinenprobleme mit Höhenbereich, Expositionen, Schneedeckenstabilität, Gefahrenstellen, Lawinengröße
- Gültigkeit und Veröffentlichungszeit, außerplanmäßige Berichte
- Texte: Kernaussage, Zusammenfassung, Lawinensituation, Schneedecke, Tendenz, Wetter, Tourenempfehlung, Gefahrenmuster

Nicht übernommen: Kärnten (`AT-02`) und weitere Regionen der EUREGIO-Datei, Sprachen außer Deutsch.

---

## Lokale Dateien

```text
data/avalanche_regions.geojson
```

```text
data/avalanche_bulletin.json
```

```text
vendor/albina/   (offizielle Piktogramme und Lawinenproblem-Icons, Herkunft in vendor/albina/README.md)
```

## Skripte

```text
scripts/fetch_avalanche.py
```

```text
scripts/test_fetch_avalanche.py
```

---

## Wichtige Erkenntnisse

- Ein Bericht liefert je Gefahrenstufe **eine** Höhengrenze (Zahl oder Waldgrenze ohne Wert). Eine echte Höhenaufteilung der Polygone ist daher nicht möglich, ALBINA färbt selbst nach der höchsten Stufe. Details: [LAWINENLAGE_ANALYSE.md](LAWINENLAGE_ANALYSE.md), Abschnitt 3.
- Die Datei `latest` bleibt außerhalb der Saison auf dem letzten Bericht stehen. Das Frontend stellt abgelaufene Berichte grau und ohne Gefahrenstufe dar.
- Die Polygon-Gültigkeit heißt in den Daten `start_date` / `end_date` (nicht `valid_from` / `valid_until` wie im README von eaws-regions).

## Verwendung im Projekt

- Lawinenlayer „Lawinenlage (Euregio)“
- Popup mit vollständigem Lagebericht
- Tourenanalyse (zukünftig)
- KI-Assistent (zukünftig)

---

# 4b. Lawinenlage übrige Alpenregionen

## Status

🔬 Recherche

## Regionen

- Österreich (übrige Bundesländer)
- Schweiz
- Frankreich
- Italien (außerhalb der Euregio)
- Slowenien

## Hinweis

Die ALBINA-Website zeigt weitere Regionen als `extraRegions` (u. a. `AT-02`, `AT-03` bis `AT-06`, `AT-08`, `DE-BY`, `IT-21`, `IT-23`, `IT-25`, `IT-34`, `IT-36`, `IT-57`, `SI`) und lädt dafür ebenfalls CAAML. Die Quelle und Lizenz dieser Bulletins ist nicht geprüft.

🔬 Recherche erforderlich: Quelle, Lizenz, API, Aktualisierungsintervall je Region.

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
- [ ] Lawinenlage Österreich (übrige Bundesländer)
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