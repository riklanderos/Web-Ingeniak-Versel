// src/scripts/shots/coldopen.ts — firma "Del nodo al pecho" (§7.3). 2.8 s, una vez por sesión, se salta con cualquier gesto.
// El nodo cuadrado late en el pecho de Kain, se dibujan el pilar y las ramas del isotipo (ruta de favicon.svg, 772.5),
// el isotipo se colapsa en su nodo, ese nodo es la pantalla del pecho, el iris se abre y la cámara se aleja (×4 → ×1)
// hasta la portada real. La <img> LCP nunca tiene opacity 0: la tapa la capa de iris.
import { html, type Env } from './_util';

export default function coldopen(layer: HTMLElement, env: Env) {
  const { gsap } = env;
  const scene = layer.closest<HTMLElement>('.is');
  if (!scene || !html.classList.contains('co')) return;
  const done = () => {
    html.classList.remove('co');
    document.dispatchEvent(new CustomEvent('cine:coldopen-end'));
  };
  if (!env.motion) { done(); scene.dispatchEvent(new CustomEvent('cine:intro')); return; }
  try { sessionStorage.setItem('ingeniak-coldopen', '1'); } catch {}

  const q = (s: string) => layer.querySelector<HTMLElement>(s);
  const word = q('.co-word');
  const k = env.desk ? 1 : 0.8; // móvil ×0.8
  gsap.set(layer, { animation: 'none', visibility: 'visible' });
  gsap.set(scene, { '--cam': 4, '--veil': 1, '--iris': '0px', '--iso': 772.5 });
  let introSent = false;
  const intro = () => { if (introSent) return; introSent = true; scene.dispatchEvent(new CustomEvent('cine:intro')); };

  const tl = gsap.timeline({ defaults: { ease: 'power3.out' }, onComplete: () => { gsap.set(layer, { visibility: 'hidden' }); done(); } })
    .timeScale(1 / k)
    .to(word, { opacity: 1, duration: 0.3, ease: 'power1.out' }, 0)
    .to(q('.co-node'), { opacity: 1, duration: 0.08, repeat: 2, yoyo: true, ease: 'none' }, 0.1)
    .to(q('.co-iso'), { opacity: 1, duration: 0.1 })
    .to(scene, { '--iso': 0, duration: 0.7, ease: 'power2.inOut' }, '<')
    .to(q('.co-node'), { opacity: 0, duration: 0.2 }, '<.5')
    .to(q('.co-iso'), { scale: 0.16, opacity: 0, duration: 0.35, ease: 'power3.in' }, '+=.05')
    .to(word, { opacity: 0, duration: 0.3 }, '<')
    .fromTo(q('.co-scr'), { scale: 0.06, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.45, ease: 'expo.out' }, '-=.08')
    .to(scene, { '--iris': '250px', duration: 0.45, ease: 'power2.out' }, '<')
    .to(q('.co-scr'), { opacity: 0, duration: 0.3 }, '+=.08')
    .to(scene, { '--cam': 1, duration: 1.3, ease: 'expo.inOut' }, '<')
    .to(scene, { '--iris': '2200px', duration: 1, ease: 'power2.in' }, '<.1')
    .to(scene, { '--veil': 0, duration: 0.45, ease: 'none' }, '-=.4')
    .add(intro, '-=.35');

  const skip = () => { if (tl.progress() < 1) tl.progress(1, false); };
  const evs = ['wheel', 'touchstart', 'keydown', 'pointerdown'];
  evs.forEach((e) => addEventListener(e, skip, { once: true, passive: true }));
  return () => {
    evs.forEach((e) => removeEventListener(e, skip));
    if (tl.progress() < 1) tl.progress(1, false);
  };
}
