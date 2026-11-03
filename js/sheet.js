// Bottom Sheet (D11): Auf dem Smartphone (bis 820 px, siehe js/layout.js) ist die Seitenleiste ein Sheet am unteren Rand der Karte.
// Das Modul verschiebt keine Inhalte außer der Fußzeile und kennt keine Fachlogik: Wetter, Suche und Liste bleiben unverändert in `aside`.
//   Zustände: 'peek' (Griff und Titel), 'half', 'full' (siehe sheet_logic.js). Bedienung: Wischen am Griff, Tippen, Pfeiltasten, Esc.
//   Das Stylesheet liest die Höhe aus `--mr-sheet-h` an `main`; `main[data-sheet]` nennt den Zustand.
// Außerhalb des mobilen Layouts macht das Modul nichts (der Griff ist dort per CSS verborgen).

import { isMobile, onMobileChange, refreshPopupLayout } from './layout.js';
import { sheetHeights, snapState, stepState, toggleState } from './sheet_logic.js';

var TAP_SLOP = 6;   // Pixel: weniger Bewegung gilt als Tippen
var main, aside, handle, warn, footer, map;
var state = 'peek';
var ready = false;

function buildHandle() {
  var b = document.createElement('button');
  b.type = 'button';
  b.className = 'mr-sheet__handle';
  b.setAttribute('aria-controls', 'sheet');
  var bar = document.createElement('span');
  bar.className = 'mr-sheet__grabber';
  bar.setAttribute('aria-hidden', 'true');
  var title = document.createElement('span');
  title.className = 'mr-label mr-sheet__title';
  title.textContent = 'Wetter und Sperrungen';
  b.append(bar, title);
  return b;
}

// Höhe des Streifens im Zustand 'peek': Griff, und ein sichtbarer Warnhinweis (z. B. Kacheln oder Daten nicht ladbar) bleibt mit sichtbar.
function peekHeight() {
  var h = handle.offsetHeight;
  if (!warn.hidden) h = Math.max(h, warn.offsetTop + warn.offsetHeight + 8);
  return h;
}
function heights() { return sheetHeights(main.clientHeight, peekHeight()); }

function setHeight(px) { main.style.setProperty('--mr-sheet-h', Math.round(px) + 'px'); }

function apply(next) {
  state = next;
  main.classList.remove('is-dragging');
  setHeight(heights()[state]);
  main.dataset.sheet = state;
  handle.setAttribute('aria-expanded', String(state !== 'peek'));
  // Verdeckter Inhalt ist weder fokussierbar noch für Screenreader da; der Warnhinweis bleibt immer erreichbar.
  Array.prototype.forEach.call(aside.querySelectorAll(':scope > .mr-card, :scope > footer'), function (n) { n.inert = state === 'peek'; });
  if (state === 'peek') aside.scrollTop = 0;
  refreshPopupLayout(map);
}

export function getSheetState() { return ready && isMobile() ? state : null; }
export function setSheetState(next) { if (ready && isMobile()) apply(next); }
// Auswahl in der Liste: Die Karte hat Vorrang, das Sheet gibt sie frei (vor der Berechnung der Ränder aufrufen).
export function revealMap() { if (ready && isMobile() && state !== 'peek') apply('peek'); }

function bindDrag() {
  var startY = 0, startH = 0, lastY = 0, lastT = 0, velocity = 0, moved = false, suppressClick = false, active = false;
  handle.addEventListener('pointerdown', function (ev) {
    if (!isMobile() || (ev.pointerType === 'mouse' && ev.button !== 0)) return;
    active = true; moved = false; velocity = 0;
    startY = lastY = ev.clientY; lastT = ev.timeStamp;
    startH = parseFloat(main.style.getPropertyValue('--mr-sheet-h')) || heights()[state];
    try { handle.setPointerCapture(ev.pointerId); } catch (e) { /* synthetische Ereignisse (Tests) haben keinen aktiven Zeiger */ }
  });
  handle.addEventListener('pointermove', function (ev) {
    if (!active) return;
    var dy = startY - ev.clientY;
    if (!moved && Math.abs(dy) < TAP_SLOP) return;
    if (!moved) { moved = true; main.classList.add('is-dragging'); }
    var h = heights();
    setHeight(Math.max(h.peek, Math.min(h.full, startH + dy)));
    var dt = ev.timeStamp - lastT;
    if (dt > 0) velocity = (lastY - ev.clientY) / dt;
    lastY = ev.clientY; lastT = ev.timeStamp;
  });
  function end() {
    if (!active) return;
    active = false;
    if (!moved) return;   // Tippen übernimmt `click`
    suppressClick = true;
    setTimeout(function () { suppressClick = false; }, 0);
    apply(snapState(parseFloat(main.style.getPropertyValue('--mr-sheet-h')), velocity, heights()));
  }
  handle.addEventListener('pointerup', end);
  handle.addEventListener('pointercancel', end);
  handle.addEventListener('click', function () { if (!suppressClick) apply(toggleState(state)); });
  handle.addEventListener('keydown', function (ev) {
    if (ev.key === 'ArrowUp') { ev.preventDefault(); apply(stepState(state, 1)); }
    else if (ev.key === 'ArrowDown') { ev.preventDefault(); apply(stepState(state, -1)); }
  });
  aside.addEventListener('keydown', function (ev) {
    if (ev.key === 'Escape' && state !== 'peek') { apply('peek'); handle.focus(); }
  });
}

// Ein- und Ausstieg beim Wechsel über die Grenze von 820 px (auch bei laufender Seite, z. B. Drehen eines Tablets).
function enter() {
  aside.setAttribute('aria-label', 'Wetter und Sperrungen');
  aside.id = 'sheet';
  aside.appendChild(footer);   // Quellenangaben am Ende des Sheets; sonst nähmen sie unter der Karte Platz weg
  apply('peek');
}
function leave() {
  main.after(footer);
  main.style.removeProperty('--mr-sheet-h');
  delete main.dataset.sheet;
  main.classList.remove('is-dragging');
  Array.prototype.forEach.call(aside.querySelectorAll('[inert]'), function (n) { n.inert = false; });
  refreshPopupLayout(map);
}

export function initSheet(leafletMap) {
  map = leafletMap;
  main = document.querySelector('main');
  aside = main.querySelector(':scope > aside');
  warn = document.getElementById('warn');
  footer = document.querySelector('footer') || document.body.appendChild(document.createElement('footer'));
  handle = buildHandle();
  aside.prepend(handle);
  bindDrag();
  ready = true;
  function sync() { if (isMobile()) enter(); else leave(); }
  onMobileChange(sync);
  if (isMobile()) enter();
  // Höhe neu berechnen, wenn sich der Kartenbereich (Drehen, Adressleiste) oder der Peek-Streifen (Warnhinweis) ändert.
  if (window.ResizeObserver) {
    var ro = new ResizeObserver(function () { if (isMobile() && !main.classList.contains('is-dragging')) apply(state); });
    ro.observe(main); ro.observe(handle); ro.observe(warn);
  }
}