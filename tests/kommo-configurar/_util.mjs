// Utilidades de las pruebas de scripts/kommo-configurar.mjs (no es un archivo de prueba).
// El script corre como proceso hijo contra el simulador local (_mock-kommo.mjs). Nunca se llama a Kommo real:
// el hijo recibe un entorno mínimo (sin heredar KOMMO_* de quien corre las pruebas) y un token de mentira.
import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdtempSync, readdirSync, readFileSync, rmSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { TOKEN_PRUEBA } from './_mock-kommo.mjs';

export const RAIZ = fileURLToPath(new URL('../../', import.meta.url));
export const SCRIPT = fileURLToPath(new URL('../../scripts/kommo-configurar.mjs', import.meta.url));
export { TOKEN_PRUEBA };

/** Carpeta temporal propia de la prueba (se borra en `after`). */
export function carpetaTemporal() {
  return mkdtempSync(join(tmpdir(), 'kommo-configurar-'));
}

export function borrar(dir) {
  rmSync(dir, { recursive: true, force: true });
}

/**
 * Corre el script. `env` se mezcla con el entorno mínimo; un valor `null` quita la variable.
 * @returns {Promise<{codigo: number|null, stdout: string, stderr: string, ms: number}>}
 */
export function correr(mock, args = [], { env = {}, entrada = '', salida = null, limiteMs = 30_000 } = {}) {
  const base = {
    PATH: process.env.PATH ?? '',
    HOME: process.env.HOME ?? '',
    KOMMO_BASE_URL: mock?.url,
    KOMMO_SUBDOMAIN: 'ejemplo',
    KOMMO_TOKEN: TOKEN_PRUEBA,
    KOMMO_SETUP_INTERVALO_MS: '0',
    KOMMO_SETUP_ESPERA_MS: '5',
  };
  const mezcla = { ...base, ...env };
  const final = Object.fromEntries(Object.entries(mezcla).filter(([, v]) => v !== null && v !== undefined).map(([k, v]) => [k, String(v)]));
  const argumentos = [SCRIPT, ...args, ...(salida ? [`--salida=${salida}`] : [])];
  const inicio = Date.now();
  return new Promise((ok, mal) => {
    const hijo = spawn(process.execPath, argumentos, { cwd: RAIZ, env: final, stdio: ['pipe', 'pipe', 'pipe'] });
    let stdout = '';
    let stderr = '';
    hijo.stdout.setEncoding('utf8').on('data', (d) => (stdout += d));
    hijo.stderr.setEncoding('utf8').on('data', (d) => (stderr += d));
    const reloj = setTimeout(() => {
      hijo.kill('SIGKILL');
      mal(new Error(`El script no terminó en ${limiteMs} ms.\nSTDOUT:\n${stdout}\nSTDERR:\n${stderr}`));
    }, limiteMs);
    hijo.on('error', mal);
    hijo.on('close', (codigo) => {
      clearTimeout(reloj);
      ok({ codigo, stdout, stderr, ms: Date.now() - inicio });
    });
    hijo.stdin.end(entrada);
  });
}

/** Cuenta las líneas del reporte que coinciden (p. ej. «Se crearía · Campo»). */
export function lineas(texto, patron) {
  return texto.split('\n').filter((l) => l.includes(patron)).length;
}

/** Todos los archivos (recursivo) de una carpeta con su contenido. */
export function archivos(dir) {
  const lista = [];
  for (const nombre of readdirSync(dir)) {
    const ruta = join(dir, nombre);
    if (statSync(ruta).isDirectory()) lista.push(...archivos(ruta));
    else lista.push({ ruta, contenido: readFileSync(ruta, 'utf8') });
  }
  return lista;
}

export function leerJson(ruta) {
  return JSON.parse(readFileSync(ruta, 'utf8'));
}

/**
 * Token de mentira con la forma de un token de larga duración de Kommo (JWT de cientos de caracteres).
 * Determinista (sale de un hash encadenado) y sin ningún dato real.
 */
export function jwtFalso(largo = 650) {
  const b64 = (o) => Buffer.from(JSON.stringify(o)).toString('base64url');
  const cabecera = b64({ typ: 'JWT', alg: 'RS256' }); // eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9
  const carga = b64({ aud: 'simulado', jti: 'simulado-no-real', iat: 1760900000, nbf: 1760900000, exp: 1792436000, sub: '9001', account_id: 31000001, base_domain: 'kommo.com', version: 2, scopes: ['crm', 'files', 'notifications'], hash_uuid: 'simulado-no-real' });
  let firma = '';
  let h = 'semilla-de-prueba';
  while (firma.length < largo) {
    h = createHash('sha256').update(h).digest('base64url');
    firma += h;
  }
  return `${cabecera}.${carga}.${firma}`.slice(0, largo);
}
