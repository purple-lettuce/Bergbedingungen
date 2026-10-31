# Mountain Radar — Styleguide

## Produktname

Mountain Radar

## Claim

ALPINE RISK INTELLIGENCE

## Slogan

Know before you go.

---

# Designprinzip

Mountain Radar setzt auf klare, robuste visuelle Sprache für alpine Sicherheit und schnelle Orientierung im Gelände. Das Design soll Vertrauen, Präzision und Einsatzfähigkeit vermitteln — ohne unnötige Dekoration oder visuelle Überladung.

Die primäre Perspektive ist geografisch und praktisch: Nutzer müssen auf einen Blick erkennen, welche Risiken, Einschränkungen oder Hinweise in einem Gebiet relevant sind.

---

# Farbsystem

## Primärfarben

- Deep Alpine Blue: `#16324F`
- Mountain Green: `#2F6B4F`

### Verwendung

- Deep Alpine Blue: Hauptfarbe für Navigation, Kartenrahmen, UI-Elemente, Header, aktive Zustände
- Mountain Green: sekundäre Akzentfarbe für positive Zustände, grüne Hinweise, Überschriften oder unterstützende Elemente

## Warnfarben

- Gelb
- Orange
- Rot
- rot-schwarz-karriert

### Verwendung

- Gelb: vorsichtige Hinweise, allgemeine Warnung, moderate Risikobewertung
- Orange: erhöhter Handlungsbedarf, Bereich mit begrenzter Sicherheit
- Rot: kritische Risiken, Sperrungen, hohe Relevanz
- rot-schwarz-karriert: besonders hohe Gefahr, Sperrungen, eingeschränkte Sicherheit, kritische Zustände mit klarer Signalwirkung

### Beispiel für Warnstufen

- `#F3C94B` (Gelb)
- `#E67E22` (Orange)
- `#C62828` (Rot)
- rot-schwarz-karriert als Sonderdarstellung für kritische oder aktive Gefahrenbereiche

---

# Typografie

## Grundsatz

Typography soll technisch, klar und lesbar bleiben. Die Sprache ist deutschsprachig. Die Gestaltung orientiert sich an kartentauglicher Lesbarkeit, nicht an Editorial-Design.

## Empfohlene Richtlinien

- Überschriften: kompakt, klar, semibold oder bold
- Fließtext: leicht lesbar, hohe Kontrastwerte
- UI-Labels: kurz, prägnant, ohne Über- oder Untertreibung
- Kartentexte: möglichst kurz, nur im notwendigen Kontext sichtbar

## Typografische Hierarchie

- H1: starke Karten-/Produktüberschrift, klar, auffällig
- H2: Sekundäre Überschrift, Ebene / Abschnitt
- H3: Filter- und Panelüberschriften
- Body: Standardtext in Karten- und Panel-UI
- Caption / Meta: kleine Hinweise, Quell- oder Statusinformationen

## Empfehlung für UI

- Schriftfamilie: **Inter** (variable, SIL OFL 1.1), selbst gehostet unter `vendor/inter/`. Keine Google Fonts und kein externes Schrift-CDN. Fallback: `system-ui`, `Segoe UI`, `Roboto`, `Arial`, sans-serif
- klare Zeilenabstände
- kurze Textblöcke in Popups, Panels und Legenden

---

# Kartenstil

## Ziel

Die Karte soll als operative Arbeitsfläche dienen. Sie darf nicht überladen wirken, sondern muss geographische Orientierung und Informationspriorisierung schnell ermöglichen.

## Stilmerkmale

- ruhige Basisfarben für Hintergrundkarten
- hohe Lesbarkeit von Labels und Linien
- klare Trennung zwischen Layern und Objekten
- visuelle Signale nur dort, wo sie für Sicherheit und Nutzung relevant sind

## Basiskarten

Empfohlene Kombination:

- OpenStreetMap für Standardansicht
- OpenTopoMap für bergbezogene Orientierung und Gelände-Referenz

## Kartenlogik

- Funktionale Informationen haben Vorrang vor dekorativen Kartenelementen
- Warnungen werden farblich und durch Muster sofort erfassbar
- Layer werden als separate Ebenen strukturiert, nicht als überlagerte „Visuelle Massen“
- Kartenbezogene Filter werden ausschließlich über das Menü „Karten & Layer“ gesteuert (Abschnitte „Filter …“). Das rechte Seitenpanel enthält keine Filterschalter; die Textsuche bleibt dort.

---

# Buttons

## Grundsatz

Buttons sollten klar, gedrungener und robust wirken. Sie müssen auf der Karte und im UI schnell erkennbar sein, auch bei Nutzung im Gelände.

## Stilrichtlinien

- runde bis leicht abgerundete Ecken
- klare, gut lesbare Beschriftung
- starke Kontraste auf primären und sekundären Aktionen
- minimaler aber deutlich wahrnehmbarer Hover-/Active-State

## Variationen

### Primärbutton

- Hintergrund: Deep Alpine Blue `#16324F`
- Text: Weiß
- Fokus: hoher Kontrast

### Sekundärbutton

- Hintergrund: Mountain Green `#2F6B4F`
- Text: Weiß
- Einsatz: positive oder unterstützende Aktionen

### Warnbutton

- Hintergrund: Rot oder Warnfarbe entsprechend Funktion
- Text: Weiß
- Einsatz: Kritische Hinweise, Sperrungen, harte Warnungen

## Verhalten

- aktive Zustände sollen visuell sichtbar sein
- keine unnötig großen Schlagschatten oder zu weiche Erscheinung
- Buttons müssen auf der Karte ebenfalls gut nutzbar sein

---

# Layerfarben

Die Layerfarben müssen schnell verständlich und im Kartenkontext gut sichtbar sein. Die Farbwahl unterstützt - je nach Layer - die Bedeutung von Risiken, Schutzgebieten oder anderen Informationen.

## Typische Layerfarben

- Schutzgebiete: abgestufte Grün- und Blauvarianten mit klaren Kategorienfarben
- Sperrungen / Warnungen: Gelb, Orange, Rot, rot-schwarz-karriert
- Wetter / Standort: ruhige, neutrale Kartenfarben mit strukturierter Akzentfarbe
- Basismaps: dezent und neutral

## Lawinengefahrenstufen (Ausnahme)

Die Lawinenlage verwendet die offiziellen Farben der Europäischen Gefahrenskala, nicht die allgemeinen Warnfarben oben: 1 `#ccff66`, 2 `#ffff00`, 3 `#ff9900`, 4 `#ff0000`, 5 `#ff0000` mit rot-schwarzem Schachbrett. Wiedererkennung und Sicherheit gehen vor Konsistenz. Der SLF-Hinweis `fill` nennt für Stufe 5 die Farbe `#800000`; einheitlich gilt das Schachbrett (EAWS). Teilstufen der Schweiz werden als Zusatz zur Stufenzahl geschrieben (3-, 3=, 3+). Quelle und Begründung: [LAWINENLAGE_ANALYSE.md](LAWINENLAGE_ANALYSE.md), Abschnitt 5.

## Regeln

- gleiche Informationsarten sollten konsistent farblich kodiert sein
- Farben müssen keine Mehrdeutigkeit erzeugen
- bei Warnstufen sollte die Intensität der Farbe mit der Dringlichkeit steigen

## Beispiel

- neutral / allgemeine Information: Tiefblau oder Grautöne
- vorsichtig: Gelb
- relevant: Orange
- kritisch: Rot
- extrem / Sperrung: rot-schwarz-karriert

---

# Popupstil

## Ziel

Popups sollen kompakt, klar und handhabbar sein. Sie dienen der schnellen Erklärung eines Features oder einer Gefahr, ohne die Karte zu überladen.

## Stilmerkmale

- kompakte, lesbare Inhaltsstruktur
- klare Überschriften mit nachvollziehbaren Kategorien
- visuelle Trennung von Überschrift, Merkmalen und Warnhinweisen
- kurze Textblöcke, keine langen Textmassen

## Beispielstruktur

1. Titel oder Name des Objekts
2. Kategorie oder Typ
3. Kurzbeschreibung
4. relevante Warn- oder Regelhinweise
5. optional zusätzliche Metadaten

## Farben im Popup

- Titel / Kopfbereich: Deep Alpine Blue `#16324F`
- Akzentfarbe für Status / Kategorie: Mountain Green oder Warnfarbe je nach Dringlichkeit
- Hintergrund: hell und kontrastreich
- Text: dunkel genug für hohe Lesbarkeit

## UX-Anforderung

Popup-Inhalte müssen auf einen Blick verstanden werden, auch im mobilen Einsatz.

---

# Kartenlegenden

## Ziel

Legenden erklären die Bedeutung der Layer und Warnstufen sachlich und schnell. Sie müssen auf der Karte leicht auffindbar und visuell klar sein.

## Grundprinzipien

- wichtigste Kategorien zuerst
- kurze, konsistente Bezeichnungen
- klare Farblegende mit Symbolen oder Mustern
- kein unnötiger Text

## Typische Legendenbereiche

- Schutzgebiete
- Warnstufen
- Sperrungen und Hinweislayer
- Wetter-/Standort-Informationen

## Darstellung

- kleine Farbfelder oder Symbole mit kurzer Bezeichnung
- farblich konsistent mit Layern auf der Karte
- hohe Lesbarkeit auch auf mobilen Geräten

## Beispiel für Warnlegende

- Gelb: Hinweis / Vorsicht
- Orange: erhöhter Hinweis / Vorsicht
- Rot: kritisch / hohe Gefahr
- rot-schwarz-karriert: Sperrung / extremer Gefahrenzustand

---

# Design Tokens (seit D2)

Alle Oberflächenwerte stehen als CSS-Variablen `--mr-*` am Anfang von `style.css` (`:root`, Dunkelmodus per `prefers-color-scheme: dark` darunter). Neue Komponenten (ab D3) verwenden **nur** diese Tokens und keine festen Hexwerte, Radien oder Abstände. Die bisherigen Namen (`--bg`, `--panel`, `--fg`, `--muted`, `--line`, `--accent`, `--accent-fg`, `--closure`, `--notice`, `--upcoming`, `--ok`, `--font-body`, `--font-display`) bleiben als Alias auf die neuen Tokens bestehen.

## Farben

| Token | Hell | Dunkel | Verwendung |
|---|---|---|---|
| `--mr-primary` | `#16324F` | gleich | Deep Alpine Blue: Header, Bedienfeld-Kopf, Primärbutton |
| `--mr-primary-hover` | `#17374B` | gleich | Hover von Primärflächen (Abstufung aus dem Mockup) |
| `--mr-primary-soft` | `#E6EDF4` | `#1D2D3F` | helle Tönung für Flächen (ab D3) |
| `--mr-on-primary` | `#FFFFFF` | gleich | Text auf Primärflächen |
| `--mr-secondary` | `#2F6B4F` | gleich | Mountain Green: positive Zustände, Wetter-Pin |
| `--mr-secondary-bright` | `#1E7464` | gleich | Abstufung (Mockup-Teal) |
| `--mr-secondary-soft` | `#E7F0EB` | `#1B2D25` | helle Tönung (ab D3) |
| `--mr-on-secondary` | `#FFFFFF` | gleich | Text auf Sekundärflächen |
| `--mr-bg` | `#F5F7F6` | `#0E1620` | Seitenhintergrund |
| `--mr-surface` | `#FFFFFF` | `#16212C` | Karten, Panels, Eingaben |
| `--mr-line` | `#D8DEE3` | `#2A3947` | Linien, Rahmen |
| `--mr-text` | `#1B2733` | `#E6ECF1` | Fließtext |
| `--mr-text-muted` | `#566574` | `#9AA9B6` | Nebentext |
| `--mr-link` | `#16324F` | `#8DB4DB` | Links, Fokusrahmen, Auswahlelemente (Alias `--accent`) |
| `--mr-success` | `#2F6B4F` | `#6FBF98` | Status „aktuell“ (Alias `--ok`) |
| `--mr-closure` / `--mr-notice` / `--mr-upcoming` | `#C2351F` / `#B7791F` / `#3B6EA5` | `#F0705A` / `#E3A93F` / `#7FB0E3` | Warnfarben, **unverändert seit vor D2** |

Die Lawinenfarben (Gefahrenstufen, siehe Abschnitt „Lawinengefahrenstufen“), die Kartenlayer-Farben in `js/` und die festen Farben der hellen Popups gehören nicht zu den Tokens und bleiben unverändert.

Kontraste (WCAG, gerechnet): Text auf Fläche hell 15,2 : 1, dunkel 13,7 : 1; Nebentext 6,0 : 1 bzw. 6,8 : 1; Link 13,1 : 1 bzw. 7,5 : 1; Weiß auf `#16324F` 13,1 : 1; Weiß auf `#2F6B4F` 6,3 : 1. Bekannte Ausnahme: `--mr-notice` (`#B7791F`) erreicht auf Weiß 3,6 : 1 (Warnfarbe, laut Vorgabe unverändert; Entscheidung für eine dunklere Variante bleibt offen).

## Radien, Abstände, Schatten

| Token | Wert | Verwendung heute |
|---|---|---|
| `--mr-radius-xs` / `-sm` / `-md` | 4 / 6 / 8 px | Badges / Buttons, Eingaben, Listeneinträge / Karten, Bedienfeld |
| `--mr-radius-lg` / `-xl` / `-pill` | 12 / 16 / 999 px | vorbereitet für schwebende Karten und Panels (ab D3), noch nicht verwendet |
| `--mr-space-2xs` … `-2xl` | 2 / 4 / 8 / 12 / 16 / 24 / 32 px | Seitenleiste, Karten, Header, Zeilen und Listen |
| `--mr-shadow-sm` / `-md` | siehe `style.css` | Bedienfeld (`-sm`); `-md` für schwebende Karten vorbereitet |

Einzelne Zwischenwerte (6 px, 10 px, 5 px Rand) bleiben bewusst als feste Werte, bis die betroffene Komponente in D3 oder später umgebaut wird.

## Typografie

| Token | Wert |
|---|---|
| `--mr-font-sans` | `"Inter", system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif` |
| `--mr-text-xs` / `-sm` / `-base` / `-md` / `-lg` | 12 / 13 / 14 / 15 / 16 px |
| `--mr-text-xl` / `--mr-text-display` | 22 px (Titel) / 40 px (Temperatur) |
| `--mr-leading` / `--mr-tracking-label` | 1,45 / .06em (gesperrte Großbuchstaben nur für Labels und Überschriften) |

Dateien: `vendor/inter/inter-latin-wght-normal.woff2` und `inter-latin-ext-wght-normal.woff2` (Inter 4.x als Variable Font, Gewichte 100 bis 900, über `@fontsource-variable/inter` 5.2.8), Lizenz in `vendor/inter/OFL.txt`. Die Dateien werden per `@font-face` mit `unicode-range` geladen, die lateinische Datei zusätzlich per `preload`.

---

# Komponenten (seit D3)

Gemeinsame, wiederverwendbare UI-Bausteine in `style.css`, Abschnitt „Gemeinsame Komponenten (D3)“. Sie bauen ausschließlich auf den Tokens aus „Design Tokens“ auf (keine festen Farben, Radien oder Abstände; erlaubt sind nur Linienstärken von 1–2 px und das Touchziel von 44 px). Namensschema: `.mr-<name>`, `.mr-<name>--<variante>`, `.mr-<name>__<teil>`. Jede Komponente funktioniert hell und dunkel. Sichtbare Referenz mit allen Zuständen: [design/komponenten.html](design/komponenten.html) (über einen Webserver öffnen; gehört nicht zur Anwendung).

| Komponente | Zweck | Einsatz (geplant) | Abhängigkeiten |
|---|---|---|---|
| `.mr-card` (`--tight`, `--raised`) | Fläche mit Rahmen, Radius `md`, Innenabstand `md` | Seitenleistenkarten (D6), später schwebende Karten (D10) | `--mr-surface`, `--mr-line`, `--mr-text`, `--mr-radius-md`, `--mr-space-md`, `--mr-shadow-sm` |
| `.mr-label` | Mikro-Label: 12 px, gesperrte Großbuchstaben, gedämpft | Abschnittstitel, „AKTIVE OVERLAYS · N AKTIV“ (D7), Statuszeilen (D5) | `--mr-text-muted`, `--mr-text-xs`, `--mr-tracking-label` |
| `.mr-badge` (`--closure`, `--notice`, `--upcoming`, `--success`) | Kurzes Statusschild, Farbe = Rahmen = Text | Popup-Kopf (D8), Listen, Statusleiste (D5) | Statusfarben, `--mr-radius-xs`, `--mr-text-xs` |
| `.mr-switch` (`__track`, `__text`) | Schalter an/aus auf Basis einer echten Checkbox (`role="switch"`), Tastatur und Screenreader unverändert | Layer-Menü „Intelligence Layers“ (D7) | `--mr-link`, `--mr-line`, `--mr-text-muted`, `--mr-surface`, Radien, Abstände |
| `.mr-kv` (`--stacked`, `__item`) | Beschriftung und Wert; `dt`/`dd` in zwei Spalten, oder gestapelt im Raster | Wetterwerte (D6), Popups (D8), Statusleiste (D5) | `--mr-text-muted`, `--mr-text-xs`, Abstände |
| `.mr-segment` (`__opt`) | Auswahl genau einer Option als Radio-Gruppe (`role="radiogroup"`) | Kartenstil OSM/Topo (D7) | `--mr-primary`, `--mr-on-primary`, `--mr-link`, `--mr-bg`, `--mr-line` |
| `.mr-stack`, `.mr-cluster`, `.mr-gap-*` | Anordnung: Spalte bzw. umbrechende Zeile mit Abstand | überall | Abstands-Tokens |
| `.mr-mt-*`, `.mr-mb-0` | Abstand oben bzw. unten 0, nur Skalenwerte | ersetzt Inline-Styles | Abstands-Tokens |
| `.mr-text-muted`, `.mr-text-sm`, `.mr-tabular`, `.mr-visually-hidden` | Text-Hilfen | überall | Text-Tokens |

Regeln für die Verwendung:

- Neue Oberflächenteile verwenden Komponenten und Tokens, keine neuen Inline-Styles. Ausnahme: Werte, die aus Daten kommen (Farbfelder der Schutzgebiets-Legende).
- Die Komponenten in `.mr-*` ersetzen alte Klassen erst, wenn der jeweilige Bereich umgebaut wird (D5–D9). Bis dahin bleiben die alten Klassen (`.badge`, `.wx-grid`, `.kl-*`, `.status`) unverändert, damit nichts bricht.
- `.mr-badge` ist mit 12 px bewusst größer als das bisherige `.badge` (11 px, Mindestgröße laut Migrationsplan). Die Umstellung der Listeneinträge auf `.mr-badge` geschieht in D6.
- Klassen, die von JavaScript neu gesetzt werden (`el.status.className` in `js/map.js`), bekommen keine Helferklassen, sondern eine CSS-Regel (siehe `#status`).

## Migrationsstand

| Bereich | Stand |
|---|---|
| Seitenleistenkarten „Wetter“ und „Sperrungen und Hinweise“ (`index.html`, `js/weather.js`, `js/closures.js`) | seit D6 vollständig auf D3-Komponenten (siehe „Seitenleisten-Karten“) |
| Inline-Styles in `index.html` (3) und `js/weather.js` (1) | durch `.mr-mt-*`, `.mr-mb-0` bzw. die Regel `#status` ersetzt; Abstände 10 px → 12 px (Skala), 2 px mehr Luft über Schaltflächen und Statuszeile |
| Layer-Panel „Karten & Layer“ (`js/layer_panel.js`) | seit D7 auf D3-Komponenten (siehe „Layer-Panel“); `kl-*`-Klassen bleiben als Haken für Tests und Layout |
| Popup-Badges (`.badge`), Legendeninhalte (`.pa-*`, `.av-*`), Popups | **bewusst noch nicht migriert** (D8, D9) |
| Inline-Styles in Popups (`js/closures.js`, `js/protected_areas_popup.js`) | bleiben bis D8 |
| Inline-Styles mit Datenfarben (`js/protected_areas_legend.js`, `js/protected_areas_filter.js`) | bleiben, da datengetrieben |

---

# Seitenleisten-Karten (seit D6)

Beide Karten der rechten Seitenleiste bestehen nur aus D3-Komponenten; eigene Regeln gibt es nur für Textgrößen im Wetterblock und die Listeneinträge.

| Bereich | Komponenten |
|---|---|
| Kartenrahmen | `.mr-card` + `.mr-stack` (einheitlicher Abstand statt einzelner Margins) |
| Titel | `h2.mr-label` („Wetter“, „Sperrungen und Hinweise“) |
| Wetterwerte (Gefühlt, Wind / Böen, Nullgradgrenze, Standorthöhe) | `.mr-kv.mr-kv--stacked` mit `.mr-kv__item` |
| Tageskacheln | `.mr-card.mr-card--tight` |
| Aktionen (Für Kartenmitte, Mein Standort) | `.mr-cluster`, abgesetzt durch `.mr-divider-top`; Hinweistext `.mr-text-muted .mr-text-sm` |
| Suchfeld | `input[type=search]` in `.mr-card`: Radius `md`, Hintergrund `--mr-bg`, mind. 40 px (44 px bei Touch) |
| Zählzeile (`#status`) | ruhige Meta-Zeile (gedämpft, ohne Kasten); Fehler (`.status.err`) bleiben als Kasten sichtbar |
| Listeneintrag | `li.mr-card.mr-stack` mit 5 px Typrand (Sperrung/Hinweis), `.mr-badge` im `.mr-cluster`, Hover `--mr-primary-soft`, aktiv mit Umriss |

Nicht Teil dieser Karten und unverändert: Popups (alte `.badge`-Klassen bis D8), „Karten & Layer“, Legenden, Lawinenlage.

# Layer-Panel (seit D7)

Das Bedienfeld „Karten & Layer“ ist nur visuell erneuert; Verhalten, Schnittstelle (`addOverlay`, `addBaseLayer`, `addFilter`, `addLegend`) und Zustände sind unverändert.

| Bereich | Komponenten |
|---|---|
| Abschnittstitel (einklappbar) | `button.kl-toggle.mr-label` |
| Ebenen | je Ebene `.mr-card.mr-card--tight` mit `.mr-switch` (echte Checkbox, `role="switch"`) und `.mr-badge` („Aktiv“ grün / „Aus“ neutral); eingeschaltet: Rahmen `--mr-link`, Fläche `--mr-primary-soft` |
| Status | `.mr-label` „Aktive Overlays · N aktiv“, gezählt aus `map.hasLayer`; keine neue Datenlogik |
| Kartenstil | `.mr-segment` (`role="radiogroup"`, Radios unverändert), Optionen gleich breit |
| Filter | Schalter je Eintrag mit Farbfeld, Name, Anzahl (`.kl-count`); „Alle“/„Keine“ als ruhige Textknöpfe (`.kl-link`); Status „N von M sichtbar“ gedämpft |
| Hinweis „Ebene ausgeblendet“ | `.mr-card--tight` mit `.mr-text-muted` |
| Legenden | Inhalt und Logik unverändert (Darstellung bis D9) |

Touch-Ziele: Kopf, Abschnittstitel, Schalter und Segmente mindestens 44 px bei `pointer: coarse`.

# Header (seit D4)

Der Header ist eine ruhige, weiße App-Shell (Fläche `--mr-surface`, unten 1 px `--mr-line`; im Dunkelmodus dunkle Fläche). Er besteht aus:

- **Emblem** (`docs/design/mountain-radar-emblem.svg`, Ausschnitt aus dem Hauptlogo ohne Schrift, 44 px, mobil 36 px). Dekorativ (`alt=""`), der Name steht im `h1`.
- **Wortmarke** „Mountain Radar“ als `h1`, gesperrte Großbuchstaben, Inter 600, Farbe `--mr-link` (Deep Alpine Blue, im Dunkelmodus hell).
- **Claim** „ALPINE RISK INTELLIGENCE“, 12 px, gesperrt, Farbe `--mr-success` (Mountain Green, im Dunkelmodus heller).
- **Slogan** „Know before you go.“, gedämpft (`--mr-text-muted`); Desktop rechts, mobil in einer eigenen Zeile unter der Wortmarke.

Klassen: `.mr-header`, `.mr-brand` (`__emblem`, `__text`, `__name`, `__claim`), `.mr-header__slogan`. Der Text ist HTML (nicht im Bild), damit er skaliert, übersetzbar ist und die Inter-Schrift verwendet.

Regeln:

- **Keine Navigation, keine Aktionen im Header**, solange es keine weiteren Bereiche gibt. Nichts darf Funktionen vortäuschen (keine toten Links, keine Buttons ohne Funktion, keine Platzhalter). Kommt ein echter Bereich hinzu, wird die Navigation als `nav` mit nur existierenden Zielen ergänzt.
- Der Header zeigt keine Daten (Uhrzeit, Status): Datenstatus gehört in die Statusleiste (D5).
- Das Hauptlogo (`mountain-radar-main-hauptlogo.svg`) bleibt für Material außerhalb der App (README, Social Preview). In der App wird nur das Emblem verwendet, weil die Wortmarke im Hauptlogo als SVG-Text mit Fallback-Schriften gesetzt ist.

---

# Datenstatus-Leiste (seit D5)

Schmale Zeile direkt unter dem Header (`.mr-statusbar`, Fläche `--mr-bg`, unten 1 px Linie). Sie schafft Vertrauen, indem sie je Datenquelle zeigt, ob und wann Daten geladen wurden. Aufbau je Eintrag: Punkt (Zustand), Name als `.mr-label`, Text mit dem echten Wert; Liste als `.mr-cluster`. Mobil läuft die Leiste einzeilig horizontal (Name über Wert, scrollbar, per Tastatur fokussierbar).

Reihenfolge: Sperrungen & Hinweise, Schutzgebiete, Lawinenlage, Wetter (wie im Menü „Karten & Layer“).

| Zustand (`data-state`) | Punkt | Bedeutung | Beispiel |
|---|---|---|---|
| `ok` | grün (`--mr-success`) | erfolgreich geladen | „1.245 Einträge · Stand heute 06:51“ |
| `limited` | gelb (`--mr-notice`) | geladen, aber eingeschränkt | „Kein aktueller Bericht · zuletzt 02.05.“ |
| `unavailable` | grau (`--mr-text-muted`) | nicht verfügbar oder noch nicht geladen | „nicht abrufbar“, „wird beim Einblenden geladen“ |
| `loading` | grauer Ring | wird gerade geladen | „wird geladen …“ |
| `error` | rot (`--mr-closure`) | Ladefehler, der auch sonst als Fehler angezeigt wird | „nicht verfügbar“ |

Regeln:

- **Nur echte Werte.** Anzahl, Zeitstempel und Berichtsstatus kommen aus den geladenen Daten, sonst steht nichts oder der ehrliche Ladezustand da. Keine Standardtexte, keine geschätzten oder simulierten Zeiten. Fehlt ein Zeitstempel (Schutzgebiete), wird nur die Anzahl gezeigt.
- **Rot nur dort, wo es heute schon eine rote Fehleranzeige gibt** (Sperrungen: Datei nicht ladbar; Lawinenlage: Quelle nicht ladbar). Fehler ohne rote Anzeige (Wetter, Schutzgebiete) sind grau.
- Der Zustand steht zusätzlich als Text für Screenreader (`.mr-visually-hidden`); Farbe ist nie der einzige Hinweis, der Wert steht immer daneben.
- Module melden mit `setSourceStatus(id, state, text)` (`js/status_bar.js`); Zustand und Text berechnet `js/status_bar_logic.js` (rein, getestet mit `scripts/test_status_bar_logic.html`).
- Welche Quelle welchen Zeitstempel liefert: DATENQUELLEN.md, Abschnitt „Zeitstempel und Datenstatus“.

---

# Visuelle Prioritäten

1. Orientierung vor Dekoration
2. Klarheit vor visuellem Aufwand
3. Risikowahrnehmung durch konsistente Farb- und Musterlogik
4. Lesbarkeit in der Karte und im UI
5. Funktionalität und Sicherheit vor Design-Exzess

---

# Zusammenfassung

Mountain Radar verwendet ein hochwertiges, alpine, robuste und professionelle Farb- und Gestaltungssprache: Deep Alpine Blue als Kernfarbe, Mountain Green als sekundärer Akzent, zusammen mit klaren Warnfarben und einer stark funktional ausgerichteten Kartendarstellung. Ziel ist eine visuelle Sprache, die in kritischen Momenten schnell verständlich und verlässlich wirkt.