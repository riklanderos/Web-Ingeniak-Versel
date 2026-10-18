// src/scripts/cine.ts — sistema de movimiento del área "cine" (ESPEC-v2 §7). Un módulo por documento (MPA, sin ClientRouter).
// · Crea Lenis 1.3.11 (solo con movimiento) conectado a gsap.ticker y lo expone en window.__lenis (nav hace stop()/start()).
// · gsap.matchMedia con las condiciones de §7.2 (motion · desk · pin); todo lo animado vive en ese contexto y se revierte
//   solo (cambio de tamaño, html[data-motion="reduced"] en vivo).
// · Carga con import() SOLO los módulos de escena que la página usa ([data-shot] → src/scripts/shots/<shot>.ts).
// · Revelados genéricos: [data-split] (SplitText por líneas con máscara) y [data-reveal] (bloque; ="stagger" para sus hijos).
// Eventos que emite: "cine:coldopen-end" (document) · "cine:intro" (sección de portada) · html[data-sala] durante un pin.
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import Lenis from 'lenis';
import { reveals, type Env, type Shot } from './shots/_util';

declare global {
  interface Window { __lenis?: Lenis; __cineInit?: boolean; __cine?: { refresh: () => void; restart: () => void } }
}

const loaders = import.meta.glob<{ default: Shot }>(['./shots/*.ts', '!./shots/_*.ts']);
const html = document.documentElement;
let mods = new Map<string, Shot>();
let mm: gsap.MatchMedia | null = null;

export function initCine(): void {
  if (window.__cineInit) return;
  window.__cineInit = true;
  gsap.registerPlugin(ScrollTrigger, SplitText);
  gsap.defaults({ ease: 'expo.out', duration: 0.9 });
  ScrollTrigger.config({ ignoreMobileResize: true });
  labelSections();
  if (import.meta.env.DEV) devChecks();

  const names = [...new Set([...document.querySelectorAll<HTMLElement>('[data-shot]')].map((e) => e.dataset.shot!))];
  Promise.all(
    names.map(async (n) => {
      const load = loaders[`./shots/${n}.ts`];
      if (!load) { console.warn(`[cine] no existe el módulo de escena "${n}"`); return null; }
      try { return [n, (await load()).default] as const; } catch (e) { console.warn(`[cine] falló "${n}"`, e); return null; }
    }),
  ).then((list) => {
    mods = new Map(list.filter(Boolean) as [string, Shot][]);
    start();
    // Interruptor "Reducir movimiento" (footer): se reconstruye todo en vivo.
    new MutationObserver(() => start()).observe(html, { attributes: true, attributeFilter: ['data-motion'] });
    window.__cine = { refresh: () => ScrollTrigger.refresh(), restart: start };
  });
}

function start() {
  mm?.revert();
  mm = gsap.matchMedia();
  mm.add(
    {
      motion: '(prefers-reduced-motion: no-preference)',
      reduce: '(prefers-reduced-motion: reduce)',
      desk: '(min-width: 768px) and (min-aspect-ratio: 5/6)',
      pin: '(min-width: 1024px) and (min-height: 640px) and (hover: hover) and (pointer: fine)',
    },
    (ctx) => {
      const c = ctx.conditions as Record<string, boolean>;
      const motion = !!c.motion && html.dataset.motion !== 'reduced';
      const cleanups: (() => void)[] = [];
      let lenis: Lenis | undefined;
      let raf: ((t: number) => void) | undefined;
      if (motion) {
        lenis = new Lenis({ lerp: 0.1, smoothWheel: true, syncTouch: false, autoRaf: false });
        lenis.on('scroll', ScrollTrigger.update);
        raf = (t: number) => lenis!.raf(t * 1000);
        gsap.ticker.add(raf);
        gsap.ticker.lagSmoothing(0);
        window.__lenis = lenis;
      }
      html.classList.toggle('cine-motion', motion);
      const env: Env = {
        motion, desk: !!c.desk, pin: motion && !!c.pin, gsap, ScrollTrigger, SplitText, lenis, ctx,
        cleanup: (fn) => cleanups.push(fn),
      };
      for (const el of document.querySelectorAll<HTMLElement>('[data-shot]')) {
        const fn = mods.get(el.dataset.shot!);
        if (!fn) continue;
        try {
          const r = fn(el, env);
          if (typeof r === 'function') cleanups.push(r);
        } catch (e) { console.warn(`[cine] escena "${el.dataset.shot}"`, el, e); }
      }
      reveals(env);
      const refresh = () => ScrollTrigger.refresh();
      document.fonts?.ready.then(refresh);
      addEventListener('load', refresh, { once: true });
      return () => {
        cleanups.forEach((f) => { try { f(); } catch {} });
        if (raf) gsap.ticker.remove(raf);
        lenis?.destroy();
        if (window.__lenis === lenis) window.__lenis = undefined;
        html.removeAttribute('data-sala');
      };
    },
  );
}

/** aria-labelledby de cada escena → su primer titular (si la página no le puso id). */
function labelSections() {
  for (const s of document.querySelectorAll<HTMLElement>('[data-shot][aria-labelledby]')) {
    const id = s.getAttribute('aria-labelledby')!;
    if (document.getElementById(id)) continue;
    const h = s.querySelector<HTMLElement>('h1, h2');
    if (h && !h.id) h.id = id;
    else s.removeAttribute('aria-labelledby');
  }
}

function devChecks() {
  for (const s of document.querySelectorAll<HTMLElement>('[data-plate-missing]')) {
    console.warn(`[cine] #${s.id}: la placa "${s.dataset.plateMissing}" aún no existe → ${s.dataset.plate === 'aura' ? 'aura del isotipo' : `respaldo "${s.dataset.plate}"`}`);
  }
  const primaries = document.querySelectorAll('[data-primary]').length;
  if (!primaries) console.info('[cine] la página no tiene botón primario [data-primary]');
}
