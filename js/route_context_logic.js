// Reine Logik zu "Entlang der Route" (RI8, kein DOM, kein Leaflet): Abschnitte je Quelle zu Einträgen zusammenfassen und die Texte
// bilden. Die Quellen (Schutzgebiete, Sperrungen und Hinweise) melden sich über route_sources.js; der Schnitt selbst liegt in route_overlay.js.
// Sprache bleibt neutral ("berührt"): keine Bewertung, keine Empfehlung. "Keine Überschneidung" wird nur gesagt, wenn alle Quellen
// geladen sind, und nennt immer, dass sich die Aussage nur auf die geladenen Daten bezieht.

import { pointAtKm } from './geo.js';

export const SOURCES = [
  { id: 'protectedAreas', label: 'Schutzgebiete', one: 'Schutzgebiet', many: 'Schutzgebiete' },
  { id: 'closures', label: 'Sperrungen und Hinweise', one: 'Sperrung oder Hinweis', many: 'Sperrungen und Hinweise' }
];

const MERGE_KM = 0.001;   // Abschnitte desselben Eintrags, die sich berühren oder weniger als 1 m auseinanderliegen, werden vereint

function km1(v) { return v.toLocaleString('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 1 }); }

// "km 3,2–5,6" bzw. "bei km 3,2" für sehr kurze Abschnitte (unter 50 m).
export function formatRange(fromKm, toKm) {
  if (toKm - fromKm < 0.05) return 'bei km ' + km1((fromKm + toKm) / 2);
  return 'km ' + km1(fromKm) + '–' + km1(toKm);
}

// Abschnitte (featureId, fromKm, toKm) einer Quelle zu Einträgen: gleiche Schlüssel (z. B. alle Flächen eines Gebiets) werden vereint.
// describe(featureId) liefert { key, title, meta, popupHtml, popupOptions } oder null (dann entfällt der Abschnitt).
// Ergebnis: Einträge { key, title, meta, ranges: [[from, to]], totalKm, firstKm, popupHtml, popupOptions }, sortiert nach Beginn, dann Titel.
export function buildEntries(sections, describe) {
  var byKey = new Map();
  (sections || []).forEach(function (s) {
    var info = describe(s.featureId);
    if (!info) return;
    var e = byKey.get(info.key);
    if (!e) { e = { key: info.key, title: info.title, meta: info.meta, popupHtml: info.popupHtml, popupOptions: info.popupOptions || null, ranges: [] }; byKey.set(info.key, e); }
    e.ranges.push([s.fromKm, s.toKm]);
  });
  var out = [];
  byKey.forEach(function (e) {
    e.ranges.sort(function (a, b) { return a[0] - b[0]; });
    var merged = [];
    e.ranges.forEach(function (r) {
      var last = merged[merged.length - 1];
      if (last && r[0] <= last[1] + MERGE_KM) last[1] = Math.max(last[1], r[1]);
      else merged.push([r[0], r[1]]);
    });
    e.ranges = merged;
    e.firstKm = merged[0][0];
    e.totalKm = merged.reduce(function (a, r) { return a + (r[1] - r[0]); }, 0);
    out.push(e);
  });
  out.sort(function (a, b) { return (a.firstKm - b.firstKm) || String(a.title).localeCompare(String(b.title), 'de'); });
  return out;
}

// Eintragszeile: alle Abschnitte, getrennt durch Semikolon.
export function rangesText(entry) { return entry.ranges.map(function (r) { return formatRange(r[0], r[1]); }).join('; '); }

function plural(n, one, many) { return n.toLocaleString('de-DE') + ' ' + (n === 1 ? one : many); }

// Zeile zum Zustand einer Quelle, solange sie nicht bereit ist; sonst null.
export function sourceProblem(src, state) {
  if (state === 'ready') return null;
  if (state === 'failed') return src.label + ': nicht verfügbar, hier nicht geprüft.';
  return src.label + ': werden noch geladen, hier noch nicht geprüft.';
}

// Datenstand einer Quelle für den Hinweis unter der Liste. info = { count, stand } aus der Quelle.
export function standText(src, info) {
  var n = info && info.count != null ? plural(info.count, src.id === 'closures' ? 'Eintrag' : 'Gebiet', src.id === 'closures' ? 'Einträge' : 'Gebiete') : '';
  var stand = info && info.stand ? 'Stand ' + info.stand : 'ohne Zeitangabe in der Datei';
  return src.label + ': ' + [n, stand].filter(Boolean).join(', ');
}

// Zusammenfassung. results: { [quellenId]: { state: 'pending' | 'ready' | 'failed', entries, info } }.
// Ergebnis { headline, notes: [Text], complete }: headline nennt die Anzahl oder "keine Überschneidung"; notes sind Hinweise
// (nicht geprüfte Quellen, Datenstand, Grenze der Aussage).
export function summarize(results) {
  var parts = [], notes = [], complete = true, total = 0;
  SOURCES.forEach(function (src) {
    var r = results[src.id] || { state: 'pending', entries: [] };
    var problem = sourceProblem(src, r.state);
    if (problem) { complete = false; notes.push(problem); return; }
    var n = r.entries.length;
    total += n;
    if (n) parts.push(plural(n, src.one, src.many));
  });
  var headline;
  if (total) headline = 'Die Route berührt ' + parts.join(' und ') + '.';
  else if (complete) headline = 'In den geladenen Daten keine Überschneidung.';
  else headline = 'Noch nicht vollständig geprüft.';
  SOURCES.forEach(function (src) {
    var r = results[src.id];
    if (r && r.state === 'ready') notes.push(standText(src, r.info));
  });
  if (complete) notes.push('Das ist keine Aussage über Risiken oder Einschränkungen, die in diesen Daten fehlen. Aktuelle Lage bei Hütte, Gemeinde oder Behörde prüfen.');
  return { headline: headline, notes: notes, complete: complete };
}

// Linienzug der Route zwischen zwei Streckenkilometern als [[lat, lon], …] (Anfang, alle Routenpunkte dazwischen, Ende).
export function sectionPath(route, fromKm, toKm) {
  var a = pointAtKm(route.points, fromKm), b = pointAtKm(route.points, toKm);
  if (!a || !b) return [];
  var out = [[a.lat, a.lon]], f = fromKm * 1000, t = toKm * 1000;
  route.points.forEach(function (p) { if (p.dist > f && p.dist < t) out.push([p.lat, p.lon]); });
  out.push([b.lat, b.lon]);
  return out;
}

// Punkt in der Mitte eines Abschnitts als { lat, lon }.
export function sectionMiddle(route, fromKm, toKm) { return pointAtKm(route.points, (fromKm + toKm) / 2); }
