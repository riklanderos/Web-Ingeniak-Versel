// src/scripts/agenda/gracias-store.ts — lo que la reserva de la Discovery le pasa a /agendar/gracias/.
// Va en sessionStorage (misma pestaña, nunca en la URL): nombre de pila, horario, correo y enlace de Meet.
export const GRACIAS_URL = '/agendar/gracias/';
export const GRACIAS_STORE = 'ingeniak-agenda-gracias';
/** Pasado este tiempo la página ya no muestra los datos (pestaña olvidada abierta). */
export const GRACIAS_TTL_MS = 24 * 60 * 60 * 1000;

export type Gracias = {
  nombre: string;
  when: string;
  start: string | null;
  email: string;
  meetLink: string | null;
  /** Página donde se agendó (/discovery/ o /agendar/): solo la ruta. */
  desde: string;
  t: number;
  /** booking_confirmed ya se mandó (recargar la página no cuenta otra conversión). */
  medido?: boolean;
};

/** Guarda la reserva para la página de gracias. false si el navegador no deja (la reserva se confirma en la misma página). */
export function guardarGracias(g: Omit<Gracias, 't' | 'medido'>): boolean {
  try {
    sessionStorage.setItem(GRACIAS_STORE, JSON.stringify({ ...g, t: Date.now() }));
    return sessionStorage.getItem(GRACIAS_STORE) !== null;
  } catch {
    return false;
  }
}

export function leerGracias(): Gracias | null {
  try {
    const raw = sessionStorage.getItem(GRACIAS_STORE);
    if (!raw) return null;
    const g = JSON.parse(raw) as Gracias;
    if (!g || typeof g.when !== 'string' || !g.when || !Number.isFinite(g.t) || Date.now() - g.t > GRACIAS_TTL_MS) return null;
    return g;
  } catch {
    return null;
  }
}

export function marcarMedido(g: Gracias) {
  try {
    sessionStorage.setItem(GRACIAS_STORE, JSON.stringify({ ...g, medido: true }));
  } catch { /* nada */ }
}
