// Schutzgebiete (Naturschutzgebiete, Naturparks, Schongebiete ...) als GeoJSON-Ebene.

import { protectedAreasLayer } from './map.js';
import { filters } from './layers.js';
import { addProtectedAreasLegend, protectedAreasLegendFailed } from './protected_areas_legend.js';
import { bindCategoryFilter } from './protected_areas_filter.js';
import { areaPopup } from './protected_areas_popup.js';

var PROTECTED_AREAS_URL = 'data/protected_areas_alps.geojson';
const CATEGORY_NAMES = {
  1: "Nationalpark",
  2: "Naturschutzgebiet",
  3: "Biosphärenreservat",
  4: "Naturpark",
  5: "Landschaftsschutzgebiet",

  17: "Ruhezone",
  18: "Wald-Wild-Schongebiet",
  19: "Wildschutzgebiet",
  20: "Wildruhezone",

  41: "Wald- und Wildschutzzone",

  45: "Winterruhezone",

  48: "Jagdrechtliches Betretungsverbot",

  54: "Freiwillige Wildruhezone",

  55: "Ruhegebiet"
};
// Farben der Kategorien (Karte und Legende nutzen dieselbe Funktion).
function categoryStyle(category) {

  if (category === 1) {
    return {
      color: "#145a32",
      weight: 2,
      fillColor: "#1e8449",
      fillOpacity: 0.25
    };
  }

  if (category === 2) {
    return {
      color: "#1b5e20",
      weight: 2,
      fillColor: "#43a047",
      fillOpacity: 0.20
    };
  }

  if (
    category === 18 ||
    category === 19 ||
    category === 20 ||
    category === 41
  ) {
    return {
      color: "#d35400",
      weight: 2,
      fillColor: "#f39c12",
      fillOpacity: 0.30
    };
  }

  if (
    category === 45 ||
    category === 54 ||
    category === 55
  ) {
    return {
      color: "#c0392b",
      weight: 2,
      fillColor: "#e74c3c",
      fillOpacity: 0.30
    };
  }

  return {
    color: "#2f8f2f",
    weight: 2,
    fillColor: "#5fb85f",
    fillOpacity: 0.20
  };
}

// Legendeneinträge aus den geladenen Daten: nur Kategorien, die tatsächlich vorkommen.
function legendEntries(geojson) {
  const counts = {};
  geojson.features.forEach(function (f) {
    const id = f.properties && f.properties.category_id;
    counts[id] = (counts[id] || 0) + 1;
  });
  return Object.keys(counts)
    .map(Number)
    .sort(function (a, b) { return a - b; })
    .map(function (id) {
      return { id: id, label: CATEGORY_NAMES[id] || "Schutzgebiet", count: counts[id], style: categoryStyle(id) };
    });
}

export async function loadProtectedAreas() {
  try {
    const res = await fetch(PROTECTED_AREAS_URL);
    const geojson = await res.json();

    const layersByCategory = {};   // Kategorie-ID -> Flächen-Ebenen (für den Kategorienfilter)

    const geoLayer = L.geoJSON(geojson, {
style: function (feature) {
  return categoryStyle(feature.properties.category_id);
},
onEachFeature: function (feature, layer) {

  const p = feature.properties || {};

  (layersByCategory[p.category_id] = layersByCategory[p.category_id] || []).push(layer);

const categoryName =
  CATEGORY_NAMES[
    p.category_id
  ] || "Schutzgebiet";

  const popup = areaPopup(p, geojson, categoryName);

  layer.bindPopup(
    popup.html,
    // lange Listen im Popup scrollen lassen; ohne Zusatzinfos bleibt das Popup unverändert
    popup.extra ? { maxHeight: 340 } : undefined
  );

}
    }).addTo(protectedAreasLayer);

    const entries = legendEntries(geojson);
    addProtectedAreasLegend(entries);
    bindCategoryFilter(filters.protectedAreas, geoLayer, layersByCategory, entries);

    console.log("Schutzgebiete geladen:", geojson.features.length);
  } catch (err) {
    console.error("Fehler beim Laden der Schutzgebiete", err);
    protectedAreasLegendFailed();
    filters.protectedAreas.setMessage("Der Filter ist nicht verfügbar, weil die Schutzgebiete nicht geladen werden konnten.");
  }
}
