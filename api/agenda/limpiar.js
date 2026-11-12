/**
 * GET /api/agenda/limpiar/ · Vercel Cron (cada 10 min, desfasado 5 del de riklanderos.tech): confirma los apartados de
 * ingeniak.mx que se pagaron sin regresar a la página, libera los vencidos y sincroniza Kommo (`pagado`).
 * Antes revisa la salud de la agenda (server/agenda/salud.js): si no puede leer Google Calendar, deja una tarea en Kommo
 * con el enlace para renovar el permiso.
 * Exige `Authorization: Bearer ${CRON_SECRET}` (Vercel la manda sola); sin la variable o con otro valor → 401.
 * 200 { ok: true, agenda: 'ok' | 'caida', revisados, confirmados, liberados, errores, kommo } · 500 { ok: false, agenda }.
 */
import { json } from '../../server/http.js';
import { agenda } from '../../server/agenda/booking.js';
import { revisarAgenda } from '../../server/agenda/salud.js';

export default {
  /** @param {Request} request */
  async fetch(request) {
    if (request.method !== 'GET') return json({ ok: false }, 405, { allow: 'GET' });
    const secret = process.env.CRON_SECRET;
    if (!secret || request.headers.get('authorization') !== `Bearer ${secret}`) return json({ ok: false }, 401);
    const a = agenda();
    const salud = (await revisarAgenda(a)).estado;
    try {
      const r = await a.sweepHolds();
      console.log(JSON.stringify({ evento: 'agenda', accion: 'limpiar', agenda: salud, ...r }));
      return json({ ok: true, agenda: salud, ...r });
    } catch (e) {
      console.error(JSON.stringify({ evento: 'agenda', accion: 'limpiar', ok: false, agenda: salud, error: e instanceof Error ? e.message.slice(0, 160) : 'error' }));
      return json({ ok: false, agenda: salud }, 500);
    }
  },
};
