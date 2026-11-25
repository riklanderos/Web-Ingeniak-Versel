import React from 'react';
import { Composition } from 'remotion';
import { DUR, FPS } from './brand';
import { loadFonts } from './fonts';
import { Sistema } from './Sistema';
import { SistemaMovil } from './SistemaMovil';
import { Reloj } from './comercial/Reloj';
import { RelojMovil } from './comercial/RelojMovil';
import { DUR_RELOJ } from './comercial/data';

loadFonts();

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="Sistema" component={Sistema} durationInFrames={DUR} fps={FPS} width={1920} height={1080} />
    <Composition id="SistemaMovil" component={SistemaMovil} durationInFrames={DUR} fps={FPS} width={1080} height={1350} />
    <Composition id="ComercialReloj" component={Reloj} durationInFrames={DUR_RELOJ} fps={FPS} width={1920} height={1080} />
    <Composition id="ComercialRelojMovil" component={RelojMovil} durationInFrames={DUR_RELOJ} fps={FPS} width={1080} height={1350} />
  </>
);
