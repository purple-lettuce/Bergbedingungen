// Kleine Anmeldestelle für Datenquellen, die "Entlang der Route" (RI8) auswerten kann. Module wie Schutzgebiete und Sperrungen melden hier,
// sobald ihre Daten geladen sind (oder das Laden gescheitert ist); route_context.js liest sie und reagiert auf Änderungen.
// Keine Abhängigkeit zu Karte oder Oberfläche, damit sich die Module nicht gegenseitig einbinden müssen.
//
// Quelle: { state: 'ready' | 'failed', features, describe(index), count, stand }
//   features:  GeoJSON-Features (Polygon, Linie, Punkt) der geladenen Daten
//   describe:  index → { key, title, meta, popupHtml, popupOptions } oder null (Eintrag zählt nicht, z. B. abgelaufen)
//   count, stand: für die Datenstand-Zeile (stand = Text oder leer)

var sources = {}, listeners = [];

export function setRouteSource(id, source) {
  sources[id] = source;
  listeners.slice().forEach(function (fn) { fn(id); });
}

export function getRouteSource(id) { return sources[id] || null; }

export function onRouteSource(fn) { listeners.push(fn); }
