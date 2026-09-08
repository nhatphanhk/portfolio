'use client';

import DOMPurify from 'dompurify';
import { useEffect, useState } from 'react';

import { slugifyHeading, type Heading } from '@/lib/blog-utils';

export type { Heading };

function processHtml(html: string): string {
  if (typeof window === 'undefined') return html;
  
  const cleanHtml = DOMPurify.sanitize(html, {
    ADD_TAGS: ['iframe'],
    ADD_ATTR: ['allow', 'allowfullscreen', 'frameborder', 'scrolling']
  });
  
  const div = document.createElement('div');
  div.innerHTML = cleanHtml;
  
  div.querySelectorAll('h2, h3, h4').forEach((element) => {
    const text = element.textContent || '';
    element.id = slugifyHeading(text);
  });
  
  return div.innerHTML;
}

interface BlogContentProps {
  html: string;
  className?: string;
}

export function BlogContent({ html, className = '' }: BlogContentProps) {
  const [processedHtml, setProcessedHtml] = useState<string>('');

  useEffect(() => {
    setProcessedHtml(processHtml(html));
  }, [html]);

  return (
    <div 
      className={`prose prose-sm sm:prose-base dark:prose-invert max-w-none ${className}`}
      dangerouslySetInnerHTML={{ __html: processedHtml || html }}
    />
  );
}
