// Validación (§2.4) y teléfonos (§3.9-8 y §3.9-11).
import test, { beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { cargar, entorno, logs, peticion, simularFetch, valido, cuerpo } from './_util.mjs';

const { handler, cotizar, kommo, http } = await cargar();
const { validate, normalizePhone, folio, catalogo } = cotizar;
const E = catalogo.errores;

beforeEach(() => {
  http.__resetHttp();
  cotizar.__resetCotizar();
  kommo.__resetKommo();
});

test('§3.9-11 · teléfonos a E.164', () => {
  assert.equal(normalizePhone({ pais: 'mx', lada: '+52', numero: '(33) 1234-5678' }).e164, '+523312345678');
  assert.equal(normalizePhone({ pais: 'mx', lada: '+52', numero: '523312345678' }).e164, '+523312345678');
  assert.deepEqual(normalizePhone({ pais: 'mx', lada: '+52', numero: '331234' }), { ok: false, error: 'telefono' });
  assert.equal(normalizePhone({ pais: 'otro', lada: '+380', numero: '501234567' }).e164, '+380501234567');
});

test('teléfonos · más casos (espacios, puntos, lada repetida con +, países, errores de lada)', () => {
  assert.equal(normalizePhone({ pais: 'mx', lada: '+52', numero: '33.1234.5678' }).e164, '+523312345678');
  assert.equal(normalizePhone({ pais: 'mx', lada: '+52', numero: '+52 33 1234 5678' }).e164, '+523312345678');
  assert.equal(normalizePhone({ pais: 'mx', numero: '3312345678' }).e164, '+523312345678', 'sin lada usa la del país');
  assert.equal(normalizePhone({ pais: 'us', lada: '+1', numero: '1 (312) 555-0123' }).e164, '+13125550123');
  assert.equal(normalizePhone({ pais: 'ar', lada: '+54', numero: '91123456789' }).e164, '+5491123456789');
  assert.equal(normalizePhone({ pais: 'es', lada: '+34', numero: '612 345 678' }).e164, '+34612345678');
  assert.equal(normalizePhone({ pais: 'otro', lada: '380', numero: '501234567' }).e164, '+380501234567');
  assert.deepEqual(normalizePhone({ pais: 'mx', lada: '+1', numero: '3312345678' }), { ok: false, error: 'telefonoLada' });
  assert.deepEqual(normalizePhone({ pais: 'otro', lada: '+0', numero: '501234567' }), { ok: false, error: 'telefonoLada' });
  assert.deepEqual(normalizePhone({ pais: 'otro', lada: '', numero: '501234567' }), { ok: false, error: 'telefonoLada' });
  assert.deepEqual(normalizePhone({ pais: 'otro', lada: '+12345', numero: '501234567' }), { ok: false, error: 'telefonoLada' });
  assert.deepEqual(normalizePhone({ pais: 'otro', lada: '+999', numero: '1234567890123' }), { ok: false, error: 'telefono' }, 'E.164 > 15');
  assert.deepEqual(normalizePhone({ pais: 'mx', lada: '+52', numero: '33 1234 567a' }), { ok: false, error: 'telefono' });
  assert.deepEqual(normalizePhone({ pais: 'zz', lada: '+52', numero: '3312345678' }), { ok: false, error: 'telefono' });
  assert.deepEqual(normalizePhone(null), { ok: false, error: 'telefono' });
});

test('folio · IK- + 6 hex en mayúsculas', () => {
  assert.equal(folio('6f1c2d3e-4b5a-4c3d-8e2f-1a2b3c4d5e6f'), 'IK-6F1C2D');
  assert.equal(folio('ABCDEF12-0000-4000-8000-000000000000'), 'IK-ABCDEF');
});

test('validate · envío válido normalizado', () => {
  const r = validate({ ...valido(), nombre: '  Ana   Pérez ', email: ' Ana@Empresa.MX ', servicios: ['crm-ia', 'crm-ia', 'agentes-ia'] });
  assert.equal(r.ok, true);
  assert.equal(r.data.nombre, 'Ana Pérez');
  assert.equal(r.data.email, 'ana@empresa.mx');
  assert.deepEqual(r.data.servicios, ['crm-ia', 'agentes-ia']);
  assert.deepEqual(r.data.telefono, { pais: 'mx', lada: '+52', numero: '3312345678', e164: '+523312345678' });
  assert.equal(r.data.consentimiento, true);
});

test('validate · opcionales vacíos son válidos', () => {
  const r = validate({ ...valido(), canales: [], crm: '', sitio: '', vision: '' });
  assert.equal(r.ok, true);
  assert.deepEqual(r.data.canales, []);
  assert.equal(r.data.crm, '');
});

test('validate · reglas por campo con los mensajes del catálogo', () => {
  const casos = [
    [{ servicios: [] }, 'servicios'],
    [{ servicios: ['inventado'] }, 'servicios'],
    [{ servicios: ['no-seguro', 'crm-ia'] }, 'servicios'],
    [{ servicios: Array(11).fill(0).map((_, i) => `s${i}`) }, 'servicios'],
    [{ objetivo: 'x' }, 'objetivo'],
    [{ industria: '' }, 'industria'],
    [{ tamano: '1000+' }, 'tamano'],
    [{ presupuesto: 'mucho' }, 'presupuesto'],
    [{ plazo: undefined }, 'plazo'],
    [{ canal_preferido: 'fax' }, 'canal_preferido'],
    [{ nombre: 'Al' }, 'nombre'],
    [{ nombre: '12 34 56' }, 'nombre'],
    [{ nombre: 'A'.repeat(121) }, 'nombre'],
    [{ empresa: 'X' }, 'empresa'],
    [{ empresa: 'X'.repeat(161) }, 'empresa'],
    [{ email: 'ana@empresa' }, 'email'],
    [{ email: `${'a'.repeat(195)}@b.com` }, 'email'],
    [{ sitio: 'x'.repeat(201) }, 'sitio'],
    [{ vision: 'x'.repeat(1001) }, 'vision'],
    [{ consentimiento: 'true' }, 'consentimiento'],
    [{ telefono: { pais: 'mx', lada: '+52', numero: '331234' } }, 'telefono'],
  ];
  for (const [cambio, campo] of casos) {
    const r = validate({ ...valido(), ...cambio });
    assert.equal(r.ok, false, `${JSON.stringify(cambio).slice(0, 60)} debería fallar`);
    assert.deepEqual(Object.keys(r.errors), [campo], `${JSON.stringify(cambio).slice(0, 60)} → ${campo}`);
    assert.equal(r.errors[campo], E[campo]);
  }
  const lada = validate({ ...valido(), telefono: { pais: 'otro', lada: 'abc', numero: '501234567' } });
  assert.deepEqual(lada.errors, { telefono: E.telefonoLada });
  assert.equal(validate({ ...valido(), servicios: ['no-seguro'] }).ok, true, 'no-seguro solo es válido');
  assert.equal(validate({ ...valido(), vision: 'x'.repeat(1000) }).ok, true, '1000 caracteres es el máximo');
});

test('§3.9-8 · inválidos → 422 con las claves exactas y mensajes de cotizar.json', async (t) => {
  entorno(t, {});
  logs(t);
  const llamadas = simularFetch(t, []);
  const r = await handler.fetch(
    peticion(valido({ servicios: [], telefono: { pais: 'mx', lada: '+52', numero: '331234' }, email: 'ana@', consentimiento: false })),
  );
  assert.equal(r.status, 422);
  const b = await cuerpo(r);
  assert.equal(b.ok, false);
  assert.equal(b.error, 'Revisa los campos marcados.');
  assert.deepEqual(Object.keys(b.errors).sort(), ['consentimiento', 'email', 'servicios', 'telefono']);
  assert.deepEqual(b.errors, { servicios: E.servicios, telefono: E.telefono, email: E.email, consentimiento: E.consentimiento });

  const r2 = await handler.fetch(peticion(valido({ servicios: ['no-seguro', 'crm-ia'] })));
  assert.equal(r2.status, 422);
  assert.deepEqual((await cuerpo(r2)).errors, { servicios: E.servicios });

  const r3 = await handler.fetch(peticion({}));
  assert.equal(r3.status, 422, 'objeto vacío → 422 con todos los obligatorios');
  assert.deepEqual(
    Object.keys((await cuerpo(r3)).errors).sort(),
    ['canal_preferido', 'consentimiento', 'email', 'empresa', 'industria', 'nombre', 'objetivo', 'plazo', 'presupuesto', 'servicios', 'tamano', 'telefono'],
  );
  assert.equal(llamadas.length, 0, 'sin llamadas a Kommo');
});
