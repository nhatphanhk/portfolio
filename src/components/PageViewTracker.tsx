'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Sends one page-view beacon to /api/track per public path change.
 *
 * MainLayout (and so this component) remounts on every page, so the last tracked path lives at
 * module level: it survives client-side navigation and React's dev double-effects. The external
 * referrer is only sent with the first view of a session, because document.referrer does not
 * change on client-side navigation.
 */
let lastTrackedPath: string | null = null;

export function PageViewTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname || pathname === lastTrackedPath) return;
    const isFirstView = lastTrackedPath === null;
    lastTrackedPath = pathname;

    if (navigator.doNotTrack === '1') return;

    const payload = JSON.stringify({
      path: pathname,
      referrer: isFirstView ? document.referrer || null : null,
    });
    const sent =
      typeof navigator.sendBeacon === 'function' &&
      navigator.sendBeacon('/api/track', new Blob([payload], { type: 'application/json' }));
    if (!sent) {
      fetch('/api/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload,
        keepalive: true,
      }).catch(() => {});
    }
  }, [pathname]);

  return null;
}
