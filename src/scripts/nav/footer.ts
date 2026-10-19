// src/scripts/nav/footer.ts — reprise de la firma (el isotipo se dibuja una vez en cian al llegar al final)
// e interruptor "Reducir movimiento" (localStorage 'ingeniak-motion' → html[data-motion="reduced"], evento 'ingeniak:motion').
export function initFooter() {
  const html = document.documentElement;
  const fin = document.querySelector<HTMLElement>('[data-reprise]');
  if (fin) {
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((es) => {
        if (es.some((e) => e.isIntersecting)) { fin.classList.add('is-drawn'); io.disconnect(); }
      }, { threshold: 0.6 });
      io.observe(fin);
    } else fin.classList.add('is-drawn');
  }

  const sw = document.querySelector<HTMLButtonElement>('[data-motion-toggle]');
  if (!sw) return;
  const sync = () => sw.setAttribute('aria-checked', html.dataset.motion === 'reduced' ? 'true' : 'false');
  sync();
  sw.addEventListener('click', () => {
    const reduced = html.dataset.motion !== 'reduced';
    if (reduced) html.dataset.motion = 'reduced';
    else delete html.dataset.motion;
    try { reduced ? localStorage.setItem('ingeniak-motion', 'reduced') : localStorage.removeItem('ingeniak-motion'); } catch {}
    sync();
    if (reduced) html.dataset.hdrState = html.dataset.hdrState === 'hidden' ? 'glass' : html.dataset.hdrState ?? 'top';
    window.dispatchEvent(new CustomEvent('ingeniak:motion', { detail: { reduced } }));
  });
}
