# Mountain Radar – Landing Page Plan

> Status: In Arbeit (LP1 bis LP7 erledigt, LP8 geplant)
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
- Bewusst nicht Teil von LP1 (bleibt bei den jeweiligen Paketen): Produkterklärung (LP2), aktuelle Funktionen (LP3), Vision und GPX (LP4), Datenquellen (LP5), Produktvision (LP6), Navigation (LP7, erledigt), SEO und Sharing (LP8).

---

# LP2 – Was ist Mountain Radar?

Status: Erledigt (04.11.2026)

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

Umsetzung (LP2):

- Zwei Abschnitte unter dem Hero: „Was ist Mountain Radar?“ (ein Einleitungssatz, fünf Infokarten Wetter, Lawinenlage, Schutzgebiete, Wildlife, Sperrungen & Hinweise) und „Für wen?“ (fünf Zielgruppen, ein Satz „Warum Mountain Radar?“).
- Beschrieben wird nur, was die Anwendung heute kann. Risk Engine, GPX, Geländeanalyse, Routenanalyse und automatische Risikobewertung kommen nicht vor (LP4); Behörden und Organisationen werden nicht als Zielgruppe genannt.
- Details und Test: STYLEGUIDE.md, Abschnitt „Landing Page (seit LP1)“.

---

# LP3 – Aktuelle Informationsquellen

Status: Erledigt (04.11.2026)

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

Umsetzung (LP3):

- Abschnitt „Aktuelle Informationsquellen“ unter „Für wen?“: fünf Infokarten (Wetter, Lawinenlage, Schutzgebiete, Wildlife, Sperrungen & Hinweise), je Titel und ein Satz. Wo LP2 erklärt, was Mountain Radar ist, nennt LP3, welche Informationen konkret zu sehen sind (z. B. Nullgradgrenze, Höhengrenzen, Filter).
- Bestehendes Designsystem (`.mr-section`, `.mr-feature-grid`, `.mr-card--raised`), keine neuen Komponenten, kein JavaScript, keine zweite Aktion.
- Bewusst nicht dargestellt: Risk Engine, GPX-Analyse, automatische Risikobewertung, Geländeanalyse, Unfalllayer, Coming-Soon-Bereiche, Datenquellen-Details (LP5).

---

# LP4 – Alpine Risk Intelligence

Status: Erledigt (04.11.2026)

Ziel:

Die langfristige Vision erklären.

Erklären:

- Tourenanalyse
- Risikoanalyse
- GPX-Auswertung
- zukünftige Risk Engine

Wichtig:

Vision klar von aktueller Funktionalität trennen.

Umsetzung (LP4):

- Abschnitt „Alpine Risk Intelligence“ nach „Aktuelle Informationsquellen“ (Fläche `--alt`). Drei kurze Erklärungen: warum Informationen allein nicht genügen, warum Kontext wichtig ist, warum Wetter, Lawinenlage und Schutzgebiete zusammen betrachtet werden sollten.
- Erwähnte Zukunftsthemen: GPX-Analyse, Risikoanalyse, Terrain Intelligence, Alpine Risk Engine.
- Trennung von der heutigen Funktionalität: eigener Abschnitt, Zwischenüberschrift „Vision“ mit Kennzeichen „Noch nicht verfügbar“, jede Zukunftskarte beginnt mit „Ziel:“ und steht in einfacher (nicht angehobener) Karte, die heutigen Karten in LP2/LP3 bleiben angehoben. Ein Schlusssatz verweist auf die heutigen Informationsquellen. Die Zukunftsthemen kommen nirgends sonst auf der Seite vor.
- Keine KI-Begriffe, keine Marketingsprache, keine Aktion, kein JavaScript. Test: `scripts/test_landing.html`.

---

# LP5 – Datenquellen & Transparenz

Status: Erledigt (04.11.2026)

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


Umsetzung (LP5):

- Abschnitt „Datenquellen & Transparenz“ nach „Alpine Risk Intelligence“: sechs Infokarten (`.mr-source-grid`, bestehende Bausteine) mit Bereich, fett der Quelle und einem Satz zur Aktualität. Danach der Abschnitt „Hinweis“ (Fläche `--alt`): Mountain Radar ersetzt keine Tourenplanung vor Ort; Datenquellen können sich ändern; aktuelle Informationen immer prüfen.
- Genannte Quellen (alle in der Anwendung genutzt, siehe Fußzeile von `app.html`): Open-Meteo (Wetter), Lawinenwarndienste Tirol, Südtirol und Trentino (Euregio) sowie WSL-Institut für Schnee- und Lawinenforschung SLF (Lawinenlage), Digitize the Planet e.V. (Schutzgebiete, Wildlife, Sperrungen & Hinweise), OpenStreetMap-Mitwirkende und OpenTopoMap (Kartengrundlage, im Plan als „OSM“ vorgesehen).
- Bewusst nicht genannt: GeoSphere Austria, Meteostat, Meteomatics, Austrian DEM, Basemap.at, Tirol Data Hub, Météo-France, AINEVA, ARSO, SLF-Forschungsdaten, BMI Alpinpolizei, Kuratorium für Alpine Sicherheit, Digiway, Browser- und Sensor-APIs, SunCalc (alle geplant, in Recherche oder nicht Datenquelle der Anwendung). Keine Lizenzangaben: Die Lizenz der Schutzgebiete und Sperrungen aus Digitize the Planet ist laut DATENQUELLEN.md nicht abschließend recherchiert, die Namensnennung steht in der Anwendung. Die Aktualitätsangaben entsprechen den Abschnitten „Zeitstempel und Datenstatus“ und den Aktualisierungsintervallen in DATENQUELLEN.md.
- Kein Link auf DATENQUELLEN.md: Die Seite behält genau eine Aktion („Zur Karte“). Test: `scripts/test_landing.html`.
---

# LP6 – Produktvision

Status: Erledigt (04.11.2026)

Ziel:

Warum existiert Mountain Radar?

Leitfrage:

Warum wurde die Plattform entwickelt?

Themen:

- Sicherheit
- Transparenz
- alpine Entscheidungen

Umsetzung (LP6):

- Abschnitt „Produktvision“ nach „Hinweis“ (normale Fläche, damit er sich von der Fläche `--alt` des Hinweises abhebt). Eine Einleitungszeile („Warum es Mountain Radar gibt.“), vier kurze Themen (`.mr-vision-text`, bestehende Bausteine, keine neue Komponente) und ein Schlusssatz mit dem Slogan.
- Themen: Bessere Entscheidungen im alpinen Raum, Transparenz, Risikobewusstsein, Zugang zu Informationen. Sie sind in Du-Form formuliert („Du sollst sehen, woher eine Angabe kommt“), nicht als Leistungsversprechen des Produkts.
- Slogan: „Know before you go.“ steht im Hero als Überschrift und schließt die Vision als Gedanke dahinter ab („erst informieren, dann losgehen“). Er wird nicht als Werbezeile wiederholt.
- **Transportierte Produktbotschaft:** Mountain Radar existiert, damit du vor einer Tour die wichtigen Informationen kennst, weißt, woher sie kommen und wie aktuell sie sind, und die Entscheidung danach selbst triffst. Es will die Beurteilung vorbereiten, nicht ersetzen; es verspricht keine Sicherheit.
- Bewusst vermieden: Superlative, „innovativ/einzigartig/führend“, Investoren- und Startup-Sprache, KI-Begriffe, Sicherheitsversprechen, Zukunftsfunktionen (GPX, Risk Engine, Terrain stehen nur in LP4), erfundene Gründungsgeschichte oder Zahlen. Keine Aktion, kein JavaScript. Test: `scripts/test_landing.html`.
- Der Punkt „Einstieg in die Karte“ der Informationsarchitektur ist der Link im Hero (LP1); LP6 ergänzt keine zweite Aktion. Navigation bleibt LP7.
---

# LP7 – Navigation & Unterseiten

Status: Erledigt (04.11.2026)

Ziel:

Die Landing Page erhält eine klare Informationsarchitektur.

Mögliche Bereiche:

- Startseite
- Karte
- Alpine Risk Intelligence
- Datenquellen
- Über Mountain Radar

Umsetzung (LP7):

- Hauptnavigation (`nav.mr-nav`, beschriftet „Hauptnavigation“) im Header der Startseite mit vier Einträgen: **Karte** (`app.html`), **Alpine Risk Intelligence** (`#lp4-ari`), **Datenquellen** (`#lp5-daten`), **Über Mountain Radar** (`#lp2-was`). „Startseite“ ist die Seite selbst und braucht keinen eigenen Eintrag.
- **Keine neuen Unterseiten.** Alle Inhalte (LP2–LP6) sind kurz und stehen schon als Abschnitte auf der Startseite; eigene Seiten wären Duplikate oder Platzhalter. Die Navigation verweist deshalb auf die vorhandenen Abschnitte, nichts wird verdoppelt. „Über Mountain Radar“ führt zu „Was ist Mountain Radar?“; die Produktvision folgt weiter unten auf derselben Seite.
- Reine Links, kein JavaScript, kein Menü-Schalter: Auf kleinen Bildschirmen (≤ 820 px) steht die Navigation unter der Marke und bricht um, alle Ziele mindestens 44 px hoch. Hell/Dunkel über die Tokens, keine festen Farben. „Karte“ ist als Hauptziel hervorgehoben.
- Bei niedrigen Fenstern (≤ 480 px Höhe) wird der Hero enger gesetzt, damit „Zur Karte“ trotz Navigation sichtbar bleibt.
- Die Regel „genau eine Aktion“ gilt jetzt für den Inhalt (`main`): Hero-Link „Zur Karte“; die Navigation im Header ist die einzige weitere Linkgruppe. Test: `scripts/test_landing.html` (Einträge, keine toten oder leeren Links, Anker auf Überschriften, Größe, Überlauf bei 1440/390/320 px, Sprung zum Abschnitt).

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