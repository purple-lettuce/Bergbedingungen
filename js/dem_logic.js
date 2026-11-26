// Höhenmodell (DEM), reine Logik ohne Netzwerk, DOM und Karte (RI12): Kachelnamen, Pixelkoordinaten, bilineare Interpolation, NoData, Bereichsabrufe.
// Die Module dem_tiff.js (GeoTIFF lesen) und dem.js (Abruf, Zwischenspeicher) bauen darauf auf.
//
// Grundsätze: Ein Wert, der fehlt oder NoData ist, ist "unbekannt" (null), nie 0. Fehlt eine der vier Ecken der Interpolation, ist das Ergebnis unbekannt;
// es wird nicht mit den übrigen Ecken geschätzt. Höhen sind Meter über dem Meeresspiegel laut Modell, nicht die Höhe eines Gipfels oder einer GPX-Datei.

export const ERR = { UNAVAILABLE: 'tile-unavailable', OUTSIDE: 'outside', UNSUPPORTED: 'unsupported', NETWORK: 'network' };
export const ERR_TEXT = {
  'tile-unavailable': 'Kachel nicht verfügbar',
  'outside': 'außerhalb der Abdeckung',
  'unsupported': 'Dateiformat nicht unterstützt',
  'network': 'Höhenmodell nicht abrufbar'
};

// Fehler mit Code (ERR) und deutscher Meldung; die Meldung steht in der Oberfläche, der Code dient der Auswertung.
export class DemError extends Error {
  constructor(code, detail) {
    super(ERR_TEXT[code] + (detail ? ' (' + detail + ')' : ''));
    this.name = 'DemError';
    this.code = code;
  }
}

export const TERRAIN_MAX_LAT = 85.0511;   // Grenze der Web-Mercator-Kacheln

export function validCoord(lat, lon) {
  return typeof lat === 'number' && typeof lon === 'number' && isFinite(lat) && isFinite(lon) && Math.abs(lat) <= 90 && Math.abs(lon) <= 180;
}

// ---------- NoData und Interpolation ----------

// Höhe oder null: NaN, unendlich, der NoData-Wert der Datei und Werte weit unter dem tiefsten Punkt der Erde (Toter-Meer-Ufer: -430 m) sind unbekannt.
export function cleanValue(v, nodata) {
  if (v == null || typeof v !== 'number' || !isFinite(v)) return null;
  if (nodata != null && v === nodata) return null;
  if (v < -1000 || v > 10000) return null;
  return v;
}

// Bilineare Interpolation aus vier Ecken (Werte oder null); fx und fy sind die Anteile 0..1 in Spalten- und Zeilenrichtung.
// Ist eine Ecke unbekannt (null), ist das Ergebnis unbekannt.
export function bilinear(v00, v10, v01, v11, fx, fy) {
  if (v00 == null || v10 == null || v01 == null || v11 == null) return null;
  var top = v00 + (v10 - v00) * fx, bottom = v01 + (v11 - v01) * fx;
  return top + (bottom - top) * fy;
}

// Höhe an der Pixelposition (col, row) in Pixelmitten-Koordinaten (0 = Mitte des ersten Pixels), get(c, r) liefert den Wert oder null.
// Liegt die Position zwischen Pixelmitte und Rand (also innerhalb des Rasters, aber außerhalb der Pixelmitten), wird am Rand geklemmt:
// dort gibt es keine vier Nachbarn, und der Fehler ist höchstens ein halbes Pixel.
export function interpolateAt(get, col, row, width, height) {
  var c = Math.min(Math.max(col, 0), width - 1), r = Math.min(Math.max(row, 0), height - 1);
  var c0 = Math.floor(c), r0 = Math.floor(r), c1 = Math.min(c0 + 1, width - 1), r1 = Math.min(r0 + 1, height - 1);
  return bilinear(get(c0, r0), get(c1, r0), get(c0, r1), get(c1, r1), c - c0, r - r0);
}

// ---------- Geografisches Raster (Copernicus GLO-30) ----------

// Name der 1°×1°-Kachel, die den Punkt enthält, nach dem Schema von OpenTopography: Copernicus_DSM_10_N47_00_E012_00_DEM.tif
// (Südwestecke der Kachel; Breite zweistellig, Länge dreistellig).
export function copTileId(lat, lon) {
  var la = Math.floor(lat), lo = Math.floor(lon);
  var ns = la >= 0 ? 'N' : 'S', ew = lo >= 0 ? 'E' : 'W';
  var a = String(Math.abs(la)).padStart(2, '0'), o = String(Math.abs(lo)).padStart(3, '0');
  return { id: ns + a + '_00_' + ew + o + '_00', south: la, west: lo };
}

export const COP_BASE = 'https://opentopography.s3.sdsc.edu/raster/COP30/COP30_hh/';
export function copTileUrl(lat, lon) { return COP_BASE + 'Copernicus_DSM_10_' + copTileId(lat, lon).id + '_DEM.tif'; }

// Pixelposition (Pixelmitten-Koordinaten) eines Punktes in einem nordorientierten Raster mit Georeferenz aus dem GeoTIFF.
// geo: { originLon, originLat, dx, dy, pointIsArea, width, height }, dx/dy positiv (Grad je Pixel).
// - Raster "Fläche" (PixelIsArea): der Bezugspunkt ist die obere linke Ecke des ersten Pixels, die Mitte liegt ein halbes Pixel weiter.
// - Raster "Punkt" (PixelIsPoint): der Bezugspunkt ist die Mitte des ersten Pixels.
// Außerhalb des Rasters (mehr als ein halbes Pixel über die Pixelmitten hinaus) null.
export function geoPixel(geo, lat, lon) {
  if (!geo) return null;
  var shift = geo.pointIsArea ? 0.5 : 0;
  var col = (lon - geo.originLon) / geo.dx - shift, row = (geo.originLat - lat) / geo.dy - shift;
  if (col < -0.5 || row < -0.5 || col > geo.width - 0.5 || row > geo.height - 0.5) return null;
  return { col: col, row: row };
}

// ---------- Web-Kacheln (AWS Terrain Tiles, Terrarium) ----------

export const TERRAIN_ZOOM = 12;       // etwa 26 m je Pixel auf 47° Breite (Schätzung aus 156543 m · cos(Breite) / 256 / 2^Zoom · 256)
export const TERRAIN_TILE = 256;
export const TERRAIN_BASE = 'https://s3.amazonaws.com/elevation-tiles-prod/terrarium/';

// Globale Pixelposition (Mercator, Pixelmitten-Koordinaten) und Kachelnummer eines Punktes.
export function terrainPixel(lat, lon, z) {
  var n = Math.pow(2, z) * TERRAIN_TILE;
  var rad = lat * Math.PI / 180;
  var x = (lon + 180) / 360 * n - 0.5;
  var y = (1 - Math.log(Math.tan(rad) + 1 / Math.cos(rad)) / Math.PI) / 2 * n - 0.5;
  return { x: x, y: y, size: n };
}

export function terrainTileUrl(z, x, y) { return TERRAIN_BASE + z + '/' + x + '/' + y + '.png'; }

// Terrarium: Höhe = R · 256 + G + B / 256 − 32768 (Meter).
export function decodeTerrarium(r, g, b) { return r * 256 + g + b / 256 - 32768; }

// ---------- Bereichsabrufe (HTTP Range) ----------

// Fasst benötigte Byte-Bereiche [{start, end, ...}] (end einschließlich) zusammen: Bereiche mit höchstens maxGap Bytes Abstand werden ein Abruf,
// solange der Abruf nicht größer als maxLen wird. Weniger Anfragen bei gestreiften Dateien (viele kleine Streifen nebeneinander).
export function mergeRanges(ranges, maxGap, maxLen) {
  var sorted = ranges.slice().sort(function (a, b) { return a.start - b.start; }), out = [];
  sorted.forEach(function (r) {
    var last = out[out.length - 1];
    if (last && r.start - last.end - 1 <= maxGap && r.end - last.start + 1 <= maxLen) {
      last.end = Math.max(last.end, r.end);
      last.parts.push(r);
    } else out.push({ start: r.start, end: r.end, parts: [r] });
  });
  return out;
}
