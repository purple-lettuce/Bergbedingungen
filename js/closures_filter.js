// Filter der Sperrungen und Hinweise (Sperrungen, Hinweise, Geplant): Abschnitt im Bedienfeld "Karten & Layer".
// Die Filterlogik selbst bleibt in js/closures.js (visibleRecords); hier wird nur der Schalterzustand verbunden.

import { filters } from './layers.js';
import { closureFilter, render } from './closures.js';

var ITEMS = [
  { id: 'closure', label: 'Sperrungen' },
  { id: 'notice', label: 'Hinweise' },
  { id: 'upcoming', label: 'Geplant (gilt erst ab einem späteren Datum)' }
];

function dot(cls) {
  var d = document.createElement('span');
  d.className = 'dot ' + cls;
  return d;
}

export function initClosuresFilter() {
  filters.closures.setItems(ITEMS.map(function (i) {
    return { id: i.id, label: i.label, swatch: dot(i.id) };
  }), function (id, on) {
    closureFilter[id] = on;
    render();
  });
}
