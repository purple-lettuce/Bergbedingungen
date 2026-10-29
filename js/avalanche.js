// Lawinenlage (Euregio, Schweiz, später weitere Länder): Warnregionen nach Gefahrenstufe eingefärbt, Regionssymbol
// mit Stufe, Popup mit dem Lagebericht. Alle Quellen nutzen dasselbe Datenmodell (docs/LAWINENLAGE_ANALYSE.md):
// data/avalanche/index.json verweist auf je eine Bulletin- und eine Polygon-Datei pro Quelle (scripts/fetch_avalanche.py).

import { map, avalancheLayer, esc, warn, unwarn } from './map.js';
import { addAvalancheLegend } from './avalanche_legend.js';
import {
  LEVEL_NAMES, LEVEL_COLORS, VALUE_NAMES, PROBLEM_NAMES, STABILITY_NAMES, FREQUENCY_NAMES, SIZE_NAMES, ASPECT_NAMES,
  PERIOD_NAMES, TENDENCY_NAMES, SECTION_TITLES, DANGER_PATTERNS, bulletinStatus, levelAtAltitude, hasElevationRatings,
  levelLabel, ratingText, elevationLabel, elevationWhere, bandGroups, problemGroups, reportUrl, formatTime, formatDay
} from './avalanche_logic.js';

var DATA_BASE = 'data/avalanche/';
var ICONS = 'vendor/albina/';
var CHECKER_ID = 'av-checker';
var MARKER_MIN_ZOOM = 9;   // darunter überlagern sich die Regionssymbole (Regionen sind ca. 15 km groß)
var NO_REPORT_STYLE = { color: '#777', weight: 1, dashArray: '4 4', fillColor: '#888', fillOpacity: 0.18 };

var sources = {};       // Quellenkennung -> { meta, validity, hasBulletins }
var regionIndex = {};   // regionID -> { source, name, country, bulletin | null }
var altitude = null;    // null = höchste Stufe aller Höhen, sonst Höhe in Metern
var geoLayer = null;
var features = [];
var markerGroup = L.layerGroup();
var markers = {};
var attributions = [];
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
  [['0', '0', '16', '#ff0000'], ['0', '0', '8', '#000000'], ['8', '8', '8', '#000000']].forEach(function (r) {
    var rect = document.createElementNS(ns, 'rect');
    rect.setAttribute('x', r[0]);
    rect.setAttribute('y', r[1]);
    rect.setAttribute('width', r[2]);
    rect.setAttribute('height', r[2]);
    rect.setAttribute('fill', r[3]);
    pattern.appendChild(rect);
  });
  defs.appendChild(pattern);
  svg.insertBefore(defs, svg.firstChild);
});

function regionState(id) {
  var r = regionIndex[id];
  if (!r) return null;
  var status = r.bulletin ? bulletinStatus(r.bulletin.validity_period, Date.now()) : 'none';
  return { region: r, source: sources[r.source], bulletin: r.bulletin, status: status };
}

// Stufe der Region für die Karte (null: kein darstellbarer Bericht oder keine Stufe)
function regionLevel(st) {
  if (!st || !st.bulletin || st.status === 'expired') return null;
  return levelAtAltitude(st.bulletin, altitude);
}

function regionStyle(feature) {
  var st = regionState(feature.properties.id);
  if (!st || !st.bulletin || st.status === 'expired') return NO_REPORT_STYLE;
  var res = levelAtAltitude(st.bulletin, altitude);
  if (!res) return { color: '#777', weight: 1, dashArray: null, fillOpacity: 0 };   // kein Schnee / keine Beurteilung
  return {
    color: '#444', weight: res.uncertain ? 2 : 1.5, dashArray: res.uncertain ? '5 4' : null,
    fillColor: res.level === 5 ? 'url(#' + CHECKER_ID + ')' : LEVEL_COLORS[res.level], fillOpacity: 0.55
  };
}

// ---------- Regionssymbol ----------

function levelChip(level, subdivision, extra) {
  return level ? '<span class="av-chip av-lv' + level + (extra || '') + '" aria-hidden="true">' + esc(levelLabel(level, subdivision)) + '</span>' : '';
}

function markerIcon(res) {
  return L.divIcon({ className: 'av-marker', html: levelChip(res.level, res.subdivision, res.uncertain ? ' av-uncertain' : ''), iconSize: [34, 28], iconAnchor: [17, 14] });
}

function refreshMarkers() {
  var show = map.getZoom() >= MARKER_MIN_ZOOM;
  features.forEach(function (f) {
    var id = f.properties.id;
    var st = regionState(id);
    var res = show ? regionLevel(st) : null;
    var m = markers[id];
    if (!res) {
      if (m) markerGroup.removeLayer(m);
      return;
    }
    if (!m) {
      var p = f.properties.label_point;
      m = markers[id] = L.marker([p[1], p[0]], { riseOnHover: true });
      m.bindPopup(function () { return popupHtml(id); }, popupOptions());
    }
    m.options.title = st.region.name + ': Gefahrenstufe ' + levelLabel(res.level, res.subdivision);
    m.setIcon(markerIcon(res));
    markerGroup.addLayer(m);
  });
}

function popupOptions() {
  return { className: 'av-popup', maxWidth: Math.min(340, window.innerWidth - 60), maxHeight: Math.round(window.innerHeight * 0.6) };
}

// ---------- Popup ----------

function img(src, cls, alt) {
  return '<img class="' + cls + '" src="' + ICONS + esc(src) + '" alt="' + esc(alt) + '">';
}

function safeUrl(u) {
  return /^https:\/\//.test(u || '') ? u : '#';
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

// Textblöcke des Datenmodells (paragraph, heading, list), alles maskiert
function blocksHtml(blocks) {
  return (blocks || []).map(function (b) {
    if (b.type === 'heading') return '<h5 class="av-h">' + esc(b.text) + '</h5>';
    if (b.type === 'list') return '<ul class="av-list">' + b.items.map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('') + '</ul>';
    return '<p>' + esc(b.text) + '</p>';
  }).join('');
}

function section(title, html) {
  return html ? '<section class="av-sec"><h4>' + esc(title) + '</h4>' + html + '</section>' : '';
}

function ratingsHtml(bands) {
  var groups = bandGroups(bands);
  return groups.map(function (g) {
    var picto = g.picto ? img('pictos/levels_' + g.picto[0] + '_' + g.picto[1] + '.webp', 'av-picto',
      g.picto[0] === g.picto[1] ? 'Gefahrenstufe ' + g.picto[0] : 'Gefahrenstufe ' + g.picto[0] + ' unterhalb, ' + g.picto[1] + ' oberhalb der Höhengrenze') : '';
    var rows = g.rows.map(function (r) {
      var types = (r.problem_types || []).map(function (t) { return PROBLEM_NAMES[t] || t; }).join(', ');
      return '<li>' + levelChip(r.level, r.subdivision) + '<span><b>' + esc(elevationLabel(r.elevation)) + ':</b> ' + esc(ratingText(r)) +
        (types ? ' <span class="muted">(' + esc(types) + ')</span>' : '') + '</span></li>';
    }).join('');
    var label = groups.length > 1 || g.period !== 'all_day' ? '<div class="av-period">' + esc(PERIOD_NAMES[g.period] || g.period) + '</div>' : '';
    return '<div class="av-rating">' + label + '<div class="av-rating-body">' + picto + '<ul class="av-rows">' + rows + '</ul></div></div>';
  }).join('');
}

function problemHtml(p, previousCore) {
  var facts = [];
  facts.push('<dt>Höhenbereich</dt><dd>' + elevationSvg(p.elevation) + '<span>' + esc(elevationLabel(p.elevation)) + '</span></dd>');
  if (p.aspects && p.aspects.length) {
    var names = p.aspects.length === 8 ? 'Alle Expositionen' : p.aspects.map(function (a) { return ASPECT_NAMES[a] || a; }).join(', ');
    facts.push('<dt>Expositionen</dt><dd>' + roseSvg(p.aspects) + '<span>' + esc(names) + '</span></dd>');
  }
  if (p.danger_rating) facts.push('<dt>Gefahrenstufe</dt><dd>' + levelChip(p.danger_rating.level, p.danger_rating.subdivision) + '<span>' + esc(ratingText(p.danger_rating)) + '</span></dd>');
  if (p.snowpack_stability) facts.push('<dt>Schneedeckenstabilität</dt><dd><span>' + esc(STABILITY_NAMES[p.snowpack_stability] || p.snowpack_stability) + '</span></dd>');
  if (p.frequency) facts.push('<dt>Gefahrenstellen</dt><dd><span>' + esc(FREQUENCY_NAMES[p.frequency] || p.frequency) + '</span></dd>');
  if (p.avalanche_size) facts.push('<dt>Lawinengröße</dt><dd><span>' + esc(SIZE_NAMES[p.avalanche_size] || p.avalanche_size) + '</span></dd>');
  var name = PROBLEM_NAMES[p.type] || p.type;
  var core = p.core_zone_text && p.core_zone_text !== previousCore ? '<p class="av-core">' + esc(p.core_zone_text) + '</p>' : '';
  return '<div class="av-problem">' + img('problems/' + p.type + '.webp', 'av-problem-icon', name) +
    '<div><b>' + esc(name) + '</b>' + (p.period !== 'all_day' ? ' <span class="muted">(' + esc(PERIOD_NAMES[p.period] || p.period) + ')</span>' : '') +
    '<dl class="av-facts">' + facts.join('') + '</dl>' + core + '</div></div>';
}

function problemsHtml(b) {
  if (!b.avalanche_problems.length) return '<p>Keine Lawinenprobleme angegeben.</p>';
  return problemGroups(b).map(function (g) {
    var core = null;
    var cards = g.problems.map(function (p) { var h = problemHtml(p, core); core = p.core_zone_text || core; return h; }).join('');
    return (g.title ? '<h5 class="av-h">' + esc(g.title) + '</h5>' : '') + cards + g.comments.map(blocksHtml).join('');
  }).join('');
}

function tendencyHtml(list) {
  return (list || []).map(function (t) {
    var head = (t.validity_period ? 'Für ' + formatDay(t.validity_period.start) + (t.type ? ': ' : '') : '') + (TENDENCY_NAMES[t.type] || '');
    return (head ? '<p><b>' + esc(head) + '</b></p>' : '') + (t.highlights ? '<p>' + esc(t.highlights) + '</p>' : '') + blocksHtml(t.blocks);
  }).join('');
}

function footerHtml(st) {
  var meta = st.source.meta;
  return '<p class="av-foot">Gilt für die gesamte Region, nicht für einzelne Hänge. <a href="' + esc(safeUrl(reportUrl(meta, st.bulletin))) +
    '" target="_blank" rel="noopener">Lagebericht beim Warndienst</a>. Quelle: <a href="' + esc(safeUrl(meta.attribution_url)) +
    '" target="_blank" rel="noopener">' + esc(meta.attribution) + '</a>, <a href="' + esc(safeUrl(meta.license_url)) +
    '" target="_blank" rel="noopener">' + esc(meta.license) + '</a>.</p>';
}

function popupHtml(id) {
  var st = regionState(id);
  if (!st) return '<div class="av-pop"><h3>' + esc(id) + '</h3><p>Keine Angaben vorhanden.</p></div>';
  var title = '<h3>' + esc(st.region.name) + '</h3>';
  var ident = '<div class="av-id">' + esc(id) + ' · ' + esc(st.source.meta.name) + '</div>';
  var b = st.bulletin;

  if (!b) {
    return '<div class="av-pop">' + title + ident + '<p class="av-warn"><b>Kein aktueller Lagebericht.</b> Für diese Region liegt aktuell kein Bericht vor. ' +
      'Außerhalb der Wintersaison werden Berichte nur selten oder gar nicht veröffentlicht.</p>' + footerHtml(st) + '</div>';
  }
  if (st.status === 'expired') {
    return '<div class="av-pop">' + title + ident + '<p class="av-warn"><b>Kein aktueller Lagebericht.</b> Der letzte Bericht galt bis ' + esc(formatTime(b.validity_period.end)) +
      ' Uhr und wird nicht mehr als Gefahrenstufe angezeigt. Außerhalb der Wintersaison werden Berichte nur selten oder gar nicht veröffentlicht.</p>' + footerHtml(st) + '</div>';
  }

  var maxName = b.max_level ? 'Gefahrenstufe ' + levelLabel(b.max_level, b.max_subdivision) + ' – ' + LEVEL_NAMES[b.max_level]
    : (VALUE_NAMES[b.danger_ratings[0].value] || '');
  var html = '<div class="av-pop"><div class="av-head">' + levelChip(b.max_level, b.max_subdivision) + '<div>' + title + '<div class="av-sub">' +
    esc(maxName) + (b.danger_ratings.length > 1 ? ' (höchste im Gebiet)' : '') + '</div></div></div>' + ident;

  if (st.status === 'stale') {
    html += '<p class="av-warn"><b>Bericht abgelaufen.</b> Ein neuer Lagebericht wird in Kürze geladen, bitte aktuellen Stand beim Warndienst prüfen.</p>';
  }
  var validity = 'Veröffentlicht: <b>' + esc(formatTime(b.publication_time)) + '</b> Uhr<br>Gültig von <b>' + esc(formatTime(b.validity_period.start)) +
    '</b> bis <b>' + esc(formatTime(b.validity_period.end)) + '</b> Uhr';
  if (b.next_update) validity += '<br>Nächste Aktualisierung: ' + esc(formatTime(b.next_update)) + ' Uhr';
  if (b.unscheduled) validity += '<br><b>Außerplanmäßiger Lagebericht</b>';
  html += section('Gültigkeit', '<p>' + validity + '</p>');

  var text = b.text || {};
  if (text.headline) html += '<p class="av-lead">' + esc(text.headline) + '</p>';
  html += section('Zusammenfassung', text.summary ? '<p><b>' + esc(text.summary) + '</b></p>' : '');

  var bands = b.danger_by_elevation;
  if (bands.some(function (x) { return x.basis === 'avalanche_problem'; })) {
    // Die Quelle gibt die Stufe für die ganze Region an, Höhen stehen nur bei den Lawinenproblemen
    html += section('Gefahrenstufe', ratingsHtml(b.danger_ratings.map(function (r) { return { period: r.period, level: r.level, value: r.value, subdivision: r.subdivision }; })));
    html += section('Gefahrenstufe nach Höhe (je Lawinenproblem)', ratingsHtml(bands) +
      '<p class="av-note">Die Quelle nennt die Höhe nur bei den Lawinenproblemen. Die Stufen stammen von den Lawinenproblemen, nicht von einer eigenen Höhenaufteilung der Region.</p>');
  } else {
    html += section('Gefahrenstufe nach Höhe', ratingsHtml(bands));
  }
  html += section('Lawinenprobleme', problemsHtml(b));

  (text.sections || []).forEach(function (s) {
    html += section(SECTION_TITLES[s.key] || s.key, (s.highlights ? '<p><b>' + esc(s.highlights) + '</b></p>' : '') + blocksHtml(s.blocks));
  });
  html += section('Tendenz', tendencyHtml(text.tendency));
  html += section('Gefahrenmuster', (b.danger_patterns || []).length ? '<ul class="av-patterns">' + b.danger_patterns.map(function (dp) {
    return '<li>' + esc(DANGER_PATTERNS[dp] ? 'GM ' + dp.slice(2) + ': ' + DANGER_PATTERNS[dp] : dp) + '</li>';
  }).join('') + '</ul>' : '');
  return html + footerHtml(st) + '</div>';
}

// ---------- Laden ----------

async function fetchJson(url) {
  var res = await fetch(url);
  if (!res.ok) throw new Error(url + ': HTTP ' + res.status);
  return res.json();
}

function register(entry, bulletinDoc, regionsDoc) {
  var id = entry.id;
  sources[id] = { meta: bulletinDoc.source, validity: bulletinDoc.validity_period, hasBulletins: bulletinDoc.bulletins.length > 0 };
  regionsDoc.features.forEach(function (f) {
    var rid = f.properties.id;
    var info = bulletinDoc.regions[rid] || {};
    regionIndex[rid] = {
      source: id, name: info.name || rid, country: f.properties.country,
      bulletin: typeof info.bulletin === 'number' ? bulletinDoc.bulletins[info.bulletin] : null
    };
    features.push(f);
  });
}

function legendInfo() {
  var list = Object.keys(sources).map(function (id) {
    var s = sources[id];
    return {
      name: s.meta.name, attribution: s.meta.attribution, attributionUrl: s.meta.attribution_url, license: s.meta.license,
      status: s.hasBulletins && s.validity ? bulletinStatus(s.validity, Date.now()) : 'none', end: s.validity ? s.validity.end : null
    };
  });
  var elevationAware = Object.keys(regionIndex).some(function (rid) {
    var st = regionState(rid);
    return st && st.bulletin && st.status !== 'expired' && hasElevationRatings(st.bulletin);
  });
  var anyShown = list.some(function (s) { return s.status === 'valid' || s.status === 'stale'; });
  return { sources: list, anyShown: anyShown, elevationAware: elevationAware };
}

async function load() {
  try {
    var index = await fetchJson(DATA_BASE + 'index.json');
    var results = await Promise.allSettled(index.sources.map(function (entry) {
      return Promise.all([fetchJson(DATA_BASE + entry.bulletin_file), fetchJson(DATA_BASE + entry.regions_file)]);
    }));
    var failed = [];
    results.forEach(function (res, i) {
      if (res.status === 'fulfilled') register(index.sources[i], res.value[0], res.value[1]);
      else { failed.push(index.sources[i].id); console.error('Lawinenlage: Quelle nicht geladen', index.sources[i].id, res.reason); }
    });
    if (!features.length) throw new Error('keine Quelle geladen');
    geoLayer = L.geoJSON({ type: 'FeatureCollection', features: features }, {
      renderer: renderer,
      style: regionStyle,
      onEachFeature: function (feature, layer) {
        layer.bindPopup(function () { return popupHtml(feature.properties.id); }, popupOptions());
        layer.on('mouseover', function () { layer.setStyle({ weight: 3, fillOpacity: Math.min(0.8, (layer.options.fillOpacity || 0) + 0.2) }); });
        layer.on('mouseout', function () { geoLayer.resetStyle(layer); });
      }
    }).addTo(avalancheLayer);
    markerGroup.addTo(avalancheLayer);
    refreshMarkers();
    map.on('zoomend', refreshMarkers);
    attributions = Object.keys(sources).map(function (id) {
      var m = sources[id].meta;
      return '© <a href="' + esc(safeUrl(m.attribution_url)) + '" target="_blank" rel="noopener">' + esc(m.attribution) + '</a>, ' + esc(m.license);
    });
    if (map.hasLayer(avalancheLayer)) attributions.forEach(function (a) { map.attributionControl.addAttribution(a); });
    addAvalancheLegend(legendInfo(), function (value) {
      altitude = value;
      geoLayer.setStyle(regionStyle);
      refreshMarkers();
    });
    if (failed.length) warn('avalanche', 'Lawinenlage: Quelle nicht geladen (' + failed.join(', ') + ').');
    else unwarn('avalanche');
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
    load().then(function (ok) { if (!ok) { started = false; sources = {}; regionIndex = {}; features = []; } });
  }
  avalancheLayer.on('add', function () {
    attributions.forEach(function (a) { map.attributionControl.addAttribution(a); });
    start();
  });
  avalancheLayer.on('remove', function () { attributions.forEach(function (a) { map.attributionControl.removeAttribution(a); }); });
  if (map.hasLayer(avalancheLayer)) start();
}