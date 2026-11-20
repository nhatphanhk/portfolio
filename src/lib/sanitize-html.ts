import 'server-only';
import type { DOMPurify as DOMPurifyInstance } from 'dompurify';
import { RICH_CONTENT_ADD_ATTR, RICH_CONTENT_ADD_TAGS, isAllowedIframeSrc } from '@/lib/blog-utils';

// jsdom is loaded lazily so pages that merely import a server action never evaluate it — only an
// actual save does. It is pinned to jsdom 26 (pure CommonJS deps): jsdom 27+ pulls in ESM-only
// packages via require(), which crashes on runtimes without require(esm) (ERR_REQUIRE_ESM).
let purifierPromise: Promise<DOMPurifyInstance> | null = null;

function getPurifier(): Promise<DOMPurifyInstance> {
  purifierPromise ??= (async () => {
    const [{ JSDOM }, { default: createDOMPurify }] = await Promise.all([import('jsdom'), import('dompurify')]);
    const purifier = createDOMPurify(new JSDOM('').window as unknown as Window & typeof globalThis);

    // Embeds are only allowed from known hosts (YouTube, Vimeo, CodeSandbox, …).
    purifier.addHook('uponSanitizeElement', (node, data) => {
      if (data.tagName === 'iframe') {
        const src = (node as Element).getAttribute?.('src') ?? '';
        if (!isAllowedIframeSrc(src)) node.parentNode?.removeChild(node);
      }
    });
    return purifier;
  })().catch((error) => {
    purifierPromise = null; // allow a retry on the next call
    throw error;
  });
  return purifierPromise;
}

/**
 * Sanitizes rich HTML (blog/project bodies, AI translations) **before it is stored**, with the
 * same allow-list the client renderer (`BlogContent`) uses. Server-rendered markup is sent to
 * the browser before client-side DOMPurify runs, so storing clean HTML is what actually
 * prevents stored XSS.
 */
export async function sanitizeRichHtml(html: string | null | undefined): Promise<string> {
  if (!html) return '';
  const purifier = await getPurifier();
  return purifier.sanitize(html, { ADD_TAGS: RICH_CONTENT_ADD_TAGS, ADD_ATTR: RICH_CONTENT_ADD_ATTR });
}
