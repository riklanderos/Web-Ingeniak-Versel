import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { activation, contentT, hubFlare, inPulse, outPulse } from './brand';
import { P, branch } from './geom';
import { Background, BranchLine, Glass, Hub, Logo, Node, Pulse, StageLabel, SvgDefs, hubAnchor } from './ui';
import { STAGES, VH, VW, logoHeight } from './visuals';

const W = 1080;
const H = 1350;
const HUB: P = { x: 540, y: 168 };
const D = 440;
const SPINE_X = 92;
const ROW_X = 150;
const ROW_W = 890;
const HEAD = 100;
const SCALE = 2.2;
const BODY = VH * SCALE + 28;
const GAP = 14;
const TOP = 292;

export const SistemaMovil: React.FC = () => {
  const f = useCurrentFrame();
  const flare = hubFlare(f);
  const acts = STAGES.map((_, k) => activation(f, k));
  // accordion layout
  const rows: { y: number; h: number }[] = [];
  let y = TOP;
  acts.forEach((e) => {
    const h = HEAD + BODY * e;
    rows.push({ y, h });
    y += h + GAP;
  });
  const a = hubAnchor(HUB, D, 'll');
  const start = { x: a.x - 24, y: a.y };
  const elbow = branch(start, { x: SPINE_X, y: TOP - 20 }, 'h');
  const spineEnd = rows[rows.length - 1].y + HEAD / 2;
  const nodeY = rows.map((r) => r.y + HEAD / 2);
  const pathTo = (k: number): P[] => [...elbow, { x: SPINE_X, y: nodeY[k] }, { x: ROW_X, y: nodeY[k] }];
  return (
    <AbsoluteFill style={{ backgroundColor: '#03040B' }}>
      <Background f={f} w={W} h={H} hub={HUB} />
      <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
        <SvgDefs />
        <BranchLine pts={[...elbow, { x: SPINE_X, y: spineEnd }]} e={0.15} width={2} />
        {nodeY.map((ny, k) => (
          <BranchLine key={k} pts={[{ x: SPINE_X, y: ny }, { x: ROW_X, y: ny }]} e={acts[k]} width={2} />
        ))}
      </svg>
      <Hub center={HUB} D={D} f={f} flare={flare} />
      <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
        <SvgDefs />
        {STAGES.map((_, k) => {
          const o = outPulse(f, k);
          const i = inPulse(f, k);
          const p = pathTo(k);
          return (
            <g key={k}>
              {o !== null ? <Pulse pts={p} p={o} trail={170} width={2.6} /> : null}
              {i !== null ? <Pulse pts={[...p].reverse()} p={i} trail={170} width={2.6} /> : null}
              <Node p={{ x: SPINE_X, y: nodeY[k] }} size={12} glow={acts[k]} />
            </g>
          );
        })}
        <Node p={elbow[0]} size={10} glow={flare * 0.7} />
        <Node p={elbow[1]} size={6} glow={0.2} />
        <Node p={elbow[2]} size={6} glow={0.2} />
      </svg>
      {STAGES.map((s, k) => {
        const e = acts[k];
        const r = rows[k];
        return (
          <Glass key={k} x={ROW_X} y={r.y} w={ROW_W} h={r.h} e={e} f={f} seed={k * 1.9} radius={28}>
            <div style={{ position: 'absolute', left: 36, top: 0, right: 36, height: HEAD, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <StageLabel n={k + 1} text={s.label} size={32} e={e} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 26 }}>
                {s.logos.map((l) => (
                  <Logo key={l} name={l} height={logoHeight(l, 40)} opacity={0.72 + 0.28 * e} />
                ))}
              </div>
            </div>
            {e > 0.002 ? (
              <div
                style={{
                  position: 'absolute',
                  left: (ROW_W - VW * SCALE) / 2,
                  top: HEAD,
                  width: VW,
                  height: VH,
                  transform: `scale(${SCALE})`,
                  transformOrigin: '0 0',
                  opacity: e,
                }}
              >
                <s.V c={contentT(f, k)} e={e} f={f} />
              </div>
            ) : null}
          </Glass>
        );
      })}
    </AbsoluteFill>
  );
};
