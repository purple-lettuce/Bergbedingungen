// Sperrungen und Hinweise (Digitize the Planet): Daten laden, filtern,
// auf der Karte und in der Liste darstellen.

import { map, el, esc, setStatus, warn, unwarn, FILE_HINT, layerGroup } from './map.js';
import { setSourceStatus } from './status_bar.js';
import { closuresStatus } from './status_bar_logic.js';
import { loadWeather } from './weather.js';
import { coveredInsets } from './layout.js';
import { revealMap, getSheetState } from './sheet.js';

var DATA_URL = 'data/closures.json';
var LINE_LIMIT = 150;   // bis zu dieser Anzahl im Ausschnitt werden Linien gezeichnet, darüber nur Punkte
var LIST_LIMIT = 100;   // maximale Länge der Liste

// Namen der Aktivitäten aus /api/v2/activities (Stand Oktober 2026), für den Fall, dass der Abruf scheitert.
var ACTIVITIES = {1:'Klettern',3:'Reiten',4:'Kutschen',5:'Radfahren',9:'Kraftfahrzeuge',13:'Lagern und Biwakieren',14:'Feuer',15:'Zelten',16:'Pflanzen sammeln',17:'Pilze sammeln',19:'Bäume fällen oder verletzen',20:'Fotografieren und Filmen',22:'Toilettengang',24:'Hunde',25:'Hunde an der Leine',27:'Drohnen und Flugmodelle',29:'Gleitschirm',32:'Rodeln',33:'Schneeschuhwandern',34:'Ski und Snowboard',35:'Skilanglauf',36:'Skitouren',38:'Angeln',39:'Baden',50:'Betreten des Gebietes',52:'Eisklettern',55:'Luftsport',56:'Schneeaktivitäten',58:'Übernachten'};

var TYPE_LABEL = { CLOSURE: 'Sperrung', NOTICE: 'Hinweis' };

// Schalter des Filters im Bedienfeld "Karten & Layer" (js/closures_filter.js)
export var closureFilter = { closure: true, notice: true, upcoming: true };

var records = new Map();    // uuid -> Datensatz
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
    var st = closuresStatus(rows.length, doc.generated, new Date());
    setSourceStatus('closures', st.state, st.text);
    if (!rows.length) {
      setStatus('Noch keine Daten vorhanden. Sie werden beim nächsten automatischen Abruf geladen.');
      return;
    }
    render();
  } catch (e) {
    setStatus('Sperrungen und Hinweise sind gerade nicht verfügbar.', true);
    setSourceStatus('closures', 'error', 'nicht verfügbar');
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
    if (st === 'upcoming' && !closureFilter.upcoming) return;
    var k = kindOf(r);
    if (!closureFilter[k]) return;
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
// Popup einer Sperrung oder eines Hinweises: gemeinsames Popup-Gerüst (D8a/D8b: .pa-pop, .pa-pop-head, .mr-kv, .mr-badge).
// Farbe und Statusfeld bleiben wie bisher: Punkt und Schild in Sperrungs-, Hinweis- oder Geplant-Farbe, "Aktuell" in Erfolgsfarbe.
function popupHtml(r) {
  var k = kindOf(r), st = statusOf(r);
  var cls = st === 'upcoming' ? 'upcoming' : k;
  var h = '<div class="pa-pop mr-stack mr-gap-sm">';
  h += '<div class="pa-pop-head"><span class="dot ' + cls + '" aria-hidden="true"></span><div class="mr-stack mr-gap-xs"><h3>' + esc(titleOf(r)) + '</h3>';
  h += '<div class="mr-cluster mr-gap-xs"><span class="mr-badge mr-badge--' + k + '">' + esc(TYPE_LABEL[r.type] || r.type || 'Eintrag') + '</span>';
  h += st === 'upcoming' ? '<span class="mr-badge mr-badge--upcoming">Geplant</span>' : '<span class="mr-badge mr-badge--success">Aktuell</span>';
  h += '</div></div></div>';
  var d = descOf(r);
  if (d) h += '<p>' + esc(d) + '</p>';
  var rows = [];
  var per = periodText(r);
  if (per) rows.push('<dt>Zeitraum</dt><dd>' + esc(per) + '</dd>');
  var act = activitiesText(r);
  if (act) rows.push('<dt>Betrifft</dt><dd>' + esc(act) + '</dd>');
  if (r.responsible_organization && r.responsible_organization.name) rows.push('<dt>Quelle</dt><dd>' + esc(r.responsible_organization.name) + '</dd>');
  if (rows.length) h += '<section><dl class="mr-kv">' + rows.join('') + '</dl></section>';
  return h + '</div>';
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
        // Punktgeometrien nicht als Standard-Marker zeichnen (Leaflet würde marker-icon.png laden,
        // die nicht mitgeliefert wird). Die Stelle markiert bereits der Pin am Mittelpunkt.
        L.geoJSON(r.geometry, { style: { color: colorOf(cls), weight: 5, opacity: .85 }, pointToLayer: function () { return null; } }).addTo(fg);
      } catch (e) { /* ungültige Geometrie überspringen */ }
    }
    if (c) {
      if (detailed) L.marker([c[1], c[0]], { icon: pinIcon(cls), title: titleOf(r) }).addTo(fg);
      else L.circleMarker([c[1], c[0]], { radius: 6, color: '#ffffff', weight: 2, fillColor: colorOf(cls), fillOpacity: 1 }).addTo(fg);
    }
    fg.bindPopup(function () { return popupHtml(r); }, { className: 'mr-popup' });
    // Das Popup ist höher als früher und löst beim Öffnen öfter einen Autopan aus; dessen moveend darf das Popup nicht
    // durch ein Neuzeichnen der Ebene wieder schließen (gleiche Schonfrist wie nach einem Klick in der Liste).
    fg.on('popupopen', function () { holdUntil = Date.now() + 700; setActive(r.uuid, true); });
    fg.addTo(layerGroup);
    layers.set(r.uuid, fg);

    if (idx >= LIST_LIMIT) return;
    var li = document.createElement('li');
    li.className = 'mr-card mr-stack mr-gap-xs item ' + cls + (r.uuid === activeId ? ' active' : '');
    li.tabIndex = 0;
    li.dataset.id = r.uuid;
    var d = descOf(r);
    li.innerHTML =
      '<div class="mr-cluster mr-gap-xs"><span class="mr-badge mr-badge--' + k + '">' + esc(TYPE_LABEL[r.type] || r.type || 'Eintrag') + '</span>' +
      (st === 'upcoming' ? '<span class="mr-badge mr-badge--upcoming">Geplant</span>' : '') + '</div>' +
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
    if (on && scroll && getSheetState() !== 'peek') li.scrollIntoView({ block: 'nearest' });   // mobil im Zustand 'peek' ist die Liste verdeckt, dort nichts verschieben
  });
}
function focusRecord(id) {
  var r = records.get(id);
  if (!r) return;
  activeId = id;
  holdUntil = Date.now() + 500;
  var c = centroidOf(r);
  revealMap();   // mobil (D11) gibt das Bottom Sheet die Karte frei, bevor die Ränder berechnet werden
  var ins = coveredInsets(map);   // schwebende Karten (D10) und das Bottom Sheet (D11) verdecken Streifen am Rand: dorthin nicht zoomen
  if (r.bbox) map.fitBounds([[r.bbox[1], r.bbox[0]], [r.bbox[3], r.bbox[2]]], { maxZoom: 15, paddingTopLeft: [40 + ins.left, 40 + ins.top], paddingBottomRight: [40 + ins.right, 40 + ins.bottom], animate: false });
  else if (c) map.setView([c[1], c[0]], 14, { animate: false });
  render();
  var fg = layers.get(id);
  if (fg && c) fg.openPopup(L.latLng(c[1], c[0]));
  if (c) loadWeather(c[1], c[0]);
}
