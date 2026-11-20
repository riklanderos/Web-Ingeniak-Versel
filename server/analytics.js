/**
 * Google Analytics 4 · Measurement Protocol (2026-11-19). Manda a GA4 los eventos que pasan fuera del sitio, como un
 * lead que se califica o se gana en Kommo (api/kommo/etapa.js), a nombre del mismo visitante (`client_id` de la cookie
 * `_ga`, guardado en el campo de rastreo GCLIENTID del lead).
 *
 *   ga4Configurado()                                → boolean (hay GA4_API_SECRET)
 *   enviarEventosGA4({ clientId, eventos })         → { ok, status, dryRun?, preview? }
 *
 * Variables: GA4_API_SECRET (obligatoria; «Clave secreta de la API de Measurement Protocol» del flujo Ingeniak Web,
 * marcada Sensitive en Vercel) y GA4_MEASUREMENT_ID (opcional; por defecto el del sitio).
 * Reglas: nunca lanza; 5 s por llamada; sin la clave y fuera de producción responde en simulación; los logs no llevan
 * la clave ni el client_id.
 */
import { envName } from './http.js';

/** Flujo «Ingeniak Web» (el mismo que carga BaseLayout.astro). */
export const GA4_MEASUREMENT_ID = 'G-XF9G08CZJQ';
const URL_MP = 'https://www.google-analytics.com/mp/collect';
const TIMEOUT_MS = 5000;

const secreto = () => (process.env.GA4_API_SECRET ?? '').trim();
const medicion = () => {
  const v = (process.env.GA4_MEASUREMENT_ID ?? '').trim();
  return /^G-[A-Z0-9]{4,20}$/.test(v) ? v : GA4_MEASUREMENT_ID;
};

export function ga4Configurado() {
  return Boolean(secreto());
}

/**
 * @typedef {{ name: string, params?: Record<string, string | number> }} EventoGA4
 * @param {{ clientId: string, eventos: EventoGA4[] }} i
 * @returns {Promise<{ ok: boolean, status: number, dryRun?: true, preview?: object }>}
 */
export async function enviarEventosGA4({ clientId, eventos }) {
  const body = { client_id: clientId, events: eventos.map((e) => ({ name: e.name, params: { ...(e.params ?? {}) } })) };
  if (!ga4Configurado()) {
    if (envName() === 'production') return { ok: false, status: 0 };
    return { ok: true, status: 0, dryRun: true, preview: { measurement_id: medicion(), events: body.events } };
  }
  try {
    const u = `${URL_MP}?measurement_id=${encodeURIComponent(medicion())}&api_secret=${encodeURIComponent(secreto())}`;
    const res = await fetch(u, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    await res.body?.cancel().catch(() => {});
    // GA4 responde 204 aunque el evento no sea válido (así es el protocolo); un 4xx/5xx sí es un fallo.
    return { ok: res.status >= 200 && res.status < 300, status: res.status };
  } catch {
    return { ok: false, status: 0 };
  }
}
