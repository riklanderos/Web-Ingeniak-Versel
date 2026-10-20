// hubKit.ts — utilidades de HubTemplate (T-HUB · /servicios/, /industrias/, /casos/, /blog/). Área páginas.
// Titulares de dos voces, respaldos de placa locales para las placas de hub que aún no se exportan y el borde de la
// zona segura de texto de cada placa (para que el titular nunca entre a la parte iluminada de la escena).
import { getPlate } from '../../../lib/site';
import { plateReady, type Fallback, type Resolved } from '../../cine/plate';
import { annotateFigures, esc } from '../../ui/ui-data';

/* ── Titulares ─────────────────────────────────────────────────────────────────────────────────────────────── */
/** Espacio duro después de palabras de 1–2 letras: ninguna línea del titular termina en "a", "de", "tu"… (igual que
 *  ServiceTemplate). Solo toca texto fuera de los nodos con cifras o importes ([data-metric], [data-allow-number]). */
const NBSP_RX = /(?<=^|[\s (¿¡])(a|al|de|el|en|la|lo|un|tu|su|mi|y|o|e|u|es|se|te|no|ni)\s+/gi;
function keepShort(html: string) {
  let depth = 0;
  return html.replace(/(<[^>]+>)|([^<]+)/g, (_m: string, tag?: string, txt?: string) => {
    if (tag) {
      if (depth > 0) { if (/^<\//.test(tag)) depth--; else if (!/\/>$/.test(tag)) depth++; return tag; }
      if (/\sdata-(allow-number|metric)\b/.test(tag) && !/\/>$/.test(tag)) depth = 1;
      return tag;
    }
    return depth > 0 ? txt! : txt!.replace(NBSP_RX, (_x: string, w: string) => `${w} `);
  });
}
/** Envuelve la ÚLTIMA aparición de `lit` en una voz (texto ya anotado). */
function withLit(raw: string, lit: string): string | null {
  const i = raw.lastIndexOf(lit);
  if (i < 0) return null;
  return annotateFigures(raw.slice(0, i)) + `<span class="lit">${esc(lit)}</span>` + annotateFigures(raw.slice(i + lit.length));
}
/** Titular {text, soft, lit?} → HTML. La .lit (una por página, §2.3) solo se aplica con allowLit (portada); se busca en
 *  la primera voz y, si no está ahí, en la segunda. */
export function head(h: any, allowLit = false): string {
  if (!h) return '';
  const text: string = h.text ?? '';
  const soft: string = h.soft ?? '';
  let a = annotateFigures(text);
  let b = soft ? annotateFigures(soft) : '';
  if (allowLit && h.lit) {
    const inA = withLit(text, h.lit);
    if (inA) a = inA;
    else { const inB = soft ? withLit(soft, h.lit) : null; if (inB) b = inB; }
  }
  return keepShort(a + (b ? ` <span class="soft">${b}</span>` : ''));
}

/* ── Placas ────────────────────────────────────────────────────────────────────────────────────────────────── */
/** Respaldo local (pedido en peticiones.md: launchFallback en sitemap.json para estas placas de hub). Se usa SOLO si la
 *  sección no trae launchFallback y la placa todavía no está exportada; cuando la placa llega, la escena la toma sola.
 *  Cada respaldo respeta el lado del sujeto de la placa planeada y una pose distinta a la de la escena vecina (R13). */
export const HUB_FALLBACK: Record<string, { plate: string; mirror?: boolean }> = {
  // Kain toca la red de nodos (el sistema) · planeada: Kain al pie del árbol de 11 placas
  'servicios-hero': { plate: 'home-sistema-4-automatizar' },
  // Kain frente a paneles de cristal (las opciones), en espejo para quedar a la izquierda · planeada: Kain señala
  'servicios-no-se': { plate: 'home-sistema-1-atraer', mirror: true },
  // Kain sostiene la tarjeta frente a seis carriles de luz (las "puertas") · planeada: galería de 8 arcos
  'industrias-hero': { plate: 'home-sistema-3-organizar' },
  // Kain presenta la pantalla donde convergen los datos (resultados medidos) · planeada: tres columnas de luz
  'casos-hero': { plate: 'home-sistema-5-medir' },
  // Persona leyendo en su pantalla, en espejo para quedar a la derecha · planeada: lectora con tableta
  'blog-hero': { plate: 'discovery-para-quien', mirror: true },
  // Cierres compartidos sin exportar → el amanecer con Kain del mismo lado
  'cta-duena-tranquila': { plate: 'cta-amanecer', mirror: true },
  'cta-equipo': { plate: 'cta-amanecer' },
};
/** Respaldo de una sección: el de sitemap.json (launchFallback) o el local. */
export function fallbackOf(p: any): Fallback {
  if (!p?.id) return undefined;
  if (p.launchFallback) return p.launchFallback;
  return HUB_FALLBACK[p.id] ?? undefined;
}
/** ¿Se está usando el respaldo? (para avisos en dev y para el rótulo "imagen ilustrativa") */
export const usesFallback = (id?: string) => !!id && !plateReady(id);

/**
 * Borde de la zona segura de texto de la placa REALMENTE pintada, en fracción del ancho de la placa:
 *  - subject-right (texto a la izquierda): borde derecho de la primera zona segura (`edge`, p. ej. .44)
 *  - subject-left  (texto a la derecha):   borde izquierdo de la primera zona segura
 * Con espejo, la zona se refleja. Sin dato: .5 (la mitad de la placa).
 */
export function safeEdge(r: Resolved | null | undefined): number {
  if (!r?.id) return 0.5;
  const raw: any = getPlate(r.id);
  const s: number[] | undefined = raw?.safe?.d?.[0];
  if (!s) return 0.5;
  const [x0, , x1] = s;
  const L = r.layout;
  if (L === 'subject-left') return r.mirror ? +(1 - x1).toFixed(3) : x0;
  return r.mirror ? +(1 - x0).toFixed(3) : x1;
}
/** ¿La placa pintada trae un ancla de punto con coordenadas de escritorio? */
export const hasAnchor = (r: Resolved | null | undefined, name: string) => !!r?.anchors?.[name]?.d;
/** ¿La placa muestra a una persona (no a Kain)? → rótulo "Imagen ilustrativa" en la portada (§2.12). */
export const showsPerson = (r: Resolved | null | undefined) => !!r?.id && !!r.alt && !/\bKain\b/.test(r.alt);

/** Número en letra (uno…doce) para conteos que no son cifras comerciales ("cuatro servicios"). */
const WORDS = ['cero', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve', 'diez', 'once', 'doce'];
export const inWords = (n: number) => WORDS[n] ?? String(n);
