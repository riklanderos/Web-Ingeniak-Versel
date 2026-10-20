// src/scripts/cotizar/quote.ts — modal "Cotizar proyecto" (CAMBIO-COTIZAR §2.5, dueño "modal").
// Lo carga el binder de QuoteModal.astro con import() en el primer uso (o en requestIdleCallback) y llama open().
// Máquina de estados: form (pasos 1–3) → sending → done | fail (| form con errores del servidor, 422).
//   · Apertura: ingeniak:overlays-close + lock('cotizar', true) + borrador + prefill (solo campos vacíos) + foco al H2.
//   · Pasos: valida el paso, errores en línea + resumen con enlaces, foco al primer error; aria-live "Paso n de 3: …".
//   · Enter en un campo de una línea pasa al siguiente campo de texto ("Siguiente" del teclado del teléfono) y solo envía
//     el paso cuando ya no queda nada pendiente después (o en el último campo de texto): nunca marca campos no tocados.
//   · Borrador: sessionStorage['ingeniak-cotizar'] (sin consentimiento ni trampa), se borra al tener éxito.
//   · Envío: POST /api/cotizar/ con el contrato §3.2, submission_id reutilizado en reintentos, tiempo límite 20 s.
//     Mientras dice "Enviando…" no se cierra (Esc, X ni fondo) y el foco se queda en el botón (aria-disabled); si el
//     navegador lo cierra de todos modos, el resultado (éxito, falla con WhatsApp y correo, o 422) lo vuelve a abrir.
//   · Medición (§2.8): ingeniak:track sin texto escrito por la persona ni datos de contacto.
import cat from '../../data/cotizar.json';
import { lock, unlock, track, reducedMotion } from '../nav/overlay';
import { bindPhone } from '../forms/phone';
import { PASOS, ORDEN, pasoDe, sanear, validar, primerError, type Campo, type Datos, type Errores } from './validar';

type Origen = 'cta' | 'hash' | 'api';
export type OpenOpts = { trigger?: HTMLElement | null; servicio?: string; industria?: string; section?: string; origen?: Origen };
type Step = 1 | 2 | 3;
type State = 'form' | 'sending' | 'done' | 'fail';

const T = cat.textos;
const DRAFT_KEY = 'ingeniak-cotizar';
const ENDPOINT = '/api/cotizar/';
const TIMEOUT_MS = 20000;
const EMAIL = 'contacto@ingeniak.mx';
const WA_FALLBACK = 'https://wa.me/523321017799';
const d = document;

const labelOf = (list: { slug: string; label: string }[], slug: string) => list.find((x) => x.slug === slug)?.label ?? '';
const labelsOf = (list: { slug: string; label: string }[], slugs: string[]) => slugs.map((s) => labelOf(list, s)).filter(Boolean).join(', ');
const fill = (s: string, v: Record<string, string>) => s.replace(/\{(\w+)\}/g, (_, k) => v[k] ?? '');
const ssGet = (k: string): string | null => { try { return sessionStorage.getItem(k); } catch { return null; } };
const ssSet = (k: string, v: string) => { try { sessionStorage.setItem(k, v); } catch { /* almacenamiento bloqueado */ } };
const ssDel = (k: string) => { try { sessionStorage.removeItem(k); } catch { /* almacenamiento bloqueado */ } };
const ssJson = (k: string): Record<string, any> => { try { const v = JSON.parse(ssGet(k) || '{}'); return v && typeof v === 'object' ? v : {}; } catch { return {}; } };
const str = (v: unknown, max = 300) => (typeof v === 'string' ? v.slice(0, max) : '');

let ready = false;
let dlg: HTMLDialogElement;
let form: HTMLFormElement;
let body: HTMLElement;
let summary: HTMLElement;
let live: HTMLElement;
let nextBtn: HTMLButtonElement;
let nextT: HTMLElement;
let backBtn: HTMLButtonElement;
let closeBtn: HTMLButtonElement | null;
let countEl: HTMLElement | null;
let doneV: HTMLElement;
let failV: HTMLElement;
let retryBtn: HTMLButtonElement | null;
let phoneRoot: HTMLElement | null;
let waBase = WA_FALLBACK;

let step: Step = 1;
let state: State = 'form';
let trigger: HTMLElement | null = null;
let section = '';
let openedAt = 0;
let submissionId = '';
let restored = false;
let closingTimer = 0;
let draftTimer = 0;
let downOnBackdrop = false;
let isOpen = false;
let errs: Errores = {};

const $ = <E extends Element = HTMLElement>(s: string, r: ParentNode = dlg) => r.querySelector<E>(s);
const $$ = <E extends Element = HTMLElement>(s: string, r: ParentNode = dlg) => [...r.querySelectorAll<E>(s)];
const named = (n: string) => $$<HTMLInputElement>(`[name="${n}"]`, form);
const focusEl = (el: HTMLElement | null) => { try { el?.focus({ preventScroll: false }); } catch { /* elemento ya no existe */ } };
const say = (msg: string) => { live.textContent = ''; window.setTimeout(() => { live.textContent = msg; }, 60); };

/* ───────────────────────── Montaje ───────────────────────── */
function setup(): boolean {
  if (ready) return true;
  const el = d.querySelector<HTMLDialogElement>('dialog[data-cotizar-dialog]');
  if (!el) return false;
  dlg = el;
  form = $<HTMLFormElement>('[data-qm-form]')!;
  body = $('[data-qm-body]')!;
  summary = $('[data-qm-summary]')!;
  live = $('[data-qm-live]')!;
  nextBtn = $<HTMLButtonElement>('[data-qm-next]')!;
  nextT = $('[data-qm-next-t]')!;
  backBtn = $<HTMLButtonElement>('[data-qm-back]')!;
  closeBtn = $<HTMLButtonElement>('.qm__head [data-qm-close]');
  countEl = $('[data-qm-count]');
  doneV = $('[data-qm-done]')!;
  failV = $('[data-qm-fail]')!;
  retryBtn = $<HTMLButtonElement>('[data-qm-retry]');
  phoneRoot = $('[data-phone]', form);
  if (!form || !body || !nextBtn || !doneV || !failV) return false;
  try { const a = $<HTMLAnchorElement>('[data-qm-atajo]'); if (a?.href) { const u = new URL(a.href); waBase = u.origin + u.pathname; } } catch { /* sin atajo: número del sitio */ }
  if (phoneRoot) bindPhone(phoneRoot);

  form.addEventListener('submit', onSubmit);
  form.addEventListener('input', onEdit);
  form.addEventListener('change', onEdit);
  form.addEventListener('keydown', onEnter);
  // La tecla Enter del teclado del teléfono dice lo que hará: "Siguiente" o "Enviar" (se fija al enfocar el campo).
  form.addEventListener('focusin', (e) => {
    const t = e.target as Element;
    if (isLinea(t)) t.enterKeyHint = enterEnvia(t) ? (step === 3 ? 'send' : 'go') : 'next';
  });
  backBtn.addEventListener('click', () => { if (step > 1) showStep((step - 1) as Step); });
  dlg.addEventListener('cancel', (e) => { e.preventDefault(); close(); });
  // Un evento close atrasado (llega después de reabrir con el resultado del envío) no cierra el diálogo reabierto.
  dlg.addEventListener('close', () => { if (!dlg.open) onClosed(); });
  dlg.addEventListener('pointerdown', (e) => { downOnBackdrop = e.target === dlg; });
  dlg.addEventListener('click', (e) => {
    const t = e.target as HTMLElement;
    if (t === dlg) { if (downOnBackdrop) close(); return; }
    if (t.closest('[data-qm-close]')) { close(); return; }
    const wa = t.closest<HTMLAnchorElement>('[data-qm-wa]');
    if (wa) { track('whatsapp_click', { section: `cotizar-${wa.dataset.qmWa}` }); return; }
    if (t.closest('[data-qm-atajo]')) { track('whatsapp_click', { section: 'cotizar-atajo' }); setTimeout(close, 0); return; }
    if (t.closest('[data-qm-retry]')) { void send(); return; }
    if (t.closest('[data-qm-review]')) { if (state !== 'sending') showForm(3); return; }
    const link = t.closest<HTMLAnchorElement>('[data-qm-err]');
    if (link) { e.preventDefault(); focusField(link.dataset.qmErr as Campo); }
  });
  // Radios opcionales ([data-deselect], p. ej. CRM): un segundo clic sobre la opción marcada la desmarca.
  form.addEventListener('pointerdown', (e) => {
    const r = (e.target as HTMLElement).closest('label')?.querySelector<HTMLInputElement>('input[type=radio]');
    if (r && r.closest('[data-deselect]')) r.dataset.was = r.checked ? '1' : '';
  });
  form.addEventListener('click', (e) => {
    const r = e.target as HTMLInputElement;
    if (r.type !== 'radio' || !r.closest('[data-deselect]')) return;
    if (r.dataset.was === '1') { r.checked = false; r.dispatchEvent(new Event('change', { bubbles: true })); }
    r.dataset.was = '';
  });
  // Móvil: el campo enfocado queda a la vista entre el encabezado y el pie, aunque abra el teclado.
  body.addEventListener('focusin', (e) => {
    const el = e.target as HTMLElement;
    if (!matchMedia('(max-width: 767px)').matches || !el.matches('input:not([type=checkbox]):not([type=radio]),select,textarea')) return;
    window.setTimeout(() => {
      const vv = window.visualViewport;
      const r = el.getBoundingClientRect();
      const b = body.getBoundingClientRect();
      const top = Math.max(b.top, vv?.offsetTop ?? 0);
      const bottom = Math.min(b.bottom, (vv?.offsetTop ?? 0) + (vv?.height ?? innerHeight));
      if (r.top < top + 8 || r.bottom > bottom - 8) el.scrollIntoView({ block: 'center', behavior: reducedMotion() ? 'auto' : 'smooth' });
    }, 320);
  });
  ready = true;
  return true;
}

/* ───────────────────────── Abrir y cerrar ───────────────────────── */
export function open(o: OpenOpts = {}) {
  if (!setup()) return;
  const t = o.trigger ?? null;
  if (dlg.open && !dlg.hasAttribute('data-closing')) { if (state === 'form') prefill(t, o); return; }
  window.clearTimeout(closingTimer);
  dlg.removeAttribute('data-closing');
  const active = d.activeElement as HTMLElement | null;
  trigger = t ?? (active && active !== d.body && !dlg.contains(active) ? active : null);
  section = t?.dataset.section ?? o.section ?? '';
  if (!restored) { restoreDraft(); restored = true; }
  const pre = state === 'form' ? prefill(t, o) : {};
  d.dispatchEvent(new CustomEvent('ingeniak:overlays-close'));
  lock('cotizar', true);
  if (!openedAt) openedAt = performance.now();
  if (!dlg.open) { try { dlg.showModal(); } catch { dlg.setAttribute('open', ''); } }
  isOpen = true;
  if (state === 'done') { focusEl($('#qm-done-h')); }
  else if (state === 'fail') { focusEl($('#qm-fail-h')); }
  else { showStep(step, false); focusEl($('#qm-title')); }
  track('cotizar_open', { section, origen: o.origen ?? 'api', ...pre });
}

export function close() {
  if (!ready || !dlg.open || dlg.hasAttribute('data-closing')) return;
  // Con "Enviando…" no se cierra: si la respuesta falla, la persona tiene que ver la falla con WhatsApp y correo.
  if (state === 'sending') { say(T.enviando); return; }
  // La limpieza no depende solo del evento 'close' (asíncrono): onClosed es idempotente y corre en ambos caminos.
  const finish = () => { if (dlg.open) dlg.close(); onClosed(); };
  if (reducedMotion()) { finish(); return; }
  dlg.setAttribute('data-closing', '');
  closingTimer = window.setTimeout(finish, 200);
}

function onClosed() {
  window.clearTimeout(closingTimer);
  if (dlg.open) dlg.close();
  dlg.removeAttribute('data-closing');
  if (!isOpen) return;
  isOpen = false;
  unlock('cotizar');
  const done = state === 'done';
  track('cotizar_close', { step, done });
  if (location.hash === '#cotizar') {
    try { history.replaceState(history.state, '', location.pathname + location.search); } catch { /* sin history */ }
  }
  const t = trigger;
  if (state !== 'sending') trigger = null;
  if (t && t.isConnected && !t.closest('[inert]')) { try { t.focus({ preventScroll: true }); } catch { /* sin foco */ } }
  if (done) reset();
}

/* ───────────────────────── Prefill (§1.3) ───────────────────────── */
const SERV = new Set(cat.servicios.map((s) => s.slug));
const IND = new Set(cat.industrias.map((s) => s.slug));
const EXCL = cat.servicios.find((s: any) => s.exclusive)?.slug ?? 'no-seguro';
function nearest(t: HTMLElement | null, attr: string): string {
  const from = t ?? d.body;
  return (from.closest(`[${attr}]`)?.getAttribute(attr) ?? '').trim();
}
function prefill(t: HTMLElement | null, o: OpenOpts): { servicio?: string; industria?: string } {
  const out: { servicio?: string; industria?: string } = {};
  const sRaw = (t ? nearest(t, 'data-cotizar-servicio') : '') || o.servicio || nearest(null, 'data-cotizar-servicio');
  const iRaw = (t ? nearest(t, 'data-cotizar-industria') : '') || o.industria || nearest(null, 'data-cotizar-industria');
  let slugs = sRaw.split(/[\s,]+/).filter((s) => SERV.has(s));
  if (slugs.includes(EXCL)) slugs = [EXCL];
  if (slugs.length) {
    out.servicio = slugs.join(' ');
    const boxes = named('servicios');
    if (!boxes.some((b) => b.checked)) boxes.forEach((b) => { b.checked = slugs.includes(b.value); });
  }
  if (IND.has(iRaw)) {
    out.industria = iRaw;
    const sel = form.elements.namedItem('industria') as HTMLSelectElement | null;
    if (sel && !sel.value) { sel.value = iRaw; markSelect(sel); }
  }
  return out;
}

/* ───────────────────────── Borrador ───────────────────────── */
const NO_DRAFT = new Set(['consentimiento', 'website_url']);
function serialize(): Record<string, string | string[]> {
  const out: Record<string, string | string[]> = {};
  for (const el of $$<HTMLInputElement>('input[name],select[name],textarea[name]', form)) {
    const n = el.name;
    if (NO_DRAFT.has(n)) continue;
    if (el.type === 'checkbox') { const a = (out[n] as string[]) ?? []; if (el.checked) a.push(el.value); out[n] = a; }
    else if (el.type === 'radio') { if (el.checked) out[n] = el.value; else if (!(n in out)) out[n] = ''; }
    else out[n] = el.value;
  }
  return out;
}
function saveDraft() {
  window.clearTimeout(draftTimer);
  draftTimer = window.setTimeout(() => { if (state !== 'done') ssSet(DRAFT_KEY, JSON.stringify({ v: 1, f: serialize() })); }, 250);
}
function restoreDraft() {
  const f = ssJson(DRAFT_KEY).f as Record<string, string | string[]> | undefined;
  if (!f || typeof f !== 'object') return;
  for (const el of $$<HTMLInputElement>('input[name],select[name],textarea[name]', form)) {
    const n = el.name;
    if (NO_DRAFT.has(n) || !(n in f)) continue;
    const v = f[n];
    if (el.type === 'checkbox') el.checked = Array.isArray(v) && v.includes(el.value);
    else if (el.type === 'radio') el.checked = v === el.value;
    else if (typeof v === 'string') el.value = v.slice(0, 2000);
  }
  phoneRoot?.querySelector('select')?.dispatchEvent(new Event('change'));
  const sel = form.elements.namedItem('industria') as HTMLSelectElement | null;
  if (sel) markSelect(sel);
  updateCount();
}

/* ───────────────────────── Datos ───────────────────────── */
function collect(): Datos {
  const fd = new FormData(form);
  const g = (k: string) => String(fd.get(k) ?? '');
  const sel = phoneRoot?.querySelector<HTMLSelectElement>('select[name$="_pais"]');
  const pais = sel?.value ?? 'mx';
  const lada = pais === 'otro'
    ? phoneRoot?.querySelector<HTMLInputElement>('input[name$="_lada"]')?.value ?? ''
    : sel?.selectedOptions?.[0]?.dataset.lada ?? '';
  return {
    servicios: fd.getAll('servicios').map(String),
    objetivo: g('objetivo'),
    industria: g('industria'),
    tamano: g('tamano'),
    presupuesto: g('presupuesto'),
    plazo: g('plazo'),
    canales: fd.getAll('canales').map(String),
    crm: g('crm'),
    nombre: g('nombre'),
    empresa: g('empresa'),
    telefono: { pais, lada, numero: phoneRoot?.querySelector<HTMLInputElement>('input[name$="_numero"]')?.value ?? '' },
    email: g('email'),
    canal_preferido: g('canal_preferido'),
    sitio: g('sitio'),
    vision: g('vision'),
    consentimiento: (form.elements.namedItem('consentimiento') as HTMLInputElement | null)?.checked === true,
  };
}

/* ───────────────────────── Errores ───────────────────────── */
const GROUPS = new Set<Campo>(['servicios', 'objetivo', 'tamano', 'presupuesto', 'plazo', 'canales', 'crm', 'canal_preferido']);
function controlsOf(c: Campo): HTMLElement[] {
  if (GROUPS.has(c)) return named(c);
  if (c === 'telefono') return $$('input[name$="_numero"],input[name$="_lada"]', phoneRoot ?? form);
  const el = d.getElementById(`qm-${c}`);
  return el ? [el] : [];
}
const firstControl = (c: Campo): HTMLElement | null => {
  const list = controlsOf(c).filter((x) => !(x as HTMLInputElement).disabled && !x.hidden);
  if (GROUPS.has(c)) return (list.find((x) => (x as HTMLInputElement).checked) ?? list[0]) ?? null;
  if (c === 'telefono' && errs.telefono === cat.errores.telefonoLada) return list.find((x) => (x as HTMLInputElement).name.endsWith('_lada')) ?? list[0] ?? null;
  return list.find((x) => (x as HTMLInputElement).name?.endsWith('_numero')) ?? list[0] ?? null;
};
function errId(c: Campo) { return c === 'telefono' ? (phoneRoot ? `${phoneRoot.id.replace(/-fld$/, '')}-error` : 'qm-telefono-error') : `qm-${c}-error`; }
function setError(c: Campo, msg: string | null) {
  const root = form.querySelector<HTMLElement>(`[data-field="${c}"]`);
  const p = d.getElementById(errId(c));
  root?.toggleAttribute('data-invalid', !!msg);
  if (p) { p.textContent = msg ?? ''; p.hidden = !msg; }
  for (const el of controlsOf(c)) {
    const ids = (el.getAttribute('aria-describedby') ?? '').split(/\s+/).filter((x) => x && x !== errId(c));
    if (msg) { el.setAttribute('aria-invalid', 'true'); ids.push(errId(c)); }
    else el.removeAttribute('aria-invalid');
    if (ids.length) el.setAttribute('aria-describedby', ids.join(' ')); else el.removeAttribute('aria-describedby');
  }
  if (msg) errs[c] = msg; else delete errs[c];
}
function applyErrors(campos: readonly Campo[], e: Errores) {
  for (const c of campos) setError(c, e[c] ?? null);
}
function renderSummary() {
  const list = PASOS[step].filter((c) => errs[c]);
  if (!list.length) { summary.hidden = true; summary.textContent = ''; return; }
  summary.innerHTML = '';
  const p = d.createElement('p');
  p.className = 'form-summary__t';
  p.textContent = list.length === 1 ? T.resumenErroresUno : fill(T.resumenErrores, { n: String(list.length) });
  const ul = d.createElement('ul');
  for (const c of list) {
    const li = d.createElement('li');
    const a = d.createElement('a');
    a.href = `#${c === 'telefono' ? 'qm-telefono' : `qm-${c}`}`;
    a.dataset.qmErr = c;
    a.textContent = errs[c]!;
    li.append(a);
    ul.append(li);
  }
  summary.append(p, ul);
  summary.hidden = false;
}
function focusField(c?: Campo) {
  if (!c) return;
  const el = firstControl(c);
  if (!el) return;
  try { el.focus({ preventScroll: true }); } catch { /* sin foco */ }
  // Si el campo cabe en la primera pantalla del cuerpo, se ve también el resumen (arriba); si no, el campo va al centro.
  const box = (el.closest('.fld') as HTMLElement | null) ?? el;
  const top = box.getBoundingClientRect().top - body.getBoundingClientRect().top + body.scrollTop;
  const behavior: ScrollBehavior = reducedMotion() ? 'auto' : 'smooth';
  if (top + Math.min(box.offsetHeight, 160) + 24 <= body.clientHeight) body.scrollTo({ top: 0, behavior });
  else box.scrollIntoView({ block: 'center', behavior });
}
const campoDe = (name: string): Campo | null => {
  if (name.startsWith('telefono_')) return 'telefono';
  return (ORDEN as string[]).includes(name) ? (name as Campo) : null;
};

/* ───────────────────────── Edición ───────────────────────── */
function onEdit(e: Event) {
  const t = e.target as HTMLInputElement;
  if (!t?.name || t.name === 'website_url') return;
  if (t.name === 'servicios' && t.checked && e.type === 'change') {
    const excl = t.hasAttribute('data-exclusive');
    named('servicios').forEach((b) => { if (b !== t && (excl || b.hasAttribute('data-exclusive'))) b.checked = false; });
  }
  if (t.localName === 'select') markSelect(t as unknown as HTMLSelectElement);
  if (t.name === 'vision') updateCount();
  const c = campoDe(t.name);
  if (c && errs[c]) {
    const again = validar(sanear(collect()), [c]);
    if (again[c] !== errs[c]) { setError(c, again[c] ?? null); renderSummary(); }
  }
  saveDraft();
}
function markSelect(s: HTMLSelectElement) { s.toggleAttribute('data-empty', !s.value); }
function updateCount() {
  const ta = form.elements.namedItem('vision') as HTMLTextAreaElement | null;
  const out = $('[data-qm-count-for="vision"]');
  if (!ta || !out) return;
  const n = [...ta.value].length;
  out.textContent = `${n} / ${cat.limites.vision}`;
  out.toggleAttribute('data-near', n > cat.limites.vision * 0.9);
}

/* ───────────────────────── Enter entre campos ───────────────────────── */
// En el teclado del teléfono, Enter es "Siguiente": pasa al siguiente campo de texto del paso en vez de enviar el paso
// (enviarlo marcaría en ámbar campos que la persona aún no ha tocado). Enter envía el paso, como siempre, en el último
// campo de texto o cuando todo lo que sigue ya está bien (p. ej. al corregir un campo). Ctrl/⌘ + Enter siempre envía.
const LINEA = 'input:not([type=checkbox]):not([type=radio]):not([type=hidden]):not([type=submit]):not([type=button])';
const isLinea = (el: Element | null): el is HTMLInputElement => !!el && el.localName === 'input' && el.matches(LINEA);
function camposDeTexto(): HTMLElement[] {
  const sec = $(`[data-qm-step="${step}"]`, form);
  if (!sec) return [];
  return $$<HTMLInputElement>(`${LINEA},textarea`, sec).filter((x) => !x.disabled && !x.hidden && !x.closest('[hidden]'));
}
function siguienteCampo(el: HTMLInputElement): HTMLElement | null {
  const list = camposDeTexto();
  const i = list.indexOf(el);
  return i >= 0 ? list[i + 1] ?? null : null;
}
function enterEnvia(el: HTMLInputElement): boolean {
  const next = siguienteCampo(el);
  if (!next) return true;
  const c = campoDe(el.name);
  if (!c || campoDe((next as HTMLInputElement).name) === c) return false; // lada → número del mismo teléfono
  const campos = PASOS[step];
  const despues = campos.slice(campos.indexOf(c) + 1);
  return !Object.keys(validar(sanear(collect()), despues)).length;
}
function onEnter(e: KeyboardEvent) {
  if (e.key !== 'Enter' || e.isComposing || e.ctrlKey || e.metaKey || e.altKey || e.shiftKey) return;
  const t = e.target as Element;
  if (!isLinea(t) || state === 'sending' || enterEnvia(t)) return; // envío implícito: valida el paso
  e.preventDefault();
  focusEl(siguienteCampo(t));
}

/* ───────────────────────── Pasos ───────────────────────── */
function showStep(n: Step, announce = true) {
  step = n;
  dlg.dataset.step = String(n);
  for (const s of $$('[data-qm-step]', form)) s.hidden = Number(s.dataset.qmStep) !== n;
  $$('[data-qm-prog] li').forEach((li) => {
    const k = Number(li.dataset.n);
    if (k === n) li.setAttribute('aria-current', 'step'); else li.removeAttribute('aria-current');
    li.toggleAttribute('data-done', k < n);
  });
  backBtn.hidden = n === 1;
  nextT.textContent = n === 3 ? T.enviar : T.continuar;
  if (countEl) countEl.textContent = fill(T.pasoDe, { n: String(n) });
  renderSummary();
  body.scrollTop = 0;
  if (announce) {
    say(`${fill(T.pasoDe, { n: String(n) })}: ${cat.pasos[n - 1].titulo}`);
    focusEl($(`#qm-s${n}-h`));
    track('cotizar_step', { step: n });
  }
}
function showForm(n: Step) {
  state = 'form';
  delete dlg.dataset.state;
  failV.hidden = true;
  doneV.hidden = true;
  form.hidden = false;
  showStep(n);
}

function onSubmit(e: SubmitEvent) {
  e.preventDefault();
  if (state === 'sending') return;
  const data = sanear(collect());
  const found = validar(data, PASOS[step]);
  applyErrors(PASOS[step], found);
  renderSummary();
  if (Object.keys(found).length) {
    focusField(primerError(found));
    return;
  }
  if (step < 3) { showStep((step + 1) as Step); return; }
  const all = validar(data);
  if (Object.keys(all).length) { jumpToErrors(all); return; }
  void send();
}
function jumpToErrors(e: Errores) {
  applyErrors(ORDEN, e);
  const first = primerError(e);
  if (!first) return;
  showForm(pasoDe(first));
  renderSummary();
  focusField(first);
}

/* ───────────────────────── Envío ───────────────────────── */
function uuid(): string {
  try { if (crypto.randomUUID) return crypto.randomUUID(); } catch { /* contexto no seguro */ }
  const b = new Uint8Array(16);
  try { crypto.getRandomValues(b); } catch { for (let i = 0; i < 16; i++) b[i] = Math.floor(Math.random() * 256); }
  b[6] = (b[6] & 0x0f) | 0x40; b[8] = (b[8] & 0x3f) | 0x80;
  const h = [...b].map((x) => x.toString(16).padStart(2, '0')).join('');
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}
const folioDe = (id: string) => `IK-${id.replace(/-/g, '').slice(0, 6).toUpperCase()}`;
function folioPagina(): string {
  const b = d.body.dataset;
  return b.folio ?? d.querySelector<HTMLElement>('main [data-folio]')?.dataset.folio ?? b.page ?? '';
}
function zona(): string { try { return Intl.DateTimeFormat().resolvedOptions().timeZone ?? ''; } catch { return ''; } }

function payload(data: Datos) {
  const utm = ssJson('ingeniak-utm');
  const clid = ssJson('ingeniak-clid');
  const landing = ssJson('ingeniak-landing');
  const hp = (form.elements.namedItem('website_url') as HTMLInputElement | null)?.value ?? '';
  return {
    submission_id: submissionId,
    servicios: data.servicios,
    objetivo: data.objetivo,
    industria: data.industria,
    tamano: data.tamano,
    presupuesto: data.presupuesto,
    plazo: data.plazo,
    canales: data.canales,
    crm: data.crm,
    nombre: data.nombre,
    empresa: data.empresa,
    telefono: { pais: data.telefono.pais, lada: data.telefono.lada ?? '', numero: data.telefono.numero },
    email: data.email,
    canal_preferido: data.canal_preferido,
    sitio: data.sitio,
    vision: data.vision,
    consentimiento: data.consentimiento,
    meta: {
      pagina: location.pathname,
      folio: str(folioPagina(), 40),
      cta: str(section, 40),
      src: str(ssGet('ingeniak-src'), 120),
      landing: str(landing.path, 300),
      referrer: str(landing.referrer, 300),
      utm_source: str(utm.utm_source, 120),
      utm_medium: str(utm.utm_medium, 120),
      utm_campaign: str(utm.utm_campaign, 120),
      utm_term: str(utm.utm_term, 120),
      utm_content: str(utm.utm_content, 120),
      gclid: str(clid.gclid, 200),
      fbclid: str(clid.fbclid, 200),
      zona: zona(),
      t_llenado_ms: openedAt ? Math.max(0, Math.round(performance.now() - openedAt)) : 0,
      hp: hp.slice(0, 200),
    },
  };
}

function busy(on: boolean) {
  const btn = state === 'fail' || !failV.hidden ? retryBtn : nextBtn;
  // El botón del envío NO se deshabilita (perdería el foco y el lector y el teclado quedarían en <body>): queda
  // aria-disabled + aria-busy y recibe el foco si venía de un campo (Enter); onSubmit y send() ignoran el doble envío.
  if (on && btn && d.activeElement !== btn) { try { btn.focus({ preventScroll: true }); } catch { /* sin foco */ } }
  for (const b of [nextBtn, retryBtn]) {
    if (!b) continue;
    const mine = b === btn && on;
    b.disabled = false;
    for (const a of ['aria-disabled', 'aria-busy']) { if (mine) b.setAttribute(a, 'true'); else b.removeAttribute(a); }
  }
  if (on) closeBtn?.setAttribute('aria-disabled', 'true'); else closeBtn?.removeAttribute('aria-disabled');
  if (btn === nextBtn) nextT.textContent = on ? T.enviando : step === 3 ? T.enviar : T.continuar;
  const rt = $('[data-qm-retry-t]');
  if (btn === retryBtn && rt) rt.textContent = on ? T.enviando : T.falla.reintentar;
  body.inert = on;
  backBtn.inert = on;
  dlg.toggleAttribute('data-busy', on);
}

async function send() {
  if (state === 'sending') return;
  const data = sanear(collect());
  const all = validar(data);
  if (Object.keys(all).length) { jumpToErrors(all); return; }
  if (!submissionId) submissionId = uuid();
  const prev = state;
  busy(true);
  state = 'sending';
  dlg.dataset.state = prev === 'fail' ? 'fail' : 'sending';
  say(T.enviando);
  track('cotizar_submit', { step: 3 });
  let res: Response | null = null;
  let json: any = {};
  const ctl = new AbortController();
  const timer = window.setTimeout(() => ctl.abort(), TIMEOUT_MS);
  try {
    res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload(data)),
      credentials: 'same-origin',
      signal: ctl.signal,
    });
    json = await res.json().catch(() => ({}));
  } catch { res = null; }
  window.clearTimeout(timer);
  state = prev === 'fail' ? 'fail' : 'form';
  busy(false);
  if (res && res.ok && json?.ok) success(json, data);
  else if (res?.status === 422 && json?.errors && typeof json.errors === 'object') invalid(json.errors);
  else fail(res?.status ?? 0, data);
  // El navegador puede cerrar el diálogo aunque se cancele Esc (segundo Esc sin interacción): el resultado se ve igual.
  // Se mira dlg.open (no isOpen): el evento close puede no haber llegado todavía.
  if (ready && !dlg.open) open({ origen: 'api', trigger });
}

function success(json: any, data: Datos) {
  state = 'done';
  dlg.dataset.state = 'done';
  window.clearTimeout(draftTimer);
  ssDel(DRAFT_KEY);
  const folio = typeof json.folio === 'string' && json.folio ? json.folio : folioDe(submissionId);
  const nombre = data.nombre.split(' ')[0] ?? '';
  const hola = $('[data-qm-hola]');
  if (hola) hola.textContent = nombre ? fill(T.exito.hola, { nombre }) : T.exito.hola.replace(', {nombre}', '');
  const fo = $('[data-qm-folio]');
  if (fo) fo.textContent = fill(T.exito.folio, { folio });
  const sim = $('[data-qm-sim]');
  if (sim) sim.hidden = json.dryRun !== true;
  const canal = (T.exito.canal as Record<string, string>)[data.canal_preferido] ?? T.exito.canal.whatsapp;
  const s2 = $('[data-qm-sigue="1"]');
  if (s2) s2.textContent = fill(T.exito.pasos[1], { canal });
  const wa = $<HTMLAnchorElement>('[data-qm-wa="exito"]');
  if (wa) wa.href = `${waBase}?text=${encodeURIComponent(fill(T.waExito, { folio, servicios: labelsOf(cat.servicios, data.servicios) }))}`;
  form.hidden = true;
  failV.hidden = true;
  doneV.hidden = false;
  $$('[data-qm-prog] li').forEach((li) => { li.removeAttribute('aria-current'); li.setAttribute('data-done', ''); });
  doneV.scrollTop = 0;
  focusEl($('#qm-done-h'));
  say(T.exito.h);
  track('cotizar_success', { dryRun: json.dryRun === true });
  submissionId = '';
  openedAt = 0;
}

function invalid(serverErrors: Record<string, unknown>) {
  const e: Errores = {};
  for (const [k, v] of Object.entries(serverErrors)) {
    const c = campoDe(k);
    if (c) e[c] = typeof v === 'string' && v ? v : cat.errores[c as keyof typeof cat.errores] ?? 'Revisa esta respuesta.';
  }
  track('cotizar_error', { status: 422 });
  if (!Object.keys(e).length) { fail(422, sanear(collect())); return; }
  jumpToErrors(e);
}

function resumen(data: Datos): string {
  const L = (k: string, v: string) => (v ? `${k}: ${v}` : '');
  const tel = data.telefono.lada && data.telefono.numero ? `${data.telefono.lada}${data.telefono.numero}` : '';
  const lines = [
    'Hola, quise pedir una cotización en ingeniak.mx y el formulario no se envió. Estos son mis datos:',
    '',
    L('Servicios', labelsOf(cat.servicios, data.servicios)),
    L('Qué quiero lograr primero', labelOf(cat.objetivos, data.objetivo)),
    L('Industria', labelOf(cat.industrias, data.industria)),
    L('Personas en el equipo', labelOf(cat.tamanos, data.tamano)),
    L('Presupuesto estimado', labelOf(cat.presupuestos, data.presupuesto)),
    L('Plazo', labelOf(cat.plazos, data.plazo)),
    L('Canales que usamos hoy', labelsOf(cat.canales, data.canales)),
    L('CRM actual', labelOf(cat.crms, data.crm)),
    '',
    L('Nombre', data.nombre),
    L('Empresa', data.empresa),
    L('WhatsApp', tel),
    L('Correo', data.email),
    L('Prefiero que me contacten por', labelOf(cat.canalesPreferidos, data.canal_preferido)),
    L('Sitio o redes', data.sitio),
    L('Mi proyecto', data.vision),
  ];
  return lines.filter((l, i, a) => l !== '' || (i > 0 && a[i - 1] !== '')).join('\r\n').trim();
}

function fail(status: number, data: Datos) {
  state = 'fail';
  dlg.dataset.state = 'fail';
  const muchos = status === 429;
  const p = $('[data-qm-fail-p]');
  if (p) p.textContent = muchos ? T.falla.muchos : T.falla.p;
  if (retryBtn) retryBtn.hidden = muchos;
  const wa = $<HTMLAnchorElement>('[data-qm-wa="falla"]');
  if (wa) {
    const txt = fill(T.waFalla, {
      empresa: data.empresa || '—',
      servicios: labelsOf(cat.servicios, data.servicios) || '—',
      presupuesto: labelOf(cat.presupuestos, data.presupuesto) || '—',
      plazo: labelOf(cat.plazos, data.plazo) || '—',
    });
    wa.href = `${waBase}?text=${encodeURIComponent(txt)}`;
  }
  const mail = $<HTMLAnchorElement>('[data-qm-mail]');
  if (mail) mail.href = `mailto:${EMAIL}?subject=${encodeURIComponent(fill(T.mailAsunto, { empresa: data.empresa || 'sin empresa' }))}&body=${encodeURIComponent(resumen(data))}`;
  const wasHidden = failV.hidden;
  form.hidden = true;
  doneV.hidden = true;
  failV.hidden = false;
  if (wasHidden) failV.scrollTop = 0;
  focusEl($('#qm-fail-h'));
  say(`${T.falla.h}. ${muchos ? T.falla.muchos : T.falla.p}`);
  track('cotizar_error', { status });
}

/* ───────────────────────── Reinicio (después del éxito) ───────────────────────── */
function reset() {
  form.reset();
  for (const c of ORDEN) setError(c, null);
  errs = {};
  summary.hidden = true;
  summary.textContent = '';
  state = 'form';
  delete dlg.dataset.state;
  form.hidden = false;
  doneV.hidden = true;
  failV.hidden = true;
  submissionId = '';
  openedAt = 0;
  phoneRoot?.querySelector('select')?.dispatchEvent(new Event('change'));
  const sel = form.elements.namedItem('industria') as HTMLSelectElement | null;
  if (sel) markSelect(sel);
  updateCount();
  showStep(1, false);
}
