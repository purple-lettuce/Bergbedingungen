// Texte und Zusammenfassung für "Lawinenlage entlang der Route" (RI9b, reine Logik ohne DOM und Karte). Auf dem Ergebnis von
// route_avalanche.js (RI9a); Stufenbezeichnungen, Probleme und Berichtslinks kommen aus avalanche_symbols.js und avalanche_logic.js.
// Neutrale Sprache: Die Lawinenlage ist ein Regionalbericht, keine Aussage über eine einzelne Route, und "kein Bericht" ist nie "keine Gefahr".

import { formatRange } from './route_context_logic.js';
import { ratingText, problemModel } from './avalanche_symbols.js';
import { formatTime, reportUrl } from './avalanche_logic.js';

export const REGIONAL_NOTE = 'Die Lawinenlage ist ein Regionalbericht für ein ganzes Gebiet. Sie beschreibt keine einzelne Route, keinen einzelnen Hang und ersetzt weder den Lagebericht des Warndienstes noch die eigene Beurteilung vor Ort.';
export const NO_REPORT_NOTE = 'Außerhalb der Wintersaison werden Berichte nur selten oder gar nicht veröffentlicht. „Kein aktueller Bericht“ heißt nicht „keine Gefahr“.';

function meters(v) { return Math.round(v).toLocaleString('de-DE') + ' m'; }

// Höhenangabe zum Abschnitt: "Höhe der Route 2.300–2.650 m" (oder eine Höhe, wenn beide gleich sind), sonst null.
export function elevationText(seg) {
  if (seg.eleMin == null || seg.eleMax == null) return null;
  var lo = Math.round(seg.eleMin), hi = Math.round(seg.eleMax);
  return 'Höhe der Route ' + (lo === hi ? meters(lo) : lo.toLocaleString('de-DE') + '–' + meters(hi));
}

// Stufentext eines Abschnitts: "Stufe 2 – Mäßig" bzw. der Grund, warum es keine Stufe gibt.
export function levelText(seg) {
  if (seg.level) return ratingText({ level: seg.level, subdivision: seg.subdivision });
  if (seg.reason === 'none') return 'Kein aktueller Lagebericht';
  if (seg.reason === 'expired') return 'Kein aktueller Lagebericht (letzter Bericht galt bis ' + formatTime(seg.validUntil) + ' Uhr)';
  return 'Keine Stufe angegeben (kein Schnee oder keine Beurteilung)';
}

// Erläuterungen zur Herkunft der Stufe, als Liste kurzer Zeilen.
export function basisLines(seg) {
  var lines = [];
  if (!seg.level) return lines;
  var ele = elevationText(seg);
  if (seg.basis === 'route') {
    if (ele) lines.push(ele);
    if (seg.nearBoundary) lines.push('Höhe nahe einer Höhengrenze des Berichts: vorsichtig die höhere Stufe');
  } else if (seg.basis === 'region_max') {
    lines.push('Route ohne Höhenangaben: höchste Stufe der Region');
  } else if (seg.basis === 'region') {
    lines.push('Die Quelle nennt keine Höhengrenzen: die Stufe gilt für die ganze Region');
  }
  if (seg.uncertain) lines.push('Die Höhengrenze im Bericht ist die Waldgrenze ohne Zahlenwert: Stufe unsicher');
  if (seg.status === 'stale') lines.push('Bericht abgelaufen, ein neuer wird erwartet: bitte aktuellen Stand beim Warndienst prüfen');
  return lines;
}

// Lawinenprobleme der Region als Text, oder null.
export function problemsText(seg) {
  if (!seg.level) return null;   // ohne gültigen Bericht keine Probleme eines alten Berichts zeigen
  var names = (seg.problemTypes || []).map(function (t) { return problemModel(t).name; });
  return names.length ? 'Lawinenprobleme der Region: ' + names.join(', ') : null;
}

// Quellenzeile: Dienst und Stand der Veröffentlichung; ohne Bericht nur der Dienst.
export function sourceText(seg) {
  var name = seg.source && seg.source.name ? seg.source.name : seg.sourceId;
  return seg.publishedAt && seg.level !== null ? 'Quelle: ' + name + ', Stand ' + formatTime(seg.publishedAt) + ' Uhr' : 'Quelle: ' + name;
}

// Link zum Lagebericht beim Warndienst (nur https), oder null.
export function reportLink(seg) {
  if (!seg.source || !seg.source.report_url) return null;
  var url = reportUrl(seg.source, { main_date: seg.mainDate });
  return /^https:\/\//.test(url || '') ? url : null;
}

// Eintrag der Liste.
export function itemOf(seg) {
  return {
    regionId: seg.regionId, title: seg.regionName, range: formatRange(seg.fromKm, seg.toKm), level: seg.level, subdivision: seg.subdivision,
    uncertain: seg.uncertain, levelText: levelText(seg), lines: basisLines(seg), problems: problemsText(seg), source: sourceText(seg),
    link: reportLink(seg), attribution: seg.source ? { name: seg.source.attribution, url: seg.source.attribution_url } : null, seg: seg
  };
}

function plural(n, one, many) { return n.toLocaleString('de-DE') + ' ' + (n === 1 ? one : many); }

// state: 'loading' | 'failed' | 'ready'; result: Ergebnis von routeAvalanche (nur bei 'ready').
// Ergebnis { headline, notes: [Text], items: [Eintrag] }.
export function summarizeAvalanche(state, result) {
  if (state === 'loading') return { headline: 'Lawinenlage wird geladen …', notes: [], items: [] };
  if (state !== 'ready' || !result) return { headline: 'Lawinenlage: nicht verfügbar, hier nicht geprüft.', notes: [], items: [] };
  var items = result.segments.map(itemOf), notes = [], headline;
  var withLevel = items.filter(function (i) { return i.level; }), regions = new Set(result.segments.map(function (s) { return s.regionId; }));
  if (!items.length) {
    headline = 'Die Route liegt in keiner Region der geladenen Lawinenberichte.';
  } else if (!withLevel.length) {
    headline = 'Kein aktueller Lawinenbericht für ' + (regions.size === 1 ? 'die Region' : 'die ' + regions.size + ' Regionen') + ' entlang der Route.';
    notes.push(NO_REPORT_NOTE);
  } else {
    headline = 'Die Route verläuft durch ' + plural(regions.size, 'Region', 'Regionen') + ' mit Lawinenbericht.';
    if (withLevel.length < items.length) notes.push('Für einen Teil der Strecke liegt kein aktueller Bericht vor. ' + NO_REPORT_NOTE);
  }
  if (items.length) result.uncovered.forEach(function (u) {
    notes.push('Für ' + formatRange(u[0], u[1]) + ' liegt keine Region der geladenen Berichte vor.');
  });
  notes.push(REGIONAL_NOTE);
  return { headline: headline, notes: notes, items: items };
}
