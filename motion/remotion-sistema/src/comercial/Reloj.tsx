import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { C, FONT, easeInOut, lerp, prog } from '../brand';
import { mix } from '../ui';
import {
  ACTS,
  Act,
  CIERRE_IN,
  CIERRE_L1,
  CIERRE_L2,
  ROLES,
  ROLE_ORDER,
  TITULO,
  actVis,
  cierreVis,
  currentChip,
  hexA,
  lastLitChip,
  lit,
  playheadY,
  rowFlare,
  rowIn,
  rowRoles,
} from './data';
import { Defs, Dial, Fondo, Horas, Nodo, Rol, cristal } from './parts';

const W = 1920;
const H = 1080;
const PAD = 60;
const SPINE = 650;
const CARD_X = 700;
const CARD_W = W - PAD - CARD_X;
const Y0 = 216;
const Y1 = 1040;

type Metrics = { hour: number; text: number; cardH: number; gap: number };
const METRICS: Record<number, Metrics> = {
  1: { hour: 50, text: 36, cardH: 96, gap: 22 },
  2: { hour: 58, text: 46, cardH: 196, gap: 40 },
  3: { hour: 56, text: 40, cardH: 128, gap: 32 },
};

const layout = (a: Act) => {
  const m = METRICS[a.n];
  const n = a.rows.length;
  const total = n * m.cardH + (n - 1) * m.gap;
  const top = Y0 + (Y1 - Y0 - total) / 2;
  return a.rows.map((_, k) => top + k * (m.cardH + m.gap) + m.cardH / 2);
};

const Acto: React.FC<{ f: number; a: Act }> = ({ f, a }) => {
  const v = actVis(f, a);
  if (v <= 0.001) return null;
  const m = METRICS[a.n];
  const ys = layout(a);
  const top = ys[0] - m.cardH / 2 - 6;
  const bottom = ys[ys.length - 1];
  const py = playheadY(f, a, ys, top);
  return (
    <AbsoluteFill style={{ opacity: v }}>
      <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
        <Defs blur={9} />
        <line x1={SPINE} y1={top} x2={SPINE} y2={bottom} stroke={C.muted} strokeWidth={2} opacity={0.22} />
        <line x1={SPINE} y1={top} x2={SPINE} y2={py} stroke="#FFFFFF" strokeWidth={2} opacity={0.75} />
        <line x1={SPINE} y1={Math.max(top, py - 90)} x2={SPINE} y2={py} stroke="#7FA2FF" strokeWidth={8} opacity={0.5} filter="url(#rblurS)" />
        {a.rows.map((r, k) => {
          const on = rowIn(f, r);
          const col = ROLES[lastLitChip(f, r).role].color;
          return (
            <line key={k} x1={SPINE + 12} y1={ys[k]} x2={SPINE + 12 + (CARD_X - SPINE - 12) * on} y2={ys[k]} stroke={col} strokeWidth={2} opacity={0.7 * on} />
          );
        })}
        {a.rows.map((r, k) => (
          <Nodo key={k} x={SPINE} y={ys[k]} size={16} color={ROLES[lastLitChip(f, r).role].color} on={lit(f, r.chips[0])} fl={rowFlare(f, r)} />
        ))}
        <rect x={SPINE - 5} y={py - 5} width={10} height={10} fill="#FFFFFF" opacity={py > top + 1 && py < bottom - 1 ? 0.95 : 0} transform={`rotate(45 ${SPINE} ${py})`} />
      </svg>
      {a.rows.map((r, k) => {
        const skel = prog(f, a.start + 3 + k * 2, 14);
        const on = rowIn(f, r);
        const fl = rowFlare(f, r);
        const roles = rowRoles(r);
        const col = ROLES[lastLitChip(f, r).role].color;
        return (
          <React.Fragment key={k}>
            <div
              style={{
                position: 'absolute',
                left: PAD,
                top: ys[k] - m.cardH / 2,
                width: SPINE - 40 - PAD,
                height: m.cardH,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                opacity: skel,
              }}
            >
              <Horas f={f} row={r} size={m.hour} align="right" />
            </div>
            <div
              style={{
                position: 'absolute',
                left: CARD_X,
                top: ys[k] - m.cardH / 2,
                width: CARD_W,
                height: m.cardH,
                borderRadius: 20,
                boxSizing: 'border-box',
                padding: '0 32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 24,
                opacity: on,
                translate: `${lerp(18, 0, on)}px 0px`,
                ...cristal(col, on, fl),
              }}
            >
              <div style={{ fontFamily: FONT.text, fontSize: m.text, fontWeight: 500, color: C.white, lineHeight: 1.22, letterSpacing: '-0.005em' }}>
                {r.text.map((t, i) => (
                  <div key={i} style={{ whiteSpace: 'nowrap' }}>
                    {t}
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-start', flexShrink: 0 }}>
                {roles.map((role) => (
                  <Rol key={role} role={role} size={30} dot={18} />
                ))}
              </div>
            </div>
          </React.Fragment>
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
        top: 46,
        fontFamily: FONT.mono,
        fontSize: 30,
        fontWeight: 500,
        letterSpacing: '0.14em',
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
      const { cur, prev } = currentChip(f, a);
      // el saliente se apaga del todo (4 f) antes de que entre el siguiente: sin fundido cruzado
      const inP = cur ? prog(f, cur.at + (prev ? 4 : 0), 9) : 0;
      return (
        <React.Fragment key={a.n}>
          <div
            style={{
              position: 'absolute',
              left: PAD,
              top: 92,
              opacity: v,
              translate: `0px ${lerp(10, 0, prog(f, a.start, 18))}px`,
              fontFamily: FONT.title,
              fontSize: 76,
              lineHeight: 1.2,
              whiteSpace: 'nowrap',
              letterSpacing: '-0.02em',
            }}
          >
            <span style={{ fontWeight: 300, color: C.muted }}>Acto {a.n} · </span>
            <span style={{ fontWeight: 600, color: C.white }}>{a.title}</span>
          </div>
          {/* contador: hora del hito vigente */}
          <div style={{ position: 'absolute', right: W - 1672, top: 76, height: 80, opacity: v }}>
            {prev ? (
              <div style={{ ...readout, color: ROLES[prev.role].color, opacity: 1 - prog(f, cur!.at, 4, easeInOut) }}>{prev.read ?? prev.t}</div>
            ) : null}
            {cur ? (
              <div style={{ ...readout, color: ROLES[cur.role].color, opacity: inP, translate: `0px ${lerp(10, 0, inP)}px` }}>{cur.read ?? cur.t}</div>
            ) : null}
          </div>
        </React.Fragment>
      );
    })}
    <Dial f={f} cx={1780} cy={116} r={62} />
  </>
);

const readout: React.CSSProperties = {
  position: 'absolute',
  right: 0,
  top: 0,
  height: 80,
  display: 'flex',
  alignItems: 'center',
  fontFamily: FONT.mono,
  fontSize: 56,
  fontWeight: 500,
  whiteSpace: 'nowrap',
  letterSpacing: '-0.01em',
  wordSpacing: '-0.22em',
};

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
          left: 0,
          right: 0,
          top: 360,
          textAlign: 'center',
          fontFamily: FONT.title,
          fontSize: 66,
          fontWeight: 500,
          color: C.white,
          letterSpacing: '-0.02em',
          translate: `0px ${lerp(14, 0, p1)}px`,
        }}
      >
        {CIERRE_L1}
      </div>
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 480,
          textAlign: 'center',
          fontFamily: FONT.mono,
          fontSize: 58,
          fontWeight: 500,
          color: C.white,
          opacity: p2,
          translate: `0px ${lerp(14, 0, p2)}px`,
        }}
      >
        {CIERRE_L2}
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 690, display: 'flex', justifyContent: 'center', gap: 28 }}>
        {ROLE_ORDER.map((role, i) => {
          const p = prog(f, CIERRE_IN + 10 + i * 3, 14);
          const col = ROLES[role].color;
          return (
            <div
              key={role}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 20,
                padding: '24px 40px',
                borderRadius: 22,
                opacity: p,
                translate: `0px ${lerp(12, 0, p)}px`,
                ...cristal(col, 1, 0),
              }}
            >
              <div style={{ width: 26, height: 26, borderRadius: '50%', background: col, boxShadow: `0 0 26px ${hexA(col, 0.6)}` }} />
              <div style={{ fontFamily: FONT.text, fontSize: 44, fontWeight: 500, color: mix('#FFFFFF', col, 0.12) }}>{ROLES[role].label}</div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

export const Reloj: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ backgroundColor: C.bg }}>
      <Fondo f={f} w={W} h={H} cx={W * 0.5} cy={H * 0.5} />
      <Cabecera f={f} />
      {ACTS.map((a) => (
        <Acto key={a.n} f={f} a={a} />
      ))}
      <Cierre f={f} />
    </AbsoluteFill>
  );
};
