'use client';

import { useEffect } from 'react';
import { initAmbientField } from '@/lib/scroll/ambientField';

export default function AmbientFieldRuntime() {
  useEffect(() => {
    const destroy = initAmbientField();
    return destroy;
  }, []);

  return null;
}