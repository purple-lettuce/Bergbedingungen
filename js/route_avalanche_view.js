// "Lawinenlage entlang der Route" (RI9b): zeigt je Abschnitt der Route die Region und die Gefahrenstufe in der Höhe der Route, mit Lawinenproblemen,
// Quelle, Stand und Link zum Lagebericht. Berechnung: route_avalanche.js (RI9a), Texte: route_avalanche_logic.js, Daten: avalanche.js (lädt bei Bedarf).
// Klick auf einen Abschnitt springt dorthin und öffnet dasselbe Popup wie die Region in der Karte. Texte aus den Daten gelangen nur über
// textContent in die Seite (Stufenfeld und Popup kommen als maskiertes HTML aus avalanche_symbols.js bzw. avalanche_popup.js).

import { map } from './map.js';
import { fitPadded } from './layout.js';
import { revealMap } from './sheet.js';
import { requestAvalancheData } from './avalanche.js';
import { routeAvalanche } from './route_avalanche.js';
import { summarizeAvalanche } from './route_avalanche_logic.js';
import { sectionPath, sectionMiddle } from './route_context_logic.js';
import { levelChip } from './avalanche_symbols.js';
import { popupHtml, safeUrl } from './avalanche_popup.js';

var MAX_ZOOM = 14;   // Regionen sind groß; der Abschnitt wird nicht näher als nötig herangezoomt

var box = null, route = null, token = 0, data = null;

function el(tag, cls, text) {
  var e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text != null) e.textContent = text;
  return e;
}

function focusItem(item) {
  var seg = item.seg, view = data && data.view(seg.regionId);
  var path = sectionPath(route, seg.fromKm, seg.toKm), mid = sectionMiddle(route, seg.fromKm, seg.toKm);
  if (!view || !path.length || !mid) return;
  revealMap();
  fitPadded(map, L.latLngBounds(path), MAX_ZOOM);
  L.popup({ className: 'av-popup mr-popup', maxWidth: Math.min(340, window.innerWidth - 60), maxHeight: Math.round(window.innerHeight * 0.6) })
    .setLatLng([mid.lat, mid.lon]).setContent(popupHtml(view)).openOn(map);
}

function link(url, text) {
  var a = el('a', null, text);
  a.href = safeUrl(url);
  a.target = '_blank';
  a.rel = 'noopener';
  return a;
}

function render(state, result) {
  var sum = summarizeAvalanche(state, result);
  box.replaceChildren(el('h3', 'mr-label', 'Lawinenlage entlang der Route'), el('p', state === 'ready' ? 'mr-m-0' : 'mr-text-muted mr-text-sm mr-m-0', sum.headline));
  if (sum.items.length) {
    var list = el('ul', 'mr-saved');
    sum.items.forEach(function (item) {
      var li = el('li', 'mr-stack mr-gap-xs');
      var b = el('button', 'mr-ctx__item');
      b.type = 'button';
      var head = el('span', 'mr-ctx__head');
      if (item.level) { var chip = el('span'); chip.innerHTML = levelChip(item.level, item.subdivision, item.uncertain ? 'av-uncertain' : ''); head.append(chip); }
      head.append(el('span', 'mr-saved__name', item.title + ' · ' + item.range));
      b.append(head, el('span', null, item.levelText));
      item.lines.concat(item.problems ? [item.problems] : []).forEach(function (t) { b.append(el('span', 'mr-text-muted mr-text-sm', t)); });
      b.setAttribute('aria-label', item.title + ', ' + item.range + ', ' + item.levelText + ', Karte zeigen');
      b.addEventListener('click', function () { focusItem(item); });
      var src = el('p', 'mr-text-muted mr-text-sm mr-m-0', item.source);
      if (item.link) { src.append(' · '); src.append(link(item.link, 'Lagebericht beim Warndienst')); }
      if (item.attribution && item.attribution.url) { src.append(' · '); src.append(link(item.attribution.url, 'Datenquelle')); }
      li.append(b, src);
      list.append(li);
    });
    box.append(list);
  }
  sum.notes.forEach(function (t) { box.append(el('p', 'mr-text-muted mr-text-sm mr-m-0', t)); });
}

function update() {
  var mine = ++token;
  if (!box) return;
  if (!route) { box.hidden = true; box.replaceChildren(); return; }
  box.hidden = false;
  render('loading', null);
  requestAvalancheData().then(function (d) {
    if (mine !== token) return;
    data = d;
    if (!d) { render('failed', null); return; }
    // erst zeichnen lassen: der Schnitt mit den Regionspolygonen braucht beim ersten Mal einige Dutzend Millisekunden
    setTimeout(function () {
      if (mine !== token) return;
      try { render('ready', routeAvalanche(route, d)); }
      catch (err) { console.error('Fehler bei der Lawinenlage entlang der Route', err); render('failed', null); }
    }, 0);
  });
}

export function initRouteAvalanche(container) { box = container; }

// Neue Route (oder null ohne Route).
export function setRouteAvalanche(r) {
  route = r;
  update();
}
