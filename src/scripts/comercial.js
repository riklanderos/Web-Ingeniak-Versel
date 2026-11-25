// /comercial/ · interacciones del manual: vista, buscador, índice, mapa animado, reloj, plantillas, rutina e impresión.
// Sin dependencias. Si este archivo no carga, la página se lee completa igual.
const $ = (s, r = document) => r.querySelector (s);
const $$ = (s, r = document) => [...r.querySelectorAll (s)];
const quieto = matchMedia('(prefers-reduced-motion: reduce)').matches;
const norm = (s) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
const guarda = {
  get(k) { try { return localStorage.getItem(k); } catch { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch { /* sin almacenamiento */ } },
};
const body = document.body;

// ---------- recorrido de la portada: el punto solo viaja si cabe en una línea ----------
const ruta = $('.cm-ruta');
if (ruta) {
  const mide = () => {
    ruta.classList.add('is-una');
    const li = $$('li:not(.cm-ruta__lead)', ruta);
    ruta.classList.toggle('is-una', li[0].offsetTop === li.at(-1).offsetTop);
  };
  mide();
  addEventListener('resize', mide);
}

// ---------- selector de vista ----------
function vista(v) {
  body.dataset.vista = v;
  $$('[data-vista-btn]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.vistaBtn === v)));
  guarda.set('cm-vista', v);
}
$$('[data-vista-btn]').forEach((b) => b.addEventListener('click', () => vista(b.dataset.vistaBtn)));
const vistaGuardada = guarda.get('cm-vista');
if (vistaGuardada && ['todo', 'kain', 'com'].includes(vistaGuardada)) vista(vistaGuardada);

// ---------- aparición al hacer scroll ----------
const entran = $$('[data-cm-in]');
if (quieto || !('IntersectionObserver' in window)) entran.forEach((e) => e.classList.add('is-in'));
else {
  const io = new IntersectionObserver((es) => {
    const visibles = es.filter((e) => e.isIntersecting).map((e) => e.target);
    visibles.forEach((el, i) => { if (!el.style.getPropertyValue('--i')) el.style.setProperty('--d', String(Math.min(i, 6))); el.classList.add('is-in'); io.unobserve(el); });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
  entran.forEach((e) => io.observe(e));
  // respaldo: nada se queda oculto si el observador no dispara
  setTimeout(() => entran.forEach((e) => { const r = e.getBoundingClientRect(); if (r.top < innerHeight) e.classList.add('is-in'); }), 1800);
}

// ---------- índice que marca dónde estás ----------
const enlaces = $$ ('[data-spy]');
const secciones = enlaces.map((a) => document.getElementById(a.dataset.spy)).filter(Boolean) ;
function marca() {
  const y = innerHeight * 0.32;
  let actual = secciones[0]?.id;
  for (const s of secciones) if (s.offsetParent !== null && s.getBoundingClientRect().top <= y) actual = s.id;
  enlaces.forEach((a) => {
    const on = a.dataset.spy === actual;
    if (on !== a.classList.contains('is-on')) {
      a.classList.toggle('is-on', on);
      if (on && innerWidth < 1280) a.scrollIntoView({ inline: 'center', block: 'nearest', behavior: quieto ? 'auto' : 'smooth' });
    }
  });
}
let tick = false;
addEventListener('scroll', () => { if (!tick) { tick = true; requestAnimationFrame(() => { tick = false; marca(); }); } }, { passive: true });
marca();

// ---------- buscador ----------
const campo = $ ('[data-cm-buscar]');
const aviso = $('[data-cm-resultados]');
const buscables = $$('[data-buscar]');
function buscar(q) {
  const terminos = norm(q).split(/\s+/).filter(Boolean);
  const activo = terminos.length > 0 && terminos.join('').length > 1;
  body.classList.toggle('is-buscando', activo);
  $$('details[data-abierta-busqueda]').forEach((d) => { (d).open = false; d.removeAttribute('data-abierta-busqueda'); });
  if (!activo) {
    buscables.forEach((b) => b.classList.remove('is-dentro', 'is-fuera'));
    $$('.is-vacio').forEach((b) => b.classList.remove('is-vacio'));
    if (aviso) aviso.hidden = true;
    return;
  }
  const cuenta = {};
  buscables.forEach((b) => {
    const ok = terminos.every((t) => b.dataset.buscar .includes(t));
    b.classList.toggle('is-dentro', ok);
    b.classList.toggle('is-fuera', !ok);
    if (ok) {
      cuenta[b.dataset.tipo ?? 'otro'] = (cuenta[b.dataset.tipo ?? 'otro'] ?? 0) + 1;
      if (b instanceof HTMLDetailsElement && !b.open) { b.open = true; b.setAttribute('data-abierta-busqueda', ''); }
    }
  });
  $$('.cm-bloque, .cm-main > section').forEach((b) => b.classList.toggle('is-vacio', !b.querySelector('.is-dentro')));
  const nombres = { etapa: ['etapa', 'etapas'], plantilla: ['plantilla', 'plantillas'], bot: ['bot', 'bots'], caso: ['caso', 'casos'] };
  const partes = Object.entries(cuenta).map(([k, n]) => `${n} ${nombres[k]?.[n === 1 ? 0 : 1] ?? k}`);
  if (aviso) {
    aviso.hidden = false;
    aviso.textContent = partes.length ? `«${q.trim()}»: ${partes.join(' · ')}. Borra la búsqueda para ver todo.` : `Sin resultados para «${q.trim()}». Prueba con el nombre de una etapa o de una plantilla.`;
  }
}
campo?.addEventListener('input', () => buscar(campo.value));
campo?.addEventListener('keydown', (e) => { if (e.key === 'Escape') { campo.value = ''; buscar(''); } });
addEventListener('keydown', (e) => { if (e.key === '/' && !(e.target instanceof HTMLInputElement)) { e.preventDefault(); campo?.focus(); } });

// ---------- plantilla en una hoja aparte ----------
const dlg = $ ('[data-cm-dlg]');
const dlgBody = $('[data-cm-dlg-body]');
document.addEventListener('click', (e) => {
  const chip = (e.target).closest ('[data-tpl]');
  if (!chip || !dlg || !dlgBody || typeof dlg.showModal !== 'function') return;
  const tarjeta = document.getElementById('tpl-' + chip.dataset.tpl);
  if (!tarjeta || chip.closest('.cm-dlg')) return;
  e.preventDefault();
  const copia = tarjeta.cloneNode(true) ;
  copia.removeAttribute('id');
  copia.classList.remove('is-fuera', 'is-dentro');
  copia.querySelector('h4')?.setAttribute('id', 'cm-dlg-t');
  dlgBody.replaceChildren(copia);
  dlg.showModal();
});
dlg?.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });
dlg?.addEventListener('click', (e) => { if ((e.target).closest('a[href^="#bot-"]')) dlg.close(); });

// ---------- mapa: el lead recorre los pipelines ----------
const mapa = $('[data-cm-mapa]');
if (mapa) {
  const svgs = $$ ('svg', mapa);
  const visible = () => svgs.find((s) => getComputedStyle(s).display !== 'none') ?? svgs[0];
  let turno = 0;
  let enVista = false;
  const espera = (ms) => new Promise ((r) => setTimeout(r, ms));
  const limpia = (svg) => {
    $$('.is-paso, .is-gana, .is-on', svg).forEach((e) => e.classList.remove('is-paso', 'is-gana', 'is-on'));
    $$ ('.cm-lead', svg).forEach((l) => { l.style.opacity = '0'; });
  };
  const fin = (svg) => {
    $$('.cm-nodo', svg).forEach((n) => n.classList.add('is-paso'));
    $$('.cm-nodo--gana', svg).forEach((n) => n.classList.add('is-gana'));
    $$('.cm-salto, [data-fin]', svg).forEach((n) => n.classList.add('is-on'));
    $$('.cm-lane-g', svg).forEach((g, k) => {
      const ult = $$('.cm-nodo', g).at(-1) ;
      const l = $ (`[data-lead="${k}"]`, svg);
      if (l) { l.setAttribute('cx', ult.dataset.x); l.setAttribute('cy', ult.dataset.y); }
    });
  };
  const mueve = (el, a, b, ms, mio) => new Promise ((res) => {
    const t0 = performance.now();
    const paso = (t) => {
      if (mio !== turno) return res();
      const p = Math.min(1, (t - t0) / ms);
      const e = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
      el.setAttribute('cx', String(a.x + (b.x - a.x) * e));
      el.setAttribute('cy', String(a.y + (b.y - a.y) * e));
      p < 1 ? requestAnimationFrame(paso) : res();
    };
    requestAnimationFrame(paso);
  });
  async function corre() {
    const mio = ++turno;
    const svg = visible();
    svgs.forEach(limpia);
    const carriles = $$('.cm-lane-g', svg);
    for (let k = 0; k < carriles.length; k++) {
      const nodos = $$('.cm-nodo', carriles[k]);
      const pos = nodos.map((n) => ({ x: +n.dataset.x, y: +n.dataset.y }));
      const lead = $ (`[data-lead="${k}"]`, svg) ;
      lead.setAttribute('cx', String(pos[0].x)); lead.setAttribute('cy', String(pos[0].y));
      lead.style.transition = 'opacity .35s'; lead.style.opacity = '1';
      nodos[0].classList.add('is-paso');
      await espera(480);
      for (let i = 1; i < pos.length; i++) {
        await mueve(lead, pos[i - 1], pos[i], 640, mio);
        if (mio !== turno) return;
        nodos[i].classList.add('is-paso');
        await espera(240);
      }
      nodos.at(-1) .classList.add('is-gana');
      await espera(560);
      if (mio !== turno) return;
      if (k < carriles.length - 1) { $(`[data-salto="${k}"]`, svg)?.classList.add('is-on'); await espera(820); }
      else $('[data-fin]', svg)?.classList.add('is-on');
      if (mio !== turno) return;
    }
    await espera(4600);
    if (mio === turno && enVista) corre();
  }
  if (quieto || !('IntersectionObserver' in window)) svgs.forEach(fin);
  else {
    new IntersectionObserver(([e]) => {
      const antes = enVista; enVista = e.isIntersecting;
      if (enVista && !antes) corre(); else if (!enVista) turno++;
    }, { threshold: 0.3 }).observe(mapa);
    $('[data-cm-replay]', mapa)?.addEventListener('click', () => corre());
    let ancho = innerWidth;
    addEventListener('resize', () => { if ((ancho < 860) !== (innerWidth < 860)) { ancho = innerWidth; if (enVista) corre(); } });
  }
  if (quieto) $('[data-cm-replay]', mapa)?.setAttribute('hidden', '');
}

// ---------- reloj: los hitos se encienden en secuencia ----------
const reloj = $('[data-cm-reloj]');
if (reloj) {
  if (quieto || !('IntersectionObserver' in window)) reloj.classList.add('is-on');
  else new IntersectionObserver(([e], o) => { if (e.isIntersecting) { reloj.classList.add('is-on'); o.disconnect(); } }, { threshold: 0.15 }).observe(reloj);
}

// ---------- videos: versión de escritorio o de celular ----------
$$('[data-cm-video]').forEach((fig) => {
  const v = $ ('video', fig) ;
  const movil = matchMedia('(max-width: 700px)').matches;
  const base = movil ? v.dataset.m : v.dataset.d ;
  if (movil) { fig.classList.add('is-m'); if (v.dataset.posterM) v.poster = v.dataset.posterM; }
  for (const [ext, tipo] of [['webm', 'video/webm'], ['mp4', 'video/mp4']]) {
    const s = document.createElement('source'); s.src = `${base}.${ext}`; s.type = tipo; v.append(s);
  }
});

// ---------- rutina: se guarda por día en este navegador ----------
const rutina = $('[data-cm-rutina]');
if (rutina) {
  const hoy = new Date().toLocaleDateString('sv');
  const clave = 'cm-rutina-' + hoy;
  let hechas = [];
  try { hechas = JSON.parse(guarda.get(clave) ?? '[]'); } catch { hechas = []; }
  const casillas = $$ ('input[data-check]', rutina);
  const avance = $('[data-cm-avance]', rutina);
  const pinta = () => {
    const n = casillas.filter((c) => c.checked).length;
    if (avance) avance.textContent = n === casillas.length ? `Listo por hoy: ${n} de ${casillas.length}.` : `${n} de ${casillas.length} hechas hoy.`;
  };
  casillas.forEach((c) => {
    c.checked = hechas.includes(c.dataset.check);
    c.addEventListener('change', () => { guarda.set(clave, JSON.stringify(casillas.filter((x) => x.checked).map((x) => x.dataset.check))); pinta(); });
  });
  pinta();
}

// ---------- impresión: todo desplegado ----------
let cerradas = [];
addEventListener('beforeprint', () => { cerradas = $$ ('details:not([open])'); cerradas.forEach((d) => { d.open = true; }); });
addEventListener('afterprint', () => { cerradas.forEach((d) => { d.open = false; }); cerradas = []; });
$('[data-cm-print]')?.addEventListener('click', () => print());
