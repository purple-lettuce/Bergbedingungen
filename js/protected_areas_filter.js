// Filter der Schutzgebiete nach Kategorie. Der Filter ist ein Abschnitt im Bedienfeld "Karten & Layer" (js/layers.js,
// js/layer_panel.js); dieses Modul enthält nur die Filterlogik und kennt weder das Bedienfeld noch die Karte.
//
// Die Schutzgebiets-Ebene wird nicht neu geladen oder neu gezeichnet: Beim Ein- und Ausschalten einer Kategorie werden
// nur die vorhandenen Flächen aus der GeoJSON-Ebene entnommen bzw. wieder eingesetzt. Dadurch bleibt der Zustand beim
// Zoomen und Verschieben erhalten, und er gilt auch, wenn die Ebene "Schutzgebiete" aus- und wieder eingeschaltet wird.

// geoLayer: L.geoJSON-Ebene aller Schutzgebiete
// layersByCategory: { Kategorie-ID: [Flächen-Ebenen] }
export function createCategoryFilter(geoLayer, layersByCategory) {
  var hidden = {};   // Kategorie-ID -> true, solange ausgeblendet

  return {
    isVisible: function (id) { return !hidden[id]; },
    // Blendet die Flächen einer Kategorie ein oder aus; gibt die Zahl der betroffenen Flächen zurück.
    setVisible: function (id, on) {
      if (!!hidden[id] === !on) return 0;
      var layers = layersByCategory[id] || [];
      layers.forEach(function (l) {
        if (on) geoLayer.addLayer(l);
        else geoLayer.removeLayer(l);
      });
      if (on) delete hidden[id]; else hidden[id] = true;
      return layers.length;
    }
  };
}

// Farbfeld einer Kategorie (Rand- und Füllfarbe wie auf der Karte) als DOM-Knoten für den Filter im Bedienfeld.
export function swatchNode(style) {
  var sw = document.createElement('span');
  sw.className = 'pa-sw';
  sw.style.borderColor = style.color;
  var fill = document.createElement('i');
  fill.style.background = style.fillColor;
  fill.style.opacity = String(Math.min(1, style.fillOpacity * 2.5));
  sw.appendChild(fill);
  return sw;
}

// section: Abschnitt aus panel.addFilter(...), entries: [{ id, label, count, style }] wie bei der Legende
export function bindCategoryFilter(section, geoLayer, layersByCategory, entries) {
  var filter = createCategoryFilter(geoLayer, layersByCategory);
  section.setItems(entries.map(function (e) {
    return { id: e.id, label: e.label, count: e.count, swatch: swatchNode(e.style) };
  }), function (id, on) { filter.setVisible(id, on); });
  return filter;
}
