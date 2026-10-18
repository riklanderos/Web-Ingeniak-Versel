import React from 'react';
import { C, FONT, clamp01, easeInOut, easeOut, lerp, prog } from './brand';
import { LogoName } from './logos-data';

export const VW = 380;
export const VH = 180;

type VP = { c: number; e: number; f: number };

const abs = (s: React.CSSProperties): React.CSSProperties => ({ position: 'absolute', ...s });
const skel = (o = 0.14): React.CSSProperties => ({ background: `rgba(255,255,255,${o})`, borderRadius: 4 });

/* 1 ATRAER — ad card + audience dots attracted into it */
const DOTS = [
  [318, 22], [350, 58], [296, 70], [340, 104], [364, 140], [300, 128], [262, 30], [270, 160], [330, 168], [250, 96], [362, 12], [228, 140],
];
export const Atraer: React.FC<VP> = ({ c, e }) => {
  const rise = prog(c, 0, 18);
  const ripple = clamp01((c - 36) / 20);
  const target = { x: 170, y: 92 };
  return (
    <div style={abs({ left: 0, top: 0, width: VW, height: VH })}>
      {/* ad card */}
      <div
        style={abs({
          left: 0,
          top: 0,
          width: 176,
          height: 180,
          borderRadius: 14,
          background: 'rgba(3,4,11,0.45)',
          border: `1px solid rgba(255,255,255,${0.14 + 0.12 * e})`,
          overflow: 'hidden',
          transform: `translateY(${(1 - rise * e) * 0}px)`,
        })}
      >
        <div
          style={abs({
            left: 8,
            top: 8,
            width: 160,
            height: 92,
            borderRadius: 9,
            background: `radial-gradient(circle at ${30 + 40 * rise * e}% 35%, rgba(0,229,255,${0.35 + 0.35 * e}) 0%, rgba(0,85,255,0.55) 35%, rgba(10,31,76,0.9) 75%)`,
          })}
        />
        {/* tiny isotipo-ish shape: abstract play triangle */}
        <svg width={160} height={92} style={abs({ left: 8, top: 8 })}>
          <path d="M70 32 L94 46 L70 60 Z" fill="rgba(255,255,255,0.85)" opacity={0.5 + 0.5 * e} />
        </svg>
        <div style={abs({ left: 10, top: 112, width: 120, height: 9, ...skel(0.28) })} />
        <div style={abs({ left: 10, top: 128, width: 86, height: 9, ...skel(0.16) })} />
        <div
          style={abs({
            left: 10,
            top: 148,
            width: 74,
            height: 22,
            borderRadius: 11,
            background: `rgba(0,85,255,${0.55 + 0.45 * e})`,
            boxShadow: `0 0 ${18 * e}px rgba(0,85,255,${0.6 * e})`,
          })}
        />
        {/* click ripple */}
        {e > 0.01 && c > 36 ? (
          <div
            style={abs({
              left: 47 - 6 - 26 * easeOut(ripple),
              top: 159 - 6 - 26 * easeOut(ripple),
              width: 12 + 52 * easeOut(ripple),
              height: 12 + 52 * easeOut(ripple),
              borderRadius: '50%',
              border: `1.5px solid ${C.cyan}`,
              opacity: (1 - ripple) * e,
            })}
          />
        ) : null}
      </div>
      {/* audience dots */}
      <svg width={VW} height={VH} style={abs({ left: 0, top: 0, overflow: 'visible' })}>
        {DOTS.map(([x, y], i) => {
          const p = prog(c, 4 + i * 2.2, 26, easeInOut);
          const px = lerp(x, target.x, p);
          const py = lerp(y, target.y + (i % 5) * 9 - 18, p);
          return (
            <g key={i}>
              <circle cx={x} cy={y} r={3.2} fill="#fff" opacity={0.22 * (1 - e * Math.min(1, p * 1.5))} />
              {e > 0.01 ? (
                <>
                  <circle cx={px} cy={py} r={9} fill={C.cyan} opacity={0.18 * e * (1 - p)} filter="url(#vblur)" />
                  <circle cx={px} cy={py} r={3.4} fill={C.cyan} opacity={e * (1 - clamp01((p - 0.85) / 0.15))} />
                </>
              ) : null}
            </g>
          );
        })}
        <defs>
          <filter id="vblur" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="3" />
          </filter>
        </defs>
      </svg>
    </div>
  );
};

/* 2 ATENDER — WhatsApp chat with Kain */
const Bubble: React.FC<{ side: 'l' | 'r'; text: string; t: number; e: number; top: number }> = ({ side, text, t, e, top }) => (
  <div
    style={abs({
      top,
      [side === 'l' ? 'left' : 'right']: 0,
      maxWidth: 330,
      padding: '9px 14px',
      borderRadius: side === 'l' ? '4px 16px 16px 16px' : '16px 4px 16px 16px',
      background: side === 'l' ? 'rgba(255,255,255,0.13)' : `linear-gradient(135deg, ${C.blue}, ${C.indigo})`,
      border: side === 'l' ? '1px solid rgba(255,255,255,0.18)' : '1px solid rgba(120,160,255,0.5)',
      boxShadow: side === 'r' ? '0 8px 24px rgba(0,85,255,0.35)' : 'none',
      fontFamily: FONT.text,
      fontSize: 17,
      lineHeight: 1.25,
      fontWeight: 450,
      color: '#fff',
      whiteSpace: 'nowrap',
      opacity: t * e,
      transform: `translateY(${(1 - t) * 10}px)`,
    })}
  >
    {text}
  </div>
);

export const Atender: React.FC<VP> = ({ c, e, f }) => {
  const b1 = prog(c, 2, 14);
  const typing = clamp01((c - 14) / 4) * (1 - clamp01((c - 32) / 4));
  const b2 = prog(c, 33, 14);
  return (
    <div style={abs({ left: 0, top: 0, width: VW, height: VH })}>
      {/* resting skeleton */}
      <div style={abs({ left: 0, top: 6, width: 200, height: 38, borderRadius: '4px 16px 16px 16px', border: '1px dashed rgba(255,255,255,0.14)', opacity: 1 - e })} />
      <div style={abs({ right: 0, top: 104, width: 230, height: 38, borderRadius: '16px 4px 16px 16px', border: '1px dashed rgba(255,255,255,0.14)', opacity: 1 - e })} />
      <Bubble side="l" text="Hola, ¿tienen cita mañana?" t={b1} e={e} top={6} />
      {/* typing indicator */}
      <div
        style={abs({
          right: 0,
          top: 104,
          width: 64,
          height: 36,
          borderRadius: '16px 4px 16px 16px',
          background: 'rgba(0,85,255,0.35)',
          border: '1px solid rgba(120,160,255,0.4)',
          opacity: typing * e,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
        })}
      >
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              width: 7,
              height: 7,
              borderRadius: 4,
              background: '#fff',
              opacity: 0.45 + 0.55 * Math.max(0, Math.sin((f / 30) * Math.PI * 3 - i * 0.9)),
            }}
          />
        ))}
      </div>
      <div
        style={abs({
          right: 2,
          top: 80,
          fontFamily: FONT.mono,
          fontSize: 12,
          letterSpacing: '0.16em',
          color: C.cyan,
          opacity: Math.max(typing, b2) * e,
          display: 'flex',
          alignItems: 'center',
          gap: 7,
        })}
      >
        <div style={{ width: 6, height: 6, background: C.cyan, boxShadow: `0 0 8px ${C.cyan}` }} />
        KAIN
      </div>
      <Bubble side="r" text="¡Claro! ¿Te queda a las 11:00?" t={b2} e={e} top={104} />
      {/* read ticks */}
      <svg width={22} height={12} style={abs({ right: 4, top: 150, opacity: prog(c, 44, 10) * e })}>
        <path d="M1 6 L5 10 L12 2 M8 9 L9 10 L17 2" stroke={C.cyan} strokeWidth={1.8} fill="none" strokeLinecap="round" />
      </svg>
    </div>
  );
};

/* 3 ORGANIZAR — mini kanban, a lead card moves through the pipeline */
export const Organizar: React.FC<VP> = ({ c, e }) => {
  const colW = 116;
  const gap = 16;
  const colX = (i: number) => i * (colW + gap);
  const m1 = prog(c, 6, 20, easeInOut);
  const m2 = prog(c, 30, 20, easeInOut);
  const x = lerp(lerp(colX(0), colX(1), m1), colX(2), m2) + 6;
  const lift = Math.sin(Math.PI * m1) + Math.sin(Math.PI * m2);
  const y = 34 - lift * 6;
  const counts = [2, 2, 1];
  const dotColors = [C.muted, C.indigo, C.cyan];
  return (
    <div style={abs({ left: 0, top: 0, width: VW, height: VH })}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={abs({
            left: colX(i),
            top: 0,
            width: colW,
            height: VH,
            borderRadius: 12,
            background: 'rgba(3,4,11,0.35)',
            border: `1px solid rgba(255,255,255,${0.1 + (i === 2 ? 0.12 * e * m2 : 0)})`,
          })}
        >
          <div style={abs({ left: 10, top: 11, width: 7, height: 7, background: dotColors[i], borderRadius: 1 })} />
          <div style={abs({ left: 24, top: 11, width: 46 + i * 8, height: 7, ...skel(0.22) })} />
          {Array.from({ length: counts[i] }).map((_, j) => (
            <div
              key={j}
              style={abs({
                left: 6,
                top: 34 + (j + 1) * 50 - (i === 0 ? 0 : 0),
                width: colW - 12,
                height: 42,
                borderRadius: 8,
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.08)',
              })}
            >
              <div style={abs({ left: 8, top: 9, width: 50, height: 6, ...skel(0.18) })} />
              <div style={abs({ left: 8, top: 22, width: 72, height: 6, ...skel(0.1) })} />
            </div>
          ))}
        </div>
      ))}
      {/* resting placeholder slot */}
      <div style={abs({ left: 6, top: 34, width: colW - 12, height: 42, borderRadius: 8, border: '1px dashed rgba(255,255,255,0.16)', opacity: 1 - e })} />
      {/* moving lead */}
      <div
        style={abs({
          left: x,
          top: y,
          width: colW - 12,
          height: 42,
          borderRadius: 8,
          background: 'linear-gradient(135deg, rgba(0,85,255,0.55), rgba(69,93,255,0.4))',
          border: `1px solid rgba(0,229,255,0.7)`,
          boxShadow: `0 ${6 + lift * 6}px 22px rgba(0,85,255,0.45), 0 0 14px rgba(0,229,255,0.25)`,
          opacity: e,
        })}
      >
        <div style={abs({ left: 8, top: 10, width: 20, height: 20, borderRadius: 10, background: 'rgba(255,255,255,0.85)' })} />
        <div style={abs({ left: 36, top: 12, width: 52, height: 6, ...skel(0.7) })} />
        <div style={abs({ left: 36, top: 24, width: 36, height: 6, ...skel(0.4) })} />
      </div>
    </div>
  );
};

/* 4 AUTOMATIZAR — three workflow nodes */
const Icon: React.FC<{ kind: 'bolt' | 'spark' | 'send'; color: string }> = ({ kind, color }) => (
  <svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    {kind === 'bolt' ? <path d="M13 2 L4 14 H11 L10 22 L20 9 H13 Z" /> : null}
    {kind === 'spark' ? (
      <path d="M12 3 C12.8 8 16 11.2 21 12 C16 12.8 12.8 16 12 21 C11.2 16 8 12.8 3 12 C8 11.2 11.2 8 12 3 Z" />
    ) : null}
    {kind === 'send' ? <path d="M22 2 L11 13 M22 2 L15 22 L11 13 L2 9 Z" /> : null}
  </svg>
);

export const Automatizar: React.FC<VP> = ({ c, e, f }) => {
  const nodes = [
    { x: 14, kind: 'bolt' as const },
    { x: 158, kind: 'spark' as const },
    { x: 302, kind: 'send' as const },
  ];
  const size = 64;
  const cy = 74;
  const lit = [prog(c, 0, 8), prog(c, 18, 8), prog(c, 40, 8)];
  const t1 = clamp01((c - 6) / 12);
  const t2 = clamp01((c - 28) / 12);
  const spin = (f * 6) % 360;
  const done = prog(c, 46, 10);
  return (
    <div style={abs({ left: 0, top: 0, width: VW, height: VH })}>
      <svg width={VW} height={VH} style={abs({ left: 0, top: 0 })}>
        {[0, 1].map((i) => {
          const x0 = nodes[i].x + size;
          const x1 = nodes[i + 1].x;
          const t = i === 0 ? t1 : t2;
          const px = lerp(x0, x1, easeInOut(t));
          return (
            <g key={i}>
              <line x1={x0} y1={cy} x2={x1} y2={cy} stroke={C.cyan} strokeWidth={1.5} opacity={0.3 + 0.3 * e} />
              {e > 0.01 && t > 0 && t < 1 ? (
                <>
                  <rect x={px - 9} y={cy - 9} width={18} height={18} fill={C.cyan} opacity={0.3 * e} filter="url(#ablur)" />
                  <rect x={px - 3.5} y={cy - 3.5} width={7} height={7} fill="#E9FEFF" opacity={e} />
                </>
              ) : null}
            </g>
          );
        })}
        <defs>
          <filter id="ablur" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="4" />
          </filter>
        </defs>
      </svg>
      {nodes.map((n, i) => {
        const l = lit[i] * e;
        return (
          <div key={i}>
            <div
              style={abs({
                left: n.x,
                top: cy - size / 2,
                width: size,
                height: size,
                borderRadius: 14,
                background: `rgba(${i === 1 ? '69,93,255' : '255,255,255'},${0.08 + 0.18 * l})`,
                border: `1px solid rgba(${l > 0.5 ? '0,229,255' : '255,255,255'},${0.18 + 0.5 * l})`,
                boxShadow: `inset 0 1px 0 rgba(255,255,255,0.2), 0 0 ${24 * l}px rgba(0,229,255,${0.35 * l})`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              })}
            >
              <Icon kind={n.kind} color={l > 0.5 ? '#fff' : 'rgba(255,255,255,0.65)'} />
            </div>
            {i === 1 ? (
              <svg
                width={size + 16}
                height={size + 16}
                style={abs({ left: n.x - 8, top: cy - size / 2 - 8, opacity: e * clamp01((c - 18) / 6) * (1 - clamp01((c - 38) / 6)) })}
              >
                <rect
                  x={1}
                  y={1}
                  width={size + 14}
                  height={size + 14}
                  rx={19}
                  fill="none"
                  stroke={C.cyan}
                  strokeWidth={1.5}
                  strokeDasharray="40 220"
                  strokeDashoffset={-spin}
                />
              </svg>
            ) : null}
            <div style={abs({ left: n.x + 8, top: cy + size / 2 + 16, width: size - 16, height: 6, ...skel(0.2 + 0.2 * l) })} />
            <div style={abs({ left: n.x + 14, top: cy + size / 2 + 28, width: size - 28, height: 6, ...skel(0.1 + 0.1 * l) })} />
          </div>
        );
      })}
      {/* completion check on last node */}
      <div
        style={abs({
          left: nodes[2].x + size - 10,
          top: cy - size / 2 - 10,
          width: 22,
          height: 22,
          borderRadius: 11,
          background: C.cyan,
          boxShadow: `0 0 12px ${C.cyan}`,
          opacity: done * e,
          transform: `scale(${0.6 + 0.4 * done})`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        })}
      >
        <svg width={12} height={12} viewBox="0 0 12 12">
          <path d="M2 6.5 L5 9 L10 3" stroke={C.bg} strokeWidth={2} fill="none" strokeLinecap="round" />
        </svg>
      </div>
    </div>
  );
};

/* 5 MEDIR — mini dashboard (no real numbers) */
const BARS = [0.42, 0.55, 0.5, 0.68, 0.74, 0.9];
const LINE = [0.28, 0.36, 0.33, 0.48, 0.52, 0.66, 0.72, 0.86];
export const Medir: React.FC<VP> = ({ c, e }) => {
  const chartTop = 34;
  const chartH = 140;
  const lx0 = 196;
  const lw = 184;
  const pts = LINE.map((v, i) => ({ x: lx0 + 6 + (i * (lw - 12)) / (LINE.length - 1), y: chartTop + chartH - 8 - v * (chartH - 24) }));
  const d = pts.map((p, i) => `${i ? 'L' : 'M'}${p.x} ${p.y}`).join(' ');
  let L = 0;
  for (let i = 1; i < pts.length; i++) L += Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y);
  const draw = prog(c, 14, 34, easeInOut) * e;
  const last = pts[pts.length - 1];
  return (
    <div style={abs({ left: 0, top: 0, width: VW, height: VH })}>
      <div
        style={abs({
          right: 0,
          top: 0,
          fontFamily: FONT.mono,
          fontSize: 10,
          letterSpacing: '0.18em',
          color: C.muted,
          padding: '4px 8px',
          borderRadius: 6,
          border: '1px solid rgba(158,176,199,0.35)',
          background: 'rgba(3,4,11,0.4)',
        })}
      >
        VISTA DEMO
      </div>
      <div style={abs({ left: 0, top: 6, width: 70, height: 8, ...skel(0.22) })} />
      {/* bars panel */}
      <div style={abs({ left: 0, top: chartTop, width: 178, height: chartH, borderRadius: 12, background: 'rgba(3,4,11,0.35)', border: '1px solid rgba(255,255,255,0.1)' })}>
        {BARS.map((v, i) => {
          const g = prog(c, 2 + i * 3, 22);
          const h = (chartH - 28) * lerp(0.18, v, g * e);
          return (
            <div
              key={i}
              style={abs({
                left: 14 + i * 26,
                bottom: 12,
                width: 16,
                height: h,
                borderRadius: '4px 4px 2px 2px',
                background: i === BARS.length - 1 ? `linear-gradient(180deg, ${C.cyan}, ${C.blue})` : `linear-gradient(180deg, rgba(69,93,255,0.95), rgba(0,85,255,0.55))`,
                opacity: 0.55 + 0.45 * e,
                boxShadow: i === BARS.length - 1 ? `0 0 ${14 * e}px rgba(0,229,255,${0.5 * e})` : 'none',
              })}
            />
          );
        })}
      </div>
      {/* line panel */}
      <div style={abs({ left: lx0, top: chartTop, width: lw, height: chartH, borderRadius: 12, background: 'rgba(3,4,11,0.35)', border: '1px solid rgba(255,255,255,0.1)' })} />
      <svg width={VW} height={VH} style={abs({ left: 0, top: 0, overflow: 'visible' })}>
        {[0.25, 0.5, 0.75].map((g) => (
          <line key={g} x1={lx0 + 8} x2={lx0 + lw - 8} y1={chartTop + chartH * g} y2={chartTop + chartH * g} stroke="rgba(255,255,255,0.07)" strokeWidth={1} />
        ))}
        <path d={d} stroke="rgba(255,255,255,0.16)" strokeWidth={1.5} fill="none" strokeDasharray="3 5" />
        <path
          d={`${d} L${last.x} ${chartTop + chartH - 4} L${pts[0].x} ${chartTop + chartH - 4} Z`}
          fill="url(#areaGrad)"
          opacity={draw}
        />
        <path d={d} stroke={C.cyan} strokeWidth={2.4} fill="none" strokeLinejoin="round" strokeLinecap="round" strokeDasharray={`${L * draw} ${L}`} />
        <rect x={last.x - 4} y={last.y - 4} width={8} height={8} fill="#E9FEFF" opacity={clamp01((draw - 0.95) / 0.05)} />
        <rect x={last.x - 10} y={last.y - 10} width={20} height={20} fill={C.cyan} opacity={0.35 * clamp01((draw - 0.95) / 0.05)} filter="url(#mblur)" />
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={C.cyan} stopOpacity={0.22} />
            <stop offset="1" stopColor={C.cyan} stopOpacity={0} />
          </linearGradient>
          <filter id="mblur" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="4" />
          </filter>
        </defs>
      </svg>
    </div>
  );
};

export type Stage = { label: string; logos: LogoName[]; V: React.FC<VP> };
export const STAGES: Stage[] = [
  { label: 'ATRAER', logos: ['meta', 'googleads', 'tiktok'], V: Atraer },
  { label: 'ATENDER', logos: ['whatsapp'], V: Atender },
  { label: 'ORGANIZAR', logos: ['kommo', 'gohighlevel'], V: Organizar },
  { label: 'AUTOMATIZAR', logos: ['n8n'], V: Automatizar },
  { label: 'MEDIR', logos: [], V: Medir },
];

export const logoHeight = (name: LogoName, base: number) =>
  name === 'kommo' || name === 'gohighlevel' ? base * 0.78 : name === 'n8n' ? base * 1.6 : base;

