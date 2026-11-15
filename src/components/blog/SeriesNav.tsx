'use client';

import Link from 'next/link';
import { Layers, ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/context';

export interface SeriesPostItem {
  id: string;
  title: string;
  slug: string;
  seriesOrder?: number | null;
  publishedAt?: Date | string | null;
}

export interface SeriesData {
  seriesTitle: string;
  seriesSlug: string;
  currentBlogId: string;
  currentIndex: number;
  totalParts: number;
  posts: SeriesPostItem[];
}

interface SeriesNavProps {
  seriesData: SeriesData | null;
  currentBlogId: string;
}

export function SeriesNav({ seriesData, currentBlogId }: SeriesNavProps) {
  const { t } = useLanguage();
  if (!seriesData || seriesData.totalParts <= 1) return null;

  const { seriesTitle, seriesSlug, currentIndex, totalParts, posts } = seriesData;
  const prevPost = currentIndex > 0 ? posts[currentIndex - 1] : null;
  const nextPost = currentIndex < totalParts - 1 ? posts[currentIndex + 1] : null;

  return (
    <nav aria-label={t('blog.series')} className="my-10 rounded-2xl border border-primary/20 bg-primary/5 p-5 sm:p-6">
      {/* Series Header */}
      <div className="flex items-center gap-2 text-primary text-xs font-bold uppercase tracking-wider mb-2">
        <Layers className="w-4 h-4" aria-hidden="true" />
        <span>{t('blog.series')}</span>
      </div>

      <h3 className="text-lg font-bold text-foreground mb-1">
        <Link href={`/blog/series/${seriesSlug}`} className="hover:text-primary transition-colors">
          {seriesTitle}
        </Link>
      </h3>
      <p className="text-xs text-muted-foreground mb-4">
        {t('seriesPage.part')} {currentIndex + 1} {t('seriesPage.of')} {totalParts} {t('blog.partOfSeries')}
      </p>

      {/* Series list */}
      <ol className="space-y-1.5 mb-6 text-sm">
        {posts.map((post, idx) => {
          const isCurrent = post.id === currentBlogId;
          return (
            <li key={post.id} className="flex items-center gap-2.5" aria-current={isCurrent ? 'page' : undefined}>
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 ${
                  isCurrent
                    ? 'bg-primary text-primary-foreground font-bold'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {idx + 1}
              </span>
              {isCurrent ? (
                <span className="font-semibold text-foreground flex items-center gap-1.5 line-clamp-1">
                  {post.title}
                  <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0 inline" aria-hidden="true" />
                </span>
              ) : (
                <Link
                  href={`/blog/${post.slug}`}
                  className="text-muted-foreground hover:text-foreground hover:underline transition-colors line-clamp-1"
                >
                  {post.title}
                </Link>
              )}
            </li>
          );
        })}
      </ol>

      {/* Prev / Next buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-border/70 gap-4">
        {prevPost ? (
          <Link
            href={`/blog/${prevPost.slug}`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors max-w-[48%]"
          >
            <ArrowLeft className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            <span className="truncate">
              {t('common.prev')}: {prevPost.title}
            </span>
          </Link>
        ) : (
          <span />
        )}

        {nextPost && (
          <Link
            href={`/blog/${nextPost.slug}`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors max-w-[48%] ml-auto text-right"
          >
            <span className="truncate">
              {t('common.next')}: {nextPost.title}
            </span>
            <ArrowRight className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          </Link>
        )}
      </div>
    </nav>
  );
}
