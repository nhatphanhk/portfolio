'use client';

import { useEffect, useState } from 'react';
import type { Heading } from '@/lib/blog-utils';

interface BlogOutlineProps {
  headings: Heading[];
}

export function BlogOutline({ headings }: BlogOutlineProps) {
  const [activeId, setActiveId] = useState<string>('');
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: '0px 0px -80% 0px' }
    );

    headings.forEach((heading) => {
      const element = document.getElementById(heading.id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => observer.disconnect();
  }, [headings]);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setActiveId(id);
      setIsExpanded(false);
    }
  };

  if (headings.length === 0) return null;

  return (
    <div className="sticky top-20 text-sm">
      <div className="md:hidden mb-4">
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-muted-foreground font-semibold flex items-center gap-2"
        >
          Table of Contents
          <span className="text-xs">{isExpanded ? '▼' : '▶'}</span>
        </button>
      </div>

      <nav className={`${isExpanded ? 'block' : 'hidden'} md:block border-l-2 border-border pl-4 space-y-2`}>
        <p className="font-semibold mb-4 hidden md:block">Table of Contents</p>
        <ul className="space-y-2">
          {headings.map((heading) => {
            const isActive = activeId === heading.id;
            return (
              <li 
                key={heading.id}
                style={{ marginLeft: `${(heading.level - 2) * 1}rem` }}
              >
                <a
                  href={`#${heading.id}`}
                  onClick={(e) => handleClick(e, heading.id)}
                  className={`block truncate transition-colors ${
                    isActive 
                      ? 'text-primary font-medium' 
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                  title={heading.text}
                >
                  {heading.text}
                </a>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
