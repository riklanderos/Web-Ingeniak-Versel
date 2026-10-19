// src/lib/llms.ts — /llms.txt y /llms-full.txt (ESPEC-v2 §8.7, §12.2 R8).
// Se generan desde sitemap.json (páginas construidas, indexables y sin puerta pendiente), metrics.ts y la ficha de la
// entidad, con la MISMA redacción que el footer (src/components/nav/Footer.astro) y el JSON-LD (layout/jsonld.ts).
// Precio: solo PRICE_FROM. Cifras: solo metrics.ts. Un caso breve (noindex) no se enlaza; su línea de resultado se queda sin enlace.
import { METRICS, PRICE_FROM, SOURCE_NOTE, type MetricId } from './metrics';
import { SITE, pages, indexablePages, copyOrNull, type Page } from './site';
import { tokensToText, getFaqItems, VKTOR } from '../components/ui/ui-data';

const abs = (u: string) => `${SITE.url}${u}`;
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const one = (s: string) => tokensToText(String(s ?? '')).replace(/\s+/g, ' ').trim();

/** Ficha de la entidad: mismos datos y redacción que el footer y el JSON-LD. */
export function entityLines(): string[] {
  const s = METRICS.sistemas, p = METRICS.paises;
  return [
    `Entidad: Ingeniak · consultoría de IA · Sede: ${SITE.city}`,
    `Oficina: ${SITE.address.street}, ${SITE.address.locality}, ${SITE.address.region} ${SITE.address.postal} · ${SITE.email} · WhatsApp ${SITE.phone}`,
    `Partner oficial de Kommo en LATAM (${SITE.kommo})`,
    `Metodología VKTOR™: ${VKTOR.map((v) => `${v.name} (${v.verb.toLowerCase()})`).join(' · ')}`,
    `En producción: ${s.value} ${s.label} · ${p.value} ${p.label}: ${p.ctx}`,
    `Sub-marca de agentes: kain (${SITE.kainApp.replace(/^https?:\/\//, '')})`,
    `Inversión: ${PRICE_FROM}`,
    `Primer paso: Discovery Session, 30 minutos, 1:1, por Google Meet, sin costo → ${abs(SITE.discovery)}`,
  ];
}

const SUMMARY =
  `Consultora de IA en Guadalajara, Jalisco (México). Diseña, implementa y opera agentes de IA para WhatsApp, CRM con Kommo ` +
  `(partner oficial en LATAM) y GoHighLevel, automatización con n8n y Make, paid media, sitios web, software a la medida y SEO ` +
  `para motores de IA. Sub-marca de agentes: kain (app.kain.mx). Inversión ${PRICE_FROM}.`;

const GROUPS: [string, string[]][] = [
  ['Servicios', ['Servicios']],
  ['Industrias', ['Industrias']],
  ['Casos', ['Casos']],
  ['Empresa', ['Núcleo', 'Empresa', 'Conversión', 'Legal']],
  ['Recursos', ['Recursos']],
];
const shortTitle = (p: Page) => one(String(p.title ?? p.h1).replace(/\s*\|\s*Ingeniak\s*$/, ''));

/** Una línea por cifra de metrics.ts (las de la ficha aparte), con su caso solo si está construido e indexable. */
export function resultLines(): string[] {
  const live = new Set(indexablePages().map((p) => p.url));
  return (Object.keys(METRICS) as MetricId[])
    .filter((id) => id !== 'sistemas' && id !== 'paises')
    .map((id) => {
      const m = METRICS[id] as any;
      const text = id === 'dental-respuesta' && m.prose ? `${cap(m.label)} ${m.prose}` : `${m.value} ${m.label}`;
      const link = m.href && live.has(m.href) ? ` → ${abs(m.href)}` : '';
      return `- ${text} (${m.ctx})${link}`;
    });
}

export function buildLlms(): string {
  const live = indexablePages();
  const out: string[] = ['# Ingeniak', '', `> ${SUMMARY}`, '', '## Ficha', ...entityLines().map((l) => `- ${l}`), ''];
  out.push(`## Resultados (${SOURCE_NOTE.charAt(0).toLowerCase() + SOURCE_NOTE.slice(1)})`, ...resultLines(), '');
  for (const [title, groups] of GROUPS) {
    const list = live.filter((p) => groups.includes(String(p.group)));
    if (!list.length) continue;
    out.push(`## ${title}`);
    for (const p of list) out.push(`- [${shortTitle(p)}](${abs(p.url)}): ${one(p.metaDescription ?? '')}`);
    out.push('');
  }
  out.push(`Texto completo de estas páginas: ${abs('/llms-full.txt')}`);
  return out.join('\n') + '\n';
}

/* ───────────────────────── llms-full.txt ───────────────────────── */
const SKIP = new Set([
  'rail', 'href', 'waMessage', 'metricIds', 'faqIds', 'faqId', 'src', 'id', 'slug', 'plate', 'icon', 'logo', 'logos', 'glyph', 'mode',
  'tone', 'external', 'variant', 'layout', 'script', 'scripts', 'tabs', 'hud', 'hudClock', 'ghost', 'pos', 'lit', 'confirmed', 'status',
  'sourceNote', 'aria', 'slot', 'play', 'close', 'n', 'letter', 'time', 'timeLabel', 'progressLabel', 'linkLabel', 'rowLink', 'metricId',
]);
function headline(h: any): string {
  if (typeof h === 'string') return one(h);
  if (!h || typeof h !== 'object') return '';
  if (h.kicker || h.metricId) {
    const m = h.metricId ? (METRICS as any)[h.metricId]?.value ?? '' : '';
    return one([h.kicker, m, h.text].filter(Boolean).join(' '));
  }
  return one([h.text, h.soft].filter(Boolean).join(' '));
}
function collect(v: any, key = '', out: string[] = []): string[] {
  if (v == null || SKIP.has(key) || key.startsWith('_')) return out;
  if (typeof v === 'string') { const t = one(v); if (t) out.push(t); return out; }
  if (typeof v === 'number' || typeof v === 'boolean') return out;
  if (Array.isArray(v)) { for (const x of v) collect(x, key, out); return out; }
  if (typeof v === 'object') {
    if (v._omitir) return out;
    if (key === 'h1' || key === 'h2' || key === 'h3') { const t = headline(v); if (t) out.push(t); return out; }
    if (v.metricId && !v.text && !v.label) { const m = (METRICS as any)[v.metricId]; if (m) out.push(one(`${m.value} ${m.label}${v.context ? ` · ${v.context}` : ''}`)); return out; }
    if (v.term && v.value) { out.push(one(`${v.term}: ${v.value}`)); return out; }
    for (const [k, x] of Object.entries(v)) collect(x, k, out);
  }
  return out;
}
function pageText(p: Page): string {
  const copy = copyOrNull(p.id);
  const lines: string[] = [`# ${one(p.h1)}`, `URL: ${abs(p.url)}`, ''];
  const order = ((p.sections as any[]) ?? []).map((s) => s.id);
  const secs = copy?.sections ?? {};
  const ids = [...order.filter((id) => id in secs), ...Object.keys(secs).filter((id) => !order.includes(id))];
  for (const id of ids) {
    const s = secs[id];
    if (!s || s._omitir) continue;
    if (s.faqIds?.length) {
      const items = getFaqItems(s.faqIds);
      const head = collect({ eyebrow: s.eyebrow, h2: s.h2, lede: s.lede });
      if (head.length) lines.push(...head);
      for (const f of items) lines.push(`P: ${one(f.q)}`, `R: ${one(f.a)}`);
      lines.push('');
      continue;
    }
    const t = collect(s);
    const h1At = id === 'hero' ? t.indexOf(one(p.h1)) : -1;
    if (h1At >= 0) t.splice(h1At, 1);
    // sin duplicados consecutivos (p. ej. etiquetas de CTA repetidas)
    const seen = new Set<string>();
    const uniq = t.filter((x) => (seen.has(x) ? false : (seen.add(x), true)));
    if (uniq.length) lines.push(...uniq, '');
  }
  return lines.join('\n');
}
export function buildLlmsFull(): string {
  const live = indexablePages();
  const head = ['# Ingeniak · texto completo', '', `> ${SUMMARY}`, '', '## Ficha', ...entityLines().map((l) => `- ${l}`), '', '---', ''];
  return head.join('\n') + live.map(pageText).join('\n---\n\n') + '\n';
}

export const TEXT_HEADERS = { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=3600' };
export { pages };
