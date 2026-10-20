// src/scripts/nav/search.ts — ⌘K "Busca o pregúntale a Kain" (ESPEC §4.3). Se importa con import() al primer uso.
// Índice estático /indice.json (sitemap.json + banco de FAQ). Buscador propio: prefijo y palabras, sin acentos.
// Grupos: Páginas · Servicios · Casos · Preguntas · Acciones. ↑↓ moverse · Enter abrir · Tab cambiar de grupo · Esc cerrar.
import { lock, unlock, track } from './overlay';

type PageDoc = { u: string; t: string; h: string; k: string; s: string; g: string; f: string; d: string };
type FaqDoc = { id: string; q: string; a: string; u: string };
type Index = { pages: PageDoc[]; faq: FaqDoc[] };
type Prepared<T> = { doc: T; fields: { toks: string[]; w: number }[]; folio?: string; slug?: string };

const STOP = new Set('a al como con de del el en es la las lo los mi mis o para por que se sin su sus tu tus un una unos y yo me te le hay qué'.split(' '));
export const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9ñ]+/g, ' ').trim();
const toks = (s: string) => norm(s).split(' ').filter(Boolean);
const qtoks = (s: string) => {
  const all = toks(s);
  const t = all.filter((x) => !STOP.has(x));
  return t.length ? t : all;
};

let index: Index | null = null;
let loading: Promise<Index | null> | null = null;
let P: Prepared<PageDoc>[] = [];
let F: Prepared<FaqDoc>[] = [];

export function loadIndex() {
  if (index) return Promise.resolve(index);
  loading ??= fetch('/indice.json', { credentials: 'same-origin' })
    .then((r) => (r.ok ? r.json() : null))
    .then((j: Index | null) => {
      if (!j) return null;
      index = j;
      P = j.pages.map((d) => ({ doc: d, folio: d.f, slug: norm(d.u.split('/').filter(Boolean).pop() ?? ''), fields: [{ toks: toks(d.t), w: 4 }, { toks: toks(d.h), w: 3 }, { toks: toks(d.k), w: 2.5 }, { toks: toks(d.s), w: 1.2 }, { toks: toks(d.d), w: .6 }, { toks: toks(d.u.replace(/[/-]/g, ' ')), w: 1 }] }));
      F = j.faq.map((d) => ({ doc: d, fields: [{ toks: toks(d.q), w: 3 }, { toks: toks(d.a), w: .8 }] }));
      return j;
    })
    .catch(() => null);
  return loading;
}

function score<T>(p: Prepared<T>, q: string[], raw: string): { s: number; hit: number } {
  if (p.folio && /^\d{3}$/.test(raw.trim()) && p.folio === raw.trim()) return { s: 100, hit: q.length };
  let s = 0, hit = 0;
  for (const t of q) {
    let best = 0;
    for (const f of p.fields) {
      for (const w of f.toks) {
        let v = 0;
        if (w === t) v = 1;
        else if (t.length >= 2 && w.startsWith(t)) v = .75;
        else if (t.length >= 4 && w.includes(t)) v = .35;
        else if (w.length >= 4 && t.startsWith(w)) v = .5;    // "agentes" ↔ "agente"
        if (v * f.w > best) best = v * f.w;
      }
    }
    if (best > 0) hit++;
    s += best;
  }
  // La página cuyo slug ES lo que se escribió va primero ("kommo" → /kommo/, "seo" → /servicios/seo/, "blog" → /blog/).
  if (p.slug && hit === q.length && p.slug === q.join(' ')) s += 2;
  return { s, hit };
}

function rank<T>(list: Prepared<T>[], q: string[], raw: string, max: number) {
  const all = list.map((p) => ({ p, ...score(p, q, raw) })).filter((r) => r.s > 0);
  let strict = all.filter((r) => r.hit === q.length);
  if (!strict.length) strict = all.filter((r) => r.hit >= Math.max(1, Math.ceil(q.length * .5)));
  return strict.sort((a, b) => b.s - a.s).slice(0, max).map((r) => ({ doc: r.p.doc, s: r.s }));
}

// ---------------------------------------------------------------- UI
let dlg: HTMLDialogElement;
let input: HTMLInputElement;
let list: HTMLElement;
let status: HTMLElement;
let staticHTML = '';
let waIcon = '';
/** Acción fija «Cotizar proyecto» (SearchDialog.astro, #sd-a-0): data-cotizar data-section="buscador" + subtítulo
 *  _comun.cta.cotizarSub. Se clona en cada búsqueda para no escribir aquí la etiqueta (CAMBIO-COTIZAR §1.4). */
let quoteOpt: HTMLElement | null = null;
let active = -1;
let setup = false;
let tRender = 0;

const h = (tag: string, cls?: string, txt?: string) => { const e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; };

function mark(text: string, q: string[]) {
  const frag = document.createDocumentFragment();
  if (!q.length) { frag.append(text); return frag; }
  const words = text.split(/(\s+)/);
  for (const w of words) {
    const nw = norm(w);
    const m = nw && q.find((t) => nw.startsWith(t) || (t.length >= 4 && nw.includes(t)));
    if (m && /\S/.test(w)) { const mk = h('mark'); mk.textContent = w; frag.append(mk); } else frag.append(w);
  }
  return frag;
}

const options = () => [...list.querySelectorAll<HTMLElement>('[role="option"]')];
const groupsEls = () => [...list.querySelectorAll<HTMLElement>('[role="group"]')];

function setActive(i: number, scroll = true) {
  const os = options();
  if (!os.length) { active = -1; input.removeAttribute('aria-activedescendant'); return; }
  active = (i + os.length) % os.length;
  os.forEach((o, n) => o.setAttribute('aria-selected', n === active ? 'true' : 'false'));
  input.setAttribute('aria-activedescendant', os[active].id);
  if (scroll) os[active].scrollIntoView({ block: 'nearest' });
}

function waHref(q: string) {
  const base = dlg.dataset.waBase || 'https://wa.me/523321017799';
  return `${base}?text=${encodeURIComponent(`Hola Kain, ${q}`)}`;
}

function group(id: string, title: string) {
  const g = h('div', 'sd-group');
  g.setAttribute('role', 'group');
  g.setAttribute('aria-labelledby', `sd-g-${id}`);
  const t = h('p', 'sd-group__h', title);
  t.id = `sd-g-${id}`;
  t.setAttribute('role', 'presentation');
  g.append(t);
  return g;
}
let oid = 0;
function opt(href: string, cls = '') {
  const a = h('a', `sd-opt ${cls}`) as HTMLAnchorElement;
  a.href = href;
  a.id = `sd-o-${oid++}`;
  a.setAttribute('role', 'option');
  a.setAttribute('aria-selected', 'false');
  a.tabIndex = -1;
  return a;
}

function render() {
  const raw = input.value.trim();
  oid = 0;
  if (!raw) {
    list.innerHTML = staticHTML;
    status.textContent = '';
    setActive(0, false);
    return;
  }
  const q = qtoks(raw);
  list.innerHTML = '';
  if (!index) {
    list.append(h('p', 'sd__loading', 'Cargando el índice…'));
  } else {
    const pagesR = rank(P, q, raw, 12);
    const by = (fn: (d: PageDoc) => boolean, max: number) => pagesR.filter((r) => fn(r.doc)).slice(0, max);
    const faqR = rank(F, q, raw, 4);
    // Grupos (§4.3) ordenados por su mejor coincidencia; las preguntas pesan como un título (q vale 3 contra 4).
    const sets = [
      { id: 'paginas', title: 'Páginas', rows: by((d) => d.g !== 'Servicios' && d.g !== 'Casos', 5), faq: false },
      { id: 'servicios', title: 'Servicios', rows: by((d) => d.g === 'Servicios', 5), faq: false },
      { id: 'casos', title: 'Casos', rows: by((d) => d.g === 'Casos', 4), faq: false },
      { id: 'preguntas', title: 'Preguntas', rows: faqR.map((r) => ({ ...r, s: r.s * 1.3 })), faq: true },
    ].filter((g) => g.rows.length).sort((x, y) => y.rows[0].s - x.rows[0].s);
    let count = 0;
    for (const set of sets) {
      const g = group(set.id, set.title);
      for (const r of set.rows) {
        if (set.faq) {
          const f = r.doc as unknown as FaqDoc;
          const a = opt(f.u, 'sd-opt--faq');
          const node = h('span', 'sd-opt__node'); node.setAttribute('aria-hidden', 'true');
          const t = h('span', 'sd-opt__t'); t.append(mark(f.q, q));
          const ds = h('span', 'sd-opt__d', f.a);
          a.append(node, t, ds);
          g.append(a);
        } else {
          const d = r.doc as PageDoc;
          const a = opt(d.u);
          const node = h('span', 'sd-opt__node'); node.setAttribute('aria-hidden', 'true');
          const t = h('span', 'sd-opt__t'); t.append(mark(d.t, q));
          const u = h('span', 'sd-opt__u', d.u);
          const ds = h('span', 'sd-opt__d'); ds.append(mark(d.h, q));
          a.append(node, t, u, ds);
          g.append(a);
        }
        count++;
      }
      list.append(g);
    }
    if (!count) list.append(h('p', 'sd__empty-note', 'No encontré una página con esas palabras. Pregúntale directo a Kain:'));
    status.textContent = count ? `${count} resultados` : 'Sin resultados';
  }
  // Acciones (siempre): «Cotizar proyecto» (abre el modal) y WhatsApp con lo escrito
  const g = group('acciones', 'Acciones');
  let a1: HTMLElement | null = null;
  if (quoteOpt) {
    a1 = quoteOpt.cloneNode(true) as HTMLElement;
    a1.id = `sd-o-${oid++}`;
    a1.setAttribute('aria-selected', 'false');
    a1.tabIndex = -1;
  }
  const a2 = opt(waHref(raw), 'sd-opt--act sd-opt--wa');
  a2.target = '_blank';
  a2.rel = 'noopener';
  a2.dataset.wa = '';
  const t2 = h('span', 'sd-opt__t');
  t2.append('Pregúntale a Kain por WhatsApp: ', Object.assign(h('b'), { textContent: `«${raw}»` }));
  if (waIcon) a2.insertAdjacentHTML('beforeend', waIcon); else a2.append(h('span', 'sd-opt__node'));
  a2.append(t2);
  if (a1) g.append(a1);
  g.append(a2);
  list.append(g);
  setActive(0, false);
}

function activate(o: HTMLElement | undefined, e?: Event) {
  if (!o) return;
  // «Cotizar proyecto»: lo abre el binder del modal (clic delegado en captura, que antes cierra esta capa con
  // 'ingeniak:overlays-close'). Con Enter se simula el clic; sin modal, el enlace lleva a /contacto/#cotizar.
  if (o.hasAttribute('data-cotizar')) { if (!e) o.click(); return; }
  const fill = o.dataset.sdFill;
  if (fill) { e?.preventDefault(); input.value = fill; render(); input.focus(); return; }
  const a = o as HTMLAnchorElement;
  if (a.dataset.wa !== undefined) {
    a.href = waHref(input.value.trim());            // se arma al hacer clic, con lo escrito
    track('whatsapp_click', { seccion: 'buscador' });
  } else track('search_submit', { largo: input.value.trim().length, grupo: o.closest('[role="group"]')?.id ?? o.closest('[role="group"]')?.getAttribute('aria-labelledby') });
  if (!e) {
    if (a.target === '_blank') window.open(a.href, '_blank', 'noopener');
    else window.location.href = a.href;
  }
  if (a.target !== '_blank') close();
}

function onKey(e: KeyboardEvent) {
  if (e.key === 'ArrowDown') { e.preventDefault(); setActive(active + 1); }
  else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(active - 1); }
  else if (e.key === 'Enter') { e.preventDefault(); activate(options()[active]); }
  else if (e.key === 'Tab') {
    const gs = groupsEls();
    if (!gs.length) return;
    e.preventDefault();
    const os = options();
    const curG = os[active]?.closest('[role="group"]');
    let gi = gs.indexOf(curG as HTMLElement);
    gi = (gi + (e.shiftKey ? -1 : 1) + gs.length) % gs.length;
    const first = gs[gi].querySelector('[role="option"]');
    setActive(os.indexOf(first as HTMLElement));
  } else if (e.key === 'Home' && e.ctrlKey) { e.preventDefault(); setActive(0); }
}

let closing = 0;
/** Cierra con la salida animada. Igual que sheet.ts: dlg.close(), unlock('search') y la clase se quitan en el MISMO
 *  timeout, así el bloqueo de scroll nunca depende de que llegue el evento 'close' (que queda como respaldo idempotente). */
function close() {
  if (!dlg.open) return;
  dlg.classList.remove('is-open');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches || document.documentElement.dataset.motion === 'reduced';
  clearTimeout(closing);
  closing = window.setTimeout(() => {
    if (dlg.open) dlg.close();
    unlock('search');
    dlg.classList.remove('is-open');
  }, reduced ? 0 : 180);
}

function init() {
  if (setup) return;
  setup = true;
  dlg = document.querySelector<HTMLDialogElement>('[data-sd]')!;
  input = dlg.querySelector<HTMLInputElement>('.sd__input')!;
  list = dlg.querySelector<HTMLElement>('#sd-list')!;
  status = dlg.querySelector<HTMLElement>('[data-sd-status]')!;
  staticHTML = list.innerHTML;
  waIcon = list.querySelector('#sd-a-1 svg')?.outerHTML ?? '';
  quoteOpt = list.querySelector<HTMLElement>('#sd-a-0[data-cotizar]');
  input.addEventListener('input', () => { clearTimeout(tRender); tRender = window.setTimeout(render, 40); });
  input.addEventListener('keydown', onKey);
  list.addEventListener('click', (e) => {
    const o = (e.target as HTMLElement).closest<HTMLElement>('[role="option"]');
    if (o) activate(o, e);
  });
  list.addEventListener('pointermove', (e) => {
    const o = (e.target as HTMLElement).closest<HTMLElement>('[role="option"]');
    if (o) { const i = options().indexOf(o); if (i !== active) setActive(i, false); }
  });
  dlg.querySelector('[data-sd-close]')?.addEventListener('click', close);
  dlg.addEventListener('cancel', (e) => { e.preventDefault(); close(); });
  dlg.addEventListener('close', () => { unlock('search'); dlg.classList.remove('is-open'); });
  dlg.addEventListener('click', (e) => { if (e.target === dlg) close(); });
  // Otra capa (modal de cotización, CAMBIO-COTIZAR §2.5) pide cerrar todo: cierre inmediato y libera el lock 'search'.
  document.addEventListener('ingeniak:overlays-close', () => {
    clearTimeout(closing);
    if (!dlg.open) return;
    dlg.classList.remove('is-open');
    if (dlg.open) dlg.close();
    unlock('search');
  });
}

export async function openSearch(q = '') {
  init();
  clearTimeout(closing);                 // reabrir durante la salida no deja un cierre pendiente
  if (!dlg.open) {
    dlg.showModal();
    lock('search', true);
    track('search_open');
  }
  if (!dlg.classList.contains('is-open')) requestAnimationFrame(() => dlg.classList.add('is-open'));
  input.value = q;
  render();
  input.focus();
  if (q) input.setSelectionRange(q.length, q.length);
  await loadIndex();
  render();
}
export const closeSearch = () => { if (setup) close(); };
