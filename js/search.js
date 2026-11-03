// Globale Suche (D13): Suchfeld im Header mit gruppierter Trefferliste (Combobox mit Listbox).
// Das Modul kennt keine Fachdaten: Es bekommt Quellen { id, label, search(q) -> { loaded, total, items: [{ id, title, meta }] }, open(id) }
// und zeigt je Quelle eine Gruppe. Gesucht wird nur in bereits geladenen Daten (js/search_logic.js), nichts geht ins Netz.
// Bedienung: Pfeil auf/ab wählt, Enter öffnet (ohne Auswahl den ersten Treffer), Esc schließt, ein Klick oder Tipp öffnet den Treffer.

import { MIN_CHARS } from './search_logic.js';

var HINT = 'Schutzgebiete, Sperrungen und Hinweise durchsuchen (mindestens ' + MIN_CHARS + ' Zeichen).';

function node(tag, cls, text) {
  var n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text != null) n.textContent = text;
  return n;
}

export function initSearch(sources) {
  var input = document.getElementById('gs');
  var panel = document.getElementById('gs-panel');
  var list = document.getElementById('gs-list');
  var note = document.getElementById('gs-note');
  if (!input || !panel || !list || !note) return;
  var options = [];   // sichtbare Treffer in Anzeigereihenfolge: { li, source, id }
  var active = -1;

  function isOpen() { return !panel.hidden; }
  function setOpen(on) {
    panel.hidden = !on;
    input.setAttribute('aria-expanded', on ? 'true' : 'false');
    if (!on) setActive(-1);
  }
  function setActive(i) {
    if (options[active]) { options[active].li.classList.remove('is-active'); options[active].li.setAttribute('aria-selected', 'false'); }
    active = i;
    if (options[i]) {
      var li = options[i].li;
      li.classList.add('is-active');
      li.setAttribute('aria-selected', 'true');
      input.setAttribute('aria-activedescendant', li.id);
      // nur die Trefferliste verschieben (kein scrollIntoView: das würde auch die Seite verschieben)
      if (li.offsetTop < panel.scrollTop) panel.scrollTop = li.offsetTop;
      else if (li.offsetTop + li.offsetHeight > panel.scrollTop + panel.clientHeight) panel.scrollTop = li.offsetTop + li.offsetHeight - panel.clientHeight;
    } else input.removeAttribute('aria-activedescendant');
  }

  function render() {
    var q = input.value.trim();
    list.textContent = '';
    options = [];
    active = -1;
    input.removeAttribute('aria-activedescendant');
    if (q.length < MIN_CHARS) { note.textContent = HINT; return; }
    var total = 0, pending = [];
    sources.forEach(function (s) {
      var res = s.search(q);
      if (!res.loaded) { pending.push(s.label); return; }
      total += res.total;
      if (!res.items.length) return;
      var g = node('li', 'mr-search__group');
      g.setAttribute('role', 'presentation');
      var head = node('div', 'mr-label mr-search__head', s.label + ' (' + res.total + ')');
      head.id = 'gs-g-' + s.id;
      var ul = node('ul', 'mr-search__items');
      ul.setAttribute('role', 'group');
      ul.setAttribute('aria-labelledby', head.id);
      res.items.forEach(function (it) {
        var li = node('li', 'mr-search__option');
        li.id = 'gs-o-' + s.id + '-' + options.length;
        li.setAttribute('role', 'option');
        li.setAttribute('aria-selected', 'false');
        li.appendChild(node('span', 'mr-search__title', it.title));
        if (it.meta) li.appendChild(node('span', 'mr-search__meta', it.meta));
        li.addEventListener('click', function () { choose(findIndex(li)); });
        ul.appendChild(li);
        options.push({ li: li, source: s, id: it.id });
      });
      g.append(head, ul);
      if (res.total > res.items.length) g.appendChild(node('div', 'mr-search__more', 'und ' + (res.total - res.items.length) + ' weitere, Suchbegriff genauer eingeben'));
      list.appendChild(g);
    });
    var msg = [];
    if (!total) msg.push('Keine Treffer für „' + q + '“.');
    if (pending.length) msg.push('Noch nicht geladen: ' + pending.join(', ') + '.');
    note.textContent = msg.join(' ');
  }
  function findIndex(li) { for (var i = 0; i < options.length; i++) if (options[i].li === li) return i; return -1; }

  function choose(i) {
    var o = options[i];
    if (!o) return;
    setOpen(false);
    input.blur();   // mobil schließt das die Bildschirmtastatur, die Karte ist frei
    o.source.open(o.id);
  }

  input.addEventListener('input', function () { render(); setOpen(true); });
  input.addEventListener('focus', function () { render(); setOpen(true); });
  input.addEventListener('click', function () { if (!isOpen()) { render(); setOpen(true); } });   // nach Esc ist das Feld noch im Fokus
  input.addEventListener('keydown', function (ev) {
    if (ev.key === 'ArrowDown' || ev.key === 'ArrowUp') {
      ev.preventDefault();
      if (!isOpen()) { render(); setOpen(true); }
      if (!options.length) return;
      var step = ev.key === 'ArrowDown' ? 1 : -1;
      setActive(active === -1 ? (step === 1 ? 0 : options.length - 1) : (active + step + options.length) % options.length);
    } else if (ev.key === 'Enter') {
      if (!isOpen() || !options.length) return;
      ev.preventDefault();
      choose(active === -1 ? 0 : active);
    } else if (ev.key === 'Escape' && isOpen()) {
      ev.preventDefault();   // der erste Esc schließt nur die Liste und lässt den Suchtext stehen
      setOpen(false);
    }
  });
  // Fokus bleibt im Feld, wenn in die Liste geklickt oder getippt wird (sonst schließt der Fokusverlust sie vor dem Klick)
  panel.addEventListener('pointerdown', function (ev) { ev.preventDefault(); });
  document.addEventListener('pointerdown', function (ev) { if (isOpen() && !ev.target.closest('.mr-search')) setOpen(false); });
  input.addEventListener('blur', function () { setOpen(false); });
}