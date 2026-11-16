// Texte und Zusammenfassung für "Wetter entlang der Route" (RI10b, reine Logik ohne DOM und Karte). Auf den Ergebnissen von route_weather.js (RI10a).
// Nur vorhandene Werte werden gezeigt; Fehlendes steht als "–". Die Nullgradgrenze und die Höhe der Route stehen nebeneinander, ohne Wertung:
// es werden keine Aussagen wie "Schnee" oder "Regen" daraus abgeleitet. Es sind aktuelle Werte und der Tag, keine Prognose für die Tour.

import { WX_CODES } from './weather_api.js';
import { weatherStatus } from './status_bar_logic.js';

export const PRIVACY_NOTE = 'Beim Laden gehen bis zu 6 Punkte der Route, auf etwa 1 km gerundet (Start und Ziel eingeschlossen), an Open-Meteo. Der Streckenverlauf und die GPX-Datei werden nicht übertragen.';
export const SOURCE_NOTE = 'Wetterdaten: Open-Meteo (open-meteo.com). Modellwerte für ein Raster, aktuelle Werte und der heutige Tag, keine Prognose für die Tour; die Modellhöhe kann von der Höhe des Punktes abweichen.';
export const ROLE_LABELS = { start: 'Start', end: 'Ziel', highest: 'Höchster Punkt', via: 'Zwischenpunkt' };

function r(v) { return Math.round(v); }
function de(v, digits) { return v.toLocaleString('de-DE', { minimumFractionDigits: digits, maximumFractionDigits: digits }); }
function metersText(v) { return r(v).toLocaleString('de-DE') + ' m'; }
function dash(v, fn) { return v == null ? '–' : fn(v); }

// Titel eines Stützpunkts: "Start (km 0,0)", "Höchster Punkt (km 10,3)".
export function pointTitle(point) {
  var km = point.km.toLocaleString('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  return (ROLE_LABELS[point.role] || 'Punkt') + ' (km ' + km + ')';
}

// Zeilen für einen Stützpunkt mit Wetter: [{ label, value }]
export function pointRows(point, f) {
  var day = f.days && f.days[0] ? f.days[0] : null;
  var rows = [
    { label: 'Wetter', value: f.code != null && WX_CODES[f.code] ? WX_CODES[f.code] : '–' },
    { label: 'Temperatur', value: dash(f.temperature, function (v) { return r(v) + ' °C'; }) + (f.apparent != null ? ' (gefühlt ' + r(f.apparent) + ' °C)' : '') },
    { label: 'Wind / Böen', value: f.wind == null && f.gust == null ? '–' : dash(f.wind, r) + ' / ' + dash(f.gust, r) + ' km/h' },
    { label: 'Niederschlag jetzt', value: dash(f.precipitation, function (v) { return de(v, 1) + ' mm'; }) }
  ];
  if (day) {
    rows.push({ label: 'Heute', value: (day.tmax != null && day.tmin != null ? r(day.tmax) + '° / ' + r(day.tmin) + '°' : '–') +
      ' · ' + dash(day.precipitation, function (v) { return de(v, 1) + ' mm'; }) + ' · Böen bis ' + dash(day.gustMax, r) });
  }
  // Gegenüberstellung ohne Wertung: Nullgradgrenze und Höhe der Route
  rows.push({ label: 'Nullgradgrenze', value: dash(f.freezingLevel, function (v) { return metersText(Math.round(v / 10) * 10); }) });
  rows.push({ label: 'Höhe der Route hier', value: point.ele != null ? metersText(point.ele) : 'keine Höhe in der Datei' });
  rows.push({ label: 'Modellhöhe', value: dash(f.elevation, metersText) });
  return rows;
}

// Eintrag der Liste je Stützpunkt.
export function itemOf(res) {
  var p = res.point;
  if (res.state !== 'ok') return { title: pointTitle(p), ok: false, rows: [], stand: null, text: 'Wetter für diesen Punkt nicht abrufbar.' };
  var st = weatherStatus(res.forecast.time);
  return { title: pointTitle(p), ok: true, rows: pointRows(p, res.forecast), stand: st.text.startsWith('Stand') ? st.text + ' (Ortszeit)' : null, text: null };
}

// state: 'idle' (noch nicht geladen) | 'loading' | 'done'; results: Ergebnis von loadRouteWeather.
// Ergebnis { headline, notes, items, canLoad } (canLoad: Knopf zum (erneuten) Laden zeigen).
export function summarizeWeather(state, results) {
  if (state === 'idle') return { headline: 'Wetter an den Stützpunkten der Route laden.', notes: [PRIVACY_NOTE], items: [], canLoad: true };
  if (state === 'loading') return { headline: 'Wetter wird geladen …', notes: [], items: [], canLoad: false };
  var items = (results || []).map(itemOf), ok = items.filter(function (i) { return i.ok; }).length;
  var headline = !items.length ? 'Keine Stützpunkte für die Route.'
    : !ok ? 'Wetter nicht abrufbar, hier nicht geprüft.'
    : ok < items.length ? 'Wetter für ' + ok + ' von ' + items.length + ' Stützpunkten; für die übrigen nicht abrufbar.'
    : 'Wetter an ' + items.length + (items.length === 1 ? ' Stützpunkt' : ' Stützpunkten') + ' der Route.';
  var notes = [];
  var stands = Array.from(new Set(items.map(function (i) { return i.stand; }).filter(Boolean)));
  if (stands.length === 1) notes.push(stands[0] + '.');
  var single = singlePointNote(results);
  if (single) notes.push(single);
  notes.push(SOURCE_NOTE);
  return { headline: headline, notes: notes, items: items, canLoad: ok < items.length };
}

// Hinweis, falls die Route kürzer als ein Stützpunktabstand ist (nur ein Punkt): einmal erklären statt eine leere Liste zu zeigen.
export function singlePointNote(results) {
  return results && results.length === 1 ? 'Die Route ist so kurz, dass ein Stützpunkt reicht.' : null;
}

