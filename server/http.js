/**
 * Utilidades HTTP compartidas por las funciones de Vercel de `api/` (cotización y agenda).
 * CAMBIO-COTIZAR §3.7. JavaScript ESM plano, sin dependencias: corre igual en Vercel (Node 24),
 * en `node --test` y en el middleware de `astro dev`.
 *
 * Contrato (no cambiar sin actualizar la especificación):
 *   json(body, status = 200, headers = {})          → Response JSON con no-store y noindex
 *   readJson(request, { limit = 16384 })             → { ok: true, data } | { ok: false, status: 400|413|415 }
 *   sameOrigin(request)                              → boolean (sin Origin → false)
 *   clientIp(request)                                → string
 *   throttle(key, { max, windowMs })                 → { ok, retryAfter }
 *   clean(s, max)                                    → string sin caracteres de control, con trim
 *   envName()                                        → 'production'|'preview'|'development'|'local'
 */

/** Cabeceras comunes de toda respuesta de la API. */
const BASE_HEADERS = Object.freeze({
  'content-type': 'application/json; charset=utf-8',
  'cache-control': 'no-store',
  'x-robots-tag': 'noindex',
});

/**
 * Respuesta JSON. `body` null/undefined → cuerpo vacío (con las mismas cabeceras).
 * @param {unknown} body
 * @param {number} [status]
 * @param {Record<string, string>} [headers]
 * @returns {Response}
 */
export function json(body, status = 200, headers = {}) {
  const h = new Headers(BASE_HEADERS);
  for (const [k, v] of Object.entries(headers ?? {})) {
    if (v !== undefined && v !== null) h.set(k, String(v));
  }
  return new Response(body === undefined || body === null ? null : JSON.stringify(body), { status, headers: h });
}

/**
 * Lee el cuerpo como JSON con tope de tamaño.
 * Orden: Content-Type (415) → Content-Length declarado (413) → lectura con tope (413) → JSON.parse (400).
 * @param {Request} request
 * @param {{ limit?: number }} [opts]
 * @returns {Promise<{ ok: true, data: unknown } | { ok: false, status: 400 | 413 | 415 }>}
 */
export async function readJson(request, { limit = 16384 } = {}) {
  const type = (request.headers.get('content-type') ?? '').toLowerCase();
  const mime = type.split(';')[0].trim();
  if (mime !== 'application/json' && !/^application\/[a-z0-9.+-]*\+json$/.test(mime)) {
    return { ok: false, status: 415 };
  }
  const declared = Number(request.headers.get('content-length'));
  if (Number.isFinite(declared) && declared > limit) return { ok: false, status: 413 };

  if (!request.body) return { ok: false, status: 400 };
  const reader = request.body.getReader();
  /** @type {Uint8Array[]} */
  const chunks = [];
  let size = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > limit) {
        await reader.cancel().catch(() => {});
        return { ok: false, status: 413 };
      }
      chunks.push(value);
    }
  } catch {
    return { ok: false, status: 400 };
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const c of chunks) {
    bytes.set(c, offset);
    offset += c.byteLength;
  }
  const text = new TextDecoder('utf-8').decode(bytes);
  if (!text.trim()) return { ok: false, status: 400 };
  try {
    return { ok: true, data: JSON.parse(text) };
  } catch {
    return { ok: false, status: 400 };
  }
}

/**
 * Primer valor de una cabecera que puede venir como lista separada por comas.
 * @param {string | null} v
 */
function first(v) {
  return (v ?? '').split(',')[0].trim();
}

/**
 * La petición viene del mismo sitio: el host de `Origin` es igual a `x-forwarded-host` ?? `host`
 * (y, si ninguna existe, al host de la URL de la petición). Sin `Origin` → false.
 * Sirve igual en ingeniak.mx, en las URL de Preview y en 127.0.0.1:4321.
 * @param {Request} request
 * @returns {boolean}
 */
export function sameOrigin(request) {
  const origin = request.headers.get('origin');
  if (!origin || origin === 'null') return false;
  let originHost;
  try {
    originHost = new URL(origin).host.toLowerCase();
  } catch {
    return false;
  }
  let expected = first(request.headers.get('x-forwarded-host')) || first(request.headers.get('host'));
  if (!expected) {
    try {
      expected = new URL(request.url).host;
    } catch {
      return false;
    }
  }
  return originHost === expected.toLowerCase();
}

/**
 * IP del visitante: primer valor de `x-forwarded-for` ?? `x-real-ip` ?? 'desconocida'.
 * Solo para el límite de envíos; nunca se registra en logs.
 * @param {Request} request
 * @returns {string}
 */
export function clientIp(request) {
  return first(request.headers.get('x-forwarded-for')) || first(request.headers.get('x-real-ip')) || 'desconocida';
}

/** @type {Map<string, { start: number, count: number, windowMs: number }>} */
const hits = new Map();
let lastSweep = 0;

/** Borra las ventanas vencidas (como mucho una vez por minuto, o si el mapa crece). */
function sweep(now) {
  if (now - lastSweep < 60_000 && hits.size < 2000) return;
  lastSweep = now;
  for (const [k, v] of hits) if (now - v.start >= v.windowMs) hits.delete(k);
  if (hits.size >= 5000) hits.clear();
}

/**
 * Límite de peticiones en memoria por instancia (esfuerzo razonable, no garantía).
 * Ventana fija que empieza con la primera petición de la clave.
 * Usa claves con prefijo propio (`cotizar:<ip>`, `agenda:<ip>`) para no mezclar límites.
 * @param {string} key
 * @param {{ max: number, windowMs: number }} opts
 * @returns {{ ok: boolean, retryAfter: number }} retryAfter en segundos (0 si ok)
 */
export function throttle(key, { max, windowMs }) {
  const now = Date.now();
  sweep(now);
  let entry = hits.get(key);
  if (!entry || now - entry.start >= entry.windowMs) {
    entry = { start: now, count: 0, windowMs };
    hits.set(key, entry);
  }
  if (entry.count >= max) {
    return { ok: false, retryAfter: Math.max(1, Math.ceil((entry.start + entry.windowMs - now) / 1000)) };
  }
  entry.count += 1;
  return { ok: true, retryAfter: 0 };
}

// Controles C0/C1 (salvo \t \n \r, que se tratan aparte) y marcas invisibles de formato y dirección.
const CONTROL = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F​-‏‪-‮⁠-⁩﻿]/g;

/**
 * Texto de una línea: sin caracteres de control (tabuladores y saltos → espacio), con `trim`.
 * Con `max`, recorta a esa longitud sin partir un carácter.
 * Con `{ lines: true }` conserva los saltos de línea (`\n`) y colapsa los renglones vacíos repetidos.
 * Cualquier valor que no sea texto → ''.
 * @param {unknown} s
 * @param {number} [max]
 * @param {{ lines?: boolean }} [opts]
 * @returns {string}
 */
export function clean(s, max = Infinity, { lines = false } = {}) {
  if (typeof s !== 'string') return '';
  let out = s.replace(CONTROL, '').replace(/\r\n?/g, '\n');
  out = lines
    ? out.replace(/\t/g, ' ').replace(/[  ]+\n/g, '\n').replace(/\n{3,}/g, '\n\n')
    : out.replace(/[\t\n]/g, ' ');
  out = out.trim();
  if (out.length > max) {
    let cut = '';
    for (const ch of out) {
      if (cut.length + ch.length > max) break;
      cut += ch;
    }
    out = cut.trim();
  }
  return out;
}

/**
 * Entorno de ejecución. `VERCEL_ENV` solo existe en Vercel; en `astro dev` y en pruebas → 'local'.
 * @returns {'production' | 'preview' | 'development' | 'local'}
 */
export function envName() {
  const v = process.env.VERCEL_ENV;
  return v === 'production' || v === 'preview' || v === 'development' ? v : 'local';
}

/** Solo pruebas: reinicia el estado en memoria del límite de peticiones. */
export function __resetHttp() {
  hits.clear();
  lastSweep = 0;
}
