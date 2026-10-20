/**
 * POST /api/agenda/reservar/ → Discovery: cita confirmada (Meet + invitación de Google). Power: URL de Stripe Checkout.
 * Contrato de flujo-agenda.md §2.2 + `atribucion.src|clid|landing|desde` (CAMBIO-COTIZAR §5.2–§5.3).
 * Mismo origen (403), límite de 10 reservas por IP cada 10 min (429), antispam: `website_url` lleno o
 * `elapsed_ms < 2500` → 400 sin llamar a nadie. Validación = `validateForm` del navegador (422).
 */
import { clean, clientIp, json, readJson, sameOrigin, throttle } from '../../server/http.js';
import { agenda, baseUrl, SlotTakenError } from '../../server/agenda/booking.js';
import { bookingAttribution } from '../../server/agenda/leads.js';
import { toForm, validateForm } from '../../shared/agenda.js';

const ERROR_RESERVA = 'No pudimos completar la reserva. Inténtalo de nuevo o escríbenos por WhatsApp y te agendamos nosotros.';

export default {
  /** @param {Request} request */
  async fetch(request) {
    if (request.method !== 'POST') return json({ ok: false, error: 'Método no permitido.' }, 405, { allow: 'POST' });
    if (!sameOrigin(request)) return json({ ok: false, error: 'Origen no permitido.' }, 403);
    const lim = throttle(`agenda:${clientIp(request)}`, { max: 10, windowMs: 10 * 60_000 });
    if (!lim.ok) {
      return json(
        { ok: false, error: 'Hiciste varias reservas seguidas. Inténtalo en unos minutos o escríbenos por WhatsApp.', retryAfter: lim.retryAfter },
        429,
        { 'retry-after': String(lim.retryAfter) },
      );
    }
    const read = await readJson(request);
    if (!read.ok) return json({ ok: false, error: 'Solicitud inválida.' }, /** @type {{ status: number }} */ (/** @type {unknown} */ (read)).status);
    const body = read.data && typeof read.data === 'object' && !Array.isArray(read.data) ? /** @type {Record<string, any>} */ (read.data) : null;
    if (!body) return json({ ok: false, error: 'Solicitud inválida.' }, 400);

    // Bots: campo trampa lleno o envío instantáneo.
    if (clean(body.website_url, 200) || (typeof body.elapsed_ms === 'number' && body.elapsed_ms < 2500)) {
      return json({ ok: false, error: 'No pudimos procesar la solicitud.' }, 400);
    }
    const type = body.tipo;
    if (type !== 'power' && type !== 'discovery') return json({ ok: false, error: 'Tipo inválido.' }, 400);

    const raw = toForm(body.form);
    const form = {
      fullName: clean(raw.fullName, 120),
      email: clean(raw.email, 200).toLowerCase(),
      whatsapp: clean(raw.whatsapp, 30),
      businessName: clean(raw.businessName, 150),
      website: clean(raw.website, 200),
      industry: clean(raw.industry, 60),
      teamSize: clean(raw.teamSize, 30),
      revenue: clean(raw.revenue, 60),
      timeDrains: raw.timeDrains.map((d) => clean(d, 60)).slice(0, 5),
      tools: clean(raw.tools, 300, { lines: true }),
      goal: clean(raw.goal, 1000, { lines: true }),
    };
    const errors = validateForm(type, form);
    if (Object.keys(errors).length) return json({ ok: false, error: 'Revisa los campos marcados.', errors }, 422);

    const start = clean(body.start, 40);
    if (!start || Number.isNaN(Date.parse(start))) return json({ ok: false, error: 'Elige un horario.' }, 422);

    try {
      const result = await agenda().reserve({
        type,
        form,
        startIso: new Date(start).toISOString(),
        origin: clean(body.origen, 160) || null,
        baseUrl: baseUrl(request),
        attribution: bookingAttribution(body.atribucion),
      });
      return json({ ok: true, ...result });
    } catch (e) {
      if (e instanceof SlotTakenError) return json({ ok: false, error: e.message, slotTaken: true }, 409);
      console.error(JSON.stringify({ evento: 'agenda', accion: 'reservar', tipo: type, ok: false, error: e instanceof Error ? e.message.slice(0, 160) : 'error' }));
      return json({ ok: false, error: ERROR_RESERVA }, 503);
    }
  },
};
