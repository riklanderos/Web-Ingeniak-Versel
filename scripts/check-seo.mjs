// scripts/check-seo.mjs — guarda de SEO, GEO y enlaces (ESPEC-v2 §8.4–8.7, §8.6, §12.2 R2/R8).
// Por página: title ≤ 60 · meta ≤ 155 · un H1, único en el sitio e igual al de sitemap.json · canonical propio con barra ·
// mensaje de WhatsApp propio y único · FAQPage = FAQ visible · una .lit · alt en placas · enlaces internos (FAIL si la
// ruta no está en sitemap.json; WARN si está planeada pero sin construir; fatal con --release) · anclas #id existentes.
// Del sitio: páginas noindex fuera de sitemap.xml, llms.txt y llms-full.txt · conteos = indexables sin puerta pendiente ·
// llms.txt con la expansión de VKTOR™ y solo PRICE_FROM · robots.txt con el Sitemap.
// Cambio 2026-10-20 (CAMBIO-COTIZAR §6.1, ESPEC §12.6 R17): (a) ninguna página pública enlaza (en cualquier parte del HTML) a
// una landing oculta (hidden: true) → FALLA; (b) /indice.json sin rutas ocultas ni preguntas cuyas pages sean solo ocultas;
// (c) el destino de una redirección se compara sin #… (/contacto/#cotizar → /contacto/).
// Uso: node scripts/check-seo.mjs [--url http://127.0.0.1:4321] [--release]
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import {
  ROOT, SITE_URL, SITEMAP, SITEMAP_URLS, BUILT, parseArgs, reporter, loadPages, loadText, loadMetrics, parseHTML, find, findAll,
  closest, isEl, hasClass, textOf, norm, loose, metaContent, jsonLd, graphNodes, normRoute, copyOf, gatePending, indexablePages, sectionIdOf,
  onlyRoutes, HIDDEN, isHiddenPage,
} from './_html.mjs';
import { isNoindex } from '../src/lib/indexacion.mjs';

const VKTOR_OK = ['Verify', 'Koncept', 'Transform', 'Operate', 'Rise'];
const waText = (href) => { try { return new URL(href.replace(/&amp;/g, '&')).searchParams.get('text') ?? ''; } catch { return ''; } };
const isWa = (h) => /^https?:\/\/(wa\.me|api\.whatsapp\.com)\//i.test(h ?? '');

export async function run(opts) {
  const R = reporter('check-seo', opts);
  const M = loadMetrics();
  // --only: las comparaciones de sitio completo (sitemap.xml) se acotan a esas rutas; llms.txt y llms-full.txt se siguen
  // revisando completos porque se descargan enteros
  const scope = onlyRoutes(opts);
  const inScope = (u) => !scope || scope.has(u);
  const loaded = await loadPages({ ...opts, dev: false });
  const pages = loaded.filter((p) => p.route !== '/404' || opts.url == null);
  const h1s = new Map();
  const waByPage = new Map();
  const idsByRoute = new Map();
  const robotsByRoute = new Map();
  const parsed = [];
  const planned = new Map(); // ruta planeada sin construir → páginas que la enlazan

  for (const pg of pages) {
    const root = parseHTML(pg.html);
    parsed.push({ pg, root });
    idsByRoute.set(pg.route, new Set(findAll(root, (x) => !!x.attrs.id).map((x) => x.attrs.id)));
  }

  for (const { pg, root } of parsed) {
    const page = pg.page;
    const route = pg.route;
    const robots = metaContent(root, 'robots') ?? '';
    const noindex = /noindex/i.test(robots);
    robotsByRoute.set(route, noindex);
    if (!page && !route.startsWith('/dev/')) R.fail(route, 'la página construida no está en sitemap.json');
    // title y meta
    const title = norm(textOf(find(root, (x) => x.tag === 'title') ?? { children: [] }));
    const desc = norm(metaContent(root, 'description') ?? '');
    if (!title) R.fail(route, 'sin <title>');
    else if (title.length > 60) R.fail(route, `title de ${title.length} caracteres (máx. 60): "${title}"`);
    if (!desc) R.fail(route, 'sin meta description');
    else if (desc.length > 155) R.fail(route, `meta description de ${desc.length} caracteres (máx. 155)`);
    if (page && title !== norm(page.title)) R.warn(route, `title distinto de sitemap.json: "${title}" ≠ "${page.title}"`);
    if (page && desc !== norm(page.metaDescription)) R.warn(route, 'meta description distinta de sitemap.json');
    // canonical
    if (!noindex) {
      const can = find(root, (x) => x.tag === 'link' && x.attrs.rel === 'canonical')?.attrs.href;
      const want = `${SITE_URL}${route}`;
      if (can !== want) R.fail(route, `canonical "${can ?? '—'}" ≠ "${want}"`);
    }
    // H1
    const h1 = findAll(root, (x) => x.tag === 'h1');
    if (h1.length !== 1) R.fail(route, `${h1.length} H1 (debe haber exactamente uno)`);
    if (h1[0]) {
      const t = textOf(h1[0]);
      if (page && loose(t) !== loose(page.h1)) R.fail(route, `H1 ≠ sitemap.json\n      visible: "${t}"\n      sitemap: "${page.h1}"`);
      const k = loose(t);
      if (h1s.has(k)) R.fail(route, `H1 repetido con ${h1s.get(k)}`);
      else h1s.set(k, route);
    }
    // .lit
    const lits = findAll(root, (x) => hasClass(x, 'lit'));
    if (route !== '/404' && lits.length !== 1) R.fail(route, `${lits.length} elementos .lit (debe haber uno)`);
    // alt en placas
    for (const img of findAll(root, (x) => x.tag === 'img' && /\/img\/cine\//.test(`${x.attrs.src ?? ''} ${x.attrs.srcset ?? ''}`))) {
      if (!('alt' in img.attrs)) R.fail(route, `placa sin alt: ${img.attrs.src}`);
    }
    const firstPlate = find(root, (x) => x.tag === 'img' && /\/img\/cine\//.test(x.attrs.src ?? '') && !/(-rack-|-still-)/.test(x.attrs.src ?? ''));
    if (firstPlate && !noindex && !(firstPlate.attrs.alt ?? '').trim()) R.warn(route, `la placa de portada tiene alt vacío (R11: alt descriptivo en portadas): ${firstPlate.attrs.src}`);
    // WhatsApp
    const msgs = new Set();
    for (const a of findAll(root, (x) => x.tag === 'a' && isWa(x.attrs.href))) {
      const t = norm(waText(a.attrs.href));
      if (!t) { R.fail(route, `enlace de WhatsApp sin mensaje: ${a.attrs.href}`); continue; }
      msgs.add(t);
    }
    waByPage.set(route, msgs);
    if (page?.secondaryCta?.waMessage && !noindex && !msgs.has(norm(page.secondaryCta.waMessage))) R.fail(route, `ningún enlace usa su waMessage de sitemap.json ("${page.secondaryCta.waMessage}")`);
    // FAQPage = FAQ visible
    const faqNodes = graphNodes(jsonLd(root)).filter((n) => n['@type'] === 'FAQPage');
    const visItems = findAll(root, (x) => 'data-faq-item' in x.attrs);
    const vis = visItems.map((it) => ({
      q: loose(textOf(find(it, (x) => hasClass(x, 'faq__q') || hasClass(x, 'faq__qt')) ?? it)),
      a: loose(textOf(find(it, (x) => hasClass(x, 'faq__a')) ?? { children: [] })),
    }));
    const ld = faqNodes.flatMap((n) => (n.mainEntity ?? []).map((q) => ({ q: loose(q.name), a: loose(q.acceptedAnswer?.text) })));
    if (vis.length && !ld.length && !noindex) R.fail(route, `${vis.length} preguntas visibles sin FAQPage en el JSON-LD`);
    if (ld.length && !vis.length) R.fail(route, `FAQPage con ${ld.length} preguntas que no están visibles en la página`);
    for (const q of ld) {
      const v = vis.find((x) => x.q === q.q);
      if (!v) R.fail(route, `FAQPage: la pregunta "${q.q.slice(0, 70)}" no está visible`);
      else if (v.a !== q.a) R.fail(route, `FAQPage: la respuesta de "${q.q.slice(0, 50)}" no es idéntica al texto visible`);
    }
    for (const v of vis) if (ld.length && !ld.some((q) => q.q === v.q)) R.fail(route, `pregunta visible fuera del FAQPage: "${v.q.slice(0, 70)}"`);
    // (a) R17: una página pública nunca enlaza a una landing oculta (cualquier elemento con href: a, link, area)
    if (!isHiddenPage(page)) {
      const bad = new Set();
      for (const el of findAll(root, (x) => x.attrs.href != null)) {
        const r = normRoute(el.attrs.href);
        if (r && (HIDDEN.has(r) || r.startsWith('/agendar/')) && !bad.has(r)) { bad.add(r); R.fail(route, `página pública enlaza a la landing oculta ${el.attrs.href} (<${el.tag}>${sectionIdOf(el) ? ` en #${sectionIdOf(el)}` : ''}) · R17`); }
      }
    }
    // Enlaces internos
    const ids = idsByRoute.get(route);
    const seen = new Set();
    for (const a of findAll(root, (x) => x.tag === 'a' && x.attrs.href != null)) {
      const href = a.attrs.href.trim();
      if (!href || href === '#') continue; // check-pendientes
      if (href.startsWith('#')) {
        const id = decodeURIComponent(href.slice(1));
        if (!ids.has(id)) R.fail(route, `ancla rota ${href} (no existe ningún id="${id}" en la página)`);
        continue;
      }
      const r = normRoute(href);
      if (r === null) continue; // externo, mailto, tel
      const key = `${r}${href.includes('#') ? href.slice(href.indexOf('#')) : ''}`;
      if (seen.has(key)) continue;
      seen.add(key);
      if (/\.[a-z0-9]{2,5}$/i.test(r)) {
        const ok = existsSync(join(ROOT, 'public', r)) || existsSync(join(opts.dist, r)) || ['/llms.txt', '/llms-full.txt', '/robots.txt', '/indice.json', '/sitemap-index.xml'].includes(r);
        if (!ok) R.fail(route, `enlace a un archivo que no existe: ${href}`);
        continue;
      }
      if (!SITEMAP_URLS.has(r)) { R.fail(route, `enlace interno a una ruta que no está en sitemap.json: ${href}`); continue; }
      if (!BUILT.has(r)) {
        // Decisión 3 (QA ronda 2): el cuerpo (<main>) nunca enlaza a una ruta sin construir (linkTarget()/isBuilt());
        // encabezado, mega menú, hoja móvil y footer conservan la arquitectura completa (aviso, se construye al aprobar).
        if (closest(a, (x) => x.tag === 'main')) R.fail(route, `enlace en el cuerpo a una página sin construir (404 hoy): ${href} ("${norm(textOf(a)).slice(0, 60) || a.attrs['aria-label'] || ''}"${sectionIdOf(a) ? ` en #${sectionIdOf(a)}` : ''}) · usa linkTarget()`);
        else { if (!planned.has(r)) planned.set(r, new Set()); planned.get(r).add(route); }
        continue;
      }
      const hash = href.includes('#') ? decodeURIComponent(href.slice(href.indexOf('#') + 1)) : '';
      if (hash && idsByRoute.has(r) && !idsByRoute.get(r).has(hash)) R.fail(route, `ancla rota ${href} (no existe id="${hash}" en ${r})`);
    }
    // JSON-LD: BreadcrumbList e ItemList solo con páginas construidas (decisión 3; un eslabón a un 404 es error en Search Console)
    for (const n of graphNodes(jsonLd(root)).filter((x) => x['@type'] === 'BreadcrumbList' || x['@type'] === 'ItemList')) {
      for (const it of n.itemListElement ?? []) {
        const u = typeof it.item === 'string' ? it.item : it.item?.['@id'] ?? it.url;
        if (n['@type'] === 'BreadcrumbList' && !u && it.position < (n.itemListElement?.length ?? 0)) R.fail(route, `BreadcrumbList: el eslabón ${it.position} ("${it.name}") no tiene item`);
        const r = u ? normRoute(u) : null;
        if (r && SITEMAP_URLS.has(r) && !BUILT.has(r)) R.fail(route, `${n['@type']}: "${it.name ?? r}" apunta a una página sin construir (404 hoy): ${u}`);
      }
    }
    // R2/R8: la decisión de la plantilla coincide con la regla única (src/lib/indexacion.mjs)
    if (page) {
      const want = isNoindex(page, copyOf(page.id));
      if (want !== noindex) R.fail(route, `robots "${robots}" no coincide con la regla de indexación (${want ? 'debería llevar noindex' : 'debería ser indexable'})`);
    }
  }

  // Navegación del sitio (fuera de <main>): un solo aviso con la lista (decisión 3: la arquitectura se queda; --release la vuelve fatal)
  if (planned.size) {
    const list = [...planned].sort((a, b) => b[1].size - a[1].size).map(([r]) => r);
    R.warn(null, `encabezado/mega menú/hoja móvil/footer enlazan ${list.length} ruta(s) planeada(s) sin construir (404 hoy; decisión 3, se construyen al aprobar la ronda): ${list.join(' ')}`);
  }

  // WhatsApp: mensaje propio y único por página
  // globales = los que aparecen en todas las páginas (con 3 o más páginas); el resto debe ser propio de cada página
  const global = new Set();
  if (waByPage.size >= 3) {
    const all = [...waByPage.values()];
    for (const m of all[0]) if (all.every((s) => s.has(m))) global.add(m);
  }
  const owner = new Map();
  for (const [route, msgs] of waByPage) {
    const own = [...msgs].filter((m) => !global.has(m));
    if (!own.length && !robotsByRoute.get(route)) R.fail(route, 'sin mensaje de WhatsApp propio (solo los globales de navegación/pie)');
    for (const m of own) {
      if (owner.has(m) && owner.get(m) !== route) R.fail(route, `mensaje de WhatsApp repetido con ${owner.get(m)}: "${m.slice(0, 80)}"`);
      else owner.set(m, route);
    }
  }
  const waSeen = new Map();
  for (const p of SITEMAP) {
    const m = norm(p.secondaryCta?.waMessage ?? '');
    if (!m) { if (p.template !== 'T-404') R.warn(p.url, 'sitemap.json sin secondaryCta.waMessage'); continue; }
    if (waSeen.has(m)) R.fail(p.url, `waMessage de sitemap.json repetido con ${waSeen.get(m)}`);
    else waSeen.set(m, p.url);
  }
  // sitemap.json: títulos y metas (todas las páginas, también las no construidas)
  for (const p of SITEMAP) {
    if (p.template === 'T-404') continue;
    if ((p.title ?? '').length > 60) R.fail(p.url, `sitemap.json: title de ${p.title.length} caracteres`);
    if ((p.metaDescription ?? '').length > 155) R.fail(p.url, `sitemap.json: metaDescription de ${p.metaDescription.length} caracteres`);
  }
  const h1Seen = new Map();
  for (const p of SITEMAP) { const k = loose(p.h1); if (h1Seen.has(k)) R.fail(p.url, `sitemap.json: H1 repetido con ${h1Seen.get(k)}`); else h1Seen.set(k, p.url); }

  // Indexación: sitemap.xml, llms.txt, llms-full.txt (R8)
  const expected = indexablePages({ builtOnly: !opts.release }).map((p) => p.url);
  const noindexRoutes = [...robotsByRoute].filter(([, v]) => v).map(([r]) => r);
  let xmlUrls = null;
  if (!opts.url) {
    const idx = await loadText(opts, '/sitemap-index.xml');
    if (!idx) R.fail(null, 'falta dist/sitemap-index.xml');
    else {
      xmlUrls = [];
      for (const loc of idx.match(/<loc>([^<]+)<\/loc>/g) ?? []) {
        const file = new URL(loc.replace(/<\/?loc>/g, '')).pathname;
        const xml = await loadText(opts, file);
        for (const u of xml?.match(/<loc>([^<]+)<\/loc>/g) ?? []) xmlUrls.push(new URL(u.replace(/<\/?loc>/g, '')).pathname);
      }
    }
  } else {
    // en desarrollo no hay sitemap.xml: se evalúa el mismo filtro de astro.config.mjs (src/lib/indexacion.mjs) sobre las
    // rutas de sitemap.json que responden (todas, o las de --only)
    xmlUrls = pages.map((p) => p.route).filter((r) => r !== '/404' && !r.startsWith('/dev/') && !isNoindex(SITEMAP.find((p) => p.url === r), copyOf(SITEMAP.find((p) => p.url === r)?.id)));
    R.info('sitemap.xml: en modo --url se evalúa el filtro de astro.config.mjs (el XML solo existe tras el build)');
  }
  if (xmlUrls) {
    for (const r of noindexRoutes) if (xmlUrls.includes(r)) R.fail(r, 'página noindex dentro de sitemap.xml');
    const want = new Set(expected.filter(inScope)), got = new Set(xmlUrls.filter(inScope));
    for (const u of want) if (!got.has(u)) R.fail(u, 'página indexable fuera de sitemap.xml');
    for (const u of got) if (!want.has(u)) R.fail(u, 'sitemap.xml incluye una página que no es indexable/construida');
    R.info(`sitemap.xml: ${got.size} URL(s) · esperadas ${want.size} (indexables sin puerta pendiente${opts.release ? ', todas' : ', construidas'}${scope ? `; solo las ${scope.size} ruta(s) de --only` : ''})`);
  }
  const llms = await loadText(opts, '/llms.txt');
  const full = await loadText(opts, '/llms-full.txt');
  if (!llms) R.fail(null, 'falta /llms.txt');
  if (!full) R.fail(null, 'falta /llms-full.txt');
  if (llms) {
    const links = [...llms.matchAll(/\]\((https?:\/\/[^)]+)\)/g)].map((m) => normRoute(m[1])).filter(Boolean);
    const arrows = [...llms.matchAll(/→\s*(https?:\/\/\S+)/g)].map((m) => normRoute(m[1])).filter(Boolean);
    for (const u of new Set([...links, ...arrows])) {
      if (!SITEMAP_URLS.has(u)) R.fail('/llms.txt', `URL fuera de sitemap.json: ${u}`);
      else if (!BUILT.has(u)) R.fail('/llms.txt', `URL de una página sin construir: ${u}`);
      else if (noindexRoutes.includes(u) || !expected.includes(u)) R.fail('/llms.txt', `URL no indexable (noindex o puerta pendiente): ${u}`);
    }
    for (const u of expected) if (!links.includes(u)) R.fail('/llms.txt', `falta la página indexable ${u}`);
    const vk = llms.match(/VKTOR™:([^\n]+)/);
    if (!vk) R.fail('/llms.txt', 'sin la expansión de la metodología VKTOR™');
    else for (const f of VKTOR_OK) if (!vk[1].includes(f)) R.fail('/llms.txt', `VKTOR™ sin la fase ${f}`);
    for (const m of llms.matchAll(/USD\s?\d[\d.,]*/g)) {
      const around = llms.slice(Math.max(0, m.index - 6), m.index + 20).toLowerCase();
      if (!around.includes(M.PRICE_FROM.toLowerCase().replace(/^desde /, '').slice(0, 7))) R.fail('/llms.txt', `precio distinto de PRICE_FROM: "${around}"`);
    }
    if (!llms.includes(M.PRICE_FROM)) R.fail('/llms.txt', `no menciona el precio oficial "${M.PRICE_FROM}"`);
    R.info(`llms.txt: ${new Set(links).size} página(s) enlazada(s)`);
  }
  if (full) {
    const urls = [...full.matchAll(/^URL:\s*(\S+)/gm)].map((m) => normRoute(m[1]));
    for (const r of noindexRoutes) if (urls.includes(r)) R.fail('/llms-full.txt', `incluye la página noindex ${r}`);
    for (const u of expected) if (!urls.includes(u)) R.fail('/llms-full.txt', `falta el texto de ${u}`);
    for (const u of urls) if (!expected.includes(u)) R.fail('/llms-full.txt', `incluye ${u}, que no es indexable/construida`);
    if (/\{\{[^}]+\}\}/.test(full)) R.fail('/llms-full.txt', 'quedan tokens {{…}} sin resolver');
  }
  // (b) /indice.json (⌘K): sin landings ocultas ni preguntas que solo viven en ellas (R17)
  const indice = await loadText(opts, '/indice.json');
  if (!indice) R.fail(null, 'falta /indice.json');
  else {
    try {
      const j = JSON.parse(indice);
      const hid = (u) => { const r = normRoute(u); return !!r && (HIDDEN.has(r) || r.startsWith('/agendar/')); };
      for (const p of j.pages ?? []) if (hid(p.u)) R.fail('/indice.json', `incluye la landing oculta ${p.u}`);
      const faqFile = join(ROOT, 'src/data/faq.json');
      const bankRaw = existsSync(faqFile) ? JSON.parse(readFileSync(faqFile, 'utf8')) : [];
      const bank = new Map((Array.isArray(bankRaw) ? bankRaw : bankRaw.items ?? []).map((f) => [f.id, f]));
      for (const f of j.faq ?? []) {
        if (hid(f.u)) { R.fail('/indice.json', `la pregunta ${f.id} lleva a una landing oculta (${f.u})`); continue; }
        const pg = bank.get(f.id)?.pages ?? [];
        if (pg.length && pg.every((u) => hid(u))) R.fail('/indice.json', `la pregunta ${f.id} solo vive en landings ocultas (${pg.join(' ')})`);
      }
      if (/agenda\.ingeniak\.tech/i.test(indice)) R.fail('/indice.json', 'menciona agenda.ingeniak.tech');
      R.info(`/indice.json: ${(j.pages ?? []).length} página(s) · ${(j.faq ?? []).length} pregunta(s)`);
    } catch (e) { R.fail('/indice.json', `JSON inválido: ${e.message}`); }
  }
  const robots = await loadText(opts, '/robots.txt');
  if (!robots) R.fail(null, 'falta /robots.txt');
  else {
    if (!/^Sitemap:\s*https:\/\/ingeniak\.mx\/sitemap-index\.xml\s*$/m.test(robots)) R.fail('/robots.txt', 'sin "Sitemap: https://ingeniak.mx/sitemap-index.xml"');
    // cada grupo de User-agent repite Disallow: /dev/ (un grupo propio anula al de *; §8.4)
    for (const g of robots.split(/\n(?=User-agent:)/i).filter((x) => /^User-agent:/im.test(x))) {
      const ua = g.match(/^User-agent:\s*(.+)$/im)[1].trim();
      if (!/^Disallow:\s*\/dev\/\s*$/im.test(g)) R.fail('/robots.txt', `el grupo "User-agent: ${ua}" no repite "Disallow: /dev/"`);
    }
  }
  // vercel.json: redirecciones 301 a rutas de sitemap.json, sin comodines ni cadenas (§8.4, R8)
  try {
    const v = JSON.parse(readFileSync(join(ROOT, 'vercel.json'), 'utf8'));
    const src = new Set((v.redirects ?? []).map((r) => r.source));
    const unbuiltDest = new Set();
    for (const r of v.redirects ?? []) {
      // (c) el destino se compara sin el ancla (/cotiza → /contacto/#cotizar se valida como /contacto/)
      const dest = String(r.destination).replace(/#.*$/, '');
      if (/[*:()]/.test(r.source)) R.fail('vercel.json', `redirección con comodín: ${r.source}`);
      if (r.statusCode !== 301 && r.permanent !== true) R.fail('vercel.json', `redirección no permanente: ${r.source}`);
      if (!SITEMAP_URLS.has(dest)) R.fail('vercel.json', `destino fuera de sitemap.json: ${r.source} → ${r.destination}`);
      else if (!BUILT.has(dest)) unbuiltDest.add(dest);
      if (src.has(dest) || src.has(dest.replace(/\/$/, ''))) R.fail('vercel.json', `cadena de redirecciones: ${r.source} → ${r.destination}`);
    }
    if (unbuiltDest.size) R.warn('vercel.json', `${unbuiltDest.size} destino(s) de redirección sin construir (404 hoy): ${[...unbuiltDest].join(' ')}`);
    for (const p of SITEMAP) if (src.has(p.url) || src.has(p.url.replace(/\/$/, ''))) R.fail('vercel.json', `una página vigente se redirige: ${p.url}`);
  } catch (e) { R.fail('vercel.json', `no se pudo leer: ${e.message}`); }

  // Conteo de lanzamiento (R8): todas las indexables sin puerta pendiente deben existir
  const launch = indexablePages({ builtOnly: false });
  const missing = launch.filter((p) => !BUILT.has(p.url));
  if (missing.length) R.warn(null, `${missing.length} de ${launch.length} páginas indexables siguen sin construir (puerta R12: copy aprobado + plantilla)`);
  R.info(`${pages.length} página(s) revisada(s) · H1 únicos: ${h1s.size}`);
  return R.done();
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const r = await run(parseArgs());
  process.exit(r.fails ? 1 : 0);
}
