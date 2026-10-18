// /indice.json — índice estático del buscador ⌘K (ESPEC §4.3). Se genera en el build desde sitemap.json
// (título corto, H1, keyword, URL, grupo, folio interno, meta) + el banco de FAQ (src/data/faq.json si existe;
// si no, las preguntas "aprobada" de cada página de sitemap.json). Los folios no se muestran: solo sirven de búsqueda.
import type { APIRoute } from 'astro';
import { pages } from '../lib/site';
import { copyText, faqBank } from '../components/layout/copyText';

export const prerender = true;

type Faq = { id: string; q: string; a: string; pages: string[] };

function bank(): Faq[] {
  const out = new Map<string, Faq>();
  // Banco oficial (sin "validar"); la respuesta corta (short) es la que muestra ⌘K.
  for (const f of faqBank()) out.set(f.id, { id: f.id, q: f.q, a: f.short ?? f.a, pages: [...f.pages] });
  // Respaldo: preguntas "aprobada" de cada página del sitemap que el banco no tenga (si el banco existe, solo completa páginas).
  const hasBank = out.size > 0;
  for (const p of pages as any[]) {
    for (const f of p.faq ?? []) {
      const cur = out.get(f.id);
      if (cur) { if (!cur.pages.includes(p.url)) cur.pages.push(p.url); continue; }
      if (hasBank || (f.estado ?? "aprobada") !== "aprobada") continue;
      out.set(f.id, { id: f.id, q: copyText(f.q), a: copyText(f.a), pages: [p.url] });
    }
  }
  return [...out.values()];
}

const shortName = (p: any) => (p.breadcrumbs?.length ? p.breadcrumbs[p.breadcrumbs.length - 1].name : p.id === 'home' ? 'Inicio' : p.h1);
const hasFaqSection = (url: string) => (pages as any[]).find((p) => p.url === url)?.sections?.some((s: any) => s.id === 'faq');

export const GET: APIRoute = () => {
  const list = (pages as any[])
    .filter((p) => p.template !== 'T-404')
    .map((p) => ({
      u: p.url,
      t: shortName(p),
      h: p.h1 ?? '',
      k: p.primaryKeyword ?? '',
      s: (p.secondaryKeywords ?? []).join(' · '),
      g: p.group ?? '',
      f: p.folio ?? '',
      d: p.metaDescription ?? '',
    }));
  const faq = bank().map((f) => {
    const target = f.pages?.includes('/preguntas-frecuentes/') ? '/preguntas-frecuentes/' : f.pages?.[0] ?? '/preguntas-frecuentes/';
    return { id: f.id, q: f.q, a: f.a, u: hasFaqSection(target) ? `${target}#faq` : target };
  });
  return new Response(JSON.stringify({ v: 1, pages: list, faq }), {
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'public, max-age=3600' },
  });
};
