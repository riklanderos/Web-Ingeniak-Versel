// scripts/blog-nuevo.mjs — convierte un brief de artículo (materiales/briefs/*.md) en:
//   1. una entrada T-ARTICLE nueva en src/data/sitemap.json,
//   2. su copy en src/content/paginas/art-<id>.json con estado "borrador" (R1: solo "aprobado" publica),
//   3. las FAQ nuevas en src/data/faq.json con validar: true (no se publican hasta aprobarse).
// El formato del brief es el de materiales/briefs/_PLANTILLA.md (mismo que la guía del equipo SEO).
// Uso: node scripts/blog-nuevo.mjs materiales/briefs/<archivo>.md [--dry]
//   --dry  valida el brief y muestra el resumen sin escribir nada.
// El script valida medidas (título ≤65, meta title ≤60, meta description ≤155, respuesta 40–60 palabras),
// que cada fuente tenga URL y fecha, y avisa de toda cifra escrita a mano (check-cifras tumba el build;
// las cifras de Ingeniak van como token {{metric:ID}}/{{price}} y las de terceros se describen y enlazan).
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(fileURLToPath(import.meta.url), '..', '..');
const SITEMAP = join(ROOT, 'src/data/sitemap.json');
const FAQ = join(ROOT, 'src/data/faq.json');
const PAGINAS = join(ROOT, 'src/content/paginas');
const WA_NUM = '523321017799';
const MIN_WORDS = 1200; // copy.minWords del artículo nuevo (check-contenido)

// ───────────────────────── utilidades ─────────────────────────
const strip = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '');
const kebab = (s) =>
  strip(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
const countWords = (s) => (String(s).match(/[\p{L}\p{N}]+(?:['’][\p{L}]+)?/gu) ?? []).length;
const firstSentence = (s) => (String(s).match(/^[^.!?]+[.!?]?/)?.[0] ?? String(s)).trim();
const STOP = new Set(['de','la','el','los','las','un','una','para','por','con','que','como','cuanto','cuanta','cual','del','al','en','y','o','tu','su','mi','es','se','a','mexico']);

const errors = [];
const warns = [];
const fail = (m) => errors.push(m);
const warn = (m) => warns.push(m);

// ───────────────────────── 1. leer el brief ─────────────────────────
const args = process.argv.slice(2);
const DRY = args.includes('--dry');
const briefPath = args.find((a) => !a.startsWith('--'));
if (!briefPath || !existsSync(briefPath)) {
  console.error('Uso: node scripts/blog-nuevo.mjs materiales/briefs/<archivo>.md [--dry]');
  process.exit(2);
}
const raw = readFileSync(briefPath, 'utf8').replace(/\r\n/g, '\n');

// Campos de una línea y campos de bloque (el bloque corre hasta el siguiente campo conocido).
const FIELDS = [
  ['titulo', /^t[ií]tulo( propuesto)?\s*:/i, 'line'],
  ['slug', /^slug( propuesto)?\s*:/i, 'line'],
  ['keyword', /^keyword principal\s*:/i, 'line'],
  ['secundarias', /^keywords? secundarias?\s*:/i, 'block'],
  ['intencion', /^intenci[oó]n( de b[uú]squeda)?\s*:/i, 'line'],
  ['buyer', /^buyer( ?\/ ?etapa)?\s*:/i, 'line'],
  ['metaTitle', /^meta ?title( sugerido)?\s*:/i, 'line'],
  ['metaDescription', /^meta ?descrip(tion|ci[oó]n)\s*:/i, 'block'],
  ['respuesta', /^respuesta directa\s*:/i, 'block'],
  ['outline', /^outline\s*:/i, 'block'],
  ['faqs', /^faqs?( propuestas)?\s*:/i, 'block'],
  ['fuentes', /^fuentes\s*:/i, 'block'],
  ['internos', /^enlaces internos( sugeridos)?\s*:/i, 'block'],
  ['cta', /^cta( del art[ií]culo)?\s*:/i, 'line'],
  ['categoria', /^categor[ií]a\s*:/i, 'line'],
  ['notas', /^notas\s*:/i, 'block'],
];

const lines = raw.split('\n');
const brief = {};
let current = null;
for (const line of lines) {
  const clean = line.replace(/^[>*\s]*(\*\*)?/, '').replace(/\*\*$/, '');
  const hit = FIELDS.find(([, rx]) => rx.test(clean));
  if (hit) {
    const [key, rx, kind] = hit;
    const rest = clean.replace(rx, '').trim();
    if (kind === 'line') { brief[key] = rest; current = null; }
    else { brief[key] = rest ? [rest] : []; current = key; }
    continue;
  }
  if (current && line.trim()) brief[current].push(line.replace(/\s+$/, ''));
  else if (line.trim() && !line.startsWith('#')) current = null;
}
for (const k of ['metaDescription', 'respuesta', 'notas'])
  if (Array.isArray(brief[k])) brief[k] = brief[k].join(' ').replace(/\s+/g, ' ').trim();

// ───────────────────────── 2. validar el brief ─────────────────────────
for (const [k, label] of [
  ['titulo', 'Título propuesto'], ['slug', 'Slug propuesto'], ['keyword', 'Keyword principal'],
  ['metaTitle', 'Meta title sugerido'], ['metaDescription', 'Meta description'],
  ['respuesta', 'Respuesta directa'], ['outline', 'Outline'],
]) if (!brief[k] || !brief[k].length) fail(`Falta el campo "${label}" en el brief.`);

if (brief.titulo && brief.titulo.length > 65) fail(`Título de ${brief.titulo.length} caracteres (máx. 65): "${brief.titulo}"`);
if (brief.metaTitle && brief.metaTitle.length > 60) fail(`Meta title de ${brief.metaTitle.length} caracteres (máx. 60).`);
if (brief.metaDescription && brief.metaDescription.length > 155) fail(`Meta description de ${brief.metaDescription.length} caracteres (máx. 155).`);
if (brief.respuesta) {
  const n = countWords(brief.respuesta.replace(/\{\{[^}]+\}\}/g, 'x'));
  if (n < 40 || n > 60) fail(`Respuesta directa de ${n} palabras (debe tener 40–60).`);
}
let url = (brief.slug ?? '').trim();
if (url && !url.startsWith('/')) url = `/${url}`;
if (url && !url.endsWith('/')) url = `${url}/`;
if (url && !/^\/blog\/[a-z0-9-]+\/$/.test(url)) fail(`Slug inválido: "${brief.slug}" (forma esperada: /blog/<kebab-case>/).`);

const sm = JSON.parse(readFileSync(SITEMAP, 'utf8'));
const pages = Object.values(sm);
if (pages.some((p) => p.url === url)) fail(`Ya existe una página con la URL ${url}.`);

// id: art-<dos o tres palabras significativas del slug>
const slugWords = url.split('/').filter(Boolean).pop()?.split('-').filter((w) => !STOP.has(w)) ?? [];
let id = `art-${slugWords.slice(0, 2).join('-') || 'nuevo'}`;
let n = 2;
while (pages.some((p) => p.id === id) || existsSync(join(PAGINAS, `${id}.json`))) id = `art-${slugWords.slice(0, 2).join('-')}-${n++}`;

// outline → bloques
const blocks = [];
const h2s = [];
if (Array.isArray(brief.outline)) {
  let ul = null;
  const flushUl = () => { if (ul?.items.length) blocks.push(ul); ul = null; };
  for (const lRaw of brief.outline) {
    const l = lRaw.trim();
    const h2 = l.match(/^(?:##\s*|H2[.:·\s-]\s*|H2\s+)(.+)/i);
    const h3 = l.match(/^(?:###\s*|H3[.:·\s-]\s*|H3\s+)(.+)/i);
    if (h2) {
      flushUl();
      const text = h2[1].trim();
      const bid = kebab(text).split('-').filter((w) => !STOP.has(w)).slice(0, 4).join('-') || kebab(text).slice(0, 30);
      const rail = text.split(/\s+/).slice(0, 4).join(' ');
      const b = { variant: 'h2', id: bid, text, rail };
      blocks.push(b); h2s.push(b);
    } else if (h3) { flushUl(); blocks.push({ variant: 'h3', text: h3[1].trim() }); }
    else if (/^[-•]\s+/.test(l)) { ul ??= { variant: 'ul', items: [] }; ul.items.push(l.replace(/^[-•]\s+/, '')); }
    else { flushUl(); blocks.push(l); }
  }
  flushUl();
}
if (!h2s.length) fail('El outline no trae ningún H2 (líneas "H2 …" o "## …").');
// CTA intermedio después del segundo H2 (o al final del primero si solo hay uno)
const anchor = h2s[Math.min(1, h2s.length - 1)];
const next = blocks.findIndex((b, i) => i > blocks.indexOf(anchor) && b?.variant === 'h2');
blocks.splice(next === -1 ? blocks.length : next, 0, { variant: 'cta-medio' });

// FAQs → banco (ids B01, B02, …)
const faqBank = JSON.parse(readFileSync(FAQ, 'utf8'));
const faqList = Array.isArray(faqBank) ? faqBank : faqBank.items;
let bMax = Math.max(0, ...faqList.map((f) => Number(f.id.match(/^B(\d+)$/)?.[1] ?? 0)));
const newFaqs = [];
const faqIds = [];
if (Array.isArray(brief.faqs)) {
  let q = null, a = [];
  const push = () => {
    if (!q) return;
    const ans = a.join(' ').replace(/\s+/g, ' ').trim();
    const wq = countWords(ans.replace(/\{\{[^}]+\}\}/g, 'x'));
    if (wq < 40 || wq > 80) fail(`FAQ "${q}": respuesta de ${wq} palabras (el banco pide 40–80; la guía, 40–60).`);
    else if (wq > 60) warn(`FAQ "${q}": ${wq} palabras (la guía pide 40–60).`);
    const dup = faqList.find((f) => strip(f.q.toLowerCase()) === strip(q.toLowerCase()));
    if (dup) { faqIds.push(dup.id); warn(`FAQ "${q}" ya existe en el banco como ${dup.id}; se cita la respuesta existente (consistencia).`); }
    else {
      const idF = `B${String(++bMax).padStart(2, '0')}`;
      const s1 = firstSentence(ans);
      const short = countWords(s1) <= 25 ? s1 : `${ans.split(/\s+/).slice(0, 22).join(' ')}…`;
      newFaqs.push({ id: idF, q, a: ans, short, pages: [url], categoria: brief.categoria || 'Blog', validar: true, editada: false });
      faqIds.push(idF);
    }
    q = null; a = [];
  };
  for (const lRaw of brief.faqs) {
    const l = lRaw.trim().replace(/^[-•]\s*/, '');
    const mq = l.match(/^P(?:regunta)?\s*[:.]\s*(.+)/i) || (l.startsWith('¿') && /\?$/.test(l) ? [null, l] : null);
    const mr = l.match(/^R(?:espuesta)?\s*[:.]\s*(.+)/i);
    if (mq) { push(); q = mq[1].trim(); }
    else if (mr) a.push(mr[1].trim());
    else if (q) a.push(l);
  }
  push();
}
if (!faqIds.length) warn('El brief no trae FAQs; el artículo saldrá sin sección de preguntas (se puede completar después).');

// Fuentes
const fuentes = [];
if (Array.isArray(brief.fuentes)) {
  for (const lRaw of brief.fuentes) {
    const l = lRaw.trim().replace(/^[-•]\s*/, '').replace(/^\d+[.)]\s*/, '');
    if (!l) continue;
    const urlM = l.match(/https?:\/\/\S+/);
    const dateM = l.match(/(\d{4}-\d{2}-\d{2})/);
    if (!urlM) { fail(`Fuente sin URL: "${l}"`); continue; }
    const href = urlM[0].replace(/[),.;]+$/, '');
    const before = l.slice(0, l.indexOf(urlM[0])).replace(/[—–|,(]+\s*$/, '').trim();
    const [title, publisher] = before.split(/\s+[—–|]\s+/);
    fuentes.push({
      title: (title || href).trim(), publisher: (publisher || '').trim() || undefined, href,
      consultado: dateM?.[1] ?? null,
      nota: l.slice(l.indexOf(urlM[0]) + urlM[0].length).replace(/\d{4}-\d{2}-\d{2}/, '').replace(/\(?consultad[oa][^)]*\)?/i, '').replace(/^[\s—–|,).;]+/, '').trim() || undefined,
    });
    if (!dateM) fail(`Fuente sin fecha de consulta (AAAA-MM-DD): "${l.slice(0, 80)}"`);
  }
}
if (!fuentes.length) warn('El brief no trae fuentes. Si el artículo menciona cualquier dato o cifra, el deploy fallará sin su fuente.');

// Enlaces internos → páginas construidas del sitemap
const internos = [];
if (Array.isArray(brief.internos)) {
  for (const l of brief.internos) for (const m of l.matchAll(/\/[a-z0-9/-]+\//g)) {
    const pg = pages.find((p) => p.url === m[0]);
    if (pg) { if (!internos.some((x) => x.url === pg.url)) internos.push(pg); }
    else warn(`Enlace interno "${m[0]}" no existe en el sitemap; se omite.`);
  }
}
if (!internos.length) warn('Sin enlaces internos válidos; "relacionados" se queda con páginas por defecto.');
const relFallback = ['/servicios/agentes-ia-whatsapp/', '/kain/', '/casos/clinica-dental-monterrey/']
  .map((u) => pages.find((p) => p.url === u)).filter(Boolean);
const relacionados = [...internos, ...relFallback.filter((p) => !internos.includes(p))].slice(0, 3);

// Cifras escritas a mano en el texto del brief (check-cifras tumba el build)
const visible = [brief.respuesta, ...(brief.outline ?? []), ...(brief.faqs ?? [])].join('\n');
const cifras = visible.match(/\d+(?:[.,]\d+)?\s?(?:%|×|x\b)|USD\s?\d|\$\s?\d|\d+\s(?:citas|procesos|leads|clientes|min\b|seg\b)/gi);
if (cifras) warn(`Cifras escritas a mano en el brief (${[...new Set(cifras)].join(' · ')}). Las de Ingeniak van como token {{metric:ID}}/{{price}}; las de terceros se describen y se enlazan a su fuente, sin copiarlas. check-cifras falla el deploy si quedan así.`);

// Estimación de palabras del texto que trae el brief
const briefWords = countWords([brief.respuesta, ...(brief.outline ?? []).filter((l) => !/^\s*(H2|H3|##|###)/i.test(l))].join(' '));
if (briefWords < MIN_WORDS) warn(`El brief trae ~${briefWords} palabras de texto; el mínimo del artículo es ${MIN_WORDS}. La vista previa no construye hasta completar la redacción en src/content/paginas/${id}.json.`);

if (errors.length) {
  console.error(`\n✖ El brief no pasa (${errors.length} error${errors.length > 1 ? 'es' : ''}):\n`);
  for (const e of errors) console.error(`  · ${e}`);
  if (warns.length) { console.error('\nAvisos:'); for (const w of warns) console.error(`  ◦ ${w}`); }
  process.exit(1);
}

// ───────────────────────── 3. construir las piezas ─────────────────────────
const hoy = new Date().toISOString().slice(0, 10);
const titulo = brief.titulo.trim();
const categoria = brief.categoria?.trim() || 'Recursos';
const tituloWa = titulo.replace(/[¿?¡!]/g, '').trim().replace(/\.$/, '');
const waMessage = `Hola Kain, leí ${tituloWa.charAt(0).toLowerCase()}${tituloWa.slice(1)} y quiero ver cómo aplica a mi negocio.`;
const waHref = `https://wa.me/${WA_NUM}?text=${encodeURIComponent(waMessage)}`;
const esDiscovery = /discovery|agendar/i.test(brief.cta ?? '');
const primaryCta = esDiscovery
  ? { label: 'Agendar mi Discovery Session', href: '/discovery/', action: 'agendar' }
  : { label: 'Cotizar proyecto', href: '/contacto/#cotizar', action: 'cotizar' };
const breadcrumbTitle = titulo.replace(/[¿?¡!]/g, '').split(/[:.]/)[0].split(/\s+/).slice(0, 6).join(' ');
const secundarias = (brief.secundarias ?? []).flatMap((l) => l.split(/[,;]/)).map((s) => s.replace(/^[-•\s]+/, '').trim()).filter(Boolean);

const nextKey = String(Math.max(...Object.keys(sm).map(Number)) + 1);
const folio = String(Math.max(500, ...pages.filter((p) => p.template === 'T-ARTICLE').map((p) => Number(p.folio) || 500)) + 1);

const entry = {
  id, group: 'Recursos', url, canonical: `https://ingeniak.mx${url}`, indexable: true, status: 'nueva', template: 'T-ARTICLE',
  purpose: [brief.intencion && `Intención ${brief.intencion}`, brief.buyer && `Buyer/etapa: ${brief.buyer}`].filter(Boolean).join(' · ') || `Artículo del blog sobre ${brief.keyword}.`,
  primaryKeyword: brief.keyword.trim(),
  secondaryKeywords: secundarias,
  title: brief.metaTitle.trim(), titleLength: brief.metaTitle.trim().length,
  metaDescription: brief.metaDescription, metaLength: brief.metaDescription.length,
  h1: titulo,
  breadcrumbs: [
    { name: 'Inicio', url: '/' },
    { name: 'Blog', url: '/blog/' },
    { name: breadcrumbTitle, url },
  ],
  sections: [
    { order: 1, id: 'hero', name: 'Portada', spec: `Breadcrumb + categoría + H1 + byline + fecha. Keyword: ${brief.keyword}.`, cinematic: true,
      plate: { id: 'home-sistema-2-atender', component: 'ImageSection hero', layout: 'subject-right', mirror: false, height: 'hero', tone: 'sol', mobile: 'top', srcsetMax: 2752, priority: 'P1' } },
    { order: 2, id: 'respuesta', name: 'Respuesta corta', spec: `40–60 palabras citables que responden "${brief.keyword}" en la primera oración.`, cinematic: false },
    { order: 3, id: 'indice', name: 'Índice', spec: 'Tabla de contenidos fija en escritorio, plegable en celular.', cinematic: false },
    { order: 4, id: 'cuerpo', name: 'Cuerpo (H2)', spec: h2s.map((h, i) => `${i + 1}) ${h.text}`).join(' · '), cinematic: false },
    { order: 5, id: 'cta-medio', name: 'CTA intermedio', spec: `Tarjeta a ${relacionados[0]?.url ?? '/servicios/agentes-ia-whatsapp/'} + WhatsApp.`, cinematic: false },
    { order: 6, id: 'faq', name: 'Preguntas frecuentes', spec: faqIds.length ? `Acordeón (${faqIds.join(', ')}); texto idéntico al FAQPage del <head>.` : 'Sin FAQ por ahora (el brief no trajo).', cinematic: false },
    { order: 7, id: 'autor', name: 'Sobre el autor', spec: 'Tarjeta de Equipo de Ingeniak hasta confirmar autor (R8).', cinematic: false },
    { order: 8, id: 'fuentes', name: 'Fuentes', spec: fuentes.length ? `${fuentes.length} fuente(s) con fecha de consulta; cifras de Ingeniak con nota "datos internos".` : 'Pendiente: el brief no trajo fuentes.', cinematic: false },
    { order: 9, id: 'relacionados', name: 'Sigue explorando', spec: `3 tarjetas: ${relacionados.map((p) => p.url).join(' · ')}.`, cinematic: false },
    { order: 10, id: 'cta-final', name: 'Cierre', spec: 'Cierre cinematográfico compartido (cta-amanecer).', cinematic: true,
      plate: { id: 'cta-amanecer', component: 'Dawn', layout: 'subject-left', mirror: false, height: 'cta', tone: 'sol', mobile: 'top', srcsetMax: 1920, priority: 'P1' } },
  ],
  cinematicSections: ['hero', 'cta-final'],
  primaryCta,
  secondaryCta: { label: 'Escríbele a Kain', waMessage, href: waHref },
  internalLinks: relacionados.map((p) => p.url),
  jsonLd: ['BlogPosting (author Person, datePublished, dateModified)', 'BreadcrumbList', ...(faqIds.length ? ['FAQPage'] : [])],
  faq: faqIds.map((fid) => {
    const f = [...faqList, ...newFaqs].find((x) => x.id === fid);
    return { id: fid, q: f.q, a: f.a, estado: f.validar ? 'por validar' : 'aprobada' };
  }),
  sitemap: { priority: 0.6, changefreq: 'monthly' },
  author: 'Equipo de Ingeniak',
  wordCount: Math.max(briefWords, MIN_WORDS),
  outline: h2s.map((h) => h.text),
  sources: fuentes.length ? fuentes.map((f) => f.title).join(' · ') : 'Pendiente.',
  notes: brief.notas || '',
  folio,
  copy: { status: 'borrador', minWords: MIN_WORDS, owner: 'Equipo SEO (brief) + agente (redacción)', note: `Generado por scripts/blog-nuevo.mjs desde ${briefPath} el ${hoy}. No se publica hasta estado "aprobado" (R1).` },
};

const pendientes = [
  'APROBACIÓN (R1): estado "borrador". Solo una persona del cliente, con su nombre en aprobadoPor, puede pasar este artículo a "aprobado".',
  'PREGUNTA AL CLIENTE · autoría (R8): mientras no se confirme autor por escrito, el crédito visible dice "Equipo de Ingeniak".',
  `PLACA · portada y cierre usan placas compartidas por defecto (home-sistema-2-atender y cta-amanecer). Si el artículo pide placa propia, cambiarla en sitemap.json y aquí.`,
  ...(newFaqs.length ? [`FAQ · ${newFaqs.map((f) => f.id).join(', ')} entran al banco con validar: true: no se publican hasta que el cliente las apruebe.`] : []),
  ...(briefWords < MIN_WORDS ? [`DATO PENDIENTE · el brief trae ~${briefWords} palabras; completar la redacción hasta ≥ ${MIN_WORDS} antes de abrir la vista previa.`] : []),
  'CAMBIO DE TEXTO · revisar "relacionados" (línea de cada tarjeta) y el deck de la portada: salen de la meta description de cada página, no de redacción propia.',
];

const copyJson = {
  pageId: id, url, estado: 'borrador',
  autor: 'Equipo de Ingeniak (redactado con IA)', aprobadoPor: null,
  publicado: hoy, actualizado: hoy,
  articulo: { categoria, about: relacionados[0] ? [{ type: 'Service', name: relacionados[0].title ?? relacionados[0].h1, url: relacionados[0].url }] : [] },
  pendientes,
  sections: {
    hero: {
      _componente: 'ImageSection hero (placa compartida por defecto; ver pendientes)',
      eyebrow: categoria,
      h1: { text: titulo },
      deck: brief.metaDescription,
      byline: 'Equipo de Ingeniak',
      jump: 'Ir a la respuesta corta',
    },
    respuesta: { _componente: 'Intertitle + DefinitionBlock variant=answer', label: 'Respuesta corta', heading: 'La respuesta corta', text: brief.respuesta },
    indice: { label: 'En este artículo' },
    cuerpo: { _componente: 'Prose (bloques) con CTA intermedio', blocks },
    'cta-medio': {
      _componente: 'EditorNote variant=cta (InlineCTA) dentro del cuerpo',
      label: 'Siguiente paso',
      text: `¿Quieres ver cómo aplica a tu negocio? Escríbele a Kain y cuéntale cómo te llegan tus clientes.`,
      ...(relacionados[0] ? { link: { label: relacionados[0].h1 ?? relacionados[0].title, href: relacionados[0].url } } : {}),
      ctaPrimary: { label: primaryCta.label },
      ctaSecondary: { label: 'Escríbele a Kain', waMessage },
    },
    faq: faqIds.length
      ? { _componente: 'FAQAccordion (banco src/data/faq.json)', eyebrow: 'Preguntas frecuentes', h2: { text: 'Lo que más nos preguntan' }, faqIds }
      : { _omitir: true, _nota: 'El brief no trajo FAQs; quitar este _omitir cuando se agreguen.' },
    autor: { _componente: 'AuthorCard (Organization hasta confirmar autor, R8)', bio: 'Lo escribe el equipo que diseña, implementa y opera agentes de IA, CRM y automatizaciones en Ingeniak.' },
    fuentes: fuentes.length
      ? { eyebrow: 'Fuentes', h2: { text: 'Fuentes y fecha de consulta' }, lede: 'Los datos de terceros cambian; antes de decidir, revisa la versión vigente de cada fuente.', items: fuentes, internas: 'Cifras de Ingeniak: {{source}}.' }
      : { _omitir: true, _nota: 'Sin fuentes en el brief. Si el cuerpo cita datos, agregarlas aquí y quitar el _omitir.' },
    relacionados: {
      eyebrow: 'Sigue explorando',
      h2: { text: 'Sigue explorando' },
      items: relacionados.map((p) => ({
        href: p.url,
        label: p.template === 'T-ARTICLE' ? 'Blog' : p.group ?? 'Página',
        title: (p.h1 ?? p.title).split(/[:.]/)[0].trim(),
        line: firstSentence(p.metaDescription ?? ''),
      })),
    },
    'cta-final': {
      _componente: 'Dawn (cta-amanecer, placa compartida)',
      eyebrow: 'Siguiente paso',
      h2: { text: '¿Hablamos de tu caso?', soft: esDiscovery ? 'Agenda tu Discovery Session.' : 'Te lo cotizamos con tus números.' },
      ctaPrimary: { label: primaryCta.label },
      ctaSecondary: { label: 'Escríbele a Kain', waMessage },
    },
  },
};

// ───────────────────────── 4. escribir / reportar ─────────────────────────
console.log(`\nBrief: ${briefPath}`);
console.log(`Artículo: ${id} → ${url}`);
console.log(`Título (${titulo.length}): ${titulo}`);
console.log(`Meta title (${entry.titleLength}) · Meta description (${entry.metaLength})`);
console.log(`H2 del cuerpo: ${h2s.length} · FAQs: ${faqIds.join(', ') || '—'} (${newFaqs.length} nueva(s) al banco) · Fuentes: ${fuentes.length}`);
console.log(`Texto del brief: ~${briefWords} palabras (mínimo del artículo: ${MIN_WORDS})`);
if (warns.length) { console.log('\nAvisos:'); for (const w of warns) console.log(`  ◦ ${w}`); }

if (DRY) {
  console.log('\n--dry: no se escribió nada. Piezas que se generarían:');
  console.log(`  · src/data/sitemap.json → clave "${nextKey}" (${id})`);
  console.log(`  · src/content/paginas/${id}.json (estado "borrador")`);
  if (newFaqs.length) console.log(`  · src/data/faq.json → ${newFaqs.map((f) => f.id).join(', ')} (validar: true)`);
  process.exit(0);
}

sm[nextKey] = entry;
writeFileSync(SITEMAP, JSON.stringify(sm, null, 2) + '\n');
if (newFaqs.length) {
  faqList.push(...newFaqs);
  writeFileSync(FAQ, JSON.stringify(Array.isArray(faqBank) ? faqList : faqBank, null, 2) + '\n');
}
writeFileSync(join(PAGINAS, `${id}.json`), JSON.stringify(copyJson, null, 2) + '\n');

console.log('\n✔ Escrito:');
console.log(`  · src/data/sitemap.json → clave "${nextKey}" (${id})`);
console.log(`  · src/content/paginas/${id}.json (estado "borrador")`);
if (newFaqs.length) console.log(`  · src/data/faq.json → ${newFaqs.map((f) => f.id).join(', ')} (validar: true)`);
console.log(`\nSiguiente paso (BLOG.md):`);
console.log(`  1. Completar la redacción de src/content/paginas/${id}.json (tokens de cifra incluidos).`);
console.log(`  2. Rama + PR → la vista previa de Vercel es la URL de revisión del equipo SEO.`);
console.log(`  3. El cliente aprueba: estado "aprobado" + aprobadoPor. El merge publica.`);
