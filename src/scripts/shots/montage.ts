// src/scripts/shots/montage.ts — Montage (§7.4): filas con deriva xPercent ±6 en sentidos alternos (scrub, sin pin) y la
// imagen del caso se desplaza dentro de las letras (--px 20 % → 80 %). Movimiento reducido: estático.
import type { Env } from './_util';

export default function montage(el: HTMLElement, env: Env) {
  if (!env.motion) return;
  const { gsap } = env;
  const amp = env.desk ? 3 : 1.5;
  for (const row of el.querySelectorAll<HTMLElement>('[data-mt-row]')) {
    const dir = Number(row.dataset.dir || 1);
    const fig = row.querySelector<HTMLElement>('.mt__fig');
    const st = { trigger: row, start: 'top bottom', end: 'bottom top', scrub: true };
    gsap.fromTo(row, { xPercent: -dir * amp }, { xPercent: dir * amp, ease: 'none', scrollTrigger: st });
    if (fig) gsap.fromTo(fig, { '--px': '20%' }, { '--px': '80%', ease: 'none', scrollTrigger: { ...st } });
    const link = row.querySelector<HTMLElement>('.mt__link');
    if (link) gsap.from(link, { autoAlpha: 0, y: 30, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: row, start: 'top 90%', once: true } });
  }
}
