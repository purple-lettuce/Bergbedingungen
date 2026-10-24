// Wetterwidget (Open-Meteo): Abruf, Darstellung und Standortmarker.

import { map, el, esc } from './map.js';

var WX_CODES = {0:'Klar',1:'Überwiegend klar',2:'Wolkig',3:'Bedeckt',45:'Nebel',48:'Reifnebel',51:'Leichter Nieselregen',53:'Nieselregen',55:'Starker Nieselregen',56:'Gefrierender Nieselregen',57:'Gefrierender Nieselregen',61:'Leichter Regen',63:'Regen',65:'Starker Regen',66:'Gefrierender Regen',67:'Gefrierender Regen',71:'Leichter Schneefall',73:'Schneefall',75:'Starker Schneefall',77:'Schneegriesel',80:'Leichte Schauer',81:'Schauer',82:'Starke Schauer',85:'Schneeschauer',86:'Starke Schneeschauer',95:'Gewitter',96:'Gewitter mit Hagel',99:'Gewitter mit starkem Hagel'};

var wxMarker = null;
var wxSeq = 0;

export async function loadWeather(lat, lon) {
  var seq = ++wxSeq;
  if (wxMarker) wxMarker.setLatLng([lat, lon]);
  else wxMarker = L.marker([lat, lon], { icon: L.divIcon({ className: '', html: '<div class="wxpin"></div>', iconSize: [14, 14], iconAnchor: [7, 7] }), interactive: false, keyboard: false }).addTo(map);
  el.wx.innerHTML = '<span class="muted">Wird geladen …</span>';
  var url = 'https://api.open-meteo.com/v1/forecast?latitude=' + lat.toFixed(4) + '&longitude=' + lon.toFixed(4) +
    '&current=temperature_2m,apparent_temperature,precipitation,wind_speed_10m,wind_gusts_10m,weather_code' +
    '&hourly=freezing_level_height' +
    '&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,wind_gusts_10m_max' +
    '&wind_speed_unit=kmh&timezone=auto&forecast_days=4';
  try {
    var res = await fetch(url);
    if (!res.ok) throw new Error('HTTP ' + res.status);
    var d = await res.json();
    if (seq !== wxSeq) return;
    var c = d.current;
    var hIdx = d.hourly.time.indexOf(c.time.slice(0, 13) + ':00');
    var fl = hIdx >= 0 ? d.hourly.freezing_level_height[hIdx] : null;
    var wd = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
    var days = d.daily.time.map(function (t, i) {
      var dt = new Date(t + 'T12:00:00');
      return '<div class="day"><b>' + (i === 0 ? 'Heute' : wd[dt.getDay()]) + '</b>' +
        Math.round(d.daily.temperature_2m_max[i]) + '° / ' + Math.round(d.daily.temperature_2m_min[i]) + '°<br>' +
        d.daily.precipitation_sum[i].toFixed(1) + ' mm<br>' +
        'Böen ' + Math.round(d.daily.wind_gusts_10m_max[i]) + '</div>';
    }).join('');
    el.wx.innerHTML =
      '<div class="wx-now"><span class="wx-temp">' + Math.round(c.temperature_2m) + ' °C</span><span class="wx-desc">' + esc(WX_CODES[c.weather_code] || '') + '</span></div>' +
      '<dl class="wx-grid">' +
      '<div><dt>Gefühlt</dt><dd>' + Math.round(c.apparent_temperature) + ' °C</dd></div>' +
      '<div><dt>Wind / Böen</dt><dd>' + Math.round(c.wind_speed_10m) + ' / ' + Math.round(c.wind_gusts_10m) + ' km/h</dd></div>' +
      '<div><dt>Nullgradgrenze</dt><dd>' + (fl == null ? '–' : Math.round(fl / 10) * 10 + ' m') + '</dd></div>' +
      '<div><dt>Standorthöhe</dt><dd>' + (d.elevation != null ? Math.round(d.elevation) + ' m' : '–') + '</dd></div>' +
      '</dl><div class="days">' + days + '</div>' +
      '<p class="muted" style="margin:8px 0 0">Gelände-Höhe laut Wettermodell, kann von der Gipfelhöhe abweichen.</p>';
  } catch (e) {
    if (seq !== wxSeq) return;
    el.wx.innerHTML = '<span class="muted">Wetterdaten sind gerade nicht abrufbar.</span>';
  }
}
