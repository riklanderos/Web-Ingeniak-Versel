// src/scripts/cine.ts — sistema de movimiento del área "cine" (ESPEC-v2 §7). Un módulo por documento (MPA, sin ClientRouter).
// · Lenis 1.3.11 solo con movimiento y puntero fino (import() diferido, §7.8); conectado a gsap.ticker y expuesto en
//   window.__lenis (nav hace stop()/start()). SplitText también se carga solo con movimiento y si hay titulares que dividir.
// · gsap.matchMedia con las condiciones de §7.2 (motion · desk · pin); todo lo animado vive en ese contexto y se revierte
//   solo (cambio de tamaño, html[data-motion="reduced"] en vivo).
// · Carga con import() SOLO los módulos de escena que la página usa ([data-shot] → src/scripts/shots/<shot>.ts).
// · Revelados genéricos: [data-split] (SplitText por líneas con máscara) y [data-reveal] (bloque; ="stagger" para sus hijos).
// · Accesibilidad (R11): si el foco entra en algo que espera su entrada, se termina al instante (focusin en captura).
// · Documento que no anima (sin requestAnimationFrame: pestaña de fondo al volver, renderizador con tiempo virtual):
//   a los 2.2 s se termina todo lo que está en pantalla; nada queda oculto detrás de una animación.
// · ResizeObserver sobre <main>: cualquier cambio de alto (FAQ que se pliega o se abre, fuentes, imágenes) recalcula los
//   ScrollTrigger con rebote de 220 ms.
// · Presupuesto de JS (§7.8): gsap y ScrollTrigger también llegan con import() (chunk compartido con ui.ts), así el
//   punto de entrada de BaseLayout solo lleva el núcleo propio. Mientras cargan, el CSS ya pinta el estado final de la
//   portada (priority) y los revelados tienen su red de seguridad (cine-safe, 2.6 s).
// Eventos que emite: "cine:coldopen-end" (document) · "cine:intro" / "cine:iris" (sección de portada) · "cine:sala" ·
// "cine:primary-change" (document) · "cine:step" (ChatSim de una escena fijada) · html[data-sala] durante un pin.
import type gsapNS from 'gsap';
import type { ScrollTrigger as STNS } from 'gsap/ScrollTrigger';
import type { SplitText as SPT } from 'gsap/SplitText';
import type Lenis from 'lenis';
import { reveals, finishAround, finishInView, clearPending, type Env, type Shot } from './shots/_util';

declare global {
  interface Window { __lenis?: Lenis; __cineInit?: boolean; __cine?: { refresh: () => void; restart: () => void } }
}

const loaders = import.meta.glob<{ default: Shot }>(['./shots/*.ts', '!./shots/_*.ts']);
const html = document.documentElement;
let mods = new Map<string, Shot>();
let mm: gsap.MatchMedia | null = null;
let SplitTextCls: typeof SPT | null = null;
let LenisCls: typeof Lenis | null = null;
let gsap: typeof gsapNS;
let ScrollTrigger: typeof STNS;

/** gsap + ScrollTrigger diferidos (fuera del punto de entrada). */
async function loadCore() {
  const [g, st] = await Promise.all([import('gsap'), import('gsap/ScrollTrigger')]);
  gsap = ((g as any).gsap ?? g.default) as typeof gsapNS;
  ScrollTrigger = st.ScrollTrigger;
  gsap.registerPlugin(ScrollTrigger);
  gsap.defaults({ ease: 'expo.out', duration: 0.9 });
  ScrollTrigger.config({ ignoreMobileResize: true });
}

const motionNow = () => !matchMedia('(prefers-reduced-motion: reduce)').matches && html.dataset.motion !== 'reduced';
const finePointer = () => matchMedia('(hover: hover) and (pointer: fine)').matches;
const needSplit = () => !!document.querySelector('[data-split],[data-words],[data-shot="scene"],[data-shot="dawn"]');

/** Librerías que solo hacen falta con movimiento (presupuesto de JS, §7.8). */
async function ensureLibs() {
  if (!motionNow()) return;
  const jobs: Promise<unknown>[] = [];
  if (!SplitTextCls && needSplit()) {
    jobs.push(import('gsap/SplitText').then((m) => { SplitTextCls = m.SplitText; gsap.registerPlugin(m.SplitText); }).catch(() => {}));
  }
  if (!LenisCls && finePointer()) jobs.push(import('lenis').then((m) => { LenisCls = m.default; }).catch(() => {}));
  await Promise.all(jobs);
}

export function initCine(): void {
  if (window.__cineInit) return;
  window.__cineInit = true;
  labelSections();

  // R11: el foco nunca cae en algo invisible (bloque, titular o escena que aún no entra).
  document.addEventListener('focusin', (e) => finishAround(e.target as Element), true);
  // gsap y los módulos de escena se piden en paralelo. Si gsap no llega, nada queda oculto (todo a su estado final).
  const names = [...new Set([...document.querySelectorAll<HTMLElement>('[data-shot]')].map((e) => e.dataset.shot!))];
  const shots = Promise.all(names.map(async (n) => {
    const load = loaders[`./shots/${n}.ts`];
    if (!load) { console.warn(`[cine] no existe el módulo de escena "${n}"`); return null; }
    try { return [n, (await load()).default] as const; } catch (e) { console.warn(`[cine] falló "${n}"`, e); return null; }
  }));
  loadCore().then(() => boot(shots), (e) => {
    console.warn('[cine] no cargó gsap', e);
    document.querySelectorAll('[data-split],[data-reveal]').forEach((n) => n.classList.add('is-revealed'));
    html.classList.remove('co', 'enc');
  });
}

function boot(shots: Promise<(readonly [string, Shot] | null)[]>) {
  // R11: ScrollTrigger.refresh() saca y vuelve a meter los elementos fijados (pin-spacer): el foco que estaba dentro se
  // perdería (caería en <body>). Se guarda antes y se devuelve después, sin desplazar la página.
  let focused: Element | null = null;
  ScrollTrigger.addEventListener('refreshInit', () => { focused = document.activeElement; });
  ScrollTrigger.addEventListener('refresh', () => {
    const f = focused; focused = null;
    if (f instanceof HTMLElement && f !== document.body && f.isConnected && document.activeElement !== f) f.focus({ preventScroll: true });
  });

  Promise.all([ensureLibs(), shots]).then(([, list]) => {
    mods = new Map(list.filter(Boolean) as [string, Shot][]);
    start();
    // Interruptor "Reducir movimiento" (footer): se reconstruye todo en vivo.
    new MutationObserver(() => { ensureLibs().then(start); }).observe(html, { attributes: true, attributeFilter: ['data-motion'] });
    window.__cine = { refresh: () => ScrollTrigger.refresh(), restart: start };
    if (import.meta.env.DEV) (window as any).__ST = ScrollTrigger;
    watchLayout();
    if (/[?&]anchors=1\b/.test(location.search)) anchorsOverlay();
    if (motionNow()) armWatchdog();
    if (import.meta.env.DEV) devChecks();
  });
}

function start() {
  mm?.revert();
  clearPending();
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
      if (motion && LenisCls && finePointer()) {
        // Con Lenis, ScrollTrigger se actualiza en el mismo cuadro que el scroll: las secuencias se fijan con transform
        // (sin el cambio static → fixed, que Chrome mide como un salto de layout de ~1.0 CLS por pin y daba un tirón).
        ScrollTrigger.defaults({ pinType: 'transform' });
        lenis = new LenisCls({ lerp: 0.1, smoothWheel: true, syncTouch: false, autoRaf: false });
        lenis.on('scroll', ScrollTrigger.update);
        raf = (t: number) => lenis!.raf(t * 1000);
        gsap.ticker.add(raf);
        gsap.ticker.lagSmoothing(0);
        window.__lenis = lenis;
      }
      html.classList.toggle('cine-motion', motion);
      const env: Env = {
        motion, desk: !!c.desk, pin: motion && !!c.pin, gsap, ScrollTrigger, SplitText: motion ? SplitTextCls : null, lenis, ctx,
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
      if (document.readyState === 'complete') requestAnimationFrame(refresh);
      else addEventListener('load', refresh, { once: true });
      return () => {
        cleanups.forEach((f) => { try { f(); } catch {} });
        clearPending();
        if (raf) gsap.ticker.remove(raf);
        if (lenis) ScrollTrigger.defaults({ pinType: 'fixed' });
        lenis?.destroy();
        if (window.__lenis === lenis) window.__lenis = undefined;
        html.removeAttribute('data-sala');
      };
    },
  );
}

/** Cambios de alto del contenido (FAQ, fuentes, imágenes sin medidas) → ScrollTrigger.refresh() con rebote de 220 ms. */
function watchLayout() {
  const main = document.querySelector('main') ?? document.body;
  if (!('ResizeObserver' in window)) return;
  let last = main.offsetHeight;
  let t = 0;
  new ResizeObserver(() => {
    const h = main.offsetHeight;
    if (Math.abs(h - last) < 2) return;
    clearTimeout(t);
    t = window.setTimeout(() => {
      ScrollTrigger.refresh();
      last = main.offsetHeight;
    }, 220);
  }).observe(main);
}

/** Si el documento no recibe cuadros (sin rAF), nada se queda esperando una animación que no llegará. */
function armWatchdog() {
  const f0 = gsap.ticker.frame;
  window.setTimeout(() => {
    if (document.hidden) { document.addEventListener('visibilitychange', armWatchdog, { once: true }); return; }
    if (gsap.ticker.frame - f0 >= 8) return;
    html.classList.add('cine-static');
    finishInView();
    addEventListener('scroll', finishInView, { passive: true });
  }, 2200);
}

/** QA (?anchors=1): dibuja sobre cada placa sus anclas registradas (puntos y cajas, escritorio y vertical) en el mismo
 *  escenario que la placa, para comprobar el registro a cualquier tamaño. */
function anchorsOverlay() {
  for (const sec of document.querySelectorAll<HTMLElement>('[style*="--A-"]')) {
    const stage = sec.querySelector<HTMLElement>('.is__layer--media .stage') ?? (sec.matches('.is__layer') ? sec.querySelector<HTMLElement>('.stage') : null);
    if (!stage || stage.querySelector('.qa-anchors')) continue;
    const css = sec.getAttribute('style') ?? '';
    const names = [...new Set([...css.matchAll(/--A-([\w-]+?)-x:/g)].map((m) => m[1]))];
    const layer = document.createElement('div');
    layer.className = 'qa-anchors';
    for (const n of names) {
      const box = css.includes(`--A-${n}-w:`);
      const mnull = !css.includes(`--A-${n}-xm:`);
      const el = document.createElement('span');
      el.className = `qa-a${box ? ' qa-a--box' : ''}${mnull ? ' qa-a--mnull' : ''}`;
      el.setAttribute('style', `--qx:var(--A-${n}-x);--qy:var(--A-${n}-y);--qw:var(--A-${n}-w,0);--qh:var(--A-${n}-h,0);` +
        `--qxm:var(--A-${n}-xm,var(--A-${n}-x));--qym:var(--A-${n}-ym,var(--A-${n}-y));--qwm:var(--A-${n}-wm,var(--A-${n}-w,0));--qhm:var(--A-${n}-hm,var(--A-${n}-h,0));`);
      el.dataset.n = n;
      layer.append(el);
    }
    stage.append(layer);
  }
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
  // §3.6 / R3: en móvil la cabeza del sujeto de la portada debe quedar en el primer 80 % de la pantalla.
  const check = () => {
    if (!matchMedia('(max-width: 767px), (max-aspect-ratio: 5/6)').matches) return;
    for (const hero of document.querySelectorAll<HTMLElement>('.is--hero')) {
      const layer = hero.querySelector<HTMLElement>('.is__layer--media');
      if (!layer) continue;
      const r = layer.getBoundingClientRect();
      const subj = parseFloat(getComputedStyle(hero).getPropertyValue('--subj-top-m')) || 0.45;
      const head = r.top + scrollY + r.height * subj;
      if (head > innerHeight * 0.8) {
        console.warn(`[cine] #${hero.id}: la cabeza del sujeto cae a ${Math.round(head)} px (${(head / innerHeight).toFixed(2)} de la pantalla; tope 0.8). Usa mobile="split" o acorta el intro.`);
      }
    }
  };
  (document.fonts?.ready ?? Promise.resolve()).then(() => setTimeout(check, 300));
}
