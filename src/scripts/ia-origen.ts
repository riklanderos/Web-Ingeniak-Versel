// Origen en un asistente de IA (cambio 2026-11-19).
// Los formularios ya mandan utm y referrer a Kommo; un WhatsApp no, porque solo lleva el texto prellenado. Si la sesión
// llegó desde ChatGPT u otra IA, al mensaje de WhatsApp se le agrega una línea final ("Te encontré en ChatGPT.") para
// que el equipo y Kommo sepan de dónde viene. Lee lo que ui.ts guarda en sessionStorage al llegar (ingeniak-utm e
// ingeniak-landing); sin esos datos, o con sessionStorage bloqueado, el enlace queda igual.

const IAS: [string, string][] = [
  ['chatgpt.com', 'ChatGPT'],
  ['chat.openai.com', 'ChatGPT'],
  ['perplexity.ai', 'Perplexity'],
  ['gemini.google.com', 'Gemini'],
  ['claude.ai', 'Claude'],
  ['copilot.microsoft.com', 'Copilot'],
];

const host = (v: string) => v.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').split(/[/?#]/)[0];
const nombre = (v: string | undefined | null) => {
  if (!v) return null;
  const h = host(v);
  return IAS.find(([d]) => h === d || h.endsWith(`.${d}`))?.[1] ?? null;
};
const ssJson = (k: string): Record<string, string> => {
  try { return JSON.parse(sessionStorage.getItem(k) ?? '{}') ?? {}; } catch { return {}; }
};

/** Nombre de la IA de la que llegó la sesión (por utm_source o por referrer), o null. */
export function iaOrigen(): string | null {
  return nombre(ssJson('ingeniak-utm').utm_source) ?? nombre(ssJson('ingeniak-landing').referrer);
}

/** Devuelve el enlace de wa.me con la línea de origen al final del mensaje; cualquier otro enlace, igual. Idempotente. */
export function conOrigenIA(href: string): string {
  const ia = iaOrigen();
  if (!ia) return href;
  let u: URL;
  try { u = new URL(href); } catch { return href; }
  if (u.hostname !== 'wa.me') return href;
  const texto = u.searchParams.get('text') ?? '';
  // Versión en inglés (/en/, 2026-11-20): en las páginas en inglés la línea va en inglés.
  const en = typeof document !== 'undefined' && document.documentElement.lang.toLowerCase().startsWith('en');
  const low = texto.toLowerCase();
  if (low.includes(`te encontré en ${ia.toLowerCase()}`) || low.includes(`i found you on ${ia.toLowerCase()}`)) return href;
  const nuevo = en
    ? (texto.trim() ? `${texto}\n\nI found you on ${ia}.` : `Hi, I found you on ${ia}.`)
    : (texto.trim() ? `${texto}\n\nTe encontré en ${ia}.` : `Hola, te encontré en ${ia}.`);
  u.searchParams.delete('text');
  // encodeURIComponent (espacios como %20): con el "+" de URLSearchParams algunos WhatsApp muestran los signos.
  const resto = u.searchParams.toString();
  return `${u.origin}${u.pathname}?${resto ? `${resto}&` : ''}text=${encodeURIComponent(nuevo)}`;
}
