import { slugify } from '@/lib/utils';

export interface Heading {
  id: string;
  text: string;
  level: number;
}

export function slugifyHeading(text: string): string {
  return slugify(text);
}

export function extractHeadings(html: string): Heading[] {
  if (!html) return [];

  // Match <h1> to <h4> across multiple lines and with attributes
  const regex = /<h([1-4])(?:\s+[^>]*)?>([\s\S]*?)<\/h\1>/gi;
  const headings: Heading[] = [];
  const idCounts = new Map<string, number>();
  let match;

  while ((match = regex.exec(html)) !== null) {
    const level = parseInt(match[1], 10);
    const rawText = match[2].replace(/<[^>]*>/g, '').trim();
    if (!rawText) continue;

    let id = slugifyHeading(rawText) || `heading-${headings.length + 1}`;
    const count = idCounts.get(id) || 0;
    idCounts.set(id, count + 1);
    if (count > 0) {
      id = `${id}-${count}`;
    }

    headings.push({ id, text: rawText, level });
  }

  return headings;
}
