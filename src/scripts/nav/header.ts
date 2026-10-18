// src/scripts/nav/header.ts — estados del encabezado (ESPEC §4.1) y bandera del segundo viewport.
// html[data-hdr]: "top" (transparente sobre la portada) · "hidden" (oculto al bajar) · "glass" (vuelve como cristal al subir)
// html[data-fold]: pasado el primer viewport (barra móvil y píldora de Kain).
// Modo sala (html[data-sala], lo pone cine durante secuencias fijadas): se oculta y no vuelve con subidas < 120 px.
import { reducedMotion } from './overlay';

export function initHeader() {
  const hdr = document.querySelector<HTMLElement>('[data-hdr]');
  if (!hdr) return;
  const html = document.documentElement;
  let lastY = window.scrollY;
  let dir = 0;
  let acc = 0;
  let threshold = 0;
  let state = '';
  let ticking = false;

  const measure = () => {
    const hero =
      document.querySelector<HTMLElement>('main .is--hero, main [data-hero]') ??
      document.querySelector<HTMLElement>('main > section:first-of-type');
    const r = hero?.getBoundingClientRect();
    threshold = hero && r && r.height > 240 ? r.top + window.scrollY + r.height * 0.8 : window.innerHeight * 0.5;
  };

  const set = (s: string) => {
    if (s === state) return;
    state = s;
    html.dataset.hdr = s;
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
    if (html.hasAttribute('data-mm-open') || html.classList.contains('is-locked')) return;

    if (y < threshold) { set('top'); return; }
    const sala = html.hasAttribute('data-sala');
    if (reducedMotion()) { set('glass'); return; }       // §7.4: sin ocultarse con movimiento reducido
    if (state === 'top' || state === '') { set(dir > 0 ? 'hidden' : 'glass'); return; }
    if (sala && dir > 0) { set('hidden'); return; }
    if (state === 'glass' && dir > 0 && acc > 120) set('hidden');
    else if (state === 'hidden' && dir < 0 && acc > (sala ? 120 : 6)) set('glass');
  };

  const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
  measure();
  update();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', () => { measure(); onScroll(); }, { passive: true });
  window.addEventListener('load', () => { measure(); onScroll(); }, { once: true });
  // Si el contenido cambia de alto (fuentes, imágenes), recalcula el umbral.
  if ('ResizeObserver' in window) new ResizeObserver(() => measure()).observe(document.body);
  // Al entrar con teclado al encabezado oculto, vuelve como cristal.
  hdr.addEventListener('focusin', (e) => {
    const el = e.target as HTMLElement;
    if (state === 'hidden' && el.matches?.(':focus-visible')) set('glass');
  });
}
