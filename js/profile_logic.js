// Höhenprofil (RI5), reine Logik ohne Zugriff auf die Seite: Datenreihe, Abtastung auf Pixelbreite, Skalierung, Achsenmarken, Tastaturschritte, Textalternative.
// Alle Höhen stammen aus der Datei (E3). Fehlende Höhen sind null und werden übersprungen, nie als 0 gezeichnet; an Lücken der Route wird die Linie unterbrochen.
// Das Diagramm selbst (SVG, Ereignisse) steht in elevation_profile.js.

import { formatKm, formatMeters } from './route_stats.js';

export const MIN_SPAN_M = 20;   // kleinster dargestellter Höhenbereich: eine fast flache Strecke wird nicht zum Gebirge aufgeblasen

// Datenreihe { runs, lengthM, minEle, maxEle } mit runs = Linienzüge [{ d (Meter ab Start), e }], getrennt an Lücken der Route.
// null, wenn die Route weniger als zwei Punkte mit Höhe hat oder keine Länge.
export function profileSeries(route) {
  var gapAfter = {};
  route.gaps.forEach(function (g) { gapAfter[g.afterIndex] = true; });
  var runs = [], cur = [], min = null, max = null, n = 0;
  route.points.forEach(function (p, i) {
    if (p.ele != null) {
      cur.push({ d: p.dist, e: p.ele });
      n++;
      if (min == null || p.ele < min) min = p.ele;
      if (max == null || p.ele > max) max = p.ele;
    }
    if (gapAfter[i] && cur.length) { runs.push(cur); cur = []; }
  });
  if (cur.length) runs.push(cur);
  if (n < 2 || !(route.lengthM > 0)) return null;
  return { runs: runs, lengthM: route.lengthM, minEle: min, maxEle: max };
}

// Abtastung auf die Pixelbreite: je Pixelspalte bleiben höchstens der kleinste und der größte Wert (Spitzen und Mulden bleiben erhalten),
// die Reihenfolge bleibt wie in der Eingabe. Bei höchstens 2 Punkten je Spalte im Mittel wird nichts verändert.
export function decimate(run, lengthM, widthPx) {
  var cols = Math.max(1, Math.floor(widthPx));
  if (run.length <= cols * 2) return run.slice();
  var out = [], i = 0;
  while (i < run.length) {
    var c = Math.min(cols - 1, Math.floor(run[i].d / lengthM * cols)), lo = run[i], hi = run[i], first = run[i], last = run[i];
    while (i < run.length && Math.min(cols - 1, Math.floor(run[i].d / lengthM * cols)) === c) {
      var p = run[i];
      if (p.e < lo.e) lo = p;
      if (p.e > hi.e) hi = p;
      last = p;
      i++;
    }
    var keep = [first, lo, hi, last].filter(function (p, k, a) { return a.indexOf(p) === k; });
    keep.sort(function (a, b) { return a.d - b.d; });
    keep.forEach(function (p) { out.push(p); });
  }
  return out;
}

// "Schöne" Achsenmarken: Schrittweite 1, 2 oder 5 mal Zehnerpotenz, höchstens etwa target Marken. Ergebnis { min, max, step, ticks }, min/max umfassen den Bereich.
export function niceTicks(lo, hi, target) {
  var span = hi - lo;
  if (!(span > 0)) span = 1;
  var raw = span / Math.max(1, target), pow = Math.pow(10, Math.floor(Math.log10(raw))), f = raw / pow;
  var step = (f <= 1 ? 1 : f <= 2 ? 2 : f <= 5 ? 5 : 10) * pow;
  var a = Math.floor(lo / step + 1e-9), b = Math.ceil(hi / step - 1e-9), ticks = [];
  for (var k = a; k <= b; k++) ticks.push(parseFloat((k * step).toPrecision(12)));
  return { min: ticks[0], max: ticks[ticks.length - 1], step: step, ticks: ticks };
}

// Skalierung. opts { lengthM, minEle, maxEle, width, height, left, right, top, bottom }. Ergebnis mit x(m), y(ele), meterAt(px) (auf [0, lengthM] begrenzt),
// Zeichenfläche plot { x0, x1, y0, y1 } und den Achsenmarken yTicks (Höhe) und xTicks (Meter, Kilometer-Schritte).
export function makeScale(o) {
  var x0 = o.left, x1 = o.width - o.right, y0 = o.top, y1 = o.height - o.bottom;
  var lo = o.minEle, hi = o.maxEle;
  if (hi - lo < MIN_SPAN_M) { var mid = (hi + lo) / 2; lo = mid - MIN_SPAN_M / 2; hi = mid + MIN_SPAN_M / 2; }
  var yt = niceTicks(lo, hi, Math.max(2, Math.floor((y1 - y0) / 32)));
  var xt = niceTicks(0, o.lengthM / 1000, Math.max(2, Math.floor((x1 - x0) / 70)));
  var xTicks = xt.ticks.filter(function (t) { return t * 1000 <= o.lengthM + 1e-6; });
  return {
    plot: { x0: x0, x1: x1, y0: y0, y1: y1 },
    yMin: yt.min, yMax: yt.max, yTicks: yt.ticks, xTicksKm: xTicks, xStepKm: xt.step,
    x: function (m) { return x0 + (x1 - x0) * m / o.lengthM; },
    y: function (e) { return y1 - (y1 - y0) * (e - yt.min) / (yt.max - yt.min); },
    meterAt: function (px) { return Math.max(0, Math.min(o.lengthM, (px - x0) / (x1 - x0) * o.lengthM)); }
  };
}

function fx(v) { return (Math.round(v * 10) / 10).toString(); }

// SVG-Pfade: line (je Linienzug ein "M…L…") und area (je Linienzug eine geschlossene Fläche zur Grundlinie).
export function profilePaths(series, scale) {
  var line = '', area = '';
  series.runs.forEach(function (run) {
    var pts = decimate(run, series.lengthM, scale.plot.x1 - scale.plot.x0);
    if (pts.length < 2) return;
    var d = pts.map(function (p, i) { return (i ? 'L' : 'M') + fx(scale.x(p.d)) + ' ' + fx(scale.y(p.e)); }).join('');
    line += d;
    area += d + 'L' + fx(scale.x(pts[pts.length - 1].d)) + ' ' + fx(scale.plot.y1) + 'L' + fx(scale.x(pts[0].d)) + ' ' + fx(scale.plot.y1) + 'Z';
  });
  return { line: line, area: area };
}

// Tastaturschritt in Metern. Pfeil: 1 % der Länge (mindestens 1 m), Bild: 10 %, Pos1/Ende: Anfang bzw. Ende. Gibt die neue Position oder null (Taste ohne Wirkung).
export function stepPosition(m, lengthM, key) {
  var small = Math.max(1, lengthM / 100), big = lengthM / 10, v;
  if (key === 'ArrowRight' || key === 'ArrowUp') v = m + small;
  else if (key === 'ArrowLeft' || key === 'ArrowDown') v = m - small;
  else if (key === 'PageUp') v = m + big;
  else if (key === 'PageDown') v = m - big;
  else if (key === 'Home') v = 0;
  else if (key === 'End') v = lengthM;
  else return null;
  return Math.max(0, Math.min(lengthM, v));
}

// Text zur aktuellen Position, z. B. "km 3,2 · 1.845 m". Ohne Höhe an der Stelle: "keine Höhe".
export function positionText(point) {
  return 'km ' + (point.dist / 1000).toLocaleString('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + ' · ' +
    (point.ele == null ? 'keine Höhe' : formatMeters(point.ele));
}

// Textalternative mit Kerndaten für Screenreader und als sichtbare Kurzfassung.
export function profileSummary(stats) {
  return 'Höhenprofil über ' + formatKm(stats.lengthM) + ': von ' + formatMeters(stats.minEle) + ' bis ' + formatMeters(stats.maxEle) +
    ', Anstieg ' + formatMeters(stats.ascentM) + ', Abstieg ' + formatMeters(stats.descentM) + '.';
}
