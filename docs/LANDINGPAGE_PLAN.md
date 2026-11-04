# Mountain Radar – Landing Page Plan

> Status: In Arbeit (LP1 erledigt, LP2–LP8 geplant)
>
> Ziel: Entwicklung einer modernen Produkt- und Einstiegsseite für Mountain Radar.
>
> Die Landing Page soll neuen Besuchern erklären:
>
> - Was Mountain Radar ist
> - Für wen Mountain Radar gedacht ist
> - Welche Informationen bereits heute verfügbar sind
> - Wie sich die Plattform langfristig entwickelt

---

# Grundprinzipien

## Produkt vor Karte

Neue Besucher sollen zuerst verstehen:

> Was ist Mountain Radar?

Die Karte ist ein Werkzeug.

Mountain Radar ist das Produkt.

---

## Realität vor Vision

Bereits verfügbare Funktionen stehen im Vordergrund.

Zukünftige Funktionen dürfen erwähnt werden, müssen aber klar als Vision erkennbar sein.

Keine Fake-Features.

Keine Attrappen.

---

## Vertrauen durch Transparenz

Datenquellen, Aktualität und Herkunft der Daten sollen offen kommuniziert werden.

---

## Moderne Produktkommunikation

Inspiration:

- Linear
- Stripe
- Arc Browser
- Mapbox
- Komoot

Mountain Radar soll wirken wie:

ALPINE RISK INTELLIGENCE

nicht wie eine Behördenseite.

---

# Zielgruppen

## Primär

- Wanderer
- Bergsteiger
- Skitourengeher
- Trailrunner

---

## Sekundär

- Bergführer
- Vereine
- Rettungsorganisationen
- Naturschutzakteure

---

# Informationsarchitektur

Landing Page

├── Hero
├── Was ist Mountain Radar?
├── Aktuelle Informationsquellen
├── Alpine Risk Intelligence
├── Datenquellen & Transparenz
├── Produktvision
└── Einstieg in die Karte

---

# LP1 – Hero & Landing Struktur

Status: Erledigt (04.11.2026)

Ziel:

Innerhalb von 5 Sekunden soll verständlich sein:

- Produktname
- Nutzen
- Zielgruppe

Elemente:

- Logo
- Produktname
- Claim
- Slogan
- CTA „Zur Karte“

Beispiel:

Mountain Radar

ALPINE RISK INTELLIGENCE

Know before you go.

Umsetzung (LP1):

- Startseite `index.html` (ohne JavaScript), Kartenanwendung unter `app.html`. Nutzerführung: Startseite → „Zur Karte“ → Anwendung; zurück über die Marke im Header der Anwendung.
- Derselbe Header wie in der Anwendung (Emblem, Name, Claim) ist die einzige Markenführung; der Hero zeigt den Slogan als Überschrift, einen Satz Einleitung und genau einen Link „Zur Karte“.
- Details, Regeln und Test: STYLEGUIDE.md, Abschnitt „Landing Page (seit LP1)“.
- Bewusst nicht Teil von LP1 (bleibt bei den jeweiligen Paketen): Produkterklärung (LP2), aktuelle Funktionen (LP3), Vision und GPX (LP4), Datenquellen (LP5), Produktvision (LP6), Navigation (LP7), SEO und Sharing (LP8).

---

# LP2 – Was ist Mountain Radar?

Status: Geplant

Ziel:

Produkt kurz erklären.

Beispiel:

Mountain Radar bündelt Wetter,
Lawinenlage, Schutzgebiete und
alpine Geodaten auf einer Plattform.

Schwerpunkte:

- Orientierung
- Risikobewusstsein
- Informationszugang

---

# LP3 – Aktuelle Informationsquellen

Status: Geplant

Ziel:

Bereits verfügbare Funktionen sichtbar machen.

Mögliche Bereiche:

- Wetter
- Lawinenlage
- Schutzgebiete
- Wildlife
- Sperrungen & Hinweise

Keine Zukunftsfunktionen.

Nur reale Features.

---

# LP4 – Alpine Risk Intelligence

Status: Geplant

Ziel:

Die langfristige Vision erklären.

Erklären:

- Tourenanalyse
- Risikoanalyse
- GPX-Auswertung
- zukünftige Risk Engine

Wichtig:

Vision klar von aktueller Funktionalität trennen.

---

# LP5 – Datenquellen & Transparenz

Status: Geplant

Ziel:

Vertrauen schaffen.

Inhalte:

- Wetterquellen
- Lawinenquellen
- Schutzgebietsquellen
- OSM
- Verify-before-you-go Hinweis

Verweise auf:

DATENQUELLEN.md

---

# LP6 – Produktvision

Status: Geplant

Ziel:

Warum existiert Mountain Radar?

Leitfrage:

Warum wurde die Plattform entwickelt?

Themen:

- Sicherheit
- Transparenz
- alpine Entscheidungen

---

# LP7 – Navigation

Status: Geplant

Mögliche Einstiegsseiten:

- Karte
- Alpine Risk Intelligence
- Datenquellen
- Über Mountain Radar

Voraussetzung:

Abschluss LP1–LP6

---

# LP8 – SEO & Sharing

Status: Geplant

Themen:

- Open Graph
- Social Preview
- Suchmaschinen-Metadaten
- strukturierte Daten

---

# Priorisierung

1. LP1 – Hero & Struktur
2. LP2 – Was ist Mountain Radar?
3. LP3 – Aktuelle Informationsquellen
4. LP5 – Datenquellen & Transparenz
5. LP4 – Alpine Risk Intelligence
6. LP6 – Produktvision
7. LP7 – Navigation
8. LP8 – SEO & Sharing

---

# Definition of Done

Die Landing Page gilt als abgeschlossen, wenn ein neuer Besucher innerhalb weniger Sekunden beantworten kann:

- Was ist Mountain Radar?
- Wer sollte Mountain Radar verwenden?
- Welche Informationen liefert Mountain Radar heute?
- Welche Vision verfolgt Mountain Radar?
- Wie komme ich zur Karte?