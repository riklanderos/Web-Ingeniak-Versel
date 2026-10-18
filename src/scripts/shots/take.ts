// src/scripts/shots/take.ts — SharedTake (§3.12): la portada queda sticky detrás de la sección siguiente y su placa cambia a
// la copia desenfocada horneada con --rack 0 → 1 y velo hasta .7 (scrub, siguiente sección top 85% → top 25%).
import type { Env } from './_util';

export default function take(el: HTMLElement, env: Env) {
  const { gsap } = env;
  const hero = el.querySelector<HTMLElement>(':scope > .is[data-take]');
  if (!hero) return;
  const ro = new ResizeObserver(() => el.style.setProperty('--take-h', `${hero.offsetHeight}px`));
  ro.observe(hero);
  const off = () => ro.disconnect();
  if (!env.motion || !env.desk) return off;
  const next = [...el.children].find((c) => c !== hero && !c.classList.contains('take__still')) as HTMLElement | undefined;
  if (!next) return off;
  const fade = [hero.querySelector(':scope > .is__copy'), hero.querySelector(':scope > .is__stagebox > .is__layer--anchors'),
    hero.querySelector(':scope > .is__hud'), hero.querySelector(':scope > .is__more')].filter(Boolean);
  const tl = gsap.timeline({ scrollTrigger: { trigger: next, start: 'top 85%', end: 'top 25%', scrub: true } });
  tl.fromTo(hero, { '--rack': 0, '--rackveil': 0 }, { '--rack': 1, '--rackveil': 0.7, ease: 'none' }, 0);
  tl.to(fade, { y: -60, autoAlpha: 0, ease: 'none', duration: 0.35 }, 0);
  return off;
}
