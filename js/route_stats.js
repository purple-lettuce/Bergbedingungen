// Routenstatistik (RI4), reine Logik ohne Karte und ohne Zugriff auf die Seite.
// Alle Werte stammen aus der Datei (E3): keine DEM-Höhen, keine Schätzung, keine Umrechnung. Fehlende Höhe ist null und zählt nie als 0.
// Anstieg und Abstieg werden mit einer Hysterese berechnet (E5): Eine Höhenänderung zählt erst, wenn sie seit dem letzten gezählten
// Bezugspunkt mindestens HYSTERESIS_M beträgt. Das unterdrückt GPS-Rauschen; die Methode wird in der Oberfläche genannt.
// Der Bezugspunkt wird an Lücken zurückgesetzt, ein Höhensprung über eine Lücke zählt nicht. Eine Änderung, die am Ende der Route
// noch unter der Schwelle liegt, wird nicht gezählt. Höchster und tiefster Punkt sind Rohwerte der Datei (ungeglättet).

export const HYSTERESIS_M = 5;   // Startwert aus E5; Prüfung an synthetischen Referenzstrecken in scripts/test_route_stats.html

export const NO_ELEVATION_TEXT = 'keine Höhendaten in der Datei';

export const METHOD_TEXT = 'Höhenmeter aus den Höhen der GPX-Datei; Änderungen unter ' + HYSTERESIS_M + ' m werden nicht gezählt (Hysterese gegen GPS-Rauschen). ' +
  'Andere Apps können abweichen.';

// Ergebnis { lengthM, hasElevation, elevationPoints, missingElevation, ascentM, descentM, maxEle, minEle, durationMs }.
// Ohne Höhen sind ascentM, descentM, maxEle, minEle null; ohne zwei verschiedene Zeitstempel (oder bei umgekehrter Zeit) ist durationMs null.
export function routeStats(route, hysteresisM) {
  var h = hysteresisM == null ? HYSTERESIS_M : hysteresisM;
  var pts = route.points, gapAfter = {};
  route.gaps.forEach(function (g) { gapAfter[g.afterIndex] = true; });

  var ref = null, up = 0, down = 0, max = null, min = null, withEle = 0, firstT = null, lastT = null;
  for (var i = 0; i < pts.length; i++) {
    var p = pts[i];
    if (p.time != null) { if (firstT == null) firstT = p.time; lastT = p.time; }
    if (p.ele != null) {
      withEle++;
      if (max == null || p.ele > max) max = p.ele;
      if (min == null || p.ele < min) min = p.ele;
      if (ref == null) ref = p.ele;
      else if (p.ele - ref >= h) { up += p.ele - ref; ref = p.ele; }
      else if (ref - p.ele >= h) { down += ref - p.ele; ref = p.ele; }
    }
    if (gapAfter[i]) ref = null;
  }

  var has = withEle > 0;
  return {
    lengthM: route.lengthM,
    hasElevation: has,
    elevationPoints: withEle,
    missingElevation: pts.length - withEle,
    ascentM: has ? up : null,
    descentM: has ? down : null,
    maxEle: max,
    minEle: min,
    durationMs: firstT != null && lastT > firstT ? lastT - firstT : null
  };
}

export function formatKm(m) {
  if (m < 1000) return Math.round(m).toLocaleString('de-DE') + ' m';
  return (m / 1000).toLocaleString('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + ' km';
}

export function formatMeters(m) { return Math.round(m).toLocaleString('de-DE') + ' m'; }

// "2 h 05 min"; unter einer Stunde "45 min"; auf ganze Minuten gerundet.
export function formatDuration(ms) {
  var min = Math.round(ms / 60000), h = Math.floor(min / 60), r = min % 60;
  return h ? h + ' h ' + (r < 10 ? '0' : '') + r + ' min' : r + ' min';
}

// Anzeige: { rows: [{ label, value }], note, caveat }. note = Methodenhinweis (nur mit Höhen), caveat = Datenhinweis bei einzelnen fehlenden Höhen.
// Ohne Höhen steht nur die Länge und "keine Höhendaten in der Datei"; die Dauer erscheint nur bei vorhandenen Zeitstempeln.
export function statsRows(stats) {
  var rows = [{ label: 'Länge', value: formatKm(stats.lengthM) }];
  var caveat = null;
  if (stats.hasElevation) {
    rows.push({ label: 'Anstieg', value: formatMeters(stats.ascentM) });
    rows.push({ label: 'Abstieg', value: formatMeters(stats.descentM) });
    rows.push({ label: 'Höchster Punkt', value: formatMeters(stats.maxEle) });
    rows.push({ label: 'Tiefster Punkt', value: formatMeters(stats.minEle) });
    if (stats.missingElevation) {
      caveat = stats.missingElevation.toLocaleString('de-DE') + ' von ' + (stats.elevationPoints + stats.missingElevation).toLocaleString('de-DE') +
        ' Punkten haben keine Höhe und fehlen in der Höhenstatistik.';
    }
  } else {
    rows.push({ label: 'Höhen', value: NO_ELEVATION_TEXT });
  }
  if (stats.durationMs != null) rows.push({ label: 'Dauer der Aufzeichnung', value: formatDuration(stats.durationMs) });
  return { rows: rows, note: stats.hasElevation ? METHOD_TEXT : null, caveat: caveat };
}