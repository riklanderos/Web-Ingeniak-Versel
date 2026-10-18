// src/components/layout/copyText.ts — texto plano de los tokens del copy ({{metric:ID}}, {{metric:ID|full}}, {{price}},
// {{Price}}, {{source}}; ver src/content/paginas/_ESQUEMA.md §5) para JSON-LD, ⌘K y meta.
// Si el orquestador ya publicó src/lib/copy.ts, se usa su copyText; si no, esta implementación equivalente.
import { METRICS, PRICE_FROM, PRICE_FROM_CAP, SOURCE_NOTE } from '../../lib/metrics';
import { getCopy } from '../../lib/site';

const libMods = import.meta.glob('../../lib/copy.ts', { eager: true }) as Record<string, any>;
const lib = Object.values(libMods)[0];
const RX = /\{\{(metric:([a-z0-9-]+)(\|full)?|price|Price|source)\}\}/g;

export function copyText(s: string): string {
  if (typeof s !== 'string') return '';
  if (typeof lib?.copyText === 'function') return lib.copyText(s);
  return s.replace(RX, (_m, k: string, id: string, full: string) => {
    if (k === 'price') return PRICE_FROM;
    if (k === 'Price') return PRICE_FROM_CAP;
    if (k === 'source') return SOURCE_NOTE;
    const m = (METRICS as any)[id];
    if (!m) return '';
    return full ? `${m.value} ${m.label}` : m.value;
  });
}

/** Copy de una página sin romper si todavía no existe. */
export function tryCopy(pageId: string): any | null {
  try { return getCopy(pageId); } catch { return null; }
}

/** Banco de FAQ (src/data/faq.json) normalizado; vacío si no existe. Excluye `validar: true` (D §12). */
const bankMods = import.meta.glob('../../data/faq.json', { eager: true, import: 'default' }) as Record<string, any>;
export type BankFaq = { id: string; q: string; a: string; short?: string; pages: string[] };
export function faqBank(): BankFaq[] {
  const raw: any = Object.values(bankMods)[0];
  const list: any[] = Array.isArray(raw) ? raw : Array.isArray(raw?.items) ? raw.items : raw && typeof raw === 'object' ? Object.entries(raw).map(([id, v]: any) => ({ id, ...v })) : [];
  return list
    .filter((f) => f && f.id && !f.validar && (f.estado ?? 'aprobada') === 'aprobada')
    .map((f) => ({ id: f.id, q: copyText(f.q ?? f.pregunta ?? ''), a: copyText(f.a ?? f.respuesta ?? ''), short: f.short ? copyText(f.short) : undefined, pages: f.pages ?? f.paginas ?? [] }));
}
