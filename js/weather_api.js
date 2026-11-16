// Open-Meteo-Abruf und Auswertung (reines Modul ohne DOM und Karte), gemeinsam genutzt vom Wetterwidget (weather.js) und von
// "Wetter entlang der Route" (route_weather.js, RI10). Eine Abfrage kann mehrere Orte enthalten (kommagetrennte Koordinaten);
// die Antwort ist dann eine Liste, bei einem Ort ein einzelnes Objekt. Quelle und Stand: docs/DATENQUELLEN.md.

export const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';
const CURRENT = 'temperature_2m,apparent_temperature,precipitation,wind_speed_10m,wind_gusts_10m,weather_code';
const DAILY = 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,wind_gusts_10m_max';

// Wettercodes (WMO) in Worten
export const WX_CODES = {0:'Klar',1:'Überwiegend klar',2:'Wolkig',3:'Bedeckt',45:'Nebel',48:'Reifnebel',51:'Leichter Nieselregen',53:'Nieselregen',55:'Starker Nieselregen',56:'Gefrierender Nieselregen',57:'Gefrierender Nieselregen',61:'Leichter Regen',63:'Regen',65:'Starker Regen',66:'Gefrierender Regen',67:'Gefrierender Regen',71:'Leichter Schneefall',73:'Schneefall',75:'Starker Schneefall',77:'Schneegriesel',80:'Leichte Schauer',81:'Schauer',82:'Starke Schauer',85:'Schneeschauer',86:'Starke Schneeschauer',95:'Gewitter',96:'Gewitter mit Hagel',99:'Gewitter mit starkem Hagel'};

// points: [{ lat, lon }]; Koordinaten werden auf vier Nachkommastellen gerundet (wie bisher im Wetterwidget).
export function forecastUrl(points, forecastDays) {
  return FORECAST_URL + '?latitude=' + points.map(function (p) { return p.lat.toFixed(4); }).join(',') +
    '&longitude=' + points.map(function (p) { return p.lon.toFixed(4); }).join(',') +
    '&current=' + CURRENT + '&hourly=freezing_level_height&daily=' + DAILY +
    '&wind_speed_unit=kmh&timezone=auto&forecast_days=' + forecastDays;
}

function num(v) { return typeof v === 'number' && isFinite(v) ? v : null; }

// Antwort eines Orts → { time, temperature, apparent, precipitation, wind, gust, code, freezingLevel, elevation, days }.
// Fehlende Werte sind null, nie 0. Ohne current-Block (unbrauchbare Antwort) null.
export function parseForecast(d) {
  if (!d || typeof d !== 'object' || !d.current || typeof d.current.time !== 'string') return null;
  var c = d.current;
  var hIdx = d.hourly && Array.isArray(d.hourly.time) ? d.hourly.time.indexOf(c.time.slice(0, 13) + ':00') : -1;
  var fl = hIdx >= 0 && d.hourly.freezing_level_height ? num(d.hourly.freezing_level_height[hIdx]) : null;
  var daily = d.daily || {}, times = Array.isArray(daily.time) ? daily.time : [];
  var at = function (arr, i) { return Array.isArray(arr) ? num(arr[i]) : null; };
  return {
    time: c.time, temperature: num(c.temperature_2m), apparent: num(c.apparent_temperature), precipitation: num(c.precipitation),
    wind: num(c.wind_speed_10m), gust: num(c.wind_gusts_10m), code: num(c.weather_code), freezingLevel: fl, elevation: num(d.elevation),
    days: times.map(function (t, i) {
      return { date: t, tmax: at(daily.temperature_2m_max, i), tmin: at(daily.temperature_2m_min, i), precipitation: at(daily.precipitation_sum, i),
        gustMax: at(daily.wind_gusts_10m_max, i), code: at(daily.weather_code, i) };
    })
  };
}

// Ruft die Vorhersage für alle Orte mit einer einzigen Abfrage ab; Ergebnis in derselben Reihenfolge, ein unbrauchbarer Eintrag ist null.
// Wirft bei Netzwerkfehler, HTTP-Fehler oder unlesbarer Antwort. opts: { forecastDays (Standard 4), fetchFn (Standard fetch) }.
export async function fetchForecasts(points, opts) {
  opts = opts || {};
  var doFetch = opts.fetchFn || fetch;
  var res = await doFetch(forecastUrl(points, opts.forecastDays || 4));
  if (!res.ok) throw new Error('HTTP ' + res.status);
  var body = await res.json();
  var list = Array.isArray(body) ? body : [body];
  if (list.length !== points.length) throw new Error('Antwort mit ' + list.length + ' statt ' + points.length + ' Orten');
  return list.map(parseForecast);
}
