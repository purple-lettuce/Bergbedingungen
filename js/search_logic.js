// Globale Suche (D13), reine Logik ohne DOM und Karte: Index aufbauen und durchsuchen.
// Gesucht wird nur in Texten, die schon geladen sind (Namen und Beschreibungen aus den eigenen Daten), keine Ortssuche.

export const MIN_CHARS = 2;    // darunter wird nicht gesucht
export const GROUP_LIMIT = 5;  // so viele Treffer je Gruppe stehen in der Trefferliste

// Kleinbuchstaben, ohne Akzente; "ß" wird zu "ss". So findet "schlern" auch "Schlern", "munchen" auch "München".
export function normalize(s) {
  return String(s == null ? '' : s).toLowerCase().replace(/ß/g, 'ss').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

// entries: [{ id, title, extra?, meta?, data? }]. title ist der Haupttext (wird zuerst verglichen), extra ein weiterer
// durchsuchter Text (z. B. Beschreibung oder Kategorie). Der Index hält die normalisierten Texte vor.
export function createIndex(entries) {
  return entries.map(function (e) {
    return { entry: e, t: normalize(e.title), x: normalize(e.extra || '') };
  });
}

// Rang eines Eintrags zur Suchanfrage: 0 = Titel beginnt mit der Anfrage, 1 = Titel enthält sie, 2 = Titel enthält alle
// Wörter, 3 = Titel und Zusatztext zusammen enthalten alle Wörter, -1 = kein Treffer.
export function rankOf(item, full, tokens) {
  var t = item.t;
  if (t.indexOf(full) === 0) return 0;
  if (t.indexOf(full) !== -1) return 1;
  if (tokens.every(function (w) { return t.indexOf(w) !== -1; })) return 2;
  var both = t + ' ' + item.x;
  if (tokens.every(function (w) { return both.indexOf(w) !== -1; })) return 3;
  return -1;
}

// Durchsucht den Index. opts.limit: höchstens so viele Einträge zurückgeben (Standard GROUP_LIMIT);
// opts.accept(entry): Einträge aussortieren (z. B. abgelaufene Sperrungen).
// Ergebnis: { total: Zahl aller Treffer, items: [entry] nach Rang, dann kürzerer Titel, dann alphabetisch }.
export function searchIndex(index, query, opts) {
  opts = opts || {};
  var limit = opts.limit || GROUP_LIMIT;
  var full = normalize(query).trim().replace(/\s+/g, ' ');
  if (full.length < MIN_CHARS) return { total: 0, items: [] };
  var tokens = full.split(' ');
  var hits = [];
  index.forEach(function (item) {
    if (opts.accept && !opts.accept(item.entry)) return;
    var r = rankOf(item, full, tokens);
    if (r !== -1) hits.push({ item: item, rank: r });
  });
  hits.sort(function (a, b) {
    return a.rank - b.rank || a.item.t.length - b.item.t.length || a.item.t.localeCompare(b.item.t, 'de');
  });
  return { total: hits.length, items: hits.slice(0, limit).map(function (h) { return h.item.entry; }) };
}