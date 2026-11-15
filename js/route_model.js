// Routenmodell (RI2), reine Logik ohne Karte und ohne Zugriff auf die Seite.
// createRoute(gpxModel) macht aus dem Rohmodell von parseGpx (gpx.js) ein einheitliches Routenobjekt, auf dem spätere Analysen aufsetzen.
//
// Route {
//   id, name (aus der Datei, unbehandelt: bei der Ausgabe esc()), source: 'gpx',
//   points: [{ lat, lon, ele, time, dist }]   // ele Meter oder null, time ms seit 1970 oder null, dist = Meter ab Start
//   bounds: [[south, west], [north, east]],
//   hasElevation: mindestens ein Punkt mit Höhe, hasTime: mindestens ein Punkt mit Zeit,
//   gaps: [{ afterIndex }]                    // Lücke zwischen points[afterIndex] und points[afterIndex + 1]
//   lengthM, warnings: [string]
// }
// Auswahl: Der erste Track ist maßgeblich (alle seine Segmente werden zu einer Linie zusammengesetzt); ohne Track die erste Route.
// Weitere Tracks oder Routen werden nicht verwendet und als Warnung vermerkt. Lücken zwischen Segmenten zählen nicht zur Strecke.
// Analyseergebnisse hängen nie an der Route (Datenmodell im Plan, Abschnitt 11).

import { cumulativeDistances, simplify } from './geo.js';

var counter = 0;

function newId() { return 'route-' + Date.now().toString(36) + '-' + (++counter); }

// Ergebnis { ok, error, route }; wirft nie. Ein Rohmodell ohne Punkte ist ein Fehler.
export function createRoute(gpx) {
  if (!gpx || !gpx.ok) return { ok: false, error: (gpx && gpx.error) || 'Keine Routendaten vorhanden.', route: null };
  var segments, warnings = (gpx.warnings || []).slice();
  if (gpx.tracks && gpx.tracks.length) {
    segments = gpx.tracks[0].segments;
    if (gpx.tracks.length > 1) warnings.push('Die Datei enthält ' + gpx.tracks.length + ' Tracks; verwendet wird der erste.');
  } else if (gpx.routes && gpx.routes.length) {
    segments = [gpx.routes[0].points];
    if (gpx.routes.length > 1) warnings.push('Die Datei enthält ' + gpx.routes.length + ' Routen; verwendet wird die erste.');
  } else {
    return { ok: false, error: 'Die Datei enthält keinen Track und keine Route.', route: null };
  }

  var points = [], gaps = [];
  segments.forEach(function (seg) {
    if (!seg.length) return;
    if (points.length) gaps.push({ afterIndex: points.length - 1 });
    seg.forEach(function (p) { points.push({ lat: p.lat, lon: p.lon, ele: p.ele == null ? null : p.ele, time: p.time == null ? null : p.time, dist: 0 }); });
  });
  if (!points.length) return { ok: false, error: 'Die Datei enthält keinen Track und keine Route mit gültigen Punkten.', route: null };

  var dist = cumulativeDistances(points, gaps.map(function (g) { return g.afterIndex; }));
  var s = 90, w = 180, n = -90, e = -180, hasEle = false, hasTime = false;
  for (var i = 0; i < points.length; i++) {
    var p = points[i];
    p.dist = dist[i];
    if (p.lat < s) s = p.lat; if (p.lat > n) n = p.lat;
    if (p.lon < w) w = p.lon; if (p.lon > e) e = p.lon;
    if (p.ele != null) hasEle = true;
    if (p.time != null) hasTime = true;
  }
  return { ok: true, error: null, route: {
    id: newId(), name: gpx.name || null, source: 'gpx', points: points,
    bounds: [[s, w], [n, e]], hasElevation: hasEle, hasTime: hasTime, gaps: gaps,
    lengthM: dist[dist.length - 1], warnings: warnings
  } };
}

// Linien für die Darstellung: an Lücken getrennt, mit Douglas-Peucker vereinfacht (toleranceM Meter, 0 = unverändert).
// Ergebnis: Liste von Linien, jede eine Liste von [lat, lon].
export function displayLines(route, toleranceM) {
  var cuts = route.gaps.map(function (g) { return g.afterIndex + 1; }), lines = [], from = 0;
  cuts.concat([route.points.length]).forEach(function (to) {
    var part = route.points.slice(from, to);
    from = to;
    if (!part.length) return;
    var idx = toleranceM > 0 ? simplify(part, toleranceM) : part.map(function (_, i) { return i; });
    lines.push(idx.map(function (i) { return [part[i].lat, part[i].lon]; }));
  });
  return lines;
}