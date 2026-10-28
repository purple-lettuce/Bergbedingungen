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

- Sans-serif Schriftfamilie, z. B. `Inter`, `Segoe UI`, `Arial`, sans-serif
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

# Visuelle Prioritäten

1. Orientierung vor Dekoration
2. Klarheit vor visuellem Aufwand
3. Risikowahrnehmung durch konsistente Farb- und Musterlogik
4. Lesbarkeit in der Karte und im UI
5. Funktionalität und Sicherheit vor Design-Exzess

---

# Zusammenfassung

Mountain Radar verwendet ein hochwertiges, alpine, robuste und professionelle Farb- und Gestaltungssprache: Deep Alpine Blue als Kernfarbe, Mountain Green als sekundärer Akzent, zusammen mit klaren Warnfarben und einer stark funktional ausgerichteten Kartendarstellung. Ziel ist eine visuelle Sprache, die in kritischen Momenten schnell verständlich und verlässlich wirkt.