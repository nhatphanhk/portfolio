'use client';

import React, { useState, useMemo } from 'react';
import { useLanguage } from '@/lib/i18n/context';
import { BlogContent } from '@/components/blog/BlogContent';
import { BlogOutline } from '@/components/blog/BlogOutline';
import { SeriesNav } from '@/components/blog/SeriesNav';
import { extractHeadings } from '@/lib/blog-utils';
import { Clock, Sparkles, Loader2, Globe } from 'lucide-react';
import { toast } from 'sonner';

export interface BlogPostData {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  publishedAt: string;
  readTime: string;
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
  initialTranslations: DBTranslation[];
}

export function BlogPostDetailClient({ post, initialTranslations }: BlogPostDetailClientProps) {
  const { locale, t } = useLanguage();
  const [translations, setTranslations] = useState<DBTranslation[]>(initialTranslations);
  const [isTranslating, setIsTranslating] = useState(false);

  // Active translation based on user's current locale
  const activeTranslation = useMemo(() => {
    if (locale === 'en') return null; // Default original
    return translations.find(tr => tr.locale === locale) || null;
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
    toast.info(t('blog.translating') || 'Translating with AI and caching in DB...');

    try {
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          blogId: post.id,
          title: post.title,
          excerpt: post.excerpt,
          content: post.content,
          targetLocale: 'vi',
        }),
      });

      const data = await res.json();
      if (data.ok && data.translation) {
        setTranslations(prev => [
          ...prev.filter(t => t.locale !== 'vi'),
          {
            locale: 'vi',
            title: data.translation.title,
            excerpt: data.translation.excerpt,
            content: data.translation.content,
          },
        ]);
        toast.success('Translated & cached in DB ✓');
      } else {
        toast.error(data.error || 'Translation failed');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to translate article.');
    } finally {
      setIsTranslating(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-10">
      <article className="flex-1 min-w-0 max-w-4xl">
        {/* Article header */}
        <header className="mb-10">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="flex flex-wrap gap-2">
              {post.tags.map(tag => (
                <span
                  key={tag}
                  className="px-2.5 py-0.5 text-xs bg-primary/10 text-primary rounded-full font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* AI Translation Status / Trigger Badge */}
            {locale === 'vi' && (
              <div>
                {activeTranslation ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-green-500/10 text-green-700 dark:text-green-400 border border-green-500/20">
                    <Globe className="w-3.5 h-3.5" />
                    Bản dịch tiếng Việt (Lưu sẵn DB)
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleRequestAITranslation}
                    disabled={isTranslating}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/30 hover:bg-purple-500/20 transition-all cursor-pointer shadow-2xs"
                  >
                    {isTranslating ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                    )}
                    {isTranslating ? 'Đang dịch AI...' : 'Dịch sang Tiếng Việt & Lưu DB'}
                  </button>
                )}
              </div>
            )}
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-foreground mb-3 leading-tight tracking-tight">
            {currentTitle}
          </h1>

          <p className="font-mono text-xs text-muted-foreground mb-4">
            Slug: <code className="text-foreground">{post.slug}</code>
          </p>

          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <time dateTime={post.publishedAt}>
              {new Date(post.publishedAt).toLocaleDateString(locale === 'vi' ? 'vi-VN' : 'en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </time>
            <span>·</span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {post.readTime}
            </span>
          </div>

          {currentExcerpt && (
            <p className="mt-6 text-lg text-muted-foreground leading-relaxed italic border-l-4 border-primary/30 pl-4">
              {currentExcerpt}
            </p>
          )}
        </header>

        {/* Mobile Table of Contents */}
        <div className="lg:hidden mb-8">
          <BlogOutline headings={headings} readTime={post.readTime} />
        </div>

        {/* Article content */}
        <BlogContent html={currentContent} />

        {/* Series Navigation (if in a series) */}
        {post.seriesId && <SeriesNav blogId={post.id} />}
      </article>

      {/* Table of contents sidebar (Desktop) */}
      <aside className="hidden lg:block w-80 shrink-0">
        <div className="sticky top-28">
          <BlogOutline headings={headings} readTime={post.readTime} />
        </div>
      </aside>
    </div>
  );
}
