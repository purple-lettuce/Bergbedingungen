// Layout (D10, D11): Das Modul kennt keine Fachlogik; es sagt, welches Layout gilt, und hält Leaflet passend dazu
// (Kartengröße, Abstand von Popups und Ansichtswechseln zu allem, was die Karte überdeckt).
//  - Ab 1200 px und mit der Klasse `mr-floating` am body füllt die Karte die ganze Fläche, Seitenleistenkarten und Bedienfeld
//    schweben darüber (D10). Zurückrollen: Klasse `mr-floating` aus index.html entfernen.
//  - Bis 820 px gilt das mobile Layout (D11): Die Karte füllt den Raum unter der Statusleiste, die Seitenleiste ist ein Bottom Sheet
//    (js/sheet.js), das Bedienfeld „Karten & Layer“ ein Sheet über der Karte (js/layer_panel.js).
//  - Dazwischen gilt das klassische Layout (Karte neben fester Seitenleiste).
// Leaflet (`L`) wird vorher über vendor/leaflet/leaflet.js global geladen.

var FLOATING_QUERY = '(min-width: 1200px)';   // wie im Stylesheet
var MOBILE_QUERY = '(max-width: 820px)';      // wie im Stylesheet
var GAP = 12;   // Abstand zwischen einem Popup und den überdeckenden Karten, in Pixeln
var TOP_STRIP = 106;    // mobil: Streifen oben, den Popups frei lassen: Zoom (2 × 44 px) und Layer-Knopf
var POPUP_CHROME = 46;  // Höhe von Popup-Rand, Innenabstand und Spitze, die zur Inhaltshöhe dazukommt

function matches(query) { return window.matchMedia(query).matches; }
function onChange(query, fn) {
  var mq = window.matchMedia(query);
  if (mq.addEventListener) mq.addEventListener('change', fn); else mq.addListener(fn);
}

export function isFloating() {
  return document.body.classList.contains('mr-floating') && matches(FLOATING_QUERY);
}
export function isMobile() { return matches(MOBILE_QUERY); }

// Auf einen Wechsel des Layouts reagieren (z. B. Fenster über die 1200 px ziehen); gibt die Abmeldung nicht zurück, die Ansicht lebt so lange wie die Seite.
export function onFloatingChange(fn) { onChange(FLOATING_QUERY, fn); }
export function onMobileChange(fn) { onChange(MOBILE_QUERY, fn); }

// Von überdeckenden Karten belegte Streifen am Rand der Karte (Pixel, mit Abstand); ohne diese Layouts 0.
// Mobil gilt die Zielhöhe des Sheets (js/sheet.js hält sie in `--mr-sheet-h` an `main`), nicht die Höhe mitten in der Animation.
export function coveredInsets(map) {
  var out = { left: 0, right: 0, top: 0, bottom: 0 };
  var m = map.getContainer().getBoundingClientRect();
  if (isMobile()) {
    var sheet = parseFloat(document.querySelector('main').style.getPropertyValue('--mr-sheet-h')) || 0;
    var ctl = document.querySelector('.leaflet-bottom.leaflet-right');   // Legendenkarte und Quellenangabe über dem Sheet
    out.top = TOP_STRIP;
    out.bottom = sheet + (ctl ? ctl.offsetHeight : 0) + GAP;
    return out;
  }
  if (!isFloating()) return out;
  var side = document.querySelector('main > aside');
  var dock = document.querySelector('.kl-dock');
  if (side) out.left = Math.max(0, side.getBoundingClientRect().right - m.left) + GAP;
  if (dock) out.right = Math.max(0, m.right - dock.getBoundingClientRect().left) + GAP;
  return out;
}

// Ansicht auf einen Ausschnitt setzen, ohne ihn unter überdeckende Karten oder das Sheet zu legen (Liste der Sperrungen, globale Suche).
export function fitPadded(map, bounds, maxZoom) {
  var ins = coveredInsets(map);
  map.fitBounds(bounds, { maxZoom: maxZoom, paddingTopLeft: [40 + ins.left, 40 + ins.top], paddingBottomRight: [40 + ins.right, 40 + ins.bottom], animate: false });
}

// Popups nach dem Autopan nicht unter überdeckenden Karten stehen lassen: Standardabstand für alle Popups setzen
// (Popups erben ihn über das Prototyp-Objekt der Optionen, auch bereits gebundene). Mobil begrenzt `--mr-popup-max-h`
// zusätzlich die Höhe des Popup-Inhalts auf den freien Teil der Karte; der Inhalt scrollt dann im Popup.
export function refreshPopupLayout(map) {
  var i = coveredInsets(map);
  var any = i.left || i.right || i.top || i.bottom;
  L.Popup.mergeOptions({
    autoPanPaddingTopLeft: any ? L.point(i.left || 5, i.top || 5) : null,
    autoPanPaddingBottomRight: any ? L.point(i.right || 5, i.bottom || 5) : null
  });
  var main = document.querySelector('main');
  if (isMobile()) main.style.setProperty('--mr-popup-max-h', Math.max(120, map.getSize().y - i.top - i.bottom - POPUP_CHROME) + 'px');
  else main.style.removeProperty('--mr-popup-max-h');
}

// Einmal nach dem Aufbau der Oberfläche aufrufen (app.js).
export function initLayout(map) {
  refreshPopupLayout(map);
  map.on('resize', function () { refreshPopupLayout(map); });
  onMobileChange(function () { refreshPopupLayout(map); });
  // Die Karte hat bei Layoutänderungen ohne Fensterereignis (Schrift geladen, Statusleiste bricht um) sonst eine veraltete Größe.
  if (window.ResizeObserver) {
    new ResizeObserver(function () { map.invalidateSize({ pan: false }); }).observe(map.getContainer());
    // Mobil verdecken Legendenkarte und Quellenangabe unten rechts einen Teil der Karte; beide ändern ihre Höhe (Ebene ein, Legende auf),
    // ohne dass sich die Karte ändert. Die Popup-Ränder müssen dem folgen.
    var bottom = document.querySelector('.leaflet-bottom.leaflet-right');
    if (bottom) new ResizeObserver(function () { refreshPopupLayout(map); }).observe(bottom);
  }
}