// Popup der Schutzgebiete als HTML-Text (reines Modul, kein DOM, kein Leaflet): Name, Kategorie, Beschreibung, Wildlife
// mit Symbolen und Regeln mit Symbolen. Alle Texte stammen aus der Datenquelle und werden maskiert.

import { esc } from './html.js';
import { wildlifeIcon, ruleInfo, splitSeason } from './popup_icons.js';

export const WILDLIFE_SHOWN = 12;   // so viele Einträge je Gruppe im Popup, der Rest als "und n weitere"

// Art der Regel (aus ruleInfo) als Statusschild: gleiche Einteilung und Farben wie bisher
// (Verbot = rot, eingeschränkt = gelb, erlaubt = grün); sonstige Regeln bekommen kein Schild.
const RULE_BADGES = {
  ban: { cls: "mr-badge--closure", text: "Verbot" },
  limit: { cls: "mr-badge--notice", text: "Eingeschränkt" },
  allow: { cls: "mr-badge--success", text: "Erlaubt" }
};

// Abschnitt im Popup: Mikro-Titel und Inhalt.
function sectionHtml(title, inner) {
  return "<section class=\"mr-stack mr-gap-xs\"><h4 class=\"mr-label\">" + esc(title) + "</h4>" + inner + "</section>";
}

// Regeln als Liste mit Themensymbol, Statusschild und farbigem Rand (Verbot, eingeschränkt, erlaubt). Der Regeltext
// bleibt unverändert; ein Zeitraum am Ende steht in einer eigenen Zeile.
function rulesHtml(rules) {
  return sectionHtml("Regeln",
    "<ul class=\"pa-rules mr-stack mr-gap-xs\">" +
    rules.map(function (t) {
      const info = ruleInfo(t);
      const parts = splitSeason(t);
      const badge = RULE_BADGES[info.kind];
      return "<li class=\"pa-rule " + info.kind + "\"><span class=\"pa-ico\" aria-hidden=\"true\">" + info.icon + "</span>" +
        "<span class=\"pa-rule-text\">" +
        (badge ? "<span class=\"mr-badge " + badge.cls + "\">" + badge.text + "</span> " : "") +
        esc(parts.main) +
        (parts.season ? "<span class=\"pa-season\">" + esc(parts.season) + "</span>" : "") + "</span></li>";
    }).join("") +
    "</ul>");
}

// Wildlife als Reihe kleiner Schilder mit Symbol und Name.
// entries: [{ name, type }], type = Art laut Datenquelle (FAUNA, FLORA, HABITAT) oder null.
function wildlifeHtml(title, entries, more) {
  return sectionHtml(title,
    "<ul class=\"pa-chips mr-cluster mr-gap-xs\">" +
    entries.map(function (e) {
      return "<li><span class=\"pa-ico\" aria-hidden=\"true\">" + wildlifeIcon(e.name, e.type) + "</span>" + esc(e.name) + "</li>";
    }).join("") +
    (more ? "<li class=\"pa-more\">und " + more + " weitere</li>" : "") +
    "</ul>");
}

// Wildlife und Regeln aus den Index-Tabellen der GeoJSON-Datei (siehe scripts/build_geojson.py).
// Ältere Dateien ohne diese Felder liefern einen leeren Text, das Popup bleibt dann wie bisher.
// Tiere (FAUNA oder Art unbekannt) stehen unter "Wildlife", Pflanzen und Lebensräume getrennt darunter.
export function extraPopupHtml(p, geojson) {
  let html = "";

  const entries = (p.w || [])
    .map(function (i) { return { name: (geojson.wildlife_names || [])[i], type: (geojson.wildlife_types || [])[i] || null }; })
    .filter(function (e) { return e.name; });
  const animals = entries.filter(function (e) { return e.type !== "FLORA" && e.type !== "HABITAT"; });
  const plants = entries.filter(function (e) { return e.type === "FLORA" || e.type === "HABITAT"; });
  [["Wildlife", animals], ["Pflanzen und Lebensräume", plants]].forEach(function (g) {
    if (g[1].length) html += wildlifeHtml(g[0], g[1].slice(0, WILDLIFE_SHOWN), Math.max(0, g[1].length - WILDLIFE_SHOWN));
  });

  const rules = (p.r || [])
    .map(function (i) { return (geojson.rule_texts || [])[i]; })
    .filter(Boolean);
  if (rules.length) html += rulesHtml(rules);

  return html;
}

// Gesamtes Popup eines Schutzgebiets. extra: Wildlife und Regeln (leer bei Gebieten ohne diese Angaben).
// Kopf: Farbfeld der Kategorie (wie in der Legende; style = Leaflet-Pfadstil, optional), Name, Schutzgebietstyp.
export function areaPopup(p, geojson, categoryName, style) {
  const extra = extraPopupHtml(p, geojson);
  const swatch = style
    ? "<span class=\"pa-sw pa-pop-sw\" aria-hidden=\"true\" style=\"border-color:" + esc(style.color) + "\">" +
      "<i style=\"background:" + esc(style.fillColor) + ";opacity:" + esc(Math.min(1, style.fillOpacity * 2.5)) + "\"></i></span>"
    : "";
  return {
    extra: extra,
    html: "<div class=\"pa-pop mr-stack mr-gap-sm\">" +
      "<div class=\"pa-pop-head\">" + swatch +
      "<div class=\"mr-stack mr-gap-xs\"><h3>" + esc(p.name || "") + "</h3>" +
      "<p class=\"mr-label pa-pop-type\">" + esc(categoryName) + "</p></div></div>" +
      (p.summary ? "<p class=\"pa-pop-summary\">" + esc(p.summary) + "</p>" : "") +
      extra +
      "</div>"
  };
}
