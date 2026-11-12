/**
 * GET /api/agenda/salud/ · Vercel Cron, una vez al día a las 8:00 de CDMX (14:00 UTC; pedido del cliente, 2026-11-11):
 * pide la disponibilidad de la Discovery y, si no puede leer Google Calendar, deja una tarea «[Agenda caída]» en Kommo
 * con el enlace para renovar el permiso (server/agenda/salud.js).
 * Exige `Authorization: Bearer ${CRON_SECRET}` (Vercel la manda sola); sin la variable o con otro valor → 401.
 * 200 { ok: true, agenda: 'ok' } · 200 { ok: true, agenda: 'caida', aviso }.
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
    const r = await revisarAgenda(agenda());
    if (r.estado === 'ok') console.log(JSON.stringify({ evento: 'agenda', accion: 'salud', ok: true }));
    return json(r.estado === 'ok' ? { ok: true, agenda: 'ok' } : { ok: true, agenda: 'caida', aviso: r.aviso });
  },
};
