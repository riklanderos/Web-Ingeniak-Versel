// /indice.json — índice estático del buscador ⌘K (ESPEC §4.3). Se genera en el build desde sitemap.json
// (título corto, H1, keyword, URL, grupo, folio interno, meta) + el banco de FAQ (src/data/faq.json si existe;
// si no, las preguntas "aprobada" de cada página de sitemap.json). Los folios no se muestran: solo sirven de búsqueda.
import type { APIRoute } from 'astro';
import { pages, isBuilt } from '../lib/site';
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
    // Solo páginas que existen hoy (QA r2 · decisión 3): un resultado de ⌘K nunca lleva a un 404. Las demás entran solas al construirse.
    .filter((p) => p.template !== 'T-404' && isBuilt(p.url))
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
  // Cada pregunta abre su respuesta. Con /preguntas-frecuentes/ construida (pinta TODO el banco publicable, el mismo filtro
  // de faqBank), el destino es la pregunta misma: /preguntas-frecuentes/#G07 la abre y la lleva a la vista (FaqTemplate,
  // peticiones · faq-contacto-legal #3). Sin esa página: la primera página construida que la tiene (#faq). Sin ninguna, no se indexa.
  const faqHome = isBuilt('/preguntas-frecuentes/');
  const faq = bank().flatMap((f) => {
    if (faqHome) return [{ id: f.id, q: f.q, a: f.a, u: `/preguntas-frecuentes/#${f.id}` }];
    const built = (f.pages ?? []).filter((u) => isBuilt(u));
    if (!built.length) return [];
    const target = built[0];
    return [{ id: f.id, q: f.q, a: f.a, u: hasFaqSection(target) ? `${target}#faq` : target }];
  });
  return new Response(JSON.stringify({ v: 1, pages: list, faq }), {
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'public, max-age=3600' },
  });
};
