// src/scripts/agenda/gracias.ts — /agendar/gracias/: la página de gracias de la Discovery Session.
// Lee la reserva que dejó booking.ts en sessionStorage (gracias-store.ts) y llena la confirmación; sin reserva reciente en
// esta pestaña muestra "sin-datos" (cómo encontrar la invitación y el enlace para agendar).
// Medición: booking_confirmed {tipo:'discovery', desde} una sola vez por reserva (recargar no cuenta otra), sin datos personales.
import { CDMX_TZ, formatTimeEs } from '../../../shared/agenda.js';
import { syncMoreCol } from './confirmado';
import { leerGracias, marcarMedido } from './gracias-store';

function track(name: string, detail: Record<string, unknown> = {}) {
  try {
    document.dispatchEvent(new CustomEvent('ingeniak:track', { detail: { name, page: location.pathname, ...detail } }));
  } catch { /* nada */ }
}

/** Cambia `{clave}` por un <strong> con el valor (texto, nunca HTML). */
function conDato(el: HTMLElement, tpl: string, clave: string, valor: string) {
  const [a, b] = tpl.split(`{${clave}}`);
  const strong = document.createElement('strong');
  strong.textContent = valor;
  el.replaceChildren(a ?? '', strong, b ?? '');
}

export function initGracias() {
  const root = document.querySelector<HTMLElement>('[data-gracias]');
  if (!root || root.dataset.grReady) return;
  root.dataset.grReady = '1';
  const $ = <E extends Element = HTMLElement>(s: string) => root.querySelector<E>(s);
  const show = (state: 'ok' | 'sin-datos') => {
    for (const el of root.querySelectorAll<HTMLElement>('[data-cf]')) el.hidden = el.dataset.cf !== state;
    root.dataset.state = state;
  };

  const g = leerGracias();
  if (!g) {
    show('sin-datos');
  } else {
    const titulo = $('[data-gr-titulo]')!;
    if (g.nombre) titulo.textContent = (titulo.dataset.tpl ?? '').replace('{nombre}', g.nombre);
    $('[data-gr-when]')!.textContent = (root.dataset.cuando ?? '{when}').replace('{when}', g.when);
    let tz: string | null = null;
    try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone; } catch { tz = null; }
    if (g.start && tz && tz !== CDMX_TZ) {
      const local = $('[data-gr-local]')!;
      local.textContent = `${formatTimeEs(g.start, tz)} ${root.dataset.local ?? 'en tu zona horaria'}`;
      local.hidden = false;
    }
    const inv = $('[data-gr-inv]')!;
    if (g.email) conDato(inv, inv.dataset.tpl ?? '', 'email', g.email);
    const meet = $<HTMLAnchorElement>('[data-gr-meet]')!;
    if (g.meetLink && /^https:\/\//.test(g.meetLink)) {
      meet.href = g.meetLink;
      meet.hidden = false;
    }
    show('ok');
    if (!g.medido) {
      track('booking_confirmed', { tipo: 'discovery', desde: g.desde, metaId: g.metaId });
      marcarMedido(g);
    }
  }
  root.setAttribute('aria-busy', 'false');

  syncMoreCol(root);
  for (const a of document.querySelectorAll<HTMLAnchorElement>('.gr-hero a[data-wa]')) {
    a.addEventListener('click', () => track('whatsapp_click', { section: 'agenda-gracias' }));
  }
}
