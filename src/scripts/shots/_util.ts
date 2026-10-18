// src/scripts/shots/_util.ts — utilidades compartidas de los módulos de escena (no es una escena: el "_" lo excluye del glob).
import type gsapNS from 'gsap';
import type { ScrollTrigger as ST } from 'gsap/ScrollTrigger';
import type { SplitText as SPT } from 'gsap/SplitText';
import type Lenis from 'lenis';

export interface Env {
  motion: boolean;         // sin prefers-reduced-motion ni html[data-motion="reduced"]
  desk: boolean;           // (min-width:768px) and (min-aspect-ratio:5/6)
  pin: boolean;            // escritorio con puntero fino y alto ≥ 640 (y con movimiento): secuencias fijadas
  gsap: typeof gsapNS;
  ScrollTrigger: typeof ST;
  SplitText: typeof SPT;
  lenis?: Lenis;
  ctx: gsap.Context;
  cleanup: (fn: () => void) => void;
}
export type Shot = (el: HTMLElement, env: Env) => void | (() => void);

export const html = document.documentElement;
export const $ = <T extends Element = HTMLElement>(s: string, r: ParentNode = document) => r.querySelector<T>(s);
export const $$ = <T extends Element = HTMLElement>(s: string, r: ParentNode = document) => [...r.querySelectorAll<T>(s)];

/** ¿Está el elemento (al menos un poco) en el viewport ahora? */
export function inView(el: Element, frac = 0.05): boolean {
  const r = el.getBoundingClientRect();
  const vh = innerHeight || html.clientHeight;
  return r.bottom > vh * frac && r.top < vh * (1 - frac);
}
export const visible = (el: Element | null): el is HTMLElement => !!el && (el as HTMLElement).offsetParent !== null && getComputedStyle(el).display !== 'none';

/** Marca un nodo como tomado por una escena (los revelados genéricos lo saltan) y lo saca del estado oculto CSS. */
export function claim(el: Element) {
  (el as HTMLElement).dataset.claimed = '';
  el.classList.add('is-revealed');
}

/** Titular por líneas (SplitText con máscara, yPercent 110 → 0, .95 s, stagger .08). Devuelve un "player". */
export function splitLines(el: HTMLElement, env: Env, opts: { trigger?: Element | false; start?: string; delay?: number } = {}) {
  const { gsap, SplitText } = env;
  claim(el);
  if (el.querySelector('a')) {
    // R11: nunca SplitText sobre titulares con enlaces → bloque
    return blockReveal(el, env, opts);
  }
  // Titulares de varias voces (.t-display + .t-deck …): cada voz se divide por separado y las líneas entran en orden.
  const voices = [...el.querySelectorAll<HTMLElement>(':scope > :is(.t-display,.t-display-2,.t-deck,.t-mega,.t-h4,.t-standfirst)')];
  const parts = voices.length ? voices : [el];
  let played = false;
  const anims: (gsap.core.Tween | null)[] = parts.map(() => null);
  let offset = 0;
  parts.forEach((p, k) => {
    const base = offset;
    SplitText.create(p, {
      type: 'lines', mask: 'lines', autoSplit: true, linesClass: 'split-line',
      onSplit(self) {
        const a = gsap.from(self.lines, {
          yPercent: 110, duration: 0.95, stagger: 0.08, ease: 'expo.out', delay: (opts.delay ?? 0) + base * 0.08, paused: !played,
        });
        anims[k] = a;
        if (played) a.progress(1);
        return a;
      },
    });
    offset += Math.max(1, Math.round(p.getBoundingClientRect().height / (parseFloat(getComputedStyle(p).lineHeight) || 40)));
  });
  const play = () => { if (played) return; played = true; anims.forEach((a) => a?.play()); };
  const finish = () => { played = true; anims.forEach((a) => a?.progress(1)); };
  if (opts.trigger !== false) {
    env.ScrollTrigger.create({ trigger: opts.trigger ?? el, start: opts.start ?? 'top 88%', once: true, onEnter: play });
  }
  return { play, finish };
}

/** Bloque (lede, CTAs, chips): y 20 → 0 y autoAlpha 0 → 1, 0.8 s; "stagger" anima a sus hijos (.06). */
export function blockReveal(el: HTMLElement, env: Env, opts: { trigger?: Element | false; start?: string; delay?: number; y?: number } = {}) {
  const { gsap } = env;
  claim(el);
  const targets = el.dataset.reveal === 'stagger' ? [...el.children] : [el];
  if (el.dataset.reveal === 'stagger') gsap.set(el, { opacity: 1 });
  const tw = gsap.from(targets, { y: opts.y ?? 20, autoAlpha: 0, duration: 0.8, stagger: 0.06, ease: 'expo.out', delay: opts.delay ?? 0, paused: true });
  let played = false;
  const play = () => { if (played) return; played = true; tw.play(); };
  const finish = () => { played = true; tw.progress(1); };
  if (opts.trigger !== false) {
    env.ScrollTrigger.create({ trigger: opts.trigger ?? el, start: opts.start ?? 'top 88%', once: true, onEnter: play });
  }
  return { play, finish };
}

/** Revelados genéricos de la página para lo que ninguna escena tomó. */
export function reveals(env: Env) {
  const els = $$<HTMLElement>('[data-split],[data-reveal]').filter((e) => !('claimed' in e.dataset));
  if (!env.motion) { els.forEach((e) => e.classList.add('is-revealed')); return; }
  for (const el of els) {
    if ('split' in el.dataset) splitLines(el, env);
    else blockReveal(el, env);
  }
}

/** Desplaza la página (con Lenis si existe) a una posición en px. */
export function scrollToY(y: number, env: Env, immediate = false) {
  if (env.lenis) env.lenis.scrollTo(y, { immediate, duration: immediate ? 0 : 1.1, force: true });
  else window.scrollTo({ top: y, behavior: immediate ? 'auto' : 'smooth' });
}

/** "Saltar escena": va al final del recorrido fijado y deja el foco en lo que sigue. */
export function wireSkip(el: HTMLElement, env: Env, st: ST | null) {
  const a = el.querySelector<HTMLAnchorElement>('[data-skip]');
  if (!a) return () => {};
  const onClick = (e: Event) => {
    if (!st) return; // sin pin: el ancla nativa funciona
    e.preventDefault();
    scrollToY(st.end + 2, env, true);
    const wrap = el.parentElement?.classList.contains('pin-spacer') ? el.parentElement : el;
    let next = wrap.nextElementSibling as HTMLElement | null;
    if (next) {
      const f = next.querySelector<HTMLElement>('a[href],button,h2,h3') ?? next;
      if (!f.hasAttribute('tabindex') && !/^(A|BUTTON)$/.test(f.tagName)) f.setAttribute('tabindex', '-1');
      requestAnimationFrame(() => f.focus({ preventScroll: true }));
    }
  };
  a.addEventListener('click', onClick);
  return () => a.removeEventListener('click', onClick);
}

/** Modo sala (encabezado, KainPill y barra móvil ocultos) mientras una secuencia está fijada. */
export function sala(on: boolean) {
  if (on) html.setAttribute('data-sala', '');
  else html.removeAttribute('data-sala');
  document.dispatchEvent(new CustomEvent('cine:sala', { detail: { on } }));
}
