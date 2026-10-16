# Bergbedingungen

Kartenseite mit Sperrungen und Hinweisen im Gebirge, dazu ein Wetterwidget.

- **Karte:** OpenStreetMap und OpenTopoMap, dargestellt mit Leaflet (liegt unter `vendor/leaflet`).
- **Sperrungen und Hinweise:** Daten von [Digitize the Planet e.V.](https://platform.digitizetheplanet.org/en/api/docs/) (Lizenz CC0).
- **Wetter:** [Open-Meteo](https://open-meteo.com/), ohne Schlüssel.

## So kommen die Daten auf die Seite

Der Browser darf die Digitize API nicht direkt abfragen. Deshalb holt die GitHub Action
`Sperrungen aktualisieren` (`.github/workflows/update-data.yml`) alle drei Stunden die Daten
und speichert sie in `data/closures.json`. Die Seite liest nur diese Datei.

Sofort aktualisieren: Reiter **Actions** → **Sperrungen aktualisieren** → **Run workflow**.

## Dateien

| Datei | Inhalt |
| --- | --- |
| `index.html`, `style.css`, `app.js` | die Seite |
| `scripts/fetch_closures.py` | Datenabruf aus der Digitize API |
| `data/closures.json` | abgerufene Sperrungen und Hinweise |
