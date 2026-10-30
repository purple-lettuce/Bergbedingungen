# Mountain Radar — Design-Migrationsplan

> Status: Plan (kein Code geändert). Stand: 30.10.2026.
> Ziel: Die Oberfläche in kleinen, einzeln mergebaren PRs an die Design Vision annähern, ohne Rewrite.

## 1. Grundlagen und Einschränkungen

Referenzmaterial in `docs/design/`:

| Datei | Inhalt |
|---|---|
| `mountain-radar-desktop-mockup.svg` | Desktop-Mockup 1920×1080 (Hauptreferenz dieses Plans) |
| `mountain-radar-app-icon-m.svg` | Quadratisches App-Icon (SVG): „M“ mit Bergkamm und Höhenlinien, Verlauf `#16324F` → `#2F6B4F` |
| `mountain-radar-main-hauptlogo.svg` | Hauptlogo (SVG): rundes Emblem mit Bergsilhouette, Wortmarke, Claim und Slogan, Farben wie im Styleguide |
| `mountain-radar-design-vision-v1.png` | **Fehlt im Repository** (nicht auf `main`, nicht in anderen Branches). Bitte pushen. Der Plan beruht bis dahin auf dem Mockup und `STYLEGUIDE.md`. Falls die Vision vom Mockup abweicht, wird der Plan angepasst. |

Wichtige Hinweise zum Mockup:

- Es zeigt **erfundene Beispieldaten** (Courmayeur, Steinadler, „Weather confidence 92 %“, „Tour 04“). Diese dürfen nicht in die App übernommen werden (Projektregel: keine Platzhalterdaten). Übernommen werden Struktur und Optik, nicht Inhalte.
- Das Mockup enthält Funktionen, die es in der App noch nicht gibt (Routenplaner, Risikoanalyse, gespeicherte Gebiete, Konto). Diese gehören nicht in Design-PRs, sondern in Feature-Arbeitspakete (siehe Abschnitt 5).
- Kontrast: Viele Mikro-Labels im Mockup sind 10–11 px und hellgrau auf Glas. Für die Umsetzung gilt: mindestens 12 px und WCAG-AA-Kontrast (4,5 : 1). Der Text im CTA-Button ist im Mockup nicht lesbar.
- Das Mockup ist ein fester 1920-px-Entwurf. Mobile ist nicht gezeigt und wird separat entworfen.

## 2. Ist-Zustand (kurz)

- `index.html`: `header` (Titel „Bergbedingungen“), `main` als Grid (Karte | 400-px-Seitenleiste), `footer` mit Quellenangaben.
- Seitenleiste: Karten „Wetter“ und „Sperrungen und Hinweise“ (Suche, Status, Liste).
- Karte: Leaflet 1.9.4, OSM und OpenTopoMap, Bedienfeld „Karten & Layer“ (`js/layer_panel.js`) als Leaflet-Control oben rechts mit Layern, Filtern und Legenden.
- `style.css` (219 Zeilen): Tokens `--accent #1f5c4a`, `--panel`, `--line`; Schriften Barlow / Barlow Semi Condensed von Google Fonts; Radius 5–6 px; Dark Mode über `prefers-color-scheme`; ein Breakpoint bei 820 px.
- Popups: eigene Module für Schutzgebiete, Lawinenlage, Sperrungen, mit teils eigenem Markup und Inline-Styles.

## 3. Differenzanalyse

| Bereich | Heute | Design Vision | Aufwand | Abhängigkeit |
|---|---|---|---|---|
| Branding | Titel „Bergbedingungen“, kein Logo, kein Favicon | Logo, „MOUNTAIN RADAR“, Claim, Slogan | klein | Logos vorhanden |
| Farben | Grün `#1f5c4a`, helles Grau | Navy `#17374b`, Teal `#1e7464`, Salbei-Töne, Amber als Warnakzent | klein | Styleguide abgleichen (Navy `#16324F`, Grün `#2F6B4F`) |
| Typografie | Barlow, Großbuchstaben-Überschriften | Inter, gesperrte Großbuchstaben nur für Mikro-Labels | klein | Schriftentscheidung, Self-Hosting |
| App-Shell | Grüne Kopfleiste | Weißer Header mit Logo, Navigation, Uhrzeit, Avatar | mittel | Navigationsziele existieren nicht |
| Statusleiste | nicht vorhanden | Datenquellen „active“ mit Aktualisierungszeit, Systemstatus | mittel | Zeitstempel je Quelle prüfen |
| Layout | Karte + feste Seitenleiste | Vollflächige Karte, schwebende Glas-Karten | groß | Leaflet-Größen, Mobile |
| Layer-Panel | Einklappbares Control, Checkboxen | „Intelligence Layers“: Schalter, „N enabled“, Basemap als Segment-Control | mittel | Logik bleibt, nur DOM/CSS |
| Wetter-Karte | Temperatur + Tage | Temperatur, Wind, Niederschlag, Sicht | klein–mittel | Open-Meteo-Felder prüfen |
| Popups | Funktional, schlichte Optik | Kopfzeile mit Icon, Akzentbalken, Key-Value-Zeilen, Badges | mittel | ein gemeinsames Popup-Gerüst |
| Legende | Im Layer-Panel | Eigene Karte unten rechts | klein | Legenden-Module vorhanden |
| Suche | Filter der Sperrungsliste | Globale Suche (Berge, Routen, Orte), ⌘K | mittel–groß | Geocoding nur mit eigener Quelle |
| Karte | OSM/OpenTopoMap bunt | Gedämpfte, grüntonige Karte, Basemap „Hybrid/Satellit/Terrain“ | mittel | Kachellizenzen; Satellit wäre neue Quelle |
| Route / Risiko / CTA | nicht vorhanden | Route Intelligence, Risk Insights, „Analyze Route“ | groß | GPX-Import, Risk Engine (Phase 1–3) |
| Mobile | Gestapelt, Karte 60 vh | nicht gezeigt | mittel | eigener Entwurf nötig |

## 4. Priorisierter Migrationsplan

Prinzipien: Jeder PR ist allein mergebar und rückbaubar, ändert nur einen Bereich, hat Vorher/Nachher-Screenshots (Desktop und Mobil, hell und dunkel) und lässt Funktionen unverändert. Reihenfolge: erst Fundament mit kleinem Risiko, dann sichtbare Teile, zuletzt das Layout.

### Stufe A — Fundament (geringes Risiko)

**D1 — Branding-Text und Favicon** ✅ erledigt (30.10.2026)
- Umsetzung: `<title>` „Mountain Radar – Alpine Risk Intelligence“, Meta-Beschreibung, Favicon und kleines App-Icon im Header (direkt aus `docs/design/`, keine Kopie), Überschrift „Mountain Radar“, Claim und Slogan als Textzeile. Kein Layout-Umbau.
- Ursprünglicher Umfang: `<title>` „Mountain Radar“, Überschrift, Claim und Slogan im Header, Favicon aus `mountain-radar-app-icon-m.svg`, Meta-Beschreibung. Kein Layout-Umbau.
- Dateien: `index.html`, ggf. `assets/` oder `favicon`.
- Akzeptanz: Titel und Header zeigen Mountain Radar. Keine Funktionsänderung.
- Zugleich erledigt den offenen Punkt aus ROADMAP („Branding in der Anwendung“).

**D2 — Design-Tokens und Typografie** ✅ erledigt (30.10.2026)
- Umsetzung: Token-System `--mr-*` (Farben, Radien, Abstände, Schatten, Typografie) in `style.css`, Alias für alle alten Namen, Inter selbst gehostet unter `vendor/inter/`, Google-Fonts-Aufrufe entfernt. Farben aus dem Styleguide (`#16324F`, `#2F6B4F`), Mockup-Töne nur als Abstufungen. Dokumentation: STYLEGUIDE.md, Abschnitt „Design Tokens“. Entscheidungen 2 (Inter) und 3 (Styleguide-Farben) sind damit getroffen.
- Ursprünglicher Umfang: Tokens in `:root` und Dark Mode ersetzen (Navy, Teal, Salbei, Amber, Glas-Flächen, Radien 12–16 px, Schatten, Abstände). Schrift auf Inter umstellen und **selbst hosten** (kein Google-Fonts-Aufruf, datenschutzfreundlicher). Alte Token-Namen bleiben als Alias, damit nichts bricht.
- Dateien: `style.css`, Schriftdateien unter `vendor/` oder `assets/fonts/`.
- Risiko: Kontrastverlust. Prüfen mit Kontrast-Check, Warnfarben und Lawinenfarben bleiben unverändert.
- Entscheidung nötig: Inter (Mockup) oder Barlow (heute). Empfehlung Inter.

**D3 — Gemeinsame Komponenten-CSS** ✅ erledigt (30.10.2026)
- Umsetzung: Abschnitt „Gemeinsame Komponenten“ in `style.css` mit `.mr-card`, `.mr-label`, `.mr-badge`, `.mr-switch`, `.mr-kv`, `.mr-segment` und Hilfsklassen (`.mr-stack`, `.mr-cluster`, `.mr-mt-*`, …). Nur Tokens aus D2. Migriert: Seitenleistenkarten (`.mr-card`) und die Inline-Styles in `index.html` und `js/weather.js`. Dokumentation: STYLEGUIDE.md, Abschnitt „Komponenten“; Referenzseite `docs/design/komponenten.html`.
- Ursprünglicher Umfang: Klassen `.mr-card`, `.mr-label` (Mikro-Label), `.mr-badge`, `.mr-switch`, `.mr-kv` (Key-Value-Zeile), `.mr-segment`. Noch nirgends verwendet oder nur auf einer Karte als Test. Inline-Styles aus `index.html` entfernen.
- Dateien: `style.css` (oder `css/components.css`, nur wenn die Datei zu lang wird).

### Stufe B — Sichtbare Bausteine im bestehenden Layout

**D4 — Header als App-Shell**
- Umfang: Weißer Header mit Logo, Wortmarke, Claim, Slogan. Navigation nur mit existierenden Zielen („Explore“ aktiv). „Route Planner“, „Risk Analysis“, „Conditions“, „Saved Areas“ **nicht anzeigen**, bis sie existieren (keine toten Links). Avatar und Uhrzeit-Pille entfallen vorerst.
- Dateien: `index.html`, `style.css`.

**D5 — Datenstatus-Leiste**
- Umfang: Leiste unter dem Header mit Status je Quelle („Sperrungen aktualisiert 08:55“, „Schutzgebiete“, „Lawinenlage“, „Wetter“), Punkt grün/gelb/grau. Nur echte Werte: Zeitstempel aus den Daten bzw. Ladezustand.
- Dateien: neues `js/status_bar.js`, kleine Hooks in `closures.js`, `avalanche.js`, `weather.js`, `protected_areas.js`; `index.html`.
- Voraussetzung: Prüfen, welche Zeitstempel in `data/` bereits stehen. Falls nicht, in separatem Mini-PR die GitHub Action ergänzen.
- „System status: Operational“ nur, wenn aus echten Ladefehlern ableitbar.

**D6 — Seitenleisten-Karten im neuen Stil**
- Umfang: „Wetter“ und „Sperrungen und Hinweise“ auf `.mr-card` (Radius, Schatten, Mikro-Labels, Typografie). Position bleibt in der Seitenleiste.
- Wetterkarte zeigt zusätzlich Wind, Niederschlag, Sicht, falls Open-Meteo sie liefert (eigener Folge-PR D6b, kleine Datenerweiterung). Keine „Confidence“-Anzeige.

**D7 — Layer-Panel zu „Intelligence Layers“**
- Umfang: Titel, Zeile „AKTIVE OVERLAYS · N AKTIV“, Schalter statt Checkboxen, Basemap-Auswahl als Segment-Control (heute: OSM / Topo). Filter und Legenden bleiben als einklappbare Abschnitte. Deutsche Beschriftungen beibehalten.
- Dateien: `js/layer_panel.js` (nur DOM-Details), `style.css`. Die Schnittstelle zu `js/layers.js` bleibt gleich.
- Tests: Tastaturbedienung, `aria-*`, Touch-Ziele ≥ 44 px, bestehende Layer-Tests.

**D8 — Popups vereinheitlichen**
- Umfang: Gemeinsames Popup-Gerüst (Akzentbalken oben, Icon + Titel, Key-Value-Zeilen, Badges) als Helfer in `js/popup_icons.js` oder neues `js/popup_frame.js`. Umstellung in drei Schritten: D8a Schutzgebiete (Vorbild: Mockup „Wildlife Protection Area“), D8b Lawinenlage, D8c Sperrungen/Wetter-Pin.
- Risiko: Inline-Markup mit `esc()` erhalten (Sicherheit!). Popup-Breite und Scrollen auf Mobil prüfen.

**D9 — Legendenkarte**
- Umfang: Kompakte Legende als eigene Karte unten rechts, speist sich aus den vorhandenen Legenden-Modulen (`*_legend.js`), zeigt nur aktive Layer. Im Layer-Panel bleibt die ausführliche Variante.

### Stufe C — Layout (größtes Risiko, ganz am Ende)

**D10 — Vollflächige Karte mit schwebenden Karten (Desktop ≥ 1200 px)**
- Umfang: Karte füllt den Bereich unter der Statusleiste. Seitenleiste wird zur schwebenden Spalte links (Glas, `backdrop-filter` mit Fallback), Layer-Panel rechts, Zoom-Control und Maßstab neu positioniert, Popups mit `autoPanPadding` gegen Überdeckung. Unter 1200 px bleibt das heutige Layout.
- Risiko: Karten überdecken Kartenfläche, Leaflet-Größe (`invalidateSize`), Performance von `backdrop-filter`. Feature-Flag per CSS-Klasse `body.mr-floating`, um zurückzurollen.

**D11 — Mobile-Entwurf und Umsetzung**
- Umfang: Erst Entwurf (Skizze) abstimmen, dann Umsetzung: Bottom-Sheet statt Seitenleiste, Layer-Panel als Sheet, Statusleiste einzeilig scrollbar. Ersetzt den 820-px-Breakpoint.

**D12 — Gedämpfte Kartenoptik (optional)**
- Umfang: Sanfte Tönung der Kacheln per CSS-Filter, damit Overlays (Schutzgebiete, Lawinen) besser hervortreten. Satellit/Hybrid nur, wenn eine lizenzkonforme Kachelquelle gewählt wird (eigene Entscheidung, siehe DATENQUELLEN).

**D13 — Globale Suche (optional)**
- Umfang: Suchfeld oben links wie im Mockup. Zunächst nur Filter über Sperrungen und Schutzgebiete. Orts-Suche erfordert Geocoding (z. B. Nominatim mit Nutzungsrichtlinie) und ist ein eigenes Arbeitspaket. ⌘K-Hinweis erst mit echtem Shortcut.

### Empfohlene Reihenfolge

D1 → D2 → D3 → D4 → D5 → D6 → D7 → D8a/b/c → D9 → D10 → D11 → (D12, D13)

D1 bis D3 liefern schon einen sichtbaren Markenauftritt. Nach D9 sieht die App der Vision im Detail ähnlich, bevor das riskante Layout (D10) angefasst wird.

## 5. Nicht Teil des Design-Plans (Feature-abhängig)

Diese Mockup-Elemente brauchen zuerst Funktionen und Daten. Bis dahin werden sie **nicht** angezeigt, auch nicht als Platzhalter:

| Mockup-Element | Benötigt | Roadmap |
|---|---|---|
| Route Planner, „Analyze Route“, Route Intelligence | GPX-Import, Routenzeichnung, Höhenprofil | Phase 1 |
| Risk Insights, Risk Analysis | Alpine Risk Engine | Phase 3 (Beta) |
| Layer „Terrain Risk“, „Infrastructure“ | DEM-Analyse, OSM-Infrastruktur | Phase 1–3 |
| Saved Areas, Avatar | Konto/Speicherung | nicht geplant |
| Weather confidence, Gewitterrisiko | Auswertung/Modell | Phase 2 |

Wenn ein solches Feature entsteht, bringt es seine Oberfläche gleich im neuen Stil mit (Komponenten aus D3).

## 6. Querschnittsregeln für jeden Design-PR

- Keine Funktionsänderung, keine neuen Datenquellen (Ausnahme: ausdrücklich genannte Mini-PRs).
- Screenshots Desktop (1440) und Mobil (390), hell und dunkel, vorher/nachher.
- Tastaturbedienung, Fokus-Sichtbarkeit, Kontrast AA, `prefers-reduced-motion` beachten.
- Lawinen- und Warnfarben bleiben gemäß STYLEGUIDE unverändert.
- Nach jedem PR prüfen: STYLEGUIDE.md und ROADMAP.md (Punkt 10 „Design & Branding“) aktualisieren.
- Keine externen Ressourcen (Schriften, Icons) ohne Self-Hosting.

## 7. Offene Entscheidungen

1. Design-Vision-PNG ins Repository legen (fehlt).
2. Schrift: Inter (Mockup) oder Barlow (heute)?
3. Farbwerte: Styleguide (`#16324F`, `#2F6B4F`) oder Mockup (`#17374b`, `#1e7464`)? Empfehlung: Styleguide als Basis, Mockup-Töne als Abstufungen.
4. Logo-Verwendung: Die Logos liegen jetzt als SVG vor und nutzen die Styleguide-Farben. Vorschlag: App-Icon als Favicon, Emblem (ohne Text) im Header zusammen mit HTML-Text für Wortmarke und Claim. Das Hauptlogo setzt die Wortmarke als `<text>` mit Montserrat/Fallback-Schriften; für Einsatz außerhalb des Browsers (README, Social Preview) sollte der Text in Pfade umgewandelt werden.
5. Navigation im Header: nur „Explore“ oder ganz weglassen, bis weitere Bereiche existieren?
6. Mobile: Bottom-Sheet-Konzept bestätigen, bevor D11 startet.
