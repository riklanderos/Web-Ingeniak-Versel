#!/usr/bin/env node
// scripts/ingles.mjs — arma la versión en inglés en los datos del sitio (2026-11-20). Se puede correr las veces que haga falta.
//
// 1. src/data/sitemap.json: por cada página traducida agrega (o reemplaza) la entrada "en-<id>". Parte de la entrada en
//    español y le pone lo traducido de materiales/v2/ingles/sitemap/en-<id>.json (title, meta, H1, breadcrumbs, nombres de
//    secciones, CTA, FAQ, palabras clave), más lang "en", su URL en inglés y alternate (la gemela en español). Las
//    secciones conservan placas y estructura: solo cambia su nombre.
// 2. src/data/faq-en.json: banco de preguntas en inglés, unión de materiales/v2/ingles/faq/*.json (mismos ids que faq.json).
//
// Uso: node scripts/ingles.mjs
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';

const root = new URL('../', import.meta.url);
const rd = (p) => JSON.parse(readFileSync(new URL(p, root), 'utf8'));

// Mismas gemelas que src/lib/i18n.ts (EN_ROUTES).
const i18nSrc = readFileSync(new URL('src/lib/i18n.ts', root), 'utf8');
const block = i18nSrc.match(/EN_ROUTES[^{]*\{([\s\S]*?)\};/)[1];
const EN_ROUTES = Object.fromEntries([...block.matchAll(/'([^']+)':\s*'([^']+)'/g)].map((m) => [m[1], m[2]]));
const localHref = (href) => {
  if (typeof href !== 'string' || !href.startsWith('/') || href.startsWith('/en/')) return href;
  const [base, hash] = href.split('#');
  const en = EN_ROUTES[base];
  return en ? en + (hash !== undefined ? `#${hash}` : '') : href;
};
const WA = 'https://wa.me/523321017799';
/** Anclas del footer mínimo de las landings (sitemap.json → footerAnchors), por destino. */
const FOOTER_ANCHORS_EN = { '#agenda': 'Book', '#que-es': 'What it is', '#para-quien': "Who it's for", '#faq': 'FAQ', '#despues': 'After the call' };

const sitemap = rd('src/data/sitemap.json');
const es = sitemap.filter((p) => p.lang !== 'en');
const out = [...es];
const faltan = [];

for (const [esUrl, enUrl] of Object.entries(EN_ROUTES)) {
  const base = es.find((p) => p.url === esUrl);
  if (!base) throw new Error(`[ingles] no hay página en español con url ${esUrl}`);
  const id = `en-${base.id}`;
  const fragUrl = new URL(`materiales/v2/ingles/sitemap/${id}.json`, root);
  if (!existsSync(fragUrl)) { faltan.push(id); continue; }
  const t = JSON.parse(readFileSync(fragUrl, 'utf8'));
  const names = new Map((t.sections ?? []).map((s) => [s.id, s.name]));
  const cta2 = base.secondaryCta && t.secondaryCta
    ? { ...base.secondaryCta, ...t.secondaryCta, href: t.secondaryCta.waMessage ? `${WA}?text=${encodeURIComponent(t.secondaryCta.waMessage)}` : base.secondaryCta.href }
    : base.secondaryCta;
  const cta1 = base.primaryCta && t.primaryCta ? { ...base.primaryCta, ...t.primaryCta, href: localHref(t.primaryCta.href ?? base.primaryCta.href) } : base.primaryCta;
  const entry = {
    ...base,
    id,
    lang: 'en',
    alternate: esUrl,
    url: enUrl,
    canonical: `https://ingeniak.mx${enUrl}`,
    status: `versión en inglés de ${esUrl} (2026-11-20)`,
    primaryKeyword: t.primaryKeyword ?? base.primaryKeyword,
    secondaryKeywords: t.secondaryKeywords ?? base.secondaryKeywords,
    title: t.title,
    titleLength: t.title.length,
    metaDescription: t.metaDescription,
    metaLength: t.metaDescription.length,
    h1: t.h1,
    breadcrumbs: t.breadcrumbs ?? [],
    sections: (base.sections ?? []).map((s) => (names.has(s.id) ? { ...s, name: names.get(s.id) } : s)),
    primaryCta: cta1,
    secondaryCta: cta2,
    internalLinks: Array.isArray(base.internalLinks) ? base.internalLinks.map(localHref) : base.internalLinks,
    faq: t.faq ?? base.faq,
    redirectsFrom: [],
    ...(base.footerAnchors ? { footerAnchors: base.footerAnchors.map((x) => ({ ...x, label: FOOTER_ANCHORS_EN[x.href] ?? x.label })) } : {}),
  };
  out.push(entry);
}

writeFileSync(new URL('src/data/sitemap.json', root), JSON.stringify(out, null, 2) + '\n');

const faqDir = new URL('materiales/v2/ingles/faq/', root);
const faqEn = [];
const vistos = new Set();
if (existsSync(faqDir)) {
  for (const f of readdirSync(faqDir).filter((x) => x.endsWith('.json')).sort()) {
    for (const item of JSON.parse(readFileSync(new URL(f, faqDir), 'utf8'))) {
      if (vistos.has(item.id)) continue;
      vistos.add(item.id);
      faqEn.push(item);
    }
  }
}
// Cada pregunta en inglés hereda del banco en español lo que no es texto (páginas, estado, etc.).
const faqEs = rd('src/data/faq.json');
const banco = faqEn.map((t) => ({ ...(faqEs.find((x) => x.id === t.id) ?? {}), ...t }));
writeFileSync(new URL('src/data/faq-en.json', root), JSON.stringify(banco, null, 2) + '\n');

console.log(`[ingles] ${out.length - es.length} página(s) en inglés en sitemap.json · ${banco.length} pregunta(s) en faq-en.json${faltan.length ? ` · sin traducción todavía: ${faltan.join(', ')}` : ''}`);
