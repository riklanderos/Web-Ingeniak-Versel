// src/scripts/ui.ts — comportamiento del área "ui" (ESPEC-v2 §2.9–§2.13, §6 #25–45, §7.4).
// Todo por ganchos data-*; nada por elemento. Sin JS o con movimiento reducido, el contenido completo ya está en el HTML.
//   [data-ui-reveal] / [data-ui-stagger]  entradas (clase .is-in; estados previos solo opacity/translate bajo html.ui-motion,
//                                         nunca visibility; los bloques que anima cine no se pre-ocultan; el foco termina la entrada)
//   [data-faq]                            acordeón (grid-template-rows 0fr → 1fr). Plegado desde el primer cuadro (html.js), sin
//                                         transición en el arranque (.is-anim un cuadro después de ui-ready); al abrir o cerrar
//                                         vuelve a medir las escenas de cine (window.__cine.refresh, con rebote)
//   [data-chat]                           ChatSim: "escribiendo…", pestañas (dentro o fuera: [data-chat-tabs-for]), pausa
//                                         (WCAG 2.2.2), se detiene fuera de pantalla; data-chat-control="external" sigue "cine:step"
//   [data-station]                        StationUI: la demo se enciende (.is-on) al entrar
//   [data-follow-still]                   ScriptList: fotograma 21:9 que sigue al cursor (gsap.quickTo, pointer:fine)
//   [data-ledger]                         filtros del registro de resultados (sin fetch)
//   [data-video]                          VideoPoster: diálogo modal o reproducción en línea, carga al clic
//   [data-magnetic]                       botón primario magnético ±6 px (pointer:fine)
//   [data-primary]                        regla de un azul (F15): html[data-primary-visible] solo si el primario SE VE (intersecta,
//                                         sin [inert]/[data-primary-hidden], visibility visible, opacidad efectiva ≥ .5)
//                                         + atribución R10 (sessionStorage ingeniak-src / ingeniak-utm, evento cta_discovery_click)
//   a[data-still]                         corte por coincidencia: view-transition-name:plate en su imagen (§7.6)
//   [data-vrail] · [data-flow] · [data-pain] · [data-count] · [data-toc]
// Medición (R10): document dispatch "ingeniak:track" {name, …} — cta_discovery_click, faq_open, chat_sim_tab, video_play/50/complete.

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
const REVEAL_SEL = '[data-ui-reveal],[data-ui-stagger],[data-pain="draw"]';
/** Bloques cuya entrada ya anima cine (hijos directos del texto de una escena): ui no los pre-oculta.
 *  Si ui los dejara en opacity 0, el `from(autoAlpha:0)` de cine tomaría 0 como valor final y quedarían invisibles. */
const CINE_OWNED = ':is(.is__text,.is__aside) > *';
function initReveal() {
  const els = $$(REVEAL_SEL);
  // El foco (teclado) termina la entrada del bloque y de sus ancestros AL INSTANTE (.is-now: sin transición): nunca se
  // enfoca algo invisible ni a media opacidad. En captura, antes de que cualquier otro manejador mida el foco.
  document.addEventListener('focusin', (e) => {
    for (let n = e.target as Element | null; n && n !== document.body; n = n.parentElement) {
      if (n.matches(REVEAL_SEL) && !n.classList.contains('is-in')) n.classList.add('is-now', 'is-in');
    }
  }, true);
  if (!els.length) return;
  if (reduced() || !('IntersectionObserver' in window)) { els.forEach((e) => e.classList.add('is-in')); return; }
  // Lo que ya está en pantalla al cargar, y lo que anima cine, no se oculta (sin parpadeo, sin bloques atrapados en 0).
  els.forEach((e) => { if (inView(e) || e.matches(CINE_OWNED) || e.closest('[data-claimed]')) e.classList.add('is-in'); });
  root.classList.add('ui-motion');
  const pending = new Set<Element>();
  const done = (e: Element) => { e.classList.add('is-in'); io.unobserve(e); pending.delete(e); };
  const io = new IntersectionObserver((entries) => {
    // Entra al cruzar; y lo que ya quedó ARRIBA de la pantalla (scroll restaurado, salto a un ancla) se muestra sin animar.
    for (const en of entries) if (en.isIntersecting || en.boundingClientRect.bottom < 0) done(en.target);
  }, { rootMargin: '0px 0px -12% 0px', threshold: 0.01 });
  els.forEach((e) => { if (!e.classList.contains('is-in')) { pending.add(e); io.observe(e); } });
  // Un salto de scroll puede pasar un bloque sin que llegue a cruzar (no hay callback): al hacer scroll, lo que quedó arriba
  // entra; y al final del documento (el margen inferior de -12 % nunca se cruza) entra lo que esté en pantalla.
  let raf = 0;
  const sweep = () => {
    raf = 0;
    if (!pending.size) return;
    const end = innerHeight + scrollY >= document.documentElement.scrollHeight - 4;
    pending.forEach((e) => { const r = e.getBoundingClientRect(); if (r.bottom < 0 || (end && inView(e))) done(e); });
  };
  addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(sweep); }, { passive: true });
}

/* ───────────── FAQ ───────────── */
/** Vuelve a medir los ScrollTrigger de cine cuando cambia el alto de la página (rebote). */
let refreshT = 0;
const cineRefresh = (delay = 120) => {
  clearTimeout(refreshT);
  refreshT = window.setTimeout(() => { try { (window as any).__cine?.refresh?.(); } catch { /* cine aún no arranca */ } }, delay);
};
function initFaq() {
  const faqs = $$('[data-faq]');
  if (!faqs.length) return;
  // Las transiciones se habilitan un cuadro después del arranque: el estado inicial (plegado bajo html.js) nunca se anima.
  requestAnimationFrame(() => requestAnimationFrame(() => faqs.forEach((f) => f.classList.add('is-anim'))));
  for (const faq of faqs) {
    faq.addEventListener('click', (e) => {
      const btn = (e.target as Element).closest<HTMLButtonElement>('[data-faq-toggle]');
      if (!btn || !faq.contains(btn)) return;
      const item = btn.closest<HTMLElement>('[data-faq-item]')!;
      const open = btn.getAttribute('aria-expanded') !== 'true';
      btn.setAttribute('aria-expanded', String(open));
      item.classList.toggle('is-open', open);
      if (open) track('faq_open', { id: item.dataset.faqId });
      // Sin transición (movimiento reducido) el alto cambia ya; con transición, al terminar (y un respaldo por si no llega).
      cineRefresh(reduced() ? 60 : 520);
    });
    faq.addEventListener('transitionend', (e) => {
      if ((e as TransitionEvent).propertyName === 'grid-template-rows') cineRefresh(40);
    });
  }
}

/* ───────────── ChatSim ───────────── */
// En vivo el teléfono tiene alto FIJO (CSS) y la conversación crece desde abajo como un chat real: las burbujas pendientes no
// ocupan lugar (la página nunca salta) y "escribiendo…" va en el flujo, después de la última burbuja visible.
// Sin JS, con movimiento reducido o con save-data: la conversación completa, quieta.
const deskMQ = () => matchMedia('(min-width: 768px) and (min-aspect-ratio: 5/6)').matches;
const fitted = new WeakSet<Element>();
function wireTablist(list: HTMLElement, onPick: (key: string, focus: boolean) => void) {
  const tabs = () => $$<HTMLButtonElement>('[data-chat-tab]', list);
  list.addEventListener('click', (e) => {
    const t = (e.target as Element).closest<HTMLButtonElement>('[data-chat-tab]');
    if (t && list.contains(t)) onPick(t.dataset.chatTab!, false);
  });
  list.addEventListener('keydown', (e) => {
    const t = (e.target as Element).closest<HTMLButtonElement>('[data-chat-tab]'); if (!t) return;
    const all = tabs(); const i = all.indexOf(t);
    let j = -1;
    if (e.key === 'Home') j = 0; else if (e.key === 'End') j = all.length - 1;
    else if (e.key === 'ArrowRight') j = (i + 1) % all.length; else if (e.key === 'ArrowLeft') j = (i - 1 + all.length) % all.length;
    if (j < 0) return;
    e.preventDefault(); onPick(all[j].dataset.chatTab!, true);
  });
  // Pestañas que no caben (320 px, teléfonos estrechos): desplazamiento horizontal con snap y un borde que se desvanece.
  if (fitted.has(list)) return;
  fitted.add(list);
  const fit = () => list.classList.toggle('is-scroll', list.scrollWidth > list.clientWidth + 1);
  fit();
  if ('ResizeObserver' in window) new ResizeObserver(fit).observe(list);
}
function initChat() {
  for (const chat of $$('[data-chat]')) {
    const ext = chat.id ? $$<HTMLElement>(`[data-chat-tabs-for~="${CSS.escape(chat.id)}"]`) : [];
    // tabsFor="<id>": la página trae su propia lista de pestañas (role=tablist) con ese id
    const own = chat.dataset.chatTabsExt ? document.getElementById(chat.dataset.chatTabsExt) : null;
    if (own && !ext.includes(own)) { own.dataset.chatTabsFor ??= chat.id; ext.push(own); }
    const lists = [...$$<HTMLElement>('.chat__tabs[role="tablist"]', chat), ...ext];
    const tabs = () => lists.flatMap((l) => $$<HTMLButtonElement>('[data-chat-tab]', l));
    const panels = $$<HTMLOListElement>('[data-chat-panel]', chat);
    if (!panels.length) continue;
    const notes = $$<HTMLElement>('[data-chat-note]', chat);
    const screen = chat.querySelector<HTMLElement>('.chat__screen')!;
    const device = chat.querySelector<HTMLElement>('.chat__device')!;
    const pauseBtn = chat.querySelector<HTMLButtonElement>('[data-chat-pause]');
    const more = chat.querySelector<HTMLAnchorElement>('[data-chat-more]');
    const saveData = !!(navigator as any).connection?.saveData;
    const live = chat.hasAttribute('data-autoplay') && !reduced() && !saveData;
    const external = chat.dataset.chatControl === 'external';
    const prefill = Math.max(0, Number(chat.dataset.prefill ?? 2) || 0);
    let current = panels.find((p) => !p.hidden) ?? panels[0];
    let timer = 0, idx = 0, paused = false, visible = false, running = false, stepMode = false, lastP = 0, waited = false;

    const msgs = () => $$<HTMLElement>('.chat__msg', current);
    const typingEl = () => current.querySelector<HTMLElement>('.chat__typing');
    const rendered = () => device.getClientRects().length > 0;            // con la miniatura en su lugar, el chat no corre
    /** Desplaza la pantalla (no la página) lo justo para que se vea el elemento. */
    const reveal = (el?: HTMLElement | null) => {
      if (!el || screen.scrollHeight <= screen.clientHeight + 1) return;
      const r = el.getBoundingClientRect(), s = screen.getBoundingClientRect();
      const pad = pauseBtn && !pauseBtn.hidden && getComputedStyle(pauseBtn).position === 'absolute' ? pauseBtn.offsetHeight + 14 : 10;
      const d = r.bottom - s.bottom + pad;
      if (d > 0) screen.scrollTo({ top: screen.scrollTop + d, behavior: reduced() ? 'auto' : 'smooth' });
    };
    const setShown = (n: number) => msgs().forEach((m, i) => m.classList.toggle('is-pending', i >= n));
    /** Burbujas de entrada: `prefill` como mínimo y, en el teléfono en línea, las necesarias para llenar la mitad de la
     *  pantalla (nunca un cristal vacío); siempre quedan al menos 2 por reproducir. */
    const startCount = () => {
      const list = msgs(); const base = Math.min(prefill, list.length);
      setShown(base);
      if (!chat.classList.contains('chat--inline') || !screen.clientHeight) return base;
      // alto ocupado = del primer renglón (sello u hoja) a la última burbuja visible; la conversación está apoyada abajo,
      // así que el primer renglón sube con cada burbuja: se mide en cada vuelta
      const first = current.firstElementChild as HTMLElement;
      const filled = (k: number) => (k > 0 ? list[k - 1].getBoundingClientRect().bottom - first.getBoundingClientRect().top : 0);
      let n = base; const max = Math.max(base, list.length - 2), target = screen.clientHeight * 0.5;
      while (n < max && filled(n) < target) setShown(++n);
      return n;
    };
    const typingAt = (m: HTMLElement | null) => {
      const t = typingEl(); if (!t) return;
      if (!m) { t.classList.remove('is-on'); return; }
      t.classList.add('is-on');
      reveal(t);
    };
    const moreState = () => {
      if (!more) return;
      chat.classList.toggle('has-more', screen.scrollHeight - screen.clientHeight - screen.scrollTop > 8);
    };
    const halt = () => { clearTimeout(timer); running = false; };
    const finish = () => {               // estado final (movimiento reducido en vivo): conversación completa, quieta
      halt(); stepMode = false; chat.classList.remove('is-live', 'is-paused', 'is-reset');
      panels.forEach((p) => $$('.chat__msg', p).forEach((m) => m.classList.remove('is-pending')));
      typingEl()?.classList.remove('is-on');
      if (pauseBtn) pauseBtn.hidden = true;
      screen.setAttribute('data-lenis-prevent', '');
      moreState();
    };
    const step = () => {
      running = false;
      if (motionKilled) { finish(); return; }
      if (paused || !visible || document.hidden || stepMode || !rendered()) return;
      running = true;
      const list = msgs();
      if (idx >= list.length) {
        // Al terminar: pausa larga, se desvanece y vuelve con las burbujas de entrada (nunca un teléfono vacío).
        timer = window.setTimeout(() => {
          typingAt(null); chat.classList.add('is-reset');
          timer = window.setTimeout(() => {
            idx = startCount(); screen.scrollTop = 0;
            chat.classList.remove('is-reset'); step();
          }, 550);
        }, 5200);
        return;
      }
      const m = list[idx];
      const from = m.dataset.from;
      const d = idx === 0 ? 450 : Number(m.dataset.delay) || (from === 'kain' ? 1100 : from === 'sistema' ? 500 : 1000);
      if (from === 'kain') typingAt(m);
      timer = window.setTimeout(() => { typingAt(null); m.classList.remove('is-pending'); reveal(m); idx++; step(); }, d);
    };
    const resume = () => {
      if (running || paused || !visible || document.hidden || stepMode) return;
      clearTimeout(timer);
      // Control externo en escritorio: se espera el primer "cine:step" (1.2 s); si no llega, corre el temporizador.
      if (external && deskMQ() && !waited) { running = true; timer = window.setTimeout(() => { waited = true; running = false; resume(); }, 1200); return; }
      step();
    };
    /** Control externo: progreso 0 → 1 de la escena = burbuja n (y "escribiendo…" a media transición hacia una de Kain). */
    const applyProgress = (p: number) => {
      lastP = p;
      const list = msgs(); const total = list.length;
      const x = Math.max(0, Math.min(1, p)) * total;
      const n = Math.max(Math.min(prefill, total), Math.min(total, Math.floor(x + 0.15)));
      setShown(n);
      const next = list[n];
      typingAt(next && next.dataset.from === 'kain' && x - Math.floor(x) > 0.45 ? next : null);
      reveal(list[n - 1]);
      idx = n;
    };

    const select = (key: string, focus = false) => {
      const next = panels.find((p) => p.dataset.chatPanel === key);
      tabs().forEach((t) => {
        const on = t.dataset.chatTab === key;
        t.setAttribute('aria-selected', String(on)); t.tabIndex = on ? 0 : -1;
        if (on) { const l = t.parentElement!; l.scrollTo({ left: Math.max(0, t.offsetLeft - l.offsetLeft - 8), behavior: 'smooth' }); if (focus) t.focus(); }
      });
      if (!next || next === current) return;
      notes.forEach((n) => (n.hidden = n.dataset.chatNote !== key));
      halt(); typingAt(null);
      current.hidden = true; next.hidden = false; current = next;
      if (more) more.href = `#${chat.id}-end-${key}`;
      screen.classList.remove('is-swipe'); void screen.offsetWidth; screen.classList.add('is-swipe');
      screen.scrollTop = 0;
      if (chat.classList.contains('is-live')) {
        if (stepMode) applyProgress(lastP);
        else { idx = startCount(); resume(); }
      }
      moreState();
      cineRefresh(200);                                                   // el alto del chat en línea cambia con el guion
      const owner = ext.find((l) => l.contains(document.activeElement));
      if (!owner || owner.dataset.chatTabsFor!.trim().split(/\s+/)[0] === chat.id) track('chat_sim_tab', { sector: key });
    };
    lists.forEach((l) => wireTablist(l, (k, f) => select(k, f)));

    if (more) {
      more.addEventListener('click', (e) => { e.preventDefault(); screen.scrollTo({ top: screen.scrollHeight, behavior: reduced() ? 'auto' : 'smooth' }); });
      screen.addEventListener('scroll', moreState, { passive: true });
      if ('ResizeObserver' in window) new ResizeObserver(moreState).observe(screen);
      moreState();
    }
    if (!live) { screen.setAttribute('data-lenis-prevent', ''); continue; }

    chat.classList.add('is-live');
    screen.removeAttribute('tabindex');
    screen.removeAttribute('data-lenis-prevent');
    panels.forEach((p) => { if (p !== current) $$('.chat__msg', p).forEach((m) => m.classList.add('is-pending')); });
    idx = startCount();                                                   // nunca un cristal vacío: burbujas de entrada
    if (pauseBtn) {
      pauseBtn.hidden = false;
      pauseBtn.addEventListener('click', () => {
        paused = !paused;
        chat.classList.toggle('is-paused', paused);
        paused ? screen.setAttribute('data-lenis-prevent', '') : screen.removeAttribute('data-lenis-prevent');
        pauseBtn.setAttribute('aria-pressed', String(paused));
        pauseBtn.setAttribute('aria-label', (paused ? chat.dataset.labelPlay : chat.dataset.labelPause) ?? (paused ? 'Reanudar' : 'Pausar'));
        if (paused) halt(); else resume();
      });
    }
    if (external) {
      document.addEventListener('cine:step', (e) => {
        const d = ((e as CustomEvent).detail ?? {}) as { progress?: number; controlled?: boolean; el?: Element; section?: Element };
        const scope = d.el ?? d.section ?? (e.target instanceof Element ? e.target : null);
        if (scope && !scope.contains(chat)) return;
        if (motionKilled || !chat.classList.contains('is-live')) return;
        // La escena suelta el control (pin destruido, cambio a móvil): vuelve el temporizador desde donde iba.
        if (d.controlled === false) {
          if (stepMode) { stepMode = false; if (pauseBtn) pauseBtn.hidden = false; resume(); }
          return;
        }
        if (typeof d.progress !== 'number' || !deskMQ()) return;
        if (!stepMode) { stepMode = true; halt(); if (pauseBtn) pauseBtn.hidden = true; }
        applyProgress(d.progress);
      });
    }
    // Visible = un tercio del chat en pantalla (o un tercio de la pantalla ocupado): el guion arranca en cuanto el teléfono entra.
    new IntersectionObserver(([en]) => {
      visible = en.isIntersecting && en.intersectionRect.height >= Math.min(en.boundingClientRect.height, innerHeight) * 0.33;
      visible ? resume() : halt();
    }, { threshold: [0, 0.1, 0.2, 0.33, 0.4, 0.5, 0.75, 1] }).observe(chat);
    document.addEventListener('visibilitychange', () => (document.hidden ? halt() : resume()));
    (chat as any).__chatFinish = finish;
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
/** Disparador como <a href="video.mp4"> (sin JS, o si el JS falla, abre el archivo): con JS se comporta como botón. */
function asButton(el: HTMLElement) {
  if (!(el instanceof HTMLAnchorElement)) return;
  el.setAttribute('role', 'button');
  el.addEventListener('keydown', (e) => { if (e.key === ' ') { e.preventDefault(); el.click(); } });
}
function initVideo() {
  for (const box of $$('[data-video]')) {
    if (box.dataset.video === 'modal') {
      const dlg = box.querySelector<HTMLDialogElement>('[data-video-dialog]');
      const v = dlg?.querySelector<HTMLVideoElement>('video');
      const open = box.querySelector<HTMLElement>('[data-video-open]');
      if (!dlg || !v || !open) continue;
      const title = dlg.getAttribute('aria-label') ?? '';
      asButton(open);
      open.addEventListener('click', (e) => {
        e.preventDefault();
        const src = v.dataset.src ?? (open instanceof HTMLAnchorElement ? open.href : '');
        if (!v.querySelector('source') && src) {
          const s = document.createElement('source'); s.src = src; s.type = v.dataset.type ?? 'video/mp4'; v.prepend(s); v.load();
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
      const btn = box.querySelector<HTMLElement>('[data-video-play]');
      const tpl = box.querySelector<HTMLTemplateElement>('[data-video-tpl]');
      const stage = box.querySelector<HTMLElement>('.vposter__stage');
      if (!btn || !tpl || !stage) continue;
      asButton(btn);
      btn.addEventListener('click', (e) => {
        e.preventDefault();
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
// Un primario cuenta como visible solo si intersecta Y se ve: fuera de [inert]/[data-primary-hidden], visibility visible y
// opacidad efectiva (el botón y 4 ancestros multiplicados) ≥ .5. Un CTA atenuado por una toma compartida no apaga el del encabezado.
const HEADER_SEL = '.hdr,[data-nav],[role="banner"],body > header';
function seen(el: HTMLElement) {
  if (el.closest('[inert],[data-primary-hidden]')) return false;
  const cs = getComputedStyle(el);
  if (cs.visibility === 'hidden' || cs.display === 'none') return false;
  let o = Number(cs.opacity) || 0;
  for (let n = el.parentElement, k = 0; n && k < 4 && o >= 0.5; n = n.parentElement, k++) o *= Number(getComputedStyle(n).opacity);
  return o >= 0.5;
}
function initPrimaryRule() {
  if (!('IntersectionObserver' in window)) return;
  root.dataset.primaryIo = 'ui';                     // nav (persist.ts) cede la regla a ui y no duplica el observador
  const inter = new Set<HTMLElement>();
  const watched = new WeakSet<Element>();
  // Un primario en pantalla que todavía está entrando (opacidad < .5 por su revelado) se vuelve a medir cada 250 ms hasta
  // 3 s después del último evento: con la página quieta, el CTA del encabezado no se queda azul junto al primario que
  // termina de aparecer (cierre Dawn, portada con la CPU cargada).
  let retry = 0, tries = 0;
  const evaluate = () => {
    let on = false, fading = false;
    for (const el of inter) {
      if (seen(el)) { on = true; break; }
      if (!el.closest('[inert],[data-primary-hidden]')) fading = true;
    }
    if (on !== root.hasAttribute('data-primary-visible')) root.toggleAttribute('data-primary-visible', on);
    clearTimeout(retry);
    if (!on && fading && tries < 12) { tries++; retry = window.setTimeout(schedule, 250); }
  };
  let raf = 0;
  const schedule = () => { if (!raf) raf = requestAnimationFrame(() => { raf = 0; evaluate(); }); };
  const kick = () => { tries = 0; schedule(); };
  const io = new IntersectionObserver((entries) => {
    for (const en of entries) en.isIntersecting ? inter.add(en.target as HTMLElement) : inter.delete(en.target as HTMLElement);
    tries = 0;
    evaluate();
  });
  const scan = () => $$('[data-primary]').forEach((p) => {
    if (watched.has(p) || p.closest(HEADER_SEL)) return;
    watched.add(p); io.observe(p);
  });
  scan();
  // Mientras haya un primario en pantalla, su opacidad puede cambiar con el scroll (tomas compartidas, salidas con parallax).
  addEventListener('scroll', () => { if (inter.size) kick(); }, { passive: true });
  document.addEventListener('cine:primary-change', kick);
  addEventListener('load', () => { scan(); kick(); }, { once: true });
}

/* ───────────── Atribución R10 ───────────── */
// Primer clic en un primario (o el CTA del encabezado/barra) hacia /discovery/: sessionStorage['ingeniak-src'] = `${folio}-${sección}` + evento cta_discovery_click.
// Llegada con utm_*: sessionStorage['ingeniak-utm'] = JSON. Nada personal en la URL; todo almacenamiento dentro de try/catch.
const UTM = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];
const ssGet = (k: string): string | null => { try { return sessionStorage.getItem(k); } catch { return null; } };
const ssSet = (k: string, v: string) => { try { sessionStorage.setItem(k, v); } catch { /* bloqueado: sin atribución */ } };
function initAttribution() {
  try {
    const q = new URLSearchParams(location.search);
    const utm = UTM.filter((k) => q.get(k)).map((k) => [k, q.get(k)!.slice(0, 120)]);
    if (utm.length && !ssGet('ingeniak-utm')) ssSet('ingeniak-utm', JSON.stringify(Object.fromEntries(utm)));
  } catch { /* URL sin parámetros legibles */ }
  const folio = () => document.body.dataset.folio ?? document.querySelector<HTMLElement>('[data-folio]')?.dataset.folio ?? document.body.dataset.page ?? 'web';
  document.addEventListener('click', (e) => {
    const a = (e.target as Element | null)?.closest?.('a[data-primary],a.btn') as HTMLAnchorElement | null;
    if (!a) return;
    let path = '';
    try { path = new URL(a.href, location.href).pathname; } catch { return; }
    if (!/^\/discovery\/?$/.test(path)) return;
    const section = a.dataset.section ?? a.closest('section[id],[data-section-id]')?.id ?? (a.closest(HEADER_SEL) ? 'header' : a.closest('[data-cta-bar],.mcta') ? 'barra' : 'page');
    const src = `${folio()}-${section}`;
    if (!ssGet('ingeniak-src')) ssSet('ingeniak-src', src);
    track('cta_discovery_click', { section, folio: folio(), src });
  }, true);
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
    // La pista termina donde EMPIEZA la última columna: el nodo de la fase 5 queda 4–5 px más allá de su final (fracción > 1).
    // Se acota a 1 para que la última fase (R · Rise) se encienda cuando la línea llega al final (antes nunca se encendía).
    const measure = () => {
      const t = track.getBoundingClientRect(); const vertical = t.height > t.width;
      fr = steps.map((s) => { const n = s.querySelector('.vrail__node')!.getBoundingClientRect();
        const x = vertical ? (n.top + n.height / 2 - t.top) / Math.max(1, t.height) : (n.left + n.width / 2 - t.left) / Math.max(1, t.width);
        return Math.min(1, Math.max(0, x)); });
    };
    const apply = (p: number) => {
      if (motionKilled) { rail.classList.remove('is-armed'); rail.style.setProperty('--p', '1'); return; }
      rail.style.setProperty('--p', p.toFixed(4));
      steps.forEach((s, i) => s.classList.toggle('is-lit', p >= fr[i] - 0.004));
    };
    rail.classList.add('is-armed'); measure(); apply(0);
    // Termina con la última fase aún en la parte alta-media de la pantalla; al salir por arriba queda todo encendido.
    ScrollTrigger.create({ trigger: rail, start: 'top 82%', end: 'bottom 66%', scrub: 0.6,
      onUpdate: (st) => apply(st.progress), onRefresh: (st) => { measure(); apply(st.progress); }, onLeave: () => apply(1) });
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
      gsap.to(o, { v: to, duration: 1.1, ease: 'power2.out', onUpdate: () => { el.textContent = String(Math.round(o.v)); }, onComplete: () => { el.textContent = String(to); } });
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
    // Renglón activo por POSICIÓN: la última sección cuyo inicio ya pasó el 32 % superior de la pantalla. Un observador de
    // intersección no marcaba nada cuando la sección se saltaba (ancla, Lenis inmediato, scroll rápido) y dejaba activa una
    // anterior. Se mide una vez por cuadro con scroll, cambio de tamaño o de ancla.
    const targets = links.map((l) => document.getElementById(decodeURIComponent(l.hash.slice(1))));
    if (!targets.some(Boolean)) continue;
    let queued = false, last = -2;
    const mark = () => {
      queued = false;
      let cur = -1;
      const line = innerHeight * 0.32;
      targets.forEach((t, i) => { if (t && t.getBoundingClientRect().top < line) cur = i; });
      if (cur === last) return;
      last = cur;
      links.forEach((l, i) => (i === cur ? l.setAttribute('aria-current', 'true') : l.removeAttribute('aria-current')));
    };
    const queue = () => { if (!queued) { queued = true; requestAnimationFrame(mark); } };
    addEventListener('scroll', queue, { passive: true });
    addEventListener('resize', queue, { passive: true });
    addEventListener('hashchange', queue);
    mark();
    if (details && matchMedia('(max-width: 1023px)').matches) links.forEach((l) => l.addEventListener('click', () => (details.open = false)));
  }
}

/* ───────────── StationUI: la demo de cada estación se enciende al entrar ───────────── */
// .is-on una sola vez (con 35 % visible). Sin JS o con movimiento reducido el CSS ya pinta el estado final.
// Una escena puede encenderla por su cuenta: document → "ui:station" {el, on}.
function initStations() {
  const st = $$('[data-station]');
  if (!st.length) return;
  if (reduced() || !('IntersectionObserver' in window)) { st.forEach((s) => s.classList.add('is-on')); return; }
  root.classList.add('ui-motion');
  st.forEach((s) => s.classList.add('is-armed'));
  const io = new IntersectionObserver((entries) => {
    for (const en of entries) if (en.isIntersecting && en.intersectionRatio >= 0.35) { en.target.classList.add('is-on'); io.unobserve(en.target); }
  }, { threshold: [0, 0.35, 0.6] });
  st.forEach((s) => io.observe(s));
  document.addEventListener('ui:station', (e) => {
    const d = (e as CustomEvent).detail ?? {};
    if (d.el instanceof Element && d.el.matches('[data-station]')) d.el.classList.toggle('is-on', d.on !== false);
  });
}

/* ───────────── Interruptor "Reducir movimiento" en vivo ───────────── */
function initMotionSwitch() {
  addEventListener('ingeniak:motion', (e: Event) => {
    if (!(e as CustomEvent).detail?.reduced) return;
    motionKilled = true;
    root.classList.remove('ui-motion');
    $$('[data-ui-reveal],[data-ui-stagger],[data-pain]').forEach((el) => el.classList.add('is-in'));
    $$('.chat.is-live').forEach((c) => (c as any).__chatFinish?.());
    $$('[data-station]').forEach((st) => st.classList.add('is-on'));
    $$('[data-faq]').forEach((f) => f.classList.remove('is-anim'));
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
  run('stations', initStations);
  run('ledger', initLedger);
  run('video', initVideo);
  run('primary', initPrimaryRule);
  run('attribution', initAttribution);
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
