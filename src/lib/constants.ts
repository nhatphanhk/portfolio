// src/lib/constants.ts
import type { Metadata } from 'next';

export const SITE_NAME = 'nhatphanhk102';
export const SITE_DESCRIPTION =
  'Personal portfolio of nhatphanhk102 — Full-Stack Developer. Projects, blog, and contact.';
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

export const NAV_LINKS = [
  { name: 'Resume', href: '/resume' },
  { name: 'Blogs', href: '/blog' },
  { name: 'Series', href: '/blog/series' },
  { name: 'Projects', href: '/project' },
  { name: 'Skills', href: '/skills' },
  { name: 'Journey', href: '/journey' },
  { name: 'Certifications', href: '/certifications' },
  { name: 'Contact', href: '/contact' },
] as const;

/** Default OpenGraph image — regenerate with `node scripts/generate-og-image.mjs` */
export const OG_IMAGE = '/og-image.png';

type SiteLocale = 'en' | 'vi';

interface BuildOpenGraphOptions {
  title: string;
  description?: string;
  /** Site-relative path starting with '/', e.g. '/blog/my-post'. */
  path?: string;
  locale?: SiteLocale;
  type?: 'website' | 'article';
  /** Absolute or site-relative image URLs. Defaults to OG_IMAGE. */
  images?: string[];
  /** Article-only fields (ignored for type 'website'). */
  publishedTime?: string;
  modifiedTime?: string;
  authors?: string[];
}

/**
 * Builds a complete `openGraph` object for a page's metadata.
 *
 * Next.js merges `openGraph` shallowly: a page that sets `{ title, description }` replaces
 * the root object entirely and silently loses `images`, `siteName` and `url`. Every page
 * therefore builds its openGraph through this helper so the base is always present.
 */
export function buildOpenGraph({
  title,
  description = SITE_DESCRIPTION,
  path = '/',
  locale = 'en',
  type = 'website',
  images,
  publishedTime,
  modifiedTime,
  authors,
}: BuildOpenGraphOptions): NonNullable<Metadata['openGraph']> {
  return {
    title,
    description,
    url: `${SITE_URL}${path}`,
    siteName: SITE_NAME,
    locale: locale === 'vi' ? 'vi_VN' : 'en_US',
    type,
    images: (images && images.length > 0 ? images : [OG_IMAGE]).map(url => ({ url })),
    ...(type === 'article' ? { publishedTime, modifiedTime, authors } : {}),
  };
}

