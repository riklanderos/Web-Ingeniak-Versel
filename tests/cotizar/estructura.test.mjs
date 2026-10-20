// Estructura aprobada de Kommo (2026-10-20) · cotización contra el SIMULADOR HTTP LOCAL (tests/cotizar/_kommo-simulador.mjs):
// mapeo de cada opción a su opción exacta de shared/kommo-esquema.js, embudo y etapa por nombre, respaldo sin estructura,
// nunca un id que la cuenta no tenga, reintento si Kommo rechaza un id guardado en caché, caché de 10 min, paginación,
// variables que mandan sobre los nombres, etiquetas y token fuera de los logs. Ninguna llamada sale de 127.0.0.1.
import test, { beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { CAMPOS, ETIQUETAS } from '../../shared/kommo-esquema.js';
import { INDUSTRIES, REVENUES, SESSION_RULES, TEAM_SIZES } from '../../shared/agenda.js';
import { cargar, cuerpo, entorno, logs, peticion, valido } from './_util.mjs';
import { Ids, KommoSimulado, TOKEN_SIMULADO, cuentaSimulada } from './_kommo-simulador.mjs';

const { handler, cotizar, kommo, http } = await cargar();
const C = cotizar.catalogo;

beforeEach(() => {
  http.__resetHttp();
  cotizar.__resetCotizar();
  kommo.__resetKommo();
});

/** Campo del esquema ↔ lista del catálogo del formulario. */
const LISTAS = /** @type {const} */ ([
  ['servicios', 'servicios'],
  ['objetivo', 'objetivos'],
  ['industria', 'industrias'],
  ['tamano', 'tamanos'],
  ['presupuesto', 'presupuestos'],
  ['plazo', 'plazos'],
  ['crm', 'crms'],
  ['canales', 'canales'],
  ['contacto', 'canalesPreferidos'],
]);
/** Opciones que el sitio nunca escribe (las marca el equipo a mano en Kommo). */
const SOLO_A_MANO = { pago: ['Reembolsado'] };

/**
 * Arranca un simulador y apunta el sitio a él (KOMMO_BASE_URL + token de mentira).
 * @param {import('node:test').TestContext} t
 * @param {ConstructorParameters<typeof KommoSimulado>[0]} [o]
 * @param {Record<string, string>} [extra]
 */
async function simulador(t, o = {}, extra = {}) {
  const sim = await new KommoSimulado(o).iniciar();
  t.after(() => sim.detener());
  entorno(t, { ...sim.vars, ...extra });
  return sim;
}

/** Envía una cotización por el handler real y devuelve el id del lead creado en el simulador. */
async function cotizacion(sim, overrides = {}) {
  const antes = new Set(sim.leads.keys());
  const r = await handler.fetch(peticion(valido(overrides)));
  assert.equal(r.status, 200);
  assert.equal((await cuerpo(r)).delivered, 'kommo');
  const nuevos = [...sim.leads.keys()].filter((id) => !antes.has(id));
  assert.equal(nuevos.length, 1, 'un lead por envío');
  return nuevos[0];
}

/** Todos los field_id que el sitio mandó existen en la cuenta (Kommo rechazaría el lead completo si no). */
function sinIdsDesconocidos(sim) {
  const ids = sim.ids.camposIds;
  for (const c of sim.llamadas.filter((x) => x.method === 'POST' && x.path === '/leads/complex')) {
    for (const f of c.body[0].custom_fields_values ?? []) assert.ok(ids.has(f.field_id), `field_id ${f.field_id} existe`);
  }
}

/* ── Mapeo (sin red) ─────────────────────────────────────────────────────────────────────── */

test('mapeo · cada opción del formulario de cotización tiene su opción EXACTA en kommo-esquema.js', () => {
  for (const [clave, lista] of LISTAS) {
    for (const o of C[lista]) assert.equal(kommo.opcionKommo(clave, o.label), o.label, `${clave}: «${o.label}»`);
  }
});

test('mapeo · opciones de la agenda: giro (Otro → Otra), equipo, facturación, tipo de sesión y pago', () => {
  for (const x of INDUSTRIES) assert.equal(kommo.opcionKommo('industria', x), x === 'Otro' ? 'Otra' : x, x);
  for (const x of TEAM_SIZES) assert.equal(kommo.opcionKommo('tamano', x), x, x);
  for (const x of REVENUES) assert.equal(kommo.opcionKommo('facturacion', x), x, x);
  for (const r of Object.values(SESSION_RULES)) assert.equal(kommo.opcionKommo('sesion', r.label), r.label);
  for (const x of ['Pendiente', 'Pagado']) assert.equal(kommo.opcionKommo('pago', x), x);
  assert.equal(kommo.opcionKommo('industria', 'Minería'), null, 'lo desconocido no se inventa');
  assert.equal(kommo.opcionKommo('no-existe', 'x'), null);
  assert.equal(kommo.opcionKommo('tamano', '11-50'), '11–50', 'guion normal o largo: misma opción');
});

test('mapeo · cada opción de cada lista de kommo-esquema.js la produce el sitio (salvo las que se marcan a mano)', () => {
  /** @type {Record<string, Set<string>>} */
  const producidas = {};
  const agrega = (clave, valores) => {
    producidas[clave] ??= new Set();
    for (const v of valores) {
      const o = kommo.opcionKommo(clave, v);
      if (o) producidas[clave].add(o);
    }
  };
  for (const [clave, lista] of LISTAS) agrega(clave, C[lista].map((o) => o.label));
  agrega('industria', INDUSTRIES);
  agrega('tamano', TEAM_SIZES);
  agrega('facturacion', REVENUES);
  agrega('sesion', Object.values(SESSION_RULES).map((r) => r.label));
  agrega('pago', ['Pendiente', 'Pagado']);
  for (const [clave, def] of Object.entries(CAMPOS)) {
    if (!('opciones' in def)) continue;
    const esperado = def.opciones.filter((o) => !(SOLO_A_MANO[clave] ?? []).includes(o));
    assert.deepEqual([...(producidas[clave] ?? [])].sort(), [...esperado].sort(), `«${def.nombre}»: todas sus opciones tienen origen en el sitio`);
  }
});

test('etiquetas · todo lo que manda la cotización está en las 10 etiquetas aprobadas', () => {
  const v = cotizar.validate(valido());
  const data = { ...v.data, folio: 'IK-000000' };
  for (const env of [{}, { VERCEL_ENV: 'preview' }, { VERCEL_ENV: 'production' }]) {
    for (const m of [{}, { utm_medium: 'cpc' }, { gclid: 'x' }]) {
      for (const tag of cotizar.tagsFor(data, cotizar.cleanMeta({ ...valido().meta, ...m }), env)) assert.ok(ETIQUETAS.includes(tag), tag);
    }
  }
});

/* ── Contra el simulador HTTP local ──────────────────────────────────────────────────────── */

test('simulador · cotización → «Sitio web · Cotizaciones / Nueva cotización» con los 10 campos, etiquetas y nota completa', async (t) => {
  const salida = logs(t);
  const sim = await simulador(t);
  const id = await cotizacion(sim);
  assert.deepEqual(sim.ubicacion(id), { embudo: 'Sitio web · Cotizaciones', etapa: 'Nueva cotización' });
  assert.deepEqual(sim.valores(id), {
    'Servicios de interés': ['Agentes de IA para WhatsApp', 'CRM con IA (Kommo o GoHighLevel)'],
    'Objetivo principal': 'Responder rápido a cada cliente',
    'Industria': 'Salud',
    'Tamaño de empresa': '11–50',
    'Presupuesto estimado': 'USD 3,000 a 5,000',
    'Plazo': 'En 1 a 3 meses',
    'CRM actual': 'Ninguno (Excel, libreta o solo WhatsApp)',
    'Canales que usa hoy': ['WhatsApp', 'Instagram'],
    'Contacto preferido': 'WhatsApp',
    'Página de origen': 'https://ingeniak.mx/servicios/agentes-ia-whatsapp/',
    'REFERRER': 'https://www.google.com/',
  });
  assert.deepEqual(sim.etiquetas(id), ['web-cotizar', 'orgánico', 'entorno-preview']);
  const [nota] = sim.notasDe(id);
  for (const linea of ['Servicios: Agentes de IA para WhatsApp, CRM con IA (Kommo o GoHighLevel)', 'Presupuesto estimado: USD 3,000 a 5,000 · Plazo: En 1 a 3 meses', 'Nombre: Ana Pérez · Empresa: Clínica Ejemplo', 'Su proyecto: Nos escriben']) {
    assert.ok(nota.includes(linea), `la nota sigue completa: ${linea}`);
  }
  assert.ok(sim.llamadas.every((c) => c.auth), 'todas las llamadas con el token');
  assert.ok(!salida.join('\n').includes(TOKEN_SIMULADO), 'el token nunca sale en los logs');
  sinIdsDesconocidos(sim);
});

test('simulador · cada opción de cada lista llega con su enum_id (todas, en rotación)', async (t) => {
  logs(t);
  const sim = await simulador(t);
  const n = Math.max(...LISTAS.map(([, lista]) => C[lista].length));
  for (let i = 0; i < n; i++) {
    const de = (lista) => C[lista][i % C[lista].length];
    const id = await cotizacion(sim, {
      servicios: [de('servicios').slug],
      objetivo: de('objetivos').slug,
      industria: de('industrias').slug,
      tamano: de('tamanos').slug,
      presupuesto: de('presupuestos').slug,
      plazo: de('plazos').slug,
      crm: de('crms').slug,
      canales: [de('canales').slug],
      canal_preferido: de('canalesPreferidos').slug,
    });
    const v = sim.valores(id);
    assert.deepEqual(v['Servicios de interés'], [de('servicios').label]);
    assert.equal(v['Objetivo principal'], de('objetivos').label);
    assert.equal(v['Industria'], de('industrias').label);
    assert.equal(v['Tamaño de empresa'], de('tamanos').label);
    assert.equal(v['Presupuesto estimado'], de('presupuestos').label);
    assert.equal(v['Plazo'], de('plazos').label);
    assert.equal(v['CRM actual'], de('crms').label);
    assert.deepEqual(v['Canales que usa hoy'], [de('canales').label]);
    assert.equal(v['Contacto preferido'], de('canalesPreferidos').label);
  }
  // Todos los servicios a la vez (multiselect) y todos los canales.
  const todos = C.servicios.filter((s) => s.slug !== 'no-seguro');
  const id = await cotizacion(sim, { servicios: todos.map((s) => s.slug), canales: C.canales.map((c) => c.slug) });
  assert.deepEqual(sim.valores(id)['Servicios de interés'], todos.map((s) => s.label));
  assert.deepEqual(sim.valores(id)['Canales que usa hoy'], C.canales.map((c) => c.label));
  assert.equal(sim.llamadasA('POST', '/leads/complex').length, n + 1, 'ningún 400: un solo POST por lead');
  sinIdsDesconocidos(sim);
});

test('simulador · sin la estructura (script sin correr) → embudo principal, sin campos y la nota completa', async (t) => {
  logs(t);
  const sim = await simulador(t, { estructura: false });
  const id = await cotizacion(sim, { meta: { utm_medium: 'cpc', utm_source: 'google' } });
  assert.deepEqual(sim.ubicacion(id), { embudo: 'Embudo de ventas', etapa: 'Contacto inicial' });
  const complex = sim.llamadasA('POST', '/leads/complex');
  assert.equal(complex.length, 1);
  assert.equal(complex[0].body[0].pipeline_id, undefined);
  assert.equal(complex[0].body[0].status_id, undefined);
  assert.deepEqual(sim.valores(id), { UTM_SOURCE: 'google', UTM_MEDIUM: 'cpc', REFERRER: 'https://www.google.com/' }, 'solo rastreo');
  assert.deepEqual(sim.etiquetas(id), ['web-cotizar', 'campaña', 'entorno-preview']);
  assert.match(sim.notasDe(id)[0], /\nIndustria: Salud · Equipo: 11–50 personas\n/);
});

test('simulador · estructura incompleta → solo lo que existe (campo, tipo y opción); nunca un id desconocido', async (t) => {
  logs(t);
  const sim = await simulador(t, {
    sinCampos: ['Plazo', 'CRM actual'],
    sinOpciones: { 'Industria': ['Salud'], 'Servicios de interés': ['CRM con IA (Kommo o GoHighLevel)'] },
    tipos: { 'Objetivo principal': 'text' },
    sinEtapas: ['Nueva cotización'],
  });
  const id = await cotizacion(sim);
  assert.equal(sim.ubicacion(id).embudo, 'Sitio web · Cotizaciones', 'el embudo existe aunque falte la etapa');
  assert.equal(sim.llamadasA('POST', '/leads/complex')[0].body[0].status_id, undefined, 'sin la etapa: Kommo usa la primera');
  const v = sim.valores(id);
  assert.deepEqual(v['Servicios de interés'], ['Agentes de IA para WhatsApp'], 'del multiselect solo la opción que existe');
  for (const falta of ['Plazo', 'CRM actual', 'Industria', 'Objetivo principal']) assert.equal(v[falta], undefined, falta);
  assert.equal(v['Tamaño de empresa'], '11–50');
  assert.equal(sim.llamadasA('POST', '/leads/complex').length, 1, 'sin 400 ni reintento');
  sinIdsDesconocidos(sim);
  assert.match(sim.notasDe(id)[0], /Plazo: En 1 a 3 meses/, 'lo omitido sigue en la nota');
});

test('simulador · la consulta de estructura falla (500) → el lead entra igual en el embudo principal', async (t) => {
  logs(t);
  const sim = await simulador(t, { fallas: { '/leads/pipelines': 500, '/leads/custom_fields': 500 } });
  const id = await cotizacion(sim);
  assert.deepEqual(sim.ubicacion(id), { embudo: 'Embudo de ventas', etapa: 'Contacto inicial' });
  assert.deepEqual(sim.valores(id), {});
  // La falla se recuerda 1 min: el siguiente envío no vuelve a esperar a la estructura.
  await cotizacion(sim);
  assert.equal(sim.llamadasA('GET', '/leads/pipelines').length, 1);
});

test('simulador · la estructura tarda más de 3 s → no detiene el lead (se usa lo que llegó a tiempo)', async (t) => {
  logs(t);
  const sim = await simulador(t, { lento: { '/leads/pipelines': 3400 } });
  const t0 = Date.now();
  const id = await cotizacion(sim);
  assert.ok(Date.now() - t0 < 6000, 'dentro del presupuesto');
  assert.equal(sim.ubicacion(id).embudo, 'Embudo de ventas', 'sin embudos a tiempo: el principal');
  assert.equal(sim.valores(id)['Industria'], 'Salud', 'los campos sí llegaron a tiempo');
});

test('simulador · Kommo cambia una opción guardada en caché → 400 → un reintento sin campos (mismo embudo) y la caché se renueva', async (t) => {
  logs(t);
  const sim = await simulador(t);
  await cotizacion(sim);
  sim.quitarOpcion('Industria', 'Salud');
  const id = await cotizacion(sim);
  const complex = sim.llamadasA('POST', '/leads/complex');
  assert.equal(complex.length, 3, 'primer lead + 400 + reintento');
  assert.equal(complex[2].body[0].custom_fields_values, undefined, 'el reintento va sin campos');
  assert.deepEqual(sim.ubicacion(id), { embudo: 'Sitio web · Cotizaciones', etapa: 'Nueva cotización' }, 'pero en su etapa');
  assert.ok(sim.notasDe(id)[0].includes('Industria: Salud'));
  // La caché se olvidó: el siguiente envío vuelve a leer la estructura y omite solo la opción que ya no existe.
  const id3 = await cotizacion(sim);
  assert.equal(sim.llamadasA('GET', '/leads/pipelines').length, 2);
  assert.equal(sim.valores(id3)['Industria'], undefined);
  assert.equal(sim.valores(id3)['Plazo'], 'En 1 a 3 meses');
  assert.equal(sim.llamadasA('POST', '/leads/complex').length, 4, 'sin otro 400');
});

test('simulador · la estructura se recuerda 10 min por instancia', async (t) => {
  logs(t);
  const sim = await simulador(t);
  await cotizacion(sim);
  await cotizacion(sim);
  assert.equal(sim.llamadasA('GET', '/leads/pipelines').length, 1);
  kommo.__envejecerEstructura(kommo.ESTRUCTURA_TTL_MS - 1000);
  await cotizacion(sim);
  assert.equal(sim.llamadasA('GET', '/leads/pipelines').length, 1, 'a los 9 min 59 s sigue en caché');
  kommo.__envejecerEstructura(2000);
  await cotizacion(sim);
  assert.equal(sim.llamadasA('GET', '/leads/pipelines').length, 2, 'pasados 10 min se vuelve a leer');
});

test('simulador · campos paginados (_links.next): se leen todas las páginas', async (t) => {
  logs(t);
  const sim = await simulador(t, { porPagina: 4 });
  const id = await cotizacion(sim);
  const paginas = sim.llamadasA('GET', '/leads/custom_fields');
  assert.equal(paginas.length, Math.ceil(sim.cuenta.campos.length / 4));
  assert.deepEqual(paginas.map((c) => c.query.page), paginas.map((_, i) => String(i + 1)));
  assert.equal(sim.valores(id)['Página de origen'], 'https://ingeniak.mx/servicios/agentes-ia-whatsapp/', 'el último campo (última página) también');
});

test('simulador · KOMMO_PIPELINE_ID / KOMMO_STATUS_ID mandan; con solo el embudo, la etapa se busca por nombre', async (t) => {
  logs(t);
  const sim = await simulador(t);
  process.env.KOMMO_PIPELINE_ID = String(sim.ids.embudo('Clientes · Implementación'));
  process.env.KOMMO_STATUS_ID = String(sim.ids.etapa('Clientes · Implementación', 'Arranque'));
  const a = await cotizacion(sim);
  assert.deepEqual(sim.ubicacion(a), { embudo: 'Clientes · Implementación', etapa: 'Arranque' });
  assert.equal(sim.valores(a)['Industria'], 'Salud', 'los campos se llenan igual');
  process.env.KOMMO_PIPELINE_ID = String(sim.ids.embudo('Sitio web · Cotizaciones'));
  delete process.env.KOMMO_STATUS_ID;
  const b = await cotizacion(sim);
  assert.deepEqual(sim.ubicacion(b), { embudo: 'Sitio web · Cotizaciones', etapa: 'Nueva cotización' });
});

test('simulador · producción: web-cotizar · campaña (gclid), sin entorno-preview', async (t) => {
  logs(t);
  const sim = await simulador(t, {}, { VERCEL_ENV: 'production' });
  const id = await cotizacion(sim, { meta: { gclid: 'Cj0-prueba' } });
  assert.deepEqual(sim.etiquetas(id), ['web-cotizar', 'campaña']);
});

test('simulador · token equivocado → 401: respaldo, y el token no aparece en logs ni respuestas', async (t) => {
  const salida = logs(t);
  const sim = await simulador(t, {}, { KOMMO_TOKEN: 'tok-equivocado-no-real' });
  const r = await handler.fetch(peticion(valido()));
  assert.equal(r.status, 502);
  const texto = await r.text();
  assert.equal(sim.leads.size, 0);
  for (const s of ['tok-equivocado-no-real', TOKEN_SIMULADO]) {
    assert.ok(!texto.includes(s));
    assert.ok(!salida.join('\n').includes(s));
  }
});

test('revisarEstructura · completa, incompleta (con lo que falta) y sin estructura', async (t) => {
  logs(t);
  await simulador(t);
  assert.deepEqual(await kommo.revisarEstructura(), { estado: 'completa', faltan: [], opcionales: [] });
  const otro = async (o) => {
    const s = await new KommoSimulado(o).iniciar();
    t.after(() => s.detener());
    process.env.KOMMO_BASE_URL = s.base;
    return s;
  };
  await otro({ sinCampos: ['Plazo'], sinEtapas: ['Power Session pagada'], sinOpciones: { 'Industria': ['Otra'] } });
  const r = await kommo.revisarEstructura();
  assert.equal(r.estado, 'incompleta');
  assert.deepEqual(r.faltan.sort(), ['Campo «Plazo»', 'Etapa «Power Session pagada» (Agenda · Sesiones)', 'Opción «Otra» (Industria)'].sort());
  await otro({ estructura: false });
  assert.equal((await kommo.revisarEstructura()).estado, 'sin-estructura');
  // «Clientes · Implementación» no lo usa el sitio (el script lo omite con --sin-clientes): no cuenta para el estado.
  await otro({ sinEmbudos: ['Clientes · Implementación'] });
  assert.deepEqual(await kommo.revisarEstructura(), { estado: 'completa', faltan: [], opcionales: ['Embudo «Clientes · Implementación»'] });
  await otro({ sinEtapas: ['Renovación', 'Nueva cotización'] });
  assert.deepEqual(await kommo.revisarEstructura(), {
    estado: 'incompleta',
    faltan: ['Etapa «Nueva cotización» (Sitio web · Cotizaciones)'],
    opcionales: ['Etapa «Renovación» (Clientes · Implementación)'],
  });
});

test('resolverDestino · la etapa de respaldo (agenda) nunca le gana a la etapa por nombre; statusId (cotización) sí manda', () => {
  // Cuenta de mentira sin la etapa «Power Session por pagar», con la forma que arma el sitio (sin red).
  const cuenta = cuentaSimulada({ sinEtapas: ['Power Session por pagar'] });
  const ids = new Ids(cuenta);
  const est = {
    embudos: cuenta.pipelines.filter((p) => !p.is_archive).map((p) => ({
      id: p.id, name: p.name, isMain: p.is_main, etapas: p.statuses.map((s) => ({ id: s.id, name: s.name, type: s.type })),
    })),
    campos: new Map(),
    rastreo: new Map(),
  };
  const ag = ids.embudo('Agenda · Sesiones');
  const discovery = ids.etapa('Agenda · Sesiones', 'Discovery agendada');
  const realizada = ids.etapa('Agenda · Sesiones', 'Sesión realizada');
  const pagada = ids.etapa('Agenda · Sesiones', 'Power Session pagada');
  const r = (o) => kommo.resolverDestino(est, o);
  // Respaldo = «Discovery agendada» (lo que imprime el script): Discovery y Power pagada van a SU etapa.
  assert.equal(r({ embudo: 'agenda', etapa: 'discovery', pipelineId: ag, statusIdRespaldo: discovery }).statusId, discovery);
  assert.equal(r({ embudo: 'agenda', etapa: 'power-pagada', pipelineId: ag, statusIdRespaldo: discovery }).statusId, pagada);
  assert.equal(r({ embudo: 'agenda', etapa: 'power-pagada', statusIdRespaldo: discovery }).statusId, pagada);
  // La etapa con su nombre no existe → la de respaldo (con su embudo).
  assert.deepEqual(r({ embudo: 'agenda', etapa: 'power-por-pagar', statusIdRespaldo: realizada }), { pipelineId: ag, statusId: realizada, origen: 'variable' });
  assert.deepEqual(r({ embudo: 'agenda', etapa: 'power-por-pagar', pipelineId: ag, statusIdRespaldo: realizada }), { pipelineId: ag, statusId: realizada, origen: 'variable' });
  // Respaldo de otro embudo que el de la variable → se ignora (Kommo rechazaría el lead completo).
  const nuevaCot = ids.etapa('Sitio web · Cotizaciones', 'Nueva cotización');
  assert.deepEqual(r({ embudo: 'agenda', etapa: 'power-por-pagar', pipelineId: ag, statusIdRespaldo: nuevaCot }), { pipelineId: ag, statusId: undefined, origen: 'variable' });
  // Respaldo que ya no existe en la cuenta → se ignora (embudo por nombre, Kommo elige la primera etapa).
  assert.deepEqual(r({ embudo: 'agenda', etapa: 'power-por-pagar', statusIdRespaldo: 999_999 }), { pipelineId: ag, statusId: undefined, origen: 'nombre' });
  // Sin estructura (la consulta falló): el respaldo va solo, como antes.
  assert.deepEqual(kommo.resolverDestino(null, { embudo: 'agenda', etapa: 'discovery', statusIdRespaldo: discovery }), { statusId: discovery, origen: 'variable' });
  // statusId (KOMMO_STATUS_ID de la cotización) sí manda sobre el nombre.
  assert.deepEqual(r({ embudo: 'agenda', etapa: 'discovery', pipelineId: ag, statusId: realizada }), { pipelineId: ag, statusId: realizada, origen: 'variable' });
});
