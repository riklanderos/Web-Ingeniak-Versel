#!/usr/bin/env node
// scripts/kommo-configurar.mjs — deja lista la cuenta de Kommo de Ingeniak con la estructura aprobada el 2026-10-20:
// 3 embudos con sus etapas, 15 campos del lead, 10 etiquetas y 6 plantillas de respuesta.
//
// Lo corre el CLIENTE en su propia Terminal (guía: materiales/v2/landings/kommo-setup.md).
//   node scripts/kommo-configurar.mjs --prueba    → solo lee y muestra el plan (lo que hace si no pones nada)
//   node scripts/kommo-configurar.mjs --aplicar   → crea solo lo que falta; nunca borra ni renombra
//
// Nombres, opciones y colores: shared/kommo-esquema.js (única fuente; el sitio busca los mismos nombres).
// Los nombres se comparan con normalizar() de ese archivo, igual que el sitio: «1–10» = «1-10», «industria» = «Industria».
// Seguridad: el token se pide con una pregunta oculta, vive solo en memoria, nunca se imprime, nunca se escribe en
// disco y se tapa en cualquier texto que salga a la pantalla. KOMMO_TOKEN existe solo para las pruebas automáticas
// (no se documenta al cliente: escrito en una Terminal queda en el historial, p. ej. ~/.zsh_history).
// API: Kommo v4 (developers.kommo.com, consultada el 2026-10-20). Fuentes en kommo-setup.md §10.
// Sin dependencias: Node 18 o más reciente (usa fetch global). Probado con Node 24.

import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, relative, resolve } from 'node:path';
import { createInterface } from 'node:readline';
import { createInterface as createInterfacePromesas } from 'node:readline/promises';
import { setTimeout as esperar } from 'node:timers/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { CAMPOS, EMBUDOS, ETIQUETAS, PLANTILLAS_SISTEMA, TIPOS_CON_OPCIONES, mismoNombre, validarEsquema } from '../shared/kommo-esquema.js';

const RAIZ = fileURLToPath(new URL('../', import.meta.url));
const SALIDA_POR_DEFECTO = resolve(RAIZ, 'materiales/v2/landings/kommo-ids.json');

const RITMO_MINIMO_MS = 200; // ≤ 5 peticiones por segundo (Kommo admite 7 por segundo)
const ESPERA_BASE_MS = 1000; // primer reintento tras un 429 o un error temporal
const ESPERA_MAXIMA_MS = 60_000; // si Kommo pide esperar más, el script se detiene y lo explica
const REINTENTOS_429 = 4;
const REINTENTOS_LECTURA = 2; // solo para consultas (GET); un POST nunca se repite solo
const TIEMPO_LIMITE_MS = 20_000;
const PAGINAS_MAXIMAS = 40;

// ── Salida a pantalla (todo pasa por aquí y se tapa el token) ────────────────────────────────────────────────

const secretos = new Set();
const OCULTO = '[token oculto]';
const TRAMO_MINIMO = 12; // un pedazo del token de 12 o más caracteres seguidos también se tapa
const PATRON_JWT = /eyJ[\w-]+(?:\.[\w-]*){0,2}/g; // los tokens de larga duración de Kommo son JWT
const tramosPorSecreto = new Map();

/** Quita de un texto el token (y cualquier «Bearer …») antes de mostrarlo. */
export function tapar(texto) {
  return taparCon(texto, secretos);
}

/**
 * Tapa en `texto` cada secreto de `lista`: el valor completo, cualquier pedazo suyo de 12 o más caracteres (por si
 * alguien lo recortó antes), cualquier JWT y cualquier «Bearer …». Se aplica al texto COMPLETO, antes de recortar.
 */
export function taparCon(texto, lista) {
  let s = String(texto ?? '');
  for (const x of lista) {
    if (!x || x.length < 4) continue;
    s = s.split(x).join(OCULTO);
    if (x.length >= TRAMO_MINIMO) s = taparTramos(s, x);
  }
  return s.replace(PATRON_JWT, OCULTO).replace(/(bearer\s+)(?!\[token oculto\])[^\s"'<>,;]+/gi, `$1${OCULTO}`);
}

function taparTramos(s, secreto) {
  if (s.length < TRAMO_MINIMO) return s;
  let tramos = tramosPorSecreto.get(secreto);
  if (!tramos) {
    tramos = new Set();
    for (let i = 0; i + TRAMO_MINIMO <= secreto.length; i++) tramos.add(secreto.slice(i, i + TRAMO_MINIMO));
    tramosPorSecreto.set(secreto, tramos);
  }
  let res = '';
  let i = 0;
  while (i < s.length) {
    if (i + TRAMO_MINIMO <= s.length && tramos.has(s.slice(i, i + TRAMO_MINIMO))) {
      let fin = i + TRAMO_MINIMO;
      while (fin < s.length && secreto.includes(s.slice(i, fin + 1))) fin++;
      res += OCULTO;
      i = fin;
    } else {
      res += s[i];
      i++;
    }
  }
  return res;
}

/** Tapa los secretos en todos los textos de una respuesta de error ya leída (antes de recortar nada). */
function taparDatos(v, profundidad = 0) {
  if (typeof v === 'string') return tapar(v);
  if (v === null || typeof v !== 'object') return v;
  if (profundidad > 20) return null;
  if (Array.isArray(v)) return v.map((x) => taparDatos(x, profundidad + 1));
  return Object.fromEntries(Object.entries(v).map(([k, x]) => [tapar(k), taparDatos(x, profundidad + 1)]));
}
const out = (s = '') => process.stdout.write(`${tapar(s)}\n`);
const err = (s = '') => process.stderr.write(`${tapar(s)}\n`);

// ── Opciones de la línea de comandos ─────────────────────────────────────────────────────────────────────────

export const AYUDA = `
Ingeniak · configuración de Kommo

Completa en tu cuenta de Kommo la estructura del plan de reestructura: los embudos
«Ventas» y «Power Session» con sus etapas, 15 campos del lead, 10 etiquetas y
6 plantillas de respuesta. Córrelo DESPUÉS de la reestructura (kommo-plan-reestructura.md):
si el P1 todavía no se llama «Ventas», crearía un embudo «Ventas» aparte.

Uso (desde la carpeta del proyecto):
  node scripts/kommo-configurar.mjs --inventario  Lista TODO lo que ya tiene tu cuenta (embudos con sus etapas y
                                                campos del lead con sus opciones). Solo lee; no cambia nada.
  node scripts/kommo-configurar.mjs --prueba    Revisa tu cuenta y te dice qué crearía. No cambia nada.
                                                (Es lo que hace si no pones ninguna opción.)
  node scripts/kommo-configurar.mjs --aplicar   Crea solo lo que falta. Nunca borra ni renombra nada.
                                                Puedes correrlo las veces que quieras: no duplica.

Opciones:
  --sin-plantillas   No crea las plantillas de respuesta.
  --salida=RUTA      Dónde guardar los IDs (por defecto materiales/v2/landings/kommo-ids.json).
  --ayuda            Muestra este texto.

Qué te va a pedir:
  • Subdominio: lo que va antes de .kommo.com (por ejemplo «ingeniak»).
    También acepta «ingeniak.kommo.com» o la dirección completa del navegador.
  • Token de larga duración: lo pegas cuando te lo pida y NO se ve en pantalla. Solo vive en la
    memoria mientras corre el script; no se guarda en ningún archivo.
    No lo escribas dentro del comando: lo que escribes en la Terminal queda guardado en su historial.

Guía paso a paso: materiales/v2/landings/kommo-setup.md
`;

/** Lee las opciones. Nunca repite un argumento largo (podría ser el token pegado por error). */
export function leerOpciones(argv) {
  const op = { modo: 'prueba', plantillas: true, ayuda: false, salida: SALIDA_POR_DEFECTO, error: null };
  const modos = new Set();
  for (const a of argv) {
    if (a === '--ayuda' || a === '-h' || a === '--help') op.ayuda = true;
    else if (a === '--prueba') modos.add('prueba');
    else if (a === '--aplicar') modos.add('aplicar');
    else if (a === '--inventario') modos.add('inventario');
    else if (a === '--sin-plantillas') op.plantillas = false;
    else if (a.startsWith('--salida=') && a.length > 9) op.salida = resolve(process.cwd(), a.slice(9));
    else op.error = a.startsWith('--') && a.length <= 40 ? `No reconozco la opción «${a}».` : 'No reconozco una de las opciones (no la repito aquí por si era el token).';
  }
  if (modos.size > 1) op.error = 'Usa solo un modo, no los dos (o tres) a la vez: --inventario, --prueba o --aplicar.';
  else if (modos.size === 1) op.modo = [...modos][0];
  return op;
}

// ── Datos de acceso ──────────────────────────────────────────────────────────────────────────────────────────

/** «Ingeniak», «ingeniak.kommo.com» o «https://ingeniak.kommo.com/leads/» → «ingeniak». null si no es válido. */
export function normalizarSubdominio(valor) {
  let s = String(valor ?? '').trim().toLowerCase();
  s = s.replace(/^[a-z][a-z0-9+.-]*:\/\//, '');
  s = s.split(/[/?#]/)[0].replace(/:\d+$/, '').replace(/\.+$/, '');
  s = s.replace(/\.kommo\.com$/, '');
  if (!/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(s) || s === 'www') return null;
  return s;
}

/** Limpia el token pegado (espacios, comillas, «Bearer »). Nunca devuelve el valor en un mensaje. */
export function limpiarToken(valor) {
  let t = String(valor ?? '').trim();
  t = t.replace(/^bearer\s+/i, '').trim().replace(/^["']+|["']+$/g, '');
  if (!t) return { ok: false, motivo: 'Falta el token.' };
  if (!/^[\x21-\x7e]+$/.test(t)) return { ok: false, motivo: 'El token tiene espacios o caracteres raros. Cópialo otra vez desde Kommo.' };
  if (t.length < 8) return { ok: false, motivo: 'El token es demasiado corto. Cópialo completo desde Kommo.' };
  return { ok: true, token: t };
}

/**
 * URL base de la API. `KOMMO_BASE_URL` solo sirve para el simulador de las pruebas y solo se acepta en esta
 * computadora (127.0.0.1, localhost o ::1): así el token nunca puede salir hacia otro servidor por error.
 */
export function urlBase(subdominio, baseEnv) {
  if (!baseEnv) return { ok: true, base: `https://${subdominio}.kommo.com/api/v4`, local: false };
  let u;
  try {
    u = new URL(baseEnv);
  } catch {
    return { ok: false };
  }
  const host = u.hostname.replace(/^\[|\]$/g, '');
  if (!/^https?:$/.test(u.protocol) || !['127.0.0.1', 'localhost', '::1'].includes(host)) return { ok: false };
  const base = `${u.origin}${u.pathname}`.replace(/\/+$/, '');
  return { ok: true, base: /\/api\/v4$/.test(base) ? base : `${base}/api/v4`, local: true };
}

/** Preguntas en la Terminal. El token se pide sin eco (modo raw); en una tubería se lee una línea sin mostrarla. */
function crearEntrada() {
  if (process.stdin.isTTY) {
    return {
      async visible(texto) {
        const rl = createInterfacePromesas({ input: process.stdin, output: process.stdout });
        try {
          return await rl.question(texto);
        } finally {
          rl.close();
        }
      },
      oculto: preguntarOcultoTTY,
      cerrar() {},
    };
  }
  let rl = null;
  let it = null;
  const siguiente = async (texto) => {
    process.stdout.write(texto);
    if (!rl) {
      rl = createInterface({ input: process.stdin, terminal: false, crlfDelay: Infinity });
      it = rl[Symbol.asyncIterator]();
    }
    const r = await it.next();
    process.stdout.write('\n');
    return r.done ? '' : r.value;
  };
  return { visible: siguiente, oculto: siguiente, cerrar: () => rl?.close() };
}

/** Lee el token en la Terminal sin mostrar nada (ni asteriscos). Enter termina; Ctrl+C cancela. */
function preguntarOcultoTTY(texto) {
  return new Promise((listo) => {
    const stdin = process.stdin;
    const estabaRaw = stdin.isRaw;
    let valor = '';
    // Primero se apaga el eco de la terminal y luego se muestra la pregunta: así nada de lo que se pegue se ve.
    stdin.setRawMode(true);
    stdin.setEncoding('utf8');
    stdin.resume();
    process.stdout.write(texto);
    const terminar = (cancelado) => {
      stdin.setRawMode(Boolean(estabaRaw));
      stdin.pause();
      stdin.removeListener('data', alEscribir);
      process.stdout.write('\n');
      if (cancelado) {
        valor = '';
        process.stdout.write('Cancelado. No se cambió nada.\n');
        process.exit(130);
      }
      listo(valor);
    };
    function alEscribir(trozo) {
      // Quita secuencias de teclas especiales (flechas, pegado entre corchetes) para que no se cuelen en el token.
      const limpio = String(trozo).replace(/\u001b\[[0-9;?]*[A-Za-z~]/g, '').replace(/\u001bO./g, '');
      for (const ch of limpio) {
        if (ch === '\r' || ch === '\n') return terminar(false);
        if (ch === '\u0003') return terminar(true); // Ctrl+C
        if (ch === '\u0004') {
          if (!valor) return terminar(false); // Ctrl+D
          continue;
        }
        if (ch === '\u007f' || ch === '\b') {
          valor = valor.slice(0, -1);
          continue;
        }
        if (ch === '\u0015') {
          valor = ''; // Ctrl+U borra todo
          continue;
        }
        if (ch < ' ') continue;
        valor += ch;
      }
    }
    stdin.on('data', alEscribir);
  });
}

// ── Cliente de la API de Kommo ───────────────────────────────────────────────────────────────────────────────

export class ErrorKommo extends Error {
  /** @param {string} mensaje @param {{status?: number, fatal?: boolean, detalle?: string}} [o] */
  constructor(mensaje, { status = 0, fatal = false, detalle = '' } = {}) {
    super(mensaje);
    this.status = status;
    this.fatal = fatal;
    this.detalle = detalle;
  }
}

/** Mensaje en español para cada código de Kommo (developers.kommo.com/docs/http-codes). */
export function mensajeHttp(status, { paso = '' } = {}) {
  if (status >= 300 && status < 400) return `Kommo respondió con una redirección (${status}). Casi siempre es porque el subdominio está mal escrito: es lo que va antes de .kommo.com.`;
  switch (status) {
    case 400:
      return 'Kommo rechazó los datos (400).';
    case 401:
      return 'El token no es válido o ya venció (401). Genera uno nuevo en Kommo → Ajustes → Integraciones → tu integración → Llaves y permisos → «Generar token de larga duración», y vuelve a correr el script.';
    case 402:
      return 'Tu cuenta de Kommo no tiene un plan activo o terminó la prueba (402). Revisa el pago de Kommo y vuelve a intentarlo.';
    case 403:
      return 'Kommo negó el permiso (403). El token debe generarlo un administrador y la integración debe tener marcados todos los permisos (Ajustes → Integraciones → tu integración). Si corriste el script muchas veces seguidas, Kommo pudo bloquear tu conexión un rato: espera unos minutos.';
    case 404:
      return paso === 'cuenta'
        ? 'Kommo no encontró esa cuenta (404). Revisa el subdominio: es lo que va antes de .kommo.com en tu navegador.'
        : 'Kommo no tiene esta función en tu cuenta (404).';
    case 422:
      return 'Kommo no pudo procesar la petición (422). Puede ser un límite de la cuenta (por ejemplo, 50 embudos o el máximo de plantillas).';
    case 429:
      return 'Kommo pidió bajar el ritmo (429).';
    default:
      if (status >= 500) return `Kommo tuvo un error de su lado (${status}). Vuelve a correr el script en unos minutos: lo que ya se creó no se duplica.`;
      return `Kommo respondió con un código inesperado (${status}).`;
  }
}

function mensajeRed(error, host) {
  const codigo = error?.cause?.code ?? error?.code ?? '';
  if (codigo === 'ENOTFOUND') return `No encontré la cuenta «${host}». Revisa el subdominio: es lo que va antes de .kommo.com.`;
  if (error?.name === 'TimeoutError' || error?.name === 'AbortError') return 'Kommo tardó demasiado en responder. Revisa tu internet y vuelve a intentarlo.';
  return `No pude conectarme con Kommo (${codigo || 'sin conexión'}). Revisa tu internet y vuelve a intentarlo.`;
}

/** Extrae el detalle útil de un error de validación de Kommo (validation-errors[].errors[].path/detail). */
function detalleDe(data) {
  if (!data || typeof data !== 'object') return '';
  const lista = [];
  const grupos = Array.isArray(data['validation-errors']) ? data['validation-errors'] : [];
  for (const grupo of grupos) for (const e of Array.isArray(grupo?.errors) ? grupo.errors : []) lista.push(tapar(`${e?.path ?? ''}: ${e?.detail ?? e?.code ?? ''}`.trim()).slice(0, 200));
  if (lista.length) return lista.slice(0, 4).join(' · ');
  // Primero se tapa y DESPUÉS se recorta: un token largo cortado a la mitad ya no se reconocería.
  return tapar(String(data.detail ?? data.title ?? data._texto ?? '')).slice(0, 200);
}

/** Segundos que Kommo pide esperar: cabecera Retry-After o `retry_after` del cuerpo (el ejemplo oficial trae 300). */
function segundosPedidos(res, data) {
  const crudo = res.headers.get('retry-after');
  const h = crudo == null || crudo.trim() === '' ? NaN : Number(crudo);
  if (Number.isFinite(h) && h >= 0) return h;
  const b = data?.retry_after == null ? NaN : Number(data.retry_after);
  return Number.isFinite(b) && b >= 0 ? b : null;
}

/**
 * Lee el cuerpo. En una respuesta de error (que puede repetir el token) se tapan los secretos en el texto
 * completo antes de guardar o recortar nada; las respuestas correctas no se tocan (son los nombres que se comparan).
 */
async function leerCuerpo(res) {
  const txt = await res.text().catch(() => '');
  if (!txt) return null;
  const error = !res.ok;
  try {
    const data = JSON.parse(txt);
    return error ? taparDatos(data) : data;
  } catch {
    return { _texto: tapar(txt).slice(0, 300) };
  }
}

export class ClienteKommo {
  #token;
  #ultimo = 0;

  /** @param {{base: string, token: string, ritmoMs?: number, esperaMs?: number, soloLectura?: boolean, host?: string}} o */
  constructor({ base, token, ritmoMs = RITMO_MINIMO_MS, esperaMs = ESPERA_BASE_MS, soloLectura = true, host = '' }) {
    this.base = base;
    this.#token = token;
    this.ritmoMs = ritmoMs;
    this.esperaMs = esperaMs;
    this.soloLectura = soloLectura;
    this.host = host;
    this.seguidos403 = 0;
  }

  async #turno() {
    const listo = this.#ultimo + this.ritmoMs;
    const ahora = Date.now();
    if (listo > ahora) await esperar(listo - ahora);
    this.#ultimo = Date.now();
  }

  /** fetch con el token, sin seguir redirecciones (el token nunca viaja a otra dirección) y con tiempo límite. */
  async #enviar(metodo, ruta, cuerpo) {
    await this.#turno();
    return fetch(`${this.base}${ruta}`, {
      method: metodo,
      headers: {
        authorization: `Bearer ${this.#token}`,
        accept: 'application/json',
        ...(cuerpo === undefined ? {} : { 'content-type': 'application/json' }),
      },
      body: cuerpo === undefined ? undefined : JSON.stringify(cuerpo),
      redirect: 'manual',
      signal: AbortSignal.timeout(TIEMPO_LIMITE_MS),
    });
  }

  /**
   * Tras 3 respuestas 403 seguidas se comprueba con GET /account si Kommo bloqueó toda la conexión (lo hace cuando
   * se rebasa el límite varias veces). Si es así, seguir solo alarga el bloqueo: se detiene todo.
   */
  async #revisarBloqueo() {
    if (this.seguidos403 < 3) return;
    this.seguidos403 = 0;
    const r = await this.#enviar('GET', '/account').catch(() => null);
    await r?.body?.cancel?.().catch(() => {});
    if (r?.status === 403) {
      throw new ErrorKommo(
        'Kommo está rechazando todas las peticiones desde tu conexión (403). Suele ser un bloqueo temporal por exceso de peticiones: espera unos minutos y vuelve a correr el mismo comando.',
        { status: 403, fatal: true },
      );
    }
  }

  /** Una petición a Kommo con ritmo, reintentos y errores en español. Devuelve { status, data }. */
  async pedir(metodo, ruta, cuerpo, { paso = '' } = {}) {
    const lectura = metodo === 'GET';
    if (!lectura && this.soloLectura) throw new ErrorKommo('Modo prueba: no se envía ningún cambio a Kommo.', { fatal: true });
    let intento429 = 0;
    let intentoOtro = 0;
    for (;;) {
      let res;
      try {
        res = await this.#enviar(metodo, ruta, cuerpo);
      } catch (e) {
        const codigo = e?.cause?.code ?? '';
        if (lectura && codigo !== 'ENOTFOUND' && intentoOtro < REINTENTOS_LECTURA) {
          intentoOtro++;
          await esperar(this.esperaMs * 2 ** intentoOtro);
          continue;
        }
        throw new ErrorKommo(mensajeRed(e, this.host), { status: 0, fatal: paso === 'cuenta' });
      }
      const status = res.status;
      const data = await leerCuerpo(res);
      this.seguidos403 = status === 403 ? this.seguidos403 + 1 : 0;
      if (status >= 200 && status < 300) return { status, data };
      if (status === 429) {
        const pide = segundosPedidos(res, data);
        const espera = Math.max(pide == null ? 0 : pide * 1000, this.esperaMs * 2 ** intento429);
        if (intento429 >= REINTENTOS_429 || espera > ESPERA_MAXIMA_MS) {
          const minutos = Math.max(1, Math.ceil((pide == null ? espera / 1000 : pide) / 60));
          throw new ErrorKommo(
            `Kommo pidió esperar unos ${minutos} min antes de seguir (límite de peticiones, 429). Espera ese tiempo y vuelve a correr el mismo comando: lo que ya se creó no se duplica.`,
            { status: 429, fatal: true },
          );
        }
        intento429++;
        out(`    … Kommo pidió bajar el ritmo (429). Espero ${Math.max(1, Math.ceil(espera / 1000))} s y reintento.`);
        await esperar(espera);
        continue;
      }
      if (status >= 500 && lectura && intentoOtro < REINTENTOS_LECTURA) {
        intentoOtro++;
        await esperar(this.esperaMs * 2 ** intentoOtro);
        continue;
      }
      if (status === 403 && paso !== 'cuenta') await this.#revisarBloqueo();
      // 401 y 402 afectan a todo (y en la cuenta, cualquier error): se detiene. Lo demás se reporta por elemento.
      const fatal = status === 401 || status === 402 || paso === 'cuenta';
      throw new ErrorKommo(mensajeHttp(status, { paso }), { status, fatal, detalle: detalleDe(data) });
    }
  }

  /** GET paginado (?limit=&page=) hasta que no haya `_links.next`. 204 = lista vacía. */
  async listar(ruta, clave, { limite = 250 } = {}) {
    const todos = [];
    for (let pagina = 1; pagina <= PAGINAS_MAXIMAS; pagina++) {
      const sep = ruta.includes('?') ? '&' : '?';
      const { status, data } = await this.pedir('GET', `${ruta}${sep}limit=${limite}&page=${pagina}`);
      if (status === 204 || !data) break;
      const items = data?._embedded?.[clave] ?? [];
      todos.push(...items);
      if (!items.length || !data?._links?.next) break;
    }
    return todos;
  }
}

// ── Reporte ──────────────────────────────────────────────────────────────────────────────────────────────────

const ICONO = { creado: '✅', existia: '↺', opciones: '➕', fallo: '❌', crearia: '+', agregaria: '~', omitido: '·', aviso: '⚠' };

function rotulo(estado, modo) {
  const prueba = modo === 'prueba';
  return {
    creado: 'Creado',
    existia: prueba ? 'Ya existe' : 'Ya existía',
    opciones: 'Opciones agregadas',
    fallo: prueba ? 'Problema' : 'Falló',
    crearia: 'Se crearía',
    agregaria: 'Se agregarían opciones',
    omitido: 'Omitido',
    aviso: 'Revisa',
  }[estado];
}

class Reporte {
  constructor(modo) {
    this.modo = modo;
    /** @type {{seccion: string, estado: string, tipo: string, nombre: string, id: number|null, detalle: string, nivel: number, extra?: string}[]} */
    this.filas = [];
  }
  agregar(seccion, estado, tipo, nombre, { id = null, detalle = '', nivel = 0, extra = '' } = {}) {
    this.filas.push({ seccion, estado, tipo, nombre, id, detalle, nivel, extra });
  }
  fallo(seccion, tipo, nombre, error, { id = null, nivel = 0, queHacer = '' } = {}) {
    const msg = error instanceof Error ? error.message : String(error);
    const det = error instanceof ErrorKommo && error.detalle ? ` (${error.detalle})` : '';
    this.agregar(seccion, 'fallo', tipo, nombre, { id, nivel, detalle: `${msg}${det}${queHacer ? ` ${queHacer}` : ''}` });
  }
  total(estado) {
    return this.filas.filter((f) => f.estado === estado).length;
  }
}

// ── Pasos ────────────────────────────────────────────────────────────────────────────────────────────────────

// Los nombres se buscan como los busca el sitio (mismoNombre → normalizar): si en Kommo ya existe «1-10», no se
// crea «1–10». Cuando lo encontrado no está escrito exacto, el reporte lo dice con «existe escrito «…»».
const escritoDistinto = (actual, nombre, genero = 'o') => {
  const v = String(actual ?? '').trim();
  return v === nombre ? '' : `existe escrit${genero} «${v}»`;
};
const externalId = (nombre) =>
  `ingeniak-${nombre
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')}`;

async function pasoCuenta(ctx) {
  const { api, ids, subdominio, rep } = ctx;
  // with=datetime_settings trae la zona horaria de la cuenta (developers.kommo.com/reference/account-parameters).
  const { data } = await api.pedir('GET', '/account?with=datetime_settings', undefined, { paso: 'cuenta' });
  if (!data?.id) throw new ErrorKommo('Kommo respondió, pero no con los datos de una cuenta. Revisa el subdominio.', { fatal: true });
  ids.cuenta = { id: data.id, nombre: data.name ?? '', subdominio: data.subdomain ?? subdominio };
  out(`  ✓ Conectado a «${data.name}» (${data.subdomain ?? subdominio}.kommo.com · cuenta ${data.id}).`);
  if (data.subdomain && data.subdomain !== subdominio) out(`  ⚠ Kommo dice que el subdominio de esta cuenta es «${data.subdomain}». Usa ese en Vercel.`);

  // La «Fecha de la sesión» de los WhatsApp automáticos se muestra con la zona horaria de la cuenta.
  const zona = data._embedded?.datetime_settings?.timezone ?? data.datetime_settings?.timezone ?? null;
  if (typeof zona !== 'string' || !zona.trim()) return;
  if (esHoraDelCentro(zona)) {
    out(`  ✓ Zona horaria de la cuenta: ${zona} (hora del centro de México).`);
    return;
  }
  rep.agregar('Cuenta', 'aviso', 'Zona horaria', zona, {
    detalle:
      'no es la hora del centro de México. Kommo muestra la «Fecha de la sesión» de los WhatsApp con esta zona: cámbiala en Kommo → Ajustes → Configuración general → Zona horaria → Ciudad de México (guía, sección 1).',
  });
}

/** ¿La zona horaria da la misma hora que la Ciudad de México en invierno y en verano? */
export function esHoraDelCentro(zona) {
  const desfase = (tz, t) => new Intl.DateTimeFormat('en-US', { timeZone: tz, timeZoneName: 'longOffset' }).formatToParts(new Date(t)).find((p) => p.type === 'timeZoneName')?.value;
  try {
    const anio = new Date().getUTCFullYear();
    return [Date.UTC(anio, 0, 15, 18), Date.UTC(anio, 6, 15, 18)].every((t) => desfase(zona.trim(), t) === desfase('America/Mexico_City', t));
  } catch {
    return false; // zona que no se reconoce: se pide revisarla
  }
}

async function pasoEmbudos(ctx) {
  const { api, rep, ids, op } = ctx;
  const S = 'Embudos';
  let existentes;
  try {
    const { data } = await api.pedir('GET', '/leads/pipelines');
    existentes = data?._embedded?.pipelines ?? [];
  } catch (e) {
    if (e.fatal) throw e;
    rep.fallo(S, 'Lista', 'embudos de la cuenta', e);
    return;
  }
  const claves = Object.keys(EMBUDOS);
  let sortSiguiente = Math.max(0, ...existentes.map((p) => Number(p.sort) || 0)) + 1;

  for (const clave of claves) {
    const def = EMBUDOS[clave];
    const mismos = existentes.filter((p) => mismoNombre(p.name, def.nombre));
    // Como el sitio: los embudos archivados no cuentan, y entre varios con el mismo nombre gana el primero.
    const activos = mismos.filter((p) => !p.is_archive);
    const actual = activos[0] ?? null;
    const archivado = actual ? null : mismos.find((p) => p.is_archive) ?? null;
    const reg = (ids.embudos[clave] = { id: actual?.id ?? null, nombre: def.nombre, etapas: {} });
    for (const e of def.etapas) reg.etapas[e.clave] = { id: null, nombre: e.nombre };

    if (archivado) {
      // No se le agregan etapas ni se crea otro con el mismo nombre; sus IDs no se guardan (el sitio no lo usa).
      rep.fallo(S, 'Embudo', def.nombre, `Está archivado en Kommo${escritoDistinto(archivado.name, def.nombre) ? ` (escrito «${String(archivado.name).trim()}»)` : ''} y el sitio no usa embudos archivados.`, {
        queHacer: 'Desarchívalo en Kommo y vuelve a correr el script. No creé otro con el mismo nombre.',
      });
      continue;
    }

    if (!actual) {
      if (op.modo === 'prueba') {
        rep.agregar(S, 'crearia', 'Embudo', def.nombre, { detalle: `con ${def.etapas.length} etapas: ${def.etapas.map((e) => e.nombre).join(', ')}` });
        continue;
      }
      try {
        const cuerpo = [
          {
            name: def.nombre,
            sort: sortSiguiente++,
            is_main: false, // nunca cambia el embudo principal de la cuenta
            is_unsorted_on: false, // las solicitudes del sitio entran directo a la primera etapa
            _embedded: { statuses: def.etapas.map((e, i) => ({ name: e.nombre, sort: (i + 1) * 10, color: e.color })) },
          },
        ];
        const { data } = await api.pedir('POST', '/leads/pipelines', cuerpo);
        const creado = data?._embedded?.pipelines?.[0];
        if (!creado?.id) throw new ErrorKommo('Kommo no devolvió el embudo creado.');
        reg.id = creado.id;
        rep.agregar(S, 'creado', 'Embudo', def.nombre, { id: creado.id });
        const estados = creado._embedded?.statuses ?? [];
        for (const e of def.etapas) {
          const s = estados.find((x) => mismoNombre(x.name, e.nombre));
          if (s) {
            reg.etapas[e.clave].id = s.id;
            rep.agregar(S, 'creado', 'Etapa', e.nombre, { id: s.id, nivel: 1 });
          } else {
            rep.fallo(S, 'Etapa', e.nombre, 'Kommo no devolvió esta etapa.', { nivel: 1, queHacer: 'Revisa el embudo en Kommo y vuelve a correr --aplicar.' });
          }
        }
        etapasDeSistema(reg, estados);
      } catch (e) {
        if (e.fatal) throw e;
        rep.fallo(S, 'Embudo', def.nombre, e);
      }
      continue;
    }

    const notaVarios = activos.length > 1 ? `hay ${activos.length} embudos con este nombre; uso el primero, que es el que usa el sitio` : '';
    rep.agregar(S, 'existia', 'Embudo', def.nombre, { id: actual.id, detalle: [escritoDistinto(actual.name, def.nombre), notaVarios].filter(Boolean).join(' · ') });
    const enOrden = Array.isArray(actual._embedded?.statuses) ? actual._embedded.statuses : [];
    const estados = [...enOrden].sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0));
    let previo = estados.find((s) => s.type === 1)?.sort ?? 0; // «Incoming leads», si existe
    for (const e of def.etapas) {
      const s = enOrden.find((x) => mismoNombre(x.name, e.nombre)); // el primero en el orden de Kommo, como el sitio
      if (s) {
        reg.etapas[e.clave].id = s.id;
        rep.agregar(S, 'existia', 'Etapa', e.nombre, { id: s.id, nivel: 1, detalle: escritoDistinto(s.name, e.nombre, 'a') });
        previo = s.sort ?? previo;
        continue;
      }
      if (op.modo === 'prueba') {
        rep.agregar(S, 'crearia', 'Etapa', e.nombre, { nivel: 1, detalle: `en «${def.nombre}»` });
        continue;
      }
      try {
        const { data } = await api.pedir('POST', `/leads/pipelines/${actual.id}/statuses`, [{ name: e.nombre, sort: previo + 1, color: e.color }]);
        const nueva = data?._embedded?.statuses?.[0];
        if (!nueva?.id) throw new ErrorKommo('Kommo no devolvió la etapa creada.');
        reg.etapas[e.clave].id = nueva.id;
        previo = nueva.sort ?? previo + 1;
        rep.agregar(S, 'creado', 'Etapa', e.nombre, { id: nueva.id, nivel: 1 });
      } catch (err2) {
        if (err2.fatal) throw err2;
        rep.fallo(S, 'Etapa', e.nombre, err2, { nivel: 1 });
      }
    }
    etapasDeSistema(reg, estados);
  }
}

/** Ganado (142) y Perdido (143) los crea Kommo en cada embudo; se guardan sus IDs para las automatizaciones. */
function etapasDeSistema(reg, estados) {
  const ganado = estados.find((s) => s.id === 142);
  const perdido = estados.find((s) => s.id === 143);
  if (ganado) reg.etapas.ganado = { id: 142, nombre: ganado.name };
  if (perdido) reg.etapas.perdido = { id: 143, nombre: perdido.name };
}

async function pasoCampos(ctx) {
  const { api, rep, ids, op } = ctx;
  const S = 'Campos del lead';
  let existentes;
  try {
    existentes = await api.listar('/leads/custom_fields', 'custom_fields');
  } catch (e) {
    if (e.fatal) throw e;
    rep.fallo(S, 'Lista', 'campos de la cuenta', e);
    return;
  }

  for (const [clave, def] of Object.entries(CAMPOS)) {
    const conLista = TIPOS_CON_OPCIONES.includes(def.tipo);
    const mismos = existentes.filter((c) => mismoNombre(c.name, def.nombre));
    const actual = mismos.find((c) => c.type === def.tipo) ?? mismos[0];
    const reg = (ids.campos[clave] = { id: actual?.id ?? null, nombre: def.nombre, tipo: def.tipo });
    if (conLista) reg.opciones = Object.fromEntries(def.opciones.map((o) => [o, null]));
    // Opción de Kommo para cada opción del esquema: la primera que coincide con normalizar (la misma que usa el sitio).
    const opcionDe = (enums, o) => (Array.isArray(enums) ? enums : []).find((en) => mismoNombre(en?.value, o)) ?? null;
    const mapear = (enums) => {
      if (!conLista) return;
      for (const o of def.opciones) {
        const en = opcionDe(enums, o);
        if (en) reg.opciones[o] = en.id;
      }
    };

    if (!actual) {
      if (op.modo === 'prueba') {
        rep.agregar(S, 'crearia', 'Campo', def.nombre, { detalle: conLista ? `${def.tipo}, ${def.opciones.length} opciones` : def.tipo });
        continue;
      }
      try {
        const cuerpo = [{ name: def.nombre, type: def.tipo, ...(conLista ? { enums: def.opciones.map((v, i) => ({ value: v, sort: (i + 1) * 10 })) } : {}) }];
        const { data } = await api.pedir('POST', '/leads/custom_fields', cuerpo);
        const creado = data?._embedded?.custom_fields?.[0] ?? (data?.id ? data : null);
        if (!creado?.id) throw new ErrorKommo('Kommo no devolvió el campo creado.');
        reg.id = creado.id;
        mapear(creado.enums);
        if (conLista && Object.values(reg.opciones).some((v) => v == null)) {
          // Si la respuesta no trajo las opciones, se leen del campo para tener todos sus IDs.
          const { data: leido } = await api.pedir('GET', `/leads/custom_fields/${creado.id}`).catch(() => ({ data: null }));
          mapear(leido?.enums);
        }
        rep.agregar(S, 'creado', 'Campo', def.nombre, { id: creado.id, extra: textoOpciones(reg) });
      } catch (e) {
        if (e.fatal) throw e;
        rep.fallo(S, 'Campo', def.nombre, e);
      }
      continue;
    }

    if (mismos.length > 1) out(`  ⚠ Hay ${mismos.length} campos llamados «${def.nombre}»; uso el de id ${actual.id}.`);
    const notaEscrito = escritoDistinto(actual.name, def.nombre);
    if (actual.type !== def.tipo) {
      reg.id = null;
      rep.fallo(S, 'Campo', def.nombre, `Ya existe con otro tipo («${actual.type}»; la estructura pide «${def.tipo}»).`, {
        id: actual.id,
        queHacer: 'No lo cambio: en Kommo renómbralo (o bórralo si no tiene datos) y vuelve a correr --aplicar.',
      });
      continue;
    }
    if (!conLista) {
      rep.agregar(S, 'existia', 'Campo', def.nombre, { id: actual.id, detalle: notaEscrito });
      continue;
    }

    mapear(actual.enums);
    const enums = Array.isArray(actual.enums) ? actual.enums : [];
    const faltan = def.opciones.filter((o) => !opcionDe(enums, o));
    const sobran = enums.map((e) => String(e?.value ?? '').trim()).filter((v) => !def.opciones.some((o) => mismoNombre(v, o)));
    const distintas = def.opciones
      .map((o) => [o, opcionDe(enums, o)])
      .filter(([o, en]) => en && String(en.value ?? '').trim() !== o)
      .map(([o, en]) => `«${String(en.value ?? '').trim()}» (= «${o}»)`);
    const notaSobran = sobran.length ? `tiene ${sobran.length} opción(es) que no están en la estructura y se quedan como están: ${sobran.join(', ')}` : '';
    const notaDistintas = distintas.length ? `${distintas.length} opción(es) existen escritas distinto y el sitio las usa así: ${distintas.join(', ')}` : '';
    const notas = [notaEscrito, notaDistintas, notaSobran];
    if (!faltan.length) {
      rep.agregar(S, 'existia', 'Campo', def.nombre, { id: actual.id, detalle: notas.filter(Boolean).join(' · '), extra: textoOpciones(reg) });
      continue;
    }
    if (op.modo === 'prueba') {
      rep.agregar(S, 'agregaria', 'Campo', def.nombre, { id: actual.id, detalle: [`faltan ${faltan.length}: ${faltan.join(', ')}`, ...notas].filter(Boolean).join(' · ') });
      continue;
    }
    try {
      // Se relee el campo justo antes: Kommo borra las opciones que no se manden con su id.
      const { data: fresco } = await api.pedir('GET', `/leads/custom_fields/${actual.id}`);
      const base = Array.isArray(fresco?.enums) ? fresco.enums : enums;
      const nuevas = def.opciones.filter((o) => !opcionDe(base, o));
      mapear(base);
      if (nuevas.length) {
        const tope = Math.max(0, ...base.map((e) => Number(e.sort) || 0));
        const cuerpo = {
          enums: [...base.map((e) => ({ id: e.id, value: e.value, sort: e.sort })), ...nuevas.map((v, i) => ({ value: v, sort: tope + (i + 1) * 10 }))],
        };
        const { data } = await api.pedir('PATCH', `/leads/custom_fields/${actual.id}`, cuerpo);
        let despues = (data?._embedded?.custom_fields?.[0] ?? data)?.enums;
        if (!Array.isArray(despues)) despues = (await api.pedir('GET', `/leads/custom_fields/${actual.id}`)).data?.enums ?? [];
        mapear(despues);
        const perdidas = base.filter((e) => !despues.some((d) => d.id === e.id));
        if (perdidas.length) {
          rep.fallo(S, 'Campo', def.nombre, `Kommo quitó ${perdidas.length} opción(es) al actualizar: ${perdidas.map((e) => e.value).join(', ')}.`, {
            id: actual.id,
            queHacer: 'Vuelve a agregarlas a mano en Kommo (Ajustes → Campos).',
          });
          continue;
        }
      }
      rep.agregar(S, 'opciones', 'Campo', def.nombre, { id: actual.id, detalle: [`+${nuevas.length}: ${nuevas.join(', ')}`, ...notas].filter(Boolean).join(' · '), extra: textoOpciones(reg) });
    } catch (e) {
      if (e.fatal) throw e;
      rep.fallo(S, 'Campo', def.nombre, e, { id: actual.id, queHacer: `Agrega a mano estas opciones: ${faltan.join(', ')}.` });
    }
  }
}

function textoOpciones(reg) {
  if (!reg.opciones) return '';
  return `opciones: ${Object.entries(reg.opciones)
    .map(([v, id]) => `${v} #${id ?? '?'}`)
    .join(' · ')}`;
}

async function pasoEtiquetas(ctx) {
  const { api, rep, ids, op } = ctx;
  const S = 'Etiquetas';
  let existentes;
  try {
    existentes = await api.listar('/leads/tags', 'tags');
  } catch (e) {
    if (e.fatal) throw e;
    rep.fallo(S, 'Lista', 'etiquetas de la cuenta', e);
    return;
  }
  for (const nombre of ETIQUETAS) {
    const exacta = existentes.find((t) => t.name === nombre);
    const parecida = exacta ?? existentes.find((t) => mismoNombre(t.name, nombre));
    if (parecida) {
      ids.etiquetas[nombre] = parecida.id;
      rep.agregar(S, 'existia', 'Etiqueta', nombre, { id: parecida.id, detalle: exacta ? '' : escritoDistinto(parecida.name, nombre, 'a') });
      continue;
    }
    ids.etiquetas[nombre] = null;
    if (op.modo === 'prueba') {
      rep.agregar(S, 'crearia', 'Etiqueta', nombre);
      continue;
    }
    try {
      const { data } = await api.pedir('POST', '/leads/tags', [{ name: nombre }]);
      const creada = data?._embedded?.tags?.[0];
      if (!creada?.id) throw new ErrorKommo('Kommo no devolvió la etiqueta creada.');
      ids.etiquetas[nombre] = creada.id;
      rep.agregar(S, 'creado', 'Etiqueta', nombre, { id: creada.id });
    } catch (e) {
      if (e.fatal) throw e;
      rep.fallo(S, 'Etiqueta', nombre, e);
    }
  }
}

async function pasoPlantillas(ctx) {
  const { api, rep, ids, op } = ctx;
  const S = 'Plantillas de respuesta';
  if (!op.plantillas) {
    rep.agregar(S, 'omitido', 'Plantillas', `${PLANTILLAS_SISTEMA.length} plantillas`, { detalle: 'se pidió --sin-plantillas' });
    return;
  }
  let existentes;
  try {
    existentes = await api.listar('/chats/templates', 'chat_templates', { limite: 50 }); // Kommo: máximo 50 por página
  } catch (e) {
    if (e.fatal) throw e;
    // Sin la lista no se puede saber qué existe: no se crea nada para no duplicar. Se imprimen para capturarlas a mano.
    rep.fallo(S, 'Lista', 'plantillas de la cuenta', e, { queHacer: 'No creé ninguna para no duplicar; abajo están los textos para capturarlas a mano.' });
    ctx.plantillasManuales.push(...PLANTILLAS_SISTEMA);
    return;
  }
  for (const p of PLANTILLAS_SISTEMA) {
    const ext = externalId(p.nombre);
    const actual = existentes.find((t) => t.external_id === ext) ?? existentes.find((t) => mismoNombre(t.name, p.nombre));
    if (actual) {
      ids.plantillas[p.nombre] = actual.id;
      rep.agregar(S, 'existia', 'Plantilla', p.nombre, { id: actual.id, detalle: escritoDistinto(actual.name, p.nombre, 'a') });
      continue;
    }
    ids.plantillas[p.nombre] = null;
    if (op.modo === 'prueba') {
      rep.agregar(S, 'crearia', 'Plantilla', p.nombre);
      continue;
    }
    try {
      const { data } = await api.pedir('POST', '/chats/templates', [{ name: p.nombre, content: p.texto, is_editable: true, external_id: ext }]);
      const creada = data?._embedded?.chat_templates?.[0];
      if (!creada?.id) throw new ErrorKommo('Kommo no devolvió la plantilla creada.');
      ids.plantillas[p.nombre] = creada.id;
      rep.agregar(S, 'creado', 'Plantilla', p.nombre, { id: creada.id });
    } catch (e) {
      if (e.fatal) throw e;
      rep.fallo(S, 'Plantilla', p.nombre, e, { queHacer: 'Abajo está el texto para capturarla a mano.' });
      ctx.plantillasManuales.push(p);
    }
  }
}

async function pasoUsuarios(ctx) {
  const { api, rep, ids } = ctx;
  try {
    const usuarios = await api.listar('/users', 'users');
    ids.usuarios = usuarios.map((u) => ({ id: u.id, nombre: u.name ?? '' }));
    ctx.usuariosDetalle = usuarios.map((u) => ({ id: u.id, nombre: u.name ?? '', admin: Boolean(u.rights?.is_admin), activo: u.rights?.is_active !== false }));
  } catch (e) {
    if (e.fatal) throw e;
    rep.fallo('Usuarios', 'Lista', 'usuarios de la cuenta', e, { queHacer: 'Para elegir KOMMO_RESPONSIBLE_USER_ID, corre el script con un token de un administrador.' });
  }
}

// ── Salida final ─────────────────────────────────────────────────────────────────────────────────────────────

function imprimirReporte(rep) {
  out('');
  out(rep.modo === 'prueba' ? '══ Plan (modo prueba: no se cambió nada en Kommo) ══' : '══ Reporte final ══');
  let seccion = '';
  for (const f of rep.filas) {
    if (f.seccion !== seccion) {
      seccion = f.seccion;
      out('');
      out(seccion);
    }
    const sangria = '  '.repeat(f.nivel + 1);
    out(`${sangria}${ICONO[f.estado]} ${rotulo(f.estado, rep.modo)} · ${f.tipo} «${f.nombre}»${f.id ? ` · id ${f.id}` : ''}${f.detalle ? ` — ${f.detalle}` : ''}`);
    if (f.extra) out(`${sangria}     ${f.extra}`);
  }
  out('');
  if (rep.modo === 'prueba' && rep.filas.some((f) => f.tipo === 'Plantilla' && f.estado === 'crearia')) {
    out('Nota: Kommo solo deja ver las plantillas que creó esta misma integración. Si ya capturaste alguna a mano con el mismo');
    out('nombre, aquí aparece como «Se crearía» y quedaría repetida: bórrala en Kommo antes o corre --aplicar con --sin-plantillas.');
    out('');
  }
  if (rep.modo === 'prueba') {
    out(
      `Resumen: se crearían ${rep.total('crearia')} · ya existen ${rep.total('existia')} · se agregarían opciones a ${rep.total('agregaria')} · con problema ${rep.total('fallo')}.`,
    );
  } else {
    out(`Totales: ✅ creados ${rep.total('creado')} · ↺ ya existían ${rep.total('existia')} · ➕ con opciones nuevas ${rep.total('opciones')} · ❌ fallaron ${rep.total('fallo')}.`);
  }
}

/**
 * Variables de Vercel: solo el subdominio (y el token, que pega el cliente). El sitio encuentra embudos, etapas y
 * campos por su nombre; KOMMO_PIPELINE_ID / KOMMO_STATUS_ID / KOMMO_POWER_* (y los KOMMO_AGENDA_* viejos) mandan
 * sobre los nombres y pueden mandar leads a la etapa equivocada, por eso nunca se sugieren (cotizar-configuracion.md
 * §2 y agenda-configuracion.md §4). La excepción es KOMMO_DISCOVERY_STATUS_ID: es solo un respaldo (la etapa por
 * nombre siempre le gana) y sirve mientras la etapa 97185916 no se llame «Discovery agendada».
 */
const NO_CAPTURAR = ['KOMMO_PIPELINE_ID', 'KOMMO_STATUS_ID', 'KOMMO_POWER_PIPELINE_ID', 'KOMMO_POWER_STATUS_ID', 'KOMMO_AGENDA_PIPELINE_ID', 'KOMMO_AGENDA_STATUS_ID'];

function imprimirVercel(ctx) {
  const sub = ctx.ids.cuenta?.subdominio ?? ctx.subdominio;
  out('');
  out('══ Variables para Vercel ══');
  out('Vercel → tu proyecto → Settings → Environment Variables → en Production y en Preview.');
  out('Solo hacen falta estas dos: el sitio encuentra los embudos, las etapas y los campos por su nombre.');
  out('');
  out(`  ${'KOMMO_SUBDOMAIN'.padEnd(26)} = ${sub}`);
  out(`  ${'KOMMO_TOKEN'.padEnd(26)} = (tu token: pégalo directo en Vercel y márcalo como Sensitive; este script nunca lo muestra)`);
  out('');
  out('Opcional (sin ella, Kommo asigna los leads como lo tengas configurado):');
  const activos = (ctx.usuariosDetalle ?? []).filter((u) => u.activo);
  if (activos.length === 1) out(`  ${'KOMMO_RESPONSIBLE_USER_ID'.padEnd(26)} = ${activos[0].id}   ← ${activos[0].nombre} (único usuario activo)`);
  else out(`  ${'KOMMO_RESPONSIBLE_USER_ID'.padEnd(26)} = (el ID de la persona que atiende los leads del sitio; está en la lista de abajo)`);
  out(`  ${'KOMMO_DISCOVERY_STATUS_ID'.padEnd(26)} = 97185916   ← respaldo para las Discovery mientras esa etapa de P1 no se llame «Discovery agendada»`);
  out('');
  out(`No captures ${NO_CAPTURAR.slice(0, -1).join(', ')} ni ${NO_CAPTURAR.at(-1)}, y bórralas si ya existían:`);
  out('mandan sobre los nombres y pueden mandar los leads a la etapa equivocada (por ejemplo, una Power Session sin pagar');
  out('a «Discovery agendada»). Los IDs de embudos y etapas de kommo-ids.json son solo referencia.');
  out('');
  out('Después de guardarlas: Deployments → último despliegue → Redeploy (las variables solo aplican a despliegues nuevos).');
  out('Comprueba: en el Preview abre /api/agenda/estado/ → debe decir "kommoEstructura": "completa" (con un token que no');
  out('sirve dice "error"). Luego manda una cotización de prueba y revisa que llegue a Kommo.');
  if (ctx.usuariosDetalle?.length) {
    out('');
    out('Usuarios de la cuenta (para KOMMO_RESPONSIBLE_USER_ID):');
    for (const u of ctx.usuariosDetalle) out(`  ${String(u.id).padEnd(12)} ${u.nombre}${u.admin ? ' (administrador)' : ''}${u.activo ? '' : ' (inactivo)'}`);
  }
}

function imprimirPlantillasManuales(lista) {
  if (!lista.length) return;
  out('');
  out('══ Plantillas para capturar a mano ══');
  out('Kommo → Automatizaciones → Plantillas → Plantillas de chat → + Nueva plantilla (tipo normal, no de WhatsApp):');
  for (const p of lista) {
    out('');
    out(`  Nombre: ${p.nombre}`);
    out(`  Texto:  ${p.texto}`);
  }
}

function escribirIds(ctx) {
  const { ids, subdominio, op } = ctx;
  const archivo = {
    _nota:
      'IDs y nombres de la cuenta de Kommo de Ingeniak. Lo escribe scripts/kommo-configurar.mjs --aplicar. No contiene el token ni ningún secreto. Los IDs de embudos, etapas y campos son referencia; no las captures en Vercel: el sitio los encuentra por su nombre.',
    generado: new Date().toISOString(),
    cuenta: ids.cuenta,
    embudos: ids.embudos,
    campos: ids.campos,
    etiquetas: ids.etiquetas,
    plantillas: ids.plantillas,
    usuarios: ids.usuarios,
    vercel: {
      _nota: `En Vercel solo van KOMMO_SUBDOMAIN y KOMMO_TOKEN (el token nunca se guarda aquí); KOMMO_RESPONSIBLE_USER_ID es opcional (ver «usuarios»). No captures ${NO_CAPTURAR.join(', ')}.`,
      KOMMO_SUBDOMAIN: ids.cuenta?.subdominio ?? subdominio,
    },
  };
  const texto = `${JSON.stringify(archivo, null, 2)}\n`;
  for (const s of secretos) {
    if (s && texto.includes(s)) {
      err('  ⚠ No escribí el archivo de IDs: contenía un valor secreto (no debería pasar; avísale al equipo de desarrollo).');
      return null;
    }
  }
  mkdirSync(dirname(op.salida), { recursive: true });
  writeFileSync(op.salida, texto, { encoding: 'utf8', mode: 0o644 });
  return op.salida;
}

// ── Programa ─────────────────────────────────────────────────────────────────────────────────────────────────

const PASOS = [
  ['Cuenta', pasoCuenta],
  ['Embudos y etapas', pasoEmbudos],
  ['Campos del lead', pasoCampos],
  ['Etiquetas', pasoEtiquetas],
  ['Plantillas de respuesta', pasoPlantillas],
  ['Usuarios', pasoUsuarios],
];

export async function main(argv = process.argv.slice(2), env = process.env) {
  const op = leerOpciones(argv);
  if (op.ayuda) {
    out(AYUDA);
    return 0;
  }
  if (op.error) {
    err(op.error);
    out(AYUDA);
    return 2;
  }
  const problemas = validarEsquema();
  if (problemas.length) {
    err('La estructura de shared/kommo-esquema.js tiene problemas; no mando nada a Kommo:');
    for (const p of problemas) err(`  • ${p}`);
    return 2;
  }

  out('');
  out('Ingeniak · configuración de Kommo');
  out(
    op.modo === 'inventario'
      ? 'Modo INVENTARIO: solo lista lo que ya existe en tu cuenta. No cambia nada en Kommo.'
      : op.modo === 'prueba'
        ? 'Modo PRUEBA: solo revisa tu cuenta y te dice qué haría. No cambia nada en Kommo.'
        : 'Modo APLICAR: crea solo lo que falta. No borra ni renombra nada.',
  );
  out('El token solo vive en la memoria mientras corre el script: no se muestra ni se guarda.');
  out('');

  const entrada = crearEntrada();
  let subdominio;
  let token;
  try {
    const subEnv = String(env.KOMMO_SUBDOMAIN ?? '').trim();
    subdominio = normalizarSubdominio(subEnv || (await entrada.visible('Subdominio de Kommo (lo que va antes de .kommo.com): ')));
    if (!subdominio) {
      err('Ese subdominio no es válido. Es lo que va antes de .kommo.com en tu navegador, por ejemplo «ingeniak».');
      return 2;
    }
    const tokenEnv = String(env.KOMMO_TOKEN ?? '').trim();
    const crudo = tokenEnv || (await entrada.oculto('Pega tu token de larga duración (no se verá en pantalla) y pulsa Enter: '));
    const limpio = limpiarToken(crudo);
    if (!limpio.ok) {
      err(limpio.motivo);
      return 2;
    }
    token = limpio.token;
    secretos.add(token);
    if (!tokenEnv) out('  ✓ Token recibido.');
    else if (process.stdin.isTTY) {
      // KOMMO_TOKEN es para pruebas automáticas. Escrita a mano en la Terminal, queda en su historial.
      out('  ⚠ Tomé el token de la variable KOMMO_TOKEN. Si la escribiste en esta Terminal, quedó guardada en su historial:');
      out('    la próxima vez no la uses; corre el comando solo y pega el token cuando el script te lo pida.');
    }
  } finally {
    entrada.cerrar();
  }

  const base = urlBase(subdominio, env.KOMMO_BASE_URL);
  if (!base.ok) {
    err('KOMMO_BASE_URL solo se usa para pruebas en esta computadora (127.0.0.1 o localhost). Quítala y vuelve a correr el script.');
    return 2;
  }
  // Ritmo y esperas solo se pueden acelerar contra el simulador local de las pruebas.
  const ritmoMs = base.local ? numeroEntorno(env.KOMMO_SETUP_INTERVALO_MS, RITMO_MINIMO_MS) : RITMO_MINIMO_MS;
  const esperaMs = base.local ? numeroEntorno(env.KOMMO_SETUP_ESPERA_MS, ESPERA_BASE_MS) : ESPERA_BASE_MS;
  const api = new ClienteKommo({ base: base.base, token, ritmoMs, esperaMs, soloLectura: op.modo !== 'aplicar', host: `${subdominio}.kommo.com` });
  if (op.modo === 'inventario') return inventario({ api, subdominio, salida: env.KOMMO_INVENTARIO_SALIDA });

  const ctx = {
    api,
    op,
    subdominio,
    rep: new Reporte(op.modo),
    ids: { cuenta: null, embudos: {}, campos: {}, etiquetas: {}, plantillas: {}, usuarios: [] },
    plantillasManuales: [],
    usuariosDetalle: null,
  };

  let fatal = null;
  for (const [i, [titulo, paso]] of PASOS.entries()) {
    out(`${i + 1}/${PASOS.length} ${titulo}…`);
    try {
      await paso(ctx);
    } catch (e) {
      if (e instanceof ErrorKommo && e.fatal) {
        fatal = e;
        err(`  ❌ ${e.message}${e.detalle ? ` (${e.detalle})` : ''}`);
        const faltan = PASOS.slice(i + 1).map(([t]) => t);
        if (faltan.length) err(`  No se intentó: ${faltan.join(', ')}.`);
        break;
      }
      throw e;
    }
  }

  if (!ctx.ids.cuenta) {
    err('');
    err('No se cambió nada en Kommo.');
    return 1;
  }

  imprimirReporte(ctx.rep);
  imprimirPlantillasManuales(ctx.plantillasManuales);
  imprimirVercel(ctx);

  out('');
  if (op.modo === 'aplicar') {
    const ruta = escribirIds(ctx);
    const corta = ruta ? relative(process.cwd(), ruta) : '';
    if (ruta) out(`IDs guardados en ${corta && !corta.startsWith('..') ? corta : ruta} (solo IDs y nombres; sin token).`);
  } else if (!fatal) {
    out('No se cambió nada en Kommo. Si el plan se ve bien, corre:');
    out('  node scripts/kommo-configurar.mjs --aplicar');
  } else {
    out('No se cambió nada en Kommo.');
  }
  if (fatal) {
    out('');
    out('El proceso se detuvo antes de terminar. Corrige lo de arriba y vuelve a correr el mismo comando: lo que ya se creó no se duplica.');
  }
  return fatal || ctx.rep.total('fallo') ? 1 : 0;
}

/**
 * --inventario: solo GET. Lista embudos (con etapas), campos del lead (con tipo y opciones) y usuarios, y guarda
 * materiales/v2/landings/kommo-inventario.json (solo nombres e IDs; nunca el token) para adaptar el plan a la cuenta.
 */
async function inventario({ api, subdominio, salida }) {
  const inv = { generado: new Date().toISOString(), cuenta: null, embudos: [], camposLead: [], usuarios: [] };
  try {
    const { data } = await api.pedir('GET', '/account', undefined, { paso: 'cuenta' });
    if (!data?.id) throw new ErrorKommo('Kommo respondió, pero no con los datos de una cuenta. Revisa el subdominio.', { fatal: true });
    inv.cuenta = { id: data.id, nombre: data.name ?? '', subdominio: data.subdomain ?? subdominio };
    out(`  ✓ Conectado a «${data.name}» (${data.subdomain ?? subdominio}.kommo.com).`);

    const { data: emb } = await api.pedir('GET', '/leads/pipelines');
    for (const p of emb?._embedded?.pipelines ?? []) {
      const etapas = (p._embedded?.statuses ?? []).slice().sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0));
      inv.embudos.push({ id: p.id, nombre: p.name, principal: Boolean(p.is_main), archivado: Boolean(p.is_archive), etapas: etapas.map((s) => ({ id: s.id, nombre: s.name, tipo: s.type ?? 0 })) });
    }
    inv.camposLead = (await api.listar('/leads/custom_fields', 'custom_fields')).map((c) => ({
      id: c.id, nombre: c.name, tipo: c.type, codigo: c.code ?? null,
      opciones: Array.isArray(c.enums) ? c.enums.map((e) => e.value) : undefined,
    }));
    try {
      inv.usuarios = (await api.listar('/users', 'users')).map((u) => ({ id: u.id, nombre: u.name }));
    } catch { /* sin permiso para usuarios: no es necesario para el inventario */ }
  } catch (e) {
    err(`  ❌ ${e instanceof Error ? e.message : 'No se pudo leer la cuenta.'}${e?.detalle ? ` (${e.detalle})` : ''}`);
    err('No se cambió nada en Kommo.');
    return 1;
  }

  out('');
  out('══ Inventario de tu Kommo (solo lectura) ══');
  out('');
  out('EMBUDOS Y ETAPAS');
  for (const p of inv.embudos) {
    out(`• ${p.nombre}${p.principal ? ' (principal)' : ''}${p.archivado ? ' (archivado)' : ''} · id ${p.id}`);
    for (const s of p.etapas) out(`    └ ${s.nombre} · id ${s.id}`);
  }
  out('');
  out('CAMPOS DEL LEAD');
  for (const c of inv.camposLead) {
    out(`• ${c.nombre} · ${c.tipo}${c.codigo ? ` · código ${c.codigo}` : ''} · id ${c.id}`);
    if (c.opciones?.length) out(`    opciones: ${c.opciones.join(' | ')}`);
  }
  if (inv.usuarios.length) {
    out('');
    out('USUARIOS');
    for (const u of inv.usuarios) out(`• ${u.nombre} · id ${u.id}`);
  }
  const ruta = salida ? resolve(process.cwd(), salida) : resolve(dirname(SALIDA_POR_DEFECTO), 'kommo-inventario.json');
  try {
    mkdirSync(dirname(ruta), { recursive: true });
    writeFileSync(ruta, `${JSON.stringify(inv, null, 2)}\n`);
    out('');
    out(`Inventario guardado en ${relative(process.cwd(), ruta) || ruta} (solo nombres e IDs; sin token).`);
  } catch {
    out('');
    out('No pude guardar el archivo del inventario; copia lo de arriba.');
  }
  out('No se cambió nada en Kommo.');
  return 0;
}

function numeroEntorno(valor, porDefecto) {
  const n = Number(valor);
  return valor !== undefined && valor !== '' && Number.isFinite(n) && n >= 0 ? n : porDefecto;
}

const esPrincipal = process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href;
if (esPrincipal) {
  main().then(
    (codigo) => {
      process.exitCode = codigo;
    },
    (e) => {
      err(`Error inesperado: ${e?.message ?? e}`);
      err('Vuelve a correr el mismo comando; si se repite, comparte este mensaje con el equipo de desarrollo (no incluye tu token).');
      process.exitCode = 1;
    },
  );
}
