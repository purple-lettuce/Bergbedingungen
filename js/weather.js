// Wetterwidget (Open-Meteo): Abruf, Darstellung und Standortmarker. Abruf und Auswertung liegen in weather_api.js
// (gemeinsam mit "Wetter entlang der Route"); hier stehen nur Oberfläche und Marker.

import { map, el, esc } from './map.js';
import { setSourceStatus } from './status_bar.js';
import { weatherStatus } from './status_bar_logic.js';
import { fetchForecasts, WX_CODES } from './weather_api.js';

var wxMarker = null;
var wxSeq = 0;

export async function loadWeather(lat, lon) {
  var seq = ++wxSeq;
  if (wxMarker) wxMarker.setLatLng([lat, lon]);
  else wxMarker = L.marker([lat, lon], { icon: L.divIcon({ className: '', html: '<div class="wxpin"></div>', iconSize: [14, 14], iconAnchor: [7, 7] }), interactive: false, keyboard: false }).addTo(map);
  el.wx.innerHTML = '<span class="muted">Wird geladen …</span>';
  setSourceStatus('weather', 'loading', 'wird geladen …');
  try {
    var d = (await fetchForecasts([{ lat: lat, lon: lon }], { forecastDays: 4 }))[0];
    if (!d) throw new Error('Antwort ohne aktuelle Werte');
    if (seq !== wxSeq) return;
    var st = weatherStatus(d.time);
    setSourceStatus('weather', st.state, st.text);
    var fl = d.freezingLevel;
    var wd = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
    var days = d.days.map(function (day, i) {
      var dt = new Date(day.date + 'T12:00:00');
      return '<div class="mr-card mr-card--tight day"><b>' + (i === 0 ? 'Heute' : wd[dt.getDay()]) + '</b>' +
        Math.round(day.tmax) + '° / ' + Math.round(day.tmin) + '°<br>' +
        day.precipitation.toFixed(1) + ' mm<br>' +
        'Böen ' + Math.round(day.gustMax) + '</div>';
    }).join('');
    el.wx.innerHTML =
      '<div class="wx-now"><span class="wx-temp">' + Math.round(d.temperature) + ' °C</span><span class="wx-desc">' + esc(WX_CODES[d.code] || '') + '</span></div>' +
      '<dl class="mr-kv mr-kv--stacked">' +
      '<div class="mr-kv__item"><dt>Gefühlt</dt><dd>' + Math.round(d.apparent) + ' °C</dd></div>' +
      '<div class="mr-kv__item"><dt>Wind / Böen</dt><dd>' + Math.round(d.wind) + ' / ' + Math.round(d.gust) + ' km/h</dd></div>' +
      '<div class="mr-kv__item"><dt>Nullgradgrenze</dt><dd>' + (fl == null ? '–' : Math.round(fl / 10) * 10 + ' m') + '</dd></div>' +
      '<div class="mr-kv__item"><dt>Standorthöhe</dt><dd>' + (d.elevation != null ? Math.round(d.elevation) + ' m' : '–') + '</dd></div>' +
      '</dl><div class="days">' + days + '</div>' +
      '<p class="mr-text-muted mr-text-sm mr-m-0">Gelände-Höhe laut Wettermodell, kann von der Gipfelhöhe abweichen.</p>';
  } catch (e) {
    if (seq !== wxSeq) return;
    el.wx.innerHTML = '<span class="muted">Wetterdaten sind gerade nicht abrufbar.</span>';
    setSourceStatus('weather', 'unavailable', 'nicht abrufbar');
  }
}
