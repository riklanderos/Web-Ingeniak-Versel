import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { activation, contentT, hubFlare, inPulse, outPulse } from './brand';
import { P, branch, reverse } from './geom';
import { Background, BranchLine, Glass, Hub, Logo, Node, Pulse, StageLabel, SvgDefs, hubAnchor } from './ui';
import { STAGES, VH, VW, logoHeight } from './visuals';

const W = 1920;
const H = 1080;
const OY = 24;
const HUB: P = { x: 960, y: 600 + OY };
const D = 600;
const CW = 420;
const CH = 270;

type Card = { x: number; y: number; conn: P; hubKey: 'll' | 'lu' | 'stemTop' | 'ru' | 'rl'; off: P; orient: 'h' | 'v' };

// Arch path: bottom-left -> top-left -> top-centre -> top-right -> bottom-right
const CARDS: Card[] = [
  { x: 80, y: 690 + OY, conn: { x: 500, y: 750 + OY }, hubKey: 'll', off: { x: -26, y: 0 }, orient: 'h' },
  { x: 80, y: 170 + OY, conn: { x: 500, y: 400 + OY }, hubKey: 'lu', off: { x: -26, y: 0 }, orient: 'h' },
  { x: 750, y: 56 + OY, conn: { x: 930, y: 326 + OY }, hubKey: 'stemTop', off: { x: 0, y: -26 }, orient: 'v' },
  { x: 1420, y: 170 + OY, conn: { x: 1420, y: 400 + OY }, hubKey: 'ru', off: { x: 26, y: 0 }, orient: 'h' },
  { x: 1420, y: 690 + OY, conn: { x: 1420, y: 750 + OY }, hubKey: 'rl', off: { x: 26, y: 0 }, orient: 'h' },
];

export const Sistema: React.FC = () => {
  const f = useCurrentFrame();
  const flare = hubFlare(f);
  const paths = CARDS.map((c) => {
    const a = hubAnchor(HUB, D, c.hubKey);
    const h = { x: a.x + c.off.x, y: a.y + c.off.y };
    return branch(h, c.conn, c.orient);
  });
  const acts = CARDS.map((_, k) => activation(f, k));
  return (
    <AbsoluteFill style={{ backgroundColor: '#03040B' }}>
      <Background f={f} w={W} h={H} hub={HUB} />
      <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
        <SvgDefs />
        {paths.map((p, k) => (
          <BranchLine key={k} pts={p} e={acts[k]} width={1.6} />
        ))}
      </svg>
      <Hub center={HUB} D={D} f={f} flare={flare} />
      <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
        <SvgDefs />
        {paths.map((p, k) => {
          const o = outPulse(f, k);
          const i = inPulse(f, k);
          return (
            <g key={k}>
              {o !== null ? <Pulse pts={p} p={o} trail={120} width={2} /> : null}
              {i !== null ? <Pulse pts={reverse(p)} p={i} trail={120} width={2} /> : null}
              <Node p={p[0]} size={7} glow={Math.max(flare * 0.6, acts[k] * 0.4)} />
              <Node p={p[1]} size={4} glow={acts[k] * 0.3} />
              <Node p={p[2]} size={4} glow={acts[k] * 0.3} />
              <Node p={p[3]} size={8} glow={acts[k]} />
            </g>
          );
        })}
      </svg>
      {CARDS.map((c, k) => {
        const s = STAGES[k];
        const e = acts[k];
        return (
          <Glass key={k} x={c.x} y={c.y} w={CW} h={CH} e={e} f={f} seed={k * 1.9}>
            <div style={{ position: 'absolute', left: 20, top: 20, right: 20, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <StageLabel n={k + 1} text={s.label} size={15} e={e} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                {s.logos.map((l) => (
                  <Logo key={l} name={l} height={logoHeight(l, 20)} opacity={0.7 + 0.3 * e} />
                ))}
              </div>
            </div>
            <div style={{ position: 'absolute', left: 20, top: 68, width: VW, height: VH, opacity: 0.62 + 0.38 * e }}>
              <s.V c={contentT(f, k)} e={e} f={f} />
            </div>
          </Glass>
        );
      })}
    </AbsoluteFill>
  );
};
