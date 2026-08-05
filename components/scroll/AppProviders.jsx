'use client';

import SmoothScrollProvider from './SmoothScrollProvider';
import PageTransitionProvider from './PageTransitionProvider';
import AmbientParticleField from '@/components/value-latam/AmbientParticleField';

export default function AppProviders({ children }) {
  return (
    <SmoothScrollProvider>
      <AmbientParticleField />
      <div className="vl-app-content">
        <PageTransitionProvider>{children}</PageTransitionProvider>
      </div>
    </SmoothScrollProvider>
  );
}
