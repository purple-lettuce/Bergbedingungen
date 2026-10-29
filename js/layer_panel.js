// Bedienfeld "Karten & Layer": die einzige Stelle für Kartenstil, Ebenen, Filter und Legenden.
// Alles wird per Klick bedient (kein Hover), auch auf Touchgeräten. Das Feld kennt keine Fachlogik:
// Ebenen, Kartenstile, Filter und Legenden werden in js/layers.js eingetragen.

var MOBILE_QUERY = '(max-width: 820px)';   // wie im Stylesheet: Seitenleiste unter der Karte
var counter = 0;

function make(tag, cls) {
  var n = document.createElement(tag);
  if (cls) n.className = cls;
  return n;
}

// Knopf klappt das Ziel ein und aus; aria-expanded und hidden bleiben synchron.
function bindToggle(btn, target, open) {
  btn.setAttribute('aria-controls', target.id);
  function set(show) {
    target.hidden = !show;
    btn.setAttribute('aria-expanded', String(show));
  }
  set(open);
  btn.addEventListener('click', function () { set(target.hidden); });
}

export function createLayerPanel(map) {
  var box = make('div', 'kl-panel');
  var head = make('button', 'kl-head');
  head.type = 'button';
  head.textContent = 'Karten & Layer';
  var body = make('div', 'kl-body');
  body.id = 'kl-body';
  box.appendChild(head);
  box.appendChild(body);
  bindToggle(head, body, !window.matchMedia(MOBILE_QUERY).matches);   // am Handy zunächst zu, damit die Karte frei bleibt

  // Ein einklappbarer Abschnitt; gibt den Inhaltsbereich zurück.
  function addSection(title, open) {
    var sec = make('section', 'kl-sec');
    var h = make('h3', 'kl-h');
    var btn = make('button', 'kl-toggle');
    btn.type = 'button';
    btn.textContent = title;
    var content = make('div', 'kl-content');
    content.id = 'kl-sec-' + (++counter);
    h.appendChild(btn);
    sec.appendChild(h);
    sec.appendChild(content);
    body.appendChild(sec);
    bindToggle(btn, content, open);
    return content;
  }

  function addOption(list, type, name, label) {
    var li = make('li');
    var lab = make('label', 'kl-opt');
    var input = make('input');
    input.type = type;
    if (name) input.name = name;
    var text = make('span');
    text.textContent = label;
    lab.appendChild(input);
    lab.appendChild(text);
    li.appendChild(lab);
    list.appendChild(li);
    return input;
  }

  // Reihenfolge der Abschnitte: Layer, Kartenstil, danach Filter und Legenden in der Reihenfolge ihrer Anmeldung.
  var layerList = make('ul', 'kl-options');
  addSection('Layer', true).appendChild(layerList);
  var styleList = make('ul', 'kl-options');
  addSection('Kartenstil', true).appendChild(styleList);

  var basemaps = [];

  var panel = {
    // Kartenstil: genau einer ist aktiv.
    addBaseLayer: function (label, layer) {
      var input = addOption(styleList, 'radio', 'kl-basemap', label);
      input.checked = map.hasLayer(layer);
      basemaps.push(layer);
      input.addEventListener('change', function () {
        if (!input.checked) return;
        basemaps.forEach(function (b) { if (b !== layer && map.hasLayer(b)) map.removeLayer(b); });
        map.addLayer(layer);
      });
      layer.on('add', function () { input.checked = true; });
    },

    // Ebene: unabhängig ein- und ausblendbar.
    addOverlay: function (label, layer) {
      var input = addOption(layerList, 'checkbox', null, label);
      function sync() { input.checked = map.hasLayer(layer); }
      sync();
      input.addEventListener('change', function () {
        if (input.checked) map.addLayer(layer); else map.removeLayer(layer);
      });
      layer.on('add remove', sync);
    },

    // Legende als eingeklappter Abschnitt; mit `layer` weist sie darauf hin, solange die Ebene ausgeblendet ist.
    // Gibt { element, setContent(html | Node) } zurück.
    addLegend: function (title, layer) {
      var content = addSection(title, false);
      if (layer) {
        var hint = make('p', 'kl-off muted');
        hint.textContent = 'Diese Ebene ist ausgeblendet. Unter „Layer“ einschalten.';
        content.appendChild(hint);
        var sync = function () { hint.hidden = map.hasLayer(layer); };
        sync();
        layer.on('add remove', sync);
      }
      var inner = make('div', 'kl-legend');
      content.appendChild(inner);
      return {
        element: inner,
        setContent: function (c) {
          if (typeof c === 'string') inner.innerHTML = c;
          else inner.replaceChildren(c);
        }
      };
    },

    // Filter zu einer Ebene als eingeklappter Abschnitt mit einem Schalter je Eintrag (Kategorie, Art, ...).
    // Das Feld hält keinen Zustand außer den Schaltern selbst und kennt die Fachlogik nicht: Bei jeder Änderung
    // ruft es onChange(id, an) auf. Gibt { setMessage(text), setItems(items, onChange) } zurück;
    // items = [{ id, label, count?, swatch? (DOM-Knoten) }], zu Beginn sind alle Einträge an.
    addFilter: function (title, layer) {
      var content = addSection(title, false);
      if (layer) {
        var hint = make('p', 'kl-off muted');
        hint.textContent = 'Diese Ebene ist ausgeblendet. Der Filter gilt, sobald sie unter „Layer“ eingeschaltet wird.';
        content.appendChild(hint);
        var syncHint = function () { hint.hidden = map.hasLayer(layer); };
        syncHint();
        layer.on('add remove', syncHint);
      }
      var inner = make('div', 'kl-filter');
      content.appendChild(inner);
      return {
        element: inner,
        setMessage: function (text) {
          var p = make('p', 'muted');
          p.textContent = text;
          inner.replaceChildren(p);
        },
        setItems: function (items, onChange) {
          var bar = make('div', 'kl-filter-bar');
          var status = make('span', 'kl-filter-status muted');
          status.setAttribute('role', 'status');
          var all = make('button', 'kl-link');
          all.type = 'button';
          all.textContent = 'Alle';
          var none = make('button', 'kl-link');
          none.type = 'button';
          none.textContent = 'Keine';
          bar.appendChild(status);
          bar.appendChild(all);
          bar.appendChild(none);
          var list = make('ul', 'kl-options');
          var inputs = [];

          function updateStatus() {
            var n = inputs.filter(function (i) { return i.input.checked; }).length;
            status.textContent = n === inputs.length ? 'Alle ' + n + ' sichtbar' : n + ' von ' + inputs.length + ' sichtbar';
          }
          items.forEach(function (item) {
            var li = make('li');
            var lab = make('label', 'kl-opt');
            var input = make('input');
            input.type = 'checkbox';
            input.checked = true;
            lab.appendChild(input);
            if (item.swatch) lab.appendChild(item.swatch);
            var text = make('span', 'kl-opt-label');
            text.textContent = item.label;
            lab.appendChild(text);
            if (item.count !== undefined) {
              var count = make('span', 'kl-count');
              count.textContent = '(' + item.count + ')';
              lab.appendChild(count);
            }
            li.appendChild(lab);
            list.appendChild(li);
            input.addEventListener('change', function () { updateStatus(); onChange(item.id, input.checked); });
            inputs.push({ id: item.id, input: input });
          });
          function setAll(on) {
            inputs.forEach(function (i) {
              if (i.input.checked === on) return;
              i.input.checked = on;
              onChange(i.id, on);
            });
            updateStatus();
          }
          all.addEventListener('click', function () { setAll(true); });
          none.addEventListener('click', function () { setAll(false); });
          updateStatus();
          inner.replaceChildren(bar, list);
        }
      };
    }
  };

  var control = L.control({ position: 'topright' });
  control.onAdd = function () {
    L.DomEvent.disableClickPropagation(box);
    L.DomEvent.disableScrollPropagation(box);
    return box;
  };
  control.addTo(map);

  return panel;
}