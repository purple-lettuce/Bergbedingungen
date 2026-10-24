// Sperrungen und Hinweise (Digitize the Planet): Daten laden, filtern,
// auf der Karte und in der Liste darstellen.

import { map, el, esc, setStatus, warn, unwarn, FILE_HINT, layerGroup } from './map.js';
import { loadWeather } from './weather.js';

var DATA_URL = 'data/closures.json';
var LINE_LIMIT = 150;   // bis zu dieser Anzahl im Ausschnitt werden Linien gezeichnet, darüber nur Punkte
var LIST_LIMIT = 100;   // maximale Länge der Liste

// Namen der Aktivitäten aus /api/v2/activities (Stand Oktober 2026), für den Fall, dass der Abruf scheitert.
var ACTIVITIES = {1:'Klettern',3:'Reiten',4:'Kutschen',5:'Radfahren',9:'Kraftfahrzeuge',13:'Lagern und Biwakieren',14:'Feuer',15:'Zelten',16:'Pflanzen sammeln',17:'Pilze sammeln',19:'Bäume fällen oder verletzen',20:'Fotografieren und Filmen',22:'Toilettengang',24:'Hunde',25:'Hunde an der Leine',27:'Drohnen und Flugmodelle',29:'Gleitschirm',32:'Rodeln',33:'Schneeschuhwandern',34:'Ski und Snowboard',35:'Skilanglauf',36:'Skitouren',38:'Angeln',39:'Baden',50:'Betreten des Gebietes',52:'Eisklettern',55:'Luftsport',56:'Schneeaktivitäten',58:'Übernachten'};

var TYPE_LABEL = { CLOSURE: 'Sperrung', NOTICE: 'Hinweis' };

var records = new Map();     // uuid -> Datensatz
var layers = new Map();      // uuid -> L.featureGroup
var activityNames = Object.assign({}, ACTIVITIES);
var renderTimer = null;
var holdUntil = 0;     // nach einem Sprung zu einem Eintrag nicht sofort neu zeichnen
var dataInfo = '';
var activeId = null;

function todayIso() {
  var d = new Date();
  var m = String(d.getMonth() + 1).padStart(2, '0');
  var day = String(d.getDate()).padStart(2, '0');
  return d.getFullYear() + '-' + m + '-' + day;
}
function fmtDate(iso) {
  if (!iso) return '';
  var p = iso.slice(0, 10).split('-');
  return p.length === 3 ? p[2] + '.' + p[1] + '.' + p[0] : iso;
}
function titleOf(r) { return r.name_de || r.name || r.name_en || 'Ohne Bezeichnung'; }
function descOf(r) { return r.description_de || r.description || r.description_en || ''; }
function statusOf(r) {
  var t = todayIso();
  if (r.start_on && r.start_on > t) return 'upcoming';
  if (r.end_on && r.end_on < t) return 'expired';
  return 'current';
}
function kindOf(r) { return r.type === 'NOTICE' ? 'notice' : 'closure'; }
function periodText(r) {
  var s = r.start_on ? 'ab ' + fmtDate(r.start_on) : '';
  var e = r.end_on ? 'bis ' + fmtDate(r.end_on) + (r.end_on_preliminary ? ' (voraussichtlich)' : '') : 'unbefristet';
  var d = (r.daytime_start || r.daytime_end) ? ', täglich ' + (r.daytime_start || '').slice(0, 5) + '–' + (r.daytime_end || '').slice(0, 5) : '';
  return [s, e].filter(Boolean).join(' ') + d;
}
function activitiesText(r) {
  if (!r.activity_ids || !r.activity_ids.length) return '';
  return r.activity_ids.map(function (id) { return activityNames[id] || ('Aktivität ' + id); }).join(', ');
}

// ---------- Daten ----------
// data/closures.json wird regelmäßig von einer GitHub Action aus der Digitize API erzeugt.
export async function loadData() {
  setStatus('Sperrungen und Hinweise werden geladen …');
  try {
    var res = await fetch(DATA_URL + '?t=' + Math.floor(Date.now() / 600000));
    if (!res.ok) { var err = new Error('HTTP ' + res.status); err.status = res.status; throw err; }
    var doc = await res.json();
    var rows = doc.results || [];
    if (doc.activities) Object.keys(doc.activities).forEach(function (id) { activityNames[id] = doc.activities[id]; });
    rows.forEach(function (r) { records.set(r.uuid, r); });
    if (doc.generated) {
      var t = new Date(doc.generated);
      dataInfo = isNaN(t) ? '' : t.toLocaleString('de-DE', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Europe/Berlin' });
    }
    unwarn('data');
    if (!rows.length) {
      setStatus('Noch keine Daten vorhanden. Sie werden beim nächsten automatischen Abruf geladen.');
      return;
    }
    render();
  } catch (e) {
    setStatus('Sperrungen und Hinweise sind gerade nicht verfügbar.', true);
    warn('data', 'Die Datei mit den Sperrungen und Hinweisen konnte nicht geladen werden (' + e.message + ').' + FILE_HINT);
  }
}
export function scheduleRender() {
  if (Date.now() < holdUntil) return;
  clearTimeout(renderTimer);
  renderTimer = setTimeout(render, 150);
}

// ---------- Darstellung ----------
function centroidOf(r) {
  var c = r.centroid;
  if (c && c.coordinates) return c.coordinates;
  if (Array.isArray(c) && c.length >= 2) return c;
  if (r.bbox) return [(r.bbox[0] + r.bbox[2]) / 2, (r.bbox[1] + r.bbox[3]) / 2];
  return null;
}
function intersects(r, b) {
  var x = r.bbox;
  if (!x) { var c = centroidOf(r); return !!c && b.contains(L.latLng(c[1], c[0])); }
  return x[0] <= b.getEast() && x[2] >= b.getWest() && x[1] <= b.getNorth() && x[3] >= b.getSouth();
}
function visibleRecords() {
  var q = el.q.value.trim().toLowerCase();
  var bounds = map.getBounds().pad(0.1);
  var cc = map.getCenter();
  var arr = [];
  records.forEach(function (r) {
    var st = statusOf(r);
    if (st === 'expired') return;
    if (st === 'upcoming' && !el.fUpcoming.checked) return;
    var k = kindOf(r);
    if (k === 'closure' && !el.fClosure.checked) return;
    if (k === 'notice' && !el.fNotice.checked) return;
    if (q) { if ((titleOf(r) + ' ' + descOf(r)).toLowerCase().indexOf(q) === -1) return; }
    else if (!intersects(r, bounds)) return;
    arr.push(r);
  });
  function dist(r) {
    var c = centroidOf(r);
    return c ? Math.pow(c[0] - cc.lng, 2) + Math.pow(c[1] - cc.lat, 2) : Infinity;
  }
  arr.sort(function (a, b) {
    var sa = statusOf(a) === 'current' ? 0 : 1, sb = statusOf(b) === 'current' ? 0 : 1;
    return sa - sb || dist(a) - dist(b);
  });
  return arr;
}
function popupHtml(r) {
  var k = kindOf(r), st = statusOf(r);
  var h = '<h3>' + esc(titleOf(r)) + '</h3>';
  h += '<div class="badges"><span class="badge ' + k + '">' + esc(TYPE_LABEL[r.type] || r.type || 'Eintrag') + '</span>';
  h += st === 'upcoming' ? '<span class="badge upcoming">Geplant</span>' : '<span class="badge current">Aktuell</span>';
  h += '</div>';
  var d = descOf(r);
  if (d) h += '<p style="margin:4px 0">' + esc(d) + '</p>';
  var per = periodText(r);
  if (per) h += '<div class="muted">' + esc(per) + '</div>';
  var act = activitiesText(r);
  if (act) h += '<div class="muted">Betrifft: ' + esc(act) + '</div>';
  if (r.responsible_organization && r.responsible_organization.name) h += '<div class="muted">Quelle: ' + esc(r.responsible_organization.name) + '</div>';
  return h;
}
function pinIcon(cls) {
  return L.divIcon({ className: '', html: '<div class="pin ' + cls + '"></div>', iconSize: [16, 16], iconAnchor: [8, 8] });
}
function colorOf(cls) { return cls === 'upcoming' ? '#3b6ea5' : cls === 'notice' ? '#d99a1f' : '#c2351f'; }

export function render() {
  clearTimeout(renderTimer);
  layerGroup.clearLayers();
  layers.clear();
  var arr = visibleRecords();
  var detailed = arr.length <= LINE_LIMIT;
  el.list.innerHTML = '';

  arr.forEach(function (r, idx) {
    var k = kindOf(r), st = statusOf(r);
    var cls = st === 'upcoming' ? 'upcoming' : k;
    var fg = L.featureGroup();
    var c = centroidOf(r);
    if (detailed && r.geometry) {
      try {
        L.geoJSON(r.geometry, { style: { color: colorOf(cls), weight: 5, opacity: .85 } }).addTo(fg);
      } catch (e) { /* ungültige Geometrie überspringen */ }
    }
    if (c) {
      if (detailed) L.marker([c[1], c[0]], { icon: pinIcon(cls), title: titleOf(r) }).addTo(fg);
      else L.circleMarker([c[1], c[0]], { radius: 6, color: '#ffffff', weight: 2, fillColor: colorOf(cls), fillOpacity: 1 }).addTo(fg);
    }
    fg.bindPopup(function () { return popupHtml(r); });
    fg.on('popupopen', function () { setActive(r.uuid, true); });
    fg.addTo(layerGroup);
    layers.set(r.uuid, fg);

    if (idx >= LIST_LIMIT) return;
    var li = document.createElement('li');
    li.className = 'item ' + cls + (r.uuid === activeId ? ' active' : '');
    li.tabIndex = 0;
    li.dataset.id = r.uuid;
    var d = descOf(r);
    li.innerHTML =
      '<div class="badges"><span class="badge ' + k + '">' + esc(TYPE_LABEL[r.type] || r.type || 'Eintrag') + '</span>' +
      (st === 'upcoming' ? '<span class="badge upcoming">Geplant</span>' : '') + '</div>' +
      '<h3>' + esc(titleOf(r)) + '</h3>' +
      '<div class="muted">' + esc(periodText(r)) + '</div>' +
      (d ? '<p>' + esc(d.length > 180 ? d.slice(0, 180) + ' …' : d) + '</p>' : '');
    li.addEventListener('click', function () { focusRecord(r.uuid); });
    li.addEventListener('keydown', function (ev) { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); focusRecord(r.uuid); } });
    el.list.appendChild(li);
  });

  var q = el.q.value.trim();
  var info = dataInfo ? ' · Datenstand ' + dataInfo : '';
  var n = arr.length;
  if (!n) {
    setStatus((q ? 'Keine Treffer für „' + q + '“.' : 'Im sichtbaren Kartenausschnitt liegen keine aktuellen oder geplanten Sperrungen oder Hinweise vor.') + info);
  } else {
    var txt = n + (n === 1 ? ' Eintrag' : ' Einträge') + (q ? ' gefunden' : ' im Kartenausschnitt');
    if (!detailed) txt += ' (die Karte zeigt nur Punkte, zum Anzeigen der Verläufe näher heranzoomen)';
    if (n > LIST_LIMIT) txt += ', die Liste zeigt die ersten ' + LIST_LIMIT;
    setStatus(txt + info);
  }
}

function setActive(id, scroll) {
  activeId = id;
  Array.prototype.forEach.call(el.list.children, function (li) {
    var on = li.dataset.id === id;
    li.classList.toggle('active', on);
    if (on && scroll) li.scrollIntoView({ block: 'nearest' });
  });
}
function focusRecord(id) {
  var r = records.get(id);
  if (!r) return;
  activeId = id;
  holdUntil = Date.now() + 500;
  var c = centroidOf(r);
  if (r.bbox) map.fitBounds([[r.bbox[1], r.bbox[0]], [r.bbox[3], r.bbox[2]]], { maxZoom: 15, padding: [40, 40], animate: false });
  else if (c) map.setView([c[1], c[0]], 14, { animate: false });
  render();
  var fg = layers.get(id);
  if (fg && c) fg.openPopup(L.latLng(c[1], c[0]));
  if (c) loadWeather(c[1], c[0]);
}
