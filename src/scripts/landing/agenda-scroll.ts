// src/scripts/landing/agenda-scroll.ts — reserva en la propia landing (área landings · CAMBIO-COTIZAR §4.1, R17).
// Clic en cualquier a[href="#agenda"] (portada, video, diagnóstico, oferta, cierre, encabezado reducido, barra móvil):
//   1) scroll suave a #agenda con Lenis (window.__lenis, lo crea cine.ts) y offset −96 px; sin Lenis o con movimiento
//      reducido, scrollIntoView (el scroll-padding del sitio deja libre el encabezado);
//   2) al llegar, document.querySelector('[data-agenda]') recibe el evento 'agenda:focus' (BookingFlow enfoca el primer
//      campo vacío del paso 1 o el título del paso actual, §5.5).
// La atribución (sessionStorage['ingeniak-agenda-desde'], evento cta_agenda_click) la hace ui.ts en fase de captura
// (§1.5); aquí solo se mueve la página. Sin JS el ancla funciona sola.
type LenisLike = { scrollTo: (t: Element | string | number, o?: { offset?: number; immediate?: boolean; onComplete?: () => void; duration?: number }) => void };

const OFFSET = -96;
let ready = false;

const reduced = () =>
  document.documentElement.dataset.motion === 'reduced' || window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function focusAgenda() {
  const root = document.querySelector<HTMLElement>('[data-agenda]');
  if (!root) return;
  root.dispatchEvent(new CustomEvent('agenda:focus'));
  // Respaldo mientras el componente de reserva no está (marcado de espera de la plantilla): enfoca su título.
  const wait = root.querySelector<HTMLElement>('[data-bkwait-focus]');
  if (wait) wait.focus({ preventScroll: true });
}

function goToAgenda(target: HTMLElement) {
  const lenis = (window as unknown as { __lenis?: LenisLike }).__lenis;
  let done = false;
  const finish = () => {
    if (done) return;
    done = true;
    focusAgenda();
  };
  if (lenis && !reduced()) {
    lenis.scrollTo(target, { offset: OFFSET, onComplete: finish });
    window.setTimeout(finish, 2400); // respaldo si onComplete no llega (p. ej. el destino ya estaba a la vista)
    return;
  }
  if (reduced()) {
    target.scrollIntoView({ block: 'start', behavior: 'auto' });
    finish();
    return;
  }
  target.scrollIntoView({ block: 'start', behavior: 'smooth' });
  let t = window.setTimeout(finish, 900);
  window.addEventListener('scrollend', () => { window.clearTimeout(t); t = window.setTimeout(finish, 60); }, { once: true });
}

export function initAgendaScroll() {
  if (ready) return;
  ready = true;
  document.addEventListener('click', (e) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const a = (e.target as Element | null)?.closest?.('a[href="#agenda"]') as HTMLAnchorElement | null;
    if (!a) return;
    const section = document.getElementById('agenda');
    if (!section) return;
    e.preventDefault();
    // Una columna (móvil, tableta vertical): la columna informativa va antes del formulario y lo dejaría fuera de la
    // pantalla con el foco puesto en él; ahí el destino es la raíz del componente (sigue dentro de #agenda).
    const root = section.querySelector<HTMLElement>('[data-agenda]');
    const below = root ? root.getBoundingClientRect().top - section.getBoundingClientRect().top : 0;
    goToAgenda(root && below > window.innerHeight * 0.45 ? root : section);
  });
}
