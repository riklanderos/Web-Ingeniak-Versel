// src/components/nav/icons.ts — iconos funcionales del área nav (retícula 24 × 24, trazo 1.5, currentColor; ESPEC §2.13).
// Se pintan en línea: <svg viewBox="0 0 24 24" class="ico" set:html={ICONS.search} aria-hidden="true" />
const s = (d: string) => `<path d="${d}" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>`;
const node = (x: number, y: number, w = 4) => `<rect x="${x - w / 2}" y="${y - w / 2}" width="${w}" height="${w}" rx="1" fill="currentColor"/>`;

export const ICONS: Record<string, string> = {
  search: s('M10.5 17a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13ZM15.3 15.3 20 20'),
  close: s('M6 6l12 12M18 6 6 18'),
  menu: s('M4 8h16M4 16h10') + node(19, 16, 3),
  chevron: s('M7 10l5 5 5-5'),
  plus: s('M12 5v14M5 12h14'),
  arrow: s('M4 12h13M13 7l5 5-5 5'),
  branch: s('M4 12h7l4-4h5M16 4l4 4-4 4'),
  external: s('M8 16 16 8M9 8h7v7'),
  enter: s('M19 6v5a3 3 0 0 1-3 3H6M10 10l-4 4 4 4'),
  mail: s('M4 6h16v12H4zM4 7l8 6 8-6'),
  pin: s('M12 21s-6-5.6-6-11a6 6 0 1 1 12 0c0 5.4-6 11-6 11Z') + node(12, 10, 3),
  whatsapp:
    `<path d="M4.3 19.7l1.1-3.9A8.2 8.2 0 1 1 8.6 19l-4.3.7Z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>` +
    `<path d="M9.2 8.3c.2-.4.4-.4.7-.4h.5c.2 0 .4.1.5.4l.7 1.6c.1.2 0 .5-.1.6l-.5.6c-.1.1-.1.3 0 .5.6 1.1 1.5 2 2.6 2.6.2.1.4.1.5 0l.6-.6c.2-.2.4-.2.6-.1l1.6.7c.3.1.4.3.4.5v.5c0 .3-.1.6-.4.7-.6.4-1.5.6-2.4.3-2.3-.8-4.2-2.7-5-5-.3-.8-.1-1.7.3-2.4Z" fill="currentColor"/>`,
  // Glifos de etapa (ESPEC §2.13)
  atraer: s('M3 12h6l4-5h8M13 17h8M9 12l4 5') + node(3.5, 12, 3.5),
  atender: s('M5 5h14a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1h-8l-4 3v-3H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z') + node(12, 10.5, 3.5),
  organizar: s('M6 4v16M12 4v16M18 4v16') + node(6, 8, 3.5) + node(12, 13, 3.5) + node(18, 17, 3.5),
  automatizar: s('M6.5 7.5h5l4 4v5') + node(5, 7.5, 4.5) + node(15.5, 18, 4.5),
  medir: s('M4 20V14M8 20v-9M12 20V8M16 12l3-3') + node(19.5, 8.5, 4),
};

export const GLYPH_LABEL: Record<string, string> = {
  atraer: 'Atraer',
  atender: 'Atender',
  organizar: 'Organizar',
  automatizar: 'Automatizar',
  medir: 'Medir',
};
