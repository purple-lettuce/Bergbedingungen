// Lawinenlage entlang der Route (RI9a), reine Logik ohne Karte, Seite und Datenzugriff.
// Eingabe: Routenobjekt (route_model.js) und die Regionen der Lawinenlage (Polygone mit properties.region_id plus je Region eine Ansicht
// { record, source, status } wie in avalanche.js: record = Regionsdatensatz des Standardmodells, source = Metadaten der Quelle,
// status = 'valid' | 'stale' | 'expired' | 'none'). Der Schnitt der Route mit den Regionen kommt aus route_overlay.js (RI7), die Stufe aus
// avalanche_logic.js (levelAtAltitude, dieselbe Logik wie die Karte).
//
// Ergebnis: Abschnitte der Route (von km bis km) je Region und Stufe. Die Höhe der Route entscheidet, welche Stufe gilt:
//   basis 'route'       Höhe der Route verwendet (die Quelle nennt Höhengrenzen)
//   basis 'region_max'  die Route hat an dieser Stelle keine Höhe: höchste Stufe der Region (vorsichtig), so gekennzeichnet
//   basis 'region'      die Quelle nennt keine Höhengrenzen (z. B. SLF): die Stufe gilt für die ganze Region, die Höhe ist ohne Einfluss
// uncertain: die Stufe hängt von einer Waldgrenze ohne Zahlenwert ab (levelAtAltitude). Ohne gültigen Bericht (Status 'none' oder
// 'expired') gibt es keine Stufe (level null, reason = Status); bei gültigem Bericht ohne Stufe (kein Schnee, keine Beurteilung) ist
// level null und reason 'no_rating'. "Keine Stufe" ist nie "keine Gefahr"; die Texte dazu liegen in der Anzeige.
//
// Höhenunsicherheit: GPS- und Barometerhöhen schwanken um einige Meter. Deshalb wird die Höhe über +-SMOOTH_SAMPLES Proben gemittelt und
// die Stufe vorsichtig bestimmt: gilt innerhalb von +-ELE_MARGIN_M um die Höhe unterschiedlich, zählt die höhere Stufe, und der Abschnitt trägt
// nearBoundary (Höhe nahe einer Höhengrenze). Die Grenze zwischen zwei Stufen liegt dadurch bis zu ELE_MARGIN_M Höhenmeter früher, als es die
// Zahl der Quelle allein ergäbe (auf steilen Strecken wenige Meter, auf flachen mehr). Abschnitte unter MIN_SEGMENT_M werden zusätzlich in den
// Nachbarn mit der höheren Stufe aufgenommen (nie zur niedrigeren Stufe hin). eleMin/eleMax nennen die ungeglätteten Höhen der Datei.

import { pointAtKm } from './geo.js';
import { prepareFeatures, routeOverlay } from './route_overlay.js';
import { levelAtAltitude, hasElevationRatings } from './avalanche_logic.js';

export const STEP_M = 25;
export const SMOOTH_SAMPLES = 3;
export const MIN_SEGMENT_M = 50;
export const ELE_MARGIN_M = 10;

function sampleKms(fromKm, toKm) {
  var out = [], f = fromKm * 1000, t = toKm * 1000;
  for (var m = f; m < t; m += STEP_M) out.push(m / 1000);
  out.push(t / 1000);
  return out;
}

function smooth(eles) {
  return eles.map(function (_, i) {
    var sum = 0, n = 0;
    for (var j = Math.max(0, i - SMOOTH_SAMPLES); j <= Math.min(eles.length - 1, i + SMOOTH_SAMPLES); j++) if (eles[j] != null) { sum += eles[j]; n++; }
    return n ? sum / n : null;
  });
}

function problemTypes(record) {
  var seen = [];
  (record.avalanche_problems || []).forEach(function (p) { if (p.type && seen.indexOf(p.type) === -1) seen.push(p.type); });
  return seen;
}

function base(view, section) {
  var rec = view.record;
  return {
    regionId: rec.region_id, regionName: rec.region_name, sourceId: rec.source, source: view.source, status: view.status,
    fromKm: section.fromKm, toKm: section.toKm, validFrom: rec.valid_from, validUntil: rec.valid_until, publishedAt: rec.publication_time,
    mainDate: rec.main_date, problemTypes: problemTypes(rec), eleMin: null, eleMax: null
  };
}

function rank(s) { return (s.level || 0) * 10 + (s.uncertain ? 1 : 0); }

// Stufe für eine Höhe mit Sicherheitsabstand: die höchste Stufe, die innerhalb von +-ELE_MARGIN_M gilt; nearBoundary, wenn sich das Ergebnis dadurch vom Wert bei der Höhe selbst unterscheidet.
function levelWithMargin(record, ele) {
  var list = [ele - ELE_MARGIN_M, ele, ele + ELE_MARGIN_M].map(function (e) { return levelAtAltitude(record, e); }), best = null, mid = list[1];
  list.forEach(function (r) { if (r && (!best || rank(r) > rank(best))) best = r; });
  var differs = list.some(function (r) { return (r ? r.level : null) !== (mid ? mid.level : null) || (r ? !!r.uncertain : false) !== (mid ? !!mid.uncertain : false); });
  return { res: best, nearBoundary: differs };
}

// Fasst b in a zusammen (benachbarte Abschnitte derselben Region): Bereich vereint, Stufe und Kennzeichen vom höheren.
function mergeSegments(a, b) {
  var hi = rank(b) > rank(a) ? b : a;
  var out = Object.assign({}, hi, { fromKm: Math.min(a.fromKm, b.fromKm), toKm: Math.max(a.toKm, b.toKm) });
  var mins = [a.eleMin, b.eleMin].filter(function (v) { return v != null; }), maxs = [a.eleMax, b.eleMax].filter(function (v) { return v != null; });
  out.nearBoundary = !!(a.nearBoundary || b.nearBoundary);
  out.eleMin = mins.length ? Math.min.apply(null, mins) : null;
  out.eleMax = maxs.length ? Math.max.apply(null, maxs) : null;
  return out;
}

function sameKind(a, b) {
  return a.level === b.level && a.subdivision === b.subdivision && a.uncertain === b.uncertain && a.basis === b.basis && a.reason === b.reason;
}

// Abschnitte einer Region entlang eines Teilstücks der Route: nach Höhe in Stufen aufgeteilt.
function segmentsForSection(route, view, section) {
  var head = base(view, section);
  if (view.status === 'none' || view.status === 'expired') {
    return [Object.assign(head, { level: null, subdivision: null, uncertain: false, basis: null, reason: view.status })];
  }
  var kms = sampleKms(section.fromKm, section.toKm);
  var eles = kms.map(function (km) { var p = pointAtKm(route.points, km); return p && p.ele != null ? p.ele : null; });
  var sm = smooth(eles), elevationAware = hasElevationRatings(view.record);
  var kinds = sm.map(function (e) {
    var near = false, res;
    if (elevationAware && e != null) { var m = levelWithMargin(view.record, e); res = m.res; near = m.nearBoundary; }
    else res = levelAtAltitude(view.record, null);
    var basis = !elevationAware ? 'region' : e == null ? 'region_max' : 'route';
    return res ? { level: res.level, subdivision: res.subdivision || null, uncertain: !!res.uncertain, basis: basis, reason: null, nearBoundary: near }
      : { level: null, subdivision: null, uncertain: false, basis: basis, reason: 'no_rating', nearBoundary: near };
  });
  var segs = [], i = 0;
  while (i < kms.length) {
    var j = i;
    while (j + 1 < kms.length && sameKind(kinds[j + 1], kinds[i])) j++;
    var from = i === 0 ? section.fromKm : (kms[i - 1] + kms[i]) / 2, to = j === kms.length - 1 ? section.toKm : (kms[j] + kms[j + 1]) / 2;
    var raw = eles.slice(i, j + 1).filter(function (v) { return v != null; });
    segs.push(Object.assign({}, head, kinds[i], { nearBoundary: kinds.slice(i, j + 1).some(function (k) { return k.nearBoundary; }), fromKm: from, toKm: to, eleMin: raw.length ? Math.min.apply(null, raw) : null, eleMax: raw.length ? Math.max.apply(null, raw) : null }));
    i = j + 1;
  }
  // Kurze Abschnitte (Rauschen an einer Höhengrenze) in den Nachbarn mit der höheren Stufe aufnehmen
  var changed = true;
  while (changed && segs.length > 1) {
    changed = false;
    for (var k = 0; k < segs.length; k++) {
      if ((segs[k].toKm - segs[k].fromKm) * 1000 >= MIN_SEGMENT_M) continue;
      var left = segs[k - 1], right = segs[k + 1], pick = !left ? k + 1 : !right ? k - 1 : (rank(right) > rank(left) ? k + 1 : k - 1);
      var lo = Math.min(k, pick), hi = Math.max(k, pick);
      segs.splice(lo, 2, mergeSegments(segs[lo], segs[hi]));
      changed = true;
      break;
    }
    for (var m = 1; m < segs.length; m++) if (sameKind(segs[m - 1], segs[m])) { segs.splice(m - 1, 2, mergeSegments(segs[m - 1], segs[m])); m--; }
  }
  return segs;
}

// Strecken der Route, für die keine Region vorliegt, als [[von, bis], …] in Kilometern.
function uncoveredRanges(routeKm, sections) {
  var covered = sections.map(function (s) { return [s.fromKm, s.toKm]; }).sort(function (a, b) { return a[0] - b[0]; });
  var out = [], pos = 0;
  covered.forEach(function (c) {
    if (c[0] > pos + 0.001) out.push([pos, c[0]]);
    pos = Math.max(pos, c[1]);
  });
  if (routeKm > pos + 0.001) out.push([pos, routeKm]);
  return out;
}

// regions: { features: [GeoJSON-Features mit properties.region_id], view(regionId) -> { record, source, status } | null, prepared? }
// Ergebnis { segments, uncovered, routeKm }; segments nach Beginn sortiert.
export function routeAvalanche(route, regions) {
  var routeKm = route && route.lengthM ? route.lengthM / 1000 : 0;
  if (!route || !route.points || !route.points.length || !regions || !regions.features) return { segments: [], uncovered: routeKm ? [[0, routeKm]] : [], routeKm: routeKm };
  var prep = regions.prepared || prepareFeatures(regions.features, function (f) { return f.properties && f.properties.region_id; });
  var out = routeOverlay(route, prep), segments = [], sections = [];
  out.sections.forEach(function (s) {
    var view = regions.view(s.featureId);
    if (!view) return;
    sections.push(s);
    segmentsForSection(route, view, s).forEach(function (seg) { segments.push(seg); });
  });
  segments.sort(function (a, b) { return (a.fromKm - b.fromKm) || String(a.regionId).localeCompare(String(b.regionId)); });
  return { segments: segments, uncovered: uncoveredRanges(routeKm, sections), routeKm: routeKm };
}
