/**
 * POST /api/cotizar/ — formulario «Cotizar proyecto» → Kommo (CAMBIO-COTIZAR §3.2 y §3.3).
 * Función de Vercel (Node 24, ESM, handler web). La lógica vive en `server/` (no se publica como función).
 *
 * Flujo: método → origen → Content-Type → tamaño → JSON → trampa/tiempo (200 silencioso)
 *        → envío repetido (misma respuesta) → límite por IP → validación (422)
 *        → Kommo (o simulación) → webhook de aviso → respuesta.
 */
import { json, readJson, sameOrigin, clientIp, throttle, envName } from '../server/http.js';
import {
  FALLBACK,
  buildKommo,
  cleanMeta,
  folio as folioDe,
  isBot,
  once,
  validSubmissionId,
  validate,
  webhookData,
} from '../server/cotizar.js';
import { createLeadWithNote, notify } from '../server/kommo.js';

const LIMIT_BYTES = 16384;
const RATE = { max: 6, windowMs: 10 * 60_000 };

const MSG = Object.freeze({
  400: 'No pudimos leer la solicitud.',
  403: 'Origen no permitido.',
  405: 'Método no permitido.',
  413: 'La solicitud es demasiado grande.',
  415: 'Envía la solicitud como JSON.',
  422: 'Revisa los campos marcados.',
  429: 'Recibimos varios envíos seguidos. Espera unos minutos o escríbenos por WhatsApp.',
  502: 'No pudimos registrar tu solicitud.',
  503: 'El formulario no está disponible en este momento.',
});

/** @param {Record<string, unknown>} o */
function log(o) {
  try {
    console.log(JSON.stringify(o));
  } catch {
    /* sin logs no pasa nada */
  }
}

/**
 * Registra y crea la respuesta.
 * @param {{ status: number, body: unknown, headers?: Record<string, string> }} r
 * @param {{ folio?: string, kommo?: number | string, leadId?: number | null, delivered?: string, t0: number }} info
 */
function reply(r, { folio, kommo, leadId, delivered, t0 }) {
  log({ evento: 'cotizar', folio, status: r.status, kommo, leadId, delivered, ms: Date.now() - t0 });
  return json(r.body, r.status, r.headers);
}

/**
 * Kommo + webhook para una cotización válida.
 * @param {import('../server/cotizar.js').Cotizacion} data
 * @param {import('../server/cotizar.js').Meta} meta
 * @returns {Promise<{ status: number, body: Record<string, unknown>, info: { kommo?: number | string, leadId?: number | null, delivered?: string } }>}
 */
async function entregar(data, meta) {
  const now = new Date();
  const folio = /** @type {string} */ (data.folio);
  const k = buildKommo(data, meta, process.env, now);
  const res = await createLeadWithNote({ ...k.lead, tags: k.tags, note: k.note, tracking: k.tracking, source: 'cotizar', folio });

  const delivered = await notify('lead.created', {
    source: 'cotizar',
    folio,
    kommo: res.ok
      ? { ok: true, status: res.status, leadId: res.leadId, dryRun: Boolean(res.dryRun) }
      : { ok: false, status: res.status, reason: res.reason },
    data: webhookData(data, meta, now),
  });

  if (res.ok && res.dryRun) {
    return {
      status: 200,
      body: { ok: true, folio, dryRun: true, preview: res.preview },
      info: { kommo: 'simulacion', leadId: null, delivered: delivered ? 'webhook' : 'simulacion' },
    };
  }
  if (res.ok) {
    return { status: 200, body: { ok: true, folio, delivered: 'kommo' }, info: { kommo: res.status, leadId: res.leadId, delivered: 'kommo' } };
  }
  const kommo = res.status || res.reason;
  if (delivered) {
    return { status: 200, body: { ok: true, folio, delivered: 'webhook' }, info: { kommo, leadId: null, delivered: 'webhook' } };
  }
  const status = res.reason === 'not-configured' ? 503 : 502;
  return {
    status,
    body: { ok: false, error: MSG[status], fallback: { ...FALLBACK } },
    info: { kommo, leadId: null, delivered: 'ninguno' },
  };
}

export default {
  /**
   * @param {Request} request
   * @returns {Promise<Response>}
   */
  async fetch(request) {
    const t0 = Date.now();
    try {
      // 1 · Método, origen, tipo, tamaño, JSON
      if (request.method !== 'POST') {
        return reply({ status: 405, body: { ok: false, error: MSG[405] }, headers: { allow: 'POST' } }, { t0 });
      }
      if (!sameOrigin(request)) return reply({ status: 403, body: { ok: false, error: MSG[403] } }, { t0 });
      const read = await readJson(request, { limit: LIMIT_BYTES });
      if (!read.ok) return reply({ status: read.status, body: { ok: false, error: MSG[read.status] } }, { t0 });
      const input = read.data;
      if (!input || typeof input !== 'object' || Array.isArray(input)) {
        return reply({ status: 400, body: { ok: false, error: MSG[400] } }, { t0 });
      }
      const body = /** @type {Record<string, unknown>} */ (input);
      const meta = cleanMeta(body.meta);
      const idCliente = validSubmissionId(body.submission_id) ? /** @type {string} */ (body.submission_id) : null;
      const submissionId = idCliente ?? crypto.randomUUID();
      const folio = folioDe(submissionId);

      // 2 · Trampa o llenado demasiado rápido: 200 silencioso, sin llamar a nadie
      if (isBot(meta)) {
        return reply({ status: 200, body: { ok: true, folio } }, { folio, delivered: 'descartado', t0 });
      }

      const procesar = async () => {
        // 3 · Límite por IP. En `astro dev` (sin VERCEL_ENV) las peticiones del navegador local no traen IP:
        //     no se limitan, para que el QA compartido en 127.0.0.1:4321 no choque con el 429.
        const ip = clientIp(request);
        const lim = envName() === 'local' && ip === 'desconocida' ? { ok: true, retryAfter: 0 } : throttle(`cotizar:${ip}`, RATE);
        if (!lim.ok) {
          return {
            status: 429,
            body: { ok: false, error: MSG[429], retryAfter: lim.retryAfter },
            headers: { 'retry-after': String(lim.retryAfter) },
            info: {},
          };
        }
        // 4 · Validación con las listas blancas del catálogo
        const v = validate(body);
        if (!v.ok) return { status: 422, body: { ok: false, error: MSG[422], errors: v.errors }, info: {} };
        // 5 y 6 · Normalización, Kommo y webhook
        return entregar({ ...v.data, submission_id: submissionId, folio }, meta);
      };

      // Envío repetido (mismo submission_id en 10 min) → la misma respuesta, sin segunda llamada a Kommo
      const r = /** @type {{ status: number, body: unknown, headers?: Record<string, string>, info?: Record<string, any> }} */ (
        idCliente ? await once(idCliente, procesar) : await procesar()
      );
      return reply(r, { folio, ...(r.info ?? { delivered: 'repetido' }), t0 });
    } catch {
      log({ evento: 'cotizar', status: 502, ms: Date.now() - t0 });
      return json({ ok: false, error: MSG[502], fallback: { ...FALLBACK } }, 502);
    }
  },
};
