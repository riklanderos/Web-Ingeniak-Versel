// src/scripts/agenda/booking.ts — máquina de estados de la reserva (CAMBIO-COTIZAR §5.5; flujo-agenda.md §4.6).
// TypeScript sin framework sobre el marcado estático de BookingFlow.astro. Paridad 1:1 con el BookingFlow de
// riklanderos.tech (mismos pasos, reglas, estados y respuestas) + mejoras de accesibilidad: foco al título de cada paso,
// días con flechas (role="tablist", tabindex rotativo), errores enlazados (aria-invalid / aria-describedby) y resumen.
// Los render*() solo cambian atributos y texto: nunca reconstruyen el formulario (no se pierde el foco ni lo escrito).
// Medición: CustomEvent 'ingeniak:track' (booking_*), nunca con datos que escribió la persona.
import {
  CDMX_TZ, EMPTY_FORM, EVENT_ID_RE, FIELD_ORDER, SESSION_RULES, formatDayEs, formatSlotEs, formatTimeEs, toForm, validateForm,
  type BookingForm, type DayAvailability, type FormErrors, type SessionType,
} from '../../../shared/agenda.js';
import { bindPhone, readPhone } from '../forms/phone';

type Step = 1 | 2 | 3 | 'done';
type FieldKey = keyof BookingForm;

const AVISOS = {
  cancelado: 'Cancelaste el pago y tu horario quedó libre. Puedes elegir el mismo u otro.',
  ocupado: 'Ese horario se acaba de ocupar. Elige otro, por favor.',
  sinConexion: 'Se perdió la conexión. Inténtalo de nuevo.',
  reserva: 'No pudimos completar la reserva. Inténtalo de nuevo o escríbenos por WhatsApp y te agendamos nosotros.',
  agenda: 'No pudimos leer la agenda en este momento. Inténtalo en unos minutos o escríbenos por WhatsApp.',
  resumen: 'Revisa estos campos:',
  lleno: 'Lleno',
  tuHora: 'tu hora',
  local: 'en tu zona horaria',
  done: 'Listo, {nombre}. Tu Discovery Session quedó agendada.',
  cuando: '{when} (hora del centro de México)',
  invitacion: 'Te enviamos la invitación de Google Calendar a {email} con el enlace de Google Meet. Si no la ves en tu bandeja de entrada, revisa promociones o spam.',
  paso: 'Paso {n} de 3: {t}',
};

// Nombres del resumen de errores: la misma redacción que la etiqueta del campo (textos.ts) y que su error (shared/agenda.js).
const LABELS: Record<FieldKey, string> = {
  fullName: 'Nombre completo', email: 'Correo', whatsapp: 'WhatsApp', businessName: 'Nombre del negocio', website: 'Sitio web o redes',
  industry: 'Giro', teamSize: 'Personas en tu equipo', revenue: 'Facturación mensual', timeDrains: 'Dónde se te va el tiempo',
  tools: 'Herramientas', goal: 'Qué quieres resolver en la sesión',
};
const GOAL_LABEL: Record<SessionType, string> = { discovery: 'Qué quieres revisar en la llamada', power: 'Qué quieres resolver en la sesión' };

declare global {
  interface Window { __lenis?: { scrollTo: (t: Element | number | string, o?: Record<string, unknown>) => void } }
}

const reduced = () =>
  document.documentElement.getAttribute('data-motion') === 'reduced' ||
  (typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches);

function ss(key: string): string | null {
  try { return sessionStorage.getItem(key); } catch { return null; }
}
function ssJson<T = Record<string, unknown>>(key: string): T | null {
  const v = ss(key);
  if (!v) return null;
  try { return JSON.parse(v) as T; } catch { return null; }
}
const clip = (v: unknown, n: number) => (typeof v === 'string' ? v.trim().slice(0, n) : '');

function track(name: string, detail: Record<string, unknown> = {}) {
  try {
    document.dispatchEvent(new CustomEvent('ingeniak:track', { detail: { name, page: location.pathname, ...detail } }));
  } catch { /* nada */ }
}

/** Desplaza la página hasta el elemento, con el encabezado fijo en cuenta.
 *  Con Lenis (escritorio): su scrollTo. Sin Lenis (táctil, móvil): salto inmediato cuando el cambio de paso ya se pintó.
 *  Un scroll suave nativo no sirve aquí: ocultar un paso cambia el alto de <main>, cine.ts lanza ScrollTrigger.refresh()
 *  220 ms después (ResizeObserver) y ese refresh lleva la página a 0 y la regresa a la posición a medio camino: el panel
 *  quedaba cientos de píxeles arriba de la pantalla. Tras el refresh se revisa una vez y, si la persona no tocó nada, se corrige. */
function scrollToEl(el: Element, smooth = true) {
  const quiet = reduced() || !smooth;
  if (window.__lenis) {
    window.__lenis.scrollTo(el, quiet ? { offset: -96, immediate: true } : { offset: -96 });
    return;
  }
  const off = parseFloat(getComputedStyle(el).scrollMarginTop) || 96;
  const jump = () => window.scrollTo({ top: Math.max(0, el.getBoundingClientRect().top + scrollY - off), behavior: 'instant' });
  requestAnimationFrame(() => requestAnimationFrame(() => {
    jump();
    let touched = false;
    const mark = () => { touched = true; };
    const evs = ['touchstart', 'wheel', 'keydown', 'pointerdown'] as const;
    for (const e of evs) addEventListener(e, mark, { capture: true, passive: true });
    setTimeout(() => {
      for (const e of evs) removeEventListener(e, mark, { capture: true });
      if (!touched && Math.abs(el.getBoundingClientRect().top - off) > 24) jump();
    }, 480);
  }));
}

export function initBooking(root: HTMLElement) {
  if (root.dataset.bkReady) return;
  root.dataset.bkReady = '1';
  const type = root.dataset.agenda as SessionType;
  if (type !== 'discovery' && type !== 'power') return;
  const isPower = type === 'power';
  const rule = SESSION_RULES[type];
  const STORE = `ingeniak-agenda-${type}`;
  const id = root.id;
  const $ = <E extends Element = HTMLElement>(sel: string) => root.querySelector<E>(sel);
  const $$ = <E extends Element = HTMLElement>(sel: string) => Array.from(root.querySelectorAll<E>(sel));

  const form = $<HTMLFormElement>('[data-bk-form]')!;
  const views = new Map<Step, HTMLElement>();
  for (const v of $$<HTMLElement>('[data-step-view]')) {
    const k = v.dataset.stepView!;
    views.set(k === 'done' ? 'done' : (Number(k) as Step), v);
  }
  const phoneRoot = $<HTMLElement>('[data-phone]');
  if (phoneRoot) bindPhone(phoneRoot);

  // ── Estado (igual que el original) ──
  const S = {
    step: 1 as Step,
    form: { ...EMPTY_FORM, timeDrains: [] as string[] } as BookingForm,
    errors: {} as FormErrors,
    days: null as DayAvailability[] | null,
    daysError: null as string | null,
    date: null as string | null,
    slot: null as string | null,
    busy: false,
    localTz: null as string | null,
    startedAt: Date.now(),
    origin: null as string | null,
    attribution: {} as Record<string, unknown>,
    loading: null as Promise<void> | null,
  };

  // ── Atribución (ui.ts guarda utm, clid, landing, src y agenda-desde en sessionStorage) ──
  // Se lee al iniciar (booking_view) y otra vez al pedir el foco y al confirmar: ui.ts escribe desde/src cuando la persona
  // toca un a[href="#agenda"], que en las landings ocurre después de este init.
  function readAttribution() {
    const params = new URLSearchParams(location.search);
    const utmKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];
    const saved = ssJson<Record<string, string>>('ingeniak-utm') ?? {};
    const utm: Record<string, string> = {};
    for (const k of utmKeys) {
      const v = clip(params.get(k), 200) || clip(saved[k], 200);
      if (v) utm[k] = v;
    }
    const clidSaved = ssJson<Record<string, string>>('ingeniak-clid') ?? {};
    const clid: Record<string, string> = {};
    for (const k of ['gclid', 'fbclid', 'gbraid', 'wbraid']) {
      const v = clip(params.get(k), 200) || clip(clidSaved[k], 200);
      if (v) clid[k] = v;
    }
    const landing = ssJson<{ path?: string; referrer?: string; t?: string }>('ingeniak-landing') ?? {};
    const desde = clip(ss('ingeniak-agenda-desde'), 40) || clip(params.get('desde'), 40);
    const src = clip(ss('ingeniak-src'), 60);
    let referrer = '';
    try {
      if (document.referrer && new URL(document.referrer).origin !== location.origin) referrer = document.referrer.slice(0, 500);
    } catch { /* sin referrer */ }
    let zona = S.localTz ?? undefined;
    if (!zona) {
      try { zona = Intl.DateTimeFormat().resolvedOptions().timeZone || undefined; } catch { /* sin Intl */ }
    }
    S.origin = [desde && `Sección: ${desde}`, utm.utm_source, utm.utm_campaign, utm.utm_content].filter(Boolean).join(' · ') || null;
    S.attribution = {
      ...utm,
      referrer: referrer || clip(landing.referrer, 500),
      page_path: location.pathname.slice(0, 300),
      zona,
      src: src || undefined,
      desde: desde || undefined,
      clid,
      landing: { path: clip(landing.path, 300), referrer: clip(landing.referrer, 500), t: clip(landing.t, 40) },
    };
    return desde;
  }

  // ── Formulario ↔ estado ──
  const input = (name: string) => form.elements.namedItem(name) as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | null;

  function readPhoneValue(): string {
    if (!phoneRoot) return '';
    const p = readPhone(phoneRoot);
    if (p.ok) return `${p.lada} ${p.numero}`;
    const num = (input('whatsapp_numero')?.value ?? '').trim();
    if (!num) return '';
    if (num.startsWith('+')) return num;
    return p.lada ? `${p.lada} ${num}` : num;
  }

  function readForm() {
    const v = (n: string) => (input(n)?.value ?? '');
    S.form = {
      fullName: v('fullName'),
      email: v('email'),
      whatsapp: readPhoneValue(),
      businessName: v('businessName'),
      website: v('website'),
      industry: v('industry'),
      teamSize: v('teamSize'),
      revenue: v('revenue'),
      timeDrains: isPower ? $$<HTMLButtonElement>('[data-drain][aria-pressed="true"]').map((b) => b.dataset.drain!) : [],
      tools: isPower ? v('tools') : '',
      goal: v('goal'),
    };
  }

  function save() {
    try {
      const phone = {
        pais: (input('whatsapp_pais') as HTMLSelectElement | null)?.value ?? 'mx',
        lada: input('whatsapp_lada')?.value ?? '',
        numero: input('whatsapp_numero')?.value ?? '',
      };
      sessionStorage.setItem(STORE, JSON.stringify({ ...S.form, _phone: phone }));
    } catch { /* almacenamiento bloqueado */ }
  }

  function restore(): boolean {
    const saved = ssJson<Record<string, any>>(STORE);
    if (!saved) return false;
    const f = toForm(saved);
    const set = (n: string, val: string) => {
      const el = input(n);
      if (!el || !val) return;
      if (el instanceof HTMLSelectElement && !Array.from(el.options).some((o) => o.value === val)) return;
      el.value = val;
    };
    set('fullName', f.fullName);
    set('email', f.email);
    set('businessName', f.businessName);
    set('website', f.website);
    set('industry', f.industry);
    set('teamSize', f.teamSize);
    set('revenue', f.revenue);
    set('tools', f.tools);
    set('goal', f.goal);
    const ph = saved._phone && typeof saved._phone === 'object' ? saved._phone : null;
    if (ph) {
      set('whatsapp_pais', String(ph.pais ?? ''));
      input('whatsapp_pais')?.dispatchEvent(new Event('change', { bubbles: false }));
      set('whatsapp_lada', String(ph.lada ?? ''));
      set('whatsapp_numero', String(ph.numero ?? ''));
    }
    if (isPower) {
      for (const b of $$<HTMLButtonElement>('[data-drain]')) b.setAttribute('aria-pressed', String(f.timeDrains.includes(b.dataset.drain!)));
      syncDrains();
    }
    for (const s of $$<HTMLSelectElement>('select.fld__select')) s.toggleAttribute('data-empty', !s.value);
    readForm();
    return true;
  }

  // ── Errores ──
  const fieldEl = (k: FieldKey): HTMLElement | null => {
    if (k === 'whatsapp') return $<HTMLElement>(`#${id}-whatsapp`);
    if (k === 'timeDrains') return $<HTMLElement>('[data-drain]:not(:disabled)') ?? $<HTMLElement>(`#${id}-timeDrains`);
    return $<HTMLElement>(`#${id}-${k}`);
  };

  function renderErrors() {
    for (const k of FIELD_ORDER) {
      const msg = S.errors[k as FieldKey];
      const fld = root.querySelector<HTMLElement>(`[data-field="${k}"]`);
      const err = $<HTMLElement>(`#${id}-${k}-error`);
      const ctl = k === 'timeDrains' ? null : fieldEl(k as FieldKey);
      if (!fld || !err) continue;
      fld.toggleAttribute('data-invalid', !!msg);
      err.textContent = msg ?? '';
      err.hidden = !msg;
      if (ctl) {
        if (msg) ctl.setAttribute('aria-invalid', 'true');
        else ctl.removeAttribute('aria-invalid');
        const base = (ctl.dataset.describedby ??= ctl.getAttribute('aria-describedby') ?? '');
        const ids = [base, msg ? err.id : ''].filter(Boolean).join(' ').trim();
        if (ids) ctl.setAttribute('aria-describedby', ids);
        else ctl.removeAttribute('aria-describedby');
      }
    }
    const summary = $<HTMLElement>('[data-bk-summary]')!;
    const keys = FIELD_ORDER.filter((k) => S.errors[k as FieldKey]);
    if (!keys.length) {
      summary.hidden = true;
      summary.replaceChildren();
      return;
    }
    const t = document.createElement('p');
    t.className = 'form-summary__t';
    t.textContent = AVISOS.resumen;
    const ul = document.createElement('ul');
    for (const k of keys) {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = `#${id}-${k}`;
      a.textContent = `${k === 'goal' ? GOAL_LABEL[type] : LABELS[k as FieldKey]}: ${S.errors[k as FieldKey]}`;
      a.addEventListener('click', (e) => {
        e.preventDefault();
        fieldEl(k as FieldKey)?.focus();
      });
      li.append(a);
      ul.append(li);
    }
    summary.replaceChildren(t, ul);
    summary.hidden = false;
  }

  function clearError(k: FieldKey) {
    if (!S.errors[k]) return;
    delete S.errors[k];
    renderErrors();
  }

  // ── Tiempo (Power): hasta 3 ──
  function syncDrains() {
    const btns = $$<HTMLButtonElement>('[data-drain]');
    const on = btns.filter((b) => b.getAttribute('aria-pressed') === 'true').length;
    for (const b of btns) b.disabled = on >= 3 && b.getAttribute('aria-pressed') !== 'true';
  }

  // ── Avisos ──
  const notice = $<HTMLElement>('[data-bk-notice]')!;
  function setNotice(text: string | null) {
    notice.textContent = text ?? '';
    notice.hidden = !text;
  }
  const live = $<HTMLElement>('[data-bk-live]')!;

  // ── Pasos ──
  function renderSteps() {
    root.dataset.step = String(S.step);
    for (const [k, v] of views) v.hidden = k !== S.step;
    const n = S.step === 'done' ? 4 : S.step;
    for (const li of $$<HTMLElement>('.bk__prog-i')) {
      const i = Number(li.dataset.n);
      if (i === n) li.setAttribute('aria-current', 'step');
      else li.removeAttribute('aria-current');
      li.toggleAttribute('data-done', i < n);
    }
  }

  function goTo(s: Step, { focus = true, scroll = true } = {}) {
    S.step = s;
    setError(null);
    renderSteps();
    if (s === 3) renderReview();
    if (s === 2) renderDays();
    if (typeof s === 'number') {
      const label = $$<HTMLElement>('.bk__prog-t')[s - 1]?.textContent?.replace(/^\s*\d\s*/, '').trim() ?? '';
      live.textContent = AVISOS.paso.replace('{n}', String(s)).replace('{t}', label);
      track('booking_step', { tipo: type, step: s });
    }
    requestAnimationFrame(() => {
      if (scroll) {
        const top = root.getBoundingClientRect().top;
        if (top < 72 || top > innerHeight * 0.6) scrollToEl(root);
      }
      if (focus) views.get(s)?.querySelector<HTMLElement>('[tabindex="-1"]')?.focus({ preventScroll: true });
    });
  }

  // ── Disponibilidad ──
  async function loadDays() {
    S.daysError = null;
    S.days = null;
    renderDays();
    try {
      const r = await fetch(`/api/agenda/disponibilidad/?tipo=${type}`, { cache: 'no-store', headers: { accept: 'application/json' } });
      const j = (await r.json().catch(() => ({}))) as { ok?: boolean; days?: DayAvailability[]; error?: string; simulacion?: boolean };
      if (!j.ok || !Array.isArray(j.days)) throw new Error(j.error || AVISOS.agenda);
      S.days = j.days;
      if (j.simulacion) $<HTMLElement>('[data-bk-sim]')!.hidden = false;
      if (!(S.date && S.days.some((d) => d.date === S.date && d.slots.length))) S.date = S.days.find((d) => d.slots.length)?.date ?? null;
      if (S.slot && !S.days.some((d) => d.slots.includes(S.slot!))) S.slot = null;
    } catch (e) {
      S.days = null;
      S.daysError = e instanceof Error && e.message && !/fetch|network|json/i.test(e.message) ? e.message : AVISOS.agenda;
      track('booking_error', { tipo: type, step: 2, motivo: 'disponibilidad' });
    }
    renderDays();
  }

  const dayTpl = $<HTMLTemplateElement>('[data-bk-day-tpl]')!;
  const slotTpl = $<HTMLTemplateElement>('[data-bk-slot-tpl]')!;
  const daysEl = $<HTMLElement>('[data-bk-days]')!;
  const slotsEl = $<HTMLElement>('[data-bk-slots]')!;
  const panel = $<HTMLElement>('[data-bk-panel]')!;
  const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

  function renderDays() {
    const loading = !S.days && !S.daysError;
    const anySlots = !!S.days?.some((d) => d.slots.length);
    $<HTMLElement>('[data-bk-loading]')!.hidden = !loading;
    const errBox = $<HTMLElement>('[data-bk-days-error]')!;
    errBox.hidden = !S.daysError;
    $<HTMLElement>('[data-bk-days-error-t]')!.textContent = S.daysError ?? '';
    $<HTMLElement>('[data-bk-empty]')!.hidden = !(S.days && !anySlots);
    $<HTMLElement>('[data-bk-picker]')!.hidden = !(S.days && anySlots);
    const cont = $<HTMLButtonElement>('[data-bk-continue]')!;
    cont.disabled = !S.slot;
    if (!S.days || !anySlots) return;

    // Días (se reconstruyen solo si cambió la lista)
    const key = S.days.map((d) => `${d.date}:${d.slots.length}`).join('|');
    if (daysEl.dataset.key !== key) {
      daysEl.dataset.key = key;
      daysEl.replaceChildren();
      for (const d of S.days) {
        const node = dayTpl.content.firstElementChild!.cloneNode(true) as HTMLButtonElement;
        const fd = formatDayEs(d.date);
        node.id = `${id}-d-${d.date}`;
        node.dataset.date = d.date;
        node.setAttribute('aria-controls', panel.id || (panel.id = `${id}-panel`));
        node.querySelector('.bk__day-w')!.textContent = fd.weekday.slice(0, 3).replace(/\.$/, '');
        node.querySelector('.bk__day-n')!.textContent = fd.day;
        node.querySelector('.bk__day-m')!.textContent = d.slots.length ? fd.month.slice(0, 3) : AVISOS.lleno;
        node.setAttribute('aria-label', `${cap(fd.weekday)} ${fd.day} de ${fd.month}${d.slots.length ? '' : ` · ${AVISOS.lleno}`}`);
        if (!d.slots.length) node.disabled = true;
        daysEl.append(node);
      }
    }
    for (const b of $$<HTMLButtonElement>('.bk__day')) {
      const on = b.dataset.date === S.date;
      b.setAttribute('aria-selected', String(on));
      b.tabIndex = on ? 0 : -1;
    }
    renderSlots();
  }

  function renderSlots() {
    const day = S.days?.find((d) => d.date === S.date) ?? null;
    slotsEl.replaceChildren();
    const dl = $<HTMLElement>('[data-bk-daylabel]')!;
    if (!day) {
      dl.textContent = '';
      return;
    }
    const fd = formatDayEs(day.date);
    dl.textContent = `${cap(fd.weekday)} ${fd.day} de ${fd.month}`;
    panel.setAttribute('aria-labelledby', `${id}-d-${day.date}`);
    for (const s of day.slots) {
      const node = slotTpl.content.firstElementChild!.cloneNode(true) as HTMLButtonElement;
      node.dataset.slot = s;
      node.setAttribute('aria-pressed', String(s === S.slot));
      node.querySelector('.bk__slot-t')!.textContent = formatTimeEs(s);
      const l = node.querySelector<HTMLElement>('.bk__slot-l')!;
      if (S.localTz) l.textContent = `${formatTimeEs(s, S.localTz)} ${AVISOS.tuHora}`;
      else l.remove();
      slotsEl.append(node);
    }
    $<HTMLButtonElement>('[data-bk-continue]')!.disabled = !S.slot;
  }

  function selectDay(date: string, focus = false) {
    if (S.date !== date) {
      S.date = date;
      S.slot = null;
    }
    renderDays();
    if (focus) $<HTMLButtonElement>(`#${CSS.escape(`${id}-d-${date}`)}`)?.focus();
  }

  // ── Revisión ──
  function renderReview() {
    readForm();
    $<HTMLElement>('[data-bk-when]')!.textContent = S.slot ? formatSlotEs(S.slot) : '';
    const local = $<HTMLElement>('[data-bk-when-local]')!;
    local.hidden = !(S.slot && S.localTz);
    local.textContent = S.slot && S.localTz ? `${formatTimeEs(S.slot, S.localTz)} ${AVISOS.local}` : '';
    $<HTMLElement>('[data-bk-who]')!.textContent = `${S.form.fullName.trim()} · ${S.form.businessName.trim()}`;
    $<HTMLElement>('[data-bk-who-email]')!.textContent = S.form.email.trim();
  }

  // ── Error del servidor (paso 3) ──
  function setError(text: string | null) {
    const box = $<HTMLElement>('[data-bk-error]');
    if (!box) return;
    box.hidden = !text;
    $<HTMLElement>('[data-bk-error-t]')!.textContent = text ?? '';
  }

  function setBusy(on: boolean) {
    S.busy = on;
    const go = $<HTMLButtonElement>('[data-bk-confirm]')!;
    go.disabled = on;
    go.setAttribute('aria-busy', String(on));
    $<HTMLElement>('[data-bk-go-idle]')!.hidden = on;
    $<HTMLElement>('[data-bk-go-busy]')!.hidden = !on;
    $<HTMLButtonElement>('[data-bk-change]')!.disabled = on;
  }

  // ── Confirmar ──
  async function confirm() {
    if (!S.slot || S.busy) return;
    readForm();
    readAttribution();
    setBusy(true);
    setError(null);
    track(isPower ? 'booking_checkout_start' : 'booking_submit', { tipo: type });
    const honey = (input('website_url')?.value ?? '').trim();
    try {
      const r = await fetch('/api/agenda/reservar/', {
        method: 'POST',
        headers: { 'content-type': 'application/json', accept: 'application/json' },
        body: JSON.stringify({
          tipo: type,
          form: S.form,
          start: S.slot,
          origen: S.origin,
          atribucion: S.attribution,
          website_url: honey,
          elapsed_ms: Date.now() - S.startedAt,
        }),
      });
      const j = (await r.json().catch(() => ({}))) as {
        ok?: boolean; kind?: 'confirmed' | 'checkout'; url?: string; when?: string; meetLink?: string | null;
        error?: string; slotTaken?: boolean; errors?: FormErrors;
      };
      if (!j.ok) {
        setBusy(false);
        if (j.slotTaken) {
          S.slot = null;
          track('booking_slot_taken', { tipo: type });
          await loadDays();
          goTo(2);
          setNotice(j.error ?? AVISOS.ocupado);
        } else if (j.errors && Object.keys(j.errors).length) {
          S.errors = j.errors;
          track('booking_error', { tipo: type, status: r.status });
          goTo(1, { focus: false });
          renderErrors();
          requestAnimationFrame(() => focusFirstError());
        } else {
          track('booking_error', { tipo: type, status: r.status });
          setError(j.error ?? AVISOS.reserva);
        }
        return;
      }
      if (j.kind === 'checkout' && j.url) {
        location.assign(j.url);
        return;
      }
      renderDone(j.when ?? formatSlotEs(S.slot), j.meetLink ?? null);
      track('booking_confirmed', { tipo: type });
      try { sessionStorage.removeItem(STORE); } catch { /* nada */ }
      setBusy(false);
    } catch {
      setBusy(false);
      track('booking_error', { tipo: type, status: 0 });
      setError(AVISOS.sinConexion);
    }
  }

  function renderDone(when: string, meetLink: string | null) {
    const first = S.form.fullName.trim().split(/\s+/)[0] ?? '';
    const h = $<HTMLElement>('[data-bk-done-h]');
    if (!h) return;
    if (first) h.textContent = AVISOS.done.replace('{nombre}', first);
    $<HTMLElement>('[data-bk-done-when]')!.textContent = AVISOS.cuando.replace('{when}', when);
    const local = $<HTMLElement>('[data-bk-done-local]')!;
    local.hidden = !(S.slot && S.localTz);
    local.textContent = S.slot && S.localTz ? `${formatTimeEs(S.slot, S.localTz)} ${AVISOS.local}` : '';
    const inv = $<HTMLElement>('[data-bk-done-inv]')!;
    const [a, b] = AVISOS.invitacion.split('{email}');
    const strong = document.createElement('strong');
    strong.textContent = S.form.email.trim();
    inv.replaceChildren(a, strong, b);
    const meet = $<HTMLAnchorElement>('[data-bk-meet]')!;
    if (meetLink && /^https:\/\//.test(meetLink)) {
      meet.href = meetLink;
      meet.hidden = false;
    } else meet.hidden = true;
    setNotice(null);
    goTo('done');
  }

  function focusFirstError() {
    const k = FIELD_ORDER.find((x) => S.errors[x as FieldKey]) as FieldKey | undefined;
    if (k) fieldEl(k)?.focus();
  }

  function firstEmpty(): HTMLElement | null {
    readForm();
    for (const k of FIELD_ORDER) {
      if (k === 'website') continue;
      if (!isPower && (k === 'timeDrains' || k === 'tools')) continue;
      const v = S.form[k as FieldKey];
      if (Array.isArray(v) ? !v.length : !String(v).trim()) return fieldEl(k as FieldKey);
    }
    return null;
  }

  // ── Oyentes ──
  form.addEventListener('input', (e) => {
    const t = e.target as HTMLElement & { name?: string };
    readForm();
    save();
    const name = (t.name ?? '').replace(/_(pais|lada|numero)$/, '') as FieldKey;
    if (name) clearError(name);
  });
  form.addEventListener('change', (e) => {
    const t = e.target as HTMLElement & { name?: string };
    if (t instanceof HTMLSelectElement) t.toggleAttribute('data-empty', !t.value);
    readForm();
    save();
    const name = (t.name ?? '').replace(/_(pais|lada|numero)$/, '') as FieldKey;
    if (name) clearError(name);
  });
  form.addEventListener('click', (e) => {
    const b = (e.target as HTMLElement).closest<HTMLButtonElement>('[data-drain]');
    if (!b || b.disabled) return;
    b.setAttribute('aria-pressed', String(b.getAttribute('aria-pressed') !== 'true'));
    syncDrains();
    readForm();
    save();
    clearError('timeDrains');
  });
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    readForm();
    S.errors = validateForm(type, S.form);
    renderErrors();
    if (Object.keys(S.errors).length) {
      track('booking_error', { tipo: type, step: 1, motivo: 'validacion' });
      focusFirstError();
      return;
    }
    goTo(2);
  });

  daysEl.addEventListener('click', (e) => {
    const b = (e.target as HTMLElement).closest<HTMLButtonElement>('.bk__day');
    if (b && !b.disabled) selectDay(b.dataset.date!);
  });
  daysEl.addEventListener('keydown', (e) => {
    const keys = ['ArrowLeft', 'ArrowRight', 'Home', 'End'];
    if (!keys.includes(e.key)) return;
    const btns = $$<HTMLButtonElement>('.bk__day').filter((b) => !b.disabled);
    if (!btns.length) return;
    const cur = btns.findIndex((b) => b.dataset.date === S.date);
    let next = cur;
    if (e.key === 'ArrowRight') next = (cur + 1) % btns.length;
    if (e.key === 'ArrowLeft') next = (cur - 1 + btns.length) % btns.length;
    if (e.key === 'Home') next = 0;
    if (e.key === 'End') next = btns.length - 1;
    e.preventDefault();
    selectDay(btns[next].dataset.date!, true);
  });
  slotsEl.addEventListener('click', (e) => {
    const b = (e.target as HTMLElement).closest<HTMLButtonElement>('.bk__slot');
    if (!b) return;
    S.slot = b.dataset.slot!;
    for (const x of $$<HTMLButtonElement>('.bk__slot')) x.setAttribute('aria-pressed', String(x === b));
    $<HTMLButtonElement>('[data-bk-continue]')!.disabled = false;
  });
  $<HTMLButtonElement>('[data-bk-retry]')!.addEventListener('click', () => void loadDays());
  $<HTMLButtonElement>('[data-bk-back]')!.addEventListener('click', () => goTo(1));
  $<HTMLButtonElement>('[data-bk-continue]')!.addEventListener('click', () => {
    if (!S.slot) return;
    setNotice(null);
    goTo(3);
  });
  $<HTMLButtonElement>('[data-bk-change]')!.addEventListener('click', () => goTo(2));
  $<HTMLButtonElement>('[data-bk-confirm]')!.addEventListener('click', () => void confirm());
  for (const a of $$<HTMLAnchorElement>('a[data-wa]')) {
    a.addEventListener('click', () => track('whatsapp_click', { section: `agenda-${type}` }));
  }

  // Evento de entrada (landings): el CTA "Agendar…" baja aquí y pide el foco.
  root.addEventListener('agenda:focus', () => {
    readAttribution();
    if (S.step === 1) (firstEmpty() ?? views.get(1)?.querySelector<HTMLElement>('[tabindex="-1"]'))?.focus({ preventScroll: true });
    else views.get(S.step)?.querySelector<HTMLElement>('[tabindex="-1"]')?.focus({ preventScroll: true });
  });

  // ── Inicio ──
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (tz && tz !== CDMX_TZ) S.localTz = tz;
  } catch { /* sin Intl */ }
  const desde = readAttribution();
  const hadSaved = restore();
  renderSteps();
  track('booking_view', { tipo: type, desde: desde || undefined });

  const params = new URLSearchParams(location.search);
  const apartado = params.get('apartado') ?? '';
  const cancelled = isPower && params.get('pago') === 'cancelado';
  if (cancelled) {
    // Regreso de Stripe sin pagar: primero se libera el apartado, después se leen los horarios.
    (async () => {
      if (EVENT_ID_RE.test(apartado)) {
        try {
          await fetch('/api/agenda/liberar/', {
            method: 'POST',
            headers: { 'content-type': 'application/json', accept: 'application/json' },
            body: JSON.stringify({ apartado }),
          });
        } catch { /* el cron lo libera */ }
      }
      try { history.replaceState(history.state, '', location.pathname); } catch { /* nada */ }
      setNotice(AVISOS.cancelado);
      const valid = hadSaved && !Object.keys(validateForm(type, S.form)).length;
      if (valid) {
        S.step = 2;
        renderSteps();
      }
      await loadDays();
      // Escritorio (columnas lado a lado): la sección #agenda. Angosto: el propio panel, para que el aviso y el paso 2 se vean.
      const wide = typeof matchMedia === 'function' && matchMedia('(min-width: 1024px)').matches;
      const target = (wide ? root.closest('#agenda') : null) ?? root;
      const go = () => {
        scrollToEl(target, false);
        views.get(S.step)?.querySelector<HTMLElement>('[tabindex="-1"]')?.focus({ preventScroll: true });
      };
      // Lenis lo crea cine.ts al cargar: se baja cuando la página ya pintó.
      if (document.readyState === 'complete') requestAnimationFrame(go);
      else addEventListener('load', () => requestAnimationFrame(go), { once: true });
    })();
  } else {
    void loadDays();
  }
}
