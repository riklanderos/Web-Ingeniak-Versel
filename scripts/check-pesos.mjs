// scripts/check-pesos.mjs — presupuesto de imagen y JS (ESPEC-v2 §8.2, §8.3 y §12.2 R9).
// Por página suma, de cada <picture>/<img> (y póster de <video>), el candidato que el navegador elige en escritorio
// (1440 × 900, DPR 2) y en móvil (390 × 844, DPR 3), y lo compara con R9: inicio ≤ 3.8 MB / 2.2 MB; internas
// ≤ 2.0 MB / 1.2 MB; primer pantallazo (placa LCP + Lexend) ≤ 450 KB. Además: cada <img> con width y height, los
// pesos por archivo de §8.2 (AVIF de placas, stills, rack, aura, grano; video) y el JS gzip por página desde
// dist/_astro (inicio 85 KB, internas 60 KB; solo con build: el servidor de desarrollo no lo puede medir).
// Cambio 2026-10-20: las landings ocultas (/discovery/, /power-session/) y /agendar/confirmado/ llevan el presupuesto de
// página interna (R9) como cualquier ruta de sitemap.json distinta de "/"; si alguna no se pudo medir, aviso.
// Uso: node scripts/check-pesos.mjs [--url http://127.0.0.1:4321] [--release]
import { existsSync, statSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { gzipSync } from 'node:zlib';
import { pathToFileURL } from 'node:url';
import { ROOT, HIDDEN, parseArgs, reporter, loadPages, onlyRoutes, parseHTML, findAll, find, closest, isEl } from './_html.mjs';

const KB = 1000, MB = 1000 * 1000;
const BUDGET = { home: { d: 3.8 * MB, m: 2.2 * MB }, page: { d: 2.0 * MB, m: 1.2 * MB }, first: 450 * KB, js: { home: 85 * KB, page: 60 * KB } };
const VIEW = { d: { w: 1440, h: 900, dpr: 2 }, m: { w: 390, h: 844, dpr: 3 } };
const fmt = (b) => (b >= MB ? `${(b / MB).toFixed(2)} MB` : `${Math.round(b / KB)} KB`);

/* ── media queries y sizes (subconjunto: min/max-width, min/max-aspect-ratio, and, coma) ── */
function mqMatch(q, v) {
  if (!q || !q.trim()) return true;
  return q.split(',').some((part) => part.trim().split(/\band\b/).every((c) => {
    const m = c.match(/\(\s*(min|max)-(width|aspect-ratio)\s*:\s*([\d.]+)\s*(?:px)?\s*(?:\/\s*([\d.]+))?\s*\)/i);
    if (!m) return /^\s*(screen|all)?\s*$/i.test(c);
    const val = m[2].toLowerCase() === 'width' ? v.w : v.w / v.h;
    const lim = m[4] ? parseFloat(m[3]) / parseFloat(m[4]) : parseFloat(m[3]);
    return m[1].toLowerCase() === 'min' ? val >= lim : val <= lim;
  }));
}
function lengthPx(s, v) {
  const m = String(s).trim().match(/^([\d.]+)\s*(vw|svh|lvh|dvh|vh|px|vmin|vmax)?$/i);
  if (!m) return v.w;
  const n = parseFloat(m[1]); const u = (m[2] || 'px').toLowerCase();
  return u === 'vw' ? (n * v.w) / 100 : /vh$/.test(u) ? (n * v.h) / 100 : u === 'vmin' ? (n * Math.min(v.w, v.h)) / 100 : u === 'vmax' ? (n * Math.max(v.w, v.h)) / 100 : n;
}
function slot(sizes, v) {
  if (!sizes) return v.w;
  for (const part of sizes.split(/,(?![^(]*\))/)) {
    const p = part.trim();
    const m = p.match(/^(\(.+\))\s+(\S+)$/);
    if (m) { if (mqMatch(m[1], v)) return lengthPx(m[2], v); }
    else return lengthPx(p, v);
  }
  return v.w;
}
function candidates(srcset, src) {
  const out = [];
  for (const c of (srcset ?? '').split(/,\s+/)) {
    const [u, d] = c.trim().split(/\s+/);
    if (!u) continue;
    const w = d?.endsWith('w') ? parseFloat(d) : null;
    const x = d?.endsWith('x') ? parseFloat(d) : !d ? 1 : null;
    out.push({ u, w, x });
  }
  if (!out.length && src) out.push({ u: src, w: null, x: 1 });
  return out;
}
function choose(cands, sizes, v) {
  if (!cands.length) return null;
  const ws = cands.filter((c) => c.w).sort((a, b) => a.w - b.w);
  if (ws.length) { const need = slot(sizes, v) * v.dpr; return ws.find((c) => c.w >= need) ?? ws[ws.length - 1]; }
  const xs = cands.filter((c) => c.x).sort((a, b) => a.x - b.x);
  return xs.find((c) => c.x >= v.dpr) ?? xs[xs.length - 1];
}
const mobileOnly = (media) => /max-width:\s*767px/.test(media ?? '') && !/min-/.test(media ?? '');
const desktopOnly = (media) => /min-width:\s*768px/.test(media ?? '');
/** URL elegida para un <picture>/<img> en una vista. */
function pick(el, mode) {
  const v = VIEW[mode];
  const img = el.tag === 'img' ? el : find(el, (x) => x.tag === 'img');
  if (el.tag === 'picture') {
    for (const s of el.children.filter((x) => isEl(x) && x.tag === 'source')) {
      const media = s.attrs.media;
      if (media && !mqMatch(media, v)) continue;
      if (mode === 'd' && mobileOnly(media)) continue;
      if (mode === 'm' && desktopOnly(media)) continue;
      const t = s.attrs.type ?? '';
      if (t && !/image\/(avif|webp|jpeg|png|svg)/.test(t)) continue;
      return choose(candidates(s.attrs.srcset, null), s.attrs.sizes, v)?.u ?? null;
    }
  }
  if (!img) return null;
  return choose(candidates(img.attrs.srcset, img.attrs.src), img.attrs.sizes, v)?.u ?? null;
}

/* ── tamaño de un recurso ── */
const sizeCache = new Map();
async function sizeOf(u, opts) {
  if (!u || u.startsWith('data:')) return u ? Math.round(u.length * 0.75) : 0;
  if (sizeCache.has(u)) return sizeCache.get(u);
  let s = null;
  const clean = decodeURIComponent(u.replace(/^https?:\/\/(ingeniak\.mx|127\.0\.0\.1:\d+|localhost:\d+)/, '').replace(/[?#].*$/, ''));
  const tries = clean.startsWith('/@fs/') ? [clean.slice(4)] : [join(ROOT, 'public', clean), join(opts.dist, clean)];
  for (const p of tries) if (existsSync(p) && statSync(p).isFile()) { s = statSync(p).size; break; }
  if (s == null && opts.url && !/^https?:/.test(u)) {
    try { const r = await fetch(opts.url + u); if (r.ok) s = (await r.arrayBuffer()).byteLength; } catch {}
  }
  sizeCache.set(u, s);
  return s;
}

/* ── §8.2 límites por archivo ── */
function fileLimit(name) {
  if (/^home-hero-m-1080\.avif$/.test(name)) return [120 * KB, 'placa vertical 9:16 a 1080 (AVIF)'];
  if (/-m-1080\.avif$/.test(name)) return [100 * KB, 'placa vertical 4:5 a 1080 (AVIF)'];
  if (/-cut-\d+\.(avif|webp)$/.test(name)) return [160 * KB, 'recorte con alfa'];
  if (/-still-640\.avif$/.test(name)) return [35 * KB, 'still a 640 (AVIF)'];
  if (/-rack-320\.webp$/.test(name)) return [8 * KB, 'copia de rack focus (320 WebP)'];
  if (/^[a-z0-9-]+-1920\.avif$/.test(name) && !/-m-/.test(name)) return [220 * KB, 'placa 16:9 a 1920 (AVIF)'];
  if (/^[a-z0-9-]+-2560\.avif$/.test(name) && !/-m-/.test(name)) return [320 * KB, 'placa 16:9 a 2560 (AVIF)'];
  return null;
}

/* ── JS de una página (dist) ── */
function jsBytes(root, dist) {
  const seen = new Set();
  let total = 0;
  const add = (rel) => {
    const clean = rel.replace(/^\//, '').replace(/[?#].*$/, '');
    if (seen.has(clean)) return;
    seen.add(clean);
    const p = join(dist, clean);
    if (!existsSync(p)) return;
    const src = readFileSync(p);
    total += gzipSync(src, { level: 9 }).length;
    // importaciones estáticas (las dinámicas se cargan bajo demanda y no cuentan)
    const code = src.toString('utf8');
    for (const m of code.matchAll(/(?:^|[;\n}])\s*import\s*(?:[^'"()]*?from\s*)?["'](\.{1,2}\/[^"']+)["']/g)) {
      const base = clean.split('/').slice(0, -1).join('/');
      const parts = `${base}/${m[1]}`.split('/');
      const out = [];
      for (const s of parts) { if (s === '..') out.pop(); else if (s !== '.' && s !== '') out.push(s); }
      add(out.join('/'));
    }
  };
  for (const s of findAll(root, (x) => (x.tag === 'script' && x.attrs.src) || (x.tag === 'link' && x.attrs.rel === 'modulepreload'))) {
    const u = s.attrs.src ?? s.attrs.href;
    if (u && u.startsWith('/_astro/')) add(u);
  }
  // scripts en línea (hoisted) también cuentan
  for (const s of findAll(root, (x) => x.tag === 'script' && !x.attrs.src && !/json/.test(x.attrs.type ?? ''))) {
    const code = s.children.map((c) => c.text ?? '').join('');
    total += gzipSync(Buffer.from(code), { level: 9 }).length;
    for (const m of code.matchAll(/import\s*(?:[^'"()]*?from\s*)?["'](\/_astro\/[^"']+)["']/g)) add(m[1]);
  }
  // diferido: chunks que el código estático pide con import() (gsap/ScrollTrigger, escenas, Lenis…). No cuentan contra
  // el presupuesto del camino crítico (§7.8: "con import() donde se usan"), pero se informan para no esconder el total.
  let deferred = 0;
  const dseen = new Set();
  for (const f of seen) {
    const p = join(dist, f);
    if (!existsSync(p)) continue;
    const base = f.split('/').slice(0, -1).join('/');
    for (const m of readFileSync(p, 'utf8').matchAll(/import\(\s*["'](\.{1,2}\/[^"']+)["']\s*\)/g)) {
      const parts = `${base}/${m[1]}`.split('/'); const out = [];
      for (const s of parts) { if (s === '..') out.pop(); else if (s !== '.' && s !== '') out.push(s); }
      const rel = out.join('/');
      if (seen.has(rel) || dseen.has(rel) || !existsSync(join(dist, rel))) continue;
      dseen.add(rel);
      deferred += gzipSync(readFileSync(join(dist, rel)), { level: 9 }).length;
    }
  }
  return { total, deferred };
}

export async function run(opts) {
  const R = reporter('check-pesos', opts);
  const pages = await loadPages({ ...opts, dev: false });
  const lexend = [];
  const checkedFiles = new Set();
  for (const pg of pages) {
    const root = parseHTML(pg.html);
    const isHome = pg.route === '/';
    const B = isHome ? BUDGET.home : BUDGET.page;
    // width/height
    for (const img of findAll(root, (x) => x.tag === 'img')) {
      if (!img.attrs.width || !img.attrs.height) R.fail(pg.route, `<img> sin width/height: ${(img.attrs.src ?? '').slice(0, 90)}`);
    }
    // unidades de imagen: <picture>, <img> fuera de <picture>, pósters de <video>
    const units = [];
    for (const el of findAll(root, (x) => x.tag === 'picture' || (x.tag === 'img' && !closest(x.parent, (y) => y.tag === 'picture')))) {
      if (closest(el, (x) => x.tag === 'template' || x.tag === 'noscript')) continue;
      units.push(el);
    }
    const posters = findAll(root, (x) => x.tag === 'video' && x.attrs.poster).map((v) => v.attrs.poster);
    const totals = { d: 0, m: 0 };
    const missing = new Set();
    const per = { d: [], m: [] };
    for (const mode of ['d', 'm']) {
      const urls = new Set();
      for (const el of units) { const u = pick(el, mode); if (u) urls.add(u); }
      for (const p of posters) urls.add(p);
      for (const u of urls) {
        const s = await sizeOf(u, opts);
        if (s == null) { missing.add(u); continue; }
        totals[mode] += s;
        per[mode].push([u, s]);
      }
    }
    for (const u of missing) R.fail(pg.route, `imagen referenciada que no existe: ${u}`);
    const top = (mode) => per[mode].sort((a, b) => b[1] - a[1]).slice(0, 3).map(([u, s]) => `${u.split('/').pop()} ${fmt(s)}`).join(', ');
    if (totals.d > B.d) R.fail(pg.route, `imágenes en escritorio (DPR 2): ${fmt(totals.d)} > ${fmt(B.d)} · mayores: ${top('d')}`);
    if (totals.m > B.m) R.fail(pg.route, `imágenes en móvil (DPR 3): ${fmt(totals.m)} > ${fmt(B.m)} · mayores: ${top('m')}`);
    R.info(`${pg.route} · imágenes escritorio ${fmt(totals.d)} / ${fmt(B.d)} · móvil ${fmt(totals.m)} / ${fmt(B.m)}`);
    // primer pantallazo: placa LCP + Lexend precargada
    const fonts = findAll(root, (x) => x.tag === 'link' && x.attrs.rel === 'preload' && x.attrs.as === 'font' && /lexend/i.test(x.attrs.href ?? ''));
    let fontBytes = 0;
    for (const f of fonts) fontBytes += (await sizeOf(f.attrs.href, opts)) ?? 0;
    if (!fonts.length) R.warn(pg.route, 'sin <link rel=preload> de Lexend (§8.3)');
    const lcpImg = find(root, (x) => x.tag === 'img' && x.attrs.fetchpriority === 'high') ?? find(find(root, (x) => x.tag === 'main') ?? root, (x) => x.tag === 'img');
    if (lcpImg) {
      const unit = closest(lcpImg, (x) => x.tag === 'picture') ?? lcpImg;
      for (const mode of ['d', 'm']) {
        const u = pick(unit, mode);
        const s = (await sizeOf(u, opts)) ?? 0;
        const total = s + fontBytes;
        if (total > BUDGET.first) R.fail(pg.route, `primer pantallazo ${mode === 'd' ? 'escritorio' : 'móvil'}: ${fmt(total)} > ${fmt(BUDGET.first)} (${u?.split('/').pop()} ${fmt(s)} + Lexend ${fmt(fontBytes)})`);
      }
    }
    // §8.2 por archivo (las que la página usa)
    for (const mode of ['d', 'm']) for (const [u, s] of per[mode]) {
      const name = u.split('/').pop().replace(/[?#].*$/, '');
      if (checkedFiles.has(name)) continue;
      checkedFiles.add(name);
      const lim = /\/img\/cine\//.test(u) ? fileLimit(name) : null;
      if (lim && s > lim[0]) R.fail(pg.route, `${name}: ${fmt(s)} > ${fmt(lim[0])} (${lim[1]}, §8.2)`);
    }
    // video
    for (const v of findAll(root, (x) => (x.tag === 'video' && x.attrs.src) || (x.tag === 'source' && /video\//.test(x.attrs.type ?? '')) || ('data-src' in x.attrs && /\.(mp4|webm|mov)(\?|$)/.test(x.attrs['data-src'])))) {
      const u = v.attrs.src ?? v.attrs['data-src'];
      const s = await sizeOf(u, opts);
      if (s == null) continue;
      const vsl = /vsl/i.test(u);
      const lim = vsl ? 12 * MB : 2.5 * MB;
      if (s > lim) (vsl ? R.warn : R.fail)(pg.route, `video ${u.split('/').pop()}: ${fmt(s)} > ${fmt(lim)}${vsl ? ' (VSL, R14: recomprimir)' : ' (§8.2)'}`);
    }
    // JS
    if (!opts.url) {
      const { total: js, deferred } = jsBytes(root, opts.dist);
      const lim = isHome ? BUDGET.js.home : BUDGET.js.page;
      if (js > lim) R.fail(pg.route, `JS gzip ${fmt(js)} > ${fmt(lim)}`);
      R.info(`${pg.route} · JS gzip ${fmt(js)} / ${fmt(lim)} en el camino crítico · + ${fmt(deferred)} diferido con import() (primer nivel)`);
    }
  }
  // rutas nuevas del cambio 2026-10-20: deben medirse (presupuesto de página interna)
  const scope = onlyRoutes(opts);
  for (const r of HIDDEN) if ((!scope || scope.has(r)) && !pages.some((p) => p.route === r)) R.warn(r, 'sin medir: la ruta no respondió 200 (presupuesto de página interna, R9)');
  if (opts.url) R.info('JS gzip: solo se mide contra dist/_astro después de "astro build" (el servidor de desarrollo sirve módulos sin empaquetar)');
  // §8.2: todos los AVIF publicados de placas, aura y grano (aunque hoy no los use ninguna página)
  const dir = join(ROOT, 'public/img/cine');
  if (existsSync(dir)) for (const f of readdirSync(dir)) {
    if (checkedFiles.has(f)) continue;
    const lim = fileLimit(f);
    if (lim) { const s = statSync(join(dir, f)).size; if (s > lim[0]) R.warn(null, `public/img/cine/${f}: ${fmt(s)} > ${fmt(lim[0])} (${lim[1]}, §8.2; sin uso en las páginas revisadas)`); }
  }
  const noise = join(ROOT, 'public/fx/noise.webp');
  if (existsSync(noise) && statSync(noise).size > 6 * KB) R.fail(null, `public/fx/noise.webp: ${fmt(statSync(noise).size)} > 6 KB (grano, §8.2)`);
  const auraDir = join(ROOT, 'src/components/cine/assets');
  if (existsSync(auraDir)) for (const f of readdirSync(auraDir).filter((f) => /^aura.*\.webp$/.test(f))) {
    const s = statSync(join(auraDir, f)).size;
    if (s > 25 * KB) R.fail(null, `src/components/cine/assets/${f}: ${fmt(s)} > 25 KB (aura, §8.2)`);
  }
  void lexend;
  return R.done();
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const r = await run(parseArgs());
  process.exit(r.fails ? 1 : 0);
}
