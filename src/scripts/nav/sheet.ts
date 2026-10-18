// src/scripts/nav/sheet.ts — hoja móvil / compacta (ESPEC §4.5).
// <dialog> modal: foco atrapado y Esc nativos. Entrada: y 4% → 0 + opacidad (0.35 s), grupos con stagger 0.04 s.
// Lenis en pausa mientras está abierta; html[data-menu-open] oculta la barra móvil.
import { lock, unlock, track } from './overlay';

export type SheetApi = { open: () => void; close: () => void };

export function initSheet(): SheetApi | undefined {
  const dlg = document.querySelector<HTMLDialogElement>('[data-msheet]');
  if (!dlg || typeof dlg.showModal !== 'function') return;
  const html = document.documentElement;
  const openers = [...document.querySelectorAll<HTMLElement>('[data-menu-open]')];
  let closing = 0;

  const open = () => {
    clearTimeout(closing);
    if (!dlg.open) dlg.showModal();
    html.dataset.menuOpen = '';
    lock('menu', true);
    openers.forEach((b) => b.setAttribute('aria-expanded', 'true'));
    requestAnimationFrame(() => requestAnimationFrame(() => dlg.classList.add('is-open')));
    track('menu_open', { panel: 'mobile' });
  };
  const close = () => {
    if (!dlg.open) return;
    dlg.classList.remove('is-open');
    delete html.dataset.menuOpen;
    openers.forEach((b) => b.setAttribute('aria-expanded', 'false'));
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches || html.dataset.motion === 'reduced';
    clearTimeout(closing);
    closing = window.setTimeout(() => { dlg.close(); unlock('menu'); }, reduced ? 0 : 300);
  };

  openers.forEach((b) => b.addEventListener('click', open));
  dlg.querySelectorAll('[data-menu-close]').forEach((b) => b.addEventListener('click', close));
  dlg.addEventListener('cancel', (e) => { e.preventDefault(); close(); });
  dlg.addEventListener('close', () => { dlg.classList.remove('is-open'); delete html.dataset.menuOpen; unlock('menu'); });
  // Navegar desde la hoja la cierra (también en anclas de la misma página)
  dlg.addEventListener('click', (e) => {
    const a = (e.target as HTMLElement).closest('a[href]');
    if (a && !a.getAttribute('target')) close();
  });

  // Acordeones (uno abierto a la vez)
  const accs = [...dlg.querySelectorAll<HTMLElement>('[data-acc]')];
  for (const acc of accs) {
    const btn = acc.querySelector<HTMLButtonElement>('.acc__btn');
    btn?.addEventListener('click', () => {
      const willOpen = !acc.classList.contains('is-open');
      for (const o of accs) {
        o.classList.remove('is-open');
        o.querySelector('.acc__btn')?.setAttribute('aria-expanded', 'false');
      }
      if (willOpen) {
        acc.classList.add('is-open');
        btn.setAttribute('aria-expanded', 'true');
        setTimeout(() => acc.scrollIntoView({ block: 'nearest', behavior: 'smooth' }), 120);
      }
    });
  }

  matchMedia('(min-width: 1180px)').addEventListener('change', (m) => { if (m.matches) close(); });
  return { open, close };
}
