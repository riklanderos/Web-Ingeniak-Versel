// scripts/check-escenas.mjs — guarda de escenas (ESPEC-v2 §3.10, §8.6, §12.2 R3/R4). Necesita Chrome y un servidor.
// Estático: cada placa usada por una página construida existe en plates.json con escritorio y vertical (d/m con medidas),
//   alt (string; '' solo en placas decorativas), safe/subject en d y m, y sus archivos publicados (-1920 y -m-1080).
// En el navegador (movimiento reducido, todo visible) a 1280×720, 1440×900, 1920×1080, 2560×1080, 390×844 y 1024×1366,
//   por cada <section class="is" data-plate>:
//   ✗ una línea de texto de .is__text/.is__aside cae sobre la caja del sujeto (subject, proyectada sobre .stage con la
//     misma geometría que pinta la placa; sin la franja que se disuelve abajo);
//   ! una línea que cae dentro de la placa pero fuera de la unión de safe;
//   ✗ R3 (390×844): en modo top, del borde superior de la sección a la cabeza del sujeto hay más de 1.1 pantallas (930 px);
//   ✗ R4 (móvil): una pieza anclada sin coordenadas de la placa vertical (data-mnull) se pinta sin data-m="none";
//   ✗ R4: una pieza anclada visible no cubre su punto (±8 px);
//   ✗ el <section class="is"> pinta fondo propio (§3.11).
// Modal de cotización abierto (CAMBIO-COTIZAR §2.6, §6.1): /#cotizar y /servicios/agentes-ia-whatsapp/#cotizar a 1440×900 y
//   390×844, en sus 3 pasos y en las vistas de éxito y falla:
//   ✗ el diálogo no abre con #cotizar, se sale de la pantalla o desborda a lo ancho; ✗ encabezado o botonera fuera de la vista;
//   ✗ cerrar u opciones (chips, segmentado) bajo 44 px; ✗ más de un azul (--blue) a la vista; ✗ sin prefill de agentes-ia en
//   /servicios/agentes-ia-whatsapp/; ! en móvil no es hoja a pantalla completa; ! en escritorio pasa de 720 × min(860, 92dvh).
//   Las landings nuevas (/power-session/, /agendar/confirmado/) entran solas con sus escenas (rutas construidas de sitemap.json).
// Uso: node scripts/check-escenas.mjs [--url http://127.0.0.1:4321] [--only /,/discovery/] [--vp 1440x900,390x844] [--sin-modal]
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { ROOT, PLATES, SITEMAP, BUILT, parseArgs, reporter } from './_html.mjs';
import { launch, pickViewports } from './_cdp.mjs';

const DEF_VP = ['1280x720', '1440x900', '1920x1080', '2560x1080', '390x844', '1024x1366'];

/** Recolector que corre en la página: geometría de cada escena. */
const COLLECT = `(() => {
  const mob = matchMedia('(max-width:767px), (max-aspect-ratio:5/6)').matches;
  const R = (b) => ({ x: b.left, y: b.top + scrollY, w: b.width, h: b.height });
  const num = (st, k) => { const v = st.getPropertyValue(k).trim(); return v === '' ? null : parseFloat(v); };
  const out = [];
  for (const s of document.querySelectorAll('section.is[data-plate]')) {
    const stage = s.querySelector('.is__layer--media .stage') || s.querySelector('.stage');
    if (!stage) continue;
    const st = getComputedStyle(s);
    const sfx = mob ? '-m' : '';
    const box = ['--sx0', '--sy0', '--sx1', '--sy1'].map((k) => num(st, k + sfx));
    const lines = [];
    const roots = s.querySelectorAll('.is__text, .is__aside');
    for (const root of roots) {
      const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      let n;
      while ((n = w.nextNode())) {
        if (!n.textContent.trim()) continue;
        const el = n.parentElement;
        if (!el || el.closest('[aria-hidden="true"], .sr-only, .visually-hidden, template, noscript')) continue;
        if (el.checkVisibility && !el.checkVisibility({ opacityProperty: true, visibilityProperty: true })) continue;
        const inMore = !!el.closest('.is__more');
        const rg = document.createRange(); rg.selectNodeContents(n);
        for (const b of rg.getClientRects()) if (b.width > 2 && b.height > 2) lines.push({ ...R(b), t: n.textContent.trim().slice(0, 40), more: inMore });
      }
    }
    const anchors = [];
    for (const a of s.querySelectorAll('.anchor[data-anchor]')) {
      const cs = getComputedStyle(a);
      const shown = cs.display !== 'none' && cs.visibility !== 'hidden' && a.getClientRects().length > 0;
      const name = (a.dataset.anchor || '').split(/\\s+/)[0];
      // punto propio de la pieza (--ax/--ay ya resueltos; la plantilla puede desplazarlo dentro de su caja) o el de la placa
      const ac = getComputedStyle(a);
      const ax = num(ac, mob ? '--ax-m' : '--ax') ?? num(st, '--A-' + name + '-x' + (mob ? 'm' : ''));
      const ay = num(ac, mob ? '--ay-m' : '--ay') ?? num(st, '--A-' + name + '-y' + (mob ? 'm' : ''));
      anchors.push({ name, shown, mNone: a.dataset.m === 'none', box: shown ? R(a.getBoundingClientRect()) : null, ax, ay, lock: a.hasAttribute('data-lock') });
    }
    out.push({
      id: s.id, plate: s.dataset.plate, m: s.dataset.m || 'top', mirror: s.hasAttribute('data-mirror'), mnull: (s.dataset.mnull || '').split(/\\s+/).filter(Boolean),
      sec: R(s.getBoundingClientRect()), stage: R(stage.getBoundingClientRect()), box, fade: num(st, '--fade-from'),
      bg: st.backgroundColor, bgi: st.backgroundImage, lines, anchors, mob,
    });
  }
  return { mob, vh: innerHeight, scenes: out };
})()`;

/** Rutas con el modal abierto por hash (§6.1) y sus tamaños. */
export const MODAL_ROUTES = ['/#cotizar', '/servicios/agentes-ia-whatsapp/#cotizar'];
export const MODAL_VP = ['1440x900', '390x844'];
/** Muestra un paso del modal (1–3) o una vista ('done' | 'fail') sin llenar el formulario (solo para medir). */
export const MODAL_SHOW = (v) => `(() => {
  const d = document.querySelector('dialog[data-cotizar-dialog]'); if (!d) return false;
  const form = d.querySelector('[data-qm-form]'), done = d.querySelector('[data-qm-done]'), fail = d.querySelector('[data-qm-fail]');
  const v = ${JSON.stringify(v)};
  if (typeof v === 'number') {
    if (form) form.hidden = false; if (done) done.hidden = true; if (fail) fail.hidden = true;
    for (const st of d.querySelectorAll('[data-qm-step]')) st.hidden = String(st.dataset.qmStep) !== String(v);
    const back = d.querySelector('[data-qm-back]'); if (back) back.hidden = v === 1;
  } else {
    if (form) form.hidden = true; if (done) done.hidden = v !== 'done'; if (fail) fail.hidden = v !== 'fail';
  }
  const body = d.querySelector('[data-qm-body]'); if (body) body.scrollTop = 0;
  return true;
})()`;
/** Abre la ruta con #cotizar y espera a que el binder abra el diálogo. */
export async function openModal(br, url, vp) {
  // el servidor de desarrollo compartido a veces tarda en compilar el binder: dos intentos de carga, hasta ~8 s cada uno
  for (let k = 0; k < 2; k++) {
    await br.open(url, { w: vp.w, h: vp.h, mobile: !!vp.mobile, reduced: true, wait: 2200 });
    for (let i = 0; i < 30; i++) {
      if (await br.evaluate(`!!document.querySelector('dialog[data-cotizar-dialog]')?.open`)) { await br.sleep(500); return true; }
      await br.sleep(200);
    }
  }
  return false;
}
const MODAL_COLLECT = `(() => {
  const d = document.querySelector('dialog[data-cotizar-dialog]');
  if (!d) return { exists: false };
  const vis = (el) => !!el && el.getClientRects().length > 0 && getComputedStyle(el).visibility !== 'hidden' && (!el.checkVisibility || el.checkVisibility({ opacityProperty: true, visibilityProperty: true }));
  const R = (el) => { const b = el.getBoundingClientRect(); return { x: b.left, y: b.top, w: b.width, h: b.height, r: b.right, b: b.bottom }; };
  const blues = ['rgb(0, 85, 255)', 'rgb(26, 102, 255)'];
  const blue = [...d.querySelectorAll('*')].filter((e) => vis(e) && blues.includes(getComputedStyle(e).backgroundColor)).filter((e) => { const b = e.getBoundingClientRect(); return b.bottom > 0 && b.top < innerHeight && b.width > 8 && b.height > 8; });
  const body = d.querySelector('[data-qm-body]');
  const panelEl = d.querySelector('.qm__panel') || d;
  const small = [];
  for (const el of d.querySelectorAll('.chip-opt, .seg__opt, [data-qm-close], .qm__foot .btn, [data-qm-done] .btn, [data-qm-fail] .btn')) {
    if (!vis(el)) continue;
    const b = el.getBoundingClientRect();
    if (b.height < 43.5 || (el.matches('.qm__close, .btn-icon') && b.width < 43.5)) small.push({ t: (el.textContent || el.getAttribute('aria-label') || '').trim().slice(0, 30), w: Math.round(b.width), h: Math.round(b.height) });
  }
  const title = d.querySelector('#qm-title'), next = [...d.querySelectorAll('[data-qm-next], [data-qm-done] .btn, [data-qm-fail] .btn')].find(vis);
  const close = [...d.querySelectorAll('[data-qm-close]')].find(vis);
  return {
    // el <dialog> cubre la pantalla (centra el panel con flex); lo que se mide es el panel de cristal (.qm__panel)
    exists: true, open: d.open, modal: d.matches(':modal'), vw: innerWidth, vh: innerHeight, panel: R(d.querySelector('.qm__panel') || d),
    // desborde que la persona puede desplazar (los contenedores con overflow hidden/clip, como el aura del panel, no cuentan)
    overX: Math.max(0, ...[d, panelEl, body].filter((e) => e && !/hidden|clip/.test(getComputedStyle(e).overflowX)).map((e) => e.scrollWidth - e.clientWidth)),
    title: title && vis(title) ? R(title) : null, next: next ? R(next) : null, close: close ? R(close) : null,
    blue: blue.map((e) => (e.textContent || e.className || e.tagName).toString().trim().slice(0, 30)), small,
    prefill: [...d.querySelectorAll('input[name="servicios"]:checked')].map((i) => i.value),
  };
})()`;
async function modalPass(br, base, R) {
  let n = 0;
  for (const vp of pickViewports(MODAL_VP, MODAL_VP)) {
    for (const route of MODAL_ROUTES) {
      const at0 = `${route} @${vp.name}`;
      if (!(await openModal(br, base + route, vp))) { R.fail(at0, 'el modal no abre con #cotizar (dialog[data-cotizar-dialog] sin open)'); continue; }
      for (const view of [1, 2, 3, 'done', 'fail']) {
        await br.evaluate(MODAL_SHOW(view));
        await br.sleep(450);
        const m = await br.evaluate(MODAL_COLLECT);
        const at = `${route} @${vp.name} · ${typeof view === 'number' ? `paso ${view}` : view === 'done' ? 'éxito' : 'falla'}`;
        n++;
        if (!m.exists) { R.fail(at, 'no existe dialog[data-cotizar-dialog]'); break; }
        if (view === 1 && (!m.open || !m.modal)) R.fail(at, 'el diálogo no está abierto como modal (showModal)');
        const p = m.panel;
        if (p.x < -1 || p.y < -1 || p.r > m.vw + 1 || p.b > m.vh + 1) R.fail(at, `el panel se sale de la pantalla: ${[p.x, p.y, p.w, p.h].map(Math.round).join(' × ')} en ${m.vw} × ${m.vh}`);
        if (m.overX > 1) R.fail(at, `desborde horizontal dentro del modal (${m.overX} px)`);
        if (typeof view === 'number' && !m.title) R.fail(at, 'el encabezado (#qm-title) no se ve');
        if (m.title && (m.title.y < -1 || m.title.b > m.vh + 1)) R.fail(at, 'el encabezado queda fuera de la pantalla');
        if (!m.next) R.fail(at, 'sin botón de acción visible (Continuar / Solicitar cotización / Listo / Reintentar)');
        else if (m.next.y < -1 || m.next.b > m.vh + 1) R.fail(at, `el botón de acción queda fuera de la pantalla (y ${Math.round(m.next.y)}–${Math.round(m.next.b)} de ${m.vh})`);
        if (!m.close) R.fail(at, 'sin botón cerrar visible');
        for (const sm of m.small) R.fail(at, `objetivo táctil bajo 44 px: "${sm.t}" ${sm.w} × ${sm.h}`);
        if (m.blue.length > 1) R.fail(at, `${m.blue.length} azules a la vista (F15/R15: uno por pantalla): ${m.blue.join(' · ')}`);
        if (vp.mobile && (p.w < m.vw - 1 || p.h < m.vh - 2)) R.warn(at, `en móvil el modal no es hoja a pantalla completa (${Math.round(p.w)} × ${Math.round(p.h)})`);
        if (!vp.mobile && (p.w > Math.min(720, m.vw - 48) + 1 || p.h > Math.min(860, m.vh * 0.92) + 1)) R.warn(at, `en escritorio el panel mide ${Math.round(p.w)} × ${Math.round(p.h)} (máx. 720 × min(860, 92dvh))`);
        if (view === 1 && route.startsWith('/servicios/agentes-ia-whatsapp/') && !m.prefill.includes('agentes-ia')) R.fail(at, `sin prefill: "agentes-ia" no está marcado (marcados: ${m.prefill.join(', ') || 'ninguno'})`);
      }
    }
  }
  return n;
}

const inside = (p, r, tol = 0) => p[0] >= r.x - tol && p[0] <= r.x + r.w + tol && p[1] >= r.y - tol && p[1] <= r.y + r.h + tol;
const project = (stage, b) => ({ x: stage.x + b[0] * stage.w, y: stage.y + b[1] * stage.h, w: (b[2] - b[0]) * stage.w, h: (b[3] - b[1]) * stage.h });
const overlap = (a, b) => Math.max(0, Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x)) * Math.max(0, Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y));

export async function run(opts) {
  const R = reporter('check-escenas', opts);
  const base = opts.url || 'http://127.0.0.1:4321';
  const vps = pickViewports(opts.vp, DEF_VP);
  // ── estático: placas usadas por páginas construidas
  const used = new Map();
  for (const p of SITEMAP) {
    if (!BUILT.has(p.url)) continue;
    for (const s of p.sections ?? []) {
      const ids = [s.plate?.id, typeof s.plate?.launchFallback === 'string' ? s.plate.launchFallback : s.plate?.launchFallback?.plate].flat().filter(Boolean);
      for (const id of ids) used.set(id, `${p.url}#${s.id}`);
    }
  }
  for (const [id, where] of used) {
    const pl = PLATES[id];
    if (!pl) { R.warn(where, `placa "${id}" sin registro en plates.json (se pinta su respaldo)`); continue; }
    for (const k of ['d', 'm']) if (!pl[k]?.w || !pl[k]?.h || !pl[k]?.ar) R.fail(where, `${id}: falta la versión ${k === 'd' ? 'de escritorio' : 'vertical'} (${k}.w/h/ar)`);
    if (typeof pl.alt !== 'string') R.fail(where, `${id}: sin alt en plates.json`);
    for (const k of ['d', 'm']) { if (!pl.safe?.[k]?.length) R.fail(where, `${id}: sin safe.${k}`); if (!pl.subject?.[k]) R.fail(where, `${id}: sin subject.${k}`); }
    for (const f of [`${id}-1920.avif`, `${id}-m-1080.avif`]) if (!existsSync(join(ROOT, 'public/img/cine', f))) R.fail(where, `${id}: falta public/img/cine/${f} (node scripts/plates.mjs)`);
  }
  // ── navegador
  const routes = [...BUILT].filter((u) => u !== '/404').filter((u) => !opts.only || opts.only.includes(u));
  const br = await launch();
  let scenes = 0;
  try {
    for (const vp of vps) {
      for (const route of routes) {
        await br.open(base + route, { w: vp.w, h: vp.h, mobile: !!vp.mobile, reduced: true, wait: 2200 });
        const data = await br.evaluate(COLLECT);
        for (const sc of data.scenes) {
          scenes++;
          const at = `${route}#${sc.id} @${vp.name}`;
          const pl = PLATES[sc.plate];
          if (!/rgba\(0, 0, 0, 0\)|transparent/.test(sc.bg) || (sc.bgi && sc.bgi !== 'none')) R.fail(at, `la sección pinta fondo propio (${sc.bg} ${sc.bgi !== 'none' ? sc.bgi.slice(0, 40) : ''}) · §3.11: solo body pinta fondo`);
          if (!pl) continue; // respaldo de lanzamiento: sin cajas que medir
          // sujeto (sin la franja que se disuelve abajo: fadeFrom en escritorio, 88 % en la vertical)
          if (sc.box.every((v) => v != null)) {
            const cut = sc.mob ? 0.88 : (sc.fade ?? 0.9);
            const b = [sc.box[0], sc.box[1], sc.box[2], Math.min(sc.box[3], cut)];
            const subj = project(sc.stage, b);
            const bad = sc.lines.filter((l) => !(sc.mob && l.more && sc.m !== 'top') && overlap(l, { x: subj.x + 4, y: subj.y + 4, w: subj.w - 8, h: subj.h - 8 }) > 0);
            if (bad.length) R.fail(at, `${bad.length} línea(s) de texto sobre el sujeto de ${sc.plate}: "${bad[0].t}"${bad.length > 1 ? ` (+${bad.length - 1})` : ''}`);
          }
          // safe: lo que cae dentro de la placa debe caer dentro de la unión de safe
          const safe = (pl.safe?.[sc.mob ? 'm' : 'd'] ?? []).map((s) => (sc.mirror ? [1 - s[2], s[1], 1 - s[0], s[3]] : s)).map((s) => project(sc.stage, s));
          if (safe.length) {
            // solo cuenta la parte visible de la placa: sin la disolución superior (10 %), la inferior (fadeFrom / 88 %) ni los
            // bordes laterales que se funden en pantallas ultra anchas (6 %)
            const cutB = sc.mob ? 0.88 : (sc.fade ?? 0.9);
            const core = project(sc.stage, [0.06, 0.1, 0.94, cutB]);
            const out = sc.lines.filter((l) => !l.more || !sc.mob).filter((l) => {
              const pts = [[l.x + 2, l.y + 2], [l.x + l.w - 2, l.y + 2], [l.x + 2, l.y + l.h - 2], [l.x + l.w - 2, l.y + l.h - 2]];
              return pts.some((p) => inside(p, core) && !safe.some((s) => inside(p, s, 0.015 * sc.stage.w)));
            });
            if (out.length) R.warn(at, `${out.length} línea(s) fuera de la zona segura de ${sc.plate}: "${out[0].t}"`);
          }
          // R3 (390 × 844): modo top, texto hasta la cabeza ≤ 1.1 pantallas
          if (vp.name === '390x844' && sc.m === 'top' && sc.box[1] != null) {
            const head = sc.stage.y + sc.box[1] * sc.stage.h;
            const d = head - sc.sec.y;
            if (d > 930) R.fail(at, `R3: ${Math.round(d)} px de la parte superior de la sección a la cabeza del sujeto (máx. 930): usa mobile 'split'`);
          }
          // R4: anclas
          for (const a of sc.anchors) {
            if (!a.shown) continue;
            if (sc.mob && sc.mnull.includes(a.name) && !a.mNone) R.fail(at, `R4: la pieza anclada "${a.name}" se pinta en la placa vertical sin coordenadas propias (falta data-m="none" o anchors.${a.name}.m)`);
            if (a.ax != null && a.ay != null && a.box && a.lock) {
              const p = [sc.stage.x + a.ax * sc.stage.w, sc.stage.y + a.ay * sc.stage.h];
              if (!inside(p, a.box, 8)) R.fail(at, `R4: la pieza anclada "${a.name}" no cae sobre su punto (±8 px): punto ${p.map(Math.round)} · caja ${[a.box.x, a.box.y, a.box.w, a.box.h].map(Math.round)}`);
            }
          }
        }
      }
    }
    // ── modal de cotización abierto (§6.1)
    if (!process.argv.includes('--sin-modal') && opts.modal !== false && (!opts.only || opts.only.some((u) => MODAL_ROUTES.some((m) => m.startsWith(u))))) {
      const views = await modalPass(br, base, R);
      R.info(`modal de cotización: ${MODAL_ROUTES.length} ruta(s) × ${MODAL_VP.length} tamaño(s) · ${views} vista(s) medidas`);
    }
  } finally { await br.close(); }
  if (br.errors.length) R.warn(null, `errores de JavaScript durante la revisión: ${[...new Set(br.errors)].slice(0, 3).join(' · ')}`);
  R.info(`${routes.length} página(s) × ${vps.length} tamaño(s) · ${scenes} escena(s) medidas · ${used.size} placa(s) en uso`);
  return R.done();
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const o = parseArgs();
  const i = process.argv.indexOf('--vp');
  if (i > 0) o.vp = (process.argv[i + 1] || '').split(',');
  const r = await run(o);
  process.exit(r.fails ? 1 : 0);
}
