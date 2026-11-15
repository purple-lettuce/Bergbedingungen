// "Entlang der Route" (RI8): zeigt, welche Schutzgebiete und Sperrungen/Hinweise die geöffnete Route in den bereits geladenen Daten berühren
// (kein neuer Abruf). Schnitt: route_overlay.js (RI7), Zusammenfassung und Texte: route_context_logic.js, Datenquellen: route_sources.js.
// Klick auf einen Eintrag springt zum ersten Abschnitt und öffnet dasselbe Popup wie in der Karte. Betroffene Abschnitte der Route sind
// auf der Karte als gepunktete Linie über der Routenlinie hervorgehoben; die Warnfarben der Daten bleiben unverändert.
// Texte aus den Daten gelangen nur über textContent in die Seite; das Popup-HTML kommt maskiert aus den Quellen.

import { map, routeLayer } from './map.js';
import { fitPadded } from './layout.js';
import { revealMap } from './sheet.js';
import { prepareFeatures, routeOverlay } from './route_overlay.js';
import { getRouteSource, onRouteSource } from './route_sources.js';
import { SOURCES, buildEntries, rangesText, summarize, sectionPath, sectionMiddle } from './route_context_logic.js';

var MAX_ZOOM = 16;

var box = null, route = null, token = 0, timer = null;
var cache = {};                       // Quellen-ID -> { features, prep } (Vorbereitung der Features nur einmal je Datensatz)
var hitGroup = L.layerGroup();        // Hervorhebung, hängt in der Routenebene

function el(tag, cls, text) {
  var e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text != null) e.textContent = text;
  return e;
}

function compute() {
  var results = {};
  SOURCES.forEach(function (src) {
    var s = getRouteSource(src.id);
    if (!s) { results[src.id] = { state: 'pending', entries: [] }; return; }
    if (s.state !== 'ready') { results[src.id] = { state: 'failed', entries: [] }; return; }
    try {
      var c = cache[src.id];
      if (!c || c.features !== s.features) c = cache[src.id] = { features: s.features, prep: prepareFeatures(s.features, function (f, i) { return i; }) };
      var out = routeOverlay(route, c.prep);
      results[src.id] = { state: 'ready', entries: buildEntries(out.sections, s.describe), info: { count: s.count, stand: s.stand } };
    } catch (err) {
      console.error('Fehler beim Schnitt der Route mit ' + src.label, err);
      results[src.id] = { state: 'failed', entries: [] };
    }
  });
  return results;
}

function focusEntry(entry) {
  var r = entry.ranges[0];
  var path = sectionPath(route, r[0], r[1]);
  var mid = sectionMiddle(route, r[0], r[1]);
  if (!path.length || !mid) return;
  revealMap();   // mobil gibt das Bottom Sheet die Karte frei, bevor die Ränder berechnet werden
  fitPadded(map, L.latLngBounds(path), MAX_ZOOM);
  L.popup(entry.popupOptions || { className: 'mr-popup' }).setLatLng([mid.lat, mid.lon]).setContent(entry.popupHtml).openOn(map);
}

function highlight(results) {
  hitGroup.clearLayers();
  SOURCES.forEach(function (src) {
    (results[src.id].entries || []).forEach(function (e) {
      e.ranges.forEach(function (r) {
        var path = sectionPath(route, r[0], r[1]);
        if (path.length > 1) L.polyline(path, { className: 'mr-route-hit', interactive: false, lineCap: 'round' }).addTo(hitGroup);
      });
    });
  });
  if (!routeLayer.hasLayer(hitGroup)) hitGroup.addTo(routeLayer);
}

function render(results) {
  box.replaceChildren(el('h3', 'mr-label', 'Entlang der Route'));
  var sum = summarize(results);
  box.append(el('p', 'mr-m-0', sum.headline));
  SOURCES.forEach(function (src) {
    var entries = results[src.id].entries;
    if (!entries.length) return;
    var group = el('div', 'mr-stack mr-gap-xs');
    group.append(el('h4', 'mr-label', src.label));
    var list = el('ul', 'mr-saved');
    entries.forEach(function (e) {
      var li = el('li');
      var b = el('button', 'mr-ctx__item');
      b.type = 'button';
      b.append(el('span', 'mr-saved__name', e.title), el('span', 'mr-text-muted mr-text-sm', [e.meta, rangesText(e)].filter(Boolean).join(' · ')));
      b.setAttribute('aria-label', e.title + ', ' + rangesText(e) + ', Karte zeigen');
      b.addEventListener('click', function () { focusEntry(e); });
      li.append(b);
      list.append(li);
    });
    group.append(list);
    box.append(group);
  });
  sum.notes.forEach(function (t) { box.append(el('p', 'mr-text-muted mr-text-sm mr-m-0', t)); });
}

function update() {
  clearTimeout(timer);
  var mine = ++token;
  if (!box) return;
  if (!route) { box.hidden = true; box.replaceChildren(); hitGroup.clearLayers(); return; }
  box.hidden = false;
  box.replaceChildren(el('h3', 'mr-label', 'Entlang der Route'), el('p', 'mr-text-muted mr-text-sm mr-m-0', 'Wird geprüft …'));
  // erst zeichnen lassen: die Vorbereitung der Schutzgebiete dauert beim ersten Mal einige hundert Millisekunden
  timer = setTimeout(function () {
    if (mine !== token) return;
    var results = compute();
    render(results);
    highlight(results);
  }, 30);
}

export function initRouteContext(container) {
  box = container;
  onRouteSource(function () { if (route) update(); });
}

// Neue Route (oder null ohne Route). Muss nach dem Zeichnen der Routenebene aufgerufen werden, weil clearLayers die Hervorhebung entfernt.
export function setRouteContext(r) {
  route = r;
  update();
}
