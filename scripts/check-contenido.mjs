// scripts/check-contenido.mjs — puertas de contenido (ESPEC-v2 §12.2 R1–R2).
// 1) Palabras visibles ≥ sitemap.json → copy.minWords de la página (texto de <main>, sin menú, footer, decorados
//    aria-hidden ni las preguntas FAQ compartidas con otras páginas).
// 2) Similitud entre páginas hermanas (servicios/plataformas entre sí, industrias entre sí, casos entre sí, artículos
//    entre sí): shingles de 5 palabras, Jaccard ≤ 0.35, sin contar FAQ compartidas ni cifras (nodos data-metric).
// Uso: node scripts/check-contenido.mjs [--url http://127.0.0.1:4321] [--release]
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { ROOT, parseArgs, reporter, loadPages, parseHTML, find, isEl } from './_html.mjs';

const JACCARD_MAX = 0.35;
const FAMILY = { 'T-SERVICE': 'servicios', 'T-PLATFORM': 'servicios', 'T-INDUSTRY': 'industrias', 'T-CASE': 'casos', 'T-ARTICLE': 'artículos' };

function sharedFaqIds() {
  const p = join(ROOT, 'src/data/faq.json');
  if (!existsSync(p)) return new Set();
  const raw = JSON.parse(readFileSync(p, 'utf8'));
  const list = Array.isArray(raw) ? raw : raw.items ?? [];
  return new Set(list.filter((f) => (f.pages ?? []).filter((u) => u !== '/preguntas-frecuentes/').length > 1).map((f) => f.id));
}

/** Texto de <main> sin decorados, sin FAQ compartidas; con o sin cifras. */
function mainText(root, shared, { dropFigures }) {
  const main = find(root, (x) => x.tag === 'main') ?? find(root, (x) => x.tag === 'body') ?? root;
  let out = '';
  const rec = (n) => {
    if (n.text !== undefined) { if (!n.raw) out += n.text; return; }
    if (!isEl(n)) { for (const c of n.children ?? []) rec(c); return; }
    if (['script', 'style', 'template', 'noscript', 'svg', 'nav', 'header', 'footer', 'dialog'].includes(n.tag) && n !== main) {
      if (n.tag === 'header' || n.tag === 'footer') { if (n.attrs.class && /\b(hdr|ftr)\b/.test(n.attrs.class)) return; }
      else return;
    }
    if (n.attrs['aria-hidden'] === 'true' || 'hidden' in n.attrs) return;
    if ('data-faq-item' in n.attrs && shared.has(n.attrs['data-faq-id'])) return;
    if (dropFigures && 'data-metric' in n.attrs) { out += ' '; return; }
    out += ' ';
    for (const c of n.children) rec(c);
    out += ' ';
  };
  rec(main);
  return out;
}
const words = (s) => (s.toLowerCase().normalize('NFC').match(/[\p{L}\p{N}]+(?:['’][\p{L}]+)?/gu) ?? []);
function shingles(ws, k = 5) {
  const set = new Set();
  for (let i = 0; i + k <= ws.length; i++) set.add(ws.slice(i, i + k).join(' '));
  return set;
}
function jaccard(a, b) {
  if (!a.size || !b.size) return 0;
  let inter = 0;
  for (const x of a) if (b.has(x)) inter++;
  return inter / (a.size + b.size - inter);
}

export async function run(opts) {
  const R = reporter('check-contenido', opts);
  const shared = sharedFaqIds();
  const pages = await loadPages({ ...opts, dev: false });
  const fam = new Map();
  for (const pg of pages) {
    if (!pg.page || pg.route === '/404') continue;
    const root = parseHTML(pg.html);
    const n = words(mainText(root, shared, { dropFigures: false })).length;
    const min = pg.page.copy?.minWords ?? 0;
    if (n < min) R.fail(pg.route, `${n} palabras visibles < ${min} (copy.minWords, plantilla ${pg.page.template})`);
    R.info(`${pg.route} · ${n} palabras visibles (mínimo ${min})`);
    const f = FAMILY[pg.page.template];
    if (f) {
      if (!fam.has(f)) fam.set(f, []);
      fam.get(f).push({ route: pg.route, sh: shingles(words(mainText(root, shared, { dropFigures: true }))) });
    }
  }
  for (const [f, list] of fam) {
    if (list.length < 2) { R.info(`similitud ${f}: ${list.length} página(s), sin pares que comparar`); continue; }
    for (let i = 0; i < list.length; i++) for (let j = i + 1; j < list.length; j++) {
      const J = jaccard(list[i].sh, list[j].sh);
      if (J > JACCARD_MAX) R.fail(list[i].route, `demasiado parecida a ${list[j].route}: Jaccard ${J.toFixed(2)} > ${JACCARD_MAX} (shingles de 5 palabras, ${f})`);
      else R.info(`similitud ${list[i].route} ↔ ${list[j].route}: ${J.toFixed(2)}`);
    }
  }
  return R.done();
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const r = await run(parseArgs());
  process.exit(r.fails ? 1 : 0);
}
