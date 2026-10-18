import { continueRender, delayRender, staticFile } from 'remotion';

const FONTS: [string, string][] = [
  ['Lexend', 'lexend-var.woff2'],
  ['Inter', 'inter-var.woff2'],
  ['JetBrains Mono', 'jetbrains-mono-var.woff2'],
];

let loaded = false;
export const loadFonts = () => {
  if (loaded || typeof window === 'undefined' || !('FontFace' in window)) return;
  loaded = true;
  const handle = delayRender('Loading brand fonts');
  Promise.all(
    FONTS.map(([family, file]) => {
      const ff = new FontFace(family, `url(${staticFile('fonts/' + file)}) format('woff2')`, {
        weight: '100 900',
      });
      (document.fonts as unknown as { add: (f: FontFace) => void }).add(ff);
      return ff.load();
    }),
  )
    .then(() => continueRender(handle))
    .catch((err) => {
      console.error(err);
      continueRender(handle);
    });
};
