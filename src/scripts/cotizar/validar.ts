// src/scripts/cotizar/validar.ts — reglas del formulario "Cotizar proyecto" (CAMBIO-COTIZAR §2.4, dueño "modal").
// Puras (sin DOM) y con los mensajes de cotizar.json → errores. Son las mismas que aplica server/cotizar.js: el cliente
// solo adelanta lo que el servidor devolvería como 422.
import cat from '../../data/cotizar.json';
import { normalizePhone, phoneMessage, type PhoneInput } from '../forms/phone';

export type Campo =
  | 'servicios' | 'objetivo' | 'industria' | 'tamano' | 'presupuesto' | 'plazo' | 'canales' | 'crm'
  | 'nombre' | 'empresa' | 'telefono' | 'email' | 'canal_preferido' | 'sitio' | 'vision' | 'consentimiento';

export type Datos = {
  servicios: string[]; objetivo: string; industria: string; tamano: string; presupuesto: string; plazo: string;
  canales: string[]; crm: string; nombre: string; empresa: string; telefono: PhoneInput; email: string;
  canal_preferido: string; sitio: string; vision: string; consentimiento: boolean;
};
export type Errores = Partial<Record<Campo, string>>;

/** Campos de cada paso, en el orden visual (el primer error de la lista recibe el foco). */
export const PASOS: Record<1 | 2 | 3, Campo[]> = {
  1: ['servicios', 'objetivo'],
  2: ['industria', 'tamano', 'presupuesto', 'plazo', 'canales', 'crm'],
  3: ['nombre', 'empresa', 'telefono', 'email', 'canal_preferido', 'sitio', 'vision', 'consentimiento'],
};
export const ORDEN: Campo[] = [...PASOS[1], ...PASOS[2], ...PASOS[3]];
export const pasoDe = (c: string): 1 | 2 | 3 => (PASOS[1].includes(c as Campo) ? 1 : PASOS[2].includes(c as Campo) ? 2 : 3);

export const ERR = cat.errores as Record<string, string>;
const GENERICO = 'Revisa esta respuesta.';
const L = cat.limites as { nombre: [number, number]; empresa: [number, number]; email: number; sitio: number; vision: number };
const slugs = (list: { slug: string }[]) => new Set(list.map((x) => x.slug));
const CAT: Record<string, Set<string>> = {
  servicios: slugs(cat.servicios), objetivo: slugs(cat.objetivos), industria: slugs(cat.industrias), tamano: slugs(cat.tamanos),
  presupuesto: slugs(cat.presupuestos), plazo: slugs(cat.plazos), canales: slugs(cat.canales), crm: slugs(cat.crms),
  canal_preferido: slugs(cat.canalesPreferidos),
};
const EXCLUSIVO = cat.servicios.find((s: any) => s.exclusive)?.slug ?? 'no-seguro';
export const EMAIL_RX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// eslint-disable-next-line no-control-regex
const CTRL = /[\u0000-\u001F\u007F-\u009F]/g;
// eslint-disable-next-line no-control-regex
const CTRL_NO_NL = /[\u0000-\u0009\u000B-\u001F\u007F-\u009F]/g;
/** Una línea: sin caracteres de control, espacios colapsados, recortada. */
export const limpiar = (s: unknown): string => String(s ?? '').replace(CTRL, ' ').replace(/\s+/g, ' ').trim();
/** Texto libre: conserva saltos de línea (máx. dos seguidos), sin otros caracteres de control. */
export const limpiarTexto = (s: unknown): string =>
  String(s ?? '').replace(/\r\n?/g, '\n').replace(CTRL_NO_NL, ' ').replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
const unicos = (a: unknown): string[] => [...new Set((Array.isArray(a) ? a : []).map((x) => String(x)))];

/** Saneo idéntico al del servidor (§2.4, columna "Saneo"). El teléfono sale normalizado (número nacional, solo dígitos). */
export function sanear(d: Partial<Datos>): Datos {
  const tel = normalizePhone({ pais: d.telefono?.pais ?? 'mx', lada: d.telefono?.lada ?? null, numero: d.telefono?.numero ?? '' });
  return {
    servicios: unicos(d.servicios),
    objetivo: limpiar(d.objetivo),
    industria: limpiar(d.industria),
    tamano: limpiar(d.tamano),
    presupuesto: limpiar(d.presupuesto),
    plazo: limpiar(d.plazo),
    canales: unicos(d.canales),
    crm: limpiar(d.crm),
    nombre: limpiar(d.nombre),
    empresa: limpiar(d.empresa),
    telefono: { pais: tel.pais || String(d.telefono?.pais ?? ''), lada: tel.lada || String(d.telefono?.lada ?? ''), numero: tel.ok ? tel.numero : String(d.telefono?.numero ?? '').trim() },
    email: limpiar(d.email).toLowerCase(),
    canal_preferido: limpiar(d.canal_preferido),
    sitio: limpiar(d.sitio),
    vision: limpiarTexto(d.vision),
    consentimiento: d.consentimiento === true,
  };
}

const letras = (s: string) => (s.match(/\p{L}/gu) ?? []).length;
const largo = (s: string) => [...s].length;

/** Valida los campos pedidos (por defecto todos). Devuelve { campo: mensaje } solo con los que fallan. */
export function validar(d: Datos, campos: readonly Campo[] = ORDEN): Errores {
  const e: Errores = {};
  const uno = (c: Campo, v: string) => { if (!CAT[c].has(v)) e[c] = ERR[c] ?? GENERICO; };
  for (const c of campos) {
    switch (c) {
      case 'servicios': {
        const s = d.servicios;
        const ok = s.length >= 1 && s.length <= 10 && s.every((x) => CAT.servicios.has(x)) && (!s.includes(EXCLUSIVO) || s.length === 1);
        if (!ok) e.servicios = ERR.servicios;
        break;
      }
      case 'objetivo': case 'industria': case 'tamano': case 'presupuesto': case 'plazo': case 'canal_preferido':
        uno(c, d[c]);
        break;
      case 'canales':
        if (d.canales.length > 7 || !d.canales.every((x) => CAT.canales.has(x))) e.canales = ERR.canales ?? GENERICO;
        break;
      case 'crm':
        if (d.crm && !CAT.crm.has(d.crm)) e.crm = ERR.crm ?? GENERICO;
        break;
      case 'nombre': {
        const n = largo(d.nombre);
        if (n < L.nombre[0] || n > L.nombre[1] || letras(d.nombre) < 2) e.nombre = ERR.nombre;
        break;
      }
      case 'empresa': {
        const n = largo(d.empresa);
        if (n < L.empresa[0] || n > L.empresa[1]) e.empresa = ERR.empresa;
        break;
      }
      case 'telefono': {
        const t = normalizePhone(d.telefono);
        // Mismas palabras que la ayuda del campo y con los dígitos del país elegido (México = errores.telefono).
        if (!t.ok) e.telefono = phoneMessage(t);
        break;
      }
      case 'email':
        if (!d.email || largo(d.email) > L.email || !EMAIL_RX.test(d.email)) e.email = ERR.email;
        break;
      case 'sitio':
        if (largo(d.sitio) > L.sitio) e.sitio = ERR.sitio;
        break;
      case 'vision':
        if (largo(d.vision) > L.vision) e.vision = ERR.vision;
        break;
      case 'consentimiento':
        if (d.consentimiento !== true) e.consentimiento = ERR.consentimiento;
        break;
    }
  }
  return e;
}

/** Primer campo con error según el orden visual (para el salto de paso y el foco). */
export const primerError = (e: Errores): Campo | undefined => ORDEN.find((c) => e[c]);
