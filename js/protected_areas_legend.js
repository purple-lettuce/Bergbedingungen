// Legende der Schutzgebiete: erklärt die Farben der Kategorien, die in den geladenen Daten vorkommen.
// Abschnitt "Legende Schutzgebiete" im Bedienfeld "Karten & Layer" (siehe js/layers.js).

import { esc } from './map.js';
import { legends } from './layers.js';

legends.protectedAreas.setContent('<p class="muted">Wird geladen …</p>');

// entries: [{ id, label, count, style }] in der Reihenfolge der Anzeige, style = Leaflet-Pfadstil der Kategorie.
export function addProtectedAreasLegend(entries) {
  if (!entries.length) return;

  var rows = entries.map(function (e) {
    return '<li><span class="pa-sw" style="border-color:' + esc(e.style.color) + '">' +
      '<i style="background:' + esc(e.style.fillColor) + ';opacity:' + esc(Math.min(1, e.style.fillOpacity * 2.5)) + '"></i></span>' +
      '<span class="pa-label">' + esc(e.label) + '</span></li>';
  }).join('');
  legends.protectedAreas.setContent('<ul class="pa-list">' + rows + '</ul>');
  legends.protectedAreas.setCompact('<ul class="pa-list">' + rows + '</ul>');
}

export function protectedAreasLegendFailed() {
  legends.protectedAreas.setContent('<p class="muted">Die Legende ist nicht verfügbar, weil die Schutzgebiete nicht geladen werden konnten.</p>');
}