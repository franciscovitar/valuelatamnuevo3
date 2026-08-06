'use client';

import AmbientFieldRuntime from './AmbientFieldRuntime';
import SmoothScrollProvider from './SmoothScrollProvider';
import PageTransitionProvider from './PageTransitionProvider';

export default function AppProviders({ children }) {
  return (
    <SmoothScrollProvider>
      <PageTransitionProvider>
        <AmbientFieldRuntime />
        {children}
      </PageTransitionProvider>
    </SmoothScrollProvider>
  );
}
