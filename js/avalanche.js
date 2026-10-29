// Lawinenlage (alle Quellen, derzeit Euregio und Schweiz): Warnregionen nach Gefahrenstufe eingefärbt, Regionssymbol
// mit Stufe, Popup mit dem Lagebericht. Die Kartenebene kennt keine Quelle: data/avalanche/index.json verweist auf je eine
// Bulletin- und eine Polygon-Datei pro Quelle (scripts/fetch_avalanche.py), daraus entsteht je Region ein Datensatz des
// Standardmodells (avalanche_model.js). Popup (avalanche_popup.js), Symbole (avalanche_symbols.js) und Logik
// (avalanche_logic.js) sind für alle Quellen dieselben. Aufbau und Erweiterung: docs/AVALANCHE_ARCHITECTURE.md.

import { map, avalancheLayer, warn, unwarn } from './map.js';
import { esc } from './html.js';
import { addAvalancheLegend } from './avalanche_legend.js';
import { dangerLevel, levelChip, levelLabel } from './avalanche_symbols.js';
import { bulletinStatus, levelAtAltitude, hasElevationRatings } from './avalanche_logic.js';
import { toRecord } from './avalanche_model.js';
import { popupHtml, unknownRegionHtml, safeUrl } from './avalanche_popup.js';

var DATA_BASE = 'data/avalanche/';
var CHECKER_ID = 'av-checker';
var MARKER_MIN_ZOOM = 9;   // darunter überlagern sich die Regionssymbole (Regionen sind ca. 15 km groß)
var NO_REPORT_STYLE = { color: '#777', weight: 1, dashArray: '4 4', fillColor: '#888', fillOpacity: 0.18 };

var sources = {};       // Quellenkennung -> { meta, validity, hasBulletins }
var records = {};       // region_id -> Regionsdatensatz (Standardmodell)
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

// Ansicht einer Region für Karte und Popup: Datensatz, Metadaten der Quelle, Berichtsstatus
function regionView(id) {
  var rec = records[id];
  if (!rec) return null;
  var status = rec.bulletin_id !== null ? bulletinStatus({ start: rec.valid_from, end: rec.valid_until }, Date.now()) : 'none';
  return { record: rec, source: sources[rec.source].meta, status: status };
}

// Stufe der Region für die Karte (null: kein darstellbarer Bericht oder keine Stufe)
function regionLevel(view) {
  if (!view || view.status === 'none' || view.status === 'expired') return null;
  return levelAtAltitude(view.record, altitude);
}

function regionStyle(feature) {
  var view = regionView(feature.properties.region_id);
  if (!view || view.status === 'none' || view.status === 'expired') return NO_REPORT_STYLE;
  var res = levelAtAltitude(view.record, altitude);
  if (!res) return { color: '#777', weight: 1, dashArray: null, fillOpacity: 0 };   // kein Schnee / keine Beurteilung
  var model = dangerLevel(res.level);
  return {
    color: '#444', weight: res.uncertain ? 2 : 1.5, dashArray: res.uncertain ? '5 4' : null,
    fillColor: model.checkered ? 'url(#' + CHECKER_ID + ')' : model.color, fillOpacity: 0.55
  };
}

// ---------- Regionssymbol ----------

function markerIcon(res) {
  return L.divIcon({ className: 'av-marker', html: levelChip(res.level, res.subdivision, res.uncertain ? 'av-uncertain' : ''), iconSize: [34, 28], iconAnchor: [17, 14] });
}

function refreshMarkers() {
  var show = map.getZoom() >= MARKER_MIN_ZOOM;
  features.forEach(function (f) {
    var id = f.properties.region_id;
    var view = regionView(id);
    var res = show ? regionLevel(view) : null;
    var m = markers[id];
    if (!res) {
      if (m) markerGroup.removeLayer(m);
      return;
    }
    if (!m) {
      var p = f.properties.label_point;
      m = markers[id] = L.marker([p[1], p[0]], { riseOnHover: true });
      m.bindPopup(function () { return popupFor(id); }, popupOptions());
    }
    m.options.title = view.record.region_name + ': Gefahrenstufe ' + levelLabel(res.level, res.subdivision);
    m.setIcon(markerIcon(res));
    markerGroup.addLayer(m);
  });
}

function popupOptions() {
  return { className: 'av-popup', maxWidth: Math.min(340, window.innerWidth - 60), maxHeight: Math.round(window.innerHeight * 0.6) };
}

function popupFor(id) {
  var view = regionView(id);
  return view ? popupHtml(view) : unknownRegionHtml(id);
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
    var info = bulletinDoc.regions[f.properties.region_id] || {};
    var bulletin = typeof info.bulletin === 'number' ? bulletinDoc.bulletins[info.bulletin] : null;
    records[f.properties.region_id] = toRecord(f.properties, bulletin);
    features.push(f);
  });
}

function legendInfo() {
  var elevationAware = {};
  Object.keys(records).forEach(function (rid) {
    var view = regionView(rid);
    if (view.status !== 'none' && view.status !== 'expired' && hasElevationRatings(view.record)) elevationAware[view.record.source] = true;
  });
  var list = Object.keys(sources).map(function (id) {
    var s = sources[id];
    return {
      name: s.meta.name, attribution: s.meta.attribution, attributionUrl: s.meta.attribution_url, license: s.meta.license,
      notes: s.meta.notes || [], elevationAware: !!elevationAware[id],
      status: s.hasBulletins && s.validity ? bulletinStatus(s.validity, Date.now()) : 'none', end: s.validity ? s.validity.end : null
    };
  });
  var anyShown = list.some(function (s) { return s.status === 'valid' || s.status === 'stale'; });
  return { sources: list, anyShown: anyShown, elevationAware: list.some(function (s) { return s.elevationAware; }) };
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
        layer.bindPopup(function () { return popupFor(feature.properties.region_id); }, popupOptions());
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
    load().then(function (ok) { if (!ok) { started = false; sources = {}; records = {}; features = []; } });
  }
  avalancheLayer.on('add', function () {
    attributions.forEach(function (a) { map.attributionControl.addAttribution(a); });
    start();
  });
  avalancheLayer.on('remove', function () { attributions.forEach(function (a) { map.attributionControl.removeAttribution(a); }); });
  if (map.hasLayer(avalancheLayer)) start();
}
