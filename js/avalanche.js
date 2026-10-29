// Lawinenlage Euregio (Tirol, Südtirol, Trentino): Mikroregionen eingefärbt nach Gefahrenstufe, Popup mit dem Lagebericht.
// Daten: data/avalanche_regions.geojson (Polygone) + data/avalanche_bulletin.json (Bulletins), erzeugt von scripts/fetch_avalanche.py.

import { map, avalancheLayer, esc, warn, unwarn } from './map.js';
import { addAvalancheLegend } from './avalanche_legend.js';
import {
  LEVEL_NAMES, LEVEL_COLORS, VALUE_NAMES, PROBLEM_NAMES, STABILITY_NAMES, FREQUENCY_NAMES, SIZE_NAMES, ASPECT_NAMES,
  PERIOD_NAMES, TENDENCY_NAMES, DANGER_PATTERNS, bulletinStatus, levelAtAltitude, elevationLabel, elevationWhere,
  ratingText, ratingGroups, formatTime, formatDay
} from './avalanche_logic.js';

var REGIONS_URL = 'data/avalanche_regions.geojson';
var BULLETIN_URL = 'data/avalanche_bulletin.json';
var ICONS = 'vendor/albina/';
var ATTRIBUTION = '© <a href="https://lawinen.report/more/open-data" target="_blank" rel="noopener">Lawinenwarndienste Tirol, Südtirol, Trentino (avalanche.report)</a>, CC BY 4.0';
var CHECKER_ID = 'av-checker';
var NO_REPORT_STYLE = { color: '#777', weight: 1, dashArray: '4 4', fillColor: '#888', fillOpacity: 0.18 };

var data = null;        // { bulletin }
var altitude = null;    // null = höchste Stufe aller Höhen, sonst Höhe in Metern
var geoLayer = null;
var renderer = L.svg({ padding: 0.5 });

// Schachbrett (rot/schwarz) für Stufe 5 als SVG-Füllmuster; Leaflet setzt fill="url(#av-checker)"
renderer.on('add', function () {
  var svg = renderer._container;
  if (svg.querySelector('#' + CHECKER_ID)) return;
  var ns = 'http://www.w3.org/2000/svg';
  var defs = document.createElementNS(ns, 'defs');
  var pattern = document.createElementNS(ns, 'pattern');
  pattern.setAttribute('id', CHECKER_ID);
  pattern.setAttribute('width', '16');
  pattern.setAttribute('height', '16');
  pattern.setAttribute('patternUnits', 'userSpaceOnUse');
  [['0', '0', '#ff0000'], ['0', '0', '#000000'], ['8', '8', '#000000']].forEach(function (r, i) {
    var rect = document.createElementNS(ns, 'rect');
    rect.setAttribute('x', r[0]);
    rect.setAttribute('y', r[1]);
    rect.setAttribute('width', i === 0 ? '16' : '8');
    rect.setAttribute('height', i === 0 ? '16' : '8');
    rect.setAttribute('fill', r[2]);
    pattern.appendChild(rect);
  });
  defs.appendChild(pattern);
  svg.insertBefore(defs, svg.firstChild);
});

function regionInfo(id) {
  var r = data.bulletin.regions[id];
  return r ? { name: r.name, bulletin: data.bulletin.bulletins[r.b] } : null;
}

function regionStyle(feature) {
  var info = regionInfo(feature.properties.id);
  if (!info || bulletinStatus(info.bulletin.validTime, Date.now()) === 'expired') return NO_REPORT_STYLE;
  var res = altitude === null ? { level: info.bulletin.maxLevel, uncertain: false } : levelAtAltitude(info.bulletin.dangerRatings, altitude);
  if (!res || !res.level) return { color: '#777', weight: 1, dashArray: null, fillOpacity: 0 };   // kein Schnee / keine Beurteilung
  return {
    color: '#444', weight: res.uncertain ? 2 : 1.5, dashArray: res.uncertain ? '5 4' : null,
    fillColor: res.level === 5 ? 'url(#' + CHECKER_ID + ')' : LEVEL_COLORS[res.level], fillOpacity: 0.55
  };
}

// ---------- Popup ----------

function img(src, cls, alt) {
  return '<img class="' + cls + '" src="' + ICONS + esc(src) + '" alt="' + esc(alt) + '">';
}

function levelChip(level) {
  return level ? '<span class="av-chip av-lv' + level + '" aria-hidden="true">' + level + '</span>' : '';
}

// Offizielles Piktogramm der Expositionen (ALBINA, albina-website exposition-icon.tsx), blau = betroffene Hangrichtungen
var ROSE_PATHS = {
  E: 'm49 25-7.071-7.071L24.959 25l16.97 7.071z', N: 'm25 .958 7.071 7.071L25 25 17.929 8.03z', NE: 'M42 8H32l-7 17 17-7z',
  NW: 'M8 8h10l7 17-17-7z', S: 'm25 49 7.071-7.071L25 24.959l-7.071 16.97z', SE: 'M42 42H32l-7-17 17 7z',
  SW: 'M8 42h10l7-17-17 7z', W: 'm.958 25 7.071-7.071L25 25 8.03 32.071z'
};
function roseSvg(aspects) {
  var on = aspects.filter(function (a) { return ROSE_PATHS[a]; }).map(function (a) { return '<path d="' + ROSE_PATHS[a] + '" fill="#19abff"/>'; }).join('');
  return '<svg class="av-rose" viewBox="0 0 50 50" role="img" aria-label="Expositionen: ' + esc(aspects.map(function (a) { return ASPECT_NAMES[a] || a; }).join(', ')) + '">' + on +
    '<g fill="currentColor" font-size="8" font-weight="bold"><text x="22" y="13">N</text><text x="22.3" y="42">S</text></g>' +
    '<g fill="none" stroke="currentColor" stroke-width=".87" stroke-linejoin="round"><path d="m.958 25 7.071-7.071L25 25 8.03 32.071z"/><path d="m49 25-7.071-7.071L24.959 25l16.97 7.071z"/>' +
    '<path d="m25 .958 7.071 7.071L25 25 17.929 8.03z"/><path d="m25 49 7.071-7.071L24.959 24.959l-7.071 16.97z"/>' +
    '<path d="M42 8H32l-7 17 17-7zM8 42h10l7-17-17 7zm34 0H32l-7-17 17 7zM8 8h10l7 17-17-7z"/></g></svg>';
}

// Offizielles Piktogramm der Höhenlage (ALBINA, elevation-icon.tsx)
var BANDS = { low: 'm1 47 9-15h44l9 15z', middle: 'm9 33 10-17h26l10 17z', high: 'm19 17 7-12 4 6 6-10 9 16z' };
var VISIBLE = { above: ['middle', 'high'], below: ['low', 'middle'], all: ['low', 'middle', 'high'], middle: ['middle'] };
var LINES = { above: 'M10.6 32h54.4v1h-55z', below: 'M19.9 16h45.1v1H19.3z', all: '', middle: 'M10.6 32h54.4v1h-55zM19.9 16h45.1v1H19.3z' };
function elevationSvg(el) {
  var where = elevationWhere(el);
  return '<svg class="av-elev" viewBox="0 0 65 48" role="img" aria-label="' + esc(elevationLabel(el)) + '">' +
    VISIBLE[where].map(function (b) { return '<path d="' + BANDS[b] + '" fill="#19abff"/>'; }).join('') +
    '<path d="m63 47.5-27-47-6 11-4-7-25 43z" fill="none" stroke="currentColor"/>' +
    (LINES[where] ? '<path d="' + LINES[where] + '" fill="currentColor"/>' : '') + '</svg>';
}

function paragraphs(list) {
  return (list || []).map(function (t) { return '<p>' + esc(t) + '</p>'; }).join('');
}

function section(title, html) {
  return html ? '<section class="av-sec"><h4>' + esc(title) + '</h4>' + html + '</section>' : '';
}

function ratingsHtml(ratings) {
  var groups = ratingGroups(ratings);
  return groups.map(function (g) {
    var picto = g.picto ? img('pictos/levels_' + g.picto[0] + '_' + g.picto[1] + '.webp', 'av-picto',
      g.picto[0] === g.picto[1] ? 'Gefahrenstufe ' + g.picto[0] : 'Gefahrenstufe ' + g.picto[0] + ' unterhalb, ' + g.picto[1] + ' oberhalb der Höhengrenze') : '';
    var rows = g.rows.map(function (r) {
      return '<li>' + levelChip(r.level) + '<span><b>' + esc(elevationLabel(r.elevation)) + ':</b> ' + esc(ratingText(r)) + '</span></li>';
    }).join('');
    var label = groups.length > 1 || g.period !== 'all_day' ? '<div class="av-period">' + esc(PERIOD_NAMES[g.period] || g.period) + '</div>' : '';
    return '<div class="av-rating">' + label + '<div class="av-rating-body">' + picto + '<ul class="av-rows">' + rows + '</ul></div></div>';
  }).join('');
}

function problemHtml(p) {
  var facts = [];
  facts.push('<dt>Höhenbereich</dt><dd>' + elevationSvg(p.elevation) + '<span>' + esc(elevationLabel(p.elevation)) + '</span></dd>');
  if (p.aspects && p.aspects.length) {
    var names = p.aspects.length === 8 ? 'Alle Expositionen' : p.aspects.map(function (a) { return ASPECT_NAMES[a] || a; }).join(', ');
    facts.push('<dt>Expositionen</dt><dd>' + roseSvg(p.aspects) + '<span>' + esc(names) + '</span></dd>');
  }
  if (p.snowpackStability) facts.push('<dt>Schneedeckenstabilität</dt><dd><span>' + esc(STABILITY_NAMES[p.snowpackStability] || p.snowpackStability) + '</span></dd>');
  if (p.frequency) facts.push('<dt>Gefahrenstellen</dt><dd><span>' + esc(FREQUENCY_NAMES[p.frequency] || p.frequency) + '</span></dd>');
  if (p.avalancheSize) facts.push('<dt>Lawinengröße</dt><dd><span>' + esc(SIZE_NAMES[p.avalancheSize] || p.avalancheSize) + '</span></dd>');
  var name = PROBLEM_NAMES[p.type] || p.type;
  return '<div class="av-problem">' + img('problems/' + p.type + '.webp', 'av-problem-icon', name) +
    '<div><b>' + esc(name) + '</b>' + (p.period !== 'all_day' ? ' <span class="muted">(' + esc(PERIOD_NAMES[p.period] || p.period) + ')</span>' : '') +
    '<dl class="av-facts">' + facts.join('') + '</dl></div></div>';
}

function tendencyHtml(list) {
  return (list || []).map(function (t) {
    var head = (t.validTime ? 'Für ' + formatDay(t.validTime.startTime) + ': ' : '') + (TENDENCY_NAMES[t.type] || '');
    return '<p><b>' + esc(head.replace(/: $/, '')) + '</b></p>' + (t.highlights ? '<p>' + esc(t.highlights) + '</p>' : '') + paragraphs(t.comment);
  }).join('');
}

function popupHtml(id) {
  var info = regionInfo(id);
  var rid = '<div class="av-id">' + esc(id) + '</div>';
  if (!info) {
    return '<div class="av-pop"><h3>' + esc(id) + '</h3><p>Für diese Region liegt im geladenen Datenstand kein Lagebericht vor.</p></div>';
  }
  var b = info.bulletin;
  var status = bulletinStatus(b.validTime, Date.now());
  var link = /^\d{4}-\d{2}-\d{2}$/.test(b.mainDate) ? 'https://lawinen.report/' + b.mainDate : 'https://lawinen.report/';
  var footer = '<p class="av-foot">Gilt für die gesamte Region, nicht für einzelne Hänge. <a href="' + esc(link) + '" target="_blank" rel="noopener">Lagebericht auf lawinen.report</a>. ' +
    'Quelle: ' + esc(data.bulletin.attribution) + ', <a href="https://creativecommons.org/licenses/by/4.0/deed.de" target="_blank" rel="noopener">CC BY 4.0</a>.</p>';

  if (status === 'expired') {
    return '<div class="av-pop"><h3>' + esc(info.name) + '</h3>' + rid +
      '<p class="av-warn"><b>Kein aktueller Lagebericht.</b> Der letzte Bericht galt bis ' + esc(formatTime(b.validTime.endTime)) +
      ' Uhr und wird nicht mehr als Gefahrenstufe angezeigt. In der Sommersaison werden in der Regel keine Berichte veröffentlicht.</p>' + footer + '</div>';
  }

  var maxName = b.maxLevel ? 'Gefahrenstufe ' + b.maxLevel + ' – ' + LEVEL_NAMES[b.maxLevel] : (VALUE_NAMES[b.dangerRatings[0].value] || '');
  var html = '<div class="av-pop"><div class="av-head">' + levelChip(b.maxLevel) + '<div><h3>' + esc(info.name) + '</h3><div class="av-sub">' +
    esc(maxName) + (b.dangerRatings.length > 1 ? ' (höchste im Gebiet)' : '') + '</div></div></div>' + rid;

  if (status === 'stale') {
    html += '<p class="av-warn"><b>Bericht abgelaufen.</b> Ein neuer Lagebericht wird in Kürze geladen, bitte aktuellen Stand auf lawinen.report prüfen.</p>';
  }
  var validity = 'Gültig von <b>' + esc(formatTime(b.validTime.startTime)) + '</b> bis <b>' + esc(formatTime(b.validTime.endTime)) + '</b> Uhr';
  if (b.publicationTime !== b.validTime.startTime) validity += '<br>Veröffentlicht: ' + esc(formatTime(b.publicationTime)) + ' Uhr';
  if (b.unscheduled) validity += '<br><b>Außerplanmäßiger Lagebericht</b>';
  html += section('Gültigkeit', '<p>' + validity + '</p>');
  if (b.highlights) html += '<p class="av-lead">' + esc(b.highlights) + '</p>';
  html += section('Zusammenfassung', b.activity && b.activity.highlights ? '<p><b>' + esc(b.activity.highlights) + '</b></p>' : '');
  html += section('Gefahrenstufe nach Höhe', ratingsHtml(b.dangerRatings));
  html += section('Lawinenprobleme', b.avalancheProblems.length ? b.avalancheProblems.map(problemHtml).join('') : '<p>Keine Lawinenprobleme angegeben.</p>');
  html += section('Lawinensituation', paragraphs(b.activity && b.activity.comment));
  html += section('Schneedecke', paragraphs(b.snowpack && b.snowpack.comment) + (b.snowpack && b.snowpack.highlights ? '<p>' + esc(b.snowpack.highlights) + '</p>' : ''));
  html += section('Tendenz', tendencyHtml(b.tendency));
  html += section('Wetter', (b.weather && b.weather.highlights ? '<p><b>' + esc(b.weather.highlights) + '</b></p>' : '') + paragraphs(b.weather && b.weather.comment));
  html += section('Tourenempfehlung', (b.travelAdvisory && b.travelAdvisory.highlights ? '<p><b>' + esc(b.travelAdvisory.highlights) + '</b></p>' : '') + paragraphs(b.travelAdvisory && b.travelAdvisory.comment));
  html += section('Gefahrenmuster', (b.dangerPatterns || []).length ? '<ul class="av-patterns">' + b.dangerPatterns.map(function (dp) {
    return '<li>' + esc(DANGER_PATTERNS[dp] ? 'GM ' + dp.slice(2) + ': ' + DANGER_PATTERNS[dp] : dp) + '</li>';
  }).join('') + '</ul>' : '');
  return html + footer + '</div>';
}

// ---------- Laden ----------

async function fetchJson(url) {
  var res = await fetch(url);
  if (!res.ok) throw new Error(url + ': HTTP ' + res.status);
  return res.json();
}

function legendInfo() {
  var b = data.bulletin;
  return { validTime: b.validTime, status: bulletinStatus(b.validTime, Date.now()) };
}

async function load() {
  try {
    var loaded = await Promise.all([fetchJson(REGIONS_URL), fetchJson(BULLETIN_URL)]);
    data = { bulletin: loaded[1] };
    geoLayer = L.geoJSON(loaded[0], {
      renderer: renderer,
      style: regionStyle,
      onEachFeature: function (feature, layer) {
        layer.bindPopup(function () { return popupHtml(feature.properties.id); },
          { className: 'av-popup', maxWidth: Math.min(340, window.innerWidth - 60), maxHeight: Math.round(window.innerHeight * 0.6) });
        layer.on('mouseover', function () { layer.setStyle({ weight: 3, fillOpacity: Math.min(0.8, (layer.options.fillOpacity || 0) + 0.2) }); });
        layer.on('mouseout', function () { geoLayer.resetStyle(layer); });
      }
    }).addTo(avalancheLayer);
    addAvalancheLegend(legendInfo(), function (value) {
      altitude = value;
      geoLayer.setStyle(regionStyle);
    });
    unwarn('avalanche');
    return true;
  } catch (err) {
    console.error('Fehler beim Laden der Lawinenlage', err);
    warn('avalanche', 'Die Lawinenlage konnte nicht geladen werden.');
    return false;
  }
}

// Lädt erst beim ersten Einblenden der Ebene (standardmäßig ausgeblendet), bei Fehlern beim nächsten Einblenden erneut.
export function initAvalanche() {
  var started = false;
  function start() {
    if (started) return;
    started = true;
    load().then(function (ok) { if (!ok) started = false; });
  }
  function shown() {
    map.attributionControl.addAttribution(ATTRIBUTION);
    start();
  }
  avalancheLayer.on('add', shown);
  avalancheLayer.on('remove', function () { map.attributionControl.removeAttribution(ATTRIBUTION); });
  if (map.hasLayer(avalancheLayer)) shown();
}