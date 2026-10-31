// Datenstatus-Leiste unter dem Header: je Quelle ein Punkt (Zustand), der Name und ein kurzer Text mit echten Werten.
// Die Module melden ihren Zustand mit setSourceStatus(); Text und Zustand kommen aus status_bar_logic.js.
// Es gibt keine Standardwerte: ein Eintrag zeigt nur "wird geladen", "noch nicht geladen" oder das, was ein Modul gemeldet hat.

var SOURCES = [
  { id: 'closures', name: 'Sperrungen & Hinweise', state: 'loading', text: 'wird geladen …' },
  { id: 'protectedAreas', name: 'Schutzgebiete', state: 'loading', text: 'wird geladen …' },
  // Die Lawinenlage lädt erst beim ersten Einblenden der Ebene (js/avalanche.js), vorher gibt es keinen Status.
  { id: 'avalanche', name: 'Lawinenlage', state: 'unavailable', text: 'wird beim Einblenden geladen' },
  { id: 'weather', name: 'Wetter', state: 'loading', text: 'wird geladen …' }
];
var STATE_WORD = { ok: 'geladen', limited: 'eingeschränkt', unavailable: 'nicht verfügbar', error: 'Fehler', loading: 'lädt' };
var rows = {};

function build() {
  var list = document.getElementById('statusbar-list');
  if (!list) return;
  SOURCES.forEach(function (s) {
    var li = document.createElement('li');
    li.className = 'mr-statusbar__item';
    var dot = document.createElement('span'); dot.className = 'mr-statusbar__dot'; dot.setAttribute('aria-hidden', 'true');
    var name = document.createElement('span'); name.className = 'mr-label mr-statusbar__name'; name.textContent = s.name;
    var state = document.createElement('span'); state.className = 'mr-visually-hidden';
    var text = document.createElement('span'); text.className = 'mr-statusbar__text';
    li.append(dot, name, state, text);
    list.append(li);
    rows[s.id] = { li: li, state: state, text: text };
    setSourceStatus(s.id, s.state, s.text);
  });
}

// state: 'ok' | 'limited' | 'unavailable' | 'error' | 'loading'
export function setSourceStatus(id, state, text) {
  var r = rows[id];
  if (!r) return;
  r.li.dataset.state = state;
  r.state.textContent = ' (' + (STATE_WORD[state] || state) + '): ';
  r.text.textContent = text;
}

build();
