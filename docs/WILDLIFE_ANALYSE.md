# Wildlife-Auflösung: Analyse der DTP-Daten

Stand: 28.10.2026. Dieses Dokument erklärt, warum im Popup der Schutzgebiete keine Tiernamen erschienen,
was die Pipeline jetzt tut, was sich nicht prüfen ließ und welche Lösungswege es gibt.

## 1. Befund

Aus der produktiv erzeugten `data/wildlife.json` (Stand 28.10.2026, inzwischen ersetzt):

| Merkmal | Wert |
| --- | --- |
| Einträge | 2923 |
| Felder je Eintrag | `id`, `protected_area_uuid`, `protected_entity_id`, `created_at`, `updated_at` |
| verschiedene `protected_entity_id` | 564 (Werte 49 bis 8080) |
| Schutzgebiete mit Wildlife | 940 |
| Wertebereich von `id` | 14 bis 3887 |

Schlussfolgerungen:

- `GET /wildlife` liefert in der Grundeinstellung **Verknüpfungen** („Schutzgebiet X hat Schutzgut Y“), keine Artenliste.
- Die `id` im `wildlife`-Eintrag eines Schutzgebiets (Beispiel 3320) liegt im Wertebereich dieser Verknüpfungs-IDs. Sie ist damit die ID der Verknüpfung. Das eigentliche Schutzgut steckt in `protected_entity_id`.
- Namen, Art, Gruppe oder Sensitivität stehen in diesen Einträgen **nicht**. Der erste Ansatz (`id` → Name) konnte deshalb nichts auflösen, und er hätte bei einer Verwechslung der IDs falsche Namen liefern können. Deshalb wird die `id` des Eintrags nie als Tierart-ID verwendet.

## 2. Was geprüft wurde

| Quelle | Ergebnis |
| --- | --- |
| API-Dokumentation (Übersicht, Erste Schritte, Support, Changelog, DE/EN) | Keine Beschreibung der Felder von `/wildlife`. Das Changelog nennt nur: v2.0.0-beta.3 „Fix return types of `/protected-areas/{uuid}/wildlife`“, v2.0.0-beta.4 „Remove obsolete response attributes from `/wildlife`“. „Erste Schritte“ nennt `updated_after` auch für „Endpoints für Tierarten“ und sagt, die Antwort lasse sich über den Parameter `fields` erweitern. |
| API-Referenz v2 (`/api/v2` Swagger UI) | Die Seite wird erst im Browser aufgebaut. Der abrufbare Text ist nur ein Gerüst ohne Pfade und Schemata. |
| OpenAPI-Schema (`/api/v2/schema/`) | Der Pfad antwortet (früher Abruf: Inhalt als Binärdaten), war aus meiner Umgebung aber nicht lesbar. |
| Webseiten und Präsentationen von Digitize the Planet | Erwähnen „Tiere im Schutzgebiet mit Artenlisten“ und „Digitalisierung der Schutzgüter“ (Projekt NUDGE), aber kein Datenmodell, keine Felder, keine Endpunkte. |
| Direkte Abfragen der API | Aus der Entwicklungsumgebung nicht möglich (Netzwerkfreigabe fehlt). Nur GitHub Actions erreicht die API. |

**Was in den verfügbaren Daten fehlt:** die Stammdaten der Schutzgüter, also die Zuordnung
`protected_entity_id` → Name (und ggf. Art, Gruppe, Sensitivität). Eine öffentliche Dokumentation, in
welchem Endpunkt oder Feld sie stehen, habe ich nicht gefunden. Ob die API sie liefert, ist daher
**ungeklärt**, nicht widerlegt.

## 3. Was die Pipeline jetzt tut

`scripts/fetch_wildlife.py` sucht die Namen nur in offiziellen DTP-Quellen, in dieser Reihenfolge, und
stoppt, sobald alle Schutzgüter einen Namen haben:

1. `GET /wildlife?fields=all`: laut Doku lässt sich die Antwort über `fields` erweitern (bisher wurde ohne `fields` abgerufen).
2. Alle Endpunkte ohne Pfadparameter, die das **offizielle OpenAPI-Schema** zu Schutzgütern oder Arten deklariert (Pfad enthält `entit` oder `species`), jeweils mit `fields=all`.
3. `GET /protected-areas/{uuid}/wildlife` (laut Changelog mit korrigierten Rückgabetypen): erst eine Stichprobe von 5 Gebieten, nur bei Erfolg für alle.

Ein Name wird nur übernommen, wenn die API ihn **zusammen mit der Kennung** des Schutzguts liefert
(`protected_entity_id` im selben Eintrag, ein verschachteltes Objekt mit `id` und Namen oder ein
Schutzgut-Endpunkt mit `id` und Namen). Nicht übernommen werden Namen verschachtelter Objekte ohne
Bezug zu Wildlife (zum Beispiel der Name des Schutzgebiets). Es gibt keine statische Zuordnungstabelle.

Ergebnis:

- `data/wildlife_entities.json`: Kennung → Name (nur Schutzgüter, die in Verknüpfungen vorkommen).
- `data/wildlife_probe.json`: Diagnosebericht mit den relevanten Pfaden und Feldnamen aus dem Schema, den abgefragten URLs (Erfolg/Fehler, Zeilen, Feldnamen), einem unveränderten Beispieleintrag von `/wildlife` und der Quote aufgelöster Schutzgüter.

`scripts/build_geojson.py` löst `protected_entity_id` über `wildlife_entities.json` auf. Schutzgüter ohne
Namen werden weggelassen. Hat ein Gebiet keinen aufgelösten Namen, erscheint im Popup kein Wildlife-Bereich.

## 4. So prüfen Sie das Ergebnis

1. Actions → **Schutzgebiete aktualisieren** → Run workflow.
2. In der Zusammenfassung des Laufs steht unter „Wildlife-Auflösung“, welche Quelle Namen geliefert hat und wie viele der Schutzgüter aufgelöst sind.
3. `data/wildlife_probe.json` zeigt Pfade und Felder des offiziellen Schemas sowie das echte Aussehen der Einträge.

Mögliche Ausgänge:

| Ausgang | Bedeutung | Nächster Schritt |
| --- | --- | --- |
| Alle oder fast alle aufgelöst | Die API liefert die Namen in einer der drei Quellen. | Nichts, Popups zeigen Tiernamen. |
| Teilweise aufgelöst | Nur ein Teil der Schutzgüter hat einen Namen in der API. | Fehlende Namen sind in den DTP-Daten nicht vorhanden (siehe 5). |
| Keine aufgelöst, Schema nennt einen Endpunkt mit Namen | Die automatische Erkennung greift nicht (zum Beispiel anderes Feldschema). | `wildlife_probe.json` an die Entwicklung geben, Erkennung in `scripts/wildlife_lookup.py` anpassen. |
| Keine aufgelöst, Schema nennt nichts | Die Stammdaten sind über die öffentliche API nicht erhältlich. | Lösungswege unter 5. |

## 5. Lösungswege, falls die API die Namen nicht liefert

1. **Rückfrage bei Digitize the Planet** (Kontakt über die API-Dokumentation oder digitizetheplanet.org/contact): Aus welchem Endpunkt oder Feld lässt sich `protected_entity_id` in Namen und Art auflösen? Gibt es eine Wildlife-/Schutzgut-Referenzliste (zum Beispiel `/protected-entities`) oder ein Feld, das in `/wildlife` oder `/protected-areas/{uuid}/wildlife` noch fehlt? Hilfreich beizulegen: ein Eintrag aus `wildlife_probe.json`.
2. **Swagger-Seite im Browser prüfen:** Die interaktive Referenz (`/en/api/docs/v2/`) im Browser öffnen, in den Netzwerk-Tools die Schema-Adresse suchen und die Datei (oder die Abschnitte zu `wildlife` und Schutzgütern) bereitstellen. Daraus lässt sich der Endpunkt exakt ableiten.
3. **Dokumentierte Zugänge mit Anmeldung:** Falls die Namen nur für registrierte Nutzer über die API verfügbar sind, wäre ein API-Schlüssel als Repository-Secret nötig. Davon steht in der öffentlichen Doku nichts; es müsste bei DTP erfragt werden.
4. **Bis dahin:** Das Wildlife-Feld im Popup bleibt ausgeblendet (das Frontend zeigt nur, was in der Datei steht). Regeln, Kategorie und Beschreibung funktionieren unverändert.

Nicht zulässig im Sinne der Projektvorgaben und deshalb nicht umgesetzt: eigene Namenslisten, Raten
von Namen aus Gebietsbeschreibungen, Platzhalter.

## 6. Grenzen dieser Analyse

- Die DTP-API war aus meiner Umgebung nicht erreichbar. Das Verhalten der neuen Pipeline ist mit Tests an nachgebildeten Antwortformen geprüft (`scripts/test_fetch_wildlife.py`, `scripts/test_build_geojson.py`), **nicht gegen die echte API**. Der erste Workflow-Lauf liefert den Beleg.
- Das Schema (`/schema/`) wird als JSON oder YAML gelesen. Gibt die API ein anderes Format zurück, fehlt nur der Schema-Teil des Berichts, die übrigen Quellen werden trotzdem geprüft.
