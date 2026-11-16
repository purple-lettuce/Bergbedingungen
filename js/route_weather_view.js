// "Wetter entlang der Route" (RI10b): Wetter an wenigen Stützpunkten der geöffneten Route (Open-Meteo). Der Abruf geschieht erst auf Knopfdruck,
// weil dabei gerundete Stützpunkte an einen externen Dienst gehen (Datenschutzhinweis steht vor dem Laden). Auswahl der Punkte und Abruf:
// route_weather.js (RI10a), Texte: route_weather_logic.js. Texte aus den Daten gelangen nur über textContent in die Seite.

import { pickPoints, loadRouteWeather } from './route_weather.js';
import { summarizeWeather } from './route_weather_logic.js';

var box = null, route = null, token = 0, points = [], results = null;

function el(tag, cls, text) {
  var e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text != null) e.textContent = text;
  return e;
}

function render(state) {
  var sum = summarizeWeather(state, results);
  box.replaceChildren(el('h3', 'mr-label', 'Wetter entlang der Route'), el('p', state === 'done' ? 'mr-m-0' : 'mr-text-muted mr-text-sm mr-m-0', sum.headline));
  if (state === 'idle') sum.notes.forEach(function (t) { box.append(el('p', 'mr-text-muted mr-text-sm mr-m-0', t)); });
  if (sum.canLoad) {
    var b = el('button', null, state === 'idle' ? 'Wetter laden' : 'Erneut versuchen');
    b.type = 'button';
    b.addEventListener('click', load);
    box.append(b);
  }
  if (sum.items.length) {
    var list = el('ul', 'mr-saved');
    sum.items.forEach(function (item) {
      var li = el('li', 'mr-saved__item mr-stack mr-gap-xs');
      li.append(el('span', 'mr-saved__name', item.title));
      if (!item.ok) li.append(el('span', 'mr-text-muted mr-text-sm', item.text));
      else {
        var kv = el('dl', 'mr-kv');
        item.rows.forEach(function (row) { kv.append(el('dt', null, row.label), el('dd', null, row.value)); });
        li.append(kv);
      }
      list.append(li);
    });
    box.append(list);
  }
  if (state === 'done') sum.notes.forEach(function (t) { box.append(el('p', 'mr-text-muted mr-text-sm mr-m-0', t)); });
}

function load() {
  var mine = ++token;
  render('loading');
  loadRouteWeather(points).then(function (res) {
    if (mine !== token) return;
    results = res;
    render('done');
  });
}

export function initRouteWeather(container) { box = container; }

// Neue Route (oder null ohne Route): zeigt nur das Angebot zum Laden, es wird noch nichts abgerufen.
export function setRouteWeather(r) {
  route = r;
  token++;
  results = null;
  if (!box) return;
  if (!route) { box.hidden = true; box.replaceChildren(); return; }
  points = pickPoints(route);
  box.hidden = false;
  render('idle');
}
