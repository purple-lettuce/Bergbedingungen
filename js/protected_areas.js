// Schutzgebiete (Naturschutzgebiete, Naturparks, Schongebiete ...) als GeoJSON-Ebene.

import { protectedAreasLayer } from './map.js';

var PROTECTED_AREAS_URL = 'data/protected_areas_alps.geojson';

export async function loadProtectedAreas() {
  try {
    const res = await fetch(PROTECTED_AREAS_URL);
    const geojson = await res.json();

    L.geoJSON(geojson, {
      style: function () {
        return {
          color: "#2f8f2f",
          weight: 2,
          fillColor: "#5fb85f",
          fillOpacity: 0.20
        };
      },
      onEachFeature: function (feature, layer) {
        const p = feature.properties || {};
        layer.bindPopup("<b>" + (p.name || "") + "</b><br>" + (p.summary || ""));
      }
    }).addTo(protectedAreasLayer);

    console.log("Schutzgebiete geladen:", geojson.features.length);
  } catch (err) {
    console.error("Fehler beim Laden der Schutzgebiete", err);
  }
}
