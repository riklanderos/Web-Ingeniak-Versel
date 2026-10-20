// Simulador LOCAL de Kommo (API v4) para las pruebas (no es un archivo de prueba). Servidor HTTP en 127.0.0.1 con un
// puerto al azar y estado en memoria: embudos con etapas, campos del lead (paginados), contactos, leads y notas.
// Nunca habla con Kommo real; el token es de mentira. Valida como Kommo: un field_id, enum_id, pipeline_id o status_id
// que la cuenta no tiene → 400 y no guarda nada. Así cualquier id inventado por el sitio hace fallar la prueba.
// La estructura sale de shared/kommo-esquema.js (la misma que crea el script de configuración).
import { createServer } from 'node:http';
import { CAMPOS, EMBUDOS } from '../../shared/kommo-esquema.js';

/** Token de mentira que acepta el simulador. */
export const TOKEN_SIMULADO = 'tok-simulador-no-real-000';
/** `fetch` original (antes de que una prueba lo simule): para dejar pasar las llamadas al simulador. */
const fetchReal = globalThis.fetch;

const RASTREO = ['UTM_SOURCE', 'UTM_MEDIUM', 'UTM_CAMPAIGN', 'UTM_TERM', 'UTM_CONTENT', 'UTM_REFERRER', 'REFERRER', 'GCLID', 'FBCLID', 'GCLIENTID'];

/**
 * Cuenta de Kommo de mentira con la forma de la API (ids deterministas).
 * @param {{
 *   estructura?: boolean,                  // false: solo el embudo principal y los campos de rastreo (script sin correr)
 *   sinEmbudos?: string[], sinEtapas?: string[], sinCampos?: string[],
 *   sinOpciones?: Record<string, string[]>, // { 'Industria': ['Otra'] }
 *   tipos?: Record<string, string>,         // { 'Industria': 'text' } (campo creado a mano con otro tipo)
 * }} [o]
 */
export function cuentaSimulada(o = {}) {
  const conEstructura = o.estructura !== false;
  let sid = 50_000;
  const sistema = (pid) => [
    { id: 142, name: 'Logrado con éxito', sort: 10000, type: 0, pipeline_id: pid, is_editable: false },
    { id: 143, name: 'Venta perdida', sort: 11000, type: 0, pipeline_id: pid, is_editable: false },
  ];
  /** @type {any[]} */
  const pipelines = [];
  const principal = 1000;
  pipelines.push({
    id: principal, name: 'Embudo de ventas', sort: 1, is_main: true, is_archive: false,
    statuses: [
      { id: ++sid, name: 'Leads entrantes', sort: 10, type: 1, pipeline_id: principal, is_editable: false },
      { id: ++sid, name: 'Contacto inicial', sort: 20, type: 0, pipeline_id: principal, is_editable: true },
      ...sistema(principal),
    ],
  });
  if (conEstructura) {
    let pid = principal;
    for (const e of Object.values(EMBUDOS)) {
      pid += 1;
      if (o.sinEmbudos?.includes(e.nombre)) continue;
      const etapas = e.etapas
        .filter((s) => !o.sinEtapas?.includes(s.nombre))
        .map((s, i) => ({ id: ++sid, name: s.nombre, sort: 20 + i * 10, type: 0, pipeline_id: pid, is_editable: true }));
      pipelines.push({
        id: pid, name: e.nombre, sort: pid - principal + 1, is_main: false, is_archive: false,
        statuses: [{ id: ++sid, name: 'Leads entrantes', sort: 10, type: 1, pipeline_id: pid, is_editable: false }, ...etapas, ...sistema(pid)],
      });
    }
    // Un embudo archivado con el mismo nombre no debe confundir al sitio.
    pipelines.push({ id: 1900, name: EMBUDOS.cotizaciones.nombre, sort: 99, is_main: false, is_archive: true, statuses: [{ id: 59_999, name: 'Nueva cotización', sort: 20, type: 0, pipeline_id: 1900 }] });
  }
  /** @type {any[]} */
  const campos = [];
  let fid = 600;
  for (const code of RASTREO) campos.push({ id: ++fid, name: code, type: 'tracking_data', code, sort: fid, enums: null });
  campos.push({ id: ++fid, name: 'Notas internas', type: 'textarea', code: null, sort: fid, enums: null });
  if (conEstructura) {
    let base = 7000;
    for (const def of Object.values(CAMPOS)) {
      base += 100;
      if (o.sinCampos?.includes(def.nombre)) continue;
      const opciones = /** @type {string[] | undefined} */ (/** @type {any} */ (def).opciones);
      const quitar = o.sinOpciones?.[def.nombre] ?? [];
      campos.push({
        id: base,
        name: def.nombre,
        type: o.tipos?.[def.nombre] ?? def.tipo,
        code: null,
        sort: base,
        enums: opciones ? opciones.map((v, j) => ({ id: base * 10 + j + 1, value: v, sort: (j + 1) * 10 })).filter((x) => !quitar.includes(x.value)) : null,
      });
    }
  }
  return { pipelines, campos };
}

/** Busca ids por nombre en una cuenta simulada (para las aserciones). */
export class Ids {
  /** @param {{ pipelines: any[], campos: any[] }} cuenta */
  constructor(cuenta) {
    this.cuenta = cuenta;
  }
  /** @param {string} nombre */
  embudo(nombre) {
    return this.cuenta.pipelines.find((p) => p.name === nombre && !p.is_archive)?.id;
  }
  /** @param {string} embudo @param {string} etapa */
  etapa(embudo, etapa) {
    return this.cuenta.pipelines.find((p) => p.name === embudo && !p.is_archive)?.statuses.find((s) => s.name === etapa)?.id;
  }
  /** @param {string} nombre */
  campo(nombre) {
    return this.cuenta.campos.find((f) => f.name === nombre)?.id;
  }
  /** @param {string} campo @param {string} opcion */
  opcion(campo, opcion) {
    return this.cuenta.campos.find((f) => f.name === campo)?.enums?.find((e) => e.value === opcion)?.id;
  }
  /** Todos los field_id que existen. */
  get camposIds() {
    return new Set(this.cuenta.campos.map((f) => f.id));
  }
}

const sendJson = (res, status, body) => {
  res.writeHead(status, { 'content-type': status >= 400 ? 'application/problem+json' : 'application/hal+json' });
  res.end(body === undefined ? '' : JSON.stringify(body));
};

/** 400 con la forma de Kommo (`validation-errors[].errors[].path`). */
const error400 = (errores) => ({
  title: 'Bad Request', type: 'https://httpstatus.es/400', status: 400, detail: 'Request validation failed',
  'validation-errors': [{ request_id: '0', errors: errores.map((path) => ({ code: 'NotSupportedChoice', path, detail: 'The value you have provided is not supported' })) }],
});

export class KommoSimulado {
  /**
   * @param {Parameters<typeof cuentaSimulada>[0] & { porPagina?: number, fallas?: Record<string, number>, lento?: Record<string, number> }} [o]
   *   fallas: { '/leads/pipelines': 500 } responde ese estado; lento: { '/leads/pipelines': 5000 } espera esos ms.
   */
  constructor(o = {}) {
    this.cuenta = cuentaSimulada(o);
    this.ids = new Ids(this.cuenta);
    this.porPagina = o.porPagina ?? 250;
    this.fallas = { ...(o.fallas ?? {}) };
    this.lento = { ...(o.lento ?? {}) };
    /** @type {Map<number, any>} */
    this.leads = new Map();
    /** @type {any[]} */
    this.contactos = [];
    /** @type {{ entity_id: number, text: string }[]} */
    this.notas = [];
    /** @type {{ method: string, path: string, query: Record<string, string>, body: any, auth: boolean }[]} */
    this.llamadas = [];
    this.seq = { lead: 4241, contacto: 700, empresa: 900, nota: 0 };
    /** @type {import('node:http').Server | null} */
    this.server = null;
    this.base = '';
  }

  /** Arranca en 127.0.0.1 (puerto libre al azar). */
  async iniciar() {
    this.server = createServer((req, res) => {
      this.#atender(req, res).catch(() => sendJson(res, 500, { title: 'Internal' }));
    });
    await new Promise((ok) => this.server.listen(0, '127.0.0.1', ok));
    const { port } = /** @type {import('node:net').AddressInfo} */ (this.server.address());
    this.base = `http://127.0.0.1:${port}`;
    return this;
  }

  async detener() {
    if (!this.server) return;
    this.server.closeAllConnections?.();
    await new Promise((ok) => this.server.close(() => ok()));
    this.server = null;
  }

  /** Variables de entorno para apuntar el sitio a este simulador. */
  get vars() {
    return { KOMMO_BASE_URL: this.base, KOMMO_TOKEN: TOKEN_SIMULADO };
  }

  /** Para `mockFetch` de la agenda: deja pasar al simulador las llamadas a su URL (el resto lo atienden los demás). */
  pasarela() {
    return { handle: (/** @type {URL} */ u, /** @type {RequestInit} */ init) => (this.base && u.origin === this.base ? fetchReal(u.href, init) : null) };
  }

  /** Llamadas a una ruta (prefijo). @param {string} metodo @param {string} prefijo */
  llamadasA(metodo, prefijo) {
    return this.llamadas.filter((c) => c.method === metodo && c.path.startsWith(prefijo));
  }

  /* ── Lectura del estado (aserciones) ────────────────────────────────────────────────────── */

  /** { embudo, etapa } por nombre. @param {number} id */
  ubicacion(id) {
    const l = this.leads.get(id);
    const p = this.cuenta.pipelines.find((x) => x.id === l?.pipeline_id);
    return { embudo: p?.name ?? null, etapa: p?.statuses.find((s) => s.id === l?.status_id)?.name ?? null };
  }

  /** Campos del lead por nombre: select → etiqueta; multiselect → [etiquetas]; otros → valor. @param {number} id */
  valores(id) {
    const l = this.leads.get(id);
    /** @type {Record<string, unknown>} */
    const out = {};
    for (const [fieldId, values] of l?.campos ?? []) {
      const f = this.cuenta.campos.find((x) => x.id === fieldId);
      const etiquetas = values.map((v) => (v.enum_id ? f.enums.find((e) => e.id === v.enum_id)?.value : v.value));
      out[f.name] = f.type === 'multiselect' ? etiquetas : etiquetas[0];
    }
    return out;
  }

  /** @param {number} id */
  etiquetas(id) {
    return [...(this.leads.get(id)?.tags ?? [])];
  }

  /** @param {number} id */
  notasDe(id) {
    return this.notas.filter((n) => n.entity_id === id).map((n) => n.text);
  }

  /** Quita una opción de un campo (como si el cliente la borrara en Kommo). @param {string} campo @param {string} opcion */
  quitarOpcion(campo, opcion) {
    const f = this.cuenta.campos.find((x) => x.name === campo);
    if (f?.enums) f.enums = f.enums.filter((e) => e.value !== opcion);
  }

  /* ── Servidor ───────────────────────────────────────────────────────────────────────────── */

  /** @param {import('node:http').IncomingMessage} req @param {import('node:http').ServerResponse} res */
  async #atender(req, res) {
    const u = new URL(req.url ?? '/', this.base);
    const method = (req.method ?? 'GET').toUpperCase();
    const chunks = [];
    for await (const ch of req) chunks.push(ch);
    const raw = Buffer.concat(chunks).toString('utf8');
    let body;
    try {
      body = raw ? JSON.parse(raw) : undefined;
    } catch {
      return sendJson(res, 400, { title: 'Bad Request', detail: 'JSON inválido' });
    }
    const path = u.pathname.replace(/^\/api\/v4/, '');
    const auth = req.headers.authorization === `Bearer ${TOKEN_SIMULADO}`;
    this.llamadas.push({ method, path, query: Object.fromEntries(u.searchParams), body, auth });
    if (!u.pathname.startsWith('/api/v4/')) return sendJson(res, 404, { title: 'Not Found' });
    if (!auth) return sendJson(res, 401, { title: 'Unauthorized', status: 401 });
    const espera = Object.entries(this.lento).find(([p]) => path.startsWith(p))?.[1];
    if (espera) await new Promise((ok) => setTimeout(ok, espera));
    const falla = Object.entries(this.fallas).find(([p]) => path.startsWith(p))?.[1];
    if (falla) return sendJson(res, falla, { title: 'Simulated', status: falla });

    if (method === 'GET' && path === '/leads/pipelines') {
      const pipelines = this.cuenta.pipelines.map(({ statuses, ...p }) => ({ ...p, account_id: 1, _embedded: { statuses } }));
      return sendJson(res, 200, { _total_items: pipelines.length, _links: { self: { href: `${this.base}/api/v4/leads/pipelines` } }, _embedded: { pipelines } });
    }
    if (method === 'GET' && path === '/leads/custom_fields') {
      const limit = Math.min(Number(u.searchParams.get('limit')) || 50, 250, this.porPagina);
      const page = Math.max(1, Number(u.searchParams.get('page')) || 1);
      const rows = this.cuenta.campos.slice((page - 1) * limit, page * limit);
      if (!rows.length) return sendJson(res, 204);
      const hay = page * limit < this.cuenta.campos.length;
      const href = (p) => ({ href: `${this.base}/api/v4/leads/custom_fields?limit=${limit}&page=${p}` });
      return sendJson(res, 200, {
        _total_items: rows.length, _page: page,
        _links: { self: href(page), ...(hay ? { next: href(page + 1) } : {}) },
        _embedded: { custom_fields: rows.map((f) => ({ ...f, entity_type: 'leads', is_api_only: false })) },
      });
    }
    if (method === 'GET' && path === '/contacts') {
      const q = (u.searchParams.get('query') ?? '').toLowerCase();
      const qd = q.replace(/\D/g, '');
      const hits = this.contactos.filter((c) => c.email === q || (qd.length >= 10 && c.phone.replace(/\D/g, '') === qd));
      if (!hits.length) return sendJson(res, 204);
      return sendJson(res, 200, {
        _embedded: {
          contacts: hits.map((c) => ({
            id: c.id, name: c.name,
            custom_fields_values: [
              { field_code: 'EMAIL', values: [{ value: c.email, enum_code: 'WORK' }] },
              { field_code: 'PHONE', values: [{ value: c.phone, enum_code: 'MOB' }] },
            ],
          })),
        },
      });
    }
    if (method === 'POST' && path === '/leads/complex') {
      if (!Array.isArray(body) || body.length !== 1) return sendJson(res, 400, error400(['0']));
      const l = body[0];
      const errores = this.#validar(l, null);
      const cont = l?._embedded?.contacts?.[0];
      if (cont?.id && !this.contactos.some((c) => c.id === cont.id)) errores.push('_embedded.contacts.0.id');
      if (errores.length) return sendJson(res, 400, error400(errores));
      let contactId = cont?.id;
      if (!contactId) {
        const cf = cont?.custom_fields_values ?? [];
        const v = (code) => cf.find((x) => x.field_code === code)?.values?.[0]?.value ?? '';
        contactId = ++this.seq.contacto;
        this.contactos.push({ id: contactId, name: cont?.name ?? '', email: String(v('EMAIL')).toLowerCase(), phone: String(v('PHONE')) });
      }
      const id = ++this.seq.lead;
      const p = this.#embudo(l.pipeline_id) ?? this.#principal();
      const lead = {
        id, name: l.name, pipeline_id: p.id, status_id: l.status_id ?? p.statuses.find((s) => s.type === 0)?.id,
        responsible_user_id: l.responsible_user_id ?? null, contact_id: contactId,
        campos: new Map(), tags: new Set((l._embedded?.tags ?? []).map((t) => t.name)),
      };
      this.#aplicarCampos(lead, l.custom_fields_values);
      this.leads.set(id, lead);
      return sendJson(res, 200, [{ id, contact_id: contactId, company_id: l._embedded?.companies ? ++this.seq.empresa : null, request_id: ['0'], merged: false }]);
    }
    if (method === 'POST' && path === '/leads/notes') {
      if (!Array.isArray(body) || body.some((n) => !this.leads.has(n?.entity_id) || n.note_type !== 'common' || typeof n.params?.text !== 'string')) {
        return sendJson(res, 400, error400(['0.entity_id']));
      }
      const notes = body.map((n) => {
        this.notas.push({ entity_id: n.entity_id, text: n.params.text });
        return { id: ++this.seq.nota, entity_id: n.entity_id };
      });
      return sendJson(res, 200, { _embedded: { notes } });
    }
    const m = /^\/leads\/(\d+)$/.exec(path);
    if (m) {
      const lead = this.leads.get(Number(m[1]));
      if (!lead) return sendJson(res, 404, { title: 'Not Found', status: 404 });
      if (method === 'GET') return sendJson(res, 200, { id: lead.id, name: lead.name, pipeline_id: lead.pipeline_id, status_id: lead.status_id });
      if (method === 'PATCH') {
        const errores = this.#validar(body, lead);
        if (errores.length) return sendJson(res, 400, error400(errores));
        if (body.pipeline_id !== undefined) lead.pipeline_id = body.pipeline_id;
        if (body.status_id !== undefined) lead.status_id = body.status_id;
        this.#aplicarCampos(lead, body.custom_fields_values);
        for (const t of body.tags_to_add ?? []) lead.tags.add(t.name);
        for (const t of body.tags_to_delete ?? []) lead.tags.delete(t.name);
        return sendJson(res, 200, { id: lead.id, updated_at: Math.floor(Date.now() / 1000) });
      }
    }
    return sendJson(res, 404, { title: 'Not Found' });
  }

  #principal() {
    return this.cuenta.pipelines.find((p) => p.is_main);
  }

  /** @param {unknown} id */
  #embudo(id) {
    return this.cuenta.pipelines.find((p) => p.id === id && !p.is_archive) ?? null;
  }

  /**
   * Validación de Kommo: embudo y etapa existentes (la etapa dentro de su embudo) y campos/opciones existentes.
   * @param {any} l  cuerpo del lead (complex) o del PATCH
   * @param {any} actual  lead existente (PATCH) o null
   * @returns {string[]} rutas con error
   */
  #validar(l, actual) {
    const errores = [];
    if (!l || typeof l !== 'object') return ['0'];
    if (l.pipeline_id !== undefined && !this.#embudo(l.pipeline_id)) errores.push('pipeline_id');
    if (l.status_id !== undefined) {
      const p = this.#embudo(l.pipeline_id ?? actual?.pipeline_id) ?? this.#principal();
      if (!p.statuses.some((s) => s.id === l.status_id)) errores.push('status_id');
    }
    const cfv = l.custom_fields_values;
    if (cfv !== undefined) {
      if (!Array.isArray(cfv) || cfv.length > 40) errores.push('custom_fields_values');
      else {
        cfv.forEach((c, i) => {
          const f = c?.field_id !== undefined ? this.cuenta.campos.find((x) => x.id === c.field_id) : this.cuenta.campos.find((x) => x.code && x.code === c?.field_code);
          if (!f) return errores.push(`custom_fields_values.${i}.field_id`);
          if (!Array.isArray(c.values) || !c.values.length) return errores.push(`custom_fields_values.${i}.values`);
          c.values.forEach((v, j) => {
            const ruta = `custom_fields_values.${i}.values.${j}`;
            if (f.type === 'select' || f.type === 'multiselect') {
              if (f.type === 'select' && c.values.length > 1) errores.push(ruta);
              if (!f.enums?.some((e) => e.id === v?.enum_id)) errores.push(`${ruta}.enum_id`);
            } else if (f.type === 'date_time' || f.type === 'date') {
              if (!Number.isSafeInteger(v?.value)) errores.push(`${ruta}.value`);
            } else if (f.type === 'url') {
              if (typeof v?.value !== 'string' || !/^https?:\/\//.test(v.value)) errores.push(`${ruta}.value`);
            } else if (typeof v?.value !== 'string') {
              errores.push(`${ruta}.value`);
            }
          });
        });
      }
    }
    return errores;
  }

  /** @param {any} lead @param {any[] | undefined} cfv */
  #aplicarCampos(lead, cfv) {
    for (const c of cfv ?? []) {
      const f = c.field_id !== undefined ? this.cuenta.campos.find((x) => x.id === c.field_id) : this.cuenta.campos.find((x) => x.code === c.field_code);
      lead.campos.set(f.id, c.values);
    }
  }
}
