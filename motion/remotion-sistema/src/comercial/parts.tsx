import React from 'react';
import { AbsoluteFill } from 'remotion';
import { C, FONT, lerp } from '../brand';
import { mix } from '../ui';
import { ACTS, Chip, DUR_RELOJ, ROLES, Role, Row, actProgress, actVis, flare, handTurns, hexA, lit } from './data';

const wave = (f: number, cycles: number, phase = 0) => Math.sin((2 * Math.PI * cycles * f) / DUR_RELOJ + phase);

/* ---------- Fondo: #03040B con halo azul marino ---------- */
export const Fondo: React.FC<{ f: number; w: number; h: number; cx: number; cy: number }> = ({ f, w, h, cx, cy }) => {
  const breathe = 0.5 + 0.5 * wave(f, 3);
  return (
    <AbsoluteFill style={{ backgroundColor: C.bg, overflow: 'hidden' }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse ${w * 0.62}px ${h * 0.6}px at ${cx}px ${cy}px, rgba(10,31,76,${0.78 + 0.08 * breathe}) 0%, rgba(10,31,76,0.3) 48%, rgba(3,4,11,0) 100%)`,
        }}
      />
      <AbsoluteFill
        style={{
          backgroundImage: 'radial-gradient(rgba(158,176,199,0.13) 1.2px, transparent 1.6px)',
          backgroundSize: '40px 40px',
          backgroundPosition: '20px 20px',
          WebkitMaskImage: `radial-gradient(ellipse ${w * 0.62}px ${h * 0.62}px at ${cx}px ${cy}px, black 0%, transparent 100%)`,
          maskImage: `radial-gradient(ellipse ${w * 0.62}px ${h * 0.62}px at ${cx}px ${cy}px, black 0%, transparent 100%)`,
          opacity: 0.6,
        }}
      />
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse at center, transparent 58%, rgba(0,0,0,0.5) 100%)' }} />
    </AbsoluteFill>
  );
};

/* ---------- Carátula con aguja ---------- */
export const Dial: React.FC<{ f: number; cx: number; cy: number; r: number; sw?: number }> = ({ f, cx, cy, r, sw = 3 }) => {
  const size = r * 2 + 40;
  const o = size / 2;
  const circ = 2 * Math.PI * r;
  const ang = handTurns(f) * 360;
  const rad = ((ang - 90) * Math.PI) / 180;
  const hl = r - 16;
  return (
    <svg width={size} height={size} style={{ position: 'absolute', left: cx - o, top: cy - o }}>
      <circle cx={o} cy={o} r={r} fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.18)" strokeWidth={sw * 0.5} />
      {Array.from({ length: 12 }).map((_, i) => {
        const a = (i * 30 * Math.PI) / 180;
        const r0 = r - (i % 3 === 0 ? 12 : 8);
        return (
          <line
            key={i}
            x1={o + Math.sin(a) * r0}
            y1={o - Math.cos(a) * r0}
            x2={o + Math.sin(a) * (r - 4)}
            y2={o - Math.cos(a) * (r - 4)}
            stroke={C.muted}
            strokeWidth={sw * 0.6}
            opacity={i % 3 === 0 ? 0.8 : 0.4}
          />
        );
      })}
      {ACTS.map((a) => {
        const p = actProgress(f, a);
        const v = actVis(f, a);
        if (v <= 0.001 || p <= 0.001) return null;
        return (
          <circle
            key={a.n}
            cx={o}
            cy={o}
            r={r}
            fill="none"
            stroke="#FFFFFF"
            strokeWidth={sw}
            strokeLinecap="round"
            strokeDasharray={`${p * circ} ${circ}`}
            transform={`rotate(-90 ${o} ${o})`}
            opacity={0.9 * v}
          />
        );
      })}
      <line x1={o} y1={o} x2={o + Math.cos(rad) * hl} y2={o + Math.sin(rad) * hl} stroke="#FFFFFF" strokeWidth={sw} strokeLinecap="round" />
      <circle cx={o} cy={o} r={sw * 1.5} fill="#FFFFFF" />
    </svg>
  );
};

/* ---------- Horas (chips en mono) ---------- */
export const Horas: React.FC<{ f: number; row: Row; size: number; align: 'left' | 'right'; lineH?: number }> = ({
  f,
  row,
  size,
  align,
  lineH = 1.2,
}) => {
  const lines: Chip[][] = row.wrapAt ? [row.chips.slice(0, row.wrapAt), row.chips.slice(row.wrapAt)] : [row.chips];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: align === 'right' ? 'flex-end' : 'flex-start' }}>
      {lines.map((line, li) => (
        <div
          key={li}
          style={{ fontFamily: FONT.mono, fontSize: size, fontWeight: 500, lineHeight: lineH, whiteSpace: 'nowrap', letterSpacing: '-0.01em', wordSpacing: '-0.22em' }}
        >
          {line.map((c, i) => {
            const l = lit(f, c);
            const fl = flare(f, c);
            const col = ROLES[c.role].color;
            return (
              <React.Fragment key={i}>
                {i > 0 ? <span style={{ color: C.muted, opacity: lerp(0.3, 0.6, l), margin: '0 0.12em' }}>·</span> : null}
                <span
                  style={{
                    color: mix(C.muted, col, l),
                    opacity: lerp(0.4, 1, l),
                    textShadow: `0 0 ${size * 0.5}px ${hexA(col, 0.18 * l + 0.4 * fl)}`,
                  }}
                >
                  {c.t}
                </span>
              </React.Fragment>
            );
          })}
        </div>
      ))}
    </div>
  );
};

/* ---------- Etiqueta de rol: punto + nombre ---------- */
export const Rol: React.FC<{ role: Role; size: number; dot?: number }> = ({ role, size, dot }) => {
  const d = dot ?? size * 0.5;
  const col = ROLES[role].color;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: size * 0.4, whiteSpace: 'nowrap' }}>
      <div style={{ width: d, height: d, borderRadius: '50%', background: col, boxShadow: `0 0 ${d}px ${hexA(col, 0.55)}`, flexShrink: 0 }} />
      <div
        style={{
          fontFamily: FONT.mono,
          fontSize: size,
          fontWeight: 500,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          color: col,
          lineHeight: 1.15,
        }}
      >
        {ROLES[role].label}
      </div>
    </div>
  );
};

/* ---------- Cristal sutil ---------- */
export const cristal = (col: string, on: number, fl: number): React.CSSProperties => ({
  background: `linear-gradient(180deg, rgba(255,255,255,${0.03 + 0.05 * on}) 0%, rgba(255,255,255,${0.015 + 0.025 * on}) 100%)`,
  border: `1.5px solid ${mix('#39445C', col, 0.18 * on + 0.6 * fl)}`,
  boxShadow: `inset 0 1px 0 rgba(255,255,255,${0.05 + 0.13 * on}), 0 18px 40px rgba(0,0,0,${0.3 * on}), 0 0 ${36 * fl}px ${hexA(col, 0.22 * fl)}`,
});

/* ---------- Nodo cuadrado sobre la línea ---------- */
export const Nodo: React.FC<{ x: number; y: number; size: number; color: string; on: number; fl: number }> = ({ x, y, size, color, on, fl }) => (
  <g>
    <rect
      x={x - size * 1.5}
      y={y - size * 1.5}
      width={size * 3}
      height={size * 3}
      fill={color}
      opacity={0.3 * on + 0.5 * fl}
      filter="url(#rblur)"
    />
    <rect x={x - size / 2} y={y - size / 2} width={size} height={size} fill={C.bg} />
    <rect
      x={x - size / 2}
      y={y - size / 2}
      width={size}
      height={size}
      fill={color}
      fillOpacity={on}
      stroke={mix(C.muted, color, on)}
      strokeOpacity={lerp(0.5, 1, on)}
      strokeWidth={Math.max(1.5, size * 0.12)}
    />
  </g>
);

export const Defs: React.FC<{ blur: number }> = ({ blur }) => (
  <defs>
    <filter id="rblur" x="-150%" y="-150%" width="400%" height="400%">
      <feGaussianBlur stdDeviation={blur} />
    </filter>
    <filter id="rblurS" x="-300%" y="-50%" width="700%" height="200%">
      <feGaussianBlur stdDeviation={blur * 0.6} />
    </filter>
  </defs>
);
