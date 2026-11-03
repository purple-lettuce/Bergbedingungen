// Schutzgebiete (Naturschutzgebiete, Naturparks, Schongebiete ...) als GeoJSON-Ebene.

import { map, protectedAreasLayer } from './map.js';
import { fitPadded } from './layout.js';
import { revealMap } from './sheet.js';
import { createIndex, searchIndex } from './search_logic.js';
import { filters } from './layers.js';
import { addProtectedAreasLegend, protectedAreasLegendFailed } from './protected_areas_legend.js';
import { bindCategoryFilter } from './protected_areas_filter.js';
import { areaPopup } from './protected_areas_popup.js';
import { setSourceStatus } from './status_bar.js';
import { protectedAreasStatus } from './status_bar_logic.js';

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

// ---------- Globale Suche (D13) ----------
// Je Name und Kategorie ein Eintrag (ein Gebiet besteht oft aus mehreren Flächen); durchsucht werden Name und Kategorie.
var areasByKey = new Map();   // Schlüssel -> { id, title, extra, meta, layers, popup }
var searchIndexData = null;

function showProtectedArea(id) {
  var a = areasByKey.get(id);
  if (!a) return;
  var b = null;
  a.layers.forEach(function (l) {
    var lb = l.getBounds();
    if (b) b.extend(lb); else b = L.latLngBounds(lb.getSouthWest(), lb.getNorthEast());
  });
  if (!b || !b.isValid()) return;
  revealMap();   // mobil (D11) gibt das Bottom Sheet die Karte frei, bevor die Ränder berechnet werden
  fitPadded(map, b, 14);
  // Eigenes Popup mit demselben Inhalt wie das der Fläche: funktioniert auch, wenn die Kategorie oder die Ebene ausgeblendet ist.
  L.popup(a.popup.extra ? { className: "mr-popup", maxHeight: 340 } : { className: "mr-popup" })
    .setLatLng(b.getCenter()).setContent(a.popup.html).openOn(map);
}

export var protectedAreasSearchSource = {
  id: "protectedAreas", label: "Schutzgebiete",
  search: function (q) {
    if (!searchIndexData) return { loaded: false, total: 0, items: [] };
    var res = searchIndex(searchIndexData, q);
    return { loaded: true, total: res.total, items: res.items.map(function (e) { return { id: e.id, title: e.title, meta: e.meta }; }) };
  },
  open: showProtectedArea
};

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

  const popup = areaPopup(p, geojson, categoryName, categoryStyle(p.category_id));

  if (p.name) {
    const key = p.name + "|" + p.category_id;
    let a = areasByKey.get(key);
    if (!a) { a = { id: key, title: p.name, extra: categoryName, meta: categoryName, layers: [], popup: popup }; areasByKey.set(key, a); }
    a.layers.push(layer);
  }

  layer.bindPopup(
    popup.html,
    // className: Popup im Mountain-Radar-Stil (D8a, folgt Hell/Dunkel); lange Listen scrollen lassen
    popup.extra ? { className: "mr-popup", maxHeight: 340 } : { className: "mr-popup" }
  );

}
    }).addTo(protectedAreasLayer);

    searchIndexData = createIndex(Array.from(areasByKey.values()));

    const entries = legendEntries(geojson);
    addProtectedAreasLegend(entries);
    bindCategoryFilter(filters.protectedAreas, geoLayer, layersByCategory, entries);

    var st = protectedAreasStatus(geojson.features.length);
    setSourceStatus('protectedAreas', st.state, st.text);
    console.log("Schutzgebiete geladen:", geojson.features.length);
  } catch (err) {
    console.error("Fehler beim Laden der Schutzgebiete", err);
    protectedAreasLegendFailed();
    setSourceStatus('protectedAreas', 'unavailable', 'nicht verfügbar');
    filters.protectedAreas.setMessage("Der Filter ist nicht verfügbar, weil die Schutzgebiete nicht geladen werden konnten.");
  }
}
