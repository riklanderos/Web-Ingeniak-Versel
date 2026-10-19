// src/scripts/shots/intertitle.ts — Intertitle (§7.4): palabra por palabra (opacidad .15 → 1, scrub) en [data-words];
// el aura gira 0 → 8° y deriva yPercent −60 → −40 alrededor de su centro (xPercent −50 / yPercent −50 = el mismo
// translate:-50% -50% del CSS: el centro con movimiento es el mismo que sin él); la palabra fantasma deriva xPercent −6.
import { claim, type Env } from './_util';

export default function intertitle(el: HTMLElement, env: Env) {
  const { gsap, SplitText } = env;
  const words = [...el.querySelectorAll<HTMLElement>('[data-words]')];
  words.forEach(claim);
  if (!env.motion) return;
  if (SplitText) {
    for (const w of words) {
      SplitText.create(w, {
        type: 'words', wordsClass: 'w', autoSplit: true,
        onSplit(self) {
          return gsap.fromTo(self.words, { opacity: 0.15 }, {
            opacity: 1, ease: 'none', stagger: 0.12,
            scrollTrigger: { trigger: w, start: 'top 82%', end: 'bottom 52%', scrub: true },
          });
        },
      });
    }
  }
  const aura = el.querySelector<HTMLElement>('.it__aura');
  if (aura) {
    gsap.fromTo(aura, { rotate: 0, xPercent: -50, yPercent: -60 }, {
      rotate: 8, xPercent: -50, yPercent: -40, ease: 'none',
      scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true },
    });
  }
  const ghost = el.querySelector<HTMLElement>('.it__ghost');
  if (ghost) {
    gsap.fromTo(ghost, { xPercent: 0 }, { xPercent: -6, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } });
  }
}
