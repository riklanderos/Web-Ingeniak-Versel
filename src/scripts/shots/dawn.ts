// src/scripts/shots/dawn.ts — Dawn (§7.4): todo lo de ImageSection + amanecer con scrub: el arco de horizonte sube 40 px y
// enciende su filo, el velo .55 → 0, el haz se abre (scaleX .15 → 1) al 60 % y el botón primario hace su recorrido de luz
// UNA vez (top 40 %). Movimiento reducido: estado final (CSS).
import scene from './scene';
import type { Env } from './_util';

export default function dawn(el: HTMLElement, env: Env) {
  const off = scene(el, env);
  if (!env.motion) return off;
  const { gsap, ScrollTrigger } = env;
  gsap.timeline({ scrollTrigger: { trigger: el, start: 'top bottom', end: 'center 55%', scrub: true } })
    .fromTo(el, { '--hy': '40px', '--edge': 0, '--dveil': 0.55 }, { '--hy': '0px', '--edge': 1, '--dveil': 0, ease: 'none' });
  gsap.set(el, { '--bs': 0.15 });
  const primary = el.querySelector<HTMLElement>('[data-primary]');
  ScrollTrigger.create({
    trigger: el, start: 'top 40%', once: true,
    onEnter: () => {
      gsap.to(el, { '--bs': 1, duration: 1.6, ease: 'expo.out' });
      if (primary) gsap.delayedCall(0.5, () => { primary.classList.remove('is-traced'); void primary.offsetWidth; primary.classList.add('is-traced'); });
    },
  });
  return off;
}
