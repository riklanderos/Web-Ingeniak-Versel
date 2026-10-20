/**
 * GET /api/agenda/disponibilidad/?tipo=discovery|power → próximos 5 días hábiles con sus horarios libres
 * (contrato de flujo-agenda.md §2.2 con las diferencias de CAMBIO-COTIZAR §5.3).
 * 200 { ok: true, days: [{ date, slots: [iso…] }], simulacion? } · 400 tipo inválido · 503 agenda ilegible.
 */
import { json } from '../../server/http.js';
import { agenda, isMock } from '../../server/agenda/booking.js';

const ERROR_AGENDA = 'No pudimos leer la agenda en este momento. Inténtalo en unos minutos o escríbenos por WhatsApp.';

export default {
  /** @param {Request} request */
  async fetch(request) {
    if (request.method !== 'GET') return json({ ok: false, error: 'Método no permitido.' }, 405, { allow: 'GET' });
    const tipo = new URL(request.url).searchParams.get('tipo');
    if (tipo !== 'power' && tipo !== 'discovery') return json({ ok: false, error: 'Tipo inválido.' }, 400);
    try {
      const days = await agenda().availability(tipo);
      return json({ ok: true, days, ...(isMock() ? { simulacion: true } : {}) });
    } catch (e) {
      console.error(JSON.stringify({ evento: 'agenda', accion: 'disponibilidad', tipo, ok: false, error: e instanceof Error ? e.message.slice(0, 160) : 'error' }));
      return json({ ok: false, error: ERROR_AGENDA }, 503);
    }
  },
};
