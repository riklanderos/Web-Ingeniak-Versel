/**
 * Token de acceso de Google Calendar para la agenda (CAMBIO-COTIZAR §5.2).
 *
 * 1. Plan B (solo si existen las tres variables): OAuth propio con refresh token →
 *    POST https://oauth2.googleapis.com/token (GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN).
 * 2. Por defecto (opción A, recursos compartidos con riklanderos.tech): Vercel Connect →
 *    getToken(AGENDA_GOOGLE_CONNECTOR ?? 'google/riklanderos-web', sujeto { type: 'user', id: AGENDA_GOOGLE_SUBJECT ?? 'rik' }).
 *    El conector tiene que estar vinculado al proyecto de Vercel de ingeniak.mx.
 *
 * `@vercel/connect` se importa de forma dinámica: las pruebas y el modo simulado nunca cargan OIDC.
 * Ningún token ni secreto sale en logs ni en respuestas.
 */

export const GOOGLE_SCOPES = ['https://www.googleapis.com/auth/calendar'];
export const DEFAULT_CONNECTOR = 'google/riklanderos-web';
export const DEFAULT_SUBJECT = 'rik';

/** Falta configuración (variables, conector sin vincular o sin autorizar): la API responde 503. */
export class AgendaConfigError extends Error {
  /** @param {string} message */
  constructor(message) {
    super(message);
    this.name = 'AgendaConfigError';
  }
}

/** @type {{ key: string, token: string, exp: number } | null} */
let cached = null;

/** ¿Hay OAuth propio (plan B)? */
export function hasOwnOAuth(env = process.env) {
  return Boolean(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET && env.GOOGLE_REFRESH_TOKEN);
}

/** 'oauth' | 'connect' — para el diagnóstico de /api/agenda/estado/ (sin valores). */
export function googleAuthMode(env = process.env) {
  return hasOwnOAuth(env) ? 'oauth' : 'connect';
}

/**
 * @param {NodeJS.ProcessEnv} [env]
 * @returns {Promise<string>}
 */
export async function googleToken(env = process.env) {
  if (hasOwnOAuth(env)) return refreshToken(env);
  /** @type {any} */
  let mod;
  try {
    mod = await import('@vercel/connect');
  } catch {
    throw new AgendaConfigError('No se pudo cargar @vercel/connect');
  }
  try {
    return await mod.getToken(env.AGENDA_GOOGLE_CONNECTOR || DEFAULT_CONNECTOR, {
      subject: { type: 'user', id: env.AGENDA_GOOGLE_SUBJECT || DEFAULT_SUBJECT },
      scopes: GOOGLE_SCOPES,
    });
  } catch (e) {
    throw new AgendaConfigError(`Conector de Google sin vincular o sin autorizar (${e instanceof Error ? e.name : 'error'})`);
  }
}

/** @param {NodeJS.ProcessEnv} env */
async function refreshToken(env) {
  const key = `${env.GOOGLE_CLIENT_ID}`;
  if (cached && cached.key === key && cached.exp > Date.now() + 60_000) return cached.token;
  let res;
  try {
    res = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: String(env.GOOGLE_CLIENT_ID),
        client_secret: String(env.GOOGLE_CLIENT_SECRET),
        refresh_token: String(env.GOOGLE_REFRESH_TOKEN),
        grant_type: 'refresh_token',
      }),
      signal: AbortSignal.timeout(8000),
    });
  } catch (e) {
    throw new AgendaConfigError(`OAuth de Google sin respuesta (${e instanceof Error ? e.name : 'error'})`);
  }
  /** @type {any} */
  const j = await res.json().catch(() => ({}));
  if (!res.ok || typeof j.access_token !== 'string') {
    throw new AgendaConfigError(`OAuth de Google respondió ${res.status}${j.error ? ` (${String(j.error).slice(0, 40)})` : ''}`);
  }
  cached = { key, token: j.access_token, exp: Date.now() + (Number(j.expires_in) || 3600) * 1000 };
  return cached.token;
}

/** Solo pruebas: olvida el token en memoria. */
export function __resetGoogleToken() {
  cached = null;
}
