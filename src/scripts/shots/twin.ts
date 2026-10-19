// src/scripts/shots/twin.ts — TwinScene (§7.4): pin +=100 % (escritorio), scrub .6.
// 0–.4 dolores sobre A · .4–.75 barrido --wipe 100% → 0% con haz y cada dolor dibuja su salida (--mix) · .75–1 remate.
// Sin pin (móvil/táctil): el haz barre una vez al entrar la placa B (0.9 s) y cada salida se dibuja al entrar.
// R11: el remate solo baja su opacidad (nunca visibility); si el foco entra en él antes de tiempo, el scroll va al tramo
// del remate. El haz es una pista a todo lo ancho movida con translate (CSS), sin cambios de layout (CLS).
import { sala, scrollToY, wireSkip, type Env } from './_util';

export default function twin(el: HTMLElement, env: Env) {
  const { gsap, ScrollTrigger } = env;
  if (!env.motion) return;
  // PainList mode="twin" (área ui): [data-pain-item] con --mix por ítem; marcado propio: [data-fix] dentro de su <li>.
  const painItems = [...el.querySelectorAll<HTMLElement>('[data-pain-item]')];
  const items = painItems.length ? painItems
    : [...el.querySelectorAll<HTMLElement>('[data-fix]')].map((f) => (f.closest('li') as HTMLElement) ?? f.parentElement ?? f);
  const end = el.querySelector<HTMLElement>('[data-twin-end]');
  const endHas = !!end && end.innerHTML.trim() !== '';
  const clock = el.querySelector<HTMLElement>('[data-clock]');
  const times: string[] = clock ? JSON.parse(clock.dataset.clock || '[]') : [];
  const setClock = (p: number) => {
    if (!clock || !times.length) return;
    const t = p < 0.4 ? times[0] : p < 0.75 ? times[Math.min(1, times.length - 1)] : times[times.length - 1];
    if (clock.textContent !== t) clock.textContent = t;
  };

  if (env.pin) {
    gsap.set(el, { '--wipe': '100%', '--beam': 0 });
    gsap.set(items, { '--mix': 0 });
    if (endHas) gsap.set(end, { opacity: 0, y: 16 });
    setClock(0);
    const tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: el, start: 'top top', end: el.dataset.pin || '+=100%', pin: true, scrub: 0.6, anticipatePin: 0,
        onUpdate: (s) => setClock(s.progress),
        onToggle: (s) => { el.classList.toggle('is-pinned', s.isActive); sala(s.isActive); },
      },
    });
    tl.to(el, { '--cam': 1.035, duration: 0.4 }, 0)
      .to(el, { '--beam': 1, duration: 0.04 }, 0.4)
      .to(el, { '--wipe': '0%', duration: 0.35, ease: 'power1.inOut' }, 0.4)
      .to(el, { '--beam': 0, duration: 0.05 }, 0.72)
      .to(items, { '--mix': 1, duration: 0.12, stagger: 0.06, ease: 'power2.out' }, 0.44)
      .to(el, { '--cam': 1, duration: 0.35 }, 0.4);
    if (endHas) tl.to(end, { opacity: 1, y: 0, duration: 0.15, ease: 'power2.out' }, 0.78);
    tl.to({}, { duration: 0.07 }, 0.93); // respiro final antes de soltar el pin
    const st = tl.scrollTrigger!;
    // Foco en el remate (o en un dolor) antes de su tramo → el scroll va a donde ya se lee completo.
    const onFocus = (e: FocusEvent) => {
      const t = e.target as Element;
      const want = end && end.contains(t) ? 0.95 : items.some((it) => it.contains(t)) ? 0.8 : -1;
      if (want < 0 || st.progress >= want) return;
      scrollToY(st.start + (st.end - st.start) * want, env, true);
      tl.progress(want);
    };
    el.addEventListener('focusin', onFocus);
    const unskip = wireSkip(el, env, st);
    return () => {
      unskip(); sala(false); el.classList.remove('is-pinned'); el.removeEventListener('focusin', onFocus);
      if (end) gsap.set(end, { clearProps: 'opacity,transform' });
    };
  }

  // Sin pin
  const b = el.querySelector<HTMLElement>('.twin__b');
  gsap.set(el, { '--wipe': '100%', '--beam': 0 });
  ScrollTrigger.create({
    trigger: b ?? el, start: 'top 80%', once: true,
    onEnter: () => {
      gsap.timeline()
        .set(el, { '--beam': 1 })
        .to(el, { '--wipe': '0%', duration: 0.9, ease: 'power2.inOut' })
        .to(el, { '--beam': 0, duration: 0.25 }, '-=.2');
    },
  });
  items.forEach((it) => gsap.fromTo(it, { '--mix': 0 }, { '--mix': 1, duration: 0.9, ease: 'power2.out', scrollTrigger: { trigger: it, start: 'top 82%', once: true } }));
  setClock(1);
}
