// src/scripts/forms/phone.ts — teléfono con lada (CAMBIO-COTIZAR §2.4 y §2.9, dueño "modal"). Lo usan el modal de
// cotización y la reserva de las landings. Misma regla que el servidor (server/cotizar.js):
//   · pais en el catálogo (cotizar.json → paises); lada = la del país, o con "otro" una lada escrita ^\+[1-9]\d{0,3}$
//   · numero = solo dígitos tras quitar espacios, guiones, puntos y paréntesis
//   · si el número trae la lada repetida sin "+" (52 + 10 dígitos en México), se quita
//   · longitud dentro de paises[].digitos ([mín] o [mín, máx]); E.164 total ≤ 15 dígitos
// Salida: { pais, lada, numero (nacional, solo dígitos), e164 ('+523312345678' o ''), ok, error: 'telefono'|'telefonoLada'|null }
// phoneHelp(iso) y phoneMessage(r): ayuda y error del número con las mismas palabras, según el país elegido.
import catalogo from '../../data/cotizar.json';

export type Pais = { iso: string; lada: string | null; label: string; digitos: number[] };
export type PhoneInput = { pais: string; lada?: string | null; numero: string };
export type PhoneResult = {
  pais: string; lada: string; numero: string; e164: string; ok: boolean; error: 'telefono' | 'telefonoLada' | null;
};

const PAISES = catalogo.paises as Pais[];
const LADA_RX = /^\+[1-9]\d{0,3}$/;

/** Lada escrita a mano ("380", "+380", "00380", "+ 380") → "+380" (o la cadena limpia si no se puede leer). */
function cleanLada(v: string | null | undefined): string {
  let s = String(v ?? '').replace(/[\s\-.()]/g, '');
  if (s.startsWith('00')) s = '+' + s.slice(2);
  if (/^\d+$/.test(s)) s = '+' + s;
  return s;
}

export function normalizePhone(input: PhoneInput, paises: Pais[] = PAISES): PhoneResult {
  const iso = String(input?.pais ?? '').toLowerCase();
  const p = paises.find((x) => x.iso === iso);
  const raw = String(input?.numero ?? '');
  const bad = (error: 'telefono' | 'telefonoLada', lada = '', numero = ''): PhoneResult => ({ pais: iso, lada, numero, e164: '', ok: false, error });
  if (!p) return bad('telefono');

  const lada = p.lada ?? cleanLada(input?.lada);
  if (!LADA_RX.test(lada)) return bad('telefonoLada', lada);
  const cc = lada.slice(1);

  // Solo dígitos tras quitar separadores. Un "+" inicial con la lada (pegado de WhatsApp) se tolera: se quita abajo.
  let n = raw.replace(/[\s\-.()]/g, '');
  const plus = n.startsWith('+');
  if (plus) n = n.slice(1);
  if (!n || !/^\d+$/.test(n)) return bad('telefono', lada, n);

  const [min, max = min] = p.digitos;
  const fits = (s: string) => s.length >= min && s.length <= max;
  if (n.startsWith(cc) && (plus || !fits(n)) && fits(n.slice(cc.length))) n = n.slice(cc.length);
  else if (plus) return bad('telefono', lada, n); // "+<otra lada>…" en el campo del número
  if (!fits(n)) return bad('telefono', lada, n);
  if (cc.length + n.length > 15) return bad('telefono', lada, n);
  return { pais: iso, lada, numero: n, e164: `+${cc}${n}`, ok: true, error: null };
}

/** Lee un PhoneField (o cualquier contenedor con *_pais, *_lada y *_numero). */
export function readPhone(root: HTMLElement): PhoneResult {
  const sel = root.querySelector<HTMLSelectElement>('select[name$="_pais"]');
  const ladaIn = root.querySelector<HTMLInputElement>('input[name$="_lada"]');
  const num = root.querySelector<HTMLInputElement>('input[name$="_numero"]');
  const pais = sel?.value ?? 'mx';
  const opt = sel?.selectedOptions?.[0];
  const lada = pais === 'otro' ? ladaIn?.value ?? '' : opt?.dataset.lada || null;
  return normalizePhone({ pais, lada, numero: num?.value ?? '' });
}

/* Ayuda y error del número con LAS MISMAS PALABRAS (cotizar.json → textos.telefonoAyuda y errores.telefono*):
   qué escribir exactamente para el país elegido ("10 dígitos … sin el +52"). errores.telefono es el texto de México y el
   que devuelve el servidor (no lleva plantilla); los demás países usan errores.telefonoPais con sus dígitos y su lada. */
const AYUDA = (catalogo.textos as any).telefonoAyuda as { mx: string; pais: string; otro: string };
const ERRS = catalogo.errores as Record<string, string>;
const fill = (s: string, v: Record<string, string>) => s.replace(/\{(\w+)\}/g, (_, k) => v[k] ?? '');
/** [10] → "10" · [10, 11] → "10 u 11" · [6, 14] → "6 a 14". */
function digitosTxt([min, max = min]: number[]): string {
  if (max === min) return String(min);
  if (max === min + 1) return `${min} ${/^(8|11)/.test(String(max)) ? 'u' : 'o'} ${max}`;
  return `${min} a ${max}`;
}
/** Texto de ayuda del número para el país elegido. */
export function phoneHelp(iso: string, paises: Pais[] = PAISES): string {
  const p = paises.find((x) => x.iso === String(iso).toLowerCase());
  if (!p || p.iso === 'mx') return AYUDA.mx;
  if (!p.lada) return AYUDA.otro;
  return fill(AYUDA.pais, { digitos: digitosTxt(p.digitos), lada: p.lada });
}
/** Mensaje de error del teléfono (mismas palabras que la ayuda) para un resultado de normalizePhone. */
export function phoneMessage(r: Pick<PhoneResult, 'pais' | 'error'>, paises: Pais[] = PAISES): string {
  if (r.error === 'telefonoLada') return ERRS.telefonoLada;
  const p = paises.find((x) => x.iso === r.pais);
  if (!p || p.iso === 'mx') return ERRS.telefono;
  if (!p.lada) return ERRS.telefonoOtro ?? ERRS.telefono;
  return ERRS.telefonoPais ? fill(ERRS.telefonoPais, { digitos: digitosTxt(p.digitos), lada: p.lada }) : ERRS.telefono;
}

/** Muestra la lada escrita solo con "Otro país" y, si el campo usa la ayuda por país ([data-phone-help]), la ajusta.
 *  Idempotente; devuelve una función para soltar el oyente. */
export function bindPhone(root: HTMLElement): () => void {
  const sel = root.querySelector<HTMLSelectElement>('select[name$="_pais"]');
  const ladaIn = root.querySelector<HTMLInputElement>('input[name$="_lada"]');
  if (!sel || !ladaIn) return () => {};
  const help = root.querySelector<HTMLElement>('[data-phone-help]');
  const sync = () => {
    const otro = sel.value === 'otro';
    ladaIn.hidden = !otro;
    ladaIn.disabled = !otro;
    root.toggleAttribute('data-otro', otro);
    if (help) help.textContent = phoneHelp(sel.value);
  };
  sync();
  sel.addEventListener('change', sync);
  return () => sel.removeEventListener('change', sync);
}
