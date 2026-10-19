// src/scripts/nav/persist.ts — regla de un azul (F15) y visibilidad del cierre.
// html[data-primary-visible]: hay un [data-primary] del CONTENIDO (main) en pantalla → el CTA del encabezado pasa a contorno
//   y la barra móvil se oculta.
// html[data-dawn-visible]: el cierre Dawn ([data-dawn] o [data-shot="dawn"]) está en pantalla → se ocultan barra móvil y píldora.
// html[data-end-visible]: el final del footer está en pantalla → también se ocultan (y el riel).
// html[data-kpill-off]: #kain, #casos o #cta-final a la vista → la píldora se retira (esas escenas ya llevan "Escríbele a Kain").
export function initPersist() {
  const html = document.documentElement;
  if (!('IntersectionObserver' in window)) return;

  const watch = (selector: string, attr: string, threshold = 0) => {
    const seen = new Set<Element>();
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) e.isIntersecting ? seen.add(e.target) : seen.delete(e.target);
      html.toggleAttribute(attr, seen.size > 0);
    }, { threshold });
    const scan = () => document.querySelectorAll(selector).forEach((el) => {
      if ((el as HTMLElement).dataset.navWatched?.includes(attr)) return;
      (el as HTMLElement).dataset.navWatched = `${(el as HTMLElement).dataset.navWatched ?? ''} ${attr}`;
      io.observe(el);
    });
    scan();
    return scan;
  };

  const scanDawn = watch('main [data-dawn], main [data-shot="dawn"]', 'data-dawn-visible', 0.2);
  // Final del footer (reprise + legal): la píldora, la barra móvil y el riel se retiran para no tapar la firma ni el legal.
  watch('[data-ftr-end]', 'data-end-visible', 0);
  const scanKpill = watch('main #kain, main #casos, main #cta-final', 'data-kpill-off', 0);
  // La regla de un azul también la implementa ui.ts (html[data-primary-io="ui"]): si ui la tomó, nav no duplica el observador.
  let scanPrimary = () => {};
  setTimeout(() => {
    if (html.dataset.primaryIo && html.dataset.primaryIo !== 'nav') return;
    html.dataset.primaryIo = 'nav';
    scanPrimary = watch('main [data-primary]', 'data-primary-visible', 0);
  }, 0);
  // Contenido que llega tarde (escenas que montan HTML con JS)
  window.addEventListener('load', () => { scanPrimary(); scanDawn(); scanKpill(); }, { once: true });
}
