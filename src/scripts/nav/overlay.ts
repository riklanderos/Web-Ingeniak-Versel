// src/scripts/nav/overlay.ts — capas que pausan el scroll (mega menú, hoja móvil, ⌘K).
// Lenis lo crea cine.ts y lo expone en window.__lenis; aquí solo se pausa/reanuda.
type LenisLike = { stop?: () => void; start?: () => void };
const html = document.documentElement;
const locks = new Set<string>();

const lenis = (): LenisLike | undefined => (window as any).__lenis;

/** Abre una capa. `hard` = además bloquea el scroll nativo (hoja y diálogo). */
export function lock(name: string, hard = false) {
  locks.add(name);
  html.dataset.overlay = [...locks].join(' ');
  try { lenis()?.stop?.(); } catch {}
  if (hard) { html.classList.add('is-locked'); hardLocks.add(name); }
}
const hardLocks = new Set<string>();
export function unlock(name: string) {
  locks.delete(name);
  hardLocks.delete(name);
  if (!hardLocks.size) html.classList.remove('is-locked');
  if (locks.size) { html.dataset.overlay = [...locks].join(' '); return; }
  delete html.dataset.overlay;
  try { lenis()?.start?.(); } catch {}
}
export const isLocked = (name?: string) => (name ? locks.has(name) : locks.size > 0);

export const reducedMotion = () =>
  html.dataset.motion === 'reduced' || matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Evento de medición (R10). La capa de analítica escucha `ingeniak:track`. Nunca lleva texto escrito por la persona. */
export function track(name: string, detail: Record<string, unknown> = {}) {
  try { document.dispatchEvent(new CustomEvent('ingeniak:track', { detail: { name, page: location.pathname, ...detail } })); } catch {}
}
