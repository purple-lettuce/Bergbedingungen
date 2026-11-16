// Eigene Route (RI3): GPX-Datei wählen, lesen, als Ebene "Meine Route" auf der Karte zeigen und wieder entfernen.
// Die Datei wird nur im Browser gelesen (File-API) und nicht übertragen (E1). Es ist genau eine Route zugleich geöffnet (E2); ohne Speichern verwirft Neuladen der Seite sie.
// Auf Wunsch wird die Route lokal im Browser gespeichert (RI6: route_store.js, Liste in route_saved.js, Regeln in route_store_logic.js).
// Parser, Modell, Statistik und Texte liegen in gpx.js, route_model.js, route_stats.js und route_logic.js; hier stehen nur Oberfläche und Karte.
// Texte aus der Datei (Name, Warnungen) gelangen nur über textContent oder esc() in die Seite.

import { map, routeLayer, esc, warn, unwarn } from './map.js';
import { panel } from './layers.js';
import { fitPadded, coveredInsets } from './layout.js';
import { revealMap } from './sheet.js';
import { setSourceStatus } from './status_bar.js';
import { parseGpx } from './gpx.js';
import { createRoute, displayLines } from './route_model.js';
import { checkFile, routeTitle, routeStatus, STATUS_LOADING } from './route_logic.js';
import { routeStats, statsRows } from './route_stats.js';
import { createProfile } from './elevation_profile.js';
import { store, newId } from './route_store.js';
import { canSave, makeMeta, storeErrorText } from './route_store_logic.js';
import { createSaved } from './route_saved.js';
import { initRouteContext, setRouteContext } from './route_context.js';
import { initRouteAvalanche, setRouteAvalanche } from './route_avalanche_view.js';
import { initRouteWeather, setRouteWeather } from './route_weather_view.js';

var DISPLAY_TOLERANCE_M = 3;   // Vereinfachung der Linie für die Darstellung; die Route selbst bleibt unverändert
var MAX_ZOOM = 15;

var route = null, stats = null, title = '', loading = false, registered = false;
var gpxText = '', savedId = null;   // Originaltext der geöffneten Route; Kennung im Speicher (null = nicht gespeichert)
var btnLoad, btnClear, btnSave, fileInput, info, profile, saved, posMarker = null;

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

// Marker für die Position, die im Höhenprofil gezeigt wird (null = ausblenden). Er liegt in der Routenebene und verschwindet mit ihr.
function showPosition(p) {
  if (!p) { if (posMarker) routeLayer.removeLayer(posMarker); return; }
  if (!posMarker) posMarker = L.circleMarker([p.lat, p.lon], { radius: 8, weight: 3, fillOpacity: 1, interactive: false, className: 'mr-route-pos' });
  posMarker.setLatLng([p.lat, p.lon]);
  if (!routeLayer.hasLayer(posMarker)) posMarker.addTo(routeLayer);
  // Marker nicht unter Seitenleiste oder Sheet liegen lassen (mobil verdeckt das Sheet mit dem Profil einen Teil der Karte)
  var ins = coveredInsets(map);
  map.panInside([p.lat, p.lon], { paddingTopLeft: [24 + ins.left, 24 + ins.top], paddingBottomRight: [24 + ins.right, 24 + ins.bottom], animate: false });
}

function draw() {
  routeLayer.clearLayers();
  posMarker = null;
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
  var view = statsRows(stats);
  var kv = document.createElement('dl');
  kv.className = 'mr-kv';
  view.rows.forEach(function (r) {
    var dt = document.createElement('dt'), dd = document.createElement('dd');
    dt.textContent = r.label;
    dd.textContent = r.value;
    kv.append(dt, dd);
  });
  info.append(kv);
  [view.caveat, view.note].forEach(function (text) {
    if (!text) return;
    var p = document.createElement('p');
    p.className = 'mr-text-muted mr-text-sm mr-m-0';
    p.textContent = text;
    info.append(p);
  });
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
  btnSave.hidden = !route || !!savedId;
  btnLoad.disabled = false;
  btnLoad.textContent = route ? 'Andere GPX laden' : 'GPX laden';
  if (route) { var st = routeStatus(route); setSourceStatus('route', st.state, st.text); renderInfo(route.warnings); }
  else { setSourceStatus('route', 'none', ''); renderInfo([]); }
}

function frame() { return new Promise(function (r) { requestAnimationFrame(function () { setTimeout(r, 0); }); }); }

// Öffnet eine Route aus einer Datei oder aus dem Speicher: readText() liefert den GPX-Text, meta ist der gespeicherte Datensatz (oder null).
async function load(readText, fileName, meta) {
  if (loading) return;
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
    var text = await readText();
    var made = createRoute(parseGpx(text));
    if (!made.ok) { warn('route', made.error); return; }   // eine bereits geladene Route bleibt bestehen
    route = made.route;
    gpxText = text;
    savedId = meta ? meta.id : null;
    stats = routeStats(route);
    title = meta ? meta.name : routeTitle(route, fileName);
    register();
    draw();
    setRouteContext(route);   // nach draw(): clearLayers entfernt die Hervorhebung der Abschnitte
    setRouteAvalanche(route);
    setRouteWeather(route);
    profile.show(route, stats);
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
    saved.setCurrent(savedId);
  }
}

function loadFile(file) {
  if (loading) return;
  var check = checkFile(file);
  if (!check.ok) { warn('route', check.error); return; }
  load(function () { return file.text(); }, file.name, null);
}

function openSaved(meta) {
  load(function () { return store.getFile(meta.id); }, meta.name, meta);
}

// Speichert die geöffnete Route auf Wunsch im Browser (nichts wird übertragen).
function saveCurrent() {
  if (!route || savedId || btnSave.disabled) return;
  var can = canSave(saved.count());
  if (!can.ok) { warn('route', can.error); return; }
  unwarn('route');
  var meta = makeMeta(newId(), title, route, new Blob([gpxText]).size, Date.now());
  btnSave.disabled = true;
  store.add(meta, gpxText).then(function () {
    savedId = meta.id;
    return saved.refresh();
  }).catch(function (err) {
    warn('route', storeErrorText(err));
  }).then(function () {
    btnSave.disabled = false;
    showCurrent();
    saved.setCurrent(savedId);
  });
}

function clearRoute() {
  route = null;
  stats = null;
  gpxText = '';
  savedId = null;
  profile.hide();
  routeLayer.clearLayers();
  setRouteContext(null);
  setRouteAvalanche(null);
  setRouteWeather(null);
  map.closePopup();
  unwarn('route');
  showCurrent();
  saved.setCurrent(null);
  btnLoad.focus();
}

export function initRoute() {
  btnLoad = document.getElementById('route-load');
  btnClear = document.getElementById('route-clear');
  btnSave = document.getElementById('route-save');
  fileInput = document.getElementById('route-file');
  info = document.getElementById('route-info');
  initRouteContext(document.getElementById('route-context'));
  initRouteAvalanche(document.getElementById('route-avalanche'));
  initRouteWeather(document.getElementById('route-weather'));
  profile = createProfile(document.getElementById('route-profile'), showPosition);
  btnLoad.addEventListener('click', function () { fileInput.click(); });
  fileInput.addEventListener('change', function () {
    var file = fileInput.files && fileInput.files[0];
    fileInput.value = '';   // dieselbe Datei lässt sich danach erneut wählen
    if (file) loadFile(file);
  });
  btnClear.addEventListener('click', clearRoute);
  btnSave.addEventListener('click', saveCurrent);
  saved = createSaved(document.getElementById('route-saved'), document.getElementById('route-saved-list'), document.getElementById('route-saved-note'), {
    open: openSaved,
    error: function (text) { warn('route', text); },
    renamed: function (id, name) { if (id === savedId) { title = name; showCurrent(); } },
    removed: function (id) { if (id === savedId) { savedId = null; showCurrent(); saved.setCurrent(null); } }
  });
  saved.refresh();
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