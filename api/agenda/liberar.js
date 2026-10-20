/**
 * POST /api/agenda/liberar/ { apartado } → libera el apartado de una Power Session cuando se cancela el pago en Stripe
 * (regreso a /power-session/?pago=cancelado&apartado=…; flujo-agenda.md §1.6-4 y §4.5).
 * Solo libera eventos `pendiente` cuyo Checkout no se pagó (si se pagó, confirma). Responde siempre 200 { ok: true }
 * con un id válido: los errores solo se registran y el cron lo reintenta. 400 con un id inválido.
 */
import { json, readJson, sameOrigin } from '../../server/http.js';
import { agenda } from '../../server/agenda/booking.js';
import { EVENT_ID_RE } from '../../shared/agenda.js';

export default {
  /** @param {Request} request */
  async fetch(request) {
    if (request.method !== 'POST') return json({ ok: false }, 405, { allow: 'POST' });
    if (!sameOrigin(request)) return json({ ok: false, error: 'Origen no permitido.' }, 403);
    const read = await readJson(request, { limit: 4096 });
    if (!read.ok) return json({ ok: false }, /** @type {{ status: number }} */ (/** @type {unknown} */ (read)).status);
    const id = /** @type {any} */ (read.data)?.apartado;
    if (typeof id !== 'string' || !EVENT_ID_RE.test(id)) return json({ ok: false }, 400);
    try {
      const estado = await agenda().releaseHold(id);
      console.log(JSON.stringify({ evento: 'agenda', accion: 'liberar', estado }));
    } catch (e) {
      console.error(JSON.stringify({ evento: 'agenda', accion: 'liberar', ok: false, error: e instanceof Error ? e.message.slice(0, 160) : 'error' }));
    }
    return json({ ok: true });
  },
};
