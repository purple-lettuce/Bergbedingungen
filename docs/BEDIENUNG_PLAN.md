# Mountain Radar – Arbeitsplan Bedienung und Karte

> Status: Arbeitsplan (27.11.2026), UX1 umgesetzt; UX2–UX10 geplant. Der Gesamtstand steht in der Plattform-Landkarte der ROADMAP (Zeile „Bedienung und Karte“). Dieses Dokument ist ein Arbeitsdokument: Nach vollständiger Umsetzung wird es gelöscht und Dauerhaftes in ROADMAP, DATENQUELLEN oder STYLEGUIDE übernommen.
>
> Herkunft: Beobachtungen des Nutzers bei der Verwendung des Produkts (Fehler und Änderungswünsche), thematisch sortiert und in Pakete geschnitten.

---

# Grundsätze

- Paketregeln wie im ROUTE_INTELLIGENCE_PLAN: ein Thema je Paket, möglichst reine Logik zuerst, etwa 600 Zeilen je PR, nur echte Daten, informieren statt entscheiden.
- Design-Änderungen folgen den Regeln im STYLEGUIDE („Regeln für Design-Änderungen“): Screenshots Desktop (1440) und Mobil (390), hell und dunkel, vorher und nachher; Tastatur, Kontrast, keine neuen Datenquellen in reinen Design-PRs.
- Layout-Pakete (UX1 bis UX3) laufen nacheinander, nicht parallel, weil sie dieselben Dateien berühren (`app.html`, `style.css`, `js/layout.js`, `js/sheet.js`).
- Keine Platzhalter, keine erfundenen Daten.

---

# Themenübersicht

| Thema | Beobachtung | Pakete |
|---|---|---|
| 1 Fehler | Weißes Feld unter dem eingeklappten Kartenmenü; schmales Sperrungs-Popup (Zeitraum bricht in viele Zeilen um) | UX1 |
| 2 Seitenleiste | Wetterfenster einklappbar und nicht halbtransparent; Suchfeld in der Seitenleiste entfernen (globale Suche genügt) | UX2 |
| 3 Route und GPX | GPX-Laden, Höhenprofil und Routenknöpfe aus der Seitenleiste in ein neues Menü unten | UX3a, UX3b |
| 4 Punktinfo (Toolbox) | Klick auf die Karte liefert Koordinaten, Höhe, Wetter und weitere Infos | UX4a, UX4b |
| 5 Karten | Karten im Kartenmenü klar benennen; weitere Karten; Kartenmaßstab | UX5, UX6, UX7, UX8 |
| 6 Symbole | DTP-Regel-Piktogramme wirken wie Handy-Emojis oder Comic | UX9 |
| 7 Daten | Weitere Wetterdaten, z. B. GeoSphere | UX10 (entspricht AP-2.1, Phase 2) |

Empfohlene Reihenfolge: UX1 → UX2 → UX3a → UX3b; unabhängig davon UX5 → UX8 → UX6 → UX7, UX4a → UX4b, UX9; UX10 nach Entscheidung zur Wetterphase.

---

# UX1 – Fehlerkorrekturen Kartenmenü und Sperrungs-Popup

Status: Umgesetzt. Schicht: Anzeige (CSS/Markup), kein neues Verhalten.

**Ziel:** Zwei sichtbare Fehler beheben.

**Umfang:**
- Eingeklapptes Kartenmenü („Karten & Layer“): Es soll nur der Balken zu sehen sein; das weiße Feld darunter verschwindet. Ursache zuerst am Gerät und in den Entwicklerwerkzeugen bestimmen (Container ohne Inhalt, aber mit Fläche; Desktop und Mobil, hell und dunkel getrennt prüfen).
- Sperrungs-Popup: Breite so, dass der Zeitraum nicht in viele Zeilen umbricht (heute `max-width: 20rem` im gemeinsamen Popup-System, `style.css`). Lösung im gemeinsamen System, nicht nur für Sperrungen; Mobilregel (`calc(100vw - 58px)`) bleibt.

**Nicht im Umfang:** neue Popup-Inhalte, neue Felder, Umbau der Popups.

**Voraussetzungen:** keine.

**Risiken:** Breitere Popups verdecken auf kleinen Bildschirmen mehr Karte; Lawinen- und Schutzgebiets-Popups dürfen sich nicht verändern.

**Abhängigkeiten:** gemeinsames Popup-System (D8a bis D8c).

**Umsetzung:** Das schwebende Desktop-Panel bekommt die Mindesthöhe nur im offenen Zustand; im geschlossenen Zustand bleibt die Höhe beim Kopf. Das gemeinsame Popup-Inhaltslimit beträgt 26 rem, Sperrungs-Popups können bis 420 px breit werden. Schutzgebiets-Popups behalten Leaflets 300-px-Maximum, Lawinen-Popups ihr eigenes 340-px-Maximum; auf Mobil bleibt die bisherige Begrenzung `calc(100vw - 58px)`.

**Definition of Done:** Beide Fehler behoben, Screenshots vorher und nachher (Desktop, Mobil, hell, dunkel), andere Popups unverändert, vorhandene Tests grün, Tests für das Layout ergänzt, ROADMAP (Landkarte) aktualisiert, PR gemerged.

---

# UX2 – Seitenleiste aufräumen

Status: Geplant. Schicht: Anzeige.

**Ziel:** Das Wetterfenster ist einklappbar und deckend; das überflüssige Suchfeld entfällt.

**Umfang:**
- Wetterkarte der Seitenleiste (Desktop und Mobil) per Knopf ein- und ausklappbar, Zustand per `aria-expanded`, Tastatur bedienbar. Muster wie bei den vorhandenen einklappbaren Elementen (Legendenkarte).
- Wetterfenster deckend statt halbtransparent (Fläche aus den Tokens, Kontrast AA geprüft, Hell und Dunkel).
- Suchfeld „Suchen, z. B. Steig, Forst“ in der Karte „Sperrungen und Hinweise“ entfernen; die globale Suche im Header deckt Sperrungen und Hinweise ab. Bestätigt am Screenshot des Nutzers (27.11.2026): Es gibt zwei Suchfelder, die globale Suche im Header und „Suchen, z. B. Steig, Forst“ in der Karte „Sperrungen und Hinweise“. Vorher prüfen, ob das Feld nur die Liste oder auch die Kartenebene filtert; der Verlust der Listenfilterung ist bewusst zu entscheiden (siehe Risiken).

**Nicht im Umfang:** neue Suchfunktionen, Geocoding (Suche Phase 2), Umbau der Wetterlogik.

**Voraussetzungen:** UX1 (gleiche Dateien).

**Risiken:** Das Feld filtert die Sperrungsliste (Anzeige „85 Einträge im Kartenausschnitt“) (`js/map.js`, Element `q`); mit Entfernen entfällt dieser Filter. Gegenmaßnahme: Verhalten der globalen Suche vorher prüfen und im PR benennen. Einklappbarer Zustand und Bottom Sheet (D11) dürfen sich nicht stören.

**Abhängigkeiten:** D10/D11 (Layout), D13 (globale Suche).

**Definition of Done:** Wetterfenster einklappbar und deckend, Suchfeld entfernt, Tests angepasst (Layout, globale Suche), Screenshots, ROADMAP (Landkarte) und STYLEGUIDE aktualisiert, PR gemerged.

---

# UX3a – Routenmenü unten: Struktur und Knöpfe

Status: Geplant. Schicht: Anzeige und Struktur, keine neue Analyse.

**Ziel:** Die Route bekommt ein eigenes Menü am unteren Rand statt der Karte „Route“ in der Seitenleiste.

**Umfang:**
- Neues Menü unten (Desktop: schwebende Karte am unteren Rand; Mobil: abgestimmt mit dem Bottom Sheet). Im Menü: „GPX laden“, danach „andere GPX laden“, „Route entfernen“, „Auf diesem Gerät speichern“.
- Die Karte „Route“ verschwindet aus der Seitenleiste; die Wetterkarte bleibt davon unberührt.
- Bestehende Logik bleibt unverändert (`js/route.js`, `js/route_logic.js`, `js/route_saved.js`); nur Platz und Struktur ändern sich.

**Nicht im Umfang:** Höhenprofil, Statistik, Kontextblöcke (UX3b), neue Funktionen, Mehrfachrouten.

**Voraussetzungen:** UX2.

**Risiken:** Platz am unteren Rand: Legendenkarte, Attribution, Maßstab (UX8), Bottom Sheet (mobil) und Statusleiste konkurrieren; Überdeckungsabstände in `js/layout.js` (`coveredInsets`, `fitPadded`) müssen die neue Fläche kennen. Bedienung muss ohne Route sinnvoll leer sein (nur „GPX laden“).

**Abhängigkeiten:** D10, D11, RI3, RI6.

**Definition of Done:** Alle Routenknöpfe im neuen Menü, Verhalten unverändert (Tests RI3, RI6 grün), Überdeckungs- und Layouttests ergänzt, Screenshots Desktop und Mobil, ROADMAP und STYLEGUIDE aktualisiert, PR gemerged.

---

# UX3b – Routenmenü: Höhenprofil, Statistik und Kontext

Status: Geplant. Schicht: Anzeige.

**Ziel:** Höhenprofil und die übrigen Routenblöcke ziehen ins neue Menü.

**Umfang:**
- Höhenprofil (RI5) im Routenmenü mit Hover, Touch und Tastatur wie bisher.
- Statistik, „Entlang der Route“, Lawinenlage und Wetter entlang der Route (RI4, RI8 bis RI10) und „Meine Routen“: Platzierung im Menü festlegen (Reiter oder Abschnitte); Entscheidung vor der Umsetzung im PR dokumentieren.

**Nicht im Umfang:** neue Analysen, geänderte Texte oder Berechnungen.

**Voraussetzungen:** UX3a.

**Risiken:** Höhe des Menüs auf kleinen Bildschirmen; Profil braucht Breite. Zu viel Inhalt in einem Menü. Gegenmaßnahme: einklappbar, Reiter statt langer Spalte.

**Abhängigkeiten:** RI4, RI5, RI8, RI9b, RI10b.

**Definition of Done:** Alle Routenblöcke im Menü, Funktion unverändert (bestehende Tests grün), Screenshots, ROADMAP und STYLEGUIDE aktualisiert, PR gemerged.

---

# UX4a – Punktinfo: Koordinaten und Höhe

Status: Geplant. Schicht: Logik zuerst, dann Anzeige. Ersetzt WEB-T2 (Koordinaten) und WEB-T3 (Höhe) der Toolbox.

**Ziel:** Ein Klick auf die Karte zeigt Koordinaten und Höhe des Punkts in einem Popup.

**Umfang:**
- Reine Logik: Koordinatenformatierung (Dezimalgrad; weitere Formate nur, wenn gewünscht), Kopieren in die Zwischenablage.
- Höhe über `elevationAt` (RI12), mit dem Hinweis auf Quelle und Art (Oberflächenmodell kann von der Gipfelhöhe abweichen, Quelle Copernicus GLO-30, Namensnennung in der Fußzeile).
- Popup im gemeinsamen Popup-System (`.mr-popup`, `.mr-kv`); Vorrang bleibt bei Sperrungen, Schutzgebieten und Lawinenlage (deren Popups werden nicht verdrängt).

**Nicht im Umfang:** Wetter im Popup (UX4b), weitere Infos, Messwerkzeuge (Entfernungen: WEB-T4, WEB-T5 bleiben eigene Pakete).

**Voraussetzungen:** RI12.

**Risiken:** Höhe kostet einen Netzabruf je Klick (Datenmenge und Wartezeit, Fehlerfall „Höhe nicht verfügbar“ muss sauber erscheinen). Klick-Konflikt mit Flächen- und Punkt-Popups. Gegenmaßnahme: Höhe nachladen, Koordinaten sofort zeigen.

**Abhängigkeiten:** RI12, D8a bis D8c.

**Definition of Done:** Koordinaten und Höhe im Klick-Popup, Fehlerzustände getestet, Vorrangregel getestet, ROADMAP (WEB-T2, WEB-T3 erledigt) und DATENQUELLEN aktualisiert, PR gemerged.

---

# UX4b – Punktinfo: Wetter im Popup

Status: Geplant. Schicht: Anzeige. Entspricht WEB-T7 (Weather Intelligence Popup).

**Ziel:** Das Wetter am angeklickten Punkt erscheint im selben Popup wie Koordinaten und Höhe.

**Umfang:** Nur vorhandene Wetterdaten (`js/weather.js`, eine Abfrage je Punkt), Regeln wie in WEB-T7: keine neue Quelle, keine zweite Abfrage, Fehlerzustand wie heute.

**Nicht im Umfang:** neue Wettermodelle, GeoSphere (UX10), Wetterlogik erweitern.

**Voraussetzungen:** UX4a.

**Risiken:** Popup wird lang; Reihenfolge der Abschnitte festlegen (Koordinaten, Höhe, Wetter). Die Wetterkarte der Seitenleiste bleibt oder fällt weg (im PR entscheiden).

**Abhängigkeiten:** UX4a, UX2.

**Definition of Done:** Wetter im Klick-Popup, Seitenleiste konsistent, Tests, ROADMAP (WEB-T7 erledigt) aktualisiert, PR gemerged.

---

# UX5 – Karten im Kartenmenü klar benennen

Status: Geplant. Schicht: Anzeige (Texte).

**Ziel:** Jede Karte im Menü „Karten & Layer“ hat einen eindeutigen Namen, der zeigt, was sie ist.

**Umfang:** Bezeichnungen der Basiskarten und Overlays prüfen und eindeutig machen (z. B. Kartenstil und Quelle); Reihenfolge und Gruppierung (Basiskarte, Ebenen) klären. Keine neuen Karten.

**Nicht im Umfang:** neue Karten (UX6, UX7), neue Funktionen.

**Voraussetzungen:** keine.

**Risiken:** Bezeichnungen sind Textentscheidungen; Vorschläge vorher abstimmen. Legende und Namensnennung müssen dieselben Namen verwenden.

**Abhängigkeiten:** D7.

**Definition of Done:** Alle Karten klar benannt, Legende und Tests angepasst, Screenshots, STYLEGUIDE bei Bedarf, ROADMAP aktualisiert, PR gemerged.

---

# UX6 – Weitere Karten: Quellenentscheidung und Spike

Status: Geplant. Schicht: Recherche/Entscheidung, Prototyp außerhalb der Anwendung.

**Ziel:** Für jede gewünschte Karte klären, ob und wie sie rechtlich und technisch einbindbar ist.

**Umfang:** Kandidaten: freemap.eu (die verlinkte Ansicht trägt „premium“, Nutzungsbedingungen prüfen), Freizeitkarte OSM, OpenSlopeMap, Schummerungskarten Österreich. Je Quelle: Kachelschema und URL, Auflösung und Zoomstufen, Abdeckung, Lizenz und Namensnennung, Nutzungsbedingungen für Kachelserver (Produktivbetrieb und Last), Abruf aus dem Browser (CORS), Kosten, Aktualität. Ergebnis: Entscheidungsvorlage und Einträge in DATENQUELLEN.

**Nicht im Umfang:** Einbindung in die Anwendung (UX7), eigene Kachelerzeugung.

**Voraussetzungen:** keine; sinnvoll nach UX5.

**Risiken:** Manche Anbieter erlauben Kachelabruf nur eingeschränkt oder gegen Entgelt; Namensnennungspflicht; Last auf freien Kachelservern. Keine Karte ohne belegte Nutzungserlaubnis.

**Abhängigkeiten:** DATENQUELLEN.

**Definition of Done:** Je Karte Entscheidung (ja, nein, später) mit Beleg, DATENQUELLEN ergänzt, UX7 nur für bestätigte Karten angepasst, PR gemerged.

---

# UX7 – Weitere Karten einbinden

Status: Geplant (nach UX6). Schicht: Anzeige und Konfiguration. Je bestätigter Karte ein kleiner PR.

**Ziel:** Bestätigte Karten stehen im Kartenmenü zur Wahl.

**Umfang:** Kachelebene, Name nach UX5, Namensnennung in Kartenquellenangabe und Fußzeile, Legende falls nötig (z. B. Hangneigungsfarben bei OpenSlopeMap), Hell/Dunkel-Verhalten, Wirkung auf die Kartenoptik (D12) prüfen.

**Nicht im Umfang:** nicht bestätigte Karten, eigene Kachelerzeugung.

**Voraussetzungen:** UX5, UX6.

**Risiken:** Lizenz, Namensnennung, Ladeverhalten, Sättigungsfilter der gedämpften Kartenoptik passt nicht zu jeder Karte.

**Abhängigkeiten:** UX5, UX6, D7, D12.

**Definition of Done:** Karte wählbar, Namensnennung sichtbar, Tests, Screenshots, DATENQUELLEN und ROADMAP aktualisiert, PR gemerged.

---

# UX8 – Kartenmaßstab

Status: Geplant. Schicht: Anzeige.

**Ziel:** Ein Maßstabsbalken auf der Karte.

**Umfang:** Metrischer Maßstab (Leaflet-Maßstabsregler, bereits Teil von Leaflet, keine neue Bibliothek), Platz neben Legendenkarte und Quellenangabe, Hell/Dunkel, Tastatur nicht relevant; mobil kleiner Balken.

**Nicht im Umfang:** Messwerkzeuge (WEB-T4, WEB-T5), imperiale Einheiten.

**Voraussetzungen:** keine; Platz mit UX3a abstimmen.

**Risiken:** Überlappung mit Legendenkarte, Dock, Bottom Sheet und Routenmenü.

**Abhängigkeiten:** D9 bis D11, UX3a.

**Definition of Done:** Maßstab sichtbar und lesbar in allen Layouts (Desktop, Tablet, Mobil, hell, dunkel), Überdeckungstests, STYLEGUIDE und ROADMAP aktualisiert, PR gemerged.

---

# UX9 – Piktogramme der Schutzgebiets-Regeln überarbeiten

Status: Geplant. Schicht: Design.

**Ziel:** Die Symbole für Regeln und Wildlife im Popup wirken ruhig und gehören zum Designsystem.

**Umfang:** Heute sind es Emojis (`js/popup_icons.js`, z. B. Adler, Pfotensymbol), die je nach Gerät unterschiedlich und comicartig aussehen. Ein einheitliches Linien-Symbolset im Stil des STYLEGUIDE (Stärke, Größe, Farbe über Tokens, Hell und Dunkel), selbst gehostet als SVG; Zuordnung wie bisher (Tierart, Regelthema, Standardsymbol). Vergleichsbilder vorher und nachher.

**Nicht im Umfang:** neue Inhalte, neue Regelthemen, Änderung der Daten.

**Voraussetzungen:** Lizenz der Symbole klären (eigene Zeichnung oder frei nutzbares Set mit Namensnennung); Zuordnungstabelle liegt in `js/popup_icons.js`.

**Risiken:** Lizenz und Namensnennung eines fremden Symbolsets; Lesbarkeit bei kleiner Größe; Barrierefreiheit (Alternativtexte, nicht nur Symbol).

**Abhängigkeiten:** D8a, STYLEGUIDE.

**Definition of Done:** Alle Symbole ersetzt, kein Emoji mehr im Popup, Tests der Zuordnung angepasst, Screenshots, Lizenz in DATENQUELLEN oder STYLEGUIDE, ROADMAP aktualisiert, PR gemerged.

---

# UX10 – GeoSphere: Quellenentscheidung (Wetter Österreich)

Status: Geplant, entspricht AP-2.1 „GeoSphere Integration“ (Phase 2). Schicht: Recherche/Entscheidung.

**Ziel:** Klären, welche GeoSphere-Daten sich als zusätzliche Wetterquelle eignen und wie sie eingebunden werden.

**Umfang:** Verfügbare Datensätze (Punktvorhersage, Modelle), Zugang und Schlüssel, Lizenz und Namensnennung, Abruf aus dem Browser (CORS), Abdeckung (Österreich, Alpenraum), Auflösung, Aktualität, Datenmenge; Vergleich mit Open-Meteo. Ergebnis: Entscheidungsvorlage und DATENQUELLEN.

**Nicht im Umfang:** Einbindung in die Anwendung (eigenes Paket nach der Entscheidung), Wetterrisiko-Bewertung.

**Voraussetzungen:** keine.

**Risiken:** Zugang ohne eigenen Server (Schlüssel im Browser nicht möglich), Lizenz, nur Österreich abgedeckt.

**Abhängigkeiten:** ROADMAP Phase 2, DATENQUELLEN.

**Definition of Done:** Entscheidung dokumentiert, DATENQUELLEN ergänzt, Folgepaket formuliert, PR gemerged.

---

# Nicht Teil dieses Plans (Ideen)

- Dauerhafter Browserspeicher für gespeicherte Routen (`navigator.storage.persist`) und Hinweis zum Export; kleines eigenes Paket bei Bedarf.
- Messwerkzeuge (Entfernungen: WEB-T4, WEB-T5) bleiben in der ROADMAP-Toolbox.
