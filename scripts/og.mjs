// scripts/og.mjs — imágenes Open Graph por página, 1200 × 630 (ESPEC-v2 §8.4).
// Para cada página construida de sitemap.json (copy + ruta) arma una plantilla HTML con la placa de su portada a sangre
// (master de src/assets/cine/), el H1 real en dos voces de Lexend (o kicker + cifra de metrics.ts + texto en casos),
// el imagotipo de Ingeniak y la etiqueta "AGENCIA DE IA · GUADALAJARA" (en casos: "CASO · <SECTOR> · <CIUDAD>"); si la placa
// muestra a una persona generada (su alt dice "imagen ilustrativa"), la marca IMAGEN ILUSTRATIVA; si la tarjeta lleva una
// cifra, la nota de fuente de metrics.ts (QA ronda 2). La fotografía con Chrome sin ventana
// (perfil aislado) y la convierte con sharp a JPG q82 ≤ 150 KB en public/img/og/<page.id>.jpg.
// También genera public/img/og/ingeniak.jpg (genérica). SEOHead lee /img/og/<page.id>.jpg y cae a la genérica.
// Uso: npm run og [-- <page.id> …]
import { readFileSync, writeFileSync, existsSync, mkdirSync, rmSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import sharp from 'sharp';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const OUT = join(ROOT, 'public/img/og');
const CHROME = process.env.CHROME_BIN || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const W = 1200, H = 630, MAX = 150 * 1024;
mkdirSync(OUT, { recursive: true });

const sitemap = JSON.parse(readFileSync(join(ROOT, 'src/data/sitemap.json'), 'utf8'));
const plates = JSON.parse(readFileSync(join(ROOT, 'src/data/plates.json'), 'utf8'));
const metricsSrc = readFileSync(join(ROOT, 'src/lib/metrics.ts'), 'utf8');
const metricValue = (id) => metricsSrc.match(new RegExp(`'${id}':\\s*\\{\\s*value:\\s*'([^']+)'`))?.[1];
const metricField = (id, f) => metricsSrc.match(new RegExp(`'${id}':\\s*\\{[^}]*?${f}:\\s*'([^']+)'`))?.[1];
const SOURCE_NOTE = metricsSrc.match(/SOURCE_NOTE\s*=\s*'([^']+)'/)?.[1] ?? '';
const PRICE = metricsSrc.match(/PRICE_FROM\s*=\s*'([^']+)'/)?.[1] ?? '';
const PRICE_CAP = metricsSrc.match(/PRICE_FROM_CAP\s*=\s*'([^']+)'/)?.[1] ?? '';
const copyOf = (id) => { const p = join(ROOT, 'src/content/paginas', `${id}.json`); return existsSync(p) ? JSON.parse(readFileSync(p, 'utf8')) : null; };
const routeFiles = (() => {
  const out = [];
  const walk = (d, base = '') => { for (const e of readdirSync(d, { withFileTypes: true })) { if (e.name.startsWith('_') || e.name.startsWith('.')) continue; if (e.isDirectory()) { if (!(base === '' && e.name === 'dev')) walk(join(d, e.name), `${base}/${e.name}`); } else if (/\.(astro|md|mdx)$/.test(e.name)) out.push(`${base}/${e.name}`); } };
  walk(join(ROOT, 'src/pages'));
  return out.map((f) => new RegExp('^' + (f.replace(/\.(astro|md|mdx)$/, '').replace(/\/index$/, '') + '/').replace(/\[[^\]]+\]/g, '[^/]+') + '$'));
})();
const built = (p) => !!copyOf(p.id) && routeFiles.some((rx) => rx.test(p.url));
const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const fileUrl = (p) => pathToFileURL(p).href;
const TOKEN = /\{\{(metric:([a-z0-9-]+)(?:\|(full|prose))?|price|Price|source)\}\}/g;
const plain = (s) => String(s ?? '').replace(TOKEN, (_, k, id, mod) => {
  if (k === 'price') return PRICE; if (k === 'Price') return PRICE_CAP; if (k === 'source') return SOURCE_NOTE;
  const v = metricValue(id) ?? '', l = metricField(id, 'label') ?? '';
  return mod === 'prose' ? (metricField(id, 'prose') ?? `${v} ${l}`) : mod === 'full' ? `${v} ${l}` : v;
});

const LABEL = 'Agencia de IA · Guadalajara';
/** Etiqueta de la tarjeta: en casos, sector y ciudad del caso (chips de la portada del copy), nunca la sede. */
function labelOf(page) {
  if (page.template !== 'T-CASE') return LABEL;
  const chips = copyOf(page.id)?.sections?.hero?.chips ?? [];
  const sector = plain(chips[0] ?? '').trim(), city = plain(chips[1] ?? '').split(',')[0].trim();
  return ['Caso', sector, city].filter(Boolean).join(' · ');
}
const FONT = (f) => fileUrl(join(ROOT, 'public/fonts', f));
const LOGO = readFileSync(join(ROOT, 'public/img/marca/imagotipo.svg'), 'utf8').replace(/<\?xml[^>]*>/, '');

function masterOf(id) {
  for (const ext of ['jpg', 'png', 'webp']) { const p = join(ROOT, 'src/assets/cine', `${id}.${ext}`); if (existsSync(p)) return p; }
  const pub = join(ROOT, 'public/img/cine', `${id}-1920.webp`);
  return existsSync(pub) ? pub : null;
}

/** Titular de la página: { kicker?, metric?, a, b? } con el texto real del H1. */
function headlineOf(page) {
  const h = copyOf(page.id)?.sections?.hero?.h1;
  if (h?.kicker || h?.metricId) return { kicker: plain(h.kicker), metric: metricValue(h.metricId), a: plain(h.text) };
  if (h?.text) return { a: plain(h.text), b: plain(h.soft) };
  return { a: plain(page.h1) };
}

function html({ plate, mirror, fx, head, chip, label = LABEL, illus = false }) {
  const big = head.metric ? 46 : (head.a.length + (head.b?.length ?? 0) > 70 ? 50 : 58);
  return `<!doctype html><html lang="es-MX"><head><meta charset="utf-8"><style>
@font-face{font-family:Lexend;src:url(${FONT('lexend-var-latin.woff2')}) format("woff2");font-weight:100 900}
@font-face{font-family:Lexend;src:url(${FONT('lexend-var-latin-ext.woff2')}) format("woff2");font-weight:100 900;unicode-range:U+0100-02BA,U+1E00-1EFF}
@font-face{font-family:Inter;src:url(${FONT('inter-var-latin.woff2')}) format("woff2");font-weight:300 700}
@font-face{font-family:Mono;src:url(${FONT('jetbrains-mono-var-latin.woff2')}) format("woff2");font-weight:400 600}
*{margin:0;box-sizing:border-box}
html,body{width:${W}px;height:${H}px;overflow:hidden;background:#03040B}
.plate{position:absolute;inset:0;background:url("${fileUrl(plate)}") ${Math.round((fx ?? 0.5) * 100)}% 42% / cover no-repeat;${mirror ? 'transform:scaleX(-1);' : ''}}
.veil{position:absolute;inset:0;background:linear-gradient(90deg,rgba(3,4,11,.92) 0%,rgba(3,4,11,.78) 34%,rgba(3,4,11,.25) 58%,rgba(3,4,11,0) 72%),linear-gradient(0deg,rgba(3,4,11,.55) 0%,rgba(3,4,11,0) 26%)}
.copy{position:absolute;left:64px;top:56px;bottom:56px;width:600px;display:flex;flex-direction:column;justify-content:space-between;color:#fff}
.logo svg{height:30px;width:auto;display:block}
.mid{display:flex;flex-direction:column;gap:22px}
.label{font:500 15px/1 Mono,monospace;letter-spacing:.16em;text-transform:uppercase;color:#00E5FF;display:flex;align-items:center;gap:12px}
.label i{width:9px;height:9px;border-radius:2px;background:#00E5FF;box-shadow:0 0 14px #00E5FF}
h1{font-family:Lexend,sans-serif;letter-spacing:-.025em;text-wrap:balance}
.a{display:block;font-weight:600;font-size:${big}px;line-height:1.04}
.b{display:block;font-weight:300;font-size:${Math.round(big * 0.62)}px;line-height:1.18;color:#C9D6E6;margin-top:12px}
.k{display:block;font:500 26px/1.2 Lexend,sans-serif;color:#DCE6F2;margin-bottom:6px}
.m{display:block;font:600 112px/1 Lexend,sans-serif;letter-spacing:-.04em;color:#fff;text-shadow:0 0 42px rgba(0,229,255,.45)}
.foot{display:flex;align-items:center;gap:16px;font:500 14px/1 Mono,monospace;letter-spacing:.14em;text-transform:uppercase;color:#9EB0C7}
.chip{padding:10px 14px;border-radius:999px;box-shadow:inset 0 0 0 1px rgba(0,229,255,.35);color:#DCE6F2;background:rgba(255,255,255,.04)}
.src{font:400 13px/1.3 Inter,sans-serif;letter-spacing:0;text-transform:none;color:#9EB0C7}
.illus{position:absolute;right:28px;bottom:24px;font:500 12px/1 Mono,monospace;letter-spacing:.16em;text-transform:uppercase;color:#C9D6E6;padding:7px 10px;border-radius:999px;background:rgba(3,4,11,.62);box-shadow:inset 0 0 0 1px rgba(158,176,199,.32)}
</style></head><body>
<div class="plate"></div><div class="veil"></div>
<div class="copy">
  <div class="logo">${LOGO}</div>
  <div class="mid">
    <p class="label"><i></i>${esc(label)}</p>
    <h1>${head.metric ? `<span class="k">${esc(head.kicker)}</span><span class="m">${esc(head.metric)}</span><span class="a" style="font-size:40px;margin-top:10px">${esc(head.a)}</span>` : `<span class="a">${esc(head.a)}</span>${head.b ? `<span class="b">${esc(head.b)}</span>` : ''}`}</h1>
  </div>
  <div class="foot"><span>ingeniak.mx</span>${chip ? `<span class="chip">${esc(chip)}</span>` : ''}${head.metric && SOURCE_NOTE ? `<span class="src">Fuente: ${esc(SOURCE_NOTE.charAt(0).toLowerCase() + SOURCE_NOTE.slice(1))}.</span>` : ''}</div>
</div>
${illus ? '<span class="illus">Imagen ilustrativa</span>' : ''}
</body></html>`;
}

async function render(name, opts) {
  const dir = join(tmpdir(), `og-${process.pid}-${name}`);
  mkdirSync(dir, { recursive: true });
  const page = join(dir, 'og.html');
  const png = join(dir, 'og.png');
  writeFileSync(page, html(opts));
  const profile = join(tmpdir(), `chrome-og-${process.pid}-${Math.random().toString(36).slice(2, 8)}`);
  execFileSync(CHROME, ['--headless=new', `--user-data-dir=${profile}`, '--disable-gpu', '--hide-scrollbars', '--force-device-scale-factor=1',
    '--allow-file-access-from-files', `--window-size=${W},${H}`, '--virtual-time-budget=6000', `--screenshot=${png}`, fileUrl(page)], { stdio: 'ignore', timeout: 60000 });
  rmSync(profile, { recursive: true, force: true });
  const out = join(OUT, `${name}.jpg`);
  let q = 82, buf;
  do { buf = await sharp(png).resize(W, H, { fit: 'cover' }).jpeg({ quality: q, mozjpeg: true, chromaSubsampling: '4:2:0' }).toBuffer(); q -= 4; } while (buf.length > MAX && q >= 50);
  writeFileSync(out, buf);
  rmSync(dir, { recursive: true, force: true });
  if (/cierran/i.test(JSON.stringify(opts.head))) throw new Error(`[og] ${name}: el texto contiene "cierran"`);
  console.log(`[og] ${name}.jpg · ${Math.round(buf.length / 1024)} KB · q${q + 4} · placa ${opts.plate.split('/').pop()}`);
}

const only = process.argv.slice(2);
const jobs = [];
for (const p of sitemap) {
  if (p.template === 'T-404' || !built(p)) continue;
  if (only.length && !only.includes(p.id)) continue;
  const hero = (p.sections ?? []).find((s) => s.id === 'hero');
  const pid = Array.isArray(hero?.plate?.id) ? hero.plate.id[0] : hero?.plate?.id;
  const fb = hero?.plate?.launchFallback;
  const id = pid && masterOf(pid) ? pid : (typeof fb === 'string' ? fb : fb?.plate);
  const master = id && masterOf(id);
  if (!master) { console.warn(`[og] ${p.id}: sin placa de portada; se omite (usa la genérica)`); continue; }
  const meta = plates[id] ?? {};
  const mirror = id === pid ? !!hero?.plate?.mirror : !!fb?.mirror;
  jobs.push([p.id, { plate: master, mirror, fx: meta.d?.fx, head: headlineOf(p), label: labelOf(p), illus: /imagen ilustrativa/i.test(meta.alt ?? '') }]);
}
if (!only.length || only.includes('ingeniak')) {
  jobs.push(['ingeniak', { plate: masterOf('home-hero'), fx: plates['home-hero']?.d?.fx, head: { a: 'Agentes de IA, CRM y automatización', b: 'en un solo sistema.' }, chip: 'Partner oficial de Kommo en LATAM' }]);
}
for (const [name, o] of jobs) await render(name, o);
