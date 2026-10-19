// src/lib/indexacion.mjs — regla ÚNICA de indexación (ESPEC-v2 §12.2 R2 y R8), en JS plano para que la usen
// astro.config.mjs (filtro de @astrojs/sitemap), src/lib/site.ts (llms.txt, llms-full.txt) y scripts/check-*.mjs.
// Funciones puras: reciben la entrada de sitemap.json y su copy (src/content/paginas/<id>.json o null).

/** Caso breve (R2): la página trae `publishGate` en sitemap.json y su copy no lo marca confirmado (`publishGate.ok === true`). */
export function gatePending(page, copy) {
  return !!page?.publishGate && copy?.publishGate?.ok !== true;
}

/** La página sale con `noindex,follow`: 404, `indexable: false` o puerta de publicación pendiente. */
export function isNoindex(page, copy) {
  return !page || page.template === 'T-404' || page.indexable === false || gatePending(page, copy);
}
