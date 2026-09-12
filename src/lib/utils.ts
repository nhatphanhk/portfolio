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
