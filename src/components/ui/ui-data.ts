// src/components/ui/ui-data.ts — datos y utilidades compartidas del área "ui".
// API pública para otras áreas (p. ej. SEOHead): getFaqItems(), faqPageLd(), annotateFigures(), TEAM, COUNTRIES, VKTOR.
// Ninguna cifra comercial se escribe aquí: todo sale de src/lib/metrics.ts.
import fs from 'node:fs';
import path from 'node:path';
import sitemap from '../../data/sitemap.json';
import { METRICS, PRICES, PRICE_FROM, PRICE_FROM_CAP, SOURCE_NOTE, type MetricId } from '../../lib/metrics';
import * as metricsMod from '../../lib/metrics';
import { metricText as metricTextL, priceText } from '../../lib/metrics';
import { currentLang, L } from '../../lib/i18n';

/** Microcopia de la Discovery Session: solo la usa la landing oculta /discovery/ (CAMBIO-COTIZAR §4.2, MICRO_29).
 *  Fuera de /discovery/ la microcopia del primario es _comun.cta.micro (src/components/layout/cta.ts → QUOTE.micro). */
export const DISCOVERY_MICRO_ES = '30 min · 1:1 · Google Meet · sin costo';
/** En inglés (versión /en/, 2026-11-20). */
export const DISCOVERY_MICRO_EN = '30 min · 1:1 · Google Meet · free';
/** @deprecated usa discoveryMicro(): depende del idioma de la página. */
export const DISCOVERY_MICRO = DISCOVERY_MICRO_ES;
export const discoveryMicro = () => L({ es: DISCOVERY_MICRO_ES, en: DISCOVERY_MICRO_EN });

/* ───────────────────────── Ofertas de las landings ocultas (CAMBIO-COTIZAR §4.4) ─────────────────────────
 * OFFERS vive en src/lib/metrics.ts (orquestador). Se lee por espacio de nombres para que el build no se caiga mientras
 * llega; el respaldo es el texto exacto de §4.4 (y se avisa en dev). Solo se imprime con {{offer:ID}} → <span data-offer>.
 * Un id que no está en OFFERS es error de build. */
const OFFERS_FALLBACK: Record<string, string> = {
  'power-price': 'USD 297',
  'power-guarantee': 'si aplicas lo que definimos y no ves beneficios, te devolvemos el 100% de lo pagado',
};
export const OFFERS: Record<string, string> = ((metricsMod as any).OFFERS as Record<string, string> | undefined) ?? OFFERS_FALLBACK;
if (!(metricsMod as any).OFFERS && import.meta.env?.DEV) console.warn('[ui/copy] metrics.ts todavía no exporta OFFERS: {{offer:…}} usa el respaldo de CAMBIO-COTIZAR §4.4');
const offerOf = (id: string): string => {
  const v = Object.prototype.hasOwnProperty.call(OFFERS, id) ? (currentLang() === 'en' ? priceText('offer:' + id, 'en') : OFFERS[id]) : undefined;
  if (typeof v !== 'string' || !v) throw new Error(`[ui/copy] oferta desconocida en el texto: {{offer:${id}}} (src/lib/metrics.ts → OFFERS)`);
  return v;
};

/* ───────────────────────── Escape + anotación de cifras ───────────────────────── */
export const esc = (s: string) =>
  String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Patrones de cifras confirmadas que aparecen redactadas dentro de textos aprobados (FAQ, guiones, definiciones).
 *  Cada coincidencia se envuelve en <span data-metric="id"> para que check-cifras.mjs la reconozca.
 *  El texto visible no cambia (FAQPage sigue idéntico). */
const FIGURE_PATTERNS: [RegExp, string][] = [
  [/3\.2\s?(?:veces|×|x\b)/g, 'dental-citas'],
  [/(?:de\s)?8\s?min(?:utos)?\s?(?:a|→)\s?12\s?s(?:egundos)?\b/g, 'dental-respuesta'],
  [/[−-]?\s?58\s?%/g, 'ecom-cpl'],
  [/\+?340\s?%/g, 'retail-conversiones'],
  [/(?:ROAS\s(?:de\s)?)?4\.8\s?(?:×|x\b|veces)/g, 'horeca-roas'],
  [/27\s(?:procesos|flujos)/g, 'logistica-procesos'],
  [/(?:de\s)?12\s(?:a|→)\s47(?:\scitas)?/g, 'salud-citas-mes'],
  [/[−-]?\s?60\s?%/g, 'tiempo-operativo'],
  [/1 vista · 7 fuentes/g, 'ecom-tablero'],
  [/(?:más de |\+)73(?:\ssistemas)?/g, 'sistemas'],
  [/\b7\spaíses/g, 'paises'],
  // Inglés (versión /en/, 2026-11-20): las mismas cifras redactadas.
  [/3\.2\s?times/g, 'dental-citas'],
  [/(?:from\s)?8\s?min(?:utes)?\s?(?:to|→)\s?12\s?s(?:econds)?\b/g, 'dental-respuesta'],
  [/27\s(?:automated\s)?(?:processes|workflows)/g, 'logistica-procesos'],
  [/(?:from\s)?12\s(?:to|→)\s47(?:\sappointments)?/g, 'salud-citas-mes'],
  [/1 view · 7 sources/g, 'ecom-tablero'],
  [/(?:more than |over |\+)73(?:\ssystems)?/g, 'sistemas'],
  [/\b7\scountries/g, 'paises'],
];
/** Datos no comerciales con números permitidos (precio oficial, duración de la Discovery, horas, contacto). */
const ALLOW_PATTERNS: RegExp[] = [
  /(?:[Dd]esde\s)?USD\s?997(?:\sal\smes)?/g,
  /\b30\s(?:minutos|min)\b/g,
  /(?:[Ff]rom\s)?USD\s?997(?:\sper\smonth)?/g,
  /\b30[\s-](?:minutes?|min)\b/g,
  /\b\d{1,2}:\d{2}\s?(?:AM|PM|am|pm)\b/g,
  /\b\d{1,2}:\d{2}\b(?:\s?[ap]\.\s?m\.)?/g,
  /\+52\s?33\s?2101\s?7799/g,
];

/** Tokens del copy (src/content/paginas/_ESQUEMA.md §5): {{metric:ID}}, {{metric:ID|full}} (valor + rótulo),
 *  {{metric:ID|prose}} (la cifra redactada para una oración: METRICS[id].prose, p. ej. "de 8 minutos a 12 segundos"),
 *  {{offer:ID}} (oferta de una landing oculta: OFFERS[id] de metrics.ts, CAMBIO-COTIZAR §4.4), {{price}}, {{Price}}, {{source}}.
 *  Grupos: 1 = token, 2 = id de la cifra, 3 = modificador (full | prose), 4 = id de la oferta. */
export const TOKEN_RX = /\{\{(metric:([a-z0-9-]+)(?:\|(full|prose))?|offer:([a-z0-9-]+)|price:([a-z0-9-]+)|price|Price|source)\}\}/g;
/** {{price:ID}} → PRICES[id] de metrics.ts (precio "desde" de un servicio). */
const priceOf = (id: string) => {
  const p = (PRICES as Record<string, string>)[id];
  if (!p) throw new Error(`[ui/copy] precio desconocido en el texto: {{price:${id}}}`);
  return priceText('price:' + id, currentLang());
};
const metricOf = (id: string) => {
  const m = (METRICS as any)[id];
  if (!m) throw new Error(`[ui/copy] cifra desconocida en el texto: {{metric:${id}}}`);
  return m as { value: string; label: string; prose?: string };
};
/** Texto de una cifra según el modificador del token. |prose sin prose en metrics.ts → valor + rótulo (y aviso en dev). */
const metricText = (id: string, mod?: string) => {
  metricOf(id);
  return metricTextL(id as MetricId, mod === 'prose' ? 'prose' : mod === 'full' ? 'full' : 'value', currentLang());
};
/** Valor y rótulo de una cifra en el idioma de la página. */
const metricPair = (id: string) => ({ value: metricText(id), label: metricTextL(id as MetricId, 'label', currentLang()) });
/** Texto plano con los tokens resueltos (JSON-LD FAQPage, ⌘K, meta, aria-label). */
export function tokensToText(s: string): string {
  return String(s ?? '').replace(TOKEN_RX, (_, k, id, mod, offer, priceId) => {
    if (priceId) return priceOf(priceId);
    if (k === 'price' || k === 'Price' || k === 'source') return priceText(k, currentLang());
    if (offer) return offerOf(offer);
    return metricText(id, mod);
  });
}
function legacyFigures(text: string): string {
  let html = esc(text);
  const marks: string[] = [];
  const stash = (s: string) => `\u0000${marks.push(s) - 1}\u0000`;
  for (const [re, id] of FIGURE_PATTERNS) html = html.replace(re, (m) => stash(`<span data-metric="${id}">${m}</span>`));
  for (const re of ALLOW_PATTERNS) html = html.replace(re, (m) => stash(`<span data-allow-number>${m}</span>`));
  return html.replace(/\u0000(\d+)\u0000/g, (_, i) => marks[+i]);
}
/** HTML seguro de un texto del copy: tokens → nodos data-metric / data-allow-number (igual que <Metric variant="inline">)
 *  y {{offer:ID}} → <span data-offer="ID"> (check-cifras lo acepta solo en OFFER_ROUTES);
 *  además, cifras redactadas a mano en textos heredados (sitemap) se envuelven en data-metric. El texto visible no cambia. */
export function annotateFigures(text: string): string {
  const src = String(text ?? '');
  let out = '', last = 0; let m: RegExpExecArray | null;
  const rx = new RegExp(TOKEN_RX.source, 'g');
  while ((m = rx.exec(src))) {
    out += legacyFigures(src.slice(last, m.index));
    const [, k, id, mod, offer, priceId] = m;
    if (priceId) out += `<span data-allow-number>${esc(priceOf(priceId))}</span>`;
    else if (offer) out += `<span data-offer="${esc(offer)}">${esc(offerOf(offer))}</span>`;
    else if (k === 'price' || k === 'Price') out += `<span data-allow-number>${esc(priceText(k, currentLang()))}</span>`;
    else if (k === 'source') out += esc(priceText('source', currentLang()));
    else if (mod === 'prose') out += `<span class="metric metric--prose" data-metric="${id}">${esc(metricText(id, 'prose'))}</span>`;
    else { const x = metricPair(id); out += `<span class="metric metric--inline" data-metric="${id}"><b>${esc(x.value)}</b>${mod === 'full' ? ' ' + esc(x.label) : ''}</span>`; }
    last = m.index + m[0].length;
  }
  return out + legacyFigures(src.slice(last));
}
export const renderCopy = annotateFigures;

/* ───────────────────────── Banco de FAQ ───────────────────────── */
export type FaqItem = { id: string; q: string; a: string; short?: string; estado?: string; validar?: boolean; categoria?: string; pages?: string[] };
const faqFiles = import.meta.glob('../../data/faq.json', { eager: true, import: 'default' }) as Record<string, any>;
/** Banco en inglés (versión /en/, 2026-11-20): src/data/faq-en.json, mismos ids (lo arma scripts/ingles.mjs). */
const faqFilesEn = import.meta.glob('../../data/faq-en.json', { eager: true, import: 'default' }) as Record<string, any>;

function normalizeFaq(raw: any): FaqItem[] {
  if (!raw) return [];
  const list = Array.isArray(raw) ? raw : Array.isArray(raw.items) ? raw.items : Array.isArray(raw.preguntas) ? raw.preguntas
    : Object.entries(raw).filter(([, v]) => v && typeof v === 'object').map(([id, v]: any) => ({ id, ...v }));
  return list.map((f: any) => ({ id: f.id, q: f.q ?? f.pregunta ?? f.question, a: f.a ?? f.respuesta ?? f.answer, short: f.short, estado: f.estado, validar: f.validar, categoria: f.categoria ?? f.grupo, pages: f.pages }))
    .filter((f: FaqItem) => f.id && f.q && f.a);
}
let BANK: Map<string, FaqItem> | null = null;
let BANK_EN: Map<string, FaqItem> | null = null;
function bank() {
  if (currentLang() === 'en') {
    if (BANK_EN) return BANK_EN;
    BANK_EN = new Map();
    for (const p of sitemap as any[]) if (p.lang === 'en') for (const f of p.faq ?? []) if (!BANK_EN.has(f.id)) BANK_EN.set(f.id, f);
    for (const raw of Object.values(faqFilesEn)) for (const f of normalizeFaq(raw)) BANK_EN.set(f.id, f);
    return BANK_EN;
  }
  if (BANK) return BANK;
  BANK = new Map();
  // 1) Banco de D en sitemap.json (respaldo) · 2) src/data/faq.json del área copy (manda si existe)
  for (const p of sitemap as any[]) if (p.lang !== 'en') for (const f of p.faq ?? []) if (!BANK.has(f.id)) BANK.set(f.id, f);
  for (const raw of Object.values(faqFiles)) for (const f of normalizeFaq(raw)) BANK.set(f.id, f);   // el banco del copy manda por id
  return BANK;
}
const publishable = (f?: FaqItem) => !!f && f.validar !== true && (!f.estado || /^aprobad[ao]$/i.test(f.estado));

/** Todas las preguntas publicables del banco (para /preguntas-frecuentes/ y el índice ⌘K). */
export function getFaqBank(): FaqItem[] { return [...bank().values()].filter((f) => publishable(f)); }
/** Preguntas publicables en el orden pedido (las "validar" o desconocidas se omiten y se avisan en dev). */
export function getFaqItems(ids: string[]): FaqItem[] {
  const out: FaqItem[] = [];
  for (const id of ids) {
    const f = bank().get(id);
    if (publishable(f)) out.push(f!);
    else if (import.meta.env.DEV) console.warn(`[ui/faq] ${id}: ${f ? 'pendiente de validar, no se publica' : 'no existe en el banco'}`);
  }
  return out;
}
/** Nodo FAQPage para el @graph de SEOHead: texto idéntico al visible. */
export function faqPageLd(ids: string[], pageUrl?: string) {
  const items = getFaqItems(ids);
  if (!items.length) return null;
  return {
    '@type': 'FAQPage',
    ...(pageUrl ? { '@id': `${pageUrl}#faq` } : {}),
    mainEntity: items.map((f) => ({ '@type': 'Question', name: tokensToText(f.q), acceptedAnswer: { '@type': 'Answer', text: tokensToText(f.a) } })),
  };
}

const comunFiles = import.meta.glob('../../content/paginas/_comun.json', { eager: true, import: 'default' }) as Record<string, any>;
const comunFilesEn = import.meta.glob('../../content/paginas/en-_comun.json', { eager: true, import: 'default' }) as Record<string, any>;
const COMUN_ES: any = Object.values(comunFiles)[0] ?? {};
const COMUN_EN: any = Object.values(comunFilesEn)[0] ?? COMUN_ES;
const SIM_ES = { label: 'SIMULACIÓN', demo: 'VISTA DEMO', typing: 'escribiendo…', pause: 'Pausar la conversación', play: 'Reanudar la conversación', horaIlustrativa: 'Hora ilustrativa', tabsAria: 'Elige un sector para ver la conversación', ...(COMUN_ES.sim ?? {}) };
const SIM_EN = { label: 'SIMULATION', demo: 'DEMO VIEW', typing: 'typing…', pause: 'Pause the conversation', play: 'Resume the conversation', horaIlustrativa: 'Illustrative time', tabsAria: 'Pick an industry to see the conversation', ...(COMUN_EN.sim ?? {}) };
/** Microcopia compartida del área copy (_comun.json; en inglés, en-_comun.json): se lee en el idioma de la página. */
/** Nombre visible de cada sector de los guiones de chat (ChatSim, ChatTabs), en el idioma de la página. */
export const sectorLabels = (): Record<string, string> => L({
  es: { salud: 'Salud', belleza: 'Belleza', nutricion: 'Nutrición', finanzas: 'Finanzas', inmobiliario: 'Inmobiliario', industrial: 'Industrial', retail: 'Retail', ecommerce: 'E-commerce', horeca: 'HoReCa', default: 'General' },
  en: { salud: 'Healthcare', belleza: 'Beauty', nutricion: 'Nutrition', finanzas: 'Finance', inmobiliario: 'Real estate', industrial: 'Industrial', retail: 'Retail', ecommerce: 'E-commerce', horeca: 'Hospitality', default: 'General' },
});
/** Rótulo corto de la barra SIMULACIÓN (en versalitas por CSS). */
export const simChipLabel = () => {
  const up = String(SIM.label).toUpperCase();
  return up === 'SIMULACIÓN' ? 'Simulación' : up === 'SIMULATION' ? 'Simulation' : SIM.label;
};
export const COMUN: any = new Proxy({}, { get: (_, k) => (currentLang() === 'en' ? COMUN_EN : COMUN_ES)[k as string], has: (_, k) => k in (currentLang() === 'en' ? COMUN_EN : COMUN_ES) });
export const SIM: any = new Proxy({}, { get: (_, k) => (currentLang() === 'en' ? SIM_EN : SIM_ES)[k as keyof typeof SIM_ES] });

/* ───────────────────────── Imágenes publicadas ───────────────────────── */
const PUBLIC = path.join(process.cwd(), 'public');
export const publicExists = (url: string) => { try { return fs.existsSync(path.join(PUBLIC, url)); } catch { return false; } };
/** Still 21:9 de una placa (§8.2): /img/cine/<placa>-still-<w>.(avif|webp). null si todavía no existe. */
export function stillOf(plate?: string) {
  if (!plate) return null;
  const base = `/img/cine/${plate}-still`;
  if (!publicExists(`${base}-640.webp`) && !publicExists(`${base}-640.avif`)) {
    if (import.meta.env.DEV) console.warn(`[ui/Still] falta ${base}-640.(avif|webp): se usa el aura de respaldo`);
    return null;
  }
  return {
    avif: [360, 640].filter((w) => publicExists(`${base}-${w}.avif`)).map((w) => `${base}-${w}.avif ${w}w`).join(', '),
    webp: [360, 640].filter((w) => publicExists(`${base}-${w}.webp`)).map((w) => `${base}-${w}.webp ${w}w`).join(', '),
    src: publicExists(`${base}-640.webp`) ? `${base}-640.webp` : `${base}-360.webp`,
  };
}

/* ───────────────────────── Entidad ───────────────────────── */
/** Lista que cambia con el idioma de la página (versión /en/, 2026-11-20): se usa igual que un arreglo normal. */
function byLang<T extends object>(es: T[], en: T[]): T[] {
  return new Proxy(es, { get: (_, k) => { const a = currentLang() === 'en' ? en : es; const v = (a as any)[k]; return typeof v === 'function' ? v.bind(a) : v; } });
}
const countriesOf = (ctx: string, sep: RegExp, hq: RegExp) => ctx
  .replace(sep, ', ').split(',').map((s) => s.trim()).filter(Boolean)
  .map((s) => ({ name: s.replace(hq, ''), sede: hq.test(s) }));
export const COUNTRIES: { name: string; sede: boolean }[] = byLang(
  countriesOf(METRICS.paises.ctx, /\sy\s/, /\s*\(sede\)/),
  countriesOf(metricTextL('paises', 'ctx', 'en'), /,?\sand\s/, /\s*\(HQ\)/),
);

export const VKTOR = byLang([
  { l: 'V', name: 'Verify', verb: 'Verificamos tu operación' },
  { l: 'K', name: 'Koncept', verb: 'Diseñamos el concepto' },
  { l: 'T', name: 'Transform', verb: 'Transformamos' },
  { l: 'O', name: 'Operate', verb: 'Operamos junto con tu equipo' },
  { l: 'R', name: 'Rise', verb: 'Hacemos crecer los resultados' },
], [
  { l: 'V', name: 'Verify', verb: 'We verify how you operate' },
  { l: 'K', name: 'Koncept', verb: 'We design the concept' },
  { l: 'T', name: 'Transform', verb: 'We transform' },
  { l: 'O', name: 'Operate', verb: 'We operate alongside your team' },
  { l: 'R', name: 'Rise', verb: 'We grow the results' },
]);

/** crop: encuadre de cabeza y hombros de la foto actual (fracciones de la foto cuadrada de 600 px): fx = centro del rostro,
 *  ey = línea de los ojos, hw = ancho de la cabeza. Con esto todas las caras quedan del mismo tamaño y con la mirada a la
 *  misma altura (Credits variant="team"). Con la sesión de R6 basta con reemplazar las fotos y ajustar estos tres números. */
export type TeamCrop = { fx: number; ey: number; hw: number };
export type TeamMember = { slug: string; name: string; role: string; photo: string; linkedin?: string; crop?: TeamCrop };
/** Equipo de 6 (ESPEC §5.1 ESC 11). Las fotos actuales traen la placa del nombre impresa: Credits/AuthorCard las recortan. */
const TEAM_ES: TeamMember[] = [
  { slug: 'rik-landeros', name: 'Rik Landeros', role: 'Director de Estrategia Comercial', photo: '/img/equipo/rik-landeros.webp', crop: { fx: 0.535, ey: 0.3, hw: 0.2 } },
  { slug: 'alonso-vega', name: 'Alonso Vega', role: 'Arquitecto de IA y Automatización', photo: '/img/equipo/alonso-vega.webp', crop: { fx: 0.47, ey: 0.39, hw: 0.175 } },
  { slug: 'cesar-ovalle', name: 'César Ovalle', role: 'Director Creativo', photo: '/img/equipo/cesar-ovalle.webp', crop: { fx: 0.5, ey: 0.35, hw: 0.155 } },
  { slug: 'richard-vela', name: 'Richard Vela', role: 'Medios de Performance', photo: '/img/equipo/richard-vela.webp', crop: { fx: 0.5, ey: 0.355, hw: 0.23 } },
  { slug: 'barb-mendoza', name: 'Barb Mendoza', role: 'Project Manager', photo: '/img/equipo/barb-mendoza.webp', crop: { fx: 0.5, ey: 0.37, hw: 0.3 } },
  { slug: 'marcos-gonzalez', name: 'Marcos González', role: 'Líder Comercial', photo: '/img/equipo/marcos-gonzalez.webp', crop: { fx: 0.5, ey: 0.33, hw: 0.165 } },
];
const ROLE_EN: Record<string, string> = {
  'rik-landeros': 'Director of Sales Strategy', 'alonso-vega': 'AI & Automation Architect', 'cesar-ovalle': 'Creative Director',
  'richard-vela': 'Performance Media', 'barb-mendoza': 'Project Manager', 'marcos-gonzalez': 'Sales Lead',
};
export const TEAM: TeamMember[] = byLang(TEAM_ES, TEAM_ES.map((m) => ({ ...m, role: ROLE_EN[m.slug] ?? m.role })));

/** Herramientas con logo en public/img/logos (pintadas con máscara currentColor). Partners oficiales (Kommo, GoHighLevel, Google y Meta): su franja es PartnerBadges; aquí aparecen como herramientas del stack. */
export const TOOLS: Record<string, { name: string; logo: string; wide?: boolean }> = {
  whatsapp: { name: 'WhatsApp Business', logo: 'whatsapp' }, gohighlevel: { name: 'GoHighLevel', logo: 'gohighlevel-mark' },
  kommo: { name: 'Kommo', logo: 'kommo', wide: true }, n8n: { name: 'n8n', logo: 'n8n' }, make: { name: 'Make', logo: 'make' },
  openai: { name: 'OpenAI', logo: 'openai' }, claude: { name: 'Claude', logo: 'claude' }, anthropic: { name: 'Anthropic', logo: 'anthropic' },
  gemini: { name: 'Gemini', logo: 'googlegemini' }, meta: { name: 'Meta', logo: 'meta' }, googleads: { name: 'Google Ads', logo: 'googleads' },
  tiktok: { name: 'TikTok', logo: 'tiktok' }, supabase: { name: 'Supabase', logo: 'supabase' }, stripe: { name: 'Stripe', logo: 'stripe' },
  instagram: { name: 'Instagram', logo: 'instagram' }, facebook: { name: 'Facebook', logo: 'facebook' }, zapier: { name: 'Zapier', logo: 'zapier' },
  hubspot: { name: 'HubSpot', logo: 'hubspot' }, analytics: { name: 'Google Analytics', logo: 'googleanalytics' },
  elevenlabs: { name: 'ElevenLabs', logo: 'elevenlabs' }, linkedin: { name: 'LinkedIn', logo: 'linkedin' },
  notion: { name: 'Notion', logo: 'notion' },
  // Wordmark de n8n (su guía lo pide donde el logo va solo, ≥ 100 px de ancho); el ícono sigue siendo `n8n`.
  'n8n-wordmark': { name: 'n8n', logo: 'n8n-wordmark-white', wide: true },
  // HeyGen: pendiente de un archivo claro (SVG o WebP) en public/img/logos (peticiones · metodo-stack #8).
};
export const logoWide = (slug?: string) => !!(slug && TOOLS[slug]?.wide);
export const logoUrl = (slug?: string) => (slug ? `/img/logos/${TOOLS[slug]?.logo ?? slug}.svg` : undefined);

/* ───────────────────────── Registro de resultados ───────────────────────── */
/** Contexto confirmado por cifra (sitemap.json → ficha de cada caso). Lo no confirmado queda en null y se muestra "—". */
type LedgerRow = { sector: string; sectorSlug: string; city?: string; window?: string; service?: { name: string; slug: string; href: string } };
const LEDGER_ES: Partial<Record<MetricId, LedgerRow>> = {
  'dental-citas': { sector: 'Salud · clínica dental', sectorSlug: 'salud', city: 'Monterrey, N.L.', window: '90 días', service: { name: 'Agente de IA en WhatsApp', slug: 'agentes', href: '/servicios/agentes-ia-whatsapp/' } },
  'dental-respuesta': { sector: 'Salud · clínica dental', sectorSlug: 'salud', city: 'Monterrey, N.L.', service: { name: 'Agente de IA en WhatsApp', slug: 'agentes', href: '/servicios/agentes-ia-whatsapp/' } },
  'retail-conversiones': { sector: 'Retail multimarca', sectorSlug: 'retail', service: { name: 'CRM Kommo + IA', slug: 'crm', href: '/kommo/' } },
  'ecom-cpl': { sector: 'E-commerce', sectorSlug: 'ecommerce', city: 'Ciudad de México', window: '60 días' },
  'horeca-roas': { sector: 'HoReCa', sectorSlug: 'horeca', window: 'Sostenido', service: { name: 'Paid media en Meta Ads', slug: 'paid-media', href: '/servicios/paid-media/' } },
  'logistica-procesos': { sector: 'Logística', sectorSlug: 'logistica', service: { name: 'Automatización con n8n', slug: 'automatizacion', href: '/servicios/automatizacion-n8n/' } },
  'salud-citas-mes': { sector: 'Salud · varios clientes', sectorSlug: 'salud', window: 'Promedio mensual' },
  'tiempo-operativo': { sector: 'Varios sectores', sectorSlug: 'varios', window: 'Primeros 90 días' },
  'ecom-tablero': { sector: 'E-commerce', sectorSlug: 'ecommerce', service: { name: 'Tablero unificado', slug: 'datos', href: '/servicios/desarrollo-software/#dashboard' } },
};
/** Inglés (versión /en/, 2026-11-20): mismos datos; solo cambian los nombres (los enlaces siguen en español: esas páginas no están traducidas). */
const LEDGER_SECTOR_EN: Record<string, string> = {
  'Salud · clínica dental': 'Healthcare · dental clinic', 'Retail multimarca': 'Multi-brand retail', 'E-commerce': 'E-commerce',
  'HoReCa': 'Hospitality (HoReCa)', 'Logística': 'Logistics', 'Salud · varios clientes': 'Healthcare · several clients', 'Varios sectores': 'Several industries',
};
const LEDGER_CITY_EN: Record<string, string> = { 'Monterrey, N.L.': 'Monterrey, N.L.', 'Ciudad de México': 'Mexico City' };
const LEDGER_WINDOW_EN: Record<string, string> = { '90 días': '90 days', '60 días': '60 days', 'Sostenido': 'Sustained', 'Promedio mensual': 'Monthly average', 'Primeros 90 días': 'First 90 days' };
const LEDGER_SERVICE_EN: Record<string, string> = {
  'Agente de IA en WhatsApp': 'WhatsApp AI agent', 'CRM Kommo + IA': 'Kommo CRM + AI', 'Paid media en Meta Ads': 'Paid media on Meta Ads',
  'Automatización con n8n': 'Automation with n8n', 'Tablero unificado': 'Unified dashboard',
};
const LEDGER_EN: Partial<Record<MetricId, LedgerRow>> = Object.fromEntries(Object.entries(LEDGER_ES).map(([k, r]) => [k, {
  ...r!,
  sector: LEDGER_SECTOR_EN[r!.sector] ?? r!.sector,
  city: r!.city && (LEDGER_CITY_EN[r!.city] ?? r!.city),
  window: r!.window && (LEDGER_WINDOW_EN[r!.window] ?? r!.window),
  service: r!.service && { ...r!.service, name: LEDGER_SERVICE_EN[r!.service.name] ?? r!.service.name },
}]));
/** Contexto por cifra en el idioma de la página (se usa igual que un objeto normal). */
export const LEDGER: Partial<Record<MetricId, LedgerRow>> = new Proxy({}, {
  get: (_, k) => (currentLang() === 'en' ? LEDGER_EN : LEDGER_ES)[k as MetricId],
  has: (_, k) => k in LEDGER_ES,
  ownKeys: () => Reflect.ownKeys(LEDGER_ES),
  getOwnPropertyDescriptor: (_, k) => ({ enumerable: true, configurable: true, value: (currentLang() === 'en' ? LEDGER_EN : LEDGER_ES)[k as MetricId] }),
});

/* ───────────────────────── Tipografía de cifras ───────────────────────── */
/** Parte el valor de una cifra para su tipografía: número intacto, símbolo (% ×) en voladita, signo (+ −) y palabras (min, s, →, ROAS) a menor cuerpo. */
export function figureParts(v: string): { t: string; k: 'num' | 'sym' | 'sign' | 'word' }[] {
  return v.split(/(\d+(?:\.\d+)?)/).filter(Boolean).map((t) => {
    if (/^\d/.test(t)) return { t, k: 'num' as const };
    const x = t.trim();
    if (/^[%×]$/.test(x)) return { t: x, k: 'sym' as const };
    if (/^[+−-]$/.test(x)) return { t: x, k: 'sign' as const };
    return { t, k: 'word' as const };
  });
}
