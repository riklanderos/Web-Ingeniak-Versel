// Guías del índice de /blog/. La lista sale de sitemap.json: todo artículo T-ARTICLE publicado entra solo, sin tocar
// blog.json (BLOG.md, paso 6). grid.items solo aporta los textos a mano de las primeras guías y las que siguen en edición.
// Orden: del más reciente al más antiguo por `publicado`; a igual fecha, el artículo nuevo primero y luego el orden de grid.items.
import { pages, isBuilt, copyOrNull, isHiddenPage } from '../../../lib/site';

const pageOf = (href?: string) => (pages as any[]).find((p) => p.url === href);
const slug = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export function guiasDelBlog(grid: any, cats: any): any[] {
  const chips = (cats?.chips ?? []) as any[];
  const aMano = (grid?.items ?? []) as any[];
  const conocidas = new Set(aMano.map((it) => it.href));
  const nuevas = (pages as any[])
    .filter((p) => p.template === 'T-ARTICLE' && isBuilt(p.url) && !isHiddenPage(p) && !conocidas.has(p.url))
    .sort((a, b) => Number(b.folio) - Number(a.folio))
    .map((p) => {
      const c = copyOrNull(p.id);
      const nombre: string = c?.articulo?.categoria ?? 'Guías';
      const chip = chips.find((x) => x.label.toLowerCase() === nombre.toLowerCase());
      return { href: p.url, category: chip?.slug ?? slug(nombre), categoryLabel: chip?.label ?? nombre, title: p.h1, line: c?.sections?.hero?.deck };
    });
  const publicado = (it: any): string => (isBuilt(it.href) ? copyOrNull(pageOf(it.href)?.id)?.publicado ?? '' : '');
  return [...nuevas, ...aMano].sort((a, b) => publicado(b).localeCompare(publicado(a)));
}
