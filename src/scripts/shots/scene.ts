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

const MOBILE = '(max-width: 767px), (max-aspect-ratio: 5/6)';

/** Tope real de --cam (§0.1-5, manda sobre el 1.6 de §5.3/R5): la caja del sujeto (Kain, personas), escalada desde el
 *  origen del push, se queda dentro del cuadro visible de la placa: arriba no pasa del 4 % (encabezado y fundido
 *  superior), abajo no sale más que a cámara 1 (los pies ya viven en la disolución), a los lados deja 1.5 % y, en ultra
 *  ancho, nunca entra en el fundido lateral. Nunca baja de 1 (no empeora lo que ya se ve a cámara 1). */
function camLimit(el: HTMLElement): number {
  const layer = el.querySelector<HTMLElement>(':scope > .is__stagebox > .is__layer--media');
  const stage = layer?.querySelector<HTMLElement>(':scope > .stage');
  if (!layer || !stage) return 1.6;
  const cs = getComputedStyle(el);
  const n = (p: string) => parseFloat(cs.getPropertyValue(p));
  const k = matchMedia(MOBILE).matches ? '-m' : '';
  const [x0, y0, x1, y1] = ['--sx0', '--sy0', '--sx1', '--sy1'].map((p) => n(p + k));
  if ([x0, y0, x1, y1].some(Number.isNaN)) return 1.6; // aura: sin sujeto que cuidar
  const lw = layer.clientWidth, lh = layer.clientHeight;
  const sw = stage.offsetWidth, sh = stage.offsetHeight, sl = stage.offsetLeft, st = stage.offsetTop;
  if (!lw || !lh || !sw || !sh) return 1.6;
  const ox = sl + (n('--ox') || 0.5) * sw, oy = st + (n('--oy') || 0.5) * sh;
  const e = { l: sl + x0 * sw, r: sl + x1 * sw, t: st + y0 * sh, b: st + y1 * sh };
  // Fundido lateral del ultra ancho (cine.css ≥ 1800 px): mismas cuentas que --mL / --mR (sin fundido del lado del sujeto,
  // largo del lado del texto; 10 % por lado con el sujeto al centro).
  const ultra = !k && innerWidth >= 1800;
  const side = el.dataset.layout;
  const fL = side === 'subject-right' ? 0.28 : side === 'subject-left' ? 0 : 0.1;
  const fR = side === 'subject-left' ? 0.28 : side === 'subject-right' ? 0 : 0.1;
  const mL = ultra ? Math.max(0, Math.min(fL * lw, (n('--sx0') || 0.1) * lw - 16)) : 0;
  const mR = ultra ? Math.max(0, Math.min(fR * lw, (1 - (n('--sx1') || 0.9)) * lw - 16)) : 0;
  const pad = 0.015 * lw;
  const lim = { l: mL + pad, r: lw - mR - pad, t: Math.min(e.t, 0.04 * lh), b: Math.max(e.b, lh) };
  let c = 1.6;
  if (e.r > ox) c = Math.min(c, (lim.r - ox) / (e.r - ox));
  if (e.l < ox) c = Math.min(c, (ox - lim.l) / (ox - e.l));
  if (e.b > oy) c = Math.min(c, (lim.b - oy) / (e.b - oy));
  if (e.t < oy) c = Math.min(c, (oy - lim.t) / (oy - e.t));
  return Math.max(1, Math.round(c * 1000) / 1000);
}
/** Recorrido de cámara del push con el tope aplicado (entra justo debajo del tope si camFrom lo pasaba). */
function camRange(el: HTMLElement, push: { from: number; to: number }, ceiling = 1.6) {
  const to = Math.min(push.to, ceiling, camLimit(el));
  const from = Math.min(push.from, Math.max(1, to - 0.08));
  return { from, to };
}

/** Tinta del texto: rectángulos de las líneas reales de cada nodo de texto + botones (los bloques ocupan toda la columna
 *  aunque sus líneas sean más cortas). Las entradas solo desplazan en Y: la X es la final. */
function inkRects(root: HTMLElement): DOMRect[] {
  const out: DOMRect[] = [];
  const take = (r: DOMRect) => { if (r.width > 0 && r.height > 0) out.push(r); };
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, { acceptNode: (n) => (n.textContent?.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT) });
  const range = document.createRange();
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    if ((n.parentElement?.closest('.btn, [hidden], .branch-spec'))) continue;
    range.selectNodeContents(n);
    for (const r of range.getClientRects()) take(r);
  }
  root.querySelectorAll<HTMLElement>('.btn').forEach((b) => take(b.getBoundingClientRect()));
  return out;
}
function inkBox(root: HTMLElement): { left: number; right: number } | null {
  const rs = inkRects(root);
  return rs.length ? { left: Math.min(...rs.map((r) => r.left)), right: Math.max(...rs.map((r) => r.right)) } : null;
}

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

  // ── Texto de un lado, sujeto del otro (§3.10-1): la tinta del texto (líneas reales, no la caja de la columna) queda a
  // ≥ 32 px de la caja del sujeto a cualquier tamaño (p. ej. el cierre del caso a 1024 × 768 tocaba la mano de Kain).
  // Si no cabe, la columna se angosta (sujeto a la derecha) o se recorre (sujeto a la izquierda). Con o sin movimiento.
  // Fig. (pie de foto registrado): si una línea del texto queda a < 24 px de su caja (p. ej. la línea de confianza de la
  // portada a 1280 × 720 y 1440 × 900), el pie se angosta desde su lado libre (su esquina anclada y la línea guía no se
  // mueven; el texto del pie gana una línea).
  const textCol = copy?.querySelector<HTMLElement>(':scope > .is__text') ?? null;
  const caps = anchors ? [...anchors.querySelectorAll<HTMLElement>('.caption')] : [];
  if (textCol && desk && stagebox && /^subject-(left|right)$/.test(el.dataset.layout ?? '')) {
    const right = el.dataset.layout === 'subject-right';
    const fitCopy = () => {
      textCol.style.removeProperty('max-width');
      textCol.style.removeProperty('padding-left');
      caps.forEach((c) => c.style.removeProperty('--cap-w'));
      const stage = stagebox.querySelector<HTMLElement>(':scope > .is__layer--media > .stage');
      const layer = stage?.parentElement;
      if (!stage || !layer) return;
      const cs = getComputedStyle(el);
      const x0 = parseFloat(cs.getPropertyValue('--sx0')), x1 = parseFloat(cs.getPropertyValue('--sx1'));
      const lr = layer.getBoundingClientRect();
      const lx = lr.left + stage.offsetLeft, sw = stage.offsetWidth;
      const ink = inkBox(textCol);
      if (!ink) return;
      const tr = textCol.getBoundingClientRect();
      // Ajuste acotado (≤ 120 px y nunca menos de 280 px de columna): la columna solo cede lo que le falta a la tinta para
      // el aire de 32 px. Un recorte grande alarga el texto, la sección crece (Dawn) y la placa en "cover" crece con ella
      // (el sujeto se corre hacia el texto): el tope evita que eso se realimente.
      if (!Number.isNaN(x0) && !Number.isNaN(x1)) {
        if (right) {
          const edge = lx + x0 * sw - 32;
          if (ink.right > edge) textCol.style.maxWidth = `${Math.floor(Math.max(edge, ink.right - 120, tr.left + 280) - tr.left)}px`;
        } else {
          const edge = lx + x1 * sw + 32;
          if (ink.left < edge) textCol.style.paddingLeft = `${Math.max(0, Math.ceil(Math.min(edge, ink.left + 120, tr.right - 280) - tr.left))}px`;
        }
      }
      if (!caps.length) return;
      // Coordenadas sin la cámara (--cam escala el escenario desde su origen) ni el desplazamiento de entrada (y).
      const cam = parseFloat(cs.getPropertyValue('--cam')) || 1;
      const ox = lx + (parseFloat(cs.getPropertyValue('--ox')) || 0.5) * sw;
      const oy = lr.top + stage.offsetTop + (parseFloat(cs.getPropertyValue('--oy')) || 0.5) * stage.offsetHeight;
      // Texto de la columna y del slot "more" (p. ej. la línea de confianza de la portada del inicio)
      const moreCol = more?.querySelector<HTMLElement>(':scope > .is__text');
      const lines = [...inkRects(textCol), ...(moreCol ? inkRects(moreCol) : [])];
      for (const cap of caps) {
        if (!cap.offsetParent) continue;
        // GSAP absorbe el translate CSS (−100 % con el sujeto a la derecha) como x en px al animar la entrada: con otro
        // ancho (--cap-w, o 22vw al cambiar la ventana) la esquina se despegaría del ancla. Se vuelve relativo (xPercent).
        if (right && cap.style.translate === 'none') gsap.set(cap, { x: 0, xPercent: -100 });
        const r = cap.getBoundingClientRect();
        const ty = Number(gsap.getProperty(cap, 'y')) || 0;
        const L = ox + (r.left - ox) / cam, R = ox + (r.right - ox) / cam;
        const T = oy + (r.top - ty - oy) / cam, B = oy + (r.bottom - ty - oy) / cam;
        const near = lines.filter((q) => q.bottom > T - 8 && q.top < B + 8);
        if (!near.length) continue;
        if (right) {
          const maxR = Math.max(...near.map((q) => q.right));
          if (maxR + 24 > L) cap.style.setProperty('--cap-w', `${Math.max(200, Math.floor(R - maxR - 24))}px`);
        } else {
          const minL = Math.min(...near.map((q) => q.left));
          if (minL - 24 < R) cap.style.setProperty('--cap-w', `${Math.max(200, Math.floor(minL - 24 - L))}px`);
        }
      }
    };
    fitCopy();
    let raf = 0;
    const ro = new ResizeObserver(() => { cancelAnimationFrame(raf); raf = requestAnimationFrame(fitCopy); });
    ro.observe(el);
    document.fonts?.ready.then(fitCopy);
    cleanups.push(() => { ro.disconnect(); cancelAnimationFrame(raf); textCol.style.removeProperty('max-width'); textCol.style.removeProperty('padding-left'); caps.forEach((c) => c.style.removeProperty('--cap-w')); });
  }

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
    // Sin movimiento: encuadre fijo de entrada, con el tope del sujeto medido a este tamaño.
    if (push) {
      const fit = () => el.style.setProperty('--cam', String(camRange(el, push, el.dataset.pin ? 1.12 : 1.6).from));
      fit();
      const ro = new ResizeObserver(fit);
      ro.observe(el);
      cleanups.push(() => ro.disconnect());
    }
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
      const hit = branch!.hit(); // el primario o, si su costado estaba ocupado, el botón de la fila al que llegó la rama
      hit.classList.remove('is-traced');
      void hit.offsetWidth;
      hit.classList.add('is-traced');
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
    // El recorrido de cámara se recalcula en cada refresh (tamaño de la ventana): Kain nunca sale del cuadro (camLimit).
    const range = () => camRange(el, push ?? { from: 1, to: 1.6 });
    const tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: el, start: 'top top', end: el.dataset.pin, pin: true, scrub: 0.6, anticipatePin: 0, invalidateOnRefresh: true,
        onUpdate: (s) => send(s.progress),
        onRefresh: (s) => send(s.progress),
        onToggle: (s) => { el.classList.toggle('is-pinned', s.isActive); sala(s.isActive); },
      },
    });
    tl.fromTo(el, { '--cam': () => range().from }, { '--cam': () => range().to, duration: 1, ease: 'power1.inOut' }, 0);
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
    const range = () => camRange(el, push, el.dataset.pin ? 1.12 : 1.6);
    gsap.fromTo(el, { '--cam': () => range().from }, {
      '--cam': () => range().to, ease: 'none',
      scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true, invalidateOnRefresh: true },
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
    if (txt.length) {
      exit.fromTo(txt, { y: 0 }, { y: -60, ease: 'none', ...NIR }, 0);
      // El texto se apaga solo cuando ya salió de la zona de lectura (su bloque pasa el 15 % superior), no desde que la
      // sección toca el borde: en escenas alineadas abajo (VSL de /discovery/) el titular seguía a media pantalla en .69.
      gsap.fromTo(txt, { opacity: 1 }, {
        opacity: 0.2, ease: 'none', immediateRender: false,
        scrollTrigger: { trigger: copy.querySelector(':scope > .is__text') ?? copy, start: 'top 15%', end: 'bottom top', scrub: true },
      });
    }
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
