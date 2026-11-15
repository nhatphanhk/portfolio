import 'server-only';
import DOMPurify from 'isomorphic-dompurify';
import { RICH_CONTENT_ADD_ATTR, RICH_CONTENT_ADD_TAGS, isAllowedIframeSrc } from '@/lib/blog-utils';

// Embeds are only allowed from known hosts (YouTube, Vimeo, CodeSandbox, …).
DOMPurify.addHook('uponSanitizeElement', (node, data) => {
  if (data.tagName === 'iframe') {
    const src = (node as Element).getAttribute?.('src') ?? '';
    if (!isAllowedIframeSrc(src)) node.parentNode?.removeChild(node);
  }
});

/**
 * Sanitizes rich HTML (blog/project bodies, AI translations) **before it is stored**, with the
 * same allow-list the client renderer (`BlogContent`) uses. Server-rendered markup is sent to
 * the browser before client-side DOMPurify runs, so storing clean HTML is what actually
 * prevents stored XSS.
 */
export function sanitizeRichHtml(html: string | null | undefined): string {
  if (!html) return '';
  return DOMPurify.sanitize(html, { ADD_TAGS: RICH_CONTENT_ADD_TAGS, ADD_ATTR: RICH_CONTENT_ADD_ATTR });
}
