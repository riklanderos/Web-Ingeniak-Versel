/**
 * GET /api/agenda/limpiar/ · Vercel Cron (cada 10 min, desfasado 5 del de riklanderos.tech): confirma los apartados de
 * ingeniak.mx que se pagaron sin regresar a la página, libera los vencidos y sincroniza Kommo (`pagado`).
 * Exige `Authorization: Bearer ${CRON_SECRET}` (Vercel la manda sola); sin la variable o con otro valor → 401.
 * 200 { ok: true, revisados, confirmados, liberados, errores, kommo } · 500 { ok: false }.
 */
import { json } from '../../server/http.js';
import { agenda } from '../../server/agenda/booking.js';

export default {
  /** @param {Request} request */
  async fetch(request) {
    if (request.method !== 'GET') return json({ ok: false }, 405, { allow: 'GET' });
    const secret = process.env.CRON_SECRET;
    if (!secret || request.headers.get('authorization') !== `Bearer ${secret}`) return json({ ok: false }, 401);
    try {
      const r = await agenda().sweepHolds();
      console.log(JSON.stringify({ evento: 'agenda', accion: 'limpiar', ...r }));
      return json({ ok: true, ...r });
    } catch (e) {
      console.error(JSON.stringify({ evento: 'agenda', accion: 'limpiar', ok: false, error: e instanceof Error ? e.message.slice(0, 160) : 'error' }));
      return json({ ok: false }, 500);
    }
  },
};
