'use client';

import React, { useEffect, useState } from 'react';
import type { Heading } from '@/lib/blog-utils';
import { AlignLeft, ArrowUp, ChevronDown, ChevronUp, Share2, Check } from 'lucide-react';
import { toast } from 'sonner';

interface BlogOutlineProps {
  headings: Heading[];
  readTime?: string;
  className?: string;
}

export function BlogOutline({ headings, readTime, className = '' }: BlogOutlineProps) {
  const [activeId, setActiveId] = useState<string>('');
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [copied, setCopied] = useState(false);

  // Track reading scroll progress
  useEffect(() => {
    const handleScroll = () => {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight > 0) {
        const progress = Math.min(100, Math.max(0, (window.scrollY / docHeight) * 100));
        setScrollProgress(progress);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Track active heading with IntersectionObserver
  useEffect(() => {
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      entries => {
        // Find top-most intersecting entry
        const visibleEntries = entries.filter(e => e.isIntersecting);
        if (visibleEntries.length > 0) {
          setActiveId(visibleEntries[0].target.id);
        }
      },
      {
        rootMargin: '-80px 0px -60% 0px',
        threshold: 0.1,
      }
    );

    headings.forEach(heading => {
      const element = document.getElementById(heading.id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => observer.disconnect();
  }, [headings]);

  const scrollToHeading = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setActiveId(id);
      setIsMobileOpen(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* ── Mobile Collapsible TOC Trigger ── */}
      <div className="lg:hidden">
        <button
          type="button"
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="w-full flex items-center justify-between p-4 rounded-xl border border-border bg-card shadow-xs text-sm font-semibold text-foreground hover:border-primary/40 transition-colors"
        >
          <span className="flex items-center gap-2">
            <AlignLeft className="w-4 h-4 text-primary" />
            Table of Contents
            {headings.length > 0 && (
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold">
                {headings.length}
              </span>
            )}
          </span>
          {isMobileOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {isMobileOpen && (
          <div className="mt-2 p-4 rounded-xl border border-border bg-card shadow-md space-y-2 max-h-80 overflow-y-auto">
            {headings.length > 0 ? (
              <ul className="space-y-1.5 text-xs">
                {headings.map(h => (
                  <li key={h.id}>
                    <button
                      type="button"
                      onClick={e => scrollToHeading(e, h.id)}
                      className={`w-full text-left py-1 px-2 rounded-md transition-colors truncate block ${
                        activeId === h.id
                          ? 'bg-primary/10 text-primary font-bold'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                      style={{ paddingLeft: `${Math.max(0, h.level - 1) * 0.75 + 0.5}rem` }}
                    >
                      {h.text}
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-muted-foreground py-2">No headings in this article.</p>
            )}
          </div>
        )}
      </div>

      {/* ── Desktop Sticky Card ── */}
      <div className="hidden lg:block rounded-2xl border border-border/80 bg-card shadow-sm overflow-hidden backdrop-blur-md">
        {/* Reading Progress Line */}
        <div className="w-full h-1 bg-muted/60">
          <div
            className="h-full bg-primary transition-all duration-150 ease-out"
            style={{ width: `${scrollProgress}%` }}
          />
        </div>

        <div className="p-5">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-border/60">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <AlignLeft className="w-3.5 h-3.5 text-primary" />
              <span>Table of Contents</span>
            </h3>
            {headings.length > 0 && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                {headings.length} sections
              </span>
            )}
          </div>

          {headings.length > 0 ? (
            <nav className="max-h-[calc(100vh-280px)] overflow-y-auto pr-1">
              <ul className="space-y-1 text-xs">
                {headings.map(heading => {
                  const isActive = activeId === heading.id;
                  const indent =
                    heading.level === 1
                      ? 'pl-2'
                      : heading.level === 2
                      ? 'pl-3'
                      : heading.level === 3
                      ? 'pl-5'
                      : 'pl-7';

                  return (
                    <li key={heading.id}>
                      <a
                        href={`#${heading.id}`}
                        onClick={e => scrollToHeading(e, heading.id)}
                        title={heading.text}
                        className={`group flex items-center py-1.5 pr-2 rounded-lg transition-all duration-150 text-left ${indent} ${
                          isActive
                            ? 'bg-primary/10 text-primary font-bold border-l-2 border-primary shadow-2xs'
                            : 'text-muted-foreground hover:text-foreground hover:bg-muted/40 font-medium'
                        }`}
                      >
                        <span className="truncate">{heading.text}</span>
                      </a>
                    </li>
                  );
                })}
              </ul>
            </nav>
          ) : (
            <div className="py-4 text-center">
              <p className="text-xs text-muted-foreground mb-3">
                This article has no subheadings.
              </p>
              {readTime && (
                <p className="text-[11px] text-primary font-semibold">
                  Estimated reading time: {readTime}
                </p>
              )}
            </div>
          )}

          {/* Card Footer Utilities */}
          <div className="mt-5 pt-4 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
            <button
              type="button"
              onClick={scrollToTop}
              className="flex items-center gap-1 hover:text-primary transition-colors cursor-pointer"
            >
              <ArrowUp className="w-3.5 h-3.5" />
              <span>Back to top</span>
            </button>

            <button
              type="button"
              onClick={handleShare}
              className="flex items-center gap-1 hover:text-primary transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Share'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
