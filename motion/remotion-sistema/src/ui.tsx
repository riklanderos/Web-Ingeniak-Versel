import React from 'react';
import { AbsoluteFill, Img, staticFile } from 'remotion';
import { C, FONT, wave } from './brand';
import { LOGOS, LogoName } from './logos-data';
import { P, polyLen, slice, toPath } from './geom';

/* ---------- Background ---------- */
export const Background: React.FC<{ f: number; w: number; h: number; hub: P }> = ({ f, w, h, hub }) => {
  const b1x = hub.x + wave(f, 1) * w * 0.08;
  const b1y = hub.y + wave(f, 1, Math.PI / 2) * h * 0.05;
  const b2x = w * 0.18 + wave(f, 1, 1.3) * w * 0.05;
  const b3x = w * 0.84 + wave(f, 1, 2.6) * w * 0.05;
  return (
    <AbsoluteFill style={{ backgroundColor: C.bg, overflow: 'hidden' }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse ${w * 0.55}px ${h * 0.55}px at ${hub.x}px ${hub.y}px, rgba(10,31,76,0.95) 0%, rgba(10,31,76,0.35) 45%, rgba(3,4,11,0) 100%)`,
        }}
      />
      {/* drifting light blobs */}
      <div style={blob(b1x, b1y, w * 0.32, 'rgba(0,85,255,0.20)')} />
      <div style={blob(b2x, h * 0.22, w * 0.26, 'rgba(69,93,255,0.12)')} />
      <div style={blob(b3x, h * 0.8, w * 0.26, 'rgba(0,229,255,0.07)')} />
      {/* dot grid */}
      <AbsoluteFill
        style={{
          backgroundImage: 'radial-gradient(rgba(158,176,199,0.16) 1.2px, transparent 1.6px)',
          backgroundSize: '36px 36px',
          backgroundPosition: '18px 18px',
          WebkitMaskImage: `radial-gradient(ellipse ${w * 0.6}px ${h * 0.6}px at ${hub.x}px ${hub.y}px, black 0%, transparent 100%)`,
          maskImage: `radial-gradient(ellipse ${w * 0.6}px ${h * 0.6}px at ${hub.x}px ${hub.y}px, black 0%, transparent 100%)`,
          opacity: 0.7,
        }}
      />
      <AbsoluteFill
        style={{ background: 'radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.55) 100%)' }}
      />
    </AbsoluteFill>
  );
};

const blob = (x: number, y: number, r: number, color: string): React.CSSProperties => ({
  position: 'absolute',
  left: x - r,
  top: y - r,
  width: r * 2,
  height: r * 2,
  borderRadius: '50%',
  background: `radial-gradient(circle, ${color} 0%, rgba(0,0,0,0) 70%)`,
});

/* ---------- Logo (monochrome white) ---------- */
export const Logo: React.FC<{ name: LogoName; height: number; opacity?: number; style?: React.CSSProperties }> = ({
  name,
  height,
  opacity = 1,
  style,
}) => {
  const { viewBox, inner } = LOGOS[name];
  const [, , vw, vh] = viewBox.split(/\s+/).map(Number);
  return (
    <svg
      viewBox={viewBox}
      width={(height * vw) / vh}
      height={height}
      fill="#fff"
      color="#fff"
      style={{ display: 'block', opacity, flexShrink: 0, ...style }}
      dangerouslySetInnerHTML={{ __html: inner }}
    />
  );
};

/* ---------- Glass panel ---------- */
export const Glass: React.FC<{
  x: number;
  y: number;
  w: number;
  h: number;
  e: number; // activation 0..1
  f: number;
  seed: number;
  radius?: number;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ x, y, w, h, e, f, seed, radius = 22, children, style }) => {
  const lx = w * (0.75 + 0.12 * wave(f, 1, seed));
  const ly = h * (0.05 + 0.1 * wave(f, 1, seed + 1.7));
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: w,
        height: h,
        borderRadius: radius,
        overflow: 'hidden',
        transform: `translateY(${-4 * e}px)`,
        background: `linear-gradient(180deg, rgba(255,255,255,${0.085 + 0.035 * e}) 0%, rgba(255,255,255,${0.045 + 0.02 * e}) 100%)`,
        border: `1px solid rgba(${lerpRgb(e)},${0.16 + 0.22 * e})`,
        boxShadow: `inset 0 1px 0 rgba(255,255,255,${0.22 + 0.12 * e}), inset 0 0 0 1px rgba(255,255,255,0.02), 0 24px 60px rgba(0,0,0,0.45), 0 0 ${48 * e}px rgba(0,229,255,${0.16 * e})`,
        backdropFilter: 'blur(16px) saturate(140%)',
        WebkitBackdropFilter: 'blur(16px) saturate(140%)',
        ...style,
      }}
    >
      {/* light leak */}
      <div
        style={{
          position: 'absolute',
          left: lx - w * 0.45,
          top: ly - h * 0.6,
          width: w * 0.9,
          height: h * 1.2,
          borderRadius: '50%',
          background: `radial-gradient(circle, rgba(0,85,255,${0.22 + 0.2 * e}) 0%, rgba(0,229,255,${0.05 + 0.08 * e}) 38%, rgba(0,0,0,0) 70%)`,
        }}
      />
      {/* top sheen */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          right: 0,
          height: Math.min(80, h * 0.4),
          background: 'linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0))',
        }}
      />
      {children}
    </div>
  );
};

const lerpRgb = (e: number) => {
  const r = Math.round(255 + (0 - 255) * e);
  const g = Math.round(255 + (229 - 255) * e);
  return `${r},${g},255`;
};

/* ---------- Stage label ---------- */
export const StageLabel: React.FC<{ n: number; text: string; size: number; e: number }> = ({ n, text, size, e }) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: size * 0.7,
      fontFamily: FONT.mono,
      fontSize: size,
      fontWeight: 500,
      letterSpacing: '0.16em',
      textTransform: 'uppercase',
      whiteSpace: 'nowrap',
    }}
  >
    <span style={{ color: e > 0.01 ? mix(C.muted, C.cyan, e) : C.muted }}>{String(n).padStart(2, '0')}</span>
    <span style={{ color: `rgba(255,255,255,${0.72 + 0.28 * e})` }}>{text}</span>
  </div>
);

const hex = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
export const mix = (a: string, b: string, t: number) => {
  const A = hex(a);
  const B = hex(b);
  return `rgb(${A.map((v, i) => Math.round(v + (B[i] - v) * t)).join(',')})`;
};

/* ---------- Glowing square node ---------- */
export const Node: React.FC<{ p: P; size: number; glow: number }> = ({ p, size, glow }) => (
  <g>
    <rect
      x={p.x - size * 1.6}
      y={p.y - size * 1.6}
      width={size * 3.2}
      height={size * 3.2}
      fill={C.cyan}
      opacity={0.1 + 0.35 * glow}
      filter="url(#blur8)"
    />
    <rect
      x={p.x - size / 2}
      y={p.y - size / 2}
      width={size}
      height={size}
      fill={glow > 0.5 ? '#E6FDFF' : C.cyan}
      opacity={0.55 + 0.45 * glow}
    />
  </g>
);

/* ---------- Branch line ---------- */
export const BranchLine: React.FC<{ pts: P[]; e: number; width: number }> = ({ pts, e, width }) => (
  <g>
    <path d={toPath(pts)} stroke={C.cyan} strokeWidth={width * 3} fill="none" opacity={0.05 + 0.18 * e} filter="url(#blur4)" strokeLinejoin="round" />
    <path d={toPath(pts)} stroke={C.cyan} strokeWidth={width} fill="none" opacity={0.3 + 0.55 * e} strokeLinejoin="round" />
  </g>
);

/* ---------- Pulse travelling along a polyline ---------- */
export const Pulse: React.FC<{ pts: P[]; p: number; trail: number; width: number }> = ({ pts, p, trail, width }) => {
  const L = polyLen(pts);
  const d = p * (L + trail);
  const head = Math.min(L, d);
  const segs = [
    { len: trail, op: 0.25, w: 1 },
    { len: trail * 0.55, op: 0.55, w: 1.3 },
    { len: trail * 0.22, op: 1, w: 1.7 },
  ];
  return (
    <g>
      <path
        d={toPath(slice(pts, Math.max(0, d - trail * 0.6), head))}
        stroke={C.cyan}
        strokeWidth={width * 7}
        fill="none"
        opacity={0.55}
        filter="url(#blur8)"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {segs.map((s, i) => {
        const a = Math.max(0, d - s.len);
        if (a >= head) return null;
        return (
          <path
            key={i}
            d={toPath(slice(pts, a, head))}
            stroke={i === 2 ? '#E9FEFF' : C.cyan}
            strokeWidth={width * s.w * 1.4}
            fill="none"
            opacity={s.op}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        );
      })}
    </g>
  );
};

export const SvgDefs: React.FC = () => (
  <defs>
    <filter id="blur4" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="4" />
    </filter>
    <filter id="blur8" x="-100%" y="-100%" width="300%" height="300%">
      <feGaussianBlur stdDeviation="8" />
    </filter>
  </defs>
);

/* ---------- Hub: crystal isotipo ---------- */
// Glyph anchors inside isotipo-cristal (1024x1024), normalised
export const GLYPH = {
  center: { x: 0.453, y: 0.485 },
  lu: { x: 0.098, y: 0.283 },
  ll: { x: 0.103, y: 0.571 },
  ru: { x: 0.81, y: 0.337 },
  rl: { x: 0.789, y: 0.555 },
  stemTop: { x: 0.493, y: 0.293 },
  stemBottom: { x: 0.493, y: 0.703 },
};

export const hubAnchor = (center: P, D: number, key: keyof typeof GLYPH): P => {
  const left = center.x - GLYPH.center.x * D;
  const top = center.y - GLYPH.center.y * D;
  return { x: left + GLYPH[key].x * D, y: top + GLYPH[key].y * D };
};

export const Hub: React.FC<{ center: P; D: number; f: number; flare: number }> = ({ center, D, f, flare }) => {
  const left = center.x - GLYPH.center.x * D;
  const top = center.y - GLYPH.center.y * D;
  const breathe = 0.5 + 0.5 * wave(f, 2);
  const gcx = center.x + D * 0.04;
  return (
    <>
      <div
        style={{
          position: 'absolute',
          left: gcx - D * 0.55,
          top: center.y - D * 0.4,
          width: D * 1.1,
          height: D * 0.8,
          borderRadius: '50%',
          background: `radial-gradient(ellipse, rgba(0,85,255,${0.22 + 0.06 * breathe + 0.18 * flare}) 0%, rgba(0,229,255,${0.04 + 0.06 * flare}) 40%, rgba(0,0,0,0) 70%)`,
        }}
      />
      <Img
        src={staticFile('marca/isotipo-cristal-1100.webp')}
        style={{
          position: 'absolute',
          left,
          top,
          width: D,
          height: D,
          mixBlendMode: 'screen',
          filter: `brightness(${1 + 0.06 * breathe + 0.28 * flare}) saturate(${1 + 0.15 * flare})`,
          WebkitMaskImage: 'radial-gradient(ellipse 48% 40% at 46% 48%, black 55%, transparent 100%)',
          maskImage: 'radial-gradient(ellipse 48% 40% at 46% 48%, black 55%, transparent 100%)',
        }}
      />
    </>
  );
};
