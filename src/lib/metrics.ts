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

/** Ofertas de las landings ocultas (cambio 2026-10-20). Solo se imprimen en OFFER_ROUTES, siempre dentro de [data-offer];
 *  check-cifras las acepta solo ahí. Nunca con {{price}} (esa es la inversión mensual "desde USD 997 al mes"). */
export const OFFERS = {
  'power-price': 'USD 297',
  'power-guarantee': 'si en la sesión no identificamos al menos 3 fugas por más de $10,000 MXN al mes, te devolvemos los USD 297 completos',
} as const;
export type OfferId = keyof typeof OFFERS;
export const OFFER_ROUTES = ['/discovery/', '/power-session/', '/agendar/confirmado/'] as const;

export function metric(id: MetricId) {
  const m = METRICS[id];
  if (!m) throw new Error(`[metrics] cifra desconocida: ${id}`);
  return m;
}
