'use client';

import { useEffect } from 'react';

export default function HydrationManager() {
  useEffect(() => {
    // This will run after hydration and help prevent mismatches
    document.body.removeAttribute('data-new-gr-c-s-check-loaded');
    document.body.removeAttribute('data-gr-ext-installed');
  }, []);

  return null;
}
