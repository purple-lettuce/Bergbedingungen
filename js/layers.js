// Register für das Bedienfeld "Karten & Layer": hier werden Kartenstile, Ebenen und Legenden angemeldet.
// Neue Ebene (z. B. Unfälle, Absturzrisiko, GPX): eine Zeile `panel.addOverlay(...)` und bei Bedarf eine
// Legende über `panel.addLegend(...)`. Den Inhalt der Legende setzt das Modul der Ebene über `legends`.

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

// Legenden
export var legends = {
  closures: panel.addLegend('Legende Sperrungen & Hinweise', layerGroup),
  protectedAreas: panel.addLegend('Legende Schutzgebiete', protectedAreasLayer),
  avalanche: panel.addLegend('Legende Lawinenlage', avalancheLayer)
};