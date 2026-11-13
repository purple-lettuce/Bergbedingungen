# Mountain Radar – Landing Page Plan

> Status: In Arbeit (LP1 bis LP8 und LP1b erledigt)
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

# LP1b – Hero Visual & Landing-Hintergrund

Status: Erledigt (13.11.2026)

Ziel:

Die Landing Page wärmer und hochwertiger wirken lassen, ohne Inhalt, Navigation oder Architektur zu ändern. Reines Visual-Paket.

Umsetzung (LP1b):

- **Hero-Bild:** `docs/design/mountain-radar-hero.jpg` (1152 × 768, Skitourengeher vor einer Brücke im Hochgebirge, 264 KB) füllt den Hero als CSS-Hintergrund (`background-size: cover`, Ausschnitt `center 40%`, Mindesthöhe `clamp(420px, 62vh, 640px)`). Das Bild ist Dekoration (kein `img`, kein Alternativtext nötig); es kommt kein neuer Text hinzu.
- **Overlay:** Verlauf in Nachtblau (`--mr-hero-overlay`, `10, 24, 40`) von links (Deckkraft 0,6) nach rechts (≈ 0,09), damit „Know before you go.“, die Einleitung und „Zur Karte“ links lesbar sind und das Bild rechts sichtbar bleibt. Mobil (≤ 820 px) gleichmäßiger Verlauf von oben nach unten, da der Text über die ganze Breite läuft. Dunkelmodus: Deckkraft 0,76.
- **Text und Aktion auf dem Bild:** Slogan und Einleitung in `--mr-on-primary` (weiß) mit leichtem Textschatten. „Zur Karte“ ist im Hero ein weißer Button mit Deep-Alpine-Blue-Schrift (der marineblaue Standardbutton verschwände auf dem dunklen Overlay).
- **Hintergrundfarbe:** Die Vorgabe `#EBDFC3` wurde geprüft und leicht aufgehellt zu **`#EFE5CF`** (gleicher Farbton, mehr Helligkeit). Kontraste (WCAG): Haupttext `#1B2733` 12,1 : 1 (bei `#EBDFC3` 11,5), gedämpfter Text `#566574` **4,78 : 1** (bei `#EBDFC3` nur 4,52, knapp über AA), Link `#16324F` 10,5 : 1, Mountain Green `#2F6B4F` 5,0 : 1. Weiße Karten heben sich mit 1,25 : 1 klar ab (bei `#EBDFC3` 1,32), dazu Rahmen und Schatten. Die Linienfarbe ist auf der Startseite warm (`#DCD0B5`).
- **Landing und Anwendung getrennt:** Die Tokens `--mr-landing-bg` und `--mr-landing-line` gelten nur mit `<body class="mr-landing">`. Die Kartenanwendung (`app.html`) behält `#F5F7F6`. Im Dunkelmodus bleibt die Landing-Fläche `#0E1620` (kein warmer Ton im Dunkeln).
- Header, Navigation, Fußzeile und weiße Flächen (`--alt`-Abschnitte) bleiben unverändert; die warmen Abschnitte wechseln sich mit weißen ab.
- Test: `scripts/test_landing.html` (Hero-Bild und Overlay, helle Schrift, Aktion im Hero, Bild erreichbar, warme Fläche, weiße Karten, Kontrast ≥ 4,5, Anwendung unverändert). Screenshots: `docs/design/lp1b/`.

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

Status: Erledigt (04.11.2026)

Themen:

- Open Graph
- Social Preview
- Suchmaschinen-Metadaten
- strukturierte Daten (bewusst nicht umgesetzt, siehe unten)

Umsetzung (LP8):

- Im `<head>` von `index.html` und `app.html`: `<title>`, `meta description`, Open Graph (`og:type`, `og:site_name`, `og:locale`, `og:title`, `og:description`, `og:image` samt Typ, Größe, Alternativtext) und Twitter/X (`twitter:card` = `summary_large_image`, Titel, Beschreibung, Bild, Alternativtext). Der Text steht pro Seite einmal; Open Graph und Twitter wiederholen ihn.
- Titel: Startseite „Mountain Radar – Alpine Risk Intelligence“, Karte „Karte – Mountain Radar“. Beschreibung (gleich für beide, ≈ 115 Zeichen): „Sperrungen, Hinweise, Schutzgebiete, Wetter und Lawinenlage für den Alpenraum auf einer Karte. Know before you go.“ Es steht nur darin, was die Karte tatsächlich zeigt; keine Keyword-Listen, keine Versprechen.
- Social Preview: `docs/design/mountain-radar-social-preview.png` (1200 × 630, Verhältnis 1,91 : 1). Links das Emblem, rechts Name, Claim und Slogan auf dem Verlauf Deep Alpine Blue → Alpine Green, mit Inter. Quelle: `docs/design/social-preview.html` (Screenshot der Seite in Edge/Chrome headless bei 1200 × 630).
- Sharing-Darstellung: große Karte mit Bild oben, darunter Titel und Beschreibung (Open Graph und Twitter/X gleich).
- Bewusst nicht umgesetzt: strukturierte Daten (JSON-LD) und `canonical`/`og:url`. Es gibt noch keine feste öffentliche Adresse, und eine erfundene Adresse wäre falsch. Die Bild-Adressen sind deshalb relativ; viele Dienste verlangen für `og:image` eine absolute Adresse. **Sobald die Seite öffentlich erreichbar ist**, müssen `og:image` und `twitter:image` absolut gesetzt und `canonical`/`og:url` ergänzt werden. Strukturierte Daten bringen bei einer einzelnen Startseite ohne Suchfunktion nichts.
- Keine Funktionsänderung: Es wurden nur Metadaten im `<head>` und ein Bild ergänzt. Test: `scripts/test_landing.html` (Titel, Beschreibung, Open Graph, Twitter/X, Bildgröße).
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