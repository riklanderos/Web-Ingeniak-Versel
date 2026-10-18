// src/scripts/shots/figure.ts — CaseFigure (§5.4.1, §7.4). Escritorio: fijada +100 % con scrub; móvil/táctil: al entrar.
// Movimiento reducido: estado final (ya está en el HTML). Solo se anima lo que deriva de la cifra confirmada.
import { sala, type Env } from './_util';

const clock = (s: number) => `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, '0')}`;

export default function figure(el: HTMLElement, env: Env) {
  if (!env.motion) return;
  const { gsap, ScrollTrigger } = env;
  const v = el.dataset.variant;
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
    gsap.set([bb, ba], { '--f': 0 });
    tl.to(oa, { s: ta, duration: 0.18, onUpdate: () => { if (ca) ca.textContent = clock(oa.s); } }, 0.05)
      .to(ba!, { '--f': ratio, duration: 0.18 }, 0.05)
      .to(ob, { s: tb, duration: 0.9, onUpdate: () => { if (cb) cb.textContent = clock(ob.s); } }, 0.05)
      .to(bb!, { '--f': 1, duration: 0.9 }, 0.05);
  } else if (v === 'index-up' || v === 'index-down') {
    const bars = [...el.querySelectorAll<HTMLElement>('.cf-ix__bar')];
    const num = el.querySelector<HTMLElement>('[data-count-to]');
    const to = Number(num?.dataset.countTo || 0);
    const o = { n: 100 };
    bars.forEach((b) => b.style.setProperty('--h', b.dataset.h || '1'));
    tl.fromTo(bars[0], { '--g': 0 }, { '--g': 1, duration: 0.3, ease: 'power2.out' }, 0)
      .fromTo(bars[1], { '--g': 100 / Math.max(100, to) / Number(bars[1].dataset.h || 1) }, { '--g': 1, duration: 0.7, ease: 'power2.inOut' }, 0.3)
      .to(o, { n: to, duration: 0.7, ease: 'power2.inOut', onUpdate: () => { if (num) num.textContent = String(Math.round(o.n)); } }, 0.3);
    gsap.set(bars[1], { '--g': 0 });
    if (num) num.textContent = '100';
  } else if (v === 'multiplier') {
    const cols = [...el.querySelectorAll<HTMLElement>('.cf-mx__col')];
    tl.fromTo(cols, { '--g': 0 }, { '--g': 1, duration: 0.6, stagger: 0.12, ease: 'power3.out' }, 0);
  } else if (v === 'nodes') {
    const ns = [...el.querySelectorAll<HTMLElement>('.cf-nd__n')];
    const ws = [...el.querySelectorAll<SVGPathElement>('.cf-nd__wires path')];
    tl.fromTo(ns, { '--on': 0 }, { '--on': 1, duration: 0.2, stagger: 0.03, ease: 'power2.out' }, 0)
      .fromTo(ws, { '--draw': 1 }, { '--draw': 0, duration: 0.2, stagger: 0.03 }, 0.06);
  }
  tl.progress(0);

  if (env.pin && el.dataset.pin) {
    tl.paused(false);
    const master = gsap.timeline({
      scrollTrigger: {
        trigger: el, start: 'top top', end: el.dataset.pin, pin: true, scrub: 0.6, anticipatePin: 1,
        onToggle: (s) => sala(s.isActive),
      },
    });
    master.add(tl, 0).to({}, { duration: 0.25 });
    return () => sala(false);
  }
  ScrollTrigger.create({ trigger: el.querySelector('.cf__stage') ?? el, start: 'top 70%', once: true, onEnter: () => gsap.to(tl, { progress: 1, duration: 2.2, ease: 'power1.inOut' }) });
}
