import { cookies, headers } from 'next/headers';
import type { Locale } from './context';

export const COOKIE_NAME = 'NEXT_LOCALE';

/** True when the browser's most-preferred language (highest q) is Vietnamese. */
function prefersVietnamese(acceptLanguage: string | null): boolean {
  if (!acceptLanguage) return false;
  const best = acceptLanguage
    .split(',')
    .map(part => {
      const [tag, ...params] = part.trim().split(';');
      const q = params.find(p => p.trim().startsWith('q='));
      return { tag: tag.trim().toLowerCase(), q: q ? parseFloat(q.split('=')[1]) : 1 };
    })
    .filter(l => l.tag && !Number.isNaN(l.q))
    .sort((a, b) => b.q - a.q)[0];
  return !!best && best.tag.startsWith('vi');
}

/**
 * Resolves the active locale on the server.
 *
 * 1. The NEXT_LOCALE cookie, written by the language toggle (the source of truth).
 * 2. On a first visit without the cookie, the browser's Accept-Language header:
 *    Vietnamese browsers get 'vi'.
 * 3. Otherwise 'en'.
 *
 * Every public page passes the result to its data actions so the server-rendered content,
 * the metadata and the client dictionaries all agree.
 */
export async function getServerLocale(): Promise<Locale> {
  try {
    const cookieStore = await cookies();
    const cookieVal = cookieStore.get(COOKIE_NAME)?.value;
    if (cookieVal === 'vi' || cookieVal === 'en') {
      return cookieVal;
    }
    if (prefersVietnamese((await headers()).get('accept-language'))) {
      return 'vi';
    }
  } catch {
    // cookies()/headers() may throw in a static generation context
  }
  return 'en';
}
