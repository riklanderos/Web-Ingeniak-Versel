// src/scripts/shots/dawn.ts — Dawn (§7.4): todo lo de ImageSection + amanecer con scrub: el filo del horizonte (registrado a
// la placa) sube 40 px y se enciende, el velo .55 → 0, el haz se abre (scaleX .15 → 1) al 60 % y el botón primario hace su
// recorrido de luz UNA vez (top 40 %). Movimiento reducido: estado final (CSS).
// Encuadre (con y sin movimiento, escritorio): la línea base de los CTAs nunca baja de y .66 de la placa (la franja
// .70–.87 es la del filo del horizonte). Si el texto de la página es largo, la escena crece (--is-h) hasta que cabe.
import scene from './scene';
import type { Env } from './_util';

// Línea base del primario ≤ .66 y su microcopia (bloque .cta-p / .ctas) ≤ .69 de la placa.
const LIMIT = 0.66, TARGET = 0.64, LIMIT_B = 0.69, TARGET_B = 0.675;

export default function dawn(el: HTMLElement, env: Env) {
  const off = scene(el, env);
  const { gsap, ScrollTrigger } = env;
  const primary = el.querySelector<HTMLElement>('[data-primary]');
  const stage = el.querySelector<HTMLElement>(':scope > .is__stagebox > .is__layer--media .stage');

  // ── Encuadre: CTAs por encima del horizonte (medido en layout, sin transformaciones de entrada ni de cámara) ──
  const layer = el.querySelector<HTMLElement>(':scope > .is__stagebox > .is__layer--media');
  const bottomOf = (e: HTMLElement) => { let y = e.offsetHeight; for (let n: HTMLElement | null = e; n && n !== el; n = n.offsetParent as HTMLElement | null) y += n.offsetTop; return y; };
  const block = primary?.closest<HTMLElement>('.cta-p') ?? primary?.closest<HTMLElement>('.ctas') ?? primary;
  const ctaBottom = () => bottomOf(primary!);
  const blockBottom = () => Math.max(bottomOf(block!), ...[...(block!.parentElement?.querySelectorAll<HTMLElement>(':scope > .btn-micro') ?? [])].map(bottomOf));
  const over = () => {
    const cs = getComputedStyle(el);
    const ar = parseFloat(cs.getPropertyValue('--ar-d')) || 1.78, fy = parseFloat(cs.getPropertyValue('--fy-d')) || 0.5;
    const H = el.offsetHeight, W = layer!.offsetWidth;
    const sh = Math.max(H, W / ar), top = (H - sh) * fy;
    return (ctaBottom() - top) / sh > LIMIT || (blockBottom() - top) / sh > LIMIT_B;
  };
  // Con movimiento reducido (tokens.css) TODA propiedad transita .01 ms: min-height no se aplicaba hasta el cuadro
  // siguiente, la medición leía el alto anterior y el ajuste se deshacía en cada refresh (a 1440 × 900 el primario del
  // cierre quedaba en y .79, sobre el filo). Mientras se mide, la sección no transita.
  const fit = () => {
    el.style.setProperty('transition-duration', '0s', 'important');
    try {
      el.style.removeProperty('--is-h');
      if (!primary || !layer || !env.desk || !stage) return;
      for (let k = 0; k < 4 && over(); k++) {
        const need = Math.ceil(Math.max(ctaBottom() / TARGET, blockBottom() / TARGET_B));
        el.style.setProperty('--is-h', `${Math.max(need, el.offsetHeight + 24)}px`);
      }
    } finally {
      el.style.removeProperty('transition-duration');
    }
  };
  fit();
  document.fonts?.ready.then(fit);
  ScrollTrigger.addEventListener('refreshInit', fit);
  const unfit = () => { ScrollTrigger.removeEventListener('refreshInit', fit); el.style.removeProperty('--is-h'); };

  if (!env.motion) return () => { unfit(); off?.(); };
  gsap.timeline({ scrollTrigger: { trigger: el, start: 'top bottom', end: 'center 55%', scrub: true } })
    .fromTo(el, { '--hy': '40px', '--edge': 0, '--dveil': 0.55 }, { '--hy': '0px', '--edge': 1, '--dveil': 0, ease: 'none' });
  gsap.set(el, { '--bs': 0.15 });
  ScrollTrigger.create({
    trigger: el, start: 'top 40%', once: true,
    onEnter: () => {
      gsap.to(el, { '--bs': 1, duration: 1.6, ease: 'expo.out' });
      if (primary) gsap.delayedCall(0.5, () => { primary.classList.remove('is-traced'); void primary.offsetWidth; primary.classList.add('is-traced'); });
    },
  });
  return () => { unfit(); off?.(); };
}
