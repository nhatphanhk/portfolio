'use client';

import DOMPurify from 'dompurify';
import { useEffect, useState, useRef } from 'react';
import {
  slugifyHeading,
  sanitizeBasicServer,
  isAllowedIframeSrc,
  RICH_CONTENT_ADD_ATTR,
  RICH_CONTENT_ADD_TAGS,
  type Heading,
} from '@/lib/blog-utils';
import { hydrateRichContent } from '@/lib/rich-content';

import 'katex/dist/katex.min.css';

export type { Heading };
export { sanitizeBasicServer };

if (typeof window !== 'undefined') {
  // Embeds are only allowed from known hosts (YouTube, Vimeo, CodeSandbox, …)
  DOMPurify.addHook('uponSanitizeElement', (node, data) => {
    if (data.tagName === 'iframe' && !isAllowedIframeSrc((node as Element).getAttribute('src') || '')) {
      node.parentNode?.removeChild(node);
    }
  });
}

function processHtml(html: string): string {
  if (typeof window === 'undefined') return sanitizeBasicServer(html);

  const cleanHtml = DOMPurify.sanitize(html, {
    ADD_TAGS: RICH_CONTENT_ADD_TAGS,
    ADD_ATTR: RICH_CONTENT_ADD_ATTR,
  });

  const div = document.createElement('div');
  div.innerHTML = cleanHtml;

  const idCounts = new Map<string, number>();

  div.querySelectorAll('h1, h2, h3, h4').forEach((element, index) => {
    const text = element.textContent || '';
    let id = slugifyHeading(text) || `heading-${index + 1}`;
    const count = idCounts.get(id) || 0;
    idCounts.set(id, count + 1);
    if (count > 0) {
      id = `${id}-${count}`;
    }
    element.id = id;
    element.classList.add('scroll-mt-28');
  });

  // Ensure all tables are safely wrapped in a responsive horizontal scroll container
  div.querySelectorAll('table').forEach(table => {
    if (table.parentElement?.classList.contains('overflow-x-auto')) return;
    const wrapper = document.createElement('div');
    wrapper.className = 'overflow-x-auto my-6 max-w-full rounded-xl border border-border';
    table.parentNode?.insertBefore(wrapper, table);
    wrapper.appendChild(table);
  });

  return div.innerHTML;
}

interface BlogContentProps {
  html: string;
  className?: string;
}

export function BlogContent({ html, className = '' }: BlogContentProps) {
  const [processedHtml, setProcessedHtml] = useState<string>('');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setProcessedHtml(processHtml(html));
  }, [html]);

  useEffect(() => {
    if (containerRef.current && processedHtml) {
      // The site is light-only (forcedTheme="light" in the root layout).
      hydrateRichContent(containerRef.current, false);
    }
  }, [processedHtml]);

  return (
    <div
      ref={containerRef}
      className={`prose prose-sm sm:prose-base max-w-none min-w-0 w-full overflow-hidden ${className}`}
      dangerouslySetInnerHTML={{ __html: processedHtml || sanitizeBasicServer(html) }}
    />
  );
}
