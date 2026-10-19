// scripts/check-pendientes.mjs — puertas de contenido (ESPEC-v2 §12.2 R1–R2).
// Falla si el HTML publicado contiene '[POR CONFIRMAR', '[VALIDAR', '[POR DECIDIR', 'TODO', 'lorem', 'XX' (palabra suelta)
// o un enlace href="#". Revisa texto visible, atributos legibles (alt, aria-label, title, placeholder, content) y JSON-LD;
// no revisa el código de <script>/<style>. Con --release también falla si el copy de una página no está "aprobado" (R1)
// o si un caso sigue con su puerta de publicación pendiente (R2). Ambas son puertas del cliente: en el build normal se
// informan aparte (◇, nunca fallan); solo --release las vuelve fatales.
// Decisión 2 (QA ronda 2): nada sin confirmar se afirma en la página → falla si una pregunta del FAQ con validar: true
// (src/data/faq.json) está visible o en el FAQPage.
// Uso: node scripts/check-pendientes.mjs [--url http://127.0.0.1:4321] [--release]
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { parseArgs, reporter, loadPages, parseHTML, walk, isEl, jsonLd, jsonStrings, norm, sectionIdOf, copyOf, gatePending, ROOT, findAll, find, hasClass, textOf, loose, graphNodes } from './_html.mjs';

const FAQ_FILE = join(ROOT, 'src/data/faq.json');
const FAQ = existsSync(FAQ_FILE) ? JSON.parse(readFileSync(FAQ_FILE, 'utf8')) : [];
const TO_VALIDATE = new Map((Array.isArray(FAQ) ? FAQ : []).filter((f) => f?.validar).map((f) => [loose(f.q), f.id]));

const RULES = [
  [/\[POR CONFIRMAR/g, '[POR CONFIRMAR'],
  [/\[VALIDAR/g, '[VALIDAR'],
  [/\[POR DECIDIR/g, '[POR DECIDIR'],
  [/\[POR ASIGNAR/g, '[POR ASIGNAR'],
  [/\bTODO\b/g, 'TODO'],
  [/\blorem\b/gi, 'lorem'],
  [/\bXX\b/g, 'XX'],
];
const ctx = (s, i, len) => `…${s.slice(Math.max(0, i - 30), i + len + 30)}…`.replace(/\s+/g, ' ');

export async function run(opts) {
  const R = reporter('check-pendientes', opts);
  const pages = await loadPages(opts);
  for (const pg of pages) {
    const root = parseHTML(pg.html);
    const scan = (text, where) => {
      for (const [rx, label] of RULES) {
        rx.lastIndex = 0;
        let m;
        while ((m = rx.exec(text))) R.fail(pg.route, `"${label}" en ${where}: ${ctx(text, m.index, m[0].length)}`);
      }
    };
    for (const n of walk(root)) {
      if (n.text !== undefined) {
        if (n.raw) continue;
        const t = norm(n.text);
        if (t) scan(t, sectionIdOf(n.parent) ? `#${sectionIdOf(n.parent)}` : `<${n.parent?.tag}>`);
        continue;
      }
      if (!isEl(n)) continue;
      for (const at of ['alt', 'aria-label', 'title', 'placeholder', 'content', 'data-screen-title', 'data-screen-line']) if (n.attrs[at]) scan(n.attrs[at], `${at} de <${n.tag}>`);
      if (n.tag === 'a' && 'href' in n.attrs) {
        const h = n.attrs.href.trim();
        if (h === '#' || h === '') R.fail(pg.route, `enlace href="${h}" ("${norm(n.children.map((c) => c.text ?? '').join(' ')) || n.attrs['aria-label'] || n.attrs.class || 'sin texto'}") en ${sectionIdOf(n) ? '#' + sectionIdOf(n) : '<' + (n.parent?.tag ?? '?') + '>'}`);
      }
    }
    for (const ld of jsonLd(root)) if (!ld.__error) for (const [path, v] of jsonStrings(ld)) scan(v, `JSON-LD ${path}`);
    // Decisión 2: preguntas por validar (validar: true) ni visibles ni en el FAQPage
    if (TO_VALIDATE.size) {
      const vis = findAll(root, (x) => 'data-faq-item' in x.attrs).map((it) => textOf(find(it, (x) => hasClass(x, 'faq__q') || hasClass(x, 'faq__qt')) ?? it));
      const ld = graphNodes(jsonLd(root)).filter((n) => n['@type'] === 'FAQPage').flatMap((n) => (n.mainEntity ?? []).map((q) => q.name ?? ''));
      for (const q of new Set([...vis, ...ld].map(loose))) if (TO_VALIDATE.has(q)) R.fail(pg.route, `pregunta ${TO_VALIDATE.get(q)} publicada con validar: true (sin confirmar por el cliente): "${q.slice(0, 70)}"`);
    }
    // R1: copy aprobado · R2: puerta de caso
    if (pg.page) {
      const c = copyOf(pg.page.id);
      if (c && c.estado !== 'aprobado') R.gate(pg.route, `copy en estado "${c.estado}" (solo "aprobado" se publica, R1; aprobadoPor: ${c.aprobadoPor ?? '—'})`);
      if (gatePending(pg.page)) R.gate(pg.route, 'caso breve: puerta de publicación pendiente (ficha, punto de partida e implementación sin confirmar por escrito, R2)');
    }
  }
  R.info(`${pages.length} página(s) revisada(s)`);
  return R.done();
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const r = await run(parseArgs());
  process.exit(r.fails ? 1 : 0);
}
