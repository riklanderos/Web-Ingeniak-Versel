// Utilidades de las pruebas de la agenda (no es un archivo de prueba).
// Sin red: `fetch` se simula por prueba con `t.mock.method(globalThis, 'fetch', …)` y unos "servidores" de mentira
// con estado para Google Calendar, Stripe, Kommo y Supabase. Ningún valor real: llaves, IDs y URLs son de prueba.
import { __resetHttp } from '../../server/http.js';
import { __resetKommo } from '../../server/kommo.js';
import { __resetGoogleToken } from '../../server/agenda/google-auth.js';
import { __resetMock } from '../../server/agenda/mock.js';
import { cuentaSimulada, Ids } from '../cotizar/_kommo-simulador.mjs';

export { KommoSimulado, TOKEN_SIMULADO } from '../cotizar/_kommo-simulador.mjs';

export const ORIGIN = 'http://127.0.0.1:4321';

/** Valores de mentira (nunca reales). */
export const FAKE = Object.freeze({
  power: 'cal-power@prueba.test',
  discovery: 'cal-discovery@prueba.test',
  googleId: 'cliente-prueba.apps.test',
  googleSecret: 'secreto-google-prueba',
  googleRefresh: 'refresh-prueba-no-real',
  googleToken: 'tok-google-prueba',
  stripeKey: 'sk_test_prueba_no_real_000',
  cron: 'cron-secreto-de-prueba',
  kommoBase: 'https://ejemplo.kommo.com/api/v4',
  kommoToken: 'tok-kommo-prueba-no-real',
  supabase: 'https://supabase-prueba.test',
  supabaseKey: 'service-role-prueba-no-real',
});

const ENV_KEYS = [
  'VERCEL_ENV', 'VERCEL_URL', 'VERCEL_BRANCH_URL', 'AGENDA_BASE_URL', 'AGENDA_MOCK', 'AGENDA_MOCK_LLENO',
  'POWER_CALENDAR_ID', 'DISCOVERY_CALENDAR_ID', 'GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET', 'GOOGLE_REFRESH_TOKEN',
  'AGENDA_GOOGLE_CONNECTOR', 'AGENDA_GOOGLE_SUBJECT', 'STRIPE_SECRET_KEY', 'CRON_SECRET',
  'KOMMO_SUBDOMAIN', 'KOMMO_TOKEN', 'KOMMO_BASE_URL', 'KOMMO_PIPELINE_ID', 'KOMMO_STATUS_ID', 'KOMMO_RESPONSIBLE_USER_ID',
  'KOMMO_AGENDA_PIPELINE_ID', 'KOMMO_AGENDA_STATUS_ID', 'NOTIFY_WEBHOOK_URL', 'NOTIFY_WEBHOOK_SECRET',
  'SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY',
];

/**
 * Limpia las variables de la agenda para una prueba y las restaura al terminar. Reinicia los estados en memoria.
 * @param {import('node:test').TestContext} t
 * @param {Record<string, string>} [vars]
 */
export function env(t, vars = {}) {
  const saved = Object.fromEntries(ENV_KEYS.map((k) => [k, process.env[k]]));
  for (const k of ENV_KEYS) delete process.env[k];
  Object.assign(process.env, vars);
  __resetHttp();
  __resetKommo();
  __resetGoogleToken();
  __resetMock();
  t.after(() => {
    for (const k of ENV_KEYS) {
      if (saved[k] === undefined) delete process.env[k];
      else process.env[k] = saved[k];
    }
  });
}

/** Variables de una instalación "real" (adaptadores reales, todo hacia los servidores de mentira). */
export const REAL = Object.freeze({
  POWER_CALENDAR_ID: FAKE.power,
  DISCOVERY_CALENDAR_ID: FAKE.discovery,
  GOOGLE_CLIENT_ID: FAKE.googleId,
  GOOGLE_CLIENT_SECRET: FAKE.googleSecret,
  GOOGLE_REFRESH_TOKEN: FAKE.googleRefresh,
  STRIPE_SECRET_KEY: FAKE.stripeKey,
});
export const KOMMO = Object.freeze({ KOMMO_BASE_URL: FAKE.kommoBase, KOMMO_TOKEN: FAKE.kommoToken });
export const SUPABASE = Object.freeze({ SUPABASE_URL: FAKE.supabase, SUPABASE_SERVICE_ROLE_KEY: FAKE.supabaseKey });

const jsonRes = (body, status = 200) =>
  new Response(body === null ? null : JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

/* ── Google Calendar de mentira (con estado) ─────────────────────────────────────────────── */

export class FakeGoogle {
  constructor() {
    /** @type {Map<string, any>} */
    this.events = new Map();
    /** @type {Record<string, {start: string, end: string}[]>} ocupado fijo por calendario */
    this.busy = {};
    this.seq = 0;
    /** @type {any[]} */
    this.calls = [];
    /** @type {Set<string>} ids cuyo GET falla con 500 */
    this.failGet = new Set();
    this.tokenCalls = 0;
  }
  /** Evento sembrado directamente. */
  seed(cal, ev) {
    const id = ev.id ?? `seed${String(++this.seq).padStart(4, '0')}`;
    this.events.set(id, { status: 'confirmed', ...ev, id, _cal: cal });
    return id;
  }
  /** @param {URL} u @param {RequestInit} init */
  handle(u, init) {
    if (u.origin === 'https://oauth2.googleapis.com' && u.pathname === '/token') {
      this.tokenCalls++;
      return jsonRes({ access_token: FAKE.googleToken, expires_in: 3600, token_type: 'Bearer' });
    }
    if (u.origin !== 'https://www.googleapis.com' || !u.pathname.startsWith('/calendar/v3')) return null;
    const method = (init?.method ?? 'GET').toUpperCase();
    const body = init?.body ? JSON.parse(String(init.body)) : undefined;
    const auth = new Headers(init?.headers).get('authorization');
    const path = u.pathname.slice('/calendar/v3'.length);
    this.calls.push({ method, path, query: Object.fromEntries(u.searchParams), queryAll: u.searchParams, body, auth });
    if (auth !== `Bearer ${FAKE.googleToken}`) return jsonRes({ error: { code: 401, message: 'Invalid Credentials' } }, 401);

    if (path === '/freeBusy' && method === 'POST') {
      const a = Date.parse(body.timeMin);
      const b = Date.parse(body.timeMax);
      const calendars = {};
      for (const { id } of body.items) {
        const list = [...(this.busy[id] ?? [])];
        for (const e of this.events.values()) {
          if (e._cal !== id || e.status === 'cancelled') continue;
          const s = Date.parse(e.start.dateTime);
          const t = Date.parse(e.end.dateTime);
          if (s < b && a < t) list.push({ start: e.start.dateTime, end: e.end.dateTime });
        }
        calendars[id] = { busy: list };
      }
      return jsonRes({ kind: 'calendar#freeBusy', calendars });
    }
    const m = /^\/calendars\/([^/]+)(?:\/events(?:\/([^/]+))?)?$/.exec(path);
    if (!m) return jsonRes({ error: { code: 404, message: 'Not Found' } }, 404);
    const cal = decodeURIComponent(m[1]);
    const id = m[2] ? decodeURIComponent(m[2]) : null;
    if (!path.includes('/events')) return jsonRes({ id: cal });

    if (!id && method === 'GET') {
      const a = Date.parse(u.searchParams.get('timeMin'));
      const b = Date.parse(u.searchParams.get('timeMax'));
      const props = u.searchParams.getAll('privateExtendedProperty').map((kv) => kv.split('='));
      const items = [...this.events.values()].filter((e) => {
        if (e._cal !== cal) return false;
        const s = Date.parse(e.start?.dateTime ?? '');
        const t = Date.parse(e.end?.dateTime ?? '');
        if (!(s < b && a < t)) return false;
        const p = e.extendedProperties?.private ?? {};
        return props.every(([k, v]) => p[k] === v);
      });
      return jsonRes({ items: items.map(strip) });
    }
    if (!id && method === 'POST') {
      const nid = `ev${String(++this.seq).padStart(6, '0')}x`;
      const ev = { ...body, id: nid, status: 'confirmed', _cal: cal, created: new Date(0).toISOString(), _sendUpdates: u.searchParams.get('sendUpdates') };
      if (body.conferenceData?.createRequest) ev.hangoutLink = `https://meet.google.test/${nid}`;
      this.events.set(nid, ev);
      return jsonRes(strip(ev));
    }
    const ev = id ? this.events.get(id) : null;
    if (id && this.failGet.has(id) && method === 'GET') return jsonRes({ error: { code: 500, message: 'Backend Error' } }, 500);
    if (!ev || ev._cal !== cal) return jsonRes({ error: { code: 404, message: 'Not Found' } }, 404);
    if (method === 'GET') return jsonRes(strip(ev));
    if (method === 'PATCH') {
      for (const [k, v] of Object.entries(body)) {
        if (k === 'extendedProperties') ev.extendedProperties = { private: { ...(v?.private ?? {}) } };
        else ev[k] = v;
      }
      if (body.conferenceData?.createRequest && !ev.hangoutLink) ev.hangoutLink = `https://meet.google.test/${id}`;
      ev._sendUpdates = u.searchParams.get('sendUpdates');
      return jsonRes(strip(ev));
    }
    if (method === 'DELETE') {
      this.events.delete(id);
      return new Response(null, { status: 204 });
    }
    return jsonRes({ error: { code: 405, message: 'Method' } }, 405);
  }
}
const strip = (e) => {
  const { _cal, _sendUpdates, ...rest } = e;
  return JSON.parse(JSON.stringify(rest));
};

/* ── Stripe de mentira ───────────────────────────────────────────────────────────────────── */

export class FakeStripe {
  constructor() {
    /** @type {Map<string, any>} */
    this.sessions = new Map();
    this.seq = 0;
    /** @type {any[]} */
    this.calls = [];
    this.down = false;
    /** @type {Set<string>} */
    this.failRetrieve = new Set();
  }
  pay(id) {
    const s = this.sessions.get(id);
    s.status = 'complete';
    s.payment_status = 'paid';
    s.customer_details = { email: s.customer_email };
  }
  /** @param {URL} u @param {RequestInit} init */
  handle(u, init) {
    if (u.origin !== 'https://api.stripe.com') return null;
    const method = (init?.method ?? 'GET').toUpperCase();
    const headers = new Headers(init?.headers);
    const form = init?.body ? new URLSearchParams(String(init.body)) : null;
    const path = u.pathname.replace(/^\/v1/, '');
    this.calls.push({ method, path, form, headers });
    if (headers.get('authorization') !== `Bearer ${FAKE.stripeKey}`) return jsonRes({ error: { type: 'invalid_request_error' } }, 401);
    if (path === '/checkout/sessions' && method === 'POST') {
      if (this.down) return jsonRes({ error: { type: 'api_error' } }, 500);
      const id = `cs_test_prueba${String(++this.seq).padStart(4, '0')}`;
      const metadata = {};
      for (const [k, v] of form) {
        const mm = /^metadata\[(.+)\]$/.exec(k);
        if (mm) metadata[mm[1]] = v;
      }
      const s = {
        id, object: 'checkout.session', url: `https://checkout.stripe.test/c/pay/${id}`, status: 'open', payment_status: 'unpaid',
        expires_at: Number(form.get('expires_at')), metadata, customer_email: form.get('customer_email'),
      };
      this.sessions.set(id, s);
      return jsonRes(s);
    }
    if (path === '/checkout/sessions' && method === 'GET') return jsonRes({ data: [] });
    const m = /^\/checkout\/sessions\/([^/]+)(\/expire)?$/.exec(path);
    if (!m) return jsonRes({ error: { type: 'invalid_request_error' } }, 404);
    const id = decodeURIComponent(m[1]);
    if (this.failRetrieve.has(id)) return jsonRes({ error: { type: 'api_error' } }, 500);
    const s = this.sessions.get(id);
    if (!s) return jsonRes({ error: { type: 'invalid_request_error', code: 'resource_missing' } }, 404);
    if (m[2] && method === 'POST') {
      if (s.status !== 'open') return jsonRes({ error: { type: 'invalid_request_error' } }, 400);
      s.status = 'expired';
      return jsonRes(s);
    }
    return jsonRes(s);
  }
}

/* ── Kommo de mentira ────────────────────────────────────────────────────────────────────── */

/** Cuenta de Kommo con la estructura aprobada (shared/kommo-esquema.js) e ids por nombre. */
export const CUENTA = cuentaSimulada();
export const IDS = new Ids(CUENTA);

/**
 * Kommo a nivel de `fetch` (sin validar cuerpos; para eso está KommoSimulado, el servidor HTTP local).
 * `estructura: false` = cuenta sin la estructura aprobada (el script de configuración no se ha corrido).
 */
export class FakeKommo {
  constructor({ estructura = true } = {}) {
    /** @type {any[]} */
    this.calls = [];
    this.down = false;
    this.seq = 4241;
    this.cuenta = estructura ? CUENTA : cuentaSimulada({ estructura: false });
  }
  /** @param {URL} u @param {RequestInit} init */
  handle(u, init) {
    if (!u.href.startsWith(FAKE.kommoBase)) return null;
    const method = (init?.method ?? 'GET').toUpperCase();
    const path = u.pathname.replace(/^\/api\/v4/, '');
    const body = init?.body ? JSON.parse(String(init.body)) : undefined;
    this.calls.push({ method, path, query: u.search, body });
    if (this.down) return jsonRes({ title: 'Internal' }, 500);
    if (path === '/contacts' && method === 'GET') return new Response(null, { status: 204 });
    if (path === '/leads/pipelines') {
      return jsonRes({ _embedded: { pipelines: this.cuenta.pipelines.map(({ statuses, ...p }) => ({ ...p, _embedded: { statuses } })) } });
    }
    if (path === '/leads/custom_fields') return jsonRes({ _embedded: { custom_fields: this.cuenta.campos } });
    if (path === '/leads/complex' && method === 'POST') return jsonRes([{ id: ++this.seq, contact_id: 77, company_id: 88 }]);
    if (path === '/leads/notes' && method === 'POST') return jsonRes({ _embedded: { notes: [{ id: 1 }] } });
    if (/^\/leads\/\d+$/.test(path) && method === 'PATCH') return jsonRes({ id: Number(path.split('/')[2]) });
    return jsonRes({ title: 'Not found' }, 404);
  }
  get complex() {
    return this.calls.filter((c) => c.path === '/leads/complex');
  }
  get notes() {
    return this.calls.filter((c) => c.path === '/leads/notes').map((c) => c.body[0]);
  }
}

/* ── Supabase de mentira ─────────────────────────────────────────────────────────────────── */

export class FakeSupabase {
  constructor() {
    /** @type {any[]} */
    this.calls = [];
    /** @type {Map<string, string>} event_id → token */
    this.briefs = new Map();
  }
  /** @param {URL} u @param {RequestInit} init */
  handle(u, init) {
    if (u.origin !== FAKE.supabase) return null;
    const method = (init?.method ?? 'GET').toUpperCase();
    const headers = new Headers(init?.headers);
    const body = init?.body ? JSON.parse(String(init.body)) : undefined;
    const path = u.pathname.replace(/^\/rest\/v1/, '');
    this.calls.push({ method, path, query: u.searchParams, body, headers });
    if (headers.get('apikey') !== FAKE.supabaseKey) return jsonRes({ message: 'no' }, 401);
    if (path === '/power_briefs' && method === 'GET') {
      const ev = (u.searchParams.get('event_id') ?? '').replace(/^eq\./, '');
      const tok = this.briefs.get(ev);
      return jsonRes(tok ? [{ token: tok }] : []);
    }
    if (path === '/power_briefs' && method === 'POST') {
      if (!this.briefs.has(body.event_id)) this.briefs.set(body.event_id, body.token);
      return jsonRes([{ token: this.briefs.get(body.event_id) }], 201);
    }
    if (path === '/leads') return new Response(null, { status: method === 'POST' ? 201 : 204 });
    return jsonRes({ message: 'no' }, 404);
  }
}

/**
 * Instala un `fetch` simulado que recorre los servidores de mentira; cualquier otra URL falla la prueba.
 * @param {import('node:test').TestContext} t
 * @param {...{ handle: (u: URL, init?: RequestInit) => Response | null }} fakes
 * @returns {{ all: { url: string, method: string }[] }}
 */
export function mockFetch(t, ...fakes) {
  const log = { all: /** @type {{ url: string, method: string }[]} */ ([]) };
  t.mock.method(globalThis, 'fetch', async (input, init = {}) => {
    const u = new URL(typeof input === 'string' ? input : input instanceof URL ? input.href : input.url);
    log.all.push({ url: u.href, method: (init.method ?? 'GET').toUpperCase() });
    for (const f of fakes) {
      const r = f.handle(u, init);
      if (r) return r;
    }
    throw new Error(`fetch inesperado en la prueba: ${u.origin}${u.pathname}`);
  });
  return log;
}

/** Reloj fijo: martes 20 de octubre de 2026, 10:00 en CDMX. */
export const NOW = new Date('2026-10-20T16:00:00.000Z');

/** Formulario válido de ejemplo (datos de mentira). */
export function form(type = 'discovery', over = {}) {
  return {
    fullName: 'Ana Prueba Ejemplo',
    email: 'ana@ejemplo.test',
    whatsapp: '+52 3312345678',
    businessName: 'Clínica Ejemplo',
    website: 'ejemplo.test',
    industry: 'Salud y bienestar',
    teamSize: '6–10',
    revenue: '$100K–$300K MXN',
    timeDrains: type === 'power' ? ['Cotizar', 'Supervisar al equipo'] : [],
    tools: type === 'power' ? 'Excel y WhatsApp Business' : '',
    goal: type === 'power' ? 'Ordenar el seguimiento de prospectos y dejar de cotizar a mano.' : 'Responder más rápido por WhatsApp.',
    ...over,
  };
}

/** Atribución de ejemplo (sin datos personales). */
export const ATRIB = Object.freeze({
  utm_source: 'meta', utm_medium: 'paid', utm_campaign: 'prueba', referrer: 'https://www.ejemplo.test/', page_path: '/discovery/',
  zona: 'America/Bogota', src: '601-hero', desde: 'hero',
});

/**
 * Petición a una función de la API (mismo origen por defecto).
 * @param {string} path @param {{ method?: string, body?: unknown, headers?: Record<string, string> }} [o]
 */
export function req(path, { method = 'GET', body, headers = {} } = {}) {
  return new Request(`${ORIGIN}${path}`, {
    method,
    headers: { host: '127.0.0.1:4321', ...(body !== undefined ? { 'content-type': 'application/json', origin: ORIGIN } : {}), ...headers },
    body: body === undefined ? undefined : typeof body === 'string' ? body : JSON.stringify(body),
  });
}

/** Lee el JSON de una respuesta. @param {Response} r */
export async function read(r) {
  const text = await r.text();
  return { status: r.status, body: text ? JSON.parse(text) : null, headers: r.headers };
}

/** Silencia y captura console.log/console.error durante una prueba. @param {import('node:test').TestContext} t */
export function captureLogs(t) {
  const lines = [];
  t.mock.method(console, 'log', (...a) => lines.push(a.map(String).join(' ')));
  t.mock.method(console, 'error', (...a) => lines.push(a.map(String).join(' ')));
  t.mock.method(console, 'warn', (...a) => lines.push(a.map(String).join(' ')));
  return lines;
}
