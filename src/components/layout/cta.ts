// src/components/layout/cta.ts — fuente única del CTA "Cotizar proyecto" en el código (CAMBIO-COTIZAR §1, área cta-codigo).
// Lo usan Btn, HeroCtas, las plantillas públicas, la navegación (encabezado, barra, hoja, ⌘K, mega menú, footer), EntitySheet,
// EditorNote, Dawn y la 404. Nada de esto escribe la etiqueta a mano: sale de _comun.json → cta.* (copy-a) y de SITE.quote
// (orquestador). Mientras esos datos llegan (fase 1 en paralelo), el respaldo es el texto exacto de la especificación, y un
// valor heredado de la Discovery ("Agenda tu Discovery…", "30 min · … · Google Meet") nunca se imprime fuera de las landings.
//
// Contrato del disparador (§1.2): <a class="btn" href="/contacto/#cotizar" data-primary data-magnetic data-cotizar
//   data-section="hero" aria-haspopup="dialog" aria-controls="cotizar">…</a> + <p class="t-micro btn-micro">micro</p>.
// El binder del modal (QuoteModal, área modal) intercepta los clics en [data-cotizar]; sin JS el href lleva a /contacto/#cotizar.
import * as siteMod from '../../lib/site';
import { pages, normRoute, type Page } from '../../lib/site';
import { COMUN } from '../ui/ui-data';

const S: any = (siteMod as any).SITE ?? {};
const Q: any = S.quote ?? {};
const C: any = COMUN?.cta ?? {};

/** Texto heredado de la Discovery Session: nunca se usa como etiqueta ni microcopia de la cotización. */
const LEGACY_RX = /discovery|google\s?meet|\b30\s?min|\bagend/i;
const pick = (v: unknown, fb: string): string => (typeof v === 'string' && v.trim() && !LEGACY_RX.test(v) ? v.trim() : fb);

export const QUOTE = {
  /** Etiqueta del primario (_comun.cta.cotizar / SITE.quote.label). */
  label: pick(C.cotizar, pick(Q.label, 'Cotizar proyecto')),
  /** Etiqueta corta del encabezado < 1100 px (_comun.cta.cotizarCorto). */
  short: pick(C.cotizarCorto, pick(Q.short, 'Cotizar')),
  /** Respaldo sin JS (SITE.quote.href). En /contacto/ se usa HREF_LOCAL. */
  href: typeof Q.href === 'string' && Q.href ? (Q.href as string) : '/contacto/#cotizar',
  /** Microcopia bajo el primario (D2): sin cifras ni promesa de tiempo. */
  micro: pick(C.micro, pick(Q.micro, 'Sin compromiso · Te contactamos por WhatsApp y correo')),
  /** Subtítulo de la acción fija del ⌘K. */
  sub: pick(C.cotizarSub, 'Te contactamos por WhatsApp y correo'),
  /** Enlace de texto del footer mínimo de las landings. */
  lnk: pick(C.cotizarLnk, '¿Tienes un proyecto en mente? Cotizar proyecto'),
  /** Valor de la fila "Primer paso" de EntitySheet (la etiqueta se enlaza al modal). */
  primerPaso: pick(C.primerPaso, 'Cotizar proyecto · te contactamos por WhatsApp y correo'),
} as const;
export const QUOTE_HREF_LOCAL = '#cotizar';
export const QUOTE_DIALOG_ID = 'cotizar';

/** href del disparador según la página (en /contacto/ apunta a su propia sección #cotizar). */
export const quoteHref = (pageUrl?: string) => (pageUrl === '/contacto/' ? QUOTE_HREF_LOCAL : QUOTE.href);

export type Prefill = { servicio?: string; industria?: string };
/** Atributos del contrato §1.2 (sin data-primary: ese lo pone Btn variant="primary"). */
export function quoteAttrs(section?: string, o: Prefill = {}): Record<string, string> {
  const a: Record<string, string> = { 'data-cotizar': '', 'aria-haspopup': 'dialog', 'aria-controls': QUOTE_DIALOG_ID };
  if (section) a['data-section'] = section;
  if (o.servicio) a['data-cotizar-servicio'] = o.servicio;
  if (o.industria) a['data-cotizar-industria'] = o.industria;
  return a;
}

/** Etiqueta del primario de una sección del copy: ctaPrimary.label ?? _comun.cta.cotizar (nunca la de la Discovery). */
export const primaryLabel = (c: any): string => pick(c?.ctaPrimary?.label, QUOTE.label);

/* ───────────────────────── Rutas ocultas (landings de campaña, R17) ───────────────────────── */
// sitemap.json → "hidden": true (orquestador). Respaldo mientras llega: las tres rutas de §4.1/§5.6.
const HIDDEN_FALLBACK = ['/discovery/', '/power-session/', '/agendar/confirmado/'];
const siteHidden: unknown = (siteMod as any).hiddenRoutes;
/** ¿La página es una landing oculta? */
export function isHiddenPage(p?: Partial<Page> | null): boolean {
  if (!p) return false;
  return (p as any).hidden === true || HIDDEN_FALLBACK.includes((p as any).url);
}
export const hiddenRoutes: Set<string> = new Set([
  ...HIDDEN_FALLBACK,
  ...pages.filter((p) => isHiddenPage(p)).map((p) => p.url),
  ...(siteHidden instanceof Set ? [...siteHidden] : Array.isArray(siteHidden) ? siteHidden : []).map(String),
]);
/** ¿El href lleva a una ruta oculta (o a la agenda externa)? Ninguna página pública debe enlazarla (§1.1-6). */
export function isHiddenHref(href?: string | null): boolean {
  if (!href) return false;
  if (/agenda\.ingeniak\.tech/i.test(href)) return true;
  const r = normRoute(href);
  return !!r && (hiddenRoutes.has(r) || r.startsWith('/agendar/'));
}

/* ───────────────────────── Prefill por página (§1.3) ───────────────────────── */
// src/data/cotizar.json → prefill (área modal). Respaldo: la tabla de §1.3, idéntica, mientras el archivo llega.
const cotizarFiles = import.meta.glob('../../data/cotizar.json', { eager: true, import: 'default' }) as Record<string, any>;
export const COTIZAR: any = Object.values(cotizarFiles)[0] ?? null;
const PREFILL_FALLBACK: Record<string, Prefill> = {
  consultoria: { servicio: 'consultoria-ia' },
  'agentes-whatsapp': { servicio: 'agentes-ia' }, kain: { servicio: 'agentes-ia' }, guadalajara: { servicio: 'agentes-ia' },
  'art-costo': { servicio: 'agentes-ia' }, 'art-agente-chatbot': { servicio: 'agentes-ia' },
  'crm-ia': { servicio: 'crm-ia' }, kommo: { servicio: 'crm-ia' }, gohighlevel: { servicio: 'crm-ia' },
  'art-kommo-ghl': { servicio: 'crm-ia' }, 'art-partner-kommo': { servicio: 'crm-ia' }, 'art-ghl-espanol': { servicio: 'crm-ia' },
  n8n: { servicio: 'automatizacion' }, 'art-n8n': { servicio: 'automatizacion' },
  'paid-media': { servicio: 'paid-media' }, 'paginas-web': { servicio: 'web-design' }, software: { servicio: 'software' },
  seo: { servicio: 'seo' }, branding: { servicio: 'branding' },
  'ind-salud': { industria: 'salud' }, 'ind-belleza': { industria: 'belleza' }, 'ind-nutricion': { industria: 'nutricion' },
  'ind-finanzas': { industria: 'finanzas' }, 'ind-inmobiliario': { industria: 'inmobiliario' },
  'ind-industrial': { industria: 'industrial-logistica' }, 'ind-retail': { industria: 'retail-ecommerce' }, 'ind-horeca': { industria: 'horeca' },
  'caso-dental': { servicio: 'agentes-ia', industria: 'salud' },
  'caso-retail': { servicio: 'crm-ia', industria: 'retail-ecommerce' },
  'caso-ecommerce': { servicio: 'paid-media', industria: 'retail-ecommerce' },
  'caso-horeca': { servicio: 'paid-media', industria: 'horeca' },
  'caso-logistica': { servicio: 'automatizacion', industria: 'industrial-logistica' },
};
const PREFILL: Record<string, Prefill> = (COTIZAR?.prefill as Record<string, Prefill> | undefined) ?? PREFILL_FALLBACK;
/** Prefill de una página (servicio / industria) o {}. */
export function prefillOf(pageId?: string): Prefill {
  const p = pageId ? PREFILL[pageId] : undefined;
  return p ? { ...(p.servicio ? { servicio: p.servicio } : {}), ...(p.industria ? { industria: p.industria } : {}) } : {};
}

/* ───────────────────────── Enlaces del copy (links[] con "cotizar": true) ───────────────────────── */
/** Traduce un enlace del copy: con `cotizar: true` → disparador del modal (href de respaldo + data-cotizar + aria);
 *  un enlace a una landing oculta también se vuelve cotización (nunca se enlaza una ruta oculta desde una página pública). */
export function linkProps(l: { href?: string; cotizar?: boolean } | null | undefined, section?: string, pageUrl?: string): Record<string, string> & { href: string } {
  const href = String(l?.href ?? '');
  if (l?.cotizar || isHiddenHref(href)) return { href: quoteHref(pageUrl), ...quoteAttrs(section) };
  return { href };
}
/** Igual que linkProps pero conserva el objeto del copy: { ...l, href, attrs } (attrs = atributos del disparador o {}).
 *  Las plantillas pintan <a href={l.href} {...l.attrs}>. Uso: (links ?? []).map((l) => quoteLink(l, 'sección', page.url)). */
export function quoteLink<T extends { href?: string; cotizar?: boolean }>(l: T, section?: string, pageUrl?: string): T & { href: string; attrs: Record<string, string> } {
  if (l && (l.cotizar || isHiddenHref(l.href))) return { ...l, href: quoteHref(pageUrl), attrs: quoteAttrs(section) };
  return { ...(l as T), href: String(l?.href ?? ''), attrs: {} };
}
