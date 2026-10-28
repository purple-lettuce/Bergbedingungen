# 🏔️ Bergbedingungen Roadmap

> Version: 1.0
>
> Letzte Aktualisierung: Oktober 2026
>
> Dieses Dokument beschreibt die langfristige Vision, die strategische Ausrichtung und die Priorisierung der Entwicklung von Bergbedingungen.
>
> Technische Details, Datenquellen, APIs und Implementierungsinformationen werden in separaten Dokumenten dokumentiert.

---

# Vision

Bergbedingungen entwickelt sich von einer Kartenanwendung zu einem digitalen Tourenassistenten für den Alpenraum.

Ziel ist es, sämtliche für Bergsportler relevanten Informationen an einem Ort zusammenzuführen und diese später intelligent auszuwerten.

Ein Nutzer soll künftig nicht mehr zahlreiche Webseiten einzeln besuchen müssen, um sich über Wetter, Schutzgebiete, Lawinenlage, Sperrungen oder Risiken zu informieren.

Stattdessen soll Bergbedingungen die Frage beantworten:

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
| 1 | Legende für Schutzgebiete | Offen |
| 2 | Filter nach Schutzgebietstyp | Offen |
| 3 | Lawinenlage | Recherche |
| 4 | Unfalllayer | Recherche |
| 5 | Unfall-Heatmap | Konzept |
| 6 | Digiway Absturzrisiko | Konzept |
| 7 | GPX Upload | Geplant |
| 8 | Tourenanalyse | Geplant |
| 9 | Routing | Geplant |
| 10 | Design & UX | Geplant |
| 11 | KI-Assistent | Zukunft |
| 12 | PWA & Offline | Zukunft |

---

# Entwicklungsphasen

---

# Phase 1 — Schutzgebiete

## Ziel

Schutzgebiete verständlich, visuell ansprechend und praxisnah darstellen.

---

## Status

🟡 In Arbeit

Fortschritt: ca. 90 %

---

## Bereits umgesetzt

- [x] Schutzgebiete als Layer
- [x] Schutzgebietskategorien
- [x] Farben nach Schutzgebietstyp
- [x] Schutzgebietspopup
- [x] Beschreibung im Popup
- [x] Kategorie im Popup
- [x] Wildlife im Popup
- [x] Regeln im Popup
- [x] Wildlife-Datenpipeline
- [x] GitHub Workflow zur Aktualisierung
- [x] Automatische GeoJSON-Erzeugung

---

## Noch offen

- [ ] Legende nach Schutzgebietstyp
- [ ] Filter nach Schutzgebietskategorie
- [ ] Darstellung der Regeln verbessern
- [ ] Darstellung der Wildlife-Einträge verbessern
- [ ] Icons für Regeln
- [ ] Icons für Wildlife

---

## Meilenstein

Phase 1 gilt als abgeschlossen, wenn:

- Legende vorhanden ist
- Filter vorhanden ist
- Schutzgebietsinformationen vollständig dargestellt werden

---

# Phase 2 — Alpine Risiken

## Ziel

Zusätzliche Risikoinformationen für den Alpenraum sichtbar machen.

---

## Status

🔵 Recherchephase

Fortschritt: 0 %

---

# 2.1 Lawinenlage

## Ziel

Aktuelle Lawinenlage direkt auf der Karte visualisieren.

### Regionen

- [ ] Österreich
- [ ] Schweiz
- [ ] Frankreich
- [ ] Italien
- [ ] Slowenien

### Geplante Funktionen

- [ ] Lawinenregionen
- [ ] Gefahrenstufen
- [ ] Farbige Darstellung
- [ ] Popup-Informationen
- [ ] Verlinkung auf Lageberichte

### Langfristig

- [ ] Analyse entlang von GPX-Tracks
- [ ] Analyse geplanter Routen

---

# 2.2 Unfallereignisse

## Ziel

Dokumentierte alpine Unfälle sichtbar machen.

### Geplante Datenquellen

- [ ] Kuratorium für Alpine Sicherheit (Österreich)
- [ ] Bayerisches Kuratorium für Alpine Sicherheit

### Geplante Funktionen

- [ ] Unfallpunkte auf Karte
- [ ] Popup-Informationen
- [ ] Zeitfilter
- [ ] Unfalltypfilter

### Unfalltypen

- Lawinenunfall
- Absturz
- Orientierungslosigkeit
- Blockierung
- Bergrettungseinsatz
- Sonstige Alpinunfälle

---

# 2.3 Unfall-Heatmap

## Ziel

Risikohotspots sichtbar machen.

### Geplante Funktionen

- [ ] Heatmap-Layer
- [ ] Unfallstatistische Verdichtung
- [ ] Zeitbereichsfilter
- [ ] Unfalltypfilter

### Nutzen

Nutzer erkennen bereits vor der Planung:

- häufige Unfallgebiete
- kritische Regionen
- Gefahrenkonzentrationen

---

# 2.4 Digiway Absturzrisiko

## Ziel

Berechnetes Absturzrisiko alpiner Wanderwege visualisieren.

### Geplante Funktionen

- [ ] Risikolayer
- [ ] Darstellung nach Risikoklassen
- [ ] Popup mit Zusatzinformationen
- [ ] Einbindung in Tourenanalyse

### Nutzen

Zusätzliche Risikobewertung für:

- Bergwanderer
- Trailrunner
- Hochtourengeher

---

## Meilenstein

Phase 2 gilt als abgeschlossen, wenn:

- Lawinenlage verfügbar ist
- Unfallereignisse angezeigt werden
- Heatmap vorhanden ist
- Absturzrisiko integriert ist

---

# Phase 3 — GPX Analyse

## Ziel

Bestehende Touren automatisch analysieren.

---

## Status

⚪ Geplant

Fortschritt: 0 %

---

# 3.1 GPX Upload

### Funktionen

- [ ] GPX-Dateien hochladen
- [ ] GPX auf Karte darstellen
- [ ] GPX speichern
- [ ] GPX entfernen

---

# 3.2 Tourenanalyse

### Analysebereiche

- [ ] Schutzgebiete
- [ ] Wildlife
- [ ] Regeln
- [ ] Sperrungen
- [ ] Wetter
- [ ] Lawinenlage
- [ ] Unfallereignisse
- [ ] Unfall-Heatmap
- [ ] Absturzrisiko

---

## Beispielausgabe

```text
✅ Keine Sperrungen

⚠ Wildruhezone betroffen

⚠ Drei relevante Schutzgebiete

⚠ Lawinenstufe 3

⚠ Erhöhtes Absturzrisiko

⚠ Unfall-Hotspot entlang der Route
```

---

## Meilenstein

Phase 3 gilt als abgeschlossen, wenn GPX-Dateien vollständig analysiert werden können.

---

# Phase 4 — Routing & Tourenplanung

## Ziel

Touren direkt innerhalb von Bergbedingungen planen.

---

## Status

⚪ Geplant

Fortschritt: 0 %

---

## Funktionen

- [ ] Startpunkt setzen
- [ ] Zielpunkt setzen
- [ ] Route berechnen
- [ ] Route bearbeiten
- [ ] Route speichern

---

## Erweiterte Analyse

Eine geplante Route wird automatisch analysiert hinsichtlich:

- Schutzgebieten
- Regeln
- Wildlife
- Sperrungen
- Wetter
- Lawinenlage
- Unfallereignissen
- Absturzrisiko

---

## Meilenstein

Phase 4 gilt als abgeschlossen, wenn Touren vollständig innerhalb der Anwendung geplant und bewertet werden können.

---

# Phase 5 — Design & Benutzererlebnis

## Ziel

Professionelle und attraktive Nutzererfahrung.

---

## Status

⚪ Geplant

Fortschritt: 0 %

---

## Geplante Verbesserungen

- [ ] Modernes Design
- [ ] Konsistentes Farbschema
- [ ] Mobile Optimierung
- [ ] Überarbeitung der Popups
- [ ] Einheitliche Icons
- [ ] Verbesserte Layersteuerung
- [ ] Verbesserte Navigation

---

## Zielbild

Bergbedingungen soll wie ein professionelles Produkt wirken und öffentlich präsentierbar sein.

---

# Phase 6 — KI-Unterstützung

## Ziel

Alle vorhandenen Daten intelligent interpretieren.

---

## Status

⚪ Zukunft

---

## Grundsatz

Die KI soll keine eigenen Daten erzeugen.

Die KI analysiert und erklärt vorhandene Informationen.

---

## Typische Fragen

- Kann ich diese Tour morgen machen?
- Welche Risiken bestehen?
- Welche Regeln gelten?
- Wo liegt das größte Risiko?
- Welche Alternativen gibt es?

---

## Beispiel

```text
Die Tour ist grundsätzlich möglich.

Zu beachten:

- Gefahrenstufe 3 in Abschnitt X
- Wildruhezone zwischen km 5 und km 8
- Erhöhtes Absturzrisiko im Gipfelbereich
- Drei relevante Schutzgebietsregeln
```

---

## Meilenstein

Phase 6 gilt als abgeschlossen, wenn natürliche Fragen vollständig auf Basis der vorhandenen Daten beantwortet werden können.

---

# Phase 7 — PWA & Offline

## Ziel

Optimale mobile Nutzung.

---

## Status

⚪ Zukunft

---

## Funktionen

- [ ] Zum Homescreen hinzufügen
- [ ] Offline Karten
- [ ] Offline Schutzgebiete
- [ ] Offline Risikolayer
- [ ] Standortfunktion
- [ ] Offline Tourenanalyse
- [ ] Push-Benachrichtigungen

---

## Meilenstein

Bergbedingungen soll auch ohne stabile Mobilfunkverbindung nutzbar sein.

---

# Langfristiges Zielbild

## Arbeitsablauf

```text
Tour planen
↓
Wetter prüfen
↓
Sperrungen prüfen
↓
Schutzgebiete prüfen
↓
Wildlife prüfen
↓
Regeln prüfen
↓
Lawinenlage prüfen
↓
Unfälle prüfen
↓
Absturzrisiko prüfen
↓
Gesamtauswertung erhalten
```

---

## Endziel

Bergbedingungen soll die zentrale Informationsplattform für Bergsportler im Alpenraum werden und die Frage beantworten:

> „Wenn du diese Tour morgen so durchführst, solltest du genau auf diese Punkte achten.“