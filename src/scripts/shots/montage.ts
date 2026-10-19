// src/scripts/shots/montage.ts — Montage (§7.4): filas con deriva xPercent ±3 en sentidos alternos (scrub, sin pin); la
// imagen del caso se desplaza ±8 % alrededor del sujeto dentro de las letras (--pd −8 → 8) y cada fila entra con un
// barrido limpio de la cifra (clip-path) + su contexto (opacidad: nunca visibility, R11; el foco la termina al instante).
// Corte por coincidencia (§5.1 ESC 08): al hacer clic en una cifra con caso, la cifra presta view-transition-name "plate"
// (si ui/nav no nombraron ya una imagen). Movimiento reducido: estático.
import { hold, release, type Env } from './_util';

export default function montage(el: HTMLElement, env: Env) {
  const html = document.documentElement;
  // Corte por coincidencia: después de ui (document) y nav (window, registrado antes que cine).
  const onClick = (e: MouseEvent) => {
    const a = (e.target as Element).closest?.<HTMLAnchorElement>('a[data-still]');
    if (!a || !el.contains(a) || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    if ([...document.querySelectorAll<HTMLElement>('[style*="view-transition-name"]')].some((n) => n.style.viewTransitionName === 'plate')) return;
    const fig = a.querySelector<HTMLElement>('.mt__fig');
    if (!fig) return;
    fig.style.viewTransitionName = 'plate';
    html.setAttribute('data-vt-still', '');
  };
  window.addEventListener('click', onClick);
  const off = () => window.removeEventListener('click', onClick);
  if (!env.motion) return off;
  const { gsap } = env;
  const amp = env.desk ? 3 : 1.5;
  for (const row of el.querySelectorAll<HTMLElement>('[data-mt-row]')) {
    const dir = Number(row.dataset.dir || 1);
    const fig = row.querySelector<HTMLElement>('.mt__fig');
    const meta = row.querySelector<HTMLElement>('.mt__meta');
    const link = row.querySelector<HTMLElement>('.mt__link');
    const st = { trigger: row, start: 'top bottom', end: 'bottom top', scrub: true };
    gsap.fromTo(row, { xPercent: -dir * amp }, { xPercent: dir * amp, ease: 'none', scrollTrigger: st });
    if (fig) gsap.fromTo(fig, { '--pd': -8 * dir }, { '--pd': 8 * dir, ease: 'none', scrollTrigger: { ...st } });
    if (!link || !fig) continue;
    // Barrido limpio: la cifra se descubre en el sentido de su fila; el contexto llega detrás.
    const from = dir > 0 ? 'inset(0% 0% 0% 100%)' : 'inset(0% 100% 0% 0%)';
    const tl = gsap.timeline({ paused: true, onComplete: () => release(link) })
      .fromTo(fig, { clipPath: from }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.1, ease: 'power3.inOut', immediateRender: true }, 0);
    if (meta) tl.fromTo(meta, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.8, ease: 'expo.out', immediateRender: true }, 0.45);
    hold(link, () => tl.progress(1));
    env.ScrollTrigger.create({ trigger: row, start: 'top 90%', once: true, onEnter: () => tl.play() });
  }
  return off;
}
