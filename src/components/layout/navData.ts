// src/components/layout/navData.ts — datos derivados para la navegación (área nav).
// Todo sale de src/data/sitemap.json, src/data/navegacion.json, src/data/plates.json y src/lib/metrics.ts.
// Ningún número comercial se escribe aquí: las cifras se imprimen con su id de metrics.ts (data-metric).
import { pages, nav, getPlate, SITE, type Page } from '../../lib/site';
import { METRICS, type MetricId } from '../../lib/metrics';

export type NavLink = {
  label: string;
  href: string;
  description?: string;
  metricId?: MetricId;
  external?: boolean;
  badge?: string;
};

/** Página del sitemap por URL (ignora el #ancla). */
export function pageByHref(href: string): Page | undefined {
  const url = href.split('#')[0];
  return pages.find((p) => p.url === url);
}

/** Nombre corto de una URL (el último eslabón de su breadcrumb = nombre del menú). */
export function shortName(href: string): string {
  const special: Record<string, string> = {
    '/': 'Inicio',
    '/servicios/': 'Todos los servicios',
    '/industrias/': 'Todas las industrias',
    '/casos/': 'Todos los casos',
    '/blog/': 'Blog',
    '/discovery/': 'Discovery Session',
    '/kain/': 'Kain',
    'https://app.kain.mx/': 'app.kain.mx',
  };
  if (special[href]) return special[href];
  const p = pageByHref(href);
  const bc = (p?.breadcrumbs as any[]) ?? [];
  return bc.length ? bc[bc.length - 1].name : p?.h1 ?? href;
}

/** Cifras confirmadas por destino (sustituye a los textos "metric" de navegacion.json). */
const METRIC_BY_HREF: Record<string, MetricId> = {
  '/industrias/salud/': 'dental-citas',
  '/industrias/industrial-logistica/': 'logistica-procesos',
  '/industrias/retail-ecommerce/': 'retail-conversiones',
  '/industrias/horeca/': 'horeca-roas',
  '/casos/clinica-dental-monterrey/': 'dental-citas',
  '/casos/retail-multimarca-kommo/': 'retail-conversiones',
  '/casos/ecommerce-cdmx-costo-por-lead/': 'ecom-cpl',
  '/casos/horeca-roas/': 'horeca-roas',
  '/casos/logistica-n8n/': 'logistica-procesos',
};
export function metricFor(item: { href: string; metricId?: string }): MetricId | undefined {
  const id = (item.metricId ?? METRIC_BY_HREF[item.href]) as MetricId | undefined;
  return id && METRICS[id] ? id : undefined;
}

/** Placa de la portada de una URL (primera sección con placa). */
export function heroPlateOf(href: string): string | undefined {
  const p = pageByHref(href);
  const s = (p?.sections as any[])?.find((x) => x.plate);
  const id = s?.plate?.id;
  return Array.isArray(id) ? id[0] : id;
}

export const STILL_FALLBACK = '/img/cine/home-hero-still-640';
/** Ruta base (sin extensión) del still 21:9 de 640 px de la portada destino. */
export function stillOf(href: string): string {
  if (/^https?:/.test(href)) return '/img/cine/home-sistema-2-atender-still-640';
  const id = heroPlateOf(href);
  return id ? `/img/cine/${id}-still-640` : STILL_FALLBACK;
}

/** ¿La placa está registrada? (solo informativo; el JS cae al respaldo si el archivo no existe). */
export function plateKnown(href: string): boolean {
  const id = heroPlateOf(href);
  return !!(id && getPlate(id));
}

const megaSrc = (nav.megaMenu as any[]) ?? [];
export const MEGA = {
  servicios: megaSrc.find((m) => m.label === 'Servicios'),
  industrias: megaSrc.find((m) => m.label === 'Industrias'),
  casos: megaSrc.find((m) => m.label === 'Casos'),
  kain: megaSrc.find((m) => m.label === 'Kain'),
  empresa: megaSrc.find((m) => m.label === 'Empresa'),
  recursos: megaSrc.find((m) => m.label === 'Recursos'),
};

export type StageColumn = { title: string; glyph: string; description?: string; items: NavLink[] };
export const STAGES: StageColumn[] = (MEGA.servicios?.columns ?? []) as StageColumn[];

/** Etapa (columna de Servicios) a la que pertenece un href. */
export function stageOf(href: string): string | undefined {
  return STAGES.find((c) => c.items.some((i) => i.href === href))?.title;
}

export const NAV_ENTRIES = [
  { key: 'servicios', label: 'Servicios', type: 'mega' },
  { key: 'industrias', label: 'Industrias', type: 'mega' },
  { key: 'casos', label: 'Casos', type: 'mega' },
  { key: 'kain', label: 'Kain', type: 'link', href: '/kain/' },
  { key: 'empresa', label: 'Empresa', type: 'mega' },
  { key: 'recursos', label: 'Recursos', type: 'mega' },
] as const;

/** Qué entrada de primer nivel corresponde a la página actual (para el pill del encabezado). */
export function currentEntry(url: string): string | undefined {
  if (!url) return;
  if (url === '/kain/') return 'kain';
  const p = pageByHref(url);
  const g = p?.group;
  if (g === 'Servicios') return 'servicios';
  if (g === 'Industrias') return 'industrias';
  if (g === 'Casos') return 'casos';
  if (g === 'Recursos') return 'recursos';
  if (g === 'Empresa') return 'empresa';
  if (url === '/contacto/') return 'empresa';
  return undefined;
}

/** Mensaje de WhatsApp de la página (secondaryCta de D) o el genérico del menú. */
export function waOf(page?: Page | null): string {
  const href = (page as any)?.secondaryCta?.href;
  if (href) return href;
  const a = (nav.actions as any[])?.find((x) => x.style === 'icon');
  return a?.href ?? SITE.waBase;
}

export const FOOTER = nav.footer as {
  columns: { title: string; links: string[] }[];
  social: string[];
  legal: string[];
  firma: string;
};
