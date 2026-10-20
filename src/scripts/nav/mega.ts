// src/scripts/nav/mega.ts — mega menú "Sala de proyección" (ESPEC §4.2).
// Hover con intención (100 ms abre, 200 ms de gracia), clic, Enter/Espacio, ↓ abre y enfoca, flechas dentro del panel,
// Esc cierra y devuelve el foco. Fondo de cristal único que cambia de alto entre paneles; pill que se desliza entre entradas.
// La pantalla de previsualización carga la placa de 1280 px de la portada destino (AVIF → WebP → respaldo) la primera vez que
// se abre cada panel y la encuadra con las variables de data-frame (caja del sujeto: Kain siempre de cuerpo completo).
import { lock, unlock, track } from './overlay';

const FALLBACK = '/img/cine/home-sistema-2-atender-1280';
const DESK = '(min-width: 1180px)';

export type MegaApi = { open: (key: string, focusFirst?: boolean) => void; close: (returnFocus?: boolean) => void; current: () => string | null };

export function initMega(): MegaApi | undefined {
  // El elemento se toma explícito: <html> lleva data-hdr-state y un selector de atributo podría devolverlo a él.
  const hdr = document.querySelector<HTMLElement>('header.hdr');
  if (!hdr) return;
  const html = document.documentElement;
  const bg = hdr.querySelector<HTMLElement>('.mm-bg');
  const pill = hdr.querySelector<HTMLElement>('.hdr__pill');
  const nav = hdr.querySelector<HTMLElement>('.hdr__nav');
  const triggers = [...hdr.querySelectorAll<HTMLButtonElement>('[data-mm-trigger]')];
  const entries = [...hdr.querySelectorAll<HTMLElement>('.hdr__list > .hdr__item > .hdr__link')];
  if (!triggers.length) return;
  const fine = matchMedia('(hover: hover) and (pointer: fine)');
  const desk = matchMedia(DESK);
  const loaded = new Set<string>();
  let openKey: string | null = null;
  let openedAt = 0;
  let openedBy: 'hover' | 'click' | 'key' = 'click';
  let tOpen = 0;
  let tClose = 0;
  let arrowing = false;

  const panelOf = (k: string) => hdr.querySelector<HTMLElement>(`#mm-${k}`);
  const triggerOf = (k: string) => triggers.find((t) => t.dataset.mmTrigger === k);

  // ---------- pill indicador ----------
  const movePill = (el: HTMLElement | null | undefined) => {
    if (!pill) return;
    if (!el || !desk.matches) { pill.classList.remove('is-on'); return; }
    const hr = hdr.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    const first = !pill.classList.contains('is-on');
    if (first) pill.classList.add('no-anim');
    pill.style.setProperty('--px', `${r.left - hr.left}px`);
    pill.style.setProperty('--py', `${r.top - hr.top}px`);
    pill.style.setProperty('--pw', `${r.width}px`);
    pill.style.setProperty('--ph', `${r.height}px`);
    if (first) { void pill.offsetWidth; pill.classList.remove('no-anim'); }
    pill.classList.add('is-on');
  };
  const restPill = () => movePill(openKey ? triggerOf(openKey) : null);

  // ---------- placas encuadradas ----------
  // data-frame = "--ar:…;--sx:…;--sy:…;--sw:…;--sh:…;--sd:±1" (navData → screenFrame). Se aplican una a una con setProperty
  // para no pisar otros estilos en línea (vt.ts presta view-transition-name a la imagen visible).
  const FRAME_KEYS = ['--ar', '--sx', '--sy', '--sw', '--sh', '--sd'];
  const applyFrame = (img: HTMLImageElement, frame?: string) => {
    const vals = new Map((frame ?? '').split(';').map((kv) => kv.split(':').map((x) => x.trim()) as [string, string]));
    for (const k of FRAME_KEYS) { const v = vals.get(k); if (v) img.style.setProperty(k, v); else img.style.removeProperty(k); }
  };
  const fbOf = (img: HTMLImageElement) => {
    const scr = img.closest<HTMLElement>('[data-mm-screen]');
    return { src: scr?.dataset.fbSrc ?? FALLBACK, frame: scr?.dataset.fbFrame ?? '' };
  };
  const setImg = (img: HTMLImageElement, base: string, frame: string | undefined, done?: () => void) => {
    const fb = fbOf(img);
    const tries: [string, string | undefined][] = [[`${base}.avif`, frame], [`${base}.webp`, frame], [`${fb.src}.avif`, fb.frame], [`${fb.src}.webp`, fb.frame]];
    let n = 0;
    const next = () => {
      if (n >= tries.length) return;
      img.onerror = () => { n++; next(); };
      img.onload = () => { img.onload = img.onerror = null; done?.(); };
      applyFrame(img, tries[n][1]);
      img.src = tries[n][0];
    };
    next();
  };
  const loadPanel = (panel: HTMLElement) => {
    const k = panel.dataset.mmPanel!;
    if (loaded.has(k)) return;
    loaded.add(k);
    const first = panel.querySelector<HTMLImageElement>('.mm-screen__img[data-src]');
    const scr0 = panel.querySelector<HTMLElement>('[data-mm-screen]');
    if (first) setImg(first, first.dataset.src!, scr0?.dataset.defaultFrame);
    // Precarga en segundo plano los stills de los enlaces de este panel (≤ 35 KB c/u).
    const seen = new Set<string>();
    panel.querySelectorAll<HTMLElement>('[data-still-src]').forEach((a) => {
      const b = a.dataset.stillSrc!;
      if (seen.has(b)) return;
      seen.add(b);
      const im = new Image();
      (im as any).fetchPriority = 'low';
      im.decoding = 'async';
      im.onerror = () => { im.onerror = null; im.src = `${b}.webp`; };
      im.src = `${b}.avif`;
    });
  };

  // ---------- pantalla ----------
  type ScreenData = { src: string; frame?: string; copy?: string; label: string; title: string; line: string; href: string; fig?: Element | null };
  const setScreen = (panel: HTMLElement, d: ScreenData) => {
    const scr = panel.querySelector<HTMLAnchorElement>('[data-mm-screen]');
    if (!scr) return;
    scr.href = d.href;
    scr.dataset.copy = d.copy === 'r' ? 'r' : 'l';
    if (/^https?:/.test(d.href)) { scr.target = '_blank'; scr.rel = 'noopener'; } else { scr.removeAttribute('target'); scr.removeAttribute('rel'); }
    const hud = panel.querySelector<HTMLElement>('[data-screen="hud"]');
    if (hud) hud.textContent = d.href.replace(/^https?:\/\//, '');
    for (const f of ['label', 'title', 'line'] as const) {
      const el = scr.querySelector<HTMLElement>(`[data-screen="${f}"]`);
      if (el) el.textContent = d[f];
    }
    // Cifra del caso delante de su línea: copia del [data-metric] del propio enlace (sale de metrics.ts en el HTML).
    const lineEl = scr.querySelector<HTMLElement>('[data-screen="line"]');
    if (lineEl && d.fig) {
      const b = document.createElement('b');
      b.className = 'mm-screen__fig';
      b.dataset.metric = (d.fig as HTMLElement).dataset.metric ?? '';
      b.textContent = d.fig.textContent;
      lineEl.prepend(b, ' ');
    }
    const imgs = [...scr.querySelectorAll<HTMLImageElement>('.mm-screen__img')];
    const on = imgs.find((i) => i.classList.contains('is-on'));
    if (on?.dataset.base === d.src) return;
    const off = imgs.find((i) => i !== on) ?? imgs[0];
    off.dataset.base = d.src;
    const token = (scr.dataset.token = String(Math.random()));
    setImg(off, d.src, d.frame, () => {
      if (scr.dataset.token !== token) return;
      on?.classList.remove('is-on');
      off.classList.add('is-on');
    });
  };
  const fromLink = (a: HTMLElement): ScreenData => ({
    fig: a.hasAttribute('data-screen-fig') ? a.querySelector('[data-metric]') : null,
    src: a.dataset.stillSrc ?? FALLBACK,
    frame: a.dataset.frame,
    copy: a.dataset.copy,
    label: a.dataset.screenLabel ?? '',
    title: a.dataset.screenTitle ?? a.textContent?.trim() ?? '',
    line: a.dataset.screenLine ?? '',
    href: a.getAttribute('href') ?? '#',
  });
  const resetScreen = (panel: HTMLElement) => {
    const scr = panel.querySelector<HTMLAnchorElement>('[data-mm-screen]');
    if (!scr) return;
    const first = scr.querySelector<HTMLImageElement>('.mm-screen__img');
    if (first && !first.dataset.base) first.dataset.base = scr.dataset.defaultSrc;
    setScreen(panel, {
      fig: scr.dataset.defaultFig ? panel.querySelector(`.mm-main [data-metric="${scr.dataset.defaultFig}"]`) : null,
      src: scr.dataset.defaultSrc ?? FALLBACK,
      frame: scr.dataset.defaultFrame,
      copy: scr.dataset.defaultCopy,
      label: scr.dataset.defaultLabel ?? '',
      title: scr.dataset.defaultTitle ?? '',
      line: scr.dataset.defaultLine ?? '',
      href: scr.dataset.defaultHref ?? scr.href,
    });
    setStage(panel, null);
  };

  // ---------- línea del sistema (Servicios) ----------
  const setStage = (panel: HTMLElement, stage: number | null) => {
    const st = panel.querySelector<HTMLElement>('[data-stages]');
    if (!st) return;
    st.querySelectorAll<HTMLElement>('.mm-col').forEach((c) => c.toggleAttribute('data-on', stage !== null && Number(c.dataset.stage) === stage));
    if (stage === null) { st.removeAttribute('data-active'); st.style.setProperty('--k', '0'); }
    else { st.setAttribute('data-active', ''); st.style.setProperty('--k', String(stage - 1)); }
  };

  // ---------- abrir / cerrar ----------
  const measureBg = (panel: HTMLElement) => {
    if (!bg) return;
    bg.style.setProperty('--mm-h', `${panel.offsetHeight}px`);
  };

  function open(k: string, focusFirst = false, by: 'hover' | 'click' | 'key' = 'click') {
    if (!desk.matches) return;
    const panel = panelOf(k);
    const trig = triggerOf(k);
    if (!panel || !trig) return;
    clearTimeout(tClose);
    const wasOpen = !!openKey;
    if (openKey && openKey !== k) {
      const prev = panelOf(openKey);
      prev?.classList.remove('is-active');
      triggerOf(openKey)?.setAttribute('aria-expanded', 'false');
      if (prev) resetScreen(prev);
    }
    if (openKey !== k) { openedAt = performance.now(); openedBy = by; }
    openKey = k;
    loadPanel(panel);
    panel.classList.add('is-active');
    trig.setAttribute('aria-expanded', 'true');
    html.dataset.mmOpen = k;
    if (bg) {
      if (!wasOpen) bg.classList.add('no-anim');
      measureBg(panel);
      bg.classList.add('is-on');
      if (!wasOpen) { void bg.offsetWidth; bg.classList.remove('no-anim'); }
    }
    movePill(trig);
    if (!wasOpen) { lock('mega'); track('menu_open', { panel: k }); }
    if (focusFirst) panel.querySelector<HTMLElement>('a[href],button')?.focus();
  }

  function close(returnFocus = false) {
    clearTimeout(tOpen);
    clearTimeout(tClose);
    if (!openKey) return;
    const k = openKey;
    const panel = panelOf(k);
    const trig = triggerOf(k);
    panel?.classList.remove('is-active');
    trig?.setAttribute('aria-expanded', 'false');
    bg?.classList.remove('is-on');
    openKey = null;
    delete html.dataset.mmOpen;
    unlock('mega');
    if (panel) setTimeout(() => { if (openKey !== k) resetScreen(panel); }, 260);
    pill?.classList.remove('is-on');
    if (returnFocus) trig?.focus();
  }

  const scheduleClose = (ms = 200) => { clearTimeout(tOpen); clearTimeout(tClose); tClose = window.setTimeout(() => close(), ms); };

  // ---------- eventos de disparadores ----------
  for (const t of triggers) {
    const k = t.dataset.mmTrigger!;
    t.addEventListener('pointerenter', (e) => {
      if (e.pointerType !== 'mouse' || !fine.matches) return;
      clearTimeout(tClose);
      clearTimeout(tOpen);
      if (openKey) open(k, false, 'hover');
      else tOpen = window.setTimeout(() => open(k, false, 'hover'), 100);
    });
    t.addEventListener('pointerleave', () => clearTimeout(tOpen));
    t.addEventListener('click', (e) => {
      const keyboard = (e as MouseEvent).detail === 0;
      if (openKey === k) {
        // un clic justo después de abrir con hover no lo cierra
        if (openedBy === 'hover' && performance.now() - openedAt < 450) return;
        close(keyboard);
      } else open(k, false, keyboard ? 'key' : 'click');
    });
    t.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown') { e.preventDefault(); open(k, true, 'key'); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); open(k, false, 'key'); const ls = links(panelOf(k)); ls[ls.length - 1]?.focus(); }
    });
  }
  // Flechas ← → entre entradas de primer nivel
  for (const el of entries) {
    el.addEventListener('keydown', (e) => {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft' && e.key !== 'Home' && e.key !== 'End') return;
      e.preventDefault();
      const i = entries.indexOf(el);
      const n = e.key === 'Home' ? 0 : e.key === 'End' ? entries.length - 1 : (i + (e.key === 'ArrowRight' ? 1 : -1) + entries.length) % entries.length;
      const to = entries[n];
      arrowing = true;                    // el focusout de esta entrada no cierra el panel: lo cambia open()
      to.focus();
      arrowing = false;
      if (openKey) { const k = to.dataset.mmTrigger; if (k) open(k, false, 'key'); else close(); }
    });
    el.addEventListener('pointerenter', (e) => {
      if ((e as PointerEvent).pointerType !== 'mouse') return;
      movePill(el);
      if (!el.dataset.mmTrigger && openKey) scheduleClose();
    });
    el.addEventListener('focus', () => movePill(el));
  }
  nav?.addEventListener('pointerleave', () => restPill());
  nav?.addEventListener('focusout', (e) => { if (!nav.contains(e.relatedTarget as Node)) restPill(); });

  // Logo y acciones: cerrar con gracia
  hdr.querySelectorAll<HTMLElement>('.hdr__logo, .hdr__actions').forEach((el) =>
    el.addEventListener('pointerenter', (e) => { if ((e as PointerEvent).pointerType === 'mouse' && openKey) scheduleClose(); }),
  );
  hdr.addEventListener('pointerleave', (e) => { if ((e as PointerEvent).pointerType === 'mouse' && openKey) scheduleClose(); });
  hdr.addEventListener('pointerenter', () => clearTimeout(tClose));

  // ---------- dentro de los paneles ----------
  const links = (panel: HTMLElement | null) =>
    panel ? [...panel.querySelectorAll<HTMLElement>('.mm-main a[href], .mm-main button, .mm-foot a[href]')] : [];

  hdr.querySelectorAll<HTMLElement>('.mm-panel').forEach((panel) => {
    panel.addEventListener('pointerenter', () => clearTimeout(tClose));
    panel.querySelectorAll<HTMLElement>('[data-still-src]').forEach((a) => {
      const show = () => {
        setScreen(panel, fromLink(a));
        const st = a.dataset.stage;
        if (st) setStage(panel, Number(st));
      };
      a.addEventListener('pointerenter', show);
      a.addEventListener('focus', show);
    });
    panel.querySelector('[data-stages]')?.addEventListener('pointerleave', () => setStage(panel, null));

    panel.addEventListener('keydown', (e) => {
      const ls = links(panel);
      const cur = document.activeElement as HTMLElement;
      const i = ls.indexOf(cur);
      if (i < 0) return;
      const col = (el: HTMLElement) => el.closest<HTMLElement>('[data-col]')?.dataset.col ?? (el.closest('.mm-foot') ? 'f' : 'm');
      const inCol = ls.filter((x) => col(x) === col(cur));
      const j = inCol.indexOf(cur);
      let to: HTMLElement | undefined;
      switch (e.key) {
        case 'ArrowDown': to = inCol[j + 1] ?? ls[i + 1]; break;
        case 'ArrowUp': to = j > 0 ? inCol[j - 1] : ls[i - 1]; if (!to) { e.preventDefault(); triggerOf(panel.dataset.mmPanel!)?.focus(); return; } break;
        case 'ArrowRight': {
          const cols = [...new Set(ls.map(col))]; const c = cols.indexOf(col(cur));
          const nx = ls.filter((x) => col(x) === cols[c + 1]); to = nx[Math.min(j, nx.length - 1)]; break;
        }
        case 'ArrowLeft': {
          const cols = [...new Set(ls.map(col))]; const c = cols.indexOf(col(cur));
          const pv = ls.filter((x) => col(x) === cols[c - 1]); to = pv[Math.min(j, pv.length - 1)]; break;
        }
        case 'Home': to = ls[0]; break;
        case 'End': to = ls[ls.length - 1]; break;
        default: return;
      }
      if (to) { e.preventDefault(); to.focus(); }
    });
  });

  // ---------- cierre global ----------
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && openKey) {
      // Devuelve el foco al disparador solo si el foco estaba en el encabezado o en su panel (los paneles viven dentro de .hdr).
      close(hdr.contains(document.activeElement));
    }
  });
  document.addEventListener('pointerdown', (e) => { if (openKey && !hdr.contains(e.target as Node)) close(); });
  hdr.addEventListener('focusout', (e) => {
    if (!openKey || arrowing) return;
    const to = e.relatedTarget as Node | null;
    if (to && !hdr.contains(to)) { close(); return; }
    // Tab más allá del último enlace (o Mayús+Tab antes del disparador): el foco sale del panel abierto → se cierra,
    // para que el foco nunca quede debajo del panel (WCAG 2.4.11).
    const panel = panelOf(openKey);
    const trig = triggerOf(openKey);
    const from = e.target as Node;
    const inOpen = (n: Node | null) => !!n && (n === trig || !!panel?.contains(n));
    if (inOpen(from) && to && !inOpen(to)) close();
  });
  window.addEventListener('wheel', (e) => {
    if (!openKey) return;
    const p = panelOf(openKey);
    if (p && p.contains(e.target as Node) && p.scrollHeight > p.clientHeight) return;
    close();
  }, { passive: true });
  window.addEventListener('resize', () => {
    if (!desk.matches) close();
    else if (openKey) { const p = panelOf(openKey); if (p) measureBg(p); movePill(triggerOf(openKey)); }
  }, { passive: true });
  // Si cambian las fuentes, vuelve a medir el panel abierto
  document.fonts?.ready.then(() => { if (openKey) { const p = panelOf(openKey); if (p) measureBg(p); } });

  return { open: (k, f) => open(k, !!f, 'key'), close: (r) => close(!!r), current: () => openKey };
}
