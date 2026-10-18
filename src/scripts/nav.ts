// src/scripts/nav.ts — JS del área "nav" (ver CONVENCIONES.md). Lo llama main.ts → initNav().
// API pública: window.__nav = { openMega(key), closeMega(), openMenu(), closeMenu(), openSearch(q?) }
// y el evento 'ingeniak:nav-ready' cuando está lista.
import { initHeader } from './nav/header';
import { initMega, type MegaApi } from './nav/mega';
import { initSheet, type SheetApi } from './nav/sheet';
import { initPersist } from './nav/persist';
import { initRail } from './nav/rail';
import { initFooter } from './nav/footer';
import { initVT } from './nav/vt';

const safe = <T>(name: string, fn: () => T): T | undefined => {
  try { return fn(); } catch (e) { console.warn(`[ingeniak:nav:${name}]`, e); return undefined; }
};

let searchMod: Promise<typeof import('./nav/search')> | null = null;
const search = () => (searchMod ??= import('./nav/search'));

export function initNav(): void {
  const html = document.documentElement;
  const isMac = /Mac|iPhone|iPad|iPod/i.test(navigator.platform || navigator.userAgent);
  if (!isMac) document.querySelectorAll('[data-kbd-mod]').forEach((k) => (k.textContent = 'Ctrl K'));

  safe('header', initHeader);
  const mega = safe('mega', initMega) as MegaApi | undefined;
  const sheet = safe('sheet', initSheet) as SheetApi | undefined;
  safe('persist', initPersist);
  safe('rail', initRail);
  safe('footer', initFooter);
  safe('vt', initVT);

  // ⌘K / Ctrl+K y botones [data-search-open]
  const hasSearch = !!document.querySelector('[data-sd]');
  const openSearch = (q = '') => {
    if (!hasSearch) return;
    mega?.close();
    return search().then((m) => m.openSearch(q));
  };
  if (hasSearch) {
    document.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && !e.altKey && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        const dlg = document.querySelector<HTMLDialogElement>('[data-sd]');
        if (dlg?.open) search().then((m) => m.closeSearch());
        else openSearch();
      }
    });
    document.addEventListener('click', (e) => {
      const b = (e.target as HTMLElement).closest<HTMLElement>('[data-search-open]');
      if (!b) return;
      e.preventDefault();
      openSearch(b.dataset.searchQ ?? '');
    });
    // Precalienta el módulo y el índice con intención (hover o foco en el botón)
    const warm = () => search().then((m) => m.loadIndex());
    document.querySelectorAll('[data-search-open]').forEach((b) => {
      b.addEventListener('pointerenter', warm, { once: true });
      b.addEventListener('focus', warm, { once: true });
    });
  }

  (window as any).__nav = {
    openMega: (k: string) => mega?.open(k),
    closeMega: () => mega?.close(),
    openMenu: () => sheet?.open(),
    closeMenu: () => sheet?.close(),
    openSearch,
  };
  html.dataset.navReady = '';
  window.dispatchEvent(new CustomEvent('ingeniak:nav-ready'));
}
