/**
 * Reserva de Discovery Session y Power Session · port de `lib/agenda/booking.server.ts` de riklanderos.tech
 * (CAMBIO-COTIZAR §5.2 y flujo-agenda.md §1–§2, §4.2 contrato de compatibilidad).
 *
 * Google Calendar es la fuente de verdad: apartados, estado y sesión de Stripe viven en `extendedProperties.private`
 * del evento (rl_tipo, rl_estado, rl_stripe, rl_email, rl_nombre + rl_sitio=ingeniak, ik_kommo, ik_kommo_pago).
 * Títulos exactos y descripción que termina en MARKER, para que el código de riklanderos procese igual estos eventos.
 *
 * `createBooking({ google, stripe, leads, brief, now, env })` recibe adaptadores (pruebas y simulación local);
 * `agenda()` arma el de producción o, en local sin credenciales, el simulado (server/agenda/mock.js).
 */
import {
  BUFFER_MINUTES, CONFIRM_PATH, HOLD_MINUTES, LANDING, MARKER, MIN_HOURS_AHEAD, POWER_CURRENCY, POWER_PRICE_CENTS,
  POWER_WEEKLY_LIMIT, SESSION_RULES, SITE_TAG, SITE_URL, bookableDates, cdmxToIso, formatSlotEs, weekKey,
} from '../../shared/agenda.js';
import { AgendaConfigError } from './google-auth.js';
import { google as realGoogle } from './google.js';
import { stripe as realStripe } from './stripe.js';
import { leads as realLeads } from './leads.js';
import { createBrief } from './brief.js';
import { mockActive, mockAdapters } from './mock.js';

/** Propiedades privadas del evento (contrato con riklanderos.tech: mismos nombres y valores). */
export const P = /** @type {const} */ ({
  type: 'rl_tipo', state: 'rl_estado', stripe: 'rl_stripe', email: 'rl_email', name: 'rl_nombre',
  site: 'rl_sitio', kommo: 'ik_kommo', kommoPaid: 'ik_kommo_pago',
});

/** El horario ya no está libre (otra persona lo tomó, o el cupo se llenó). */
export class SlotTakenError extends Error {
  constructor(message = 'Ese horario se acaba de ocupar. Elige otro, por favor.') {
    super(message);
    this.name = 'SlotTakenError';
  }
}

/**
 * Dominio al que Stripe regresa al visitante (flujo-agenda §4.9). AGENDA_BASE_URL lo fuerza.
 * Producción → https://ingeniak.mx · Preview → https://VERCEL_BRANCH_URL|VERCEL_URL · local / vercel dev → origen de la petición.
 * @param {Request | null} request
 * @param {NodeJS.ProcessEnv} [env]
 */
export function baseUrl(request, env = process.env) {
  if (env.AGENDA_BASE_URL) return env.AGENDA_BASE_URL.trim().replace(/\/+$/, '');
  if (env.VERCEL_ENV === 'production') return SITE_URL;
  if (env.VERCEL_ENV === 'preview') {
    const h = env.VERCEL_BRANCH_URL || env.VERCEL_URL;
    if (h) return `https://${h.replace(/^https?:\/\//, '').replace(/\/+$/, '')}`;
  }
  try {
    if (request) return new URL(request.url).origin;
  } catch { /* sin URL */ }
  return SITE_URL;
}

/** @param {Record<string, unknown>} o */
function log(o) {
  try { console.log(JSON.stringify({ evento: 'agenda', ...o })); } catch { /* nada */ }
}
/** @param {unknown} e */
const errName = (e) => (e instanceof Error ? `${e.name}${'status' in e ? ` ${/** @type {any} */ (e).status}` : ''}` : 'error');

/**
 * @typedef {import('../../shared/agenda.js').SessionType} SessionType
 * @typedef {import('../../shared/agenda.js').BookingForm} BookingForm
 * @typedef {import('../../shared/agenda.js').DayAvailability} DayAvailability
 * @typedef {import('./google.js').CalEvent} CalEvent
 * @typedef {import('./leads.js').BookingAttribution} BookingAttribution
 * @typedef {{
 *   google: ReturnType<typeof import('./google.js').createGoogle>,
 *   stripe: { createCheckout: (p: any) => Promise<any>, retrieveCheckout: (id: string) => Promise<any>, expireCheckout: (id: string) => Promise<any> },
 *   leads: ReturnType<typeof import('./leads.js').createLeads>,
 *   brief?: { ensureBrief: (i: any) => Promise<string | null>, briefUrl: (t: string) => string },
 *   now?: () => Date,
 *   env?: NodeJS.ProcessEnv,
 *   calendars?: { power: string, discovery: string },
 * }} Adapters
 */

/** @param {Adapters} a */
export function createBooking(a) {
  const { google, stripe, leads } = a;
  const env = a.env ?? process.env;
  const now = a.now ?? (() => new Date());
  const brief = a.brief ?? createBrief(leads);

  /** Calendario de cada sesión (los mismos IDs que riklanderos.tech en la opción A). @param {SessionType} type */
  function calendarFor(type) {
    if (a.calendars) return a.calendars[type];
    const id = type === 'power' ? env.POWER_CALENDAR_ID : env.DISCOVERY_CALENDAR_ID;
    if (!id) throw new AgendaConfigError(`Falta ${type === 'power' ? 'POWER' : 'DISCOVERY'}_CALENDAR_ID`);
    return id;
  }
  /** Rik atiende las dos sesiones: la ocupación se cruza entre los dos calendarios y su calendario principal. */
  const busyCalendars = () => Array.from(new Set([calendarFor('power'), calendarFor('discovery'), 'primary']));

  const overlaps = (/** @type {number} */ aS, /** @type {number} */ aE, /** @type {number} */ bS, /** @type {number} */ bE) => aS < bE && bS < aE;
  const endIso = (/** @type {SessionType} */ type, /** @type {string} */ startIso) =>
    new Date(Date.parse(startIso) + SESSION_RULES[type].minutes * 60_000).toISOString();

  /**
   * Próximos 5 días hábiles con sus horarios libres.
   * @param {SessionType} type @param {Date} [at]
   * @returns {Promise<DayAvailability[]>}
   */
  async function availability(type, at = now()) {
    const rule = SESSION_RULES[type];
    const dates = bookableDates(at);
    const timeMin = cdmxToIso(dates[0], '00:00');
    const timeMax = cdmxToIso(dates[dates.length - 1], '23:59');
    const busy = (await google.freeBusy(busyCalendars(), timeMin, timeMax, /** @type {any} */ ({ type }))).map(
      (b) => /** @type {const} */ ([Date.parse(b.start), Date.parse(b.end)]),
    );
    const earliest = at.getTime() + MIN_HOURS_AHEAD * 3600_000;
    const pad = BUFFER_MINUTES * 60_000;

    // Cupo semanal de Power Sessions: cuenta las confirmadas y las apartadas (de los dos sitios, mismo calendario).
    const fullWeeks = new Set();
    if (type === 'power') {
      for (const w of Array.from(new Set(dates.map(weekKey)))) {
        const start = cdmxToIso(w, '00:00');
        const end = new Date(Date.parse(start) + 7 * 86400_000).toISOString();
        const events = await google.listEvents(calendarFor('power'), { timeMin: start, timeMax: end, privateProps: { [P.type]: 'power' } });
        if (events.length >= POWER_WEEKLY_LIMIT) fullWeeks.add(w);
      }
    }

    return dates.map((date) => {
      if (fullWeeks.has(weekKey(date))) return { date, slots: [] };
      const slots = rule.times
        .map((t) => cdmxToIso(date, t))
        .filter((iso) => {
          const s = Date.parse(iso);
          const e = s + rule.minutes * 60_000;
          if (s < earliest) return false;
          return !busy.some(([bs, be]) => overlaps(s - pad, e + pad, bs, be));
        });
      return { date, slots };
    });
  }

  /** @param {SessionType} type @param {string} startIso */
  async function assertSlotFree(type, startIso) {
    const days = await availability(type);
    if (!days.some((d) => d.slots.includes(startIso))) throw new SlotTakenError();
  }

  /**
   * Descripción del evento (lo que Rik lee antes de la llamada). Termina SIEMPRE en MARKER.
   * @param {SessionType} type @param {BookingForm} f @param {string[]} [extra]
   */
  function describe(type, f, extra = []) {
    const lines = [
      `${SESSION_RULES[type].label} · ${SESSION_RULES[type].minutes} min`,
      '',
      `Nombre: ${f.fullName}`,
      `Correo: ${f.email}`,
      `WhatsApp: ${f.whatsapp}`,
      `Negocio: ${f.businessName}`,
      f.website ? `Sitio / redes: ${f.website}` : null,
      `Giro: ${f.industry}`,
      `Equipo: ${f.teamSize}`,
      `Facturación mensual: ${f.revenue}`,
      type === 'power' ? `Dónde se le va el tiempo: ${f.timeDrains.join(', ')}` : null,
      type === 'power' ? `Herramientas que usan hoy: ${f.tools}` : null,
      '',
      'Qué quiere resolver:',
      f.goal,
      ...(extra.length ? ['', ...extra] : []),
    ];
    return lines.filter((l) => l !== null).join('\n') + MARKER;
  }

  /**
   * Kommo `pagado` + nota, una sola vez por evento (marca ik_kommo_pago=1). Nunca lanza.
   * @param {string} cal @param {string} eventId @param {Record<string, string>} props
   * @param {{ when: string, meetLink: string | null, brief: string | null }} d
   */
  async function syncKommoPaidFor(cal, eventId, props, d) {
    try {
      if (!props[P.kommo] || props[P.kommoPaid]) return false;
      const ok = await leads.kommoPaid(props[P.kommo], d);
      if (!ok) return false;
      await google.patchPrivate(cal, eventId, { ...props, [P.kommoPaid]: '1' });
      return true;
    } catch (e) {
      log({ accion: 'kommo-pagado-sync', ok: false, error: errName(e) });
      return false;
    }
  }

  /**
   * Discovery: cita confirmada al instante (Meet + invitación de Google). Power: apartado → URL de Stripe Checkout.
   * @param {{ type: SessionType, form: BookingForm, startIso: string, origin: string | null, baseUrl: string, attribution: BookingAttribution }} i
   * @returns {Promise<{ kind: 'confirmed', when: string, meetLink: string | null } | { kind: 'checkout', url: string }>}
   */
  async function reserve({ type, form, startIso, origin, baseUrl: base, attribution }) {
    await assertSlotFree(type, startIso);
    const cal = calendarFor(type);
    /** @type {Record<string, string>} */
    const props = { [P.type]: type, [P.email]: form.email.slice(0, 200), [P.name]: form.fullName.slice(0, 120), [P.site]: SITE_TAG };
    const source = origin ? [`Origen: ${origin}`] : [];

    if (type === 'discovery') {
      const privateProps = { ...props, [P.state]: 'confirmada' };
      const ev = await google.insertEvent(cal, {
        summary: `Discovery Session · ${form.businessName} (${form.fullName})`,
        description: describe(type, form, source),
        startIso,
        endIso: endIso(type, startIso),
        attendeeEmail: form.email,
        withMeet: true,
        privateProps,
      });
      const meetLink = ev.hangoutLink ?? null;
      // Después del evento: si Kommo o Supabase fallan, la cita ya quedó y el visitante igual recibe el Meet.
      const { kommoLeadId } = await leads.recordBooking({ type, form, startIso, origin, eventId: ev.id, attribution, meetLink });
      if (kommoLeadId) {
        await google.patchPrivate(cal, ev.id, { ...(ev.extendedProperties?.private ?? privateProps), [P.kommo]: kommoLeadId })
          .catch((e) => log({ accion: 'ik_kommo', ok: false, error: errName(e) }));
      }
      return { kind: 'confirmed', when: formatSlotEs(startIso), meetLink };
    }

    // Power Session: se aparta el horario (sin invitar al visitante) mientras paga.
    const holdProps = { ...props, [P.state]: 'pendiente' };
    const hold = await google.insertEvent(cal, {
      summary: `[Apartado · pago pendiente] Power Session · ${form.businessName}`,
      description: describe(type, form, source),
      startIso,
      endIso: endIso(type, startIso),
      privateProps: holdProps,
    });

    /** @type {any} */
    let session = null;
    /** @type {Record<string, string>} */
    let current;
    try {
      session = await stripe.createCheckout({
        mode: 'payment',
        customer_email: form.email,
        line_items: [{
          quantity: 1,
          price_data: {
            currency: POWER_CURRENCY,
            unit_amount: POWER_PRICE_CENTS,
            product_data: {
              name: 'Power Session · 90 min 1:1 con Rik Landeros',
              description: `${formatSlotEs(startIso)} (hora del centro de México)`,
            },
          },
        }],
        expires_at: Math.floor(now().getTime() / 1000) + HOLD_MINUTES * 60,
        metadata: { rl_event: hold.id, rl_tipo: 'power', rl_inicio: startIso, rl_sitio: SITE_TAG },
        payment_intent_data: { description: `Power Session · ${form.businessName} · ${formatSlotEs(startIso)}` },
        success_url: `${base}${CONFIRM_PATH}?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${base}${LANDING.power}?pago=cancelado&apartado=${encodeURIComponent(hold.id)}`,
        locale: 'es-419',
      });
      if (!session?.url) throw new Error('Stripe no devolvió URL de pago');
      // rl_stripe en cuanto existe la sesión: un barrido (de aquí o de riklanderos.tech) borra los apartados sin rl_stripe.
      current = { ...holdProps, [P.stripe]: session.id };
      await google.patchPrivate(cal, hold.id, current);
    } catch (e) {
      await google.deleteEvent(cal, hold.id).catch(() => {});
      if (session?.id && session.url) await stripe.expireCheckout(session.id).catch(() => {});
      throw e;
    }

    // Fuera del try: un fallo de Kommo o Supabase no borra el apartado ni el Checkout.
    const { kommoLeadId } = await leads.recordBooking({
      type, form, startIso, origin, eventId: hold.id, attribution, stripeSessionId: session.id,
    });
    if (kommoLeadId) {
      await google.patchPrivate(cal, hold.id, { ...current, [P.kommo]: kommoLeadId })
        .catch((e) => log({ accion: 'ik_kommo', ok: false, error: errName(e) }));
    }
    return { kind: 'checkout', url: String(session.url) };
  }

  /**
   * Convierte un apartado pagado en la cita real: invita al visitante, crea el Meet y el brief (A1). Idempotente.
   * @param {string} eventId
   * @returns {Promise<{ when: string, start: string, meetLink: string | null, brief: string | null }>}
   */
  async function confirmPower(eventId) {
    const cal = calendarFor('power');
    const ev = await google.getEvent(cal, eventId);
    const props = ev.extendedProperties?.private ?? {};
    const startIso = ev.start?.dateTime ? new Date(ev.start.dateTime).toISOString() : '';
    // También en el retorno temprano (cita ya confirmada): si el primer UPDATE falló, este lo reintenta.
    await leads.supabasePaid(props[P.stripe]);
    const name = props[P.name] ?? '';
    const business = ((ev.summary ?? '').split('Power Session · ')[1] ?? name).replace(/\s*\([^)]*\)$/, '');
    const token = await brief.ensureBrief({
      eventId, stripeSessionId: props[P.stripe] ?? null, name, email: props[P.email] ?? null, business, sessionStart: startIso || null,
    });
    const briefLink = token ? brief.briefUrl(token) : null;
    const when = formatSlotEs(startIso);
    let meetLink = ev.hangoutLink ?? null;
    let current = props;
    if (props[P.state] !== 'confirmada') {
      const desc = ev.description ?? '';
      const briefLine = briefLink ? `Antes de la sesión, llena tu brief (8–10 min, puedes contestar con audio):\n${briefLink}\n\n` : '';
      current = { ...props, [P.state]: 'confirmada' };
      const updated = await google.patchEvent(cal, eventId, {
        summary: `Power Session · ${business} (${name})`,
        description: briefLine + desc.replace(/\n\nAgendado desde/, '\n\nPago confirmado en Stripe.\n\nAgendado desde'),
        startIso,
        endIso: ev.end?.dateTime ? new Date(ev.end.dateTime).toISOString() : endIso('power', startIso),
        attendeeEmail: props[P.email],
        withMeet: true,
        privateProps: current,
      });
      meetLink = updated?.hangoutLink ?? meetLink;
      current = updated?.extendedProperties?.private ?? current;
    }
    await syncKommoPaidFor(cal, eventId, current, { when, meetLink, brief: briefLink });
    return { when, start: startIso, meetLink, brief: briefLink };
  }

  /**
   * Regreso de Stripe: se verifica el pago con Stripe (no con la URL) y se confirma la cita.
   * @param {string} sessionId
   */
  async function confirmFromCheckout(sessionId) {
    const s = await stripe.retrieveCheckout(sessionId);
    const eventId = s?.metadata?.rl_event;
    if (!eventId) throw new Error('Pago sin cita asociada');
    if (s.payment_status !== 'paid') return /** @type {const} */ ({ paid: false });
    // Antes de tocar Calendar: el pago ya está hecho y el aviso "pagado" no depende de que el evento siga existiendo.
    await leads.supabasePaid(sessionId);
    const r = await confirmPower(eventId);
    return { paid: /** @type {const} */ (true), ...r, email: s.customer_details?.email ?? s.customer_email ?? null };
  }

  /**
   * Libera un apartado si se canceló el pago (solo si sigue pendiente y su Checkout no se pagó).
   * @param {string} eventId
   * @returns {Promise<'no-existe' | 'reintentar' | 'confirmada' | 'sin-cambio' | 'liberado'>}
   */
  async function releaseHold(eventId) {
    const cal = calendarFor('power');
    /** @type {CalEvent} */
    let ev;
    try {
      ev = await google.getEvent(cal, eventId);
    } catch (e) {
      // 404/410: el apartado ya se borró. Otro error (red) no se trata como liberación: el cron lo reintenta.
      if (/** @type {any} */ (e)?.status === 404 || /** @type {any} */ (e)?.status === 410) {
        await leads.supabaseExpiredByEvent(eventId);
        return 'no-existe';
      }
      log({ accion: 'liberar', ok: false, error: errName(e) });
      return 'reintentar';
    }
    const props = ev.extendedProperties?.private ?? {};
    if (props[P.type] !== 'power') return 'sin-cambio';
    if (props[P.state] !== 'pendiente') {
      // Ya confirmada: no se libera. Se reintenta "pagado" por si el UPDATE anterior no llegó.
      if (props[P.state] === 'confirmada') {
        await leads.supabasePaid(props[P.stripe]);
        return 'confirmada';
      }
      return 'sin-cambio';
    }
    const sid = props[P.stripe];
    if (sid) {
      const s = await stripe.retrieveCheckout(sid);
      if (s.payment_status === 'paid') {
        await confirmPower(eventId);
        return 'confirmada';
      }
      if (s.status === 'open') await stripe.expireCheckout(s.id ?? sid).catch(() => {});
      await leads.supabaseExpired(sid);
    } else {
      await leads.supabaseExpiredByEvent(eventId);
    }
    if (props[P.kommo]) await leads.kommoExpired(props[P.kommo]);
    await google.deleteEvent(cal, eventId);
    return 'liberado';
  }

  /**
   * Cron: Kommo `pagado` para las Power Sessions de ingeniak.mx confirmadas en los últimos 2 días sin ik_kommo_pago
   * (caso en que confirmó el cron de riklanderos.tech, que no conoce Kommo). Un evento que falla no detiene a los demás.
   */
  async function syncKommoPaid() {
    const cal = calendarFor('power');
    const t = now().getTime();
    const events = await google.listEvents(cal, {
      timeMin: new Date(t - 2 * 86400_000).toISOString(),
      timeMax: new Date(t + 21 * 86400_000).toISOString(),
      privateProps: { [P.site]: SITE_TAG, [P.state]: 'confirmada', [P.type]: 'power' },
    });
    let synced = 0;
    for (const ev of events) {
      const props = ev.extendedProperties?.private ?? {};
      if (!props[P.kommo] || props[P.kommoPaid]) continue;
      try {
        const startIso = ev.start?.dateTime ? new Date(ev.start.dateTime).toISOString() : '';
        const token = await brief.ensureBrief({
          eventId: ev.id, stripeSessionId: props[P.stripe] ?? null, name: props[P.name] ?? null, email: props[P.email] ?? null,
          business: ((ev.summary ?? '').split('Power Session · ')[1] ?? '').replace(/\s*\([^)]*\)$/, ''), sessionStart: startIso || null,
        });
        const d = { when: formatSlotEs(startIso), meetLink: ev.hangoutLink ?? null, brief: token ? brief.briefUrl(token) : null };
        if (await syncKommoPaidFor(cal, ev.id, props, d)) synced++;
      } catch (e) {
        log({ accion: 'kommo-sync', ok: false, error: errName(e) });
      }
    }
    return synced;
  }

  /**
   * Cron (cada 10 min, desfasado 5 de riklanderos.tech): confirma los apartados pagados de ingeniak.mx (si el visitante
   * cerró la pestaña) y libera los vencidos. Mejora sobre el original: try/catch por evento. Solo toca apartados con
   * rl_sitio=ingeniak: los de riklanderos.tech los barre su propio cron (con su brief).
   */
  async function sweepHolds() {
    const cal = calendarFor('power');
    const t = now().getTime();
    const events = await google.listEvents(cal, {
      timeMin: new Date(t - 86400_000).toISOString(),
      timeMax: new Date(t + 21 * 86400_000).toISOString(),
      privateProps: { [P.state]: 'pendiente', [P.site]: SITE_TAG },
    });
    const result = { revisados: events.length, confirmados: 0, liberados: 0, errores: 0, kommo: 0 };
    for (const ev of events) {
      try {
        const props = ev.extendedProperties?.private ?? {};
        const sid = props[P.stripe];
        if (!sid) {
          // Apartado recién creado: rl_stripe llega segundos después del alta; no se toca en sus primeros 5 minutos.
          const created = Date.parse(/** @type {any} */ (ev).created ?? '');
          if (Number.isFinite(created) && t - created < 5 * 60_000) continue;
          await leads.supabaseExpiredByEvent(ev.id);
          if (props[P.kommo]) await leads.kommoExpired(props[P.kommo]);
          await google.deleteEvent(cal, ev.id);
          result.liberados++;
          continue;
        }
        const s = await stripe.retrieveCheckout(sid);
        if (s.payment_status === 'paid') {
          await confirmPower(ev.id);
          result.confirmados++;
        } else if (s.status === 'expired' || (s.status === 'open' && Number(s.expires_at) * 1000 < t)) {
          // Stripe marca las sesiones vencidas con retraso: si ya pasó su hora, se vence aquí mismo.
          if (s.status === 'open') await stripe.expireCheckout(s.id ?? sid).catch(() => {});
          await leads.supabaseExpired(sid);
          if (props[P.kommo]) await leads.kommoExpired(props[P.kommo]);
          await google.deleteEvent(cal, ev.id);
          result.liberados++;
        }
      } catch (e) {
        result.errores++;
        log({ accion: 'barrido', ok: false, error: errName(e) });
      }
    }
    try {
      result.kommo = await syncKommoPaid();
    } catch (e) {
      log({ accion: 'kommo-sync', ok: false, error: errName(e) });
    }
    return result;
  }

  return { calendarFor, availability, reserve, confirmPower, confirmFromCheckout, releaseHold, sweepHolds, syncKommoPaid };
}

/** ¿Se está usando la simulación local? (nunca en Vercel) */
export function isMock(env = process.env) {
  return mockActive(env);
}

/**
 * Agenda con los adaptadores del entorno: simulados en local sin credenciales, reales en el resto.
 * @param {NodeJS.ProcessEnv} [env]
 */
export function agenda(env = process.env) {
  if (mockActive(env)) return createBooking({ ...mockAdapters(), env });
  return createBooking({ google: realGoogle, stripe: realStripe, leads: realLeads, env });
}
