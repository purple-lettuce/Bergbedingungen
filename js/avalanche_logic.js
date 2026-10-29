// Reine Logik der Lawinenlage (kein DOM, kein Leaflet): Gefahrenstufen, Höhen, Gültigkeit, deutsche Bezeichnungen.
// Bezeichnungen: ALBINA-Übersetzungen (albina-website, app/i18n/caaml/de.json).

export const STALE_HOURS = 6;   // so lange nach Ablauf gilt ein Bericht noch als "abgelaufen, neuer folgt"

export const LEVEL_NAMES = { 1: 'Gering', 2: 'Mäßig', 3: 'Erheblich', 4: 'Groß', 5: 'Sehr groß' };
// Offizielle Farben der Europäischen Gefahrenskala (ALBINA); Stufe 5 zusätzlich als Schachbrett
export const LEVEL_COLORS = { 1: '#ccff66', 2: '#ffff00', 3: '#ff9900', 4: '#ff0000', 5: '#ff0000' };
export const VALUE_NAMES = { no_snow: 'Kein Schnee', no_rating: 'Keine Beurteilung' };
export const PROBLEM_NAMES = {
  new_snow: 'Neuschnee', wind_slab: 'Triebschnee', persistent_weak_layers: 'Altschnee', wet_snow: 'Nassschnee',
  gliding_snow: 'Gleitschnee', favourable_situation: 'Günstige Situation', cornices: 'Wechten',
  no_distinct_avalanche_problem: 'Kein ausgeprägtes Lawinenproblem'
};
export const STABILITY_NAMES = { good: 'gut', fair: 'mittel', poor: 'schlecht', very_poor: 'sehr schlecht' };
export const FREQUENCY_NAMES = { none: 'keine', few: 'wenige', some: 'einige', many: 'viele' };
export const SIZE_NAMES = { 1: 'klein', 2: 'mittel', 3: 'groß', 4: 'sehr groß', 5: 'extrem' };
export const ASPECT_NAMES = {
  N: 'Nord', NE: 'Nord-Ost', E: 'Ost', SE: 'Süd-Ost', S: 'Süd', SW: 'Süd-West', W: 'West', NW: 'Nord-West'
};
export const PERIOD_NAMES = { all_day: 'Den ganzen Tag', earlier: 'Früher am Tag', later: 'Später am Tag' };
export const TENDENCY_NAMES = {
  decreasing: 'Lawinengefahr nimmt ab', steady: 'Lawinengefahr bleibt gleich', increasing: 'Lawinengefahr steigt'
};
export const DANGER_PATTERNS = {
  DP1: 'Bodennahe Schwachschicht', DP2: 'Gleitschnee', DP3: 'Regen auf Schnee', DP4: 'Kalt auf warm / warm auf kalt',
  DP5: 'Schnee nach langer Kälteperiode', DP6: 'Lockerer Schnee und Wind', DP7: 'Schneearm neben schneereich',
  DP8: 'Eingeschneiter Oberflächenreif', DP9: 'Eingeschneiter Graupel', DP10: 'Frühjahrssituation'
};

// 'valid' | 'stale' (kürzlich abgelaufen, neuer Bericht steht noch aus) | 'expired'
export function bulletinStatus(validTime, now) {
  const end = Date.parse(validTime.endTime);
  if (now <= end) return 'valid';
  return now <= end + STALE_HOURS * 3600 * 1000 ? 'stale' : 'expired';
}

// Gilt eine Gefahrenstufe in dieser Höhe? true | false | null (unbekannt: Grenze ist "treeline", die Daten enthalten keinen Zahlenwert)
export function ratingCoverage(rating, altitude) {
  const el = rating.elevation;
  if (!el) return true;
  const checks = [];
  if (el.lowerBound !== undefined) checks.push(el.lowerBound === 'treeline' ? null : altitude >= el.lowerBound);
  if (el.upperBound !== undefined) checks.push(el.upperBound === 'treeline' ? null : altitude <= el.upperBound);
  if (checks.includes(false)) return false;
  return checks.includes(null) ? null : true;
}

// Höchste Stufe, die in dieser Höhe gelten kann (alle Tageszeiten, vorsichtig). uncertain: Ergebnis hängt von einer
// Waldgrenze ohne Höhenangabe ab. Rückgabe null, wenn keine Stufe gilt (z. B. kein Schnee).
export function levelAtAltitude(ratings, altitude) {
  let certain = 0, possible = 0;
  ratings.forEach(function (r) {
    if (!r.level) return;
    const c = ratingCoverage(r, altitude);
    if (c === false) return;
    possible = Math.max(possible, r.level);
    if (c === true) certain = Math.max(certain, r.level);
  });
  return possible ? { level: possible, uncertain: possible > certain } : null;
}

export function elevationLabel(el) {
  if (!el) return 'Alle Höhenlagen';
  const fmt = function (v) { return v === 'treeline' ? 'der Waldgrenze' : v + ' m'; };
  const lo = el.lowerBound, up = el.upperBound;
  if (lo !== undefined && up !== undefined) {
    return 'Zwischen ' + (lo === 'treeline' ? 'Waldgrenze' : lo + ' m') + ' und ' + (up === 'treeline' ? 'Waldgrenze' : up + ' m');
  }
  if (lo !== undefined) return 'Über ' + fmt(lo);
  return 'Unter ' + fmt(up);
}

// 'all' | 'above' | 'below' | 'middle' (Piktogramm der Höhenlage)
export function elevationWhere(el) {
  if (!el) return 'all';
  const lo = el.lowerBound !== undefined, up = el.upperBound !== undefined;
  return lo && up ? 'middle' : lo ? 'above' : 'below';
}

export function ratingText(r) {
  return r.level ? 'Stufe ' + r.level + ' – ' + LEVEL_NAMES[r.level] : (VALUE_NAMES[r.value] || r.value);
}

// Gefahrenstufen nach Tageszeit gruppiert. picto: [unten, oben] für das offizielle Piktogramm levels_<unten>_<oben>,
// nur bei einer Stufe für alle Höhen oder genau einer Teilung an derselben Grenze; sonst null.
export function ratingGroups(ratings) {
  const order = ['all_day', 'earlier', 'later'];
  const groups = [];
  order.forEach(function (period) {
    const rows = ratings.filter(function (r) { return r.period === period; });
    if (!rows.length) return;
    rows.sort(function (a, b) { return (b.elevation && b.elevation.lowerBound !== undefined ? 1 : 0) - (a.elevation && a.elevation.lowerBound !== undefined ? 1 : 0); });
    groups.push({ period: period, rows: rows, picto: pictoLevels(rows) });
  });
  return groups;
}

function pictoLevels(rows) {
  const lvl = function (r) { return r.level || 0; };
  if (rows.length === 1 && !rows[0].elevation) return [lvl(rows[0]), lvl(rows[0])];
  if (rows.length !== 2) return null;
  const below = rows.find(function (r) { return r.elevation && r.elevation.upperBound !== undefined && r.elevation.lowerBound === undefined; });
  const above = rows.find(function (r) { return r.elevation && r.elevation.lowerBound !== undefined && r.elevation.upperBound === undefined; });
  if (!below || !above || below.elevation.upperBound !== above.elevation.lowerBound) return null;
  return [lvl(below), lvl(above)];
}

const TIME_FORMAT = new Intl.DateTimeFormat('de-AT', {
  timeZone: 'Europe/Vienna', weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
});
const DAY_FORMAT = new Intl.DateTimeFormat('de-AT', {
  timeZone: 'Europe/Vienna', weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric'
});
export function formatTime(iso) { return TIME_FORMAT.format(new Date(iso)); }
export function formatDay(iso) { return DAY_FORMAT.format(new Date(iso)); }