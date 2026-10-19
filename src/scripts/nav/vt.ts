// src/scripts/nav/vt.ts — corte por coincidencia entre documentos (ESPEC §7.6).
// Origen: el still clicado (a[data-still]) presta su imagen VISIBLE con view-transition-name "plate" y la portada de esta
// página lo suelta (html[data-vt-still]). En toda la página debe quedar UNA sola "plate": dos nombres iguales lanzan
// InvalidStateError ("Unexpected duplicate view-transition-name") y el navegador cancela el corte.
// ui.ts también nombra la imagen de Still/ScriptList en su propio clic (document); este oyente va en window (burbuja),
// corre DESPUÉS y solo completa: respeta la imagen que eligió ui, o toma la visible del enlace (pantalla del mega menú).
// Con movimiento reducido (sistema o interruptor) la transición se salta.
const named = () =>
  [...document.querySelectorAll<HTMLElement>('[style*="view-transition-name"]')].filter((el) => el.style.viewTransitionName === 'plate');

const visibleImg = (a: HTMLElement) => {
  const imgs = [...a.querySelectorAll<HTMLImageElement>('img')];
  return imgs.find((i) => i.classList.contains('is-on')) ?? imgs.find((i) => i.offsetWidth > 0 && getComputedStyle(i).opacity !== '0') ?? null;
};

export function initVT() {
  const html = document.documentElement;
  window.addEventListener('click', (e) => {
    const a = (e.target as HTMLElement).closest?.<HTMLAnchorElement>('a[data-still]');
    if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0 || a.target === '_blank') return;
    const prev = named();
    // ui ya eligió (imagen del still o la del ScriptList que sigue al puntero): se queda esa, solo esa.
    let pick: HTMLElement | null = prev.find((el) => a.contains(el)) ?? (prev.length === 1 ? prev[0] : null);
    pick ??= visibleImg(a);
    for (const el of prev) if (el !== pick) el.style.viewTransitionName = '';
    if (!pick) return;
    html.setAttribute('data-vt-still', '');
    pick.style.viewTransitionName = 'plate';
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
    named().forEach((i) => (i.style.viewTransitionName = ''));
  });
}
