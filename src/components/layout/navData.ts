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

/* ───────── Pantalla del mega menú: Kain SIEMPRE de cuerpo completo (§0.1 · tarea nav de construcción) ─────────
 * El still 21:9 de 640 px corta la cabeza o los pies del sujeto (la placa es 16:9 y Kain ocupa ~87 % de su alto). La pantalla
 * usa la PLACA de escritorio de 1280 px (≈ 18 KB en AVIF, la misma que ya publica plates.mjs) y la encuadra con la caja del
 * sujeto registrada en plates.json (subject.d): el sujeto entero cabe en la pantalla, del lado de su composición, y el texto
 * de la pantalla va del otro lado (data-copy). El encuadre lo hace CSS (nav.css · .mm-screen__img) con estas variables.
 * Placa: la de la portada destino; si aún no está registrada, su launchFallback del sitemap; si no, la del respaldo local de la
 * plantilla (nosotros → nosotros-manifiesto); si no, la estación Atender. Nunca se pide un archivo que no exista. */
export const SCREEN_DEFAULT_PLATE = 'home-sistema-2-atender';
const SCREEN_LOCAL_FALLBACK: Record<string, string> = {
  '/nosotros/': 'nosotros-manifiesto',   // AboutTemplate usa el mismo respaldo mientras no exista equipo-real
};
const usable = (id?: string | null): id is string => {
  const p = id ? getPlate(id) : null;
  return !!(p?.d?.src && Array.isArray(p?.subject?.d) && p.subject.d.length === 4);
};
/** Placa registrada que la pantalla del mega menú muestra para un href. */
export function screenPlateOf(href: string): string {
  if (/^https?:/.test(href)) return SCREEN_DEFAULT_PLATE;
  const url = href.split('#')[0];
  const p = pageByHref(url);
  const s = (p?.sections as any[])?.find((x) => x.plate);
  const raw = s?.plate?.id;
  const lf = s?.plate?.launchFallback;
  const ids = (Array.isArray(raw) ? raw : [raw]).concat([typeof lf === 'string' ? lf : lf?.plate, SCREEN_LOCAL_FALLBACK[url]]);
  return ids.find((id) => usable(id)) ?? SCREEN_DEFAULT_PLATE;
}
export type ScreenFrame = { src: string; frame: string; copy: 'l' | 'r'; plate: string };
const r3 = (n: number) => String(Math.round(n * 1000) / 1000);
/** Imagen (ruta base sin extensión) y encuadre de la pantalla para una placa registrada. */
export function screenFrame(plateId: string): ScreenFrame {
  const id = usable(plateId) ? plateId : SCREEN_DEFAULT_PLATE;
  const p = getPlate(id) as any;
  const [a, b, c, d] = (p.subject.d as number[]).map((v) => Math.min(1, Math.max(0, Number(v) || 0)));
  const x0 = Math.min(a, c), x1 = Math.max(a, c), y0 = Math.min(b, d), y1 = Math.max(b, d);
  const left = p.layout === 'subject-left' || (p.layout !== 'subject-right' && (x0 + x1) / 2 < 0.42);
  return {
    plate: id,
    src: `${p.d.src}-1280`,
    copy: left ? 'r' : 'l',
    frame: `--ar:${r3(p.d.ar || p.d.w / p.d.h || 1.7917)};--sx:${r3(x0)};--sy:${r3(y0)};--sw:${r3(Math.max(0.05, x1 - x0))};--sh:${r3(Math.max(0.05, y1 - y0))};--sd:${left ? '-1' : '1'}`,
  };
}
/** Pantalla de un href (placa de su portada encuadrada). */
export function screenOf(href: string): ScreenFrame {
  return screenFrame(screenPlateOf(href));
}
/** Id de placa desde una ruta de still de navegacion.json ("/img/cine/<id>-still"). */
export function plateFromStill(path?: string): string | undefined {
  const m = path?.match(/\/img\/cine\/(.+?)-still(?:-\d+)?$/);
  return m?.[1];
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
