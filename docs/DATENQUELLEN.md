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
| Lawinenlage Euregio (ALBINA) | 🟡 Umgesetzt, Test mit aktuellen Berichten ab Saisonstart | Lawinenlayer |
| Lawinenlage Schweiz (SLF) | 🟡 Umgesetzt, Test mit aktuellen Berichten ab Saisonstart | Lawinenlayer |
| Lawinenlage weitere Länder (FR, IT, SI, ...) | 🔬 Recherche, Empfehlung liegt vor | Risikoanalyse |
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

Alle Lawinenquellen laufen durch dieselbe Pipeline und dasselbe Datenmodell (Schema `mountain-radar/avalanche/1`, Beschreibung in [LAWINENLAGE_ANALYSE.md](LAWINENLAGE_ANALYSE.md), Abschnitt 6).

```text
scripts/avalanche_sources.py      Registry der Quellen (neues Land = ein Eintrag)
scripts/avalanche_model.py        Normalisierung CAAML v6 -> gemeinsames Modell, Geometrie, Symbolposition
scripts/fetch_avalanche.py        Abruf und Schreiben (data/avalanche/)
scripts/test_avalanche_model.py   Tests des Modells
scripts/test_fetch_avalanche.py   Tests des Abrufs (Netzwerk simuliert)
scripts/test_avalanche_logic.html JavaScript-Tests, ausgeführt mit scripts/run_js_tests.py
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