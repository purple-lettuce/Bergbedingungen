// Bedienfeld "Karten & Layer": die einzige Stelle für Kartenstil, Ebenen und Legenden.
// Alles wird per Klick bedient (kein Hover), auch auf Touchgeräten. Das Feld kennt keine Fachlogik:
// Ebenen, Kartenstile und Legenden werden in js/layers.js eingetragen.

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

  // Reihenfolge der Abschnitte: Layer, Kartenstil, danach die Legenden in der Reihenfolge ihrer Anmeldung.
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