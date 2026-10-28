// Schutzgebiete (Naturschutzgebiete, Naturparks, Schongebiete ...) als GeoJSON-Ebene.

import { protectedAreasLayer, esc } from './map.js';
import { addProtectedAreasLegend } from './protected_areas_legend.js';

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
const WILDLIFE_SHOWN = 12;   // so viele Tiere im Popup, der Rest als "und n weitere"

// Überschrift mit Aufzählung für das Popup. Texte stammen aus der Datenquelle und werden maskiert.
function popupList(title, entries) {
  return "<p style=\"margin:6px 0 2px\"><b>" + title + ":</b></p>" +
    "<ul style=\"margin:0 0 4px;padding-left:18px\">" +
    entries.map(function (t) { return "<li>" + esc(t) + "</li>"; }).join("") +
    "</ul>";
}

// Wildlife und Regeln aus den Index-Tabellen der GeoJSON-Datei (siehe scripts/build_geojson.py).
// Ältere Dateien ohne diese Felder liefern einen leeren Text, das Popup bleibt dann wie bisher.
function extraPopupHtml(p, geojson) {
  let html = "";

  const animals = (p.w || [])
    .map(function (i) { return (geojson.wildlife_names || [])[i]; })
    .filter(Boolean);
  if (animals.length) {
    const shown = animals.slice(0, WILDLIFE_SHOWN);
    if (animals.length > shown.length) {
      shown.push("und " + (animals.length - shown.length) + " weitere");
    }
    html += popupList("Wildlife", shown);
  }

  const rules = (p.r || [])
    .map(function (i) { return (geojson.rule_texts || [])[i]; })
    .filter(Boolean);
  if (rules.length) html += popupList("Regeln", rules);

  return html;
}

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

    L.geoJSON(geojson, {
style: function (feature) {
  return categoryStyle(feature.properties.category_id);
},
onEachFeature: function (feature, layer) {

  const p = feature.properties || {};

const categoryName =
  CATEGORY_NAMES[
    p.category_id
  ] || "Schutzgebiet";

  const extra = extraPopupHtml(p, geojson);

  layer.bindPopup(
    "<h3>" + (p.name || "") + "</h3>" +
    "<p><b>Kategorie:</b> " +
    categoryName +
    "</p>" +
    (
      p.summary
        ? "<p>" + p.summary + "</p>"
        : ""
    ) +
    extra,
    // lange Listen im Popup scrollen lassen; ohne Zusatzinfos bleibt das Popup unverändert
    extra ? { maxHeight: 340 } : undefined
  );

}
    }).addTo(protectedAreasLayer);

    addProtectedAreasLegend(legendEntries(geojson));

    console.log("Schutzgebiete geladen:", geojson.features.length);
  } catch (err) {
    console.error("Fehler beim Laden der Schutzgebiete", err);
  }
}
