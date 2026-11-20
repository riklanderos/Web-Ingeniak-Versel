// api/kommo/etapa.js · puente Kommo → GA4 (2026-11-19). Kommo y GA4 simulados con `fetch`: nunca sale a internet.
import test, { beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import handler, { idsDelWebhook, eventosPara, __resetEtapa } from '../../api/kommo/etapa.js';
import { __resetKommo } from '../../server/kommo.js';

const CLAVE = 'clave-de-prueba-0123456789abcdefghij';
const SECRETO_GA = 'ga-secreto-de-prueba';
const VARS = ['KOMMO_SUBDOMAIN', 'KOMMO_TOKEN', 'KOMMO_BASE_URL', 'KOMMO_WEBHOOK_SECRET', 'GA4_API_SECRET', 'GA4_MEASUREMENT_ID', 'VERCEL_ENV'];
const KOMMO = 'https://ingeniak.kommo.com/api/v4';
const CALIFICADO = 70_003;
const CONTACTADO = 70_002;

beforeEach(() => {
  __resetKommo();
  __resetEtapa();
});

/** @param {import('node:test').TestContext} t @param {Record<string, string>} vars */
function entorno(t, vars) {
  const prev = Object.fromEntries(VARS.map((k) => [k, process.env[k]]));
  for (const k of VARS) delete process.env[k];
  Object.assign(process.env, vars);
  t.after(() => {
    for (const k of VARS) {
      if (prev[k] === undefined) delete process.env[k];
      else process.env[k] = prev[k];
    }
  });
}

const configurado = { KOMMO_SUBDOMAIN: 'ingeniak', KOMMO_TOKEN: 'tok-falso', KOMMO_WEBHOOK_SECRET: CLAVE, GA4_API_SECRET: SECRETO_GA, VERCEL_ENV: 'production' };

/**
 * Kommo y GA4 de mentira. `lead` es lo que devuelve GET /leads/{id}.
 * @param {import('node:test').TestContext} t
 * @param {Record<string, any>} lead
 */
function simular(t, lead) {
  /** @type {{ method: string, url: string, body: any }[]} */
  const llamadas = [];
  const logs = [];
  t.mock.method(console, 'log', (...a) => logs.push(a.join(' ')));
  t.mock.method(globalThis, 'fetch', async (input, init = {}) => {
    const url = String(input);
    const method = (init.method ?? 'GET').toUpperCase();
    const body = typeof init.body === 'string' ? JSON.parse(init.body) : init.body;
    llamadas.push({ method, url, body });
    const r = (status, data) => new Response(data === undefined ? null : JSON.stringify(data), { status });
    if (url.startsWith('https://www.google-analytics.com/mp/collect')) return r(204);
    const path = url.slice(KOMMO.length);
    if (method === 'GET' && path.startsWith('/leads/pipelines')) {
      return r(200, {
        _embedded: {
          pipelines: [{
            id: 900, name: 'Ventas', is_main: true, is_archive: false,
            _embedded: { statuses: [
              { id: CONTACTADO, name: 'Contactado', type: 0 },
              { id: CALIFICADO, name: 'Calificado', type: 0 },
              { id: 142, name: 'Logrado con éxito', type: 0 },
            ] },
          }],
        },
      });
    }
    if (method === 'GET' && path.startsWith('/leads/custom_fields')) {
      return r(200, { _embedded: { custom_fields: [{ id: 510, code: 'GCLIENTID', name: 'gclientid', type: 'tracking_data' }, { id: 501, code: 'UTM_SOURCE', name: 'utm_source', type: 'tracking_data' }] } });
    }
    if (method === 'GET' && path === '/account') return r(200, { id: 1, currency: 'MXN' });
    if (method === 'GET' && /^\/leads\/\d+$/.test(path)) return r(200, { id: Number(path.split('/')[2]), pipeline_id: 900, ...lead });
    if (method === 'PATCH' && /^\/leads\/\d+$/.test(path)) return r(200, { id: Number(path.split('/')[2]) });
    throw new TypeError(`sin ruta simulada: ${method} ${url}`);
  });
  return { llamadas, logs };
}

/** @param {string} cuerpo @param {string} [clave] */
const aviso = (cuerpo, clave = CLAVE) =>
  new Request(`https://ingeniak.mx/api/kommo/etapa/?clave=${encodeURIComponent(clave)}`, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: cuerpo,
  });

const cambio = (id, status) => `leads%5Bstatus%5D%5B0%5D%5Bid%5D=${id}&leads%5Bstatus%5D%5B0%5D%5Bstatus_id%5D=${status}&leads%5Bstatus%5D%5B0%5D%5Bpipeline_id%5D=900&account%5Bsubdomain%5D=ingeniak`;

const rastreo = (ga = '123456789.1700000000', fuente = 'chatgpt.com') => [
  ...(ga ? [{ field_id: 510, field_code: 'GCLIENTID', values: [{ value: ga }] }] : []),
  { field_id: 501, field_code: 'UTM_SOURCE', values: [{ value: fuente }] },
];

test('idsDelWebhook · lee los ids de status/add/update, sin repetir ni basura', () => {
  const t = 'leads[status][0][id]=11&leads[status][1][id]=12&leads[add][0][id]=11&leads[status][2][id]=x1&otra[0][id]=99';
  assert.deepEqual(idsDelWebhook(new URLSearchParams(t).toString()), [11, 12]);
});

test('eventosPara · Calificado, ganado y lo ya enviado', () => {
  assert.deepEqual(eventosPara({ statusId: CALIFICADO, etapa: 'Calificado', tags: [] }), ['qualify_lead']);
  assert.deepEqual(eventosPara({ statusId: 142, etapa: 'Logrado con éxito', tags: [] }), ['qualify_lead', 'close_convert_lead']);
  assert.deepEqual(eventosPara({ statusId: 142, etapa: null, tags: ['ga-calificado'] }), ['close_convert_lead']);
  assert.deepEqual(eventosPara({ statusId: 142, etapa: null, tags: ['GA-Calificado', 'ga-venta'] }), []);
  assert.deepEqual(eventosPara({ statusId: CONTACTADO, etapa: 'Contactado', tags: [] }), []);
  // la etapa real del embudo CALIFICACIÓN lleva un detalle después del nombre
  assert.deepEqual(eventosPara({ statusId: CALIFICADO, etapa: 'Calificado · Agenda propuesta', tags: [] }), ['qualify_lead']);
  assert.deepEqual(eventosPara({ statusId: CALIFICADO, etapa: 'CALIFICADO - agenda', tags: [] }), ['qualify_lead']);
  assert.deepEqual(eventosPara({ statusId: CONTACTADO, etapa: 'No calificado', tags: [] }), []);
  assert.deepEqual(eventosPara({ statusId: CONTACTADO, etapa: 'Calificados fríos', tags: [] }), []);
});

test('sin clave en Vercel → 503 · clave incorrecta → 403 · GET → 405, sin llamar a nadie', async (t) => {
  const { llamadas } = simular(t, {});
  entorno(t, { ...configurado, KOMMO_WEBHOOK_SECRET: '' });
  assert.equal((await handler.fetch(aviso(cambio(5, 142)))).status, 503);
  entorno(t, configurado);
  assert.equal((await handler.fetch(aviso(cambio(5, 142), 'otra-clave'))).status, 403);
  assert.equal((await handler.fetch(new Request(`https://ingeniak.mx/api/kommo/etapa/?clave=${CLAVE}`))).status, 405);
  assert.equal(llamadas.length, 0);
});

test('lead ganado con ID de Analytics → qualify_lead + close_convert_lead con monto, fuente y etiquetas', async (t) => {
  entorno(t, configurado);
  const { llamadas, logs } = simular(t, { status_id: 142, price: 25000, custom_fields_values: rastreo(), _embedded: { tags: [{ name: 'web-cotizar' }] } });
  const r = await handler.fetch(aviso(cambio(321, 142)));
  assert.equal(r.status, 200);
  assert.deepEqual((await r.json()).leads, { 321: 'enviado:qualify_lead+close_convert_lead' });

  const ga = llamadas.filter((c) => c.url.startsWith('https://www.google-analytics.com/'));
  assert.equal(ga.length, 1);
  const u = new URL(ga[0].url);
  assert.equal(u.searchParams.get('measurement_id'), 'G-XF9G08CZJQ');
  assert.equal(u.searchParams.get('api_secret'), SECRETO_GA);
  assert.deepEqual(ga[0].body, {
    client_id: '123456789.1700000000',
    events: [
      { name: 'qualify_lead', params: { lead_source: 'chatgpt.com', kommo_embudo: 'Ventas' } },
      { name: 'close_convert_lead', params: { lead_source: 'chatgpt.com', kommo_embudo: 'Ventas', value: 25000, currency: 'MXN' } },
    ],
  });
  const patch = llamadas.find((c) => c.method === 'PATCH');
  assert.deepEqual(patch?.body, { tags_to_add: [{ name: 'ga-calificado' }, { name: 'ga-venta' }] });
  const todo = logs.join('\n');
  assert.doesNotMatch(todo, new RegExp(`${SECRETO_GA}|${CLAVE}|123456789\\.1700000000`), 'los logs no llevan claves ni client_id');
});

test('lead en Calificado → solo qualify_lead, sin monto', async (t) => {
  entorno(t, configurado);
  const { llamadas } = simular(t, { status_id: CALIFICADO, price: 9000, custom_fields_values: rastreo(), _embedded: { tags: [] } });
  const r = await handler.fetch(aviso(cambio(77, CALIFICADO)));
  assert.deepEqual((await r.json()).leads, { 77: 'enviado:qualify_lead' });
  const ga = llamadas.find((c) => c.url.startsWith('https://www.google-analytics.com/'));
  assert.deepEqual(ga?.body.events, [{ name: 'qualify_lead', params: { lead_source: 'chatgpt.com', kommo_embudo: 'Ventas' } }]);
});

test('ya enviado, otra etapa o sin ID de Analytics → no se manda nada a GA4', async (t) => {
  entorno(t, configurado);
  const casos = [
    [{ status_id: 142, custom_fields_values: rastreo(), _embedded: { tags: [{ name: 'ga-calificado' }, { name: 'ga-venta' }] } }, 'sin-cambio'],
    [{ status_id: CONTACTADO, custom_fields_values: rastreo(), _embedded: { tags: [] } }, 'sin-cambio'],
    [{ status_id: 142, custom_fields_values: rastreo(''), _embedded: { tags: [] } }, 'sin-id-analytics'],
  ];
  for (const [i, [lead, esperado]] of casos.entries()) {
    __resetKommo();
    await t.test(`${i} · ${esperado}`, async (tt) => {
      const { llamadas } = simular(tt, lead);
      const r = await handler.fetch(aviso(cambio(10, lead.status_id)));
      assert.deepEqual((await r.json()).leads, { 10: esperado });
      assert.equal(llamadas.filter((c) => c.url.includes('google-analytics')).length, 0);
      assert.equal(llamadas.filter((c) => c.method === 'PATCH').length, 0);
    });
  }
});

test('fuera de producción y sin GA4_API_SECRET → simulación, sin etiquetar', async (t) => {
  entorno(t, { ...configurado, GA4_API_SECRET: '', VERCEL_ENV: 'preview' });
  const { llamadas } = simular(t, { status_id: 142, price: 100, custom_fields_values: rastreo(), _embedded: { tags: [] } });
  const r = await handler.fetch(aviso(cambio(8, 142)));
  assert.deepEqual((await r.json()).leads, { 8: 'simulacion:qualify_lead+close_convert_lead' });
  assert.equal(llamadas.filter((c) => c.url.includes('google-analytics') || c.method === 'PATCH').length, 0);
});

// ---- Tres embudos de Ingeniak: solo PRESUPUESTOS es venta (2026-11-19) ----

test('eventosPara · ganar significa algo distinto en cada embudo', () => {
  const ganado = (embudo, tags = []) => eventosPara({ statusId: 142, etapa: 'Logrado con éxito', embudo, tags });
  assert.deepEqual(ganado('CALIFICACIÓN'), ['qualify_lead'], 'cita realizada: calificado, no venta');
  assert.deepEqual(ganado('CALIFICACIÓN', ['ga-calificado']), [], 'ya se había mandado al entrar a Calificado');
  assert.deepEqual(ganado('DISCOVERY SESSION'), ['working_lead'], 'cotizado: en negociación');
  assert.deepEqual(ganado('DISCOVERY SESSION', ['ga-negociacion']), []);
  assert.deepEqual(ganado('PRESUPUESTOS'), ['close_convert_lead'], 'contrató: la única venta');
  assert.deepEqual(ganado('PRESUPUESTOS', ['ga-venta']), []);
  for (const otro of ['CAMPAÑAS', 'NUTRICIÓN', 'CLIENTES', 'POWER SESSION', 'P0 · OUTBOUND B2B']) assert.deepEqual(ganado(otro), [], otro);
  assert.deepEqual(ganado('Ventas'), ['qualify_lead', 'close_convert_lead'], 'embudo único del esquema aprobado');
  assert.deepEqual(eventosPara({ statusId: CALIFICADO, etapa: 'Calificado · Agenda propuesta', embudo: 'CALIFICACIÓN', tags: [] }), ['qualify_lead']);
});

/**
 * Kommo con tres embudos y varios leads encadenados por «Lead de origen».
 * @param {import('node:test').TestContext} t
 * @param {Record<number, Record<string, any>>} leads
 */
function simularCadena(t, leads) {
  /** @type {{ method: string, url: string, body: any }[]} */
  const llamadas = [];
  t.mock.method(console, 'log', () => {});
  t.mock.method(globalThis, 'fetch', async (input, init = {}) => {
    const url = String(input);
    const method = (init.method ?? 'GET').toUpperCase();
    const body = typeof init.body === 'string' ? JSON.parse(init.body) : init.body;
    llamadas.push({ method, url, body });
    const r = (status, data) => new Response(data === undefined ? null : JSON.stringify(data), { status });
    if (url.startsWith('https://www.google-analytics.com/mp/collect')) return r(204);
    const path = url.slice(KOMMO.length);
    const etapas = { _embedded: { statuses: [{ id: 1, name: 'Nuevo', type: 0 }, { id: 142, name: 'Logrado con éxito', type: 0 }] } };
    if (method === 'GET' && path.startsWith('/leads/pipelines')) {
      return r(200, { _embedded: { pipelines: [
        { id: 901, name: 'CALIFICACIÓN', is_main: true, is_archive: false, ...etapas },
        { id: 902, name: 'DISCOVERY SESSION', is_main: false, is_archive: false, ...etapas },
        { id: 903, name: 'PRESUPUESTOS', is_main: false, is_archive: false, ...etapas },
      ] } });
    }
    if (method === 'GET' && path.startsWith('/leads/custom_fields')) {
      return r(200, { _embedded: { custom_fields: [{ id: 510, code: 'GCLIENTID', name: 'gclientid', type: 'tracking_data' }, { id: 501, code: 'UTM_SOURCE', name: 'utm_source', type: 'tracking_data' }] } });
    }
    if (method === 'GET' && path === '/account') return r(200, { id: 1, currency: 'USD' });
    const m = /^\/leads\/(\d+)$/.exec(path);
    if (m && method === 'GET') return leads[Number(m[1])] ? r(200, { id: Number(m[1]), ...leads[Number(m[1])] }) : r(404, {});
    if (m && method === 'PATCH') return r(200, { id: Number(m[1]) });
    throw new TypeError(`sin ruta simulada: ${method} ${url}`);
  });
  return { llamadas };
}

const origen = (id) => ({ field_id: 777, field_name: 'Lead de origen', field_type: 'url', values: [{ value: `https://ingeniak.kommo.com/leads/detail/${id}` }] });

test('ganado en PRESUPUESTOS sin ID propio → lo toma del lead de origen (dos saltos) y manda solo la venta', async (t) => {
  entorno(t, configurado);
  const { llamadas } = simularCadena(t, {
    31: { pipeline_id: 903, status_id: 142, price: 4500, custom_fields_values: [origen(21)], _embedded: { tags: [] } },
    21: { pipeline_id: 902, status_id: 142, price: 0, custom_fields_values: [origen(11)], _embedded: { tags: [] } },
    11: { pipeline_id: 901, status_id: 142, price: 0, custom_fields_values: rastreo('555.666', 'chatgpt.com'), _embedded: { tags: ['ga-calificado'] } },
  });
  const r = await handler.fetch(aviso(cambio(31, 142)));
  assert.deepEqual((await r.json()).leads, { 31: 'enviado:close_convert_lead' });
  const ga = llamadas.find((c) => c.url.startsWith('https://www.google-analytics.com/'));
  assert.equal(ga?.body.client_id, '555.666');
  assert.deepEqual(ga?.body.events, [{ name: 'close_convert_lead', params: { lead_source: 'chatgpt.com', kommo_embudo: 'PRESUPUESTOS', value: 4500, currency: 'USD' } }]);
  const patch = llamadas.filter((c) => c.method === 'PATCH');
  assert.equal(patch.length, 1, 'solo se etiqueta el lead que cambió');
  assert.match(patch[0].url, /\/leads\/31$/);
  assert.deepEqual(patch[0].body, { tags_to_add: [{ name: 'ga-venta' }] });
});

test('ganado en DISCOVERY → working_lead · ganado en CALIFICACIÓN → qualify_lead, nunca venta', async (t) => {
  entorno(t, configurado);
  await t.test('discovery', async (tt) => {
    const { llamadas } = simularCadena(tt, { 21: { pipeline_id: 902, status_id: 142, price: 800, custom_fields_values: rastreo(), _embedded: { tags: [] } } });
    const r = await handler.fetch(aviso(cambio(21, 142)));
    assert.deepEqual((await r.json()).leads, { 21: 'enviado:working_lead' });
    const ga = llamadas.find((c) => c.url.startsWith('https://www.google-analytics.com/'));
    assert.deepEqual(ga?.body.events, [{ name: 'working_lead', params: { lead_source: 'chatgpt.com', kommo_embudo: 'DISCOVERY SESSION' } }]);
  });
  __resetKommo();
  await t.test('calificación', async (tt) => {
    const { llamadas } = simularCadena(tt, { 11: { pipeline_id: 901, status_id: 142, price: 800, custom_fields_values: rastreo(), _embedded: { tags: [] } } });
    const r = await handler.fetch(aviso(cambio(11, 142)));
    assert.deepEqual((await r.json()).leads, { 11: 'enviado:qualify_lead' });
    assert.equal(llamadas.filter((c) => JSON.stringify(c.body ?? '').includes('close_convert_lead')).length, 0);
  });
});

test('sin ID en toda la cadena, o cadena en círculo → sin-id-analytics', async (t) => {
  entorno(t, configurado);
  const { llamadas } = simularCadena(t, {
    31: { pipeline_id: 903, status_id: 142, price: 10, custom_fields_values: [origen(21)], _embedded: { tags: [] } },
    21: { pipeline_id: 902, status_id: 142, custom_fields_values: [origen(31)], _embedded: { tags: [] } },
  });
  const r = await handler.fetch(aviso(cambio(31, 142)));
  assert.deepEqual((await r.json()).leads, { 31: 'sin-id-analytics' });
  assert.equal(llamadas.filter((c) => c.url.includes('google-analytics')).length, 0);
});
