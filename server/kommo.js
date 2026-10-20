/**
 * Cliente de Kommo (API v4) y webhook de aviso. Lo usan la cotización (`api/cotizar.js`) y la agenda
 * (`server/agenda/leads.js`). CAMBIO-COTIZAR §3.4, §3.5, §3.7; ficha `kommo-vercel-tecnico.md` §1.
 *
 * Contrato (no cambiar sin actualizar la especificación):
 *   kommoConfigured()                                   → boolean
 *   createLeadWithNote({ name, contact: { name, phoneE164, email }, company, tags, note, tracking,
 *                        pipelineId, statusId, responsibleUserId })
 *        → { ok: true, leadId, contactId, dryRun?: true, preview? }
 *        | { ok: false, status, reason: 'not-configured'|'auth'|'payment'|'forbidden'|'rate'|'validation'|'server'|'network' }
 *   updateLeadTags(leadId, { add = [], remove = [] })   → { ok }
 *   addLeadNote(leadId, text)                           → { ok }
 *   notify(event, payload)                              → Promise<boolean>
 *
 * Reglas: nunca lanza; `AbortSignal.timeout(8000)` por llamada (y un presupuesto total por lead);
 * sin variables y fuera de producción responde en simulación sin llamar a nadie; los logs solo llevan
 * { evento, folio, status, leadId, delivered, ms }: nunca correo, teléfono, nombre ni token.
 */
import { envName } from './http.js';

const CALL_TIMEOUT_MS = 8000;
const NOTIFY_TIMEOUT_MS = 5000;
/** Presupuesto total de Kommo por lead: deja margen al webhook dentro de los 15 s de la función. */
const LEAD_BUDGET_MS = 9000;
/** Una alerta del mismo tipo cada 5 min por instancia (evita una ráfaga si el token vence). */
const ALERT_EVERY_MS = 5 * 60_000;

/** Campos `tracking_data` que se mandan si existen en la cuenta. */
export const TRACKING_CODES = Object.freeze([
  'UTM_SOURCE', 'UTM_MEDIUM', 'UTM_CAMPAIGN', 'UTM_TERM', 'UTM_CONTENT', 'REFERRER', 'GCLID', 'FBCLID',
]);

/** Alertas al webhook por error de Kommo (§3.4). */
const ALERTAS = Object.freeze({
  auth: { alerta: 'renovar token', mensaje: 'Kommo rechazó el token (401). Genera un token de larga duración nuevo, reemplaza KOMMO_TOKEN en Vercel y haz Redeploy.' },
  payment: { alerta: 'cuenta sin pago', mensaje: 'La cuenta de Kommo no está pagada o terminó la prueba (402).' },
  forbidden: { alerta: 'permisos o IP bloqueada', mensaje: 'Kommo negó el permiso o bloqueó la IP (403). Revisa los permisos de la integración privada.' },
  rate: { alerta: 'límite de peticiones', mensaje: 'Kommo limitó las peticiones (429). Revisa si otra integración está haciendo demasiadas llamadas.' },
});

/**
 * @typedef {'not-configured'|'auth'|'payment'|'forbidden'|'rate'|'validation'|'server'|'network'} Reason
 * @typedef {{ status: number, data: any, reason?: Reason }} CallResult
 * @typedef {{ source?: string, folio?: string }} Ctx
 */

/* ── Configuración ─────────────────────────────────────────────────────────────────────────── */

/**
 * URL base de la API: `KOMMO_BASE_URL` (solo pruebas; con o sin `/api/v4`) o `https://{KOMMO_SUBDOMAIN}.kommo.com/api/v4`.
 * Tolera que el subdominio se capture como `ingeniak.kommo.com` o con `https://`.
 * @returns {string | null}
 */
export function kommoBase() {
  const raw = (process.env.KOMMO_BASE_URL ?? '').trim();
  if (raw) {
    const b = raw.replace(/\/+$/, '');
    return /\/api\/v4$/.test(b) ? b : `${b}/api/v4`;
  }
  const sub = (process.env.KOMMO_SUBDOMAIN ?? '')
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/\.kommo\.com.*$/, '')
    .replace(/[/?#].*$/, '');
  return /^[a-z0-9][a-z0-9-]{0,62}$/.test(sub) ? `https://${sub}.kommo.com/api/v4` : null;
}

/** Token sin espacios ni un "Bearer " pegado por error. */
function token() {
  return (process.env.KOMMO_TOKEN ?? '').trim().replace(/^bearer\s+/i, '');
}

/** ¿Hay subdominio (o URL base de pruebas) y token? */
export function kommoConfigured() {
  return Boolean(kommoBase() && token());
}

/** Simulación: sin configuración y fuera de producción. */
function dryRun() {
  return !kommoConfigured() && envName() !== 'production';
}

/* ── Utilidades ────────────────────────────────────────────────────────────────────────────── */

/** @param {Record<string, unknown>} o */
function log(o) {
  try {
    console.log(JSON.stringify(o));
  } catch {
    /* sin logs no pasa nada */
  }
}

/**
 * @param {number} status
 * @returns {Reason}
 */
export function reasonFor(status) {
  if (status === 401) return 'auth';
  if (status === 402) return 'payment';
  if (status === 403) return 'forbidden';
  if (status === 429) return 'rate';
  if (status === 400 || status === 422) return 'validation';
  if (status === 0) return 'network';
  return 'server';
}

/**
 * Una llamada a Kommo. Nunca lanza: error de red o tiempo agotado → { status: 0, reason: 'network' }.
 * @param {string} path  p. ej. '/leads/complex'
 * @param {{ method?: string, body?: unknown, deadline?: number }} [opts]
 * @returns {Promise<CallResult>}
 */
async function call(path, { method = 'GET', body, deadline } = {}) {
  const base = kommoBase();
  if (!base) return { status: 0, data: null, reason: 'not-configured' };
  const remaining = deadline ? deadline - Date.now() : CALL_TIMEOUT_MS;
  if (remaining < 250) return { status: 0, data: null, reason: 'network' };
  try {
    /** @type {Record<string, string>} */
    const headers = { authorization: `Bearer ${token()}`, accept: 'application/json' };
    if (body !== undefined) headers['content-type'] = 'application/json';
    const res = await fetch(`${base}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: AbortSignal.timeout(Math.min(CALL_TIMEOUT_MS, remaining)),
    });
    if (res.status === 204) return { status: 204, data: null };
    const text = await res.text().catch(() => '');
    let data = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = null;
    }
    return res.ok ? { status: res.status, data } : { status: res.status, data, reason: reasonFor(res.status) };
  } catch {
    return { status: 0, data: null, reason: 'network' };
  }
}

/** @param {unknown} v */
const digits = (v) => String(v ?? '').replace(/\D/g, '');

/**
 * Primer contacto cuyo EMAIL o PHONE coincide exactamente.
 * @param {any} data  respuesta de GET /contacts
 * @param {'EMAIL' | 'PHONE'} code
 * @param {string} value  correo en minúsculas o teléfono E.164
 * @returns {number | null}
 */
function matchContact(data, code, value) {
  const contacts = Array.isArray(data?._embedded?.contacts) ? data._embedded.contacts : [];
  const want = code === 'EMAIL' ? value.trim().toLowerCase() : digits(value);
  for (const c of contacts) {
    const fields = Array.isArray(c?.custom_fields_values) ? c.custom_fields_values : [];
    for (const f of fields) {
      if (f?.field_code !== code || !Array.isArray(f.values)) continue;
      const hit = f.values.some((v) => {
        if (code === 'EMAIL') return String(v?.value ?? '').trim().toLowerCase() === want;
        const d = digits(v?.value);
        return d === want || (d.length >= 10 && want.endsWith(d));
      });
      if (hit && Number.isSafeInteger(c.id)) return c.id;
    }
  }
  return null;
}

/* ── Campos de rastreo (caché por instancia) ───────────────────────────────────────────────── */

/** @type {Map<string, number> | null} */
let trackingIds = null;

/**
 * Mapa code → id de los campos `tracking_data` de la cuenta (una consulta por instancia).
 * @param {number} deadline
 * @returns {Promise<{ ok: true, ids: Map<string, number> } | { ok: false, result: CallResult }>}
 */
async function trackingFieldIds(deadline) {
  if (trackingIds) return { ok: true, ids: trackingIds };
  const r = await call('/leads/custom_fields?limit=250', { deadline });
  if (r.status === 204) {
    trackingIds = new Map();
    return { ok: true, ids: trackingIds };
  }
  if (r.status !== 200) return { ok: false, result: r };
  const list = Array.isArray(r.data?._embedded?.custom_fields) ? r.data._embedded.custom_fields : [];
  const ids = new Map();
  for (const f of list) {
    const code = typeof f?.code === 'string' ? f.code.toUpperCase() : '';
    if (TRACKING_CODES.includes(code) && Number.isSafeInteger(f.id)) ids.set(code, f.id);
  }
  trackingIds = ids;
  return { ok: true, ids };
}

/**
 * @param {Record<string, string>} tracking  { UTM_SOURCE: 'google', … }
 * @param {Map<string, number> | null} ids   null = simulación (se muestra field_code)
 */
function trackingValues(tracking, ids) {
  const out = [];
  for (const code of TRACKING_CODES) {
    const v = tracking?.[code];
    if (typeof v !== 'string' || !v.trim()) continue;
    const value = v.trim().slice(0, 255);
    if (!ids) out.push({ field_code: code, values: [{ value }] });
    else if (ids.has(code)) out.push({ field_id: /** @type {number} */ (ids.get(code)), values: [{ value }] });
  }
  return out;
}

/* ── Alertas ───────────────────────────────────────────────────────────────────────────────── */

/** @type {Map<string, number>} */
const lastAlert = new Map();

/**
 * Alerta `kommo.alerta` al webhook ante 401/402/403/429 (como mucho una por tipo cada 5 min).
 * @param {CallResult} r
 * @param {Ctx} ctx
 */
async function maybeAlert(r, ctx) {
  const reason = r.reason ?? reasonFor(r.status);
  const a = /** @type {Record<string, { alerta: string, mensaje: string }>} */ (ALERTAS)[reason];
  if (!a || !(process.env.NOTIFY_WEBHOOK_URL ?? '').trim()) return;
  const now = Date.now();
  if (now - (lastAlert.get(reason) ?? -Infinity) < ALERT_EVERY_MS) return;
  lastAlert.set(reason, now);
  await notify('kommo.alerta', {
    source: ctx.source ?? 'kommo',
    folio: ctx.folio,
    kommo: { ok: false, status: r.status, reason },
    alerta: a.alerta,
    mensaje: a.mensaje,
  });
}

/**
 * Falla de un paso: log sin datos personales, alerta si aplica y resultado normalizado.
 * @param {string} paso
 * @param {CallResult} r
 * @param {Ctx} ctx
 * @param {number} t0
 */
async function fail(paso, r, ctx, t0) {
  const reason = r.reason ?? reasonFor(r.status);
  log({ evento: `kommo.${paso}`, folio: ctx.folio, status: r.status, ms: Date.now() - t0 });
  await maybeAlert(r, ctx);
  return /** @type {const} */ ({ ok: false, status: r.status, reason });
}

/* ── API ───────────────────────────────────────────────────────────────────────────────────── */

/**
 * @typedef {{
 *   name: string,
 *   contact: { name: string, phoneE164?: string, email?: string },
 *   company?: string,
 *   tags?: string[],
 *   note?: string,
 *   tracking?: Record<string, string>,
 *   pipelineId?: number, statusId?: number, responsibleUserId?: number,
 *   source?: string, folio?: string, budgetMs?: number
 * }} LeadInput
 */

/**
 * Cuerpo de POST /leads/complex (un lead).
 * @param {LeadInput} input
 * @param {number | null} contactId  contacto existente o null (nuevo)
 * @param {object[]} trackingFields
 */
export function complexBody(input, contactId, trackingFields) {
  /** @type {Record<string, any>} */
  const lead = { name: String(input.name ?? '').slice(0, 255) };
  if (Number.isSafeInteger(input.pipelineId) && /** @type {number} */ (input.pipelineId) > 0) lead.pipeline_id = input.pipelineId;
  if (Number.isSafeInteger(input.statusId) && /** @type {number} */ (input.statusId) > 0) lead.status_id = input.statusId;
  if (Number.isSafeInteger(input.responsibleUserId) && /** @type {number} */ (input.responsibleUserId) > 0) {
    lead.responsible_user_id = input.responsibleUserId;
  }
  if (trackingFields.length) lead.custom_fields_values = trackingFields;

  /** @type {object[]} */
  let contacts;
  if (contactId) {
    contacts = [{ id: contactId }];
  } else {
    const cfv = [];
    if (input.contact?.phoneE164) cfv.push({ field_code: 'PHONE', values: [{ value: input.contact.phoneE164, enum_code: 'MOB' }] });
    if (input.contact?.email) cfv.push({ field_code: 'EMAIL', values: [{ value: input.contact.email, enum_code: 'WORK' }] });
    contacts = [{ name: String(input.contact?.name ?? '').slice(0, 255), custom_fields_values: cfv }];
  }
  /** @type {Record<string, any>} */
  const embedded = {
    tags: [...new Set((input.tags ?? []).filter((t) => typeof t === 'string' && t))].map((name) => ({ name })),
    contacts,
  };
  if (!contactId && input.company) embedded.companies = [{ name: String(input.company).slice(0, 255) }];
  lead._embedded = embedded;
  return [lead];
}

/**
 * Cuerpo de POST /leads/notes (nota común).
 * @param {number | string} leadId
 * @param {string} text
 */
export function noteBody(leadId, text) {
  return [{ entity_id: leadId, note_type: 'common', params: { text } }];
}

/** ¿El 400 de complex se queja de custom_fields_values? */
function mentionsCustomFields(data) {
  try {
    return JSON.stringify(data ?? '').includes('custom_fields_values');
  } catch {
    return false;
  }
}

/**
 * Crea el lead (con contacto y empresa) y le agrega la nota. Nunca lanza.
 * Orden: GET contacts?query=correo → (204) GET contacts?query=+E164 → GET leads/custom_fields (una vez
 * por instancia, solo si hay rastreo) → POST leads/complex (un reintento sin rastreo si el 400 es por
 * custom_fields_values) → POST leads/notes (si falla, el lead ya existe: ok igual).
 * @param {LeadInput} input
 * @returns {Promise<
 *   { ok: true, status: number, leadId: number | null, contactId: number | null, existingContact: boolean, noteOk: boolean, dryRun?: true, preview?: object }
 *   | { ok: false, status: number, reason: Reason }>}
 */
export async function createLeadWithNote(input) {
  const t0 = Date.now();
  /** @type {Ctx} */
  const ctx = { source: input?.source, folio: input?.folio };
  try {
    const email = (input?.contact?.email ?? '').trim().toLowerCase();
    const phone = (input?.contact?.phoneE164 ?? '').trim();
    /** @type {{ code: 'EMAIL' | 'PHONE', value: string }[]} */
    const searches = [];
    if (email) searches.push({ code: 'EMAIL', value: email });
    if (phone) searches.push({ code: 'PHONE', value: phone });
    const tracking = input?.tracking ?? {};
    const note = typeof input?.note === 'string' ? input.note : '';

    if (!kommoConfigured()) {
      if (!dryRun()) {
        log({ evento: 'kommo.config', folio: ctx.folio, status: 0, ms: Date.now() - t0 });
        return { ok: false, status: 0, reason: 'not-configured' };
      }
      return {
        ok: true,
        status: 200,
        dryRun: true,
        leadId: null,
        contactId: null,
        existingContact: false,
        noteOk: true,
        preview: {
          contactSearch: searches.map((s) => `GET /api/v4/contacts?query=${encodeURIComponent(s.value)}`),
          complex: complexBody(input, null, trackingValues(tracking, null)),
          note: note ? noteBody('<lead_id>', note) : [],
          tags: complexBody(input, null, [])[0]._embedded.tags.map((/** @type {{name: string}} */ t) => t.name),
        },
      };
    }

    const deadline = t0 + (Number.isFinite(input?.budgetMs) ? Number(input.budgetMs) : LEAD_BUDGET_MS);

    // 1 · ¿El contacto ya existe? (correo y luego teléfono)
    /** @type {number | null} */
    let contactId = null;
    for (const s of searches) {
      const r = await call(`/contacts?query=${encodeURIComponent(s.value)}`, { deadline });
      if (r.status === 204) continue;
      if (r.status !== 200) return await fail('contactos', r, ctx, t0);
      contactId = matchContact(r.data, s.code, s.value);
      if (contactId) break;
    }

    // 2 · Campos de rastreo existentes (caché por instancia)
    let trackingFields = [];
    if (Object.values(tracking).some((v) => typeof v === 'string' && v.trim())) {
      const t = await trackingFieldIds(deadline);
      if (t.ok) {
        trackingFields = trackingValues(tracking, t.ids);
      } else if (['auth', 'payment', 'forbidden', 'rate'].includes(t.result.reason ?? '')) {
        return await fail('campos', t.result, ctx, t0);
      } else {
        log({ evento: 'kommo.campos', folio: ctx.folio, status: t.result.status, ms: Date.now() - t0 });
      }
    }

    // 3 · Lead + contacto + empresa
    let r = await call('/leads/complex', { method: 'POST', body: complexBody(input, contactId, trackingFields), deadline });
    if (r.status === 400 && trackingFields.length && mentionsCustomFields(r.data)) {
      log({ evento: 'kommo.complex-reintento', folio: ctx.folio, status: r.status, ms: Date.now() - t0 });
      r = await call('/leads/complex', { method: 'POST', body: complexBody(input, contactId, []), deadline });
    }
    if (r.status !== 200 && r.status !== 201) return await fail('complex', r, ctx, t0);
    const row = Array.isArray(r.data) ? r.data[0] : r.data?._embedded?.leads?.[0];
    const leadId = Number.isSafeInteger(row?.id) ? row.id : null;
    if (!leadId) return await fail('complex', { status: r.status, data: null, reason: 'server' }, ctx, t0);
    const newContact = Number.isSafeInteger(row?.contact_id) ? row.contact_id : null;

    // 4 · Nota con el formulario completo
    let noteOk = true;
    if (note) {
      const n = await call('/leads/notes', { method: 'POST', body: noteBody(leadId, note), deadline });
      noteOk = n.status === 200 || n.status === 201;
      if (!noteOk) {
        log({ evento: 'kommo.nota', folio: ctx.folio, status: n.status, leadId, ms: Date.now() - t0 });
        await maybeAlert(n, ctx);
      }
    }
    return { ok: true, status: r.status, leadId, contactId: contactId ?? newContact, existingContact: Boolean(contactId), noteOk };
  } catch {
    log({ evento: 'kommo.error', folio: ctx.folio, status: 0, ms: Date.now() - t0 });
    return { ok: false, status: 0, reason: 'network' };
  }
}

/** @param {unknown} id */
function validLeadId(id) {
  const n = typeof id === 'string' && /^\d+$/.test(id) ? Number(id) : id;
  return Number.isSafeInteger(n) && /** @type {number} */ (n) > 0 ? /** @type {number} */ (n) : null;
}

/**
 * Agrega y quita etiquetas de un lead: PATCH /leads/{id} con `tags_to_add` / `tags_to_delete`
 * (por nombre; referencia de Kommo «Updating a lead», consultada el 2026-10-20). Nunca lanza.
 * @param {number | string} leadId
 * @param {{ add?: string[], remove?: string[], folio?: string, source?: string }} [opts]
 * @returns {Promise<{ ok: boolean, status?: number, reason?: Reason, dryRun?: true, preview?: object }>}
 */
export async function updateLeadTags(leadId, { add = [], remove = [], folio, source } = {}) {
  const t0 = Date.now();
  try {
    const id = validLeadId(leadId);
    /** @type {Record<string, any>} */
    const body = {};
    const tAdd = [...new Set(add.filter((t) => typeof t === 'string' && t))];
    const tDel = [...new Set(remove.filter((t) => typeof t === 'string' && t))];
    if (tAdd.length) body.tags_to_add = tAdd.map((name) => ({ name }));
    if (tDel.length) body.tags_to_delete = tDel.map((name) => ({ name }));
    if (!kommoConfigured()) {
      if (!dryRun()) return { ok: false, status: 0, reason: 'not-configured' };
      return { ok: true, dryRun: true, preview: { method: 'PATCH', path: `/api/v4/leads/${id ?? '<lead_id>'}`, body } };
    }
    if (!id) return { ok: false, status: 0, reason: 'validation' };
    if (!tAdd.length && !tDel.length) return { ok: true, status: 200 };
    const r = await call(`/leads/${id}`, { method: 'PATCH', body, deadline: t0 + CALL_TIMEOUT_MS });
    if (r.status === 200) return { ok: true, status: 200 };
    return await fail('etiquetas', r, { folio, source }, t0);
  } catch {
    return { ok: false, status: 0, reason: 'network' };
  }
}

/**
 * Nota común en un lead existente. Nunca lanza.
 * @param {number | string} leadId
 * @param {string} text
 * @param {{ folio?: string, source?: string }} [ctx]
 * @returns {Promise<{ ok: boolean, status?: number, reason?: Reason, dryRun?: true, preview?: object }>}
 */
export async function addLeadNote(leadId, text, ctx = {}) {
  const t0 = Date.now();
  try {
    const id = validLeadId(leadId);
    const t = typeof text === 'string' ? text : '';
    if (!kommoConfigured()) {
      if (!dryRun()) return { ok: false, status: 0, reason: 'not-configured' };
      return { ok: true, dryRun: true, preview: { method: 'POST', path: '/api/v4/leads/notes', body: noteBody(id ?? '<lead_id>', t) } };
    }
    if (!id || !t) return { ok: false, status: 0, reason: 'validation' };
    const r = await call('/leads/notes', { method: 'POST', body: noteBody(id, t), deadline: t0 + CALL_TIMEOUT_MS });
    if (r.status === 200 || r.status === 201) return { ok: true, status: r.status };
    return await fail('nota', r, ctx, t0);
  } catch {
    return { ok: false, status: 0, reason: 'network' };
  }
}

/**
 * Webhook de aviso (opcional): POST JSON a NOTIFY_WEBHOOK_URL con `x-webhook-secret` si existe; 5 s.
 * Cuerpo: { event, site: 'ingeniak.mx', source, env, folio, kommo, data, … }. Nunca lanza.
 * @param {'lead.created' | 'kommo.alerta' | string} event
 * @param {Record<string, unknown>} [payload]
 * @returns {Promise<boolean>} true si respondió 2xx
 */
export async function notify(event, payload = {}) {
  const url = (process.env.NOTIFY_WEBHOOK_URL ?? '').trim();
  if (!url) return false;
  const t0 = Date.now();
  try {
    const u = new URL(url);
    if (u.protocol !== 'https:' && u.protocol !== 'http:') return false;
    /** @type {Record<string, string>} */
    const headers = { 'content-type': 'application/json', accept: 'application/json' };
    const secret = (process.env.NOTIFY_WEBHOOK_SECRET ?? '').trim();
    if (secret) headers['x-webhook-secret'] = secret;
    const { source, ...rest } = payload ?? {};
    const body = { event, site: 'ingeniak.mx', source: source ?? null, env: envName(), ...rest };
    const res = await fetch(u, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(NOTIFY_TIMEOUT_MS),
    });
    await res.body?.cancel().catch(() => {});
    log({ evento: `webhook.${event}`, folio: payload?.folio, status: res.status, ms: Date.now() - t0 });
    return res.ok;
  } catch {
    log({ evento: `webhook.${event}`, folio: payload?.folio, status: 0, ms: Date.now() - t0 });
    return false;
  }
}

/** Solo pruebas: olvida la caché de campos y las alertas enviadas. */
export function __resetKommo() {
  trackingIds = null;
  lastAlert.clear();
}
