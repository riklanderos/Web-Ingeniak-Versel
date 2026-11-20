/**
 * POST /api/kommo/etapa/?clave=… — puente Kommo → Google Analytics (2026-11-19).
 *
 * Kommo llama aquí (Configuración → Integraciones → Webhooks, evento «Etapa del lead cambiada») cada vez que un lead
 * cambia de etapa. Si el lead llegó a «Calificado» o se ganó (etapa del sistema 142, «Logrado con éxito»), se manda a
 * GA4 el evento recomendado `qualify_lead` o `close_convert_lead` a nombre del mismo visitante que pidió la cotización
 * o la cita (su ID de Analytics está en el campo de rastreo GCLIENTID del lead). Con eso GA4 une la venta y su monto
 * al canal por el que llegó la persona (ChatGPT, Google, Meta…).
 *
 * - Seguridad: `?clave=` debe ser igual a KOMMO_WEBHOOK_SECRET (la genera Rik; nunca va en el código ni en el chat).
 * - Una sola vez por lead y evento: al enviar se le pone al lead la etiqueta `ga-calificado` o `ga-venta`; si ya la
 *   tiene, no se repite (Kommo reintenta los webhooks y un lead puede ir y volver de etapa).
 * - Un lead ganado que nunca pasó por «Calificado» manda también `qualify_lead`, para que el embudo cuadre.
 * - Sin ID de Analytics (llegó por WhatsApp o por otro lado) no se manda nada: esos se miden en Kommo.
 * - Siempre responde rápido: 200 con lo que hizo, 403 con clave mala, 503 sin configurar.
 * Logs: { evento, leadId, resultado, ms }; nunca nombres, teléfonos, correos, la clave ni el client_id.
 */
import { timingSafeEqual } from 'node:crypto';
import { json } from '../../server/http.js';
import { kommoConfigured, leadParaAnalytics, normalizar, updateLeadTags } from '../../server/kommo.js';
import { enviarEventosGA4 } from '../../server/analytics.js';

const LIMIT_BYTES = 65536;
const MAX_LEADS = 20;
/** Etapa del sistema de Kommo «Logrado con éxito» (igual en todos los embudos). */
export const ETAPA_GANADO = 142;
/** Nombre de la etapa de calificación del esquema aprobado (shared/kommo-esquema.js, embudo «Ventas»). */
export const ETAPA_CALIFICADO = 'Calificado';
/**
 * ¿La etapa cuenta como «Calificado»? Vale el nombre exacto o con un detalle después de un separador, como
 * «Calificado · Agenda propuesta» (así se llama en el embudo CALIFICACIÓN de Ingeniak). «No calificado» no cuenta.
 * @param {string | null | undefined} etapa
 */
export function esEtapaCalificado(etapa) {
  const n = normalizar(etapa);
  const base = normalizar(ETAPA_CALIFICADO);
  return n === base || new RegExp(`^${base}\\s*[·\\-:|(/]`).test(n);
}
export const ETIQUETA = Object.freeze({ qualify_lead: 'ga-calificado', close_convert_lead: 'ga-venta' });

/** Leads en proceso en esta instancia: evita mandar dos veces si Kommo repite el aviso mientras se procesa. */
const enCurso = new Set();

/** @param {Record<string, unknown>} o */
function log(o) {
  try {
    console.log(JSON.stringify(o));
  } catch {
    /* sin logs no pasa nada */
  }
}

/** @param {string} a @param {string} b */
function mismaClave(a, b) {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

/**
 * Ids de lead del cuerpo del webhook (x-www-form-urlencoded): leads[status][0][id]=…, leads[add][0][id]=…
 * @param {string} texto
 * @returns {number[]}
 */
export function idsDelWebhook(texto) {
  const ids = new Set();
  for (const [k, v] of new URLSearchParams(texto)) {
    if (/^leads\[(status|add|update)\]\[\d+\]\[id\]$/.test(k) && /^\d{1,15}$/.test(v)) ids.add(Number(v));
  }
  return [...ids].slice(0, MAX_LEADS);
}

/**
 * Qué eventos tocan para un lead según su etapa actual y lo que ya se mandó (etiquetas).
 * @param {{ statusId: number | null, etapa: string | null, tags: string[] }} lead
 * @returns {Array<'qualify_lead' | 'close_convert_lead'>}
 */
export function eventosPara(lead) {
  const ya = new Set(lead.tags.map((t) => normalizar(t)));
  const ganado = lead.statusId === ETAPA_GANADO;
  const calificado = ganado || esEtapaCalificado(lead.etapa);
  /** @type {Array<'qualify_lead' | 'close_convert_lead'>} */
  const out = [];
  if (calificado && !ya.has(ETIQUETA.qualify_lead)) out.push('qualify_lead');
  if (ganado && !ya.has(ETIQUETA.close_convert_lead)) out.push('close_convert_lead');
  return out;
}

/** @param {unknown} v @param {number} max */
const corto = (v, max = 100) => String(v ?? '').replace(/\s+/g, ' ').trim().slice(0, max);

/**
 * @param {number} leadId
 * @returns {Promise<string>} resultado para el log y la respuesta
 */
async function procesar(leadId) {
  const r = await leadParaAnalytics(leadId);
  if (!r.ok) return `kommo-${r.status ?? r.reason}`;
  const lead = r.lead;
  const eventos = eventosPara(lead);
  if (!eventos.length) return 'sin-cambio';
  if (!lead.gaClientId) return 'sin-id-analytics';
  /** @type {Record<string, string | number>} */
  const base = {};
  if (lead.fuente) base.lead_source = corto(lead.fuente);
  if (lead.embudo) base.kommo_embudo = corto(lead.embudo);
  const conMonto = lead.precio !== null && lead.precio > 0 && lead.moneda;
  const ga = await enviarEventosGA4({
    clientId: lead.gaClientId,
    eventos: eventos.map((name) => ({
      name,
      params: { ...base, ...(name === 'close_convert_lead' && conMonto ? { value: lead.precio, currency: lead.moneda } : {}) },
    })),
  });
  if (!ga.ok) return `ga4-${ga.status}`;
  if (ga.dryRun) return `simulacion:${eventos.join('+')}`;
  const t = await updateLeadTags(leadId, { add: eventos.map((e) => ETIQUETA[e]), source: 'ga4' });
  return `enviado:${eventos.join('+')}${t.ok ? '' : ':sin-etiqueta'}`;
}

export default {
  /**
   * @param {Request} request
   * @returns {Promise<Response>}
   */
  async fetch(request) {
    const t0 = Date.now();
    try {
      if (request.method !== 'POST') return json({ ok: false }, 405, { allow: 'POST' });
      const esperada = (process.env.KOMMO_WEBHOOK_SECRET ?? '').trim();
      if (!esperada || !kommoConfigured()) {
        log({ evento: 'kommo.etapa', resultado: 'sin-configurar', ms: Date.now() - t0 });
        return json({ ok: false }, 503);
      }
      const clave = new URL(request.url).searchParams.get('clave') ?? '';
      if (!mismaClave(clave, esperada)) {
        log({ evento: 'kommo.etapa', resultado: 'clave-incorrecta', ms: Date.now() - t0 });
        return json({ ok: false }, 403);
      }
      const largo = Number(request.headers.get('content-length') ?? 0);
      if (largo > LIMIT_BYTES) return json({ ok: false }, 413);
      const texto = (await request.text()).slice(0, LIMIT_BYTES);
      const ids = idsDelWebhook(texto);
      /** @type {Record<string, string>} */
      const resultados = {};
      await Promise.all(
        ids.map(async (id) => {
          if (enCurso.has(id)) {
            resultados[id] = 'en-curso';
            return;
          }
          enCurso.add(id);
          try {
            resultados[id] = await procesar(id);
          } finally {
            enCurso.delete(id);
          }
          log({ evento: 'kommo.etapa', leadId: id, resultado: resultados[id], ms: Date.now() - t0 });
        }),
      );
      return json({ ok: true, leads: resultados });
    } catch {
      log({ evento: 'kommo.etapa', resultado: 'error', ms: Date.now() - t0 });
      return json({ ok: false }, 500);
    }
  },
};

/** Solo pruebas. */
export function __resetEtapa() {
  enCurso.clear();
}
