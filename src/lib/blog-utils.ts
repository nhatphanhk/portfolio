import { slugify } from './utils.ts';

export interface Heading {
  id: string;
  text: string;
  level: number;
}

export function slugifyHeading(text: string): string {
  return slugify(text);
}

/**
 * Basic server-side sanitization to prevent XSS during SSR before DOMPurify runs on client.
 */
/** Extra tags/attributes the rich-content renderer needs on top of DOMPurify's defaults. */
export const RICH_CONTENT_ADD_TAGS = ['iframe', 'table', 'thead', 'tbody', 'tr', 'th', 'td'];
export const RICH_CONTENT_ADD_ATTR = [
  'allow',
  'allowfullscreen',
  'frameborder',
  'scrolling',
  'data-callout',
  'data-type',
  'data-latex',
  'data-math-hydrated',
  'data-mermaid-hydrated',
  'data-code-hydrated',
];

/** Hosts an <iframe> may embed from; anything else is stripped by the sanitizers. */
export const ALLOWED_IFRAME_HOSTS = [
  'www.youtube.com',
  'youtube.com',
  'www.youtube-nocookie.com',
  'player.vimeo.com',
  'codesandbox.io',
  'codepen.io',
  'stackblitz.com',
  'www.figma.com',
  'embed.figma.com',
  'gist.github.com',
  'docs.google.com',
  'www.google.com',
];

export function isAllowedIframeSrc(src: string): boolean {
  try {
    const url = new URL(src);
    return url.protocol === 'https:' && ALLOWED_IFRAME_HOSTS.includes(url.hostname.toLowerCase());
  } catch {
    return false;
  }
}

/**
 * Server-side fallback used only until the client sanitizer (DOMPurify) has run. Content is
 * also sanitized at save time (lib/sanitize-html.ts); this is defense in depth for older rows.
 * It strips active elements, event handlers and script-bearing URLs (including entity-encoded
 * and whitespace-padded forms).
 */
export function sanitizeBasicServer(html: string): string {
  const decode = (value: string): string => {
    try {
      return value
        .replace(/&#x([0-9a-f]+);?/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
        .replace(/&#(\d+);?/g, (_, d) => String.fromCodePoint(parseInt(d, 10)))
        .replace(/&(tab|newline);/gi, '')
        .replace(/[\u0000-\u001f\s]+/g, '')
        .toLowerCase();
    } catch {
      return value.toLowerCase();
    }
  };
  let out = html
    .replace(/<(script|style|object|embed|base|meta|link|form|noscript)\b[\s\S]*?(?:<\/\1\s*>|\/>|>)/gi, '')
    .replace(/<\/(script|style|object|embed|form|noscript)\s*>/gi, '');
  let prev: string;
  do {
    prev = out;
    out = out.replace(/(<[^>]*?)[\s/]+(?:on\w+|srcdoc|formaction)\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '$1');
  } while (out !== prev);
  return out.replace(
    /(href|src|xlink:href|action)\s*=\s*("([^"]*)"|'([^']*)'|([^\s>]+))/gi,
    (match, attr, _quoted, dq, sq, bare) => {
      const decoded = decode(dq ?? sq ?? bare ?? '');
      return /^(javascript|vbscript|data:text\/html|data:image\/svg)/.test(decoded) ? `${attr}="#"` : match;
    }
  );
}

const NAMED_ENTITIES: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };

/** Decodes the entities TipTap emits so heading ids match the DOM's textContent-based ids. */
function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(parseInt(d, 10)))
    .replace(/&([a-z]+);/gi, (m, name) => NAMED_ENTITIES[name.toLowerCase()] ?? m);
}

export function extractHeadings(html: string): Heading[] {
  if (!html) return [];

  // Match <h1> to <h4> across multiple lines and with attributes
  const regex = /<h([1-4])(?:\s+[^>]*)?>([\s\S]*?)<\/h\1>/gi;
  const headings: Heading[] = [];
  const idCounts = new Map<string, number>();
  let match;

  let index = 0;
  while ((match = regex.exec(html)) !== null) {
    const position = index++; // counts every heading, like querySelectorAll does in BlogContent
    const level = parseInt(match[1], 10);
    const rawText = decodeHtmlEntities(match[2].replace(/<[^>]*>/g, '')).trim();
    if (!rawText) continue;

    let id = slugifyHeading(rawText) || `heading-${position + 1}`;
    const count = idCounts.get(id) || 0;
    idCounts.set(id, count + 1);
    if (count > 0) {
      id = `${id}-${count}`;
    }

    headings.push({ id, text: rawText, level });
  }

  return headings;
}

/** Estimated reading time in whole minutes (200 wpm) from HTML content; markup is not counted. */
export function estimateReadMinutes(html: string): number {
  const words = html.replace(/<[^>]*>/g, ' ').trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}
