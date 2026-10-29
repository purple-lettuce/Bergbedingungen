# Alpine Risk Engine

## Vision

Mountain Radar soll nicht nur Daten anzeigen.

Mountain Radar soll Nutzern helfen, Risiken einer geplanten Route besser zu verstehen.

Der Assistent in der App könnte ARI heißen. Alpine Risk Intelliegence

Die Alpine Risk Engine analysiert Datenquellen entlang eines GPX-Tracks oder einer geplanten Route und erstellt daraus eine strukturierte Risikobewertung.

Die Risk Engine trifft keine Entscheidungen für den Nutzer.

Sie macht Risiken sichtbar.

Grundprinzip:

"Informieren statt entscheiden."

---

## Langfristiger Output

Beispiel:

Route Analyse

⚠ Gewitterwarnung ab 15:00

⚠ 3 Abschnitte > 35° Hangneigung

⚠ Ausgesetzter Grat

⚠ Wildruhezone betroffen

⚠ Stufe 3 Lawinenlage oberhalb 2200 m

⚠ Erhöhte Unfallhäufung

✅ Schutzhütte nach 4,2 km

✅ Trinkwasserstelle bei km 6,8

---

## Designprinzipien

- Keine Verbote
- Keine automatische Freigabe von Touren
- Transparente Risikobeurteilung
- Nachvollziehbare Datenquellen
- Jede Warnung muss erklärbar sein
- Nutzer trifft die Entscheidung

---

# Architektur

## Input

### GPX Track

oder

### Manuell geplante Route

---

## Segmentierung

Route wird in Segmente aufgeteilt.

Beispiel:

Segment 1
Segment 2
Segment 3
...

Für jedes Segment werden Risiken analysiert.

---

# Risikomodule

## Wettermodul

Ziel:

Wetterrisiken entlang der Route erkennen.

Datenquellen:

- GeoSphere Austria
- Meteostat

Mögliche Risiken:

- Gewitter
- Starkregen
- Wind
- Hitze
- Nebel

Status:

Recherche läuft

---

## Lawinenmodul

Ziel:

Lawinenrelevante Abschnitte erkennen.

Datenquellen:

- ALBINA
- SLF

Mögliche Risiken:

- Gefahrenstufe
- Exposition
- Höhenbereich
- Lawinenprobleme

Status:

In Umsetzung

---

## Schutzgebietsmodul

Ziel:

Konflikte mit Naturschutz erkennen.

Datenquellen:

- DTP
- Länderdaten

Mögliche Risiken:

- Wildruhezone
- Sperrung
- Betretungsverbot

Status:

In Umsetzung

---

## Geländemodul

Ziel:

Objektive Geländerisiken erkennen.

Datenquellen:

- Austrian DEM
- Höhenmodelle

Mögliche Risiken:

- Steilheit
- Exposition
- Absturzgelände
- Geländeform

Status:

Konzept

---

## Wegmodul

Ziel:

Wegcharakter analysieren.

Datenquellen:

- OSM
- Overpass API

Wichtige Attribute:

- sac_scale
- trail_visibility
- surface

Mögliche Risiken:

- Schwierigkeit
- Orientierung
- Untergrund

Status:

Konzept

---

## Infrastrukturmodul

Ziel:

Relevante Infrastruktur entlang der Route erkennen.

Datenquellen:

- OSM
- Open Data

Objekte:

- Hütten
- Notunterkünfte
- Quellen
- Trinkwasser
- Rettungspunkte

Status:

Konzept

---

## Unfallmodul

Ziel:

Historische Unfallmuster erkennen.

Mögliche Datenquellen:

- Alpinpolizei
- SLF Unfallstatistik

Mögliche Hinweise:

- bekannte Unfallhäufungen
- Lawinenereignisse
- Absturzschwerpunkte

Status:

Recherche

---

# Risikokategorien

Derzeit geplant:

## Wetterrisiko

0–5

---

## Lawinenrisiko

0–5

---

## Absturzrisiko

0–5

---

## Orientierungsrisiko

0–5

---

## Umweltkonflikte

0–5

---

## Infrastrukturversorgung

0–5

---

# Offene Fragen

## Wie werden Einzelrisiken gewichtet?

Offen.

---

## Soll ein Gesamtrisiko berechnet werden?

Aktuell nein.

Begründung:

Zu hohe Vereinfachung.

Die Engine soll zunächst Einzelrisiken darstellen.

---

## Wann wird KI eingebunden?

Späte Projektphase.

Erst nachdem die Risikomodule belastbare Daten liefern.

---

## Wie wird mit widersprüchlichen Daten umgegangen
z.B. Bei Wegeschwierigkeit
Offen.

---


# Roadmap

Phase 1

✅ Schutzgebiete

✅ Wildlife

✅ Lawinenlage

---

Phase 2

Geosphere Integration

DEM Integration

OSM Risikodaten

---

Phase 3

GPX Import

Segmentanalyse

---

Phase 4

Erste Alpine Risk Engine

---

Phase 5

KI-gestützte Risikoerklärung. 