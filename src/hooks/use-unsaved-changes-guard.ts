'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Guards unsaved work on the admin editors.
 *
 * - Tab close / reload: native `beforeunload` prompt.
 * - In-app navigation: intercepts clicks on same-origin links (sidebar, breadcrumb, any
 *   `<a>`) in the capture phase and asks for confirmation first.
 * - Programmatic navigation: call `requestNavigation(href)` instead of `router.push`.
 *
 * Browser Back/Forward are client-side transitions in the App Router and cannot be
 * intercepted without history hacks, so they are intentionally not blocked.
 *
 * Render next to the editor:
 * `<UnsavedChangesDialog open={isBlocking} onOpenChange={o => !o && cancel()} onConfirmLeave={confirmLeave} />`
 */
export function useUnsavedChangesGuard(isDirty: boolean) {
  const router = useRouter();
  const [pendingHref, setPendingHref] = useState<string | null>(null);
  const dirtyRef = useRef(isDirty);

  useEffect(() => {
    dirtyRef.current = isDirty;
  }, [isDirty]);

  useEffect(() => {
    if (!isDirty) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [isDirty]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!dirtyRef.current || e.defaultPrevented || e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const anchor = (e.target as Element | null)?.closest?.('a[href]') as HTMLAnchorElement | null;
      if (!anchor || anchor.target === '_blank' || anchor.hasAttribute('download')) return;
      const url = new URL(anchor.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      if (url.pathname === window.location.pathname && url.search === window.location.search) return;
      e.preventDefault();
      e.stopPropagation();
      setPendingHref(url.pathname + url.search + url.hash);
    };
    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, []);

  const requestNavigation = useCallback(
    (href: string) => {
      if (dirtyRef.current) setPendingHref(href);
      else router.push(href);
    },
    [router]
  );

  const confirmLeave = useCallback(() => {
    const href = pendingHref;
    setPendingHref(null);
    if (href) {
      dirtyRef.current = false; // the user approved this navigation; don't prompt again
      router.push(href);
    }
  }, [pendingHref, router]);

  const cancel = useCallback(() => setPendingHref(null), []);

  return { isBlocking: pendingHref !== null, requestNavigation, confirmLeave, cancel };
}
