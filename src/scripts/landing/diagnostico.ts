// src/scripts/landing/diagnostico.ts — "Diagnóstico rápido" de /power-session/ (área landings · CAMBIO-COTIZAR §4.3 #4).
// Ganchos (ConversionTemplate, kind "quiz"):
//   [data-quiz] data-umbral="3" data-resultados='[{min,max,text}]'
//     input[data-quiz-item] (casillas) · [data-quiz-count] data-tpl="{n} de 5" > [data-quiz-ct] · [data-quiz-msg] · [data-quiz-cta] (hidden)
// Puntaje = casillas marcadas. El contador vive en una región aria-live (con el mensaje). Mensaje por rango (en cian) desde
// la primera marca; con puntaje ≥ umbral aparece el primario a #agenda. Emite 'ingeniak:track' {name:'ps_diagnostico',
// puntaje} cuando el puntaje se asienta (sin texto escrito ni datos personales). Nada se guarda.
type Result = { min: number; max: number; text: string };

function track(puntaje: number) {
  try {
    document.dispatchEvent(new CustomEvent('ingeniak:track', { detail: { name: 'ps_diagnostico', puntaje, page: location.pathname } }));
  } catch {}
}

function bind(root: HTMLElement) {
  if (root.dataset.quizReady) return;
  root.dataset.quizReady = '1';
  const boxes = Array.from(root.querySelectorAll<HTMLInputElement>('input[data-quiz-item]'));
  const count = root.querySelector<HTMLElement>('[data-quiz-count]');
  const ct = root.querySelector<HTMLElement>('[data-quiz-ct]') ?? count;
  const msg = root.querySelector<HTMLElement>('[data-quiz-msg]');
  const cta = root.querySelector<HTMLElement>('[data-quiz-cta]');
  const tpl = count?.dataset.tpl ?? '{n} de 5';
  const umbral = Number(root.dataset.umbral ?? 3) || 3;
  let results: Result[] = [];
  try { results = JSON.parse(root.dataset.resultados ?? '[]'); } catch {}
  let touched = false;
  let sent = -1;
  let timer = 0;

  const update = () => {
    const n = boxes.filter((b) => b.checked).length;
    if (ct) ct.textContent = tpl.replace('{n}', String(n));
    root.style.setProperty('--score', String(n));
    root.dataset.score = String(n);
    boxes.forEach((b) => b.closest('.cv-quiz__li')?.classList.toggle('is-on', b.checked));
    const r = touched ? results.find((x) => n >= x.min && n <= x.max) : undefined;
    if (msg) {
      msg.textContent = r?.text ?? '';
      msg.hidden = !r;
    }
    const on = n >= umbral;
    if (cta && cta.hidden === on) {
      cta.hidden = !on;
      if (on) cta.classList.add('is-in');
      // la regla de un azul (ui.ts) vuelve a medir con el scroll/resize; avisa del cambio de layout
      window.dispatchEvent(new Event('resize'));
    }
    if (touched) {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => { if (n !== sent) { sent = n; track(n); } }, 900);
    }
  };
  boxes.forEach((b) => b.addEventListener('change', () => { touched = true; update(); }));
  update();
}

export function initDiagnostico() {
  document.querySelectorAll<HTMLElement>('[data-quiz]').forEach(bind);
}
