// src/lib/indexacion.mjs — regla ÚNICA de indexación (ESPEC-v2 §12.2 R2, R8 y §12.6 R17), en JS plano para que la usen
// astro.config.mjs (filtro de @astrojs/sitemap), src/lib/site.ts (llms.txt, llms-full.txt, /indice.json) y scripts/check-*.mjs.
// Funciones puras: reciben la entrada de sitemap.json y su copy (src/content/paginas/<id>.json o null).

/** Caso breve (R2): la página trae `publishGate` en sitemap.json y su copy no lo marca confirmado (`publishGate.ok === true`). */
export function gatePending(page, copy) {
  return !!page?.publishGate && copy?.publishGate?.ok !== true;
}

/** Landing oculta de campaña (R17, cambio 2026-10-20): `hidden: true` en sitemap.json (/discovery/, /power-session/,
 *  /agendar/confirmado/). Fuera de sitemap.xml, llms*.txt, /indice.json (⌘K), menús, footer, "Sigue explorando" y de todo
 *  enlace desde una página pública. */
export function isHidden(page) {
  return page?.hidden === true;
}

/** La página sale con `noindex,follow`: 404, `indexable: false`, landing oculta o puerta de publicación pendiente. */
export function isNoindex(page, copy) {
  return !page || page.template === 'T-404' || page.indexable === false || isHidden(page) || gatePending(page, copy);
}
