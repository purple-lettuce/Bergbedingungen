// Höhenmodell-Zugriff (RI12): elevationAt(lat, lon) und elevationsAlong(points), ohne Karte. Heimat der Quellenwahl, des Kachel-Zwischenspeichers und der Fehler.
//
// Quellen (E7): 1. Copernicus GLO-30 (OpenTopography, GeoTIFF, ca. 30 m, Oberflächenmodell DSM), 2. AWS Terrain Tiles (Terrarium-PNG, Zoom 12, Mischmodell).
// Die zweite Quelle springt ein, wenn die erste für den Punkt nicht lesbar ist (Kachel fehlt, Netzfehler, Dateiformat nicht unterstützt).
// Höhen sind Modellwerte (Oberfläche inklusive Bäume und Gebäude), keine Gipfelhöhen und nicht die Höhen einer GPX-Datei.
//
// Das Netzwerk (fetchRange, fetchImage) und der Zeitpunkt kommen über configure() herein; die Tests ersetzen sie.

import { DemError, ERR, validCoord, interpolateAt, copTileUrl, geoPixel, TERRAIN_ZOOM, TERRAIN_TILE, terrainPixel, terrainTileUrl, decodeTerrarium, cleanValue } from './dem_logic.js';
import { openTiff, blockIndex, pixelValue } from './dem_tiff.js';

var MAX_PARALLEL = 4;
var NEGATIVE_MS = 5 * 60 * 1000;     // fehlgeschlagene Kacheln nicht bei jedem Punkt erneut versuchen

var net = {
  // Bytes start..end (einschließlich) als ArrayBuffer; wirft DemError. Ein Server ohne Range-Unterstützung (Status 200) wird abgelehnt, statt die ganze Datei zu laden.
  fetchRange: async function (url, start, end) {
    var res;
    try { res = await fetch(url, { headers: { Range: 'bytes=' + start + '-' + end } }); }
    catch (e) { throw new DemError(ERR.NETWORK, url); }
    if (res.status === 404 || res.status === 403) throw new DemError(ERR.UNAVAILABLE, url);
    if (res.status !== 206) throw new DemError(res.status === 200 ? ERR.UNSUPPORTED : ERR.NETWORK, 'Status ' + res.status);
    return res.arrayBuffer();
  },
  // Terrarium-Kachel als { data: Uint8ClampedArray (RGBA), width, height }
  fetchImage: async function (url) {
    var res;
    try { res = await fetch(url); } catch (e) { throw new DemError(ERR.NETWORK, url); }
    if (res.status === 404 || res.status === 403) throw new DemError(ERR.UNAVAILABLE, url);
    if (!res.ok) throw new DemError(ERR.NETWORK, 'Status ' + res.status);
    var bmp = await createImageBitmap(await res.blob(), { premultiplyAlpha: 'none', colorSpaceConversion: 'none' });
    var canvas = document.createElement('canvas');
    canvas.width = bmp.width; canvas.height = bmp.height;
    var ctx = canvas.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(bmp, 0, 0);
    return ctx.getImageData(0, 0, bmp.width, bmp.height);
  },
  now: function () { return Date.now(); },
  onStatus: function () {}
};
var providers = { copernicus: true, terrain: true };

export function configure(opts) {
  Object.assign(net, opts || {});
  if (opts && opts.providers) providers = Object.assign({ copernicus: true, terrain: true }, opts.providers);
}

// ---------- Warteschlange und Zwischenspeicher ----------

var active = 0, waiting = [];
function limited(fn) {
  return new Promise(function (resolve, reject) {
    function run() {
      active++;
      fn().then(resolve, reject).finally(function () { active--; if (waiting.length) waiting.shift()(); });
    }
    if (active < MAX_PARALLEL) run(); else waiting.push(run);
  });
}

var files = new Map();      // URL → Promise<info> | Fehler (mit Zeit)
var blocks = new Map();     // URL#Nummer → Promise<Block>
var images = new Map();     // URL → Promise<ImageData>
var failures = new Map();   // URL → { error, at }

export function clearCache() { files.clear(); blocks.clear(); images.clear(); failures.clear(); active = 0; waiting = []; }

function cached(map, key, make) {
  var f = failures.get(key);
  if (f && net.now() - f.at < NEGATIVE_MS) return Promise.reject(f.error);
  if (f) failures.delete(key);
  if (!map.has(key)) {
    map.set(key, make().catch(function (e) {
      map.delete(key);
      if (e instanceof DemError && e.code !== ERR.NETWORK) failures.set(key, { error: e, at: net.now() });   // Netzfehler dürfen sofort erneut versucht werden
      throw e;
    }));
  }
  return map.get(key);
}

// ---------- Quelle 1: Copernicus-GeoTIFF ----------

function openFile(url) {
  return cached(files, url, function () {
    return limited(function () { return openTiff(function (s, e) { return net.fetchRange(url, s, e); }); });
  });
}

async function copernicusAt(lat, lon) {
  var url = copTileUrl(lat, lon), info = await openFile(url);
  var pos = geoPixel(info.geo, lat, lon);
  if (!pos) throw new DemError(ERR.UNAVAILABLE, 'außerhalb der Kachel');
  // vier Nachbarpixel können in bis zu vier Blöcken liegen
  var c0 = Math.min(Math.max(Math.floor(pos.col), 0), info.width - 1), r0 = Math.min(Math.max(Math.floor(pos.row), 0), info.height - 1);
  var wanted = new Set();
  [[c0, r0], [c0 + 1, r0], [c0, r0 + 1], [c0 + 1, r0 + 1]].forEach(function (p) {
    if (p[0] < info.width && p[1] < info.height) wanted.add(blockIndex(info, p[0], p[1]));
  });
  var loaded = new Map();
  await Promise.all(Array.from(wanted).map(async function (idx) {
    var b = await cached(blocks, url + '#' + idx, function () {
      return limited(async function () { return (await info.readBlocks([idx])).get(idx); });
    });
    loaded.set(idx, b);
  }));
  var ele = interpolateAt(function (c, r) { return pixelValue(info, loaded, c, r); }, pos.col, pos.row, info.width, info.height);
  return { ele: ele, source: 'copernicus', kind: 'surface' };
}

// ---------- Quelle 2: Terrain Tiles ----------

async function terrainAt(lat, lon) {
  if (Math.abs(lat) > 85.05) throw new DemError(ERR.OUTSIDE, 'Breite');
  var p = terrainPixel(lat, lon, TERRAIN_ZOOM);
  var gx0 = Math.floor(p.x), gy0 = Math.floor(p.y), fx = p.x - gx0, fy = p.y - gy0;
  var imgs = new Map();
  async function tile(gx, gy) {
    var n = p.size, x = ((gx % n) + n) % n, y = Math.min(Math.max(gy, 0), n - 1);
    var tx = Math.floor(x / TERRAIN_TILE), ty = Math.floor(y / TERRAIN_TILE), key = tx + '/' + ty;
    if (!imgs.has(key)) {
      var url = terrainTileUrl(TERRAIN_ZOOM, tx, ty);
      imgs.set(key, await cached(images, url, function () { return limited(function () { return net.fetchImage(url); }); }));
    }
    return { img: imgs.get(key), px: x - tx * TERRAIN_TILE, py: y - ty * TERRAIN_TILE };
  }
  var cells = [];
  for (var dy = 0; dy < 2; dy++) for (var dx = 0; dx < 2; dx++) cells.push(await tile(gx0 + dx, gy0 + dy));
  var v = cells.map(function (t) {
    var i = (t.py * t.img.width + t.px) * 4, d = t.img.data;
    return cleanValue(decodeTerrarium(d[i], d[i + 1], d[i + 2]), null);
  });
  var top = v[0] == null || v[1] == null ? null : v[0] + (v[1] - v[0]) * fx;
  var bottom = v[2] == null || v[3] == null ? null : v[2] + (v[3] - v[2]) * fx;
  return { ele: top == null || bottom == null ? null : top + (bottom - top) * fy, source: 'terrain', kind: 'mixed' };
}

// ---------- Öffentliche Schnittstelle ----------

var succeeded = false;

// Höhe an einem Punkt: { ele: Meter | null (unbekannt, z. B. NoData), source, kind }. Wirft DemError (außerhalb der Abdeckung, keine Kachel verfügbar, ...).
export async function elevationAt(lat, lon) {
  if (!validCoord(lat, lon)) throw new DemError(ERR.OUTSIDE, 'ungültige Koordinate');
  var lastError = null;
  var chain = [];
  if (providers.copernicus) chain.push(copernicusAt);
  if (providers.terrain) chain.push(terrainAt);
  for (var i = 0; i < chain.length; i++) {
    try {
      var res = await chain[i](lat, lon);
      if (res.ele == null && i < chain.length - 1) continue;   // NoData in der ersten Quelle: die zweite fragen
      report('ok', res.source);
      return res;
    } catch (e) {
      if (!(e instanceof DemError)) throw e;
      if (e.code === ERR.OUTSIDE && i === 0 && chain.length === 1) throw e;
      lastError = e;
    }
  }
  report('unavailable');
  throw lastError || new DemError(ERR.UNAVAILABLE, 'keine Quelle');
}

// Höhen entlang einer Punktliste ([{lat, lon}]): je Punkt { ele, source, kind } oder { ele: null, error: DemError-Code }. Wirft nie wegen einzelner Punkte.
export async function elevationsAlong(points) {
  var out = new Array(points.length);
  var next = 0;
  async function worker() {
    while (next < points.length) {
      var i = next++;
      try { out[i] = await elevationAt(points[i].lat, points[i].lon); }
      catch (e) { out[i] = { ele: null, error: e instanceof DemError ? e.code : ERR.NETWORK }; }
    }
  }
  await Promise.all(Array.from({ length: Math.min(MAX_PARALLEL, points.length) }, worker));
  return out;
}

function report(state, source) {
  if (state === 'ok') succeeded = true;
  net.onStatus(state, source);
}
export function hasSucceeded() { return succeeded; }
