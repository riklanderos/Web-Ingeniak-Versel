// src/scripts/agenda/confirmado.ts — /agendar/confirmado/ (CAMBIO-COTIZAR §5.6; flujo-agenda.md §4.8).
// Lee ?session_id= de Stripe, lo valida y llama a POST /api/agenda/confirmar/ (idempotente: se puede recargar).
// Estados en la región aria-live [data-confirmado]: cargando (aria-busy) → ok | pending | error.
// Medición: booking_confirmed {tipo:'power'} una sola vez por sesión de pago (sessionStorage), sin datos personales.
import { CDMX_TZ, SESSION_ID_RE, formatTimeEs } from '../../../shared/agenda.js';

type State = 'cargando' | 'ok' | 'pending' | 'error';
type Res = { ok?: boolean; state?: State; when?: string; start?: string; meetLink?: string | null; email?: string | null; brief?: string | null };

function track(name: string, detail: Record<string, unknown> = {}) {
  try {
    document.dispatchEvent(new CustomEvent('ingeniak:track', { detail: { name, page: location.pathname, ...detail } }));
  } catch { /* nada */ }
}

export function initConfirmado() {
  const root = document.querySelector<HTMLElement>('[data-confirmado]');
  if (!root || root.dataset.cfReady) return;
  root.dataset.cfReady = '1';
  const $ = <E extends Element = HTMLElement>(s: string) => root.querySelector<E>(s);
  // Entrada del intro ("Aquí confirmamos tu pago…"): solo mientras se confirma o con el pago en proceso.
  const lede = document.querySelector<HTMLElement>('[data-cf-lede]');

  function show(state: State) {
    for (const el of root!.querySelectorAll<HTMLElement>('[data-cf]')) el.hidden = el.dataset.cf !== state;
    if (lede) lede.hidden = state !== 'cargando' && state !== 'pending';
    root!.setAttribute('aria-busy', String(state === 'cargando'));
    root!.dataset.state = state;
  }

  function renderOk(r: Res) {
    $('[data-cf-when]')!.textContent = `${r.when ?? ''} (hora del centro de México)`;
    const local = $('[data-cf-local]')!;
    let tz: string | null = null;
    try {
      tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    } catch { tz = null; }
    if (r.start && tz && tz !== CDMX_TZ) {
      local.textContent = `${formatTimeEs(r.start, tz)} en tu zona horaria`;
      local.hidden = false;
    }
    const inv = $('[data-cf-inv]')!;
    if (r.email) {
      const [a, b] = (inv.dataset.tpl ?? '').split('{email}');
      const strong = document.createElement('strong');
      strong.textContent = r.email;
      inv.replaceChildren(a ?? '', strong, b ?? '');
    }
    const meet = $<HTMLAnchorElement>('[data-cf-meet]')!;
    if (r.meetLink && /^https:\/\//.test(r.meetLink)) {
      meet.href = r.meetLink;
      meet.hidden = false;
    }
    if (r.brief && /^https:\/\//.test(r.brief)) {
      $<HTMLAnchorElement>('[data-cf-brief-a]')!.href = r.brief;
      $('[data-cf-brief]')!.hidden = false;
    }
  }

  const sid = new URLSearchParams(location.search).get('session_id') ?? '';

  async function confirmar() {
    if (!SESSION_ID_RE.test(sid)) {
      show('error');
      track('booking_error', { tipo: 'power', step: 'confirmado', motivo: 'sin-sesion' });
      return;
    }
    show('cargando');
    try {
      const r = await fetch('/api/agenda/confirmar/', {
        method: 'POST',
        headers: { 'content-type': 'application/json', accept: 'application/json' },
        body: JSON.stringify({ session_id: sid }),
      });
      const j = (await r.json().catch(() => ({}))) as Res;
      if (j.ok && j.state === 'ok') {
        renderOk(j);
        show('ok');
        try {
          sessionStorage.removeItem('ingeniak-agenda-power');
          const k = `ingeniak-confirmado-${sid.slice(-12)}`;
          if (!sessionStorage.getItem(k)) {
            sessionStorage.setItem(k, '1');
            track('booking_confirmed', { tipo: 'power' });
          }
        } catch {
          track('booking_confirmed', { tipo: 'power' });
        }
        return;
      }
      if (j.ok && j.state === 'pending') {
        show('pending');
        return;
      }
      show('error');
      track('booking_error', { tipo: 'power', step: 'confirmado', status: r.status });
    } catch {
      show('error');
      track('booking_error', { tipo: 'power', step: 'confirmado', status: 0 });
    }
  }

  // Escritorio (ImageSection safeCol): scene.ts acota la columna del intro al borde de la zona segura de la placa con las
  // medidas reales; la de `more` (estado y "ten a la mano") toma ese mismo ancho para no entrar al calendario de cristal.
  const sec = root.closest<HTMLElement>('section.is');
  const introCol = sec?.querySelector<HTMLElement>(':scope > .is__copy > .is__text');
  const moreCol = sec?.querySelector<HTMLElement>(':scope > .is__more > .is__text');
  if (introCol && moreCol && 'ResizeObserver' in window) {
    const desk = matchMedia('(min-width: 768px) and (min-aspect-ratio: 5/6)');
    const sync = () => {
      const w = desk.matches ? `${Math.floor(introCol.getBoundingClientRect().width)}px` : '';
      if (moreCol.style.maxWidth !== w) moreCol.style.maxWidth = w;
    };
    new ResizeObserver(sync).observe(introCol);
    desk.addEventListener?.('change', sync);
    sync();
  }

  $('[data-cf-retry]')?.addEventListener('click', () => void confirmar());
  for (const a of root.querySelectorAll<HTMLAnchorElement>('a[data-wa]')) {
    a.addEventListener('click', () => track('whatsapp_click', { section: 'agenda-confirmado' }));
  }
  void confirmar();
}
