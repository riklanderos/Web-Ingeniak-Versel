// src/scripts/landing/safe-col.ts — escenas con lista de las landings (ConversionTemplate, kind "scene"), área landings.
// Con safeCol y el sujeto a la izquierda, cine (scene.ts) mide la placa y escribe en línea el padding-left de la columna del
// titular (.is__copy > .is__text). La lista del slot "more" (.is__more > .is__text) debe arrancar en el mismo borde: aquí se
// copia ese valor cada vez que cine lo cambia (y se limpia en móvil, donde cine lo quita). El CSS de la plantilla deja una
// estimación por si este módulo no corre.
export function initSafeCol() {
  document.querySelectorAll<HTMLElement>('.cv-scene[data-safe-col][data-layout="subject-left"]').forEach((sec) => {
    const a = sec.querySelector<HTMLElement>(':scope > .is__copy > .is__text');
    const b = sec.querySelector<HTMLElement>(':scope > .is__more > .is__text');
    if (!a || !b) return;
    const sync = () => { b.style.paddingLeft = a.style.paddingLeft || ''; };
    sync();
    new MutationObserver(sync).observe(a, { attributes: true, attributeFilter: ['style'] });
  });
}
