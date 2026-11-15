// Liste "Meine Routen" (RI6): gespeicherte Routen öffnen, umbenennen, als GPX exportieren und löschen.
// Alles bleibt im Browser (IndexedDB über route_store.js). Namen stehen nur über textContent in der Seite.
// Fehler gehen über hooks.error(text); die Liste selbst trifft keine Aussage über die geöffnete Route (das macht route.js über hooks).

import { store } from './route_store.js';
import { sortMetas, cleanName, exportFileName, storeErrorText, metaText, LOCAL_ONLY_TEXT } from './route_store_logic.js';
import { formatKm } from './route_stats.js';

function el(tag, cls, text) {
  var e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text != null) e.textContent = text;
  return e;
}

// hooks: open(meta), renamed(id, name), removed(id), error(text)
export function createSaved(wrap, list, note, hooks) {
  var metas = [], currentId = null, renamingId = null;
  note.textContent = LOCAL_ONLY_TEXT;

  function button(label, aria, onClick) {
    var b = el('button', null, label);
    b.type = 'button';
    b.setAttribute('aria-label', aria);
    b.addEventListener('click', onClick);
    return b;
  }

  function fail(err) { hooks.error(storeErrorText(err)); }

  function exportRoute(meta) {
    store.getFile(meta.id).then(function (text) {
      var url = URL.createObjectURL(new Blob([text], { type: 'application/gpx+xml' }));
      var a = document.createElement('a');
      a.href = url;
      a.download = exportFileName(meta.name);
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(function () { URL.revokeObjectURL(url); }, 10000);
    }).catch(fail);
  }

  function removeRoute(meta) {
    if (!window.confirm('Die Route „' + meta.name + '“ von diesem Gerät löschen?')) return;
    store.remove(meta.id).then(function () { hooks.removed(meta.id); return refresh(); }).catch(fail);
  }

  function renameForm(meta) {
    var form = el('form', 'mr-cluster mr-gap-xs');
    var input = el('input');
    input.type = 'text';
    input.value = meta.name;
    input.maxLength = 80;
    input.setAttribute('aria-label', 'Neuer Name für ' + meta.name);
    input.style.flex = '1';
    input.style.minWidth = '8em';
    var ok = el('button', null, 'Speichern');
    ok.type = 'submit';
    var cancel = button('Abbrechen', 'Umbenennen abbrechen', function () { renamingId = null; render(); });
    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var c = cleanName(input.value);
      if (!c.ok) { hooks.error(c.error); return; }
      store.rename(meta.id, c.name).then(function () { renamingId = null; hooks.renamed(meta.id, c.name); return refresh(); }).catch(fail);
    });
    form.addEventListener('keydown', function (ev) { if (ev.key === 'Escape') { renamingId = null; render(); } });
    form.append(input, ok, cancel);
    setTimeout(function () { input.focus(); input.select(); }, 0);
    return form;
  }

  function render() {
    list.replaceChildren();
    metas.forEach(function (meta) {
      var li = el('li', 'mr-saved__item mr-stack mr-gap-xs');
      var head = el('div', 'mr-stack mr-gap-xs');
      head.append(el('span', 'mr-saved__name', meta.name), el('span', 'mr-text-muted mr-text-sm', metaText(meta, formatKm)));
      li.append(head);
      if (renamingId === meta.id) { li.append(renameForm(meta)); list.append(li); return; }
      var actions = el('div', 'mr-cluster mr-gap-xs');
      if (meta.id === currentId) {
        var cur = el('span', 'mr-badge', 'Geöffnet');
        actions.append(cur);
      } else {
        actions.append(button('Öffnen', 'Route ' + meta.name + ' öffnen', function () { hooks.open(meta); }));
      }
      actions.append(
        button('Umbenennen', 'Route ' + meta.name + ' umbenennen', function () { renamingId = meta.id; render(); }),
        button('Exportieren', 'Route ' + meta.name + ' als GPX exportieren', function () { exportRoute(meta); }),
        button('Löschen', 'Route ' + meta.name + ' löschen', function () { removeRoute(meta); }));
      li.append(actions);
      list.append(li);
    });
    wrap.hidden = !metas.length;
  }

  // Liest die Liste neu aus dem Speicher; die Karte "Meine Routen" erscheint erst mit mindestens einer Route.
  function refresh() {
    return store.list().then(function (all) {
      metas = sortMetas(all);
      render();
    }).catch(function (err) {
      metas = [];
      render();
      // Speicher nicht verfügbar: beim Start still bleiben, der Hinweis kommt erst, wenn jemand speichern will
      var unavailable = err && (err.code === 'unavailable' || err.name === 'SecurityError' || err.name === 'NotSupportedError');
      if (!unavailable) fail(err);
    });
  }

  return {
    refresh: refresh,
    count: function () { return metas.length; },
    setCurrent: function (id) { currentId = id; render(); }
  };
}
