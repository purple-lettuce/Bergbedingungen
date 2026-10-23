(function () {
  'use strict';

  var DATA_URL = 'data/closures.json';
  var PROTECTED_AREAS_URL =
  'data/protected_areas_alps.geojson';
  var LINE_LIMIT = 150;   // bis zu dieser Anzahl im Ausschnitt werden Linien gezeichnet, darüber nur Punkte
  var LIST_LIMIT = 100;   // maximale Länge der Liste

  // Namen der Aktivitäten aus /api/v2/activities (Stand Oktober 2026), für den Fall, dass der Abruf scheitert.
  var ACTIVITIES = {1:'Klettern',3:'Reiten',4:'Kutschen',5:'Radfahren',9:'Kraftfahrzeuge',13:'Lagern und Biwakieren',14:'Feuer',15:'Zelten',16:'Pflanzen sammeln',17:'Pilze sammeln',19:'Bäume fällen oder verletzen',20:'Fotografieren und Filmen',22:'Toilettengang',24:'Hunde',25:'Hunde an der Leine',27:'Drohnen und Flugmodelle',29:'Gleitschirm',32:'Rodeln',33:'Schneeschuhwandern',34:'Ski und Snowboard',35:'Skilanglauf',36:'Skitouren',38:'Angeln',39:'Baden',50:'Betreten des Gebietes',52:'Eisklettern',55:'Luftsport',56:'Schneeaktivitäten',58:'Übernachten'};

  var TYPE_LABEL = { CLOSURE: 'Sperrung', NOTICE: 'Hinweis' };

  var WX_CODES = {0:'Klar',1:'Überwiegend klar',2:'Wolkig',3:'Bedeckt',45:'Nebel',48:'Reifnebel',51:'Leichter Nieselregen',53:'Nieselregen',55:'Starker Nieselregen',56:'Gefrierender Nieselregen',57:'Gefrierender Nieselregen',61:'Leichter Regen',63:'Regen',65:'Starker Regen',66:'Gefrierender Regen',67:'Gefrierender Regen',71:'Leichter Schneefall',73:'Schneefall',75:'Starker Schneefall',77:'Schneegriesel',80:'Leichte Schauer',81:'Schauer',82:'Starke Schauer',85:'Schneeschauer',86:'Starke Schneeschauer',95:'Gewitter',96:'Gewitter mit Hagel',99:'Gewitter mit starkem Hagel'};

  var map = L.map('map', { zoomControl: true }).setView([47.2, 11.4], 10);
  var warnEl = document.getElementById('warn');
  var warnings = {};
  function warn(key, msg) {
    warnings[key] = msg;
    warnEl.innerHTML = Object.keys(warnings).map(function (k) { return '<div>' + esc(warnings[k]) + '</div>'; }).join('');
    warnEl.hidden = false;
  }
  function unwarn(key) {
    delete warnings[key];
    warnEl.innerHTML = Object.keys(warnings).map(function (k) { return '<div>' + esc(warnings[k]) + '</div>'; }).join('');
    warnEl.hidden = !Object.keys(warnings).length;
  }
  var FILE_HINT = location.protocol === 'file:'
    ? ' Die Seite wurde als lokale Datei geöffnet. Dabei blockiert der Browser das Laden von Daten und Kartenkacheln. Bitte die Seite über ihre Internetadresse (GitHub Pages) öffnen.'
    : '';
  var tileErrors = 0, tileOk = 0;
  var osm = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }).on('tileerror', function () {
    tileErrors++;
    if (tileErrors >= 3 && tileOk === 0) warn('tiles', 'Die Kartenkacheln von OpenStreetMap lassen sich nicht laden (z. B. 403 „Access blocked“). OpenStreetMap verlangt eine Herkunftsangabe der Seite.' + FILE_HINT);
  }).on('tileload', function () {
    tileOk++;
    if (tileOk === 1) unwarn('tiles');
  }).addTo(map);
  var topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    maxZoom: 17, subdomains: 'abc',
    attribution: 'Kartendaten © <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>, SRTM | Darstellung © <a href="https://opentopomap.org">OpenTopoMap</a> (CC-BY-SA)'
  });
 
  var layerGroup = L.layerGroup().addTo(map);
  var protectedAreasLayer =
    L.layerGroup().addTo(map);
    L.control.layers(
  {
    'OpenStreetMap': osm,
    'Topo mit Höhenlinien': topo
  },
  {
    'Sperrungen & Hinweise': layerGroup,
    'Schutzgebiete': protectedAreasLayer
  },
  {
    position: 'topright',
    collapsed: true
  }
).addTo(map);
  var wxMarker = null;
  var records = new Map();     // uuid -> Datensatz
  var layers = new Map();      // uuid -> L.featureGroup
  var activityNames = Object.assign({}, ACTIVITIES);
  var renderTimer = null;
  var holdUntil = 0;     // nach einem Sprung zu einem Eintrag nicht sofort neu zeichnen
  var dataInfo = '';
  var activeId = null;

  var el = {
    list: document.getElementById('list'),
    status: document.getElementById('status'),
    q: document.getElementById('q'),
    fClosure: document.getElementById('f-closure'),
    fNotice: document.getElementById('f-notice'),
    fUpcoming: document.getElementById('f-upcoming'),
    wx: document.getElementById('wx')
  };

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
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
  function setStatus(msg, isErr) {
    el.status.textContent = msg;
    el.status.className = 'status' + (isErr ? ' err' : '');
  }

  // ---------- Daten ----------
  // data/closures.json wird regelmäßig von einer GitHub Action aus der Digitize API erzeugt.
  async function loadData() {
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
  function scheduleRender() {
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

  function render() {
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

  // ---------- Wetter (Open-Meteo) ----------
  var wxSeq = 0;
  async function loadWeather(lat, lon) {
    var seq = ++wxSeq;
    if (wxMarker) wxMarker.setLatLng([lat, lon]);
    else wxMarker = L.marker([lat, lon], { icon: L.divIcon({ className: '', html: '<div class="wxpin"></div>', iconSize: [14, 14], iconAnchor: [7, 7] }), interactive: false, keyboard: false }).addTo(map);
    el.wx.innerHTML = '<span class="muted">Wird geladen …</span>';
    var url = 'https://api.open-meteo.com/v1/forecast?latitude=' + lat.toFixed(4) + '&longitude=' + lon.toFixed(4) +
      '&current=temperature_2m,apparent_temperature,precipitation,wind_speed_10m,wind_gusts_10m,weather_code' +
      '&hourly=freezing_level_height' +
      '&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,wind_gusts_10m_max' +
      '&wind_speed_unit=kmh&timezone=auto&forecast_days=4';
    try {
      var res = await fetch(url);
      if (!res.ok) throw new Error('HTTP ' + res.status);
      var d = await res.json();
      if (seq !== wxSeq) return;
      var c = d.current;
      var hIdx = d.hourly.time.indexOf(c.time.slice(0, 13) + ':00');
      var fl = hIdx >= 0 ? d.hourly.freezing_level_height[hIdx] : null;
      var wd = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
      var days = d.daily.time.map(function (t, i) {
        var dt = new Date(t + 'T12:00:00');
        return '<div class="day"><b>' + (i === 0 ? 'Heute' : wd[dt.getDay()]) + '</b>' +
          Math.round(d.daily.temperature_2m_max[i]) + '° / ' + Math.round(d.daily.temperature_2m_min[i]) + '°<br>' +
          d.daily.precipitation_sum[i].toFixed(1) + ' mm<br>' +
          'Böen ' + Math.round(d.daily.wind_gusts_10m_max[i]) + '</div>';
      }).join('');
      el.wx.innerHTML =
        '<div class="wx-now"><span class="wx-temp">' + Math.round(c.temperature_2m) + ' °C</span><span class="wx-desc">' + esc(WX_CODES[c.weather_code] || '') + '</span></div>' +
        '<dl class="wx-grid">' +
        '<div><dt>Gefühlt</dt><dd>' + Math.round(c.apparent_temperature) + ' °C</dd></div>' +
        '<div><dt>Wind / Böen</dt><dd>' + Math.round(c.wind_speed_10m) + ' / ' + Math.round(c.wind_gusts_10m) + ' km/h</dd></div>' +
        '<div><dt>Nullgradgrenze</dt><dd>' + (fl == null ? '–' : Math.round(fl / 10) * 10 + ' m') + '</dd></div>' +
        '<div><dt>Standorthöhe</dt><dd>' + (d.elevation != null ? Math.round(d.elevation) + ' m' : '–') + '</dd></div>' +
        '</dl><div class="days">' + days + '</div>' +
        '<p class="muted" style="margin:8px 0 0">Gelände-Höhe laut Wettermodell, kann von der Gipfelhöhe abweichen.</p>';
    } catch (e) {
      if (seq !== wxSeq) return;
      el.wx.innerHTML = '<span class="muted">Wetterdaten sind gerade nicht abrufbar.</span>';
    }
  }
async function loadProtectedAreas() {

  try {

    const res =
      await fetch(
        PROTECTED_AREAS_URL
      );

    const geojson =
      await res.json();

    L.geoJSON(
      geojson,
      {
        style: function () {

          return {
            color: "#2f8f2f",
            weight: 2,
            fillColor: "#5fb85f",
            fillOpacity: 0.20
          };
        },

        onEachFeature:
          function (
            feature,
            layer
          ) {

            const p =
              feature.properties || {};

            layer.bindPopup(
              "<b>" +
              (p.name || "") +
              "</b><br>" +
              (p.summary || "")
            );
          }
      }
    ).addTo(
      protectedAreasLayer
    );

    console.log(
      "Schutzgebiete geladen:",
      geojson.features.length
    );

  } catch (err) {

    console.error(
      "Fehler beim Laden der Schutzgebiete",
      err
    );

  }

}
  // ---------- Ereignisse ----------
  map.on('moveend', scheduleRender);
  map.on('click', function (ev) { loadWeather(ev.latlng.lat, ev.latlng.lng); });
  [el.q, el.fClosure, el.fNotice, el.fUpcoming].forEach(function (n) { n.addEventListener('input', render); });
  document.getElementById('wx-center').addEventListener('click', function () { var c = map.getCenter(); loadWeather(c.lat, c.lng); });
  document.getElementById('wx-geo').addEventListener('click', function () {
    if (!navigator.geolocation) { el.wx.innerHTML = '<span class="muted">Standort wird von diesem Browser nicht unterstützt.</span>'; return; }
    navigator.geolocation.getCurrentPosition(function (p) {
      map.setView([p.coords.latitude, p.coords.longitude], 12);
      loadWeather(p.coords.latitude, p.coords.longitude);
    }, function () { el.wx.innerHTML = '<span class="muted">Standort wurde nicht freigegeben.</span>'; }, { timeout: 10000 });
  });

  var c0 = map.getCenter();
  loadWeather(c0.lat, c0.lng);

loadProtectedAreas();

loadData();

})();
