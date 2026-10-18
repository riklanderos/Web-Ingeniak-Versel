// src/scripts/shots/scene.ts — ImageSection (§7.4): entrada "se enciende la luz", salida con parallax (escritorio),
// push de cámara hacia un ancla, respiración en reposo, palabra fantasma, rama de luz (LightBranch) y mini firma "Encendido".
import { claim, html, inView, splitLines, type Env } from './_util';
import { setupBranch, type BranchHandle } from './_branch';

export default function scene(el: HTMLElement, env: Env) {
  const { gsap, ScrollTrigger, motion, desk } = env;
  const cleanups: (() => void)[] = [];
  const copy = el.querySelector<HTMLElement>(':scope > .is__copy');
  const more = el.querySelector<HTMLElement>(':scope > .is__more');
  const stagebox = el.querySelector<HTMLElement>(':scope > .is__stagebox');
  const anchors = el.querySelector<HTMLElement>(':scope > .is__stagebox > .is__layer--anchors');
  const hud = el.querySelector<HTMLElement>(':scope > .is__hud');
  const sumario = el.querySelector<HTMLElement>('.sumario');
  const leaders = [...el.querySelectorAll<HTMLElement>('.leader, .leader-node')];
  const anchored = anchors ? [...anchors.querySelectorAll<HTMLElement>('.anchor:not(.leader-node)')] : [];
  const blocks = [
    ...(copy ? copy.querySelectorAll<HTMLElement>(':scope > .is__text > *, :scope > .is__aside > *') : []),
    ...(more ? more.querySelectorAll<HTMLElement>(':scope > .is__text > *') : []),
  ].filter((b) => !b.matches('script,template,[hidden],.branch-spec'));
  blocks.forEach(claim);
  const isCo = html.classList.contains('co') && !!el.querySelector(':scope > [data-shot="coldopen"]');
  const isEnc = html.classList.contains('enc') && el.hasAttribute('data-encendido');
  const push = el.dataset.push ? (JSON.parse(el.dataset.push) as { from: number; to: number }) : null;
  const inTake = el.hasAttribute('data-take') && !!el.closest('.take');
  const ghost = el.querySelector<HTMLElement>('.is__layer--ghost .ghost');

  // ── Rama de luz (tramo 2): con o sin movimiento ──
  const spec = el.querySelector<HTMLElement>('[data-branch]');
  let branch: BranchHandle | null = null;
  if (spec && desk) {
    branch = setupBranch(el, spec);
    if (branch) {
      branch.redraw();
      let raf = 0;
      const ro = new ResizeObserver(() => { cancelAnimationFrame(raf); raf = requestAnimationFrame(() => branch!.redraw()); });
      ro.observe(el);
      document.fonts?.ready.then(() => branch?.redraw());
      cleanups.push(() => { ro.disconnect(); branch?.destroy(); });
    }
  }

  if (!motion) {
    html.classList.remove('co', 'enc');
    return () => cleanups.forEach((f) => f());
  }

  // ── Entrada: "se enciende la luz" ──
  const heads = blocks.filter((b) => b.matches('h1,h2,[data-split]'));
  const rest = blocks.filter((b) => !heads.includes(b));
  const headPlayers = heads.map((h) => splitLines(h, env, { trigger: false }));
  const intro = gsap.timeline({ paused: true, defaults: { ease: 'expo.out' } });
  if (!push && !isCo) intro.fromTo(el, { '--cam': 1.06 }, { '--cam': 1, duration: 1.6 }, 0);
  intro.fromTo(el, { '--leak': 0 }, { '--leak': 0.9, duration: 1.6, ease: 'power2.out' }, 0);
  intro.add(() => headPlayers.forEach((p) => p.play()), 0.05);
  if (rest.length) intro.from(rest, { y: 24, autoAlpha: 0, duration: 0.8, stagger: 0.06 }, 0.25);
  if (anchored.length) intro.from(anchored, { y: 24, autoAlpha: 0, duration: 0.9, stagger: 0.08 }, 0.55);
  if (leaders.length) intro.fromTo(leaders, { '--draw': 1 }, { '--draw': 0, duration: 1.1, ease: 'power3.inOut', stagger: 0.25 }, 0.75);
  if (hud) intro.from(hud, { autoAlpha: 0, duration: 1 }, 0.6);
  if (sumario) intro.from(sumario, { autoAlpha: 0, y: -12, duration: 0.9 }, 0.5);
  if (branch) {
    gsap.set(branch.svg, { '--draw': 1 });
    intro.add(() => branch!.redraw(), 1.5); // con los titulares ya en su sitio (las líneas entran con yPercent)
    intro.to(branch.svg, { '--draw': 0, duration: 1.1, ease: 'power3.inOut' }, 1.5);
    intro.add(() => {
      if (branch!.svg.style.display === 'none') return;
      branch!.to.classList.remove('is-traced');
      void branch!.to.offsetWidth;
      branch!.to.classList.add('is-traced');
    }, 2.55);
  }
  // Respiración en reposo (solo portada del inicio): --cam 1 → 1.015, 8 s, yoyo; se pausa fuera de pantalla.
  let breathe: gsap.core.Tween | null = null;
  if (el.hasAttribute('data-breathe')) {
    intro.add(() => {
      breathe = gsap.to(el, { '--cam': 1.015, duration: 8, ease: 'sine.inOut', yoyo: true, repeat: -1 });
      ScrollTrigger.create({ trigger: el, start: 'top bottom', end: 'bottom top', onToggle: (s) => (s.isActive ? breathe?.resume() : breathe?.pause()) });
    });
  }

  // Estados ocultos (las redes de seguridad CSS se cancelan: GSAP toma el control)
  const safety = [...(copy ? [...copy.children] : []), anchors, hud, branch?.svg].filter(Boolean) as HTMLElement[];
  if (isCo || isEnc) gsap.set(safety, { animation: 'none' });
  if (isCo || isEnc) gsap.set([anchors, hud, ...heads].filter(Boolean), { opacity: 1 });

  if (isCo) {
    const go = () => intro.play();
    el.addEventListener('cine:intro', go, { once: true });
    cleanups.push(() => el.removeEventListener('cine:intro', go));
  } else if (isEnc) {
    // Mini firma "Encendido" (0.9 s): el nodo late en el ancla del sujeto y el iris se abre desde ahí.
    const layer = el.querySelector<HTMLElement>(':scope > .co-layer--enc');
    const node = layer?.querySelector<HTMLElement>('.co-node');
    gsap.set(layer, { animation: 'none', visibility: 'visible' });
    gsap.set(el, { '--veil': 1, '--iris': '0px' });
    const tl = gsap.timeline({ onComplete: () => { html.classList.remove('enc'); gsap.set(layer, { visibility: 'hidden' }); } })
      .to(node, { opacity: 1, duration: 0.08, repeat: 3, yoyo: true, ease: 'none' }, 0.05)
      .to(el, { '--iris': '1600px', duration: 0.9, ease: 'power2.in' }, 0.3)
      .to(node, { opacity: 0, scale: 3, duration: 0.4 }, 0.35)
      .to(el, { '--veil': 0, duration: 0.35, ease: 'none' }, 0.85)
      .add(() => intro.play(), 0.55);
    const skip = () => tl.progress(1, false);
    const evs = ['wheel', 'touchstart', 'keydown', 'pointerdown'];
    evs.forEach((e) => addEventListener(e, skip, { once: true, passive: true }));
    cleanups.push(() => evs.forEach((e) => removeEventListener(e, skip)));
  } else if (el.hasAttribute('data-priority') && inView(el)) {
    intro.progress(1, false); // ya en pantalla al cargar (p. ej. llegada por corte por coincidencia): sin parpadeo
    headPlayers.forEach((p) => p.finish());
  } else {
    ScrollTrigger.create({ trigger: el, start: 'top 75%', once: true, onEnter: () => intro.play() });
  }

  // ── Push de cámara hacia un ancla (scrub mientras cruza el viewport) ──
  if (push) {
    gsap.fromTo(el, { '--cam': push.from }, {
      '--cam': push.to, ease: 'none',
      scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true },
    });
  }

  // ── Palabra fantasma registrada ──
  if (ghost) {
    const letters = [...ghost.querySelectorAll<HTMLElement>('.ghost__l')];
    if (letters.length) {
      gsap.set(letters, { '--fill': 0 });
      const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: 'top 65%', end: 'bottom 55%', scrub: true } });
      letters.forEach((l, i) => tl.to(l, { '--fill': 1, duration: 1, ease: 'none' }, i));
    }
    gsap.fromTo(ghost, { xPercent: 0 }, { xPercent: -6, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } });
  }

  // ── Salida: parallax de §7.1 (escritorio; no en tomas compartidas ni secuencias) ──
  if (desk && !inTake && stagebox && copy) {
    const exit = gsap.timeline({ scrollTrigger: { trigger: el, start: 'top top', end: 'bottom top', scrub: true } });
    // Se mueven los escenarios (no la capa): la máscara de disolución queda fija en el borde de la sección.
    exit.to(stagebox.querySelectorAll(':scope > .is__layer:not(.co-layer) > .stage'), { yPercent: 6, ease: 'none' }, 0);
    exit.to([copy, more, branch?.svg].filter(Boolean), { y: -60, autoAlpha: 0.2, ease: 'none' }, 0);
    if (hud) exit.to(hud, { autoAlpha: 0, ease: 'none' }, 0);
    if (sumario) gsap.to(sumario, { autoAlpha: 0, y: -40, ease: 'none', scrollTrigger: { trigger: el, start: 'top top', end: '30% top', scrub: true } });
  }

  return () => cleanups.forEach((f) => f());
}
