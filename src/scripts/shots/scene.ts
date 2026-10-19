// src/scripts/shots/scene.ts — ImageSection (§7.4): entrada "se enciende la luz", salida con parallax (escritorio),
// push de cámara hacia un ancla, escena fijada (pin, §5.3), respiración en reposo, palabra fantasma, rama de luz
// (LightBranch) y mini firma "Encendido".
// Estados previos SIEMPRE con opacity/transform (R11): el contenido sigue en el árbol de accesibilidad y en el orden de
// tabulación; si el foco entra antes de la entrada, cine.ts la termina al instante (registro hold/release).
// Firma (html.co): el H1 queda pintado bajo el iris (LCP, §8.3); el estado oculto de líneas y bloques se aplica solo
// cuando el iris empieza a abrirse ("cine:iris") y la entrada corre con "cine:intro" (con red: fin de la firma y 3.5 s).
// Encendido (html.enc): el velo cubre SOLO la placa; el texto ya está pintado y no se vuelve a ocultar (CTA visible desde
// el primer cuadro); se encienden la placa, la UI registrada, el HUD y la rama.
import { claim, html, inView, splitLines, hold, release, sala, wireSkip, type Env, type Player } from './_util';
import { setupBranch, type BranchHandle } from './_branch';

export default function scene(el: HTMLElement, env: Env) {
  const { gsap, ScrollTrigger, motion, desk } = env;
  const cleanups: (() => void)[] = [];
  const copy = el.querySelector<HTMLElement>(':scope > .is__copy');
  const more = el.querySelector<HTMLElement>(':scope > .is__more');
  const stagebox = el.querySelector<HTMLElement>(':scope > .is__stagebox');
  const anchors = stagebox?.querySelector<HTMLElement>(':scope > .is__layer--anchors') ?? null;
  const hud = el.querySelector<HTMLElement>(':scope > .is__hud');
  const sumario = el.querySelector<HTMLElement>(':scope > .sumario, :scope > * > .sumario');
  const leaders = [...el.querySelectorAll<HTMLElement>('.leader, .leader-node')];
  const anchored = anchors ? [...anchors.querySelectorAll<HTMLElement>(':scope > .stage > .anchor:not(.leader-node), :scope > .stage > * > .anchor:not(.leader-node)')] : [];
  const blocks = [
    ...(copy ? copy.querySelectorAll<HTMLElement>(':scope > .is__text > *, :scope > .is__aside > *') : []),
    ...(more ? more.querySelectorAll<HTMLElement>(':scope > .is__text > *') : []),
  ].filter((b) => !b.matches('script,template,[hidden],.branch-spec'));
  blocks.forEach(claim);
  const isCo = html.classList.contains('co') && !!el.querySelector(':scope > [data-shot="coldopen"], :scope > .is__stagebox > [data-shot="coldopen"]');
  const isEnc = html.classList.contains('enc') && el.hasAttribute('data-encendido');
  const push = el.dataset.push ? (JSON.parse(el.dataset.push) as { from: number; to: number }) : null;
  const inTake = el.hasAttribute('data-take') && !!el.closest('.take');
  const ghost = el.querySelector<HTMLElement>('.is__layer--ghost .ghost');
  const pinned = !!el.dataset.pin && env.pin;

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
      const btn = branch.to.closest<HTMLElement>('.ctas') ?? branch.to;
      ro.observe(btn);
      document.fonts?.ready.then(() => branch?.redraw());
      cleanups.push(() => { ro.disconnect(); branch?.destroy(); });
    }
  }

  if (!motion) {
    html.classList.remove('co', 'enc');
    return () => cleanups.forEach((f) => f());
  }

  // ── Entrada: "se enciende la luz" ──
  // Encendido: el texto de la portada ya está pintado (no se divide ni se oculta).
  const animCopy = !isEnc;
  const heads = animCopy ? blocks.filter((b) => b.matches('h1,h2,[data-split]')) : [];
  const rest = animCopy ? blocks.filter((b) => !heads.includes(b)) : [];
  const headPlayers: Player[] = heads.map((h) => splitLines(h, env, { trigger: false, lazy: true }));
  const camIntro = !push && !isCo && !pinned;
  const NIR = { immediateRender: false };
  const intro = gsap.timeline({ paused: true, defaults: { ease: 'expo.out' }, onComplete: () => release(el) });
  if (camIntro) intro.fromTo(el, { '--cam': 1.06 }, { '--cam': 1, duration: 1.6, ...NIR }, 0);
  intro.fromTo(el, { '--leak': 0 }, { '--leak': 0.9, duration: 1.6, ease: 'power2.out', ...NIR }, 0);
  intro.add(() => headPlayers.forEach((p) => p.play()), 0.05);
  if (rest.length) intro.fromTo(rest, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.8, stagger: 0.06, ...NIR }, 0.25);
  if (anchored.length) intro.fromTo(anchored, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.9, stagger: 0.08, ...NIR }, isEnc ? 0.2 : 0.55);
  if (leaders.length) intro.fromTo(leaders, { '--draw': 1 }, { '--draw': 0, duration: 1.1, ease: 'power3.inOut', stagger: 0.25, ...NIR }, isEnc ? 0.35 : 0.75);
  if (hud) intro.fromTo(hud, { opacity: 0 }, { opacity: 1, duration: 1, ...NIR }, isEnc ? 0.3 : 0.6);
  if (sumario) intro.fromTo(sumario, { opacity: 0, y: -12 }, { opacity: 1, y: 0, duration: 0.9, ...NIR }, 0.5);
  const tBranch = isEnc ? 0.6 : 1.5;
  if (branch) {
    intro.add(() => { branch!.redraw(); }, tBranch); // con los titulares y los CTAs ya en su sitio
    intro.fromTo(branch.svg, { '--draw': 1 }, { '--draw': 0, duration: 1.1, ease: 'power3.inOut', ...NIR }, tBranch);
    intro.add(() => {
      if (branch!.svg.style.display === 'none') return;
      branch!.to.classList.remove('is-traced');
      void branch!.to.offsetWidth;
      branch!.to.classList.add('is-traced');
    }, tBranch + 1.05);
  }
  // Respiración en reposo (solo portada del inicio): --cam 1 → 1.015, 8 s, yoyo; se pausa fuera de pantalla.
  if (el.hasAttribute('data-breathe')) {
    intro.add(() => {
      const breathe = gsap.to(el, { '--cam': 1.015, duration: 8, ease: 'sine.inOut', yoyo: true, repeat: -1 });
      ScrollTrigger.create({ trigger: el, start: 'top bottom', end: 'bottom top', onToggle: (s) => (s.isActive ? breathe.resume() : breathe.pause()) });
    });
  }

  let started = false;
  let finished = !!el.dataset.introPlayed; // ya entró en esta visita (p. ej. el interruptor de movimiento reconstruyó todo)
  /** Estados ocultos de la entrada (solo opacidad y transformación). */
  const primeStates = () => {
    if (started || finished) return;
    headPlayers.forEach((p) => p.prime());
    if (rest.length) gsap.set(rest, { opacity: 0, y: 24 });
    if (anchored.length) gsap.set(anchored, { opacity: 0, y: 24 });
    if (leaders.length) gsap.set(leaders, { '--draw': 1 });
    if (hud) gsap.set(hud, { opacity: 0 });
    if (sumario) gsap.set(sumario, { opacity: 0, y: -12 });
    if (branch) gsap.set(branch.svg, { '--draw': 1 });
    gsap.set(el, camIntro ? { '--leak': 0, '--cam': 1.06 } : { '--leak': 0 });
  };
  const playIntro = () => {
    if (started || finished) return;
    primeStates();
    started = true;
    el.dataset.introPlayed = '1';
    intro.play();
  };
  const finish = () => {
    if (finished) return;
    finished = true; started = true;
    el.dataset.introPlayed = '1';
    intro.progress(1);
    headPlayers.forEach((p) => p.finish());
    release(el);
  };

  // Redes de seguridad CSS: GSAP toma el control (sin volver a tapar lo que ya se pintó).
  if (isCo || isEnc) gsap.set([anchors, hud].filter(Boolean), { animation: 'none', opacity: 1 });

  if (finished) {
    intro.progress(1);
    headPlayers.forEach((p) => p.finish());
  } else if (isCo) {
    // Firma: el iris tapa toda la sección; las líneas pasan a 110 % cuando el iris empieza a abrirse.
    hold(el, finish);
    const onIris = () => primeStates();
    const onIntro = (e: Event) => ((e as CustomEvent).detail?.instant ? finish() : playIntro());
    el.addEventListener('cine:iris', onIris);
    el.addEventListener('cine:intro', onIntro);
    document.addEventListener('cine:coldopen-end', playIntro);
    if (!html.classList.contains('co') || el.dataset.introSent) playIntro();
    const t = window.setTimeout(playIntro, 3500);
    cleanups.push(() => {
      clearTimeout(t);
      el.removeEventListener('cine:iris', onIris);
      el.removeEventListener('cine:intro', onIntro);
      document.removeEventListener('cine:coldopen-end', playIntro);
    });
  } else if (isEnc) {
    // Mini firma "Encendido" (0.9 s): el nodo late en el ancla del sujeto y el iris se abre desde ahí, DEBAJO del texto.
    const layer = el.querySelector<HTMLElement>('.co-layer--enc');
    const node = layer?.querySelector<HTMLElement>('.co-node');
    const late = !layer || performance.now() > 1400 || getComputedStyle(layer).visibility === 'hidden';
    if (late) {
      // La red de seguridad CSS ya mostró la portada: nunca se vuelve a tapar.
      html.classList.remove('enc');
      if (layer) gsap.set(layer, { animation: 'none', visibility: 'hidden' });
      finish();
    } else {
      primeStates();
      gsap.set(layer, { animation: 'none', visibility: 'visible' });
      gsap.set(el, { '--veil': 1, '--iris': '0px' });
      const tl = gsap.timeline({ onComplete: () => { html.classList.remove('enc'); gsap.set(layer, { visibility: 'hidden' }); } })
        .to(node ?? {}, { opacity: 1, duration: 0.08, repeat: 3, yoyo: true, ease: 'none' }, 0.05)
        .to(el, { '--iris': '1600px', duration: 0.7, ease: 'power2.in' }, 0.25)
        .to(node ?? {}, { opacity: 0, scale: 3, duration: 0.35 }, 0.3)
        .to(el, { '--veil': 0, duration: 0.3, ease: 'none' }, 0.62)
        .add(playIntro, 0.2);
      const all = () => { tl.progress(1, false); finish(); };
      hold(el, all);
      const evs = ['wheel', 'touchstart', 'keydown', 'pointerdown'];
      evs.forEach((e) => addEventListener(e, all, { once: true, passive: true }));
      cleanups.push(() => { evs.forEach((e) => removeEventListener(e, all)); if (tl.progress() < 1) tl.progress(1); });
    }
  } else if (el.hasAttribute('data-priority') && inView(el)) {
    finish(); // ya en pantalla al cargar (p. ej. llegada por corte por coincidencia): sin parpadeo
  } else {
    primeStates();
    hold(el, finish);
    ScrollTrigger.create({ trigger: el, start: 'top 75%', once: true, onEnter: playIntro });
  }

  // ── Escena fijada (§5.3 industria 05, §7.5): pin +100 %, --cam hacia el centro del panel, un paso del guion por tramo ──
  if (pinned) {
    const chats = [...el.querySelectorAll<HTMLElement>('[data-chat]')];
    let last = -1;
    const send = (p: number) => {
      const q = Math.round(p * 1000) / 1000;
      if (q === last) return;
      last = q;
      chats.forEach((c) => c.dispatchEvent(new CustomEvent('cine:step', { bubbles: true, detail: { progress: q, controlled: true } })));
    };
    chats.forEach((c) => c.setAttribute('data-cine-controlled', ''));
    const tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: el, start: 'top top', end: el.dataset.pin, pin: true, scrub: 0.6, anticipatePin: 0,
        onUpdate: (s) => send(s.progress),
        onRefresh: (s) => send(s.progress),
        onToggle: (s) => { el.classList.toggle('is-pinned', s.isActive); sala(s.isActive); },
      },
    });
    tl.fromTo(el, { '--cam': push?.from ?? 1 }, { '--cam': push?.to ?? 1.6, duration: 1, ease: 'power1.inOut' }, 0);
    send(0);
    const unskip = wireSkip(el, env, tl.scrollTrigger ?? null);
    cleanups.push(() => {
      unskip(); sala(false); el.classList.remove('is-pinned');
      chats.forEach((c) => {
        c.removeAttribute('data-cine-controlled');
        c.dispatchEvent(new CustomEvent('cine:step', { bubbles: true, detail: { progress: 1, controlled: false } }));
      });
    });
  } else if (push) {
    // ── Push de cámara hacia un ancla (scrub mientras cruza el viewport) ──
    // Sin pin (táctil, móvil, sin espacio), una escena pensada para fijarse empuja con suavidad (nunca ×1.6 sin pin).
    gsap.fromTo(el, { '--cam': push.from }, {
      '--cam': el.dataset.pin ? Math.min(push.to, 1.12) : push.to, ease: 'none',
      scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true },
    });
  }

  // ── Palabra fantasma registrada (centrada: xPercent −50 → −56, yPercent −50 fijo) ──
  if (ghost) {
    const letters = [...ghost.querySelectorAll<HTMLElement>('.ghost__l')];
    if (letters.length) {
      gsap.set(letters, { '--fill': 0 });
      const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: 'top 65%', end: 'bottom 55%', scrub: true } });
      letters.forEach((l, i) => tl.to(l, { '--fill': 1, duration: 1, ease: 'none' }, i));
    }
    gsap.fromTo(ghost, { xPercent: -50, yPercent: -50 }, { xPercent: -56, yPercent: -50, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } });
  }

  // ── Salida: parallax de §7.1 (escritorio; no en tomas compartidas, escenas fijadas ni secuencias) ──
  // Opacidad solo en los textos (nunca en ancestros de cristal): los CTAs solo se desplazan y el fantasma conserva su
  // desenfoque (§7.5.5). El slot "more" (textos largos) solo se apaga en el último 30 %. Lo anclado se mueve con la placa.
  if (desk && !inTake && !pinned && stagebox && copy) {
    const exit = gsap.timeline({ scrollTrigger: { trigger: el, start: 'top top', end: 'bottom top', scrub: true } });
    exit.to(stagebox.querySelectorAll(':scope > .is__layer:not(.co-layer) > .stage'), { yPercent: 6, ease: 'none' }, 0);
    const txt = copy.querySelectorAll(':scope > .is__text > :not(.ctas):not(.branch-spec), :scope > .is__aside > :not(.ctas)');
    const ctas = copy.querySelectorAll(':scope > .is__text > .ctas, :scope > .is__aside > .ctas');
    if (txt.length) exit.fromTo(txt, { y: 0, opacity: 1 }, { y: -60, opacity: 0.2, ease: 'none', ...NIR }, 0);
    if (ctas.length) exit.fromTo(ctas, { y: 0 }, { y: -60, ease: 'none', ...NIR }, 0);
    if (more) {
      exit.fromTo(more, { y: 0 }, { y: -60, ease: 'none', duration: 1, ...NIR }, 0);
      exit.fromTo(more, { opacity: 1 }, { opacity: 0.2, ease: 'none', duration: 0.3, ...NIR }, 0.7);
    }
    if (branch) exit.fromTo(branch.svg, { opacity: 1 }, { opacity: 0, ease: 'none', duration: 0.25, ...NIR }, 0);
    if (hud) exit.fromTo(hud, { opacity: 1 }, { opacity: 0, ease: 'none', ...NIR }, 0);
    if (sumario) {
      gsap.fromTo(sumario, { autoAlpha: 1, y: 0 }, {
        autoAlpha: 0, y: -40, ease: 'none', immediateRender: false,
        scrollTrigger: { trigger: el, start: 'top top', end: '30% top', scrub: true },
      });
    }
  }

  return () => cleanups.forEach((f) => f());
}
