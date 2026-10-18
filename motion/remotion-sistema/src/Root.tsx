import React from 'react';
import { Composition } from 'remotion';
import { DUR, FPS } from './brand';
import { loadFonts } from './fonts';
import { Sistema } from './Sistema';
import { SistemaMovil } from './SistemaMovil';

loadFonts();

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="Sistema" component={Sistema} durationInFrames={DUR} fps={FPS} width={1920} height={1080} />
    <Composition id="SistemaMovil" component={SistemaMovil} durationInFrames={DUR} fps={FPS} width={1080} height={1350} />
  </>
);
