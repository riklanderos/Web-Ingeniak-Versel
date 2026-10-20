// heroKit.ts — utilidades compartidas por las portadas de las plantillas (área páginas).
// R3 (ESPEC §12.2): en móvil toda portada usa `mobile="split"`: arriba solo el intro (crumbs O eyebrow, H1, lede ≤ 20
// palabras y CTAs); el resto va al slot `more`, después de la placa y dentro de la misma <section>.
// En escritorio el intro no cambia: el lede completo sigue en su sitio (la cola solo se repite en `more` para móvil).
import { isBuilt, builtRoutes, pages, copyOrNull } from '../../lib/site';
import { isHiddenHref } from '../layout/cta';

const words = (t: string) => t.replace(/\{\{[^}]+\}\}/g, 'X').split(/\s+/).filter(Boolean).length;
/** Oraciones de un texto del copy (los tokens {{…}} quedan intactos). */
export function sentences(text?: string | null): string[] {
  const s = String(text ?? '').trim();
  if (!s) return [];
  return s.split(/(?<=[.!?…])\s+(?=[¿¡"“(A-ZÁÉÍÓÚÑ0-9{])/u).map((x) => x.trim()).filter(Boolean);
}

/**
 * Parte un lede para el intro móvil (≤ max palabras) y la cola que baja a `more`.
 *  - order 'first': las primeras oraciones que quepan (por defecto).
 *  - order 'last':  las últimas oraciones que quepan (cuando la primera repite la etiqueta de la portada).
 * Nunca corta una oración: si la primera ya pasa del tope, va completa.
 */
export function ledeParts(text?: string | null, max = 20, order: 'first' | 'last' = 'first'): { intro: string; rest: string; split: boolean } {
  const ss = sentences(text);
  if (!ss.length) return { intro: '', rest: '', split: false };
  if (words(ss.join(' ')) <= max) return { intro: ss.join(' '), rest: '', split: false };
  const seq = order === 'last' ? [...ss].reverse() : ss;
  let n = 0;
  let k = 0;
  for (; k < seq.length; k++) {
    const w = words(seq[k]);
    if (k > 0 && n + w > max) break;
    n += w;
  }
  const keep = seq.slice(0, k);
  const drop = seq.slice(k);
  const intro = (order === 'last' ? keep.reverse() : keep).join(' ');
  const rest = (order === 'last' ? drop.reverse() : drop).join(' ');
  return { intro, rest, split: !!rest };
}

const norm = (s: string) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9ñ\s]/g, ' ').split(/\s+/).filter((w) => w.length > 2).map((w) => w.replace(/s$/, ''));
/** ¿La etiqueta de la portada repite lo que ya dicen los breadcrumbs? ("Industria · Salud" vs Inicio › Industrias › Salud) */
export function eyebrowRepeatsCrumbs(eyebrow?: string | null, crumbs?: { name: string }[] | null): boolean {
  if (!eyebrow || !crumbs?.length) return false;
  const have = new Set(crumbs.flatMap((c) => norm(c.name)));
  const ws = norm(eyebrow);
  return ws.length > 0 && ws.every((w) => have.has(w));
}

/** Breadcrumbs con enlace solo a rutas construidas (R12 / QA · enlaces): las planeadas se pintan como texto. */
export function builtCrumbs(list?: { name: string; url?: string }[] | null): { name: string; url?: string }[] {
  return (list ?? []).map((c, i, all) => (i < all.length - 1 && c.url && !isBuilt(c.url) ? { name: c.name } : c));
}

/* ── Enlaces del cuerpo a rutas construidas (R12 / QA · enlaces) ───────────────────────────────────────────────────── */
// 'Conversión' (/contacto/) = 'Contacto'. Las landings ocultas (/discovery/, /power-session/, /agendar/…) nunca se sugieren (R17).
const GROUP_LABEL: Record<string, string> = { Servicios: 'Servicio', Industrias: 'Industria', Casos: 'Caso de estudio', 'Conversión': 'Contacto', 'Núcleo': 'Ingeniak' };
/** Fila de una página construida con texto de su propio copy: título (su breadcrumb), etiqueta (su grupo) y la primera
 *  oración de su portada sin cifras ni tokens. null si la página no existe o no está construida. */
export function builtRow(url: string): { href: string; label: string; title: string; line: string } | null {
  if (!url || !isBuilt(url) || isHiddenHref(url)) return null;
  const pg = (pages as any[]).find((p) => p.url === url);
  if (!pg) return null;
  const cp = copyOrNull(pg.id);
  const first = sentences(cp?.sections?.hero?.lede).find((x) => !/\{\{/.test(x) && !/\d/.test(x.replace(/24\/7/g, '')));
  const title = url === '/' ? 'Inicio' : (pg.breadcrumbs as any[])?.at(-1)?.name ?? pg.h1;
  return { href: url, label: GROUP_LABEL[pg.group] ?? '', title, line: first ?? '' };
}
/**
 * "Sigue explorando" sin enlaces rotos: los destinos del copy que ya están construidos (con su texto del copy) y, si
 * faltan para llegar a `want`, páginas construidas: primero las que la página ya enlaza en su copy (`prefer`), luego el
 * resto. Nunca la página actual, el inicio, el 404 ni una landing oculta (isHidden).
 */
export function builtRelated(items: any[] | undefined, opts: { self: string; want?: number; prefer?: string[] }) {
  const want = opts.want ?? 3;
  const out: any[] = (items ?? []).filter((it) => it?.href && isBuilt(it.href) && !isHiddenHref(it.href) && it.href !== opts.self);
  const have = new Set(out.map((x) => x.href.split('#')[0]));
  const pool = [...(opts.prefer ?? []), ...builtRoutes].map((u) => u.split('#')[0]);
  for (const u of pool) {
    if (out.length >= want) break;
    if (have.has(u) || u === opts.self || u === '/' || u === '/404' || isHiddenHref(u)) continue;
    const row = builtRow(u);
    if (row) { out.push(row); have.add(u); }
  }
  return out.slice(0, want);
}
