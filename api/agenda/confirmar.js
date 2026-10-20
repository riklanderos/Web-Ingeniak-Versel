/**
 * POST /api/agenda/confirmar/ { session_id } → verifica el pago con Stripe y convierte el apartado en la cita real
 * (reemplaza el render de servidor de /agendar/confirmado de riklanderos.tech; flujo-agenda.md §4.5). Idempotente.
 * 200 { ok: true, state: 'ok', when, start, meetLink, email, brief } (start: ISO, para la hora local) · 200 { ok: true, state: 'pending' } ·
 * 400 { ok: false, state: 'error' } (id inválido) · 500 { ok: false, state: 'error' }.
 * Es POST (no GET) porque tiene efectos: así no lo disparan prefetchers ni rastreadores.
 */
import { json, readJson, sameOrigin } from '../../server/http.js';
import { agenda } from '../../server/agenda/booking.js';
import { SESSION_ID_RE } from '../../shared/agenda.js';

export default {
  /** @param {Request} request */
  async fetch(request) {
    if (request.method !== 'POST') return json({ ok: false, state: 'error' }, 405, { allow: 'POST' });
    if (!sameOrigin(request)) return json({ ok: false, state: 'error', error: 'Origen no permitido.' }, 403);
    const read = await readJson(request, { limit: 2048 });
    if (!read.ok) return json({ ok: false, state: 'error' }, /** @type {{ status: number }} */ (/** @type {unknown} */ (read)).status);
    const sessionId = /** @type {any} */ (read.data)?.session_id;
    if (typeof sessionId !== 'string' || !SESSION_ID_RE.test(sessionId)) return json({ ok: false, state: 'error' }, 400);
    try {
      const r = await agenda().confirmFromCheckout(sessionId);
      if (!r.paid) return json({ ok: true, state: 'pending' });
      return json({ ok: true, state: 'ok', when: r.when, start: r.start, meetLink: r.meetLink, email: r.email, brief: r.brief });
    } catch (e) {
      console.error(JSON.stringify({ evento: 'agenda', accion: 'confirmar', ok: false, error: e instanceof Error ? e.message.slice(0, 160) : 'error' }));
      return json({ ok: false, state: 'error' }, 500);
    }
  },
};
