// Bedienfeld "Karten & Layer": die einzige Stelle für Kartenstil, Ebenen, Filter und Legenden.
// Alles wird per Klick bedient (kein Hover), auch auf Touchgeräten. Das Feld kennt keine Fachlogik:
// Ebenen, Kartenstile, Filter und Legenden werden in js/layers.js eingetragen.

import { isFloating, onFloatingChange } from './layout.js';

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
    var btn = make('button', 'kl-toggle mr-label');
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

  // Schalter (D3 .mr-switch) mit unveränderter Checkbox; gibt { label, input, text } zurück.
  function makeSwitch(extraCls) {
    var lab = make('label', 'mr-switch ' + (extraCls || ''));
    var input = make('input');
    input.type = 'checkbox';
    input.setAttribute('role', 'switch');
    var track = make('span', 'mr-switch__track');
    track.setAttribute('aria-hidden', 'true');
    var text = make('span', 'mr-switch__text');
    lab.appendChild(input);
    lab.appendChild(track);
    lab.appendChild(text);
    return { label: lab, input: input, text: text };
  }

  // Reihenfolge der Abschnitte: Layer, Kartenstil, danach Filter und Legenden in der Reihenfolge ihrer Anmeldung.
  var layerContent = addSection('Layer', true);
  var summary = make('p', 'mr-label kl-summary');   // „Aktive Overlays · N aktiv“, gezählt aus dem Kartenzustand
  summary.setAttribute('role', 'status');
  var layerList = make('ul', 'kl-options mr-stack mr-gap-sm');
  layerContent.appendChild(summary);
  layerContent.appendChild(layerList);
  var overlays = [];
  function updateSummary() {
    var n = overlays.filter(function (l) { return map.hasLayer(l); }).length;
    summary.textContent = 'Aktive Overlays · ' + n + ' aktiv';
  }
  var styleList = make('div', 'mr-segment kl-segment');   // Kartenstil als Segment-Control
  styleList.setAttribute('role', 'radiogroup');
  styleList.setAttribute('aria-label', 'Kartenstil');
  addSection('Kartenstil', true).appendChild(styleList);

  var basemaps = [];

  // Legendenkarte (D9): eigene Karte, einklappbar; sie zeigt nur Legenden eingeblendeter Ebenen.
  var legendCard = make('div', 'mr-card mr-card--raised kl-card');
  legendCard.hidden = true;
  // Anordnung (D10): Im Layout mit schwebenden Karten sitzt die Legende im selben Dock wie das Bedienfeld, direkt darunter
  // (dort kann sie das Bedienfeld nicht überdecken); sonst bleibt sie als eigenes Kartenelement unten rechts.
  var dock = make('div', 'kl-dock');
  var cardHost = make('div', 'kl-card-host');
  dock.appendChild(box);
  function placeLegend() { (isFloating() ? dock : cardHost).appendChild(legendCard); }
  var cardHead = make('button', 'kl-card-head mr-label');
  cardHead.type = 'button';
  cardHead.textContent = 'Legende';
  var cardList = make('div', 'kl-card-list mr-stack');
  cardList.id = 'kl-card-list';
  legendCard.appendChild(cardHead);
  legendCard.appendChild(cardList);
  bindToggle(cardHead, cardList, isFloating());   // im Dock zunächst offen, als Kartenelement unten rechts zunächst zu
  placeLegend();
  onFloatingChange(placeLegend);

  var panel = {
    // Kartenstil: genau einer ist aktiv.
    addBaseLayer: function (label, layer) {
      var opt = make('label', 'mr-segment__opt');
      var input = make('input');
      input.type = 'radio';
      input.name = 'kl-basemap';
      var span = make('span');
      span.textContent = label;
      opt.appendChild(input);
      opt.appendChild(span);
      styleList.appendChild(opt);
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
      var li = make('li');
      var card = make('div', 'mr-card mr-card--tight kl-layer');
      var sw = makeSwitch('kl-opt');
      sw.text.textContent = label;
      var badge = make('span', 'mr-badge');
      card.appendChild(sw.label);
      card.appendChild(badge);
      li.appendChild(card);
      layerList.appendChild(li);
      var input = sw.input;
      overlays.push(layer);
      function sync() {
        var on = map.hasLayer(layer);
        input.checked = on;
        card.classList.toggle('is-on', on);
        badge.className = 'mr-badge' + (on ? ' mr-badge--success' : '');
        badge.textContent = on ? 'Aktiv' : 'Aus';
        updateSummary();
      }
      sync();
      input.addEventListener('change', function () {
        if (input.checked) map.addLayer(layer); else map.removeLayer(layer);
      });
      layer.on('add remove', sync);
    },

    // Legende als eingeklappter Abschnitt; mit `layer` weist sie darauf hin, solange die Ebene ausgeblendet ist.
    // Gibt { element, setContent(html | Node), setCompact(html | Node) } zurück; setCompact füllt die kompakte
    // Legendenkarte unten rechts (D9), die nur Legenden eingeblendeter Ebenen zeigt.
    addLegend: function (title, layer) {
      var content = addSection(title, false);
      var cardSec = make('section', 'kl-card-sec');
      var cardTitle = make('p', 'mr-label kl-card-title');
      cardTitle.textContent = title.replace(/^Legende /, '');
      var cardBody = make('div', 'kl-card-body');
      cardSec.appendChild(cardTitle);
      cardSec.appendChild(cardBody);
      cardSec.hidden = true;
      cardList.appendChild(cardSec);
      function syncCard() {
        cardSec.hidden = !cardBody.hasChildNodes() || (!!layer && !map.hasLayer(layer));
        legendCard.hidden = !cardList.querySelector('.kl-card-sec:not([hidden])');
      }
      if (layer) layer.on('add remove', syncCard);
      if (layer) {
        var hint = make('p', 'kl-off mr-card mr-card--tight mr-text-muted mr-text-sm');
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
        },
        setCompact: function (c) {
          if (typeof c === 'string') cardBody.innerHTML = c;
          else cardBody.replaceChildren(c);
          syncCard();
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
        var hint = make('p', 'kl-off mr-card mr-card--tight mr-text-muted mr-text-sm');
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
          var p = make('p', 'mr-text-muted mr-text-sm mr-m-0');
          p.textContent = text;
          inner.replaceChildren(p);
        },
        setItems: function (items, onChange) {
          var bar = make('div', 'kl-filter-bar');
          var status = make('span', 'kl-filter-status mr-text-muted');
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
          var list = make('ul', 'kl-options mr-stack mr-gap-xs');
          var inputs = [];

          function updateStatus() {
            var n = inputs.filter(function (i) { return i.input.checked; }).length;
            status.textContent = n === inputs.length ? 'Alle ' + n + ' sichtbar' : n + ' von ' + inputs.length + ' sichtbar';
          }
          items.forEach(function (item) {
            var li = make('li');
            var sw = makeSwitch('kl-opt');
            var lab = sw.label;
            var input = sw.input;
            input.checked = true;
            if (item.swatch) lab.insertBefore(item.swatch, sw.text);
            sw.text.classList.add('kl-opt-label');
            sw.text.textContent = item.label;
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
    L.DomEvent.disableClickPropagation(dock);
    L.DomEvent.disableScrollPropagation(dock);
    return dock;
  };
  control.addTo(map);

  var cardControl = L.control({ position: 'bottomright' });
  cardControl.onAdd = function () {
    L.DomEvent.disableClickPropagation(cardHost);
    L.DomEvent.disableScrollPropagation(cardHost);
    return cardHost;
  };
  cardControl.addTo(map);

  return panel;
}