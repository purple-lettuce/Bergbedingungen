// Lokale Speicherung der Routen (RI6, E2): IndexedDB im Browser, kein Server, keine Übertragung.
// Zwei Speicher in einer Datenbank: "routes" (Kopfdaten für die Liste) und "files" (Originaltext der GPX-Datei). Beide werden
// in einer gemeinsamen Transaktion geschrieben und gelöscht, damit nichts halb gespeichert oder beim Löschen zurückbleibt.
// Fehler werden als Ausnahmen mit name/code weitergereicht; Texte dazu: storeErrorText in route_store_logic.js.

var DB_NAME = 'bergbedingungen-routes';
var DB_VERSION = 1;

function unavailable() { var e = new Error('IndexedDB nicht verfügbar'); e.code = 'unavailable'; return e; }

export function createStore(dbName) {
  var dbPromise = null;

  function open() {
    if (dbPromise) return dbPromise;
    dbPromise = new Promise(function (resolve, reject) {
      var idb;
      try { idb = window.indexedDB; } catch (e) { reject(unavailable()); return; }   // Zugriff kann bei gesperrtem Speicher werfen
      if (!idb) { reject(unavailable()); return; }
      var req;
      try { req = idb.open(dbName || DB_NAME, DB_VERSION); } catch (e) { reject(e); return; }
      req.onupgradeneeded = function () {
        var db = req.result;
        if (!db.objectStoreNames.contains('routes')) db.createObjectStore('routes', { keyPath: 'id' });
        if (!db.objectStoreNames.contains('files')) db.createObjectStore('files');
      };
      req.onsuccess = function () { req.result.onversionchange = function () { req.result.close(); dbPromise = null; }; resolve(req.result); };
      req.onerror = function () { reject(req.error || unavailable()); };
      req.onblocked = function () { reject(unavailable()); };
    });
    dbPromise.catch(function () { dbPromise = null; });   // nächster Versuch öffnet neu
    return dbPromise;
  }

  // Führt fn(tx) in einer Transaktion aus; erfüllt, wenn sie abgeschlossen ist (nicht schon, wenn die Anfrage antwortet).
  function run(names, mode, fn) {
    return open().then(function (db) {
      return new Promise(function (resolve, reject) {
        var tx, out;
        try { tx = db.transaction(names, mode); out = fn(tx); } catch (e) { reject(e); return; }
        tx.oncomplete = function () { resolve(out && out.result !== undefined ? out.result : out); };
        tx.onabort = function () { reject((out && out.error) || tx.error || new Error('Transaktion abgebrochen')); };
        tx.onerror = function () { /* Abbruch folgt über onabort */ };
      });
    });
  }

  return {
    // Alle Kopfdaten (ohne Dateitext).
    list: function () {
      return run(['routes'], 'readonly', function (tx) { return tx.objectStore('routes').getAll(); });
    },
    // Speichert Kopfdaten und Dateitext gemeinsam.
    add: function (meta, gpxText) {
      return run(['routes', 'files'], 'readwrite', function (tx) {
        tx.objectStore('routes').add(meta);
        tx.objectStore('files').add(gpxText, meta.id);
        return meta;
      });
    },
    // Dateitext einer Route; wirft bei fehlendem Eintrag einen Fehler mit code "missing".
    getFile: function (id) {
      return run(['files'], 'readonly', function (tx) { return tx.objectStore('files').get(id); }).then(function (text) {
        if (typeof text !== 'string') { var e = new Error('nicht gefunden'); e.code = 'missing'; throw e; }
        return text;
      });
    },
    // Benennt um; wirft bei fehlendem Eintrag "missing".
    rename: function (id, name) {
      return run(['routes'], 'readwrite', function (tx) {
        var st = tx.objectStore('routes'), get = st.get(id), out = { result: null };
        get.onsuccess = function () {
          if (!get.result) { var e = new Error('nicht gefunden'); e.code = 'missing'; tx.abort(); out.error = e; return; }
          var meta = Object.assign({}, get.result, { name: name });
          st.put(meta);
          out.result = meta;
        };
        return out;
      });
    },
    // Entfernt Kopfdaten und Dateitext vollständig.
    remove: function (id) {
      return run(['routes', 'files'], 'readwrite', function (tx) {
        tx.objectStore('routes').delete(id);
        tx.objectStore('files').delete(id);
        return null;
      });
    },
    // Schließt die Verbindung (für Tests, die die Datenbank danach löschen).
    close: function () {
      if (!dbPromise) return Promise.resolve();
      var p = dbPromise; dbPromise = null;
      return p.then(function (db) { db.close(); }, function () {});
    }
  };
}

export var store = createStore();

export function newId() {
  if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
  return 'r' + Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
}
