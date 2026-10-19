// src/components/layout/copyText.ts — envoltura del área nav sobre la ÚNICA implementación de los tokens del copy
// ({{metric:ID}}, {{metric:ID|full}}, {{price}}, {{Price}}, {{source}}): src/components/ui/ui-data.ts (tokensToText,
// getFaqBank). Aquí solo quedan atajos con la forma que usan el índice ⌘K (/indice.json) y las páginas (tryCopy).
import { getCopy } from '../../lib/site';
import { tokensToText, getFaqBank } from '../ui/ui-data';

/** Texto plano con los tokens resueltos (JSON-LD, ⌘K, meta). */
export function copyText(s: string): string {
  return typeof s === 'string' ? tokensToText(s) : '';
}

/** Copy de una página sin romper si todavía no existe. */
export function tryCopy(pageId: string): any | null {
  try { return getCopy(pageId); } catch { return null; }
}

/** Banco de FAQ publicable (mismo filtro que FAQAccordion y FAQPage: sin `validar`, solo aprobadas), en texto plano. */
export type BankFaq = { id: string; q: string; a: string; short?: string; pages: string[] };
export function faqBank(): BankFaq[] {
  return getFaqBank().map((f) => ({
    id: f.id,
    q: copyText(f.q),
    a: copyText(f.a),
    short: f.short ? copyText(f.short) : undefined,
    pages: [...(f.pages ?? (f as any).paginas ?? [])],
  }));
}
