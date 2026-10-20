/**
 * Leads de la agenda (CAMBIO-COTIZAR §5.4): Kommo con el cliente compartido `server/kommo.js` (área api) y,
 * opcionalmente (opción A1), Supabase `public.leads` por REST — el mismo esquema y los mismos estados de pago
 * que riklanderos.tech (`lib/agenda/leads.server.ts`).
 *
 * Reglas: NUNCA lanza (Google Calendar es la fuente de verdad: Kommo o Supabase caídos no tumban una reserva);
 * tiempo límite por operación; logs sin nombres, correos, teléfonos ni tokens.
 *
 * `createLeads({ kommo, env })` permite inyectar un Kommo simulado (modo local) o espía (pruebas).
 */
import { CDMX_TZ, SESSION_RULES, formatSlotEs, phoneToE164 } from '../../shared/agenda.js';
import { clean } from '../http.js';
import * as kommoApi from '../kommo.js';

/** Supabase: 5 s por operación (como el original). */
export const SUPABASE_MS = 5000;
/** Kommo: hasta 4 llamadas en serie (contacto, campos, lead, nota); 9 s en total y se sigue sin él. */
export const KOMMO_MS = 9000;

const UTM_KEYS = /** @type {const} */ (['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term']);
const CLID_KEYS = /** @type {const} */ (['gclid', 'fbclid', 'gbraid', 'wbraid']);
const TZ_RE = /^[A-Za-z0-9_+-]+(?:\/[A-Za-z0-9_+-]+){0,2}$/;

/** Rangos de facturación que acepta el check de `revenue_range` (el resto queda null y va en details). */
const REVENUE_CODE = new Map([
  ['Menos de $100K MXN al mes', 'lt-100k'],
  ['$100K–$300K MXN', '100k-300k'],
  ['$300K–$800K MXN', '300k-1m'],
]);

/**
 * @typedef {import('../../shared/agenda.js').BookingForm} BookingForm
 * @typedef {import('../../shared/agenda.js').SessionType} SessionType
 * @typedef {{
 *   utm: Record<string, string | null>, referrer: string | null, pagePath: string | null, visitorTimezone: string | null,
 *   src: string | null, desde: string | null, clid: Record<string, string | null>,
 *   landing: { path: string | null, referrer: string | null, t: string | null }
 * }} BookingAttribution
 * @typedef {{
 *   kommoConfigured: () => boolean,
 *   createLeadWithNote: (input: any) => Promise<any>,
 *   updateLeadTags: (leadId: any, change: { add?: string[], remove?: string[] }) => Promise<any>,
 *   addLeadNote: (leadId: any, text: string) => Promise<any>,
 *   notify: (event: string, payload: any) => Promise<boolean>
 * }} KommoApi
 */

/** @param {unknown} v @param {number} max */
const clip = (v, max) => clean(v, max) || null;

/**
 * Atribución que manda el componente (utm_*, referrer, page_path, zona) + lo propio de Ingeniak (src, desde, clid, landing).
 * @param {unknown} raw
 * @returns {BookingAttribution}
 */
export function bookingAttribution(raw) {
  const b = raw && typeof raw === 'object' && !Array.isArray(raw) ? /** @type {Record<string, any>} */ (raw) : {};
  /** @type {Record<string, string | null>} */
  const utm = {};
  for (const k of UTM_KEYS) utm[k] = clip(b[k], 200);
  const ref = clip(b.referrer, 500);
  const path = clip(b.page_path, 300);
  const zona = clip(b.zona, 80);
  const c = b.clid && typeof b.clid === 'object' ? b.clid : {};
  /** @type {Record<string, string | null>} */
  const clid = {};
  for (const k of CLID_KEYS) clid[k] = clip(c[k], 200);
  const l = b.landing && typeof b.landing === 'object' ? b.landing : {};
  const lPath = clip(l.path, 300);
  const lRef = clip(l.referrer, 500);
  const okPath = (/** @type {string | null} */ p) => (p && p.startsWith('/') && !p.startsWith('//') ? p : null);
  const okUrl = (/** @type {string | null} */ u) => (u && /^https?:\/\//i.test(u) ? u : null);
  return {
    utm,
    referrer: okUrl(ref),
    pagePath: okPath(path),
    visitorTimezone: zona && TZ_RE.test(zona) ? zona : null,
    src: clip(b.src, 60),
    desde: clip(b.desde, 40),
    clid,
    landing: { path: okPath(lPath), referrer: okUrl(lRef), t: clip(l.t, 40) },
  };
}

/** Folio legible de una reserva (para el webhook y la nota): IK-AG-<6 primeros del evento>. @param {string} eventId */
export const bookingFolio = (eventId) => `IK-AG-${String(eventId).slice(0, 6).toUpperCase()}`;

/**
 * Nota del lead en Kommo: todos los campos, horario (CDMX e ISO), Meet, origen y atribución. Sin renglones vacíos.
 * @param {{ type: SessionType, form: BookingForm, startIso: string, origin: string | null, eventId: string,
 *           attribution: BookingAttribution, meetLink?: string | null, env?: string }} i
 */
export function kommoNote(i) {
  const r = SESSION_RULES[i.type];
  const f = i.form;
  const a = i.attribution;
  const utm = UTM_KEYS.map((k) => (a.utm[k] ? `${k.replace('utm_', '')}=${a.utm[k]}` : null)).filter(Boolean).join(' · ');
  const clid = CLID_KEYS.map((k) => (a.clid[k] ? `${k}=${a.clid[k]}` : null)).filter(Boolean).join(' · ');
  const lines = [
    `Reserva de ${r.label} · sitio web · Folio ${bookingFolio(i.eventId)}`,
    `Horario: ${formatSlotEs(i.startIso)} (hora del centro de México) · ${r.minutes} min · ${i.startIso}`,
    i.type === 'discovery' ? (i.meetLink ? `Google Meet: ${i.meetLink}` : 'Google Meet: lo genera Google Calendar en la invitación') : null,
    i.type === 'power' ? 'Pago: pendiente en Stripe Checkout (horario apartado 30 minutos)' : null,
    '—',
    `Nombre: ${f.fullName} · Negocio: ${f.businessName}`,
    `WhatsApp: ${phoneToE164(f.whatsapp) || f.whatsapp} · Correo: ${f.email}`,
    f.website ? `Sitio o redes: ${f.website}` : null,
    `Giro: ${f.industry} · Equipo: ${f.teamSize} · Facturación mensual: ${f.revenue}`,
    i.type === 'power' && f.timeDrains.length ? `Dónde se le va el tiempo: ${f.timeDrains.join(', ')}` : null,
    i.type === 'power' && f.tools ? `Herramientas que usan hoy: ${f.tools}` : null,
    f.goal ? `${i.type === 'power' ? 'Qué quiere resolver en la sesión' : 'Qué quiere revisar en la llamada'}: ${f.goal}` : null,
    '—',
    i.origin ? `Origen: ${i.origin}` : null,
    a.pagePath ? `Página: ${a.pagePath}${a.src ? ` · Primer clic de la sesión: ${a.src}` : ''}` : a.src ? `Primer clic de la sesión: ${a.src}` : null,
    a.landing.path || a.referrer ? `Llegó por: ${a.landing.path ?? '—'}${a.landing.referrer || a.referrer ? ` · Referrer: ${a.landing.referrer ?? a.referrer}` : ''}` : null,
    utm ? `UTM: ${utm}` : null,
    clid || null,
    a.visitorTimezone ? `Zona horaria del visitante: ${a.visitorTimezone}` : null,
    `Calendario: evento ${i.eventId}`,
    i.env ? `Entorno: ${i.env}` : null,
  ];
  return lines.filter((l) => typeof l === 'string' && l.trim() !== '').join('\n');
}

/**
 * @template T
 * @param {Promise<T>} work @param {number} ms @returns {Promise<T>}
 */
function withTimeout(work, ms) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(Object.assign(new Error('timeout'), { name: 'TimeoutError' })), ms);
    work.then(
      (v) => { clearTimeout(timer); resolve(v); },
      (e) => { clearTimeout(timer); reject(e); },
    );
  });
}

/** Log sin datos personales. @param {Record<string, unknown>} o */
function log(o) {
  try { console.log(JSON.stringify({ evento: 'agenda', ...o })); } catch { /* nada */ }
}

/**
 * @param {{ kommo?: KommoApi | (() => Promise<KommoApi>), env?: NodeJS.ProcessEnv }} [opts]
 */
export function createLeads({ kommo, env = process.env } = {}) {
  /** @type {Promise<KommoApi> | null} */
  let kommoP = null;
  const getKommo = () => (kommoP ??= typeof kommo === 'function' ? kommo() : Promise.resolve(kommo ?? /** @type {KommoApi} */ (/** @type {any} */ (kommoApi))));

  const supabaseOn = () => Boolean(env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY);
  const envLabel = () => (env.VERCEL_ENV === 'production' || env.VERCEL_ENV === 'preview' || env.VERCEL_ENV === 'development' ? env.VERCEL_ENV : 'local');
  const int = (/** @type {string | undefined} */ v) => (v && /^\d+$/.test(v.trim()) ? Number(v.trim()) : undefined);

  /**
   * Supabase REST (PostgREST) con la service role. Nunca lanza: devuelve { ok, status, data }.
   * @param {string} path @param {{ method?: string, body?: unknown, prefer?: string }} [o]
   */
  async function sb(path, { method = 'GET', body, prefer } = {}) {
    const base = String(env.SUPABASE_URL).replace(/\/+$/, '');
    const key = String(env.SUPABASE_SERVICE_ROLE_KEY);
    /** @type {Record<string, string>} */
    const headers = { apikey: key, authorization: `Bearer ${key}`, 'x-application-name': 'ingeniak-web' };
    if (body !== undefined) headers['content-type'] = 'application/json';
    if (prefer) headers.prefer = prefer;
    try {
      const res = await fetch(`${base}/rest/v1${path}`, {
        method, headers, body: body === undefined ? undefined : JSON.stringify(body), signal: AbortSignal.timeout(SUPABASE_MS),
      });
      const text = await res.text().catch(() => '');
      let data = null;
      try { data = text ? JSON.parse(text) : null; } catch { data = null; }
      return { ok: res.ok, status: res.status, data };
    } catch (e) {
      return { ok: false, status: 0, data: null, error: e instanceof Error ? e.name : 'error' };
    }
  }

  /** @param {string} stripeSessionId @param {'pagado' | 'expirado'} status @param {string[]} from */
  async function setPaymentByStripe(stripeSessionId, status, from) {
    if (!stripeSessionId || !supabaseOn()) return;
    const q = `stripe_session_id=eq.${encodeURIComponent(stripeSessionId)}&payment_status=in.(${from.join(',')})`;
    const r = await sb(`/leads?${q}`, { method: 'PATCH', body: { payment_status: status }, prefer: 'return=minimal' });
    if (!r.ok) log({ accion: 'supabase', paso: status, ok: false, status: r.status });
  }

  return {
    /** Diagnóstico sin valores. */
    async status() {
      const k = await getKommo();
      return { kommo: k.kommoConfigured(), supabase: supabaseOn() };
    },

    /**
     * Reserva nueva (Discovery confirmada o apartado Power): lead en Kommo + renglón en Supabase (A1), en paralelo.
     * @param {{ type: SessionType, form: BookingForm, startIso: string, origin: string | null, eventId: string,
     *           attribution: BookingAttribution, meetLink?: string | null, stripeSessionId?: string | null }} i
     * @returns {Promise<{ kommoLeadId: string | null }>}
     */
    async recordBooking(i) {
      const t0 = Date.now();
      const environment = envLabel();
      const k = await getKommo();
      const tags = ['web-agenda', `agenda-${i.type}`];
      if (i.type === 'power') tags.push('pago-pendiente');
      if (environment === 'preview') tags.push('entorno-preview');
      const a = i.attribution;
      const phoneE164 = phoneToE164(i.form.whatsapp);
      const input = {
        name: `${SESSION_RULES[i.type].label} · ${i.form.businessName}`,
        contact: { name: i.form.fullName, phoneE164, email: i.form.email },
        company: i.form.businessName,
        tags,
        note: kommoNote({ ...i, env: environment }),
        // Campos `tracking_data` de Kommo (server/kommo.js solo manda los que existen en la cuenta).
        tracking: {
          UTM_SOURCE: a.utm.utm_source ?? '', UTM_MEDIUM: a.utm.utm_medium ?? '', UTM_CAMPAIGN: a.utm.utm_campaign ?? '',
          UTM_TERM: a.utm.utm_term ?? '', UTM_CONTENT: a.utm.utm_content ?? '',
          REFERRER: a.landing.referrer ?? a.referrer ?? '', GCLID: a.clid.gclid ?? '', FBCLID: a.clid.fbclid ?? '',
        },
        pipelineId: int(env.KOMMO_AGENDA_PIPELINE_ID) ?? int(env.KOMMO_PIPELINE_ID),
        statusId: int(env.KOMMO_AGENDA_STATUS_ID) ?? int(env.KOMMO_STATUS_ID),
        responsibleUserId: int(env.KOMMO_RESPONSIBLE_USER_ID),
        source: `agenda-${i.type}`,
        folio: bookingFolio(i.eventId),
        budgetMs: KOMMO_MS - 500,
      };

      const kommoWork = (async () => {
        /** @type {any} */
        let res;
        try {
          res = await withTimeout(Promise.resolve(k.createLeadWithNote(input)), KOMMO_MS);
        } catch (e) {
          res = { ok: false, status: 0, reason: e instanceof Error && e.name === 'TimeoutError' ? 'timeout' : 'network' };
        }
        log({ accion: 'kommo-lead', tipo: i.type, ok: !!res?.ok, status: res?.status ?? null, reason: res?.reason ?? null, dryRun: !!res?.dryRun, leadId: res?.leadId ?? null, ms: Date.now() - t0 });
        try {
          await withTimeout(Promise.resolve(k.notify('lead.created', {
            source: `agenda-${i.type}`,
            folio: bookingFolio(i.eventId),
            kommo: { ok: !!res?.ok, status: res?.status ?? null, leadId: res?.leadId ?? null },
            data: {
              tipo: i.type, horario: formatSlotEs(i.startIso), inicio: i.startIso, zona: CDMX_TZ, meet: i.meetLink ?? null,
              pago: i.type === 'power' ? 'pendiente' : null, evento: i.eventId,
              nombre: i.form.fullName, correo: i.form.email, whatsapp: phoneE164, negocio: i.form.businessName,
              sitio: i.form.website || null, giro: i.form.industry, equipo: i.form.teamSize, facturacion: i.form.revenue,
              tiempo: i.type === 'power' ? i.form.timeDrains : undefined, herramientas: i.type === 'power' ? i.form.tools : undefined,
              objetivo: i.form.goal, origen: i.origin, atribucion: a,
            },
          })), 5000);
        } catch { /* el webhook es opcional */ }
        return res?.ok && res.leadId != null ? String(res.leadId) : null;
      })();

      const supabaseWork = (async () => {
        if (!supabaseOn()) return;
        const f = i.form;
        const row = {
          name: f.fullName.trim().slice(0, 120),
          email: f.email.trim().toLowerCase().slice(0, 254),
          phone: f.whatsapp.trim().slice(0, 40) || null,
          business: f.businessName.trim().slice(0, 160) || null,
          revenue_range: REVENUE_CODE.get(f.revenue) ?? null,
          source: i.type,
          message: f.goal.trim().slice(0, 4000) || null,
          session_start: i.startIso,
          details: {
            fullName: f.fullName, email: f.email, whatsapp: f.whatsapp, businessName: f.businessName, website: f.website,
            industry: f.industry, teamSize: f.teamSize, revenue: f.revenue, timeDrains: f.timeDrains, tools: f.tools, goal: f.goal,
            slot: i.startIso, origin: i.origin, timezone: CDMX_TZ, eventId: i.eventId, site: 'ingeniak',
            ...(a.visitorTimezone ? { visitorTimezone: a.visitorTimezone } : {}),
            ...(a.src ? { src: a.src } : {}),
            ...(Object.values(a.clid).some(Boolean) ? { clid: a.clid } : {}),
            ...(a.landing.path ? { landing: a.landing } : {}),
          },
          referrer: a.referrer,
          page_path: a.pagePath,
          ...a.utm,
          ...(i.type === 'power' ? { payment_status: 'pendiente', stripe_session_id: i.stripeSessionId ?? null } : {}),
        };
        const r = await sb('/leads', { method: 'POST', body: row, prefer: 'return=minimal' });
        log({ accion: 'supabase-lead', tipo: i.type, ok: r.ok, status: r.status });
      })();

      const [kommoLeadId] = await Promise.all([kommoWork, supabaseWork.catch(() => {})]);
      return { kommoLeadId };
    },

    /**
     * Pago confirmado: etiqueta `pagado` (quita `pago-pendiente`) + nota. Devuelve true si Kommo lo registró.
     * @param {string} leadId @param {{ when: string, meetLink: string | null, brief: string | null }} d
     */
    async kommoPaid(leadId, d) {
      try {
        const k = await getKommo();
        if (!k.kommoConfigured()) return false;
        const tags = await withTimeout(Promise.resolve(k.updateLeadTags(leadId, { add: ['pagado'], remove: ['pago-pendiente'] })), KOMMO_MS);
        const text = [`Pago confirmado en Stripe · ${d.when} (hora del centro de México)`, d.meetLink ? `Meet: ${d.meetLink}` : null, d.brief ? `Brief: ${d.brief}` : null]
          .filter(Boolean).join(' · ');
        const note = await withTimeout(Promise.resolve(k.addLeadNote(leadId, text)), KOMMO_MS);
        log({ accion: 'kommo-pagado', ok: !!tags?.ok, nota: !!note?.ok });
        return !!tags?.ok;
      } catch (e) {
        log({ accion: 'kommo-pagado', ok: false, error: e instanceof Error ? e.name : 'error' });
        return false;
      }
    },

    /** Apartado vencido o cancelado: etiqueta `expirado` (quita `pago-pendiente`). @param {string} leadId */
    async kommoExpired(leadId) {
      try {
        const k = await getKommo();
        if (!k.kommoConfigured()) return false;
        const r = await withTimeout(Promise.resolve(k.updateLeadTags(leadId, { add: ['expirado'], remove: ['pago-pendiente'] })), KOMMO_MS);
        log({ accion: 'kommo-expirado', ok: !!r?.ok });
        return !!r?.ok;
      } catch (e) {
        log({ accion: 'kommo-expirado', ok: false, error: e instanceof Error ? e.name : 'error' });
        return false;
      }
    },

    /** Supabase: pendiente|expirado → pagado (una sola vez, como el original). @param {string | null | undefined} sid */
    async supabasePaid(sid) {
      try { await setPaymentByStripe(String(sid ?? ''), 'pagado', ['pendiente', 'expirado']); } catch { /* nunca lanza */ }
    },
    /** Supabase: pendiente → expirado. @param {string | null | undefined} sid */
    async supabaseExpired(sid) {
      try { await setPaymentByStripe(String(sid ?? ''), 'expirado', ['pendiente']); } catch { /* nunca lanza */ }
    },
    /** Supabase: el evento ya no existe → expirado por details.eventId. @param {string} eventId */
    async supabaseExpiredByEvent(eventId) {
      if (!eventId || !supabaseOn()) return;
      try {
        const q = `details=cs.${encodeURIComponent(JSON.stringify({ eventId }))}&payment_status=eq.pendiente`;
        const r = await sb(`/leads?${q}`, { method: 'PATCH', body: { payment_status: 'expirado' }, prefer: 'return=minimal' });
        if (!r.ok) log({ accion: 'supabase', paso: 'expirado-evento', ok: false, status: r.status });
      } catch { /* nunca lanza */ }
    },

    /** Para brief.js (A1): el mismo cliente PostgREST. */
    sb,
    supabaseOn,
  };
}

/** Adaptador de producción (Kommo real de server/kommo.js; Supabase solo si hay variables). */
export const leads = createLeads();
