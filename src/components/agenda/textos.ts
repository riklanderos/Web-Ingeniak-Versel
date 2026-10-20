// Textos del componente de reserva (BookingFlow) · voz de Ingeniak: plural, tuteo, español de México (CAMBIO-COTIZAR §4.5).
// Mismo contenido que el BookingFlow de riklanderos.tech pasado a la voz de la marca. Sin promesas de tiempo de respuesta:
// la invitación de Google llega al confirmar (lo hace el sistema) y se dice sin plazo.
// Cifras: "30 min" / "90 min" van con data-allow-number en el marcado; el precio de la Power Session sale de
// OFFERS['power-price'] (metrics.ts) y se pinta dentro de <span data-offer="power-price">.
import * as M from '../../lib/metrics';
import { HOLD_MINUTES, POWER_PRICE_CENTS, SESSION_RULES, CONTACT, type SessionType } from '../../../shared/agenda.js';

/** Precio de la Power Session como lo publica el sitio ("USD 297"). Fuente: OFFERS de metrics.ts (§4.4). */
export const POWER_PRICE: string = ((M as any).OFFERS?.['power-price'] as string | undefined) ?? `USD ${POWER_PRICE_CENTS / 100}`;

/** Minutos de apartado que se le dicen a la persona (Stripe exige ≥ 30; el evento se aparta 31). */
export const HOLD_SHOWN = HOLD_MINUTES - 1;

export const T = {
  pasos: { discovery: ['Tus datos', 'Horario', 'Confirmar'], power: ['Tus datos', 'Horario', 'Pago'] } as Record<SessionType, string[]>,
  pasoDe: 'Paso {n} de 3',
  sim: 'Simulación local',

  /* Paso 1 */
  s1: {
    h: 'Cuéntanos de ti y de tu negocio',
    sub: { discovery: 'Unas preguntas para llegar a la llamada con contexto.', power: 'Unas preguntas para llegar a la sesión con tu operación ya leída.' } as Record<SessionType, string>,
    grupos: ['Sobre ti', 'Sobre tu negocio', 'Para preparar la sesión'],
    resumen: 'Revisa estos campos:',
    boton: 'Elegir horario',
    privacidad: 'Tus datos solo se usan para preparar tu sesión.',
    aviso: 'Aviso de privacidad',
    honeypot: 'No llenar',
  },
  campos: {
    fullName: { label: 'Nombre completo' },
    email: { label: 'Correo', help: 'Ahí te llega la invitación con el enlace de Meet.' },
    whatsapp: { label: 'WhatsApp', help: 'Con lada. Solo para avisos de tu sesión.' },
    businessName: { label: 'Nombre del negocio' },
    website: { label: 'Sitio web o redes', placeholder: 'instagram.com/tunegocio' },
    industry: { label: 'Giro', placeholder: 'Elige uno' },
    teamSize: { label: 'Personas en tu equipo', placeholder: 'Elige uno' },
    revenue: { label: 'Facturación mensual aproximada', placeholder: 'Elige un rango' },
    timeDrains: { label: '¿Dónde se te va más el tiempo?', opt: 'Hasta 3' },
    tools: { label: '¿Qué herramientas usan hoy?', help: 'CRM, Excel, WhatsApp Business, facturación…' },
    goal: {
      discovery: { label: '¿Qué quieres revisar en la llamada?', help: 'Una o dos frases bastan.' },
      power: { label: '¿Qué quieres resolver en la sesión?', help: 'Mientras más concreto, mejor llegamos preparados.' },
    } as Record<SessionType, { label: string; help: string }>,
    opcional: 'Opcional',
  },

  /* Paso 2 */
  s2: {
    h: 'Elige día y hora',
    sub: (type: SessionType) => `Próximos 5 días hábiles · ${SESSION_RULES[type].minutes} min · Horarios en hora del centro de México (CDMX).`,
    dias: 'Días disponibles',
    cargando: 'Cargando horarios…',
    reintentar: 'Reintentar',
    lleno: 'Lleno',
    tuHora: 'tu hora',
    vacio: {
      power: 'Esta semana ya no quedan Power Sessions: abrimos 4 por semana, por orden de pago.',
      discovery: 'No quedan horarios libres en los próximos días.',
    } as Record<SessionType, string>,
    vacioCierre: 'Escríbenos por WhatsApp o a {email} y te buscamos un espacio.',
    atras: 'Atrás',
    continuar: 'Continuar',
  },

  /* Paso 3 */
  s3: {
    h: { discovery: 'Revisa y confirma', power: 'Revisa y paga' } as Record<SessionType, string>,
    filas: { sesion: 'Sesión', cuando: 'Cuándo', para: 'Para', costo: 'Costo' },
    sesion: (type: SessionType) => `${SESSION_RULES[type].label} · ${SESSION_RULES[type].minutes} min · Google Meet`,
    cdmx: '(CDMX)',
    local: 'en tu zona horaria',
    sinCosto: 'Sin costo',
    pagoUnico: 'pago único',
    nota: {
      discovery: 'Al confirmar, te llega la invitación de Google Calendar con el enlace de Meet.',
      power: `Te llevamos a Stripe para pagar con tarjeta. Tu horario queda apartado ${HOLD_SHOWN} minutos mientras pagas; en cuanto se confirma el pago, te llega la invitación con el enlace de Meet.`,
    } as Record<SessionType, string>,
    cambiar: 'Cambiar horario',
    confirmar: 'Confirmar mi sesión',
    pagar: 'Pagar',
    agendando: 'Agendando…',
    abriendoPago: 'Abriendo pago…',
  },

  /* Avisos y errores del flujo */
  avisos: {
    cancelado: 'Cancelaste el pago y tu horario quedó libre. Puedes elegir el mismo u otro.',
    ocupado: 'Ese horario se acaba de ocupar. Elige otro, por favor.',
    sinConexion: 'Se perdió la conexión. Inténtalo de nuevo.',
    reserva: 'No pudimos completar la reserva. Inténtalo de nuevo o escríbenos por WhatsApp y te agendamos nosotros.',
    agenda: 'No pudimos leer la agenda en este momento. Inténtalo en unos minutos o escríbenos por WhatsApp.',
    wa: 'Escríbenos por WhatsApp',
  },

  /* Vista final (Discovery) */
  done: {
    kicker: 'Sesión agendada',
    h: 'Listo, {nombre}. Tu Discovery Session quedó agendada.',
    hSinNombre: 'Listo. Tu Discovery Session quedó agendada.',
    cuando: '{when} (hora del centro de México)',
    invitacion: 'Te enviamos la invitación de Google Calendar a {email} con el enlace de Google Meet. Si no la ves en tu bandeja de entrada, revisa promociones o spam.',
    meet: 'Abrir enlace de Meet',
    inicio: 'Volver al inicio',
    wa: 'Escríbele a Kain',
    // WhatsApp ya con la sesión agendada (el de la landing dice "…tengo una duda antes de agendar")
    waMensaje: 'Hola, acabo de agendar mi Discovery Session y quiero confirmar algo.',
    waMover: 'Hola, acabo de agendar mi Discovery Session y necesito mover la llamada.',
    aprovechar: 'Para aprovechar los 30 minutos',
    tips: [
      'Conéctate cinco minutos antes desde una computadora, si puedes.',
      'Ten claro qué parte de tu operación se siente más trabada.',
      'Si tienes números a la mano (ventas, leads, tiempos), mejor todavía.',
      'No necesitas preparar presentación: nosotros hacemos las preguntas.',
    ],
    mover: '¿Necesitas mover la llamada? Escríbenos por {wa} o a {email}.',
    moverWa: 'WhatsApp',
  },

  /* Sin JavaScript */
  nojs: 'Para reservar necesitas JavaScript activo, o escríbenos por WhatsApp o a {email}.',
  nojsWa: 'WhatsApp',
  email: CONTACT.email,
};

export type Textos = typeof T;
