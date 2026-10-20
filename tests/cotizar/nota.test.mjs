// Nota, etiquetas y rastreo de Kommo (§3.4) y §3.9-12 (la nota no lleva undefined, null ni renglones vacíos).
import test from 'node:test';
import assert from 'node:assert/strict';
import { cargar, valido } from './_util.mjs';

const { cotizar } = await cargar();
const { validate, cleanMeta, buildKommo, noteFor, tagsFor, trackingFor, pageIdFrom, fechaCdmx } = cotizar;

const AHORA = new Date('2026-10-20T18:34:00.000Z');

/** Datos validados + folio, como los arma el handler. */
function datos(overrides = {}) {
  const input = valido(overrides);
  const v = validate(input);
  assert.equal(v.ok, true, JSON.stringify(v.errors));
  return { data: { ...v.data, submission_id: input.submission_id, folio: 'IK-6F1C2D' }, meta: cleanMeta(input.meta) };
}

test('nota · formato exacto de §3.4 (todos los datos)', () => {
  const { data, meta } = datos({
    meta: {
      utm_source: 'google', utm_medium: 'cpc', utm_campaign: 'agentes-oct', utm_term: 'agente ia whatsapp', utm_content: 'video-a',
      gclid: 'Cj0KCQ-prueba', fbclid: 'IwAR-prueba',
    },
  });
  const esperado = [
    'Solicitud de cotización · sitio web · Folio IK-6F1C2D',
    'Servicios: Agentes de IA para WhatsApp, CRM con IA (Kommo o GoHighLevel)',
    'Qué quiere lograr primero: Responder rápido a cada cliente',
    'Industria: Salud · Equipo: 11–50 personas',
    'Presupuesto estimado: USD 3,000 a 5,000 · Plazo: En 1 a 3 meses',
    'Canales que usan hoy: WhatsApp, Instagram · CRM actual: Ninguno (Excel, libreta o solo WhatsApp)',
    '—',
    'Nombre: Ana Pérez · Empresa: Clínica Ejemplo',
    'WhatsApp: +523312345678 · Correo: ana@empresa.mx',
    'Prefiere que lo contactemos por: WhatsApp',
    'Sitio o redes: clinicaejemplo.mx',
    'Su proyecto: Nos escriben muchas personas al día por WhatsApp y no alcanzamos a responder a todas.',
    '—',
    'Página: /servicios/agentes-ia-whatsapp/ (folio 102) · Botón: hero · Primer clic de la sesión: 102-hero',
    'Llegó por: /blog/kommo-vs-gohighlevel/ · Referrer: https://www.google.com/',
    'UTM: source=google · medium=cpc · campaign=agentes-oct · term=agente ia whatsapp · content=video-a',
    'gclid=Cj0KCQ-prueba · fbclid=IwAR-prueba',
    'Zona horaria: America/Mexico_City · Enviado: 20/10/2026 12:34 (hora del centro de México)',
    'Consentimiento de contacto por WhatsApp y correo: sí (2026-10-20T18:34:00.000Z)',
    'Entorno: production',
  ].join('\n');
  assert.equal(noteFor(data, meta, { VERCEL_ENV: 'production' }, AHORA), esperado);
});

test('§3.9-12 · nota mínima: sin undefined, null, renglones vacíos ni separadores sueltos', () => {
  const { data, meta } = datos({
    canales: [], crm: '', sitio: '', vision: '\n\n  Primera línea.\n\n\n   \nSegunda línea.\n\n',
    tamano: '200+', canal_preferido: 'llamada',
    meta: { pagina: '', folio: '', cta: '', src: '', landing: '', referrer: '', zona: '', t_llenado_ms: 9000 },
  });
  const nota = noteFor(data, meta, {}, AHORA);
  assert.doesNotMatch(nota, /undefined|null|NaN|\[object/);
  for (const l of nota.split('\n')) {
    assert.notEqual(l.trim(), '', 'sin renglones vacíos');
    assert.doesNotMatch(l, /(^ · )|( · $)|( ·  · )|(: $)/, `renglón limpio: «${l}»`);
  }
  assert.match(nota, /Equipo: Más de 200 personas/);
  assert.match(nota, /Prefiere que lo contactemos por: Llamada/);
  assert.match(nota, /Su proyecto: Primera línea\.\nSegunda línea\./);
  assert.match(nota, /\nEnviado: 20\/10\/2026 12:34 \(hora del centro de México\)\n/);
  assert.match(nota, /\nEntorno: local$/);
  assert.doesNotMatch(nota, /Canales que usan hoy|CRM actual|Sitio o redes|Página:|Llegó por|UTM:|gclid|Zona horaria/);
});

test('hora del centro de México (sin horario de verano desde 2022)', () => {
  assert.equal(fechaCdmx(new Date('2026-01-05T06:05:00Z')), '05/01/2026 00:05');
  assert.equal(fechaCdmx(new Date('2026-07-01T23:59:00Z')), '01/07/2026 17:59');
});

test('etiquetas · estructura aprobada: web-cotizar · campaña | orgánico · entorno-preview fuera de producción', () => {
  const { data, meta } = datos();
  assert.deepEqual(tagsFor(data, meta, {}), ['web-cotizar', 'orgánico', 'entorno-preview'], 'local cuenta como prueba');
  assert.deepEqual(tagsFor(data, meta, { VERCEL_ENV: 'preview' }), ['web-cotizar', 'orgánico', 'entorno-preview']);
  assert.deepEqual(tagsFor(data, meta, { VERCEL_ENV: 'development' }), ['web-cotizar', 'orgánico', 'entorno-preview']);
  assert.deepEqual(tagsFor(data, meta, { VERCEL_ENV: 'production' }), ['web-cotizar', 'orgánico']);
  const prod = { VERCEL_ENV: 'production' };
  /** @param {Record<string, string>} m */
  const conMeta = (m) => tagsFor(data, cleanMeta({ ...valido().meta, ...m }), prod);
  for (const medio of ['cpc', 'CPC', 'ppc', 'paid', 'paid_social', 'paidsocial', 'paid-search', 'social-paid', 'cpm', 'display', 'ads', 'facebook_ads', 'retargeting']) {
    assert.deepEqual(conMeta({ utm_medium: medio }), ['web-cotizar', 'campaña'], medio);
  }
  for (const medio of ['', 'email', 'social', 'organic', 'referral', 'newsletter', 'whatsapp', 'badges']) {
    assert.deepEqual(conMeta({ utm_medium: medio }), ['web-cotizar', 'orgánico'], medio || '(vacío)');
  }
  assert.deepEqual(conMeta({ gclid: 'Cj0-prueba' }), ['web-cotizar', 'campaña']);
  assert.deepEqual(conMeta({ fbclid: 'IwAR-prueba' }), ['web-cotizar', 'campaña']);
  assert.deepEqual(conMeta({ gbraid: 'gb-prueba' }), ['web-cotizar', 'campaña']);
  assert.deepEqual(conMeta({ wbraid: 'wb-prueba' }), ['web-cotizar', 'campaña']);
  // Ninguna etiqueta vieja por servicio, presupuesto, plazo, industria, contacto o página.
  for (const t of tagsFor(data, meta, {})) assert.doesNotMatch(t, /^(servicio|presupuesto|plazo|industria|prefiere|pagina)-/);
});

test('page.id desde meta.pagina (ruta, URL completa, sin barra, con query)', () => {
  assert.equal(pageIdFrom('/'), 'home');
  assert.equal(pageIdFrom('/industrias/salud/'), 'ind-salud');
  assert.equal(pageIdFrom('/industrias/salud'), 'ind-salud');
  assert.equal(pageIdFrom('https://ingeniak.mx/blog/kommo-vs-gohighlevel/?utm_source=x#cotizar'), 'art-kommo-ghl');
  assert.equal(pageIdFrom('/power-session/'), 'power-session');
  assert.equal(pageIdFrom('/no-existe/'), null);
  assert.equal(pageIdFrom(''), null);
});

test('rastreo · solo los campos con valor', () => {
  const meta = cleanMeta({ utm_source: 'google', utm_medium: '', referrer: 'https://www.google.com/', gclid: 'abc', fbclid: '' });
  assert.deepEqual(trackingFor(meta), { UTM_SOURCE: 'google', REFERRER: 'https://www.google.com/', GCLID: 'abc' });
});

test('buildKommo · lead, contacto, empresa y ids de embudo desde variables', () => {
  const { data, meta } = datos();
  const k = buildKommo(data, meta, { KOMMO_PIPELINE_ID: '1111111', KOMMO_STATUS_ID: ' 2222222 ', KOMMO_RESPONSIBLE_USER_ID: 'abc' }, AHORA);
  assert.deepEqual(k.lead, {
    name: 'Cotización web · Clínica Ejemplo',
    contact: { name: 'Ana Pérez', phoneE164: '+523312345678', email: 'ana@empresa.mx' },
    company: 'Clínica Ejemplo',
    embudo: 'cotizaciones',
    etapa: 'nueva',
    campos: {
      servicios: ['Agentes de IA para WhatsApp', 'CRM con IA (Kommo o GoHighLevel)'],
      objetivo: 'Responder rápido a cada cliente',
      industria: 'Salud',
      tamano: '11–50',
      presupuesto: 'USD 3,000 a 5,000',
      plazo: 'En 1 a 3 meses',
      crm: 'Ninguno (Excel, libreta o solo WhatsApp)',
      canales: ['WhatsApp', 'Instagram'],
      contacto: 'WhatsApp',
      origen: 'https://ingeniak.mx/servicios/agentes-ia-whatsapp/',
    },
    pipelineId: 1111111,
    statusId: 2222222,
    responsibleUserId: undefined,
  });
  // Opcionales vacíos: sin claves vacías (CRM y canales no se mandan).
  const sinOpc = buildKommo(datos({ crm: '', canales: [], meta: { pagina: '' } }).data, cleanMeta({}), {}, AHORA);
  assert.deepEqual(Object.keys(sinOpc.lead.campos).sort(), ['contacto', 'industria', 'objetivo', 'plazo', 'presupuesto', 'servicios', 'tamano']);
  assert.deepEqual(k.tracking, { REFERRER: 'https://www.google.com/' });
  assert.equal(k.tags[0], 'web-cotizar');
  assert.match(k.note, /^Solicitud de cotización · sitio web · Folio IK-6F1C2D\n/);
});

test('meta · saneo y recortes (nunca falla)', () => {
  const m = cleanMeta({ pagina: 42, referrer: 'x'.repeat(900), hp: '', t_llenado_ms: '5000', cta: '\u0000hero\n' });
  assert.equal(m.pagina, '42');
  assert.equal(m.referrer.length, 500);
  assert.equal(m.t_llenado_ms, 5000);
  assert.equal(m.cta, 'hero');
  assert.equal(cleanMeta(null).t_llenado_ms, null);
  assert.equal(cleanMeta('roto').pagina, '');
});
