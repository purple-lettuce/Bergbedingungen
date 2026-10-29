// Popup der Schutzgebiete als HTML-Text (reines Modul, kein DOM, kein Leaflet): Name, Kategorie, Beschreibung, Wildlife
// mit Symbolen und Regeln mit Symbolen. Alle Texte stammen aus der Datenquelle und werden maskiert.

import { esc } from './html.js';
import { wildlifeIcon, ruleInfo, splitSeason } from './popup_icons.js';

export const WILDLIFE_SHOWN = 12;   // so viele Einträge je Gruppe im Popup, der Rest als "und n weitere"

// Regeln als Liste mit Themensymbol und farbigem Rand (Verbot, eingeschränkt, erlaubt). Der Regeltext bleibt
// unverändert; ein Zeitraum am Ende steht in einer eigenen Zeile.
function rulesHtml(rules) {
  return "<p style=\"margin:6px 0 4px\"><b>Regeln:</b></p>" +
    "<ul class=\"pa-rules\">" +
    rules.map(function (t) {
      const info = ruleInfo(t);
      const parts = splitSeason(t);
      return "<li class=\"pa-rule " + info.kind + "\"><span class=\"pa-ico\" aria-hidden=\"true\">" + info.icon + "</span>" +
        "<span class=\"pa-rule-text\">" + esc(parts.main) +
        (parts.season ? " <span class=\"pa-season\">" + esc(parts.season) + "</span>" : "") + "</span></li>";
    }).join("") +
    "</ul>";
}

// Wildlife als Reihe kleiner Schilder mit Symbol und Name.
// entries: [{ name, type }], type = Art laut Datenquelle (FAUNA, FLORA, HABITAT) oder null.
function wildlifeHtml(title, entries, more) {
  return "<p style=\"margin:6px 0 4px\"><b>" + esc(title) + ":</b></p>" +
    "<ul class=\"pa-chips\">" +
    entries.map(function (e) {
      return "<li><span class=\"pa-ico\" aria-hidden=\"true\">" + wildlifeIcon(e.name, e.type) + "</span>" + esc(e.name) + "</li>";
    }).join("") +
    (more ? "<li class=\"pa-more\">und " + more + " weitere</li>" : "") +
    "</ul>";
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
export function areaPopup(p, geojson, categoryName) {
  const extra = extraPopupHtml(p, geojson);
  return {
    extra: extra,
    html: "<h3>" + esc(p.name || "") + "</h3>" +
      "<p><b>Kategorie:</b> " + esc(categoryName) + "</p>" +
      (p.summary ? "<p>" + esc(p.summary) + "</p>" : "") +
      extra
  };
}
