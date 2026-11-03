// Layout (D10): Ab 1200 px Breite und mit der Klasse `mr-floating` am body füllt die Karte die ganze Fläche,
// Seitenleistenkarten und Bedienfeld schweben darüber. Das Modul kennt keine Fachlogik; es sagt nur, ob dieses
// Layout gilt, und hält Leaflet passend zum Layout (Kartengröße, Abstand von Popups und Ansichtswechseln zu den Karten).
// Zurückrollen: Klasse `mr-floating` aus index.html entfernen, dann gilt überall das bisherige Layout.
// Leaflet (`L`) wird vorher über vendor/leaflet/leaflet.js global geladen.

var FLOATING_QUERY = '(min-width: 1200px)';   // wie im Stylesheet
var GAP = 12;   // Abstand zwischen einem Popup und den schwebenden Karten, in Pixeln

export function isFloating() {
  return document.body.classList.contains('mr-floating') && window.matchMedia(FLOATING_QUERY).matches;
}

// Auf FLOATING_QUERY reagieren (z. B. Fenster über die 1200 px ziehen); gibt die Abmeldung nicht zurück, die Ansicht lebt so lange wie die Seite.
export function onFloatingChange(fn) {
  var mq = window.matchMedia(FLOATING_QUERY);
  if (mq.addEventListener) mq.addEventListener('change', fn); else mq.addListener(fn);
}

// Von schwebenden Karten verdeckter Streifen am linken und rechten Kartenrand (Pixel, mit Abstand); außerhalb des Layouts 0.
export function floatingInsets(map) {
  var out = { left: 0, right: 0 };
  if (!isFloating()) return out;
  var m = map.getContainer().getBoundingClientRect();
  var side = document.querySelector('main > aside');
  var dock = document.querySelector('.kl-dock');
  if (side) out.left = Math.max(0, side.getBoundingClientRect().right - m.left) + GAP;
  if (dock) out.right = Math.max(0, m.right - dock.getBoundingClientRect().left) + GAP;
  return out;
}

// Popups nach dem Autopan nicht unter den schwebenden Karten stehen lassen: Standardabstand für alle Popups setzen
// (Popups erben ihn über das Prototyp-Objekt der Optionen, auch bereits gebundene).
function applyPopupPadding(map) {
  var i = floatingInsets(map);
  L.Popup.mergeOptions({
    autoPanPaddingTopLeft: i.left ? L.point(i.left, 5) : null,
    autoPanPaddingBottomRight: i.right ? L.point(i.right, 5) : null
  });
}

// Einmal nach dem Aufbau der Oberfläche aufrufen (app.js).
export function initFloatingLayout(map) {
  applyPopupPadding(map);
  map.on('resize', function () { applyPopupPadding(map); });
  // Die Karte hat bei Layoutänderungen ohne Fensterereignis (Schrift geladen, Statusleiste bricht um) sonst eine veraltete Größe.
  if (window.ResizeObserver) new ResizeObserver(function () { map.invalidateSize({ pan: false }); }).observe(map.getContainer());
}
