// Legende der Schutzgebiete: erklärt die Farben der Kategorien, die in den geladenen Daten vorkommen.
// Wird als Kartenelement unten links angezeigt und folgt der Ebene "Schutzgebiete" der Ebenenauswahl.

import { map, protectedAreasLayer, esc } from './map.js';

var MOBILE_QUERY = '(max-width: 820px)';   // wie im Stylesheet: Seitenleiste unter der Karte

// entries: [{ id, label, count, style }] in der Reihenfolge der Anzeige, style = Leaflet-Pfadstil der Kategorie.
export function addProtectedAreasLegend(entries) {
  if (!entries.length) return;

  var control = L.control({ position: 'bottomleft' });
  control.onAdd = function () {
    var box = L.DomUtil.create('div', 'pa-legend leaflet-bar');
    var open = !window.matchMedia(MOBILE_QUERY).matches;   // am Handy zunächst eingeklappt, damit die Karte frei bleibt

    var rows = entries.map(function (e) {
      return '<li><span class="pa-sw" style="border-color:' + esc(e.style.color) + '">' +
        '<i style="background:' + esc(e.style.fillColor) + ';opacity:' + esc(Math.min(1, e.style.fillOpacity * 2.5)) + '"></i></span>' +
        '<span class="pa-label">' + esc(e.label) + '</span></li>';
    }).join('');
    box.innerHTML =
      '<button type="button" class="pa-toggle" aria-expanded="' + open + '" aria-controls="pa-legend-list">Legende Schutzgebiete</button>' +
      '<ul id="pa-legend-list" class="pa-list"' + (open ? '' : ' hidden') + '>' + rows + '</ul>';

    var btn = box.querySelector('.pa-toggle');
    var list = box.querySelector('.pa-list');
    btn.addEventListener('click', function () {
      var show = list.hidden;
      list.hidden = !show;
      btn.setAttribute('aria-expanded', String(show));
    });
    L.DomEvent.disableClickPropagation(box);
    L.DomEvent.disableScrollPropagation(box);
    return box;
  };

  // Legende nur zeigen, solange die Schutzgebiete eingeblendet sind
  if (map.hasLayer(protectedAreasLayer)) control.addTo(map);
  protectedAreasLayer.on('add', function () { control.addTo(map); });
  protectedAreasLayer.on('remove', function () { control.remove(); });
}
