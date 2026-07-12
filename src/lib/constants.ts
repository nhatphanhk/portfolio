// src/lib/constants.ts

export const SITE_NAME = 'Nhat Phan — Portfolio';
export const SITE_DESCRIPTION =
  'Personal portfolio of Nhat Phan — Full-Stack Developer. Projects, blog, and contact.';
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

export const NAV_LINKS = [
  { name: 'Resume', href: '/resume' },
  { name: 'Blog', href: '/blog' },
  { name: 'Projects', href: '/project' },
  { name: 'Skills', href: '/skills' },
  { name: 'Certifications', href: '/certifications' },
  { name: 'Contact', href: '/contact' },
] as const;

export const CONTACT_EMAIL = 'nhatphan@example.com';

/** Default OpenGraph image (place in /public/og-image.png) */
export const OG_IMAGE = '/og-image.png';
