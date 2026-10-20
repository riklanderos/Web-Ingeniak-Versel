// scripts/check-contraste.mjs — contraste AA del texto sobre imagen (ESPEC-v2 §2.1.1, §3.10, §8.6). Necesita Chrome y un servidor.
// Por página construida a 390×844, 1024×1366, 1440×900 y 1920×1080, con movimiento reducido (todo visible y quieto):
// recorre cada <section class="is"> pantalla por pantalla; mide las cajas de línea de cada nodo de texto visible (sin
// aria-hidden), vuelve el texto transparente, toma la captura y busca el píxel más claro bajo cada línea (con un
// desenfoque de 3 × 3 para que el grano y el antialias no cuenten). Falla si la relación con el color real del texto
// queda bajo 4.5:1 (cuerpo) o 3:1 (≥ 24 px, o ≥ 18.7 px en 600+). Botones, chips y cristales cuentan con su propio fondo
// (solo se oculta el texto). Texto con degradado (color transparente) se mide como cian (#00E5FF).
// Uso: node scripts/check-contraste.mjs [--url http://127.0.0.1:4321] [--only /,/discovery/] [--vp 390x844,1440x900]
import { pathToFileURL } from 'node:url';
import sharp from 'sharp';
import { BUILT, parseArgs, reporter } from './_html.mjs';
import { launch, pickViewports } from './_cdp.mjs';

const DEF_VP = ['390x844', '1024x1366', '1440x900', '1920x1080'];
const lin = (c) => { c /= 255; return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
const lum = (r, g, b) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
const ratio = (a, b) => (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);

const SECTIONS = `[...document.querySelectorAll('section.is')].map((s) => { const b = s.getBoundingClientRect(); return { id: s.id || '', y: b.top + scrollY, h: b.height }; })`;
/** Líneas visibles dentro de la pantalla actual (coordenadas de la ventana). */
const LINES = (secId) => `(() => {
  const s = document.getElementById(${JSON.stringify(secId)}); if (!s) return [];
  const parse = (c) => { const m = c.match(/rgba?\\(([^)]+)\\)/); if (!m) return null; const p = m[1].split(/[ ,/]+/).filter(Boolean).map(Number); return [p[0], p[1], p[2], p[3] ?? 1]; };
  const out = [];
  // algo fijo o pegajoso de fuera de la sección (barra móvil, encabezado) sobre el borde de arriba o de abajo del renglón
  const fixedOut = (hit) => { if (!hit || s.contains(hit)) return false; for (let x = hit; x && x !== document.documentElement; x = x.parentElement) { const p = getComputedStyle(x).position; if (p === 'fixed' || p === 'sticky') return true; } return false; };
  const edgeFixed = (b) => [b.top + 1.5, b.bottom - 1.5].some((py) => [b.left + 2, (b.left + b.right) / 2, b.right - 2].some((px) => fixedOut(document.elementFromPoint(px, py))));
  const w = document.createTreeWalker(s, NodeFilter.SHOW_TEXT);
  let n;
  while ((n = w.nextNode())) {
    const t = n.textContent.trim(); if (!t) continue;
    const el = n.parentElement;
    if (!el || el.closest('[aria-hidden="true"], .sr-only, .visually-hidden, template, noscript, script, style')) continue;
    if (el.checkVisibility && !el.checkVisibility({ opacityProperty: true, visibilityProperty: true })) continue;
    const cs = getComputedStyle(el);
    let col = parse(cs.webkitTextFillColor && cs.webkitTextFillColor !== cs.color ? cs.webkitTextFillColor : cs.color);
    let clip = false;
    for (let x = el; x && x !== s.parentElement; x = x.parentElement) { const xs = x === el ? cs : getComputedStyle(x); if (/\btext\b/.test(xs.webkitBackgroundClip || '') || /\btext\b/.test(xs.backgroundClip || '')) { x.setAttribute('data-hide-clip', ''); clip = true; break; } }
    if (!col || col[3] === 0 || clip) col = [0, 229, 255, 1]; // texto con degradado (background-clip:text): se mide como cian
    let op = 1; for (let x = el; x && x !== document.body; x = x.parentElement) op *= parseFloat(getComputedStyle(x).opacity);
    const fs = parseFloat(cs.fontSize), fw = parseInt(cs.fontWeight, 10) || 400;
    // recorte de los contenedores con overflow (un chat con scroll, una ventana): solo cuenta la parte visible. Empieza en el
    // propio elemento: un renglón con overflow:hidden y alto 0 (filas inactivas de LocationSwitcher) no es visible.
    let clipR = { l: -1e9, t: -1e9, r: 1e9, b: 1e9 };
    for (let x = el; x && x !== document.body; x = x.parentElement) { const xs = x === el ? cs : getComputedStyle(x); if (xs.overflowX !== 'visible' || xs.overflowY !== 'visible' || xs.clipPath !== 'none') { const q = x.getBoundingClientRect(); clipR = { l: Math.max(clipR.l, q.left), t: Math.max(clipR.t, q.top), r: Math.min(clipR.r, q.right), b: Math.min(clipR.b, q.bottom) }; } }
    const rg = document.createRange(); rg.selectNodeContents(n);
    for (const b0 of rg.getClientRects()) {
      const l0 = Math.max(b0.left, clipR.l), t0 = Math.max(b0.top, clipR.t), r0 = Math.min(b0.right, clipR.r), bb = Math.min(b0.bottom, clipR.b);
      if (r0 - l0 < 3 || bb - t0 < Math.min(6, b0.height * 0.6)) continue;
      const b = { left: l0, top: t0, right: r0, bottom: bb, width: r0 - l0, height: bb - t0 };
      if (b.width < 3 || b.height < 3 || b.bottom <= 0 || b.top >= innerHeight || b.right <= 0 || b.left >= innerWidth) continue;
      if (b.top < 0 || b.bottom > innerHeight) continue; // se mide en la pantalla donde cabe completa
      // tapada por algo fijo de fuera de la sección (encabezado, barra móvil, píldora de Kain): no se mide aquí
      const pts = [[b.left + 2, (b.top + b.bottom) / 2], [(b.left + b.right) / 2, (b.top + b.bottom) / 2], [b.right - 2, (b.top + b.bottom) / 2]];
      if (pts.some(([px, py]) => { const hit = document.elementFromPoint(px, py); return hit && !s.contains(hit); }) || edgeFixed(b)) continue;
      out.push({ x: b.left, y: b.top, w: b.width, h: b.height, absY: Math.round(b.top + scrollY), t: t.slice(0, 48), col, a: col[3] * op, large: fs >= 24 || (fs >= 18.66 && fw >= 600), fs });
    }
  }
  return out;
})()`;
const HIDE = `(() => { const st = document.createElement('style'); st.id = '__hide_text'; st.textContent = 'section.is, section.is *, section.is *::before, section.is *::after { color: transparent !important; -webkit-text-fill-color: transparent !important; text-shadow: none !important; caret-color: transparent !important; } section.is svg text { fill: transparent !important; } [data-hide-clip], [data-hide-clip] * { background: none !important; }'; document.head.appendChild(st); for (const e of document.querySelectorAll('section.is *')) { const c = getComputedStyle(e); if (/\\btext\\b/.test(c.webkitBackgroundClip || '') || /\\btext\\b/.test(c.backgroundClip || '')) e.setAttribute('data-hide-clip', ''); } for (const e of document.querySelectorAll('[data-hide-clip]')) { e.dataset.prevStyle = e.getAttribute('style') ?? ''; e.style.setProperty('background', 'none', 'important'); e.style.setProperty('-webkit-text-fill-color', 'transparent', 'important'); } return true; })()`;
const SHOW = `(() => { document.getElementById('__hide_text')?.remove(); for (const e of document.querySelectorAll('[data-hide-clip]')) { if (e.dataset.prevStyle) e.setAttribute('style', e.dataset.prevStyle); else e.removeAttribute('style'); delete e.dataset.prevStyle; } return true; })()`;
const IMGS_READY = `new Promise((res) => { const t0 = performance.now(); const tick = () => { const imgs = [...document.images].filter((i) => { const b = i.getBoundingClientRect(); return b.bottom > 0 && b.top < innerHeight && b.width > 0; }); if (imgs.every((i) => i.complete) || performance.now() - t0 > 2500) res(true); else setTimeout(tick, 80); }; tick(); })`;

export async function run(opts) {
  const R = reporter('check-contraste', opts);
  const base = opts.url || 'http://127.0.0.1:4321';
  const vps = pickViewports(opts.vp, DEF_VP);
  const routes = [...BUILT].filter((u) => u !== '/404').filter((u) => !opts.only || opts.only.includes(u));
  const br = await launch();
  let measured = 0;
  try {
    for (const vp of vps) {
      for (const route of routes) {
        await br.open(base + route, { w: vp.w, h: vp.h, mobile: !!vp.mobile, reduced: true, wait: 2200 });
        const secs = await br.evaluate(SECTIONS);
        const seen = new Set();
        const worst = new Map(); // sección → { n, peor }
        for (const sec of secs) {
          for (let y = sec.y; y < sec.y + sec.h; y += Math.max(200, vp.h - 160)) {
            await br.evaluate(`document.documentElement.style.scrollBehavior = 'auto'; scrollTo({ top: ${Math.round(y)}, behavior: 'instant' }); true`);
            await br.sleep(260);
            await br.evaluate(IMGS_READY);
            const sy = await br.evaluate('scrollY');
            const lines = (await br.evaluate(LINES(sec.id))).filter((l) => { const k = `${l.t}|${l.absY}|${Math.round(l.x)}`; if (seen.has(k)) return false; seen.add(k); return true; });
            if (!lines.length) continue;
            await br.evaluate(HIDE);
            await br.sleep(60);
            const png = await br.screenshot();
            if ((await br.evaluate('scrollY')) !== sy) { await br.evaluate(SHOW); R.warn(`${route}#${sec.id} @${vp.name}`, 'la página se movió durante la medición; repetir'); continue; }
            if (process.env.CONTRASTE_DEBUG) { const { writeFileSync } = await import('node:fs'); writeFileSync(`${process.env.CONTRASTE_DEBUG}/${route.replace(/\W+/g, '_')}-${vp.name}-${sec.id}-${Math.round(y)}.png`, png); }
            await br.evaluate(SHOW);
            const { data, info } = await sharp(png).removeAlpha().blur(0.8).raw().toBuffer({ resolveWithObject: true });
            for (const l of lines) {
              const x0 = Math.max(0, Math.floor(l.x + 1)), x1 = Math.min(info.width - 1, Math.ceil(l.x + l.w - 1));
              const y0 = Math.max(0, Math.floor(l.y + 1)), y1 = Math.min(info.height - 1, Math.ceil(l.y + l.h - 1));
              let maxL = 0, minL = 1, sum = 0, cnt = 0, brightest = [0, 0, 0];
              for (let yy = y0; yy <= y1; yy++) for (let xx = x0; xx <= x1; xx++) {
                const i = (yy * info.width + xx) * info.channels;
                const L = lum(data[i], data[i + 1], data[i + 2]);
                if (L > maxL) { maxL = L; brightest = [data[i], data[i + 1], data[i + 2]]; }
                if (L < minL) minL = L; sum += L; cnt++;
              }
              if (!cnt) continue;
              measured++;
              // color efectivo del texto (opacidad) sobre el píxel más claro
              const [r, g, b] = l.col; const a = Math.max(0, Math.min(1, l.a));
              const eff = [r * a + brightest[0] * (1 - a), g * a + brightest[1] * (1 - a), b * a + brightest[2] * (1 - a)];
              const Lt = lum(...eff);
              const light = Lt >= sum / cnt;
              const cr = light ? ratio(Lt, maxL) : ratio(Lt, minL);
              const need = l.large ? 3 : 4.5;
              if (cr < need) {
                const k = sec.id || '(sin id)';
                const w = worst.get(k) ?? { n: 0, cr: 99, l: null, bg: 0 };
                w.n++;
                if (cr < w.cr) Object.assign(w, { cr, l, bg: light ? maxL : minL });
                worst.set(k, w);
              }
            }
          }
        }
        for (const [k, w] of worst) R.fail(`${route}#${k} @${vp.name}`, `${w.n} línea(s) bajo AA; peor ${w.cr.toFixed(2)}:1 (necesita ${w.l.large ? 3 : 4.5}:1, fondo L ${w.bg.toFixed(3)}): "${w.l.t}"`);
      }
    }
  } finally { await br.close(); }
  R.info(`${routes.length} página(s) × ${vps.length} tamaño(s) · ${measured} línea(s) medidas`);
  return R.done();
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const o = parseArgs();
  const i = process.argv.indexOf('--vp');
  if (i > 0) o.vp = (process.argv[i + 1] || '').split(',');
  const r = await run(o);
  process.exit(r.fails ? 1 : 0);
}
