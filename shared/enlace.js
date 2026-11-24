/**
 * Enlace del formulario (cliente, 2026-11-23): «Sitio web o redes» pide una URL, no el nombre del negocio.
 * Lo usan la cotización y la agenda, en el navegador y en el servidor, y `server/kommo.js` para el campo «Web».
 * Vale con o sin https:// («negocio.mx», «instagram.com/negocio», «https://maps.app.goo.gl/x»). No valen un nombre
 * («Clínica Pérez»), un usuario suelto («@negocio») ni un correo.
 */
const ENLACE_RE = /^(?:https?:\/\/)?(?:[\p{L}\p{N}](?:[\p{L}\p{N}-]*[\p{L}\p{N}])?\.)+(?:\p{L}{2,}|xn--[a-z0-9-]+)(?::\d{1,5})?(?:[/?#]\S*)?$/iu;

/** @param {unknown} v */
export function esEnlace(v) {
  return ENLACE_RE.test(String(v ?? '').trim());
}

/** El mismo enlace con https:// si no lo traía; null si no es un enlace. @param {unknown} v */
export function conHttps(v) {
  const s = String(v ?? '').trim();
  if (!esEnlace(s)) return null;
  return /^https?:\/\//i.test(s) ? s : `https://${s}`;
}
