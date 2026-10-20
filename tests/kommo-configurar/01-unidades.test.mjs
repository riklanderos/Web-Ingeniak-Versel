// Piezas sueltas del script y del esquema (sin red).
import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import { AYUDA, esHoraDelCentro, leerOpciones, limpiarToken, mensajeHttp, normalizarSubdominio, tapar, taparCon, urlBase } from '../../scripts/kommo-configurar.mjs';
import { normalizar as normalizarSitio } from '../../server/kommo.js';
import { CAMPOS, COLORES_ETAPA, EMBUDOS, ETIQUETAS, PLANTILLAS_SISTEMA, colorEtapaValido, mismoNombre, normalizar, validarEsquema } from '../../shared/kommo-esquema.js';
import { jwtFalso } from './_util.mjs';

describe('kommo-configurar · esquema', () => {
  test('la estructura aprobada no tiene problemas', () => {
    assert.deepEqual(validarEsquema(), []);
  });

  test('3 embudos, 15 campos, 10 etiquetas y 6 plantillas', () => {
    assert.equal(Object.keys(EMBUDOS).length, 3);
    assert.equal(Object.keys(CAMPOS).length, 15);
    assert.equal(ETIQUETAS.length, 10);
    assert.equal(PLANTILLAS_SISTEMA.length, 6);
  });

  test('todos los colores de etapa están en la paleta de Kommo (developers.kommo.com/reference/stage-colors)', () => {
    assert.equal(COLORES_ETAPA.length, 21);
    for (const e of Object.values(EMBUDOS)) for (const etapa of e.etapas) assert.ok(colorEtapaValido(etapa.color), `${e.nombre} → ${etapa.nombre}: ${etapa.color}`);
  });

  test('detecta un color fuera de la paleta, opciones repetidas y tipos no previstos', () => {
    const p = validarEsquema({
      embudos: { x: { nombre: 'X', etapas: [{ clave: 'a', nombre: 'A', color: '#123456' }] } },
      campos: { a: { nombre: 'A', tipo: 'select', opciones: ['Uno', 'Uno'] }, b: { nombre: 'B', tipo: 'textarea' } },
      etiquetas: ['a', 'A'],
      plantillas: [{ nombre: 'P', texto: '' }],
    });
    assert.ok(p.some((x) => x.includes('#123456')));
    assert.ok(p.some((x) => x.includes('opción repetida «Uno»')));
    assert.ok(p.some((x) => x.includes('tipo «textarea»')));
    assert.ok(p.some((x) => x.includes('Etiqueta repetida')));
    assert.ok(p.some((x) => x.includes('sin texto')));
  });
});

describe('kommo-configurar · datos de acceso', () => {
  test('subdominio: acepta nombre, dominio o dirección completa', () => {
    assert.equal(normalizarSubdominio('ingeniak'), 'ingeniak');
    assert.equal(normalizarSubdominio('  Ingeniak  '), 'ingeniak');
    assert.equal(normalizarSubdominio('ingeniak.kommo.com'), 'ingeniak');
    assert.equal(normalizarSubdominio('https://ingeniak.kommo.com'), 'ingeniak');
    assert.equal(normalizarSubdominio('https://ingeniak.kommo.com/leads/pipeline/123?x=1'), 'ingeniak');
    assert.equal(normalizarSubdominio('http://mi-cuenta-2.kommo.com/'), 'mi-cuenta-2');
  });

  test('subdominio: rechaza vacío, www, espacios y caracteres raros', () => {
    assert.equal(normalizarSubdominio('ingeniak.kommo.com/leads/'), 'ingeniak');
    for (const malo of ['', '   ', 'www', 'www.kommo.com', 'mi cuenta', '-ingeniak', 'ingeniak.otra.com', 'ñandú', 'https://']) {
      assert.equal(normalizarSubdominio(malo), null, malo);
    }
  });

  test('token: limpia «Bearer », comillas y espacios; rechaza vacío, corto o con espacios internos', () => {
    assert.deepEqual(limpiarToken('  Bearer abc.def-123_xyz  '), { ok: true, token: 'abc.def-123_xyz' });
    assert.deepEqual(limpiarToken('"abc.def-123_xyz"'), { ok: true, token: 'abc.def-123_xyz' });
    assert.equal(limpiarToken('').ok, false);
    assert.equal(limpiarToken('corto').ok, false);
    assert.equal(limpiarToken('abc def ghi jkl').ok, false);
    // El motivo nunca repite el valor.
    assert.ok(!limpiarToken('abc def ghi jkl').motivo.includes('abc'));
  });

  test('KOMMO_BASE_URL solo se acepta en esta computadora', () => {
    assert.deepEqual(urlBase('ingeniak', undefined), { ok: true, base: 'https://ingeniak.kommo.com/api/v4', local: false });
    assert.deepEqual(urlBase('x', 'http://127.0.0.1:4010'), { ok: true, base: 'http://127.0.0.1:4010/api/v4', local: true });
    assert.deepEqual(urlBase('x', 'http://localhost:4010/api/v4/'), { ok: true, base: 'http://localhost:4010/api/v4', local: true });
    assert.equal(urlBase('x', 'http://[::1]:4010').ok, true);
    for (const malo of ['https://evil.example.com', 'http://127.0.0.1.evil.com', 'ftp://127.0.0.1', 'no-es-url', 'https://ingeniak.kommo.com']) {
      assert.equal(urlBase('x', malo).ok, false, malo);
    }
  });

  test('tapar() oculta el token y cualquier «Bearer …»', () => {
    assert.equal(tapar('Authorization: Bearer abc.def.ghi'), 'Authorization: Bearer [token oculto]');
    assert.equal(tapar('sin secretos'), 'sin secretos');
  });

  test('taparCon(): token completo, recortado o en pedazos de 12 o más, y cualquier JWT', () => {
    const jwt = jwtFalso(650);
    assert.equal(taparCon(`a ${jwt} b`, [jwt]), 'a [token oculto] b');
    assert.equal(taparCon(`cortado: ${jwt.slice(0, 200)}`, [jwt]), 'cortado: [token oculto]');
    assert.equal(taparCon(`en medio: ${jwt.slice(300, 330)}!`, [jwt]), 'en medio: [token oculto]!');
    assert.equal(taparCon(`final ${jwt.slice(-40)}`, [jwt]), 'final [token oculto]');
    // Un JWT cualquiera (aunque no sea el token registrado) también se tapa.
    assert.equal(taparCon('vi eyJhbGciOiJIUzI1NiJ9.e30.ZmFrZQ en el error', []), 'vi [token oculto] en el error');
    // Lo demás no se toca (ni números largos, ni pedazos de menos de 12).
    assert.equal(taparCon('id 31000001 · 12345678901234 · Sitio web · Cotizaciones', [jwt]), 'id 31000001 · 12345678901234 · Sitio web · Cotizaciones');
    assert.equal(taparCon(`corto ${jwt.slice(100, 111)} fin`, [jwt]), `corto ${jwt.slice(100, 111)} fin`);
  });

  test('la ayuda no sugiere poner el token en una variable (quedaría en el historial de la Terminal)', () => {
    assert.doesNotMatch(AYUDA, /KOMMO_TOKEN|KOMMO_SUBDOMAIN/);
    assert.match(AYUDA, /queda guardado en su historial/);
  });

  test('zona horaria: solo la hora del centro de México (sin horario de verano) pasa', () => {
    assert.equal(esHoraDelCentro('America/Mexico_City'), true);
    assert.equal(esHoraDelCentro(' America/Mexico_City '), true);
    for (const otra of ['Europe/Istanbul', 'America/Chicago', 'UTC', 'America/Bogota', 'no/existe', '']) assert.equal(esHoraDelCentro(otra), false, otra);
  });
});

describe('kommo-configurar · nombres como los compara el sitio', () => {
  test('normalizar() del esquema es idéntica a la de server/kommo.js', () => {
    const casos = ['1–10', '1-10', '1‐10', '1—10', '1−10', ' Tamaño  de   empresa ', 'TAMAÑO DE EMPRESA', 'Implementación (7–30 días)', 'é', 'é', 'İ', '', null, undefined, 42];
    for (const e of Object.values(EMBUDOS)) casos.push(e.nombre, ...e.etapas.map((x) => x.nombre));
    for (const c of Object.values(CAMPOS)) casos.push(c.nombre, ...(c.opciones ?? []));
    casos.push(...ETIQUETAS, ...PLANTILLAS_SISTEMA.map((p) => p.nombre));
    for (const c of casos) assert.equal(normalizar(c), normalizarSitio(c), String(c));
    assert.ok(mismoNombre('1-10', '1–10'));
    assert.ok(mismoNombre('sitio web · cotizaciones', 'Sitio web · Cotizaciones'));
    assert.ok(!mismoNombre('11-50', '11–25'));
  });

  test('validarEsquema() detecta nombres que el sitio confundiría (mayúsculas o guion distinto)', () => {
    const p = validarEsquema({
      embudos: { x: { nombre: 'Embudo X', etapas: [{ clave: 'a', nombre: 'A', color: '#98cbff' }] }, y: { nombre: 'embudo x', etapas: [{ clave: 'a', nombre: 'A', color: '#98cbff' }] } },
      campos: { a: { nombre: 'Rango', tipo: 'select', opciones: ['1-10', '1–10'] } },
      etiquetas: ['hot-lead', 'HOT–LEAD'],
      plantillas: [{ nombre: 'P', texto: 'T' }],
    });
    assert.ok(p.some((x) => x === 'Embudo repetido: «Embudo X» y «embudo x».'), p.join('\n'));
    assert.ok(p.some((x) => x === 'Campo «Rango»: opción repetida «1-10» y «1–10».'), p.join('\n'));
    assert.ok(p.some((x) => x.startsWith('Etiqueta repetida: «hot-lead» y «HOT–LEAD»')), p.join('\n'));
  });
});

describe('kommo-configurar · opciones y mensajes', () => {
  test('modo por defecto: prueba', () => {
    const op = leerOpciones([]);
    assert.equal(op.modo, 'prueba');
    assert.equal(op.clientes, true);
    assert.equal(op.plantillas, true);
    assert.equal(op.error, null);
  });

  test('--aplicar, --sin-clientes, --sin-plantillas', () => {
    const op = leerOpciones(['--aplicar', '--sin-clientes', '--sin-plantillas']);
    assert.equal(op.modo, 'aplicar');
    assert.equal(op.clientes, false);
    assert.equal(op.plantillas, false);
  });

  test('--prueba y --aplicar juntos es un error', () => {
    assert.match(leerOpciones(['--prueba', '--aplicar']).error, /no los dos/);
  });

  test('un argumento desconocido largo no se repite (podría ser el token)', () => {
    const op = leerOpciones(['eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.algo-largo']);
    assert.ok(op.error);
    assert.ok(!op.error.includes('eyJ0eX'));
    assert.match(leerOpciones(['--otra']).error, /--otra/);
  });

  test('mensajes en español para 401, 402, 403, 404 (cuenta) y 5xx', () => {
    assert.match(mensajeHttp(401), /token no es válido o ya venció/);
    assert.match(mensajeHttp(402), /plan activo/);
    assert.match(mensajeHttp(403), /permiso/);
    assert.match(mensajeHttp(404, { paso: 'cuenta' }), /subdominio/);
    assert.match(mensajeHttp(503), /error de su lado/);
  });
});
