// src/scripts/shots/_util.ts — utilidades compartidas de los módulos de escena (no es una escena: el "_" lo excluye del glob).
// Reglas de accesibilidad (R11, §12 manda sobre §7.1): un estado previo a la entrada NUNCA usa visibility (autoAlpha):
// solo opacity + transform, así el contenido sigue en el árbol de accesibilidad y en el orden de tabulación. Todo lo que
// espera su entrada se registra en `pending`; cine.ts lo termina al instante si el foco entra en él (focusin) o si el
// documento no anima (renderizador sin requestAnimationFrame, p. ej. el de Google con tiempo virtual).
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
  SplitText: typeof SPT | null;   // se carga solo con movimiento y si la página tiene titulares que dividir (§7.8)
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
  return r.bottom > vh * frac && r.top < vh * (1 - frac) && r.width + r.height > 0;
}
export const visible = (el: Element | null): el is HTMLElement => !!el && (el as HTMLElement).offsetParent !== null && getComputedStyle(el).display !== 'none';

/* ── Registro de entradas pendientes ───────────────────────────────────────── */
const pending = new Map<Element, () => void>();
/** Registra el "terminar ya" de algo que espera su entrada (bloque, titular, escena). */
export function hold(el: Element, finish: () => void) { pending.set(el, finish); }
export function release(el: Element) { pending.delete(el); }
/** Termina (sin animación) todo lo pendiente que contiene a `target` (foco de teclado o lector de pantalla). */
export function finishAround(target: Element | null) {
  for (let n: Element | null = target; n; n = n.parentElement) {
    const f = pending.get(n);
    if (!f) continue;
    pending.delete(n);
    try { f(); } catch (e) { console.warn('[cine] finish', n, e); }
  }
}
/** Termina lo pendiente que ya está en pantalla (documento que no anima). */
export function finishInView() {
  for (const [el, f] of [...pending]) {
    if (!el.isConnected || !inView(el, 0)) continue;
    pending.delete(el);
    try { f(); } catch {}
  }
}
export function clearPending() { pending.clear(); }

/** Marca un nodo como tomado por una escena (los revelados genéricos lo saltan) y lo saca del estado oculto CSS. */
export function claim(el: Element) {
  (el as HTMLElement).dataset.claimed = '';
  el.classList.add('is-revealed');
}

export interface Player { play: () => void; finish: () => void; prime: () => void }

/** Titular por líneas (SplitText con máscara, yPercent 110 → 0, .95 s, stagger .08). Devuelve un "player".
 *  `lazy`: el estado oculto (110 %) no se aplica hasta prime() o play() (la firma deja el H1 pintado bajo el iris, §8.3). */
export function splitLines(el: HTMLElement, env: Env, opts: { trigger?: Element | false; start?: string; delay?: number; lazy?: boolean } = {}): Player {
  const { gsap, SplitText } = env;
  claim(el);
  if (!SplitText || el.querySelector('a')) {
    // R11: nunca SplitText sobre titulares con enlaces → bloque
    return blockReveal(el, env, opts);
  }
  // Titulares de varias voces (.t-display + .t-deck …): cada voz se divide por separado y las líneas entran en orden.
  const voices = [...el.querySelectorAll<HTMLElement>(':scope > :is(.t-display,.t-display-2,.t-deck,.t-mega,.t-h4,.t-standfirst)')];
  const parts = voices.length ? voices : [el];
  let played = false;
  let primed = !opts.lazy;
  const anims: (gsap.core.Tween | null)[] = parts.map(() => null);
  const lines: Element[][] = parts.map(() => []);
  let offset = 0;
  parts.forEach((p, k) => {
    const base = offset;
    SplitText.create(p, {
      type: 'lines', mask: 'lines', autoSplit: true, linesClass: 'split-line',
      onSplit(self) {
        lines[k] = self.lines;
        const a = gsap.fromTo(self.lines, { yPercent: 110 }, {
          yPercent: 0, duration: 0.95, stagger: 0.08, ease: 'expo.out', delay: (opts.delay ?? 0) + base * 0.08,
          paused: !played, immediateRender: primed && !played,
        });
        anims[k] = a;
        if (played) a.progress(1);
        return a;
      },
    });
    offset += Math.max(1, Math.round(p.getBoundingClientRect().height / (parseFloat(getComputedStyle(p).lineHeight) || 40)));
  });
  const prime = () => {
    if (played || primed) return;
    primed = true;
    lines.forEach((ls) => ls.length && gsap.set(ls, { yPercent: 110 }));
  };
  const play = () => {
    if (played) return;
    played = true; primed = true;
    anims.forEach((a) => a?.play());
    gsap.delayedCall(1.6 + offset * 0.08, () => release(el));
  };
  const finish = () => { played = true; primed = true; anims.forEach((a) => a?.progress(1)); release(el); };
  hold(el, finish);
  if (opts.trigger !== false) {
    env.ScrollTrigger.create({ trigger: opts.trigger ?? el, start: opts.start ?? 'top 88%', once: true, onEnter: play });
  }
  return { play, finish, prime };
}

/** Bloque (lede, CTAs, chips): y 20 → 0 y opacidad 0 → 1, 0.8 s; "stagger" anima a sus hijos (.06). */
export function blockReveal(el: HTMLElement, env: Env, opts: { trigger?: Element | false; start?: string; delay?: number; y?: number; lazy?: boolean } = {}): Player {
  const { gsap } = env;
  claim(el);
  const targets = el.dataset.reveal === 'stagger' ? [...el.children] : [el];
  if (el.dataset.reveal === 'stagger') gsap.set(el, { opacity: 1 });
  let primed = !opts.lazy;
  const tw = gsap.from(targets, {
    y: opts.y ?? 20, opacity: 0, duration: 0.8, stagger: 0.06, ease: 'expo.out', delay: opts.delay ?? 0, paused: true,
    immediateRender: primed, onComplete: () => release(el),
  });
  let played = false;
  const prime = () => { if (played || primed) return; primed = true; tw.progress(0.0001).progress(0); };
  const play = () => { if (played) return; played = true; primed = true; tw.play(); };
  const finish = () => { played = true; primed = true; tw.progress(1); release(el); };
  hold(el, finish);
  if (opts.trigger !== false) {
    env.ScrollTrigger.create({ trigger: opts.trigger ?? el, start: opts.start ?? 'top 88%', once: true, onEnter: play });
  }
  return { play, finish, prime };
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
export function scrollToY(y: number, env: Env, immediate = false, onComplete?: () => void) {
  if (env.lenis) env.lenis.scrollTo(y, { immediate, duration: immediate ? 0 : 1.1, force: true, onComplete: onComplete ? () => onComplete() : undefined });
  else {
    window.scrollTo({ top: y, behavior: immediate ? 'auto' : 'smooth' });
    if (onComplete) {
      if (immediate) requestAnimationFrame(() => onComplete());
      else {
        let t = 0;
        const done = () => { removeEventListener('scroll', on); clearTimeout(t); onComplete(); };
        const on = () => { clearTimeout(t); t = window.setTimeout(done, 120); };
        addEventListener('scroll', on, { passive: true });
        t = window.setTimeout(done, 160);
      }
    }
  }
}

/** Primer titular de la sección que sigue a `el` (o a su pin-spacer) y la sección misma. */
function nextHeading(el: HTMLElement): { h: HTMLElement; box: HTMLElement } | null {
  const wrap = el.parentElement?.classList.contains('pin-spacer') ? el.parentElement : el;
  let next = wrap.nextElementSibling as HTMLElement | null;
  while (next && (next.matches('script,style,template') || next.offsetHeight === 0)) next = next.nextElementSibling as HTMLElement | null;
  if (!next) return null;
  const box = next;
  if (next.classList.contains('pin-spacer')) next = (next.firstElementChild as HTMLElement) ?? next;
  const h = next.querySelector<HTMLElement>('h2, h3') ?? next.querySelector<HTMLElement>('a[href],button') ?? next;
  return { h, box };
}

/** "Saltar escena" (§7.5-4): solo existe mientras la secuencia está fijada (CSS); salta al final del pin, deja el titular
 *  de la sección siguiente a la altura del encabezado + 16 px y le pasa el foco (nunca a algo fuera de pantalla). Si ese
 *  titular no puede recibir el foco ahí (p. ej. la portada de una toma compartida ya apagada e inert), se aterriza al
 *  inicio de la sección siguiente. */
export function wireSkip(el: HTMLElement, env: Env, st: ST | null) {
  const a = el.querySelector<HTMLAnchorElement>('[data-skip]');
  if (!a) return () => {};
  if (st) el.classList.add('is-pin-ready');
  const onClick = (e: Event) => {
    if (!st) return; // sin pin: el ancla nativa funciona
    e.preventDefault();
    const nx = nextHeading(el);
    const focusIn = (h: HTMLElement) => {
      if (!h.hasAttribute('tabindex') && !/^(A|BUTTON)$/.test(h.tagName)) h.setAttribute('tabindex', '-1');
      finishAround(h);
      h.focus({ preventScroll: true });
      return document.activeElement === h;
    };
    const land = () => {
      if (!nx) return;
      const { h, box } = nx;
      const hdr = parseFloat(getComputedStyle(html).getPropertyValue('--hdr')) || 72;
      const y = Math.max(st.end + 2, h.getBoundingClientRect().top + scrollY - hdr - 16);
      scrollToY(y, env, true, () => requestAnimationFrame(() => {
        if (focusIn(h)) return;
        // Respaldo: inicio de la sección siguiente y su primer titular (o la sección).
        scrollToY(Math.max(st.end + 2, box.getBoundingClientRect().top + scrollY), env, true, () => requestAnimationFrame(() => {
          if (!focusIn(h)) focusIn(box);
        }));
      }));
    };
    scrollToY(st.end + 2, env, true, land);
  };
  a.addEventListener('click', onClick);
  return () => { a.removeEventListener('click', onClick); el.classList.remove('is-pin-ready'); };
}

/** Modo sala (encabezado, KainPill y barra móvil ocultos) mientras una secuencia está fijada. */
export function sala(on: boolean) {
  if (on) html.setAttribute('data-sala', '');
  else html.removeAttribute('data-sala');
  document.dispatchEvent(new CustomEvent('cine:sala', { detail: { on } }));
}
