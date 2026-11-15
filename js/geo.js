// Geometrie für Routen (RI2), reine Logik ohne Karte und ohne Zugriff auf die Seite.
// Punkte sind { lat, lon } in Grad (WGS84), Strecken in Metern (E3). Punktlisten mit Streckenposition tragen zusätzlich dist
// (Meter ab Start, nicht fallend); sie entstehen mit cumulativeDistances oder in route_model.js.
// Genauigkeit: Haversine auf der Kugel (R = 6 371 008,8 m) weicht vom Ellipsoid um bis zu rund 0,5 % ab; die lokale Projektion für
// Abstand und Vereinfachung ist für Strecken bis einige zehn Kilometer um den Bezugspunkt auf Zentimeter genau.

const R = 6371008.8;
const RAD = Math.PI / 180;

export function haversine(a, b) {
  var dLat = (b.lat - a.lat) * RAD, dLon = (b.lon - a.lon) * RAD;
  var s = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(a.lat * RAD) * Math.cos(b.lat * RAD) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(s)));
}

// Streckenposition je Punkt in Metern (erster Punkt 0). gapAfter: Indizes i, nach denen eine Lücke liegt; der Sprung von i nach i+1
// zählt nicht zur Strecke.
export function cumulativeDistances(points, gapAfter) {
  var gaps = new Set(gapAfter || []);
  var out = new Array(points.length), d = 0;
  for (var i = 0; i < points.length; i++) {
    if (i > 0 && !gaps.has(i - 1)) d += haversine(points[i - 1], points[i]);
    out[i] = d;
  }
  return out;
}

// Punkt bei Streckenkilometer: points mit dist. km wird auf [0, Gesamtlänge] begrenzt. Ergebnis { lat, lon, ele, dist }; ele wird
// nur interpoliert, wenn beide Nachbarn eine Höhe haben, sonst null. Lat/Lon werden linear zwischen den Nachbarn interpoliert
// (bei Abständen von wenigen hundert Metern ohne messbaren Fehler).
export function pointAtKm(points, km) {
  if (!points.length) return null;
  var total = points[points.length - 1].dist, m = km * 1000;
  if (!(m > 0)) m = 0;
  if (m > total) m = total;
  var lo = 0, hi = points.length - 1;
  while (lo < hi) { var mid = (lo + hi) >> 1; if (points[mid].dist >= m) hi = mid; else lo = mid + 1; }
  var q = points[lo];
  if (lo === 0) return { lat: q.lat, lon: q.lon, ele: q.ele == null ? null : q.ele, dist: m };
  var p = points[lo - 1], span = q.dist - p.dist;
  if (span <= 0) return { lat: q.lat, lon: q.lon, ele: q.ele == null ? null : q.ele, dist: m };
  var t = (m - p.dist) / span;
  return {
    lat: p.lat + (q.lat - p.lat) * t,
    lon: p.lon + (q.lon - p.lon) * t,
    ele: p.ele != null && q.ele != null ? p.ele + (q.ele - p.ele) * t : null,
    dist: m
  };
}

// Abtastung in festen Abständen (stepM > 0): Start, alle stepM Meter, Ziel. Jeder Eintrag wie bei pointAtKm.
export function sampleAlong(points, stepM) {
  if (!points.length) return [];
  if (!(stepM > 0)) throw new Error('stepM muss größer als 0 sein');
  var total = points[points.length - 1].dist, out = [];
  for (var d = 0; d < total; d += stepM) out.push(pointAtKm(points, d / 1000));
  out.push(pointAtKm(points, total / 1000));
  return out;
}

// Lokale ebene Projektion (Meter) um einen Bezugspunkt.
function projector(lat0, lon0) {
  var k = Math.cos(lat0 * RAD);
  return function (p) { return [(p.lon - lon0) * RAD * R * k, (p.lat - lat0) * RAD * R]; };
}

function segmentDistance(px, py, ax, ay, bx, by) {
  var dx = bx - ax, dy = by - ay, len2 = dx * dx + dy * dy;
  var t = len2 > 0 ? Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / len2)) : 0;
  var cx = ax + t * dx, cy = ay + t * dy;
  return { d: Math.hypot(px - cx, py - cy), t: t };
}

// Kürzester Abstand eines Punktes zur Linie in Metern. points mit dist; gapAfter wie bei cumulativeDistances (Lückensprünge sind
// keine Linie). Ergebnis { distance, km, index } (km = Streckenposition des nächsten Punktes, index = Anfangspunkt des Segments)
// oder null, wenn die Linie keinen Punkt hat.
export function distanceToLine(p, points, gapAfter) {
  if (!points.length) return null;
  var gaps = new Set(gapAfter || []), proj = projector(p.lat, p.lon);
  if (points.length === 1) { var q = proj(points[0]); return { distance: Math.hypot(q[0], q[1]), km: points[0].dist / 1000, index: 0 }; }
  var best = null, a = proj(points[0]);
  for (var i = 0; i < points.length - 1; i++) {
    var b = proj(points[i + 1]);
    if (!gaps.has(i)) {
      var r = segmentDistance(0, 0, a[0], a[1], b[0], b[1]);
      if (!best || r.d < best.distance) best = { distance: r.d, km: (points[i].dist + (points[i + 1].dist - points[i].dist) * r.t) / 1000, index: i };
    }
    a = b;
  }
  return best;
}

// Douglas-Peucker für die Darstellung: gibt die Indizes der behaltenen Punkte zurück (aufsteigend, Anfang und Ende immer dabei).
// toleranceM = größte erlaubte Abweichung der vereinfachten Linie in Metern. Iterativ, damit lange Tracks den Aufrufstapel nicht sprengen.
export function simplify(points, toleranceM) {
  var n = points.length;
  if (n <= 2) return points.map(function (_, i) { return i; });
  var lat0 = 0, lon0 = points[0].lon;
  for (var i = 0; i < n; i++) lat0 += points[i].lat;
  var proj = projector(lat0 / n, lon0);
  var xy = points.map(proj), keep = new Uint8Array(n), stack = [[0, n - 1]];
  keep[0] = 1; keep[n - 1] = 1;
  while (stack.length) {
    var s = stack.pop(), first = s[0], last = s[1], maxD = -1, idx = -1;
    for (var j = first + 1; j < last; j++) {
      var d = segmentDistance(xy[j][0], xy[j][1], xy[first][0], xy[first][1], xy[last][0], xy[last][1]).d;
      if (d > maxD) { maxD = d; idx = j; }
    }
    if (idx >= 0 && maxD > toleranceM) { keep[idx] = 1; stack.push([first, idx], [idx, last]); }
  }
  var out = [];
  for (var k = 0; k < n; k++) if (keep[k]) out.push(k);
  return out;
}