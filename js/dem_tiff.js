// Minimaler GeoTIFF-Leser für Höhenraster (RI12, E18: eigener Code statt Bibliothek), ohne DOM und Karte. Liest Kopf, Verzeichnis und einzelne Blöcke
// (Kacheln oder Streifen) per Bereichsabruf, sodass von einer großen Datei nur das Nötige geladen wird.
//
// Unterstützt: klassisches TIFF (Little- und Big-Endian), ein Band, Gleitkomma 32 Bit, Ganzzahl 16 Bit (mit und ohne Vorzeichen), gekachelt oder
// gestreift, unkomprimiert oder Deflate (zlib, Kompression 8 und 32946), Predictor 1, 2 (horizontal) und 3 (Gleitkomma).
// Nicht unterstützt (Fehler "Dateiformat nicht unterstützt", der Aufrufer weicht dann auf eine andere Quelle aus): BigTIFF, LZW und andere Kompressionen,
// mehrere Bänder, getrennte Ebenen, Gleitkomma 64 Bit. Georeferenz: ModelPixelScale und ModelTiepoint (nordorientiert, ohne Drehung); die Art des Bezugs
// (Fläche oder Punkt) steht im GeoKeyDirectory (Schlüssel 1025).
//
// Das Netzwerk kommt von außen: readRange(start, end) liefert die Bytes start..end (einschließlich) als ArrayBuffer, bei Dateiende auch weniger.

import { DemError, ERR, cleanValue, mergeRanges } from './dem_logic.js';

var TYPE_SIZE = { 1: 1, 2: 1, 3: 2, 4: 4, 6: 1, 7: 1, 8: 2, 9: 4, 11: 4, 12: 8 };
var TAG = { width: 256, length: 257, bits: 258, compression: 259, stripOffsets: 273, samples: 277, rowsPerStrip: 278, stripCounts: 279, planar: 284,
  predictor: 317, tileWidth: 322, tileLength: 323, tileOffsets: 324, tileCounts: 325, sampleFormat: 339, pixelScale: 33550, tiepoint: 33922,
  transformation: 34264, geoKeys: 34735, nodata: 42113 };
var HEAD_BYTES = 16384;          // erster Abruf: bei Cloud Optimized GeoTIFF liegt das Verzeichnis meist am Dateianfang
var MERGE_GAP = 32768, MERGE_MAX = 4 * 1024 * 1024;

function unsupported(detail) { return new DemError(ERR.UNSUPPORTED, detail); }

async function inflate(bytes) {
  if (typeof DecompressionStream === 'undefined') throw unsupported('Deflate nicht verfügbar');
  var stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('deflate'));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

// Öffnet eine Datei und liest Kopf und Verzeichnis. Ergebnis: Beschreibung des Rasters mit readBlocks().
export async function openTiff(readRange) {
  var head = await readRange(0, HEAD_BYTES - 1);
  if (head.byteLength < 8) throw unsupported('Datei zu kurz');
  var dv = new DataView(head), order = dv.getUint16(0);
  var le = order === 0x4949;
  if (!le && order !== 0x4D4D) throw unsupported('kein TIFF');
  var magic = dv.getUint16(2, le);
  if (magic === 43) throw unsupported('BigTIFF');
  if (magic !== 42) throw unsupported('kein TIFF');

  async function bytesAt(offset, length) {
    if (offset + length <= head.byteLength) return head.slice(offset, offset + length);
    var buf = await readRange(offset, offset + length - 1);
    if (buf.byteLength < length) throw unsupported('Datei zu kurz');
    return buf;
  }

  var ifdOffset = dv.getUint32(4, le);
  var count = new DataView(await bytesAt(ifdOffset, 2)).getUint16(0, le);
  var ifd = new DataView(await bytesAt(ifdOffset + 2, count * 12));
  var tags = {};
  for (var i = 0; i < count; i++) {
    var o = i * 12, tag = ifd.getUint16(o, le), type = ifd.getUint16(o + 2, le), n = ifd.getUint32(o + 4, le);
    var size = (TYPE_SIZE[type] || 0) * n;
    if (!size) continue;
    var data = size <= 4 ? ifd.buffer.slice(ifd.byteOffset + o + 8, ifd.byteOffset + o + 8 + size) : await bytesAt(ifd.getUint32(o + 8, le), size);
    tags[tag] = readValues(new DataView(data), type, n, le);
  }

  function one(t, fallback) { var v = tags[t]; return v == null ? fallback : v[0]; }
  var info = {
    width: one(TAG.width), height: one(TAG.length), bits: one(TAG.bits, 1), compression: one(TAG.compression, 1), predictor: one(TAG.predictor, 1),
    samples: one(TAG.samples, 1), planar: one(TAG.planar, 1), sampleFormat: one(TAG.sampleFormat, 1), littleEndian: le
  };
  if (!info.width || !info.height) throw unsupported('Größe fehlt');
  if (info.samples !== 1 || info.planar !== 1) throw unsupported('mehrere Bänder');
  if (info.compression !== 1 && info.compression !== 8 && info.compression !== 32946) throw unsupported('Kompression ' + info.compression);
  if (info.predictor !== 1 && info.predictor !== 2 && info.predictor !== 3) throw unsupported('Predictor ' + info.predictor);
  var kind = info.bits === 32 && info.sampleFormat === 3 ? 'f32' : info.bits === 16 && info.sampleFormat === 2 ? 'i16' : info.bits === 16 && info.sampleFormat === 1 ? 'u16' : null;
  if (!kind) throw unsupported(info.bits + ' Bit, Format ' + info.sampleFormat);
  if (info.predictor === 3 && kind !== 'f32') throw unsupported('Gleitkomma-Predictor bei Ganzzahl');
  if (info.predictor === 2 && kind === 'f32') throw unsupported('horizontaler Predictor bei Gleitkomma');
  info.kind = kind;
  info.bytes = info.bits / 8;
  if (tags[TAG.transformation] && !tags[TAG.pixelScale]) throw unsupported('gedrehtes Raster');

  var offsets, counts;
  if (tags[TAG.tileWidth]) {
    info.blockW = tags[TAG.tileWidth][0]; info.blockH = tags[TAG.tileLength][0];
    offsets = tags[TAG.tileOffsets]; counts = tags[TAG.tileCounts];
    info.across = Math.ceil(info.width / info.blockW);
  } else {
    info.blockW = info.width; info.blockH = Math.min(one(TAG.rowsPerStrip, info.height), info.height);
    offsets = tags[TAG.stripOffsets]; counts = tags[TAG.stripCounts];
    info.across = 1;
  }
  info.down = Math.ceil(info.height / info.blockH);
  if (!offsets || !counts || offsets.length < info.across * info.down || counts.length < offsets.length) throw unsupported('Blockverzeichnis fehlt');
  info.tiled = !!tags[TAG.tileWidth];
  info.nodata = tags[TAG.nodata] ? parseFloat(tags[TAG.nodata][0]) : null;
  if (info.nodata != null && isNaN(info.nodata)) info.nodata = null;
  info.geo = geoOf(tags, info);
  info.readBlocks = function (indices) { return readBlocks(info, offsets, counts, readRange, indices); };
  return info;
}

function readValues(dv, type, n, le) {
  var out = [];
  if (type === 2) {   // ASCII
    var s = '';
    for (var k = 0; k < n; k++) { var c = dv.getUint8(k); if (c === 0) break; s += String.fromCharCode(c); }
    return [s];
  }
  for (var i = 0; i < n; i++) {
    switch (type) {
      case 1: case 7: out.push(dv.getUint8(i)); break;
      case 6: out.push(dv.getInt8(i)); break;
      case 3: out.push(dv.getUint16(i * 2, le)); break;
      case 8: out.push(dv.getInt16(i * 2, le)); break;
      case 4: out.push(dv.getUint32(i * 4, le)); break;
      case 9: out.push(dv.getInt32(i * 4, le)); break;
      case 11: out.push(dv.getFloat32(i * 4, le)); break;
      case 12: out.push(dv.getFloat64(i * 8, le)); break;
    }
  }
  return out;
}

// Georeferenz: nordorientiert, aus ModelPixelScale und ModelTiepoint (Pixel 0/0 → Länge/Breite); sonst null (Höhen sind dann nicht verortbar).
function geoOf(tags, info) {
  var scale = tags[TAG.pixelScale], tie = tags[TAG.tiepoint];
  if (!scale || !tie || tie.length < 6 || scale.length < 2) return null;
  var pointIsArea = true;
  var keys = tags[TAG.geoKeys];
  if (keys && keys.length >= 4) {
    for (var i = 0; i < keys[3]; i++) {
      var base = 4 + i * 4;
      if (keys[base] === 1025) pointIsArea = keys[base + 3] !== 2;   // 1 = Fläche, 2 = Punkt
    }
  }
  // Bezugspixel des Tiepoints (i, j) ist meist 0/0; andernfalls wird auf die Ecke des Rasters umgerechnet
  var originLon = tie[3] - tie[0] * scale[0], originLat = tie[4] + tie[1] * scale[1];
  return { originLon: originLon, originLat: originLat, dx: scale[0], dy: scale[1], pointIsArea: pointIsArea, width: info.width, height: info.height };
}

// Lädt und entpackt die Blöcke (Nummern in Leserichtung) und liefert eine Map: Nummer → { data: Float32Array | Int16Array | Uint16Array, w, h }.
// Zusammenhängende Blöcke werden in einem Abruf geladen.
async function readBlocks(info, offsets, counts, readRange, indices) {
  var ranges = indices.map(function (idx) { return { start: offsets[idx], end: offsets[idx] + counts[idx] - 1, idx: idx }; });
  var out = new Map();
  var merged = mergeRanges(ranges, MERGE_GAP, MERGE_MAX);
  await Promise.all(merged.map(async function (m) {
    var buf = await readRange(m.start, m.end);
    if (buf.byteLength < m.end - m.start + 1) throw unsupported('Block abgeschnitten');
    for (var p = 0; p < m.parts.length; p++) {
      var part = m.parts[p];
      var raw = new Uint8Array(buf, part.start - m.start, part.end - part.start + 1);
      out.set(part.idx, await decodeBlock(info, raw, part.idx));
    }
  }));
  return out;
}

async function decodeBlock(info, raw, idx) {
  var w = info.blockW, h = info.blockH;
  if (!info.tiled) { var by = idx; h = Math.min(info.blockH, info.height - by * info.blockH); }
  var bytes = info.compression === 1 ? new Uint8Array(raw) : await inflate(raw);
  var need = w * h * info.bytes;
  if (bytes.length < need) throw unsupported('Block zu kurz');
  var rowBytes = w * info.bytes;
  if (info.predictor === 3) {
    // Gleitkomma-Predictor: je Zeile Byte-Differenzen auflösen, dann die Bytes der Werte aus vier Ebenen (höchstwertiges Byte zuerst) zusammensetzen
    var fixed = new Uint8Array(need), tmp = new Uint8Array(rowBytes);
    for (var r = 0; r < h; r++) {
      var row = bytes.subarray(r * rowBytes, (r + 1) * rowBytes);
      for (var i = 1; i < rowBytes; i++) row[i] = (row[i] + row[i - 1]) & 255;
      tmp.set(row);
      for (var c = 0; c < w; c++) for (var b = 0; b < info.bytes; b++) fixed[r * rowBytes + c * info.bytes + (info.bytes - 1 - b)] = tmp[b * w + c];   // Ergebnis in Little-Endian
    }
    return { data: new Float32Array(fixed.buffer, 0, w * h), w: w, h: h };
  }
  var buffer = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + need);
  var data;
  if (info.bytes === 4) data = new Float32Array(w * h); else data = info.kind === 'i16' ? new Int16Array(w * h) : new Uint16Array(w * h);
  var view = new DataView(buffer);
  for (var k = 0; k < w * h; k++) {
    var off = k * info.bytes;
    data[k] = info.bytes === 4 ? view.getFloat32(off, info.littleEndian) : info.kind === 'i16' ? view.getInt16(off, info.littleEndian) : view.getUint16(off, info.littleEndian);
  }
  if (info.predictor === 2) {
    for (var rr = 0; rr < h; rr++) for (var cc = 1; cc < w; cc++) data[rr * w + cc] += data[rr * w + cc - 1];
  }
  return { data: data, w: w, h: h };
}

// Nummer des Blocks, der das Pixel (col, row) enthält.
export function blockIndex(info, col, row) {
  return Math.floor(row / info.blockH) * info.across + Math.floor(col / info.blockW);
}

// Wert eines Pixels aus bereits geladenen Blöcken (Map aus readBlocks) oder null (Block fehlt oder NoData).
export function pixelValue(info, blocks, col, row) {
  var b = blocks.get(blockIndex(info, col, row));
  if (!b) return null;
  var c = col - (col % info.blockW), r = row - (row % info.blockH);
  return cleanValue(b.data[(row - r) * b.w + (col - c)], info.nodata);
}
