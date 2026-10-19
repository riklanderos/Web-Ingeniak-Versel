// src/scripts/nav/rail.ts — riel de escenas (ESPEC §4.7). Quita ticks sin destino, renumera y marca la escena
// que cruza la línea central del viewport (equivale a ScrollTrigger start 'top center' / end 'bottom center').
export function initRail() {
  const rail = document.querySelector<HTMLElement>('[data-rail]');
  if (!rail) return;
  const items = [...rail.querySelectorAll<HTMLElement>('.rail__item')];
  const live: { li: HTMLElement; a: HTMLAnchorElement; target: HTMLElement }[] = [];
  for (const li of items) {
    const a = li.querySelector<HTMLAnchorElement>('[data-rail-target]')!;
    const target = document.getElementById(a.dataset.railTarget!);
    if (!target) { li.remove(); continue; }
    const custom = target.dataset.railLabel;
    if (custom) { const nm = a.querySelector('.rail__name'); if (nm) nm.textContent = custom; }
    live.push({ li, a, target });
  }
  if (live.length < 2) { rail.remove(); return; }
  live.forEach(({ li, a }, n) => {
    const num = a.querySelector('.rail__n');
    if (num) num.textContent = String(n + 1).padStart(2, '0');
    const prev = live[n - 1]?.li;
    li.toggleAttribute('data-gap', !!prev && prev.dataset.group !== li.dataset.group);
  });

  const setActive = (id: string | null) => {
    for (const { a, target } of live) {
      const on = target.id === id;
      a.classList.toggle('is-active', on);
      if (on) a.setAttribute('aria-current', 'location'); else a.removeAttribute('aria-current');
    }
  };
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) if (e.isIntersecting) setActive((e.target as HTMLElement).id);
  }, { rootMargin: '-50% 0px -50% 0px', threshold: 0 });
  live.forEach(({ target }) => io.observe(target));

  rail.addEventListener('click', (e) => {
    const a = (e.target as HTMLElement).closest<HTMLAnchorElement>('[data-rail-target]');
    if (!a) return;
    const t = document.getElementById(a.dataset.railTarget!);
    const lenis = (window as any).__lenis;
    if (t && lenis?.scrollTo) {
      e.preventDefault();
      // El eyebrow de destino nunca queda bajo el encabezado de cristal (que vuelve al subir): alto del encabezado + 16 px.
      const hdr = document.querySelector<HTMLElement>('header.hdr')?.offsetHeight ?? 72;
      lenis.scrollTo(t, { offset: -(hdr + 16), duration: 1.1 });
      history.replaceState(null, '', `#${t.id}`);
      t.setAttribute('tabindex', '-1');
      setTimeout(() => t.focus({ preventScroll: true }), 1150);
    }
  });
}
