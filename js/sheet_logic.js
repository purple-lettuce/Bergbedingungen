// Bottom Sheet (D11): reine Berechnungen ohne DOM (getestet mit scripts/test_sheet_logic.html).
// Das Sheet kennt drei Zustände: 'peek' (nur Griff und Titel), 'half' (halbe Kartenhöhe), 'full' (fast die ganze Kartenhöhe).

export var STATES = ['peek', 'half', 'full'];
export var TOP_GAP = 56;        // oben bleibt im Zustand 'full' ein Kartenstreifen für Zoom und Layer-Knopf (Pixel)
var MIN_STEP = 88;              // Mindestabstand zwischen den Zuständen (Pixel), damit sie sich unterscheiden
var FLING = 0.4;                // ab dieser Geschwindigkeit (Pixel je Millisekunde) zählt eine Wischgeste als Richtungsbefehl
var BAND = 24;                  // ein Zustand, der höchstens so weit entfernt ist, gilt bei einer Wischgeste als der aktuelle

// Höhe des Sheets je Zustand in Pixeln, abhängig von der Höhe des Kartenbereichs und der Höhe des Peek-Streifens.
export function sheetHeights(mainH, peekH) {
  var peek = Math.min(Math.round(peekH), mainH);
  var half = Math.min(Math.max(Math.round(mainH * 0.5), peek + MIN_STEP), mainH);
  var full = Math.min(Math.max(mainH - TOP_GAP, half + MIN_STEP / 2), mainH);
  return { peek: peek, half: half, full: full };
}

// Zustand nach dem Loslassen: bei schneller Geste (velocity > 0 = nach oben) der nächste Zustand in diese Richtung
// (ein Zustand innerhalb von BAND gilt als der aktuelle), sonst der Zustand mit der geringsten Entfernung zur aktuellen Höhe.
export function snapState(height, velocity, heights) {
  var nearest = STATES[0], best = Infinity;
  STATES.forEach(function (s) {
    var d = Math.abs(heights[s] - height);
    if (d < best) { best = d; nearest = s; }
  });
  if (Math.abs(velocity) < FLING) return nearest;
  var i;
  if (velocity > 0) {
    for (i = 0; i < STATES.length; i++) if (heights[STATES[i]] > height + BAND) return STATES[i];
    return STATES[STATES.length - 1];
  }
  for (i = STATES.length - 1; i >= 0; i--) if (heights[STATES[i]] < height - BAND) return STATES[i];
  return STATES[0];
}

// Ein Schritt (dir > 0 = größer) mit Anschlag an beiden Enden, z. B. für die Pfeiltasten.
export function stepState(state, dir) {
  var i = STATES.indexOf(state) + (dir > 0 ? 1 : -1);
  return STATES[Math.max(0, Math.min(STATES.length - 1, i))];
}

// Tippen auf den Griff: aus 'peek' auf 'half', sonst zurück auf 'peek'.
export function toggleState(state) {
  return state === 'peek' ? 'half' : 'peek';
}