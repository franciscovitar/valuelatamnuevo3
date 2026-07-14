'use client';

import SmoothScrollProvider from './SmoothScrollProvider';
import PageTransitionProvider from './PageTransitionProvider';

export default function AppProviders({ children }) {
  return (
    <SmoothScrollProvider>
      <PageTransitionProvider>{children}</PageTransitionProvider>
    </SmoothScrollProvider>
  );
}
