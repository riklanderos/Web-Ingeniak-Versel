/**
 * Simulación local de la agenda (CAMBIO-COTIZAR §5.7). Activa SOLO si no hay `VERCEL_ENV` (nunca en Vercel) y además
 * `AGENDA_MOCK=1` o falta `POWER_CALENDAR_ID`. Así `astro dev` (127.0.0.1:4321) recorre los dos flujos completos sin
 * credenciales y sin mandar nada a Google, Stripe, Kommo ni Supabase.
 *
 * - Google: eventos en memoria del proceso. Ocupación determinista: el 2.º horario de cada día de cada tipo está ocupado.
 *   `AGENDA_MOCK_LLENO=1` llena el cupo de Power de la semana.
 * - Stripe: Checkout simulado → `/dev/agenda-checkout/?session_id=cs_test_MOCK_<evento>&apartado=<evento>`; "Simular pago"
 *   marca la sesión como pagada con `mockPay()` (POST /api/agenda/estado/, solo en simulación).
 * - Kommo: espía en memoria (siempre "creado"); Supabase y brief apagados.
 */
import { SESSION_RULES, cdmxDateKey, cdmxToIso } from '../../shared/agenda.js';
import { createLeads } from './leads.js';
import { briefUrl } from './brief.js';

/** @param {NodeJS.ProcessEnv} [env] */
export function mockActive(env = process.env) {
  return !env.VERCEL_ENV && (env.AGENDA_MOCK === '1' || !env.POWER_CALENDAR_ID);
}

export const MOCK_CALENDARS = { power: 'mock-power', discovery: 'mock-discovery' };

/**
 * Estado en `globalThis` para que sobreviva a las recargas de módulos de Vite durante `astro dev`.
 * @returns {{ events: Map<string, any>, sessions: Map<string, any>, kommo: any[], seq: number }}
 */
function state() {
  const g = /** @type {any} */ (globalThis);
  g.__ikAgendaMock ??= { events: new Map(), sessions: new Map(), kommo: [], seq: 0 };
  return g.__ikAgendaMock;
}

/** Solo pruebas: vacía la simulación. */
export function __resetMock() {
  const g = /** @type {any} */ (globalThis);
  g.__ikAgendaMock = { events: new Map(), sessions: new Map(), kommo: [], seq: 0 };
}

/** Resumen sin datos personales (para /api/agenda/estado/ en simulación). */
export function mockSnapshot() {
  const s = state();
  const ev = [...s.events.values()];
  return {
    eventos: ev.length,
    apartados: ev.filter((e) => e.extendedProperties?.private?.rl_estado === 'pendiente').length,
    confirmadas: ev.filter((e) => e.extendedProperties?.private?.rl_estado === 'confirmada').length,
    checkouts: s.sessions.size,
    leadsKommo: s.kommo.filter((k) => k.op === 'create').length,
  };
}

const hex = (n = 12) => Array.from(crypto.getRandomValues(new Uint8Array(n)), (b) => b.toString(16).padStart(2, '0')).join('').slice(0, n);
const letters = (n) => Array.from(crypto.getRandomValues(new Uint8Array(n)), (b) => String.fromCharCode(97 + (b % 26))).join('');
const fakeMeet = () => `https://meet.google.com/${letters(3)}-${letters(4)}-${letters(3)}`;

/** @param {number} status @param {string} msg */
function httpError(status, msg) {
  return Object.assign(new Error(`${msg} ${status}`), { name: 'MockError', status });
}

const clone = (/** @type {any} */ o) => JSON.parse(JSON.stringify(o));

const google = {
  async getCalendar(/** @type {string} */ id) {
    return { id };
  },
  /**
   * @param {string[]} _ids @param {string} timeMin @param {string} timeMax @param {{ type?: 'power' | 'discovery' }} [hint]
   */
  async freeBusy(_ids, timeMin, timeMax, hint) {
    const a = Date.parse(timeMin);
    const b = Date.parse(timeMax);
    const busy = [];
    for (const e of state().events.values()) {
      const s = Date.parse(e.start?.dateTime ?? '');
      const t = Date.parse(e.end?.dateTime ?? '');
      if (s < b && a < t) busy.push({ start: e.start.dateTime, end: e.end.dateTime });
    }
    // Ocupación determinista: el 2.º horario de cada día (del tipo que se consulta).
    const rule = SESSION_RULES[hint?.type ?? 'discovery'];
    for (let d = new Date(a); d.getTime() <= b; d = new Date(d.getTime() + 86400_000)) {
      const date = cdmxDateKey(d);
      const start = cdmxToIso(date, rule.times[1]);
      busy.push({ start, end: new Date(Date.parse(start) + rule.minutes * 60_000).toISOString() });
    }
    return busy;
  },
  /**
   * @param {string} cal
   * @param {{ timeMin: string, timeMax: string, privateProps?: Record<string, string> }} p
   */
  async listEvents(cal, p) {
    const a = Date.parse(p.timeMin);
    const b = Date.parse(p.timeMax);
    const want = Object.entries(p.privateProps ?? {});
    const out = [...state().events.values()].filter((e) => {
      if (e._cal !== cal) return false;
      const s = Date.parse(e.start?.dateTime ?? '');
      const t = Date.parse(e.end?.dateTime ?? '');
      if (!(s < b && a < t)) return false;
      const pp = e.extendedProperties?.private ?? {};
      return want.every(([k, v]) => pp[k] === v);
    }).map(clone);
    // AGENDA_MOCK_LLENO=1: el conteo del cupo semanal de Power ve 4 sesiones.
    if (process.env.AGENDA_MOCK_LLENO === '1' && cal === MOCK_CALENDARS.power && p.privateProps?.rl_tipo === 'power' && !p.privateProps?.rl_estado) {
      while (out.length < 4) out.push({ id: `mockfull${out.length}`, status: 'confirmed', extendedProperties: { private: { rl_tipo: 'power', rl_estado: 'confirmada' } } });
    }
    return out;
  },
  async getEvent(/** @type {string} */ cal, /** @type {string} */ id) {
    const e = state().events.get(id);
    if (!e || e._cal !== cal) throw httpError(404, 'Google Calendar (simulado)');
    return clone(e);
  },
  /** @param {string} cal @param {import('./google.js').EventInput} e */
  async insertEvent(cal, e) {
    const id = `mock${hex(16)}`;
    const ev = {
      _cal: cal, id, status: 'confirmed', summary: e.summary, description: e.description,
      start: { dateTime: e.startIso }, end: { dateTime: e.endIso },
      attendees: e.attendeeEmail ? [{ email: e.attendeeEmail }] : [],
      extendedProperties: { private: { ...e.privateProps } },
      hangoutLink: e.withMeet ? fakeMeet() : undefined,
      created: new Date().toISOString(),
    };
    state().events.set(id, ev);
    return clone(ev);
  },
  /** @param {string} cal @param {string} id @param {import('./google.js').EventInput} e */
  async patchEvent(cal, id, e) {
    const ev = state().events.get(id);
    if (!ev || ev._cal !== cal) throw httpError(404, 'Google Calendar (simulado)');
    Object.assign(ev, {
      summary: e.summary, description: e.description, start: { dateTime: e.startIso }, end: { dateTime: e.endIso },
      attendees: e.attendeeEmail ? [{ email: e.attendeeEmail }] : [],
      extendedProperties: { private: { ...e.privateProps } },
      hangoutLink: ev.hangoutLink ?? (e.withMeet ? fakeMeet() : undefined),
    });
    return clone(ev);
  },
  /** @param {string} cal @param {string} id @param {Record<string, string>} props */
  async patchPrivate(cal, id, props) {
    const ev = state().events.get(id);
    if (!ev || ev._cal !== cal) throw httpError(404, 'Google Calendar (simulado)');
    ev.extendedProperties = { private: { ...props } };
    return clone(ev);
  },
  async deleteEvent(/** @type {string} */ _cal, /** @type {string} */ id) {
    state().events.delete(id);
  },
};

const stripe = {
  /** @param {Record<string, any>} params */
  async createCheckout(params) {
    const eventId = String(params?.metadata?.rl_event ?? '');
    const id = `cs_test_MOCK_${eventId}`;
    const base = new URL(String(params.success_url)).origin;
    const s = {
      id,
      url: `${base}/dev/agenda-checkout/?session_id=${encodeURIComponent(id)}&apartado=${encodeURIComponent(eventId)}`,
      status: 'open', payment_status: 'unpaid', expires_at: params.expires_at,
      metadata: { ...params.metadata }, customer_email: params.customer_email ?? null,
    };
    state().sessions.set(id, s);
    return clone(s);
  },
  async retrieveCheckout(/** @type {string} */ id) {
    const s = state().sessions.get(id);
    if (!s) throw httpError(404, 'Stripe (simulado)');
    return clone(s);
  },
  async expireCheckout(/** @type {string} */ id) {
    const s = state().sessions.get(id);
    if (!s) throw httpError(404, 'Stripe (simulado)');
    if (s.status === 'open') s.status = 'expired';
    return clone(s);
  },
  stripeLive: () => false,
  ping: async () => true,
};

/**
 * "Simular pago" de /dev/agenda-checkout/: la sesión pasa a pagada. Solo existe en simulación.
 * @param {string} sessionId
 */
export function mockPay(sessionId) {
  const s = state().sessions.get(sessionId);
  if (!s || s.status !== 'open') return false;
  s.status = 'complete';
  s.payment_status = 'paid';
  s.customer_details = { email: s.customer_email };
  return true;
}

/** Kommo simulado: registra en memoria (sin datos personales en logs) y responde como creado. */
const kommo = {
  kommoConfigured: () => true,
  async createLeadWithNote(/** @type {any} */ input) {
    const st = state();
    st.seq += 1;
    st.kommo.push({ op: 'create', name: input?.name, tags: input?.tags ?? [] });
    return { ok: true, leadId: 900000 + st.seq, contactId: 800000 + st.seq, dryRun: true };
  },
  async updateLead(/** @type {any} */ leadId, /** @type {any} */ change) {
    state().kommo.push({ op: 'update', leadId, etapa: change?.etapa ?? null, campos: Object.keys(change?.campos ?? {}) });
    return { ok: true, enviado: true, movido: Boolean(change?.etapa) };
  },
  async updateLeadTags(/** @type {any} */ leadId, /** @type {any} */ change) {
    state().kommo.push({ op: 'tags', leadId, ...change });
    return { ok: true };
  },
  async addLeadNote(/** @type {any} */ leadId) {
    state().kommo.push({ op: 'note', leadId });
    return { ok: true };
  },
  notify: async () => false,
};

/** Registro del Kommo simulado (pruebas y diagnóstico). */
export function mockKommoLog() {
  return state().kommo.slice();
}

export function mockAdapters() {
  // Supabase apagado en simulación aunque existan variables: nada sale de la máquina.
  const leads = createLeads({ kommo, env: { ...process.env, SUPABASE_URL: '', SUPABASE_SERVICE_ROLE_KEY: '' } });
  return {
    google,
    stripe,
    leads,
    brief: { ensureBrief: async () => null, briefUrl },
    calendars: MOCK_CALENDARS,
  };
}
