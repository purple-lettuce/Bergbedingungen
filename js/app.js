// Einstieg: verbindet Karte, Wetter, Sperrungen und Schutzgebiete,
// registriert die Ereignisse und startet das Laden in der ursprünglichen Reihenfolge.

import { map, el } from './map.js';
import { loadWeather } from './weather.js';
import { loadProtectedAreas } from './protected_areas.js';
import { loadData, render, scheduleRender } from './closures.js';

// ---------- Ereignisse ----------
map.on('moveend', scheduleRender);
map.on('click', function (ev) { loadWeather(ev.latlng.lat, ev.latlng.lng); });
[el.q, el.fClosure, el.fNotice, el.fUpcoming].forEach(function (n) { n.addEventListener('input', render); });
document.getElementById('wx-center').addEventListener('click', function () { var c = map.getCenter(); loadWeather(c.lat, c.lng); });
document.getElementById('wx-geo').addEventListener('click', function () {
  if (!navigator.geolocation) { el.wx.innerHTML = '<span class="muted">Standort wird von diesem Browser nicht unterstützt.</span>'; return; }
  navigator.geolocation.getCurrentPosition(function (p) {
    map.setView([p.coords.latitude, p.coords.longitude], 12);
    loadWeather(p.coords.latitude, p.coords.longitude);
  }, function () { el.wx.innerHTML = '<span class="muted">Standort wurde nicht freigegeben.</span>'; }, { timeout: 10000 });
});

// ---------- Start ----------
var c0 = map.getCenter();
loadWeather(c0.lat, c0.lng);

loadProtectedAreas();

loadData();
