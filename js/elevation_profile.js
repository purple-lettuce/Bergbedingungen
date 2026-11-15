// Höhenprofil (RI5): SVG-Diagramm Höhe über Strecke in der Routenkarte, ohne Diagrammbibliothek (E14).
// Zeigen, Berühren oder Pfeiltasten melden die Position über onMove({ lat, lon, ele, dist }) bzw. onMove(null); die Karte zeichnet den Marker (route.js).
// Berechnung und Skalierung stehen in profile_logic.js. Alle Texte sind feste Texte oder Zahlen, nichts aus der Datei gelangt als HTML in die Seite.

import { pointAtKm } from './geo.js';
import { profileSeries, makeScale, profilePaths, stepPosition, positionText, profileSummary } from './profile_logic.js';

var NS = 'http://www.w3.org/2000/svg';
var HEIGHT = 150;
var MARGIN = { left: 44, right: 8, top: 8, bottom: 20 };

function el(name, attrs, parent) {
  var n = document.createElementNS(NS, name);
  Object.keys(attrs || {}).forEach(function (k) { n.setAttribute(k, attrs[k]); });
  if (parent) parent.appendChild(n);
  return n;
}

export function createProfile(host, onMove) {
  var route = null, stats = null, series = null, scale = null, pos = null, width = 0;
  var box, svg, readout, summary, cursor = null, dot = null;

  host.hidden = true;
  box = document.createElement('div');
  box.className = 'mr-profile';
  box.tabIndex = 0;
  box.setAttribute('role', 'slider');
  box.setAttribute('aria-label', 'Position im Höhenprofil');
  box.setAttribute('aria-orientation', 'horizontal');
  svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('class', 'mr-profile__svg');
  svg.setAttribute('aria-hidden', 'true');
  box.appendChild(svg);
  readout = document.createElement('p');
  readout.className = 'mr-text-sm mr-m-0 mr-profile__readout';
  summary = document.createElement('p');
  summary.id = 'route-profile-summary';
  summary.className = 'mr-text-muted mr-text-sm mr-m-0';
  box.setAttribute('aria-describedby', summary.id);
  host.append(box, readout, summary);

  function emit() {
    if (pos == null) { onMove(null); return; }
    onMove(pointAtKm(route.points, pos / 1000));
  }

  function updateCursor() {
    if (cursor) { cursor.remove(); cursor = null; }
    if (dot) { dot.remove(); dot = null; }
    if (pos == null || !scale) {
      readout.textContent = 'Zeigen oder tippen Sie ins Profil, um die Stelle auf der Karte zu sehen.';
      box.removeAttribute('aria-valuetext');
      return;
    }
    var p = pointAtKm(route.points, pos / 1000), x = scale.x(pos);
    cursor = el('line', { class: 'mr-profile__cursor', x1: x, x2: x, y1: scale.plot.y0, y2: scale.plot.y1 }, svg);
    if (p.ele != null) dot = el('circle', { class: 'mr-profile__dot', cx: x, cy: scale.y(p.ele), r: 4 }, svg);
    readout.textContent = positionText(p);
    box.setAttribute('aria-valuenow', Math.round(pos));
    box.setAttribute('aria-valuetext', positionText(p));
  }

  function render() {
    if (!series) return;
    var w = Math.floor(host.clientWidth);
    if (w < 120) return;   // verborgen oder noch ohne Breite
    width = w;
    svg.replaceChildren();
    svg.setAttribute('viewBox', '0 0 ' + w + ' ' + HEIGHT);
    svg.setAttribute('width', w);
    svg.setAttribute('height', HEIGHT);
    scale = makeScale({ lengthM: series.lengthM, minEle: series.minEle, maxEle: series.maxEle, width: w, height: HEIGHT,
      left: MARGIN.left, right: MARGIN.right, top: MARGIN.top, bottom: MARGIN.bottom });
    var pl = scale.plot;
    scale.yTicks.forEach(function (t) {
      var y = scale.y(t);
      el('line', { class: 'mr-profile__grid', x1: pl.x0, x2: pl.x1, y1: y, y2: y }, svg);
      var tx = el('text', { class: 'mr-profile__label', x: pl.x0 - 6, y: y + 4, 'text-anchor': 'end' }, svg);
      tx.textContent = Math.round(t).toLocaleString('de-DE');
    });
    scale.xTicksKm.forEach(function (t) {
      var x = scale.x(t * 1000);
      el('line', { class: 'mr-profile__tick', x1: x, x2: x, y1: pl.y1, y2: pl.y1 + 4 }, svg);
      var tx = el('text', { class: 'mr-profile__label', x: x, y: pl.y1 + 15, 'text-anchor': t === 0 ? 'start' : 'middle' }, svg);
      tx.textContent = t.toLocaleString('de-DE') + (t === 0 ? ' km' : '');
    });
    var paths = profilePaths(series, scale);
    el('path', { class: 'mr-profile__area', d: paths.area }, svg);
    el('path', { class: 'mr-profile__line', d: paths.line }, svg);
    cursor = null; dot = null;
    updateCursor();
  }

  function setFromEvent(ev) {
    var r = svg.getBoundingClientRect();
    if (!scale || !r.width) return;
    pos = scale.meterAt((ev.clientX - r.left) * (width / r.width));
    updateCursor();
    emit();
  }

  box.addEventListener('pointerdown', function (ev) {
    if (!series) return;
    if (ev.pointerType !== 'mouse') box.setPointerCapture(ev.pointerId);
    setFromEvent(ev);
  });
  box.addEventListener('pointermove', function (ev) {
    if (!series) return;
    if (ev.pointerType === 'mouse' || ev.buttons) setFromEvent(ev);
  });
  box.addEventListener('pointerleave', function (ev) {
    if (ev.pointerType === 'mouse') { pos = null; updateCursor(); emit(); }
  });
  box.addEventListener('keydown', function (ev) {
    if (!series) return;
    var next = stepPosition(pos == null ? 0 : pos, series.lengthM, ev.key);
    if (next == null) {
      if (ev.key === 'Escape' && pos != null) { pos = null; updateCursor(); emit(); ev.preventDefault(); }
      return;
    }
    ev.preventDefault();
    pos = next;
    updateCursor();
    emit();
  });
  box.addEventListener('blur', function () { if (pos != null && !box.matches(':hover')) { pos = null; updateCursor(); emit(); } });

  if (typeof ResizeObserver === 'function') new ResizeObserver(function () { if (series && Math.floor(host.clientWidth) !== width) render(); }).observe(host);

  return {
    // Zeigt das Profil für die Route; ohne mindestens zwei Höhenwerte bleibt der Bereich verborgen (keine Fehlermeldung nötig, die Statistik nennt es).
    show: function (r, s) {
      route = r; stats = s; series = profileSeries(r); pos = null; scale = null; width = 0;
      host.hidden = !series;
      if (!series) return;
      box.setAttribute('aria-valuemin', 0);
      box.setAttribute('aria-valuemax', Math.round(series.lengthM));
      summary.textContent = profileSummary(Object.assign({}, s, { minEle: series.minEle, maxEle: series.maxEle }));
      render();
      updateCursor();
    },
    hide: function () { route = null; stats = null; series = null; scale = null; pos = null; host.hidden = true; svg.replaceChildren(); onMove(null); }
  };
}
