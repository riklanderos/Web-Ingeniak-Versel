// src/scripts/nav/header.ts — estados del encabezado (ESPEC §4.1) y bandera del segundo viewport.
// html[data-hdr-state]: "top" (transparente sobre la portada) · "hidden" (oculto al bajar) · "glass" (vuelve como cristal al subir)
//   (es un atributo de <html>, distinto del gancho del elemento: el encabezado se toma SIEMPRE como header.hdr)
// html[data-hdr-scrim]: en "top" con y > 0 → velo protector de 96 px bajo el encabezado.
// html[data-fold]: pasado el primer viewport (barra móvil y píldora de Kain).
// html[data-fold85]: pasado el 85 % del primer viewport (barra móvil de las landings ocultas, CAMBIO-COTIZAR §4.1).
// html[data-agenda-visible]: el componente de reserva ([data-agenda]) está a la vista → la barra de la landing se retira.
// Umbral de "top": max(48, min(80 % de la portada, primer texto − alto del encabezado − 16)) — el encabezado deja de
//   ser transparente ANTES de que el primer texto de la portada (breadcrumbs, H1, sumario o columna de texto) pase por debajo.
//   En vertical (< 768 px o proporción ≤ 5/6) sale de "top" en cuanto y > 8.
// Modo sala (html[data-sala], lo pone cine durante secuencias fijadas): se queda oculto mientras dure.
// Firma (html.co): el CSS lo mantiene en opacidad 0 hasta que cine retira html.co y emite 'cine:coldopen-end'.
import { reducedMotion } from './overlay';

export function initHeader() {
  const hdr = document.querySelector<HTMLElement>('header.hdr');
  if (!hdr) return;
  const html = document.documentElement;
  const portrait = matchMedia('(max-width: 767px), (max-aspect-ratio: 5/6)');
  let lastY = window.scrollY;
  let dir = 0;
  let acc = 0;
  let threshold = 0;
  let textEls: HTMLElement[] = [];
  let state = '';
  let ticking = false;

  const textCandidates = (hero: HTMLElement | null) => {
    const els = [
      document.querySelector<HTMLElement>('main .crumbs'),
      document.querySelector<HTMLElement>('main h1'),
      document.querySelector<HTMLElement>('main .is__copy'),
      hero?.querySelector<HTMLElement>('.sumario') ?? null,
    ].filter((e): e is HTMLElement => !!e);
    return [...new Set(els)];
  };

  const measure = () => {
    const hero =
      document.querySelector<HTMLElement>('main .is--hero, main [data-hero]') ??
      document.querySelector<HTMLElement>('main > section:first-of-type');
    const r = hero?.getBoundingClientRect();
    const y = window.scrollY;
    const heroCut = hero && r && r.height > 240 ? r.top + y + r.height * 0.8 : window.innerHeight * 0.5;
    textEls = textCandidates(hero);
    let textTop = Infinity;
    for (const el of textEls) {
      const tr = el.getBoundingClientRect();
      if (tr.height > 0 && tr.width > 0) textTop = Math.min(textTop, tr.top + y);
    }
    const h = hdr.offsetHeight || 72;
    threshold = Math.max(48, Math.min(heroCut, textTop - h - 16));
  };

  /** Con parallax (la columna de texto sube más rápido que el scroll), el umbral medido llega tarde: se revisa en vivo. */
  const textUnderHeader = () => {
    const limit = (hdr.offsetHeight || 72) + 8;
    for (const el of textEls) {
      const tr = el.getBoundingClientRect();
      if (tr.height > 0 && tr.top < limit && tr.bottom > 0) return true;
    }
    return false;
  };

  const set = (s: string) => {
    if (s === state) return;
    state = s;
    html.dataset.hdrState = s;
  };

  const update = () => {
    ticking = false;
    const y = Math.max(0, window.scrollY);
    const dy = y - lastY;
    lastY = y;
    if (dy !== 0) {
      const d = Math.sign(dy);
      if (d !== dir) { dir = d; acc = 0; }
      acc += Math.abs(dy);
    }
    html.toggleAttribute('data-fold', y > window.innerHeight * 0.9);
    html.toggleAttribute('data-fold85', y > window.innerHeight * 0.85);
    html.toggleAttribute('data-hdr-scrim', y > 0);
    if (html.hasAttribute('data-mm-open') || html.classList.contains('is-locked')) return;

    const limit = portrait.matches ? 8 : threshold;
    if (y <= limit && !(y > 8 && textUnderHeader())) { set('top'); return; }
    if (html.hasAttribute('data-sala')) { set('hidden'); return; }     // modo sala: no vuelve mientras dure el pin
    if (reducedMotion()) { set('glass'); return; }                      // §7.4: sin ocultarse con movimiento reducido
    if (state === 'top' || state === '') { set(dir > 0 ? 'hidden' : 'glass'); return; }
    if (state === 'glass' && dir > 0 && acc > 120) set('hidden');
    else if (state === 'hidden' && dir < 0 && acc > 6) set('glass');
  };

  const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
  // Landings: mientras el componente de reserva se vea (aunque sea en parte), la barra móvil no lo tapa.
  const agendas = document.querySelectorAll<HTMLElement>('[data-agenda]');
  if (agendas.length && 'IntersectionObserver' in window) {
    const seen = new Set<Element>();
    const io = new IntersectionObserver((es) => {
      for (const e of es) e.isIntersecting ? seen.add(e.target) : seen.delete(e.target);
      html.toggleAttribute('data-agenda-visible', seen.size > 0);
    }, { threshold: 0 });
    agendas.forEach((a) => io.observe(a));
  }
  measure();
  update();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', () => { measure(); onScroll(); }, { passive: true });
  window.addEventListener('load', () => { measure(); onScroll(); }, { once: true });
  document.fonts?.ready.then(() => { measure(); onScroll(); });
  // Cambios de estado que no llegan con scroll: fin de la firma, entrada/salida de una secuencia fijada, movimiento reducido.
  document.addEventListener('cine:coldopen-end', () => { measure(); onScroll(); });
  document.addEventListener('cine:sala', () => onScroll());
  window.addEventListener('ingeniak:motion', () => { state = ''; onScroll(); });
  // Si el contenido cambia de alto (fuentes, imágenes), recalcula el umbral.
  if ('ResizeObserver' in window) {
    let t = 0;
    new ResizeObserver(() => { clearTimeout(t); t = window.setTimeout(() => { measure(); onScroll(); }, 120); }).observe(document.body);
  }
  // Al entrar con teclado al encabezado oculto, vuelve como cristal.
  hdr.addEventListener('focusin', (e) => {
    const el = e.target as HTMLElement;
    if (state === 'hidden' && el.matches?.(':focus-visible')) set('glass');
  });
}
