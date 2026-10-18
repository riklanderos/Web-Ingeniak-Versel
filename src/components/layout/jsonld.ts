// src/components/layout/jsonld.ts — @graph JSON-LD por plantilla (ESPEC §8.5), con @id estables.
// Los tipos salen de sitemap.json → page.jsonLd ("Service (Offer price 0)" → Service con oferta de 0, etc.).
// Reglas: sin legalName (razón social sin confirmar, §12.1-14); sin geo ni horario ([POR CONFIRMAR]);
// FAQPage solo con las preguntas visibles que la página pasa (texto idéntico); autor = Organization mientras no se confirme (R8).
import { pages, SITE, type Page } from '../../lib/site';
import { PRICE_FROM_CAP } from '../../lib/metrics';

export const ORG_ID = `${SITE.url}/#organization`;
export const LOCAL_ID = `${SITE.url}/#localbusiness`;
export const SITE_ID = `${SITE.url}/#website`;

export type Crumb = { name: string; url?: string; href?: string };
export type FaqItem = { q: string; a: string; id?: string };

const abs = (u: string) => (/^https?:/.test(u) ? u : `${SITE.url}${u}`);

const address = {
  '@type': 'PostalAddress',
  streetAddress: SITE.address.street,
  addressLocality: SITE.address.locality,
  addressRegion: SITE.address.region,
  postalCode: SITE.address.postal,
  addressCountry: SITE.address.country,
};

export function organization() {
  return {
    '@type': 'Organization',
    '@id': ORG_ID,
    name: SITE.name,
    url: `${SITE.url}/`,
    logo: { '@type': 'ImageObject', url: abs('/apple-touch-icon.png') },
    email: SITE.email,
    address,
    contactPoint: [{ '@type': 'ContactPoint', contactType: 'sales', telephone: SITE.phoneE164, email: SITE.email, availableLanguage: ['es'] }],
    sameAs: Object.values(SITE.social),
    brand: { '@type': 'Brand', name: 'kain', url: `${SITE.kainApp}/` },
    knowsAbout: [
      'Agentes de IA para WhatsApp', 'CRM con IA', 'Kommo', 'GoHighLevel', 'Automatización con n8n',
      'Paid media', 'Páginas web de alta conversión', 'SEO y visibilidad en motores de IA', 'Software a la medida', 'Consultoría en inteligencia artificial',
    ],
  };
}

export function localBusiness(areaServed?: string[]) {
  return {
    '@type': 'ProfessionalService',
    '@id': LOCAL_ID,
    name: SITE.name,
    url: `${SITE.url}/`,
    image: abs('/img/og-ingeniak.jpg'),
    email: SITE.email,
    address,
    parentOrganization: { '@id': ORG_ID },
    areaServed: (areaServed ?? ['México', 'Latinoamérica']).map((n) => ({ '@type': 'Place', name: n })),
    priceRange: PRICE_FROM_CAP,
  };
}

export function website() {
  return { '@type': 'WebSite', '@id': SITE_ID, url: `${SITE.url}/`, name: SITE.name, inLanguage: 'es-MX', publisher: { '@id': ORG_ID } };
}

export function breadcrumbList(items: Crumb[], pageUrl: string) {
  return {
    '@type': 'BreadcrumbList',
    '@id': `${abs(pageUrl)}#breadcrumb`,
    itemListElement: items.map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.name, item: abs(c.url ?? c.href ?? pageUrl) })),
  };
}

export function faqPage(items: FaqItem[], pageUrl: string) {
  return {
    '@type': 'FAQPage',
    '@id': `${abs(pageUrl)}#faq`,
    mainEntity: items.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
  };
}

const VKTOR = [
  ['Verify', 'Verificamos tu operación.'],
  ['Koncept', 'Diseñamos el concepto.'],
  ['Transform', 'Transformamos.'],
  ['Operate', 'Operamos junto con tu equipo.'],
  ['Rise', 'Hacemos crecer los resultados.'],
];

/** Hijos directos de un hub (páginas cuyo penúltimo breadcrumb es el hub). */
function childrenOf(url: string) {
  return pages.filter((p) => {
    const bc = (p.breadcrumbs as any[]) ?? [];
    return bc.length >= 2 && bc[bc.length - 2].url === url && p.url !== url && p.indexable;
  });
}

export type GraphOptions = {
  faq?: FaqItem[];
  title: string;
  description: string;
  ogImage: string;
  datePublished?: string;
  dateModified?: string;
  extra?: Record<string, any>[];
};

/** Arma el @graph de una página a partir de page.jsonLd. */
export function buildGraph(page: Page, o: GraphOptions): Record<string, any>[] {
  const url = abs(page.url === '/404' ? '/404/' : page.url);
  const pageId = `${url}#webpage`;
  const types = ((page.jsonLd as string[]) ?? []).map((t) => ({ raw: t, type: t.split(/[\s(×]/)[0] }));
  const has = (t: string) => types.some((x) => x.type === t);
  const raw = (t: string) => types.find((x) => x.type === t)?.raw ?? '';
  if (!types.length) return [];

  const graph: Record<string, any>[] = [];
  const crumbs = ((page.breadcrumbs as any[]) ?? []) as Crumb[];
  const pageType = has('CollectionPage') ? 'CollectionPage' : has('AboutPage') ? 'AboutPage' : has('ContactPage') ? 'ContactPage' : 'WebPage';
  const main: Record<string, any> = {
    '@type': pageType,
    '@id': pageId,
    url,
    name: o.title,
    description: o.description,
    inLanguage: 'es-MX',
    isPartOf: { '@id': SITE_ID },
    primaryImageOfPage: { '@type': 'ImageObject', url: abs(o.ogImage) },
  };
  if (crumbs.length) main.breadcrumb = { '@id': `${url}#breadcrumb` };
  if (page.primaryKeyword) main.keywords = page.primaryKeyword;
  graph.push(main);

  graph.push(organization(), website());
  if (has('ProfessionalService') || pageType === 'ContactPage' || page.template === 'T-HOME') {
    const m = raw('ProfessionalService').match(/areaServed:\s*([^)]+)/);
    graph.push(localBusiness(m ? m[1].split(',').map((x) => x.trim()) : undefined));
  }
  if (crumbs.length && (has('BreadcrumbList') || crumbs.length > 1)) graph.push(breadcrumbList(crumbs, page.url));

  if (has('Service')) {
    const r = raw('Service');
    const svc: Record<string, any> = {
      '@type': 'Service',
      '@id': `${url}#service`,
      name: page.h1,
      serviceType: page.primaryKeyword ?? page.h1,
      description: o.description,
      provider: { '@id': ORG_ID },
      areaServed: [{ '@type': 'Country', name: 'México' }, { '@type': 'Place', name: 'Latinoamérica' }],
      url,
    };
    if (/audience/i.test(r)) {
      const sector = (crumbs[crumbs.length - 1]?.name ?? page.h1) as string;
      svc.audience = { '@type': 'BusinessAudience', audienceType: sector };
    }
    if (/price 0/i.test(r)) svc.offers = { '@type': 'Offer', price: '0', priceCurrency: 'USD', description: 'Discovery Session gratuita de 30 minutos', url };
    graph.push(svc);
  }
  if (has('ItemList')) {
    const kids = childrenOf(page.url);
    if (kids.length)
      graph.push({
        '@type': 'ItemList',
        '@id': `${url}#itemlist`,
        itemListElement: kids.map((k, i) => ({ '@type': 'ListItem', position: i + 1, url: abs(k.url), name: (k.breadcrumbs as any[])?.at(-1)?.name ?? k.h1 })),
      });
  }
  if (has('Blog')) graph.push({ '@type': 'Blog', '@id': `${url}#blog`, url, name: o.title, inLanguage: 'es-MX', publisher: { '@id': ORG_ID } });
  if (has('Brand')) graph.push({ '@type': 'Brand', '@id': `${url}#brand`, name: 'kain', url: `${SITE.kainApp}/`, description: 'Sub-marca de agentes de IA de Ingeniak.' });
  if (has('SoftwareApplication'))
    graph.push({
      '@type': 'SoftwareApplication',
      '@id': `${url}#app`,
      name: 'kain',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web',
      url: `${SITE.kainApp}/`,
      publisher: { '@id': ORG_ID },
      inLanguage: 'es-MX',
    });
  if (has('HowTo'))
    graph.push({
      '@type': 'HowTo',
      '@id': `${url}#howto`,
      name: 'Metodología VKTOR™',
      step: VKTOR.map(([n, t], i) => ({ '@type': 'HowToStep', position: i + 1, name: n, text: t })),
    });
  if (has('Article') || has('BlogPosting')) {
    const art: Record<string, any> = {
      '@type': has('BlogPosting') ? 'BlogPosting' : 'Article',
      '@id': `${url}#article`,
      headline: page.h1,
      description: o.description,
      image: abs(o.ogImage),
      inLanguage: 'es-MX',
      mainEntityOfPage: { '@id': pageId },
      author: { '@id': ORG_ID },
      publisher: { '@id': ORG_ID },
    };
    if (o.datePublished) art.datePublished = o.datePublished;
    if (o.dateModified ?? o.datePublished) art.dateModified = o.dateModified ?? o.datePublished;
    graph.push(art);
  }
  if (o.faq?.length && (has('FAQPage') || o.faq.length)) graph.push(faqPage(o.faq, page.url));
  if (o.extra?.length) graph.push(...o.extra);
  return graph;
}
