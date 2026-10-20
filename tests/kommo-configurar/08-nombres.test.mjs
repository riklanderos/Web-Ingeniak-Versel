// Nombres escritos casi igual (mayúsculas, guion corto o largo), embudos archivados y zona horaria de la cuenta.
// El script compara como el sitio (normalizar de shared/kommo-esquema.js): no crea casi-duplicados que el sitio
// nunca usaría, y no usa un embudo archivado (el sitio tampoco lo usa).
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { after, before, describe, test } from 'node:test';
import { CAMPOS, EMBUDOS, mismoNombre } from '../../shared/kommo-esquema.js';
import { campo, crearMockKommo, embudo } from './_mock-kommo.mjs';
import { borrar, carpetaTemporal, correr, leerJson } from './_util.mjs';

const similares = (lista, nombre) => lista.filter((x) => mismoNombre(x.name, nombre));
const archivado = (p) => ({ ...p, is_archive: true });

describe('kommo-configurar · --aplicar con nombres escritos casi igual y un embudo archivado', () => {
  let dir;
  let mock;
  let r;
  let r2;
  let ids;
  let cambios1;
  let tamano;
  let cot;
  let clientes;
  let agendaArchivada;
  before(async () => {
    dir = carpetaTemporal();
    cot = embudo('sitio web · cotizaciones', ['nueva cotización', 'Contactado', 'Calificado', 'Propuesta enviada', 'Negociación'], { sort: 2 });
    clientes = embudo('CLIENTES · IMPLEMENTACIÓN', ['Arranque', 'Implementación (7-30 días)', 'En operación', 'Renovación'], { sort: 3 });
    agendaArchivada = archivado(embudo('Agenda · Sesiones', ['Discovery agendada'], { sort: 4 }));
    tamano = campo('Tamaño de empresa', 'select', ['1-10', '11-50', 'Mi rango']);
    mock = await crearMockKommo({
      estado: {
        pipelines: [embudo('Embudo de ventas', ['Contacto inicial'], { is_main: true, sort: 1 }), cot, clientes, agendaArchivada],
        campos: [tamano, campo('industria', 'select', ['Salud'])],
        tags: [{ id: 777010, name: 'HOT–LEAD' }],
      },
    });
    r = await correr(mock, ['--aplicar'], { salida: join(dir, 'kommo-ids.json') });
    cambios1 = mock.cambios().length;
    ids = leerJson(join(dir, 'kommo-ids.json'));
    r2 = await correr(mock, ['--aplicar'], { salida: join(dir, 'kommo-ids.json') });
  });
  after(async () => {
    await mock.cerrar();
    borrar(dir);
  });

  test('embudo con otras mayúsculas: lo usa (como el sitio) y avisa cómo está escrito; no crea otro', () => {
    assert.equal(similares(mock.estado.pipelines, EMBUDOS.cotizaciones.nombre).length, 1);
    assert.match(r.stdout, /↺ Ya existía · Embudo «Sitio web · Cotizaciones» · id \d+ — existe escrito «sitio web · cotizaciones»/);
    assert.match(r.stdout, /↺ Ya existía · Etapa «Nueva cotización» · id \d+ — existe escrita «nueva cotización»/);
    assert.equal(ids.embudos.cotizaciones.id, cot.id);
    assert.equal(ids.embudos.cotizaciones.etapas.nueva.id, cot._embedded.statuses.find((s) => s.name === 'nueva cotización').id);
    assert.ok(!mock.peticiones.some((p) => p.metodo === 'POST' && p.ruta === `/leads/pipelines/${cot.id}/statuses`));
  });

  test('etapa con guion corto en vez de largo: la usa y no agrega «Implementación (7–30 días)»', () => {
    assert.equal(similares(mock.estado.pipelines, EMBUDOS.clientes.nombre).length, 1);
    assert.match(r.stdout, /↺ Ya existía · Etapa «Implementación \(7–30 días\)» · id \d+ — existe escrita «Implementación \(7-30 días\)»/);
    assert.ok(!mock.peticiones.some((p) => p.metodo === 'POST' && p.ruta === `/leads/pipelines/${clientes.id}/statuses`));
  });

  test('embudo archivado: «❌ Falló», no le agrega etapas, no crea otro y no guarda sus IDs', () => {
    assert.equal(r.codigo, 1, r.stdout + r.stderr);
    assert.match(r.stdout, /❌ Falló · Embudo «Agenda · Sesiones» — Está archivado en Kommo y el sitio no usa embudos archivados\. Desarchívalo en Kommo y vuelve a correr el script\./);
    assert.ok(!mock.peticiones.some((p) => p.metodo === 'POST' && p.ruta === '/leads/pipelines'), 'no crea ningún embudo');
    assert.ok(!mock.peticiones.some((p) => p.metodo === 'POST' && p.ruta === `/leads/pipelines/${agendaArchivada.id}/statuses`));
    assert.equal(similares(mock.estado.pipelines, EMBUDOS.agenda.nombre).length, 1);
    assert.equal(ids.embudos.agenda.id, null);
    assert.ok(Object.values(ids.embudos.agenda.etapas).every((e) => e.id === null));
    const texto = readFileSync(join(dir, 'kommo-ids.json'), 'utf8');
    assert.ok(!texto.includes(String(agendaArchivada.id)), 'el id del embudo archivado no va en kommo-ids.json');
    for (const s of agendaArchivada._embedded.statuses.filter((x) => x.id > 1000)) assert.ok(!texto.includes(String(s.id)));
    assert.ok(!r.stdout.includes(String(agendaArchivada.id)), 'ni en la pantalla');
  });

  test('opciones «1-10» y «11-50» ya existen con guion corto: no agrega «1–10» ni «11–50» y usa las que hay', () => {
    const c = mock.estado.campos.find((x) => x.name === 'Tamaño de empresa');
    const valores = c.enums.map((e) => e.value);
    assert.ok(!valores.includes('1–10') && !valores.includes('11–50'), valores.join(', '));
    for (const o of CAMPOS.tamano.opciones) assert.equal(c.enums.filter((e) => mismoNombre(e.value, o)).length, 1, o);
    assert.equal(c.enums.length, CAMPOS.tamano.opciones.length + 1, 'más «Mi rango», que se queda');
    assert.equal(ids.campos.tamano.opciones['1–10'], tamano.enums.find((e) => e.value === '1-10').id);
    assert.equal(ids.campos.tamano.opciones['11–50'], tamano.enums.find((e) => e.value === '11-50').id);
    assert.match(r.stdout, /➕ Opciones agregadas · Campo «Tamaño de empresa» · id \d+ — \+8: 51–200, .*2 opción\(es\) existen escritas distinto y el sitio las usa así: «1-10» \(= «1–10»\), «11-50» \(= «11–50»\)/);
  });

  test('campo con otras mayúsculas («industria»): le agrega opciones en vez de crear «Industria»', () => {
    assert.equal(similares(mock.estado.campos, 'Industria').length, 1);
    assert.match(r.stdout, /➕ Opciones agregadas · Campo «Industria» · id \d+ — .*existe escrito «industria»/);
  });

  test('etiqueta con mayúsculas y guion largo («HOT–LEAD»): no crea «hot-lead»', () => {
    assert.ok(!mock.peticiones.some((p) => p.metodo === 'POST' && p.ruta === '/leads/tags' && p.cuerpo[0].name === 'hot-lead'));
    assert.equal(ids.etiquetas['hot-lead'], 777010);
    assert.match(r.stdout, /↺ Ya existía · Etiqueta «hot-lead» · id 777010 — existe escrita «HOT–LEAD»/);
  });

  test('segunda corrida: no crea nada y vuelve a avisar del embudo archivado', () => {
    assert.equal(mock.cambios().length, cambios1, 'ningún POST/PATCH nuevo');
    assert.equal(r2.codigo, 1);
    assert.match(r2.stdout, /❌ Falló · Embudo «Agenda · Sesiones» — Está archivado/);
  });
});

describe('kommo-configurar · --prueba con embudos archivados', () => {
  test('archivado sin otro activo: «❌ Problema» (código 1) y no dice que lo crearía', async () => {
    const mock = await crearMockKommo({ estado: { pipelines: [embudo('Embudo de ventas', [], { is_main: true }), archivado(embudo('Agenda · Sesiones', ['Discovery agendada']))] } });
    try {
      const r = await correr(mock, ['--prueba']);
      assert.equal(r.codigo, 1, r.stdout + r.stderr);
      assert.match(r.stdout, /❌ Problema · Embudo «Agenda · Sesiones» — Está archivado en Kommo/);
      assert.ok(!r.stdout.includes('Se crearía · Embudo «Agenda · Sesiones»'));
      assert.ok(!r.stdout.includes('Se crearía · Etapa'), 'tampoco planea etapas en el archivado');
      assert.equal(mock.cambios().length, 0);
    } finally {
      await mock.cerrar();
    }
  });

  test('archivado y otro activo con el mismo nombre: usa el activo, como el sitio', async () => {
    const viejo = archivado(embudo('Sitio web · Cotizaciones', ['Nueva cotización'], { sort: 2 }));
    const activo = embudo('Sitio web · Cotizaciones', EMBUDOS.cotizaciones.etapas.map((e) => e.nombre), { sort: 3 });
    const mock = await crearMockKommo({ estado: { pipelines: [embudo('Embudo de ventas', [], { is_main: true }), viejo, activo] } });
    try {
      const r = await correr(mock, ['--prueba', '--sin-clientes']);
      assert.match(r.stdout, new RegExp(`↺ Ya existe · Embudo «Sitio web · Cotizaciones» · id ${activo.id}\\n`));
      assert.ok(!r.stdout.includes('❌ Problema · Embudo «Sitio web · Cotizaciones»'));
    } finally {
      await mock.cerrar();
    }
  });
});

describe('kommo-configurar · zona horaria de la cuenta', () => {
  test('si no es la hora del centro de México, avisa (sin marcarlo como falla)', async () => {
    const mock = await crearMockKommo({ estado: { cuenta: { _embedded: { datetime_settings: { timezone: 'Europe/Istanbul', timezone_offset: '+03:00' } } } } });
    try {
      const r = await correr(mock, ['--prueba']);
      assert.equal(r.codigo, 0, r.stdout + r.stderr);
      assert.match(r.stdout, /⚠ Revisa · Zona horaria «Europe\/Istanbul» — no es la hora del centro de México\. .*Ajustes → Configuración general → Zona horaria → Ciudad de México/);
      assert.doesNotMatch(r.stdout, /✓ Zona horaria/);
    } finally {
      await mock.cerrar();
    }
  });

  test('si Kommo no manda la zona horaria, no inventa nada', async () => {
    const mock = await crearMockKommo({ estado: { cuenta: { _embedded: {} } } });
    try {
      const r = await correr(mock, ['--prueba']);
      assert.equal(r.codigo, 0, r.stdout + r.stderr);
      assert.doesNotMatch(r.stdout, /Zona horaria/);
    } finally {
      await mock.cerrar();
    }
  });
});
