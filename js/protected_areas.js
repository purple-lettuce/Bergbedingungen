// Schutzgebiete (Naturschutzgebiete, Naturparks, Schongebiete ...) als GeoJSON-Ebene.

import { protectedAreasLayer, esc } from './map.js';
import { addProtectedAreasLegend } from './protected_areas_legend.js';
import { addCategoryFilter } from './protected_areas_filter.js';
import { wildlifeIcon, ruleInfo, splitSeason } from './popup_icons.js';

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

// Regeln als Liste mit Themensymbol und farbigem Rand (Verbot, eingeschränkt, erlaubt). Der Regeltext bleibt
// unverändert; ein Zeitraum am Ende steht in einer eigenen Zeile. Texte stammen aus der Datenquelle und werden maskiert.
function rulesHtml(rules) {
  return "<p style=\"margin:6px 0 4px\"><b>Regeln:</b></p>" +
    "<ul class=\"pa-rules\">" +
    rules.map(function (t) {
      const info = ruleInfo(t);
      const parts = splitSeason(t);
      return "<li class=\"pa-rule " + info.kind + "\"><span class=\"pa-ico\" aria-hidden=\"true\">" + info.icon + "</span>" +
        "<span class=\"pa-rule-text\">" + esc(parts.main) +
        (parts.season ? " <span class=\"pa-season\">" + esc(parts.season) + "</span>" : "") + "</span></li>";
    }).join("") +
    "</ul>";
}

// Wildlife als Reihe kleiner Schilder mit Symbol und Name. Namen stammen aus der Datenquelle und werden maskiert.
function wildlifeHtml(names, more) {
  return "<p style=\"margin:6px 0 4px\"><b>Wildlife:</b></p>" +
    "<ul class=\"pa-chips\">" +
    names.map(function (n) {
      return "<li><span class=\"pa-ico\" aria-hidden=\"true\">" + wildlifeIcon(n) + "</span>" + esc(n) + "</li>";
    }).join("") +
    (more ? "<li class=\"pa-more\">und " + more + " weitere</li>" : "") +
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
    html += wildlifeHtml(animals.slice(0, WILDLIFE_SHOWN), Math.max(0, animals.length - WILDLIFE_SHOWN));
  }

  const rules = (p.r || [])
    .map(function (i) { return (geojson.rule_texts || [])[i]; })
    .filter(Boolean);
  if (rules.length) html += rulesHtml(rules);

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

    const layersByCategory = {};   // Kategorie-ID -> Flächen-Ebenen (für den Kategorienfilter)

    const geoLayer = L.geoJSON(geojson, {
style: function (feature) {
  return categoryStyle(feature.properties.category_id);
},
onEachFeature: function (feature, layer) {

  const cat = feature.properties && feature.properties.category_id;
  (layersByCategory[cat] = layersByCategory[cat] || []).push(layer);

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

    const entries = legendEntries(geojson);
    addProtectedAreasLegend(entries);
    addCategoryFilter(geoLayer, layersByCategory, entries);

    console.log("Schutzgebiete geladen:", geojson.features.length);
  } catch (err) {
    console.error("Fehler beim Laden der Schutzgebiete", err);
  }
}
