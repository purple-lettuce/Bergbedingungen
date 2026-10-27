// Schutzgebiete (Naturschutzgebiete, Naturparks, Schongebiete ...) als GeoJSON-Ebene.

import { protectedAreasLayer } from './map.js';

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
export async function loadProtectedAreas() {
  try {
    const res = await fetch(PROTECTED_AREAS_URL);
    const geojson = await res.json();

    L.geoJSON(geojson, {
style: function (feature) {

  const category =
    feature.properties.category_id;

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
},
onEachFeature: function (feature, layer) {

  const p = feature.properties || {};

const categoryName =
  CATEGORY_NAMES[
    p.category_id
  ] || "Schutzgebiet";

  layer.bindPopup(
    "<h3>" + (p.name || "") + "</h3>" +
    "<p><b>Kategorie:</b> " +
    categoryName +
    "</p>" +
    (
      p.summary
        ? "<p>" + p.summary + "</p>"
        : ""
    )
  );

}
    }).addTo(protectedAreasLayer);

    console.log("Schutzgebiete geladen:", geojson.features.length);
  } catch (err) {
    console.error("Fehler beim Laden der Schutzgebiete", err);
  }
}
