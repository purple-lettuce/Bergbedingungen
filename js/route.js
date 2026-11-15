// Eigene Route (RI3): GPX-Datei wählen, lesen, als Ebene "Meine Route" auf der Karte zeigen und wieder entfernen.
// Die Datei wird nur im Browser gelesen (File-API) und nicht übertragen (E1). Es gibt genau eine Route zugleich (E2); Neuladen der Seite verwirft sie.
// Parser, Modell und Texte liegen in gpx.js, route_model.js und route_logic.js; hier stehen nur Oberfläche und Karte.
// Texte aus der Datei (Name, Warnungen) gelangen nur über textContent oder esc() in die Seite.

import { map, routeLayer, esc, warn, unwarn } from './map.js';
import { panel } from './layers.js';
import { fitPadded } from './layout.js';
import { revealMap } from './sheet.js';
import { setSourceStatus } from './status_bar.js';
import { parseGpx } from './gpx.js';
import { createRoute, displayLines } from './route_model.js';
import { checkFile, routeTitle, routeStatus, STATUS_LOADING } from './route_logic.js';

var DISPLAY_TOLERANCE_M = 3;   // Vereinfachung der Linie für die Darstellung; die Route selbst bleibt unverändert
var MAX_ZOOM = 15;

var route = null, title = '', loading = false, registered = false;
var btnLoad, btnClear, fileInput, info;

// Ebene und Legende werden erst beim ersten Laden im Bedienfeld angemeldet: ohne Route bleibt die Oberfläche unverändert.
function register() {
  if (registered) return;
  registered = true;
  panel.addOverlay('Meine Route', routeLayer);
  panel.addLegend('Legende Meine Route', routeLayer).setContent(
    '<ul class="pa-list"><li><span class="mr-route-sw" aria-hidden="true"></span><span class="pa-label">Meine Route</span></li>' +
    '<li><span class="mr-route-pin mr-route-pin--start" aria-hidden="true"></span><span class="pa-label">Start</span></li>' +
    '<li><span class="mr-route-pin mr-route-pin--end" aria-hidden="true"></span><span class="pa-label">Ziel</span></li></ul>');
}

function popupHtml() {
  return '<div class="pa-pop mr-stack mr-gap-sm"><div class="pa-pop-head"><div class="mr-stack mr-gap-xs"><h3>' + esc(title) + '</h3>' +
    '<div class="mr-cluster mr-gap-xs"><span class="mr-badge">Eigene Route</span></div></div></div>' +
    '<p class="mr-text-muted mr-text-sm mr-m-0">Die Datei wurde nur in diesem Browser gelesen und nicht übertragen.</p></div>';
}

function draw() {
  routeLayer.clearLayers();
  var lines = displayLines(route, DISPLAY_TOLERANCE_M);
  var opts = { interactive: true, lineCap: 'round', lineJoin: 'round' };
  lines.forEach(function (line) {
    if (line.length < 2) return;
    L.polyline(line, Object.assign({ className: 'mr-route-casing' }, opts)).addTo(routeLayer);
    L.polyline(line, Object.assign({ className: 'mr-route-line' }, opts)).bindPopup(popupHtml, { className: 'mr-popup' }).addTo(routeLayer);
  });
  var first = route.points[0], last = route.points[route.points.length - 1];
  [[first, 'start', 'Start'], [last, 'end', 'Ziel']].forEach(function (m) {
    L.circleMarker([m[0].lat, m[0].lon], { radius: 7, weight: 3, fillOpacity: 1, className: 'mr-route-pin mr-route-pin--' + m[1] })
      .bindTooltip(m[2]).bindPopup(popupHtml, { className: 'mr-popup' }).addTo(routeLayer);
  });
}

function renderInfo(warnings) {
  info.replaceChildren();
  if (!route) { info.hidden = true; return; }
  var name = document.createElement('p');
  name.className = 'mr-m-0';
  name.textContent = title;
  name.style.fontWeight = '600';
  name.style.overflowWrap = 'anywhere';
  var meta = document.createElement('p');
  meta.className = 'mr-text-muted mr-text-sm mr-m-0';
  meta.textContent = route.points.length.toLocaleString('de-DE') + ' Punkte · Datei nur lokal gelesen';
  info.append(name, meta);
  warnings.forEach(function (w) {
    var p = document.createElement('p');
    p.className = 'mr-text-muted mr-text-sm mr-m-0';
    p.textContent = w;
    info.append(p);
  });
  info.hidden = false;
}

// Zustand der Oberfläche passend zur aktuellen Route (oder ohne Route).
function showCurrent() {
  btnClear.hidden = !route;
  btnLoad.disabled = false;
  btnLoad.textContent = route ? 'Andere GPX laden' : 'GPX laden';
  if (route) { var st = routeStatus(route); setSourceStatus('route', st.state, st.text); renderInfo(route.warnings); }
  else { setSourceStatus('route', 'none', ''); renderInfo([]); }
}

function frame() { return new Promise(function (r) { requestAnimationFrame(function () { setTimeout(r, 0); }); }); }

async function loadFile(file) {
  if (loading) return;
  var check = checkFile(file);
  if (!check.ok) { warn('route', check.error); return; }
  loading = true;
  unwarn('route');
  btnLoad.disabled = true;
  setSourceStatus('route', STATUS_LOADING.state, STATUS_LOADING.text);
  info.replaceChildren(); info.hidden = false;
  var busy = document.createElement('p');
  busy.className = 'mr-text-muted mr-text-sm mr-m-0';
  busy.textContent = STATUS_LOADING.text;
  info.append(busy);
  try {
    await frame();   // Hinweis erst zeichnen lassen: Parsen großer Dateien blockiert den Hauptthread (Messung RI1)
    var text = await file.text();
    var made = createRoute(parseGpx(text));
    if (!made.ok) { warn('route', made.error); return; }   // eine bereits geladene Route bleibt bestehen
    route = made.route;
    title = routeTitle(route, file.name);
    register();
    draw();
    if (!map.hasLayer(routeLayer)) map.addLayer(routeLayer);
    map.closePopup();
    revealMap();
    fitPadded(map, route.bounds, MAX_ZOOM);
  } catch (err) {
    console.error('Fehler beim Lesen der GPX-Datei', err);
    warn('route', 'Die Datei konnte nicht gelesen werden.');
  } finally {
    loading = false;
    showCurrent();
  }
}

function clearRoute() {
  route = null;
  routeLayer.clearLayers();
  map.closePopup();
  unwarn('route');
  showCurrent();
  btnLoad.focus();
}

export function initRoute() {
  btnLoad = document.getElementById('route-load');
  btnClear = document.getElementById('route-clear');
  fileInput = document.getElementById('route-file');
  info = document.getElementById('route-info');
  btnLoad.addEventListener('click', function () { fileInput.click(); });
  fileInput.addEventListener('change', function () {
    var file = fileInput.files && fileInput.files[0];
    fileInput.value = '';   // dieselbe Datei lässt sich danach erneut wählen
    if (file) loadFile(file);
  });
  btnClear.addEventListener('click', clearRoute);
  // Drag & Drop auf die Karte (Desktop)
  var dropArea = map.getContainer();
  function hasFiles(ev) { return ev.dataTransfer && Array.prototype.indexOf.call(ev.dataTransfer.types || [], 'Files') >= 0; }
  dropArea.addEventListener('dragover', function (ev) { if (hasFiles(ev)) { ev.preventDefault(); ev.dataTransfer.dropEffect = 'copy'; } });
  dropArea.addEventListener('drop', function (ev) {
    if (!hasFiles(ev)) return;
    ev.preventDefault();
    var file = ev.dataTransfer.files && ev.dataTransfer.files[0];
    if (file) loadFile(file);
  });
  showCurrent();
}