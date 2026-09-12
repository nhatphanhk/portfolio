import { cookies } from 'next/headers';
import type { Locale } from './context';

export const COOKIE_NAME = 'NEXT_LOCALE';

/**
 * Reads the active locale on the server side from incoming cookies.
 * Defaults to 'vi' if browser/user preference indicates Vietnamese, or 'en' as default.
 */
export async function getServerLocale(): Promise<Locale> {
  try {
    const cookieStore = await cookies();
    const cookieVal = cookieStore.get(COOKIE_NAME)?.value;
    if (cookieVal === 'vi' || cookieVal === 'en') {
      return cookieVal;
    }
  } catch {
    // cookies() may throw in static generation context
  }
  return 'en';
}
