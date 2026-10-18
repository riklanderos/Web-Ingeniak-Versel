// src/scripts/nav/vt.ts — corte por coincidencia entre documentos (ESPEC §7.6).
// Origen: el still clicado (a[data-still] img) toma view-transition-name "plate" y la portada de esta página lo suelta.
// Con movimiento reducido (sistema o interruptor) la transición se salta.
export function initVT() {
  const html = document.documentElement;
  document.addEventListener('click', (e) => {
    const a = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[data-still]');
    if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    const img = a.querySelector<HTMLImageElement>('img.is-on') ?? a.querySelector<HTMLImageElement>('img');
    if (!img) return;
    html.setAttribute('data-vt-still', '');
    img.style.viewTransitionName = 'plate';
  });
  window.addEventListener('pageswap', (e: any) => {
    if (!e.viewTransition) return;
    const reduced = html.dataset.motion === 'reduced' || matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) { e.viewTransition.skipTransition?.(); return; }
    html.classList.add('vt-hdr');                   // el encabezado no parpadea (solo durante el corte)
  });
  // Al volver con el botón "atrás" (bfcache), limpia el nombre prestado
  window.addEventListener('pageshow', () => {
    html.classList.remove('vt-hdr');
    html.removeAttribute('data-vt-still');
    document.querySelectorAll<HTMLImageElement>('a[data-still] img').forEach((i) => (i.style.viewTransitionName = ''));
  });
}
