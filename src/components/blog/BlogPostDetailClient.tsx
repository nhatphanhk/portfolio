'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/lib/i18n/context';
import { BlogContent } from '@/components/blog/BlogContent';
import { BlogOutline } from '@/components/blog/BlogOutline';
import { SeriesNav, type SeriesData } from '@/components/blog/SeriesNav';
import { extractHeadings } from '@/lib/blog-utils';
import { Clock, Sparkles, Loader2, Globe } from 'lucide-react';
import { toast } from 'sonner';
import { formatDate } from '@/lib/utils';

export interface BlogPostData {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  publishedAt: string;
  readTime: number;
  tags: string[];
  seriesId?: string;
  series?: { id: string; title: string; slug: string } | null;
}

export interface DBTranslation {
  locale: string;
  title?: string | null;
  excerpt?: string | null;
  content?: string | null;
}

interface BlogPostDetailClientProps {
  post: BlogPostData;
  seriesData?: SeriesData | null;
  initialTranslations: DBTranslation[];
  isAdmin?: boolean;
}

export function BlogPostDetailClient({ post, seriesData, initialTranslations, isAdmin = false }: BlogPostDetailClientProps) {
  const { locale, t } = useLanguage();
  const [translations, setTranslations] = useState<DBTranslation[]>(initialTranslations);
  const [isTranslating, setIsTranslating] = useState(false);

  // Unique view tracking per visitor session
  useEffect(() => {
    if (typeof window === 'undefined' || !post?.id) return;
    const sessionKey = `viewed_blog_${post.id}`;
    if (sessionStorage.getItem(sessionKey)) return;
    // Mark before the request so a StrictMode double mount cannot send two POSTs
    sessionStorage.setItem(sessionKey, 'true');

    fetch(`/api/blogs/${post.id}/view`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    })
      .then(res => res.json())
      .then(data => {
        if (!data?.ok) sessionStorage.removeItem(sessionKey);
      })
      .catch(err => {
        sessionStorage.removeItem(sessionKey);
        console.warn('View tracking error:', err);
      });
  }, [post?.id]);

  // Posts are authored in Vietnamese; stored translations are English (locale 'en').
  const activeTranslation = useMemo(() => {
    if (locale !== 'en') return null; // Vietnamese readers get the original
    return translations.find(tr => tr.locale === 'en') || null;
  }, [locale, translations]);

  const currentTitle = activeTranslation?.title || post.title;
  const currentExcerpt = activeTranslation?.excerpt || post.excerpt;
  const currentContent = activeTranslation?.content || post.content;

  // Extract headings dynamically for Table of Contents
  const headings = useMemo(() => {
    return extractHeadings(currentContent);
  }, [currentContent]);

  const handleRequestAITranslation = async () => {
    setIsTranslating(true);
    toast.info(t('blog.translating'));

    try {
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          blogId: post.id,
          title: post.title,
          excerpt: post.excerpt,
          content: post.content,
          targetLocale: 'en',
        }),
      });

      const data = await res.json();
      if (data.ok && data.translation) {
        setTranslations(prev => [
          ...prev.filter(t => t.locale !== 'en'),
          {
            locale: 'en',
            title: data.translation.title,
            excerpt: data.translation.excerpt,
            content: data.translation.content,
          },
        ]);
        toast.success(t('blog.translateSuccess'));
      } else {
        toast.error(data.error || 'Translation failed');
      }
    } catch (err) {
      console.error(err);
      toast.error(t('blog.translateFailed'));
    } finally {
      setIsTranslating(false);
    }
  };

  return (
    <div className="flex flex-col xl:flex-row gap-8 xl:gap-10 items-start min-w-0 w-full">
      {/* Article in elevated reading canvas to guarantee visual focus */}
      <article className="reading-canvas flex-1 min-w-0 max-w-4xl p-5 sm:p-8 md:p-12 w-full">
        {/* Article header */}
        <header className="mb-10 min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="flex flex-wrap gap-2">
              {post.tags.map(tag => (
                <Link
                  key={tag}
                  href={`/blog?tag=${encodeURIComponent(tag)}`}
                  className="px-2.5 py-0.5 text-xs bg-primary/10 text-primary rounded-full font-medium hover:bg-primary/20 transition-colors"
                >
                  {tag}
                </Link>
              ))}
            </div>

            {/* AI Translation Status / Trigger Badge */}
            {locale === 'en' && (
              <div>
                {activeTranslation ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-green-500/10 text-green-700 border border-green-500/20">
                    <Globe className="w-3.5 h-3.5" />
                    {t('blog.translatedBadge')}
                  </span>
                ) : isAdmin ? (
                  <button
                    type="button"
                    onClick={handleRequestAITranslation}
                    disabled={isTranslating}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-700 border border-purple-500/30 hover:bg-purple-500/20 transition-all cursor-pointer shadow-2xs"
                  >
                    {isTranslating ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                    )}
                    {isTranslating ? t('blog.translating') : t('blog.aiTranslate')}
                  </button>
                ) : null}
              </div>
            )}
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-foreground mb-3 leading-tight tracking-tight break-words">
            {currentTitle}
          </h1>

          <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
            <time dateTime={post.publishedAt}>
              {formatDate(post.publishedAt, locale, 'long')}
            </time>
            <span>·</span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {post.readTime} {t('common.readingTime')}
            </span>
          </div>

          {currentExcerpt && (
            <p className="mt-6 text-base sm:text-lg text-muted-foreground leading-relaxed italic border-l-4 border-primary/30 pl-4 bg-muted/30 py-3 rounded-r-lg break-words">
              {currentExcerpt}
            </p>
          )}
        </header>

        {/* Mobile Table of Contents */}
        <div className="xl:hidden mb-8">
          <BlogOutline headings={headings} readTime={`${post.readTime} ${t('common.readingTime')}`} />
        </div>

        {/* Article content */}
        <BlogContent html={currentContent} />

        {/* Series Navigation (if in a series) */}
        {seriesData && <SeriesNav seriesData={seriesData} currentBlogId={post.id} />}
      </article>

      {/* Table of contents sidebar (Desktop) */}
      <aside className="hidden xl:block w-72 xl:w-80 shrink-0">
        <div className="sticky top-28">
          <BlogOutline headings={headings} readTime={`${post.readTime} ${t('common.readingTime')}`} />
        </div>
      </aside>
    </div>
  );
}
