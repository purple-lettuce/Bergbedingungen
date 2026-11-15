// Räumlicher Schnitt Route × Geometrien (RI7, erweitert in RI8), reine Logik ohne Karte, Seite und Datenzugriff.
// Eingabe: Routenobjekt aus route_model.js (points mit dist, gaps) und GeoJSON-Features (Koordinaten [lon, lat]).
// Polygon und MultiPolygon gelten als berührt, wenn die Route darin liegt. Linien und Punkte (LineString, MultiLineString, Point,
// MultiPoint; in RI8 für Sperrungen) gelten als berührt, wenn die Route höchstens NEAR_M Meter entfernt ist; GeometryCollection wird
// aufgelöst. Ein Feature kann beides enthalten.
// Ausgabe: Abschnitte { featureId, fromKm, toKm } in Streckenkilometern der Route. Die Logik kennt weder Schutzgebiete noch Lawinen.
//
// Verfahren (E6): Die Route wird je zusammenhängendem Stück (an Lücken getrennt) alle SAMPLE_STEP_M Meter abgetastet. Jede Probe wird
// gegen die Features geprüft, deren Umgebungsrechteck die Probe enthält (Vorauswahl je Teilgeometrie). Zusammenhängende Proben
// innerhalb eines Features bilden einen Abschnitt; Ein- und Austritt werden zwischen der letzten Probe außen und der ersten innen durch
// Halbieren auf rund 1 mm eingegrenzt. Abschnitte entstehen also aus Ereignissen, nicht aus festen Längen.
// Grenzen: Ein Polygon, das die Route zwischen zwei Proben durchquert, ohne dass eine Probe darin liegt (kürzer als der Abtastabstand),
// wird nicht gefunden. Bei Linien und Punkten ist das Band 2 * NEAR_M breit und damit breiter als der Abtastabstand: eine Kreuzung
// entgeht nicht. Ein Punkt genau auf dem Rand gilt je nach Kante als innen oder außen (Strahlverfahren); das wirkt sich nur im
// Bereich von Millimetern aus. Abschnitte reichen nie über eine Lücke der Route hinweg. Ungültige Features werden übersprungen und gezählt.

import { pointAtKm } from './geo.js';

export const SAMPLE_STEP_M = 25;
export const NEAR_M = 30;          // Linien und Punkte gelten als berührt, wenn die Route höchstens so weit entfernt ist (vorläufig, GPS-Genauigkeit)
const BISECT_ITERATIONS = 14;   // 25 m / 2^14 ≈ 1,5 mm

function validCoord(c) {
  return Array.isArray(c) && c.length >= 2 && typeof c[0] === 'number' && typeof c[1] === 'number' && isFinite(c[0]) && isFinite(c[1]) && Math.abs(c[1]) <= 90 && Math.abs(c[0]) <= 180;
}

// Ring (Array von [lon, lat]) → flache Zahlenliste [lon0, lat0, lon1, lat1, …] oder null, wenn ungültig oder zu kurz.
function flatRing(ring) {
  if (!Array.isArray(ring) || ring.length < 3) return null;
  var out = new Array(ring.length * 2);
  for (var i = 0; i < ring.length; i++) {
    if (!validCoord(ring[i])) return null;
    out[2 * i] = ring[i][0];
    out[2 * i + 1] = ring[i][1];
  }
  return out;
}

// Polygon (Array von Ringen: außen, dann Löcher) → { rings, bbox: [minLon, minLat, maxLon, maxLat] } oder null.
function preparePolygon(rings) {
  if (!Array.isArray(rings) || !rings.length) return null;
  var flat = [];
  for (var r = 0; r < rings.length; r++) { var f = flatRing(rings[r]); if (!f) return null; flat.push(f); }
  var outer = flat[0], b = [Infinity, Infinity, -Infinity, -Infinity];
  for (var i = 0; i < outer.length; i += 2) {
    if (outer[i] < b[0]) b[0] = outer[i];
    if (outer[i + 1] < b[1]) b[1] = outer[i + 1];
    if (outer[i] > b[2]) b[2] = outer[i];
    if (outer[i + 1] > b[3]) b[3] = outer[i + 1];
  }
  return { rings: flat, bbox: b };
}

function ringContains(flat, lon, lat) {
  var inside = false, n = flat.length / 2;
  for (var i = 0, j = n - 1; i < n; j = i++) {
    var xi = flat[2 * i], yi = flat[2 * i + 1], xj = flat[2 * j], yj = flat[2 * j + 1];
    if ((yi > lat) !== (yj > lat) && lon < (xj - xi) * (lat - yi) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

// Punkt in Polygon mit Löchern (Strahlverfahren). polygon wie aus preparePolygon; ein Punkt in einem Loch liegt außerhalb.
export function pointInPolygon(lon, lat, polygon) {
  var b = polygon.bbox;
  if (lon < b[0] || lon > b[2] || lat < b[1] || lat > b[3]) return false;
  if (!ringContains(polygon.rings[0], lon, lat)) return false;
  for (var h = 1; h < polygon.rings.length; h++) if (ringContains(polygon.rings[h], lon, lat)) return false;
  return true;
}

function defaultId(feature, index) {
  if (feature.id != null) return feature.id;
  var p = feature.properties || {};
  if (p.uuid != null) return p.uuid;
  if (p.id != null) return p.id;
  return index;
}

// Linie (Array von [lon, lat], mindestens ein Punkt) → flache Zahlenliste oder null, wenn ungültig.
function flatLine(line) {
  if (!Array.isArray(line) || !line.length) return null;
  var out = new Array(line.length * 2);
  for (var i = 0; i < line.length; i++) {
    if (!validCoord(line[i])) return null;
    out[2 * i] = line[i][0];
    out[2 * i + 1] = line[i][1];
  }
  return out;
}

const M_PER_DEG = 111194.93;   // Meter je Grad Breite (Kugel wie geo.js)

// Abstand eines Punkts zu einer flachen Linie (ein Punkt = Linie aus einem Koordinatenpaar) in Metern; lokale ebene Projektion
// um den Punkt (bis einige hundert Meter ohne messbaren Fehler).
function distanceToFlat(lon, lat, flat) {
  var kx = Math.cos(lat * Math.PI / 180) * M_PER_DEG, ky = M_PER_DEG, best = Infinity, n = flat.length / 2;
  for (var i = 0; i < n; i++) {
    var ax = (flat[2 * i] - lon) * kx, ay = (flat[2 * i + 1] - lat) * ky, d;
    if (i === n - 1 && n > 1) break;
    if (n === 1) d = Math.sqrt(ax * ax + ay * ay);
    else {
      var bx = (flat[2 * i + 2] - lon) * kx, by = (flat[2 * i + 3] - lat) * ky, dx = bx - ax, dy = by - ay, len2 = dx * dx + dy * dy;
      var t = len2 > 0 ? Math.max(0, Math.min(1, -(ax * dx + ay * dy) / len2)) : 0;
      var cx = ax + t * dx, cy = ay + t * dy;
      d = Math.sqrt(cx * cx + cy * cy);
    }
    if (d < best) best = d;
  }
  return best;
}

// Teilgeometrien eines Features einsammeln: Polygone (Ringlisten), Linien und Punkte (jeweils als Koordinatenlisten).
function collect(g, polys, lines) {
  if (!g || !Array.isArray(g.coordinates) && g.type !== 'GeometryCollection') return;
  switch (g.type) {
    case 'Polygon': polys.push(g.coordinates); break;
    case 'MultiPolygon': g.coordinates.forEach(function (c) { polys.push(c); }); break;
    case 'LineString': lines.push(g.coordinates); break;
    case 'MultiLineString': g.coordinates.forEach(function (c) { lines.push(c); }); break;
    case 'Point': lines.push([g.coordinates]); break;
    case 'MultiPoint': g.coordinates.forEach(function (c) { lines.push([c]); }); break;
    case 'GeometryCollection': (g.geometries || []).forEach(function (x) { collect(x, polys, lines); }); break;
  }
}

function extend(bbox, b) {
  bbox[0] = Math.min(bbox[0], b[0]); bbox[1] = Math.min(bbox[1], b[1]);
  bbox[2] = Math.max(bbox[2], b[2]); bbox[3] = Math.max(bbox[3], b[3]);
}

// Bereitet Features einmal vor (Umgebungsrechtecke, flache Koordinaten). Das Ergebnis lässt sich für mehrere Routen wiederverwenden.
// nearM: Entfernung, bis zu der Linien und Punkte als berührt gelten (Standard NEAR_M).
// Ergebnis { items: [{ id, polygons, lines, bbox, nearM }], skipped } – skipped zählt Features ohne gültige Geometrie.
export function prepareFeatures(features, idOf, nearM) {
  var items = [], skipped = 0, near = nearM >= 0 ? nearM : NEAR_M;
  (features || []).forEach(function (f, index) {
    var polys = [], rawLines = [];
    try { collect(f && f.geometry, polys, rawLines); } catch (e) { /* ungültige Geometrie: wird unten übersprungen */ }
    var prepared = [], lines = [], bbox = [Infinity, Infinity, -Infinity, -Infinity];
    polys.forEach(function (rings) { var p = preparePolygon(rings); if (p) { prepared.push(p); extend(bbox, p.bbox); } });
    rawLines.forEach(function (l) {
      var flat = flatLine(l);
      if (!flat) return;
      var b = [Infinity, Infinity, -Infinity, -Infinity];
      for (var i = 0; i < flat.length; i += 2) extend(b, [flat[i], flat[i + 1], flat[i], flat[i + 1]]);
      var dLat = near / M_PER_DEG, dLon = near / (M_PER_DEG * Math.max(0.01, Math.cos(Math.max(Math.abs(b[1]), Math.abs(b[3])) * Math.PI / 180)));
      lines.push({ flat: flat, bbox: [b[0] - dLon, b[1] - dLat, b[2] + dLon, b[3] + dLat] });
      extend(bbox, lines[lines.length - 1].bbox);
    });
    if (!prepared.length && !lines.length) { skipped++; return; }
    items.push({ id: idOf ? idOf(f, index) : defaultId(f || {}, index), polygons: prepared, lines: lines, bbox: bbox, nearM: near });
  });
  return { items: items, skipped: skipped };
}

function itemContains(item, lon, lat) {
  var b = item.bbox;
  if (lon < b[0] || lon > b[2] || lat < b[1] || lat > b[3]) return false;
  for (var i = 0; i < item.polygons.length; i++) if (pointInPolygon(lon, lat, item.polygons[i])) return true;
  for (var j = 0; j < item.lines.length; j++) {
    var l = item.lines[j], lb = l.bbox;
    if (lon >= lb[0] && lon <= lb[2] && lat >= lb[1] && lat <= lb[3] && distanceToFlat(lon, lat, l.flat) <= item.nearM) return true;
  }
  return false;
}
// Zusammenhängende Stücke der Route (an Lücken getrennt) als { points, startM, endM }.
function pieces(route) {
  var cuts = route.gaps.map(function (g) { return g.afterIndex + 1; }), out = [], from = 0;
  cuts.concat([route.points.length]).forEach(function (to) {
    var pts = route.points.slice(from, to);
    if (pts.length) out.push({ points: pts, startM: pts[0].dist, endM: pts[pts.length - 1].dist });
    from = to;
  });
  return out;
}

// Schnitt der Route mit den Features. features: GeoJSON-Features oder das Ergebnis von prepareFeatures.
// opts: { stepM (Abtastabstand, Standard 25), nearM (Entfernung für Linien und Punkte, Standard 30), idOf(feature, index) }.
// Ergebnis { sections: [{ featureId, fromKm, toKm }], skipped } – sortiert nach fromKm, dann Kennung; nur Features mit Treffer.
export function routeOverlay(route, features, opts) {
  opts = opts || {};
  var stepM = opts.stepM > 0 ? opts.stepM : SAMPLE_STEP_M;
  var prep = features && features.items ? features : prepareFeatures(features, opts.idOf, opts.nearM);
  var sections = [];
  if (!route || !route.points || !route.points.length || !prep.items.length) return { sections: sections, skipped: prep.skipped };
  var rb = route.bounds;   // [[s, w], [n, e]]
  var candidates = prep.items.filter(function (it) {
    return !(it.bbox[2] < rb[0][1] || it.bbox[0] > rb[1][1] || it.bbox[3] < rb[0][0] || it.bbox[1] > rb[1][0]);
  });
  if (candidates.length) pieces(route).forEach(function (piece) {
    var samples = [];
    for (var d = piece.startM; d < piece.endM; d += stepM) samples.push(d);
    samples.push(piece.endM);
    var pts = samples.map(function (m) { return pointAtKm(piece.points, m / 1000); });   // einmal je Stück, nicht je Feature
    candidates.forEach(function (item) {
      var flags = pts.map(function (p) { return itemContains(item, p.lon, p.lat); });
      function inside(m) { var p = pointAtKm(piece.points, m / 1000); return itemContains(item, p.lon, p.lat); }
      // Grenze zwischen m0 (Zustand s0) und m1 (anderer Zustand): Ort des Wechsels auf rund 1 mm.
      function edge(m0, m1, s0) {
        var a = m0, b = m1;
        for (var k = 0; k < BISECT_ITERATIONS; k++) { var mid = (a + b) / 2; if (inside(mid) === s0) a = mid; else b = mid; }
        return (a + b) / 2;
      }
      var i = 0;
      while (i < samples.length) {
        if (!flags[i]) { i++; continue; }
        var j = i;
        while (j + 1 < samples.length && flags[j + 1]) j++;
        var from = i > 0 ? edge(samples[i - 1], samples[i], false) : samples[i];
        var to = j < samples.length - 1 ? edge(samples[j], samples[j + 1], true) : samples[j];
        sections.push({ featureId: item.id, fromKm: from / 1000, toKm: to / 1000 });
        i = j + 1;
      }
    });
  });
  sections.sort(function (a, b) { return (a.fromKm - b.fromKm) || String(a.featureId).localeCompare(String(b.featureId)); });
  return { sections: sections, skipped: prep.skipped };
}
