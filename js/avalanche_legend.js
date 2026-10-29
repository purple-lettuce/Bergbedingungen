// Legende der Lawinenlage: Berichtsstatus je Quelle, Farben der Gefahrenstufen und Höhenwahl.
// Abschnitt "Legende Lawinenlage" im Bedienfeld "Karten & Layer" (siehe js/layers.js).
// Die Legende kennt keine Quelle: Namen, Lizenz, Status und Hinweise je Quelle kommen aus den Metadaten der Daten.

import { esc } from './html.js';
import { legends } from './layers.js';
import { formatTime } from './avalanche_logic.js';
import { DANGER_LEVELS, LEVELS } from './avalanche_symbols.js';

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

// Hinweis einer Quelle (Metadaten notes: { text, url? }), der Link ist nur mit https zulässig
function noteLine(note) {
  var link = /^https:\/\//.test(note.url || '') ? ' (<a href="' + esc(note.url) + '" target="_blank" rel="noopener">' + esc(note.url_label || 'Quelle') + '</a>)' : '';
  return '<p class="av-note">' + esc(note.text) + link + '</p>';
}

// info: { sources: [{ name, attribution, attributionUrl, license, notes, elevationAware, status ('valid'|'stale'|'expired'|'none'), end }],
//         anyShown, elevationAware }; onAltitude(null | Meter) wird bei Wahl der Höhenlage aufgerufen.
export function addAvalancheLegend(info, onAltitude) {
  var rows = LEVELS.map(function (l) {
    return '<li><span class="av-sw ' + DANGER_LEVELS[l].css + '"></span><span class="pa-label">' + l + ' – ' + esc(DANGER_LEVELS[l].name) + '</span></li>';
  }).join('') + '<li><span class="av-sw av-none"></span><span class="pa-label">Kein Schnee / keine Beurteilung</span></li>';

  var options = '<option value="">Alle Höhen (höchste Stufe)</option>' + ALTITUDES.map(function (a) {
    return '<option value="' + a + '">' + a + ' m</option>';
  }).join('');

  var aware = info.sources.filter(function (s) { return s.elevationAware; }).map(function (s) { return s.name; });
  var details = !info.anyShown ? '<p class="av-note">Ohne aktuellen Bericht werden die Warnregionen grau dargestellt. Außerhalb der Wintersaison werden Berichte nur selten oder gar nicht veröffentlicht.</p>' :
    '<ul class="pa-list av-levels">' + rows + '</ul>' +
    '<label class="av-alt">Höhenlage <select id="av-alt">' + options + '</select></label>' +
    '<p class="av-note">Farbe und Symbol: höchste Gefahrenstufe der Region. Mit Höhenwahl: höchste Stufe, die in dieser Höhe gelten kann' +
    (info.elevationAware ? '. Die Höhenwahl wirkt nur bei Quellen, die ihre Gefahrenstufen nach Höhe angeben (' + esc(aware.join(', ')) + '), bei den übrigen bleibt die höchste Stufe der Region. ' : '. ') +
    'Gestrichelter Rand: Die Höhengrenze ist die Waldgrenze, die Daten nennen dafür keinen Wert.</p>' +
    info.sources.map(function (s) { return s.notes.map(noteLine).join(''); }).join('');

  var attribution = '<p class="av-note">Quellen: ' + info.sources.map(function (s) {
    return '<a href="' + esc(s.attributionUrl) + '" target="_blank" rel="noopener">' + esc(s.attribution) + '</a> (' + esc(s.license) + ')';
  }).join('; ') + '</p>';

  var legend = legends.avalanche;
  legend.setContent('<ul class="av-sources">' + info.sources.map(sourceLine).join('') + '</ul>' + details + attribution);

  var select = legend.element.querySelector('#av-alt');
  if (select) select.addEventListener('change', function () { onAltitude(select.value ? Number(select.value) : null); });
}
