// src/scripts/shots/switcher.ts — LocationSwitcher (§7.4, R9, R11). Funciona también sin movimiento (cambio instantáneo).
// Hover (con intención) / foco / clic / ↑↓ cambian la placa activa: doble capa A/B, fundido .6 s (power2.inOut) + scale 1.04 → 1.
// Autoavance cada 4 s SOLO en escritorio con movimiento, en pantalla y con la pestaña visible; se detiene con hover/foco,
// con el botón de pausa y después de una vuelta completa. Solo se descargan la placa activa y la siguiente.
import type { Env } from './_util';

interface SData { vars: string; aura: boolean; mirror: boolean; avifD: string; webpD: string; avifM: string; webpM: string; img: string; sizesD: string; w: number; h: number; name: string }
const MQ = '(max-width: 767px), (max-aspect-ratio: 5/6)';
const AURA = (layer: HTMLElement) => layer.closest('.loc')?.querySelector<HTMLImageElement>('.is__aura')?.src ?? '';

function pictureHTML(d: SData, auraSrc: string) {
  if (d.aura || !d.img) {
    return `<span class="is__aura-glow" aria-hidden="true"></span><img class="is__aura" src="${auraSrc}" alt="" width="640" height="640" decoding="async">`;
  }
  return `<picture><source media="${MQ}" type="image/avif" srcset="${d.avifM}" sizes="100vw"><source media="${MQ}" type="image/webp" srcset="${d.webpM}" sizes="100vw">` +
    `<source type="image/avif" srcset="${d.avifD}" sizes="${d.sizesD}"><source type="image/webp" srcset="${d.webpD}" sizes="${d.sizesD}">` +
    `<img class="is__img" src="${d.img}" width="${d.w}" height="${d.h}" alt="" decoding="async"></picture>`;
}

export default function switcher(el: HTMLElement, env: Env) {
  const { gsap, ScrollTrigger } = env;
  const data: SData[] = JSON.parse(el.querySelector('[data-loc-data]')?.textContent || '[]');
  const rows = [...el.querySelectorAll<HTMLElement>('.loc__row')];
  const btns = [...el.querySelectorAll<HTMLButtonElement>('.loc__btn')];
  const layers = [...el.querySelectorAll<HTMLElement>('.loc__layer')];
  const hudN = el.querySelector<HTMLElement>('[data-loc-n]');
  const pauseBtn = el.querySelector<HTMLButtonElement>('[data-pause]');
  const N = data.length;
  if (!N || layers.length < 2) return;
  const auraSrc = AURA(layers[0]) || '';
  let cur = 0;
  let front = 0; // índice de la capa visible
  let pauseHover = false;
  let paused = false;
  let advanced = 0;
  let inScreen = false;
  let prog: gsap.core.Tween | null = null;
  const off: (() => void)[] = [];
  const on = <K extends keyof HTMLElementEventMap>(t: EventTarget, e: K | string, f: (ev: any) => void, o?: AddEventListenerOptions) => { t.addEventListener(e, f, o); off.push(() => t.removeEventListener(e, f, o)); };

  const load = (layer: HTMLElement, i: number) => {
    if (Number(layer.dataset.sector) === i && layer.dataset.ready) return;
    const d = data[i];
    layer.setAttribute('style', d.vars);
    layer.dataset.sector = String(i);
    if (d.mirror) layer.setAttribute('data-mirror', ''); else layer.removeAttribute('data-mirror');
    const stage = layer.querySelector<HTMLElement>('.stage')!;
    stage.innerHTML = pictureHTML(d, auraSrc) + '<span class="is__vignette"></span><span class="is__leak"></span>';
    layer.dataset.ready = '1';
  };
  layers.forEach((l) => { l.dataset.ready = '1'; });

  const back = () => layers[1 - front];
  const setActive = (i: number) => {
    rows.forEach((r, k) => { if (k === i) r.setAttribute('aria-current', 'true'); else r.removeAttribute('aria-current'); });
    btns.forEach((b, k) => b.setAttribute('aria-pressed', k === i ? 'true' : 'false'));
    if (hudN) hudN.textContent = String(i + 1);
    el.setAttribute('style', data[i].vars);
  };

  let token = 0;
  const go = (i: number) => {
    i = ((i % N) + N) % N;
    if (i === cur) return;
    cur = i;
    setActive(i);
    const incoming = back();
    const outgoing = layers[front];
    load(incoming, i);
    const t = ++token;
    const img = incoming.querySelector('img');
    const show = () => {
      if (t !== token) return;
      front = 1 - front;
      incoming.classList.add('is-on');
      outgoing.classList.remove('is-on');
      if (env.motion) {
        gsap.killTweensOf([incoming, outgoing]);
        gsap.fromTo(incoming, { opacity: 0, scale: 1.04 }, { opacity: 1, scale: 1, duration: 0.6, ease: 'power2.inOut' });
        gsap.to(outgoing, { opacity: 0, duration: 0.6, ease: 'power2.inOut', onComplete: () => { if (t === token) load(outgoing, (i + 1) % N); } });
      } else {
        gsap.set(incoming, { opacity: 1, scale: 1 }); gsap.set(outgoing, { opacity: 0 });
        load(outgoing, (i + 1) % N);
      }
    };
    (img?.decode ? img.decode().catch(() => {}) : Promise.resolve()).then(show);
  };

  // Estado inicial (la capa 1 ya trae el sector siguiente, descargado en diferido)
  gsap.set(layers[0], { opacity: 1 }); gsap.set(layers[1], { opacity: 0 });

  btns.forEach((b, i) => {
    on(b, 'click', () => { stopAuto(true); go(i); });
    on(b, 'focus', () => { stopAuto(true); go(i); });
  });
  // Hover con intención (escritorio)
  let hoverT = 0;
  rows.forEach((r, i) => {
    on(r, 'pointerenter', (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      pauseHover = true;
      clearTimeout(hoverT);
      hoverT = window.setTimeout(() => go(i), 110);
    });
    on(r, 'pointerleave', () => { clearTimeout(hoverT); });
  });
  const list = el.querySelector<HTMLElement>('.loc__list');
  if (list) {
    on(list, 'pointerleave', () => { pauseHover = false; });
    on(list, 'keydown', (e: KeyboardEvent) => {
      if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
      e.preventDefault();
      const k = (cur + (e.key === 'ArrowDown' ? 1 : -1) + N) % N;
      btns[k].focus();
    });
  }

  // ── Autoavance (escritorio + movimiento) ──
  const period = Number(el.dataset.autoplay || 4000) / 1000;
  const auto = env.motion && env.desk && period > 0;
  const bar = () => rows[cur]?.querySelector<HTMLElement>('.loc__bar');
  const tick = () => {
    prog?.kill();
    if (!auto || paused || !inScreen || document.hidden || advanced >= N) return;
    const b = bar();
    if (!b) return;
    prog = gsap.fromTo(b, { '--prog': 0 }, {
      '--prog': 1, duration: period, ease: 'none',
      onComplete: () => {
        if (pauseHover || paused) { tick(); return; }
        advanced++;
        go(cur + 1);
        if (advanced >= N) { stopAuto(false); return; }
        tick();
      },
    });
  };
  function stopAuto(user: boolean) {
    prog?.kill();
    rows.forEach((r) => r.querySelector<HTMLElement>('.loc__bar')?.style.removeProperty('--prog'));
    if (user) { paused = true; pauseBtn?.setAttribute('aria-pressed', 'true'); }
    if (!user) el.classList.remove('is-auto');
  }
  if (auto) {
    el.classList.add('is-auto');
    ScrollTrigger.create({ trigger: el, start: 'top 60%', end: 'bottom 40%', onToggle: (s) => { inScreen = s.isActive; if (inScreen) tick(); else prog?.pause(); } });
    on(document, 'visibilitychange', () => (document.hidden ? prog?.pause() : tick()));
    if (pauseBtn) on(pauseBtn, 'click', () => {
      paused = !paused;
      pauseBtn.setAttribute('aria-pressed', String(paused));
      pauseBtn.setAttribute('aria-label', paused ? 'Reanudar el cambio automático de escena' : 'Pausar el cambio automático de escena');
      if (paused) prog?.kill(); else tick();
    });
  }
  return () => { off.forEach((f) => f()); prog?.kill(); el.classList.remove('is-auto'); clearTimeout(hoverT); };
}
