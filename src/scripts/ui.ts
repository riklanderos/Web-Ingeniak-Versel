// src/scripts/ui.ts — comportamiento del área "ui" (ESPEC-v2 §2.9–§2.13, §6 #25–45, §7.4).
// Todo por ganchos data-*; nada por elemento. Sin JS o con movimiento reducido, el contenido completo ya está en el HTML.
//   [data-ui-reveal] / [data-ui-stagger]  entradas (clase .is-in; estados ocultos solo bajo html.ui-motion)
//   [data-faq]                            acordeón (grid-template-rows 0fr → 1fr)
//   [data-chat]                           ChatSim: "escribiendo…", pestañas, pausa (WCAG 2.2.2), se detiene fuera de pantalla
//   [data-follow-still]                   ScriptList: fotograma 21:9 que sigue al cursor (gsap.quickTo, pointer:fine)
//   [data-ledger]                         filtros del registro de resultados (sin fetch)
//   [data-video]                          VideoPoster: diálogo modal o reproducción en línea, carga al clic
//   [data-magnetic]                       botón primario magnético ±6 px (pointer:fine)
//   [data-primary]                        regla de un azul (F15): html[data-primary-visible]
//   a[data-still]                         corte por coincidencia: view-transition-name:plate en su imagen (§7.6)
//   [data-vrail] · [data-flow] · [data-pain] · [data-count] · [data-toc]
// Medición (R10): document dispatch "ingeniak:track" {name, …} — faq_open, chat_sim_tab, video_play/50/complete.

type GSAP = typeof import('gsap').gsap;
const root = document.documentElement;
let motionKilled = false;   // interruptor "Reducir movimiento" del footer en vivo (evento ingeniak:motion)
const reduced = () => motionKilled || matchMedia('(prefers-reduced-motion: reduce)').matches || root.dataset.motion === 'reduced';
const fine = () => matchMedia('(hover: hover) and (pointer: fine)').matches;
const $$ = <T extends Element = HTMLElement>(sel: string, ctx: ParentNode = document) => Array.from(ctx.querySelectorAll<T>(sel) as any) as T[];
const track = (name: string, detail: Record<string, unknown> = {}) =>
  document.dispatchEvent(new CustomEvent('ingeniak:track', { detail: { name, page: location.pathname, ...detail } }));
let gsapP: Promise<GSAP> | null = null;
const loadGsap = () => (gsapP ??= import('gsap').then((m: any) => (m.gsap ?? m.default) as GSAP));
const inView = (el: Element, margin = 0) => {
  const r = el.getBoundingClientRect();
  return r.bottom > -margin && r.top < innerHeight + margin && r.width + r.height > 0;
};

/* ───────────── Entradas ───────────── */
function initReveal() {
  const els = $$('[data-ui-reveal],[data-ui-stagger],[data-pain="draw"]');
  if (!els.length) return;
  if (reduced() || !('IntersectionObserver' in window)) { els.forEach((e) => e.classList.add('is-in')); return; }
  // Lo que ya está en pantalla al cargar no se oculta (sin parpadeo).
  els.forEach((e) => { if (inView(e)) e.classList.add('is-in'); });
  root.classList.add('ui-motion');
  const io = new IntersectionObserver((entries) => {
    for (const en of entries) if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
  }, { rootMargin: '0px 0px -12% 0px', threshold: 0.01 });
  els.forEach((e) => { if (!e.classList.contains('is-in')) io.observe(e); });
}

/* ───────────── FAQ ───────────── */
function initFaq() {
  for (const faq of $$('[data-faq]')) {
    faq.addEventListener('click', (e) => {
      const btn = (e.target as Element).closest<HTMLButtonElement>('[data-faq-toggle]');
      if (!btn || !faq.contains(btn)) return;
      const item = btn.closest<HTMLElement>('[data-faq-item]')!;
      const open = btn.getAttribute('aria-expanded') !== 'true';
      btn.setAttribute('aria-expanded', String(open));
      item.classList.toggle('is-open', open);
      if (open) track('faq_open', { id: item.dataset.faqId });
    });
  }
}

/* ───────────── ChatSim ───────────── */
function initChat() {
  for (const chat of $$('[data-chat]')) {
    const tabs = $$<HTMLButtonElement>('[data-chat-tab]', chat);
    const panels = $$<HTMLOListElement>('[data-chat-panel]', chat);
    const notes = $$<HTMLElement>('[data-chat-note]', chat);
    const screen = chat.querySelector<HTMLElement>('.chat__screen')!;
    const pauseBtn = chat.querySelector<HTMLButtonElement>('[data-chat-pause]');
    const live = chat.hasAttribute('data-autoplay') && !reduced();
    let current = panels.find((p) => !p.hidden) ?? panels[0];
    let timer = 0, idx = 0, paused = false, visible = false, running = false;

    if (!live && pauseBtn) pauseBtn.hidden = true;
    const msgs = () => $$<HTMLElement>('.chat__msg', current);
    const typing = () => current.querySelector<HTMLElement>('.chat__typing');
    const toEnd = () => { screen.scrollTop = screen.scrollHeight; };
    const reset = () => { clearTimeout(timer); idx = 0; msgs().forEach((m) => m.classList.add('is-pending')); typing()?.classList.remove('is-on'); screen.scrollTop = 0; };
    const show = (m: HTMLElement) => {
      m.classList.remove('is-pending'); m.classList.add('is-enter'); toEnd();
      requestAnimationFrame(() => requestAnimationFrame(() => m.classList.remove('is-enter')));
    };
    const step = () => {
      running = false;
      if (motionKilled) { halt(); chat.classList.remove('is-live'); pauseBtn && (pauseBtn.hidden = true); return; }
      if (paused || !visible || document.hidden) return;
      running = true;
      const list = msgs();
      if (idx >= list.length) { timer = window.setTimeout(() => { reset(); step(); }, 5200); return; }
      const m = list[idx];
      const from = m.dataset.from;
      const d = idx === 0 ? 350 : Number(m.dataset.delay) || (from === 'kain' ? 1100 : from === 'sistema' ? 500 : 1000);
      if (from === 'kain') { typing()?.classList.add('is-on'); toEnd(); }
      timer = window.setTimeout(() => { typing()?.classList.remove('is-on'); show(m); idx++; step(); }, d);
    };
    const resume = () => { if (!running && !paused && visible && !document.hidden) { clearTimeout(timer); step(); } };
    const halt = () => { clearTimeout(timer); running = false; };

    const select = (key: string, focus = false) => {
      const next = panels.find((p) => p.dataset.chatPanel === key); if (!next || next === current) return;
      tabs.forEach((t) => { const on = t.dataset.chatTab === key; t.setAttribute('aria-selected', String(on)); t.tabIndex = on ? 0 : -1; if (on && focus) t.focus(); });
      notes.forEach((n) => (n.hidden = n.dataset.chatNote !== key));
      if (live) { halt(); msgs().forEach((m) => m.classList.remove('is-pending')); typing()?.classList.remove('is-on'); }
      current.hidden = true; next.hidden = false; current = next;
      screen.classList.remove('is-swipe'); void screen.offsetWidth; screen.classList.add('is-swipe');
      if (live) { reset(); resume(); } else screen.scrollTop = 0;
      track('chat_sim_tab', { sector: key });
    };
    tabs.forEach((t, i) => {
      t.addEventListener('click', () => select(t.dataset.chatTab!));
      t.addEventListener('keydown', (e) => {
        if (e.key === 'Home' || e.key === 'End') { e.preventDefault(); select(tabs[e.key === 'Home' ? 0 : tabs.length - 1].dataset.chatTab!, true); return; }
        const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
        if (!d) return; e.preventDefault();
        select(tabs[(i + d + tabs.length) % tabs.length].dataset.chatTab!, true);
      });
    });
    if (!live) continue;

    chat.classList.add('is-live');
    screen.removeAttribute('tabindex');
    reset();
    pauseBtn?.addEventListener('click', () => {
      paused = !paused;
      pauseBtn.setAttribute('aria-pressed', String(paused));
      pauseBtn.setAttribute('aria-label', (paused ? chat.dataset.labelPlay : chat.dataset.labelPause) ?? (paused ? 'Reanudar' : 'Pausar'));
      if (paused) halt(); else resume();
    });
    // Visible = la mitad del chat en pantalla (o media pantalla ocupada, si el chat es más alto que el viewport).
    new IntersectionObserver(([en]) => {
      visible = en.isIntersecting && en.intersectionRect.height >= Math.min(en.boundingClientRect.height, innerHeight) * 0.5;
      visible ? resume() : halt();
    }, { threshold: [0, 0.25, 0.5, 0.75, 1] }).observe(chat);
    document.addEventListener('visibilitychange', () => (document.hidden ? halt() : resume()));
  }
}

/* ───────────── ScriptList: fotograma que sigue al cursor ───────────── */
async function initFollowStill() {
  const lists = $$('[data-follow-still]');
  if (!lists.length || reduced() || !fine() || !matchMedia('(min-width: 1024px)').matches) return;
  const gsap = await loadGsap();
  for (const list of lists) {
    const still = list.querySelector<HTMLElement>('.script__still'); if (!still) continue;
    const [a, b] = $$<HTMLImageElement>('img', still);
    let front = a, last = '';
    const xTo = gsap.quickTo(still, 'x', { duration: 0.6, ease: 'power3' });
    const yTo = gsap.quickTo(still, 'y', { duration: 0.6, ease: 'power3' });
    list.addEventListener('pointermove', (e) => {
      const r = list.getBoundingClientRect(); const w = still.offsetWidth, h = still.offsetHeight;
      let x = e.clientX - r.left + 28; if (x + w > r.width) x = e.clientX - r.left - w - 28;
      xTo(Math.max(0, x)); yTo(e.clientY - r.top - h / 2);
    });
    for (const row of $$('.script__row', list)) {
      row.addEventListener('pointerenter', () => {
        const src = row.dataset.stillSrc;
        if (!src) { still.classList.remove('is-on'); return; }
        if (src !== last) {
          const back = front === a ? b : a; back.src = src;
          const swap = () => { back.classList.add('is-on'); front.classList.remove('is-on'); front = back; };
          back.complete ? swap() : back.addEventListener('load', swap, { once: true });
          last = src;
        }
        still.classList.add('is-on');
      });
    }
    list.addEventListener('pointerleave', () => still.classList.remove('is-on'));
  }
}

/* ───────────── Corte por coincidencia (§7.6) ───────────── */
function initStillTransition() {
  document.addEventListener('click', (e) => {
    const a = (e.target as Element).closest<HTMLAnchorElement>('a[data-still]');
    if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || a.target === '_blank') return;
    $$<HTMLElement>('[style*="view-transition-name"]').forEach((el) => { if (el.style.viewTransitionName === 'plate') el.style.viewTransitionName = ''; });
    const img = a.querySelector<HTMLImageElement>('.still__media img')
      ?? a.closest('[data-follow-still]')?.querySelector<HTMLImageElement>('.script__still.is-on img.is-on');
    if (img) img.style.viewTransitionName = 'plate';
  });
}

/* ───────────── Registro de resultados: filtros ───────────── */
function initLedger() {
  for (const led of $$('[data-ledger]')) {
    const chips = $$<HTMLButtonElement>('[data-ledger-filter]', led);
    if (!chips.length) continue;
    const rows = $$<HTMLTableRowElement>('[data-ledger-row]', led);
    const status = led.querySelector<HTMLElement>('[data-ledger-status]');
    led.addEventListener('click', (e) => {
      const chip = (e.target as Element).closest<HTMLButtonElement>('[data-ledger-filter]'); if (!chip) return;
      const [kind, val] = (chip.dataset.ledgerFilter ?? 'all').split(':');
      chips.forEach((c) => c.setAttribute('aria-pressed', String(c === chip)));
      let n = 0;
      rows.forEach((r) => { const ok = kind === 'all' || r.dataset[kind as 'service' | 'sector'] === val; r.hidden = !ok; if (ok) n++; });
      if (status) status.textContent = `${n} ${n === 1 ? 'resultado' : 'resultados'}`;
    });
  }
}

/* ───────────── Video (VSL en diálogo · video en línea) ───────────── */
function wireVideoTracking(v: HTMLVideoElement, title: string) {
  if (v.dataset.tracked) return; v.dataset.tracked = '1';
  let half = false;
  v.addEventListener('play', () => track('video_play', { title }), { once: true });
  v.addEventListener('timeupdate', () => { if (!half && v.duration && v.currentTime / v.duration >= 0.5) { half = true; track('video_50', { title }); } });
  v.addEventListener('ended', () => track('video_complete', { title }));
}
function initVideo() {
  for (const box of $$('[data-video]')) {
    if (box.dataset.video === 'modal') {
      const dlg = box.querySelector<HTMLDialogElement>('[data-video-dialog]');
      const v = dlg?.querySelector<HTMLVideoElement>('video');
      const open = box.querySelector<HTMLButtonElement>('[data-video-open]');
      if (!dlg || !v || !open) continue;
      const title = dlg.getAttribute('aria-label') ?? '';
      open.addEventListener('click', () => {
        if (!v.querySelector('source') && v.dataset.src) {
          const s = document.createElement('source'); s.src = v.dataset.src; s.type = v.dataset.type ?? 'video/mp4'; v.prepend(s); v.load();
        }
        wireVideoTracking(v, title);
        (window as any).__lenis?.stop?.();
        dlg.showModal();
        v.play().catch(() => {});
      });
      box.querySelector('[data-video-close]')?.addEventListener('click', () => dlg.close());
      dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });
      dlg.addEventListener('close', () => { v.pause(); (window as any).__lenis?.start?.(); });
    } else {
      const btn = box.querySelector<HTMLButtonElement>('[data-video-play]');
      const tpl = box.querySelector<HTMLTemplateElement>('[data-video-tpl]');
      const stage = box.querySelector<HTMLElement>('.vposter__stage');
      if (!btn || !tpl || !stage) continue;
      btn.addEventListener('click', () => {
        const v = tpl.content.querySelector('video')!.cloneNode(true) as HTMLVideoElement;
        stage.append(v); stage.classList.add('is-playing');
        wireVideoTracking(v, btn.getAttribute('aria-label') ?? '');
        v.play().catch(() => {}); v.focus();
      });
    }
  }
}

/* ───────────── Botón primario magnético ±6 px ───────────── */
async function initMagnetic() {
  const btns = $$('[data-magnetic]');
  if (!btns.length || reduced() || !fine()) return;
  const gsap = await loadGsap();
  for (const b of btns) {
    const xTo = gsap.quickTo(b, 'x', { duration: 0.4, ease: 'power3' });
    const yTo = gsap.quickTo(b, 'y', { duration: 0.4, ease: 'power3' });
    b.addEventListener('pointermove', (e) => {
      const r = b.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2), dy = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
      xTo(Math.max(-1, Math.min(1, dx)) * 6); yTo(Math.max(-1, Math.min(1, dy)) * 6);
    });
    b.addEventListener('pointerleave', () => { xTo(0); yTo(0); });
  }
}

/* ───────────── Regla de un azul (F15) ───────────── */
function initPrimaryRule() {
  const prim = $$('[data-primary]').filter((el) => !el.closest('.hdr,[data-nav],[role="banner"],body > header'));
  if (!prim.length || !('IntersectionObserver' in window)) return;
  root.dataset.primaryIo = 'ui';
  const vis = new Set<Element>();
  const io = new IntersectionObserver((entries) => {
    for (const en of entries) en.isIntersecting ? vis.add(en.target) : vis.delete(en.target);
    if (vis.size) root.setAttribute('data-primary-visible', ''); else root.removeAttribute('data-primary-visible');
  });
  prim.forEach((p) => io.observe(p));
}

/* ───────────── VktorRail: la línea se dibuja con scrub ───────────── */
async function initVrail() {
  const rails = $$('[data-vrail]');
  if (!rails.length || reduced()) return;
  const gsap = await loadGsap();
  const { ScrollTrigger } = await import('gsap/ScrollTrigger');
  gsap.registerPlugin(ScrollTrigger);
  for (const rail of rails) {
    const steps = $$('[data-vrail-step]', rail);
    const track = rail.querySelector<HTMLElement>('.vrail__track')!;
    let fr: number[] = [];
    const measure = () => {
      const t = track.getBoundingClientRect(); const vertical = t.height > t.width;
      fr = steps.map((s) => { const n = s.querySelector('.vrail__node')!.getBoundingClientRect();
        return vertical ? (n.top + n.height / 2 - t.top) / Math.max(1, t.height) : (n.left + n.width / 2 - t.left) / Math.max(1, t.width); });
    };
    const apply = (p: number) => {
      if (motionKilled) { rail.classList.remove('is-armed'); rail.style.setProperty('--p', '1'); return; }
      rail.style.setProperty('--p', p.toFixed(4));
      steps.forEach((s, i) => s.classList.toggle('is-lit', p >= fr[i] - 0.004));
    };
    rail.classList.add('is-armed'); measure(); apply(0);
    ScrollTrigger.create({ trigger: rail, start: 'top 82%', end: 'bottom 58%', scrub: 0.6, onUpdate: (st) => apply(st.progress), onRefresh: (st) => { measure(); apply(st.progress); } });
  }
}

/* ───────────── SystemFlow: ramas del isotipo (codos a 45°) ───────────── */
const NS = 'http://www.w3.org/2000/svg';
type P = { x: number; y: number };
const f = (n: number) => Math.round(n * 10) / 10;
function routeH(a: P, b: P) {           // horizontal → 45° → horizontal
  const dy = b.y - a.y, adx = Math.abs(dy), gap = b.x - a.x;
  if (Math.abs(dy) < 1) return `M${f(a.x)},${f(a.y)} H${f(b.x)}`;
  const d = Math.min(adx, Math.max(0, gap - 16)); const lead = (gap - d) / 2;
  return `M${f(a.x)},${f(a.y)} H${f(a.x + lead)} L${f(a.x + lead + d)},${f(a.y + Math.sign(dy) * d)} V${f(b.y)} H${f(b.x)}`;
}
function routeV(a: P, b: P) {           // vertical → 45° → vertical
  const dx = b.x - a.x, adx = Math.abs(dx), gap = b.y - a.y;
  if (adx < 1) return `M${f(a.x)},${f(a.y)} V${f(b.y)}`;
  const d = Math.min(adx, Math.max(0, gap - 16)); const lead = (gap - d) / 2;
  return `M${f(a.x)},${f(a.y)} V${f(a.y + lead)} L${f(a.x + Math.sign(dx) * d)},${f(a.y + lead + d)} H${f(b.x)} V${f(b.y)}`;
}
function routeHub(a: P, b: P, stacked: boolean) {   // pilar que baja y se abre en rama
  const dx = b.x - a.x, s = Math.sign(dx);
  if (stacked) {                       // b = borde izquierdo del grupo: baja por el pilar y entra a 45°
    const r = Math.min(18, Math.abs(dx) / 2);
    return `M${f(a.x)},${f(a.y)} V${f(b.y - r)} L${f(a.x + r)},${f(b.y)} H${f(b.x)}`;
  }
  if (Math.abs(dx) < 1) return `M${f(a.x)},${f(a.y)} V${f(b.y)}`;
  const r = Math.min(22, Math.abs(dx) / 2, (b.y - a.y) / 4); const ym = a.y + (b.y - a.y) * 0.46;
  return `M${f(a.x)},${f(a.y)} V${f(ym - r)} L${f(a.x + s * r)},${f(ym)} H${f(b.x - s * r)} L${f(b.x)},${f(ym + r)} V${f(b.y)}`;
}
function initFlow() {
  const flows = $$('[data-flow]');
  if (!flows.length) return;
  const motion = !reduced();
  for (const fl of flows) {
    const svg = fl.querySelector<SVGSVGElement>('.sflow__wires')!;
    const draw = () => {
      const R = fl.getBoundingClientRect();
      const rel = (r: DOMRect, px: number, py: number): P => ({ x: r.left - R.left + r.width * px, y: r.top - R.top + r.height * py });
      const paths: string[] = []; const joints: P[] = [];
      if (fl.dataset.flow === 'hub') {
        const hub = fl.querySelector('[data-flow-hub]')!.getBoundingClientRect();
        const a = rel(hub, 0.5, 1); joints.push(a);
        const tiles = $$('[data-flow-node] [data-flow-tile]', fl).map((t) => t.getBoundingClientRect());
        const stacked = tiles.length > 1 && Math.abs(tiles[0].left - tiles[1].left) < 4;
        for (const t of tiles) { const b = stacked ? rel(t, 0, 0.5) : rel(t, 0.5, 0); paths.push(routeHub(a, b, stacked)); joints.push(b); }
      } else {
        const tiles = $$('[data-flow-node] [data-flow-tile]', fl).map((t) => t.getBoundingClientRect());
        const vertical = tiles.length > 1 && tiles[1].left < tiles[0].right;
        for (let i = 0; i < tiles.length - 1; i++) {
          const t0 = tiles[i], t1 = tiles[i + 1];
          const a = vertical ? rel(t0, 0.5, 1) : rel(t0, 1, 0.5); const b = vertical ? rel(t1, 0.5, 0) : rel(t1, 0, 0.5);
          paths.push(vertical ? routeV({ x: a.x, y: a.y + 8 }, { x: b.x, y: b.y - 8 }) : routeH({ x: a.x + 8, y: a.y }, { x: b.x - 8, y: b.y }));
        }
      }
      svg.setAttribute('viewBox', `0 0 ${f(R.width)} ${f(R.height)}`);
      svg.replaceChildren(...paths.flatMap((d, k) => {
        const w = document.createElementNS(NS, 'path'); w.setAttribute('d', d); w.setAttribute('class', 'w'); w.setAttribute('pathLength', '1'); w.style.setProperty('--k', String(k));
        const p = document.createElementNS(NS, 'path'); p.setAttribute('d', d); p.setAttribute('class', 'p'); p.setAttribute('pathLength', '1'); p.style.setProperty('--d', `${(k * 0.7 + Math.random() * 1.2).toFixed(2)}s`);
        return motion ? [w, p] : [w];
      }), ...(fl.dataset.flow === 'hub' ? joints.slice(1) : []).map((j) => {
        const r = document.createElementNS(NS, 'rect'); r.setAttribute('class', 'j'); r.setAttribute('x', String(f(j.x - 3.5))); r.setAttribute('y', String(f(j.y - 3.5)));
        r.setAttribute('width', '7'); r.setAttribute('height', '7'); r.setAttribute('rx', '1.5'); return r;
      }));
      fl.setAttribute('data-flow-ready', '');
    };
    draw();
    let raf = 0; new ResizeObserver(() => { cancelAnimationFrame(raf); raf = requestAnimationFrame(draw); }).observe(fl);
    document.fonts?.ready.then(draw);
    if (!motion) { fl.classList.add('is-drawn', 'is-in'); continue; }
    if (inView(fl)) fl.classList.add('is-drawn');
    new IntersectionObserver(([en]) => {
      fl.classList.toggle('is-in', en.isIntersecting);
      if (en.isIntersecting && !fl.classList.contains('is-drawn')) requestAnimationFrame(() => fl.classList.add('is-drawn'));
    }, { rootMargin: '0px 0px -15% 0px' }).observe(fl);
  }
}

/* ───────────── Conteo de cifras contables (el valor final ya está en el HTML) ───────────── */
async function initCount() {
  const els = $$('[data-count]');
  if (!els.length || reduced()) return;
  const gsap = await loadGsap();
  const io = new IntersectionObserver((entries) => {
    for (const en of entries) {
      if (!en.isIntersecting) continue; io.unobserve(en.target);
      const el = en.target as HTMLElement; const to = Number(el.dataset.final ?? el.textContent); const o = { v: Number(el.dataset.from ?? 0) };
      gsap.to(o, { v: to, duration: 1.1, ease: 'power2.out', onUpdate: () => (el.textContent = String(Math.round(o.v))), onComplete: () => (el.textContent = String(to)) });
    }
  }, { rootMargin: '0px 0px -15% 0px' });
  for (const el of els) {
    if (inView(el) || !/^\d+$/.test(el.textContent ?? '')) continue;
    el.dataset.final = el.textContent!; el.textContent = el.dataset.from ?? '0'; io.observe(el);
  }
}

/* ───────────── Índice del artículo (TOC) ───────────── */
function initToc() {
  for (const toc of $$('[data-toc]')) {
    const links = $$<HTMLAnchorElement>('[data-toc-link]', toc);
    const details = toc.querySelector('details');
    if (details && matchMedia('(max-width: 1023px)').matches) details.open = false;
    const map = new Map<Element, HTMLAnchorElement>();
    links.forEach((l) => { const t = document.getElementById(decodeURIComponent(l.hash.slice(1))); if (t) map.set(t, l); });
    if (!map.size) continue;
    const io = new IntersectionObserver((entries) => {
      for (const en of entries) if (en.isIntersecting) {
        links.forEach((l) => l.removeAttribute('aria-current'));
        map.get(en.target)?.setAttribute('aria-current', 'true');
      }
    }, { rootMargin: '-20% 0px -70% 0px' });
    map.forEach((_, t) => io.observe(t));
    if (details && matchMedia('(max-width: 1023px)').matches) links.forEach((l) => l.addEventListener('click', () => (details.open = false)));
  }
}

/* ───────────── Interruptor "Reducir movimiento" en vivo ───────────── */
function initMotionSwitch() {
  addEventListener('ingeniak:motion', (e: Event) => {
    if (!(e as CustomEvent).detail?.reduced) return;
    motionKilled = true;
    root.classList.remove('ui-motion');
    $$('[data-ui-reveal],[data-ui-stagger],[data-pain]').forEach((el) => el.classList.add('is-in'));
    $$('.chat.is-live').forEach((c) => { c.classList.remove('is-live'); c.querySelector<HTMLElement>('[data-chat-pause]')?.setAttribute('hidden', ''); });
    $$('[data-vrail]').forEach((r) => { r.classList.remove('is-armed'); r.style.setProperty('--p', '1'); });
    $$('.script__still').forEach((s) => s.classList.remove('is-on'));
  });
}

/* ───────────── Arranque ───────────── */
export function initUI(): void {
  root.classList.add('ui-ready');
  const run = (name: string, fn: () => unknown) => { try { const r = fn(); if (r instanceof Promise) r.catch((e) => console.warn(`[ui:${name}]`, e)); } catch (e) { console.warn(`[ui:${name}]`, e); } };
  run('motion', initMotionSwitch);
  run('reveal', initReveal);
  run('faq', initFaq);
  run('chat', initChat);
  run('ledger', initLedger);
  run('video', initVideo);
  run('primary', initPrimaryRule);
  run('still', initStillTransition);
  run('flow', initFlow);
  run('toc', initToc);
  run('follow', initFollowStill);
  run('magnetic', initMagnetic);
  run('vrail', initVrail);
  run('count', initCount);
}
/** Alias por compatibilidad con el stub anterior. */
export const initUi = initUI;
