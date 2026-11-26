// Anbindung des Höhenmodells (RI12) an die Oberfläche: Eintrag in der Statusleiste und Lizenzhinweis in der Fußzeile, beide erst nach der ersten Höhenabfrage.
// Das Höhenmodell hat in RI12 noch keine Anzeige; ab RI13 rufen Hangneigung und Profil js/dem.js auf.

import { configure } from './dem.js';
import { setSourceStatus } from './status_bar.js';
import { demStatus } from './status_bar_logic.js';

export function initDemView() {
  configure({
    onStatus: function (state, source) {
      var st = demStatus(state, source);
      setSourceStatus('dem', st.state, st.text);
      var note = document.getElementById('dem-attribution');
      if (note && state === 'ok') note.hidden = false;
    }
  });
}
