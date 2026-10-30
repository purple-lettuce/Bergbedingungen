// Register für das Bedienfeld "Karten & Layer": hier werden Kartenstile, Ebenen, Filter und Legenden angemeldet.
// Neue Ebene (z. B. Unfälle, Absturzrisiko, GPX): eine Zeile `panel.addOverlay(...)` und bei Bedarf eine
// Legende über `panel.addLegend(...)` oder ein Filter über `panel.addFilter(...)`. Den Inhalt setzt das Modul der
// Ebene über `legends` bzw. `filters`.

import { map, osm, topo, layerGroup, protectedAreasLayer, avalancheLayer } from './map.js';
import { createLayerPanel } from './layer_panel.js';

export var panel = createLayerPanel(map);

// Kartenstile
panel.addBaseLayer('OpenStreetMap', osm);
panel.addBaseLayer('Topo mit Höhenlinien', topo);

// Ebenen
panel.addOverlay('Sperrungen & Hinweise', layerGroup);
panel.addOverlay('Schutzgebiete', protectedAreasLayer);
panel.addOverlay('Lawinenlage', avalancheLayer);

// Filter (stehen vor den Legenden)
export var filters = {
  closures: panel.addFilter('Filter Sperrungen & Hinweise', layerGroup),
  protectedAreas: panel.addFilter('Filter Schutzgebiete', protectedAreasLayer)
};

// Legenden
export var legends = {
  closures: panel.addLegend('Legende Sperrungen & Hinweise', layerGroup),
  protectedAreas: panel.addLegend('Legende Schutzgebiete', protectedAreasLayer),
  avalanche: panel.addLegend('Legende Lawinenlage', avalancheLayer)
};