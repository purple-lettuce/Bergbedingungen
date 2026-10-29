// Reine Logik der Lawinenlage (kein DOM, kein Leaflet) auf dem gemeinsamen Datenmodell, siehe docs/LAWINENLAGE_ANALYSE.md.
// Deutsche Bezeichnungen: ALBINA-Übersetzungen (albina-website, app/i18n/caaml/de.json) und SLF-Schreibweise der Teilstufen.

export const STALE_HOURS = 6;   // so lange nach Ablauf gilt ein Bericht noch als "abgelaufen, neuer folgt"

export const LEVEL_NAMES = { 1: 'Gering', 2: 'Mäßig', 3: 'Erheblich', 4: 'Groß', 5: 'Sehr groß' };
// Offizielle Farben der Europäischen Gefahrenskala (ALBINA, SLF-API-Hinweis "fill"); Stufe 5 zusätzlich als Schachbrett
export const LEVEL_COLORS = { 1: '#ccff66', 2: '#ffff00', 3: '#ff9900', 4: '#ff0000', 5: '#ff0000' };
export const VALUE_NAMES = { no_snow: 'Kein Schnee', no_rating: 'Keine Beurteilung' };
// Teilstufen der Schweiz: 3- (minus), 3= (neutral), 3+ (plus)
export const SUBDIVISION_SYMBOLS = { minus: '-', neutral: '=', plus: '+' };
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
export const SECTION_TITLES = {
  activity: 'Lawinensituation', snowpack: 'Schneedecke', weather_forecast: 'Wetter', weather_review: 'Wetterrückblick',
  travel_advisory: 'Tourenempfehlung'
};
export const DANGER_PATTERNS = {
  DP1: 'Bodennahe Schwachschicht', DP2: 'Gleitschnee', DP3: 'Regen auf Schnee', DP4: 'Kalt auf warm / warm auf kalt',
  DP5: 'Schnee nach langer Kälteperiode', DP6: 'Lockerer Schnee und Wind', DP7: 'Schneearm neben schneereich',
  DP8: 'Eingeschneiter Oberflächenreif', DP9: 'Eingeschneiter Graupel', DP10: 'Frühjahrssituation'
};

// 'valid' | 'stale' (kürzlich abgelaufen, neuer Bericht steht noch aus) | 'expired'
export function bulletinStatus(validityPeriod, now) {
  const end = Date.parse(validityPeriod.end);
  if (now <= end) return 'valid';
  return now <= end + STALE_HOURS * 3600 * 1000 ? 'stale' : 'expired';
}

// "3", "3+", "3=" oder "3-" (Teilstufe nur, wenn die Quelle sie liefert)
export function levelLabel(level, subdivision) {
  return level ? String(level) + (SUBDIVISION_SYMBOLS[subdivision] || '') : '';
}

export function ratingText(r) {
  return r.level ? 'Stufe ' + levelLabel(r.level, r.subdivision) + ' – ' + LEVEL_NAMES[r.level] : (VALUE_NAMES[r.value] || r.value);
}

// Gilt eine Gefahrenstufe in dieser Höhe? true | false | null (unbekannt: Grenze ist "treeline", die Daten enthalten keinen Zahlenwert)
export function ratingCoverage(rating, altitude) {
  const el = rating.elevation;
  if (!el) return true;
  const checks = [];
  if (el.lower_bound !== undefined) checks.push(el.lower_bound === 'treeline' ? null : altitude >= el.lower_bound);
  if (el.upper_bound !== undefined) checks.push(el.upper_bound === 'treeline' ? null : altitude <= el.upper_bound);
  if (checks.includes(false)) return false;
  return checks.includes(null) ? null : true;
}

// Stufe der Region, optional für eine Höhe. Ohne Höhe oder wenn die Gefahrenstufen der Quelle keine Höhengrenze tragen
// (SLF: Höhen nur bei den Lawinenproblemen), gilt die höchste Stufe. Mit Höhe: höchste Stufe, die dort gelten kann
// (alle Tageszeiten, vorsichtig). uncertain: das Ergebnis hängt von einer Waldgrenze ohne Höhenangabe ab.
// Rückgabe null, wenn keine Stufe gilt (z. B. kein Schnee).
export function levelAtAltitude(bulletin, altitude) {
  const ratings = bulletin.danger_ratings;
  if (altitude === null || altitude === undefined || !ratings.some(function (r) { return r.elevation; })) {
    return bulletin.max_level ? { level: bulletin.max_level, subdivision: bulletin.max_subdivision, uncertain: false } : null;
  }
  let certain = 0, possible = 0, sub = null;
  ratings.forEach(function (r) {
    if (!r.level) return;
    const c = ratingCoverage(r, altitude);
    if (c === false) return;
    if (r.level >= possible) { possible = r.level; sub = r.subdivision || null; }
    if (c === true) certain = Math.max(certain, r.level);
  });
  return possible ? { level: possible, subdivision: sub, uncertain: possible > certain } : null;
}

// Ob die Höhenwahl für dieses Bulletin etwas bewirkt
export function hasElevationRatings(bulletin) {
  return bulletin.danger_ratings.some(function (r) { return r.elevation; });
}

export function elevationLabel(el) {
  if (!el) return 'Alle Höhenlagen';
  const fmt = function (v) { return v === 'treeline' ? 'der Waldgrenze' : v + ' m'; };
  const lo = el.lower_bound, up = el.upper_bound;
  if (lo !== undefined && up !== undefined) {
    return 'Zwischen ' + (lo === 'treeline' ? 'Waldgrenze' : lo + ' m') + ' und ' + (up === 'treeline' ? 'Waldgrenze' : up + ' m');
  }
  if (lo !== undefined) return 'Über ' + fmt(lo);
  return 'Unter ' + fmt(up);
}

// 'all' | 'above' | 'below' | 'middle' (Piktogramm der Höhenlage)
export function elevationWhere(el) {
  if (!el) return 'all';
  const lo = el.lower_bound !== undefined, up = el.upper_bound !== undefined;
  return lo && up ? 'middle' : lo ? 'above' : 'below';
}

// Gefahrenstufen nach Höhe (danger_by_elevation) nach Tageszeit gruppiert. picto: [unten, oben] für das offizielle
// Piktogramm levels_<unten>_<oben>, nur bei einer Stufe für alle Höhen oder genau einer Teilung an derselben Grenze.
export function bandGroups(bands) {
  const groups = [];
  ['all_day', 'earlier', 'later'].forEach(function (period) {
    const rows = bands.filter(function (b) { return b.period === period; });
    if (rows.length) groups.push({ period: period, rows: rows, picto: pictoLevels(rows) });
  });
  return groups;
}

function pictoLevels(rows) {
  const lvl = function (r) { return r.level || 0; };
  if (rows.length === 1 && !rows[0].elevation) return [lvl(rows[0]), lvl(rows[0])];
  if (rows.length !== 2) return null;
  const below = rows.find(function (r) { return r.elevation && r.elevation.upper_bound !== undefined && r.elevation.lower_bound === undefined; });
  const above = rows.find(function (r) { return r.elevation && r.elevation.lower_bound !== undefined && r.elevation.upper_bound === undefined; });
  if (!below || !above || below.elevation.upper_bound !== above.elevation.lower_bound) return null;
  return [lvl(below), lvl(above)];
}

// Lawinenprobleme für die Anzeige. Mit problem_groups (SLF fasst Probleme gleichen Inhalts zusammen) je Gruppe mit Titel
// und einmalig angezeigten Kommentaren; sonst eine Gruppe ohne Titel. Probleme ohne Gruppe folgen am Ende.
export function problemGroups(bulletin) {
  const problems = bulletin.avalanche_problems;
  const used = new Set();
  const out = [];
  (bulletin.problem_groups || []).forEach(function (g) {
    const members = problems.filter(function (p, i) {
      const hit = !used.has(i) && g.types.indexOf(p.type) !== -1 && p.period === g.period;
      if (hit) used.add(i);
      return hit;
    });
    if (members.length) out.push({ title: g.title || null, problems: members });
  });
  const rest = problems.filter(function (p, i) { return !used.has(i); });
  if (rest.length) out.push({ title: out.length ? 'Weitere' : null, problems: rest });
  out.forEach(function (g) {
    const seen = new Set();
    g.comments = [];
    g.problems.forEach(function (p) {
      if (!p.comment) return;
      const key = JSON.stringify(p.comment);
      if (!seen.has(key)) { seen.add(key); g.comments.push(p.comment); }
    });
  });
  return out;
}

// Link auf den Lagebericht der Quelle; {main_date} wird durch das Hauptdatum ersetzt, sonst gilt der allgemeine Link
export function reportUrl(source, bulletin) {
  if (source.report_url.indexOf('{main_date}') === -1) return source.report_url;
  return bulletin && /^\d{4}-\d{2}-\d{2}$/.test(bulletin.main_date || '')
    ? source.report_url.replace('{main_date}', bulletin.main_date) : source.report_url_fallback;
}

const TIME_FORMAT = new Intl.DateTimeFormat('de-AT', {
  timeZone: 'Europe/Vienna', weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
});
const DAY_FORMAT = new Intl.DateTimeFormat('de-AT', {
  timeZone: 'Europe/Vienna', weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric'
});
export function formatTime(iso) { return TIME_FORMAT.format(new Date(iso)); }
export function formatDay(iso) { return DAY_FORMAT.format(new Date(iso)); }