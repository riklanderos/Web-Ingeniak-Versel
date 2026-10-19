// scripts/_cdp.mjs — Chrome sin ventana por el protocolo de depuración (CDP), sin dependencias.
// Lo usan las guardas que necesitan un navegador real (check-escenas.mjs, check-contraste.mjs): abre un perfil aislado,
// emula el tamaño de pantalla (y móvil/táctil), movimiento reducido y devuelve evaluate() / screenshot().
import { spawn } from 'node:child_process';
import { mkdtempSync, rmSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const CHROME = process.env.CHROME_BIN || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export async function launch() {
  if (!existsSync(CHROME)) throw new Error(`[cdp] no encuentro Chrome en ${CHROME} (define CHROME_BIN)`);
  const port = 9400 + Math.floor(Math.random() * 500);
  const prof = mkdtempSync(join(tmpdir(), 'ingeniak-guard-'));
  const proc = spawn(CHROME, ['--headless=new', `--remote-debugging-port=${port}`, `--user-data-dir=${prof}`, '--disable-gpu', '--hide-scrollbars', '--force-color-profile=srgb', 'about:blank'], { stdio: 'ignore' });
  let ws;
  for (let i = 0; i < 75 && !ws; i++) {
    try {
      const t = (await (await fetch(`http://127.0.0.1:${port}/json`)).json()).find((x) => x.type === 'page');
      if (t) ws = new WebSocket(t.webSocketDebuggerUrl);
    } catch {}
    if (!ws) await sleep(200);
  }
  if (!ws) { proc.kill('SIGKILL'); throw new Error('[cdp] Chrome no respondió'); }
  await new Promise((r, j) => { ws.addEventListener('open', r); ws.addEventListener('error', j); });
  let id = 0;
  const pending = new Map();
  const errors = [];
  ws.addEventListener('message', (m) => {
    const d = JSON.parse(m.data);
    if (d.id && pending.has(d.id)) { const p = pending.get(d.id); pending.delete(d.id); d.error ? p.rej(new Error(d.error.message)) : p.res(d.result); }
    else if (d.method === 'Runtime.exceptionThrown') errors.push(d.params.exceptionDetails?.exception?.description?.split('\n')[0] ?? 'excepción');
  });
  const send = (method, params = {}) => new Promise((res, rej) => { const i = ++id; pending.set(i, { res, rej }); ws.send(JSON.stringify({ id: i, method, params })); });
  await send('Page.enable');
  await send('Runtime.enable');
  const api = {
    errors,
    send,
    async evaluate(expression) {
      const r = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
      if (r.exceptionDetails) throw new Error(`[cdp] ${r.exceptionDetails.exception?.description?.split('\n')[0] ?? r.exceptionDetails.text}`);
      return r.result.value;
    },
    /** Abre url a w × h; mobile = true emula teléfono (táctil, viewport móvil). reduced = prefers-reduced-motion. */
    async open(url, { w, h, mobile = false, reduced = true, wait = 2500 }) {
      await send('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: 1, mobile });
      await send('Emulation.setTouchEmulationEnabled', mobile ? { enabled: true, maxTouchPoints: 5 } : { enabled: false });
      await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: reduced ? 'reduce' : 'no-preference' }] });
      await send('Page.navigate', { url });
      await sleep(wait);
      await api.evaluate('document.fonts ? document.fonts.ready.then(() => true) : true');
    },
    async screenshot() {
      const s = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
      return Buffer.from(s.data, 'base64');
    },
    async close() { try { ws.close(); } catch {} proc.kill('SIGKILL'); await sleep(150); try { rmSync(prof, { recursive: true, force: true }); } catch {} },
    sleep,
  };
  return api;
}

/** Tamaños de QA (ESPEC §3.10 y §2.1.1). mobile = se emula teléfono. */
export const VIEWPORTS = {
  '1280x720': { w: 1280, h: 720 }, '1440x900': { w: 1440, h: 900 }, '1920x1080': { w: 1920, h: 1080 }, '2560x1080': { w: 2560, h: 1080 },
  '390x844': { w: 390, h: 844, mobile: true }, '360x740': { w: 360, h: 740, mobile: true }, '1024x1366': { w: 1024, h: 1366, mobile: true },
};
export function pickViewports(list, def) {
  const names = (list ?? def).filter((n) => VIEWPORTS[n]);
  return names.map((n) => ({ name: n, ...VIEWPORTS[n] }));
}
