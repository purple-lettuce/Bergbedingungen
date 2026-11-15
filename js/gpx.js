// GPX-Parser (RI1), reine Logik ohne Karte und ohne Zugriff auf die Seite.
// Eingabe ist der Text einer GPX-Datei, Ausgabe ein Rohmodell. Die Datei wird nur im Browser gelesen (DOMParser), nichts wird übertragen (E1).
// Fehler werden als Ergebnis zurückgegeben (ok: false, error), nicht geworfen. Texte aus der Datei (Namen) sind unbehandelt:
// wer sie anzeigt, muss sie mit esc() ausgeben.
//
// Ergebnis:
//   { ok, error, name, tracks: [{ name, segments: [[{ lat, lon, ele, time }]] }], routes: [{ name, points: [...] }],
//     waypoints: [{ lat, lon, ele, name }], warnings: [string] }
// lat/lon in Grad (WGS84), ele in Metern oder null (nie 0 als Ersatz), time als Millisekunden seit 1970 oder null (E3).
// Gelesen werden nur Kernelemente (trk/trkseg/trkpt, rte/rtept, wpt); Erweiterungen der Hersteller werden ignoriert.

export const MAX_BYTES = 10 * 1024 * 1024;  // E4: größere Dateien werden abgelehnt, nicht abgeschnitten
export const MAX_POINTS = 200000;           // E4: Trackpunkte und Routenpunkte zusammen
const MAX_NAME_LENGTH = 200;

const NUMBER = /^[+-]?(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?$/;

function fail(error) {
  return { ok: false, error: error, name: null, tracks: [], routes: [], waypoints: [], warnings: [] };
}

function byteLength(text) {
  return text.length * 3 <= MAX_BYTES ? text.length : new TextEncoder().encode(text).length;
}

function num(s) {
  if (s == null) return null;
  s = String(s).trim();
  return NUMBER.test(s) ? Number(s) : null;
}

// Kindelemente nach lokalem Namen: ignoriert Namensräume und Einträge in Erweiterungen.
function children(node, name) {
  var out = [];
  for (var c = node.firstElementChild; c; c = c.nextElementSibling) if (c.localName === name) out.push(c);
  return out;
}

function childText(node, name) {
  var c = children(node, name)[0];
  if (!c) return null;
  var t = (c.textContent || '').trim();
  return t ? t.slice(0, MAX_NAME_LENGTH) : null;
}

// Liest einen Punkt; stats zählt Auffälligkeiten für die Warnungen. null, wenn die Koordinaten unbrauchbar sind.
function readPoint(el, stats) {
  var lat = num(el.getAttribute('lat')), lon = num(el.getAttribute('lon'));
  if (lat == null || lon == null || lat < -90 || lat > 90 || lon < -180 || lon > 180) { stats.badCoord++; return null; }
  var eleText = childText(el, 'ele'), ele = eleText == null ? null : num(eleText);
  if (ele == null) stats.noEle++;
  var timeText = childText(el, 'time'), time = null;
  if (timeText != null) { time = Date.parse(timeText); if (isNaN(time)) { time = null; stats.badTime++; } }
  else stats.noTime++;
  return { lat: lat, lon: lon, ele: ele, time: time };
}

function readPoints(list, stats) {
  var pts = [];
  for (var i = 0; i < list.length; i++) { var p = readPoint(list[i], stats); if (p) pts.push(p); }
  return pts;
}

function plural(n, one, many) { return n + ' ' + (n === 1 ? one : many); }

export function parseGpx(text) {
  if (typeof text !== 'string') return fail('Die Datei konnte nicht als Text gelesen werden.');
  if (!text.trim()) return fail('Die Datei ist leer.');
  if (byteLength(text) > MAX_BYTES) return fail('Die Datei ist zu groß (mehr als ' + (MAX_BYTES / 1024 / 1024) + ' MB). Bitte eine kleinere Datei laden.');
  // Keine Dokumenttyp-Deklaration: schließt Entitäten-Angriffe aus, GPX braucht sie nicht.
  if (/<!DOCTYPE|<!ENTITY/i.test(text)) return fail('Die Datei enthält eine Dokumenttyp-Deklaration und wird nicht gelesen.');

  var doc;
  try { doc = new DOMParser().parseFromString(text, 'application/xml'); } catch (e) { doc = null; }
  if (!doc || !doc.documentElement || doc.getElementsByTagName('parsererror').length) return fail('Die Datei ist keine gültige XML-Datei.');
  var root = doc.documentElement;
  if (root.localName !== 'gpx') return fail('Die Datei ist keine GPX-Datei (Wurzelelement „gpx“ fehlt).');

  var trks = children(root, 'trk'), rtes = children(root, 'rte'), wpts = children(root, 'wpt');
  var count = 0;
  trks.forEach(function (t) { children(t, 'trkseg').forEach(function (s) { count += children(s, 'trkpt').length; }); });
  rtes.forEach(function (r) { count += children(r, 'rtept').length; });
  if (count > MAX_POINTS) return fail('Die Datei hat zu viele Punkte (' + count + ', erlaubt sind ' + MAX_POINTS + '). Bitte eine kürzere Tour laden.');

  var stats = { badCoord: 0, noEle: 0, noTime: 0, badTime: 0 };
  var tracks = [], routes = [], waypoints = [], warnings = [];

  trks.forEach(function (t) {
    var segments = [];
    children(t, 'trkseg').forEach(function (s) {
      var pts = readPoints(children(s, 'trkpt'), stats);
      if (pts.length) segments.push(pts);
    });
    if (segments.length) tracks.push({ name: childText(t, 'name'), segments: segments });
  });
  rtes.forEach(function (r) {
    var pts = readPoints(children(r, 'rtept'), stats);
    if (pts.length) routes.push({ name: childText(r, 'name'), points: pts });
  });
  var wstats = { badCoord: 0, noEle: 0, noTime: 0, badTime: 0 };
  wpts.forEach(function (w) {
    var p = readPoint(w, wstats);
    if (p) waypoints.push({ lat: p.lat, lon: p.lon, ele: p.ele, name: childText(w, 'name') });
  });

  if (!tracks.length && !routes.length) return fail(wpts.length && waypoints.length
    ? 'Die Datei enthält nur Wegpunkte, aber keinen Track und keine Route.'
    : 'Die Datei enthält keinen Track und keine Route mit gültigen Punkten.');

  if (stats.badCoord || wstats.badCoord) warnings.push(plural(stats.badCoord + wstats.badCoord, 'Punkt mit ungültigen Koordinaten wurde übersprungen.', 'Punkte mit ungültigen Koordinaten wurden übersprungen.'));
  if (stats.noEle) warnings.push(plural(stats.noEle, 'Punkt ohne Höhe', 'Punkte ohne Höhe') + ' in der Datei.');
  if (stats.badTime) warnings.push(plural(stats.badTime, 'Punkt mit ungültigem Zeitstempel', 'Punkte mit ungültigem Zeitstempel') + ' in der Datei.');
  if (tracks.length && routes.length) warnings.push('Die Datei enthält Tracks und Routen; zunächst ist der Track maßgeblich.');
  if (tracks.some(function (t) { return t.segments.length > 1; })) warnings.push('Der Track besteht aus mehreren Segmenten (Lücken in der Aufzeichnung).');

  var meta = children(root, 'metadata')[0];
  var name = (meta && childText(meta, 'name')) || (tracks[0] && tracks[0].name) || (routes[0] && routes[0].name) || null;
  return { ok: true, error: null, name: name, tracks: tracks, routes: routes, waypoints: waypoints, warnings: warnings };
}
