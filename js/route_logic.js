// Reine Logik zum Laden einer Route (RI3, kein DOM, kein Leaflet): Prüfung der Datei vor dem Lesen und Texte für Datenstatus und Routenkarte.
// Es werden nur vorhandene Werte verwendet; nichts wird erfunden oder geschätzt.

import { MAX_BYTES } from './gpx.js';

export const STATUS_LOADING = { state: 'loading', text: 'Datei wird gelesen …' };

function plural(n, one, many) { return n.toLocaleString('de-DE') + ' ' + (n === 1 ? one : many); }

// Dateiprüfung vor dem Lesen: eine zu große Datei wird gar nicht erst in den Speicher geladen (E4).
// file = { name, size } (Bytes); Ergebnis { ok, error }.
export function checkFile(file) {
  if (!file) return { ok: false, error: 'Es wurde keine Datei ausgewählt.' };
  if (!file.size) return { ok: false, error: 'Die Datei ist leer.' };
  if (file.size > MAX_BYTES) return { ok: false, error: 'Die Datei ist größer als ' + Math.round(MAX_BYTES / 1048576) + ' MB und wird nicht gelesen.' };
  return { ok: true, error: null };
}

// Anzeigename: Name aus der Datei, sonst der Dateiname ohne Endung, sonst "Route".
export function routeTitle(route, fileName) {
  if (route && route.name) return route.name;
  var base = String(fileName || '').replace(/\.[^.]*$/, '').trim();
  return base || 'Route';
}

// Datenstatus-Leiste: "Route: geladen" mit Punktzahl; Lücken und Warnungen aus Parser und Routenmodell machen den Zustand eingeschränkt.
export function routeStatus(route) {
  var text = plural(route.points.length, 'Punkt', 'Punkte');
  if (route.gaps.length) text += ' · ' + plural(route.gaps.length, 'Lücke', 'Lücken');
  if (route.warnings.length) return { state: 'limited', text: text + ' · ' + plural(route.warnings.length, 'Hinweis', 'Hinweise') };
  return { state: 'ok', text: text };
}