// shared/kommo-esquema.js — estructura de Kommo aprobada por el cliente el 2026-10-20 (3 embudos).
// Única fuente de nombres para: scripts/kommo-configurar.mjs (crea la estructura) y server/kommo.js (llena los campos).
// Los nombres y las opciones deben coincidir EXACTO con lo que existe en Kommo: el sitio los busca por nombre.
// Colores: solo la paleta que acepta Kommo para etapas (se valida en el script antes de enviar).
import { INDUSTRIES as AGENDA_INDUSTRIAS, TEAM_SIZES as AGENDA_EQUIPOS, REVENUES as AGENDA_FACTURACION } from './agenda.js';

/** Embudos y etapas activas (Ganado/Perdido los crea Kommo). La primera etapa es la de entrada. */
export const EMBUDOS = {
  cotizaciones: {
    nombre: 'Sitio web · Cotizaciones',
    etapas: [
      { clave: 'nueva', nombre: 'Nueva cotización', color: '#98cbff' },
      { clave: 'contactado', nombre: 'Contactado', color: '#ffeab2' },
      { clave: 'calificado', nombre: 'Calificado', color: '#ffdc7f' },
      { clave: 'propuesta', nombre: 'Propuesta enviada', color: '#ffce5a' },
      { clave: 'negociacion', nombre: 'Negociación', color: '#ff8f92' },
    ],
  },
  agenda: {
    nombre: 'Agenda · Sesiones',
    etapas: [
      { clave: 'discovery', nombre: 'Discovery agendada', color: '#98cbff' },
      { clave: 'power-por-pagar', nombre: 'Power Session por pagar', color: '#ffeab2' },
      { clave: 'power-pagada', nombre: 'Power Session pagada', color: '#87f2c0' },
      { clave: 'realizada', nombre: 'Sesión realizada', color: '#ffce5a' },
      { clave: 'propuesta', nombre: 'Propuesta enviada', color: '#ff8f92' },
    ],
  },
  clientes: {
    nombre: 'Clientes · Implementación',
    etapas: [
      { clave: 'arranque', nombre: 'Arranque', color: '#ccc8f9' },
      { clave: 'implementacion', nombre: 'Implementación (7–30 días)', color: '#f3beff' },
      { clave: 'operacion', nombre: 'En operación', color: '#87f2c0' },
      { clave: 'renovacion', nombre: 'Renovación', color: '#deff81' },
    ],
  },
};

const unir = (...listas) => [...new Set(listas.flat())];

/** Campos personalizados del lead. `opciones` en el orden en que se crean. */
export const CAMPOS = {
  servicios: {
    nombre: 'Servicios de interés', tipo: 'multiselect',
    opciones: ['Agentes de IA para WhatsApp', 'CRM con IA (Kommo o GoHighLevel)', 'Automatización de procesos', 'Consultoría en IA', 'Paid media (anuncios)', 'Página web', 'SEO y visibilidad en buscadores de IA', 'Branding y contenido', 'Software a la medida', 'No estoy seguro'],
  },
  objetivo: {
    nombre: 'Objetivo principal', tipo: 'select',
    opciones: ['Conseguir más prospectos', 'Responder rápido a cada cliente', 'Ordenar ventas y seguimiento', 'Quitarle trabajo repetitivo al equipo', 'Saber qué funciona y qué no', 'Lanzar o renovar mi marca o mi sitio', 'Otro'],
  },
  industria: {
    nombre: 'Industria', tipo: 'select',
    // Las del sitio (cotización) + las de la agenda que no coinciden; "Otro" de la agenda se guarda como "Otra".
    opciones: unir(['Salud', 'Belleza y estética', 'Nutrición', 'Finanzas', 'Inmobiliario', 'Industrial y logística', 'Retail y e-commerce', 'Restaurantes y hoteles'], AGENDA_INDUSTRIAS.filter((x) => x !== 'Otro'), ['Otra']),
    alias: { Otro: 'Otra' },
  },
  tamano: {
    nombre: 'Tamaño de empresa', tipo: 'select',
    opciones: unir(['1–10', '11–50', '51–200', 'Más de 200'], AGENDA_EQUIPOS),
  },
  presupuesto: {
    nombre: 'Presupuesto estimado', tipo: 'select',
    opciones: ['Menos de USD 1,000', 'USD 1,000 a 3,000', 'USD 3,000 a 5,000', 'USD 5,000 a 10,000', 'USD 10,000 a 20,000', 'USD 20,000 a 50,000', 'Más de USD 50,000', 'Aún no lo sé'],
  },
  plazo: {
    nombre: 'Plazo', tipo: 'select',
    opciones: ['Lo antes posible', 'En 1 a 3 meses', 'En 3 a 6 meses', 'Solo estoy explorando'],
  },
  crm: {
    nombre: 'CRM actual', tipo: 'select',
    opciones: ['Kommo', 'GoHighLevel', 'HubSpot', 'Otro CRM', 'Ninguno (Excel, libreta o solo WhatsApp)'],
  },
  canales: {
    nombre: 'Canales que usa hoy', tipo: 'multiselect',
    opciones: ['WhatsApp', 'Instagram', 'Facebook', 'Sitio web', 'Correo', 'Teléfono', 'Tienda o mostrador'],
  },
  contacto: {
    nombre: 'Contacto preferido', tipo: 'select',
    opciones: ['WhatsApp', 'Correo', 'Llamada'],
  },
  facturacion: {
    nombre: 'Facturación mensual', tipo: 'select',
    opciones: [...AGENDA_FACTURACION],
  },
  sesion: {
    nombre: 'Tipo de sesión', tipo: 'select',
    opciones: ['Discovery Session', 'Power Session'],
  },
  fechaSesion: { nombre: 'Fecha de la sesión', tipo: 'date_time' },
  meet: { nombre: 'Enlace de Meet', tipo: 'url' },
  pago: {
    nombre: 'Pago Power Session', tipo: 'select',
    opciones: ['Pendiente', 'Pagado', 'Reembolsado'],
  },
  origen: { nombre: 'Página de origen', tipo: 'url' },
};

/** Etiquetas de leads (máximo 10). */
export const ETIQUETAS = ['web-cotizar', 'web-agenda', 'discovery', 'power-session', 'campaña', 'orgánico', 'referido', 'hot-lead', 'reactivación', 'entorno-preview'];

/** Plantillas de sistema (respuestas de un clic para el equipo). Texto final lo afina el cliente. */
export const PLANTILLAS_SISTEMA = [
  { nombre: 'Precio de referencia', texto: 'Nuestros sistemas arrancan desde USD 997 al mes. El monto exacto depende de qué automatizamos y con qué herramientas; te lo dejamos claro en la propuesta.' },
  { nombre: 'Enlace a Discovery Session', texto: 'Aparta tu Discovery Session (30 min, sin costo) aquí: https://ingeniak.mx/discovery/' },
  { nombre: 'Enlace a Power Session', texto: 'La Power Session son 90 minutos 1:1 para auditar tu operación y salir con un plan a 90 días. Aparta tu lugar aquí: https://ingeniak.mx/power-session/' },
  { nombre: 'Qué es Kain', texto: 'Kain es nuestro agente de IA: atiende por WhatsApp, Instagram, Facebook Messenger, el chat de tu web y correo; califica, agenda y deja cada conversación registrada en tu CRM.' },
  { nombre: 'Siguiente paso tras cotizar', texto: 'Gracias por tu solicitud. Con lo que nos compartiste revisamos tu caso y te escribimos por este medio con los siguientes pasos.' },
  { nombre: 'Reagendar sesión', texto: 'Claro, podemos mover tu sesión. Dime dos o tres horarios que te acomoden y la reagendamos.' },
];

// ── Colores y validación (los usa scripts/kommo-configurar.mjs antes de mandar nada a Kommo) ──────────────

/**
 * Únicos colores que Kommo acepta para una etapa (developers.kommo.com/reference/stage-colors, consultada 2026-10-20).
 * Un color fuera de esta lista hace que Kommo rechace el embudo completo.
 */
export const COLORES_ETAPA = Object.freeze([
  '#fffeb2', '#fffd7f', '#fff000', '#ffeab2', '#ffdc7f', '#ffce5a', '#ffdbdb', '#ffc8c8', '#ff8f92', '#d6eaff', '#c1e0ff',
  '#98cbff', '#ebffb1', '#deff81', '#87f2c0', '#f9deff', '#f3beff', '#ccc8f9', '#eb93ff', '#f2f3f4', '#e6e8ea',
]);

/** Tipos de campo del lead que usa este esquema (todos existen para leads según developers.kommo.com/reference/custom-fields). */
export const TIPOS_CAMPO = Object.freeze(['select', 'multiselect', 'date_time', 'url']);

/** Tipos que llevan lista de opciones (`enums` en la API). */
export const TIPOS_CON_OPCIONES = Object.freeze(['select', 'multiselect']);

/** ¿El color está en la paleta de etapas de Kommo? (sin importar mayúsculas). */
export function colorEtapaValido(color) {
  return typeof color === 'string' && COLORES_ETAPA.includes(color.trim().toLowerCase());
}

/**
 * Nombre comparable, IGUAL que `normalizar()` de server/kommo.js (así busca el sitio embudos, etapas, campos y
 * opciones): NFC, espacios simples, guiones unificados (‐ ‑ ‒ – — ― − → -) y minúsculas.
 * «1–10» y «1-10», o «Industria» e «industria», cuentan como el mismo nombre. El script de configuración la usa
 * para no crear casi-duplicados que el sitio nunca usaría.
 * @param {unknown} s
 */
export function normalizar(s) {
  return String(s ?? '')
    .normalize('NFC')
    .replace(/[‐-―−]/g, '-')
    .replace(/\s+/g, ' ')
    .trim()
    .toLocaleLowerCase('es');
}

/** ¿El sitio trata los dos nombres como el mismo? */
export function mismoNombre(a, b) {
  return normalizar(a) === normalizar(b);
}

/**
 * Revisa que el esquema se pueda mandar a Kommo tal cual. No cambia nada: solo devuelve la lista de problemas
 * (vacía si todo está bien), en español, para que el script se detenga antes de crear algo a medias.
 * @returns {string[]}
 */
export function validarEsquema({ embudos = EMBUDOS, campos = CAMPOS, etiquetas = ETIQUETAS, plantillas = PLANTILLAS_SISTEMA } = {}) {
  const problemas = [];
  const texto = (v) => typeof v === 'string' && v.trim() !== '' && v === v.trim();
  // Repetidos como los ve el sitio (con normalizar): «1-10» y «1–10» son el mismo nombre.
  const repetidos = (lista) => {
    const vistos = new Map();
    const rep = [];
    for (const v of lista) {
      const k = normalizar(v);
      if (!vistos.has(k)) vistos.set(k, v);
      else rep.push(vistos.get(k) === v ? v : `${vistos.get(k)}» y «${v}`);
    }
    return rep;
  };

  const nombresEmbudo = Object.values(embudos).map((e) => e.nombre);
  for (const n of new Set(repetidos(nombresEmbudo))) problemas.push(`Embudo repetido: «${n}».`);
  for (const [clave, embudo] of Object.entries(embudos)) {
    if (!texto(embudo.nombre)) problemas.push(`Embudo «${clave}» sin nombre (o con espacios al inicio o al final).`);
    const etapas = Array.isArray(embudo.etapas) ? embudo.etapas : [];
    if (!etapas.length) problemas.push(`Embudo «${embudo.nombre}» sin etapas.`);
    if (etapas.length > 97) problemas.push(`Embudo «${embudo.nombre}»: Kommo admite 100 etapas contando las 3 de sistema.`);
    for (const n of new Set(repetidos(etapas.map((e) => e.nombre)))) problemas.push(`Etapa repetida en «${embudo.nombre}»: «${n}».`);
    for (const c of new Set(repetidos(etapas.map((e) => e.clave)))) problemas.push(`Clave de etapa repetida en «${embudo.nombre}»: «${c}».`);
    for (const etapa of etapas) {
      if (!texto(etapa.nombre)) problemas.push(`Etapa sin nombre en «${embudo.nombre}».`);
      if (!colorEtapaValido(etapa.color)) {
        problemas.push(`Color no permitido por Kommo en «${embudo.nombre} → ${etapa.nombre}»: ${etapa.color}. Usa uno de COLORES_ETAPA.`);
      }
    }
  }

  const nombresCampo = Object.values(campos).map((c) => c.nombre);
  for (const n of new Set(repetidos(nombresCampo))) problemas.push(`Campo repetido: «${n}».`);
  for (const [clave, campo] of Object.entries(campos)) {
    if (!texto(campo.nombre)) problemas.push(`Campo «${clave}» sin nombre (o con espacios al inicio o al final).`);
    if (!TIPOS_CAMPO.includes(campo.tipo)) problemas.push(`Campo «${campo.nombre}»: tipo «${campo.tipo}» no previsto (${TIPOS_CAMPO.join(', ')}).`);
    const opciones = campo.opciones ?? [];
    if (TIPOS_CON_OPCIONES.includes(campo.tipo)) {
      if (!opciones.length) problemas.push(`Campo «${campo.nombre}» (lista) sin opciones.`);
      for (const o of opciones) if (!texto(o)) problemas.push(`Campo «${campo.nombre}»: opción vacía o con espacios sobrantes («${o}»).`);
      for (const o of new Set(repetidos(opciones))) problemas.push(`Campo «${campo.nombre}»: opción repetida «${o}».`);
    } else if (opciones.length) {
      problemas.push(`Campo «${campo.nombre}» (${campo.tipo}) no lleva opciones.`);
    }
  }

  if (etiquetas.length > 10) problemas.push(`Son ${etiquetas.length} etiquetas; la estructura aprobada tiene máximo 10.`);
  for (const t of etiquetas) if (!texto(t)) problemas.push(`Etiqueta vacía o con espacios sobrantes («${t}»).`);
  for (const t of new Set(repetidos(etiquetas))) problemas.push(`Etiqueta repetida: «${t}».`);

  for (const n of new Set(repetidos(plantillas.map((p) => p.nombre)))) problemas.push(`Plantilla repetida: «${n}».`);
  for (const p of plantillas) {
    if (!texto(p.nombre)) problemas.push('Plantilla sin nombre.');
    if (!texto(p.texto)) problemas.push(`Plantilla «${p.nombre}» sin texto.`);
  }
  return problemas;
}
