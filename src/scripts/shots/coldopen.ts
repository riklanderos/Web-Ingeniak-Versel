// src/scripts/shots/coldopen.ts — firma "Del nodo al pecho" (§7.3). 2.8 s, una vez por sesión, se salta con cualquier gesto.
// El nodo cuadrado late en el pecho de Kain, se dibujan el pilar y las ramas del isotipo (ruta de favicon.svg, 772.5),
// el isotipo se colapsa en su nodo, ese nodo es la pantalla del pecho, el iris se abre y la cámara se aleja (×4 → ×1)
// hasta la portada real. La <img> LCP nunca tiene opacity 0 y el H1 queda pintado bajo el iris: la tapa la capa óptica.
// Eventos a la sección: "cine:iris" (el iris empieza a abrirse: la portada prepara la entrada) y "cine:intro"
// ({instant} si la red de seguridad CSS ya mostró la portada). Al terminar: "cine:coldopen-end" en document.
// Nunca vuelve a tapar una portada que ya se pintó completa (JS tardío): la termina y listo.
import { html, hold, release, type Env } from './_util';

export default function coldopen(layer: HTMLElement, env: Env) {
  const { gsap } = env;
  const scene = layer.closest<HTMLElement>('.is');
  if (!scene || !html.classList.contains('co')) return;
  // La capa óptica vive en el escenario de la placa (registro exacto también en móvil 'split' y en ultra ancho).
  const box = scene.querySelector<HTMLElement>(':scope > .is__stagebox');
  if (box && layer.parentElement !== box) box.append(layer);

  const done = () => {
    html.classList.remove('co');
    document.dispatchEvent(new CustomEvent('cine:coldopen-end'));
  };
  const intro = (instant = false) => {
    if (scene.dataset.introSent) return;
    scene.dataset.introSent = '1';
    scene.dispatchEvent(new CustomEvent('cine:intro', { detail: { instant } }));
  };
  const late = getComputedStyle(layer).visibility === 'hidden' || performance.now() > 3000;
  if (!env.motion || late) {
    gsap.set(layer, { animation: 'none', visibility: 'hidden' });
    gsap.set(scene, { '--veil': 0, '--iris': '2200px' });
    done();
    intro(true);
    return;
  }
  try { sessionStorage.setItem('ingeniak-coldopen', '1'); } catch {}

  const q = (s: string) => layer.querySelector<HTMLElement>(s);
  const word = q('.co-word');
  const k = env.desk ? 1 : 0.8; // móvil ×0.8
  gsap.set(layer, { animation: 'none', visibility: 'visible' });
  gsap.set(scene, { '--cam': 4, '--veil': 1, '--iris': '0px', '--iso': 772.5 });

  const tl = gsap.timeline({
    defaults: { ease: 'power3.out' },
    onComplete: () => { gsap.set(layer, { visibility: 'hidden' }); release(layer); done(); },
  })
    .timeScale(1 / k)
    .to(word, { opacity: 1, duration: 0.3, ease: 'power1.out' }, 0)
    .to(q('.co-node'), { opacity: 1, duration: 0.08, repeat: 2, yoyo: true, ease: 'none' }, 0.1)
    .to(q('.co-iso'), { opacity: 1, duration: 0.1 })
    .to(scene, { '--iso': 0, duration: 0.7, ease: 'power2.inOut' }, '<')
    .to(q('.co-node'), { opacity: 0, duration: 0.2 }, '<.5')
    .to(q('.co-iso'), { scale: 0.16, opacity: 0, duration: 0.35, ease: 'power3.in' }, '+=.05')
    .to(word, { opacity: 0, duration: 0.3 }, '<')
    .fromTo(q('.co-scr'), { scale: 0.06, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.45, ease: 'expo.out' }, '-=.08')
    .add(() => { scene.dispatchEvent(new CustomEvent('cine:iris')); }, '<')
    .to(scene, { '--iris': '250px', duration: 0.45, ease: 'power2.out' }, '<')
    .to(q('.co-scr'), { opacity: 0, duration: 0.3 }, '+=.08')
    .to(scene, { '--cam': 1, duration: 1.3, ease: 'expo.inOut' }, '<')
    .to(scene, { '--iris': '2200px', duration: 1, ease: 'power2.in' }, '<.1')
    .to(scene, { '--veil': 0, duration: 0.45, ease: 'none' }, '-=.4')
    .add(() => intro(), '-=.35');
  hold(layer, () => tl.progress(1, false));

  const skip = () => { if (tl.progress() < 1) tl.progress(1, false); };
  const evs = ['wheel', 'touchstart', 'keydown', 'pointerdown'];
  evs.forEach((e) => addEventListener(e, skip, { once: true, passive: true }));
  return () => {
    evs.forEach((e) => removeEventListener(e, skip));
    if (tl.progress() < 1) tl.progress(1, false);
  };
}
