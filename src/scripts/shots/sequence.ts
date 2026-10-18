// src/scripts/shots/sequence.ts — PlateSequence (§7.4): secuencia fijada VERTICAL, solo escritorio (condición pin).
// runtime (+280 %): 5 placas; cambio de estación = barrido de luz 0.8 s + Flip de la tarjeta de lead (fuera del scrub,
//   disparado por onUpdate al cambiar de paso); riel con scrub; snap a las 5 etiquetas.
// phases (+250 %): una placa; --cam y su origen viajan de escalon-1 a escalon-5 con scrub; la letra pasa de contorno a sólido.
// Sin pin: escenas apiladas con revelado de bloques; en móvil la píldora "Lead nuevo · etapa n/5" avanza con el scroll.
import { Flip } from 'gsap/Flip';
import { blockReveal, sala, wireSkip, type Env } from './_util';

export default function sequence(el: HTMLElement, env: Env) {
  const { gsap, ScrollTrigger } = env;
  if (!env.motion) return;
  gsap.registerPlugin(Flip);
  const preset = el.dataset.preset as 'runtime' | 'phases';
  const steps = [...el.querySelectorAll<HTMLElement>('.seq__step')];
  const N = steps.length;
  if (!N) return;
  const data: { title: string; ox: number; oy: number; cam: number }[] = JSON.parse(el.querySelector('[data-seq-data]')?.textContent || '[]');
  const nodes = [...el.querySelectorAll<HTMLElement>('.seq__rail-node')];
  const card = el.querySelector<HTMLElement>('[data-lead]');
  const slots = [...el.querySelectorAll<HTMLElement>('[data-lead-slot]')];
  const leadN = el.querySelector<HTMLElement>('[data-lead-n]');
  const leadStage = el.querySelector<HTMLElement>('[data-lead-stage]');
  const pill = el.querySelector<HTMLElement>('.seq__pill');
  const pillN = el.querySelector<HTMLElement>('[data-pill-n]');
  const lights = [...el.querySelectorAll<HTMLElement>('[data-light]')];
  const letters = [...el.querySelectorAll<HTMLElement>('.seq__ghost .ghost__l')];
  const bodies = steps.map((s) => s.querySelector<HTMLElement>('.seq__body')!).filter(Boolean);

  if (!env.pin) {
    // Apiladas: cada estación entra como un bloque; móvil: píldora de etapa.
    bodies.forEach((b) => blockReveal(b, env, { start: 'top 82%' }));
    if (preset === 'runtime' && pill) {
      ScrollTrigger.create({ trigger: el.querySelector('.seq__steps'), start: 'top 70%', end: 'bottom 40%', onToggle: (s) => gsap.to(pill, { '--pill': s.isActive ? 1 : 0, duration: 0.3 }) });
      steps.forEach((s, i) => ScrollTrigger.create({ trigger: s, start: 'top 55%', end: 'bottom 55%', onToggle: (st) => { if (st.isActive && pillN) pillN.textContent = String(i + 1); } }));
    }
    return;
  }

  // ── Pin (escritorio) ──
  el.classList.add('seq--pinned');
  const layers = preset === 'runtime' ? steps.map((s) => s.querySelector<HTMLElement>(':scope > .is__stagebox > .is__layer--media')!) : [];
  const copies = steps.map((s) => s.querySelector<HTMLElement>('.seq__copyf')!);
  const SHOW = 'inset(0% 0% 0% 0%)', HIDE = 'inset(0% 0% 0% 100%)', HIDE_L = 'inset(0% 100% 0% 0%)';
  let cur = 0;
  steps.forEach((s, i) => s.classList.toggle('is-active', i === 0));
  copies.forEach((c, i) => gsap.set(c, { autoAlpha: i === 0 ? 1 : 0 }));
  layers.forEach((L, i) => gsap.set(L, { clipPath: i === 0 ? SHOW : HIDE }));
  nodes.forEach((n, i) => n.classList.toggle('is-on', i === 0));
  if (lights.length) gsap.set(lights, { '--on': (i: number) => (i === 0 ? 1 : 0.22) });
  if (letters.length) gsap.set(letters, { '--fill': (i: number) => (i === 0 ? 1 : 0) });
  gsap.set(el, { '--p': 0, '--so': 0 });

  // Decodifica las placas antes de medir el pin (§7.1)
  const imgs = [...el.querySelectorAll<HTMLImageElement>('.is__layer--media img')];
  imgs.forEach((im) => { im.loading = 'eager'; });
  Promise.all(imgs.map((im) => im.decode?.().catch(() => {}))).then(() => ScrollTrigger.refresh());

  const go = (i: number) => {
    if (i === cur) return;
    const prev = cur; cur = i;
    const fwd = i > prev;
    steps.forEach((s, k) => s.classList.toggle('is-active', k === i));
    nodes.forEach((n, k) => n.classList.toggle('is-on', k <= i));
    copies.forEach((c, k) => { if (k !== i && k !== prev) { gsap.killTweensOf(c); gsap.set(c, { autoAlpha: 0 }); } });
    gsap.to(copies[prev], { autoAlpha: 0, y: fwd ? -14 : 14, duration: 0.25, ease: 'power2.in', overwrite: true });
    gsap.fromTo(copies[i], { autoAlpha: 0, y: fwd ? 18 : -18 }, { autoAlpha: 1, y: 0, duration: 0.6, delay: 0.12, ease: 'expo.out', overwrite: true });
    if (preset === 'runtime') {
      layers.forEach((L, k) => { if (k !== i && k !== prev) gsap.set(L, { clipPath: k < i ? SHOW : HIDE }); });
      if (fwd) {
        gsap.set(layers[prev], { clipPath: SHOW });
        gsap.fromTo(layers[i], { clipPath: HIDE }, { clipPath: SHOW, duration: 0.8, ease: 'power3.inOut', overwrite: true });
      } else {
        gsap.set(layers[i], { clipPath: SHOW });
        gsap.fromTo(layers[prev], { clipPath: SHOW }, { clipPath: HIDE_L, duration: 0.8, ease: 'power3.inOut', overwrite: true,
          onComplete: () => gsap.set(layers[prev], { clipPath: HIDE }) });
      }
      gsap.timeline({ overwrite: true })
        .fromTo(el, { '--sx': fwd ? '100%' : '0%', '--so': 1 }, { '--sx': fwd ? '0%' : '100%', duration: 0.8, ease: 'power3.inOut' })
        .to(el, { '--so': 0, duration: 0.3 }, '-=.15');
      if (card && slots[i]) {
        const state = Flip.getState(card);
        slots[i].appendChild(card);
        Flip.from(state, { duration: 0.8, ease: 'power3.inOut', absolute: true });
      }
      if (leadN) leadN.textContent = String(i + 1);
      if (leadStage) leadStage.textContent = data[i]?.title ?? '';
    } else {
      lights.forEach((l, k) => gsap.to(l, { '--on': k === i ? 1 : 0.22, duration: 0.5 }));
      letters.forEach((l, k) => gsap.to(l, { '--fill': k <= i ? 1 : 0, duration: 0.6 }));
    }
  };

  const tl = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: {
      trigger: el, start: 'top top', end: el.dataset.pin || (preset === 'runtime' ? '+=280%' : '+=250%'),
      pin: true, scrub: true, anticipatePin: 1,
      snap: { snapTo: (v: number) => Math.round(v * (N - 1)) / (N - 1), duration: { min: 0.2, max: 0.6 }, ease: 'power1.inOut', delay: 0.08 },
      onUpdate: (s) => go(Math.min(N - 1, Math.max(0, Math.round(s.progress * (N - 1))))),
      onToggle: (s) => { el.classList.toggle('is-pinned', s.isActive); sala(s.isActive); },
    },
  });
  tl.fromTo(el, { '--p': 0 }, { '--p': 1, duration: 1 }, 0);
  if (preset === 'phases') {
    const cams = [...el.querySelectorAll<HTMLElement>('.seq__stagebox > .is__layer')];
    for (let i = 1; i < N; i++) {
      const d = data[i];
      if (d) tl.to(cams, { '--cam': d.cam, '--ox': d.ox, '--oy': d.oy, duration: 1 / (N - 1), ease: 'power1.inOut' }, (i - 1) / (N - 1));
    }
  }
  const unskip = wireSkip(el, env, tl.scrollTrigger ?? null);
  return () => { unskip(); sala(false); el.classList.remove('seq--pinned', 'is-pinned'); steps.forEach((s) => s.classList.remove('is-active')); };
}
