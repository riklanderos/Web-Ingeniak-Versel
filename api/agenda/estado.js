/**
 * GET /api/agenda/estado/ · diagnóstico para el primer Preview (CAMBIO-COTIZAR §5.2 y §5.9-2). Nunca en producción (404).
 * Responde solo estados ('ok' | 'error' | 'sin-configurar'), sin IDs, llaves ni datos de personas:
 * { ok, entorno, simulacion, google, googleAuth, stripe, live, calendarios: { power, discovery }, kommo,
 *   kommoEstructura: 'completa' | 'incompleta' | 'sin-estructura' | 'error' | 'sin-configurar', kommoFaltan?: [nombres],
 *   kommoOpcional?: [nombres de «Clientes · Implementación» que faltan; no cambian kommoEstructura], supabase, cron }.
 *   kommoEstructura y kommoFaltan solo cuentan lo que el sitio usa (embudos de cotización y agenda + los 15 campos).
 *
 * POST { simular: 'pago', session_id } · SOLO en la simulación local: "Simular pago" de /dev/agenda-checkout/.
 * POST { simular: 'reiniciar' } · SOLO en la simulación local: vacía la memoria simulada (QA repetible).
 */
import { envName, json, readJson, sameOrigin } from '../../server/http.js';
import { isMock } from '../../server/agenda/booking.js';
import { googleAuthMode, googleToken } from '../../server/agenda/google-auth.js';
import { google } from '../../server/agenda/google.js';
import { stripe } from '../../server/agenda/stripe.js';
import { leads } from '../../server/agenda/leads.js';
import { mockPay, mockSnapshot, __resetMock } from '../../server/agenda/mock.js';
import { SESSION_ID_RE } from '../../shared/agenda.js';

/** @param {() => Promise<unknown>} fn */
const probe = async (fn) => {
  try {
    await fn();
    return 'ok';
  } catch {
    return 'error';
  }
};

export default {
  /** @param {Request} request */
  async fetch(request) {
    if (process.env.VERCEL_ENV === 'production') return json({ ok: false }, 404);
    const mock = isMock();

    if (request.method === 'POST') {
      if (!mock) return json({ ok: false }, 404);
      if (!sameOrigin(request)) return json({ ok: false }, 403);
      const read = await readJson(request, { limit: 2048 });
      const d = read.ok ? /** @type {any} */ (read.data) : null;
      if (d?.simular === 'reiniciar') {
        __resetMock();
        return json({ ok: true });
      }
      if (d?.simular !== 'pago' || typeof d.session_id !== 'string' || !SESSION_ID_RE.test(d.session_id)) return json({ ok: false }, 400);
      return json({ ok: mockPay(d.session_id) });
    }
    if (request.method !== 'GET') return json({ ok: false }, 405, { allow: 'GET' });

    if (mock) {
      return json({
        ok: true, entorno: envName(), simulacion: true, google: 'simulado', googleAuth: 'simulado', stripe: 'simulado', live: false,
        calendarios: { power: true, discovery: true }, kommo: 'simulado', supabase: 'apagado', cron: Boolean(process.env.CRON_SECRET),
        memoria: mockSnapshot(),
      });
    }

    const env = process.env;
    const googleState = await probe(() => googleToken());
    const cal = async (/** @type {string | undefined} */ id) => (id && googleState === 'ok' ? (await probe(() => google.getCalendar(id))) === 'ok' : false);
    const [power, discovery] = await Promise.all([cal(env.POWER_CALENDAR_ID), cal(env.DISCOVERY_CALENDAR_ID)]);
    const stripeState = env.STRIPE_SECRET_KEY ? await probe(() => stripe.ping()) : 'sin-configurar';
    let live = null;
    try { live = env.STRIPE_SECRET_KEY ? stripe.stripeLive() : null; } catch { live = null; }
    const st = await leads.status();
    const supabase = st.supabase ? (await leads.sb('/leads?select=id&limit=1')).ok ? 'ok' : 'error' : 'sin-configurar';
    // Estructura aprobada (embudos, etapas, campos y opciones): ¿ya corrió el script de configuración?
    const estructura = await leads.kommoEstructura();
    return json({
      ok: true,
      entorno: envName(),
      simulacion: false,
      google: googleState,
      googleAuth: googleAuthMode(),
      stripe: stripeState,
      live,
      calendarios: { power, discovery },
      kommo: st.kommo ? 'configurado' : 'sin-configurar',
      kommoEstructura: estructura.estado,
      ...(estructura.faltan.length ? { kommoFaltan: estructura.faltan } : {}),
      // Lo que falta de «Clientes · Implementación»: el sitio no lo usa, así que no cambia kommoEstructura.
      ...(estructura.opcionales?.length ? { kommoOpcional: estructura.opcionales } : {}),
      supabase,
      cron: Boolean(env.CRON_SECRET),
    });
  },
};
