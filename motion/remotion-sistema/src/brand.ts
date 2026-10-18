import { Easing } from 'remotion';

export const C = {
  bg: '#03040B',
  navy: '#0A1F4C',
  blue: '#0055FF',
  indigo: '#455DFF',
  cyan: '#00E5FF',
  white: '#FFFFFF',
  muted: '#9EB0C7',
};

export const FONT = {
  title: "'Lexend', sans-serif",
  text: "'Inter', sans-serif",
  mono: "'JetBrains Mono', monospace",
};

export const FPS = 30;
export const DUR = 360; // 12 s
export const STAGE = 72; // 5 stages x 72 = 360

/** Calm, precise ease-out: cubic-bezier(.25,1,.5,1) */
export const easeOut = Easing.bezier(0.25, 1, 0.5, 1);
/** Symmetric ease for travel / cross-fades */
export const easeInOut = Easing.bezier(0.45, 0, 0.25, 1);

export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
export const prog = (t: number, start: number, dur: number, ease = easeOut) =>
  ease(clamp01((t - start) / dur));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Signed local time of stage k in [-60, 300) — periodic over DUR so the loop is seamless. */
export const localU = (f: number, k: number) => {
  let u = (((f - k * STAGE) % DUR) + DUR) % DUR;
  if (u >= 300) u -= DUR;
  return u;
};

/** Activation of stage k (0..1). Neighbouring stages cross-fade and always sum to 1. */
export const activation = (f: number, k: number) => {
  const u = localU(f, k);
  const rise = easeInOut(clamp01((u + 4) / 18));
  const fall = easeInOut(clamp01((u - 68) / 18));
  return rise * (1 - fall);
};

/** Content clock for stage k (frames since the card lit up). */
export const contentT = (f: number, k: number) => localU(f, k) - 6;

/** Pulse travelling hub -> card k: progress 0..1 or null */
export const outPulse = (f: number, k: number) => {
  const u = localU(f, k);
  if (u < -14 || u > 8) return null;
  return easeInOut(clamp01((u + 14) / 20));
};
/** Pulse travelling card k -> hub */
export const inPulse = (f: number, k: number) => {
  const u = localU(f, k);
  if (u < 38 || u > 60) return null;
  return easeInOut(clamp01((u - 38) / 20));
};

/** Hub flare: peaks when a pulse leaves the hub (every 72 frames, periodic). */
export const hubFlare = (f: number) => {
  const g = (((f + 14) % STAGE) + STAGE) % STAGE;
  const d = Math.min(g, STAGE - g);
  return easeOut(clamp01(1 - d / 16));
};

/** Slow periodic wave: integer cycles per 12 s loop -> seamless. */
export const wave = (f: number, cycles: number, phase = 0) =>
  Math.sin((2 * Math.PI * cycles * f) / DUR + phase);
