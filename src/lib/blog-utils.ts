export interface Heading {
  id: string;
  text: string;
  level: number;
}

export function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

export function extractHeadings(html: string): Heading[] {
  if (!html) return [];

  const regex = /<h([2-4])(?:\s+[^>]*)?>(.*?)<\/h\1>/gi;
  const headings: Heading[] = [];
  let match;

  while ((match = regex.exec(html)) !== null) {
    const level = parseInt(match[1], 10);
    const rawText = match[2].replace(/<[^>]*>/g, '').trim();
    const id = slugifyHeading(rawText);
    if (rawText) {
      headings.push({ id, text: rawText, level });
    }
  }

  return headings;
}
