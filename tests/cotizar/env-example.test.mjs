// .env.example lista todas las variables de §3.6 y §5.8, sin ningún valor y con un comentario cada una.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const VARIABLES = [
  // §3.6
  'KOMMO_SUBDOMAIN', 'KOMMO_TOKEN', 'KOMMO_PIPELINE_ID', 'KOMMO_STATUS_ID', 'KOMMO_RESPONSIBLE_USER_ID',
  'KOMMO_DISCOVERY_STATUS_ID', 'KOMMO_POWER_PIPELINE_ID', 'KOMMO_POWER_STATUS_ID',
  'KOMMO_AGENDA_PIPELINE_ID', 'KOMMO_AGENDA_STATUS_ID', 'NOTIFY_WEBHOOK_URL', 'NOTIFY_WEBHOOK_SECRET', 'KOMMO_BASE_URL',
  // §5.8
  'POWER_CALENDAR_ID', 'DISCOVERY_CALENDAR_ID', 'STRIPE_SECRET_KEY', 'CRON_SECRET', 'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY', 'AGENDA_GOOGLE_CONNECTOR', 'AGENDA_GOOGLE_SUBJECT', 'AGENDA_BASE_URL',
  'GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET', 'GOOGLE_REFRESH_TOKEN', 'AGENDA_MOCK', 'AGENDA_MOCK_LLENO',
];

test('.env.example · todas las variables, vacías, con comentario y sin repetir', () => {
  const lineas = readFileSync(new URL('../../.env.example', import.meta.url), 'utf8').split('\n');
  const asignaciones = lineas.map((l, i) => ({ l, i })).filter(({ l }) => /^[A-Z0-9_]+=/.test(l));
  const nombres = asignaciones.map(({ l }) => l.split('=')[0]);
  assert.deepEqual([...nombres].sort(), [...VARIABLES].sort());
  for (const { l, i } of asignaciones) {
    assert.match(l, /^[A-Z0-9_]+=$/, `sin valor: ${l}`);
    assert.match(lineas[i - 1] ?? '', /^# \S/, `comentario de una línea antes de ${l}`);
  }
  assert.doesNotMatch(lineas.join('\n'), /^(?!#).*(sk_live_|sk_test_[A-Za-z0-9]{8}|eyJ[A-Za-z0-9_-]{10,})/m, 'ningún valor real');
});
