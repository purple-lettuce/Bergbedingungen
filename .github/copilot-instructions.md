# Copilot instructions

## Project shape

This is a static, German-language map application. `app.html` (the map application; `index.html` is the static landing page without scripts) loads the vendored Leaflet library as a classic script, then loads `js/app.js` as an ES module. `js/map.js` creates the shared map and exports common DOM/status helpers and Leaflet layers; `js/layers.js` registers layers, base maps and legends in the "Karten & Layer" panel (`js/layer_panel.js`); `app.js` connects UI events and starts the feature loaders. The other modules render closures and notices, weather, and protected areas.

The browser fetches committed files under `data/` for closures and protected areas. Closure data is fetched from Digitize the Planet by `scripts/fetch_closures.py` in `.github/workflows/update-data.yml` every three hours; the browser does not call that API. Weather is fetched directly from Open-Meteo. The protected-area data pipeline is `fetch_protected_areas.py` → `fetch_protected_area_details_v2.py` → `build_geojson.py`. Avalanche conditions (Euregio and Switzerland) come from `scripts/fetch_avalanche.py` (twice daily workflow `update-avalanche.yml`) into `data/avalanche/` (one common data model for all sources, new country = one entry in `scripts/avalanche_sources.py`); see `docs/LAWINENLAGE_ANALYSE.md`. The browser never calls the avalanche services directly. JS tests: `python3 scripts/run_js_tests.py` (needs Chrome or Edge).

## Commands

There is no package manifest, build step, automated test suite, or configured linter. There is no single-test command.

Serve the site from the repository root so ES modules and data files load correctly:

```sh
python -m http.server 8000
```

Open `http://localhost:8000`. Do not test by opening `app.html` as a `file://` URL.

Run the data scripts from the repository root when intentionally refreshing their outputs:

```sh
python scripts/fetch_closures.py
python scripts/fetch_protected_areas.py
python scripts/fetch_protected_area_details_v2.py
python scripts/build_geojson.py
```

These scripts make network requests. The protected-area scripts depend on the outputs of the preceding step; review generated data before committing it.

## Repository conventions

- Keep the front end dependency-free beyond the vendored Leaflet library and browser APIs; there is no bundler or package manager workflow.
- Use relative ES-module imports. `map.js` is the shared boundary for the Leaflet map, layers, DOM references, HTML escaping (`esc`), status, and warnings.
- The UI text is German. Keep user-facing labels and messages consistent with that language.
- When building HTML strings from API or data values, escape text with `esc` from `map.js`; do not interpolate untrusted text directly into markup.
- GeoJSON coordinates are longitude/latitude. Convert to Leaflet's latitude/longitude order when creating map points or bounds.
- Python data scripts use the standard library and resolve data paths relative to the script directory. Preserve UTF-8 and Unicode when reading or writing JSON.
