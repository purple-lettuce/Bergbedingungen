// Legende der Lawinenlage: Berichtsstatus je Quelle, Farben der Gefahrenstufen und Höhenwahl.
// Abschnitt "Legende Lawinenlage" im Bedienfeld "Karten & Layer" (siehe js/layers.js).

import { esc } from './map.js';
import { legends } from './layers.js';
import { LEVEL_NAMES, formatTime } from './avalanche_logic.js';

var ALTITUDES = [1000, 1500, 2000, 2500, 3000, 3500];

legends.avalanche.setContent('<p class="muted">Wird beim ersten Einblenden der Ebene geladen.</p>');

function sourceLine(s) {
  var until = s.end ? esc(formatTime(s.end)) + ' Uhr' : '';
  var text = s.status === 'valid' ? 'Bericht gültig bis ' + until
    : s.status === 'stale' ? 'Bericht abgelaufen (galt bis ' + until + '), ein neuer wird in Kürze geladen'
    : s.status === 'expired' ? 'Kein aktueller Bericht (letzter galt bis ' + until + ')'
    : 'Kein aktueller Bericht';
  return '<li class="av-src' + (s.status === 'valid' ? '' : ' av-warn') + '"><b>' + esc(s.name) + '</b><br>' + text + '</li>';
}

// info: { sources: [{ name, attribution, attributionUrl, license, status ('valid'|'stale'|'expired'|'none'), end }],
//         anyShown, elevationAware }; onAltitude(null | Meter) wird bei Wahl der Höhenlage aufgerufen.
export function addAvalancheLegend(info, onAltitude) {
  var rows = [1, 2, 3, 4, 5].map(function (l) {
    return '<li><span class="av-sw av-lv' + l + '"></span><span class="pa-label">' + l + ' – ' + esc(LEVEL_NAMES[l]) + '</span></li>';
  }).join('') + '<li><span class="av-sw av-none"></span><span class="pa-label">Kein Schnee / keine Beurteilung</span></li>';

  var options = '<option value="">Alle Höhen (höchste Stufe)</option>' + ALTITUDES.map(function (a) {
    return '<option value="' + a + '">' + a + ' m</option>';
  }).join('');

  var details = !info.anyShown ? '<p class="av-note">Ohne aktuellen Bericht werden die Warnregionen grau dargestellt. Außerhalb der Wintersaison werden Berichte nur selten oder gar nicht veröffentlicht.</p>' :
    '<ul class="pa-list av-levels">' + rows + '</ul>' +
    '<label class="av-alt">Höhenlage <select id="av-alt">' + options + '</select></label>' +
    '<p class="av-note">Farbe und Symbol: höchste Gefahrenstufe der Region. Mit Höhenwahl: höchste Stufe, die in dieser Höhe gelten kann' +
    (info.elevationAware ? '. Die Höhenwahl wirkt nur bei Quellen, die ihre Gefahrenstufen nach Höhe angeben (Euregio); die Schweiz nennt Höhen nur bei den Lawinenproblemen. ' : '. ') +
    'Gestrichelter Rand: Die Höhengrenze ist die Waldgrenze, die Daten nennen dafür keinen Wert.</p>' +
    '<p class="av-note">Schweiz: Teilstufen - (unteres Ende), = (Mitte), + (oberes Ende) der Stufe, bei Trockenschneelawinen ab Stufe 2 ' +
    '(<a href="https://www.slf.ch/en/avalanche-bulletin-and-snow-situation/about-the-avalanche-bulletin/danger-levels/" target="_blank" rel="noopener">SLF</a>).</p>';

  var attribution = '<p class="av-note">Quellen: ' + info.sources.map(function (s) {
    return '<a href="' + esc(s.attributionUrl) + '" target="_blank" rel="noopener">' + esc(s.attribution) + '</a> (' + esc(s.license) + ')';
  }).join('; ') + '</p>';

  var legend = legends.avalanche;
  legend.setContent('<ul class="av-sources">' + info.sources.map(sourceLine).join('') + '</ul>' + details + attribution);

  var select = legend.element.querySelector('#av-alt');
  if (select) select.addEventListener('change', function () { onAltitude(select.value ? Number(select.value) : null); });
}