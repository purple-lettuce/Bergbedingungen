// Karte und gemeinsame Bausteine: Leaflet-Karte, Kachelebenen, Ebenengruppen,
// Ebenenauswahl, Warnhinweise sowie die gemeinsam genutzten Seitenelemente.
// Leaflet (`L`) wird vorher über vendor/leaflet/leaflet.js global geladen.

export var map = L.map('map', { zoomControl: true }).setView([47.2, 11.4], 10);

// ---------- Gemeinsame Hilfen ----------
export var el = {
  list: document.getElementById('list'),
  status: document.getElementById('status'),
  q: document.getElementById('q'),
  fClosure: document.getElementById('f-closure'),
  fNotice: document.getElementById('f-notice'),
  fUpcoming: document.getElementById('f-upcoming'),
  wx: document.getElementById('wx')
};

export function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
  });
}

export function setStatus(msg, isErr) {
  el.status.textContent = msg;
  el.status.className = 'status' + (isErr ? ' err' : '');
}

// ---------- Warnhinweise ----------
var warnEl = document.getElementById('warn');
var warnings = {};
export function warn(key, msg) {
  warnings[key] = msg;
  warnEl.innerHTML = Object.keys(warnings).map(function (k) { return '<div>' + esc(warnings[k]) + '</div>'; }).join('');
  warnEl.hidden = false;
}
export function unwarn(key) {
  delete warnings[key];
  warnEl.innerHTML = Object.keys(warnings).map(function (k) { return '<div>' + esc(warnings[k]) + '</div>'; }).join('');
  warnEl.hidden = !Object.keys(warnings).length;
}
export var FILE_HINT = location.protocol === 'file:'
  ? ' Die Seite wurde als lokale Datei geöffnet. Dabei blockiert der Browser das Laden von Daten und Kartenkacheln. Bitte die Seite über ihre Internetadresse (GitHub Pages) öffnen.'
  : '';

// ---------- Kachelebenen ----------
var tileErrors = 0, tileOk = 0;
export var osm = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 18,
  attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).on('tileerror', function () {
  tileErrors++;
  if (tileErrors >= 3 && tileOk === 0) warn('tiles', 'Die Kartenkacheln von OpenStreetMap lassen sich nicht laden (z. B. 403 „Access blocked“). OpenStreetMap verlangt eine Herkunftsangabe der Seite.' + FILE_HINT);
}).on('tileload', function () {
  tileOk++;
  if (tileOk === 1) unwarn('tiles');
}).addTo(map);
export var topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
  maxZoom: 17, subdomains: 'abc',
  attribution: 'Kartendaten © <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>, SRTM | Darstellung © <a href="https://opentopomap.org">OpenTopoMap</a> (CC-BY-SA)'
});

// ---------- Ebenengruppen und Ebenenauswahl ----------
export var layerGroup = L.layerGroup().addTo(map);
export var protectedAreasLayer = L.layerGroup().addTo(map);
L.control.layers(
  {
    'OpenStreetMap': osm,
    'Topo mit Höhenlinien': topo
  },
  {
    'Sperrungen & Hinweise': layerGroup,
    'Schutzgebiete': protectedAreasLayer
  },
  {
    position: 'topright',
    collapsed: true
  }
).addTo(map);
