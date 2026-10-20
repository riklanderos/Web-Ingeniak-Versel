/**
 * Reglas de la agenda (Discovery Session y Power Session) · lógica isomorfa: la importan el navegador
 * (src/scripts/agenda/booking.ts) y el servidor (server/agenda/*, api/agenda/*).
 * Port 1:1 de `lib/agenda/config.ts` de riklanderos.tech (mismas reglas, listas y validación) + constantes
 * de Ingeniak (CAMBIO-COTIZAR §5.2). Puro: sin Node ni DOM. JavaScript ESM con JSDoc.
 *
 * Zona de operación: America/Mexico_City (UTC−6 todo el año; México no tiene horario de verano desde 2022).
 */

/** @typedef {'power' | 'discovery'} SessionType */
/**
 * @typedef {{
 *   fullName: string, email: string, whatsapp: string, businessName: string, website: string,
 *   industry: string, teamSize: string, revenue: string, timeDrains: string[], tools: string, goal: string
 * }} BookingForm
 */
/** @typedef {Partial<Record<keyof BookingForm, string>>} FormErrors */
/** @typedef {{ date: string, slots: string[] }} DayAvailability */

export const CDMX_TZ = 'America/Mexico_City';
export const CDMX_OFFSET = '-06:00';

/** Días hábiles (lunes a viernes) que se ofrecen, contados a partir de mañana. */
export const BOOKABLE_BUSINESS_DAYS = 5;
/** Anticipación mínima para reservar (horas). */
export const MIN_HOURS_AHEAD = 12;
/** Colchón entre citas: un horario se descarta si choca con algo ocupado ± este margen (minutos). */
export const BUFFER_MINUTES = 15;
/** Cupo semanal de Power Sessions (cuentan confirmadas y apartadas). */
export const POWER_WEEKLY_LIMIT = 4;
/** Minutos que se aparta un horario mientras se paga en Stripe (Stripe exige ≥ 30; al visitante se le dicen 30). */
export const HOLD_MINUTES = 31;

/** @type {Record<SessionType, { minutes: number, times: readonly string[], label: string }>} */
export const SESSION_RULES = {
  power: {
    minutes: 90,
    // 90 min + 15 de colchón, 10:00–17:00 CDMX
    times: ['10:00', '11:45', '13:30', '15:15'],
    label: 'Power Session',
  },
  discovery: {
    minutes: 30,
    // 30 min + 15 de colchón, con descanso de 13:45 a 15:00
    times: ['10:00', '10:45', '11:30', '12:15', '13:00', '15:00', '15:45', '16:30'],
    label: 'Discovery Session',
  },
};

/** Cobro de la Power Session (mismo concepto en línea que riklanderos.tech; sin Product ni Price en Stripe). */
export const POWER_PRICE_CENTS = 29700;
export const POWER_CURRENCY = 'usd';

/* ── Ingeniak (CAMBIO-COTIZAR §5.2) ───────────────────────────── */

/** @type {Record<SessionType, string>} */
export const LANDING = { discovery: '/discovery/', power: '/power-session/' };
export const CONFIRM_PATH = '/agendar/confirmado/';
export const SITE_URL = 'https://ingeniak.mx';
export const CONTACT = { email: 'contacto@ingeniak.mx', wa: 'https://wa.me/523321017799' };
/** Marcador final de la descripción del evento. El confirmador (aquí y en riklanderos.tech) inserta
 *  "Pago confirmado en Stripe." justo antes de "\n\nAgendado desde". No cambiar. */
export const MARKER = '\n\nAgendado desde https://ingeniak.mx';
/** Propiedad privada que distingue los eventos creados desde ingeniak.mx. */
export const SITE_TAG = 'ingeniak';

/** Formato de una sesión de Stripe Checkout (`cs_test_…`, `cs_live_…`; la simulación local usa `cs_test_MOCK_…`). */
export const SESSION_ID_RE = /^cs_(live|test)_[A-Za-z0-9_]{1,250}$/;
/** Id de evento de Google Calendar (el `apartado` que regresa en el cancel_url). */
export const EVENT_ID_RE = /^[a-z0-9_-]{5,1024}$/i;

/* ── Opciones del formulario ─────────────────────────────────── */

export const INDUSTRIES = /** @type {const} */ ([
  'Servicios profesionales',
  'Salud y bienestar',
  'Retail o tienda física',
  'E-commerce',
  'Restaurantes y alimentos',
  'Construcción e inmobiliaria',
  'Manufactura o industria',
  'Educación',
  'Agencia o marketing',
  'Otro',
]);

export const TEAM_SIZES = /** @type {const} */ (['Solo yo', '2–5', '6–10', '11–25', '26–50', 'Más de 50']);

export const REVENUES = /** @type {const} */ ([
  'Menos de $100K MXN al mes',
  '$100K–$300K MXN',
  '$300K–$800K MXN',
  '$800K–$2M MXN',
  'Más de $2M MXN',
  'Apenas voy a empezar',
]);

export const TIME_DRAINS = /** @type {const} */ ([
  'Atender WhatsApp y prospectos',
  'Cotizar',
  'Cobrar y dar seguimiento a pagos',
  'Supervisar al equipo',
  'Atención a clientes y quejas',
  'Administración y facturación',
  'Compras y proveedores',
  'Marketing y contenido',
  'Otro',
]);

/** @type {Readonly<BookingForm>} */
export const EMPTY_FORM = Object.freeze({
  fullName: '',
  email: '',
  whatsapp: '',
  businessName: '',
  website: '',
  industry: '',
  teamSize: '',
  revenue: '',
  timeDrains: [],
  tools: '',
  goal: '',
});

/** Orden de los campos (para enfocar el primer error en el mismo orden que el formulario). */
export const FIELD_ORDER = /** @type {const} */ ([
  'fullName', 'email', 'whatsapp', 'businessName', 'website', 'industry', 'teamSize', 'revenue', 'timeDrains', 'tools', 'goal',
]);

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Mensajes de error (voz de Ingeniak). Las reglas son las del original; solo cambia la voz. */
export const ERRORS = {
  fullName: 'Escribe tu nombre completo.',
  email: 'Revisa tu correo: ahí te llega la invitación.',
  whatsapp: 'Incluye tu WhatsApp con lada (10 dígitos o más).',
  businessName: 'Escribe el nombre de tu negocio.',
  website: 'Máximo 200 caracteres.',
  industry: 'Elige un giro.',
  teamSize: 'Elige el tamaño de tu equipo.',
  revenue: 'Elige un rango.',
  timeDrainsMin: 'Elige al menos una.',
  timeDrainsMax: 'Máximo 3 opciones.',
  tools: 'Cuéntanos qué usan hoy (CRM, Excel, WhatsApp…).',
  goalPower: 'Cuéntanos con al menos 20 caracteres qué quieres resolver en la sesión.',
  goalDiscovery: 'Cuéntanos con al menos 10 caracteres qué quieres revisar en la llamada.',
};

/**
 * Normaliza lo que llegue (sessionStorage, JSON del servidor) a un BookingForm completo.
 * @param {unknown} raw
 * @returns {BookingForm}
 */
export function toForm(raw) {
  const o = raw && typeof raw === 'object' ? /** @type {Record<string, unknown>} */ (raw) : {};
  const s = (k) => (typeof o[k] === 'string' ? /** @type {string} */ (o[k]) : '');
  return {
    fullName: s('fullName'),
    email: s('email'),
    whatsapp: s('whatsapp'),
    businessName: s('businessName'),
    website: s('website'),
    industry: s('industry'),
    teamSize: s('teamSize'),
    revenue: s('revenue'),
    timeDrains: Array.isArray(o.timeDrains) ? o.timeDrains.filter((d) => typeof d === 'string') : [],
    tools: s('tools'),
    goal: s('goal'),
  };
}

/**
 * Validación compartida (el servidor la repite: nunca se confía en el navegador). Mismas reglas que riklanderos.tech.
 * @param {SessionType} type
 * @param {BookingForm} f
 * @returns {FormErrors}
 */
export function validateForm(type, f) {
  /** @type {FormErrors} */
  const e = {};
  const t = (s) => String(s ?? '').trim();
  const drains = Array.isArray(f.timeDrains) ? f.timeDrains : [];
  if (t(f.fullName).length < 3) e.fullName = ERRORS.fullName;
  if (!EMAIL_RE.test(t(f.email)) || t(f.email).length > 200) e.email = ERRORS.email;
  if (t(f.whatsapp).replace(/\D/g, '').length < 10) e.whatsapp = ERRORS.whatsapp;
  if (t(f.businessName).length < 2) e.businessName = ERRORS.businessName;
  if (t(f.website).length > 200) e.website = ERRORS.website;
  if (!INDUSTRIES.includes(/** @type {any} */ (f.industry))) e.industry = ERRORS.industry;
  if (!TEAM_SIZES.includes(/** @type {any} */ (f.teamSize))) e.teamSize = ERRORS.teamSize;
  if (!REVENUES.includes(/** @type {any} */ (f.revenue))) e.revenue = ERRORS.revenue;
  if (type === 'power') {
    if (drains.length < 1) e.timeDrains = ERRORS.timeDrainsMin;
    else if (drains.length > 3 || drains.some((d) => !TIME_DRAINS.includes(/** @type {any} */ (d)))) e.timeDrains = ERRORS.timeDrainsMax;
    if (t(f.tools).length < 2 || t(f.tools).length > 300) e.tools = ERRORS.tools;
    if (t(f.goal).length < 20 || t(f.goal).length > 1000) e.goal = ERRORS.goalPower;
  } else if (t(f.goal).length < 10 || t(f.goal).length > 600) {
    e.goal = ERRORS.goalDiscovery;
  }
  return e;
}

/* ── Fechas ──────────────────────────────────────────────────── */

/**
 * Instante UTC (ISO) de una fecha y hora en CDMX.
 * @param {string} date YYYY-MM-DD
 * @param {string} time HH:MM
 */
export function cdmxToIso(date, time) {
  return new Date(`${date}T${time}:00${CDMX_OFFSET}`).toISOString();
}

/**
 * YYYY-MM-DD en CDMX para un instante.
 * @param {Date} d
 */
export function cdmxDateKey(d) {
  return new Date(d.getTime() - 6 * 3600_000).toISOString().slice(0, 10);
}

/**
 * Los próximos N días hábiles (lunes a viernes) en CDMX, empezando mañana.
 * @param {Date} [now]
 * @returns {string[]}
 */
export function bookableDates(now = new Date()) {
  /** @type {string[]} */
  const out = [];
  const base = new Date(`${cdmxDateKey(now)}T12:00:00Z`);
  for (let i = 1; out.length < BOOKABLE_BUSINESS_DAYS && i < 15; i++) {
    const d = new Date(base);
    d.setUTCDate(base.getUTCDate() + i);
    const wd = d.getUTCDay();
    if (wd === 0 || wd === 6) continue;
    out.push(d.toISOString().slice(0, 10));
  }
  return out;
}

/**
 * Lunes (YYYY-MM-DD) de la semana CDMX de una fecha: el cupo de Power Sessions es de lunes a domingo.
 * @param {string} date
 */
export function weekKey(date) {
  const d = new Date(`${date}T12:00:00Z`);
  const wd = (d.getUTCDay() + 6) % 7;
  d.setUTCDate(d.getUTCDate() - wd);
  return d.toISOString().slice(0, 10);
}

/**
 * @param {string} date YYYY-MM-DD
 * @returns {{ weekday: string, day: string, month: string }}
 */
export function formatDayEs(date) {
  const d = new Date(`${date}T12:00:00${CDMX_OFFSET}`);
  const f = (o) => new Intl.DateTimeFormat('es-MX', { timeZone: CDMX_TZ, ...o }).format(d);
  return { weekday: f({ weekday: 'long' }), day: f({ day: 'numeric' }), month: f({ month: 'long' }) };
}

/**
 * "10:00 AM" en la zona indicada (CDMX por defecto).
 * @param {string} iso
 * @param {string} [timeZone]
 */
export function formatTimeEs(iso, timeZone = CDMX_TZ) {
  return new Intl.DateTimeFormat('es-MX', { timeZone, hour: 'numeric', minute: '2-digit', hour12: true })
    .format(new Date(iso))
    .replace(/\s?([ap])\.?\s?m\.?/i, (_, x) => ` ${String(x).toUpperCase()}M`);
}

/**
 * "Martes 21 de octubre · 10:00 AM" (hora CDMX).
 * @param {string} iso
 */
export function formatSlotEs(iso) {
  const date = cdmxDateKey(new Date(iso));
  const { weekday, day, month } = formatDayEs(date);
  return `${weekday.charAt(0).toUpperCase()}${weekday.slice(1)} ${day} de ${month} · ${formatTimeEs(iso)}`;
}

/**
 * WhatsApp del formulario ("+52 3312345678", "+52 33 1234 5678") → E.164 ("+523312345678").
 * Si no trae "+", se asume que los dígitos ya incluyen la lada. Vacío si no hay dígitos.
 * @param {string} s
 */
export function phoneToE164(s) {
  const digits = String(s ?? '').replace(/\D/g, '').slice(0, 15);
  return digits ? `+${digits}` : '';
}
