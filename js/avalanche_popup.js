// Popup der Lawinenlage: dieselbe Komponente für jede Quelle (reines Modul, kein DOM, kein Leaflet, liefert HTML als Text).
// Eingabe ist ein Regionsdatensatz des gemeinsamen Datenmodells (siehe avalanche_model.js), die Metadaten der Quelle
// (Name, Namensnennung, Lizenz, Link) und der Berichtsstatus. Die Komponente kennt keine Quelle: Unterschiede zwischen
// Ländern ergeben sich allein daraus, welche Felder des Datensatzes gefüllt sind (z. B. Zusammenfassung, Gefahrenstufe
// je Lawinenproblem, Teilstufe). Alle Texte aus den Daten werden maskiert, Berichtstexte kommen als Blöcke, nie als HTML.

import { esc } from './html.js';
import {
  DANGER_LEVELS, VALUE_NAMES, ICON_BASE, STABILITY_NAMES, FREQUENCY_NAMES, SIZE_NAMES, PERIOD_NAMES, TENDENCY_NAMES,
  SECTION_TITLES, levelLabel, ratingText, levelChip, aspectsLabel, roseSvg, elevationLabel, elevationSvg, problemModel,
  dangerPatternLabel
} from './avalanche_symbols.js';
import { bandGroups, problemGroups, reportUrl, formatTime, formatDay } from './avalanche_logic.js';

const NO_REPORT_HINT = 'Außerhalb der Wintersaison werden Berichte nur selten oder gar nicht veröffentlicht.';

export function safeUrl(u) {
  return /^https:\/\//.test(u || '') ? u : '#';
}

function img(src, cls, alt) {
  return '<img class="' + cls + '" src="' + ICON_BASE + esc(src) + '" alt="' + esc(alt) + '">';
}

// Textblöcke des Datenmodells (paragraph, heading, list), alles maskiert
function blocksHtml(blocks) {
  return (blocks || []).map(function (b) {
    if (b.type === 'heading') return '<h5 class="av-h">' + esc(b.text) + '</h5>';
    if (b.type === 'list') return '<ul class="av-list">' + b.items.map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('') + '</ul>';
    return '<p>' + esc(b.text) + '</p>';
  }).join('');
}

function section(title, html) {
  return html ? '<section class="av-sec mr-stack mr-gap-xs"><h4 class="mr-label">' + esc(title) + '</h4>' + html + '</section>' : '';
}

function ratingsHtml(bands) {
  const groups = bandGroups(bands);
  return groups.map(function (g) {
    const picto = g.picto ? img('pictos/levels_' + g.picto[0] + '_' + g.picto[1] + '.webp', 'av-picto',
      g.picto[0] === g.picto[1] ? 'Gefahrenstufe ' + g.picto[0] : 'Gefahrenstufe ' + g.picto[0] + ' unterhalb, ' + g.picto[1] + ' oberhalb der Höhengrenze') : '';
    const rows = g.rows.map(function (r) {
      const types = (r.problem_types || []).map(function (t) { return problemModel(t).name; }).join(', ');
      return '<li>' + levelChip(r.level, r.subdivision) + '<span><b>' + esc(elevationLabel(r.elevation)) + ':</b> ' + esc(ratingText(r)) +
        (types ? ' <span class="muted">(' + esc(types) + ')</span>' : '') + '</span></li>';
    }).join('');
    const label = groups.length > 1 || g.period !== 'all_day' ? '<div class="av-period">' + esc(PERIOD_NAMES[g.period] || g.period) + '</div>' : '';
    return '<div class="av-rating">' + label + '<div class="av-rating-body">' + picto + '<ul class="av-rows">' + rows + '</ul></div></div>';
  }).join('');
}

function problemHtml(p, previousCore) {
  const model = problemModel(p.type);
  const facts = [];
  facts.push('<dt>Höhenbereich</dt><dd>' + elevationSvg(p.elevation) + '<span>' + esc(elevationLabel(p.elevation)) + '</span></dd>');
  if (p.aspects && p.aspects.length) {
    facts.push('<dt>Expositionen</dt><dd>' + roseSvg(p.aspects) + '<span>' + esc(aspectsLabel(p.aspects)) + '</span></dd>');
  }
  if (p.danger_rating) facts.push('<dt>Gefahrenstufe</dt><dd>' + levelChip(p.danger_rating.level, p.danger_rating.subdivision) + '<span>' + esc(ratingText(p.danger_rating)) + '</span></dd>');
  if (p.snowpack_stability) facts.push('<dt>Schneedeckenstabilität</dt><dd><span>' + esc(STABILITY_NAMES[p.snowpack_stability] || p.snowpack_stability) + '</span></dd>');
  if (p.frequency) facts.push('<dt>Gefahrenstellen</dt><dd><span>' + esc(FREQUENCY_NAMES[p.frequency] || p.frequency) + '</span></dd>');
  if (p.avalanche_size) facts.push('<dt>Lawinengröße</dt><dd><span>' + esc(SIZE_NAMES[p.avalanche_size] || p.avalanche_size) + '</span></dd>');
  const core = p.core_zone_text && p.core_zone_text !== previousCore ? '<p class="av-core">' + esc(p.core_zone_text) + '</p>' : '';
  return '<div class="av-problem mr-card mr-card--tight mr-stack mr-gap-xs"><div class="av-problem-head">' + (model.icon ? img(model.icon, 'av-problem-icon', model.name) : '') +
    '<div><b>' + esc(model.name) + '</b>' + (p.period !== 'all_day' ? ' <span class="muted">(' + esc(PERIOD_NAMES[p.period] || p.period) + ')</span>' : '') +
    '</div></div><dl class="av-facts mr-kv">' + facts.join('') + '</dl>' + core + '</div>';
}

function problemsHtml(rec) {
  if (!rec.avalanche_problems.length) return '<p>Keine Lawinenprobleme angegeben.</p>';
  return problemGroups(rec).map(function (g) {
    let core = null;
    const cards = g.problems.map(function (p) { const h = problemHtml(p, core); core = p.core_zone_text || core; return h; }).join('');
    return (g.title ? '<h5 class="av-h">' + esc(g.title) + '</h5>' : '') + cards + g.comments.map(blocksHtml).join('');
  }).join('');
}

function tendencyHtml(list) {
  return (list || []).map(function (t) {
    const head = (t.validity_period ? 'Für ' + formatDay(t.validity_period.start) + (t.type ? ': ' : '') : '') + (TENDENCY_NAMES[t.type] || '');
    return (head ? '<p><b>' + esc(head) + '</b></p>' : '') + (t.highlights ? '<p>' + esc(t.highlights) + '</p>' : '') + blocksHtml(t.blocks);
  }).join('');
}

function footerHtml(rec, source) {
  return '<p class="av-foot mr-text-muted mr-text-sm">Gilt für die gesamte Region, nicht für einzelne Hänge. <a href="' + esc(safeUrl(reportUrl(source, rec))) +
    '" target="_blank" rel="noopener">Lagebericht beim Warndienst</a>. Quelle: <a href="' + esc(safeUrl(source.attribution_url)) +
    '" target="_blank" rel="noopener">' + esc(source.attribution) + '</a>, <a href="' + esc(safeUrl(source.license_url)) +
    '" target="_blank" rel="noopener">' + esc(source.license) + '</a>.</p>';
}

// view: { record: Regionsdatensatz, source: Metadaten der Quelle, status: 'valid' | 'stale' | 'expired' | 'none' }
export function popupHtml(view) {
  const rec = view.record, source = view.source, status = view.status;
  const title = '<h3>' + esc(rec.region_name) + '</h3>';
  const ident = '<p class="av-id mr-text-muted mr-text-sm">' + esc(rec.region_id) + ' · ' + esc(source.name) + '</p>';

  if (status === 'none') {
    return '<div class="av-pop pa-pop mr-stack mr-gap-sm">' + title + ident + '<p class="av-warn mr-card mr-card--tight"><b>Kein aktueller Lagebericht.</b> Für diese Region liegt aktuell kein Bericht vor. ' +
      NO_REPORT_HINT + '</p>' + footerHtml(rec, source) + '</div>';
  }
  if (status === 'expired') {
    return '<div class="av-pop pa-pop mr-stack mr-gap-sm">' + title + ident + '<p class="av-warn mr-card mr-card--tight"><b>Kein aktueller Lagebericht.</b> Der letzte Bericht galt bis ' + esc(formatTime(rec.valid_until)) +
      ' Uhr und wird nicht mehr als Gefahrenstufe angezeigt. ' + NO_REPORT_HINT + '</p>' + footerHtml(rec, source) + '</div>';
  }

  const maxName = rec.max_level ? 'Gefahrenstufe ' + levelLabel(rec.max_level, rec.max_subdivision) + ' – ' + DANGER_LEVELS[rec.max_level].name
    : (VALUE_NAMES[rec.danger_ratings[0].value] || '');
  let html = '<div class="av-pop pa-pop mr-stack mr-gap-sm"><div class="av-head pa-pop-head">' + levelChip(rec.max_level, rec.max_subdivision) + '<div class="mr-stack mr-gap-xs">' + title +
    '<p class="av-sub mr-label pa-pop-type">' + esc(maxName) + (rec.danger_ratings.length > 1 ? ' (höchste im Gebiet)' : '') + '</p></div></div>' + ident;

  if (status === 'stale') {
    html += '<p class="av-warn mr-card mr-card--tight"><b>Bericht abgelaufen.</b> Ein neuer Lagebericht wird in Kürze geladen, bitte aktuellen Stand beim Warndienst prüfen.</p>';
  }
  let validity = 'Veröffentlicht: <b>' + esc(formatTime(rec.publication_time)) + '</b> Uhr<br>Gültig von <b>' + esc(formatTime(rec.valid_from)) +
    '</b> bis <b>' + esc(formatTime(rec.valid_until)) + '</b> Uhr';
  if (rec.next_update) validity += '<br>Nächste Aktualisierung: ' + esc(formatTime(rec.next_update)) + ' Uhr';
  if (rec.unscheduled) validity += '<br><b>Außerplanmäßiger Lagebericht</b>';
  html += section('Gültigkeit', '<p>' + validity + '</p>');

  const text = rec.bulletin_text || {};
  if (rec.highlights) html += '<p class="av-lead">' + esc(rec.highlights) + '</p>';
  html += section('Zusammenfassung', text.summary ? '<p><b>' + esc(text.summary) + '</b></p>' : '');

  const bands = rec.danger_by_elevation;
  if (bands.some(function (x) { return x.basis === 'avalanche_problem'; })) {
    // Die Quelle gibt die Stufe für die ganze Region an, Höhen stehen nur bei den Lawinenproblemen
    html += section('Gefahrenstufe', ratingsHtml(rec.danger_ratings.map(function (r) { return { period: r.period, level: r.level, value: r.value, subdivision: r.subdivision }; })));
    html += section('Gefahrenstufe nach Höhe (je Lawinenproblem)', ratingsHtml(bands) +
      '<p class="av-note">Die Quelle nennt die Höhe nur bei den Lawinenproblemen. Die Stufen stammen von den Lawinenproblemen, nicht von einer eigenen Höhenaufteilung der Region.</p>');
  } else {
    html += section('Gefahrenstufe nach Höhe', ratingsHtml(bands));
  }
  html += section('Lawinenprobleme', problemsHtml(rec));

  (text.sections || []).forEach(function (s) {
    html += section(SECTION_TITLES[s.key] || s.key, (s.highlights ? '<p><b>' + esc(s.highlights) + '</b></p>' : '') + blocksHtml(s.blocks));
  });
  html += section('Tendenz', tendencyHtml(text.tendency));
  html += section('Gefahrenmuster', (rec.danger_patterns || []).length ? '<ul class="av-patterns">' + rec.danger_patterns.map(function (dp) {
    return '<li>' + esc(dangerPatternLabel(dp)) + '</li>';
  }).join('') + '</ul>' : '');
  return html + footerHtml(rec, source) + '</div>';
}

// Popup für eine Kennung ohne Angaben
export function unknownRegionHtml(id) {
  return '<div class="av-pop pa-pop mr-stack mr-gap-sm"><h3>' + esc(id) + '</h3><p>Keine Angaben vorhanden.</p></div>';
}
