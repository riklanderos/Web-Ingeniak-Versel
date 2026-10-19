// src/scripts/nav/kpill.ts — la píldora "Escríbele a Kain" nunca tapa contenido (ESPEC §4.6, QA nav #6).
// html[data-kpill-cover]: la caja de la píldora EN REPOSO (abajo a la derecha, sin el translate de entrada/salida, + 12 px
//   de aire a los lados, 64 px arriba y 96 px por debajo del borde de la ventana) cae sobre texto o UI del contenido → el CSS la retira.
// Cómo: un IntersectionObserver cuyo "root" se recorta (rootMargin negativo) a esa caja observa cada elemento de <main>
//   con texto propio y la UI (enlaces, botones, filas, nodos, paneles anclados). El observador da, sin leer layout en
//   cada cuadro, qué elementos están bajo la caja; en el rAF del scroll solo se afina ese puñado: opacidad efectiva
//   (display:none o visibility:hidden no cuentan; el texto a media entrada sí) y, para el texto, las cajas de línea reales (Range) en vez de la del bloque.
// (#kain, #casos y #cta-final a la vista → html[data-kpill-off], en persist.ts, con el mismo mecanismo que el cierre.)

// UI que la píldora no puede tapar aunque no lleve texto propio (paneles anclados a la placa, filas de ScriptList,
// preguntas del FAQ, filas del Montage, nodos del flujo y del líder, conversaciones).
const UI = [
  'a[href]', 'button', 'input', 'select', 'textarea', '.anchor', '.script__row', '.faq__q', '.mt__row',
  '.svc-node__card', '.leader-node', '.ind-leader-node', '.chat__screen',
].map((s) => `main ${s}`).join(',');
// Tipografía decorativa de fondo (palabras gigantes): no es contenido que haya que despejar.
const DECOR = '.ghost, [data-ghost]';
const PAD = 12; // aire a los lados de la píldora
// Arriba y abajo hay más margen: con Lenis el contenido corre ~1 000 px/s y entre el aviso del observador, el rAF y el
// desvanecido pasan ~120 ms. El texto que sube se detecta 96 px ANTES de entrar por el borde inferior de la ventana
// (rootMargin positivo) y el que baja, 64 px antes de tocar la píldora.
const PAD_TOP = 64;
const AHEAD = 96;

export function initKpill() {
  const pill = document.querySelector<HTMLElement>('[data-kpill]');
  const main = document.querySelector<HTMLElement>('main');
  if (!pill || !main || !('IntersectionObserver' in window)) return;
  const html = document.documentElement;
  const under = new Set<Element>();
  const isText = new WeakSet<Element>();
  let box = { l: 0, t: 0, r: 0, b: 0, ok: false };
  let io: IntersectionObserver | null = null;
  let ticking = false;

  const measure = () => {
    const w = pill.offsetWidth, h = pill.offsetHeight;
    if (!w || !h) { box.ok = false; return; }          // < 768 px: display:none
    const cs = getComputedStyle(pill);
    const right = parseFloat(cs.right) || 0, bottom = parseFloat(cs.bottom) || 0;
    const vw = html.clientWidth, vh = window.innerHeight;
    box = { l: vw - right - w - PAD, t: vh - bottom - h - PAD_TOP, r: vw - right + PAD, b: vh + AHEAD, ok: true };
  };

  const candidates = () => {
    const set = new Set<Element>();
    const walker = document.createTreeWalker(main, NodeFilter.SHOW_TEXT);
    for (let n = walker.nextNode(); n; n = walker.nextNode()) {
      const el = n.parentElement;
      if (!el || !n.textContent?.trim() || el.closest(DECOR)) continue;
      set.add(el);
      isText.add(el);
    }
    main.querySelectorAll(UI).forEach((el) => set.add(el));
    return set;
  };

  const build = () => {
    io?.disconnect();
    under.clear();
    measure();
    if (!box.ok) { html.removeAttribute('data-kpill-cover'); return; }
    const vw = html.clientWidth, vh = window.innerHeight;
    const px = (v: number) => `${-Math.round(v)}px`;   // negativo recorta la ventana; positivo (abajo) la extiende
    io = new IntersectionObserver((entries) => {
      for (const e of entries) e.isIntersecting ? under.add(e.target) : under.delete(e.target);
      onScroll();
    }, { rootMargin: `${px(box.t)} ${px(vw - box.r)} ${px(vh - box.b)} ${px(box.l)}`, threshold: 0 });
    candidates().forEach((el) => io!.observe(el));
  };

  const hits = (a: DOMRect) => a.width > 0 && a.height > 0 && a.right > box.l && a.left < box.r && a.bottom > box.t && a.top < box.b;
  const shown = (el: Element) => {
    for (let o: Element | null = el; o && o !== main.parentElement; o = o.parentElement) {
      const cs = getComputedStyle(o);
      if (cs.display === 'none' || parseFloat(cs.opacity) < 0.01) return false;   // casi transparente aún cuenta: va a entrar
      if (o === el && cs.visibility === 'hidden') return false;                    // visibility se hereda: basta el propio
    }
    return true;
  };
  const covers = (el: Element) => {
    if (!el.isConnected || !shown(el)) return false;
    if (!isText.has(el) || el.matches(UI)) return hits(el.getBoundingClientRect());
    // Texto: solo las líneas reales (un párrafo corto no ocupa todo el ancho de su columna).
    for (const n of el.childNodes) {
      if (n.nodeType !== 3 || !n.textContent?.trim()) continue;
      const rg = document.createRange();
      rg.selectNodeContents(n);
      for (const q of rg.getClientRects()) if (hits(q)) return true;
    }
    return false;
  };

  const check = () => {
    ticking = false;
    if (!box.ok) { html.removeAttribute('data-kpill-cover'); return; }
    // Solo importa cuando la píldora podría estar a la vista (encabezado oculto y pasado el primer viewport).
    if (html.dataset.hdrState !== 'hidden' || !html.hasAttribute('data-fold')) return;
    let c = false;
    for (const el of under) if (covers(el)) { c = true; break; }
    html.toggleAttribute('data-kpill-cover', c);
  };
  const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(check); } };

  build();
  window.addEventListener('scroll', onScroll, { passive: true });
  let tr = 0;
  window.addEventListener('resize', () => { clearTimeout(tr); tr = window.setTimeout(build, 150); }, { passive: true });
  window.addEventListener('load', build, { once: true });
  document.addEventListener('cine:coldopen-end', build);
  // El estado del encabezado cambia en el mismo cuadro que el scroll: revisa cuando pasa a "hidden".
  new MutationObserver(onScroll).observe(html, { attributes: true, attributeFilter: ['data-hdr-state', 'data-fold'] });
  // Contenido que monta HTML con JS (escenas, ScriptList, FAQ, conversaciones)
  window.setTimeout(build, 1500);
}
