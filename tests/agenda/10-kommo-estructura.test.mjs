// 10 · Estructura aprobada de Kommo (2026-10-20) · agenda contra el SIMULADOR HTTP LOCAL de Kommo
// (tests/cotizar/_kommo-simulador.mjs; Google y Stripe siguen simulados en `fetch`). Discovery → «Agenda · Sesiones /
// Discovery agendada» con sus campos; Power apartada → «Power Session por pagar» (Pago = Pendiente); pagada → PATCH
// del MISMO lead a «Power Session pagada» (Pago = Pagado, fecha y Meet); liberada → nota «No completó el pago».
// Sin la estructura: embudo de respaldo o principal + nota. Nunca un id que la cuenta no tenga.
import test from 'node:test';
import assert from 'node:assert/strict';
import { createBooking } from '../../server/agenda/booking.js';
import { google } from '../../server/agenda/google.js';
import { stripe } from '../../server/agenda/stripe.js';
import { leads, bookingAttribution } from '../../server/agenda/leads.js';
import { __resetKommo } from '../../server/kommo.js';
import { ETIQUETAS } from '../../shared/kommo-esquema.js';
import { INDUSTRIES, REVENUES, TEAM_SIZES } from '../../shared/agenda.js';
import estado from '../../api/agenda/estado.js';
import { env, REAL, FAKE, FakeGoogle, FakeStripe, KommoSimulado, TOKEN_SIMULADO, mockFetch, NOW, form, ATRIB, req, read, captureLogs, ORIGIN } from './_util.mjs';

const START = '2026-10-21T16:00:00.000Z'; // miércoles 21, 10:00 CDMX
const book = () => createBooking({ google, stripe, leads, now: () => NOW });

/**
 * Simulador de Kommo + Google y Stripe de mentira, con el sitio apuntando al simulador.
 * @param {import('node:test').TestContext} t
 * @param {ConstructorParameters<typeof KommoSimulado>[0]} [o]
 * @param {Record<string, string>} [extra]
 * @param {{ handle: (u: URL, init: RequestInit) => Response | null }[]} [otros]  más servidores de mentira (p. ej. webhook)
 */
async function montar(t, o = {}, extra = {}, otros = []) {
  const sim = await new KommoSimulado(o).iniciar();
  t.after(() => sim.detener());
  env(t, { ...REAL, ...sim.vars, ...extra });
  const g = new FakeGoogle();
  const s = new FakeStripe();
  mockFetch(t, g, s, sim.pasarela(), ...otros);
  const logs = captureLogs(t);
  return { sim, g, s, logs };
}

/** Webhook de aviso de mentira (NOTIFY_WEBHOOK_URL): guarda cada cuerpo recibido. */
const WEBHOOK = 'https://avisos.prueba.test/hook';
function webhook() {
  /** @type {any[]} */
  const recibidos = [];
  return {
    recibidos,
    handle: (/** @type {URL} */ u, /** @type {RequestInit} */ init) => {
      if (u.href !== WEBHOOK) return null;
      recibidos.push(JSON.parse(String(init.body)));
      return new Response(null, { status: 204 });
    },
  };
}

/** @param {'discovery' | 'power'} type @param {Record<string, any>} [over] */
const reservar = (type, over = {}) =>
  book().reserve({ type, form: form(type), startIso: START, origin: 'Sección: hero', baseUrl: ORIGIN, attribution: bookingAttribution(ATRIB), ...over });

/** Id del lead guardado en el evento (ik_kommo). @param {FakeGoogle} g */
const leadDelEvento = (g) => Number([...g.events.values()][0].extendedProperties.private.ik_kommo);

/** Todos los field_id que el sitio mandó (POST y PATCH) existen en la cuenta. */
function sinIdsDesconocidos(sim) {
  const ids = sim.ids.camposIds;
  for (const c of sim.llamadas.filter((x) => x.path === '/leads/complex' || (x.method === 'PATCH' && x.path.startsWith('/leads/')))) {
    const lead = Array.isArray(c.body) ? c.body[0] : c.body;
    for (const f of lead.custom_fields_values ?? []) assert.ok(ids.has(f.field_id), `field_id ${f.field_id} existe`);
  }
}

test('kommo · Discovery → «Agenda · Sesiones / Discovery agendada» con tipo, fecha (unix), Meet, giro, equipo, facturación y página', async (t) => {
  const { sim, g, logs } = await montar(t);
  const r = await reservar('discovery');
  assert.equal(r.kind, 'confirmed');
  const id = leadDelEvento(g);
  assert.ok(sim.leads.has(id), 'ik_kommo apunta al lead creado');
  assert.deepEqual(sim.ubicacion(id), { embudo: 'Agenda · Sesiones', etapa: 'Discovery agendada' });
  assert.deepEqual(sim.valores(id), {
    'Tipo de sesión': 'Discovery Session',
    'Fecha de la sesión': Date.parse(START) / 1000,
    'Enlace de Meet': r.meetLink,
    'Industria': 'Salud y bienestar',
    'Tamaño de empresa': '6–10',
    'Facturación mensual': '$100K–$300K MXN',
    'Página de origen': 'https://ingeniak.mx/discovery/',
    'UTM_SOURCE': 'meta', 'UTM_MEDIUM': 'paid', 'UTM_CAMPAIGN': 'prueba', 'REFERRER': 'https://www.ejemplo.test/',
  });
  assert.deepEqual(sim.etiquetas(id), ['web-agenda', 'discovery', 'campaña', 'entorno-preview']);
  assert.match(sim.notasDe(id)[0], /^Reserva de Discovery Session · sitio web · Folio IK-AG-/);
  sinIdsDesconocidos(sim);
  const all = logs.join('\n');
  for (const s of [TOKEN_SIMULADO, 'ana@ejemplo.test', 'Ana Prueba']) assert.ok(!all.includes(s), `sin ${s} en los logs`);
});

test('kommo · giro «Otro» → «Otra»; cada giro, equipo y facturación de la agenda llega con su opción', async (t) => {
  const { sim } = await montar(t);
  const n = Math.max(INDUSTRIES.length, TEAM_SIZES.length, REVENUES.length);
  for (let i = 0; i < n; i++) {
    const f = form('discovery', { industry: INDUSTRIES[i % INDUSTRIES.length], teamSize: TEAM_SIZES[i % TEAM_SIZES.length], revenue: REVENUES[i % REVENUES.length] });
    const { kommoLeadId } = await leads.recordBooking({
      type: 'discovery', form: f, startIso: START, origin: null, eventId: `evprueba${i}`, attribution: bookingAttribution({}), meetLink: null,
    });
    const v = sim.valores(Number(kommoLeadId));
    assert.equal(v['Industria'], f.industry === 'Otro' ? 'Otra' : f.industry, f.industry);
    assert.equal(v['Tamaño de empresa'], f.teamSize);
    assert.equal(v['Facturación mensual'], f.revenue);
    assert.equal(v['Página de origen'], 'https://ingeniak.mx/discovery/', 'sin page_path: la landing de la sesión');
    assert.equal(v['Enlace de Meet'], undefined, 'sin Meet no se manda el campo');
  }
  assert.equal(sim.llamadasA('POST', '/leads/complex').length, n, 'ningún 400');
  sinIdsDesconocidos(sim);
});

test('kommo · Power: apartado → «Power Session por pagar» (Pendiente); pago → el MISMO lead a «Power Session pagada» (Pagado, fecha y Meet)', async (t) => {
  const { sim, g, s } = await montar(t);
  const r = await reservar('power');
  assert.equal(r.kind, 'checkout');
  const id = leadDelEvento(g);
  assert.deepEqual(sim.ubicacion(id), { embudo: 'Agenda · Sesiones', etapa: 'Power Session por pagar' });
  const v0 = sim.valores(id);
  assert.equal(v0['Tipo de sesión'], 'Power Session');
  assert.equal(v0['Pago Power Session'], 'Pendiente');
  assert.equal(v0['Fecha de la sesión'], Date.parse(START) / 1000);
  assert.equal(v0['Enlace de Meet'], undefined);
  assert.deepEqual(sim.etiquetas(id), ['web-agenda', 'power-session', 'campaña', 'entorno-preview']);

  const sessionId = [...s.sessions.keys()][0];
  s.pay(sessionId);
  const c = await book().confirmFromCheckout(sessionId);
  assert.equal(c.paid, true);
  assert.equal(sim.leads.size, 1, 'no se crea otro lead');
  const patch = sim.llamadasA('PATCH', `/leads/${id}`);
  assert.equal(patch.length, 1, 'un PATCH al mismo lead');
  assert.deepEqual(sim.ubicacion(id), { embudo: 'Agenda · Sesiones', etapa: 'Power Session pagada' });
  const v1 = sim.valores(id);
  assert.equal(v1['Pago Power Session'], 'Pagado');
  assert.equal(v1['Enlace de Meet'], c.meetLink);
  assert.equal(v1['Fecha de la sesión'], Date.parse(START) / 1000);
  assert.equal(v1['Industria'], 'Salud y bienestar', 'lo demás se conserva');
  assert.match(sim.notasDe(id).at(-1), /^Pago confirmado en Stripe · Miércoles 21 de octubre · 10:00 AM/);
  const ev = [...g.events.values()][0];
  assert.equal(ev.extendedProperties.private.ik_kommo_pago, '1');

  // Idempotente: confirmar otra vez no vuelve a tocar Kommo.
  const llamadas = sim.llamadas.length;
  await book().confirmFromCheckout(sessionId);
  assert.equal(sim.llamadas.length, llamadas);
  sinIdsDesconocidos(sim);
});

test('kommo · apartado liberado → el lead se queda en «Power Session por pagar» con la nota «No completó el pago»', async (t) => {
  const { sim, g } = await montar(t);
  await reservar('power');
  const id = leadDelEvento(g);
  const eventId = [...g.events.keys()][0];
  assert.equal(await book().releaseHold(eventId), 'liberado');
  assert.deepEqual(sim.ubicacion(id), { embudo: 'Agenda · Sesiones', etapa: 'Power Session por pagar' });
  assert.equal(sim.valores(id)['Pago Power Session'], 'Pendiente');
  assert.equal(sim.llamadasA('PATCH', '/leads/').length, 0, 'sin mover ni cambiar campos');
  assert.match(sim.notasDe(id).at(-1), /^No completó el pago de la Power Session: el horario apartado \(Miércoles 21 de octubre · 10:00 AM, hora del centro de México\) se liberó\.$/);
});

test('kommo · sin la estructura → Discovery al embudo principal; Power pagada solo recibe la nota (sin PATCH) y queda sincronizada', async (t) => {
  const { sim, g, s } = await montar(t, { estructura: false });
  await reservar('discovery');
  const d = leadDelEvento(g);
  assert.deepEqual(sim.ubicacion(d), { embudo: 'Embudo de ventas', etapa: 'Contacto inicial' });
  assert.deepEqual(Object.keys(sim.valores(d)).sort(), ['REFERRER', 'UTM_CAMPAIGN', 'UTM_MEDIUM', 'UTM_SOURCE'], 'solo rastreo');
  assert.match(sim.notasDe(d)[0], /Giro: Salud y bienestar · Equipo: 6–10 · Facturación mensual: \$100K–\$300K MXN/);

  g.events.clear();
  await reservar('power');
  const p = leadDelEvento(g);
  s.pay([...s.sessions.keys()][0]);
  await book().confirmFromCheckout([...s.sessions.keys()][0]);
  assert.equal(sim.llamadasA('PATCH', '/leads/').length, 0, 'nada que mover ni llenar');
  assert.match(sim.notasDe(p).at(-1), /^Pago confirmado en Stripe/);
  assert.equal([...g.events.values()][0].extendedProperties.private.ik_kommo_pago, '1');
});

test('kommo · sin el embudo «Agenda · Sesiones» → el de KOMMO_PIPELINE_ID / KOMMO_STATUS_ID (respaldo)', async (t) => {
  const { sim, g } = await montar(t, { sinEmbudos: ['Agenda · Sesiones'] });
  process.env.KOMMO_PIPELINE_ID = String(sim.ids.embudo('Sitio web · Cotizaciones'));
  process.env.KOMMO_STATUS_ID = String(sim.ids.etapa('Sitio web · Cotizaciones', 'Contactado'));
  await reservar('discovery');
  const id = leadDelEvento(g);
  assert.deepEqual(sim.ubicacion(id), { embudo: 'Sitio web · Cotizaciones', etapa: 'Contactado' });
  assert.equal(sim.valores(id)['Tipo de sesión'], 'Discovery Session', 'los campos existen y se llenan igual');
});

test('kommo · con las 4 variables que imprime el script (KOMMO_AGENDA_STATUS_ID = «Discovery agendada»): cada reserva va a SU etapa', async (t) => {
  const { sim, g, s } = await montar(t);
  // Exactamente lo que el script de configuración le pide capturar al cliente en Vercel (kommo-setup.md §7).
  process.env.KOMMO_AGENDA_PIPELINE_ID = String(sim.ids.embudo('Agenda · Sesiones'));
  process.env.KOMMO_AGENDA_STATUS_ID = String(sim.ids.etapa('Agenda · Sesiones', 'Discovery agendada'));
  process.env.KOMMO_PIPELINE_ID = String(sim.ids.embudo('Sitio web · Cotizaciones'));
  process.env.KOMMO_STATUS_ID = String(sim.ids.etapa('Sitio web · Cotizaciones', 'Nueva cotización'));

  await reservar('discovery');
  const d = leadDelEvento(g);
  assert.deepEqual(sim.ubicacion(d), { embudo: 'Agenda · Sesiones', etapa: 'Discovery agendada' });

  g.events.clear();
  await reservar('power');
  const p = leadDelEvento(g);
  assert.deepEqual(sim.ubicacion(p), { embudo: 'Agenda · Sesiones', etapa: 'Power Session por pagar' }, 'la variable no le gana a la etapa por nombre');
  assert.equal(sim.valores(p)['Pago Power Session'], 'Pendiente');
  assert.equal(sim.llamadasA('POST', '/leads/complex').length, 2, 'sin 400 ni reintentos');

  s.pay([...s.sessions.keys()][0]);
  await book().confirmFromCheckout([...s.sessions.keys()][0]);
  assert.deepEqual(sim.ubicacion(p), { embudo: 'Agenda · Sesiones', etapa: 'Power Session pagada' });
});

test('kommo · KOMMO_AGENDA_STATUS_ID solo es respaldo: se usa si la etapa con su nombre no existe en la cuenta', async (t) => {
  const { sim, g } = await montar(t, { sinEtapas: ['Power Session por pagar'] });
  process.env.KOMMO_AGENDA_STATUS_ID = String(sim.ids.etapa('Agenda · Sesiones', 'Sesión realizada'));
  await reservar('power');
  assert.deepEqual(sim.ubicacion(leadDelEvento(g)), { embudo: 'Agenda · Sesiones', etapa: 'Sesión realizada' }, 'falta «por pagar» → la de la variable');
  g.events.clear();
  await reservar('discovery');
  assert.deepEqual(sim.ubicacion(leadDelEvento(g)), { embudo: 'Agenda · Sesiones', etapa: 'Discovery agendada' }, 'la que sí existe gana');

  // Con un embudo forzado por variable que no tiene las etapas aprobadas: la etapa de la variable.
  process.env.KOMMO_AGENDA_PIPELINE_ID = String(sim.ids.embudo('Clientes · Implementación'));
  process.env.KOMMO_AGENDA_STATUS_ID = String(sim.ids.etapa('Clientes · Implementación', 'Arranque'));
  g.events.clear();
  await reservar('discovery');
  assert.deepEqual(sim.ubicacion(leadDelEvento(g)), { embudo: 'Clientes · Implementación', etapa: 'Arranque' });
});

test('kommo · al pagar, el lead ya no existe (404) → lead NUEVO en «Power Session pagada» con la nota; el cron no reintenta de más', async (t) => {
  const aviso = webhook();
  const { sim, g, s, logs } = await montar(t, {}, { NOTIFY_WEBHOOK_URL: WEBHOOK }, [aviso]);
  await reservar('power');
  const viejo = leadDelEvento(g);
  const contacto = sim.leads.get(viejo).contact_id;
  sim.leads.delete(viejo); // alguien lo borró (o lo fusionó con otro) en Kommo
  const ev = () => [...g.events.values()][0];
  const sessionId = [...s.sessions.keys()][0];
  s.pay(sessionId);

  // Kommo además está caído un momento para crear el lead nuevo: falla pasajera → sin marca, el cron lo reintenta.
  sim.fallas['/leads/complex'] = 500;
  const c = await book().confirmFromCheckout(sessionId);
  assert.equal(c.paid, true, 'la cita se confirma igual (Calendar manda)');
  assert.equal(sim.llamadasA('PATCH', `/leads/${viejo}`).length, 1, 'un PATCH (404), sin reintentos inútiles');
  assert.equal(ev().extendedProperties.private.ik_kommo_pago, undefined);
  assert.equal(ev().extendedProperties.private.ik_kommo, String(viejo));

  delete sim.fallas['/leads/complex'];
  assert.equal(await book().syncKommoPaid(), 1);
  const nuevo = leadDelEvento(g);
  assert.notEqual(nuevo, viejo, 'ik_kommo apunta al lead nuevo');
  assert.ok(sim.leads.has(nuevo));
  assert.equal(ev().extendedProperties.private.ik_kommo_pago, '1');
  assert.deepEqual(sim.ubicacion(nuevo), { embudo: 'Agenda · Sesiones', etapa: 'Power Session pagada' });
  assert.equal(sim.leads.get(nuevo).name, 'Power Session · Clínica Ejemplo');
  assert.equal(sim.leads.get(nuevo).contact_id, contacto, 'ligado al mismo contacto (por correo)');
  assert.deepEqual(sim.valores(nuevo), {
    'Tipo de sesión': 'Power Session',
    'Pago Power Session': 'Pagado',
    'Fecha de la sesión': Date.parse(START) / 1000,
    'Enlace de Meet': c.meetLink,
    'Página de origen': 'https://ingeniak.mx/power-session/',
  });
  assert.deepEqual(sim.etiquetas(nuevo), ['web-agenda', 'power-session', 'entorno-preview']);
  for (const tag of sim.etiquetas(nuevo)) assert.ok(ETIQUETAS.includes(tag), tag);
  const nota = sim.notasDe(nuevo)[0];
  assert.match(nota, /^Pago confirmado en Stripe · Miércoles 21 de octubre · 10:00 AM \(hora del centro de México\) · Meet: /);
  assert.match(nota, new RegExp(`El lead original de esta reserva \\(n\\.º ${viejo}\\) ya no existe en Kommo`));
  assert.match(nota, /Folio IK-AG-/);
  sinIdsDesconocidos(sim);

  const alertas = aviso.recibidos.filter((b) => b.event === 'kommo.alerta');
  assert.equal(alertas.length, 1);
  assert.equal(alertas[0].alerta, 'lead de la reserva no encontrado');
  assert.equal(alertas[0].kommo.status, 404);
  assert.equal(alertas[0].kommo.leadId, nuevo);
  assert.ok(!JSON.stringify(alertas[0]).includes('ana@ejemplo.test'), 'la alerta no lleva datos personales');

  // Ya quedó: el cron no vuelve a tocar Kommo por este evento.
  const antes = sim.llamadas.length;
  assert.equal(await book().syncKommoPaid(), 0);
  assert.equal(sim.llamadas.length, antes);
  const all = logs.join('\n');
  for (const x of [TOKEN_SIMULADO, 'ana@ejemplo.test', 'Ana Prueba']) assert.ok(!all.includes(x), `sin ${x} en los logs`);
});

test('kommo · lead borrado y Kommo rechaza también el nuevo (400) → marca «error», alerta, y el cron deja de reintentar', async (t) => {
  const aviso = webhook();
  const { sim, g, s } = await montar(t, {}, { NOTIFY_WEBHOOK_URL: WEBHOOK }, [aviso]);
  await reservar('power');
  const viejo = leadDelEvento(g);
  sim.leads.delete(viejo);
  sim.fallas['/leads/complex'] = 400;
  const sessionId = [...s.sessions.keys()][0];
  s.pay(sessionId);
  await book().confirmFromCheckout(sessionId);
  const props = [...g.events.values()][0].extendedProperties.private;
  assert.equal(props.ik_kommo_pago, 'error');
  assert.equal(props.ik_kommo, String(viejo));
  assert.equal(sim.leads.size, 0);
  const alertas = aviso.recibidos.filter((b) => b.event === 'kommo.alerta');
  assert.deepEqual(alertas.map((a) => a.alerta), ['pago sin registrar en Kommo']);
  const antes = sim.llamadas.length;
  assert.equal(await book().syncKommoPaid(), 0);
  assert.equal(sim.llamadas.length, antes, 'sin más llamadas a Kommo');
});

test('kommo · al pagar, Kommo rechaza una opción que cambió → reintento sin campos: el lead igual pasa a «pagada»', async (t) => {
  const { sim, g, s } = await montar(t);
  await reservar('power');
  const id = leadDelEvento(g);
  sim.quitarOpcion('Pago Power Session', 'Pagado');
  s.pay([...s.sessions.keys()][0]);
  await book().confirmFromCheckout([...s.sessions.keys()][0]);
  const patches = sim.llamadasA('PATCH', `/leads/${id}`);
  assert.equal(patches.length, 2, '400 + reintento');
  assert.equal(patches[1].body.custom_fields_values, undefined);
  assert.deepEqual(sim.ubicacion(id), { embudo: 'Agenda · Sesiones', etapa: 'Power Session pagada' });
  assert.equal(sim.valores(id)['Pago Power Session'], 'Pendiente', 'el campo no se pudo cambiar…');
  assert.match(sim.notasDe(id).at(-1), /^Pago confirmado en Stripe/, '…pero la nota lo dice');
  assert.equal([...g.events.values()][0].extendedProperties.private.ik_kommo_pago, '1');
});

test('kommo · estructura caída al pagar → no se marca ik_kommo_pago y el cron lo completa después', async (t) => {
  const { sim, g, s } = await montar(t);
  await reservar('power');
  const id = leadDelEvento(g);
  sim.fallas['/leads/pipelines'] = 500;
  sim.fallas['/leads/custom_fields'] = 500;
  __resetKommo();
  s.pay([...s.sessions.keys()][0]);
  const c = await book().confirmFromCheckout([...s.sessions.keys()][0]);
  assert.equal(c.paid, true, 'la cita se confirma igual (Calendar manda)');
  const ev = () => [...g.events.values()][0];
  assert.equal(ev().extendedProperties.private.rl_estado, 'confirmada');
  assert.equal(ev().extendedProperties.private.ik_kommo_pago, undefined);
  assert.equal(sim.ubicacion(id).etapa, 'Power Session por pagar');
  assert.equal(sim.notasDe(id).length, 1, 'sin nota de pago todavía (se manda junto con el cambio)');

  sim.fallas = {};
  __resetKommo();
  assert.equal(await book().syncKommoPaid(), 1);
  assert.equal(ev().extendedProperties.private.ik_kommo_pago, '1');
  assert.deepEqual(sim.ubicacion(id), { embudo: 'Agenda · Sesiones', etapa: 'Power Session pagada' });
  assert.equal(sim.valores(id)['Pago Power Session'], 'Pagado');
});

test('kommo · etiquetas de la agenda: solo las 10 aprobadas; producción sin entorno-preview', async (t) => {
  const { sim } = await montar(t, {}, { VERCEL_ENV: 'production' });
  for (const [type, atrib] of [['discovery', {}], ['power', { utm_medium: 'cpc' }], ['discovery', { clid: { fbclid: 'IwAR-prueba' } }]]) {
    await leads.recordBooking({ type, form: form(type), startIso: START, origin: null, eventId: `ev${type}x`, attribution: bookingAttribution(atrib), meetLink: null });
  }
  const todas = [...sim.leads.keys()].map((id) => sim.etiquetas(id));
  assert.deepEqual(todas, [
    ['web-agenda', 'discovery', 'orgánico'],
    ['web-agenda', 'power-session', 'campaña'],
    ['web-agenda', 'discovery', 'campaña'],
  ]);
  for (const tag of todas.flat()) assert.ok(ETIQUETAS.includes(tag), tag);
});

test('estado · kommoEstructura: completa, incompleta (con lo que falta) y sin estructura — sin ids ni token', async (t) => {
  const google = {
    handle: (/** @type {URL} */ u) => {
      if (u.hostname === 'oauth2.googleapis.com') return Response.json({ access_token: FAKE.googleToken, expires_in: 3600 });
      if (u.hostname === 'www.googleapis.com') return Response.json({ id: 'x' });
      if (u.hostname === 'api.stripe.com') return Response.json({ data: [] });
      return null;
    },
  };
  const sim = await new KommoSimulado({ sinCampos: ['Plazo'] }).iniciar();
  t.after(() => sim.detener());
  env(t, { VERCEL_ENV: 'preview', ...REAL, ...sim.vars });
  mockFetch(t, google, sim.pasarela());
  captureLogs(t);
  let r = await read(await estado.fetch(req('/api/agenda/estado/')));
  assert.equal(r.body.kommo, 'configurado');
  assert.equal(r.body.kommoEstructura, 'incompleta');
  assert.deepEqual(r.body.kommoFaltan, ['Campo «Plazo»']);
  const text = JSON.stringify(r.body);
  assert.ok(!text.includes(TOKEN_SIMULADO));
  assert.ok(!/\b\d{4,}\b/.test(text.replace(/"entorno":"[^"]*"/, '')), 'sin ids numéricos');

  const completa = await new KommoSimulado().iniciar();
  t.after(() => completa.detener());
  process.env.KOMMO_BASE_URL = completa.base;
  mockFetch(t, google, completa.pasarela());
  r = await read(await estado.fetch(req('/api/agenda/estado/')));
  assert.equal(r.body.kommoEstructura, 'completa');
  assert.equal(r.body.kommoFaltan, undefined);
  assert.equal(r.body.kommoOpcional, undefined);

  // Script corrido con --sin-clientes: el sitio no usa «Clientes · Implementación» → sigue «completa» (aparte, como opcional).
  const sinClientes = await new KommoSimulado({ sinEmbudos: ['Clientes · Implementación'] }).iniciar();
  t.after(() => sinClientes.detener());
  process.env.KOMMO_BASE_URL = sinClientes.base;
  mockFetch(t, google, sinClientes.pasarela());
  r = await read(await estado.fetch(req('/api/agenda/estado/')));
  assert.equal(r.body.kommoEstructura, 'completa');
  assert.equal(r.body.kommoFaltan, undefined);
  assert.deepEqual(r.body.kommoOpcional, ['Embudo «Clientes · Implementación»']);

  const vacia = await new KommoSimulado({ estructura: false }).iniciar();
  t.after(() => vacia.detener());
  process.env.KOMMO_BASE_URL = vacia.base;
  mockFetch(t, google, vacia.pasarela());
  r = await read(await estado.fetch(req('/api/agenda/estado/')));
  assert.equal(r.body.kommoEstructura, 'sin-estructura');
  assert.ok(r.body.kommoFaltan.includes('Embudo «Agenda · Sesiones»'));
});
