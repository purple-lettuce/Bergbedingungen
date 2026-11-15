// Räumlicher Schnitt Route × Polygone (RI7), reine Logik ohne Karte, Seite und Datenzugriff.
// Eingabe: Routenobjekt aus route_model.js (points mit dist, gaps) und GeoJSON-Features (Polygon, MultiPolygon; Koordinaten [lon, lat]).
// Ausgabe: Abschnitte { featureId, fromKm, toKm } in Streckenkilometern der Route. Die Logik kennt weder Schutzgebiete noch Lawinen.
//
// Verfahren (E6): Die Route wird je zusammenhängendem Stück (an Lücken getrennt) alle SAMPLE_STEP_M Meter abgetastet. Jede Probe wird
// gegen die Features geprüft, deren Umgebungsrechteck die Probe enthält (Vorauswahl je Polygon). Zusammenhängende Proben innerhalb
// eines Features bilden einen Abschnitt; Ein- und Austritt werden zwischen der letzten Probe außen und der ersten innen durch
// Halbieren auf rund 1 mm eingegrenzt. Abschnitte entstehen also aus Ereignissen, nicht aus festen Längen.
// Grenzen: Ein Polygon, das die Route zwischen zwei Proben durchquert, ohne dass eine Probe darin liegt (kürzer als der Abtastabstand),
// wird nicht gefunden. Ein Punkt genau auf dem Rand gilt je nach Kante als innen oder außen (Strahlverfahren); das wirkt sich nur im
// Bereich von Millimetern aus. Abschnitte reichen nie über eine Lücke der Route hinweg. Ungültige Features werden übersprungen und gezählt.

import { pointAtKm } from './geo.js';

export const SAMPLE_STEP_M = 25;
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

// Bereitet Features einmal vor (Umgebungsrechtecke, flache Ringe). Das Ergebnis lässt sich für mehrere Routen wiederverwenden.
// Ergebnis { items: [{ id, polygons, bbox }], skipped } – skipped zählt Features ohne gültige Polygon-Geometrie.
export function prepareFeatures(features, idOf) {
  var items = [], skipped = 0;
  (features || []).forEach(function (f, index) {
    var g = f && f.geometry, polys = [];
    if (g && g.type === 'Polygon' && Array.isArray(g.coordinates)) polys = [g.coordinates];
    else if (g && g.type === 'MultiPolygon' && Array.isArray(g.coordinates)) polys = g.coordinates;
    var prepared = [];
    polys.forEach(function (rings) { var p = preparePolygon(rings); if (p) prepared.push(p); });
    if (!prepared.length) { skipped++; return; }
    var bbox = [Infinity, Infinity, -Infinity, -Infinity];
    prepared.forEach(function (p) {
      bbox[0] = Math.min(bbox[0], p.bbox[0]); bbox[1] = Math.min(bbox[1], p.bbox[1]);
      bbox[2] = Math.max(bbox[2], p.bbox[2]); bbox[3] = Math.max(bbox[3], p.bbox[3]);
    });
    items.push({ id: idOf ? idOf(f, index) : defaultId(f, index), polygons: prepared, bbox: bbox });
  });
  return { items: items, skipped: skipped };
}

function itemContains(item, lon, lat) {
  var b = item.bbox;
  if (lon < b[0] || lon > b[2] || lat < b[1] || lat > b[3]) return false;
  for (var i = 0; i < item.polygons.length; i++) if (pointInPolygon(lon, lat, item.polygons[i])) return true;
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
// opts: { stepM (Abtastabstand, Standard 25), idOf(feature, index) }.
// Ergebnis { sections: [{ featureId, fromKm, toKm }], skipped } – sortiert nach fromKm, dann Kennung; nur Features mit Treffer.
export function routeOverlay(route, features, opts) {
  opts = opts || {};
  var stepM = opts.stepM > 0 ? opts.stepM : SAMPLE_STEP_M;
  var prep = features && features.items ? features : prepareFeatures(features, opts.idOf);
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
    candidates.forEach(function (item) {
      var flags = samples.map(function (m) { var p = pointAtKm(piece.points, m / 1000); return itemContains(item, p.lon, p.lat); });
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
