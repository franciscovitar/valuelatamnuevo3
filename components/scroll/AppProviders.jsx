'use client';

import SmoothScrollProvider from './SmoothScrollProvider';
import PageTransitionProvider from './PageTransitionProvider';
import AmbientParticleField from '@/components/value-latam/AmbientParticleField';

// Preserved for later visual testing; disabled in this pass.
const SHOW_AMBIENT_PARTICLES = false;

export default function AppProviders({ children }) {
  return (
    <SmoothScrollProvider>
      {SHOW_AMBIENT_PARTICLES && <AmbientParticleField />}
      <div className="vl-app-content">
        <PageTransitionProvider>{children}</PageTransitionProvider>
      </div>
    </SmoothScrollProvider>
  );
}
