'use client';

import { useEffect, useRef } from 'react';

export default function Template({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Trigger enter animation
    el.style.animation = 'none';
    // Force reflow
    void el.offsetHeight;
    el.style.animation = '';
  }, []);

  return (
    <div ref={ref} className="page-enter">
      {children}
    </div>
  );
}
