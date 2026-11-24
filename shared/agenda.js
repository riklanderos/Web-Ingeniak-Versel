/**
 * Reglas de la agenda (Discovery Session y Power Session) · lógica isomorfa: la importan el navegador
 * (src/scripts/agenda/booking.ts) y el servidor (server/agenda/*, api/agenda/*).
 * Port 1:1 de `lib/agenda/config.ts` de riklanderos.tech (mismas reglas, listas y validación) + constantes
 * de Ingeniak (CAMBIO-COTIZAR §5.2). Puro: sin Node ni DOM. JavaScript ESM con JSDoc.
 *
 * Zona de operación: America/Mexico_City (UTC−6 todo el año; México no tiene horario de verano desde 2022).
 */

import { esEnlace } from './enlace.js';

/** @typedef {'power' | 'discovery'} SessionType */
/**
 * @typedef {{
 *   fullName: string, email: string, whatsapp: string, businessName: string, website: string, noWebsite?: boolean,
 *   industry: string, teamSize: string, revenue: string, timeDrains: string[], tools: string, goal: string
 * }} BookingForm
 */
/** @typedef {Partial<Record<keyof BookingForm, string>>} FormErrors */
/** @typedef {{ date: string, slots: string[] }} DayAvailability */

export const CDMX_TZ = 'America/Mexico_City';
export const CDMX_OFFSET = '-06:00';

/** Días hábiles (lunes a viernes) que se ofrecen por omisión, contados a partir de mañana (Power Session). Cada sesión
 *  fija los suyos en SESSION_RULES[tipo].days. */
export const BOOKABLE_BUSINESS_DAYS = 5;
/** Anticipación mínima por omisión para reservar (horas); cada sesión fija la suya en SESSION_RULES[tipo].minHoursAhead. */
export const MIN_HOURS_AHEAD = 12;
/** Colchón entre citas: un horario se descarta si choca con algo ocupado ± este margen (minutos). */
export const BUFFER_MINUTES = 15;
/** Cupo semanal de Power Sessions (cuentan confirmadas y apartadas). */
export const POWER_WEEKLY_LIMIT = 4;
/** Minutos que se aparta un horario mientras se paga en Stripe (Stripe exige ≥ 30; al visitante se le dicen 30). */
export const HOLD_MINUTES = 31;

/**
 * days: días hábiles que se ofrecen · minHoursAhead: anticipación mínima (horas) · sameDay: si el día de hoy (hábil) también
 * se ofrece, con los horarios que aún cumplan la anticipación (si no le queda ninguno, no aparece).
 * @type {Record<SessionType, { minutes: number, times: readonly string[], label: string, days: number, minHoursAhead: number, sameDay: boolean }>}
 */
export const SESSION_RULES = {
  power: {
    minutes: 90,
    // 90 min + 15 de colchón, 10:00–17:00 CDMX
    times: ['10:00', '11:45', '13:30', '15:15'],
    label: 'Power Session',
    days: BOOKABLE_BUSINESS_DAYS,
    minHoursAhead: MIN_HOURS_AHEAD,
    sameDay: false,
  },
  discovery: {
    minutes: 30,
    // 30 min + 15 de colchón, 9:00–17:45 CDMX con comida de 14:00 a 15:00 (más agenda para campañas, pedido del cliente,
    // 2026-11-11: antes 10:00–17:00 con 8 horarios, 5 días hábiles y 12 h de anticipación)
    times: ['09:00', '09:45', '10:30', '11:15', '12:00', '12:45', '13:30', '15:00', '15:45', '16:30', '17:15'],
    label: 'Discovery Session',
    days: 10,
    minHoursAhead: 3,
    sameDay: true,
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

// Lista única de giros: es la misma que usa «Cotizar proyecto» (src/data/cotizar.json → industrias) y el campo
// «Industria» de Kommo (shared/kommo-esquema.js). Las ocho primeras coinciden con las páginas de /industrias/.
export const INDUSTRIES = /** @type {const} */ ([
  'Salud',
  'Belleza y estética',
  'Nutrición',
  'Finanzas',
  'Inmobiliario',
  'Industrial y logística',
  'Retail y e-commerce',
  'Restaurantes y hoteles',
  'Servicios profesionales',
  'Construcción',
  'Educación',
  'Agencia o marketing',
  'Automotriz',
  'Tecnología y software',
  'Otra',
]);

// Lista única de tamaños: la misma de «Cotizar proyecto» (src/data/cotizar.json → tamanos) y de «Tamaño de empresa» en Kommo.
export const TEAM_SIZES = /** @type {const} */ (['Solo yo', '2–5', '6–10', '11–50', '51–200', 'Más de 200']);

// Facturación mensual en dólares (mismo formato que los presupuestos de «Cotizar proyecto»). Es la lista del campo
// «Facturación mensual» de Kommo (shared/kommo-esquema.js): los rangos se tocan para que ninguna cifra quede fuera.
export const REVENUES = /** @type {const} */ ([
  'Menos de USD 15,000',
  'USD 15,000 a 20,000',
  'USD 20,000 a 30,000',
  'USD 30,000 a 50,000',
  'USD 50,000 a 100,000',
  'USD 100,000 a 150,000',
  'Más de USD 150,000',
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
  noWebsite: false,
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
  website: 'Pega el enlace de tu web o red social, por ejemplo instagram.com/tunegocio.',
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
    noWebsite: o.noWebsite === true,
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
  // Con «Aún no tengo web ni redes» el enlace no se pide (y no se guarda).
  if (f.noWebsite !== true && (t(f.website).length > 200 || !esEnlace(f.website))) e.website = ERRORS.website;
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
 * Los próximos N días hábiles (lunes a viernes) en CDMX, empezando mañana; con sameDay, hoy (si es hábil) va antes de ellos.
 * @param {Date} [now]
 * @param {{ days?: number, sameDay?: boolean }} [opts]
 * @returns {string[]}
 */
export function bookableDates(now = new Date(), opts = {}) {
  const days = opts.days ?? BOOKABLE_BUSINESS_DAYS;
  /** @type {string[]} */
  const out = [];
  const base = new Date(`${cdmxDateKey(now)}T12:00:00Z`);
  const wd0 = base.getUTCDay();
  if (opts.sameDay && wd0 !== 0 && wd0 !== 6) out.push(base.toISOString().slice(0, 10));
  const total = out.length + days;
  for (let i = 1; out.length < total && i < days * 2 + 7; i++) {
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

/* ───────────────────────── Versión en inglés (/en/, 2026-11-20) ─────────────────────────
 * El formulario en inglés manda los MISMOS valores en español (los valida el servidor y llegan así a Kommo); solo cambia
 * lo que ve la persona: etiquetas de las opciones, errores y fechas. */
/** @type {Record<string, string>} */
export const OPTION_LABELS_EN = {
  'Salud': 'Healthcare',
  'Belleza y estética': 'Beauty and aesthetics',
  'Nutrición': 'Nutrition',
  'Finanzas': 'Finance',
  'Inmobiliario': 'Real estate',
  'Industrial y logística': 'Industrial and logistics',
  'Retail y e-commerce': 'Retail and e-commerce',
  'Restaurantes y hoteles': 'Restaurants and hotels',
  'Servicios profesionales': 'Professional services',
  'Construcción': 'Construction',
  'Educación': 'Education',
  'Agencia o marketing': 'Agency or marketing',
  'Automotriz': 'Automotive',
  'Tecnología y software': 'Technology and software',
  'Otra': 'Other',
  'Solo yo': 'Just me',
  'Más de 200': 'More than 200',
  'Menos de USD 15,000': 'Under USD 15,000',
  'USD 15,000 a 20,000': 'USD 15,000 to 20,000',
  'USD 20,000 a 30,000': 'USD 20,000 to 30,000',
  'USD 30,000 a 50,000': 'USD 30,000 to 50,000',
  'USD 50,000 a 100,000': 'USD 50,000 to 100,000',
  'USD 100,000 a 150,000': 'USD 100,000 to 150,000',
  'Más de USD 150,000': 'More than USD 150,000',
  'Apenas voy a empezar': "I'm just getting started",
  'Atender WhatsApp y prospectos': 'Answering WhatsApp and leads',
  'Cotizar': 'Preparing quotes',
  'Cobrar y dar seguimiento a pagos': 'Collecting and chasing payments',
  'Supervisar al equipo': 'Supervising the team',
  'Atención a clientes y quejas': 'Customer service and complaints',
  'Administración y facturación': 'Admin and invoicing',
  'Compras y proveedores': 'Purchasing and suppliers',
  'Marketing y contenido': 'Marketing and content',
  'Otro': 'Other',
};
/** Etiqueta visible de una opción en el idioma de la página (el valor no cambia). */
export const optionLabel = (/** @type {string} */ v, /** @type {'es'|'en'} */ lang) => (lang === 'en' ? OPTION_LABELS_EN[v] ?? v : v);

/** Mismas claves que ERRORS. */
export const ERRORS_EN = {
  fullName: 'Enter your full name.',
  email: "Check your email: that's where your invite goes.",
  whatsapp: 'Include your WhatsApp with country code (10 digits or more).',
  businessName: 'Enter your business name.',
  website: 'Paste the link to your website or social media, for example instagram.com/yourbusiness.',
  industry: 'Pick an industry.',
  teamSize: 'Pick your team size.',
  revenue: 'Pick a range.',
  timeDrainsMin: 'Pick at least one.',
  timeDrainsMax: '3 options max.',
  tools: 'Tell us what you use today (CRM, Excel, WhatsApp…).',
  goalPower: 'Tell us in at least 20 characters what you want to solve in the session.',
  goalDiscovery: 'Tell us in at least 10 characters what you want to review on the call.',
};
/** Error en el idioma de la página: recibe el texto en español que devuelve validateForm. */
export function errorText(/** @type {string} */ es, /** @type {'es'|'en'} */ lang) {
  if (lang !== 'en') return es;
  const k = /** @type {keyof typeof ERRORS} */ (Object.keys(ERRORS).find((x) => ERRORS[/** @type {keyof typeof ERRORS} */ (x)] === es));
  return k ? ERRORS_EN[k] : es;
}
/** "Tuesday, October 21 · 10:00 AM" (hora CDMX), para la versión en inglés. */
export function formatSlotEn(/** @type {string} */ iso) {
  const d = new Date(iso);
  const day = new Intl.DateTimeFormat('en-US', { timeZone: CDMX_TZ, weekday: 'long', month: 'long', day: 'numeric' }).format(d);
  const time = new Intl.DateTimeFormat('en-US', { timeZone: CDMX_TZ, hour: 'numeric', minute: '2-digit', hour12: true }).format(d);
  return `${day} · ${time}`;
}
/** { weekday, day, month } de una fecha AAAA-MM-DD en inglés (días del paso 2). */
export function formatDayEn(/** @type {string} */ date) {
  const d = new Date(`${date}T12:00:00${CDMX_OFFSET}`);
  const f = (/** @type {Intl.DateTimeFormatOptions} */ o) => new Intl.DateTimeFormat('en-US', { timeZone: CDMX_TZ, ...o }).format(d);
  return { weekday: f({ weekday: 'long' }), day: f({ day: 'numeric' }), month: f({ month: 'long' }) };
}
