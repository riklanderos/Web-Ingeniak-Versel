// ID de Analytics del visitante (cambio 2026-11-19). La cotización y la agenda lo mandan con el lead: Kommo lo guarda en
// su campo de rastreo GCLIENTID y, cuando el lead pasa a «Calificado» o se gana, api/kommo/etapa.js lo usa para avisar a
// Google Analytics a nombre de la misma persona (así la venta queda unida al canal por el que llegó).
// Sale de la cookie `_ga` que pone gtag ("GA1.1.123456789.1700000000" → "123456789.1700000000"). Sin cookie
// (bloqueador, sin Analytics en desarrollo) devuelve ''.
export function gaClientId(): string {
  try {
    const m = document.cookie.match(/(?:^|;\s*)_ga=GA\d+\.\d+\.(\d{1,20}\.\d{1,20})(?:;|$)/);
    return m ? m[1] : '';
  } catch {
    return '';
  }
}
