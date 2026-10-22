/**
 * Lógica del formulario «Cotizar proyecto» (CAMBIO-COTIZAR §2.3, §2.4, §3.3, §3.4).
 * Validación con las listas blancas de `src/data/cotizar.json` (las mismas que usa el modal),
 * normalización del teléfono a E.164, folio y armado de lo que se manda a Kommo (lead, nota, etiquetas, rastreo
 * y los campos de la estructura aprobada el 2026-10-20: embudo «Ventas», etapa «Nueva cotización»).
 * Puro: no llama a la red ni lee `process.env` (el entorno llega como argumento).
 */
import catalogo from '../src/data/cotizar.json' with { type: 'json' };
import { clean } from './http.js';
import { etiquetasDeOrigen, opcionKommo, urlDePagina } from './kommo.js';

/**
 * @typedef {{ slug: string, label: string }} Opcion
 * @typedef {{ iso: string, lada: string | null, label: string, digitos: number[] }} Pais
 * @typedef {{ pais: string, lada: string, numero: string }} TelefonoEntrada
 * @typedef {{
 *   submission_id?: string, folio?: string,
 *   servicios: string[], objetivo: string, industria: string, tamano: string, presupuesto: string, plazo: string,
 *   canales: string[], crm: string,
 *   nombre: string, empresa: string,
 *   telefono: { pais: string, lada: string, numero: string, e164: string },
 *   email: string, canal_preferido: string, sitio: string, vision: string, consentimiento: true
 * }} Cotizacion
 * @typedef {{
 *   pagina: string, folio: string, cta: string, src: string, landing: string, referrer: string,
 *   utm_source: string, utm_medium: string, utm_campaign: string, utm_term: string, utm_content: string,
 *   gclid: string, fbclid: string, gbraid: string, wbraid: string,
 *   zona: string, t_llenado_ms: number | null, hp: string
 * }} Meta
 */

export { catalogo };

/** Contacto directo (respaldo cuando Kommo falla). Mismos datos que `SITE.waBase` y el correo del sitio. */
export const FALLBACK = Object.freeze({ whatsapp: 'https://wa.me/523321017799', email: 'contacto@ingeniak.mx' });

/**
 * Ruta → page.id (de `src/data/sitemap.json`, que pesa ~500 KB y no debe viajar dentro de la función).
 * Si `cotizar.json` trae un mapa `rutas` ({ "/ruta/": "page-id" }), ese manda sobre este.
 * `tests/cotizar/rutas.test.mjs` compara este mapa con `sitemap.json` para que no se desfase.
 */
export const RUTAS = Object.freeze({
  '/': 'home',
  '/servicios/': 'servicios',
  '/servicios/consultoria-ia-empresas/': 'consultoria',
  '/servicios/agentes-ia-whatsapp/': 'agentes-whatsapp',
  '/servicios/crm-con-ia/': 'crm-ia',
  '/kommo/': 'kommo',
  '/gohighlevel/': 'gohighlevel',
  '/servicios/automatizacion-n8n/': 'n8n',
  '/servicios/paid-media/': 'paid-media',
  '/servicios/paginas-web/': 'paginas-web',
  '/servicios/desarrollo-software/': 'software',
  '/servicios/seo/': 'seo',
  '/servicios/branding/': 'branding',
  '/industrias/': 'industrias',
  '/industrias/salud/': 'ind-salud',
  '/industrias/belleza-estetica/': 'ind-belleza',
  '/industrias/nutricion/': 'ind-nutricion',
  '/industrias/finanzas/': 'ind-finanzas',
  '/industrias/inmobiliario/': 'ind-inmobiliario',
  '/industrias/industrial-logistica/': 'ind-industrial',
  '/industrias/retail-ecommerce/': 'ind-retail',
  '/industrias/horeca/': 'ind-horeca',
  '/casos/': 'casos',
  '/casos/clinica-dental-monterrey/': 'caso-dental',
  '/casos/retail-multimarca-kommo/': 'caso-retail',
  '/casos/ecommerce-cdmx-costo-por-lead/': 'caso-ecommerce',
  '/casos/horeca-roas/': 'caso-horeca',
  '/casos/logistica-n8n/': 'caso-logistica',
  '/kain/': 'kain',
  '/metodologia/': 'metodologia',
  '/tecnologias/': 'tecnologias',
  '/nosotros/': 'nosotros',
  '/agentes-ia-guadalajara/': 'guadalajara',
  '/preguntas-frecuentes/': 'faq',
  '/blog/': 'blog',
  '/recursos/': 'recursos',
  '/blog/cuanto-cuesta-agente-ia-whatsapp-mexico/': 'art-costo',
  '/blog/kommo-vs-gohighlevel/': 'art-kommo-ghl',
  '/blog/agente-ia-whatsapp-vs-chatbot/': 'art-agente-chatbot',
  '/blog/como-verificar-partner-oficial-kommo/': 'art-partner-kommo',
  '/blog/gohighlevel-en-espanol/': 'art-ghl-espanol',
  '/blog/n8n-vs-zapier-vs-make/': 'art-n8n',
  '/discovery/': 'discovery',
  '/power-session/': 'power-session',
  '/agendar/confirmado/': 'agendar-confirmado',
  '/contacto/': 'contacto',
  '/aviso-privacidad/': 'aviso',
});

/** Campos `tracking_data` de Kommo que se llenan desde `meta` (código de Kommo → clave de meta). */
export const TRACKING = Object.freeze({
  UTM_SOURCE: 'utm_source',
  UTM_MEDIUM: 'utm_medium',
  UTM_CAMPAIGN: 'utm_campaign',
  UTM_TERM: 'utm_term',
  UTM_CONTENT: 'utm_content',
  REFERRER: 'referrer',
  GCLID: 'gclid',
  FBCLID: 'fbclid',
});

/** Longitudes máximas de los campos de `meta` (se recortan, no se rechazan: son de atribución). */
const META_MAX = Object.freeze({
  pagina: 300, folio: 40, cta: 40, src: 120, landing: 300, referrer: 500,
  utm_source: 200, utm_medium: 200, utm_campaign: 200, utm_term: 200, utm_content: 200,
  gclid: 200, fbclid: 200, gbraid: 200, wbraid: 200, zona: 64, hp: 200,
});

const LIM = catalogo.limites ?? { nombre: [3, 120], empresa: [2, 160], email: 200, sitio: 200, vision: 1000 };
const ERR = catalogo.errores;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * @param {Opcion[] | undefined} lista
 * @param {unknown} slug
 * @returns {Opcion | undefined}
 */
function opcion(lista, slug) {
  return typeof slug === 'string' ? (lista ?? []).find((o) => o.slug === slug) : undefined;
}

/**
 * Etiqueta legible de un slug del catálogo (o el slug si no existe).
 * @param {Opcion[] | undefined} lista
 * @param {string} slug
 */
function etiqueta(lista, slug) {
  return opcion(lista, slug)?.label ?? slug;
}

/**
 * Lista de slugs del catálogo: acepta arreglo (o un texto suelto), quita repetidos.
 * @param {unknown} v
 * @returns {string[] | null} null si algún valor no es texto
 */
function slugs(v) {
  if (v === undefined || v === null || v === '') return [];
  const arr = Array.isArray(v) ? v : [v];
  if (arr.some((x) => typeof x !== 'string')) return null;
  return [...new Set(arr.map((x) => x.trim()).filter(Boolean))];
}

/**
 * ¿La longitud cae en el rango? (un número = solo esa longitud; dos = rango [mín, máx]).
 * @param {number} n
 * @param {number[]} digitos
 */
function longitudValida(n, digitos) {
  if (!Array.isArray(digitos) || digitos.length === 0) return n >= 6 && n <= 14;
  if (digitos.length === 1) return n === digitos[0];
  return n >= Math.min(...digitos) && n <= Math.max(...digitos);
}

/**
 * Normaliza el teléfono a E.164 (mismas reglas que `src/scripts/forms/phone.ts`, CAMBIO-COTIZAR §2.4).
 * - `pais` del catálogo; `lada` = la del país (o, con `pais: "otro"`, `+` y 1 a 4 dígitos).
 * - `numero`: se quitan espacios, guiones, puntos y paréntesis; solo dígitos; longitud según `digitos` del país.
 * - Si `numero` trae la lada al inicio sin `+` (p. ej. `52` + 10 dígitos en México), se quita.
 * - E.164 total ≤ 15 dígitos.
 * @param {Partial<TelefonoEntrada> | null | undefined} tel
 * @param {Pais[]} [paises]
 * @returns {{ ok: true, pais: string, lada: string, numero: string, e164: string, error: null }
 *         | { ok: false, error: 'telefono' | 'telefonoLada' }}
 */
export function normalizePhone(tel, paises = catalogo.paises) {
  if (!tel || typeof tel !== 'object') return { ok: false, error: 'telefono' };
  const pais = typeof tel.pais === 'string' ? tel.pais.trim().toLowerCase() : '';
  const def = paises.find((p) => p.iso === pais);
  if (!def) return { ok: false, error: 'telefono' };

  const ladaIn = typeof tel.lada === 'string' ? tel.lada.replace(/[\s\-.()]/g, '') : '';
  let lada;
  if (def.lada) {
    if (ladaIn && ladaIn !== def.lada && `+${ladaIn}` !== def.lada) return { ok: false, error: 'telefonoLada' };
    lada = def.lada;
  } else {
    const l = ladaIn.startsWith('+') ? ladaIn : `+${ladaIn}`;
    if (!/^\+[1-9]\d{0,3}$/.test(l)) return { ok: false, error: 'telefonoLada' };
    lada = l;
  }
  const ladaDig = lada.slice(1);

  let numero = typeof tel.numero === 'string' || typeof tel.numero === 'number' ? String(tel.numero) : '';
  numero = numero.replace(/[\s\-.() ]/g, '');
  if (numero.startsWith('+')) numero = numero.slice(1);
  if (!/^\d+$/.test(numero)) return { ok: false, error: 'telefono' };
  if (
    numero.startsWith(ladaDig) &&
    !longitudValida(numero.length, def.digitos) &&
    longitudValida(numero.length - ladaDig.length, def.digitos)
  ) {
    numero = numero.slice(ladaDig.length);
  }
  if (!longitudValida(numero.length, def.digitos)) return { ok: false, error: 'telefono' };
  if (ladaDig.length + numero.length > 15) return { ok: false, error: 'telefono' };
  return { ok: true, pais, lada, numero, e164: `+${ladaDig}${numero}`, error: null };
}

/**
 * Folio visible para el visitante y para Kommo: 'IK-' + primeros 6 hex del submission_id, en mayúsculas.
 * @param {string} submissionId
 * @returns {string}
 */
export function folio(submissionId) {
  const hex = String(submissionId ?? '').toLowerCase().replace(/[^0-9a-f]/g, '');
  return `IK-${hex.slice(0, 6).toUpperCase()}`;
}

/**
 * Valida y normaliza el cuerpo de `POST /api/cotizar/` (reglas de §2.4 con las listas blancas del catálogo).
 * Los mensajes de error salen de `cotizar.json → errores`, con la clave del campo.
 * @param {Record<string, unknown>} input
 * @returns {{ ok: true, data: Cotizacion } | { ok: false, errors: Record<string, string> }}
 */
export function validate(input) {
  const src = input && typeof input === 'object' && !Array.isArray(input) ? input : {};
  /** @type {Record<string, string>} */
  const errors = {};

  // Paso 1 · Qué necesitas
  const servicios = slugs(src.servicios);
  if (
    !servicios ||
    servicios.length < 1 ||
    servicios.length > 10 ||
    servicios.some((s) => !opcion(catalogo.servicios, s)) ||
    (servicios.includes('no-seguro') && servicios.length > 1)
  ) {
    errors.servicios = ERR.servicios;
  }
  /** @type {[string, Opcion[]][]} */
  const unicos = [
    ['objetivo', catalogo.objetivos],
    ['industria', catalogo.industrias],
    ['tamano', catalogo.tamanos],
    ['presupuesto', catalogo.presupuestos],
    ['plazo', catalogo.plazos],
    ['canal_preferido', catalogo.canalesPreferidos],
  ];
  /** @type {Record<string, string>} */
  const uno = {};
  for (const [campo, lista] of unicos) {
    const v = typeof src[campo] === 'string' ? src[campo].trim() : '';
    if (!opcion(lista, v)) errors[campo] = ERR[campo];
    else uno[campo] = v;
  }

  // Paso 2 · Tu negocio (opcionales)
  const canales = slugs(src.canales);
  if (!canales || canales.length > 7 || canales.some((s) => !opcion(catalogo.canales, s))) {
    errors.canales = ERR.canales ?? 'Revisa los canales que elegiste.';
  }
  const crm = typeof src.crm === 'string' ? src.crm.trim() : src.crm == null ? '' : null;
  if (crm === null || (crm !== '' && !opcion(catalogo.crms, crm))) {
    errors.crm = ERR.crm ?? 'Revisa el CRM que elegiste.';
  }

  // Paso 3 · Contacto
  const nombre = clean(src.nombre).replace(/\s+/g, ' ');
  const letras = (nombre.match(/\p{L}/gu) ?? []).length;
  if (nombre.length < LIM.nombre[0] || nombre.length > LIM.nombre[1] || letras < 2) errors.nombre = ERR.nombre;

  const empresa = clean(src.empresa).replace(/\s+/g, ' ');
  if (empresa.length < LIM.empresa[0] || empresa.length > LIM.empresa[1]) errors.empresa = ERR.empresa;

  const tel = normalizePhone(/** @type {any} */ (src.telefono));
  if (!tel.ok) errors.telefono = ERR[tel.error] ?? ERR.telefono;

  const email = clean(src.email).toLowerCase();
  if (!email || email.length > LIM.email || !EMAIL_RE.test(email)) errors.email = ERR.email;

  const sitio = clean(src.sitio).replace(/\s+/g, ' ');
  if (src.sitio != null && typeof src.sitio !== 'string') errors.sitio = ERR.sitio;
  else if (sitio.length > LIM.sitio) errors.sitio = ERR.sitio;

  const vision = clean(src.vision, Infinity, { lines: true });
  if (src.vision != null && typeof src.vision !== 'string') errors.vision = ERR.vision;
  else if (vision.length > LIM.vision) errors.vision = ERR.vision;

  if (src.consentimiento !== true) errors.consentimiento = ERR.consentimiento;

  if (Object.keys(errors).length) return { ok: false, errors };
  const t = /** @type {Extract<ReturnType<typeof normalizePhone>, { ok: true }>} */ (tel);
  return {
    ok: true,
    data: {
      servicios: /** @type {string[]} */ (servicios),
      objetivo: uno.objetivo,
      industria: uno.industria,
      tamano: uno.tamano,
      presupuesto: uno.presupuesto,
      plazo: uno.plazo,
      canales: /** @type {string[]} */ (canales),
      crm: /** @type {string} */ (crm),
      nombre,
      empresa,
      telefono: { pais: t.pais, lada: t.lada, numero: t.numero, e164: t.e164 },
      email,
      canal_preferido: uno.canal_preferido,
      sitio,
      vision,
      consentimiento: true,
    },
  };
}

/**
 * Sanea `meta` (atribución). Nunca falla: lo que no es texto queda vacío y lo largo se recorta.
 * @param {unknown} raw
 * @returns {Meta}
 */
export function cleanMeta(raw) {
  const m = raw && typeof raw === 'object' && !Array.isArray(raw) ? /** @type {Record<string, unknown>} */ (raw) : {};
  /** @type {Record<string, unknown>} */
  const out = {};
  for (const [k, max] of Object.entries(META_MAX)) {
    const v = m[k];
    out[k] = clean(typeof v === 'number' ? String(v) : v, max);
  }
  const t = m.t_llenado_ms;
  const n = t === undefined || t === null || t === '' ? NaN : Number(t);
  out.t_llenado_ms = Number.isFinite(n) ? Math.round(n) : null;
  return /** @type {Meta} */ (out);
}

/**
 * Bot: la trampa `meta.hp` trae algo o el formulario se llenó en menos de 3 s.
 * @param {Meta} meta
 */
export function isBot(meta) {
  return Boolean(meta.hp) || (meta.t_llenado_ms !== null && meta.t_llenado_ms < 3000);
}

/**
 * page.id de una ruta (o URL completa) del sitio; null si no se reconoce.
 * @param {string} pagina
 * @returns {string | null}
 */
export function pageIdFrom(pagina) {
  if (!pagina) return null;
  let path;
  try {
    path = decodeURI(new URL(pagina, 'https://ingeniak.mx').pathname);
  } catch {
    return null;
  }
  path = path.toLowerCase().replace(/\/index\.html$/, '/');
  if (!path.endsWith('/')) path += '/';
  const extra = /** @type {Record<string, string>} */ (catalogo.rutas ?? {});
  return extra[path] ?? /** @type {Record<string, string>} */ (RUTAS)[path] ?? null;
}

/**
 * Nombre de entorno a partir de un mapa de variables (no lee process.env).
 * @param {Record<string, string | undefined>} env
 */
function entornoDe(env) {
  const v = env?.VERCEL_ENV;
  return v === 'production' || v === 'preview' || v === 'development' ? v : 'local';
}

/**
 * Entero positivo de una variable de entorno (o undefined).
 * @param {string | undefined} v
 */
export function intEnv(v) {
  if (typeof v !== 'string' || !/^\s*\d+\s*$/.test(v)) return undefined;
  const n = Number(v);
  return Number.isSafeInteger(n) && n > 0 ? n : undefined;
}

/**
 * Fecha y hora del centro de México: `20/10/2026 12:34`.
 * @param {Date} d
 */
export function fechaCdmx(d) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('es-MX', {
      timeZone: 'America/Mexico_City',
      day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
    })
      .formatToParts(d)
      .map((p) => [p.type, p.value]),
  );
  return `${parts.day}/${parts.month}/${parts.year} ${parts.hour}:${parts.minute}`;
}

/** Une segmentos no vacíos con ' · ' (renglón vacío → ''). @param {(string | false | null | undefined)[]} seg */
const fila = (seg) => seg.filter(Boolean).join(' · ');

/**
 * Etiquetas de Kommo de una cotización (estructura aprobada el 2026-10-20), en este orden:
 * web-cotizar · campaña (utm_medium de pago, gclid, fbclid, gbraid o wbraid) u orgánico · entorno-preview (fuera de producción).
 * Servicios, presupuesto, plazo, industria, contacto preferido y página ya no van como etiqueta: van en sus campos.
 * @param {Cotizacion} _data
 * @param {Meta} meta
 * @param {Record<string, string | undefined>} env
 * @returns {string[]}
 */
export function tagsFor(_data, meta, env) {
  const origen = etiquetasDeOrigen(
    { utmMedium: meta.utm_medium, gclid: meta.gclid, fbclid: meta.fbclid, gbraid: meta.gbraid, wbraid: meta.wbraid },
    entornoDe(env),
  );
  return ['web-cotizar', ...origen];
}

/**
 * Campos del lead (claves de `shared/kommo-esquema.js` → CAMPOS) con la opción exacta de Kommo para cada respuesta.
 * Una respuesta sin opción equivalente se omite (y sigue en la nota). Sin claves vacías.
 * @param {Cotizacion} data
 * @param {Meta} meta
 * @returns {import('./kommo.js').ValoresCampos}
 */
export function camposFor(data, meta) {
  const c = catalogo;
  /** @param {string} clave @param {Opcion[]} lista @param {string} slug */
  const una = (clave, lista, slug) => (slug ? opcionKommo(clave, etiqueta(lista, slug)) : null);
  /** @param {string} clave @param {Opcion[]} lista @param {string[]} slugs */
  const varias = (clave, lista, slugs) => [...new Set(slugs.map((s) => opcionKommo(clave, etiqueta(lista, s))).filter((x) => x !== null))];
  /** @type {Record<string, string | string[] | null>} */
  const campos = {
    servicios: varias('servicios', c.servicios, data.servicios),
    objetivo: una('objetivo', c.objetivos, data.objetivo),
    industria: una('industria', c.industrias, data.industria),
    tamano: una('tamano', c.tamanos, data.tamano),
    presupuesto: una('presupuesto', c.presupuestos, data.presupuesto),
    plazo: una('plazo', c.plazos, data.plazo),
    crm: una('crm', c.crms, data.crm),
    canales: varias('canales', c.canales, data.canales),
    contacto: una('contacto', c.canalesPreferidos, data.canal_preferido),
    origen: urlDePagina(meta.pagina),
  };
  return Object.fromEntries(Object.entries(campos).filter(([, v]) => v !== null && !(Array.isArray(v) && v.length === 0)));
}

/**
 * Nota de Kommo con el formulario completo (formato exacto de §3.4; sin renglones vacíos).
 * @param {Cotizacion} data  validada; `data.folio` = 'IK-…'
 * @param {Meta} meta
 * @param {Record<string, string | undefined>} env
 * @param {Date} now
 * @returns {string}
 */
export function noteFor(data, meta, env, now) {
  const c = catalogo;
  const vision = data.vision.replace(/\n[ \t]*(?=\n)/g, '').replace(/\n{2,}/g, '\n');
  const utm = fila(
    /** @type {const} */ (['source', 'medium', 'campaign', 'term', 'content']).map(
      (k) => meta[`utm_${k}`] && `${k}=${meta[`utm_${k}`]}`,
    ),
  );
  const lineas = [
    `Solicitud de cotización · sitio web · Folio ${data.folio}`,
    `Servicios: ${data.servicios.map((s) => etiqueta(c.servicios, s)).join(', ')}`,
    `Qué quiere lograr primero: ${etiqueta(c.objetivos, data.objetivo)}`,
    fila([`Industria: ${etiqueta(c.industrias, data.industria)}`, `Equipo: ${etiqueta(c.tamanos, data.tamano)} personas`]),
    fila([`Presupuesto estimado: ${etiqueta(c.presupuestos, data.presupuesto)}`, `Plazo: ${etiqueta(c.plazos, data.plazo)}`]),
    fila([
      data.canales.length > 0 && `Canales que usan hoy: ${data.canales.map((s) => etiqueta(c.canales, s)).join(', ')}`,
      data.crm && `CRM actual: ${etiqueta(c.crms, data.crm)}`,
    ]),
    '—',
    fila([`Nombre: ${data.nombre}`, `Empresa: ${data.empresa}`]),
    fila([`WhatsApp: ${data.telefono.e164}`, `Correo: ${data.email}`]),
    `Prefiere que lo contactemos por: ${etiqueta(c.canalesPreferidos, data.canal_preferido)}`,
    data.sitio && `Sitio o redes: ${data.sitio}`,
    vision && `Su proyecto: ${vision}`,
    '—',
    fila([
      meta.pagina && `Página: ${meta.pagina}${meta.folio ? ` (folio ${meta.folio})` : ''}`,
      meta.cta && `Botón: ${meta.cta}`,
      meta.src && `Primer clic de la sesión: ${meta.src}`,
    ]),
    fila([meta.landing && `Llegó por: ${meta.landing}`, meta.referrer && `Referrer: ${meta.referrer}`]),
    utm && `UTM: ${utm}`,
    fila(/** @type {const} */ (['gclid', 'fbclid', 'gbraid', 'wbraid']).map((k) => meta[k] && `${k}=${meta[k]}`)),
    fila([meta.zona && `Zona horaria: ${meta.zona}`, `Enviado: ${fechaCdmx(now)} (hora del centro de México)`]),
    `Consentimiento de contacto por WhatsApp y correo: sí (${now.toISOString()})`,
    `Entorno: ${entornoDe(env)}`,
  ];
  return lineas.filter((l) => typeof l === 'string' && l.trim() !== '').join('\n');
}

/**
 * Rastreo para los campos `tracking_data` del lead: { UTM_SOURCE: 'google', … } solo con valores.
 * @param {Meta} meta
 * @returns {Record<string, string>}
 */
export function trackingFor(meta) {
  /** @type {Record<string, string>} */
  const out = {};
  for (const [code, key] of Object.entries(TRACKING)) {
    const v = /** @type {Record<string, unknown>} */ (meta)[key];
    if (typeof v === 'string' && v) out[code] = v;
  }
  return out;
}

/**
 * Todo lo que se manda a Kommo para una cotización (§3.4 + estructura aprobada).
 * `lead` son los argumentos de `createLeadWithNote` salvo `tags`, `note` y `tracking`:
 * embudo «Ventas» y etapa «Nueva cotización» por nombre; KOMMO_PIPELINE_ID / KOMMO_STATUS_ID,
 * si existen, mandan sobre los nombres.
 * @param {Cotizacion} data  validada y con `folio`
 * @param {Meta} meta
 * @param {Record<string, string | undefined>} [env]  variables de entorno (process.env)
 * @param {Date} [now]
 */
export function buildKommo(data, meta, env = process.env, now = new Date()) {
  return {
    lead: {
      name: `Cotización web · ${data.empresa}`,
      contact: { name: data.nombre, phoneE164: data.telefono.e164, email: data.email },
      company: data.empresa,
      embudo: /** @type {const} */ ('ventas'),
      etapa: 'nueva',
      campos: camposFor(data, meta),
      pipelineId: intEnv(env.KOMMO_PIPELINE_ID),
      statusId: intEnv(env.KOMMO_STATUS_ID),
      responsibleUserId: intEnv(env.KOMMO_RESPONSIBLE_USER_ID),
    },
    note: noteFor(data, meta, env, now),
    tags: tagsFor(data, meta, env),
    tracking: trackingFor(meta),
  };
}

/**
 * Copia normalizada para el webhook de aviso (`data` de §3.5). Solo viaja a NOTIFY_WEBHOOK_URL.
 * @param {Cotizacion} data
 * @param {Meta} meta
 * @param {Date} now
 */
export function webhookData(data, meta, now) {
  const { hp: _hp, ...metaLimpia } = meta;
  return {
    submission_id: data.submission_id,
    folio: data.folio,
    servicios: data.servicios,
    objetivo: data.objetivo,
    industria: data.industria,
    tamano: data.tamano,
    presupuesto: data.presupuesto,
    plazo: data.plazo,
    canales: data.canales,
    crm: data.crm,
    nombre: data.nombre,
    empresa: data.empresa,
    telefono: data.telefono.e164,
    email: data.email,
    canal_preferido: data.canal_preferido,
    sitio: data.sitio,
    vision: data.vision,
    consentimiento: { valor: true, fecha: now.toISOString() },
    meta: { ...metaLimpia, pagina_id: pageIdFrom(meta.pagina) ?? 'otra' },
    recibido: now.toISOString(),
  };
}

/* ── Envíos repetidos (mismo submission_id) ────────────────────────────────────────────────── */

const DEDUPE_MS = 10 * 60_000;
const DEDUPE_MAX = 200;
/** @type {Map<string, { t: number, status: number, body: unknown }>} */
const hechos = new Map();
/** @type {Map<string, Promise<{ status: number, body: unknown, headers?: Record<string, string> }>>} */
const enCurso = new Map();

/** @param {unknown} id */
export function validSubmissionId(id) {
  return typeof id === 'string' && /^[A-Za-z0-9-]{8,64}$/.test(id) && /[0-9a-fA-F]{6}/.test(id.replace(/-/g, ''));
}

/**
 * Ejecuta `run` una sola vez por submission_id: guarda 10 min (200 entradas) las respuestas 200 y
 * comparte la promesa si llega un segundo envío mientras el primero sigue en curso.
 * Las respuestas que no son 200 no se guardan (el modal reintenta con el mismo id).
 * @template {{ status: number, body: unknown, headers?: Record<string, string> }} R
 * @param {string} id
 * @param {() => Promise<R>} run
 * @returns {Promise<R | { status: number, body: unknown }>}
 */
export async function once(id, run) {
  const now = Date.now();
  for (const [k, v] of hechos) {
    if (now - v.t < DEDUPE_MS) break;
    hechos.delete(k);
  }
  const prev = hechos.get(id);
  if (prev && now - prev.t < DEDUPE_MS) return { status: prev.status, body: prev.body };
  const vivo = enCurso.get(id);
  if (vivo) return vivo;
  const p = run();
  enCurso.set(id, p);
  try {
    const r = await p;
    if (r.status === 200) {
      hechos.set(id, { t: Date.now(), status: r.status, body: r.body });
      while (hechos.size > DEDUPE_MAX) hechos.delete(/** @type {string} */ (hechos.keys().next().value));
    }
    return r;
  } finally {
    enCurso.delete(id);
  }
}

/** Solo pruebas: olvida los envíos recordados. */
export function __resetCotizar() {
  hechos.clear();
  enCurso.clear();
}
