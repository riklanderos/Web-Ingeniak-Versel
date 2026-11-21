// src/lib/i18n.ts — versión en inglés (rama ingk/version-ingles, 2026-11-20).
// El sitio es español por defecto. La versión corta en inglés vive bajo /en/: cada página en inglés es una entrada propia
// de src/data/sitemap.json (id "en-<id>", lang "en", alternate = su gemela en español) con su texto en
// src/content/paginas/en-<id>.json. Las plantillas son las mismas; lo que está escrito en código pasa por t(lang).
// El idioma de cada petición lo fija src/middleware.ts en Astro.locals.lang (por la URL); en el navegador, <html lang>.

export type Lang = 'es' | 'en';

/** Gemelas español → inglés (solo las páginas traducidas). */
export const EN_ROUTES: Record<string, string> = {
  '/': '/en/',
  '/servicios/': '/en/services/',
  '/discovery/': '/en/discovery/',
  '/agendar/gracias/': '/en/book/thank-you/',
  '/contacto/': '/en/contact/',
  '/aviso-privacidad/': '/en/privacy/',
  '/casos/retail-multimarca-kommo/': '/en/case-studies/multi-brand-retail-kommo/',
  '/casos/logistica-n8n/': '/en/case-studies/logistics-n8n/',
};
const ES_ROUTES: Record<string, string> = Object.fromEntries(Object.entries(EN_ROUTES).map(([es, en]) => [en, es]));

/** Idioma de una ruta: '/en' o '/en/…' es inglés; todo lo demás, español. */
export function langOfPath(pathname: string | null | undefined): Lang {
  return /^\/en(\/|$)/.test(pathname ?? '') ? 'en' : 'es';
}
/** Idioma de una entrada del sitemap. */
export function langOfPage(page: { lang?: string; url?: string } | null | undefined): Lang {
  return page?.lang === 'en' ? 'en' : langOfPath(page?.url);
}
/** Gemela de una ruta en el otro idioma, o null si esa página no está traducida. */
export function twinOf(url: string): string | null {
  const base = url.split('#')[0];
  return EN_ROUTES[base] ?? ES_ROUTES[base] ?? null;
}
/**
 * Href en el idioma de la página: en inglés, un enlace interno a una página traducida se cambia por su gemela
 * (conserva el #ancla). Las páginas sin traducir se quedan en español. En español no cambia nada.
 */
export function localHref(href: string, lang: Lang): string {
  if (lang !== 'en' || !href || !href.startsWith('/') || href.startsWith('/en/')) return href;
  const [base, hash] = href.split('#');
  const en = EN_ROUTES[base];
  return en ? en + (hash !== undefined ? `#${hash}` : '') : href;
}
/** Etiqueta de <html lang> y de og:locale. */
export const HTML_LANG: Record<Lang, string> = { es: 'es-MX', en: 'en-US' };
export const OG_LOCALE: Record<Lang, string> = { es: 'es_MX', en: 'en_US' };
/** Configuración regional para fechas y números (Intl). */
export const INTL_LOCALE: Record<Lang, string> = { es: 'es-MX', en: 'en-US' };

/* Idioma de la página que se está generando. El build estático genera las páginas de una en una (build.concurrency = 1,
 * el valor por defecto de Astro): src/middleware.ts lo fija al empezar cada página y así los ayudantes que no reciben
 * props (ui-data, Metric, navData…) saben en qué idioma escribir sin pasar `lang` por cada componente.
 * En `astro dev` dos peticiones simultáneas podrían cruzarse; no afecta al build publicado. */
let current: Lang = 'es';
export function setCurrentLang(lang: Lang) { current = lang; }
export function currentLang(): Lang { return current; }
/** Elige el texto del idioma actual: L({ es: '…', en: '…' }). */
export function L<T>(m: { es: T; en: T }, lang: Lang = current): T { return m[lang]; }
/** Idioma en el navegador (<html lang>) o, al generar la página, el de la página actual. Para módulos que corren en ambos. */
export function runtimeLang(): Lang {
  if (typeof document !== 'undefined' && document.documentElement) return document.documentElement.lang.toLowerCase().startsWith('en') ? 'en' : 'es';
  return current;
}
