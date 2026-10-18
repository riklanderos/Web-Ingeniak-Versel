/* Ingeniak · movimiento del sitio (inicio y /discovery)
   Orden: ayudantes → lo que funciona siempre → Lenis → firma → efectos de scroll */
(() => {
  'use strict';

  // 1. Ayudantes, banderas y tokens de movimiento
  const d = document, html = d.documentElement;
  const $ = (s, c = d) => c.querySelector(s);
  const $$ = (s, c = d) => [...c.querySelectorAll(s)];
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const FINE = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const SAVE_DATA = !!(navigator.connection && navigator.connection.saveData);
  const SAFARI = /^((?!chrome|android|crios|fxios).)*safari/i.test(navigator.userAgent);
  const hasGSAP = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
  const safe = (fn) => { try { fn(); } catch (e) { console.warn('[ingeniak]', e); } };
  const NS = 'http://www.w3.org/2000/svg';

  // Técnico y preciso, sin rebotes
  const M = { ease: 'power3.out', easeIO: 'power3.inOut', pop: 'power3.out', dur: 0.95, stagger: 0.06, dist: 22, lerp: 0.085 };

  if (RM) html.classList.add('rm');
  if (!hasGSAP) html.classList.remove('js');
  else {
    html.classList.add("anim-listo");
    gsap.registerPlugin(ScrollTrigger);
    if (window.SplitText) gsap.registerPlugin(SplitText);
    ScrollTrigger.config({ ignoreMobileResize: true });
  }

  // El isotipo vive en un <symbol>; para dibujar su trazo necesita ser un <path> real
  const ISO_D = ($('#iso-path') || {}).getAttribute ? $('#iso-path').getAttribute('d') : '';
  $$('[data-trazo-path]').forEach((p) => { p.setAttribute('d', ISO_D); const u = p.parentNode.querySelector('use'); u && u.remove(); });

  // 2. Lenis (solo con GSAP y sin "reducir movimiento")
  let lenis = null;
  safe(() => {
    if (!hasGSAP || RM || !window.Lenis || !M.lerp) return;
    lenis = new Lenis({ lerp: M.lerp, smoothWheel: true });
    window.__lenis = lenis; // para pruebas y anclas desde otros scripts
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  });

  // 3. Lo que debe servir siempre
  const navH = () => ($('[data-nav]') ? $('[data-nav]').offsetHeight : 0);
  const scrollToEl = (el) => {
    if (lenis) lenis.scrollTo(el, { offset: -navH() + 1, duration: 1.4 });
    else el.scrollIntoView({ behavior: RM ? 'auto' : 'smooth' });
  };

  // Menú móvil
  const cerrarMenu = () => {
    html.classList.remove('menu-abierto');
    const b = $('[data-menu-btn]'); if (b) { b.setAttribute('aria-expanded', 'false'); b.setAttribute('aria-label', 'Abrir menú'); }
    lenis && lenis.start();
  };
  safe(() => {
    const b = $('[data-menu-btn]'); if (!b) return;
    b.addEventListener('click', () => {
      const abre = !html.classList.contains('menu-abierto');
      html.classList.toggle('menu-abierto', abre);
      b.setAttribute('aria-expanded', String(abre));
      b.setAttribute('aria-label', abre ? 'Cerrar menú' : 'Abrir menú');
      if (lenis) abre ? lenis.stop() : lenis.start();
    });
    d.addEventListener('keydown', (e) => { if (e.key === 'Escape') cerrarMenu(); });
  });

  // Anclas internas suaves
  d.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const hash = a.getAttribute('href');
    const el = hash.length > 1 && d.getElementById(hash.slice(1));
    if (!el) return;
    e.preventDefault();
    cerrarMenu();
    scrollToEl(el);
    history.replaceState(null, '', hash);
  });

  // Navegación: se vuelve sólida y se esconde al bajar
  safe(() => {
    const nav = $('[data-nav]'); if (!nav) return;
    let last = 0;
    const onScroll = () => {
      const y = window.scrollY;
      nav.classList.toggle('is-solida', y > 30);
      nav.classList.toggle('is-oculta', y > 500 && y > last && !html.classList.contains('menu-abierto'));
      last = y;
    };
    addEventListener('scroll', onScroll, { passive: true }); onScroll();
  });

  // Cinta de herramientas: el segundo grupo es copia del primero para el bucle
  safe(() => { $$('[data-clon]').forEach((u) => { u.innerHTML = u.previousElementSibling.innerHTML; }); });

  // Preguntas frecuentes (acordeón accesible, una abierta a la vez)
  safe(() => {
    $$('[data-faq]').forEach((lista) => {
      const items = $$('.faq__item', lista);
      items.forEach((it, i) => {
        const btn = $('.faq__btn', it), resp = $('.faq__resp', it);
        const id = `faq-${lista.dataset.faq || 'x'}-${i}`;
        resp.id = id; btn.setAttribute('aria-controls', id);
        btn.addEventListener('click', () => {
          const abre = btn.getAttribute('aria-expanded') !== 'true';
          items.forEach((o) => { o.classList.remove('is-abierta'); $('.faq__btn', o).setAttribute('aria-expanded', 'false'); });
          if (abre) { it.classList.add('is-abierta'); btn.setAttribute('aria-expanded', 'true'); }
          if (hasGSAP) setTimeout(() => ScrollTrigger.refresh(), 600);
        });
      });
    });
  });

  // Videos: se cargan y corren solo cuando están en pantalla
  safe(() => {
    const cargar = (v) => {
      if (v.dataset.cargado) return;
      $$('source[data-src]', v).forEach((s) => { s.src = s.dataset.src; });
      v.load(); v.dataset.cargado = '1';
    };
    // Kain con fondo transparente: Safari no dibuja la transparencia de WebM, ahí se queda la imagen
    $$('video[data-alfa]').forEach((v) => {
      if (SAFARI || RM || SAVE_DATA) {
        const img = d.createElement('img');
        img.src = v.getAttribute('poster'); img.alt = ''; img.width = v.width; img.height = v.height; img.loading = 'lazy';
        v.replaceWith(img);
      }
    });
    const vids = $$('video[data-video], video[data-alfa]');
    if (RM || SAVE_DATA) { $$('video[data-video]').forEach((v) => { v.removeAttribute('autoplay'); v.controls = true; }); return; }
    const io = new IntersectionObserver((ents) => ents.forEach((en) => {
      const v = en.target;
      if (en.isIntersecting) { cargar(v); const p = v.play(); p && p.catch(() => {}); }
      else if (!v.paused) v.pause();
    }), { rootMargin: '200px 0px', threshold: 0.15 });
    vids.forEach((v) => io.observe(v));
  });

  // Barra fija en celular: aparece después de la portada y se esconde en el cierre
  safe(() => {
    const barra = $('[data-barra]'); if (!barra) return;
    const portada = $('.portada, .d-portada'), cierre = $('[data-cierre]'), pie = $('.pie');
    let pasoPortada = false, enCierre = false;
    const actualizar = () => barra.classList.toggle('is-visible', pasoPortada && !enCierre && !html.classList.contains('menu-abierto'));
    if (portada) new IntersectionObserver(([e]) => { pasoPortada = !e.isIntersecting; actualizar(); }, { threshold: 0.05 }).observe(portada);
    const fin = new IntersectionObserver((ents) => { enCierre = ents.some((e) => e.isIntersecting) || [cierre, pie].some((el) => el && el.getBoundingClientRect().top < innerHeight); actualizar(); }, { threshold: 0.2 });
    [cierre, pie].forEach((el) => el && fin.observe(el));
  });

  // Sin GSAP o con menos movimiento: todo queda visible y quieto
  if (!hasGSAP) return;

  // 4. Efectos de mouse, solo con puntero fino
  if (FINE) safe(() => {
    $$('.btn').forEach((b) => b.addEventListener('pointermove', (e) => { const r = b.getBoundingClientRect(); b.style.setProperty('--x', `${e.clientX - r.left}px`); }));
    $$('[data-cristal]').forEach((c) => {
      c.addEventListener('pointermove', (e) => { const r = c.getBoundingClientRect(); c.style.setProperty('--mx', `${((e.clientX - r.left) / r.width) * 100}%`); c.style.setProperty('--my', `${((e.clientY - r.top) / r.height) * 100}%`); });
      c.addEventListener('pointerleave', () => { c.style.removeProperty('--mx'); c.style.removeProperty('--my'); });
    });
  });

  if (RM) { html.classList.add('sin-anim'); return; }

  // ---------- Portada: líneas de conexión del isotipo a cada chip ----------
  const escena = $('[data-escena]');
  const svgL = $('[data-lineas]');
  const lineas = [];
  const trazarLineas = () => safe(() => {
    if (!escena || !svgL) return;
    $$('g[data-l]', svgL).forEach((g) => g.remove());
    lineas.length = 0;
    const E = escena.getBoundingClientRect();
    const iso = $('[data-iso]', escena).getBoundingClientRect();
    svgL.setAttribute('viewBox', `0 0 ${E.width} ${E.height}`);
    $$('[data-chip]', escena).forEach((chip) => {
      const [ax, ay] = chip.dataset.ancla.split(',').map(Number);
      const sx = iso.left - E.left + iso.width * ax;
      const sy = iso.top - E.top + iso.height * ay;
      const C = chip.getBoundingClientRect();
      const izq = ax < 0.5;
      const ex = izq ? C.right - E.left : C.left - E.left;
      const ey = C.top - E.top + C.height / 2;
      const mx = sx + (ex - sx) * 0.45;
      // Ángulo de las ramas del isotipo: tramo recto, quiebre diagonal, tramo recto
      const dp = `M${sx.toFixed(1)} ${sy.toFixed(1)} L${mx.toFixed(1)} ${sy.toFixed(1)} L${(mx + (ex - mx) * 0.35).toFixed(1)} ${ey.toFixed(1)} L${ex.toFixed(1)} ${ey.toFixed(1)}`;
      const g = d.createElementNS(NS, 'g'); g.setAttribute('data-l', '');
      const base = d.createElementNS(NS, 'path'); base.setAttribute('class', 'base'); base.setAttribute('d', dp);
      const pulso = d.createElementNS(NS, 'path'); pulso.setAttribute('class', 'pulso'); pulso.setAttribute('d', dp);
      const nodo = d.createElementNS(NS, 'rect');
      Object.entries({ x: ex - 3, y: ey - 3, width: 6, height: 6, rx: 1.2, fill: '#00E5FF' }).forEach(([k, v]) => nodo.setAttribute(k, v));
      g.append(base, pulso, nodo); svgL.append(g);
      lineas.push({ base, pulso, nodo, L: base.getTotalLength() });
    });
  });

  let pulsosTL = null, pulsosST = null;
  const arrancarPulsos = () => {
    if (pulsosTL) pulsosTL.kill();
    if (pulsosST) pulsosST.kill();
    pulsosTL = gsap.timeline({ repeat: -1 });
    lineas.forEach((l, i) => {
      gsap.set(l.pulso, { strokeDasharray: `18 ${l.L}`, strokeDashoffset: 18, opacity: 1 });
      pulsosTL.to(l.pulso, { strokeDashoffset: -l.L, duration: 1.8, ease: 'power1.inOut' }, i * 0.9);
    });
    pulsosTL.to({}, { duration: 1.2 });
    // Solo corren mientras la portada está en pantalla
    pulsosST = ScrollTrigger.create({ trigger: '.portada', start: 'top bottom', end: 'bottom top', onToggle: (s) => (s.isActive ? pulsosTL.play() : pulsosTL.pause()) });
  };

  // ---------- La firma: el isotipo se dibuja, se vuelve cristal y se conecta ----------
  function firmaPortada() {
    const trazoSvg = $('[data-trazo]');
    const trazo = trazoSvg && $('path', trazoSvg);
    const tl = gsap.timeline({ defaults: { ease: M.ease } });
    tl.set('[data-hero-in]', { autoAlpha: 0, y: M.dist })
      .set('.portada__titulo .linea-in', { yPercent: 118, y: 0 });
    if (!escena) {
      return tl.to('.portada__titulo .linea-in', { yPercent: 0, duration: M.dur * 1.25, stagger: M.stagger * 2 }, 0.1)
        .to('[data-hero-in]', { autoAlpha: 1, y: 0, duration: M.dur, stagger: M.stagger * 1.5 }, 0.3);
    }
    const L = trazo.getTotalLength();
    tl.set(trazoSvg, { opacity: 1 })
      .set(trazo, { strokeDasharray: L, strokeDashoffset: L })
      .set('[data-iso]', { autoAlpha: 0, scale: 0.9, filter: 'brightness(2.2) blur(8px)' })
      .set('[data-chip]', { autoAlpha: 0, y: 10, scale: 0.96 });
    lineas.forEach((l) => tl.set(l.base, { strokeDasharray: l.L, strokeDashoffset: l.L }, 0).set(l.nodo, { opacity: 0 }, 0).set(l.pulso, { opacity: 0 }, 0));

    tl.to(trazo, { strokeDashoffset: 0, duration: 1.15, ease: M.easeIO }, 0.1)                                  // 1. se dibuja
      .to('[data-iso]', { autoAlpha: 1, scale: 1, filter: 'brightness(1) blur(0px)', duration: 1.1, clearProps: 'filter' }, 0.95) // 2. se vuelve cristal
      .to(trazoSvg, { opacity: 0, duration: 0.6, ease: 'none' }, 1.25)
      .to('.portada__titulo .linea-in', { yPercent: 0, duration: M.dur * 1.25, stagger: M.stagger * 2 }, 1.05)   // 3. titular
      .to('[data-hero-in]', { autoAlpha: 1, y: 0, duration: M.dur, stagger: M.stagger * 1.5 }, 1.2);
    lineas.forEach((l, i) => {                                                                                    // 4. las ramas conectan
      tl.to(l.base, { strokeDashoffset: 0, duration: 0.8, ease: M.easeIO }, 1.45 + i * 0.12)
        .to(l.nodo, { opacity: 1, duration: 0.2, ease: 'none' }, 2.1 + i * 0.12);
    });
    tl.to('[data-chip]', { autoAlpha: 1, y: 0, scale: 1, duration: M.dur, stagger: M.stagger * 2 }, 1.95)
      .fromTo('.portada .btn__trazo', { opacity: 1, '--ang': '0deg' }, { '--ang': '360deg', duration: 1.3, ease: M.easeIO }, 2.45) // 5. la luz llega al botón
      .to('.portada .btn__trazo', { opacity: 0, duration: 0.5 }, 3.5)
      .add(arrancarPulsos, 3.1);
    return tl;
  }

  // ---------- Títulos por líneas ----------
  const splitReveals = () => safe(() => {
    const els = $$('[data-split]');
    if (!window.SplitText) { gsap.set(els, { visibility: 'visible' }); return; }
    els.forEach((el) => {
      SplitText.create(el, {
        type: 'lines', mask: 'lines', linesClass: 'linea', autoSplit: true,
        onSplit: (self) => {
          gsap.set(el, { visibility: 'visible' });
          return gsap.from(self.lines, { yPercent: 130, duration: M.dur * 1.05, stagger: M.stagger * 1.4, ease: M.ease,
            scrollTrigger: { trigger: el, start: 'top 88%', once: true } });
        },
      });
    });
  });

  // ---------- Revelados ----------
  safe(() => {
    gsap.set('[data-reveal]', { y: M.dist, opacity: 0 });
    ScrollTrigger.batch('[data-reveal]', { start: 'top 90%', once: true,
      onEnter: (b) => gsap.to(b, { y: 0, opacity: 1, duration: M.dur, ease: M.ease, stagger: M.stagger, overwrite: true }) });
  });

  // ---------- Contadores ----------
  safe(() => {
    $$('[data-count]').forEach((el) => {
      const fin = +el.dataset.count, pre = el.dataset.prefix || '', suf = el.dataset.suffix || '';
      const o = { v: 0 };
      el.textContent = `${pre}0${suf}`;
      gsap.to(o, { v: fin, duration: 1.6, ease: 'power2.out', scrollTrigger: { trigger: el, start: 'top 90%', once: true },
        onUpdate: () => { el.textContent = `${pre}${Math.round(o.v)}${suf}`; } });
    });
  });

  // ---------- Problema: el ámbar se apaga y el cian lo resuelve ----------
  safe(() => {
    const lista = $('[data-dolores]'); if (!lista) return;
    const items = $$('.dolor', lista);
    ScrollTrigger.create({ trigger: lista, start: 'top 45%', once: true,
      onEnter: () => items.forEach((it, i) => setTimeout(() => it.classList.add('is-resuelto'), 350 + i * 380)) });
  });

  // ---------- Sistema: la línea avanza y cada etapa se enciende ----------
  safe(() => {
    const cont = $('[data-etapas]'); if (!cont) return;
    const p = $('.etapas__linea path', cont);
    if (p) gsap.fromTo(p, { strokeDasharray: 100, strokeDashoffset: 100 }, { strokeDashoffset: 0, ease: 'none',
      scrollTrigger: { trigger: cont, start: 'top 80%', end: 'bottom 55%', scrub: true } });
    $$('.etapa', cont).forEach((et) => ScrollTrigger.create({ trigger: et, start: 'top 70%', end: 'bottom 30%',
      onToggle: (s) => et.classList.toggle('is-activa', s.isActive) }));
  });

  // ---------- Servicios: la línea de cada fila se dibuja ----------
  safe(() => {
    if (!$('[data-trazo-fila]')) return;
    gsap.set('[data-trazo-fila]', { scaleX: 0 });
    ScrollTrigger.batch('[data-trazo-fila]', { start: 'top 92%', once: true,
      onEnter: (b) => gsap.to(b, { scaleX: 1, duration: M.dur * 1.4, ease: M.easeIO, stagger: M.stagger }) });
  });

  // ---------- VKTOR: la línea conecta las cinco fases ----------
  const trazarFases = () => safe(() => {
    const cont = $('[data-fases]'); if (!cont) return;
    const svg = $('[data-fases-linea]', cont), p = $('path', svg);
    const letras = $$('.fase__letra', cont);
    const R = cont.getBoundingClientRect();
    const vertical = innerWidth < 960;
    const pts = letras.map((l) => { const r = l.getBoundingClientRect(); return [r.left - R.left + r.width / 2, r.top - R.top + r.height / 2]; });
    svg.style.cssText = `left:0;top:0;width:${R.width}px;height:${R.height}px`;
    svg.setAttribute('viewBox', `0 0 ${R.width} ${R.height}`);
    p.setAttribute('d', pts.map((q, i) => `${i ? 'L' : 'M'}${q[0].toFixed(1)} ${q[1].toFixed(1)}`).join(' '));
    const L = p.getTotalLength();
    gsap.set(p, { strokeDasharray: L, strokeDashoffset: L });
    if (trazarFases.st) trazarFases.st.kill();
    trazarFases.st = gsap.to(p, { strokeDashoffset: 0, ease: 'none',
      scrollTrigger: { trigger: cont, start: vertical ? 'top 75%' : 'top 70%', end: vertical ? 'bottom 60%' : 'top 30%', scrub: true } }).scrollTrigger;
  });

  // ---------- Equipo: las fotos se abren de abajo hacia arriba ----------
  safe(() => {
    $$('[data-foto]').forEach((f) => gsap.fromTo(f, { clipPath: 'inset(100% 0 0 0)' }, { clipPath: 'inset(0% 0 0 0)', duration: M.dur * 1.3, ease: M.easeIO,
      scrollTrigger: { trigger: f, start: 'top 90%', once: true } }));
  });

  // ---------- Pie: el isotipo se dibuja otra vez (rima de la firma) ----------
  safe(() => {
    const svg = $('[data-pie-iso]'); if (!svg) return;
    const u = $('use', svg); const p = d.createElementNS(NS, 'path'); p.setAttribute('d', ISO_D); u && u.replaceWith(p);
    const L = p.getTotalLength();
    gsap.set(p, { strokeDasharray: L, strokeDashoffset: L, fillOpacity: 0 });
    gsap.timeline({ scrollTrigger: { trigger: svg, start: 'top 95%', once: true } })
      .to(p, { strokeDashoffset: 0, duration: 2, ease: M.easeIO })
      .to(p, { fillOpacity: 1, duration: 0.8, ease: 'none' }, '-=0.4');
  });

  // 7. Arranque: cuando estén las fuentes (con tope de tiempo)
  Promise.race([d.fonts ? d.fonts.ready : Promise.resolve(), new Promise((r) => setTimeout(r, 1200))]).then(() => {
    trazarLineas();
    safe(firmaPortada);
    splitReveals();
    trazarFases();
    ScrollTrigger.refresh();
    if (location.hash) { const el = d.getElementById(location.hash.slice(1)); el && setTimeout(() => scrollToEl(el), 400); }
  });

  let rT;
  addEventListener('resize', () => {
    clearTimeout(rT);
    rT = setTimeout(() => { trazarLineas(); lineas.forEach((l) => gsap.set(l.base, { strokeDasharray: 'none', strokeDashoffset: 0 }) && l.nodo.setAttribute('opacity', 1)); if (lineas.length) arrancarPulsos(); trazarFases(); ScrollTrigger.refresh(); }, 200);
  });
})();
