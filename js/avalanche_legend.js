// Legende der Lawinenlage: Farben der Gefahrenstufen, Gültigkeit des Berichts und Höhenwahl.
// Abschnitt "Legende Lawinenlage" im Bedienfeld "Karten & Layer" (siehe js/layers.js).

import { esc } from './map.js';
import { legends } from './layers.js';
import { LEVEL_NAMES, formatTime } from './avalanche_logic.js';

var ALTITUDES = [1000, 1500, 2000, 2500, 3000, 3500];

legends.avalanche.setContent('<p class="muted">Wird beim ersten Einblenden der Ebene geladen.</p>');

// info: { validTime, status ('valid'|'stale'|'expired') }; onAltitude(null | Meter) wird bei Wahl der Höhenlage aufgerufen.
export function addAvalancheLegend(info, onAltitude) {
  var expired = info.status === 'expired';

  var until = esc(formatTime(info.validTime.endTime)) + ' Uhr';
  var statusHtml = info.status === 'valid' ? '<p class="av-status">Lagebericht gültig bis ' + until + '</p>'
    : info.status === 'stale' ? '<p class="av-status av-warn">Bericht abgelaufen (galt bis ' + until + '), ein neuer wird in Kürze geladen.</p>'
    : '<p class="av-status av-warn"><b>Kein aktueller Lagebericht.</b> Letzter Bericht galt bis ' + until + '. Außerhalb der Wintersaison werden meist keine Berichte veröffentlicht.</p>';

  var rows = [1, 2, 3, 4, 5].map(function (l) {
    return '<li><span class="av-sw av-lv' + l + '"></span><span class="pa-label">' + l + ' – ' + esc(LEVEL_NAMES[l]) + '</span></li>';
  }).join('') + '<li><span class="av-sw av-none"></span><span class="pa-label">Kein Schnee / keine Beurteilung</span></li>';

  var options = '<option value="">Alle Höhen (höchste Stufe)</option>' + ALTITUDES.map(function (a) {
    return '<option value="' + a + '">' + a + ' m</option>';
  }).join('');

  var details = expired ? '' :
    '<ul class="pa-list av-levels">' + rows + '</ul>' +
    '<label class="av-alt">Höhenlage <select id="av-alt">' + options + '</select></label>' +
    '<p class="av-note">Farbe: höchste Gefahrenstufe der Region. Mit Höhenwahl: höchste Stufe, die in dieser Höhe gelten kann. ' +
    'Gestrichelter Rand: Die Höhengrenze ist die Waldgrenze, die Daten nennen dafür keinen Wert.</p>';

  var legend = legends.avalanche;
  legend.setContent(statusHtml + details +
    '<p class="av-note">Quelle: <a href="https://lawinen.report/more/open-data" target="_blank" rel="noopener">Euregio-Lawinenreport</a>, CC BY 4.0</p>');

  var select = legend.element.querySelector('#av-alt');
  if (select) select.addEventListener('change', function () { onAltitude(select.value ? Number(select.value) : null); });
}