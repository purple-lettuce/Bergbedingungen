// Filter der Schutzgebiete nach Kategorie, eingebunden in die vorhandene Ebenenauswahl.
//
// Jede Kategorie erscheint dort als eigener Eintrag mit Farbfeld. Die Schutzgebiets-Ebene wird nicht neu
// geladen oder neu gezeichnet: Beim Ein- und Ausschalten werden nur die vorhandenen Flächen der Kategorie
// aus der GeoJSON-Ebene entnommen bzw. wieder eingesetzt. Dadurch bleibt der Zustand beim Zoomen und
// Verschieben erhalten, und er gilt auch, wenn die Ebene "Schutzgebiete" aus- und wieder eingeschaltet wird.

import { map, layersControl, esc } from './map.js';
import { swatchHtml } from './protected_areas_legend.js';

// geoLayer: L.geoJSON-Ebene aller Schutzgebiete
// layersByCategory: { Kategorie-ID: [Flächen-Ebenen] }
// entries: [{ id, label, count, style }] wie bei der Legende
export function addCategoryFilter(geoLayer, layersByCategory, entries) {
  // Pro Kategorie ein leerer Schalter in der Ebenenauswahl (die Flächen selbst bleiben in geoLayer).
  var byCategory = {};
  entries.forEach(function (e) {
    var sw = L.layerGroup().addTo(map);   // zu Beginn sind alle Kategorien sichtbar
    byCategory[e.id] = sw;
    layersControl.addOverlay(sw, swatchHtml(e.style) + esc(e.label) + ' <span class="pa-count">(' + e.count + ')</span>');
  });

  function categoryOf(layer) {
    return Object.keys(byCategory).filter(function (id) { return byCategory[id] === layer; })[0];
  }
  function show(id, on) {
    (layersByCategory[id] || []).forEach(function (l) {
      if (on) geoLayer.addLayer(l);
      else geoLayer.removeLayer(l);
    });
  }
  map.on('overlayadd', function (ev) {
    var id = categoryOf(ev.layer);
    if (id !== undefined) show(id, true);
  });
  map.on('overlayremove', function (ev) {
    var id = categoryOf(ev.layer);
    if (id !== undefined) show(id, false);
  });
}
