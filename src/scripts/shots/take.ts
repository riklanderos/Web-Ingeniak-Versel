// src/scripts/shots/take.ts — SharedTake (§3.12): la portada queda sticky detrás de la sección siguiente y su placa cambia a
// la copia desenfocada horneada con --rack 0 → 1 y velo hasta .7 (scrub, siguiente sección top 85% → top 25%).
// El texto de la portada tiene su propio scrub: se apaga del todo (opacidad 0, no .2) desde que el primer titular de la
// sección siguiente asoma por abajo hasta que llega a 24 px del final del texto de la portada: nunca hay texto sobre texto.
// La UI registrada (anclas) no se desplaza: conserva la transformación de la placa y solo se apaga con el rack.
// Con el texto por debajo de .5: .is__copy queda `inert` + data-primary-hidden y se emite "cine:primary-change" (la regla
// de un azul pasa el CTA al encabezado). Todo se deshace al volver.
import type { Env } from './_util';

export default function take(el: HTMLElement, env: Env) {
  const { gsap, ScrollTrigger } = env;
  const hero = el.querySelector<HTMLElement>(':scope > .is[data-take]');
  if (!hero) return;
  const ro = new ResizeObserver(() => el.style.setProperty('--take-h', `${hero.offsetHeight}px`));
  ro.observe(hero);
  const cleanups: (() => void)[] = [() => ro.disconnect()];
  const off = () => cleanups.forEach((f) => f());
  if (!env.motion || !env.desk) return off;
  const next = [...el.children].find((c) => c !== hero && !c.classList.contains('take__still')) as HTMLElement | undefined;
  if (!next) return off;

  // Rack focus de la placa + UI registrada (se apaga con el rack, sin moverse).
  const anchorsL = hero.querySelector<HTMLElement>(':scope > .is__stagebox > .is__layer--anchors');
  const rack = gsap.timeline({ scrollTrigger: { trigger: next, start: 'top 85%', end: 'top 25%', scrub: true } });
  rack.fromTo(hero, { '--rack': 0, '--rackveil': 0 }, { '--rack': 1, '--rackveil': 0.7, ease: 'none', immediateRender: false }, 0);
  if (anchorsL) rack.fromTo(anchorsL, { opacity: 1 }, { opacity: 0, ease: 'none', duration: 0.35, immediateRender: false }, 0);

  // Texto de la portada: scrub propio hasta que el titular entrante alcanza su borde inferior − 24 px.
  const copy = hero.querySelector<HTMLElement>(':scope > .is__copy');
  const fade = [copy, hero.querySelector(':scope > .is__hud'), hero.querySelector(':scope > .is__more')].filter(Boolean) as HTMLElement[];
  const lead = next.querySelector<HTMLElement>('.eyebrow, .t-label, h2') ?? next;
  if (!copy || !fade.length) return off;
  const docTop = (e: HTMLElement) => { let y = 0; for (let n: HTMLElement | null = e; n; n = n.offsetParent as HTMLElement | null) y += n.offsetTop; return y; };
  // Distancia del borde superior de la portada (sticky en top 0) al final de su texto, sin transformaciones.
  const copyBottom = () => {
    const kids = [...copy.querySelectorAll<HTMLElement>(':scope > .is__text > *, :scope > .is__aside > *')].filter((k) => k.offsetParent);
    const b = kids.reduce((m, k) => Math.max(m, docTop(k) + k.offsetHeight), docTop(copy) + copy.offsetHeight * 0);
    return b - docTop(hero);
  };
  let hidden = false;
  const setHidden = (h: boolean) => {
    if (h === hidden) return;
    hidden = h;
    if (h) { copy.setAttribute('inert', ''); copy.setAttribute('data-primary-hidden', ''); }
    else { copy.removeAttribute('inert'); copy.removeAttribute('data-primary-hidden'); }
    document.dispatchEvent(new CustomEvent('cine:primary-change', { detail: { hidden: h, section: hero.id } }));
  };
  const words = gsap.timeline({
    scrollTrigger: {
      trigger: lead, start: 'top bottom',
      end: () => `+=${Math.max(40, innerHeight - (copyBottom() - 24))}`,
      scrub: true,
      onUpdate: (s) => {
        hero.classList.toggle('is-copy-moving', s.progress > 0.001);
        setHidden(1 - s.progress < 0.5);
      },
      onLeaveBack: () => { hero.classList.remove('is-copy-moving'); setHidden(false); },
    },
  });
  words.fromTo(fade, { y: 0, opacity: 1 }, { y: -60, opacity: 0, ease: 'none', immediateRender: false }, 0);
  cleanups.push(() => {
    setHidden(false);
    hero.classList.remove('is-copy-moving');
    ScrollTrigger.getAll().forEach((t) => { if (t.trigger === lead || t.trigger === next) t.kill(); });
  });
  return off;
}
