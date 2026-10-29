// Legende der Sperrungen und Hinweise: erklärt die Farben der Pins und Listeneinträge (Abschnitt im Bedienfeld "Karten & Layer").

import { legends } from './layers.js';

export function initClosuresLegend() {
  legends.closures.setContent(
    '<ul class="pa-list">' +
    '<li><span class="dot closure"></span><span class="pa-label">Sperrung</span></li>' +
    '<li><span class="dot notice"></span><span class="pa-label">Hinweis</span></li>' +
    '<li><span class="dot upcoming"></span><span class="pa-label">Geplant (gilt erst ab einem späteren Datum)</span></li>' +
    '</ul>');
}