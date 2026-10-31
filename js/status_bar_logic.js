// Reine Logik der Datenstatus-Leiste (kein DOM, kein Leaflet): macht aus echten Werten der Module (Anzahl, Zeitstempel,
// Berichtsstatus) Zustand und Text. Es werden nur vorhandene Werte verwendet, nichts wird erfunden oder geschätzt.
// Zustände: 'ok' (geladen), 'limited' (geladen, aber eingeschränkt), 'unavailable' (nicht verfügbar oder noch nicht geladen),
// 'error' (Ladefehler, der auch sonst als Fehler angezeigt wird), 'loading' (wird geladen).

export const STALE_AFTER_HOURS = 48;   // zweimal HEARTBEAT_HOURS (24 h in scripts/fetch_closures.py): so alt darf closures.json höchstens werden
const TZ = 'Europe/Berlin';

function parts(date) {
  var o = {};
  new Intl.DateTimeFormat('de-DE', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })
    .formatToParts(date).forEach(function (p) { o[p.type] = p.value; });
  return o;
}

// Datum und Uhrzeit in Berliner Zeit: "heute 06:51", "29.10., 16:20" oder mit Jahr. Leer bei ungültigem Wert.
export function formatStand(value, now) {
  var d = new Date(value);
  if (!value || isNaN(d)) return '';
  var p = parts(d), n = parts(now);
  var time = p.hour + ':' + p.minute;
  if (p.year === n.year && p.month === n.month && p.day === n.day) return 'heute ' + time;
  return p.day + '.' + p.month + '.' + (p.year === n.year ? '' : p.year) + ', ' + time;
}

// Nur das Datum: "heute", "29.10." oder "02.05.2025".
export function formatDay(value, now) {
  var d = new Date(value);
  if (!value || isNaN(d)) return '';
  var p = parts(d), n = parts(now);
  if (p.year === n.year && p.month === n.month && p.day === n.day) return 'heute';
  return p.day + '.' + p.month + '.' + (p.year === n.year ? '' : p.year);
}

function plural(n, one, many) { return n.toLocaleString('de-DE') + ' ' + (n === 1 ? one : many); }

// Sperrungen und Hinweise: Anzahl der Einträge und Datenstand (data/closures.json, Feld "generated").
export function closuresStatus(count, generated, now) {
  if (!count) return { state: 'limited', text: 'Noch keine Einträge' };
  var stand = formatStand(generated, now);
  var text = plural(count, 'Eintrag', 'Einträge') + (stand ? ' · Stand ' + stand : '');
  var t = Date.parse(generated);
  if (!isNaN(t) && (now - t) / 3600000 > STALE_AFTER_HOURS) return { state: 'limited', text: text + ' · älter als ' + STALE_AFTER_HOURS + ' h' };
  return { state: 'ok', text: text };
}

// Schutzgebiete: nur die Anzahl; die GeoJSON-Datei trägt keinen Zeitstempel (siehe docs/DATENQUELLEN.md).
export function protectedAreasStatus(count) {
  if (!count) return { state: 'limited', text: 'Keine Gebiete geladen' };
  return { state: 'ok', text: plural(count, 'Gebiet', 'Gebiete') };
}

// Wetter: Zeitpunkt der aktuellen Werte laut Open-Meteo ("current.time", Ortszeit des Punkts, z. B. "2026-10-31T10:15").
export function weatherStatus(currentTime) {
  var m = /T(\d\d:\d\d)/.exec(currentTime || '');
  return m ? { state: 'ok', text: 'Stand ' + m[1] } : { state: 'ok', text: 'Geladen' };
}

// Lawinenlage: list = je geladener Quelle { status: 'valid' | 'stale' | 'expired' | 'none', published: ISO-Zeit des neuesten Berichts | null }.
export function avalancheStatus(list, failedCount, now) {
  var failed = failedCount ? ' · ' + (failedCount === 1 ? '1 Quelle' : failedCount + ' Quellen') + ' nicht geladen' : '';
  var valid = list.filter(function (s) { return s.status === 'valid'; });
  if (valid.length) {
    var newest = valid.map(function (s) { return s.published; }).filter(Boolean).sort().pop();
    var stand = formatStand(newest, now);
    return { state: failedCount ? 'limited' : 'ok', text: (stand ? 'Bericht ' + stand : 'Bericht aktuell') + failed };
  }
  if (list.some(function (s) { return s.status === 'stale'; })) return { state: 'limited', text: 'Bericht abgelaufen, neuer steht aus' + failed };
  var last = list.map(function (s) { return s.published; }).filter(Boolean).sort().pop();
  var day = last ? formatDay(last, now) : '';
  return { state: 'limited', text: 'Kein aktueller Bericht' + (day ? ' · zuletzt ' + day : '') + failed };
}
