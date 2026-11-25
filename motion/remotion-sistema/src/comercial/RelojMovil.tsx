import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { C, FONT, easeInOut, lerp, prog } from '../brand';
import { mix } from '../ui';
import {
  ACTS,
  Act,
  CIERRE_IN,
  CIERRE_L2,
  ROLES,
  ROLE_ORDER,
  TITULO,
  actVis,
  cierreVis,
  hexA,
  lastLitChip,
  lit,
  playheadY,
  rowFlare,
  rowIn,
  rowRoles,
} from './data';
import { Defs, Dial, Fondo, Horas, Nodo, Rol, cristal } from './parts';

const W = 1080;
const H = 1350;
const PAD = 52;
const SPINE = 78;
const ROW_X = 128;
const ROW_W = W - 44 - ROW_X;
const Y0 = 304;
const Y1 = 1312;

type Metrics = {
  hour: number;
  text: number;
  label: number;
  head: number;
  hourLine: number;
  textLine: number;
  bodyPad: number;
  gap: number;
  /** las filas encendidas se quedan abiertas (si no, acordeón) */
  keep: boolean;
};
const METRICS: Record<number, Metrics> = {
  1: { hour: 54, text: 46, label: 40, head: 108, hourLine: 66, textLine: 58, bodyPad: 30, gap: 14, keep: false },
  2: { hour: 60, text: 50, label: 40, head: 120, hourLine: 74, textLine: 64, bodyPad: 34, gap: 22, keep: true },
  3: { hour: 54, text: 44, label: 40, head: 94, hourLine: 66, textLine: 56, bodyPad: 18, gap: 12, keep: true },
};

const rise = (f: number, at: number) => prog(f, at - 4, 18, easeInOut);

const layout = (f: number, a: Act) => {
  const m = METRICS[a.n];
  const heads = a.rows.map((r) => {
    const hourLines = r.wrapAt ? 2 : 1;
    const roles = rowRoles(r).length;
    return Math.max(m.head, hourLines * m.hourLine + (m.head - m.hourLine), roles * (m.label * 1.15 + 8) + 28);
  });
  const bodies = a.rows.map((r) => r.textM.length * m.textLine + m.bodyPad);
  const open = a.rows.map((r, k) => {
    const up = rise(f, r.chips[0].at);
    if (m.keep || k === a.rows.length - 1) return up;
    return up * (1 - rise(f, a.rows[k + 1].chips[0].at));
  });
  // alto final (todo desplegado según el modo) para centrar el bloque
  const finalBodies = m.keep ? bodies.reduce((s, b) => s + b, 0) : Math.max(...bodies);
  const total = heads.reduce((s, h) => s + h, 0) + finalBodies + (a.rows.length - 1) * m.gap;
  let y = Y0 + Math.max(0, (Y1 - Y0 - total) / 2);
  const rows = a.rows.map((_, k) => {
    const h = heads[k] + bodies[k] * open[k];
    const out = { y, h, head: heads[k], body: bodies[k], open: open[k] };
    y += h + m.gap;
    return out;
  });
  return rows;
};

const Acto: React.FC<{ f: number; a: Act }> = ({ f, a }) => {
  const v = actVis(f, a);
  if (v <= 0.001) return null;
  const m = METRICS[a.n];
  const rows = layout(f, a);
  const ys = rows.map((r) => r.y + r.head / 2);
  const top = rows[0].y - 4;
  const bottom = ys[ys.length - 1];
  const py = playheadY(f, a, ys, top);
  return (
    <AbsoluteFill style={{ opacity: v }}>
      <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
        <Defs blur={12} />
        <line x1={SPINE} y1={top} x2={SPINE} y2={bottom} stroke={C.muted} strokeWidth={3} opacity={0.22} />
        <line x1={SPINE} y1={top} x2={SPINE} y2={py} stroke="#FFFFFF" strokeWidth={3} opacity={0.75} />
        <line x1={SPINE} y1={Math.max(top, py - 110)} x2={SPINE} y2={py} stroke="#7FA2FF" strokeWidth={10} opacity={0.5} filter="url(#rblurS)" />
        {a.rows.map((r, k) => {
          const on = rowIn(f, r);
          const col = ROLES[lastLitChip(f, r).role].color;
          return <line key={k} x1={SPINE + 14} y1={ys[k]} x2={SPINE + 14 + (ROW_X - SPINE - 14) * on} y2={ys[k]} stroke={col} strokeWidth={3} opacity={0.7 * on} />;
        })}
        {a.rows.map((r, k) => (
          <Nodo key={k} x={SPINE} y={ys[k]} size={22} color={ROLES[lastLitChip(f, r).role].color} on={lit(f, r.chips[0])} fl={rowFlare(f, r)} />
        ))}
        <rect x={SPINE - 7} y={py - 7} width={14} height={14} fill="#FFFFFF" opacity={py > top + 1 && py < bottom - 1 ? 0.95 : 0} transform={`rotate(45 ${SPINE} ${py})`} />
      </svg>
      {a.rows.map((r, k) => {
        const skel = prog(f, a.start + 3 + k * 2, 14);
        const on = rowIn(f, r);
        const fl = rowFlare(f, r);
        const roles = rowRoles(r);
        const col = ROLES[lastLitChip(f, r).role].color;
        const row = rows[k];
        return (
          <div
            key={k}
            style={{
              position: 'absolute',
              left: ROW_X,
              top: row.y,
              width: ROW_W,
              height: row.h,
              borderRadius: 26,
              boxSizing: 'border-box',
              overflow: 'hidden',
              opacity: skel,
              ...cristal(col, lerp(0.25, 1, on), fl),
            }}
          >
            <div
              style={{
                position: 'absolute',
                left: 30,
                right: 30,
                top: 0,
                height: row.head,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Horas f={f} row={r} size={m.hour} align="left" lineH={m.hourLine / m.hour} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-start', opacity: on, translate: `${lerp(14, 0, on)}px 0px` }}>
                {roles.map((role) => (
                  <Rol key={role} role={role} size={m.label} dot={22} />
                ))}
              </div>
            </div>
            <div
              style={{
                position: 'absolute',
                left: 30,
                right: 30,
                top: row.head - 4,
                opacity: row.open,
                fontFamily: FONT.text,
                fontSize: m.text,
                fontWeight: 500,
                color: C.white,
                lineHeight: `${m.textLine}px`,
                letterSpacing: '-0.005em',
              }}
            >
              {r.textM.map((t, i) => (
                <div key={i} style={{ whiteSpace: 'nowrap' }}>
                  {t}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

const Cabecera: React.FC<{ f: number }> = ({ f }) => (
  <>
    <div
      style={{
        position: 'absolute',
        left: PAD,
        top: 48,
        fontFamily: FONT.mono,
        fontSize: 40,
        fontWeight: 500,
        letterSpacing: '0.02em',
        textTransform: 'uppercase',
        color: C.muted,
        whiteSpace: 'nowrap',
      }}
    >
      {TITULO}
    </div>
    {ACTS.map((a) => {
      const v = actVis(f, a);
      if (v <= 0.001) return null;
      return (
        <div key={a.n} style={{ position: 'absolute', left: PAD, top: 122, opacity: v, translate: `0px ${lerp(10, 0, prog(f, a.start, 18))}px` }}>
          <div style={{ fontFamily: FONT.title, fontSize: 44, fontWeight: 300, color: C.muted, lineHeight: 1.1, whiteSpace: 'nowrap' }}>Acto {a.n} de 3</div>
          <div style={{ fontFamily: FONT.title, fontSize: 86, fontWeight: 600, color: C.white, lineHeight: 1.15, whiteSpace: 'nowrap', letterSpacing: '-0.02em' }}>
            {a.title}
          </div>
        </div>
      );
    })}
    <Dial f={f} cx={946} cy={204} r={68} sw={4} />
  </>
);

const Cierre: React.FC<{ f: number }> = ({ f }) => {
  const v = cierreVis(f);
  if (v <= 0.001) return null;
  const p1 = prog(f, CIERRE_IN, 18);
  const p2 = prog(f, CIERRE_IN + 6, 18);
  return (
    <AbsoluteFill style={{ opacity: v }}>
      <div
        style={{
          position: 'absolute',
          left: PAD,
          right: PAD,
          top: 400,
          fontFamily: FONT.title,
          fontSize: 76,
          fontWeight: 500,
          color: C.white,
          lineHeight: 1.18,
          letterSpacing: '-0.02em',
          translate: `0px ${lerp(14, 0, p1)}px`,
        }}
      >
        <div>Las plantillas salen</div>
        <div>en horario laboral:</div>
      </div>
      <div
        style={{
          position: 'absolute',
          left: PAD,
          right: PAD,
          top: 640,
          fontFamily: FONT.mono,
          fontSize: 46,
          fontWeight: 500,
          color: C.white,
          whiteSpace: 'nowrap',
          letterSpacing: '-0.02em',
          opacity: p2,
          translate: `0px ${lerp(14, 0, p2)}px`,
        }}
      >
        {CIERRE_L2}
      </div>
      <div style={{ position: 'absolute', left: PAD, right: PAD, top: 800, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {ROLE_ORDER.map((role, i) => {
          const p = prog(f, CIERRE_IN + 10 + i * 3, 14);
          const col = ROLES[role].color;
          return (
            <div
              key={role}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 24,
                padding: '34px 36px',
                borderRadius: 26,
                opacity: p,
                translate: `0px ${lerp(12, 0, p)}px`,
                ...cristal(col, 1, 0),
              }}
            >
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: col, boxShadow: `0 0 30px ${hexA(col, 0.6)}`, flexShrink: 0 }} />
              <div style={{ fontFamily: FONT.text, fontSize: 52, fontWeight: 500, color: mix('#FFFFFF', col, 0.12) }}>{ROLES[role].label}</div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

export const RelojMovil: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ backgroundColor: C.bg }}>
      <Fondo f={f} w={W} h={H} cx={W * 0.5} cy={H * 0.46} />
      <Cabecera f={f} />
      {ACTS.map((a) => (
        <Acto key={a.n} f={f} a={a} />
      ))}
      <Cierre f={f} />
    </AbsoluteFill>
  );
};
