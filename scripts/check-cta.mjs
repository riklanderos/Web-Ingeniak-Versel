// scripts/check-cta.mjs — guarda del sistema de CTA (CAMBIO-COTIZAR §6.2; ESPEC §12.6 R15–R17).
// 1. Todas las páginas (incluidas 404 y ocultas): exactamente un <dialog id="cotizar" data-cotizar-dialog>.
// 2. Públicas (hidden !== true):
//    · todo a[data-primary] dentro de <main> es .btn con data-cotizar, href /contacto/#cotizar (o #cotizar en /contacto/) y
//      texto "Cotizar proyecto";
//    · [data-hdr-cta] y .mbar__cta llevan data-cotizar;
//    · ningún href del documento apunta a /discovery/, /power-session/, /agendar/, #agenda ni agenda.ingeniak.tech;
//    · ningún .btn-micro dice "Google Meet" ni "30 min";
//    · ni <title>, meta description, og:/twitter: title/description ni los name/description/headline del JSON-LD (lo que
//      ven Google, ⌘K, llms.txt y las tarjetas al compartir) llaman a reservar la llamada de v1 (STALE_META_RX). La misma
//      regla se aplica en la fuente: title y metaDescription de toda página pública de sitemap.json.
// 3. Landings (/discovery/, /power-session/): todo a[data-primary] fuera de [data-agenda] va a #agenda con data-section;
//    exactamente un [data-agenda="<tipo>"] (el de la página) dentro de section#agenda; ningún .btn[data-cotizar] y al menos un
//    [data-cotizar] (.lnk); ningún enlace a agenda.ingeniak.tech; robots con noindex;
//    orden de riklanderos.tech (portada → VSL → reserva): section#video antes de section#agenda; sin #video es puerta del
//    cliente (CAMBIO §9-4, autorizar la descarga del VSL; fatal con --release); og:image propia (/img/og/<id>.jpg), nunca la
//    genérica: son las tarjetas que se ven al compartir el enlace de la campaña.
// 4. /agendar/confirmado/: [data-confirmado] presente, ningún [data-primary], robots con noindex.
// 5. Todo data-cotizar-servicio / data-cotizar-industria usa slugs de src/data/cotizar.json.
// id="cotizar": solo el <dialog>. Excepción documentada (peticiones.md · Cotizar · orquestador, decisión 1): en /contacto/ la
// sección real #cotizar (respaldo sin JS, §1.1-3) comparte el id con el diálogo y debe ir ANTES en el DOM para que
// /contacto/#cotizar sin JS lleve a ella; cualquier otro id="cotizar" falla.
// Uso: node scripts/check-cta.mjs [--url http://127.0.0.1:4321] [--only /,/contacto/] [--release]
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import {
  ROOT, SITEMAP, parseArgs, reporter, loadPages, onlyRoutes, parseHTML, find, findAll, closest, hasClass, textOf, norm, metaContent,
  normRoute, isHiddenPage, jsonLd, jsonStrings, graphNodes,
} from './_html.mjs';

const QUOTE_LABEL = 'Cotizar proyecto';
const QUOTE_HREF = '/contacto/#cotizar';
const LANDINGS = { '/discovery/': 'discovery', '/power-session/': 'power' };
const CONFIRM = '/agendar/confirmado/';
/** Llamado a reservar la llamada de v1 en metadatos de páginas públicas (revisión del 2026-10-20: /kommo/ decía "Agenda tu
 *  diagnóstico."). Estrecho a propósito: "agenda 24/7", "agendan citas" o "tu agenda llena" describen lo que hace el agente
 *  del cliente y no fallan; sí fallan "agenda/reserva tu|una|mi diagnóstico|llamada|sesión…", "Discovery", "Power Session",
 *  "sin costo", "30 min", "diagnóstico gratuito" y "llamada gratuita|de 30". */
const STALE_META_RX = /\b(?:agend[ae]r?|reserv[ae]r?)\s+(?:tu|una|mi)\s+(?:diagn[oó]stico|llamada|sesi[oó]n|discovery|power|cita\s+(?:gratuita|sin\s+costo))|\bdiscovery(?:\s+session)?\b|\bpower\s+session\b|\bsin\s+costo\b|\b30\s?min(?:utos)?\b|\bdiagn[oó]stico\s+(?:gratuito|gratis|sin\s+costo)\b|\bllamada\s+(?:gratuita|gratis|de\s+30)\b/i;
/** Textos de cabecera que se publican fuera de la página (buscador, tarjetas, ⌘K, llms.txt). */
function metaTexts(root) {
  const t = find(root, (x) => x.tag === 'title');
  const out = [['<title>', t ? norm(textOf(t)) : '']];
  for (const k of ['description', 'og:title', 'og:description', 'twitter:title', 'twitter:description']) out.push([k, metaContent(root, k) ?? '']);
  for (const node of graphNodes(jsonLd(root))) for (const [p, v] of jsonStrings(node)) {
    if (/acceptedAnswer|mainEntity\[\d+\]\.name$/.test(p)) continue; // preguntas y respuestas del FAQPage: las revisa check-contenido
    if (/(?:^|\.)(?:description|name|headline)$/.test(p)) out.push([`JSON-LD ${p}`, v]);
  }
  return out;
}

/** Slugs válidos para el prefill (src/data/cotizar.json → servicios[].slug / industrias[].slug). */
function catalog() {
  const p = join(ROOT, 'src/data/cotizar.json');
  if (!existsSync(p)) return null;
  try {
    const c = JSON.parse(readFileSync(p, 'utf8'));
    return { servicio: new Set((c.servicios ?? []).map((x) => x.slug)), industria: new Set((c.industrias ?? []).map((x) => x.slug)) };
  } catch { return null; }
}
/** ¿El href apunta a una landing oculta, a /agendar/…, a #agenda o a la agenda externa de v1? */
function forbiddenHref(href) {
  const h = String(href ?? '').trim();
  if (!h) return null;
  if (/agenda\.ingeniak\.tech/i.test(h)) return 'agenda.ingeniak.tech';
  if (/^#agenda\b/i.test(h)) return '#agenda';
  const r = normRoute(h);
  if (!r) return null;
  if (r === '/discovery/' || r === '/power-session/' || r.startsWith('/agendar/')) return r;
  return null;
}
const label = (el) => norm(textOf(el)).slice(0, 60) || el.attrs['aria-label'] || '';
const where = (el) => { const s = closest(el, (x) => x.tag === 'section' && x.attrs.id); return s ? ` en #${s.attrs.id}` : ''; };

export async function run(opts) {
  const R = reporter('check-cta', opts);
  const CAT = catalog();
  if (!CAT) R.warn(null, 'no existe src/data/cotizar.json: la regla 5 (slugs de prefill) no se puede revisar');
  const pages = await loadPages({ ...opts, dev: false });
  // El 404 responde 404 en el servidor de desarrollo y loadPages lo salta: aquí se pide una ruta inexistente (en desarrollo,
  // /404 sirve la página genérica de Astro; cualquier otra ruta inexistente sirve src/pages/404.astro)
  const scope = onlyRoutes(opts);
  if (opts.url && !pages.some((p) => p.route === '/404') && (!scope || scope.has('/404'))) {
    try {
      const res = await fetch(`${opts.url}/__check-cta-sin-ruta__/`);
      const html = await res.text();
      if (/<html[\s>]/i.test(html)) pages.push({ route: '/404', html, page: SITEMAP.find((p) => p.url === '/404') ?? null, source: `${opts.url}/__check-cta-sin-ruta__/` });
    } catch {}
  }
  let n = 0;
  for (const pg of pages) {
    const root = parseHTML(pg.html);
    const route = pg.route;
    const page = pg.page;
    const hidden = isHiddenPage(page);
    n++;
    // ── 1. un solo modal
    const dialogs = findAll(root, (x) => x.tag === 'dialog' && x.attrs.id === 'cotizar' && 'data-cotizar-dialog' in x.attrs);
    if (dialogs.length !== 1) R.fail(route, `${dialogs.length} <dialog id="cotizar" data-cotizar-dialog> (debe haber exactamente uno)`);
    const stray = findAll(root, (x) => 'data-cotizar-dialog' in x.attrs && !(x.tag === 'dialog' && x.attrs.id === 'cotizar'));
    if (stray.length) R.fail(route, `data-cotizar-dialog fuera de <dialog id="cotizar"> (${stray.map((x) => `<${x.tag}${x.attrs.id ? `#${x.attrs.id}` : ''}>`).join(', ')})`);
    const dupIds = findAll(root, (x) => x.attrs.id === 'cotizar');
    if (dupIds.length > 1) {
      const isContactException = route === '/contacto/' && dupIds.length === 2 && dupIds[0].tag === 'section' && dupIds[1].tag === 'dialog';
      if (isContactException) R.info(`${route} · id="cotizar" en <section> (respaldo sin JS) y <dialog>: excepción documentada (peticiones.md · Cotizar · orquestador)`);
      else R.fail(route, `id="cotizar" repetido ${dupIds.length} veces (${dupIds.map((x) => `<${x.tag}>`).join(', ')})${route === '/contacto/' ? ': en /contacto/ solo se acepta <section id="cotizar"> antes del <dialog>' : ''}`);
    }
    // ── 5. slugs de prefill (todas las páginas)
    if (CAT) for (const el of findAll(root, (x) => 'data-cotizar-servicio' in x.attrs || 'data-cotizar-industria' in x.attrs)) {
      for (const k of ['servicio', 'industria']) {
        const v = el.attrs[`data-cotizar-${k}`];
        if (v == null || v === '') continue;
        for (const slug of v.split(/\s+/).filter(Boolean)) if (!CAT[k].has(slug)) R.fail(route, `data-cotizar-${k}="${v}": "${slug}" no está en src/data/cotizar.json → ${k === 'servicio' ? 'servicios' : 'industrias'} (<${el.tag}>${where(el)})`);
      }
    }
    const robots = metaContent(root, 'robots') ?? '';
    const main = find(root, (x) => x.tag === 'main');
    if (!page && route !== '/404') continue; // ruta fuera de sitemap.json: check-seo la reporta
    if (!hidden) {
      // ── 2. públicas
      for (const a of findAll(main ?? root, (x) => x.tag === 'a' && 'data-primary' in x.attrs)) {
        const t = norm(textOf(a));
        const href = (a.attrs.href ?? '').trim();
        const okHref = href === QUOTE_HREF || (route === '/contacto/' && href === '#cotizar');
        const errs = [];
        if (!hasClass(a, 'btn')) errs.push('sin clase .btn');
        if (!('data-cotizar' in a.attrs)) errs.push('sin data-cotizar');
        if (!okHref) errs.push(`href "${href}" (debe ser ${route === '/contacto/' ? '#cotizar o ' : ''}${QUOTE_HREF})`);
        if (t !== QUOTE_LABEL) errs.push(`texto "${t.slice(0, 50)}" (debe ser "${QUOTE_LABEL}")`);
        if (errs.length) R.fail(route, `primario${where(a)}: ${errs.join(' · ')}`);
      }
      for (const el of findAll(root, (x) => 'data-hdr-cta' in x.attrs)) if (!('data-cotizar' in el.attrs)) R.fail(route, `CTA del encabezado ([data-hdr-cta] "${label(el)}") sin data-cotizar`);
      for (const el of findAll(root, (x) => hasClass(x, 'mbar__cta'))) if (!('data-cotizar' in el.attrs)) R.fail(route, `barra móvil (.mbar__cta "${label(el)}") sin data-cotizar`);
      const seen = new Set();
      for (const el of findAll(root, (x) => x.attrs.href != null)) {
        const f = forbiddenHref(el.attrs.href);
        if (!f) continue;
        const k = `${f}|${el.attrs.href}`;
        if (seen.has(k)) continue;
        seen.add(k);
        R.fail(route, `enlace prohibido en una página pública → ${el.attrs.href} (<${el.tag}> "${label(el)}"${where(el)}) · R17`);
      }
      for (const el of findAll(root, (x) => hasClass(x, 'btn-micro'))) {
        const t = norm(textOf(el));
        if (/google\s?meet|\b30\s?min/i.test(t)) R.fail(route, `.btn-micro con la microcopia de la Discovery${where(el)}: "${t.slice(0, 80)}" (debe ser "Sin compromiso · Te contactamos por WhatsApp y correo")`);
      }
      for (const [k, v] of metaTexts(root)) {
        const m = norm(v).match(STALE_META_RX);
        if (m) R.fail(route, `${k} invita a reservar la llamada de v1 ("${m[0]}"): "${norm(v).slice(0, 110)}" · el primario público es "${QUOTE_LABEL}" (R15)`);
      }
    } else if (LANDINGS[route]) {
      // ── 3. landings ocultas
      const tipo = LANDINGS[route];
      for (const a of findAll(root, (x) => x.tag === 'a' && 'data-primary' in x.attrs && !closest(x, (y) => 'data-agenda' in y.attrs))) {
        const href = (a.attrs.href ?? '').trim();
        if (href !== '#agenda') R.fail(route, `primario fuera de la reserva${where(a)} con href "${href}" (debe ser #agenda): "${label(a)}"`);
        if (!a.attrs['data-section']) R.fail(route, `primario fuera de la reserva${where(a)} sin data-section: "${label(a)}"`);
      }
      const ag = findAll(root, (x) => 'data-agenda' in x.attrs);
      if (ag.length !== 1) R.fail(route, `${ag.length} componente(s) de reserva [data-agenda] (debe haber exactamente uno, data-agenda="${tipo}")`);
      for (const el of ag) {
        if (el.attrs['data-agenda'] !== tipo) R.fail(route, `[data-agenda="${el.attrs['data-agenda']}"] (en ${route} debe ser "${tipo}")`);
        if (!closest(el, (x) => x.tag === 'section' && x.attrs.id === 'agenda')) R.fail(route, '[data-agenda] fuera de section#agenda');
      }
      for (const el of findAll(root, (x) => hasClass(x, 'btn') && 'data-cotizar' in x.attrs)) R.fail(route, `.btn[data-cotizar] en una landing (la cotización va como .lnk, nunca azul): "${label(el)}"${where(el)}`);
      if (!findAll(root, (x) => 'data-cotizar' in x.attrs && !('data-cotizar-dialog' in x.attrs)).length) R.fail(route, 'sin ningún [data-cotizar] (.lnk "Cotizar proyecto" en el cierre o el footer mínimo)');
      for (const el of findAll(root, (x) => x.attrs.href != null && /agenda\.ingeniak\.tech/i.test(x.attrs.href))) R.fail(route, `enlace a agenda.ingeniak.tech: ${el.attrs.href}`);
      if (!/noindex/i.test(robots)) R.fail(route, `robots "${robots || '—'}" sin noindex (landing oculta)`);
      const order = findAll(main ?? root, (x) => x.tag === 'section' && x.attrs.id && closest(x.parent, (y) => y.tag === 'section') == null).map((x) => x.attrs.id);
      const iV = order.indexOf('video'), iA = order.indexOf('agenda');
      if (iV < 0) R.gate(route, 'sin VSL (section#video) antes de la reserva: el flujo de riklanderos.tech es portada → VSL → "Reserva en 3 pasos" (CAMBIO-COTIZAR §9-4, falta autorizar la descarga del VSL; lanzamiento.md)');
      else if (iA >= 0 && iV > iA) R.fail(route, `section#video después de section#agenda (orden: ${order.join(' → ')}); debe ser portada → VSL → reserva`);
      const og = metaContent(root, 'og:image') ?? '';
      if (!og) R.fail(route, 'sin og:image');
      else if (/\/img\/og(?:\/ingeniak|-ingeniak)\.jpg$/.test(og)) R.fail(route, `og:image genérica (${og}): una landing de campaña lleva su tarjeta propia, /img/og/${page?.id ?? '<id>'}.jpg (npm run og -- ${page?.id ?? '<id>'})`);
    } else if (route === CONFIRM) {
      // ── 4. confirmación
      if (!findAll(root, (x) => 'data-confirmado' in x.attrs).length) R.fail(route, 'sin [data-confirmado]');
      for (const el of findAll(root, (x) => 'data-primary' in x.attrs)) R.fail(route, `[data-primary] en la confirmación: "${label(el)}"${where(el)}`);
      if (!/noindex/i.test(robots)) R.fail(route, `robots "${robots || '—'}" sin noindex`);
    } else {
      // otra oculta futura: al menos noindex
      if (!/noindex/i.test(robots)) R.fail(route, `robots "${robots || '—'}" sin noindex (página oculta)`);
    }
  }
  // ── 2 (fuente). title y metaDescription de las páginas públicas de sitemap.json (también las que aún no se construyen)
  for (const p of SITEMAP) {
    if (!p?.url || isHiddenPage(p) || (scope && !scope.has(p.url))) continue;
    for (const [k, v] of [['title', p.title], ['metaDescription', p.metaDescription]]) {
      const m = norm(v).match(STALE_META_RX);
      if (m) R.fail(p.url, `sitemap.json → ${k} invita a reservar la llamada de v1 ("${m[0]}"): "${norm(v).slice(0, 110)}" (R15)`);
    }
  }
  // Las rutas de las reglas 3 y 4 deben existir (salvo con --only que no las incluya)
  for (const r of [...Object.keys(LANDINGS), CONFIRM]) if ((!scope || scope.has(r)) && !pages.some((p) => p.route === r)) R.fail(r, 'la ruta no respondió 200 (no se pudo revisar)');
  R.info(`${n} página(s) revisada(s)`);
  return R.done();
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const r = await run(parseArgs());
  process.exit(r.fails ? 1 : 0);
}
