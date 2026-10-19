// src/scripts/shots/figure.ts — CaseFigure (§5.4.1, §7.4). Escritorio: fijada +100 % con scrub y "Saltar escena"; móvil/táctil: al entrar.
// Movimiento reducido: estado final (ya está en el HTML: 8:00 / 0:12, barras llenas). Solo se anima lo que deriva de la
// cifra confirmada. El estado inicial (relojes en 0:00, barras en 0) se pinta ANTES de construir la línea de tiempo: al
// llegar a la escena fijada nunca se ve el final y luego un salto a cero.
import { sala, wireSkip, type Env } from './_util';

const clock = (s: number) => `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, '0')}`;

export default function figure(el: HTMLElement, env: Env) {
  if (!env.motion) return;
  const { gsap, ScrollTrigger } = env;
  const v = el.dataset.variant;
  const restore: (() => void)[] = [];
  const tl = gsap.timeline({ paused: true, defaults: { ease: 'none' } });

  if (v === 'stopwatch') {
    const rows = [...el.querySelectorAll<HTMLElement>('.cf-sw__row')];
    const [before, after] = rows;
    const cb = before?.querySelector<HTMLElement>('[data-clock-to]');
    const ca = after?.querySelector<HTMLElement>('[data-clock-to]');
    const bb = before?.querySelector<HTMLElement>('.cf-sw__bar i');
    const ba = after?.querySelector<HTMLElement>('.cf-sw__bar i');
    const tb = Number(cb?.dataset.clockTo || 0), ta = Number(ca?.dataset.clockTo || 0);
    const ob = { s: 0 }, oa = { s: 0 };
    const ratio = Number(getComputedStyle(el.querySelector('.cf-sw')!).getPropertyValue('--ratio')) || ta / tb;
    // Estado inicial pintado ya (0:00 y barras vacías)
    if (cb) cb.textContent = clock(0);
    if (ca) ca.textContent = clock(0);
    gsap.set([bb, ba].filter(Boolean), { '--f': 0 });
    restore.push(() => { if (cb) cb.textContent = clock(tb); if (ca) ca.textContent = clock(ta); gsap.set([bb, ba].filter(Boolean), { clearProps: '--f' }); });
    tl.to(oa, { s: ta, duration: 0.18, onUpdate: () => { if (ca) ca.textContent = clock(oa.s); } }, 0.05)
      .fromTo(ba!, { '--f': 0 }, { '--f': ratio, duration: 0.18, immediateRender: false }, 0.05)
      .to(ob, { s: tb, duration: 0.9, onUpdate: () => { if (cb) cb.textContent = clock(ob.s); } }, 0.05)
      .fromTo(bb!, { '--f': 0 }, { '--f': 1, duration: 0.9, immediateRender: false }, 0.05);
  } else if (v === 'index-up' || v === 'index-down') {
    const bars = [...el.querySelectorAll<HTMLElement>('.cf-ix__bar')];
    const num = el.querySelector<HTMLElement>('[data-count-to]');
    const to = Number(num?.dataset.countTo || 0);
    const o = { n: 100 };
    bars.forEach((b) => b.style.setProperty('--h', b.dataset.h || '1'));
    if (num) num.textContent = '100';
    gsap.set(bars[0], { '--g': 0 });
    gsap.set(bars[1], { '--g': 0 });
    restore.push(() => { if (num) num.textContent = String(to); gsap.set(bars, { clearProps: '--g' }); });
    tl.fromTo(bars[0], { '--g': 0 }, { '--g': 1, duration: 0.3, ease: 'power2.out', immediateRender: false }, 0)
      .fromTo(bars[1], { '--g': 100 / Math.max(100, to) / Number(bars[1].dataset.h || 1) }, { '--g': 1, duration: 0.7, ease: 'power2.inOut', immediateRender: false }, 0.3)
      .to(o, { n: to, duration: 0.7, ease: 'power2.inOut', onUpdate: () => { if (num) num.textContent = String(Math.round(o.n)); } }, 0.3);
  } else if (v === 'multiplier') {
    const cols = [...el.querySelectorAll<HTMLElement>('.cf-mx__col')];
    gsap.set(cols, { '--g': 0 });
    restore.push(() => gsap.set(cols, { clearProps: '--g' }));
    tl.fromTo(cols, { '--g': 0 }, { '--g': 1, duration: 0.6, stagger: 0.12, ease: 'power3.out', immediateRender: false }, 0);
  } else if (v === 'nodes') {
    const ns = [...el.querySelectorAll<HTMLElement>('.cf-nd__n')];
    const ws = [...el.querySelectorAll<SVGPathElement>('.cf-nd__wires path')];
    gsap.set(ns, { '--on': 0 }); gsap.set(ws, { '--draw': 1 });
    restore.push(() => { gsap.set(ns, { clearProps: '--on' }); gsap.set(ws, { clearProps: '--draw' }); });
    tl.fromTo(ns, { '--on': 0 }, { '--on': 1, duration: 0.2, stagger: 0.03, ease: 'power2.out', immediateRender: false }, 0)
      .fromTo(ws, { '--draw': 1 }, { '--draw': 0, duration: 0.2, stagger: 0.03, immediateRender: false }, 0.06);
  }
  const done = () => restore.forEach((f) => f());

  if (env.pin && el.dataset.pin) {
    tl.paused(false);
    const master = gsap.timeline({
      scrollTrigger: {
        trigger: el, start: 'top top', end: el.dataset.pin, pin: true, scrub: 0.6, anticipatePin: 0,
        onToggle: (s) => { el.classList.toggle('is-pinned', s.isActive); sala(s.isActive); },
      },
    });
    master.add(tl, 0).to({}, { duration: 0.25 });
    // "Saltar escena" (F5, §10): visible solo mientras está fijada; salta al final del pin y enfoca el titular siguiente.
    const unskip = wireSkip(el, env, master.scrollTrigger ?? null);
    return () => { unskip(); el.classList.remove('is-pinned'); sala(false); done(); };
  }
  ScrollTrigger.create({ trigger: el.querySelector('.cf__stage') ?? el, start: 'top 70%', once: true, onEnter: () => gsap.to(tl, { progress: 1, duration: 2.2, ease: 'power1.inOut' }) });
  return done;
}
