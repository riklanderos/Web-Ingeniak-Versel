// Contenido de /comercial/ (manual interno del flujo comercial). Fuente: brief del 24 de noviembre de 2026 y lectura directa
// del CRM (etapas, bots y plantillas). No se inventa nada: lo que no existe va con su etiqueta de estado.

export type Rol = 'kain' | 'com' | 'rik' | 'sis' | 'ops';
export type Estado = 'ACTIVO' | 'RECOMENDADO' | 'POR DEFINIR' | 'POR CONFIRMAR' | 'EN OBSERVACIÓN' | 'DETECTADO' | 'EN REVISIÓN';

export const CORTE = '24 de noviembre de 2026';

export const ROLES: Record<Rol, { nombre: string; corto: string }> = {
  kain: { nombre: 'Kain', corto: 'Kain' },
  com: { nombre: 'Comercial', corto: 'Comercial' },
  rik: { nombre: 'Rik', corto: 'Rik' },
  sis: { nombre: 'Sistema automático', corto: 'Sistema' },
  ops: { nombre: 'Operaciones', corto: 'Operaciones' },
};

export const PRINCIPIO = {
  frase: 'Kain conversa, califica y agenda; el comercial entra cuando hace falta una persona; Rik da las sesiones y arma los presupuestos.',
  partes: [
    { rol: 'kain' as Rol, texto: 'Kain conversa, califica y agenda.' },
    { rol: 'com' as Rol, texto: 'El comercial entra cuando hace falta una persona.' },
    { rol: 'rik' as Rol, texto: 'Rik da las sesiones y arma los presupuestos.' },
  ],
  demo: 'La conversación con Kain es, además, la demostración del producto: el prospecto vive en su propio WhatsApp lo que un agente haría por su negocio. Por eso la regla general es dejar trabajar a Kain y entrar solo con las señales de relevo.',
  horario: 'Nos adaptamos al horario del cliente: Kain ofrece horarios en la hora del cliente y agenda en la de Rik.',
  recorrido: ['Entradas', 'Calificación', 'Discovery Session', 'Presupuestos', 'Clientes'],
};

export const EQUIPO: { rol: Rol; titulo: string; quien: string; toca: string[] }[] = [
  { rol: 'kain', titulo: 'Agente de IA', quien: 'Kain', toca: ['Abrir la conversación', 'Investigar el negocio del prospecto', 'Calificar', 'Agendar y reagendar', 'Dar seguimiento', 'Presentar el aviso de presupuesto'] },
  { rol: 'com', titulo: 'Comercial', quien: 'Marcos', toca: ['Responsable de los leads', 'Llamar cuando hay tarea', 'Atender a quien no califica', 'Cerrar presupuestos'] },
  { rol: 'rik', titulo: 'Dirección', quien: 'Rik', toca: ['Dar la Discovery Session', 'Dar la Power Session', 'Presentar el Game Plan', 'Preparar los presupuestos'] },
  { rol: 'ops', titulo: 'Operaciones', quien: 'Barbara', toca: ['Arranque del cliente una vez cerrado', 'Operación del cliente'] },
];

export const REGLA_CONTEO = {
  titulo: 'El lead no se mueve: se crea uno nuevo',
  texto: 'Cuando un lead se gana en un pipeline, no se mueve: se crea un lead nuevo en el siguiente con toda su información y un enlace al lead de origen. Así cada pipeline mide su propia conversión. Solo los leads de Presupuestos llevan monto.',
  tabla: [
    { pipeline: 'Calificación', gana: 'Se agenda la Discovery', sigue: 'Lead nuevo en Discovery Session' },
    { pipeline: 'Discovery Session', gana: 'Se decide preparar presupuesto', sigue: 'Lead nuevo en Presupuestos' },
    { pipeline: 'Presupuestos', gana: 'El cliente contrata', sigue: 'Cliente' },
  ],
};

export interface Tiempo { t: string; q: string; rol: Rol }
export interface Etapa {
  nombre: string;
  lidera: Rol;
  relevo?: boolean;
  auto: string[];
  equipo: { rol: Rol; texto: string }[];
  tiempos?: Tiempo[];
  bots?: string[];
  plantillas?: string[];
  etiquetas?: string[];
  sale?: string[];
  estado?: Estado;
  nota?: string;
}
export interface Pipeline {
  id: string;
  nombre: string;
  objetivo: string;
  corte?: string;
  dato?: string;
  etapas: Etapa[];
  reglas?: string[];
}

export const ENTRADAS: { origen: string; pasa: string[]; plantilla?: string; rol: Rol; estado: Estado }[] = [
  {
    origen: 'Formulario de ingeniak.mx', rol: 'sis', estado: 'ACTIVO', plantilla: 'ingk_apertura_web_v3',
    pasa: ['Se asigna a Marcos.', 'Sale al instante la plantilla de apertura con una frase armada con sus respuestas («Vi que tu prioridad es… y que hoy atienden por…»).', 'Pasa a «Plantilla enviada».', 'Tarea «Revisar lead nuevo» a Marcos, a 2 h.'],
  },
  {
    origen: 'Formulario de Meta', rol: 'sis', estado: 'ACTIVO', plantilla: 'ingk_apertura_meta_form_v2',
    pasa: ['Sale la plantilla de apertura de Meta.', 'Pasa a «Plantilla enviada».', 'Tarea a Marcos a 2 h.'],
  },
  {
    origen: 'Anuncio de Meta a WhatsApp', rol: 'kain', estado: 'ACTIVO',
    pasa: ['No hay plantilla: el cliente ya escribió.', 'Pasa a «En conversación» y Kain responde de inmediato.', 'Tarea a Marcos a 2 h.'],
  },
];
export const NICHOS = 'Los anuncios por nicho (agencias de autos, clínicas, colegios, inmobiliarias, manufactura, pacas) dejan registrado el nicho en el lead, y Kain usa la ficha de dolores de ese giro.';
export const HORARIO_PLANTILLAS = 'Los mensajes automáticos con plantilla solo salen en horario laboral: lunes a viernes de 8:00 a 19:00 y sábado de 8:00 a 15:00, hora del centro de México.';

export const FLUJO_KAIN: { paso: string; detalle: string; wow?: string }[] = [
  { paso: 'Nombre', detalle: 'Lo pide para comunicarse mejor. Si viene del formulario, ya lo tiene y lo salta.' },
  { paso: 'La sorpresa', detalle: 'Pide su sitio web, Instagram o redes para mostrarle algo de su negocio. Si el formulario ya traía el enlace, no lo pide.' },
  { paso: 'Investigación', detalle: 'Lee el sitio y entrega 2 o 3 recomendaciones concretas.', wow: 'Primer «wow»' },
  { paso: 'Qué quiere resolver', detalle: 'Se salta si el formulario ya traía el objetivo.' },
  { paso: 'Calificación', detalle: 'Máximo 2 preguntas.' },
  { paso: 'Ventaja sobre su competencia', detalle: 'Solo si el cliente quiere; hasta 2 competidores que él nombre.', wow: 'Segundo «wow»' },
  { paso: 'Invitación a la Discovery', detalle: 'Propone la Discovery Session.' },
  { paso: 'Horarios', detalle: 'Consulta el calendario, con mínimo 2 horas de anticipación, en la hora del cliente.' },
  { paso: 'Confirmación', detalle: 'Crea el evento con Meet en el calendario «Discovery Session».' },
  { paso: 'Datos para la sesión', detalle: 'Hasta 3 preguntas, ya con la cita asegurada.' },
];
export const FLUJO_LIMITE = 'Un paso por mensaje, en este orden. Límite: una investigación de negocio y una ronda de competencia por número de WhatsApp.';

export const CRITERIOS = [
  'El negocio ya opera y atiende clientes.',
  'Es dueño, socio o director, o evalúa con acceso a quien decide.',
  'Quiere resolver algo concreto que Ingeniak atiende.',
  'Lo quiere resolver en 6 meses o menos.',
];
export const CASOS: { caso: string; detalle?: string; kain: string; com: string; etiquetas?: string[]; plazo?: string }[] = [
  { caso: 'No califica', detalle: 'Idea sin negocio, sin problema concreto.', kain: 'Avisa que un asesor lo contactará. Tarea a Marcos a 2 h.', com: 'Contactarlo en 3 días y decidir qué ofrecerle. Si nadie lo mueve, se cierra solo como «No es perfil ideal».', etiquetas: ['no-califica', 'ia-off'], plazo: '3 días' },
  { caso: 'Le interesa, pero no ahora', kain: 'Se despide sin insistir y lo manda a Nutrición.', com: 'Nada.' },
  { caso: 'Lead caliente', detalle: 'Más de 10 personas, USD 15,000 o más al mes, urgencia, comparando proveedores.', kain: 'Tarea a Marcos a 1 h. Sigue el flujo.', com: 'Revisar en la hora y apoyar el cierre de la cita.', etiquetas: ['hot-lead'], plazo: '1 h' },
  { caso: 'Evaluador', kain: 'Califica; propone sumar a quien decide.', com: 'Asegurar que quien decide entre a la sesión.' },
  { caso: 'Pide baja', kain: 'Cierra como perdido.', com: 'No volver a escribirle.', etiquetas: ['no-contactar'] },
];

export const BOTONES: { botones: string[]; pasa: string; etiquetas?: string[] }[] = [
  { botones: ['Quiero agendar', 'Sí, me interesa', 'Sí, veámoslo', 'Quiero platicarlo', 'Sigue siendo clave'], pasa: 'Pasa a «Calificado · Agenda propuesta».' },
  { botones: ['Ahora no'], pasa: 'Pasa a «Follow-up · Sin respuesta».' },
  { botones: ['Escríbeme en un mes', 'Para después'], pasa: 'Pasa a «Reactivación (7–30 días)».' },
  { botones: ['Que me llamen', 'Prefiero una llamada', 'Mejor una llamada'], pasa: 'Dispara el aviso de llamada para el comercial.' },
  { botones: ['Ya lo resolví'], pasa: 'Se cierra como perdido, motivo «14. Otro (ya lo resolvió)».', etiquetas: ['motivo-14-otro'] },
  { botones: ['No me interesa', 'Ya no me interesa', 'STOP', 'BAJA'], pasa: 'Se cierra como perdido, motivo «12. No quiere seguir recibiendo información». No se le vuelve a escribir.', etiquetas: ['no-contactar', 'motivo-12-no-quiere-info'] },
];

export const PIPELINES: Pipeline[] = [
  {
    id: 'calificacion', nombre: 'CALIFICACIÓN',
    objetivo: 'Convertir un lead nuevo en una Discovery Session agendada.',
    corte: '62 leads (44 en los últimos 30 días) · 23 en conversación · 5 agendados · 27 perdidos',
    etapas: [
      {
        nombre: 'Nuevo lead', lidera: 'sis',
        auto: ['El bot de apertura corre en cuanto el lead se crea o entra a la etapa.', 'Asigna el lead a Marcos y fija el tipo de sesión en «Discovery Session».', 'Según el origen: formulario web → plantilla de apertura web; formulario de Meta → plantilla de apertura de Meta; WhatsApp directo → «En conversación» y Kain responde.', 'Suma 1 al contador de plantillas y deja la nota «Plantilla enviada: …» en el lead.'],
        equipo: [{ rol: 'com', texto: 'Nada; solo revisar que ningún lead se quede aquí.' }],
        tiempos: [{ t: 'Inmediato', q: 'Bot de apertura según el origen', rol: 'sis' }],
        bots: ['INGK_01'], plantillas: ['ingk_apertura_web_v3', 'ingk_apertura_meta_form_v2'],
        sale: ['Plantilla enviada', 'En conversación'],
      },
      {
        nombre: 'Plantilla enviada', lidera: 'sis', relevo: true,
        auto: ['Espera la respuesta del cliente.', 'A las 2 h sin respuesta sale el correo «INGK · Apertura web sin respuesta por WhatsApp» (disparador de la etapa).', 'A las 24 h sale la plantilla de retomar.', 'A las 72 h el lead pasa a «Follow-up · Sin respuesta».'],
        equipo: [{ rol: 'com', texto: 'Llamar cuando llega la tarea: puede ser un número sin WhatsApp.' }],
        tiempos: [{ t: '2 h', q: 'Correo «recibimos tu solicitud»', rol: 'sis' }, { t: '2 h hábiles', q: 'Tarea de llamada a Marcos', rol: 'com' }, { t: '24 h', q: 'Plantilla de retomar', rol: 'sis' }, { t: '72 h', q: 'Pasa a Follow-up', rol: 'sis' }],
        bots: ['INGK_25'], plantillas: ['ingk_fu_retomar'],
        sale: ['En conversación'],
      },
      {
        nombre: 'En conversación', lidera: 'kain',
        auto: ['Kain sigue su flujo de 10 pasos, un paso por mensaje.', 'Si el cliente calla, manda hasta 3 seguimientos propios de texto libre: a 1 h, 6 h y 22 h, con 4 h mínimo entre ellos.', 'A las 24 h sin respuesta sale la plantilla de retomar; a las 72 h pasa a Follow-up.'],
        equipo: [{ rol: 'com', texto: 'Leer, no escribir. Entrar solo con las señales de relevo.' }],
        tiempos: [{ t: '1 h · 6 h · 22 h', q: 'Seguimientos de texto libre de Kain', rol: 'kain' }, { t: '24 h', q: 'Plantilla de retomar', rol: 'sis' }, { t: '72 h', q: 'Pasa a Follow-up', rol: 'sis' }],
        bots: ['INGK_25'], plantillas: ['ingk_fu_retomar'], etiquetas: ['hot-lead', 'no-califica', 'ia-off'],
        sale: ['Calificado', 'Follow-up', 'Perdido', 'Nutrición'],
      },
      {
        nombre: 'Calificado · Agenda propuesta', lidera: 'kain', relevo: true,
        auto: ['Kain ofrece 2 o 3 horarios consultando el calendario.', 'A las 24 h sin respuesta sale la plantilla con el enlace de agenda.', 'A las 72 h pasa a Follow-up.'],
        equipo: [{ rol: 'com', texto: 'Si es un lead caliente, llamar para cerrar la cita.' }],
        tiempos: [{ t: '24 h', q: 'Plantilla con el enlace de agenda', rol: 'sis' }, { t: '72 h', q: 'Pasa a Follow-up', rol: 'sis' }],
        bots: ['INGK_26'], plantillas: ['ingk_fu_agenda_link'],
        sale: ['Agendado', 'Follow-up'],
      },
      {
        nombre: 'Follow-up · Sin respuesta', lidera: 'sis', relevo: true,
        auto: ['Secuencia de plantillas del bot de la etapa: prioridad, dato, permiso.', 'Al entrar: plantilla de prioridad.', '+48 h: plantilla de dato.', '+4 días: plantilla de permiso y etiqueta de permiso enviado.', 'Una hora después, si sigue sin responder, pasa a «Reactivación (7–30 días)».', 'Cualquier respuesta del cliente detiene la secuencia.'],
        equipo: [{ rol: 'com', texto: 'Llamar una vez si el lead era caliente.' }],
        tiempos: [{ t: 'Al entrar', q: 'Plantilla de prioridad', rol: 'sis' }, { t: '+48 h', q: 'Plantilla de dato', rol: 'sis' }, { t: '+4 días', q: 'Plantilla de permiso', rol: 'sis' }],
        bots: ['INGK_05'], plantillas: ['ingk_fu_prioridad', 'ingk_fu_dato', 'ingk_fu_permiso'], etiquetas: ['permiso-enviado'],
        sale: ['Reactivación', 'En conversación'],
      },
      {
        nombre: 'Reactivación (7–30 días)', lidera: 'sis', estado: 'POR CONFIRMAR',
        auto: ['Sigue el mismo bot de Follow-up.', 'Día 7: plantilla con la guía «Las 7 Fugas».', 'Día 21: plantilla de caso.', 'Día 30: se cierra solo como perdido, motivo «4. No responde (Lead frío)».'],
        equipo: [{ rol: 'com', texto: 'Nada.' }],
        tiempos: [{ t: 'Día 7', q: 'Guía «Las 7 Fugas»', rol: 'sis' }, { t: 'Día 21', q: 'Plantilla de caso', rol: 'sis' }, { t: 'Día 30', q: 'Cierre como perdido', rol: 'sis' }],
        bots: ['INGK_05'], plantillas: ['ingk_react_leadmagnet', 'ingk_react_caso'], etiquetas: ['reactivación', 'motivo-4-no-responde'],
        sale: ['En conversación', 'Perdido'],
        nota: 'Intervalos leídos del bot el día del corte (7, 21 y 30 días). El brief los marca por confirmar.',
      },
      {
        nombre: 'Presupuesto directo', lidera: 'com', relevo: true,
        auto: ['Para quien pide presupuesto desde el inicio o por llamada.', 'Con la etiqueta de presupuesto directo, el lead pasa a PRESUPUESTOS sin Discovery Session y queda la nota en el lead.'],
        equipo: [{ rol: 'com', texto: 'Mover aquí al lead; se crea en Presupuestos.' }],
        bots: ['INGK_07'], etiquetas: ['presupuesto-directo'],
        sale: ['Presupuestos'],
      },
      {
        nombre: 'Agendado', lidera: 'sis',
        auto: ['Etapa ganada. Se crea el lead en DISCOVERY SESSION con todos sus datos.'],
        equipo: [{ rol: 'com', texto: 'Nada.' }],
        tiempos: [{ t: '~5 min', q: 'Se crea el lead en Discovery Session', rol: 'sis' }],
        bots: ['INGK_07'],
        sale: ['Discovery Session'],
      },
      {
        nombre: 'Perdido', lidera: 'com',
        auto: ['Siempre con motivo. Los cierres automáticos dejan su motivo en una nota y una etiqueta.'],
        equipo: [{ rol: 'com', texto: 'Registrar el motivo si lo cerró a mano.' }],
        etiquetas: ['motivo-4-no-responde', 'motivo-12-no-quiere-info', 'motivo-14-otro'],
        sale: ['Nutrición si era «no ahora»'],
      },
    ],
  },
  {
    id: 'discovery', nombre: 'DISCOVERY SESSION',
    objetivo: 'Que la sesión ocurra y termine en un presupuesto.',
    corte: '12 leads, todos de los últimos 30 días · 8 ganados',
    dato: 'La sesión: 30 minutos, sin costo, la da Rik por Meet.',
    etapas: [
      {
        nombre: 'Discovery Agendada', lidera: 'kain',
        auto: ['Confirmación de la cita.', 'Si agendó Kain, la confirma él en el chat; si fue por el sitio o por llamada, sale la plantilla de confirmación.'],
        equipo: [{ rol: 'rik', texto: 'Revisar el resumen que dejó Kain.' }],
        tiempos: [{ t: 'Al agendar', q: 'Confirmación de la cita', rol: 'kain' }],
        bots: ['INGK_10'], plantillas: ['ingk_sesion_confirmacion_v2'],
        sale: ['Confirmada'],
      },
      {
        nombre: 'Confirmada', lidera: 'sis',
        auto: ['Recordatorio por plantilla un día antes.'],
        equipo: [],
        tiempos: [{ t: '24 h antes', q: 'Recordatorio', rol: 'sis' }],
        bots: ['INGK_11'], plantillas: ['ingk_sesion_24h_v2'],
        sale: ['Día de la sesión'],
      },
      {
        nombre: 'Día de la sesión · Recordatorios', lidera: 'rik', relevo: true,
        auto: ['Recordatorios por plantilla el mismo día.'],
        equipo: [{ rol: 'rik', texto: 'Dar la sesión.' }],
        tiempos: [{ t: '8:00', q: 'Recordatorio del día', rol: 'sis' }, { t: '1 h antes', q: 'Recordatorio', rol: 'sis' }, { t: '15 min antes', q: 'Recordatorio', rol: 'sis' }],
        bots: ['INGK_12', 'INGK_13', 'INGK_14'], plantillas: ['ingk_sesion_hoy_v2', 'ingk_sesion_1h', 'ingk_sesion_15min'],
        sale: ['Sesión realizada', 'No show'],
      },
      {
        nombre: 'Sesión realizada', lidera: 'rik', relevo: true,
        auto: ['Sin automatización: la decisión es de Rik.'],
        equipo: [{ rol: 'rik', texto: 'Decidir el mismo día: presupuesto, «no ahora» o perdido.' }],
        sale: ['Preparar Presupuesto', 'Nutrición', 'Perdido'],
      },
      {
        nombre: 'No show', lidera: 'kain',
        auto: ['Mensaje al entrar.', 'Si no responde: 3 seguimientos y despedida.', 'Con el botón «Reagendar» pasa a «Por reagendar».'],
        equipo: [{ rol: 'com', texto: 'Mover a No show si el cliente no llegó.' }],
        tiempos: [{ t: 'Al entrar', q: 'Mensaje de no show', rol: 'sis' }, { t: '1 · 3 · 5 días', q: 'Seguimientos para reagendar', rol: 'sis' }, { t: '7 días', q: 'Despedida y cierre', rol: 'sis' }],
        bots: ['INGK_15', 'INGK_16', 'INGK_17', 'INGK_18', 'INGK_19'], plantillas: ['ingk_cita_noshow', 'ingk_reagendar_1', 'ingk_reagendar_2', 'ingk_reagendar_3', 'ingk_reagendar_despedida'],
        sale: ['Por reagendar', 'Perdido'],
      },
      {
        nombre: 'Por reagendar', lidera: 'kain',
        auto: ['Kain propone horarios y reagenda solo.', 'La cita vuelve a recibir sus recordatorios.', 'Si no responde: 2 seguimientos y despedida.'],
        equipo: [{ rol: 'com', texto: 'Nada, salvo que el cliente pida hablar con alguien.' }],
        tiempos: [{ t: '1 · 3 días', q: 'Seguimientos', rol: 'sis' }, { t: '5 días', q: 'Despedida', rol: 'sis' }],
        sale: ['Discovery Agendada', 'Perdido'],
      },
      {
        nombre: 'Preparar Presupuesto', lidera: 'rik', relevo: true,
        auto: ['Se gana solo y crea el lead en PRESUPUESTOS · Preparando.'],
        equipo: [{ rol: 'rik', texto: 'Mover aquí al lead al terminar la sesión.' }],
        tiempos: [{ t: '5 min', q: 'Se crea el lead en Presupuestos', rol: 'sis' }],
        sale: ['Presupuestos'],
      },
    ],
  },
  {
    id: 'presupuestos', nombre: 'PRESUPUESTOS',
    objetivo: 'Presentar el presupuesto y cerrar.',
    corte: '15 leads · 5 en preparación · 2 realizados · 7 enviados o presentados · 1 ganado',
    dato: 'Game Plan: la reunión de 30 minutos donde se presenta el presupuesto. Tiene su propio calendario.',
    etapas: [
      {
        nombre: 'Preparando', lidera: 'rik', relevo: true,
        auto: ['Tarea a Rik para preparar el presupuesto.', 'Si se pasa del plazo, el lead recibe la etiqueta de presupuesto vencido.'],
        equipo: [{ rol: 'rik', texto: 'Armar la propuesta, capturar monto y enlace.' }],
        tiempos: [{ t: '24 h', q: 'Plazo para preparar el presupuesto', rol: 'rik' }],
        etiquetas: ['presupuesto-vencido'],
        sale: ['Presupuesto realizado'],
      },
      {
        nombre: 'Presupuesto realizado', lidera: 'kain', relevo: true,
        auto: ['Sale la plantilla «tu presupuesto está listo»: ofrece presentarlo en vivo o enviarlo.', 'Kain agenda el Game Plan o manda el enlace de la propuesta.', 'Si no responde: seguimiento 1 y seguimiento 2.'],
        equipo: [{ rol: 'com', texto: 'Llamar cuando llegue la tarea (Marcos).' }],
        tiempos: [{ t: 'Al entrar', q: 'Aviso «tu presupuesto está listo»', rol: 'sis' }, { t: '48 h', q: 'Seguimiento 1', rol: 'sis' }, { t: '4 días', q: 'Seguimiento 2', rol: 'sis' }, { t: '+48 h', q: 'Tarea de llamada a Marcos', rol: 'com' }],
        bots: ['INGK_20', 'INGK_21', 'INGK_22', 'INGK_24'], plantillas: ['ingk_presupuesto_listo_v2', 'ingk_presupuesto_seguimiento_1_v2', 'ingk_presupuesto_seguimiento_2_v2', 'ingk_presupuesto_actualizado'],
        sale: ['Game Plan agendado', 'Enviado/Presentado'],
      },
      {
        nombre: 'Game Plan agendado → confirmado → Día del Game Plan', lidera: 'rik', relevo: true,
        auto: ['Recordatorios iguales a los de la Discovery: las mismas plantillas dicen el nombre de la sesión que toca.'],
        equipo: [{ rol: 'rik', texto: 'Presentar el presupuesto.' }],
        tiempos: [{ t: '24 h antes', q: 'Recordatorio', rol: 'sis' }, { t: '8:00', q: 'Recordatorio del día', rol: 'sis' }, { t: '1 h antes', q: 'Recordatorio', rol: 'sis' }, { t: '15 min antes', q: 'Recordatorio', rol: 'sis' }],
        bots: ['INGK_10', 'INGK_11', 'INGK_12', 'INGK_13', 'INGK_14'], plantillas: ['ingk_sesion_confirmacion_v2', 'ingk_sesion_24h_v2', 'ingk_sesion_hoy_v2', 'ingk_sesion_1h', 'ingk_sesion_15min'],
        sale: ['Enviado/Presentado', 'No show'],
      },
      {
        nombre: 'No show / Por reagendar', lidera: 'com', relevo: true,
        auto: ['Seguimientos igual que en Discovery.', 'Aquí el lead no se cierra solo.'],
        equipo: [{ rol: 'com', texto: 'Llamar cuando llegue la tarea (Marcos).' }],
        tiempos: [{ t: '1 · 3 · 5 días', q: 'Seguimientos para reagendar', rol: 'sis' }],
        sale: ['Game Plan agendado'],
      },
      {
        nombre: 'Enviado/Presentado', lidera: 'com', relevo: true,
        auto: ['Seguimiento por plantilla.'],
        equipo: [{ rol: 'com', texto: 'Resolver dudas y cerrar (Marcos).' }],
        tiempos: [{ t: '24 h', q: 'Seguimiento por plantilla', rol: 'sis' }, { t: '+48 h', q: 'Tarea de llamada a Marcos', rol: 'com' }],
        bots: ['INGK_23'], plantillas: ['ingk_presupuesto_enviado_v2'],
        sale: ['Ganado', 'Perdido'],
      },
      {
        nombre: 'Presupuesto-Ganado', lidera: 'com', relevo: true,
        auto: ['Sin automatización.'],
        equipo: [{ rol: 'com', texto: 'Pasar a Clientes y avisar a Barbara.' }],
        sale: ['Clientes'],
      },
      {
        nombre: 'Presupuesto Perdido', lidera: 'com',
        auto: ['Sin automatización.'],
        equipo: [{ rol: 'com', texto: 'Registrar el motivo; si era «no ahora», mandarlo a Nutrición.' }],
        sale: ['Nutrición'],
      },
    ],
    reglas: [
      'Para entrar a «Presupuesto realizado» son obligatorios el monto y el enlace de la propuesta.',
      'Kain no da montos ni detalles: remite a la propuesta o al Game Plan.',
      'Si el cliente pide un ajuste y el lead vuelve a «Presupuesto realizado», sale la plantilla de presupuesto actualizado y los seguimientos cuentan de nuevo.',
      'Mientras el cliente conversa con Kain, no salen plantillas.',
    ],
  },
];

export const POWER = {
  objetivo: 'La sesión de pago como entrada directa. 60 minutos 1 a 1 con Rik, USD 297.',
  corte: 'Sin leads todavía.',
  etapas: [
    { nombre: 'Power Session por pagar', pasa: 'El sitio crea el lead al reservar.', estado: 'ACTIVO' as Estado },
    { nombre: 'Power Session pagada', pasa: 'El pago se confirma por Stripe.', estado: 'ACTIVO' as Estado },
    { nombre: 'Confirmada · Día de la sesión', pasa: 'Mismos recordatorios que la Discovery.', estado: 'ACTIVO' as Estado },
    { nombre: 'Sesión realizada · No show · Por reagendar', pasa: 'Misma lógica que la Discovery.', estado: 'ACTIVO' as Estado },
    { nombre: 'Propuesta enviada', pasa: 'Seguimiento de la propuesta.', estado: 'POR DEFINIR' as Estado },
  ],
};

export const NUTRICION = {
  para: 'Para quien dijo «sí me interesa, pero no ahora». Entra cuando Kain lo detecta, desde una Discovery, por un presupuesto perdido o a mano.',
  etapas: [
    { nombre: '01 · Resumen enviado', recibe: 'Correo con el resumen de lo platicado, listo para reenviar a su socio.', cuando: 'Día 0', rol: 'sis' as Rol },
    { nombre: '02 · Fugas enviado', recibe: 'Correo sobre las ventas que se pierden antes del CRM, con la guía «Las 7 Fugas».', cuando: 'Día 4', rol: 'sis' as Rol },
    { nombre: '03 · Un día con Kain enviado', recibe: 'Correo con una línea de tiempo de un día con Kain.', cuando: 'Día 14', rol: 'sis' as Rol },
    { nombre: '05 · Costo de esperar enviado', recibe: 'Correo sobre lo que sigue pasando mientras decide.', cuando: 'Día 40', rol: 'sis' as Rol },
    { nombre: 'En pausa · hasta retomar', recibe: 'Nada.', cuando: 'Hasta la fecha acordada', rol: 'sis' as Rol },
    { nombre: '06 · Retomamos enviado', recibe: 'Correo de retomar.', cuando: 'En la fecha de retomar, o el día 60', rol: 'sis' as Rol },
    { nombre: 'Respondió · atender', recibe: 'El lead contestó: entra el comercial o Kain.', cuando: 'El mismo día', rol: 'com' as Rol },
  ],
  whatsapp: 'Además, por WhatsApp: aviso del resumen en su correo, artículos del blog según su giro y un «¿retomamos?» dos días después del correo 06. Máximo un toque por día, a las 11:00.',
  correo: 'Los correos salen de contacto@ingeniak.mx y los responde Rik.',
  bots: ['INGK_40', 'INGK_41', 'INGK_42'],
  plantillas: ['ingk_nutri_correo', 'ingk_nutri_articulo', 'ingk_nutri_retomamos'],
};

export const CAMPANAS = {
  para: 'Reactivación de los leads antiguos del programa de partner de Kommo.',
  corte: '393 leads · 282 con mensaje enviado · 50 respondieron · 26 interesados · 6 logrados · 29 perdidos',
  embudo: [
    { n: 393, t: 'Leads' }, { n: 282, t: 'Mensaje enviado' }, { n: 50, t: 'Respondieron' }, { n: 26, t: 'Interesados' }, { n: 6, t: 'Logrados' },
  ],
  puntos: [
    'Sale desde el número «Rik Landeros», con un agente que atiende a nombre de Rik.',
    'En «Interesado», si dejan de responder: 3 seguimientos a 1, 4 y 21 horas.',
    'Cuando el lead agenda la Discovery, el seguimiento lo toma Kain.',
  ],
  etapas: ['Por enviar · Prioridad', 'Por enviar · Tanda A', 'Por enviar · Tanda B', 'Por enviar · Tanda C', 'Mensaje enviado', 'Respondió', 'Interesado', 'Nutrición', 'Clientes · No enviar'],
  bots: ['INGK_30', 'INGK_31', 'INGK_32', 'INGK_33'],
  plantillas: ['ingk_reactiva_kommo_1', 'ingk_reactiva_kommo_2', 'ingk_reactiva_kommo_3'],
};

export const POR_DEFINIR_PIPES = {
  texto: 'Las etapas existen, pero no tienen automatización documentada. Falta decidir quién hace qué en cada etapa.',
  outbound: ['1 · En secuencia', '2 · RESPONDIÓ · llamar hoy (4h)', '3 · Contactado por voz', '4 · Discovery agendado → mover a P1', '5 · Nutrir 60 días', '6 · Sin respuesta · re-secuenciar 90d'],
  clientes: ['Arranque', 'Implementación (7–30 días)', 'En operación', 'Licencia por vencer', 'Renovación', 'En riesgo'],
};

export const SENALES: { senal: string; hacer: string; plazo: string; tipo: 'tarea' | 'etiqueta' | 'etapa' | 'cliente' }[] = [
  { senal: 'Tarea «Revisar lead nuevo»', hacer: 'Leer la conversación; no escribir si Kain avanza.', plazo: '2 h', tipo: 'tarea' },
  { senal: 'Tarea por lead del formulario sin respuesta', hacer: 'Llamar: el número puede no tener WhatsApp.', plazo: 'El mismo día', tipo: 'tarea' },
  { senal: 'Etiqueta hot-lead', hacer: 'Revisar y apoyar el cierre de la cita.', plazo: '1 h', tipo: 'etiqueta' },
  { senal: 'Etiqueta no-califica', hacer: 'Contactar y decidir qué ofrecerle.', plazo: '3 días', tipo: 'etiqueta' },
  { senal: 'Tarea «presupuesto sin respuesta»', hacer: 'Llamar para presentar o resolver dudas.', plazo: 'El mismo día', tipo: 'tarea' },
  { senal: 'Tarea por no show del Game Plan', hacer: 'Llamar para reagendar.', plazo: 'El mismo día', tipo: 'tarea' },
  { senal: '«Respondió · atender» en Nutrición', hacer: 'Retomar la conversación.', plazo: 'El mismo día', tipo: 'etapa' },
  { senal: 'El cliente pide hablar con una persona', hacer: 'Tomar la conversación.', plazo: 'Inmediato', tipo: 'cliente' },
];
export const RELEVO = {
  dejar: 'Deja trabajar a Kain cuando el lead está conversando, calificando, eligiendo horario o reagendando. Escribirle al cliente a la vez que Kain confunde y rompe la demostración.',
  tomar: ['Activa «Pausar IA» en el lead (o la etiqueta ia-off). Kain deja de responder.', 'Escribe o llama.', 'Al terminar, desactívalo para que Kain retome.'],
  instruccion: 'Deja una nota en el lead que incluya @kain y la instrucción (por ejemplo, el sitio del cliente y dos competidores para una auditoría más completa). Funciona dentro de las 24 horas posteriores al último mensaje del cliente.',
};

export const RELOJ: { grupo: string; hitos: Tiempo[] }[] = [
  { grupo: 'Lead nuevo', hitos: [
    { t: '0 min', q: 'Apertura (formulario) o respuesta de Kain (WhatsApp)', rol: 'kain' },
    { t: '1 h', q: 'Seguimiento de texto libre de Kain', rol: 'kain' },
    { t: '2 h', q: 'Correo de apertura + tarea de llamada a Marcos', rol: 'com' },
    { t: '6 h', q: 'Seguimiento de texto libre de Kain', rol: 'kain' },
    { t: '22 h', q: 'Seguimiento de texto libre de Kain', rol: 'kain' },
    { t: '24 h', q: 'Plantilla de retomar o de agenda', rol: 'sis' },
    { t: '72 h', q: 'Pasa a «Follow-up · Sin respuesta»', rol: 'sis' },
  ] },
  { grupo: 'Follow-up y reactivación', hitos: [
    { t: 'Al entrar', q: 'Plantilla de prioridad', rol: 'sis' },
    { t: '+48 h', q: 'Plantilla de dato', rol: 'sis' },
    { t: '+4 días', q: 'Plantilla de permiso', rol: 'sis' },
    { t: 'Día 7 · 21', q: 'Guía «Las 7 Fugas» y caso', rol: 'sis' },
    { t: '3 días', q: 'Etiqueta no-califica: cierre como perdido si nadie lo movió', rol: 'com' },
  ] },
  { grupo: 'Discovery y Game Plan', hitos: [
    { t: '24 h antes', q: 'Recordatorio de la sesión', rol: 'sis' },
    { t: '8:00', q: 'Recordatorio del día', rol: 'sis' },
    { t: '1 h antes', q: 'Recordatorio', rol: 'sis' },
    { t: '15 min antes', q: 'Recordatorio', rol: 'sis' },
    { t: '1 · 3 · 5 días', q: 'No show: seguimientos', rol: 'sis' },
    { t: '7 días', q: 'No show: despedida y cierre', rol: 'sis' },
  ] },
  { grupo: 'Presupuesto', hitos: [
    { t: '24 h', q: 'Preparando: vence la tarea del presupuesto', rol: 'rik' },
    { t: 'Al entrar', q: 'Aviso «tu presupuesto está listo»', rol: 'sis' },
    { t: '48 h', q: 'Seguimiento 1', rol: 'sis' },
    { t: '4 días', q: 'Seguimiento 2', rol: 'sis' },
    { t: '+48 h', q: 'Tarea de llamada a Marcos', rol: 'com' },
    { t: '24 h', q: 'Enviado/Presentado: seguimiento', rol: 'sis' },
    { t: '+48 h', q: 'Enviado/Presentado: tarea de llamada', rol: 'com' },
  ] },
  { grupo: 'Nutrición', hitos: [
    { t: 'Día 0', q: 'Correo con el resumen', rol: 'sis' },
    { t: 'Día 4', q: 'Correo «Las 7 Fugas»', rol: 'sis' },
    { t: 'Día 14', q: 'Correo «Un día con Kain»', rol: 'sis' },
    { t: 'Día 40', q: 'Correo «Costo de esperar»', rol: 'sis' },
    { t: 'Día 60', q: 'Correo de retomar', rol: 'sis' },
  ] },
];

export const MEDICION = {
  principales: [
    { pipeline: 'Calificación', indicador: 'Leads → Discovery', calculo: 'Leads en «Agendado» ÷ leads creados' },
    { pipeline: 'Discovery Session', indicador: 'Discovery → Presupuesto', calculo: 'Leads ganados ÷ sesiones agendadas' },
    { pipeline: 'Presupuestos', indicador: 'Presupuesto → Cierre', calculo: '«Presupuesto-Ganado» ÷ presupuestos realizados, y monto cerrado' },
  ],
  nota: 'Las tres conversiones principales están en el tablero de conversión, que se abre cuando se necesite.',
  apoyo: [
    { pipeline: 'Calificación', indicador: '% que responde a la apertura', sirve: 'Calidad del primer mensaje y de los números' },
    { pipeline: 'Calificación', indicador: '% de calificados sobre conversaciones', sirve: 'Calidad del tráfico por anuncio o nicho' },
    { pipeline: 'Calificación', indicador: 'Motivos de pérdida', sirve: 'Hoy 14 de 27 perdidos no tienen motivo' },
    { pipeline: 'Calificación', indicador: 'Tareas vencidas del comercial', sirve: 'Disciplina de seguimiento' },
    { pipeline: 'Discovery', indicador: 'Tasa de asistencia', sirve: 'Sesiones realizadas ÷ agendadas' },
    { pipeline: 'Discovery', indicador: '% de no show recuperado', sirve: 'Efecto de la reagenda de Kain' },
    { pipeline: 'Presupuestos', indicador: 'Horas hasta «Presupuesto realizado»', sirve: 'Meta: menos de 24' },
    { pipeline: 'Presupuestos', indicador: '% presentado en Game Plan frente a enviado', sirve: 'Presentar en vivo debería cerrar más' },
    { pipeline: 'Nutrición', indicador: '% que responde', sirve: 'Valor de la secuencia' },
    { pipeline: 'Campañas', indicador: 'Respondió → Interesado → Discovery', sirve: 'Rendimiento de la reactivación' },
  ],
  eventos: 'En Google Analytics el sitio registra tres eventos conectados a Kommo: lead calificado, lead en negociación (Discovery ganada) y venta cerrada con su monto. En Meta, la agenda de una sesión se registra como «Programar».',
};

export const MATERIAL: { momento: string; usar: string; estado: Estado }[] = [
  { momento: 'Primer contacto', usar: 'Auditoría exprés de Kain sobre el sitio del prospecto', estado: 'ACTIVO' },
  { momento: 'Lead de anuncio por nicho', usar: 'Ficha de dolores del nicho que usa Kain', estado: 'ACTIVO' },
  { momento: 'Sin respuesta', usar: 'Plantillas de retomar, dato, permiso y la guía «Las 7 Fugas»', estado: 'ACTIVO' },
  { momento: 'Antes de la Discovery', usar: 'Resumen del lead que deja Kain y sugerencias para la sesión', estado: 'ACTIVO' },
  { momento: 'Discovery Session', usar: 'Presentación guía de la sesión', estado: 'POR DEFINIR' },
  { momento: 'Game Plan', usar: 'Propuesta en línea con su enlace', estado: 'ACTIVO' },
  { momento: 'Después del presupuesto', usar: 'Plantillas de seguimiento y de presupuesto actualizado', estado: 'ACTIVO' },
  { momento: '«No ahora»', usar: 'Secuencia de 5 correos y artículos del blog por WhatsApp', estado: 'ACTIVO' },
  { momento: 'Cierre', usar: 'Casos de éxito documentados (no hay casos documentados)', estado: 'POR DEFINIR' },
  { momento: 'Llamada del comercial', usar: 'Guion de llamada por tipo de tarea', estado: 'RECOMENDADO' },
];

export const RUTINA: { momento: string; puntos: string[] }[] = [
  { momento: 'Al empezar el día', puntos: ['Revisar las tareas de hoy y las vencidas, pipeline por pipeline.', 'Leer las conversaciones de la noche en «En conversación» sin escribir.', 'Atender primero las etiquetas hot-lead.'] },
  { momento: 'Durante el día', puntos: ['Hacer las llamadas de las tareas en el plazo de cada una.', 'Contactar a los no-califica antes de sus 3 días.', 'Cada vez que cierres algo a mano, registrar el motivo de pérdida.'] },
  { momento: 'Al cerrar', puntos: ['Que ninguna tarea quede sin resultado.', 'Que ningún lead quede en «Nuevo lead».', 'Desactivar «Pausar IA» en los leads donde ya terminaste.'] },
];

export const PENDIENTES: { tema: string; estado: string; tipo: Estado }[] = [
  { tema: 'Kain responde dos veces cuando el cliente manda dos mensajes seguidos', estado: 'Detectado, sin resolver', tipo: 'DETECTADO' },
  { tema: 'Cruce entre Kain y el comercial en la misma conversación', estado: 'Se resuelve con la regla de «Pausar IA»; falta adoptarla', tipo: 'EN OBSERVACIÓN' },
  { tema: 'Qué hacer con quien apenas va a empezar su negocio (descalificar o nutrir)', estado: 'Por definir', tipo: 'POR DEFINIR' },
  { tema: 'Intervalos exactos de la etapa «Reactivación (7–30 días)»', estado: 'Por confirmar (en el bot hoy: días 7, 21 y 30)', tipo: 'POR CONFIRMAR' },
  { tema: 'Automatización de Outbound B2B y de Clientes', estado: 'Por definir', tipo: 'POR DEFINIR' },
  { tema: 'Presentación guía de la Discovery y casos de éxito', estado: 'Por definir', tipo: 'POR DEFINIR' },
  { tema: 'El enlace del formulario en el campo «Web» de la empresa', estado: 'En revisión', tipo: 'EN REVISIÓN' },
  { tema: 'Varias reglas de seguimiento se activaron el 23 y 24 de noviembre y aún no tienen historial con leads reales', estado: 'En observación', tipo: 'EN OBSERVACIÓN' },
];

// ---------- Bots (leídos del CRM el día del corte) ----------
export interface Bot { id: string; nombre: string; activo: boolean; hace: string; plantillas: string[]; donde: string }
export const BOTS: Bot[] = [
  { id: 'INGK_01', nombre: 'Apertura', activo: true, donde: 'Calificación · Nuevo lead (disparador de la etapa)', hace: 'Asigna el lead, fija el tipo de sesión y, según el origen, manda la plantilla de apertura y pasa a «Plantilla enviada», o pasa a «En conversación».', plantillas: ['ingk_apertura_web_v3', 'ingk_apertura_meta_form_v2'] },
  { id: 'INGK_05', nombre: 'Sin respuesta y Reactivacion', activo: true, donde: 'Calificación · Follow-up (disparador de la etapa)', hace: 'Prioridad al entrar, dato a las 48 h, permiso a los 4 días; pasa a Reactivación; guía el día 7, caso el día 21 y cierre como perdido el día 30.', plantillas: ['ingk_fu_prioridad', 'ingk_fu_dato', 'ingk_fu_permiso', 'ingk_react_leadmagnet', 'ingk_react_caso'] },
  { id: 'INGK_06', nombre: 'Botones y bajas', activo: true, donde: 'Calificación · todas las etapas abiertas, 5 min después de un mensaje', hace: 'Lee el botón que tocó el cliente y mueve el lead: agenda, «ahora no», «para después», llamada, «ya lo resolví» o baja.', plantillas: [] },
  { id: 'INGK_07', nombre: 'Ganado crea Discovery', activo: true, donde: 'Calificación · Agendado (disparador de la etapa)', hace: 'Crea el lead en Discovery Session. Con la etiqueta presupuesto-directo, lo pasa a Presupuestos sin Discovery.', plantillas: [] },
  { id: 'INGK_25', nombre: 'Calificacion 24h Retomar', activo: true, donde: 'Calificación · 24 h sin respuesta', hace: 'Manda la plantilla de retomar.', plantillas: ['ingk_fu_retomar'] },
  { id: 'INGK_26', nombre: 'Calificacion 24h Agenda', activo: true, donde: 'Calificación · Calificado, 24 h sin respuesta', hace: 'Manda la plantilla con el enlace de agenda.', plantillas: ['ingk_fu_agenda_link'] },
  { id: 'INGK_04', nombre: 'Atasco Calificado', activo: true, donde: 'Calificación · Calificado (sin disparador en el pipeline)', hace: 'Secuencia de agenda: enlace a las 24 h, horario 24 h después y paso a Follow-up a las 48 h.', plantillas: ['ingk_fu_agenda_link', 'ingk_fu_agenda_horario_v2'] },
  { id: 'INGK_10', nombre: 'Sesion Confirmacion', activo: true, donde: 'Discovery · Game Plan · al agendar', hace: 'Manda la confirmación de la cita.', plantillas: ['ingk_sesion_confirmacion_v2'] },
  { id: 'INGK_11', nombre: 'Sesion 24h', activo: true, donde: 'Discovery · Game Plan · 24 h antes', hace: 'Recordatorio del día anterior.', plantillas: ['ingk_sesion_24h_v2'] },
  { id: 'INGK_12', nombre: 'Sesion Hoy', activo: true, donde: 'Discovery · Game Plan · 8:00 del día', hace: 'Recordatorio de la mañana.', plantillas: ['ingk_sesion_hoy_v2'] },
  { id: 'INGK_13', nombre: 'Sesion 1h', activo: true, donde: 'Discovery · Game Plan · 1 h antes', hace: 'Recordatorio de una hora.', plantillas: ['ingk_sesion_1h'] },
  { id: 'INGK_14', nombre: 'Sesion 15min', activo: true, donde: 'Discovery · Game Plan · 15 min antes', hace: 'Último recordatorio con el enlace.', plantillas: ['ingk_sesion_15min'] },
  { id: 'INGK_15', nombre: 'Sesion No show', activo: true, donde: 'No show · al entrar', hace: 'Mensaje de no show con la opción de reagendar.', plantillas: ['ingk_cita_noshow'] },
  { id: 'INGK_16', nombre: 'Reagendar 1', activo: true, donde: 'No show · Por reagendar', hace: 'Primer seguimiento para reagendar.', plantillas: ['ingk_reagendar_1'] },
  { id: 'INGK_17', nombre: 'Reagendar 2', activo: true, donde: 'No show · Por reagendar', hace: 'Segundo seguimiento.', plantillas: ['ingk_reagendar_2'] },
  { id: 'INGK_18', nombre: 'Reagendar 3', activo: true, donde: 'No show', hace: 'Último recordatorio.', plantillas: ['ingk_reagendar_3'] },
  { id: 'INGK_19', nombre: 'Reagendar Despedida', activo: true, donde: 'No show · Por reagendar · cierre', hace: 'Despedida y cierre de la solicitud.', plantillas: ['ingk_reagendar_despedida'] },
  { id: 'INGK_20', nombre: 'Presupuesto Listo', activo: true, donde: 'Presupuestos · Presupuesto realizado, al entrar', hace: 'Aviso de que el presupuesto está listo.', plantillas: ['ingk_presupuesto_listo_v2'] },
  { id: 'INGK_21', nombre: 'Presupuesto Seguimiento 1', activo: true, donde: 'Presupuestos · 48 h', hace: 'Primer seguimiento.', plantillas: ['ingk_presupuesto_seguimiento_1_v2'] },
  { id: 'INGK_22', nombre: 'Presupuesto Seguimiento 2', activo: true, donde: 'Presupuestos · 4 días', hace: 'Segundo y último seguimiento.', plantillas: ['ingk_presupuesto_seguimiento_2_v2'] },
  { id: 'INGK_23', nombre: 'Presupuesto Enviado', activo: true, donde: 'Presupuestos · Enviado/Presentado, 24 h', hace: 'Pregunta cómo vio la propuesta.', plantillas: ['ingk_presupuesto_enviado_v2'] },
  { id: 'INGK_24', nombre: 'Presupuesto Actualizado', activo: true, donde: 'Presupuestos · vuelve a Presupuesto realizado', hace: 'Avisa que el ajuste pedido ya está listo.', plantillas: ['ingk_presupuesto_actualizado'] },
  { id: 'INGK_30', nombre: 'Reactivacion 1', activo: true, donde: 'Campañas', hace: 'Primer mensaje de la reactivación.', plantillas: ['ingk_reactiva_kommo_1'] },
  { id: 'INGK_31', nombre: 'Reactivacion 2', activo: true, donde: 'Campañas', hace: 'Segundo mensaje.', plantillas: ['ingk_reactiva_kommo_2'] },
  { id: 'INGK_32', nombre: 'Reactivacion 3', activo: true, donde: 'Campañas', hace: 'Último mensaje.', plantillas: ['ingk_reactiva_kommo_3'] },
  { id: 'INGK_33', nombre: 'Bot_AI canal Rik', activo: true, donde: 'Campañas · número «Rik Landeros»', hace: 'Conecta al agente que atiende a nombre de Rik.', plantillas: [] },
  { id: 'INGK_40', nombre: 'Nutricion Correo', activo: true, donde: 'Nutrición', hace: 'Avisa por WhatsApp que el resumen está en su correo.', plantillas: ['ingk_nutri_correo'] },
  { id: 'INGK_41', nombre: 'Nutricion Articulo', activo: true, donde: 'Nutrición', hace: 'Comparte un artículo del blog según su giro.', plantillas: ['ingk_nutri_articulo'] },
  { id: 'INGK_42', nombre: 'Nutricion Retomamos', activo: true, donde: 'Nutrición · 2 días después del correo 06', hace: 'Pregunta si retomamos.', plantillas: ['ingk_nutri_retomamos'] },
  { id: 'INGK_02', nombre: 'Arranque Click to WhatsApp', activo: false, donde: 'Apagado', hace: 'Versión anterior del arranque por anuncio; hoy responde Kain.', plantillas: [] },
  { id: 'INGK_03', nombre: 'Atasco En conversacion', activo: false, donde: 'Apagado', hace: 'Versión anterior del seguimiento en conversación.', plantillas: [] },
  { id: 'INGK_99', nombre: 'PRUEBA', activo: false, donde: 'De prueba', hace: 'Bot de pruebas. No usar con leads reales.', plantillas: [] },
];

// ---------- Plantillas de WhatsApp (texto real, leído del CRM) ----------
// Variables: {n} nombre · {r} responsable · {s} tipo de sesión · {f} fecha y hora · {e} enlace de la reunión · {i} servicio de interés
//            {x} frase armada con sus respuestas · {a1} título de la guía · {a2} idea clave · {a3} enlace del artículo
export interface Plantilla { familia: string; cat: 'Marketing' | 'Utilidad'; texto: string[]; botones: string[]; cuando: string }
export const PLANTILLAS: Record<string, Plantilla> = {
  ingk_apertura_web_v3: { familia: 'Apertura', cat: 'Marketing', cuando: 'Lead del formulario del sitio, al instante', texto: ['Hola {n} 👋', 'Soy {r}, de Ingeniak. Recibimos tu solicitud sobre {i} 💻', '{x}', '¿Te comparto por aquí lo que encontré?'], botones: ['Sí, compárteme', 'Prefiero una llamada'] },
  ingk_apertura_meta_form_v2: { familia: 'Apertura', cat: 'Marketing', cuando: 'Lead del formulario de Meta, al instante', texto: ['Hola {n} 👋', 'Soy {r}, de Ingeniak. Dejaste tus datos en nuestro anuncio sobre automatizar tu WhatsApp 📲', '¿Hoy quién atiende los mensajes de tus clientes: tú o alguien de tu equipo?'], botones: ['Yo mismo', 'Mi equipo', 'Ahora no'] },
  ingk_fu_retomar: { familia: 'Seguimiento', cat: 'Marketing', cuando: 'Calificación · 24 h sin respuesta', texto: ['Hola {n} 👋', 'Se nos quedó una pregunta en el aire 💬', '¿Hoy llevan el seguimiento en algún CRM o en WhatsApp y Excel?', 'Con eso ya te puedo decir si lo que buscas se resuelve en una sesión o no.'], botones: ['Te respondo', 'Mejor una llamada', 'Ahora no'] },
  ingk_fu_agenda_link: { familia: 'Seguimiento', cat: 'Marketing', cuando: 'Calificado · 24 h sin elegir horario', texto: ['Hola {n} 👋', 'Te dejo de nuevo el enlace para elegir el horario de tu Discovery Session 🗓️', 'https://ingeniak.mx/agendar/', 'Son 30 minutos y sales con claridad de qué resolver primero ✅'], botones: ['Ya agendé', 'Proponme horario', 'Ahora no'] },
  ingk_fu_agenda_horario_v2: { familia: 'Seguimiento', cat: 'Marketing', cuando: 'Calificado · secuencia de agenda', texto: ['Hola {n} 👋', 'Para que no se te pase tu Discovery Session 🗓️', '¿Qué horario te acomoda mejor? Te propongo opciones disponibles y lo dejamos agendado en un minuto 🙌'], botones: ['Por la mañana', 'Por la tarde', 'Ahora no'] },
  ingk_fu_prioridad: { familia: 'Follow-up', cat: 'Marketing', cuando: 'Follow-up · al entrar', texto: ['Hola {n}, una pregunta directa: ¿ordenar la atención y el seguimiento de tus clientes sigue siendo prioridad para ti, o lo dejamos para después? 🤔'], botones: ['Sigue siendo clave', 'Para después', 'Ya lo resolví'] },
  ingk_fu_dato: { familia: 'Follow-up', cat: 'Marketing', cuando: 'Follow-up · +48 h', texto: ['Hola {n} 👋', 'Un dato que vale la pena ver con tus números 📊', 'La mayoría de los negocios con los que hablamos pierde entre *20 y 30 %* de sus leads solo por responder tarde.', 'Si quieres saber cuánto es en tu caso, lo vemos en 30 minutos, sin costo ✅'], botones: ['Sí, veámoslo', 'Ahora no'] },
  ingk_fu_permiso: { familia: 'Follow-up', cat: 'Marketing', cuando: 'Follow-up · +4 días', texto: ['Hola {n} 👋', 'Último mensaje por ahora 🙌 Si no es el momento, dime y no insisto.', 'Si sí lo es, aquí tienes la agenda de la Discovery Session (30 min, sin costo) 👇', 'https://ingeniak.mx/agendar/'], botones: ['Quiero agendar', 'Escríbeme en un mes', 'No me interesa'] },
  ingk_react_leadmagnet: { familia: 'Reactivación', cat: 'Marketing', cuando: 'Reactivación · día 7', texto: ['Hola {n} 👋', 'Sin compromiso te comparto «Las 7 Fugas» 📘', 'Es una guía corta que armamos para dueños de negocio que quieren dejar de perder clientes por WhatsApp.', 'Si algo te hace sentido, me dices 🙌'], botones: ['Gracias', 'Quiero platicarlo'] },
  ingk_react_caso: { familia: 'Reactivación', cat: 'Marketing', cuando: 'Reactivación · día 21', texto: ['Hola {n} 👋', 'Te cuento el último caso que cerramos 🚀', 'Un negocio de 8 personas automatizó la atención de WhatsApp y hoy agenda citas sin que nadie capture nada.', 'Si quieres ver cómo quedaría en tu negocio, la Discovery sigue siendo sin costo 👇', 'https://ingeniak.mx/agendar/'], botones: ['Quiero agendar', 'No me interesa'] },
  ingk_sesion_confirmacion_v2: { familia: 'Sesión', cat: 'Utilidad', cuando: 'Al agendar por el sitio o por llamada', texto: ['Hola {n} 👋', 'Tu {s} con Rik quedó agendada ✅', '🗓️ {f}', '🔗 Enlace de la reunión:', '{e}', '¿Nos confirmas tu asistencia?'], botones: ['Confirmo', 'Necesito cambiar'] },
  ingk_sesion_24h_v2: { familia: 'Sesión', cat: 'Utilidad', cuando: '24 h antes de la sesión', texto: ['Hola {n} 👋', 'Mañana es tu {s} con Rik ⏰', '🗓️ {f}', '💡 Para aprovecharla, ten a la mano tus números del mes y lo que más te urge resolver.', '¿Sigue en pie?'], botones: ['Ahí estaré', 'Necesito cambiar'] },
  ingk_sesion_hoy_v2: { familia: 'Sesión', cat: 'Utilidad', cuando: '8:00 del día de la sesión', texto: ['Buenos días, {n} ☀️', 'Hoy es tu {s} con Rik.', '🕐 {f}', '🔗 Enlace:', '{e}', 'Te recomiendo conectarte desde computadora. ¡Nos vemos!'], botones: ['Necesito cambiar'] },
  ingk_sesion_1h: { familia: 'Sesión', cat: 'Utilidad', cuando: '1 h antes de la sesión', texto: ['Hola {n} 👋', 'En 1 hora empieza tu {s} ⏳', '🔗 Enlace:', '{e}', 'Ten abierto lo que usas hoy (WhatsApp Business, CRM o Excel) para revisarlo en vivo.'], botones: [] },
  ingk_sesion_15min: { familia: 'Sesión', cat: 'Marketing', cuando: '15 min antes de la sesión', texto: ['Hola {n} 👋', 'En 15 minutos empezamos ⚡', 'Rik ya te espera aquí 👇', '{e}', '¡Te vemos en un momento!'], botones: [] },
  ingk_cita_noshow: { familia: 'No show', cat: 'Marketing', cuando: 'No show · al entrar', texto: ['Hola {n} 👋', 'Te esperé hoy en la sesión; sé que pasan cosas 🙂', '¿La reagendamos? 👇', 'https://ingeniak.mx/agendar/'], botones: ['Reagendar', 'Ya no me interesa'] },
  ingk_reagendar_1: { familia: 'No show', cat: 'Marketing', cuando: 'Reagenda · seguimiento 1', texto: ['Hola {n} 👋', 'Sigue pendiente tu {s} con Rik 🗓️', 'La idea es salir con un plan claro de qué automatizar primero en tu negocio.', '¿Te busco un nuevo horario?'], botones: ['Reagendar', 'Ya no me interesa'] },
  ingk_reagendar_2: { familia: 'No show', cat: 'Marketing', cuando: 'Reagenda · seguimiento 2', texto: ['Hola {n} ☝️', 'Sé que la agenda se complica. Tu {s} con Rik sigue disponible y la movemos al día y hora que mejor te acomode.', '¿La reagendamos?'], botones: ['Reagendar', 'Ya no me interesa'] },
  ingk_reagendar_3: { familia: 'No show', cat: 'Marketing', cuando: 'Reagenda · seguimiento 3', texto: ['Hola {n} 👋', 'Es mi último recordatorio, para no saturarte 🙏', 'Si todavía te interesa tu {s} con Rik, respóndeme aquí y te paso horarios de esta misma semana.', '¿Qué prefieres?'], botones: ['Reagendar', 'Ya no me interesa'] },
  ingk_reagendar_despedida: { familia: 'No show', cat: 'Marketing', cuando: 'Reagenda · despedida', texto: ['Hola {n} 👋', 'Como no logramos coincidir, cierro por ahora tu solicitud de {s} para no seguir escribiéndote.', 'Si más adelante quieres retomarla, puedes elegir tu horario aquí 👇', 'https://ingeniak.mx/agendar/', '¡Gracias por tu tiempo!'], botones: [] },
  ingk_presupuesto_listo_v2: { familia: 'Presupuesto', cat: 'Marketing', cuando: 'Presupuesto realizado · al entrar', texto: ['Hola {n} 👋', 'Tu presupuesto ya salió del horno ✅', 'Antes de mandarte un PDF frío, preferimos mostrártelo en 30 minutos: qué se automatiza primero, en cuánto tiempo y qué resultado puedes esperar.', '¿Lo vemos en vivo o te lo mando por aquí?'], botones: ['Agendar reunión', 'Envíamelo por aquí'] },
  ingk_presupuesto_seguimiento_1_v2: { familia: 'Presupuesto', cat: 'Marketing', cuando: 'Presupuesto realizado · 48 h', texto: ['Hola {n} 👋', 'Tu presupuesto lleva dos días listo y ya empieza a sentirse ignorado 😅', 'Trae el plan de qué automatizar primero en tu negocio y cuánto tiempo te devuelve. Verlo toma 30 minutos.', '¿Le damos su momento?'], botones: ['Agendar reunión', 'Envíamelo por aquí', 'Ya no me interesa'] },
  ingk_presupuesto_seguimiento_2_v2: { familia: 'Presupuesto', cat: 'Marketing', cuando: 'Presupuesto realizado · 4 días', texto: ['Hola {n} 👋', 'Mientras este mensaje esperaba, tu negocio siguió respondiendo a mano lo mismo de siempre ⏳', 'Tu presupuesto sigue aquí, con el plan para que eso deje de pasar. Es el último recordatorio que te mando.', '¿Lo vemos o lo dejamos para después?'], botones: ['Agendar reunión', 'Envíamelo por aquí', 'Ya no me interesa'] },
  ingk_presupuesto_enviado_v2: { familia: 'Presupuesto', cat: 'Marketing', cuando: 'Enviado/Presentado · 24 h', texto: ['Hola {n} 👋', 'No te voy a preguntar si ya leíste la propuesta 🙂', 'Mejor dime en un toque cómo la viste y yo me encargo del resto.'], botones: ['Me convence', 'Tengo dudas', 'No es para mí'] },
  ingk_presupuesto_actualizado: { familia: 'Presupuesto', cat: 'Marketing', cuando: 'El cliente pidió un ajuste', texto: ['Hola {n} 👋', 'Ya quedó listo el ajuste que nos pediste en tu presupuesto ✅', 'Lo podemos revisar en una videollamada breve con Rik o te lo envío por aquí.', '¿Cómo prefieres avanzar?'], botones: ['Agendar reunión', 'Envíamelo por aquí'] },
  ingk_nutri_correo: { familia: 'Nutrición', cat: 'Marketing', cuando: 'Nutrición · con el correo de resumen', texto: ['Hola {n} 👋', 'Te dejé en tu correo el resumen de lo que platicamos, listo para que lo compartas con tu equipo 📩', 'Sin prisa: cuando sea buen momento para ti, aquí sigo para retomarlo 🙌'], botones: ['Retomemos ya', 'Más adelante'] },
  ingk_nutri_articulo: { familia: 'Nutrición', cat: 'Marketing', cuando: 'Nutrición · artículo según su giro', texto: ['Hola {n} 👋', 'Me acordé de lo que platicamos y creo que esta guía te puede servir:', '📘 {a1}', '💡 {a2}', '👉 {a3}', 'Si quieres verlo aplicado a tu negocio, aquí sigo 🙌'], botones: ['Me sirvió', 'Ya no me interesa'] },
  ingk_nutri_retomamos: { familia: 'Nutrición', cat: 'Marketing', cuando: 'Nutrición · 2 días después del correo 06', texto: ['Hola {n} 👋', 'Quedamos en retomar la plática por estas fechas, así que aquí estoy 🙌', '¿Te acomoda que agendemos 30 minutos para ponernos al día?'], botones: ['Sí, agendemos', 'Más adelante', 'Ya no me interesa'] },
  ingk_reactiva_kommo_1: { familia: 'Campañas', cat: 'Marketing', cuando: 'Campañas · mensaje 1', texto: ['Hola {n} 👋 Soy Rik Landeros, Partner de Kommo.', 'Hace un tiempo Kommo me asignó tu solicitud y nunca terminamos de hablar.', 'Desde entonces vi algo en negocios como el tuyo que no tiene que ver con el CRM, y creo que te va a interesar.', '¿Te lo cuento?'], botones: ['Sí, cuéntame', 'Ya lo resolví', 'No me escribas'] },
  ingk_reactiva_kommo_2: { familia: 'Campañas', cat: 'Marketing', cuando: 'Campañas · mensaje 2', texto: ['Hola {n} 👋', 'Mucha gente nos conoce solo como partner de Kommo, pero el CRM es apenas una pieza.', 'También ponemos agentes de IA que responden tu WhatsApp a cualquier hora, automatizamos el seguimiento, hacemos tu página web y tus campañas de anuncios.', 'Dime a qué se dedica tu negocio y te digo cuál de esas piezas te daría más ventas primero. Sin costo y por aquí mismo.', 'Aquí puedes ver todo lo que hacemos: https://ingeniak.mx'], botones: ['Quiero saberlo', 'No me escribas'] },
  ingk_reactiva_kommo_3: { familia: 'Campañas', cat: 'Marketing', cuando: 'Campañas · mensaje 3', texto: ['Hola {n} 👋', 'Último mensaje, lo prometo 🙂', 'No quiero ser el que escribe cada semana. Si tu negocio ya vende ordenado, me da gusto y aquí lo dejamos.', 'Si todavía se te quedan clientes sin responder o seguimientos en el olvido, dime y lo vemos en 30 minutos, sin costo.', 'Todo lo que hacemos está en https://ingeniak.mx'], botones: ['Sí, veámoslo', 'No me escribas'] },
};
export const VARIABLES: Record<string, string> = {
  n: 'nombre', r: 'responsable', s: 'tipo de sesión', f: 'fecha y hora', e: 'enlace de la reunión', i: 'servicio de interés',
  x: 'frase armada con sus respuestas', a1: 'título de la guía', a2: 'idea clave', a3: 'enlace del artículo',
};
export const PLANTILLAS_SIN_USO = ['ingk_apertura_web_v2', 'ingk_fu_caso', 'ingk_fu_facilidad', 'ingk_cita_confirmacion', 'ingk_cita_recordatorio', 'ingk_sesion_confirmacion', 'ingk_sesion_24h', 'ingk_sesion_hoy', 'ingk_presupuesto_listo', 'ingk_presupuesto_seguimiento_1', 'ingk_presupuesto_seguimiento_2', 'ingk_presupuesto_enviado', 'ingk_reactivacion_1'];

export const SECCIONES = [
  { id: 'mapa', label: 'Mapa general' },
  { id: 'roles', label: 'Quién hace qué' },
  { id: 'calificacion', label: 'Calificación' },
  { id: 'discovery', label: 'Discovery Session' },
  { id: 'presupuestos', label: 'Presupuestos' },
  { id: 'power', label: 'Power Session' },
  { id: 'apoyo', label: 'Nutrición y campañas' },
  { id: 'relevo', label: 'Cuándo entra el comercial' },
  { id: 'reloj', label: 'Reloj de tiempos' },
  { id: 'plantillas', label: 'Plantillas y bots' },
  { id: 'medicion', label: 'Cómo se mide' },
  { id: 'material', label: 'Material de apoyo' },
  { id: 'rutina', label: 'Rutina diaria' },
  { id: 'pendientes', label: 'Pendientes' },
];
