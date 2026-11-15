// Reine Logik der lokalen Routenverwaltung (RI6, kein DOM, kein IndexedDB): Grenzen, Namen, Datensätze, Sortierung, Dateinamen, Fehlertexte.
// Gespeichert wird die Originaldatei als Text (verlustfrei, Export ohne Neuberechnung); die Route wird beim Öffnen neu gelesen.

export const MAX_ROUTES = 20;          // Anzahl gespeicherter Routen
export const MAX_NAME_LENGTH = 80;
export const LOCAL_ONLY_TEXT = 'Gespeicherte Routen liegen nur in diesem Browser auf diesem Gerät und werden nicht übertragen. ' +
  'Eine Browserbereinigung kann sie löschen; wichtige Routen daher als GPX exportieren.';

// Name aus Eingabe: Leerraum zusammenfassen, auf MAX_NAME_LENGTH kürzen; Ergebnis { ok, name, error }.
export function cleanName(input) {
  var name = String(input == null ? '' : input).replace(/\s+/g, ' ').trim();
  if (!name) return { ok: false, name: '', error: 'Bitte einen Namen eingeben.' };
  if (name.length > MAX_NAME_LENGTH) name = name.slice(0, MAX_NAME_LENGTH).trim();
  return { ok: true, name: name, error: null };
}

// Kann noch eine Route gespeichert werden? Ergebnis { ok, error }.
export function canSave(count) {
  if (count >= MAX_ROUTES) return { ok: false, error: 'Es sind höchstens ' + MAX_ROUTES + ' Routen speicherbar. Bitte zuerst eine Route löschen.' };
  return { ok: true, error: null };
}

// Kopfdatensatz (ohne Dateitext) für die Liste; Länge und Punktzahl stehen drin, damit die Liste nichts neu lesen muss.
export function makeMeta(id, name, route, bytes, now) {
  return { id: id, name: name, lengthM: route.lengthM, points: route.points.length, bytes: bytes, savedAt: now };
}

// Neueste zuerst; bei gleichem Zeitpunkt nach Name. Verändert die Eingabe nicht.
export function sortMetas(list) {
  return list.slice().sort(function (a, b) {
    return (b.savedAt - a.savedAt) || String(a.name).localeCompare(String(b.name), 'de');
  });
}

// Dateiname für den Export: unzulässige Zeichen ersetzen, nie leer, Endung .gpx.
export function exportFileName(name) {
  var base = String(name || '').replace(/[\\/:*?"<>|\u0000-\u001f]/g, '_').replace(/\s+/g, ' ').replace(/^[. ]+|[. ]+$/g, '');
  return (base.slice(0, 100) || 'Route') + '.gpx';
}

// Fehlertext für den Nutzer. err ist die Ausnahme aus dem Speicher (DOMException o. Ä.); unbekanntes wird allgemein beschrieben.
export function storeErrorText(err) {
  var n = err && err.name;
  if (n === 'QuotaExceededError') return 'Der Speicher des Browsers ist voll. Bitte Routen löschen oder den Browserspeicher freigeben.';
  if (n === 'NotSupportedError' || n === 'SecurityError' || n === 'InvalidStateError' || (err && err.code === 'unavailable')) {
    return 'Speichern ist in diesem Browser nicht verfügbar (z. B. im privaten Modus oder bei gesperrtem Speicher).';
  }
  if (err && err.code === 'missing') return 'Die gespeicherte Route wurde nicht gefunden.';
  return 'Die Route konnte nicht gespeichert werden.';
}

// Zeile der Liste: "12,3 km · gespeichert 15.11.2026"; formatKm kommt aus route_stats.js.
export function metaText(meta, formatKm) {
  var d = new Date(meta.savedAt);
  var date = d.getDate() + '.' + (d.getMonth() + 1) + '.' + d.getFullYear();
  return formatKm(meta.lengthM) + ' · gespeichert ' + date;
}
