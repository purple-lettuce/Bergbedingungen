// HTML-Maskierung ohne Abhängigkeiten. Alle Module, die Text aus Daten in Markup setzen, nutzen diese Funktion
// (map.js exportiert sie weiter). Eigene Datei, damit reine Module (Popup, Symbole) ohne Karte geladen und getestet werden können.

export function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
  });
}
