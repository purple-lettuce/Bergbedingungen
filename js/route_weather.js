// Wetter entlang der Route, Datenzugriff (RI10a): Auswahl weniger Stützpunkte und Abruf mit Zwischenspeicher. Reines Modul ohne DOM und Karte;
// der Abruf selbst liegt in weather_api.js (gemeinsam mit dem Wetterwidget), das Netzwerk wird von außen übergeben (testbar).
//
// Stützpunkte: Start, Ziel, höchster Punkt (nur mit Höhen in der Route) und gleichmäßig verteilte Zwischenpunkte, höchstens MAX_POINTS;
// etwa alle TARGET_SPACING_KM ein Punkt. Datenschutz: Die Koordinaten werden vor dem Abruf auf ROUND_DECIMALS Nachkommastellen gerundet
// (rund 1 km); nur diese gerundeten Punkte gehen an Open-Meteo, nie der Streckenverlauf, und alle Punkte einer Route in einer Abfrage.
// Zwischenspeicher: je gerundetem Punkt und Stunde (UTC), höchstens CACHE_MAX Einträge, nur für diese Sitzung (kein Speichern im Browser).
// Es gibt nur "jetzt" und die Tageswerte; Prognosen für eine Startzeit sind ein späteres Paket.

import { pointAtKm } from './geo.js';
import { fetchForecasts } from './weather_api.js';

export const MAX_POINTS = 6;
export const TARGET_SPACING_KM = 6;
export const MIN_GAP_KM = 1.5;      // Zwischenpunkte näher als das an einem anderen Stützpunkt entfallen
export const ROUND_DECIMALS = 2;
export const CACHE_MAX = 60;

function round(v) { var f = Math.pow(10, ROUND_DECIMALS); return Math.round(v * f) / f; }

// Höchster Punkt der Route mit Höhe: { km, ele } oder null.
export function highestPoint(route) {
  var best = null;
  route.points.forEach(function (p) { if (p.ele != null && (!best || p.ele > best.ele)) best = { km: p.dist / 1000, ele: p.ele }; });
  return best;
}

// Stützpunkte der Route, nach Streckenkilometer sortiert: [{ role: 'start' | 'end' | 'highest' | 'via', km, lat, lon, ele }]
// lat/lon sind gerundet (siehe oben), ele ist die Höhe aus der Route (oder null). Punkte, die nach dem Runden zusammenfallen,
// zählen einmal (Vorrang Start, Ziel, höchster Punkt, Zwischenpunkt).
export function pickPoints(route, opts) {
  if (!route || !route.points || !route.points.length) return [];
  var max = opts && opts.maxPoints > 0 ? Math.min(opts.maxPoints, 8) : MAX_POINTS;
  var total = route.lengthM / 1000;
  var picks = [{ role: 'start', km: 0 }, { role: 'end', km: total }];
  var hi = highestPoint(route);
  if (hi && Math.abs(hi.km - 0) >= MIN_GAP_KM && Math.abs(hi.km - total) >= MIN_GAP_KM) picks.push({ role: 'highest', km: hi.km });
  var wanted = Math.max(2, Math.min(max, Math.round(total / TARGET_SPACING_KM) + 2));
  // gleichmäßige Aufteilung der Strecke; Teilpunkte nahe einem vorhandenen Stützpunkt (z. B. dem höchsten Punkt) entfallen
  for (var i = 1; i <= wanted - 2; i++) {
    var km = total * i / (wanted - 1);
    var tooClose = picks.some(function (p) { return Math.abs(p.km - km) < MIN_GAP_KM; });
    if (!tooClose) picks.push({ role: 'via', km: km });
  }
  var rank = { start: 0, end: 1, highest: 2, via: 3 }, seen = new Map(), out = [];
  picks.sort(function (a, b) { return rank[a.role] - rank[b.role] || a.km - b.km; });
  picks.forEach(function (p) {
    var at = pointAtKm(route.points, p.km);
    var lat = round(at.lat), lon = round(at.lon), key = lat + ',' + lon;
    if (seen.has(key)) return;
    seen.set(key, true);
    var ele = p.role === 'highest' ? hi.ele : at.ele;
    out.push({ role: p.role, km: p.km, lat: lat, lon: lon, ele: ele == null ? null : ele });
  });
  return out.slice(0, max).sort(function (a, b) { return a.km - b.km; });   // erst nach Vorrang kürzen (Start, Ziel, höchster Punkt bleiben), dann nach Kilometer ordnen
}

// ---------- Abruf mit Zwischenspeicher ----------

var cache = new Map();   // Schlüssel -> geparste Vorhersage

export function clearWeatherCache() { cache.clear(); }
export function weatherCacheSize() { return cache.size; }

function hourKey(now) { return new Date(now).toISOString().slice(0, 13); }
function cacheKey(p, now) { return p.lat.toFixed(ROUND_DECIMALS) + ',' + p.lon.toFixed(ROUND_DECIMALS) + '@' + hourKey(now); }

// Lädt das Wetter für die Stützpunkte (Ergebnis von pickPoints). Fehlende Orte werden mit einer einzigen Abfrage geholt, vorhandene kommen aus
// dem Zwischenspeicher. Ergebnis je Stützpunkt in derselben Reihenfolge: { point, state: 'ok' | 'failed', forecast | null, cached, error | null }.
// Wirft nie. deps: { fetchFn, now (Millisekunden, Standard Date.now()), forecastDays (Standard 1) }.
export async function loadRouteWeather(points, deps) {
  deps = deps || {};
  var now = deps.now != null ? deps.now : Date.now();
  var result = points.map(function (p) {
    var hit = cache.get(cacheKey(p, now));
    return { point: p, state: hit ? 'ok' : 'failed', forecast: hit || null, cached: !!hit, error: hit ? null : 'pending' };
  });
  var missing = result.filter(function (r) { return r.error === 'pending'; });
  if (!missing.length) return result;
  try {
    var list = await fetchForecasts(missing.map(function (r) { return r.point; }), { forecastDays: deps.forecastDays || 1, fetchFn: deps.fetchFn });
    missing.forEach(function (r, i) {
      if (list[i]) {
        r.state = 'ok'; r.forecast = list[i]; r.error = null;
        cache.set(cacheKey(r.point, now), list[i]);
        while (cache.size > CACHE_MAX) cache.delete(cache.keys().next().value);
      } else {
        r.error = 'Antwort ohne aktuelle Werte';
      }
    });
  } catch (err) {
    missing.forEach(function (r) { r.error = String(err && err.message || err); });
  }
  return result;
}
