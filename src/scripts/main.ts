// src/scripts/main.ts — punto de entrada único del JS del sitio (lo carga BaseLayout).
// Cada área exporta init(); si un módulo falla, los demás siguen (safe).
import { initNav } from './nav';
import { initUI } from './ui';
import { initCine } from './cine';

const safe = (name: string, fn: () => unknown) => { try { fn(); } catch (e) { console.warn(`[ingeniak:${name}]`, e); } };
const start = () => {
  safe('nav', initNav);
  safe('ui', initUI);
  safe('cine', initCine);
};
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
else start();
