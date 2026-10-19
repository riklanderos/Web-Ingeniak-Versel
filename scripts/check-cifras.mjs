// scripts/check-cifras.mjs — guarda de cifras (ESPEC-v2 §2.10 y §8.6).
// Falla si en el texto visible aparece una cifra comercial (\d+(\.\d+)?\s?(%|×|x\b), "N citas", "N procesos", "N min",
// "USD N") fuera de un nodo con data-metric o data-allow-number (también <tr data-metric>). El precio solo puede ser
// PRICE_FROM. Revisa además <title>, meta description, og:* / twitter:* y los strings del JSON-LD: ahí una cifra solo
// pasa si es literalmente una de metrics.ts (valor, "valor etiqueta" o prose) o el precio oficial. Y revisa la fuente:
// title/metaDescription/h1 de sitemap.json con cifras solo como token (src/lib/site.ts → resolveTokens).
// Uso: node scripts/check-cifras.mjs [--url http://127.0.0.1:4321] [--release]
import { pathToFileURL } from 'node:url';
import { parseArgs, reporter, loadPages, loadMetrics, parseHTML, walk, isEl, find, findAll, jsonLd, jsonStrings, norm, sectionIdOf, SITEMAP_RAW, TOKEN_RX, BUILT } from './_html.mjs';

// (?<![\d:]) evita horas ("16:00 Citas de mañana"); "citas/procesos/min" en minúsculas (una oración que empieza con "Citas" no es cifra)
const FIG_RX = /(?<![\d:.,])\d+(?:[.,]\d+)?\s?(?:%|×|[xX]\b)|(?<![\d:.,])\d+\s+(?:citas|procesos)\b|(?<![\d:.,])\d+\s?min\b|USD\s?\d[\d.,]*/g;
const PRICE_RX = /USD\s?\d[\d.,]*|(?:US)?\$\s?\d[\d.,]*|\b\d[\d.,]*\s?(?:MXN|pesos|dólares)\b/gi;
const ALLOW_ONLY = /^(?:\d+\s?min|USD\s?\d[\d.,]*)$/i; // dentro de data-allow-number solo duración de la Discovery y precio
// Microcopia fija del primario (ESPEC §2.9): no es cifra comercial. Pasa aunque falte data-allow-number, solo con la frase exacta.
const MICRO_29 = /30\s?min\s*·\s*1:1\s*·\s*Google Meet\s*·\s*sin costo/gi;
const inMicro = (s, a, b) => { MICRO_29.lastIndex = 0; let m; while ((m = MICRO_29.exec(s))) if (m.index <= a && m.index + m[0].length >= b) return true; return false; };

/** Cadenas válidas de metrics.ts para buscar cobertura. */
function metricStrings(M) {
  const out = [];
  for (const m of Object.values(M.metrics)) {
    out.push(m.value, `${m.value} ${m.label}`);
    if (m.prose) out.push(m.prose);
  }
  return out.filter(Boolean).sort((a, b) => b.length - a.length);
}
/** ¿Los dígitos de [a,b) caen dentro de una ocurrencia de alguna de las cadenas? */
function covered(text, a, b, strings) {
  const low = text.toLowerCase();
  for (const s of strings) {
    const needle = s.toLowerCase();
    let i = low.indexOf(needle);
    while (i >= 0) {
      if (i <= a && i + needle.length >= b) return true;
      // la cifra puede ser solo los dígitos (p. ej. "58%" dentro de "−58%")
      const digitsA = a + (text.slice(a, b).search(/\d/));
      const lastDigit = a + text.slice(a, b).search(/\d[^\d]*$/);
      if (i <= digitsA && i + needle.length > lastDigit) return true;
      i = low.indexOf(needle, i + 1);
    }
  }
  return false;
}
function priceOk(text, a, b, M) {
  const low = text.toLowerCase();
  for (const p of [M.PRICE_FROM, M.PRICE_FROM_CAP, 'USD 997 al mes']) {
    if (!p) continue;
    const n = p.toLowerCase();
    let i = low.indexOf(n);
    while (i >= 0) { if (i <= a && i + n.length >= b) return true; i = low.indexOf(n, i + 1); }
  }
  return false;
}
const ctx = (s, a, b) => `…${s.slice(Math.max(0, a - 32), a)}[${s.slice(a, b)}]${s.slice(b, b + 32)}…`.replace(/\s+/g, ' ');

/** Flujo de texto visible del <body> con el permiso de cada carácter (metric | allow | null). */
function textStream(root) {
  const body = find(root, (x) => x.tag === 'body') ?? root;
  let s = '';
  const perm = [];   // por carácter: null | {k:'metric', id, el} | {k:'allow', el}
  const owner = [];  // elemento de texto (para ubicar la sección)
  const BLOCK = /^(p|div|li|h[1-6]|section|article|header|footer|dt|dd|tr|td|th|figcaption|blockquote|ul|ol|dl|table|nav|main|aside|button|label|summary|option|br|figure|span-block)$/;
  const rec = (n, cur) => {
    if (n.text !== undefined) {
      if (n.raw) return;
      // cambio de contexto (otra cifra, otro permiso): separador que corta la coincidencia ("…respuesta¹" + "3.2×")
      if (perm.length && perm[perm.length - 1] !== cur && n.text) { s += '\u0001'; perm.push(cur); owner.push(n.parent); }
      for (const ch of n.text) { s += ch; perm.push(cur); owner.push(n.parent); }
      return;
    }
    if (['script', 'style', 'template'].includes(n.tag)) return;
    let p = cur;
    if ('data-metric' in n.attrs) p = { k: 'metric', id: n.attrs['data-metric'], el: n };
    else if ('data-allow-number' in n.attrs) p = { k: 'allow', el: n };
    const block = BLOCK.test(n.tag);
    if (block) { s += ' '; perm.push(cur); owner.push(n); }
    for (const c of n.children) rec(c, p);
    if (block) { s += ' '; perm.push(cur); owner.push(n); }
  };
  rec(body, null);
  return { s, perm, owner };
}

export async function run(opts) {
  const R = reporter('check-cifras', opts);
  const M = loadMetrics();
  const MS = metricStrings(M);
  const pages = await loadPages(opts);
  let scanned = 0;
  for (const pg of pages) {
    const root = parseHTML(pg.html);
    scanned++;
    // 1) Texto visible
    const { s, perm, owner } = textStream(root);
    FIG_RX.lastIndex = 0;
    let m;
    while ((m = FIG_RX.exec(s))) {
      const a = m.index, b = a + m[0].length;
      const digits = [];
      for (let i = a; i < b; i++) if (/\d/.test(s[i])) digits.push(i);
      const perms = digits.map((i) => perm[i]);
      const where = sectionIdOf(owner[a]) ? `#${sectionIdOf(owner[a])}` : 'sin sección';
      const isPrice = /^USD/i.test(m[0]);
      if (isPrice) { if (!priceOk(s, a, b, M)) R.fail(pg.route, `precio distinto de PRICE_FROM ("${M.PRICE_FROM}") en ${where}: ${ctx(s, a, b)}`); continue; }
      if (perms.some((p) => !p) && inMicro(s, a, b)) continue;
      if (perms.some((p) => !p)) { R.fail(pg.route, `cifra escrita a mano (sin data-metric ni data-allow-number) en ${where}: ${ctx(s, a, b)}`); continue; }
      if (perms.some((p) => p.k === 'allow') && !ALLOW_ONLY.test(m[0].trim())) { R.fail(pg.route, `cifra comercial dentro de data-allow-number (solo precio, horas, fechas, contacto) en ${where}: ${ctx(s, a, b)}`); continue; }
      const ids = [...new Set(perms.filter((p) => p.k === 'metric').map((p) => p.id))];
      for (const id of ids) if (id && !M.metrics[id]) R.fail(pg.route, `data-metric="${id}" no existe en metrics.ts (${where})`);
      if (perms.every((p) => p.k === 'metric') && !covered(s, a, b, MS)) R.fail(pg.route, `cifra con data-metric que no es un valor de metrics.ts en ${where}: ${ctx(s, a, b)}`);
    }
    // otros importes (MXN, $) en texto visible: el único precio permitido es PRICE_FROM
    PRICE_RX.lastIndex = 0;
    while ((m = PRICE_RX.exec(s))) {
      if (/^USD/i.test(m[0])) continue;
      R.fail(pg.route, `importe fuera de PRICE_FROM: ${ctx(s, m.index, m.index + m[0].length)}`);
    }
    // 2) Atributos legibles (alt, aria-label, title, placeholder): mismas cifras prohibidas salvo bajo data-metric
    for (const el of walk(root)) {
      if (!isEl(el)) continue;
      for (const at of ['alt', 'aria-label', 'title', 'placeholder']) {
        const v = el.attrs[at];
        if (!v || el.tag === 'title') continue;
        const okAnc = (() => { let x = el; while (x) { if (isEl(x) && ('data-metric' in x.attrs || 'data-allow-number' in x.attrs)) return true; x = x.parent; } return false; })();
        FIG_RX.lastIndex = 0;
        while ((m = FIG_RX.exec(v))) {
          const a = m.index, b = a + m[0].length;
          if (/^USD/i.test(m[0])) { if (!priceOk(v, a, b, M)) R.fail(pg.route, `precio distinto de PRICE_FROM en ${at}: ${ctx(v, a, b)}`); continue; }
          if (okAnc || covered(v, a, b, MS)) continue;
          R.fail(pg.route, `cifra escrita a mano en ${at} de <${el.tag}>: ${ctx(v, a, b)}`);
        }
      }
    }
    // 3) <head>: title, description, og:*, twitter:*
    const head = find(root, (x) => x.tag === 'head') ?? root;
    const fields = [];
    const t = find(head, (x) => x.tag === 'title');
    if (t) fields.push(['title', norm(t.children.map((c) => c.text ?? '').join(''))]);
    for (const meta of findAll(head, (x) => x.tag === 'meta')) {
      const k = meta.attrs.name ?? meta.attrs.property ?? '';
      if (/^(description|og:|twitter:)/.test(k) && !/^(og:image$|og:url|og:image:(width|height)|twitter:image$)/.test(k)) fields.push([k, norm(meta.attrs.content ?? '')]);
    }
    // 4) JSON-LD
    for (const ld of jsonLd(root)) {
      if (ld.__error) { R.fail(pg.route, `JSON-LD inválido: ${ld.__error}`); continue; }
      for (const [path, v] of jsonStrings(ld)) if (!/^https?:\/\//.test(v) && !/(^|\.)(url|@id|image|logo|telephone|email|sameAs)/.test(path)) fields.push([`JSON-LD ${path}`, norm(v)]);
    }
    for (const [k, v] of fields) {
      FIG_RX.lastIndex = 0;
      while ((m = FIG_RX.exec(v))) {
        const a = m.index, b = a + m[0].length;
        if (/^USD/i.test(m[0])) { if (!priceOk(v, a, b, M)) R.fail(pg.route, `precio distinto de PRICE_FROM en ${k}: ${ctx(v, a, b)}`); continue; }
        if (!covered(v, a, b, MS)) R.fail(pg.route, `cifra que no sale de metrics.ts en ${k}: ${ctx(v, a, b)}`);
      }
      PRICE_RX.lastIndex = 0;
      while ((m = PRICE_RX.exec(v))) if (!/^USD/i.test(m[0])) R.fail(pg.route, `importe fuera de PRICE_FROM en ${k}: ${ctx(v, m.index, m.index + m[0].length)}`);
    }
  }
  // 5) Fuente: title, metaDescription y h1 de sitemap.json llevan las cifras como token ({{metric:ID}}…), nunca escritas a
  //    mano (QA ronda 1: "respuesta en 12 s" en la meta de /industrias/salud/). Falla en páginas construidas; aviso en las demás.
  const SRC_RX = new RegExp(`${FIG_RX.source}|(?<![\\d:.,])\\d+(?:[.,]\\d+)?\\s?(?:s|seg)\\b`, 'g');
  for (const p of SITEMAP_RAW) {
    for (const k of ['title', 'metaDescription', 'h1']) {
      const v = String(p[k] ?? '').replace(new RegExp(TOKEN_RX.source, 'g'), '⟦token⟧');
      SRC_RX.lastIndex = 0;
      let mm;
      while ((mm = SRC_RX.exec(v))) {
        if (/^USD/i.test(mm[0]) && priceOk(v, mm.index, mm.index + mm[0].length, M)) continue;
        const msg = `sitemap.json → ${p.id}.${k}: cifra escrita a mano (usa {{metric:ID}}, |full, |prose o {{price}}): ${ctx(v, mm.index, mm.index + mm[0].length)}`;
        BUILT.has(p.url) ? R.fail(p.url, msg) : R.warn(p.url, msg);
      }
    }
  }
  R.info(`${scanned} página(s) revisada(s)`);
  return R.done();
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const r = await run(parseArgs());
  process.exit(r.fails ? 1 : 0);
}
