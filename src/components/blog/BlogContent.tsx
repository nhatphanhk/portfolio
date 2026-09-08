'use client';

import DOMPurify from 'dompurify';
import { useEffect, useState } from 'react';

export interface Heading {
  id: string;
  text: string;
  level: number;
}

export function extractHeadings(html: string): Heading[] {
  if (!html) return [];

  const regex = /<h([2-4])(?:\s+[^>]*)?>(.*?)<\/h\1>/gi;
  const headings: Heading[] = [];
  let match;

  while ((match = regex.exec(html)) !== null) {
    const level = parseInt(match[1], 10);
    const rawText = match[2].replace(/<[^>]*>/g, '').trim();
    const id = rawText.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    if (rawText) {
      headings.push({ id, text: rawText, level });
    }
  }

  return headings;
}

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
    const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    element.id = id;
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
