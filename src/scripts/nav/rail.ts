// src/scripts/nav/rail.ts — riel de escenas (ESPEC §4.7). Quita ticks sin destino, renumera y marca la escena
// que cruza la línea central del viewport (equivale a ScrollTrigger start 'top center' / end 'bottom center').
export function initRail() {
  const rail = document.querySelector<HTMLElement>('[data-rail]');
  if (!rail) return;
  const items = [...rail.querySelectorAll<HTMLElement>('.rail__item')];
  const live: { li: HTMLElement; a: HTMLAnchorElement; target: HTMLElement }[] = [];
  for (const li of items) {
    const a = li.querySelector<HTMLAnchorElement>('[data-rail-target]')!;
    const target = document.getElementById(a.dataset.railTarget!);
    if (!target) { li.remove(); continue; }
    const custom = target.dataset.railLabel;
    if (custom) { const nm = a.querySelector('.rail__name'); if (nm) nm.textContent = custom; }
    live.push({ li, a, target });
  }
  if (live.length < 2) { rail.remove(); return; }
  live.forEach(({ li, a }, n) => {
    const num = a.querySelector('.rail__n');
    if (num) num.textContent = String(n + 1).padStart(2, '0');
    const prev = live[n - 1]?.li;
    li.toggleAttribute('data-gap', !!prev && prev.dataset.group !== li.dataset.group);
  });

  const setActive = (id: string | null) => {
    for (const { a, target } of live) {
      const on = target.id === id;
      a.classList.toggle('is-active', on);
      if (on) a.setAttribute('aria-current', 'location'); else a.removeAttribute('aria-current');
    }
  };
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) if (e.isIntersecting) setActive((e.target as HTMLElement).id);
  }, { rootMargin: '-50% 0px -50% 0px', threshold: 0 });
  live.forEach(({ target }) => io.observe(target));

  if (rail.dataset.mode === 'labels') guardLabels(rail, live.map(({ a }) => a));
  guardFooter(rail);

  rail.addEventListener('click', (e) => {
    const a = (e.target as HTMLElement).closest<HTMLAnchorElement>('[data-rail-target]');
    if (!a) return;
    const t = document.getElementById(a.dataset.railTarget!);
    const lenis = (window as any).__lenis;
    if (t && lenis?.scrollTo) {
      e.preventDefault();
      // El eyebrow de destino nunca queda bajo el encabezado de cristal (que vuelve al subir): alto del encabezado + 16 px.
      const hdr = document.querySelector<HTMLElement>('header.hdr')?.offsetHeight ?? 72;
      lenis.scrollTo(t, { offset: -(hdr + 16), duration: 1.1 });
      history.replaceState(null, '', `#${t.id}`);
      t.setAttribute('tabindex', '-1');
      setTimeout(() => t.focus({ preventScroll: true }), 1150);
    }
  });
}

// El riel se retira en cuanto el footer llega a su altura (QA: con las etiquetas a la vista tapaba la columna "Recursos"
// del mapa del sitio). html[data-rail-ftr] mientras el borde superior del footer queda por encima del borde inferior
// del riel + FTR_GAP. Antes de eso el riel sigue (en servicio, industria y nosotros el cierre Dawn es su último tick).
// Un IntersectionObserver cuyo "root" se recorta por abajo hasta esa línea; se vuelve a medir al cambiar el tamaño.
// (El final del footer, html[data-end-visible], también lo retira: persist.ts.)
const FTR_GAP = 64;   // con Lenis el contenido corre ~1 000 px/s: margen para el desvanecido de .3 s antes de la 1.ª fila

function guardFooter(rail: HTMLElement) {
  const ftr = document.querySelector<HTMLElement>('[data-ftr]');
  if (!ftr || !('IntersectionObserver' in window)) return;
  const html = document.documentElement;
  let io: IntersectionObserver | null = null;
  const build = () => {
    io?.disconnect();
    const r = rail.getBoundingClientRect();
    if (!r.height) { html.removeAttribute('data-rail-ftr'); return; }   // < 1280 px: display:none
    const cut = Math.max(0, Math.round(window.innerHeight - (r.bottom + FTR_GAP)));
    io = new IntersectionObserver(([e]) => html.toggleAttribute('data-rail-ftr', e.isIntersecting), { rootMargin: `0px 0px -${cut}px 0px`, threshold: 0 });
    io.observe(ftr);
  };
  build();
  let t = 0;
  addEventListener('resize', () => { clearTimeout(t); t = window.setTimeout(build, 150); }, { passive: true });
  addEventListener('load', build, { once: true });   // por si el riel aún no tenía caja (estilos o fuentes tardíos)
}

// Modo "labels" (casos, Quick Jump): las etiquetas siempre visibles nunca tapan contenido (QA r2). Si bajo la caja de una
// etiqueta (+ su halo) pasa texto, un enlace, un botón o una fila de UI del contenido, esa etiqueta se retira
// (.rail__tick[data-covered] → opacidad 0; el tick sigue y con puntero o foco la etiqueta vuelve). Se mide solo en el
// rAF del scroll y al cambiar el tamaño: elementsFromPoint en 5 puntos por etiqueta y, para el texto, las cajas de línea
// reales (Range), no la del bloque. La tipografía decorativa (.ghost, aria-hidden) no cuenta.
// Contenedores de fila sin enlace (.script__row, .mt__row) no cuentan: su texto ya se mide por líneas.
const UI_SEL = 'a[href],button,input,select,textarea,.anchor,.chat__screen';
const DECOR = '.ghost,[data-ghost],[aria-hidden="true"]';
const HALO_X = 12, HALO_Y = 3;

function guardLabels(rail: HTMLElement, ticks: HTMLAnchorElement[]) {
  const main = document.querySelector<HTMLElement>('main');
  if (!main) return;
  const range = document.createRange();
  const mq = window.matchMedia('(min-width: 1280px)');
  let ticking = false;

  const shown = (el: Element) => {
    let n: Element | null = el;
    for (let i = 0; n && i < 5; i++, n = n.parentElement) {
      const cs = getComputedStyle(n);
      if (cs.visibility === 'hidden' || cs.display === 'none' || parseFloat(cs.opacity) < 0.15) return false;
    }
    return true;
  };
  const hit = (a: DOMRect | DOMRectReadOnly, b: { l: number; t: number; r: number; b: number }) =>
    a.width > 0 && a.height > 0 && a.right > b.l && a.left < b.r && a.bottom > b.t && a.top < b.b;

  const covered = (lab: HTMLElement) => {
    const r = lab.getBoundingClientRect();
    if (!r.width) return false;
    const box = { l: r.left - HALO_X, t: r.top - HALO_Y, r: r.right + HALO_X, b: r.bottom + HALO_Y };
    const y = r.top + r.height / 2;
    const seen = new Set<Element>();
    for (let k = 0; k <= 4; k++) {
      const x = box.l + ((box.r - box.l) * k) / 4;
      for (const el of document.elementsFromPoint(Math.max(0, x), y)) {
        if (seen.has(el)) continue;
        seen.add(el);
        if (el === main || !main.contains(el) || el.closest(DECOR)) continue;
        if (el.matches(UI_SEL)) { if (hit(el.getBoundingClientRect(), box) && shown(el)) return true; continue; }
        for (const node of el.childNodes) {
          if (node.nodeType !== 3 || !node.textContent?.trim()) continue;
          range.selectNodeContents(node);
          for (const lr of range.getClientRects()) if (hit(lr, box) && shown(el)) return true;
        }
      }
    }
    return false;
  };

  const run = () => {
    ticking = false;
    const html = document.documentElement;
    const off = !mq.matches || html.hasAttribute('data-overlay') || html.hasAttribute('data-sala') || !html.hasAttribute('data-fold');
    for (const a of ticks) {
      const lab = a.querySelector<HTMLElement>('.rail__label');
      a.toggleAttribute('data-covered', !off && !!lab && covered(lab));
    }
  };
  const queue = () => { if (!ticking) { ticking = true; requestAnimationFrame(run); } };
  // Las entradas de cine/ui (opacidad 0 → 1) terminan DESPUÉS del último scroll: repasos a 0.35, 1 y 2.2 s de la pausa.
  let settle: number[] = [];
  const onScroll = () => {
    queue();
    settle.forEach(clearTimeout);
    settle = [350, 1000, 2200].map((ms) => window.setTimeout(queue, ms));
  };
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll, { passive: true });
  document.addEventListener('cine:sala', onScroll);
  addEventListener('load', onScroll, { once: true });
  onScroll();
}
