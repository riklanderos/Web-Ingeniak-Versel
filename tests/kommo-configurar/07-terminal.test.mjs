// Pregunta oculta en una terminal de verdad (pseudo-terminal con /usr/bin/expect, que trae macOS).
// Comprueba que al escribir o pegar el token no aparece nada en pantalla y que Backspace funciona.
// Si la computadora no tiene `expect`, la prueba se salta (las demás cubren la entrada sin terminal).
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { existsSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { after, before, describe, test } from 'node:test';
import { crearMockKommo } from './_mock-kommo.mjs';
import { RAIZ, SCRIPT, TOKEN_PRUEBA, borrar, carpetaTemporal } from './_util.mjs';

const EXPECT = '/usr/bin/expect';

describe('kommo-configurar · terminal real', { skip: existsSync(EXPECT) ? false : 'no hay /usr/bin/expect' }, () => {
  let dir;
  before(() => {
    dir = carpetaTemporal();
  });
  after(() => borrar(dir));

  test('el token no se ve al escribirlo ni al pegarlo; Backspace borra; Enter termina', async () => {
    const mock = await crearMockKommo();
    try {
      // El token llega por variables del proceso de expect (no se escribe en el .exp).
      const exp = join(dir, 'terminal.exp');
      writeFileSync(
        exp,
        [
          'set timeout 20',
          `spawn "${process.execPath}" "${SCRIPT}" --prueba`,
          'expect "Subdominio de Kommo"',
          'send "ejemplo\\r"',
          'expect "Pega tu token"',
          'send -- "$env(TOK_A)"',
          'sleep 0.2',
          'send -- "$env(TOK_B)X\\x7f"',
          'sleep 0.2',
          'send "\\r"',
          'expect eof',
          '',
        ].join('\n'),
      );
      const env = {
        PATH: process.env.PATH ?? '',
        HOME: process.env.HOME ?? '',
        TERM: 'xterm-256color',
        KOMMO_BASE_URL: mock.url,
        KOMMO_SETUP_INTERVALO_MS: '0',
        TOK_A: TOKEN_PRUEBA.slice(0, 12),
        TOK_B: TOKEN_PRUEBA.slice(12),
      };
      const salida = await new Promise((ok, mal) => {
        const h = spawn(EXPECT, ['-f', exp], { cwd: RAIZ, env, stdio: ['ignore', 'pipe', 'pipe'] });
        let o = '';
        h.stdout.on('data', (d) => (o += d));
        h.stderr.on('data', (d) => (o += d));
        const reloj = setTimeout(() => {
          h.kill('SIGKILL');
          mal(new Error(`expect no terminó:\n${o}`));
        }, 30_000);
        h.on('close', () => {
          clearTimeout(reloj);
          ok(o);
        });
      });
      if (/Operation not (supported|permitted)|openpty|tcgetattr/i.test(salida) && !mock.peticiones.length) return; // sin pseudo-terminal disponible
      assert.match(salida, /Token recibido/);
      assert.ok(mock.peticiones.length >= 6, salida);
      assert.ok(
        mock.peticiones.every((p) => p.autorizado),
        'el token llegó completo y sin la «X» borrada',
      );
      for (const pedazo of [TOKEN_PRUEBA, TOKEN_PRUEBA.slice(0, 12), TOKEN_PRUEBA.slice(12)]) assert.ok(!salida.includes(pedazo), 'se vio el token en la terminal');
      assert.ok(!salida.includes('*'.repeat(4)), 'tampoco se muestran asteriscos');
    } finally {
      await mock.cerrar();
    }
  });
});
