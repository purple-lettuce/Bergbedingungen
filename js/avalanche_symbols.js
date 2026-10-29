// Gemeinsames Symbol- und Bezeichnungsmodell der Lawinenlage (reines Modul, kein DOM, kein Leaflet).
// Gefahrenstufen, Expositionen, Lawinenprobleme, Gefahrenmuster und Höhenangaben werden nur hier definiert. Die Darstellung
// hängt ausschließlich von diesen Werten ab, nie von der Datenquelle: Stufe 3 sieht für jede Quelle gleich aus.
// Deutsche Bezeichnungen: ALBINA-Übersetzungen (albina-website, app/i18n/caaml/de.json) und SLF-Schreibweise der Teilstufen.
// Piktogramme: vendor/albina/ (EAWS-Standard, Herkunft und Lizenzstand siehe vendor/albina/README.md).

import { esc } from './html.js';

export const ICON_BASE = 'vendor/albina/';

// ---------- Gefahrenstufen ----------

// Offizielle Farben der Europäischen Gefahrenskala (ALBINA, SLF-API-Hinweis "fill"); Stufe 5 zusätzlich als Schachbrett.
// css: Klasse für Stufenfeld und Legende in style.css
export const DANGER_LEVELS = {
  1: { level: 1, name: 'Gering', color: '#ccff66', css: 'av-lv1', checkered: false },
  2: { level: 2, name: 'Mäßig', color: '#ffff00', css: 'av-lv2', checkered: false },
  3: { level: 3, name: 'Erheblich', color: '#ff9900', css: 'av-lv3', checkered: false },
  4: { level: 4, name: 'Groß', color: '#ff0000', css: 'av-lv4', checkered: false },
  5: { level: 5, name: 'Sehr groß', color: '#ff0000', css: 'av-lv5', checkered: true }
};
export const LEVELS = [1, 2, 3, 4, 5];
export const VALUE_NAMES = { no_snow: 'Kein Schnee', no_rating: 'Keine Beurteilung' };
// Teilstufen (Schweiz): 3- (minus), 3= (neutral), 3+ (plus)
export const SUBDIVISION_SYMBOLS = { minus: '-', neutral: '=', plus: '+' };

// Darstellungsmodell einer Stufe oder null
export function dangerLevel(level) {
  return DANGER_LEVELS[level] || null;
}

// "3", "3+", "3=" oder "3-" (Teilstufe nur, wenn die Quelle sie liefert)
export function levelLabel(level, subdivision) {
  return level ? String(level) + (SUBDIVISION_SYMBOLS[subdivision] || '') : '';
}

export function ratingText(r) {
  return r.level ? 'Stufe ' + levelLabel(r.level, r.subdivision) + ' – ' + DANGER_LEVELS[r.level].name : (VALUE_NAMES[r.value] || r.value);
}

// Stufenfeld mit Zahl, Farbe über die Klasse des Stufenmodells
export function levelChip(level, subdivision, extraClass) {
  const model = dangerLevel(level);
  return model ? '<span class="av-chip ' + model.css + (extraClass ? ' ' + extraClass : '') + '" aria-hidden="true">' + esc(levelLabel(level, subdivision)) + '</span>' : '';
}

// ---------- Expositionen ----------

export const ASPECTS = [
  { id: 'N', name: 'Nord' }, { id: 'NE', name: 'Nord-Ost' }, { id: 'E', name: 'Ost' }, { id: 'SE', name: 'Süd-Ost' },
  { id: 'S', name: 'Süd' }, { id: 'SW', name: 'Süd-West' }, { id: 'W', name: 'West' }, { id: 'NW', name: 'Nord-West' }
];
export const ASPECT_NAMES = Object.fromEntries(ASPECTS.map(function (a) { return [a.id, a.name]; }));

// "Alle Expositionen" oder die Namen der Himmelsrichtungen
export function aspectsLabel(aspects) {
  return aspects.length === ASPECTS.length ? 'Alle Expositionen' : aspects.map(function (a) { return ASPECT_NAMES[a] || a; }).join(', ');
}

// Offizielles Piktogramm der Expositionen (ALBINA, albina-website exposition-icon.tsx), blau = betroffene Hangrichtungen
const ROSE_PATHS = {
  E: 'm49 25-7.071-7.071L24.959 25l16.97 7.071z', N: 'm25 .958 7.071 7.071L25 25 17.929 8.03z', NE: 'M42 8H32l-7 17 17-7z',
  NW: 'M8 8h10l7 17-17-7z', S: 'm25 49 7.071-7.071L25 24.959l-7.071 16.97z', SE: 'M42 42H32l-7-17 17 7z',
  SW: 'M8 42h10l7-17-17 7z', W: 'm.958 25 7.071-7.071L25 25 8.03 32.071z'
};
export function roseSvg(aspects) {
  const on = aspects.filter(function (a) { return ROSE_PATHS[a]; }).map(function (a) { return '<path d="' + ROSE_PATHS[a] + '" fill="#19abff"/>'; }).join('');
  return '<svg class="av-rose" viewBox="0 0 50 50" role="img" aria-label="Expositionen: ' + esc(aspects.map(function (a) { return ASPECT_NAMES[a] || a; }).join(', ')) + '">' + on +
    '<g fill="currentColor" font-size="8" font-weight="bold"><text x="22" y="13">N</text><text x="22.3" y="42">S</text></g>' +
    '<g fill="none" stroke="currentColor" stroke-width=".87" stroke-linejoin="round"><path d="m.958 25 7.071-7.071L25 25 8.03 32.071z"/><path d="m49 25-7.071-7.071L24.959 25l16.97 7.071z"/>' +
    '<path d="m25 .958 7.071 7.071L25 25 17.929 8.03z"/><path d="m25 49 7.071-7.071L24.959 24.959l-7.071 16.97z"/>' +
    '<path d="M42 8H32l-7 17 17-7zM8 42h10l7-17-17 7zm34 0H32l-7-17 17 7zM8 8h10l7 17-17-7z"/></g></svg>';
}

// ---------- Höhenangaben ----------

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

// Offizielles Piktogramm der Höhenlage (ALBINA, elevation-icon.tsx)
const BANDS = { low: 'm1 47 9-15h44l9 15z', middle: 'm9 33 10-17h26l10 17z', high: 'm19 17 7-12 4 6 6-10 9 16z' };
const VISIBLE = { above: ['middle', 'high'], below: ['low', 'middle'], all: ['low', 'middle', 'high'], middle: ['middle'] };
const LINES = { above: 'M10.6 32h54.4v1h-55z', below: 'M19.9 16h45.1v1H19.3z', all: '', middle: 'M10.6 32h54.4v1h-55zM19.9 16h45.1v1H19.3z' };
export function elevationSvg(el) {
  const where = elevationWhere(el);
  return '<svg class="av-elev" viewBox="0 0 65 48" role="img" aria-label="' + esc(elevationLabel(el)) + '">' +
    VISIBLE[where].map(function (b) { return '<path d="' + BANDS[b] + '" fill="#19abff"/>'; }).join('') +
    '<path d="m63 47.5-27-47-6 11-4-7-25 43z" fill="none" stroke="currentColor"/>' +
    (LINES[where] ? '<path d="' + LINES[where] + '" fill="currentColor"/>' : '') + '</svg>';
}

// ---------- Lawinenprobleme ----------

// icon: Piktogramm unter ICON_BASE. Unbekannte Typen (neue Quellen) erscheinen mit ihrer Kennung und ohne Piktogramm.
export const PROBLEM_TYPES = {
  new_snow: { name: 'Neuschnee', icon: 'problems/new_snow.webp' },
  wind_slab: { name: 'Triebschnee', icon: 'problems/wind_slab.webp' },
  persistent_weak_layers: { name: 'Altschnee', icon: 'problems/persistent_weak_layers.webp' },
  wet_snow: { name: 'Nassschnee', icon: 'problems/wet_snow.webp' },
  gliding_snow: { name: 'Gleitschnee', icon: 'problems/gliding_snow.webp' },
  favourable_situation: { name: 'Günstige Situation', icon: 'problems/favourable_situation.webp' },
  cornices: { name: 'Wechten', icon: 'problems/cornices.webp' },
  no_distinct_avalanche_problem: { name: 'Kein ausgeprägtes Lawinenproblem', icon: 'problems/no_distinct_avalanche_problem.webp' }
};

// { type, name, icon | null }
export function problemModel(type) {
  const known = PROBLEM_TYPES[type];
  return { type: type, name: known ? known.name : type, icon: known ? known.icon : null };
}

export const STABILITY_NAMES = { good: 'gut', fair: 'mittel', poor: 'schlecht', very_poor: 'sehr schlecht' };
export const FREQUENCY_NAMES = { none: 'keine', few: 'wenige', some: 'einige', many: 'viele' };
export const SIZE_NAMES = { 1: 'klein', 2: 'mittel', 3: 'groß', 4: 'sehr groß', 5: 'extrem' };

// ---------- Gefahrenmuster ----------

export const DANGER_PATTERNS = {
  DP1: 'Bodennahe Schwachschicht', DP2: 'Gleitschnee', DP3: 'Regen auf Schnee', DP4: 'Kalt auf warm / warm auf kalt',
  DP5: 'Schnee nach langer Kälteperiode', DP6: 'Lockerer Schnee und Wind', DP7: 'Schneearm neben schneereich',
  DP8: 'Eingeschneiter Oberflächenreif', DP9: 'Eingeschneiter Graupel', DP10: 'Frühjahrssituation'
};

// "GM 6: Lockerer Schnee und Wind"; unbekannte Kennungen erscheinen unverändert
export function dangerPatternLabel(id) {
  return DANGER_PATTERNS[id] ? 'GM ' + id.slice(2) + ': ' + DANGER_PATTERNS[id] : id;
}

// ---------- Zeiten und Textabschnitte ----------

export const PERIOD_NAMES = { all_day: 'Den ganzen Tag', earlier: 'Früher am Tag', later: 'Später am Tag' };
export const TENDENCY_NAMES = {
  decreasing: 'Lawinengefahr nimmt ab', steady: 'Lawinengefahr bleibt gleich', increasing: 'Lawinengefahr steigt'
};
export const SECTION_TITLES = {
  activity: 'Lawinensituation', snowpack: 'Schneedecke', weather_forecast: 'Wetter', weather_review: 'Wetterrückblick',
  travel_advisory: 'Tourenempfehlung'
};
