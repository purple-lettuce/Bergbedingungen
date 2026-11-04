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

- ruhige Basisfarben für Hintergrundkarten (seit D12 per Sättigungsfilter, siehe „Gedämpfte Kartenoptik“)
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
| `--mr-shadow-sm` / `-md` | siehe `style.css` | Bedienfeld (`-sm`); `-md` für schwebende Karten (D10) |
| `--mr-shadow-up` | `0 -4px 16px` (hell .18, dunkel .6) | Schatten nach oben für Sheets am unteren Rand (D11) |
| `--mr-scrim` | `rgba(0,0,0,.45)` (dunkel .65) | Abdunklung hinter dem Layer-Sheet (D11) |

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
| `.mr-button` (`--primary`) | Link, der wie ein Primärbutton aussieht (Navigation, nicht Aktion auf der Karte): Deep Alpine Blue, weiße Schrift, mind. 44 px hoch, Rand `--mr-link` | Landing Page (LP1) | `--mr-primary`, `--mr-primary-hover`, `--mr-on-primary`, `--mr-link`, `--mr-radius-md`, Abstände |
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
| Seitenleistenkarten „Wetter“ und „Sperrungen und Hinweise“ (`app.html`, `js/weather.js`, `js/closures.js`) | seit D6 vollständig auf D3-Komponenten (siehe „Seitenleisten-Karten“) |
| Inline-Styles in `app.html` (3) und `js/weather.js` (1) | durch `.mr-mt-*`, `.mr-mb-0` bzw. die Regel `#status` ersetzt; Abstände 10 px → 12 px (Skala), 2 px mehr Luft über Schaltflächen und Statuszeile |
| Layer-Panel „Karten & Layer“ (`js/layer_panel.js`) | seit D7 auf D3-Komponenten (siehe „Layer-Panel“); `kl-*`-Klassen bleiben als Haken für Tests und Layout |
| Schutzgebiets-Popups (`js/protected_areas_popup.js`) | seit D8a auf D3-Komponenten (siehe „Schutzgebiets-Popup“) |
| Lawinenlage-Popups (`js/avalanche_popup.js`) | seit D8b auf dem Gerüst von D8a (siehe „Lawinenlage-Popup“) |
| Popups der Sperrungen und Hinweise (`js/closures.js`) | seit D8c auf dem gemeinsamen Popup-System (siehe „Sperrungen- und Hinweise-Popup“); die alten `.badge`-Klassen sind entfernt |
| Legendeninhalte (`.pa-*`, `.av-*`) | Zeilen unverändert; seit D9 zusätzlich als kompakte Legendenkarte (siehe „Legendenkarte“), die Farbfelder selbst sind bewusst nicht migriert |
| Inline-Styles in Popups | seit D8c in keinem Popup mehr (außer den datengetriebenen Farben des Kopf-Farbfelds der Schutzgebiete) |
| Inline-Styles in Schutzgebiets-Popups (3× `margin`) | seit D8a entfernt; bleiben nur die Farben des Kopf-Farbfelds (datengetrieben) |
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

# Schutzgebiets-Popup (seit D8a)

Nur Popups der Schutzgebiete; Inhalt, Reihenfolge und Texte sind unverändert (alle Namen, Beschreibungen, Wildlife- und Regeltexte aller 2551 Gebiete vorher/nachher gleich geprüft). Das Popup trägt `className: "mr-popup"` und folgt wie die Seitenleiste dem Hell-/Dunkelmodus; die übrigen Popups bleiben bis D8b/D8c hell.

| Bereich | Komponenten |
|---|---|
| Rahmen | `.mr-popup` (Fläche `--mr-surface`, Radius `md`, Schatten `--mr-shadow-md`), Inhalt `.pa-pop` + `.mr-stack` |
| Kopf | Farbfeld der Kategorie (`.pa-sw`, wie in der Legende), Name als `h3`, Schutzgebietstyp als `.mr-label` |
| Beschreibung | gedämpfter Text (`--mr-text-sm`) |
| Abschnitte | `h4.mr-label` („Wildlife“, „Pflanzen und Lebensräume“, „Regeln“), getrennt durch eine Linie |
| Wildlife | `.mr-cluster` aus Schildern mit Symbol und Name; „und n weitere“ gestrichelt |
| Regeln | Zeile mit Themensymbol, `.mr-badge` (Verbot = `--closure`, Eingeschränkt = `--notice`, Erlaubt = `--success`, sonstige ohne Schild), Regeltext, Zeitraum in eigener Zeile; farbiger Rand wie bisher |

Der Styleguide-Wunsch „Kopfbereich in Deep Alpine Blue“ wird bewusst nicht umgesetzt (Informationen strukturieren, nicht dekorieren). Der gemeinsame Rahmen für D8b/D8c (`mr-popup`, `.pa-pop-head`) ist die Vorlage.

# Sperrungen- und Hinweise-Popup (seit D8c)

Gleiches Gerüst wie die Popups der Schutzgebiete (D8a) und der Lawinenlage (D8b), keine dritte Variante. Alle Popups von Mountain Radar tragen `mr-popup` und folgen Hell und Dunkel. Ein Wetter-Pin-Popup gibt es nicht (der Pin ist nicht anklickbar, die Wetterwerte stehen in der Seitenleisten-Karte); dafür wurde nichts angelegt.

| Bereich | Komponenten |
|---|---|
| Rahmen | `className: "mr-popup"`, Inhalt `.pa-pop.mr-stack` |
| Kopf | `.pa-pop-head`: Statuspunkt (`.dot`, gleiche Farbe wie der Pin auf der Karte: Sperrung `--closure`, Hinweis `--notice`, geplant `--upcoming`) und Titel (`h3`) |
| Art und Status | `.mr-badge` im `.mr-cluster`: **Sperrung** (`--closure`) oder **Hinweis** (`--notice`), dazu **Aktuell** (`--success`) oder **Geplant** (`--upcoming`) |
| Beschreibung | Fließtext |
| Angaben | `.mr-kv` (Zeitraum, Betrifft, Quelle) nur für vorhandene Felder |

**Farben und Status** sind unverändert: dieselben Tokens und dieselbe Zuordnung wie vor D8c (das Schild trägt die Art, nicht den Status; ein geplanter Eintrag zeigt zusätzlich „Geplant“). Die Liste in der Seitenleiste nutzt dieselben Schilder. Die Zeile „Zeitraum“ hat jetzt eine Beschriftung, der Inhalt ist gleich.

# Lawinenlage-Popup (seit D8b)

Migration auf das Gerüst des Schutzgebiets-Popups, keine zweite Variante. Beide Popups tragen `mr-popup` (Fläche, Radius, Schatten, folgt Hell/Dunkel) und `pa-pop` + `mr-stack`. Inhalt, Reihenfolge, Texte, Links, Piktogramme (Gefahrenstufen, Lawinenprobleme, Höhenbereich, Exposition) und alle Berichtszustände (gültig, abgelaufen, kein Bericht) sind unverändert; geprüft für alle Regionen beider Quellen in allen vier Zuständen.

| Bereich | Komponenten |
|---|---|
| Rahmen | `className: "av-popup mr-popup"` (Marker und Fläche), Inhalt `.av-pop.pa-pop.mr-stack` |
| Kopf | `.pa-pop-head`: Gefahrenstufen-Chip (`.av-chip` mit `.av-lv*`) als Symbol, Region (`h3`), Stufenname als Typzeile; darunter Kennung und Quelle gedämpft |
| Abschnitte | `h4.mr-label` mit Trennlinie (Gültigkeit, Zusammenfassung, Gefahrenstufe nach Höhe, Lawinenprobleme, Lagetexte, Tendenz, Gefahrenmuster) |
| Lawinenproblem | `.mr-card--tight` mit Kopfzeile (Piktogramm, Name) und `.mr-kv` für Höhenbereich, Exposition, Stabilität, Gefahrenstellen, Größe |
| Hinweisbox (kein Bericht, abgelaufen) | `.mr-card--tight` mit Rand `--mr-notice` (nur im Popup; die Legende behält ihre Box) |
| Fußzeile | `.mr-text-muted .mr-text-sm`, Links `--mr-link` |

**Farben:** Die Gefahrenstufenfarben (`.av-lv1` bis `.av-lv5`, Skala der Europäischen Gefahrenskala) und die Chips sind unverändert und haben Vorrang vor Tokens. Die blauen Flächen in Rose und Höhenbereich sind Teil der Piktogramme und bleiben ebenfalls.

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
| Legenden | ausführliche Fassung als einklappbare Abschnitte, Inhalt und Logik unverändert; kompakte Fassung als Legendenkarte (siehe unten) |

Touch-Ziele: Kopf, Abschnittstitel, Schalter und Segmente mindestens 44 px bei `pointer: coarse` und im mobilen Layout (bis 820 px) immer; die Filterschalter (.kl-filter .mr-switch) sind seit D11 ebenfalls 44 px hoch (vorher 24 px). Mobile Darstellung des Bedienfelds: siehe 

## Legendenkarte (seit D9)

Kompakte Legende als eigenes Kartenelement unten rechts (`.mr-card.mr-card--raised.kl-card`, Leaflet-Control `bottomright`). Sie zeigt nur die Legenden **eingeblendeter** Ebenen (Abschnitt je Ebene mit `.mr-label`-Titel und denselben Zeilen `.pa-list` wie die ausführliche Legende) und ist ganz verborgen, wenn keine Ebene Inhalt hat. Der Kopf „Legende“ ist ein Knopf mit `aria-expanded`/`aria-controls`; die Karte ist unter 1200 px zunächst eingeklappt, weil sie dort aufgeklappt Abschnitte des Bedienfelds überdecken würde; ab 1200 px steht sie im Dock unter dem Bedienfeld und ist zunächst offen (siehe „Layout mit schwebenden Karten“, D10). Schnittstelle: `addLegend(...)` liefert zusätzlich `setCompact(html | Node)`; die Legenden-Module füllen sie aus denselben Daten wie die ausführliche Fassung. Lawinenlage: nur die Gefahrenstufen, und nur wenn ein aktueller Bericht vorliegt. Im Bedienfeld bleibt die ausführliche Variante mit Quellen, Hinweisen und Höhenwahl.

# Gedämpfte Kartenoptik (seit D12)

Die Grundkarte tritt zurück, damit Schutzgebiete, Lawinenlage und Sperrungen die Aufmerksamkeit bekommen. Umsetzung nur per CSS-Filter auf den Kacheln der Grundkarte: keine neue Kartenquelle, keine Satelliten- oder Hybridkarte, keine Änderung an Layerdaten, Layerfarben oder Lawinenfarben.

| Baustein | Beschreibung |
|---|---|
| Hook | `className` der beiden Kachelebenen in `js/map.js`: `mr-basemap mr-basemap--osm` und `mr-basemap mr-basemap--topo` (Leaflet setzt sie am Container der Kachelebene) |
| Filter | Tokens `--mr-map-filter-osm` und `--mr-map-filter-topo` in `style.css`, einzeln für Hell und Dunkel; angewendet in `.mr-basemap--osm` und `.mr-basemap--topo` |
| Hell | OSM `saturate(.55) brightness(1.02)`, Topo `saturate(.5) brightness(1.03)` |
| Dunkel | OSM `saturate(.55) brightness(.82) contrast(1.05)`, Topo `saturate(.5) brightness(.82) contrast(1.05)` (Helligkeit und Kontrast wie vor D12, neu ist die Sättigung) |

Regeln:

- **Warum Sättigung:** Sie nimmt der Karte die Buntheit (OSM-Grünflächen, Topo-Höhenfarben und Schummerung), ohne Helligkeitsunterschiede zu verändern. Labels, Straßen und Höhenlinien unterscheiden sich vor allem durch Helligkeit und bleiben dadurch lesbar. Topo ist von Haus aus deutlich bunter und wird stärker gedämpft.
- **Kein Kontrastfilter im Hellmodus, kein Weichzeichner:** Der Kontrast der Beschriftung bleibt erhalten. Im Dunkelmodus bleibt `contrast(1.05)` aus der Zeit vor D12.
- **Nur die Grundkarte:** Der Filter liegt auf den Kachelebenen, nicht auf dem Kartencontainer oder der Tile-Pane. Overlays, Pins, Popups und Bedienelemente haben eigene Panes und werden nicht verändert.
- **Neue Grundkarte:** erhält dieselbe Klassenform (`mr-basemap mr-basemap--<name>`) und ein Filtertoken für Hell und Dunkel; ohne Filtertoken bleibt sie ungedämpft.
- **Leistung:** Ein Filter je Kachelebene (eine Compositing-Ebene). Gemessen in Headless-Chrome mit Software-Rendering beim Verschieben der Karte: im Mittel +1 bis 2 ms je Frame (rund 17 auf 19 ms), keine Ruckler. Rückbau: Tokens auf `none` setzen.
- **Nachweis:** Vorher/Nachher-Bilder (Hell und Dunkel, OSM und Topo, mit Schutzgebieten, Sperrungen und Lawinenlage) in `docs/design/d12/`.

Nicht umgesetzt: Dämpfung der Overlays selbst (Layerfarben bleiben), Kartenstil „Hybrid/Satellit“, einstellbare Stärke.

# Layout mit schwebenden Karten (seit D10)

Ab 1200 px Breite und mit `<body class="mr-floating">` ist die Karte die ganze Fläche zwischen Statusleiste und Fußzeile (`#map` absolut in `main`), alle weiteren Bedienelemente schweben darüber. Darunter gilt das klassische Layout (821 bis 1199 px: Karte neben 400-px-Seitenleiste); bis 820 px gilt das mobile Layout (siehe „Mobiles Layout und Bottom Sheet“, D11). Zurückrollen: Klasse aus `app.html` entfernen.

| Bereich | Umsetzung |
|---|---|
| Linke Spalte | `main > aside`, 360 px, Abstand `--mr-space-lg` zum Rand und zwischen den Karten; Rahmen ohne Fläche und ohne Mausereignisse (`pointer-events: none`), nur die Karten fangen sie, die Karte dazwischen bleibt bedienbar. Karten: `.mr-card` mit `--mr-radius-lg` und `--mr-shadow-md`. Wetter hat feste Höhe, „Sperrungen und Hinweise“ ist so hoch wie nötig, die Liste scrollt in der Karte. |
| Dock rechts | `.kl-dock` (ein Leaflet-Control `topright`, 320 px): Bedienfeld `.kl-panel` und Legendenkarte `.kl-card` untereinander. |
| Zoom | rechts neben der linken Spalte. |
| Quellenangabe | Leaflet-Attribution bleibt unten rechts; das Dock endet darüber. |
| Fußzeile | unverändert unter der Karte. |

**Strategie Bedienfeld und Legende:** Beide sind gekoppelt (ein Dock) und gleich gestaltet: gleiche Breite, Fläche (`--mr-surface`, Rahmen, `--mr-radius-lg`, `--mr-shadow-md`) und gleiche Kopfzeile (`--mr-primary`, Mikro-Label-Schrift, Pfeil). Das Bedienfeld gibt bei Platzmangel nach (scrollt), die Legende bleibt sichtbar; so können sie sich nicht überlagern, ohne die Höhen fest zu verdrahten. Die Legendenkarte ist im Dock zunächst offen und weiter einklappbar. Schnittstelle (`addLegend`, `setCompact`, …) und Verhalten bleiben gleich; `js/layer_panel.js` verschiebt das Legendenelement beim Wechsel über 1200 px zwischen Dock und eigenem Kartenelement unten rechts.

Regeln:

- **Flächen deckend**, kein `backdrop-filter`, keine Transparenz: Text ist auf jeder Kartenfarbe lesbar (AA), Hell und Dunkel nur über Tokens.
- **Popups und Autopan:** `js/layout.js` setzt `autoPanPaddingTopLeft`/`BottomRight` für alle Popups auf die Breite der verdeckten Streifen (über `L.Popup.mergeOptions`, gilt auch für gebundene Popups). Der Sprung zu einem Listeneintrag hält denselben Abstand. Neue Popups brauchen dafür nichts.
- **Kartengröße:** Leaflet folgt der Fenstergröße; zusätzlich ruft ein `ResizeObserver` `invalidateSize({ pan: false })`, wenn sich der Container ohne Fensterereignis ändert.
- **Position von Leaflet:** `#map` hat im Stylesheet ausdrücklich `position: relative`, sonst setzt Leaflet es inline und überschreibt die Positionierung im neuen Layout.
- **Kein Maßstab:** Die Anwendung hat keinen; er wird nicht nachgerüstet, solange es keine eigene Funktion dafür gibt.
- **Neue schwebende Elemente** gehören in die linke Spalte oder in das Dock, nie als eigenes Kartenelement an den Rand (Überlagerung).
- Test: `scripts/test_layout.html` (in `scripts/run_js_tests.py`) prüft Anordnung, Überlagerung, Zoom und Autopan bei 1440, 1000 und 390 px. Der Wechsel über 1200 px bei laufender Seite wird im Headless-Browser nicht ausgewertet und ist von Hand zu prüfen.

# Mobiles Layout und Bottom Sheet (seit D11)

Bis 820 px Breite (Smartphones und Tablets hochkant; gleiche Grenze in `style.css` und `MOBILE_QUERY` in `js/layout.js`) wirkt Mountain Radar wie eine Karten-App: Die Karte füllt den Raum unter Header und Statusleiste, es gibt keinen Seitenscroll. Desktop (ab 821 px) ist unverändert. Rückbau: `git revert` des D11-Commits (kein Schalter wie bei D10, weil der alte Mobilzustand mit gestapelter Seitenleiste ersetzt wurde).

| Bereich | Umsetzung |
|---|---|
| Seite | `body` 100 dvh, `html, body, main` mit `overflow: clip` (Rückfall `hidden`): Die Seite scrollt nie, auch nicht programmatisch (`scrollIntoView`). `#map` absolut in `main`. |
| Header | kompakt (Emblem 36 px); Slogan bis 560 px ausgeblendet. |
| Statusleiste | eine Zeile, mind. 44 px, scrollt für sich (siehe „Datenstatus-Leiste“). |
| Seitenleiste | `main > aside` ist das **Bottom Sheet** (`js/sheet.js`): Wetter und Sperrungen unverändert darin, Fußzeile (Quellenangaben) am Ende des Sheets. |
| Bedienfeld „Karten & Layer“ | Knopf oben rechts (`.kl-head`, 44 px); aufgeklappt ein **Sheet über der Karte** (`.kl-dock.is-open`), unten, volle Breite, höchstens 85 % hoch, Abdunklung `--mr-scrim` dahinter, Kopf mit „✕“. Schließen: Kopf, Tippen auf die Abdunklung, Esc. Der Inhalt (Layer, Kartenstil, Filter, Legenden) ist unverändert und scrollt im Sheet. |
| Legendenkarte | bleibt Kartenelement unten rechts, zunächst zu; steht über dem Bottom Sheet, höchstens 30 vh hoch. |
| Zoom | 44-px-Knöpfe oben links; im Zustand „full“ ausgeblendet (die Karte ist dann verdeckt). |
| Popups | `.mr-popup`: höchstens Kartenbreite minus Rand, Höhe auf den freien Kartenbereich begrenzt (`--mr-popup-max-h`), Inhalt scrollt im Popup, Schließen-Knopf 44 px. |

**Bottom Sheet:** Drei Zustände (`main[data-sheet]`, Höhe in `--mr-sheet-h`):

| Zustand | Höhe | Zweck |
|---|---|---|
| `peek` | nur Griff und Titel „Wetter und Sperrungen“ (56 px; höher, solange ein Warnhinweis `#warn` sichtbar ist, der bleibt immer lesbar) | Start; die Karte bleibt das dominierende Element |
| `half` | halbe Kartenhöhe (mind. Peek + 88 px) | Wetter und Anfang der Liste |
| `full` | Kartenhöhe minus 56 px (oben bleibt ein Kartenstreifen für den Layer-Knopf) | Liste lesen, suchen |

Bedienung: Wischen am Griff (rastet am nächsten Zustand ein, bei schneller Geste in Richtung der Geste), Tippen auf den Griff (`peek` ↔ `half`), Pfeiltasten am Griff, Esc. Der Griff ist ein `button` mit `aria-expanded`/`aria-controls`; im Zustand `peek` sind die Karten und die Fußzeile `inert` (nicht fokussierbar, nicht vorlesbar). Der Inhalt scrollt im Sheet, der Griff bleibt oben (`position: sticky`). Berechnung der Höhen und Zustände: `js/sheet_logic.js` (rein, getestet).

**Entscheidungen:**

- **Die Seitenleiste ist das Sheet, kein zweites Panel:** Es wird nichts dupliziert oder neu gebaut; `aside` bekommt nur eine andere Rolle. Keine neue Funktion, keine neuen Daten, kein neuer Inhalt.
- **Höhe statt `transform`:** Das Sheet ändert seine Höhe (Übergang 0,25 s, bei `prefers-reduced-motion` keiner). So scrollt der Inhalt in jedem Zustand und nichts liegt unerreichbar unter dem Bildschirmrand.
- **Ziehen nur am Griff:** Der Inhalt scrollt normal; eine Wischgeste im Inhalt bewegt das Sheet nicht (kein Konflikt zwischen Scrollen und Ziehen).
- **Die Karte hat Vorrang:** Ein Klick auf einen Eintrag der Liste lässt das Sheet auf `peek` zurückgehen, bevor die Karte dorthin zoomt und das Popup öffnet. Die Ränder für Zoom und Autopan stammen aus der Zielhöhe des Sheets (nicht aus der Höhe mitten im Übergang).
- **Popups:** `js/layout.js` hält die Ränder für Autopan (oben 106 px für Zoom und Knopf, unten Sheet plus Legendenkarte und Quellenangabe) und die Höhe des Popup-Inhalts aktuell, auch wenn sich die Quellenangabe ändert (z. B. bei eingeblendeter Lawinenlage).
- **Fußzeile im Sheet:** Die Quellenangaben sind lang (bis zu 10 Zeilen) und würden unter der Karte Platz wegnehmen. Mobil stehen sie am Ende des Sheets, die Kartenquelle (OSM/Leaflet) bleibt als Leaflet-Attribution über dem Sheet. Beim Wechsel über 820 px zieht die Fußzeile zurück unter die Karte.
- **Bedienfeld verschiebt sich:** Mobil sitzt `.kl-dock` in `main` (nicht im Leaflet-Kartenelement), damit die Abdunklung das Bottom Sheet überdeckt (Stapelreihenfolge); beim Wechsel zurück zieht es wieder ins Kartenelement.
- **Touch-Ziele 44 px immer** (nicht nur bei `pointer: coarse`): Schalter, Segmente, Abschnittstitel, Filter-Schalter, „Alle“/„Keine“, Schaltflächen und Suchfeld im Sheet, Griff, Layer-Knopf, Legendenkopf, Zoom, Schließen-Knopf der Popups, Statusleiste. **Ausnahme:** Links im Fließtext (Quellenangaben, Links in Popups, Leaflet-Attribution) sind Inline-Links (WCAG 2.5.8, Ausnahme „im Satz“).

**Bewusst unverändert:** Inhalte, Reihenfolge und Texte von Wetter, Sperrungen, Suche, Layern, Filtern, Legenden und Popups; Datenmodelle, APIs, Layer-, Such-, Wetter-, Schutzgebiets- und Lawinenlogik; Desktop (ab 821 px; Geometrie und berechnete Stile gegen `main` verglichen); der Kartenstil (D12) und die Suche (D13). Nicht gelöst: Smartphones quer mit mehr als 820 px Breite nutzen das klassische Layout wie zuvor. Sehr niedrige mobile Fenster (z. B. 667 × 375 quer) sind nutzbar, aber eng: Popups scrollen dort stark und die Legendenkarte kann sie teilweise überdecken. Sicherheitsabstände (Notch, Home-Indikator) sind nicht umgesetzt (`viewport-fit=cover` fehlt bewusst).

Test: `scripts/test_layout.html` (Anordnung, Überlauf, Zustände inkl. Wischgeste, Layer-Sheet, Touch-Ziele, Popup-Lage bei 390 und 320 px, Grenze 820/821 px) und `scripts/test_sheet_logic.html` (Berechnung), beide in `scripts/run_js_tests.py`.

---

# Header (seit D4)

Der Header ist eine ruhige, weiße App-Shell (Fläche `--mr-surface`, unten 1 px `--mr-line`; im Dunkelmodus dunkle Fläche). Er besteht aus:

- **Emblem** (`docs/design/mountain-radar-emblem.svg`, Ausschnitt aus dem Hauptlogo ohne Schrift, 44 px, mobil 36 px). Dekorativ (`alt=""`), der Name steht im `h1`.
- **Wortmarke** „Mountain Radar“ als `h1`, gesperrte Großbuchstaben, Inter 600, Farbe `--mr-link` (Deep Alpine Blue, im Dunkelmodus hell).
- **Claim** „ALPINE RISK INTELLIGENCE“, 12 px, gesperrt, Farbe `--mr-success` (Mountain Green, im Dunkelmodus heller).
- **Slogan** „Know before you go.“, gedämpft (`--mr-text-muted`); rechts im Header, auf Smartphones (bis 560 px) ausgeblendet, damit die Karte mehr Platz hat (D11; Name und Claim bleiben).

Klassen: `.mr-header`, `.mr-brand` (`__emblem`, `__text`, `__name`, `__claim`), `.mr-header__slogan`. Der Text ist HTML (nicht im Bild), damit er skaliert, übersetzbar ist und die Inter-Schrift verwendet.

Regeln:

- **Keine Navigation, keine Aktionen im Header**, solange es keine weiteren Bereiche gibt. Ausnahmen: die globale Suche (seit D13, siehe „Globale Suche“), weil sie eine echte Funktion ist, und die Marke selbst, die in der Anwendung als Link zur Startseite dient (seit LP1, `a.mr-brand`, Ziel `./`). Die Startseite verwendet denselben Header ohne Suche und ohne Slogan (siehe „Landing Page“). Nichts darf Funktionen vortäuschen (keine toten Links, keine Buttons ohne Funktion, keine Platzhalter). Kommt ein echter Bereich hinzu, wird die Navigation als `nav` mit nur existierenden Zielen ergänzt.
- Der Header zeigt keine Daten (Uhrzeit, Status): Datenstatus gehört in die Statusleiste (D5).
- Das Hauptlogo (`mountain-radar-main-hauptlogo.svg`) bleibt für Material außerhalb der App (README, Social Preview). In der App wird nur das Emblem verwendet, weil die Wortmarke im Hauptlogo als SVG-Text mit Fallback-Schriften gesetzt ist.

---

# Globale Suche (seit D13)

Die globale Suche ist ein Suchfeld im Header mit gruppierter Trefferliste. Sie arbeitet **nur mit bereits geladenen Daten**: kein Netzwerkzugriff, keine Ortssuche, keine Gipfel- oder Adresssuche, kein Geocoding, kein Nominatim.

**Platz (Entscheidung):** im Header, zwischen Wortmarke und Slogan (Desktop, max. 420 px breit); mobil (bis 820 px) in einer eigenen Zeile unter Name und Claim, volle Breite. Begründung: Der Header ist in jedem Layout sichtbar (schwebende Karten ab 1200 px, klassisches Layout, Bottom Sheet), konkurriert mit keiner Karte und keinem Bedienelement der Karte und verdeckt keine Kartenfläche. Verworfen: Seitenleiste (mobil im Zustand „peek“ verdeckt), Kartenelement oben links (Zoom und schwebende Karten, mobil Zoom und Layer-Knopf). Das bestehende Textfeld „Sperrungen und Hinweise“ in der Seitenleiste bleibt unverändert: Es filtert Liste und Karte, die globale Suche springt zu einem Treffer.

**Durchsucht wird:** Schutzgebiete (Name und Kategorie; Flächen gleichen Namens und gleicher Kategorie sind ein Treffer), Sperrungen (Name und Beschreibung, Typ `CLOSURE`) und Hinweise (Name und Beschreibung, Typ `NOTICE`). Abgelaufene Einträge sind wie in der Liste ausgenommen, geplante (noch nicht gültige) Einträge erscheinen mit „Geplant“. Die Schalter im Filter („Sperrungen“, „Hinweise“, „Geplant“) und das Textfeld der Liste beeinflussen die Suche nicht. **Nicht durchsucht:** Lawinenlage (Warnregionen, keine Orte), Wetter, Regeln und Wildlife der Schutzgebiete, Orte, Gipfel, Routen, Adressen.

**Vergleich:** ohne Groß-/Kleinschreibung und Akzente („otztal“ findet „Ötztal“, „weisseck“ findet „Weißeck“); alle Wörter müssen vorkommen; ab 2 Zeichen. Reihenfolge je Gruppe: Name beginnt mit der Eingabe, Name enthält sie, alle Wörter im Namen, Wörter in Name und Zusatztext; dann kürzerer Name, dann alphabetisch.

**Trefferliste:** Gruppen „Schutzgebiete“, „Sperrungen“, „Hinweise“ (Mikro-Titel `.mr-label` mit Gesamtzahl), je Gruppe höchstens 5 Treffer und die Zeile „und n weitere, Suchbegriff genauer eingeben“. Treffer: Name (Inter 600) und eine Zeile Meta (Kategorie bzw. Zeitraum, gedämpft). Leere Gruppen entfallen. Leere Eingabe: Hinweistext mit Mindestlänge. Ohne Treffer: „Keine Treffer für …“. Daten noch nicht geladen: „Noch nicht geladen: …“. Fläche `--mr-surface`, Rand `--mr-line`, Schatten `--mr-shadow-md`, über Karte, Dock und Sheet (`z-index: 2000`), höchstens 70 vh (mobil 60 vh), scrollt für sich.

**Klick auf Treffer:** vorhandenes Verhalten. Sperrung oder Hinweis: derselbe Sprung wie ein Klick in der Liste (`focusRecord`: Ausschnitt, Popup, Wetter für den Ort; ist der Eintrag durch Filter oder Listenfilter ausgeblendet, öffnet ein eigenes Popup mit demselben Inhalt). Schutzgebiet: Ausschnitt auf die Flächen, Popup mit demselben Inhalt wie ein Klick auf die Fläche (auch wenn Kategorie oder Ebene ausgeblendet sind; die Ebenen werden nicht verändert). Der Ausschnitt hält Abstand zu schwebenden Karten und Bottom Sheet (`fitPadded` in `js/layout.js`, mobil gibt `revealMap()` zuvor die Karte frei).

**Bedienung:** Combobox mit Listbox (`role="combobox"`, `aria-expanded`, `aria-controls`, `aria-activedescendant`, Gruppen als `role="group"`). Fokus oder Tippen öffnet die Liste; Pfeil ab/auf wählt (mit Umlauf), Enter öffnet den gewählten Treffer (ohne Auswahl den ersten), Esc schließt die Liste und lässt den Text stehen (zweites Esc leert das Feld, nativ). Klick oder Tipp auf einen Treffer öffnet ihn; danach verliert das Feld den Fokus (mobil verschwindet die Tastatur). Der Fokus bleibt beim Klick in die Liste im Feld. Mobil mindestens 44 px für Feld und Treffer. **Kein ⌘K, keine Command Palette, kein globaler Tastaturkürzel** (ein Hinweis darauf erst mit echtem Shortcut).

Klassen: `.mr-search` (`__input`, `__panel`, `__note`, `__list`, `__group`, `__head`, `__items`, `__option`, `__title`, `__meta`, `__more`). Module: `js/search.js` (Oberfläche, ohne Fachdaten), `js/search_logic.js` (reine Logik, `scripts/test_search_logic.html`); die Datenquellen liefern `closures.js` und `protected_areas.js`.

**Später (nicht Teil von D13):** Orts-, Gipfel- und Adresssuche brauchen Geocoding (z. B. Nominatim mit Nutzungsrichtlinie oder eine eigene Gipfeldatenquelle). Das ist eine neue Datenquelle mit Lizenz- und Datenschutzfrage und ein eigenes Arbeitspaket; die Quellen-Schnittstelle in `js/search.js` (`{ id, label, search(q), open(id) }`) nimmt eine weitere Gruppe ohne Umbau auf.

---

# Landing Page (seit LP1)

Die Startseite `index.html` ist ein ruhiger Hero ohne JavaScript; die Kartenanwendung liegt seit LP1 unter `app.html`. LP1 ist ein Struktur- und Layoutpaket: ein Hero, ein Link, sonst nichts. Alles Weitere (Produkterklärung, Funktionen, Datenquellen, Vision) gehört zu LP2 bis LP6 und steht bewusst nicht auf der Seite.

**Nutzerführung:** Startseite (`index.html`) → Link „Zur Karte“ → Anwendung (`app.html`). Zurück führt die Marke (Emblem und Name) im Header der Anwendung; sie ist ein echter Link nach `./`. Die Adresse der Seite (Wurzel) zeigt jetzt die Startseite; wer die Karte direkt will, nutzt `app.html`.

| Bereich | Umsetzung |
|---|---|
| Header | Derselbe Header wie in der Anwendung (`.mr-header`, `.mr-brand`: Emblem, Wortmarke als `h1`, Claim), ohne Suche und ohne Slogan. Er ist die **einzige** Markenführung der Seite; der Hero wiederholt weder Logo noch Namen noch Claim. |
| Slogan | „Know before you go.“ als große Überschrift (`.mr-hero__title`, `h2`, Inter 600, 56 px Desktop, 40 px bis 820 px, aus `--mr-text-display` abgeleitet) |
| Einleitung | ein Satz, gedämpft (`.mr-hero__lead`, `--mr-text-xl`, mobil `--mr-text-lg`): „Die aktuelle Lage für deine Tour im Alpenraum – gebündelt auf einer Karte.“ Keine Funktionsliste, keine technischen Details. |
| Aktion | genau ein Link „Zur Karte“ (`.mr-button.mr-button--primary`, siehe Komponenten); bis 560 px volle Breite. Keine zweite Aktion, keine Demo, keine Registrierung. |
| Fläche | `--mr-bg` mit einem weichen Verlauf aus `--mr-primary-soft` oben rechts; Text links, bündig mit der Marke; viel freie Fläche. Der Hero füllt die Höhe zwischen Header und Fußzeile und zentriert den Block senkrecht. |
| Fußzeile | der Hinweis aus der Anwendung: „Die Angaben ersetzen keine Tourenplanung vor Ort. Aktuelle Lage bei Hütte, Gemeinde oder Behörde prüfen.“ (keine Quellenangaben; die stehen seit LP5 im Abschnitt „Datenquellen & Transparenz“) |

**Regeln:**

- Nur Tokens und Komponenten aus diesem Styleguide, kein zweites Designsystem; die Regeln stehen im Abschnitt „Landing (LP1)“ von `style.css` und gelten nur mit `<body class="mr-landing">`. Sie nehmen die Regeln der Anwendung zurück (Seite scrollt nie, Karte füllt den Raum), damit die Seite bei niedrigen Fenstern scrollen kann.
- Hell und Dunkel folgen `prefers-color-scheme` über die Tokens, ohne eigene Dunkelwerte.
- Neue Abschnitte kommen unter den Hero; der Hero behält genau einen Link zur Karte, der Inhalt (`main`) insgesamt genau eine Aktion.
- **Navigation (LP7):** `nav.mr-nav` im Header mit `.mr-nav__list` und `.mr-nav__link` (Regeln am Ende von `style.css`). Vier Einträge: Karte (`app.html`), Alpine Risk Intelligence, Datenquellen, Über Mountain Radar (Anker auf vorhandene `h2`). Keine Unterseiten, kein JavaScript, keine festen Farben (Tokens `--mr-text`, `--mr-link`, `--mr-primary-soft`), Links mind. 44 px hoch; ≤ 820 px steht die Navigation unter der Marke. Neue Abschnitte werden nur dann aufgenommen, wenn sie ein eigenes Ziel verdienen; es gibt keine toten Links und keine leeren Ziele.

**Abschnitte seit LP2** (Regeln im Abschnitt „Landing (LP2)“ von `style.css`): `.mr-section` (`--alt` = Fläche `--mr-surface`) mit `.mr-section__inner` (max. 1080 px), Titel `.mr-section__title` (`h2`, 22 px) und Einleitung `.mr-section__lead` (`--mr-text-lg`, gedämpft, max. 56 Zeichen breit). „Was ist Mountain Radar?“ zeigt fünf `.mr-card.mr-card--raised` mit `.mr-label` als Titel (`h3`) in `.mr-feature-grid` (umbrechendes Raster, mobil eine Spalte); „Für wen?“ zeigt die Zielgruppen als `.mr-card--tight` in `.mr-pills` (`.mr-cluster`). Karten sind reine Information, ohne Link und ohne Schalter. Inhaltsregel: nur Funktionen, die die Anwendung heute hat; Risk Engine, GPX, Geländeanalyse, Routenanalyse und automatische Risikobewertung gehören zu LP4. **LP3 „Aktuelle Informationsquellen“** nutzt dieselben Bausteine (`.mr-section`, `.mr-feature-grid`, `.mr-card--raised`, `.mr-label`) ohne neue Komponente: fünf Karten mit Titel und einem Satz, nur reale Funktionen. **LP4 „Alpine Risk Intelligence“** (`--alt`) trennt Vision und Gegenwart sichtbar: drei Erklärungen (`.mr-vision-text`, `.mr-label` mit `.mr-section__lead`), dann die Zwischenüberschrift „Vision“ mit `.mr-badge.mr-badge--upcoming` („Noch nicht verfügbar“) und die Zukunftsthemen als einfache `.mr-card` in `.mr-vision-grid` (nicht `--raised`, jeder Text beginnt mit „Ziel:“). Zukunftsthemen stehen nur in diesem Abschnitt, ohne Link, ohne KI-Begriffe. **LP5 „Datenquellen & Transparenz“** nutzt wieder `.mr-feature-grid` mit `.mr-card--raised` (zusätzlich `.mr-source-grid`: die Quelle als `strong` in `--mr-text`, ein Satz gedämpft zur Aktualität; sechs Karten) und darunter einen Abschnitt „Hinweis“ (`--alt`, `.mr-notice-list` aus drei `.mr-section__lead`). Nur Quellen, die die Anwendung heute nutzt; keine Links, keine geplanten Quellen. **LP6 „Produktvision“** (normale Fläche, nach dem Hinweis) nutzt `.mr-vision-text` wie LP4 (vier `.mr-label` mit `.mr-section__lead`, ohne Karten) und endet mit einem Schlusssatz (`.mr-vision-closing`), in dem der Slogan als `strong` in `--mr-text` steht. Inhaltsregel: sachlich und in Du-Form, keine Superlative, keine Startup- oder Investorensprache, keine Sicherheitsversprechen, keine Zukunftsfunktionen, keine Aktion. Hero und Abschnitte stehen gemeinsam in `<main>`; `.mr-landing main` nimmt das Kartenraster der Anwendung zurück.
- Test: `scripts/test_landing.html` (in `scripts/run_js_tests.py`) prüft Marke, Claim, Slogan, die LP2- bis LP6-Abschnitte, die LP7-Navigation (Einträge, keine toten Links) (bei LP5 nur reale Quellen, bei LP6 keine Floskeln) (fünf Bereiche, Zielgruppen, keine Zukunftsbegriffe), genau eine Aktion im Inhalt mit erreichbarem Ziel, keine Skripte, Überlauf bei 1440, 390 und 320 px, niedriges Fenster und den Rückweg aus der Anwendung.

---

# Datenstatus-Leiste (seit D5)

Schmale Zeile direkt unter dem Header (`.mr-statusbar`, Fläche `--mr-bg`, unten 1 px Linie). Sie schafft Vertrauen, indem sie je Datenquelle zeigt, ob und wann Daten geladen wurden. Aufbau je Eintrag: Punkt (Zustand), Name als `.mr-label`, Text mit dem echten Wert; Liste als `.mr-cluster`. Mobil (bis 820 px, D11) läuft die Leiste einzeilig horizontal (Punkt, Name und Wert nebeneinander, mind. 44 px hoch, die Leiste selbst scrollt, nie die Seite; ein ausgeblendeter rechter Rand zeigt, dass sie weiterläuft; per Tastatur fokussierbar).

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