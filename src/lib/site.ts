// src/lib/site.ts — acceso a los datos del sitio (mapa, navegación, placas, textos).
// Fuente de URLs, title, meta, H1, breadcrumbs, FAQ y CTAs: src/data/sitemap.json (D-sitemap con cambios de ESPEC §0.3).
// Fuente del texto publicable: src/content/paginas/<pageId>.json (ESPEC §12.2 R1).
import sitemap from '../data/sitemap.json';
import navegacion from '../data/navegacion.json';
import plates from '../data/plates.json';
import fs from 'node:fs';
import { isNoindex, gatePending, isHidden } from './indexacion.mjs';
import { METRICS, OFFERS, PRICE_FROM, PRICE_FROM_CAP, SOURCE_NOTE } from './metrics';
import path from 'node:path';

export const SITE = {
  name: 'Ingeniak',
  url: 'https://ingeniak.mx',
  email: 'contacto@ingeniak.mx',
  phone: '+52 33 2101 7799',
  phoneE164: '+523321017799',
  waBase: 'https://wa.me/523321017799',
  city: 'Guadalajara, Jalisco, México',
  address: { street: 'Av. Punto Sur 312', locality: 'Tlajomulco de Zúñiga', region: 'Jalisco', postal: '45640', country: 'MX' },
  social: {
    instagram: 'https://www.instagram.com/ingeniakmx/',
    facebook: 'https://www.facebook.com/ingeniakmx',
    linkedin: 'https://www.linkedin.com/company/ingeniakmx',
  },
  /** Acción primaria del sitio público (CAMBIO-COTIZAR §1, ESPEC §12.6 R15): abre el modal <dialog id="cotizar">; sin JS,
   *  href lleva a la sección real /contacto/#cotizar. La etiqueta visible sale del copy (_comun.cta.cotizar); esta es su respaldo. */
  quote: { label: 'Cotizar proyecto', short: 'Cotizar', href: '/contacto/#cotizar', hash: 'cotizar' },
  /** Landings ocultas de campaña (R17): nunca se enlazan desde una página pública (check-cta, check-seo). */
  discovery: '/discovery/',
  power: '/power-session/',
  confirm: '/agendar/confirmado/',
  kainApp: 'https://app.kain.mx',
  kommo: 'https://www.kommo.com/',
} as const;

export type Page = (typeof sitemap)[number];

/* Cifras en title / metaDescription / h1 de sitemap.json: van como token ({{metric:ID}}, {{metric:ID|full}},
 * {{metric:ID|prose}}, {{price}}, {{Price}}, {{source}}), igual que el copy, y se resuelven aquí desde metrics.ts
 * (QA ronda 1: la meta de /industrias/salud/ llevaba "3.2× … y respuesta en 12 s" escrito a mano). Así <title>,
 * meta description, og:*, JSON-LD y llms.txt cambian solos con METRICS. check-cifras falla si queda una cifra suelta. */
const SITE_TOKEN_RX = /\{\{(metric:([a-z0-9-]+)(?:\|(full|prose))?|offer:([a-z0-9-]+)|price|Price|source)\}\}/g;
export function resolveTokens<T>(s: T): T {
  if (typeof s !== 'string' || !s.includes('{{')) return s;
  return s.replace(SITE_TOKEN_RX, (all, k: string, id: string, mod?: string, offer?: string) => {
    // {{offer:ID}}: oferta de una landing oculta (OFFERS de metrics.ts, R18). Solo se publica en OFFER_ROUTES (check-cifras).
    if (offer) {
      const o = (OFFERS as Record<string, string>)[offer];
      if (!o) throw new Error(`[site] sitemap.json: oferta desconocida ${all}`);
      return o;
    }
    if (k === 'price') return PRICE_FROM;
    if (k === 'Price') return PRICE_FROM_CAP;
    if (k === 'source') return SOURCE_NOTE;
    const m = (METRICS as Record<string, { value: string; label: string; prose?: string }>)[id];
    if (!m) throw new Error(`[site] sitemap.json: cifra desconocida ${all}`);
    return mod === 'prose' ? (m.prose ?? `${m.value} ${m.label}`) : mod === 'full' ? `${m.value} ${m.label}` : m.value;
  }) as T;
}
export const pages = (sitemap as Page[]).map((p) => ({
  ...p,
  title: resolveTokens(p.title),
  metaDescription: resolveTokens(p.metaDescription),
  h1: resolveTokens(p.h1),
})) as Page[];
export const nav = navegacion as any;

export function getPage(url: string): Page {
  const p = pages.find((x) => x.url === url);
  if (!p) throw new Error(`[site] página no encontrada en sitemap.json: ${url}`);
  return p;
}
export function getPageById(id: string): Page | undefined {
  return pages.find((x) => x.id === id);
}
export function section(page: Page, id: string): any {
  return (page.sections as any[]).find((s) => s.id === id);
}

export type Plate = any;
export function getPlate(id: string): Plate | undefined {
  return (plates as Record<string, Plate>)[id];
}
/** Alt de una placa para un uso concreto (R11): plates.json → altBy[pageId] (p. ej. home-sistema-2-atender como portada de
 *  agentes-whatsapp, con la conversación registrada en su teléfono) o, si no hay, su alt general. */
export function plateAlt(id: string | null | undefined, pageId?: string): string {
  const p = id ? getPlate(id) : undefined;
  if (!p) return '';
  return (pageId && p.altBy?.[pageId]) || p.alt || '';
}

/** Arma el enlace de WhatsApp con el mensaje propio de cada página/sección. */
export function waHref(message: string) {
  return `${SITE.waBase}?text=${encodeURIComponent(message)}`;
}

/** Texto publicable de una página (src/content/paginas/<id>.json). */
const copies = import.meta.glob('../content/paginas/*.json', { eager: true, import: 'default' }) as Record<string, any>;
export function getCopy(pageId: string): any {
  const key = Object.keys(copies).find((k) => k.endsWith(`/${pageId}.json`));
  if (!key) throw new Error(`[site] falta el texto de la página: src/content/paginas/${pageId}.json`);
  return copies[key];
}

/* ───────────────────────── Rutas construidas (ESPEC §12.2 R12) ─────────────────────────
 * Una página de sitemap.json está CONSTRUIDA cuando (1) tiene su texto en src/content/paginas/<id>.json y
 * (2) existe una ruta en src/pages que la sirve: un archivo estático (index.astro, discovery/index.astro…) o un
 * [slug].astro en su carpeta (servicios/, industrias/, casos/…). Es el mismo filtro de los getStaticPaths de
 * servicios/[slug], industrias/[slug] y casos/[slug]: al publicar el copy de otra página, aparece sola aquí.
 * Las páginas planeadas sin construir NO se enlazan (ni con '#'): usa linkTarget() y pinta texto sin enlace.
 */
const PAGES_DIR = path.join(process.cwd(), 'src/pages');
function routeFiles(dir = PAGES_DIR, base = ''): string[] {
  let out: string[] = [];
  let entries: fs.Dirent[] = [];
  try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return out; }
  for (const e of entries) {
    if (e.name.startsWith('_') || e.name.startsWith('.')) continue;
    if (e.isDirectory()) { if (base === '' && e.name === 'dev') continue; out = out.concat(routeFiles(path.join(dir, e.name), `${base}/${e.name}`)); }
    else if (/\.(astro|md|mdx)$/.test(e.name)) out.push(`${base}/${e.name}`);
  }
  return out;
}
/** Patrones de ruta de src/pages: '/', '/discovery/', '/servicios/[slug]/', '/404'. */
const ROUTE_RX: RegExp[] = routeFiles().map((f) => {
  const noExt = f.replace(/\.(astro|md|mdx)$/, '');
  if (noExt === '/404') return /^\/404\/?$/;
  const url = noExt.replace(/\/index$/, '') + '/';
  const rx = url.replace(/[.*+?^${}()|\\]/g, (c) => (c === '[' || c === ']' ? c : '\\' + c)).replace(/\[\.\.\.[^\]]+\]/g, '.+').replace(/\[[^\]]+\]/g, '[^/]+');
  return new RegExp(`^${rx}$`);
});
const hasCopyFile = (id: string) => Object.keys(copies).some((k) => k.endsWith(`/${id}.json`));
const routeExists = (url: string) => ROUTE_RX.some((rx) => rx.test(url));

/** URLs de sitemap.json que hoy existen como página (con copy + ruta). El 404 cuenta aunque no tenga copy propio. */
export const builtRoutes: Set<string> = new Set(
  pages.filter((p) => routeExists(p.url) && (hasCopyFile(p.id) || p.template === 'T-404')).map((p) => p.url),
);
/** URLs de sitemap.json planeadas que todavía no se construyen (puerta R12: copy aprobado + plantilla). */
export const plannedRoutes: Set<string> = new Set(pages.map((p) => p.url).filter((u) => !builtRoutes.has(u)));

/** Normaliza un href interno a la URL de sitemap.json ('/x/y/'): sin origen, query ni hash, con barra final. */
export function normRoute(href: string): string | null {
  if (!href) return null;
  let h = String(href).trim();
  if (/^(mailto:|tel:|javascript:|data:)/i.test(h)) return null;
  const abs = h.match(/^https?:\/\/([^/]+)(\/[^?#]*)?/i);
  if (abs) { if (!/(^|\.)ingeniak\.mx$/i.test(abs[1])) return null; h = abs[2] || '/'; }
  if (h.startsWith('#') || h.startsWith('?')) return null;
  h = h.replace(/[?#].*$/, '');
  if (!h.startsWith('/')) return null;
  if (h === '/404' || h === '/404/') return '/404';
  if (!/\.[a-z0-9]{2,5}$/i.test(h) && !h.endsWith('/')) h += '/';
  return h;
}
export type RouteStatus = 'built' | 'planned' | 'unknown' | 'external' | 'anchor';
/** 'built' (existe) · 'planned' (en sitemap.json, sin construir) · 'unknown' (no está en sitemap.json) · 'external' · 'anchor' (#… en la misma página). */
export function routeStatus(href: string): RouteStatus {
  if (!href) return 'unknown';
  if (href.startsWith('#')) return 'anchor';
  const r = normRoute(href);
  if (r === null) return /^[a-z]+:/i.test(href) ? 'external' : 'unknown';
  if (builtRoutes.has(r)) return 'built';
  if (plannedRoutes.has(r)) return 'planned';
  return 'unknown';
}
/** true si el href lleva a una página que existe hoy (externos, mailto/tel y anclas locales también cuentan como true). */
export function isBuilt(href: string): boolean {
  const s = routeStatus(href);
  return s === 'built' || s === 'external' || s === 'anchor';
}
/** Href utilizable o null: las plantillas pintan el texto sin enlace cuando es null (nunca '#').
 *  fallback opcional: otra ruta (p. ej. el hub o /discovery/) que se usa solo si también está construida. */
export function linkTarget(href: string, fallback?: string): string | null {
  if (isBuilt(href)) return href;
  if (fallback && isBuilt(fallback)) return fallback;
  return null;
}

/** Copy de una página o null (sin lanzar error). */
export function copyOrNull(pageId: string): any | null {
  const key = Object.keys(copies).find((k) => k.endsWith(`/${pageId}.json`));
  return key ? copies[key] : null;
}
/** Caso breve (R2): publishGate en sitemap.json sin confirmar en el copy. */
export function isGatePending(page: Page): boolean { return gatePending(page, copyOrNull(page.id)); }
/** noindex,follow: 404, indexable:false, landing oculta o puerta pendiente sin indexBrief (misma regla que astro.config → sitemap.xml y check-seo). */
export function pageNoindex(page: Page): boolean { return isNoindex(page, copyOrNull(page.id)); }
/** Páginas que van a sitemap.xml, llms.txt y llms-full.txt (R8): construidas e indexables (incluye casos breves con indexBrief). */
export function indexablePages(): Page[] { return pages.filter((p) => builtRoutes.has(p.url) && !pageNoindex(p)); }

/* ───────────────────────── Landings ocultas (ESPEC §12.6 R17) ─────────────────────────
 * sitemap.json → "hidden": true. Salen con noindex,follow (isNoindex) y fuera de sitemap.xml, llms*.txt, /indice.json,
 * menús, footer, "Sigue explorando" y de cualquier enlace desde una página pública (check-cta y check-seo lo vigilan). */
/** URLs de las landings ocultas ('/discovery/', '/power-session/', '/agendar/confirmado/'). */
export const hiddenRoutes: Set<string> = new Set(pages.filter((p) => isHidden(p)).map((p) => p.url));
/** ¿La página es una landing oculta? */
export function isHiddenPage(page: Page | null | undefined): boolean { return isHidden(page); }
/** ¿El href lleva a una landing oculta (o a la agenda externa de v1)? Acepta rutas, URLs absolutas de ingeniak.mx y hash/query. */
export function isHiddenRoute(href: string | null | undefined): boolean {
  if (!href) return false;
  if (/agenda\.ingeniak\.tech/i.test(href)) return true;
  const r = normRoute(href);
  return !!r && (hiddenRoutes.has(r) || r.startsWith('/agendar/'));
}
/** Páginas públicas construidas: ni ocultas ni el 404 (lo que pueden listar menús, footer, ⌘K y "Sigue explorando"). */
export function publicPages(): Page[] {
  return pages.filter((p) => builtRoutes.has(p.url) && !isHidden(p) && p.template !== 'T-404');
}
