/**
 * API de conversiones de Meta: manda desde el servidor el evento `Schedule` de una Discovery agendada.
 * Complementa al píxel del navegador (src/components/layout/MetaPixel.astro): los dos mandan el mismo `event_id`
 * y Meta cuenta la reserva una sola vez. Recupera las reservas que el navegador no reporta (iPhone, bloqueadores).
 *
 * - Solo en producción (`VERCEL_ENV=production`) y solo con META_PIXEL_ID y META_CAPI_TOKEN capturadas en Vercel.
 *   Sin ellas no hace nada. Nunca lanza: un fallo de Meta no afecta a la reserva.
 * - Datos que viajan: cookies `_fbp`/`_fbc` del píxel, IP y navegador del visitante (lo mismo que ya ve el píxel).
 *   Correo y teléfono NO se mandan, igual que en el píxel; con META_CAPI_DATOS=1 se mandan con hash SHA-256
 *   (mejora la coincidencia; requiere mencionarlo en el aviso de privacidad).
 * - META_CAPI_TEST_CODE: código de «Probar eventos» del Administrador de eventos (solo durante la prueba).
 */
import { createHash, randomUUID } from 'node:crypto';
import { clientIp } from './http.js';

const GRAPH_VERSION = 'v24.0';
const TIMEOUT_MS = 2500;

/** Identificador que comparten el evento del servidor y el del navegador. */
export function newEventId() {
  return randomUUID();
}

/** @param {string} v */
const sha256 = (v) => createHash('sha256').update(v).digest('hex');

/** @param {string} header @param {string} name */
function cookie(header, name) {
  const m = header.match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`));
  return m ? decodeURIComponent(m[1]).slice(0, 200) : undefined;
}

/** Configuración activa o null. */
function config() {
  if (process.env.VERCEL_ENV !== 'production') return null;
  const pixelId = (process.env.META_PIXEL_ID ?? '').trim();
  const token = (process.env.META_CAPI_TOKEN ?? '').trim();
  if (!/^\d{10,20}$/.test(pixelId) || !token) return null;
  return { pixelId, token };
}

/**
 * Manda `Schedule` (Discovery Session) a Meta. Devuelve true si Meta lo aceptó.
 * @param {{ request: Request, eventId: string, sourceUrl: string, email?: string, phone?: string }} input
 * @returns {Promise<boolean>}
 */
export async function sendSchedule({ request, eventId, sourceUrl, email, phone }) {
  const cfg = config();
  if (!cfg) return false;
  try {
    const cookies = request.headers.get('cookie') ?? '';
    const ip = clientIp(request);
    /** @type {Record<string, unknown>} */
    const userData = {
      client_ip_address: ip === 'desconocida' ? undefined : ip,
      client_user_agent: request.headers.get('user-agent') ?? undefined,
      fbp: cookie(cookies, '_fbp'),
      fbc: cookie(cookies, '_fbc'),
    };
    if (process.env.META_CAPI_DATOS === '1') {
      const em = (email ?? '').trim().toLowerCase();
      const ph = (phone ?? '').replace(/\D/g, '');
      if (em) userData.em = [sha256(em)];
      if (ph.length >= 10) userData.ph = [sha256(ph)];
    }
    /** @type {Record<string, unknown>} */
    const body = {
      data: [{
        event_name: 'Schedule',
        event_time: Math.floor(Date.now() / 1000),
        event_id: eventId,
        action_source: 'website',
        event_source_url: sourceUrl,
        user_data: userData,
        custom_data: { content_name: 'Discovery Session' },
      }],
    };
    const test = (process.env.META_CAPI_TEST_CODE ?? '').trim();
    if (test) body.test_event_code = test;

    const r = await fetch(`https://graph.facebook.com/${GRAPH_VERSION}/${cfg.pixelId}/events?access_token=${encodeURIComponent(cfg.token)}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!r.ok) console.error(JSON.stringify({ evento: 'meta-capi', accion: 'schedule', ok: false, status: r.status }));
    return r.ok;
  } catch (e) {
    console.error(JSON.stringify({ evento: 'meta-capi', accion: 'schedule', ok: false, error: e instanceof Error ? e.name : 'error' }));
    return false;
  }
}
