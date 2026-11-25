import { clamp01, easeInOut, easeOut, prog } from '../brand';

/** Duración propia del video «El reloj de Kain» (33 s a 30 fps). */
export const DUR_RELOJ = 990;
export const CIERRE_IN = 902;
export const CIERRE_OUT = 980;

export type Role = 'kain' | 'comercial' | 'rik' | 'sistema';

export const ROLES: Record<Role, { color: string; label: string }> = {
  kain: { color: '#00E5FF', label: 'Kain' },
  comercial: { color: '#FFB547', label: 'Comercial' },
  rik: { color: '#A78BFA', label: 'Rik' },
  sistema: { color: '#9EB0C7', label: 'Sistema' },
};
export const ROLE_ORDER: Role[] = ['kain', 'comercial', 'rik', 'sistema'];

export const TITULO = 'El reloj de Kain · lo que pasa solo';
export const CIERRE_L1 = 'Las plantillas salen en horario laboral:';
export const CIERRE_L2 = 'lun–vie 8:00–19:00 · sáb 8:00–15:00';

export type Chip = { t: string; at: number; role: Role; read?: string };
export type Row = {
  chips: Chip[];
  /** índice del chip donde empieza la segunda línea de horas */
  wrapAt?: number;
  /** descripción, líneas para 16:9 */
  text: string[];
  /** descripción, líneas para móvil */
  textM: string[];
};
export type Act = { n: number; title: string; start: number; end: number; rows: Row[] };

export const ACTS: Act[] = [
  {
    n: 1,
    title: 'Lead nuevo',
    start: 0,
    end: 360,
    rows: [
      {
        chips: [{ t: '0 min', at: 26, role: 'kain' }],
        text: ['Apertura por plantilla o respuesta de Kain'],
        textM: ['Apertura por plantilla', 'o respuesta de Kain'],
      },
      {
        chips: [
          { t: '1 h', at: 68, role: 'kain' },
          { t: '6 h', at: 84, role: 'kain' },
          { t: '22 h', at: 100, role: 'kain' },
        ],
        text: ['Seguimientos de Kain si el cliente calla'],
        textM: ['Seguimientos de Kain', 'si el cliente calla'],
      },
      {
        chips: [{ t: '2 h', at: 136, role: 'comercial' }],
        text: ['Correo de apertura + tarea de llamada a Marcos'],
        textM: ['Correo de apertura +', 'tarea de llamada a Marcos'],
      },
      {
        chips: [{ t: '24 h', at: 176, role: 'sistema' }],
        text: ['Plantilla de retomar o de agenda'],
        textM: ['Plantilla de retomar o de agenda'],
      },
      {
        chips: [{ t: '72 h', at: 214, role: 'sistema' }],
        text: ['Pasa a Follow-up · Sin respuesta'],
        textM: ['Pasa a Follow-up · Sin respuesta'],
      },
      {
        chips: [
          { t: '+48 h', at: 252, role: 'sistema' },
          { t: '+4 días', at: 268, role: 'sistema' },
        ],
        text: ['Plantillas de dato y de permiso'],
        textM: ['Plantillas de dato y de permiso'],
      },
      {
        chips: [
          { t: 'Día 7', at: 298, role: 'sistema' },
          { t: '21', at: 312, role: 'sistema', read: 'Día 21' },
          { t: '30', at: 326, role: 'sistema', read: 'Día 30' },
        ],
        text: ['Reactivación: guía, caso y cierre'],
        textM: ['Reactivación: guía, caso y cierre'],
      },
    ],
  },
  {
    n: 2,
    title: 'La sesión',
    start: 360,
    end: 630,
    rows: [
      {
        chips: [
          { t: '24 h antes', at: 386, role: 'kain' },
          { t: '8:00', at: 406, role: 'kain' },
          { t: '1 h', at: 426, role: 'kain' },
          { t: '15 min', at: 446, role: 'kain' },
        ],
        wrapAt: 2,
        text: ['Recordatorios de la Discovery', 'y del Game Plan'],
        textM: ['Recordatorios de la Discovery', 'y del Game Plan'],
      },
      {
        chips: [
          { t: '1', at: 490, role: 'kain', read: '1 día' },
          { t: '3', at: 506, role: 'kain', read: '3 días' },
          { t: '5 días', at: 522, role: 'kain' },
        ],
        text: ['No show: seguimientos para reagendar'],
        textM: ['No show: seguimientos', 'para reagendar'],
      },
      {
        chips: [{ t: '7 días', at: 560, role: 'sistema' }],
        text: ['Despedida y cierre'],
        textM: ['Despedida y cierre'],
      },
    ],
  },
  {
    n: 3,
    title: 'El presupuesto',
    start: 630,
    end: 900,
    rows: [
      {
        chips: [{ t: '24 h', at: 656, role: 'rik' }],
        text: ['Rik prepara el presupuesto'],
        textM: ['Rik prepara el presupuesto'],
      },
      {
        chips: [{ t: 'Al entrar', at: 696, role: 'kain' }],
        text: ['Aviso: tu presupuesto está listo'],
        textM: ['Aviso: tu presupuesto está listo'],
      },
      {
        chips: [
          { t: '48 h', at: 736, role: 'sistema' },
          { t: '4 días', at: 752, role: 'sistema' },
        ],
        text: ['Seguimiento 1 y 2'],
        textM: ['Seguimiento 1 y 2'],
      },
      {
        chips: [{ t: '+48 h', at: 790, role: 'comercial' }],
        text: ['Tarea de llamada a Marcos'],
        textM: ['Tarea de llamada a Marcos'],
      },
      {
        chips: [
          { t: '24 h', at: 826, role: 'sistema' },
          { t: '+48 h', at: 842, role: 'comercial' },
        ],
        text: ['Enviado/Presentado: seguimiento y llamada'],
        textM: ['Enviado/Presentado:', 'seguimiento y llamada'],
      },
    ],
  },
];

/* ---------- relojes derivados del fotograma ---------- */
const FADE = 16;

/** Visibilidad del acto (entra y sale con fundido). */
export const actVis = (f: number, a: Act) =>
  prog(f, a.start, FADE) * (1 - prog(f, a.end - FADE, FADE, easeInOut));

/** Encendido de un chip 0..1 */
export const lit = (f: number, c: Chip) => prog(f, c.at, 12);

/** Destello breve al encenderse (1 -> 0). */
export const flare = (f: number, c: Chip) => {
  if (f < c.at) return 0;
  return 1 - easeOut(clamp01((f - c.at) / 30));
};

/** Entrada de la tarjeta de la fila. */
export const rowIn = (f: number, r: Row) => prog(f, r.chips[0].at, 14);

export const rowRoles = (r: Row): Role[] => {
  const out: Role[] = [];
  r.chips.forEach((c) => {
    if (!out.includes(c.role)) out.push(c.role);
  });
  return out;
};

/** Color del nodo: el del último chip encendido (mezcla suave). */
export const lastLitChip = (f: number, r: Row): Chip => {
  let c = r.chips[0];
  r.chips.forEach((x) => {
    if (f >= x.at) c = x;
  });
  return c;
};

export const rowFlare = (f: number, r: Row) => Math.max(...r.chips.map((c) => flare(f, c)));

/** Progreso del acto 0..1 según chips encendidos. */
export const actProgress = (f: number, a: Act) => {
  const chips = a.rows.flatMap((r) => r.chips);
  return chips.reduce((s, c) => s + prog(f, c.at - 6, 16, easeInOut), 0) / chips.length;
};

/** Vueltas de la aguja (una por acto; termina en las 12). */
export const handTurns = (f: number) => ACTS.reduce((s, a) => s + actProgress(f, a), 0);

/** Posición de la cabeza lectora sobre la línea: y de nodos -> y actual. */
export const playheadY = (f: number, a: Act, nodeY: number[], top: number) => {
  let y = top;
  a.rows.forEach((r, k) => {
    const at = r.chips[0].at;
    const p = prog(f, at - 18, 18, easeInOut);
    const from = k === 0 ? top : nodeY[k - 1];
    if (p > 0) y = from + (nodeY[k] - from) * p;
  });
  return y;
};

/** Chip vigente para el contador y su antecesor. */
export const currentChip = (f: number, a: Act) => {
  const chips = a.rows.flatMap((r) => r.chips);
  let i = -1;
  chips.forEach((c, k) => {
    if (f >= c.at) i = k;
  });
  return { cur: i >= 0 ? chips[i] : null, prev: i > 0 ? chips[i - 1] : null };
};

export const cierreVis = (f: number) =>
  prog(f, CIERRE_IN, 22) * (1 - prog(f, CIERRE_OUT, DUR_RELOJ - CIERRE_OUT, easeInOut));

export const hexA = (hex: string, a: number) => {
  const v = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  return `rgba(${v[0]},${v[1]},${v[2]},${a})`;
};
