// scripts/_html.mjs — utilidades compartidas de las guardas (ESPEC-v2 §8.6, §12.2 R2/R8/R9).
// Sin dependencias: un analizador de HTML tolerante (suficiente para la salida de Astro), el recorrido de páginas
// (dist/**/*.html por defecto o, con --url, las rutas de sitemap.json que responden 200 en el servidor de desarrollo),
// los datos del sitio (sitemap.json, copy, métricas) y el reporte con FAIL / WARN.
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { isNoindex, isHidden as isHiddenPageRule, gatePending as gatePendingRule } from '../src/lib/indexacion.mjs';

export const ROOT = fileURLToPath(new URL('..', import.meta.url));
export const DIST = join(ROOT, 'dist');

/* ───────────────────────── Argumentos ───────────────────────── */
export function parseArgs(argv = process.argv.slice(2)) {
  const o = { url: null, release: false, dist: DIST, only: null, quiet: false, json: false, dev: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--url') o.url = (argv[++i] || 'http://127.0.0.1:4321').replace(/\/$/, '');
    else if (a.startsWith('--url=')) o.url = a.slice(6).replace(/\/$/, '');
    else if (a === '--release') o.release = true;
    else if (a === '--dist') o.dist = argv[++i];
    else if (a === '--only') o.only = (argv[++i] || '').split(',').filter(Boolean);
    else if (a === '--quiet') o.quiet = true;
    else if (a === '--json') o.json = true;
    else if (a === '--dev') o.dev = true; // también revisa las páginas de demostración (/dev/*, dev-movil.html), que no salen en el build de producción
  }
  if (process.env.CHECK_URL && !o.url) o.url = process.env.CHECK_URL.replace(/\/$/, '');
  if (process.env.CHECK_RELEASE === '1') o.release = true;
  return o;
}

/* ───────────────────────── Reporte ───────────────────────── */
export function reporter(name, opts) {
  const fails = [], warns = [], gates = [];
  const brokenSeen = new Set();
  const fmt = (route, msg) => (route ? `${route} · ${msg}` : msg);
  return {
    name,
    fail(route, msg) { fails.push(fmt(route, msg)); },
    warn(route, msg) { if (opts?.release) fails.push(fmt(route, `${msg} (fatal con --release)`)); else warns.push(fmt(route, msg)); },
    /** Puerta del cliente (copy en borrador, caso sin confirmar, FAQ por validar…): nunca hace fallar el build; solo
     *  --release (revisión de lanzamiento) la vuelve fatal. Se cuenta aparte para que el resumen la distinga de los avisos. */
    gate(route, msg) {
      if (opts?.release) fails.push(fmt(route, `[puerta del cliente] ${msg} (fatal con --release)`));
      else gates.push(fmt(route, msg));
    },
    info(msg) { if (!opts?.quiet) console.log(`  · ${msg}`); },
    /** Páginas que respondieron 200 sin HTML (error de plantilla en desarrollo): fallan en cada guarda. */
    broken() { for (const r of opts?.broken ?? []) if (!brokenSeen.has(r)) { brokenSeen.add(r); fails.push(fmt(r, 'la página no se renderizó (el servidor respondió sin HTML: error de la plantilla o del copy)')); } },
    get fails() { return fails; },
    get warns() { return warns; },
    get gates() { return gates; },
    done() {
      this.broken();
      const tag = fails.length ? 'FAIL' : 'OK';
      console.log(`\n[${name}] ${tag} · ${fails.length} fallo(s) · ${warns.length} aviso(s)${gates.length ? ` · ${gates.length} puerta(s) del cliente` : ''}`);
      const cap = 60;
      for (const f of fails.slice(0, cap)) console.log(`  ✗ ${f}`);
      if (fails.length > cap) console.log(`  … y ${fails.length - cap} fallos más`);
      for (const w of warns.slice(0, cap)) console.log(`  ! ${w}`);
      if (warns.length > cap) console.log(`  … y ${warns.length - cap} avisos más`);
      for (const g of gates.slice(0, cap)) console.log(`  ◇ ${g}`);
      return { name, fails: fails.length, warns: warns.length, gates: gates.length };
    },
  };
}

/* ───────────────────────── Datos del sitio ───────────────────────── */
const readJSON = (p) => JSON.parse(readFileSync(p, 'utf8'));
/** sitemap.json tal cual (con tokens {{metric:…}} en title/metaDescription): lo usa check-cifras para vigilar la fuente. */
export const SITEMAP_RAW = readJSON(join(ROOT, 'src/data/sitemap.json'));
/** Tokens de cifra en los textos de sitemap.json (misma sintaxis que el copy y src/lib/site.ts → resolveTokens).
 *  {{offer:ID}} = oferta de una landing oculta (OFFERS de metrics.ts, ESPEC §12.6 R18). */
export const TOKEN_RX = /\{\{(metric:([a-z0-9-]+)(?:\|(full|prose))?|offer:([a-z0-9-]+)|price|Price|source)\}\}/g;
let metricsCache = null;
export function resolveTokens(s) {
  if (typeof s !== 'string' || !s.includes('{{')) return s;
  const M = (metricsCache ??= loadMetrics());
  return s.replace(new RegExp(TOKEN_RX.source, 'g'), (all, k, id, mod, offer) => {
    if (offer) { const o = M.OFFERS[offer]; if (!o) throw new Error(`[check] sitemap.json: oferta desconocida ${all}`); return o; }
    if (k === 'price') return M.PRICE_FROM; if (k === 'Price') return M.PRICE_FROM_CAP; if (k === 'source') return M.SOURCE_NOTE;
    const m = M.metrics[id];
    if (!m) throw new Error(`[check] sitemap.json: cifra desconocida ${all}`);
    return mod === 'prose' ? (m.prose ?? `${m.value} ${m.label}`) : mod === 'full' ? `${m.value} ${m.label}` : m.value;
  });
}
/** sitemap.json con los tokens resueltos (lo que publica la página: <title>, meta description, H1). */
export const SITEMAP = SITEMAP_RAW.map((p) => ({ ...p, title: resolveTokens(p.title), metaDescription: resolveTokens(p.metaDescription), h1: resolveTokens(p.h1) }));
export const NAV = readJSON(join(ROOT, 'src/data/navegacion.json'));
export const PLATES = readJSON(join(ROOT, 'src/data/plates.json'));
export const SITE_URL = 'https://ingeniak.mx';

/** Copy de una página (src/content/paginas/<id>.json) o null. */
export function copyOf(id) {
  const p = join(ROOT, 'src/content/paginas', `${id}.json`);
  return existsSync(p) ? readJSON(p) : null;
}
/** Métricas de src/lib/metrics.ts (leídas como texto: valor, etiqueta, prose). */
export function loadMetrics() {
  const src = readFileSync(join(ROOT, 'src/lib/metrics.ts'), 'utf8');
  const out = {};
  const rx = /'([a-z0-9-]+)':\s*\{\s*value:\s*'([^']*)',\s*label:\s*'([^']*)'([^}]*)\}/g;
  let m;
  while ((m = rx.exec(src))) {
    const prose = m[4].match(/prose:\s*'([^']*)'/);
    out[m[1]] = { value: m[2], label: m[3], prose: prose ? prose[1] : undefined };
  }
  const price = src.match(/PRICE_FROM\s*=\s*'([^']+)'/)?.[1];
  const priceCap = src.match(/PRICE_FROM_CAP\s*=\s*'([^']+)'/)?.[1];
  const source = src.match(/SOURCE_NOTE\s*=\s*'([^']+)'/)?.[1];
  // Ofertas de las landings ocultas (OFFERS y OFFER_ROUTES, CAMBIO-COTIZAR §4.4)
  const OFFERS = {};
  const ob = src.match(/export const OFFERS\s*=\s*\{([\s\S]*?)\}\s*as const/);
  if (ob) for (const m of ob[1].matchAll(/'([a-z0-9-]+)':\s*'([^']*)'/g)) OFFERS[m[1]] = m[2];
  const or = src.match(/export const OFFER_ROUTES\s*=\s*\[([^\]]*)\]/);
  const OFFER_ROUTES = or ? [...or[1].matchAll(/'([^']+)'/g)].map((m) => m[1]) : [];
  return { metrics: out, PRICE_FROM: price, PRICE_FROM_CAP: priceCap, SOURCE_NOTE: source, OFFERS, OFFER_ROUTES };
}
/** Caso breve (R2): sitemap trae publishGate y el copy no lo marca confirmado. */
export function gatePending(page) {
  return gatePendingRule(page, copyOf(page.id));
}
/** Página construida: tiene copy y su ruta existe en src/pages (mismo criterio que src/lib/site.ts → builtRoutes). */
const ROUTE_RX = (() => {
  const files = [];
  const walk = (d, base = '') => {
    for (const e of readdirSync(d, { withFileTypes: true })) {
      if (e.name.startsWith('_') || e.name.startsWith('.')) continue;
      if (e.isDirectory()) { if (!(base === '' && e.name === 'dev')) walk(join(d, e.name), `${base}/${e.name}`); }
      else if (/\.(astro|md|mdx)$/.test(e.name)) files.push(`${base}/${e.name}`);
    }
  };
  walk(join(ROOT, 'src/pages'));
  return files.map((f) => {
    const noExt = f.replace(/\.(astro|md|mdx)$/, '');
    if (noExt === '/404') return /^\/404\/?$/;
    const url = noExt.replace(/\/index$/, '') + '/';
    return new RegExp('^' + url.replace(/\[\.\.\.[^\]]+\]/g, '.+').replace(/\[[^\]]+\]/g, '[^/]+') + '$');
  });
})();
export function isBuiltPage(page) {
  return ROUTE_RX.some((rx) => rx.test(page.url)) && (!!copyOf(page.id) || page.template === 'T-404');
}
export const BUILT = new Set(SITEMAP.filter(isBuiltPage).map((p) => p.url));
export const SITEMAP_URLS = new Set(SITEMAP.map((p) => p.url));
/** Landings ocultas (sitemap.json → hidden: true; ESPEC §12.6 R17): /discovery/, /power-session/, /agendar/confirmado/. */
export const HIDDEN = new Set(SITEMAP.filter((p) => isHiddenPageRule(p)).map((p) => p.url));
/** ¿El href (ruta, URL de ingeniak.mx, con hash o query) lleva a una landing oculta, a /agendar/… o a la agenda externa de v1? */
export function isHiddenHref(href) {
  if (!href) return false;
  if (/agenda\.ingeniak\.tech/i.test(href)) return true;
  const r = normRoute(href);
  return !!r && (HIDDEN.has(r) || r.startsWith('/agendar/'));
}
/** Página pública: está en sitemap.json y no es oculta (el 404 cuenta como pública). */
export const isPublicPage = (page) => !!page && !isHiddenPageRule(page);
/** ¿La entrada de sitemap.json es una landing oculta? (el isHidden de abajo es otro: nodo oculto del DOM) */
export const isHiddenPage = (page) => isHiddenPageRule(page);
/** Páginas que deben estar en sitemap.xml / llms.txt / llms-full.txt (R8): indexables, construidas y sin puerta pendiente. */
export function indexablePages({ builtOnly = true } = {}) {
  return SITEMAP.filter((p) => !isNoindex(p, copyOf(p.id)) && (!builtOnly || BUILT.has(p.url)));
}

/** Normaliza un href interno a la forma de sitemap.json ('/x/y/') o null si es externo/ancla. */
export function normRoute(href) {
  if (!href) return null;
  let h = String(href).trim();
  if (/^(mailto:|tel:|javascript:|data:|blob:)/i.test(h)) return null;
  const abs = h.match(/^(?:https?:)?\/\/([^/]+)(\/[^?#]*)?/i);
  if (abs) { if (!/(^|\.)ingeniak\.mx$/i.test(abs[1]) && !/^(127\.0\.0\.1|localhost)(:\d+)?$/.test(abs[1])) return null; h = abs[2] || '/'; }
  if (h.startsWith('#') || h.startsWith('?')) return null;
  h = h.replace(/[?#].*$/, '');
  if (!h.startsWith('/')) return null;
  if (h === '/404' || h === '/404/') return '/404';
  if (!/\.[a-z0-9]{2,5}$/i.test(h) && !h.endsWith('/')) h += '/';
  return h;
}

/* ───────────────────────── Páginas ───────────────────────── */
function distFiles(dir) {
  const out = [];
  const walk = (d) => {
    for (const e of readdirSync(d, { withFileTypes: true })) {
      const p = join(d, e.name);
      if (e.isDirectory()) walk(p);
      else if (e.name.endsWith('.html')) out.push(p);
    }
  };
  if (existsSync(dir)) walk(dir);
  return out;
}
function routeOfDist(file, dist) {
  const rel = relative(dist, file).split(sep).join('/');
  if (rel === 'index.html') return '/';
  if (rel === '404.html') return '/404';
  return '/' + rel.replace(/index\.html$/, '').replace(/\.html$/, '/');
}

/** Carga las páginas a revisar: [{ route, html, page (entrada de sitemap.json o null), source }]. */
export async function loadPages(opts) {
  const list = [];
  const only = onlyRoutes(opts);
  if (opts.url) {
    // con --only solo se piden esas rutas (antes se pedían las ~70 de sitemap.json y se filtraban al final)
    for (const p of only ? SITEMAP.filter((x) => only.has(x.url)) : SITEMAP) {
      const u = p.url === '/404' ? '/404' : p.url;
      let res;
      // el servidor de desarrollo compartido a veces tarda o corta una conexión mientras recompila: 3 intentos
      for (let i = 0; i < 3 && !res; i++) {
        try { res = await fetch(opts.url + u, { redirect: 'manual' }); }
        catch (e) { if (i === 2) throw new Error(`[check] no responde ${opts.url}${u}: ${e.message}`); await new Promise((r) => setTimeout(r, 1500)); }
      }
      if (res.status !== 200) continue;
      const ct = res.headers.get('content-type') || '';
      if (!ct.includes('html')) continue;
      const html = await res.text();
      // el servidor de desarrollo responde 200 con una página vacía (solo /@vite/client) cuando la plantilla falla
      if (!/<html[\s>]/i.test(html) || !/<title[\s>]/i.test(html)) { (opts.broken ??= new Set()).add(p.url); continue; }
      list.push({ route: p.url, html, page: p, source: opts.url + u });
    }
    if (!list.length) throw new Error(`[check] ninguna ruta de sitemap.json respondió 200 en ${opts.url}`);
    // páginas de demostración (src/pages/dev/*.astro): no salen en producción (astro.config.mjs las saca de dist); solo con
    // --dev las revisan las guardas de texto (cifras, pendientes)
    if (opts.dev === true) {
      const devDir = join(ROOT, 'src/pages/dev');
      const devFiles = existsSync(devDir) ? readdirSync(devDir).filter((f) => /^[a-z0-9-]+\.astro$/.test(f)) : [];
      for (const f of devFiles) {
        const u = `/dev/${f.replace(/\.astro$/, '')}/`;
        try {
          const res = await fetch(opts.url + u);
          const html = res.status === 200 ? await res.text() : '';
          if (/<html[\s>]/i.test(html)) list.push({ route: u, html, page: null, source: opts.url + u, dev: true });
        } catch {}
      }
    }
  } else {
    const files = distFiles(opts.dist);
    if (!files.length) throw new Error(`[check] no hay HTML en ${opts.dist}: corre "astro build" o usa --url http://127.0.0.1:4321`);
    for (const f of files) {
      const route = routeOfDist(f, opts.dist);
      // páginas de demostración (noindex, fuera del sitemap y del build de producción): solo con --dev (cifras y pendientes)
      const dev = route.startsWith('/dev/') || route === '/dev-movil/';
      if (dev && opts.dev !== true) continue;
      list.push({ route, html: readFileSync(f, 'utf8'), page: SITEMAP.find((p) => p.url === route) ?? null, source: f, dev });
    }
  }
  const out = only ? list.filter((x) => only.has(x.route)) : list;
  return opts.dev === false ? out.filter((x) => !x.dev) : out;
}
/** Rutas de --only normalizadas a la forma de sitemap.json ('/x/y/'), o null si se revisa todo el sitio. Las guardas de
 *  sitio completo (sitemap.xml, WhatsApp único…) la usan para acotar su comparación a esas rutas (si no, un --only de
 *  una familia reportaba como "fuera de sitemap.xml" todas las demás páginas indexables). */
export function onlyRoutes(opts) {
  return opts?.only?.length ? new Set(opts.only.map((r) => normRoute(r) ?? r)) : null;
}
/** Texto de un recurso del sitio (llms.txt, robots.txt, sitemap xml…) desde dist o el servidor. null si no existe. */
export async function loadText(opts, path) {
  if (opts.url) {
    // 3 intentos: con el servidor de desarrollo compartido ocupado, una conexión cortada daba un falso "falta /llms.txt"
    for (let i = 0; i < 3; i++) {
      try { const r = await fetch(opts.url + path); return r.status === 200 ? await r.text() : null; }
      catch { if (i < 2) await new Promise((r) => setTimeout(r, 1500)); }
    }
    return null;
  }
  const p = join(opts.dist, path.replace(/^\//, ''));
  return existsSync(p) && statSync(p).isFile() ? readFileSync(p, 'utf8') : null;
}

/* ───────────────────────── Analizador de HTML ───────────────────────── */
const VOID = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr']);
const RAW = new Set(['script', 'style', 'textarea', 'title', 'xmp', 'iframe', 'noembed', 'noframes']);
const AUTO_CLOSE = {
  p: new Set(['p', 'div', 'ul', 'ol', 'dl', 'table', 'section', 'article', 'aside', 'header', 'footer', 'nav', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'figure', 'blockquote', 'form', 'pre', 'hr', 'main', 'details', 'figcaption', 'address', 'fieldset']),
  li: new Set(['li']), dt: new Set(['dt', 'dd']), dd: new Set(['dt', 'dd']), option: new Set(['option']),
  tr: new Set(['tr']), td: new Set(['td', 'th', 'tr']), th: new Set(['td', 'th', 'tr']),
};
const ENT = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', times: '×', minus: '−', ndash: '–', mdash: '—', hellip: '…', middot: '·', rarr: '→', larr: '←', laquo: '«', raquo: '»', iexcl: '¡', iquest: '¿', aacute: 'á', eacute: 'é', iacute: 'í', oacute: 'ó', uacute: 'ú', ntilde: 'ñ', Aacute: 'Á', Eacute: 'É', Iacute: 'Í', Oacute: 'Ó', Uacute: 'Ú', Ntilde: 'Ñ', uuml: 'ü', copy: '©', reg: '®', trade: '™', deg: '°', bull: '•', rsquo: '’', lsquo: '‘', rdquo: '”', ldquo: '“', thinsp: ' ', ensp: ' ', emsp: ' ' };
export function decode(s) {
  return String(s).replace(/&(#x[0-9a-f]+|#\d+|[a-z][a-z0-9]*);/gi, (m, e) => {
    if (e[0] === '#') { const n = e[1] === 'x' || e[1] === 'X' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10); try { return String.fromCodePoint(n); } catch { return m; } }
    return ENT[e] ?? m;
  });
}
function parseAttrs(src) {
  const attrs = {};
  const rx = /([^\s"'>\/=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g;
  let m;
  while ((m = rx.exec(src))) attrs[m[1].toLowerCase()] = decode(m[2] ?? m[3] ?? m[4] ?? '');
  return attrs;
}
/** Árbol { tag, attrs, children, parent } con nodos de texto { text, parent }. */
export function parseHTML(html) {
  const root = { tag: '#root', attrs: {}, children: [], parent: null };
  let cur = root, i = 0;
  const n = html.length;
  const push = (node) => { node.parent = cur; cur.children.push(node); };
  const close = (tag) => {
    let x = cur;
    while (x && x !== root && x.tag !== tag) x = x.parent;
    if (x && x !== root) cur = x.parent;
  };
  while (i < n) {
    const lt = html.indexOf('<', i);
    if (lt < 0) { push({ text: decode(html.slice(i)) }); break; }
    if (lt > i) push({ text: decode(html.slice(i, lt)) });
    if (html.startsWith('<!--', lt)) { const e = html.indexOf('-->', lt + 4); i = e < 0 ? n : e + 3; continue; }
    if (html[lt + 1] === '!' || html[lt + 1] === '?') { const e = html.indexOf('>', lt); i = e < 0 ? n : e + 1; continue; }
    if (html[lt + 1] === '/') {
      const e = html.indexOf('>', lt);
      const tag = html.slice(lt + 2, e < 0 ? n : e).trim().toLowerCase();
      close(tag); i = e < 0 ? n : e + 1; continue;
    }
    const m = /^<([a-zA-Z][a-zA-Z0-9:-]*)/.exec(html.slice(lt, lt + 64));
    if (!m) { push({ text: '<' }); i = lt + 1; continue; }
    const tag = m[1].toLowerCase();
    // fin de la etiqueta respetando comillas
    let j = lt + m[0].length, q = null;
    for (; j < n; j++) { const c = html[j]; if (q) { if (c === q) q = null; } else if (c === '"' || c === "'") q = c; else if (c === '>') break; }
    const inner = html.slice(lt + m[0].length, j);
    const selfClose = /\/\s*$/.test(inner);
    const node = { tag, attrs: parseAttrs(inner.replace(/\/\s*$/, '')), children: [], parent: null };
    // cierre implícito (p dentro de p, li tras li…)
    for (const [open, closers] of Object.entries(AUTO_CLOSE)) if (closers.has(tag)) { let x = cur; while (x && x !== root && !['ul', 'ol', 'table', 'tbody', 'dl', 'select', 'div', 'section', 'main', 'body'].includes(x.tag)) { if (x.tag === open) { cur = x.parent; break; } x = x.parent; } }
    push(node);
    i = j + 1;
    if (VOID.has(tag) || selfClose) continue;
    if (RAW.has(tag)) {
      const endRx = new RegExp(`</${tag}\\s*>`, 'i');
      const rest = html.slice(i);
      const em = endRx.exec(rest);
      const body = em ? rest.slice(0, em.index) : rest;
      const rc = tag === 'title' || tag === 'textarea';
      if (body) node.children.push({ text: rc ? decode(body) : body, parent: node, raw: !rc });
      i = em ? i + em.index + em[0].length : n;
      continue;
    }
    cur = node;
  }
  return root;
}
export function* walk(node) {
  yield node;
  if (node.children) for (const c of node.children) yield* walk(c);
}
export const isEl = (n) => !!n && typeof n.tag === 'string' && n.tag !== '#root';
export const hasClass = (n, c) => isEl(n) && (` ${n.attrs.class ?? ''} `).includes(` ${c} `);
export function findAll(root, pred) { const out = []; for (const x of walk(root)) if (isEl(x) && pred(x)) out.push(x); return out; }
export function find(root, pred) { for (const x of walk(root)) if (isEl(x) && pred(x)) return x; return null; }
export function closest(node, pred) { let x = node; while (x) { if (isEl(x) && pred(x)) return x; x = x.parent; } return null; }
/** ¿El nodo está oculto para todos? (hidden, template, estilos display:none, <head>, scripts/estilos) */
export function isHidden(el) {
  let x = el;
  while (x) {
    if (isEl(x)) {
      if (['script', 'style', 'template', 'noscript', 'head'].includes(x.tag)) return true;
      if ('hidden' in x.attrs && x.attrs.hidden !== 'until-found') return true;
      if (/display\s*:\s*none/i.test(x.attrs.style ?? '')) return true;
    }
    x = x.parent;
  }
  return false;
}
/** Texto de un nodo (sin scripts/estilos), con espacios normalizados. */
export function textOf(node, { skipHidden = false } = {}) {
  let out = '';
  const rec = (n) => {
    if (n.text !== undefined) { if (!n.raw) out += n.text; return; }
    if (['script', 'style', 'template'].includes(n.tag)) return;
    if (skipHidden && ('hidden' in n.attrs)) return;
    if (n.tag === 'br') { out += ' '; return; }
    const block = /^(p|div|li|h[1-6]|section|article|header|footer|dt|dd|tr|td|th|figcaption|blockquote|ul|ol|dl|table|nav|main|aside|button|label|summary|option)$/.test(n.tag);
    if (block) out += ' ';
    for (const c of n.children) rec(c);
    if (block) out += ' ';
  };
  rec(node);
  return norm(out);
}
export const norm = (s) => String(s ?? '').replace(/[    ​]/g, ' ').replace(/\s+/g, ' ').trim();
/** Comparación laxa de textos (H1 vs sitemap, FAQ visible vs FAQPage): minúsculas, sin puntuación ni símbolos tipográficos. */
export const loose = (s) => norm(s).toLowerCase().normalize('NFC').replace(/[“”«»"'’‘¿¡.,:;!?()…—–\-]/g, ' ').replace(/\s+/g, ' ').trim();

/** Nodos de texto visibles con su elemento padre (para guardas de contenido). */
export function* visibleTextNodes(root) {
  const body = find(root, (x) => x.tag === 'body') ?? root;
  for (const n of walk(body)) {
    if (n.text === undefined || n.raw) continue;
    if (!norm(n.text)) continue;
    if (isHidden(n.parent)) continue;
    yield n;
  }
}
export function metaContent(root, key) {
  const el = find(root, (x) => x.tag === 'meta' && (x.attrs.name === key || x.attrs.property === key));
  return el ? el.attrs.content ?? '' : null;
}
export function jsonLd(root) {
  const out = [];
  for (const s of findAll(root, (x) => x.tag === 'script' && (x.attrs.type ?? '') === 'application/ld+json')) {
    const raw = s.children.map((c) => c.text ?? '').join('');
    try { out.push(JSON.parse(raw)); } catch (e) { out.push({ __error: e.message, __raw: raw.slice(0, 200) }); }
  }
  return out;
}
/** Todos los strings de un objeto JSON (para escanear JSON-LD). */
export function* jsonStrings(v, path = '') {
  if (typeof v === 'string') yield [path, v];
  else if (Array.isArray(v)) for (let i = 0; i < v.length; i++) yield* jsonStrings(v[i], `${path}[${i}]`);
  else if (v && typeof v === 'object') for (const [k, x] of Object.entries(v)) if (!k.startsWith('@') || k === '@type') yield* jsonStrings(x, path ? `${path}.${k}` : k);
}
/** Nodos @graph aplanados. */
export function graphNodes(lds) {
  const out = [];
  for (const ld of lds) { if (Array.isArray(ld['@graph'])) out.push(...ld['@graph']); else if (ld && !ld.__error) out.push(ld); }
  return out;
}
/** Sección del copy que un elemento visible pertenece (id de la <section> más cercana). */
export function sectionIdOf(node) { return closest(node, (x) => x.tag === 'section' && x.attrs.id)?.attrs.id ?? null; }
