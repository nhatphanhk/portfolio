import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Converts any string (including Vietnamese with diacritics / accents)
 * into a clean, URL-safe slug without losing words or letters.
 *
 * Example: "Hướng dẫn lập trình Next.js & Đa ngôn ngữ (i18n) 2026!"
 * -> "huong-dan-lap-trinh-next-js-da-ngon-ngu-i18n-2026"
 */
export function slugify(text: string): string {
  if (!text) return '';
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove all Vietnamese diacritics / tone marks
    .replace(/[đĐ]/g, 'd')           // Convert Vietnamese 'đ' / 'Đ' to 'd'
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')     // Replace non-alphanumeric characters with hyphens
    .replace(/^-+|-+$/g, '')         // Remove leading & trailing hyphens
    .replace(/-+/g, '-');            // Collapse consecutive hyphens
}


/**
 * True for URLs served by Vercel Blob — the only remote host allowed in
 * `images.remotePatterns` (next.config.ts). Anything else must use `<Image unoptimized>`.
 */
export function isVercelBlobUrl(url: string): boolean {
  return /^https:\/\/[^/]+\.public\.blob\.vercel-storage\.com\//i.test(url);
}

export type DateLocale = 'en' | 'vi';

const DATE_PRESETS = {
  /** 14 November 2026 / 14 tháng 11, 2026 */
  long: { year: 'numeric', month: 'long', day: 'numeric' },
  /** Nov 14, 2026 / 14 thg 11, 2026 */
  medium: { year: 'numeric', month: 'short', day: 'numeric' },
  /** 14/11/2026 */
  numeric: { year: 'numeric', month: '2-digit', day: '2-digit' },
  /** Nov 2026 / thg 11 2026 */
  monthYear: { year: 'numeric', month: 'short' },
} as const satisfies Record<string, Intl.DateTimeFormatOptions>;

/**
 * Formats a date for display. Always evaluates in UTC so the server render and the browser
 * render agree (no hydration mismatch, no off-by-one day across timezones), and takes the
 * UI locale instead of a hard-coded BCP-47 tag.
 */
export function formatDate(
  value: Date | string | number | null | undefined,
  locale: DateLocale = 'en',
  preset: keyof typeof DATE_PRESETS | Intl.DateTimeFormatOptions = 'medium'
): string {
  if (value == null || value === '') return '';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const options = typeof preset === 'string' ? DATE_PRESETS[preset] : preset;
  return date.toLocaleDateString(locale === 'vi' ? 'vi-VN' : 'en-US', { timeZone: 'UTC', ...options });
}
