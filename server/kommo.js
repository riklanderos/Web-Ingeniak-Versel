/**
 * Cliente de Kommo (API v4) y webhook de aviso. Lo usan la cotización (`api/cotizar.js`) y la agenda
 * (`server/agenda/leads.js`). CAMBIO-COTIZAR §3.4, §3.5, §3.7; ficha `kommo-vercel-tecnico.md` §1.
 *
 * Contrato (no cambiar sin actualizar la especificación):
 *   kommoConfigured()                                   → boolean
 *   createLeadWithNote({ name, contact: { name, phoneE164, email }, company, tags, note, tracking,
 *                        embudo, etapa, campos,                       ← estructura aprobada, por nombre
 *                        pipelineId, statusId, responsibleUserId,     ← variables (mandan sobre los nombres)
 *                        statusIdRespaldo,                            ← etapa por variable SOLO si la del nombre no existe
 *                        fallbackPipelineId, fallbackStatusId })      ← solo si el embudo no existe
 *        → { ok: true, leadId, contactId, destino, campos: { enviados, omitidos }, dryRun?: true, preview? }
 *        | { ok: false, status, reason: 'not-configured'|'auth'|'payment'|'forbidden'|'rate'|'validation'|'server'|'network' }
 *   updateLead(leadId, { embudo, etapa, pipelineId, campos, tags: { add, remove } })  → { ok, enviado, movido }
 *        | { ok: false, status, reason, final? }   ← final: el lead ya no existe (404) o Kommo lo sigue rechazando
 *   updateLeadTags(leadId, { add = [], remove = [] })   → { ok }
 *   addLeadNote(leadId, text)                           → { ok }
 *   revisarEstructura()                                 → { estado: 'completa'|'incompleta'|'sin-estructura'|'error'|'sin-configurar',
 *                                                           faltan, opcionales }   ← solo lo que el sitio usa cuenta para `estado`
 *   notify(event, payload)                              → Promise<boolean>
 *
 * Estructura (decisión del cliente, 2026-10-20): embudos, etapas y campos se buscan POR NOMBRE con los nombres de
 * `shared/kommo-esquema.js` (GET /leads/pipelines y GET /leads/custom_fields, paginado) y se guardan 10 min en
 * memoria. Si el script de configuración aún no se corrió, o la consulta falla, el lead entra como antes (embudo
 * principal + nota completa): un campo que falta se omite, nunca se manda un id que Kommo no tenga (rechazaría todo).
 *
 * Reglas: nunca lanza; `AbortSignal.timeout(8000)` por llamada (y un presupuesto total por lead);
 * sin variables y fuera de producción responde en simulación sin llamar a nadie; los logs solo llevan
 * { evento, folio, status, leadId, delivered, ms }: nunca correo, teléfono, nombre ni token.
 */
import { envName } from './http.js';
import { CAMPOS, EMBUDOS } from '../shared/kommo-esquema.js';
import { SITE_URL } from '../shared/agenda.js';

const CALL_TIMEOUT_MS = 8000;
const NOTIFY_TIMEOUT_MS = 5000;
/** Presupuesto total de Kommo por lead: deja margen al webhook dentro de los 15 s de la función. */
const LEAD_BUDGET_MS = 9000;
/** Una alerta del mismo tipo cada 5 min por instancia (evita una ráfaga si el token vence). */
const ALERT_EVERY_MS = 5 * 60_000;

/** La estructura encontrada se recuerda 10 min por instancia. */
export const ESTRUCTURA_TTL_MS = 10 * 60_000;
/** Si la consulta falló (red, 5xx), se vuelve a intentar al minuto. */
const ESTRUCTURA_TTL_FALLA_MS = 60_000;
/** Tope de la consulta de estructura… */
const ESTRUCTURA_MAX_MS = 3000;
/** …que siempre deja este tiempo para crear el lead y su nota. */
const RESERVA_LEAD_MS = 4000;
const CAMPOS_POR_PAGINA = 250;
const CAMPOS_PAGINAS_MAX = 10;
/** Errores que no se arreglan reintentando con menos datos: se corta y se avisa. */
const FATALES = Object.freeze(['auth', 'payment', 'forbidden', 'rate']);
/**
 * Embudos que el sitio llena: «Ventas» (cotización y Discovery) y «Power Session» (reservas de Power).
 * @type {ReadonlyArray<keyof typeof EMBUDOS>}
 */
const EMBUDOS_DEL_SITIO = Object.freeze(['ventas', 'power']);

/** Campos `tracking_data` que se mandan si existen en la cuenta. */
export const TRACKING_CODES = Object.freeze([
  'UTM_SOURCE', 'UTM_MEDIUM', 'UTM_CAMPAIGN', 'UTM_TERM', 'UTM_CONTENT', 'REFERRER', 'GCLID', 'FBCLID',
]);

/** Alertas al webhook por error de Kommo (§3.4). */
const ALERTAS = Object.freeze({
  auth: { alerta: 'renovar token', mensaje: 'Kommo rechazó el token (401). Genera un token de larga duración nuevo, reemplaza KOMMO_TOKEN en Vercel y haz Redeploy.' },
  payment: { alerta: 'cuenta sin pago', mensaje: 'La cuenta de Kommo no está pagada o terminó la prueba (402).' },
  forbidden: { alerta: 'permisos o IP bloqueada', mensaje: 'Kommo negó el permiso o bloqueó la IP (403). Revisa los permisos de la integración privada.' },
  rate: { alerta: 'límite de peticiones', mensaje: 'Kommo limitó las peticiones (429). Revisa si otra integración está haciendo demasiadas llamadas.' },
});

/**
 * @typedef {'not-configured'|'auth'|'payment'|'forbidden'|'rate'|'validation'|'server'|'network'} Reason
 * @typedef {{ status: number, data: any, reason?: Reason }} CallResult
 * @typedef {{ source?: string, folio?: string }} Ctx
 * @typedef {{ id: number, name: string, type: number }} Etapa
 * @typedef {{ id: number, name: string, isMain: boolean, etapas: Etapa[] }} Embudo
 * @typedef {{ id: number, type: string, enums: Map<string, number> }} Campo
 * @typedef {{ embudos: Embudo[], campos: Map<string, Campo[]>, rastreo: Map<string, number> }} Estructura
 * @typedef {'variable' | 'nombre' | 'respaldo' | 'principal'} OrigenDestino
 * @typedef {{ pipelineId?: number, statusId?: number, origen: OrigenDestino, etapaPorNombre?: boolean }} Destino
 * @typedef {keyof typeof EMBUDOS} ClaveEmbudo
 * @typedef {Partial<Record<keyof typeof CAMPOS, string | string[] | number | null | undefined>>} ValoresCampos
 */

/* ── Configuración ─────────────────────────────────────────────────────────────────────────── */

/**
 * URL base de la API: `KOMMO_BASE_URL` (solo pruebas; con o sin `/api/v4`) o `https://{KOMMO_SUBDOMAIN}.kommo.com/api/v4`.
 * Tolera que el subdominio se capture como `ingeniak.kommo.com` o con `https://`.
 * @returns {string | null}
 */
export function kommoBase() {
  const raw = (process.env.KOMMO_BASE_URL ?? '').trim();
  if (raw) {
    const b = raw.replace(/\/+$/, '');
    return /\/api\/v4$/.test(b) ? b : `${b}/api/v4`;
  }
  const sub = (process.env.KOMMO_SUBDOMAIN ?? '')
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/\.kommo\.com.*$/, '')
    .replace(/[/?#].*$/, '');
  return /^[a-z0-9][a-z0-9-]{0,62}$/.test(sub) ? `https://${sub}.kommo.com/api/v4` : null;
}

/** Token sin espacios ni un "Bearer " pegado por error. */
function token() {
  return (process.env.KOMMO_TOKEN ?? '').trim().replace(/^bearer\s+/i, '');
}

/** ¿Hay subdominio (o URL base de pruebas) y token? */
export function kommoConfigured() {
  return Boolean(kommoBase() && token());
}

/** Simulación: sin configuración y fuera de producción. */
function dryRun() {
  return !kommoConfigured() && envName() !== 'production';
}

/* ── Utilidades ────────────────────────────────────────────────────────────────────────────── */

/** @param {Record<string, unknown>} o */
function log(o) {
  try {
    console.log(JSON.stringify(o));
  } catch {
    /* sin logs no pasa nada */
  }
}

/**
 * @param {number} status
 * @returns {Reason}
 */
export function reasonFor(status) {
  if (status === 401) return 'auth';
  if (status === 402) return 'payment';
  if (status === 403) return 'forbidden';
  if (status === 429) return 'rate';
  if (status === 400 || status === 422) return 'validation';
  if (status === 0) return 'network';
  return 'server';
}

/** @param {unknown} v @returns {number | undefined} */
const posInt = (v) => (Number.isSafeInteger(v) && /** @type {number} */ (v) > 0 ? /** @type {number} */ (v) : undefined);

/**
 * Una llamada a Kommo. Nunca lanza: error de red o tiempo agotado → { status: 0, reason: 'network' }.
 * @param {string} path  p. ej. '/leads/complex'
 * @param {{ method?: string, body?: unknown, deadline?: number }} [opts]
 * @returns {Promise<CallResult>}
 */
async function call(path, { method = 'GET', body, deadline } = {}) {
  const base = kommoBase();
  if (!base) return { status: 0, data: null, reason: 'not-configured' };
  const remaining = deadline ? deadline - Date.now() : CALL_TIMEOUT_MS;
  if (remaining < 250) return { status: 0, data: null, reason: 'network' };
  try {
    /** @type {Record<string, string>} */
    const headers = { authorization: `Bearer ${token()}`, accept: 'application/json' };
    if (body !== undefined) headers['content-type'] = 'application/json';
    const res = await fetch(`${base}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: AbortSignal.timeout(Math.min(CALL_TIMEOUT_MS, remaining)),
    });
    if (res.status === 204) return { status: 204, data: null };
    const text = await res.text().catch(() => '');
    let data = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = null;
    }
    return res.ok ? { status: res.status, data } : { status: res.status, data, reason: reasonFor(res.status) };
  } catch {
    return { status: 0, data: null, reason: 'network' };
  }
}

/** @param {unknown} v */
const digits = (v) => String(v ?? '').replace(/\D/g, '');

/**
 * Primer contacto cuyo EMAIL o PHONE coincide exactamente.
 * @param {any} data  respuesta de GET /contacts
 * @param {'EMAIL' | 'PHONE'} code
 * @param {string} value  correo en minúsculas o teléfono E.164
 * @returns {number | null}
 */
function matchContact(data, code, value) {
  const contacts = Array.isArray(data?._embedded?.contacts) ? data._embedded.contacts : [];
  const want = code === 'EMAIL' ? value.trim().toLowerCase() : digits(value);
  for (const c of contacts) {
    const fields = Array.isArray(c?.custom_fields_values) ? c.custom_fields_values : [];
    for (const f of fields) {
      if (f?.field_code !== code || !Array.isArray(f.values)) continue;
      const hit = f.values.some((v) => {
        if (code === 'EMAIL') return String(v?.value ?? '').trim().toLowerCase() === want;
        const d = digits(v?.value);
        return d === want || (d.length >= 10 && want.endsWith(d));
      });
      if (hit && Number.isSafeInteger(c.id)) return c.id;
    }
  }
  return null;
}

/* ── Convenciones del sitio para la estructura aprobada ───────────────────────────────────── */

/**
 * Nombre comparable: NFC, espacios simples, guiones unificados y minúsculas.
 * Así «1–10» y «1-10», o «Salud » y «salud», se reconocen como la misma opción.
 * @param {unknown} s
 */
export function normalizar(s) {
  return String(s ?? '')
    .normalize('NFC')
    .replace(/[‐-―−]/g, '-')
    .replace(/\s+/g, ' ')
    .trim()
    .toLocaleLowerCase('es');
}

/**
 * Opción exacta de `kommo-esquema.js` para un valor del sitio (con alias, p. ej. «Otro» → «Otra»), o null.
 * @param {string} clave  clave de CAMPOS (p. ej. 'industria')
 * @param {unknown} valor  etiqueta tal como la muestra el formulario
 * @returns {string | null}
 */
export function opcionKommo(clave, valor) {
  const def = /** @type {{ opciones?: string[], alias?: Record<string, string> } | undefined} */ (/** @type {any} */ (CAMPOS)[clave]);
  if (!def?.opciones || typeof valor !== 'string' || !valor.trim()) return null;
  const v = def.alias?.[valor.trim()] ?? valor;
  const n = normalizar(v);
  return def.opciones.find((o) => normalizar(o) === n) ?? null;
}

/** `utm_medium` que cuentan como campaña pagada (cpc, ppc, paid_social, ads, display…). */
const MEDIO_PAGADO = /cpc|ppc|cpm|cpv|paid|display|retargeting|remarketing|(^|[^a-z])(ads?|sem|cpa)([^a-z]|$)/i;

/**
 * ¿La visita viene de una campaña pagada? Sí si trae gclid, fbclid, gbraid o wbraid, o un utm_medium de pago.
 * @param {{ utmMedium?: string | null, gclid?: string | null, fbclid?: string | null, gbraid?: string | null, wbraid?: string | null }} [a]
 */
export function esCampana(a = {}) {
  if ([a.gclid, a.fbclid, a.gbraid, a.wbraid].some((v) => typeof v === 'string' && v.trim() !== '')) return true;
  return typeof a.utmMedium === 'string' && MEDIO_PAGADO.test(a.utmMedium.trim());
}

/**
 * Etiquetas de origen comunes a la cotización y la agenda: `campaña` u `orgánico`, más `entorno-preview` fuera de producción.
 * @param {Parameters<typeof esCampana>[0]} atribucion
 * @param {string} entorno  'production' | 'preview' | 'development' | 'local'
 * @returns {string[]}
 */
export function etiquetasDeOrigen(atribucion, entorno) {
  const tags = [esCampana(atribucion) ? 'campaña' : 'orgánico'];
  if (entorno !== 'production') tags.push('entorno-preview');
  return tags;
}

/**
 * «Página de origen»: la ruta (o URL) de la página del sitio, siempre en https://ingeniak.mx y sin consulta ni ancla.
 * @param {unknown} pagina  p. ej. '/servicios/agentes-ia-whatsapp/'
 * @returns {string | null}
 */
export function urlDePagina(pagina) {
  if (typeof pagina !== 'string' || !pagina.trim()) return null;
  try {
    const u = new URL(pagina.trim(), SITE_URL);
    if (u.protocol !== 'https:' && u.protocol !== 'http:') return null;
    return `${SITE_URL}${u.pathname}`;
  } catch {
    return null;
  }
}

/* ── Estructura de la cuenta (por nombre, con caché de 10 min) ───────────────────────────────── */

/**
 * @type {{ base: string, hasta: number, data: Estructura | null, result: CallResult | null } | null}
 */
let cache = null;
/** @type {{ base: string, p: Promise<{ ok: true, data: Estructura } | { ok: false, result: CallResult }> } | null} */
let enCurso = null;

/** @param {any} data respuesta de GET /leads/pipelines @returns {Embudo[]} */
function leerEmbudos(data) {
  const list = Array.isArray(data?._embedded?.pipelines) ? data._embedded.pipelines : [];
  return list
    .filter((p) => Number.isSafeInteger(p?.id) && !p.is_archive)
    .map((p) => ({
      id: p.id,
      name: String(p.name ?? ''),
      isMain: Boolean(p.is_main),
      etapas: (Array.isArray(p?._embedded?.statuses) ? p._embedded.statuses : [])
        .filter((s) => Number.isSafeInteger(s?.id))
        .map((s) => ({ id: s.id, name: String(s.name ?? ''), type: Number(s.type ?? 0) })),
    }));
}

/**
 * Todos los campos del lead (paginado: `_links.next`). Si falla una página posterior a la primera, se usa lo leído.
 * @param {number} deadline
 * @returns {Promise<{ ok: true, list: any[], completo: boolean } | { ok: false, result: CallResult }>}
 */
async function leerCampos(deadline) {
  /** @type {any[]} */
  const list = [];
  for (let page = 1; page <= CAMPOS_PAGINAS_MAX; page++) {
    const r = await call(`/leads/custom_fields?limit=${CAMPOS_POR_PAGINA}&page=${page}`, { deadline });
    if (r.status === 204) break;
    if (r.status !== 200) return page === 1 ? { ok: false, result: r } : { ok: true, list, completo: false };
    const rows = Array.isArray(r.data?._embedded?.custom_fields) ? r.data._embedded.custom_fields : [];
    list.push(...rows);
    if (!rows.length || !r.data?._links?.next?.href) break;
  }
  return { ok: true, list, completo: true };
}

/**
 * @param {Embudo[]} embudos
 * @param {any[]} campos
 * @returns {Estructura}
 */
function armarEstructura(embudos, campos) {
  /** @type {Map<string, Campo[]>} */
  const porNombre = new Map();
  /** @type {Map<string, number>} */
  const rastreo = new Map();
  for (const f of campos) {
    if (!Number.isSafeInteger(f?.id)) continue;
    const code = typeof f.code === 'string' ? f.code.toUpperCase() : '';
    if (TRACKING_CODES.includes(code) && !rastreo.has(code)) rastreo.set(code, f.id);
    const nombre = normalizar(f.name);
    if (!nombre) continue;
    /** @type {Map<string, number>} */
    const enums = new Map();
    for (const e of Array.isArray(f.enums) ? f.enums : []) {
      const k = normalizar(e?.value);
      if (k && Number.isSafeInteger(e?.id) && !enums.has(k)) enums.set(k, e.id);
    }
    const lista = porNombre.get(nombre) ?? [];
    lista.push({ id: f.id, type: String(f.type ?? ''), enums });
    porNombre.set(nombre, lista);
  }
  return { embudos, campos: porNombre, rastreo };
}

/**
 * Estructura de la cuenta (embudos con etapas y campos del lead), con caché por instancia.
 * Éxito completo → 10 min; con alguna falla de red/5xx → 1 min; 401/402/403/429 → sin caché (se corta el envío).
 * @param {number} deadline  límite del envío completo
 * @returns {Promise<{ ok: true, data: Estructura } | { ok: false, result: CallResult }>}
 */
async function estructura(deadline) {
  const base = kommoBase() ?? '';
  const now = Date.now();
  if (cache && cache.base === base && now < cache.hasta) {
    return cache.data ? { ok: true, data: cache.data } : { ok: false, result: /** @type {CallResult} */ (cache.result) };
  }
  if (enCurso && enCurso.base === base) return enCurso.p;
  const limite = Math.min(deadline - RESERVA_LEAD_MS, now + ESTRUCTURA_MAX_MS);
  if (limite - now < 250) return { ok: false, result: { status: 0, data: null, reason: 'network' } };

  const p = (async () => {
    const [pr, cr] = await Promise.all([call('/leads/pipelines', { deadline: limite }), leerCampos(limite)]);
    const pipelinesOk = pr.status === 200 || pr.status === 204;
    const fatal = [pr, cr.ok ? null : cr.result].find((r) => r && FATALES.includes(r.reason ?? ''));
    if (fatal) return /** @type {const} */ ({ ok: false, result: fatal });
    if (!pipelinesOk && !cr.ok) {
      cache = { base, hasta: Date.now() + ESTRUCTURA_TTL_FALLA_MS, data: null, result: pr };
      return /** @type {const} */ ({ ok: false, result: pr });
    }
    const data = armarEstructura(pipelinesOk ? leerEmbudos(pr.data) : [], cr.ok ? cr.list : []);
    const completa = pipelinesOk && cr.ok && cr.completo;
    cache = { base, hasta: Date.now() + (completa ? ESTRUCTURA_TTL_MS : ESTRUCTURA_TTL_FALLA_MS), data, result: null };
    return /** @type {const} */ ({ ok: true, data });
  })();
  enCurso = { base, p };
  try {
    return await p;
  } finally {
    if (enCurso?.p === p) enCurso = null;
  }
}

/** Olvida la estructura (p. ej. después de que Kommo rechazó un id que creíamos válido). */
function olvidarEstructura() {
  cache = null;
}

/** @param {Estructura | null} est @param {string} nombre */
function buscarEmbudo(est, nombre) {
  const n = normalizar(nombre);
  return est?.embudos.find((p) => normalizar(p.name) === n) ?? null;
}

/** @param {Embudo | null | undefined} embudo @param {string} nombre */
function buscarEtapa(embudo, nombre) {
  const n = normalizar(nombre);
  return embudo?.etapas.find((s) => normalizar(s.name) === n) ?? null;
}

/** @param {unknown} embudo @param {unknown} etapa @returns {string | null} */
function nombreEtapa(embudo, etapa) {
  const e = /** @type {any} */ (EMBUDOS)[/** @type {string} */ (embudo)];
  return e?.etapas?.find((/** @type {{ clave: string }} */ x) => x.clave === etapa)?.nombre ?? null;
}

/**
 * Embudo y etapa del lead. Prioridad:
 *   1. `pipelineId` (variable): ese embudo, con la etapa de `statusId` (variable) o, sin ella, la del nombre aprobado
 *      dentro de ese embudo; si ese nombre no existe ahí, `statusIdRespaldo`.
 *   2. `statusId` (variable, sin embudo): esa etapa.
 *   3. Embudo y etapa por nombre (estructura aprobada). Si la etapa con ese nombre no existe, `statusIdRespaldo`.
 *   4. `statusIdRespaldo` sin la estructura (con el embudo al que pertenece, si se conoce).
 *   5. Embudo de respaldo (`fallbackPipelineId` / `fallbackStatusId`) → embudo principal (sin pipeline_id ni status_id).
 * `statusId` manda siempre (la cotización tiene una sola etapa de entrada). `statusIdRespaldo` (p. ej.
 * KOMMO_DISCOVERY_STATUS_ID = 97185916) nunca le gana a una etapa encontrada por nombre: es el plan B mientras la
 * etapa no tenga todavía el nombre aprobado.
 * @param {Estructura | null} est
 * @param {{ embudo?: string, etapa?: string, pipelineId?: number, statusId?: number, statusIdRespaldo?: number,
 *           fallbackPipelineId?: number, fallbackStatusId?: number }} [destino]
 * @returns {Destino}
 */
export function resolverDestino(est, destino = {}) {
  const pid = posInt(destino.pipelineId);
  const sid = posInt(destino.statusId);
  const respaldo = posInt(destino.statusIdRespaldo);
  const etapa = destino.embudo && destino.etapa ? nombreEtapa(destino.embudo, destino.etapa) : null;
  if (pid) {
    if (sid) return { pipelineId: pid, statusId: sid, origen: 'variable' };
    const enPid = est?.embudos.find((p) => p.id === pid);
    const s = etapa ? buscarEtapa(enPid, etapa)?.id : undefined;
    if (s) return { pipelineId: pid, statusId: s, origen: 'variable', etapaPorNombre: true };
    // La de respaldo solo si es de ese embudo (o si no se pudo leer): otra haría que Kommo rechazara el lead.
    const r = respaldo && (!enPid || enPid.etapas.some((x) => x.id === respaldo)) ? respaldo : undefined;
    return { pipelineId: pid, statusId: r, origen: 'variable' };
  }
  if (sid) return { statusId: sid, origen: 'variable' };
  const nombre = destino.embudo ? /** @type {any} */ (EMBUDOS)[destino.embudo]?.nombre : null;
  const p = nombre ? buscarEmbudo(est, nombre) : null;
  const s = p && etapa ? buscarEtapa(p, etapa)?.id : undefined;
  if (p && s) return { pipelineId: p.id, statusId: s, origen: 'nombre', etapaPorNombre: true };
  if (respaldo) {
    // Con los embudos leídos se sabe a cuál pertenece (y si ya no existe, se ignora); sin ellos, va sola, como antes.
    const dueno = est?.embudos.find((e) => e.etapas.some((x) => x.id === respaldo));
    if (dueno) return { pipelineId: dueno.id, statusId: respaldo, origen: 'variable' };
    if (!est?.embudos.length) return { statusId: respaldo, origen: 'variable' };
  }
  if (p) return { pipelineId: p.id, statusId: undefined, origen: 'nombre' };
  const fp = posInt(destino.fallbackPipelineId);
  const fs = posInt(destino.fallbackStatusId);
  if (fp || fs) return { pipelineId: fp, statusId: fs, origen: 'respaldo' };
  return { origen: 'principal' };
}

/** @param {unknown} v */
const vacio = (v) => v === undefined || v === null || v === '' || (Array.isArray(v) && v.length === 0);

/**
 * Campo de la cuenta con el nombre y el tipo de `kommo-esquema.js` (un campo con el mismo nombre pero otro tipo se ignora).
 * @param {Estructura} est @param {{ nombre: string, tipo: string }} def
 */
function buscarCampo(est, def) {
  return (est.campos.get(normalizar(def.nombre)) ?? []).find((c) => c.type === def.tipo) ?? null;
}

/**
 * @param {{ tipo: string, alias?: Record<string, string> }} def @param {Campo} campo @param {unknown} v
 * @returns {number | null}
 */
function enumId(def, campo, v) {
  if (typeof v !== 'string' || !v.trim()) return null;
  return campo.enums.get(normalizar(def.alias?.[v.trim()] ?? v)) ?? null;
}

/**
 * Valores de un campo en formato Kommo, o null si no se puede llenar.
 * select → [{ enum_id }] · multiselect → [{ enum_id }, …] · date_time → [{ value: segundos unix }] · url → [{ value }]
 * @param {{ tipo: string, alias?: Record<string, string> }} def @param {Campo} campo @param {unknown} crudo
 */
function valoresDe(def, campo, crudo) {
  switch (def.tipo) {
    case 'select': {
      const id = enumId(def, campo, crudo);
      return id ? [{ enum_id: id }] : null;
    }
    case 'multiselect': {
      const ids = [...new Set((Array.isArray(crudo) ? crudo : [crudo]).map((v) => enumId(def, campo, v)).filter((x) => x !== null))];
      return ids.length ? ids.map((id) => ({ enum_id: id })) : null;
    }
    case 'date_time': {
      const n = Number(crudo);
      return Number.isSafeInteger(n) && n > 0 ? [{ value: n }] : null;
    }
    case 'url': {
      const s = typeof crudo === 'string' ? crudo.trim() : '';
      return /^https?:\/\/\S+$/i.test(s) && s.length <= 255 ? [{ value: s }] : null;
    }
    default:
      return null;
  }
}

/**
 * `custom_fields_values` de los campos del sitio que existen en la cuenta (por nombre, tipo y opción).
 * Lo que no existe se omite y sigue en la nota. Nunca produce un id que no venga de la propia cuenta.
 * @param {Estructura | null} est
 * @param {ValoresCampos | undefined} campos
 * @returns {{ valores: { field_id: number, values: object[] }[], enviados: string[], omitidos: string[] }}
 */
export function valoresDeCampos(est, campos) {
  /** @type {{ field_id: number, values: object[] }[]} */
  const valores = [];
  /** @type {string[]} */
  const enviados = [];
  /** @type {string[]} */
  const omitidos = [];
  for (const [clave, crudo] of Object.entries(campos ?? {})) {
    if (vacio(crudo)) continue;
    const def = /** @type {any} */ (CAMPOS)[clave];
    const campo = def && est ? buscarCampo(est, def) : null;
    const values = campo ? valoresDe(def, campo, crudo) : null;
    if (campo && values) {
      valores.push({ field_id: campo.id, values });
      enviados.push(clave);
    } else {
      omitidos.push(clave);
    }
  }
  return { valores, enviados, omitidos };
}

/**
 * Vista previa legible (simulación): { 'Industria': 'Salud', … } con las opciones de `kommo-esquema.js`.
 * @param {ValoresCampos | undefined} campos
 */
function previewCampos(campos) {
  /** @type {Record<string, unknown>} */
  const out = {};
  for (const [clave, crudo] of Object.entries(campos ?? {})) {
    const def = /** @type {any} */ (CAMPOS)[clave];
    if (!def || vacio(crudo)) continue;
    if (def.tipo === 'select') {
      const o = opcionKommo(clave, crudo);
      if (o) out[def.nombre] = o;
    } else if (def.tipo === 'multiselect') {
      const os = (Array.isArray(crudo) ? crudo : [crudo]).map((v) => opcionKommo(clave, v)).filter(Boolean);
      if (os.length) out[def.nombre] = os;
    } else {
      out[def.nombre] = crudo;
    }
  }
  return out;
}

/**
 * Destino legible para la simulación.
 * @param {{ embudo?: string, etapa?: string, pipelineId?: number, statusId?: number, statusIdRespaldo?: number }} i
 */
function previewDestino(i) {
  const etapa = i.embudo ? nombreEtapa(i.embudo, i.etapa) : null;
  // La etapa de respaldo solo se usaría si la etapa con su nombre no existe en la cuenta.
  const respaldo = posInt(i.statusIdRespaldo) ? { status_id_respaldo: posInt(i.statusIdRespaldo) } : {};
  if (posInt(i.statusId)) return { pipeline_id: posInt(i.pipelineId) ?? null, status_id: posInt(i.statusId) };
  if (posInt(i.pipelineId)) return etapa ? { pipeline_id: posInt(i.pipelineId), etapa, ...respaldo } : { pipeline_id: posInt(i.pipelineId), status_id: null, ...respaldo };
  const embudo = i.embudo ? /** @type {any} */ (EMBUDOS)[i.embudo]?.nombre ?? null : null;
  return embudo ? { embudo, etapa, ...respaldo } : { embudo: 'principal', ...respaldo };
}

/* ── Campos de rastreo ─────────────────────────────────────────────────────────────────────── */

/**
 * @param {Record<string, string>} tracking  { UTM_SOURCE: 'google', … }
 * @param {Map<string, number> | null} ids   null = simulación (se muestra field_code)
 */
function trackingValues(tracking, ids) {
  const out = [];
  for (const code of TRACKING_CODES) {
    const v = tracking?.[code];
    if (typeof v !== 'string' || !v.trim()) continue;
    const value = v.trim().slice(0, 255);
    if (!ids) out.push({ field_code: code, values: [{ value }] });
    else if (ids.has(code)) out.push({ field_id: /** @type {number} */ (ids.get(code)), values: [{ value }] });
  }
  return out;
}

/* ── Alertas ───────────────────────────────────────────────────────────────────────────────── */

/** @type {Map<string, number>} */
const lastAlert = new Map();

/**
 * Alerta `kommo.alerta` al webhook ante 401/402/403/429 (como mucho una por tipo cada 5 min).
 * @param {CallResult} r
 * @param {Ctx} ctx
 */
async function maybeAlert(r, ctx) {
  const reason = r.reason ?? reasonFor(r.status);
  const a = /** @type {Record<string, { alerta: string, mensaje: string }>} */ (ALERTAS)[reason];
  if (!a || !(process.env.NOTIFY_WEBHOOK_URL ?? '').trim()) return;
  const now = Date.now();
  if (now - (lastAlert.get(reason) ?? -Infinity) < ALERT_EVERY_MS) return;
  lastAlert.set(reason, now);
  await notify('kommo.alerta', {
    source: ctx.source ?? 'kommo',
    folio: ctx.folio,
    kommo: { ok: false, status: r.status, reason },
    alerta: a.alerta,
    mensaje: a.mensaje,
  });
}

/**
 * Falla de un paso: log sin datos personales, alerta si aplica y resultado normalizado.
 * @param {string} paso
 * @param {CallResult} r
 * @param {Ctx} ctx
 * @param {number} t0
 */
async function fail(paso, r, ctx, t0) {
  const reason = r.reason ?? reasonFor(r.status);
  log({ evento: `kommo.${paso}`, folio: ctx.folio, status: r.status, ms: Date.now() - t0 });
  await maybeAlert(r, ctx);
  return /** @type {const} */ ({ ok: false, status: r.status, reason });
}

/**
 * ¿El 400 culpa a la etapa o al embudo? (Kommo: `validation-errors[].errors[].path`).
 * @param {unknown} data
 */
function culpaEtapa(data) {
  try {
    return /status_id|pipeline_id/.test(JSON.stringify(data ?? ''));
  } catch {
    return false;
  }
}

/* ── API ───────────────────────────────────────────────────────────────────────────────────── */

/**
 * @typedef {{
 *   name: string,
 *   contact: { name: string, phoneE164?: string, email?: string },
 *   company?: string,
 *   tags?: string[],
 *   note?: string,
 *   tracking?: Record<string, string>,
 *   embudo?: ClaveEmbudo, etapa?: string, campos?: ValoresCampos,
 *   pipelineId?: number, statusId?: number, statusIdRespaldo?: number, responsibleUserId?: number,
 *   fallbackPipelineId?: number, fallbackStatusId?: number,
 *   source?: string, folio?: string, budgetMs?: number
 * }} LeadInput
 */

/**
 * Cuerpo de POST /leads/complex (un lead).
 * @param {LeadInput} input
 * @param {number | null} contactId  contacto existente o null (nuevo)
 * @param {object[]} customFields    campos del lead (estructura aprobada + rastreo), ya con ids de la cuenta
 * @param {{ pipelineId?: number, statusId?: number }} [destino]  sin él: las variables de `input`
 */
export function complexBody(input, contactId, customFields, destino) {
  /** @type {Record<string, any>} */
  const lead = { name: String(input.name ?? '').slice(0, 255) };
  const d = destino ?? { pipelineId: input.pipelineId, statusId: input.statusId };
  if (posInt(d.pipelineId)) lead.pipeline_id = d.pipelineId;
  if (posInt(d.statusId)) lead.status_id = d.statusId;
  if (posInt(input.responsibleUserId)) lead.responsible_user_id = input.responsibleUserId;
  if (customFields.length) lead.custom_fields_values = customFields;

  /** @type {object[]} */
  let contacts;
  if (contactId) {
    contacts = [{ id: contactId }];
  } else {
    const cfv = [];
    if (input.contact?.phoneE164) cfv.push({ field_code: 'PHONE', values: [{ value: input.contact.phoneE164, enum_code: 'MOB' }] });
    if (input.contact?.email) cfv.push({ field_code: 'EMAIL', values: [{ value: input.contact.email, enum_code: 'WORK' }] });
    contacts = [{ name: String(input.contact?.name ?? '').slice(0, 255), custom_fields_values: cfv }];
  }
  /** @type {Record<string, any>} */
  const embedded = {
    tags: [...new Set((input.tags ?? []).filter((t) => typeof t === 'string' && t))].map((name) => ({ name })),
    contacts,
  };
  if (!contactId && input.company) embedded.companies = [{ name: String(input.company).slice(0, 255) }];
  lead._embedded = embedded;
  return [lead];
}

/**
 * Cuerpo de POST /leads/notes (nota común).
 * @param {number | string} leadId
 * @param {string} text
 */
export function noteBody(leadId, text) {
  return [{ entity_id: leadId, note_type: 'common', params: { text } }];
}

/**
 * Crea el lead (con contacto y empresa) y le agrega la nota. Nunca lanza.
 * Orden: GET contacts?query=correo → (204) GET contacts?query=+E164 → estructura (GET leads/pipelines y
 * GET leads/custom_fields, en paralelo y con caché de 10 min; solo si hay embudo, campos o rastreo) →
 * POST leads/complex (si Kommo responde 400 y mandamos datos de la estructura: un reintento sin campos, y sin
 * embudo/etapa por nombre si el error los menciona) → POST leads/notes (si falla, el lead ya existe: ok igual).
 * @param {LeadInput} input
 * @returns {Promise<
 *   { ok: true, status: number, leadId: number | null, contactId: number | null, existingContact: boolean, noteOk: boolean,
 *     destino?: OrigenDestino, campos?: { enviados: string[], omitidos: string[] }, reintento?: boolean, dryRun?: true, preview?: object }
 *   | { ok: false, status: number, reason: Reason }>}
 */
export async function createLeadWithNote(input) {
  const t0 = Date.now();
  /** @type {Ctx} */
  const ctx = { source: input?.source, folio: input?.folio };
  try {
    const email = (input?.contact?.email ?? '').trim().toLowerCase();
    const phone = (input?.contact?.phoneE164 ?? '').trim();
    /** @type {{ code: 'EMAIL' | 'PHONE', value: string }[]} */
    const searches = [];
    if (email) searches.push({ code: 'EMAIL', value: email });
    if (phone) searches.push({ code: 'PHONE', value: phone });
    const tracking = input?.tracking ?? {};
    const note = typeof input?.note === 'string' ? input.note : '';

    if (!kommoConfigured()) {
      if (!dryRun()) {
        log({ evento: 'kommo.config', folio: ctx.folio, status: 0, ms: Date.now() - t0 });
        return { ok: false, status: 0, reason: 'not-configured' };
      }
      return {
        ok: true,
        status: 200,
        dryRun: true,
        leadId: null,
        contactId: null,
        existingContact: false,
        noteOk: true,
        preview: {
          contactSearch: searches.map((s) => `GET /api/v4/contacts?query=${encodeURIComponent(s.value)}`),
          complex: complexBody(input, null, trackingValues(tracking, null)),
          note: note ? noteBody('<lead_id>', note) : [],
          tags: complexBody(input, null, [])[0]._embedded.tags.map((/** @type {{name: string}} */ t) => t.name),
          destino: previewDestino(input),
          campos: previewCampos(input.campos),
        },
      };
    }

    const deadline = t0 + (Number.isFinite(input?.budgetMs) ? Number(input.budgetMs) : LEAD_BUDGET_MS);

    // 1 · ¿El contacto ya existe? (correo y luego teléfono)
    /** @type {number | null} */
    let contactId = null;
    for (const s of searches) {
      const r = await call(`/contacts?query=${encodeURIComponent(s.value)}`, { deadline });
      if (r.status === 204) continue;
      if (r.status !== 200) return await fail('contactos', r, ctx, t0);
      contactId = matchContact(r.data, s.code, s.value);
      if (contactId) break;
    }

    // 2 · Estructura de la cuenta: embudo y etapa por nombre, campos del sitio y de rastreo (caché 10 min)
    const hayRastreo = Object.values(tracking).some((v) => typeof v === 'string' && v.trim());
    const hayCampos = Object.values(input.campos ?? {}).some((v) => !vacio(v));
    /** @type {Estructura | null} */
    let est = null;
    if (input.embudo || hayCampos || hayRastreo) {
      const e = await estructura(deadline);
      if (e.ok) est = e.data;
      else if (FATALES.includes(e.result.reason ?? '')) return await fail('campos', e.result, ctx, t0);
      else log({ evento: 'kommo.campos', folio: ctx.folio, status: e.result.status, ms: Date.now() - t0 });
    }
    const destino = resolverDestino(est, input);
    const campos = valoresDeCampos(est, input.campos);
    const customFields = [...campos.valores, ...(est ? trackingValues(tracking, est.rastreo) : [])];

    // 3 · Lead + contacto + empresa (con campos y etapa); si Kommo rechaza algo de la estructura, se reintenta sin ello
    let r = await call('/leads/complex', { method: 'POST', body: complexBody(input, contactId, customFields, destino), deadline });
    let reintento = false;
    const etapaPorNombre = destino.origen === 'nombre' || destino.etapaPorNombre === true;
    if ((r.status === 400 || r.status === 422) && (customFields.length || etapaPorNombre)) {
      reintento = true;
      olvidarEstructura();
      log({ evento: 'kommo.complex-reintento', folio: ctx.folio, status: r.status, ms: Date.now() - t0 });
      const seguro = culpaEtapa(r.data) ? resolverDestino(null, input) : destino;
      r = await call('/leads/complex', { method: 'POST', body: complexBody(input, contactId, [], seguro), deadline });
    }
    if (r.status !== 200 && r.status !== 201) return await fail('complex', r, ctx, t0);
    const row = Array.isArray(r.data) ? r.data[0] : r.data?._embedded?.leads?.[0];
    const leadId = Number.isSafeInteger(row?.id) ? row.id : null;
    if (!leadId) return await fail('complex', { status: r.status, data: null, reason: 'server' }, ctx, t0);
    const newContact = Number.isSafeInteger(row?.contact_id) ? row.contact_id : null;

    // 4 · Nota con el formulario completo
    let noteOk = true;
    if (note) {
      const n = await call('/leads/notes', { method: 'POST', body: noteBody(leadId, note), deadline });
      noteOk = n.status === 200 || n.status === 201;
      if (!noteOk) {
        log({ evento: 'kommo.nota', folio: ctx.folio, status: n.status, leadId, ms: Date.now() - t0 });
        await maybeAlert(n, ctx);
      }
    }
    return {
      ok: true,
      status: r.status,
      leadId,
      contactId: contactId ?? newContact,
      existingContact: Boolean(contactId),
      noteOk,
      destino: destino.origen,
      campos: reintento ? { enviados: [], omitidos: [...campos.enviados, ...campos.omitidos] } : { enviados: campos.enviados, omitidos: campos.omitidos },
      reintento,
    };
  } catch {
    log({ evento: 'kommo.error', folio: ctx.folio, status: 0, ms: Date.now() - t0 });
    return { ok: false, status: 0, reason: 'network' };
  }
}

/** @param {unknown} id */
function validLeadId(id) {
  const n = typeof id === 'string' && /^\d+$/.test(id) ? Number(id) : id;
  return Number.isSafeInteger(n) && /** @type {number} */ (n) > 0 ? /** @type {number} */ (n) : null;
}

/** @param {string[]} [list] */
const tagNames = (list = []) => [...new Set(list.filter((t) => typeof t === 'string' && t))];

/**
 * Actualiza un lead existente con PATCH /leads/{id}: lo mueve a una etapa (por nombre), llena campos (por nombre)
 * y agrega o quita etiquetas. Nunca lanza.
 * - La etapa se busca dentro del embudo por nombre (o del embudo de `pipelineId`, si viene por variable). Si no
 *   existe, el lead no se mueve. Los campos que no existen se omiten.
 * - Si no se pudo leer la estructura (red, 5xx…), responde { ok: false } para que el llamador lo reintente después.
 * - 400 de Kommo: un reintento sin campos (o sin mover, si el error culpa a la etapa).
 * - `final: true` cuando reintentar no sirve: el lead ya no existe (404: se borró o se fusionó), el id no es válido
 *   o Kommo lo sigue rechazando (400/422) después del reintento. El llamador decide qué hacer (p. ej. un lead nuevo).
 * @param {number | string} leadId
 * @param {{ embudo?: ClaveEmbudo, etapa?: string, pipelineId?: number, campos?: ValoresCampos,
 *           tags?: { add?: string[], remove?: string[] }, folio?: string, source?: string, budgetMs?: number }} [cambios]
 * @returns {Promise<{ ok: boolean, status?: number, reason?: Reason, final?: boolean, enviado?: boolean, movido?: boolean,
 *                     campos?: { enviados: string[], omitidos: string[] }, dryRun?: true, preview?: object }>}
 */
export async function updateLead(leadId, cambios = {}) {
  const t0 = Date.now();
  /** @type {Ctx} */
  const ctx = { folio: cambios.folio, source: cambios.source };
  try {
    const id = validLeadId(leadId);
    const tAdd = tagNames(cambios.tags?.add);
    const tDel = tagNames(cambios.tags?.remove);
    if (!kommoConfigured()) {
      if (!dryRun()) return { ok: false, status: 0, reason: 'not-configured' };
      return {
        ok: true,
        dryRun: true,
        preview: { method: 'PATCH', path: `/api/v4/leads/${id ?? '<lead_id>'}`, destino: previewDestino({ ...cambios, pipelineId: undefined }), campos: previewCampos(cambios.campos), tags: { add: tAdd, remove: tDel } },
      };
    }
    if (!id) return { ok: false, status: 0, reason: 'validation', final: true };
    const deadline = t0 + (Number.isFinite(cambios.budgetMs) ? Number(cambios.budgetMs) : LEAD_BUDGET_MS);
    /** Falla del PATCH: 404 (el lead ya no existe) y 400/422 (después del reintento) no se arreglan reintentando. */
    const fallaPatch = async (/** @type {CallResult} */ res) => {
      const f = await fail('patch', res, ctx, t0);
      return [400, 404, 422].includes(res.status) ? { ...f, final: true } : f;
    };

    const quiereMover = Boolean(cambios.embudo && cambios.etapa);
    /** @type {Estructura | null} */
    let est = null;
    if (quiereMover || Object.values(cambios.campos ?? {}).some((v) => !vacio(v))) {
      const e = await estructura(deadline);
      if (!e.ok) return await fail('estructura', e.result, ctx, t0);
      est = e.data;
    }
    const destino = quiereMover ? resolverDestino(est, { embudo: cambios.embudo, etapa: cambios.etapa, pipelineId: cambios.pipelineId }) : null;
    const mover = destino && posInt(destino.statusId) ? destino : null;
    const campos = valoresDeCampos(est, cambios.campos);

    /** @param {{ conMover: boolean, conCampos: boolean }} o */
    const armar = ({ conMover, conCampos }) => {
      /** @type {Record<string, any>} */
      const body = {};
      if (conMover && mover) {
        if (posInt(mover.pipelineId)) body.pipeline_id = mover.pipelineId;
        body.status_id = mover.statusId;
      }
      if (conCampos && campos.valores.length) body.custom_fields_values = campos.valores;
      if (tAdd.length) body.tags_to_add = tAdd.map((name) => ({ name }));
      if (tDel.length) body.tags_to_delete = tDel.map((name) => ({ name }));
      return body;
    };
    let body = armar({ conMover: true, conCampos: true });
    if (!Object.keys(body).length) return { ok: true, status: 200, enviado: false, movido: false, campos };

    let r = await call(`/leads/${id}`, { method: 'PATCH', body, deadline });
    let movido = Boolean(mover);
    if ((r.status === 400 || r.status === 422) && (mover || campos.valores.length)) {
      olvidarEstructura();
      log({ evento: 'kommo.patch-reintento', folio: ctx.folio, status: r.status, leadId: id, ms: Date.now() - t0 });
      const etapaMal = culpaEtapa(r.data);
      body = armar({ conMover: !etapaMal, conCampos: etapaMal });
      movido = Boolean(mover) && !etapaMal;
      if (!Object.keys(body).length) return await fallaPatch(r);
      r = await call(`/leads/${id}`, { method: 'PATCH', body, deadline });
    }
    if (r.status !== 200) return await fallaPatch(r);
    return { ok: true, status: 200, enviado: true, movido, campos };
  } catch {
    return { ok: false, status: 0, reason: 'network' };
  }
}

/**
 * Agrega y quita etiquetas de un lead: PATCH /leads/{id} con `tags_to_add` / `tags_to_delete`
 * (por nombre; referencia de Kommo «Updating a lead», consultada el 2026-10-20). Nunca lanza.
 * @param {number | string} leadId
 * @param {{ add?: string[], remove?: string[], folio?: string, source?: string }} [opts]
 * @returns {Promise<{ ok: boolean, status?: number, reason?: Reason, dryRun?: true, preview?: object }>}
 */
export async function updateLeadTags(leadId, { add = [], remove = [], folio, source } = {}) {
  const t0 = Date.now();
  try {
    const id = validLeadId(leadId);
    /** @type {Record<string, any>} */
    const body = {};
    const tAdd = tagNames(add);
    const tDel = tagNames(remove);
    if (tAdd.length) body.tags_to_add = tAdd.map((name) => ({ name }));
    if (tDel.length) body.tags_to_delete = tDel.map((name) => ({ name }));
    if (!kommoConfigured()) {
      if (!dryRun()) return { ok: false, status: 0, reason: 'not-configured' };
      return { ok: true, dryRun: true, preview: { method: 'PATCH', path: `/api/v4/leads/${id ?? '<lead_id>'}`, body } };
    }
    if (!id) return { ok: false, status: 0, reason: 'validation' };
    if (!tAdd.length && !tDel.length) return { ok: true, status: 200 };
    const r = await call(`/leads/${id}`, { method: 'PATCH', body, deadline: t0 + CALL_TIMEOUT_MS });
    if (r.status === 200) return { ok: true, status: 200 };
    return await fail('etiquetas', r, { folio, source }, t0);
  } catch {
    return { ok: false, status: 0, reason: 'network' };
  }
}

/**
 * Nota común en un lead existente. Nunca lanza.
 * @param {number | string} leadId
 * @param {string} text
 * @param {{ folio?: string, source?: string }} [ctx]
 * @returns {Promise<{ ok: boolean, status?: number, reason?: Reason, dryRun?: true, preview?: object }>}
 */
export async function addLeadNote(leadId, text, ctx = {}) {
  const t0 = Date.now();
  try {
    const id = validLeadId(leadId);
    const t = typeof text === 'string' ? text : '';
    if (!kommoConfigured()) {
      if (!dryRun()) return { ok: false, status: 0, reason: 'not-configured' };
      return { ok: true, dryRun: true, preview: { method: 'POST', path: '/api/v4/leads/notes', body: noteBody(id ?? '<lead_id>', t) } };
    }
    if (!id || !t) return { ok: false, status: 0, reason: 'validation' };
    const r = await call('/leads/notes', { method: 'POST', body: noteBody(id, t), deadline: t0 + CALL_TIMEOUT_MS });
    if (r.status === 200 || r.status === 201) return { ok: true, status: r.status };
    return await fail('nota', r, ctx, t0);
  } catch {
    return { ok: false, status: 0, reason: 'network' };
  }
}

/**
 * Diagnóstico de la estructura aprobada (para /api/agenda/estado/ en Preview): consulta fresca, sin ids.
 * `estado` y `faltan` cuentan solo lo que el sitio usa: los embudos «Ventas» y «Power Session» (con sus etapas)
 * y los 15 campos con sus opciones. `faltan` lista los nombres que el sitio no encontró (máximo 30).
 * `opcionales` lista lo que falta de embudos que el sitio no llena (hoy ninguno): no cambia el estado.
 * @returns {Promise<{ estado: 'completa' | 'incompleta' | 'sin-estructura' | 'error' | 'sin-configurar', faltan: string[], opcionales: string[] }>}
 */
export async function revisarEstructura() {
  if (!kommoConfigured()) return { estado: 'sin-configurar', faltan: [], opcionales: [] };
  try {
    olvidarEstructura();
    const e = await estructura(Date.now() + ESTRUCTURA_MAX_MS + RESERVA_LEAD_MS);
    if (!e.ok) return { estado: 'error', faltan: [], opcionales: [] };
    const est = e.data;
    /** @type {string[]} */
    const faltan = [];
    /** @type {string[]} */
    const opcionales = [];
    let encontrados = 0;
    for (const [clave, def] of Object.entries(EMBUDOS)) {
      const usa = EMBUDOS_DEL_SITIO.includes(/** @type {any} */ (clave));
      const lista = usa ? faltan : opcionales;
      const p = buscarEmbudo(est, def.nombre);
      if (!p) {
        lista.push(`Embudo «${def.nombre}»`);
        continue;
      }
      if (usa) encontrados++;
      for (const s of def.etapas) if (!buscarEtapa(p, s.nombre)) lista.push(`Etapa «${s.nombre}» (${def.nombre})`);
    }
    for (const def of /** @type {any[]} */ (Object.values(CAMPOS))) {
      const c = buscarCampo(est, def);
      if (!c) {
        faltan.push(`Campo «${def.nombre}»`);
        continue;
      }
      encontrados++;
      for (const o of def.opciones ?? []) if (!c.enums.has(normalizar(o))) faltan.push(`Opción «${o}» (${def.nombre})`);
    }
    const estado = !faltan.length ? 'completa' : encontrados ? 'incompleta' : 'sin-estructura';
    return { estado, faltan: faltan.slice(0, 30), opcionales: opcionales.slice(0, 10) };
  } catch {
    return { estado: 'error', faltan: [], opcionales: [] };
  }
}

/**
 * Webhook de aviso (opcional): POST JSON a NOTIFY_WEBHOOK_URL con `x-webhook-secret` si existe; 5 s.
 * Cuerpo: { event, site: 'ingeniak.mx', source, env, folio, kommo, data, … }. Nunca lanza.
 * @param {'lead.created' | 'kommo.alerta' | string} event
 * @param {Record<string, unknown>} [payload]
 * @returns {Promise<boolean>} true si respondió 2xx
 */
export async function notify(event, payload = {}) {
  const url = (process.env.NOTIFY_WEBHOOK_URL ?? '').trim();
  if (!url) return false;
  const t0 = Date.now();
  try {
    const u = new URL(url);
    if (u.protocol !== 'https:' && u.protocol !== 'http:') return false;
    /** @type {Record<string, string>} */
    const headers = { 'content-type': 'application/json', accept: 'application/json' };
    const secret = (process.env.NOTIFY_WEBHOOK_SECRET ?? '').trim();
    if (secret) headers['x-webhook-secret'] = secret;
    const { source, ...rest } = payload ?? {};
    const body = { event, site: 'ingeniak.mx', source: source ?? null, env: envName(), ...rest };
    const res = await fetch(u, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(NOTIFY_TIMEOUT_MS),
    });
    await res.body?.cancel().catch(() => {});
    log({ evento: `webhook.${event}`, folio: payload?.folio, status: res.status, ms: Date.now() - t0 });
    return res.ok;
  } catch {
    log({ evento: `webhook.${event}`, folio: payload?.folio, status: 0, ms: Date.now() - t0 });
    return false;
  }
}

/** Solo pruebas: olvida la estructura guardada y las alertas enviadas. */
export function __resetKommo() {
  cache = null;
  enCurso = null;
  lastAlert.clear();
}

/** Solo pruebas: hace que la estructura guardada parezca `ms` milisegundos más vieja. @param {number} ms */
export function __envejecerEstructura(ms) {
  if (cache) cache.hasta -= ms;
}
