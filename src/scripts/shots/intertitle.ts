// src/scripts/shots/intertitle.ts — Intertitle (§7.4): palabra por palabra (opacidad .15 → 1, scrub) en [data-words];
// el aura gira 0 → 8° y deriva yPercent −10 → 10; la palabra fantasma deriva xPercent −6.
import { claim, type Env } from './_util';

export default function intertitle(el: HTMLElement, env: Env) {
  const { gsap, SplitText } = env;
  const words = [...el.querySelectorAll<HTMLElement>('[data-words]')];
  words.forEach(claim);
  if (!env.motion) return;
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
  const aura = el.querySelector<HTMLElement>('.it__aura');
  if (aura) {
    gsap.fromTo(aura, { rotate: 0, yPercent: -10 }, { rotate: 8, yPercent: 10, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } });
  }
  const ghost = el.querySelector<HTMLElement>('.it__ghost');
  if (ghost) {
    gsap.fromTo(ghost, { xPercent: 0 }, { xPercent: -6, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } });
  }
}
