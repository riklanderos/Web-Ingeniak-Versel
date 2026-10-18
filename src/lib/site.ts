// src/lib/site.ts — acceso a los datos del sitio (mapa, navegación, placas, textos).
// Fuente de URLs, title, meta, H1, breadcrumbs, FAQ y CTAs: src/data/sitemap.json (D-sitemap con cambios de ESPEC §0.3).
// Fuente del texto publicable: src/content/paginas/<pageId>.json (ESPEC §12.2 R1).
import sitemap from '../data/sitemap.json';
import navegacion from '../data/navegacion.json';
import plates from '../data/plates.json';

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
  discovery: '/discovery/',
  agenda: 'https://agenda.ingeniak.tech/discovery/agendar',
  kainApp: 'https://app.kain.mx',
  kommo: 'https://www.kommo.com/',
} as const;

export type Page = (typeof sitemap)[number];
export const pages = sitemap as Page[];
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
