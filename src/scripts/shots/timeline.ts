// src/scripts/shots/timeline.ts — DayTimeline (§7.4): la aguja (el pilar) baja con scrub; cada hora se enciende y su par
// cian se dibuja (--mix); el aura vira de ámbar a cian por tramo. Sin pin. Movimiento reducido: todo visible.
import type { Env } from './_util';

export default function timeline(el: HTMLElement, env: Env) {
  if (!env.motion) return;
  const { gsap, ScrollTrigger } = env;
  const track = el.querySelector<HTMLElement>('.dt__track');
  const rows = [...el.querySelectorAll<HTMLElement>('[data-dt-row]')];
  if (!track) return;
  el.classList.add('is-anim');
  gsap.set(el, { '--needle': 0, '--amb': 1, '--cya': 0 });
  gsap.set(rows, { '--mix': 0, '--lit': 0.35 });
  gsap.to(el, { '--needle': 1, ease: 'none', scrollTrigger: { trigger: track, start: 'top 62%', end: 'bottom 62%', scrub: true } });
  rows.forEach((r) => {
    ScrollTrigger.create({
      trigger: r, start: 'top 62%', once: true,
      onEnter: () => {
        r.classList.add('is-lit');
        gsap.timeline()
          .to(r, { '--lit': 1, duration: 0.4, ease: 'power2.out' })
          .to(r, { '--mix': 1, duration: 0.9, ease: 'power3.inOut' }, 0.2)
          .to(el, { '--amb': 0.25, '--cya': 1, duration: 0.9 }, 0.2)
          .to(el, { '--amb': 0.7, '--cya': 0.3, duration: 0.6 }, 1.4);
      },
    });
  });
  return () => el.classList.remove('is-anim');
}
