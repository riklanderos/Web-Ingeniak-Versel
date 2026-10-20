// src/scripts/shots/sequence.ts — PlateSequence (§7.4): secuencia fijada VERTICAL, solo escritorio (condición pin).
// runtime (+280 %): 5 placas; cambio de estación = barrido de luz 0.8 s + Flip de la tarjeta de lead (fuera del scrub,
//   disparado por onUpdate al cambiar de paso); riel con scrub; snap a las 5 etiquetas.
// phases (+250 %): una placa; --cam y su origen viajan de escalon-1 a escalon-5 con scrub; la letra pasa de contorno a sólido.
// Sin pin: escenas apiladas con revelado de bloques; en móvil la píldora "Lead nuevo · etapa n/5" (sticky, CSS) muestra
// la etapa que cruza el centro de la pantalla.
// R11: las copias inactivas solo bajan su opacidad (siguen en el árbol de accesibilidad); si el foco entra en una, el
// scroll va a su estación y la copia aparece al instante. R9: las placas 2…5 se piden cuando la escena está cerca.
import { Flip } from 'gsap/Flip';
import { blockReveal, sala, scrollToY, wireSkip, type Env } from './_util';

/** Tope de --cam (§0.1-5) con origen (ox, oy) en la placa de `phases`, medido en su capa: la caja del sujeto escalada no
 *  pasa del 4 % superior ni sale abajo más que a cámara 1, deja 1.5 % a los lados y, en ultra ancho, no entra al fundido
 *  lateral (mismas cuentas que camLimit de scene.ts). */
function seqCamCap(sec: HTMLElement, layer: HTMLElement | null, ox: number, oy: number): number {
  const stage = layer?.querySelector<HTMLElement>(':scope > .stage');
  if (!layer || !stage) return 1.6;
  const cs = getComputedStyle(layer);
  const n = (p: string) => parseFloat(cs.getPropertyValue(p));
  const [x0, y0, x1, y1] = ['--sx0', '--sy0', '--sx1', '--sy1'].map(n);
  if ([x0, y0, x1, y1].some(Number.isNaN)) return 1.6;
  const lw = layer.clientWidth, lh = layer.clientHeight;
  const sw = stage.offsetWidth, sh = stage.offsetHeight, sl = stage.offsetLeft, st = stage.offsetTop;
  if (!lw || !lh || !sw || !sh) return 1.6;
  const px = sl + ox * sw, py = st + oy * sh;
  const e = { l: sl + x0 * sw, r: sl + x1 * sw, t: st + y0 * sh, b: st + y1 * sh };
  const ultra = innerWidth >= 1800;
  const side = sec.dataset.layout;
  const fL = side === 'subject-right' ? 0.28 : side === 'subject-left' ? 0 : 0.1;
  const fR = side === 'subject-left' ? 0.28 : side === 'subject-right' ? 0 : 0.1;
  const mL = ultra ? Math.max(0, Math.min(fL * lw, x0 * lw - 16)) : 0;
  const mR = ultra ? Math.max(0, Math.min(fR * lw, (1 - x1) * lw - 16)) : 0;
  const pad = 0.015 * lw;
  const lim = { l: mL + pad, r: lw - mR - pad, t: Math.min(e.t, 0.04 * lh), b: Math.max(e.b, lh) };
  let c = 1.6;
  if (e.r > px) c = Math.min(c, (lim.r - px) / (e.r - px));
  if (e.l < px) c = Math.min(c, (px - lim.l) / (px - e.l));
  if (e.b > py) c = Math.min(c, (lim.b - py) / (e.b - py));
  if (e.t < py) c = Math.min(c, (py - lim.t) / (py - e.t));
  return Math.max(1, Math.round(c * 1000) / 1000);
}

export default function sequence(el: HTMLElement, env: Env) {
  const { gsap, ScrollTrigger } = env;
  const preset = el.dataset.preset as 'runtime' | 'phases';
  const steps = [...el.querySelectorAll<HTMLElement>('.seq__step')];
  const N = steps.length;
  if (!N) return;
  const pillN = el.querySelector<HTMLElement>('[data-pill-n]');

  // Píldora móvil (con y sin movimiento): la etapa que cruza el centro de la pantalla.
  let io: IntersectionObserver | null = null;
  if (preset === 'runtime' && pillN && 'IntersectionObserver' in window) {
    io = new IntersectionObserver((ents) => {
      for (const en of ents) if (en.isIntersecting) pillN.textContent = String(steps.indexOf(en.target as HTMLElement) + 1);
    }, { rootMargin: '-50% 0px -50% 0px', threshold: 0 });
    steps.forEach((s) => io!.observe(s));
  }
  const offIO = () => io?.disconnect();
  if (!env.motion) return offIO;
  gsap.registerPlugin(Flip);
  const data: { title: string; ox: number; oy: number; cam: number }[] = JSON.parse(el.querySelector('[data-seq-data]')?.textContent || '[]');
  const nodes = [...el.querySelectorAll<HTMLElement>('.seq__rail-node')];
  const card = el.querySelector<HTMLElement>('[data-lead]');
  const slots = [...el.querySelectorAll<HTMLElement>('[data-lead-slot]')];
  const leadN = el.querySelector<HTMLElement>('[data-lead-n]');
  const leadStage = el.querySelector<HTMLElement>('[data-lead-stage]');
  const lights = [...el.querySelectorAll<HTMLElement>('[data-light]')];
  const letters = [...el.querySelectorAll<HTMLElement>('.seq__ghost .ghost__l')];
  const bodies = steps.map((s) => s.querySelector<HTMLElement>('.seq__body')!).filter(Boolean);

  if (!env.pin) {
    // Apiladas: cada estación entra como un bloque.
    bodies.forEach((b) => blockReveal(b, env, { start: 'top 82%' }));
    return offIO;
  }

  // ── Pin (escritorio) ──
  el.classList.add('seq--pinned');
  const layers = preset === 'runtime' ? steps.map((s) => s.querySelector<HTMLElement>(':scope > .is__stagebox > .is__layer--media')!) : [];
  const copies = steps.map((s) => s.querySelector<HTMLElement>('.seq__copyf')!);
  const SHOW = 'inset(0% 0% 0% 0%)', HIDE = 'inset(0% 0% 0% 100%)', HIDE_L = 'inset(0% 100% 0% 0%)';
  let cur = 0;
  steps.forEach((s, i) => s.classList.toggle('is-active', i === 0));
  copies.forEach((c, i) => gsap.set(c, { opacity: i === 0 ? 1 : 0, y: 0 }));
  layers.forEach((L, i) => gsap.set(L, { clipPath: i === 0 ? SHOW : HIDE }));
  nodes.forEach((n, i) => n.classList.toggle('is-on', i === 0));
  if (lights.length) gsap.set(lights, { '--on': (i: number) => (i === 0 ? 1 : 0.22) });
  if (letters.length) gsap.set(letters, { '--fill': (i: number) => (i === 0 ? 1 : 0) });
  gsap.set(el, { '--p': 0, '--so': 0 });

  // R9: las placas de las estaciones 2…5 se piden solo cerca de la escena; luego se decodifican y se vuelve a medir (§7.1).
  const imgs = [...el.querySelectorAll<HTMLImageElement>('.is__layer--media img')];
  const near = new IntersectionObserver((ents) => {
    if (!ents.some((e) => e.isIntersecting)) return;
    near.disconnect();
    imgs.forEach((im) => { im.loading = 'eager'; });
    Promise.all(imgs.map((im) => im.decode?.().catch(() => {}))).then(() => ScrollTrigger.refresh());
  }, { rootMargin: '150% 0px' });
  near.observe(el);

  const live = new Set<gsap.core.Animation>();
  const keep = <T extends gsap.core.Animation>(a: T) => { live.add(a); return a; };

  const go = (i: number, instant = false) => {
    if (i === cur) {
      if (instant) { gsap.killTweensOf(copies[i]); gsap.set(copies[i], { opacity: 1, y: 0 }); }
      return;
    }
    const prev = cur; cur = i;
    const fwd = i > prev;
    live.forEach((a) => { if (a.progress() === 1 && !a.isActive()) live.delete(a); });
    steps.forEach((s, k) => s.classList.toggle('is-active', k === i));
    nodes.forEach((n, k) => n.classList.toggle('is-on', k <= i));
    copies.forEach((c, k) => { if (k !== i && k !== prev) { gsap.killTweensOf(c); gsap.set(c, { opacity: 0 }); } });
    if (instant) {
      // Sin transiciones CSS en este cambio (la UI registrada de la estación aparece ya, R11)
      el.classList.add('seq--instant');
      requestAnimationFrame(() => requestAnimationFrame(() => el.classList.remove('seq--instant')));
      gsap.killTweensOf([copies[prev], copies[i]]);
      gsap.set(copies[prev], { opacity: 0, y: 0 });
      gsap.set(copies[i], { opacity: 1, y: 0 });
    } else {
      keep(gsap.to(copies[prev], { opacity: 0, y: fwd ? -14 : 14, duration: 0.25, ease: 'power2.in', overwrite: true }));
      keep(gsap.fromTo(copies[i], { opacity: 0, y: fwd ? 18 : -18 }, { opacity: 1, y: 0, duration: 0.6, delay: 0.12, ease: 'expo.out', overwrite: true }));
    }
    if (preset === 'runtime') {
      layers.forEach((L, k) => { if (k !== i && k !== prev) gsap.set(L, { clipPath: k < i ? SHOW : HIDE }); });
      if (instant) {
        gsap.killTweensOf(layers);
        layers.forEach((L, k) => gsap.set(L, { clipPath: k <= i ? SHOW : HIDE }));
      } else if (fwd) {
        gsap.set(layers[prev], { clipPath: SHOW });
        keep(gsap.fromTo(layers[i], { clipPath: HIDE }, { clipPath: SHOW, duration: 0.8, ease: 'power3.inOut', overwrite: true }));
      } else {
        gsap.set(layers[i], { clipPath: SHOW });
        keep(gsap.fromTo(layers[prev], { clipPath: SHOW }, { clipPath: HIDE_L, duration: 0.8, ease: 'power3.inOut', overwrite: true,
          onComplete: () => { gsap.set(layers[prev], { clipPath: HIDE }); } }));
      }
      if (!instant) {
        keep(gsap.timeline()
          .fromTo(el, { '--sx': fwd ? '100%' : '0%', '--so': 1 }, { '--sx': fwd ? '0%' : '100%', duration: 0.8, ease: 'power3.inOut' })
          .to(el, { '--so': 0, duration: 0.3 }, '-=.15'));
      }
      if (card && slots[i]) {
        const state = Flip.getState(card);
        slots[i].appendChild(card);
        if (!instant) keep(Flip.from(state, { duration: 0.8, ease: 'power3.inOut', absolute: true }));
      }
      if (leadN) leadN.textContent = String(i + 1);
      if (leadStage) leadStage.textContent = data[i]?.title ?? '';
    } else {
      lights.forEach((l, k) => keep(gsap.to(l, { '--on': k === i ? 1 : 0.22, duration: instant ? 0 : 0.5 })));
      letters.forEach((l, k) => keep(gsap.to(l, { '--fill': k <= i ? 1 : 0, duration: instant ? 0 : 0.6 })));
    }
  };

  const tl = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: {
      trigger: el, start: 'top top', end: el.dataset.pin || (preset === 'runtime' ? '+=280%' : '+=250%'),
      pin: true, scrub: true, anticipatePin: 0, invalidateOnRefresh: preset === 'phases',
      snap: { snapTo: (v: number) => Math.round(v * (N - 1)) / (N - 1), duration: { min: 0.2, max: 0.6 }, ease: 'power1.inOut', delay: 0.08, inertia: false },
      onUpdate: (s) => go(Math.min(N - 1, Math.max(0, Math.round(s.progress * (N - 1))))),
      onToggle: (s) => { el.classList.toggle('is-pinned', s.isActive); sala(s.isActive); },
    },
  });
  tl.fromTo(el, { '--p': 0 }, { '--p': 1, duration: 1 }, 0);
  let fitCams = () => {};
  if (preset === 'phases') {
    // Cámara por fase con el tope del sujeto medido a este tamaño (se recalcula en cada refresh): Kain siempre completo.
    const cams = [...el.querySelectorAll<HTMLElement>('.seq__stagebox > .is__layer')];
    const media = el.querySelector<HTMLElement>('.seq__stagebox > .is__layer--media');
    const camOf = (i: number) => { const d = data[i]; return d ? Math.max(1, Math.min(d.cam, seqCamCap(el, media, d.ox, d.oy))) : 1; };
    for (let i = 1; i < N; i++) {
      const d = data[i], p = data[i - 1];
      if (d && p) {
        tl.fromTo(cams, { '--cam': () => camOf(i - 1), '--ox': p.ox, '--oy': p.oy },
          { '--cam': () => camOf(i), '--ox': d.ox, '--oy': d.oy, duration: 1 / (N - 1), ease: 'power1.inOut', immediateRender: false }, (i - 1) / (N - 1));
      }
    }
    fitCams = () => { if (cur === 0 && (tl.scrollTrigger?.progress ?? 0) === 0) gsap.set(cams, { '--cam': camOf(0) }); };
    fitCams();
  }
  const st = tl.scrollTrigger!;
  if (preset === 'phases') ScrollTrigger.addEventListener('refresh', fitCams);

  // R11: foco de teclado o lector de pantalla en una estación → el scroll va a ella y su copia aparece al instante.
  const onFocus = (e: FocusEvent) => {
    const step = (e.target as Element).closest?.('.seq__step') as HTMLElement | null;
    if (!step || !el.contains(step)) return;
    const i = steps.indexOf(step);
    if (i < 0) return;
    const y = st.start + ((st.end - st.start) * i) / Math.max(1, N - 1);
    if (Math.abs(scrollY - y) > 4 || i !== cur) scrollToY(y, env, true);
    go(i, true);
  };
  el.addEventListener('focusin', onFocus);

  const unskip = wireSkip(el, env, st);
  return () => {
    unskip(); offIO(); near.disconnect(); sala(false);
    ScrollTrigger.removeEventListener('refresh', fitCams);
    el.removeEventListener('focusin', onFocus);
    // Interruptor "Reducir movimiento" a mitad de la escena: nada se queda oculto ni fuera de su estación.
    live.forEach((a) => a.kill()); live.clear();
    gsap.killTweensOf([...copies, ...layers, ...lights, ...letters, el, card].filter(Boolean) as Element[]);
    gsap.set([...copies, ...layers, ...lights, ...letters].filter(Boolean), { clearProps: 'all' });
    if (card && slots[0] && card.parentElement !== slots[0]) { slots[0].appendChild(card); gsap.set(card, { clearProps: 'all' }); }
    if (leadN) leadN.textContent = '1';
    if (leadStage) leadStage.textContent = data[0]?.title ?? '';
    el.classList.remove('seq--pinned', 'is-pinned');
    steps.forEach((s) => s.classList.remove('is-active'));
    nodes.forEach((n) => n.classList.remove('is-on'));
    el.style.removeProperty('--p'); el.style.removeProperty('--so'); el.style.removeProperty('--sx');
  };
}
