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
    website: { label: 'Enlace de tu web o red social', placeholder: 'instagram.com/tunegocio' },
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
    sub: (type: SessionType) => `${SESSION_RULES[type].sameDay ? 'Hoy y los próximos' : 'Próximos'} ${SESSION_RULES[type].days} días hábiles · ${SESSION_RULES[type].minutes} min · Horarios en hora del centro de México (CDMX).`,
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

/* ───────────────────────── Versión en inglés (/en/, 2026-11-20) ───────────────────────── */
export const T_EN: Textos = {
  pasos: { discovery: ['Your details', 'Time slot', 'Confirm'], power: ['Your details', 'Time slot', 'Payment'] },
  pasoDe: 'Step {n} of 3',
  sim: 'Local simulation',
  s1: {
    h: 'Tell us about you and your business',
    sub: { discovery: 'A few questions so we come to the call with context.', power: 'A few questions so we come to the session having already read your operation.' },
    grupos: ['About you', 'About your business', 'To prepare the session'],
    resumen: 'Check these fields:',
    boton: 'Pick a time',
    privacidad: 'Your details are only used to prepare your session.',
    aviso: 'Privacy Policy',
    honeypot: 'Leave blank',
  },
  campos: {
    fullName: { label: 'Full name' },
    email: { label: 'Email', help: "That's where we'll send the invite with the Meet link." },
    whatsapp: { label: 'WhatsApp', help: 'With country code. Only for updates about your session.' },
    businessName: { label: 'Business name' },
    website: { label: 'Link to your website or social media', placeholder: 'instagram.com/yourbusiness' },
    industry: { label: 'Industry', placeholder: 'Pick one' },
    teamSize: { label: 'People on your team', placeholder: 'Pick one' },
    revenue: { label: 'Approximate monthly revenue', placeholder: 'Pick a range' },
    timeDrains: { label: 'Where does most of your time go?', opt: 'Up to 3' },
    tools: { label: 'What tools do you use today?', help: 'CRM, Excel, WhatsApp Business, invoicing…' },
    goal: {
      discovery: { label: 'What do you want to review on the call?', help: 'One or two sentences is enough.' },
      power: { label: 'What do you want to solve in the session?', help: 'The more specific, the better prepared we arrive.' },
    },
    opcional: 'Optional',
  },
  s2: {
    h: 'Pick a day and time',
    sub: (type: SessionType) => `${SESSION_RULES[type].sameDay ? 'Today and the next' : 'Next'} ${SESSION_RULES[type].days} business days · ${SESSION_RULES[type].minutes} min · Times in Central Mexico time (Mexico City).`,
    dias: 'Available days',
    cargando: 'Loading times…',
    reintentar: 'Try again',
    lleno: 'Full',
    tuHora: 'your time',
    vacio: {
      power: 'No Power Sessions left this week: we open 4 per week, in order of payment.',
      discovery: 'No open time slots in the coming days.',
    },
    vacioCierre: "Message us on WhatsApp or at {email} and we'll find you a slot.",
    atras: 'Back',
    continuar: 'Continue',
  },
  s3: {
    h: { discovery: 'Review and confirm', power: 'Review and pay' },
    filas: { sesion: 'Session', cuando: 'When', para: 'For', costo: 'Cost' },
    sesion: (type: SessionType) => `${SESSION_RULES[type].label} · ${SESSION_RULES[type].minutes} min · Google Meet`,
    cdmx: '(Mexico City)',
    local: 'in your time zone',
    sinCosto: 'Free',
    pagoUnico: 'one-time payment',
    nota: {
      discovery: "Once you confirm, you'll get the Google Calendar invite with the Meet link.",
      power: `We'll take you to Stripe to pay by card. Your time slot is held for ${HOLD_SHOWN} minutes while you pay; once the payment goes through, you'll get the invite with the Meet link.`,
    },
    cambiar: 'Change time',
    confirmar: 'Confirm my session',
    pagar: 'Pay',
    agendando: 'Booking…',
    abriendoPago: 'Opening payment…',
  },
  avisos: {
    cancelado: 'You canceled the payment and your time slot was released. You can pick the same one or another.',
    ocupado: 'That time slot was just taken. Please pick another one.',
    sinConexion: 'The connection dropped. Please try again.',
    reserva: "We couldn't complete the booking. Try again, or message us on WhatsApp and we'll book it for you.",
    agenda: "We couldn't load the calendar right now. Try again in a few minutes or message us on WhatsApp.",
    wa: 'Message us on WhatsApp',
  },
  done: {
    kicker: 'Session booked',
    h: "You're all set, {nombre}. Your Discovery Session is booked.",
    hSinNombre: "You're all set. Your Discovery Session is booked.",
    cuando: '{when} (Central Mexico time)',
    invitacion: "We sent the Google Calendar invite to {email} with the Google Meet link. If you don't see it in your inbox, check promotions or spam.",
    meet: 'Open the Meet link',
    inicio: 'Back to home',
    wa: 'Message Kain',
    waMensaje: "Hi, I'm coming from the English site. I just booked my Discovery Session and want to confirm something.",
    waMover: "Hi, I'm coming from the English site. I just booked my Discovery Session and need to reschedule the call.",
    aprovechar: 'To make the most of the 30 minutes',
    tips: [
      'Join five minutes early from a computer, if you can.',
      'Know which part of your operation feels most stuck.',
      'If you have numbers handy (sales, leads, response times), even better.',
      "No need to prepare a presentation: we'll ask the questions.",
    ],
    mover: 'Need to reschedule? Message us on {wa} or at {email}.',
    moverWa: 'WhatsApp',
  },
  nojs: 'To book, you need JavaScript turned on, or message us on WhatsApp or at {email}.',
  nojsWa: 'WhatsApp',
  email: CONTACT.email,
};
/** Textos del flujo en el idioma de la página. */
export const textos = (lang: 'es' | 'en'): Textos => (lang === 'en' ? T_EN : T);

