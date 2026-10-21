// Modo aplicar: crea todo en una cuenta vacía, no duplica en una segunda corrida y completa una cuenta a medias.
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { after, before, describe, test } from 'node:test';
import { CAMPOS, EMBUDOS, ETIQUETAS, PLANTILLAS_SISTEMA } from '../../shared/kommo-esquema.js';
import { campo, crearMockKommo, embudo } from './_mock-kommo.mjs';
import { TOKEN_PRUEBA, borrar, carpetaTemporal, correr, leerJson, lineas } from './_util.mjs';

const porNombre = (lista, nombre) => lista.filter((x) => x.name === nombre);

describe('kommo-configurar · --aplicar en una cuenta vacía', () => {
  let dir;
  let mock;
  let r1;
  let r2;
  let ids1;
  let ids2;
  let cambios1;
  before(async () => {
    dir = carpetaTemporal();
    mock = await crearMockKommo();
    r1 = await correr(mock, ['--aplicar'], { salida: join(dir, 'kommo-ids.json') });
    cambios1 = mock.cambios().length;
    ids1 = existsSync(join(dir, 'kommo-ids.json')) ? leerJson(join(dir, 'kommo-ids.json')) : null;
    r2 = await correr(mock, ['--aplicar'], { salida: join(dir, 'kommo-ids.json') });
    ids2 = leerJson(join(dir, 'kommo-ids.json'));
  });
  after(async () => {
    await mock.cerrar();
    borrar(dir);
  });

  test('termina sin errores y reporta todo como creado', () => {
    assert.equal(r1.codigo, 0, r1.stdout + r1.stderr);
    assert.match(r1.stdout, /Totales: ✅ creados 44 · ↺ ya existían 0 · ➕ con opciones nuevas 0 · ❌ fallaron 0/);
    // Una petición por elemento (cada embudo lleva sus etapas en la misma petición): un fallo no arrastra a los demás.
    assert.equal(cambios1, 2 + 15 + 10 + 6);
  });

  test('crea los 2 embudos con sus etapas exactas, en orden y con sus colores, sin tocar el principal', () => {
    for (const def of Object.values(EMBUDOS)) {
      const [p] = porNombre(mock.estado.pipelines, def.nombre);
      assert.ok(p, def.nombre);
      assert.equal(p.is_main, false);
      const activas = p._embedded.statuses.filter((s) => s.type === 0 && s.id !== 142 && s.id !== 143).sort((a, b) => a.sort - b.sort);
      assert.deepEqual(
        activas.map((s) => [s.name, s.color]),
        def.etapas.map((e) => [e.nombre, e.color]),
      );
      assert.ok(p._embedded.statuses.some((s) => s.id === 142) && p._embedded.statuses.some((s) => s.id === 143));
    }
    const principal = mock.estado.pipelines.find((p) => p.name === 'Embudo de ventas');
    assert.equal(principal.is_main, true);
    const post = mock.peticiones.find((p) => p.metodo === 'POST' && p.ruta === '/leads/pipelines');
    assert.ok(Array.isArray(post.cuerpo));
    assert.equal(post.cuerpo[0].is_unsorted_on, false);
    assert.match(post.contentType, /application\/json/);
  });

  test('crea los 15 campos con su tipo y las opciones en el orden del esquema', () => {
    for (const def of Object.values(CAMPOS)) {
      const [c] = porNombre(mock.estado.campos, def.nombre);
      assert.ok(c, def.nombre);
      assert.equal(c.type, def.tipo);
      if (def.opciones) assert.deepEqual([...c.enums].sort((a, b) => a.sort - b.sort).map((e) => e.value), def.opciones);
      else assert.equal(c.enums, null);
    }
  });

  test('crea las 10 etiquetas y las 6 plantillas (editables, con external_id)', () => {
    for (const t of ETIQUETAS) assert.equal(porNombre(mock.estado.tags, t).length, 1, t);
    for (const p of PLANTILLAS_SISTEMA) {
      const [pl] = porNombre(mock.estado.plantillas, p.nombre);
      assert.ok(pl, p.nombre);
      assert.equal(pl.content, p.texto);
      assert.equal(pl.is_editable, true);
      assert.match(pl.external_id, /^ingeniak-[a-z0-9-]+$/);
    }
  });

  test('kommo-ids.json trae solo IDs y nombres, y coincide con la cuenta', () => {
    assert.ok(ids1, 'no se escribió kommo-ids.json');
    assert.deepEqual(Object.keys(ids1), ['_nota', 'generado', 'cuenta', 'embudos', 'campos', 'etiquetas', 'plantillas', 'usuarios', 'vercel']);
    const vta = mock.estado.pipelines.find((p) => p.name === EMBUDOS.ventas.nombre);
    const pw = mock.estado.pipelines.find((p) => p.name === EMBUDOS.power.nombre);
    assert.equal(ids1.embudos.ventas.id, vta.id);
    assert.equal(ids1.embudos.ventas.etapas.nueva.id, vta._embedded.statuses.find((s) => s.name === 'Nueva cotización').id);
    assert.equal(ids1.embudos.ventas.etapas.discovery.id, vta._embedded.statuses.find((s) => s.name === 'Discovery agendada').id);
    assert.equal(ids1.embudos.power.etapas['power-por-pagar'].id, pw._embedded.statuses.find((s) => s.name === 'Power Session por pagar').id);
    assert.equal(ids1.embudos.ventas.etapas.ganado.id, 142);
    assert.equal(ids1.embudos.ventas.etapas.perdido.id, 143);
    const industria = mock.estado.campos.find((c) => c.name === 'Industria');
    assert.equal(ids1.campos.industria.id, industria.id);
    assert.equal(ids1.campos.industria.opciones.Salud, industria.enums.find((e) => e.value === 'Salud').id);
    assert.ok(Object.values(ids1.campos.industria.opciones).every((v) => Number.isInteger(v)));
    assert.equal(ids1.etiquetas['web-cotizar'], mock.estado.tags.find((t) => t.name === 'web-cotizar').id);
    assert.deepEqual(ids1.usuarios, [
      { id: 9001, nombre: 'Rik Landeros' },
      { id: 9002, nombre: 'Ana Ventas' },
      { id: 9003, nombre: 'Ex colaborador' },
    ]);
    // En Vercel solo va el subdominio (y el token, que nunca se guarda). Los IDs de embudos y etapas quedan como
    // referencia: KOMMO_POWER_STATUS_ID mal puesto mandaría cada Power Session a la etapa equivocada.
    assert.deepEqual(Object.keys(ids1.vercel), ['_nota', 'KOMMO_SUBDOMAIN']);
    assert.equal(ids1.vercel.KOMMO_SUBDOMAIN, 'ejemplo');
    assert.match(ids1.vercel._nota, /No captures KOMMO_PIPELINE_ID, KOMMO_STATUS_ID/);
    assert.match(ids1._nota, /referencia; no las captures en Vercel/);
    const texto = JSON.stringify(ids1);
    assert.ok(!texto.includes(TOKEN_PRUEBA));
    assert.ok(!/@ejemplo\.test/.test(texto), 'no guarda correos de usuarios');
  });

  test('imprime para Vercel solo el subdominio y el recordatorio del token (como cotizar- y agenda-configuracion.md)', () => {
    const bloque = r1.stdout.slice(r1.stdout.indexOf('══ Variables para Vercel ══'));
    assert.match(bloque, /KOMMO_SUBDOMAIN\s+= ejemplo\n/);
    assert.match(bloque, /KOMMO_TOKEN\s+= \(tu token: pégalo directo en Vercel/);
    assert.match(bloque, /Opcional[^\n]*\n\s+KOMMO_RESPONSIBLE_USER_ID\s+= \(el ID de la persona/);
    assert.match(bloque, /9002\s+Ana Ventas/);
    // Ningún ID de embudo o etapa como valor para capturar; sí la advertencia de no capturarlos.
    assert.doesNotMatch(bloque, /KOMMO_(AGENDA_|POWER_)?(PIPELINE|STATUS)_ID\s+=/);
    assert.match(bloque, /KOMMO_DISCOVERY_STATUS_ID\s+= 97185916/);
    for (const { id } of Object.values(ids1.embudos)) assert.ok(!bloque.includes(String(id)), `el bloque de Vercel no debe traer el id ${id}`);
    assert.match(bloque, /No captures KOMMO_PIPELINE_ID, KOMMO_STATUS_ID, KOMMO_POWER_PIPELINE_ID, KOMMO_POWER_STATUS_ID, KOMMO_AGENDA_PIPELINE_ID ni KOMMO_AGENDA_STATUS_ID, y bórralas si ya existían/);
    assert.match(bloque, /Redeploy/);
    assert.match(bloque, /\/api\/agenda\/estado\/ → debe decir "kommoEstructura": "completa"/);
  });

  test('segunda corrida: no crea nada (idempotente) y deja los mismos IDs', () => {
    assert.equal(r2.codigo, 0, r2.stdout + r2.stderr);
    assert.equal(mock.cambios().length, cambios1, 'la segunda corrida no debe mandar ningún POST/PATCH');
    assert.match(r2.stdout, /Totales: ✅ creados 0 · ↺ ya existían 44 · ➕ con opciones nuevas 0 · ❌ fallaron 0/);
    const sinFecha = (o) => ({ ...o, generado: null });
    assert.deepEqual(sinFecha(ids2), sinFecha(ids1));
    assert.equal(mock.estado.pipelines.length, 3);
    assert.equal(mock.estado.tags.length, 10);
    assert.equal(mock.estado.plantillas.length, 6);
  });
});

describe('kommo-configurar · --aplicar en una cuenta a medias', () => {
  let dir;
  let mock;
  let r;
  let ids;
  let antes;
  before(async () => {
    dir = carpetaTemporal();
    const power = embudo('Power Session', ['Power Session por pagar', 'Power Session pagada', 'Propuesta enviada'], { sort: 2 });
    const principal = embudo('Embudo de ventas', ['Contacto inicial'], { is_main: true, sort: 1 });
    const industria = campo('Industria', 'select', ['Salud', 'Finanzas', 'Mi opción propia']);
    const plazo = campo('Plazo', 'text');
    const meet = campo('Enlace de Meet', 'url');
    // Hay más campos que el tamaño de página: obliga a seguir _links.next.
    const relleno = Array.from({ length: 7 }, (_, i) => campo(`Campo viejo ${i + 1}`, 'text'));
    mock = await crearMockKommo({
      tamPagina: 3,
      estado: {
        pipelines: [principal, power],
        campos: [...relleno, industria, plazo, meet],
        tags: [
          { id: 777001, name: 'web-cotizar' },
          { id: 777002, name: 'HOT-LEAD' },
          { id: 777003, name: 'otra-etiqueta' },
          { id: 777004, name: 'cliente-viejo' },
        ],
        plantillas: [{ id: 888001, name: 'Precio de referencia', content: 'texto que el cliente ya editó', external_id: 'ingeniak-precio-de-referencia', is_editable: true }],
      },
    });
    antes = { industria: industria.enums.map((e) => ({ ...e })), plazo: { ...plazo } };
    r = await correr(mock, ['--aplicar'], { salida: join(dir, 'kommo-ids.json') });
    ids = leerJson(join(dir, 'kommo-ids.json'));
  });
  after(async () => {
    await mock.cerrar();
    borrar(dir);
  });

  test('sale con código 1 porque hay un campo con otro tipo, pero completa el resto', () => {
    assert.equal(r.codigo, 1, r.stdout + r.stderr);
    assert.match(r.stdout, /❌ Falló · Campo «Plazo» · id \d+ — Ya existe con otro tipo \(«text»; la estructura pide «select»\)/);
  });

  test('no recrea «Power Session»: solo agrega la etapa que falta, en su lugar y con su color', () => {
    assert.equal(porNombre(mock.estado.pipelines, 'Power Session').length, 1);
    assert.equal(porNombre(mock.estado.pipelines, 'Ventas').length, 1);
    const pw = mock.estado.pipelines.find((p) => p.name === 'Power Session');
    const post = mock.peticiones.filter((p) => p.metodo === 'POST' && p.ruta === `/leads/pipelines/${pw.id}/statuses`);
    assert.equal(post.length, 1);
    assert.equal(post[0].cuerpo[0].name, 'Sesión realizada');
    assert.equal(post[0].cuerpo[0].color, EMBUDOS.power.etapas.find((e) => e.nombre === 'Sesión realizada').color);
    const orden = pw._embedded.statuses.filter((s) => s.type === 0 && ![142, 143].includes(s.id)).sort((a, b) => a.sort - b.sort).map((s) => s.name);
    assert.deepEqual(orden, ['Power Session por pagar', 'Power Session pagada', 'Sesión realizada', 'Propuesta enviada']);
    assert.match(r.stdout, /✅ Creado · Etapa «Sesión realizada»/);
    assert.match(r.stdout, /↺ Ya existía · Embudo «Power Session»/);
  });

  test('agrega las opciones que faltan a «Industria» sin borrar las que ya había (ni la propia del cliente)', () => {
    const c = mock.estado.campos.find((x) => x.name === 'Industria');
    for (const e of antes.industria) assert.ok(c.enums.some((x) => x.id === e.id && x.value === e.value), `se perdió ${e.value}`);
    for (const o of CAMPOS.industria.opciones) assert.ok(c.enums.some((x) => x.value === o), `falta ${o}`);
    assert.equal(c.enums.length, CAMPOS.industria.opciones.length + 1);
    const patch = mock.peticiones.find((p) => p.metodo === 'PATCH' && p.ruta === `/leads/custom_fields/${c.id}`);
    assert.ok(patch, 'debe usar PATCH /leads/custom_fields/{id}');
    assert.ok(antes.industria.every((e) => patch.cuerpo.enums.some((x) => x.id === e.id)), 'manda todas las opciones existentes con su id');
    // Se releyó el campo justo antes de actualizarlo.
    const i = mock.peticiones.indexOf(patch);
    assert.equal(mock.peticiones[i - 1].ruta, `/leads/custom_fields/${c.id}`);
    assert.equal(mock.peticiones[i - 1].metodo, 'GET');
    assert.match(r.stdout, /➕ Opciones agregadas · Campo «Industria» · id \d+ — \+16: /);
    assert.match(r.stdout, /Mi opción propia/);
    assert.equal(ids.campos.industria.opciones.Salud, antes.industria.find((e) => e.value === 'Salud').id);
  });

  test('no toca el campo con otro tipo ni recrea el que ya existe', () => {
    const plazos = porNombre(mock.estado.campos, 'Plazo');
    assert.equal(plazos.length, 1);
    assert.equal(plazos[0].type, 'text');
    assert.equal(porNombre(mock.estado.campos, 'Enlace de Meet').length, 1);
    assert.equal(ids.campos.plazo.id, null);
    assert.ok(!mock.peticiones.some((p) => p.metodo === 'PATCH' && p.ruta === `/leads/custom_fields/${plazos[0].id}`));
  });

  test('sigue la paginación: encuentra campos y etiquetas de páginas posteriores', () => {
    assert.ok(mock.peticiones.some((p) => p.ruta === '/leads/custom_fields' && p.query.page === '4'));
    assert.equal(porNombre(mock.estado.campos, 'Industria').length, 1);
  });

  test('etiquetas: no duplica las que existen (aunque cambien mayúsculas) y no toca las demás', () => {
    assert.equal(mock.estado.tags.filter((t) => t.name.toLowerCase() === 'hot-lead').length, 1);
    assert.equal(ids.etiquetas['hot-lead'], 777002);
    assert.equal(ids.etiquetas['web-cotizar'], 777001);
    assert.ok(mock.estado.tags.some((t) => t.name === 'otra-etiqueta'));
    const creadas = mock.peticiones.filter((p) => p.metodo === 'POST' && p.ruta === '/leads/tags').map((p) => p.cuerpo[0].name);
    assert.deepEqual(creadas.sort(), ETIQUETAS.filter((t) => !['web-cotizar', 'hot-lead'].includes(t)).sort());
  });

  test('plantillas: respeta la que ya existe (no cambia su texto) y crea las otras 5', () => {
    const precio = mock.estado.plantillas.filter((p) => p.name === 'Precio de referencia');
    assert.equal(precio.length, 1);
    assert.equal(precio[0].content, 'texto que el cliente ya editó');
    assert.equal(mock.estado.plantillas.length, 6);
    assert.equal(ids.plantillas['Precio de referencia'], 888001);
  });

  test('nunca borra ni renombra: solo POST y PATCH de opciones', () => {
    const metodos = new Set(mock.cambios().map((p) => p.metodo));
    assert.deepEqual([...metodos].sort(), ['PATCH', 'POST']);
    assert.ok(mock.cambios().filter((p) => p.metodo === 'PATCH').every((p) => Object.keys(p.cuerpo).join() === 'enums'));
    assert.equal(lineas(r.stdout, '❌ Falló'), 1);
  });
});
