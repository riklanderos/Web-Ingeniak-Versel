/**
 * Salud de la agenda (petición del cliente, 2026-11-11, tras la caída del permiso de Google de ese día).
 * El cron de /api/agenda/limpiar/ (cada 10 min) pide la disponibilidad de la Discovery como la pediría un visitante.
 * Si falla, avisa:
 *   - Tarea en Kommo «[Agenda caída] …» con el enlace para renovar el permiso (una sola mientras siga abierta).
 *   - Webhook `agenda.alerta` a NOTIFY_WEBHOOK_URL, si algún día se configura.
 * Falta de permiso o configuración (AgendaConfigError) avisa de inmediato; un error de Google de otro tipo se reintenta
 * una vez a los 3 s y solo avisa si vuelve a fallar (un 500 suelto de Google no despierta a nadie).
 * Sin tokens ni datos de personas en el aviso ni en los logs.
 */
import { AgendaConfigError } from './google-auth.js';
import { crearTareaAviso, notify } from '../kommo.js';
import { formatSlotEs } from '../../shared/agenda.js';

export const MARCADOR_CAIDA = '[Agenda caída]';
const REINTENTO_MS = 3000;

/**
 * Enlace para renovar el permiso: la URL interna del despliegue actual (VERCEL_URL), que Vercel protege con inicio de
 * sesión; /api/agenda/autorizar/ solo responde ahí en producción.
 * @param {NodeJS.ProcessEnv} env
 */
export function enlaceAutorizar(env = process.env) {
  const host = (env.VERCEL_URL ?? '').trim();
  return host ? `https://${host}/api/agenda/autorizar/` : null;
}

/**
 * Texto de la tarea de Kommo.
 * @param {string} motivo @param {Date} cuando @param {NodeJS.ProcessEnv} env
 */
export function textoCaida(motivo, cuando, env = process.env) {
  const enlace = enlaceAutorizar(env);
  return [
    `${MARCADOR_CAIDA} La agenda de ingeniak.mx no puede leer Google Calendar desde ${formatSlotEs(cuando.toISOString())} (hora del centro de México): nadie puede agendar la Discovery ni la Power Session.`,
    enlace
      ? `Arreglo: abre ${enlace} con tu sesión de Vercel y acepta los permisos en Google. Si la última pantalla dice «Autorización guardada», marca esta tarea como hecha.`
      : 'Arreglo: en Vercel abre el despliegue de Production, entra a /api/agenda/autorizar/ y acepta los permisos en Google. Luego marca esta tarea como hecha.',
    `Motivo técnico: ${motivo}.`,
  ].join('\n\n');
}

/**
 * @param {{ availability: (type: 'discovery' | 'power') => Promise<unknown> }} agenda
 * @param {{ env?: NodeJS.ProcessEnv, now?: () => Date, esperar?: (ms: number) => Promise<void> }} [opts]
 * @returns {Promise<{ estado: 'ok' } | { estado: 'caida', motivo: string, aviso: string }>}
 */
export async function revisarAgenda(agenda, opts = {}) {
  const env = opts.env ?? process.env;
  const now = opts.now ?? (() => new Date());
  const esperar = opts.esperar ?? ((ms) => new Promise((r) => setTimeout(r, ms)));
  /** @type {unknown} */
  let error = null;
  for (let intento = 0; intento < 2; intento++) {
    try {
      await agenda.availability('discovery');
      return { estado: 'ok' };
    } catch (e) {
      error = e;
      if (e instanceof AgendaConfigError) break;
      if (intento === 0) await esperar(REINTENTO_MS);
    }
  }
  const motivo = error instanceof Error ? error.message.slice(0, 160) : 'error';
  const cuando = now();
  const responsable = Number.parseInt(String(env.KOMMO_RESPONSIBLE_USER_ID ?? ''), 10);
  const [tarea] = await Promise.all([
    crearTareaAviso(MARCADOR_CAIDA, textoCaida(motivo, cuando, env), { responsableId: Number.isSafeInteger(responsable) ? responsable : undefined }),
    notify('agenda.alerta', { source: 'cron', alerta: 'agenda caída', mensaje: motivo, autorizar: enlaceAutorizar(env) }),
  ]);
  const aviso = tarea.creada ? 'tarea-creada' : tarea.existente ? 'tarea-abierta' : `sin-tarea:${tarea.reason ?? tarea.status ?? 'error'}`;
  console.error(JSON.stringify({ evento: 'agenda', accion: 'salud', ok: false, aviso, error: motivo }));
  return { estado: 'caida', motivo, aviso };
}
