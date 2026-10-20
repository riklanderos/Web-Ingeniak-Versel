/**
 * Google Calendar v3 por REST con `fetch` (sin SDK). Copia de `lib/agenda/google.server.ts` de riklanderos.tech
 * + `patchPrivate` (PATCH mínimo de las propiedades privadas, sin avisar a invitados) + `getCalendar` (diagnóstico).
 *
 * `createGoogle({ getToken })` devuelve el adaptador; `google` es el de producción (token de google-auth.js).
 * El mock (server/agenda/mock.js) implementa la misma interfaz.
 */
import { CDMX_TZ } from '../../shared/agenda.js';
import { googleToken } from './google-auth.js';

const API = 'https://www.googleapis.com/calendar/v3';
const TIMEOUT_MS = 10_000;

/** Error de la API de Google con su código HTTP. El mensaje empieza con "Google Calendar <status>:" como el original. */
export class GoogleError extends Error {
  /** @param {number} status @param {string} message */
  constructor(status, message) {
    super(`Google Calendar ${status}: ${message}`);
    this.name = 'GoogleError';
    this.status = status;
  }
}

/**
 * @typedef {{
 *   id: string, summary?: string, description?: string, status?: string,
 *   start?: { dateTime?: string }, end?: { dateTime?: string }, hangoutLink?: string,
 *   attendees?: { email: string }[], extendedProperties?: { private?: Record<string, string> }
 * }} CalEvent
 * @typedef {{ start: string, end: string }} Busy
 * @typedef {{
 *   summary: string, description: string, startIso: string, endIso: string,
 *   attendeeEmail?: string, withMeet?: boolean, privateProps: Record<string, string>
 * }} EventInput
 */

/**
 * @param {EventInput} e
 */
export function eventBody(e) {
  return {
    summary: e.summary,
    description: e.description,
    start: { dateTime: e.startIso, timeZone: CDMX_TZ },
    end: { dateTime: e.endIso, timeZone: CDMX_TZ },
    attendees: e.attendeeEmail ? [{ email: e.attendeeEmail }] : [],
    extendedProperties: { private: e.privateProps },
    reminders: { useDefault: true },
    ...(e.withMeet
      ? { conferenceData: { createRequest: { requestId: `ik-${crypto.randomUUID()}`, conferenceSolutionKey: { type: 'hangoutsMeet' } } } }
      : {}),
  };
}

/**
 * @param {{ getToken?: () => Promise<string> }} [opts]
 */
export function createGoogle({ getToken = () => googleToken() } = {}) {
  /**
   * @template T
   * @param {string} path
   * @param {RequestInit} [init]
   * @returns {Promise<T>}
   */
  async function gfetch(path, init = {}) {
    const token = await getToken();
    const res = await fetch(`${API}${path}`, {
      ...init,
      headers: { ...(init.headers ?? {}), authorization: `Bearer ${token}`, 'content-type': 'application/json' },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (res.status === 204) return /** @type {T} */ (undefined);
    /** @type {any} */
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new GoogleError(res.status, String(json?.error?.message ?? 'error').slice(0, 160));
    return json;
  }

  return {
    /** Solo diagnóstico (/api/agenda/estado/): ¿la cuenta ve este calendario? */
    async getCalendar(/** @type {string} */ calendarId) {
      return gfetch(`/calendars/${encodeURIComponent(calendarId)}?fields=id`);
    },

    /**
     * Intervalos ocupados de varios calendarios (el 4.º argumento es una pista que solo usa el mock).
     * @param {string[]} calendarIds @param {string} timeMin @param {string} timeMax
     * @param {{ type?: string }} [_hint] solo la usa el mock (ocupación determinista por tipo)
     * @returns {Promise<Busy[]>}
     */
    async freeBusy(calendarIds, timeMin, timeMax, _hint) {
      /** @type {any} */
      const j = await gfetch('/freeBusy', {
        method: 'POST',
        body: JSON.stringify({ timeMin, timeMax, timeZone: CDMX_TZ, items: calendarIds.map((id) => ({ id })) }),
      });
      const cals = Object.values(j?.calendars ?? {});
      // Un calendario que Google no puede leer (permiso, id) llega con `errors`: se trata como falla, nunca como libre.
      if (cals.some((c) => Array.isArray(c?.errors) && c.errors.length)) throw new GoogleError(424, 'calendario sin acceso en freeBusy');
      return cals.flatMap((c) => c?.busy ?? []);
    },

    /**
     * @param {string} calendarId
     * @param {{ timeMin: string, timeMax: string, privateProps?: Record<string, string> }} params
     * @returns {Promise<CalEvent[]>}
     */
    async listEvents(calendarId, params) {
      const q = new URLSearchParams({ timeMin: params.timeMin, timeMax: params.timeMax, singleEvents: 'true', maxResults: '250' });
      for (const [k, v] of Object.entries(params.privateProps ?? {})) q.append('privateExtendedProperty', `${k}=${v}`);
      /** @type {any} */
      const j = await gfetch(`/calendars/${encodeURIComponent(calendarId)}/events?${q}`);
      return (j?.items ?? []).filter((/** @type {CalEvent} */ e) => e.status !== 'cancelled');
    },

    /** @param {string} calendarId @param {string} eventId @returns {Promise<CalEvent>} */
    async getEvent(calendarId, eventId) {
      return gfetch(`/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(eventId)}`);
    },

    /** @param {string} calendarId @param {EventInput} e @returns {Promise<CalEvent>} */
    async insertEvent(calendarId, e) {
      const q = new URLSearchParams({ conferenceDataVersion: '1', sendUpdates: e.attendeeEmail ? 'all' : 'none' });
      return gfetch(`/calendars/${encodeURIComponent(calendarId)}/events?${q}`, { method: 'POST', body: JSON.stringify(eventBody(e)) });
    },

    /** @param {string} calendarId @param {string} eventId @param {EventInput} e @returns {Promise<CalEvent>} */
    async patchEvent(calendarId, eventId, e) {
      const q = new URLSearchParams({ conferenceDataVersion: '1', sendUpdates: e.attendeeEmail ? 'all' : 'none' });
      return gfetch(`/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(eventId)}?${q}`, {
        method: 'PATCH',
        body: JSON.stringify(eventBody(e)),
      });
    },

    /**
     * PATCH mínimo: solo `extendedProperties.private` (se manda el mapa completo), sin avisar a nadie.
     * @param {string} calendarId @param {string} eventId @param {Record<string, string>} props
     * @returns {Promise<CalEvent>}
     */
    async patchPrivate(calendarId, eventId, props) {
      return gfetch(`/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(eventId)}?sendUpdates=none`, {
        method: 'PATCH',
        body: JSON.stringify({ extendedProperties: { private: props } }),
      });
    },

    /** 404 y 410 cuentan como éxito (ya no existe). @param {string} calendarId @param {string} eventId */
    async deleteEvent(calendarId, eventId) {
      try {
        await gfetch(`/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(eventId)}?sendUpdates=none`, { method: 'DELETE' });
      } catch (e) {
        if (!(e instanceof GoogleError && (e.status === 404 || e.status === 410))) throw e;
      }
    },
  };
}

/** Adaptador de producción. */
export const google = createGoogle();
