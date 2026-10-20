// Ritmo: con los valores reales (sin acelerar), nunca más de 5 peticiones por segundo (Kommo admite 7).
import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import { crearMockKommo } from './_mock-kommo.mjs';
import { correr } from './_util.mjs';

describe('kommo-configurar · ritmo', () => {
  test('≤ 5 peticiones por segundo con el ritmo por defecto', async () => {
    const mock = await crearMockKommo();
    try {
      const r = await correr(mock, ['--prueba'], { env: { KOMMO_SETUP_INTERVALO_MS: null, KOMMO_SETUP_ESPERA_MS: null } });
      assert.equal(r.codigo, 0, r.stdout + r.stderr);
      const t = mock.peticiones.map((p) => p.t);
      assert.ok(t.length >= 6, `solo hubo ${t.length} peticiones`);
      // El script espera 200 ms entre peticiones. Aquí se mide del lado del simulador, que puede atender alguna
      // tarde si la computadora está ocupada (p. ej. con las pruebas en paralelo); por eso el margen: promedio
      // ≥ 170 ms y ninguna ventana de 6 por debajo de 850 ms. Aun con el margen queda bajo las 7 por segundo de
      // Kommo (143 ms), y sin ritmo el promedio sería de 1 o 2 ms.
      const promedio = (t.at(-1) - t[0]) / (t.length - 1);
      assert.ok(promedio >= 170, `promedio de ${promedio.toFixed(0)} ms entre peticiones`);
      for (let i = 0; i + 5 < t.length; i++) assert.ok(t[i + 5] - t[i] >= 850, `6 peticiones en ${t[i + 5] - t[i]} ms`);
      assert.ok(r.ms >= 1000, `terminó en ${r.ms} ms`);
    } finally {
      await mock.cerrar();
    }
  });
});
