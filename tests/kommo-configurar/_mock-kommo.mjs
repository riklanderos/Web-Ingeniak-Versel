// Simulador local de la API v4 de Kommo (solo lo que usa scripts/kommo-configurar.mjs). No es un archivo de prueba.
// Escucha en 127.0.0.1 con un puerto libre; nunca habla con Kommo real. El token es de mentira.
// Imita lo que dice la documentación oficial (developers.kommo.com, consultada 2026-10-20):
//  · 401 sin «Authorization: Bearer <token>» correcto; 204 cuando una lista está vacía; paginación con _links.next.
//  · POST /leads/pipelines exige name, sort, is_main, is_unsorted_on; los colores de etapa deben ser de la paleta;
//    agrega «Incoming leads» (si is_unsorted_on) y las etapas de sistema 142 y 143.
//  · PATCH /leads/custom_fields/{id}: las opciones (enums) que no se manden con su id SE BORRAN (como en Kommo).
//  · POST /leads/tags con un nombre que ya existe devuelve el id existente.
//  · GET /chats/templates: máximo 50 por página y solo las plantillas creadas por la integración.
//  · GET /account solo trae _embedded.datetime_settings (zona horaria) si se pide con ?with=datetime_settings.
import { createServer } from 'node:http';
import { COLORES_ETAPA } from '../../shared/kommo-esquema.js';

export const TOKEN_PRUEBA = 'tok-SIMULADO-no-real-7f3a9c2e1b4d5a6f';

let ultimoId = 5_000_000;
const nuevoId = () => ++ultimoId;

/** Embudo de ejemplo con sus etapas (para estados iniciales). */
export function embudo(nombre, etapas = [], { id = nuevoId(), sort = 1, is_main = false, is_unsorted_on = true, color = '#99ccff' } = {}) {
  const statuses = [];
  if (is_unsorted_on) statuses.push({ id: nuevoId(), name: 'Incoming leads', sort: 10, is_editable: false, pipeline_id: id, color: '#c1c1c1', type: 1 });
  etapas.forEach((n, i) => statuses.push({ id: nuevoId(), name: n, sort: (i + 2) * 10, is_editable: true, pipeline_id: id, color, type: 0 }));
  statuses.push({ id: 142, name: 'Closed - won', sort: 10000, is_editable: false, pipeline_id: id, color: '#CCFF66', type: 0 });
  statuses.push({ id: 143, name: 'Closed - lost', sort: 11000, is_editable: false, pipeline_id: id, color: '#D5D8DB', type: 0 });
  return { id, name: nombre, sort, is_main, is_unsorted_on, is_archive: false, account_id: 31000001, _embedded: { statuses } };
}

/** Campo de lead de ejemplo. */
export function campo(nombre, tipo, opciones = null, { code = null } = {}) {
  return {
    id: nuevoId(),
    name: nombre,
    type: tipo,
    code,
    sort: 500,
    is_api_only: false,
    enums: opciones ? opciones.map((v, i) => ({ id: nuevoId(), value: v, sort: (i + 1) * 10 })) : null,
  };
}

const TRACKING = ['UTM_SOURCE', 'UTM_MEDIUM', 'UTM_CAMPAIGN', 'UTM_CONTENT', 'UTM_TERM', 'REFERRER', 'GCLID', 'FBCLID'];
const TIPOS = ['text', 'numeric', 'checkbox', 'select', 'multiselect', 'date', 'url', 'textarea', 'radiobutton', 'streetaddress', 'smart_address', 'birthday', 'legal_entity', 'date_time', 'price', 'category', 'file', 'chained_list', 'tracking_data', 'linked_entity', 'monetary'];

/**
 * @param {{token?: string, estado?: object, tamPagina?: number}} [o]
 *   estado: { cuenta, pipelines, campos, tags, plantillas, usuarios } (lo que no se dé, toma un valor por defecto)
 *   tamPagina: tope de elementos por página que aplica el simulador aunque se pidan más (prueba la paginación)
 */
export async function crearMockKommo({ token = TOKEN_PRUEBA, estado = {}, tamPagina = Infinity } = {}) {
  const st = {
    cuenta: {
      id: 31000001,
      name: 'Ingeniak (simulada)',
      subdomain: 'ejemplo',
      current_user_id: 9001,
      // Solo se devuelve con ?with=datetime_settings (developers.kommo.com/reference/account-parameters).
      _embedded: {
        datetime_settings: { date_pattern: 'd.m.Y H:i', short_date_pattern: 'd.m.Y', short_time_pattern: 'H:i', date_format: 'd.m.Y', time_format: 'H:i:s', timezone: 'America/Mexico_City', timezone_offset: '-06:00' },
      },
      ...(estado.cuenta ?? {}),
    },
    pipelines: estado.pipelines ?? [embudo('Embudo de ventas', ['Contacto inicial', 'En negociación'], { is_main: true })],
    campos: estado.campos ?? TRACKING.map((c) => campo(c.toLowerCase(), 'tracking_data', null, { code: c })),
    tags: estado.tags ?? [],
    plantillas: estado.plantillas ?? [],
    usuarios: estado.usuarios ?? [
      { id: 9001, name: 'Rik Landeros', email: 'rik@ejemplo.test', lang: 'es', rights: { is_admin: true, is_active: true } },
      { id: 9002, name: 'Ana Ventas', email: 'ana@ejemplo.test', lang: 'es', rights: { is_admin: false, is_active: true } },
      { id: 9003, name: 'Ex colaborador', email: 'ex@ejemplo.test', lang: 'es', rights: { is_admin: false, is_active: false } },
    ],
  };
  /** @type {{t: number, metodo: string, ruta: string, query: Record<string,string>, cuerpo: any, autorizado: boolean, contentType: string}[]} */
  const peticiones = [];
  /** Fallas programadas: { metodo?, ruta: string|RegExp, veces?, status, cuerpo?, cabeceras?, si?(cuerpo) } */
  const fallas = [];

  const servidor = createServer(async (req, res) => {
    const u = new URL(req.url ?? '/', 'http://127.0.0.1');
    const chunks = [];
    for await (const c of req) chunks.push(c);
    const crudo = Buffer.concat(chunks).toString('utf8');
    let cuerpo = null;
    if (crudo) {
      try {
        cuerpo = JSON.parse(crudo);
      } catch {
        cuerpo = { __invalido: crudo };
      }
    }
    const ruta = u.pathname.replace(/^\/api\/v4/, '').replace(/\/+$/, '') || '/';
    const metodo = req.method ?? 'GET';
    const autorizado = req.headers.authorization === `Bearer ${token}`;
    peticiones.push({ t: Date.now(), metodo, ruta, query: Object.fromEntries(u.searchParams), cuerpo, autorizado, contentType: String(req.headers['content-type'] ?? '') });

    const enviar = (status, datos, cabeceras = {}) => {
      if (status === 204 || datos === undefined) {
        res.writeHead(status, cabeceras);
        return res.end();
      }
      const tipo = status >= 400 ? 'application/problem+json' : 'application/hal+json';
      res.writeHead(status, { 'content-type': tipo, ...cabeceras });
      res.end(typeof datos === 'string' ? datos : JSON.stringify(datos));
    };
    const problema = (status, detail, extra = {}) => enviar(status, { title: String(status), type: `https://httpstatus.es/${status}`, status, detail, ...extra });
    const validacion = (errores) => enviar(400, { 'validation-errors': [{ request_id: '0', errors: errores }], title: 'Bad Request', type: 'https://httpstatus.es/400', status: 400, detail: 'Request validation failed' });

    // 1) Fallas programadas por la prueba.
    const falla = fallas.find(
      (f) => (f.veces ?? Infinity) > 0 && (!f.metodo || f.metodo === metodo) && (typeof f.ruta === 'string' ? ruta === f.ruta : f.ruta.test(ruta)) && (!f.si || f.si(cuerpo)),
    );
    if (falla) {
      falla.veces = (falla.veces ?? Infinity) - 1;
      return enviar(falla.status, falla.cuerpo === undefined ? { title: 'Error', status: falla.status } : falla.cuerpo, falla.cabeceras ?? {});
    }
    // 2) Autorización.
    if (!autorizado) return problema(401, 'Invalid user name or password');
    // 3) Cuerpo JSON en escrituras.
    if (metodo !== 'GET') {
      if (!/application\/json/.test(String(req.headers['content-type'] ?? ''))) return problema(400, 'Content-Type must be application/json');
      if (!cuerpo || cuerpo.__invalido) return problema(400, 'Request data can not be empty');
    }

    const paginar = (lista, clave, limiteMax = 250) => {
      const limit = Number(u.searchParams.get('limit') ?? 50);
      const page = Number(u.searchParams.get('page') ?? 1);
      if (limit > limiteMax) return problema(422, `Limit ${limiteMax} per page`);
      const tam = Math.min(limit, tamPagina);
      const trozo = lista.slice((page - 1) * tam, page * tam);
      if (!trozo.length) return enviar(204);
      const links = { self: { href: `${u.origin}${u.pathname}?limit=${limit}&page=${page}` } };
      if (page * tam < lista.length) links.next = { href: `${u.origin}${u.pathname}?limit=${limit}&page=${page + 1}` };
      return enviar(200, { _page: page, _links: links, _embedded: { [clave]: trozo } });
    };

    let m;
    if (metodo === 'GET' && ruta === '/account') {
      const con = String(u.searchParams.get('with') ?? '').split(',');
      const { _embedded: emb = {}, ...cuenta } = st.cuenta;
      const embebido = Object.fromEntries(Object.entries(emb).filter(([k]) => con.includes(k)));
      return enviar(200, Object.keys(embebido).length ? { ...cuenta, _embedded: embebido } : cuenta);
    }

    if (metodo === 'GET' && ruta === '/leads/pipelines') return enviar(200, { _total_items: st.pipelines.length, _embedded: { pipelines: st.pipelines } });

    if (metodo === 'POST' && ruta === '/leads/pipelines') {
      if (!Array.isArray(cuerpo)) return problema(400, 'Body must be an array');
      const errores = [];
      for (const p of cuerpo) for (const k of ['name', 'sort', 'is_main', 'is_unsorted_on']) if (p[k] === undefined) errores.push({ code: 'FieldMissing', path: k, detail: 'This field is missing.' });
      for (const p of cuerpo) for (const s of p._embedded?.statuses ?? []) if (s.color && !COLORES_ETAPA.includes(s.color)) errores.push({ code: 'InvalidColor', path: 'color', detail: 'Invalid color' });
      if (errores.length) return validacion(errores);
      if (st.pipelines.length + cuerpo.length > 50) return problema(422, 'Pipelines limit exceeded');
      const creados = cuerpo.map((p, i) => {
        const id = nuevoId();
        const statuses = [];
        if (p.is_unsorted_on) statuses.push({ id: nuevoId(), name: 'Incoming leads', sort: 10, is_editable: false, pipeline_id: id, color: '#c1c1c1', type: 1 });
        [...(p._embedded?.statuses ?? [])]
          .filter((s) => s.id !== 142 && s.id !== 143)
          .sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0))
          .forEach((s, j) => statuses.push({ id: nuevoId(), name: s.name, sort: (j + 2) * 10, is_editable: true, pipeline_id: id, color: s.color ?? '#99ccff', type: 0 }));
        statuses.push({ id: 142, name: 'Logrado con éxito', sort: 10000, is_editable: false, pipeline_id: id, color: '#CCFF66', type: 0 });
        statuses.push({ id: 143, name: 'Venta perdida', sort: 11000, is_editable: false, pipeline_id: id, color: '#D5D8DB', type: 0 });
        if (p.is_main) for (const otro of st.pipelines) otro.is_main = false;
        const nuevo = { id, name: p.name, sort: p.sort, is_main: p.is_main, is_unsorted_on: p.is_unsorted_on, is_archive: false, account_id: st.cuenta.id, request_id: String(i), _embedded: { statuses } };
        st.pipelines.push(nuevo);
        return nuevo;
      });
      return enviar(200, { _total_items: creados.length, _embedded: { pipelines: creados } });
    }

    if (metodo === 'POST' && (m = ruta.match(/^\/leads\/pipelines\/(\d+)\/statuses$/))) {
      const p = st.pipelines.find((x) => x.id === Number(m[1]));
      if (!p) return problema(404, 'Pipeline not found');
      if (!Array.isArray(cuerpo)) return problema(400, 'Body must be an array');
      const errores = [];
      for (const s of cuerpo) {
        if (!s.name) errores.push({ code: 'FieldMissing', path: 'name', detail: 'This field is missing.' });
        if (s.sort === undefined) errores.push({ code: 'FieldMissing', path: 'sort', detail: 'This field is missing.' });
        if (s.color && !COLORES_ETAPA.includes(s.color)) errores.push({ code: 'InvalidColor', path: 'color', detail: 'Invalid color' });
      }
      if (errores.length) return validacion(errores);
      const nuevos = cuerpo.map((s, i) => ({ id: nuevoId(), name: s.name, sort: s.sort, is_editable: true, pipeline_id: p.id, color: s.color ?? '#99ccff', type: 0, request_id: String(i) }));
      p._embedded.statuses.push(...nuevos);
      return enviar(200, { _total_items: nuevos.length, _embedded: { statuses: nuevos } });
    }

    if (metodo === 'GET' && ruta === '/leads/custom_fields') return paginar(st.campos, 'custom_fields');

    if (metodo === 'GET' && (m = ruta.match(/^\/leads\/custom_fields\/(\d+)$/))) {
      const c = st.campos.find((x) => x.id === Number(m[1]));
      return c ? enviar(200, c) : problema(404, 'Field not found');
    }

    if (metodo === 'POST' && ruta === '/leads/custom_fields') {
      if (!Array.isArray(cuerpo)) return problema(400, 'Body must be an array');
      const errores = [];
      for (const c of cuerpo) {
        if (!c.name) errores.push({ code: 'FieldMissing', path: 'name', detail: 'This field is missing.' });
        if (!TIPOS.includes(c.type)) errores.push({ code: 'NotSupportedChoice', path: 'type', detail: 'The value you selected is not a valid choice.' });
        if (['select', 'multiselect', 'radiobutton'].includes(c.type) && !(Array.isArray(c.enums) && c.enums.length)) errores.push({ code: 'FieldMissing', path: 'enums', detail: 'This field is missing.' });
        if (!['select', 'multiselect', 'radiobutton'].includes(c.type) && c.enums) errores.push({ code: 'NotSupported', path: 'enums', detail: 'Enums are not supported for this type.' });
      }
      if (errores.length) return validacion(errores);
      const creados = cuerpo.map((c, i) => {
        const nuevo = {
          id: nuevoId(),
          name: c.name,
          type: c.type,
          code: c.code ?? null,
          sort: c.sort ?? 510,
          is_api_only: false,
          enums: c.enums ? c.enums.map((e) => ({ id: nuevoId(), value: e.value, sort: e.sort ?? 500 })) : null,
          request_id: String(i),
        };
        st.campos.push(nuevo);
        return nuevo;
      });
      return enviar(201, { _total_items: creados.length, _embedded: { custom_fields: creados } });
    }

    if (metodo === 'PATCH' && (m = ruta.match(/^\/leads\/custom_fields\/(\d+)$/))) {
      const c = st.campos.find((x) => x.id === Number(m[1]));
      if (!c) return problema(404, 'Field not found');
      if (Array.isArray(cuerpo)) return problema(400, 'Body must be an object');
      if (cuerpo.enums) {
        const errores = [];
        for (const e of cuerpo.enums) if (e.id !== undefined && !(c.enums ?? []).some((x) => x.id === e.id)) errores.push({ code: 'NotFound', path: 'enums.id', detail: 'Enum not found' });
        if (errores.length) return validacion(errores);
        // Como Kommo: la lista enviada REEMPLAZA a la anterior; lo que no venga con su id se borra.
        c.enums = cuerpo.enums.map((e) => (e.id !== undefined ? { id: e.id, value: e.value ?? c.enums.find((x) => x.id === e.id).value, sort: e.sort ?? 500 } : { id: nuevoId(), value: e.value, sort: e.sort ?? 500 }));
      }
      if (cuerpo.name) c.name = cuerpo.name;
      return enviar(200, { _total_items: 1, _embedded: { custom_fields: [c] } });
    }

    if (metodo === 'GET' && ruta === '/leads/tags') return paginar(st.tags, 'tags');

    if (metodo === 'POST' && ruta === '/leads/tags') {
      if (!Array.isArray(cuerpo)) return problema(400, 'Body must be an array');
      const res2 = cuerpo.map((t, i) => {
        if (!t.name) return null;
        let tag = st.tags.find((x) => x.name.toLowerCase() === String(t.name).toLowerCase());
        if (!tag) {
          tag = { id: nuevoId(), name: t.name, color: t.color ?? null };
          st.tags.push(tag);
        }
        return { id: tag.id, name: tag.name, request_id: String(i) };
      });
      if (res2.includes(null)) return validacion([{ code: 'FieldMissing', path: 'name', detail: 'This field is missing.' }]);
      return enviar(200, { _total_items: res2.length, _embedded: { tags: res2 } });
    }

    if (metodo === 'GET' && ruta === '/chats/templates') {
      return paginar(
        st.plantillas.filter((p) => p.deIntegracion !== false),
        'chat_templates',
        50,
      );
    }

    if (metodo === 'POST' && ruta === '/chats/templates') {
      if (!Array.isArray(cuerpo)) return problema(400, 'Body must be an array');
      const errores = [];
      for (const p of cuerpo) for (const k of ['name', 'content']) if (!p[k]) errores.push({ code: 'FieldMissing', path: k, detail: 'This field is missing.' });
      if (errores.length) return validacion(errores);
      const creadas = cuerpo.map((p, i) => {
        const nueva = {
          id: nuevoId(),
          account_id: st.cuenta.id,
          name: p.name,
          content: p.content,
          is_editable: p.is_editable ?? false,
          external_id: p.external_id ?? null,
          type: p.type ?? null,
          buttons: p.buttons ?? [],
          attachment: null,
          created_at: 1760900000,
          updated_at: 1760900000,
          request_id: String(i),
          deIntegracion: true,
        };
        st.plantillas.push(nueva);
        return nueva;
      });
      return enviar(200, { _total_items: creadas.length, _embedded: { chat_templates: creadas } });
    }

    if (metodo === 'GET' && ruta === '/users') return paginar(st.usuarios, 'users');

    return problema(404, `Cannot ${metodo} ${u.pathname}`);
  });

  await new Promise((ok) => servidor.listen(0, '127.0.0.1', ok));
  const { port } = /** @type {import('node:net').AddressInfo} */ (servidor.address());
  return {
    url: `http://127.0.0.1:${port}`,
    estado: st,
    peticiones,
    fallas,
    /** Peticiones que cambian algo (POST/PATCH/PUT/DELETE). */
    cambios: () => peticiones.filter((p) => p.metodo !== 'GET'),
    cerrar: () => new Promise((ok) => servidor.close(() => ok())),
  };
}
