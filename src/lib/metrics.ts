// src/lib/metrics.ts — ÚNICA fuente de cifras comerciales del sitio (ESPEC-v2 §2.10).
// Ningún componente imprime una cifra comercial que no salga de aquí: usa <Metric id="…" />.
// prose (opcional): la cifra redactada para una oración ({{metric:ID|prose}}). retail-conversiones, horeca-roas y
// salud-citas-mes se publican tal cual, SIN periodo ni ventana: el cliente pidió publicarlas así (RESPUESTAS-CLIENTE
// 2026-10-19 #1). No se inventa un plazo; las que ya lo traen (dental-citas, ecom-cpl) lo conservan.
// href = el caso que respalda la cifra (Montage, MetricRow, ResultsLedger y llms.txt enlazan ahí con "Ver caso →").
// ecom-tablero va SIN href: no está confirmado que el tablero sea del mismo cliente del caso de costo por lead
// (caso-ecommerce.json pendientes; D-arquitectura.md, caso e-commerce, sección 4). Si el cliente lo confirma, vuelve
// href: '/casos/ecommerce-cdmx-costo-por-lead/'.
export const METRICS = {
  'dental-citas':        { value: '3.2×',                label: 'más citas en 90 días',      ctx: 'Clínica dental · Monterrey',     href: '/casos/clinica-dental-monterrey/', countable: false },
  'dental-respuesta':    { value: '8 min → 12 s',        label: 'tiempo de respuesta',       ctx: 'Clínica dental · Monterrey',     href: '/casos/clinica-dental-monterrey/', countable: false, prose: 'de 8 minutos a 12 segundos' },
  'ecom-cpl':            { value: '−58%',                label: 'costo por lead en 60 días', ctx: 'E-commerce · CDMX',              href: '/casos/ecommerce-cdmx-costo-por-lead/', countable: false },
  'retail-conversiones': { value: '+340%',               label: 'conversiones',              ctx: 'Retail multimarca · Kommo + IA', href: '/casos/retail-multimarca-kommo/', countable: false },
  'horeca-roas':         { value: 'ROAS 4.8×',           label: 'sostenido',                 ctx: 'HoReCa',                         href: '/casos/horeca-roas/', countable: false },
  'logistica-procesos':  { value: '27',                  label: 'procesos automatizados',    ctx: 'Logística · n8n',                href: '/casos/logistica-n8n/', countable: true, from: 0 },
  'salud-citas-mes':     { value: '12 → 47',             label: 'citas al mes en promedio',  ctx: 'Clientes de salud: odontología, medicina estética, quiropráctica y gastroenterología', href: undefined, countable: false },
  'tiempo-operativo':    { value: '−60%',                label: 'tiempo operativo',          ctx: 'Promedio, primeros 90 días',     href: undefined, countable: false },
  'ecom-tablero':        { value: '1 vista · 7 fuentes', label: 'tablero unificado',         ctx: 'E-commerce',                     href: undefined, countable: false },
  'sistemas':            { value: '+73',                 label: 'sistemas en producción',    ctx: 'Agentes, CRM y automatizaciones',                       href: undefined, countable: false },
  'paises':              { value: '7',                   label: 'países',                    ctx: 'México (sede), Estados Unidos, Colombia, Argentina, España, Costa Rica y Ecuador', href: '/nosotros/', countable: true, from: 0 },
} as const;

export type MetricId = keyof typeof METRICS;
export const SOURCE_NOTE = 'Datos internos de Ingeniak, octubre de 2026';
export const PRICE_FROM = 'desde USD 997 al mes';
export const PRICE_FROM_CAP = 'Desde USD 997 al mes';
/** Precios "desde" por servicio (token {{price:ID}} en el copy y en sitemap.json). Cada uno es una cifra oficial que da el
 *  cliente; check-cifras acepta un importe en USD solo si es PRICE_FROM o uno de estos, escrito tal cual (lleva unidad al
 *  final para que una coma o un punto de la oración no se peguen al número).
 *  software: Rik Landeros, 2026-11-13 ("el costo va desde los 1500 USD; depende de funcionalidades, conexiones, bases de
 *  datos, actualizaciones y mantenimiento"). "por proyecto": confirmado por Rik Landeros el 2026-11-13. */
export const PRICES = {
  'software': 'desde USD 1,500 por proyecto',
} as const;
export type PriceId = keyof typeof PRICES;

/** Ofertas de las landings ocultas (cambio 2026-10-20). Solo se imprimen en OFFER_ROUTES, siempre dentro de [data-offer];
 *  power-guarantee: la del video de la Power Session, confirmada por Rik Landeros el 2026-11-23.
 *  check-cifras las acepta solo ahí. Nunca con {{price}} (esa es la inversión mensual "desde USD 997 al mes"). */
export const OFFERS = {
  'power-price': 'USD 297',
  'power-guarantee': 'si aplicas lo que definimos y no ves beneficios, te devolvemos el 100% de lo pagado',
} as const;
export type OfferId = keyof typeof OFFERS;
export const OFFER_ROUTES = ['/discovery/', '/power-session/', '/agendar/confirmado/'] as const;

export function metric(id: MetricId) {
  const m = METRICS[id];
  if (!m) throw new Error(`[metrics] cifra desconocida: ${id}`);
  return m;
}

/* ───────────────────────── Versión en inglés (2026-11-20) ─────────────────────────
 * Mismas cifras: solo cambian las palabras. value se repite cuando lleva texto (vista, fuentes); si no, se usa el de METRICS. */
export const METRICS_EN: Record<MetricId, { label: string; ctx: string; value?: string; prose?: string }> = {
  'dental-citas':        { label: 'more appointments in 90 days', ctx: 'Dental clinic · Monterrey' },
  'dental-respuesta':    { label: 'response time', ctx: 'Dental clinic · Monterrey', prose: 'from 8 minutes to 12 seconds' },
  'ecom-cpl':            { label: 'cost per lead in 60 days', ctx: 'E-commerce · Mexico City' },
  'retail-conversiones': { label: 'conversions', ctx: 'Multi-brand retail · Kommo + AI' },
  'horeca-roas':         { label: 'sustained', ctx: 'Hospitality (HoReCa)' },
  'logistica-procesos':  { label: 'automated processes', ctx: 'Logistics · n8n' },
  'salud-citas-mes':     { label: 'appointments per month on average', ctx: 'Healthcare clients: dentistry, aesthetic medicine, chiropractic and gastroenterology' },
  'tiempo-operativo':    { label: 'operating time', ctx: 'Average, first 90 days' },
  'ecom-tablero':        { label: 'unified dashboard', ctx: 'E-commerce', value: '1 view · 7 sources' },
  'sistemas':            { label: 'systems in production', ctx: 'Agents, CRM and automations' },
  'paises':              { label: 'countries', ctx: 'Mexico (HQ), United States, Colombia, Argentina, Spain, Costa Rica and Ecuador' },
};
export const SOURCE_NOTE_EN = 'Ingeniak internal data, October 2026';
export const PRICE_FROM_EN = 'from USD 997 per month';
export const PRICE_FROM_CAP_EN = 'From USD 997 per month';
export const PRICES_EN: Record<PriceId, string> = { 'software': 'from USD 1,500 per project' };
export const OFFERS_EN: Record<OfferId, string> = {
  'power-price': 'USD 297',
  'power-guarantee': "if you apply what we define and don't see benefits, we refund 100% of what you paid",
};

/** Cifra en el idioma pedido: 'value' (la cifra), 'full' (cifra + etiqueta), 'prose' (redactada), 'label' o 'ctx'. */
export function metricText(id: MetricId, mod: 'value' | 'full' | 'prose' | 'label' | 'ctx', lang: 'es' | 'en' = 'es'): string {
  const m = metric(id) as { value: string; label: string; ctx: string; prose?: string };
  const t = lang === 'en' ? METRICS_EN[id] : null;
  const value = t?.value ?? m.value;
  const label = t?.label ?? m.label;
  if (mod === 'value') return value;
  if (mod === 'label') return label;
  if (mod === 'ctx') return t?.ctx ?? m.ctx;
  if (mod === 'prose') return (t ? t.prose : m.prose) ?? `${value} ${label}`;
  return `${value} ${label}`;
}
/** Precios, ofertas y nota de fuente en el idioma pedido: 'price', 'Price', 'source', 'price:<id>', 'offer:<id>'. */
export function priceText(key: string, lang: 'es' | 'en' = 'es'): string {
  const en = lang === 'en';
  if (key === 'price') return en ? PRICE_FROM_EN : PRICE_FROM;
  if (key === 'Price') return en ? PRICE_FROM_CAP_EN : PRICE_FROM_CAP;
  if (key === 'source') return en ? SOURCE_NOTE_EN : SOURCE_NOTE;
  if (key.startsWith('price:')) { const id = key.slice(6) as PriceId; return (en ? PRICES_EN : PRICES)[id]; }
  if (key.startsWith('offer:')) { const id = key.slice(6) as OfferId; return (en ? OFFERS_EN : OFFERS)[id]; }
  throw new Error(`[metrics] clave desconocida: ${key}`);
}
