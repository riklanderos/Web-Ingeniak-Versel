// Utilidades de las pruebas de la cotización (no es un archivo de prueba).
// Sin red: `fetch` se simula por prueba con `t.mock.method(globalThis, 'fetch', …)`.
// Ningún valor real: el token y las URL de Kommo/webhook son de mentira.
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

export const ROOT = fileURLToPath(new URL('../../', import.meta.url));
export const CATALOGO = fileURLToPath(new URL('../../src/data/cotizar.json', import.meta.url));
export const ORIGIN = 'http://127.0.0.1:4321';
export const URL_API = `${ORIGIN}/api/cotizar/`;

/** Valores de mentira (nunca reales). */
export const FAKE = Object.freeze({
  token: 'tok-prueba-no-real-000',
  subdominio: 'ejemplo',
  base: 'https://ejemplo.kommo.com/api/v4',
  webhook: 'https://hooks.ejemplo.test/ingeniak',
  secreto: 'secreto-de-prueba',
});

/** Variables que cada prueba limpia y restaura. */
const ENV_KEYS = [
  'VERCEL_ENV',
  'KOMMO_SUBDOMAIN',
  'KOMMO_TOKEN',
  'KOMMO_BASE_URL',
  'KOMMO_PIPELINE_ID',
  'KOMMO_STATUS_ID',
  'KOMMO_RESPONSIBLE_USER_ID',
  'KOMMO_AGENDA_PIPELINE_ID',
  'KOMMO_AGENDA_STATUS_ID',
  'NOTIFY_WEBHOOK_URL',
  'NOTIFY_WEBHOOK_SECRET',
];

/**
 * Carga los módulos bajo prueba. Falla con un mensaje claro si falta el catálogo del modal.
 */
export async function cargar() {
  if (!existsSync(CATALOGO)) {
    throw new Error(
      'Falta src/data/cotizar.json. Lo escribe el área «modal» con el contenido de CAMBIO-COTIZAR §2.3 ' +
        '(el área «api» no lo crea). Sin ese catálogo no hay listas blancas ni mensajes de error: ' +
        'las pruebas de la cotización no pueden correr.',
    );
  }
  const [api, cotizar, kommo, http] = await Promise.all([
    import('../../api/cotizar.js'),
    import('../../server/cotizar.js'),
    import('../../server/kommo.js'),
    import('../../server/http.js'),
  ]);
  return { handler: api.default, cotizar, kommo, http };
}

/** Copia nueva del envío válido de ejemplo. */
export function valido(overrides = {}) {
  const base = JSON.parse(readFileSync(new URL('./fixtures/valido.json', import.meta.url), 'utf8'));
  return { ...base, submission_id: crypto.randomUUID(), ...overrides, meta: { ...base.meta, ...(overrides.meta ?? {}) } };
}

let ipSeq = 0;
/** IP distinta por petición (el límite por IP no se cruza entre pruebas). */
export function ipNueva() {
  ipSeq += 1;
  return `10.${(ipSeq >> 16) & 255}.${(ipSeq >> 8) & 255}.${ipSeq & 255}`;
}

/**
 * Petición al handler.
 * @param {unknown} body  objeto (se serializa) o texto crudo
 * @param {{ method?: string, headers?: Record<string, string | null>, ip?: string }} [opts]
 */
export function peticion(body, { method = 'POST', headers = {}, ip } = {}) {
  /** @type {Record<string, string>} */
  const h = {
    origin: ORIGIN,
    host: '127.0.0.1:4321',
    'content-type': 'application/json',
    'x-forwarded-for': ip ?? ipNueva(),
  };
  for (const [k, v] of Object.entries(headers)) {
    if (v === null) delete h[k];
    else h[k] = v;
  }
  const init = { method, headers: h };
  if (method !== 'GET' && method !== 'HEAD' && body !== undefined) {
    init.body = typeof body === 'string' ? body : JSON.stringify(body);
  }
  return new Request(URL_API, init);
}

/**
 * Limpia las variables de Kommo/webhook/Vercel, pone las dadas y las restaura al terminar la prueba.
 * @param {import('node:test').TestContext} t
 * @param {Record<string, string>} vars
 */
export function entorno(t, vars = {}) {
  const prev = Object.fromEntries(ENV_KEYS.map((k) => [k, process.env[k]]));
  for (const k of ENV_KEYS) delete process.env[k];
  Object.assign(process.env, vars);
  t.after(() => {
    for (const k of ENV_KEYS) {
      if (prev[k] === undefined) delete process.env[k];
      else process.env[k] = prev[k];
    }
  });
}

/** Variables de una cuenta de Kommo de mentira. */
export function kommoVars(extra = {}) {
  return { KOMMO_SUBDOMAIN: FAKE.subdominio, KOMMO_TOKEN: FAKE.token, ...extra };
}

/**
 * Silencia y espía console.log / console.error / console.warn.
 * @param {import('node:test').TestContext} t
 * @returns {string[]} todo lo que se registró
 */
export function logs(t) {
  /** @type {string[]} */
  const out = [];
  for (const m of ['log', 'error', 'warn', 'info']) {
    t.mock.method(console, m, (...args) => {
      out.push(args.map((a) => (typeof a === 'string' ? a : JSON.stringify(a))).join(' '));
    });
  }
  return out;
}

/**
 * @typedef {{ method: string, url: string, path: string, headers: Record<string, string>, body: any }} Llamada
 * @typedef {(c: Llamada) => (Response | { status?: number, json?: unknown, text?: string } | undefined)} Ruta
 */

/**
 * Simula `fetch`. `rutas` es una lista de [prueba, respuesta]: la prueba es 'MÉTODO /ruta' (prefijo
 * de la ruta relativa a la base de Kommo, o URL completa para el webhook) o una función.
 * Cada llamada toma la primera ruta que coincide (las de un solo uso se marcan con `once: true`).
 * @param {import('node:test').TestContext} t
 * @param {Array<{ match: string | ((c: Llamada) => boolean), status?: number, json?: unknown, text?: string, once?: boolean, delay?: number }>} rutas
 */
export function simularFetch(t, rutas = []) {
  /** @type {Llamada[]} */
  const llamadas = [];
  const pendientes = rutas.map((r) => ({ ...r, usada: false }));
  t.mock.method(globalThis, 'fetch', async (input, init = {}) => {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
    const method = (init.method ?? 'GET').toUpperCase();
    const headers = Object.fromEntries(new Headers(init.headers ?? {}).entries());
    let body = init.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch {
        /* texto */
      }
    }
    const base = process.env.KOMMO_BASE_URL
      ? process.env.KOMMO_BASE_URL.replace(/\/+$/, '').replace(/(\/api\/v4)?$/, '/api/v4')
      : `https://${process.env.KOMMO_SUBDOMAIN}.kommo.com/api/v4`;
    const path = url.startsWith(base) ? url.slice(base.length) : url;
    /** @type {Llamada} */
    const c = { method, url, path, headers, body };
    llamadas.push(c);
    const r = pendientes.find((p) => {
      if (p.usada) return false;
      if (typeof p.match === 'function') return p.match(c);
      const [m, ...rest] = p.match.split(' ');
      const pref = rest.join(' ');
      return m === method && (path.startsWith(pref) || url.startsWith(pref));
    });
    if (!r) throw new TypeError(`fetch simulado sin ruta para ${method} ${url}`);
    if (r.once) r.usada = true;
    if (r.delay) await new Promise((res) => setTimeout(res, r.delay));
    const status = r.status ?? 200;
    if (status === 0) throw new TypeError('fetch failed (simulado)');
    const text = r.text ?? (r.json === undefined ? null : JSON.stringify(r.json));
    return new Response(status === 204 ? null : text, {
      status,
      headers: { 'content-type': status >= 400 ? 'application/problem+json' : 'application/hal+json' },
    });
  });
  return llamadas;
}

/** Respuestas de Kommo de ejemplo (formas de la documentación; ids ilustrativos). */
export const KOMMO = Object.freeze({
  camposTracking: {
    _embedded: {
      custom_fields: [
        { id: 501, code: 'UTM_SOURCE', type: 'tracking_data' },
        { id: 502, code: 'UTM_MEDIUM', type: 'tracking_data' },
        { id: 503, code: 'UTM_CAMPAIGN', type: 'tracking_data' },
        { id: 508, code: 'REFERRER', type: 'tracking_data' },
        { id: 509, code: 'GCLID', type: 'tracking_data' },
        { id: 900, code: null, type: 'text' },
      ],
    },
  },
  complexOk: [{ id: 9774766, contact_id: 12117258, company_id: 12117260, request_id: ['0'], merged: false }],
  notaOk: { _embedded: { notes: [{ id: 42, entity_id: 9774766 }] } },
});

/** Lee el JSON de una respuesta. @param {Response} r */
export async function cuerpo(r) {
  return JSON.parse(await r.text());
}
