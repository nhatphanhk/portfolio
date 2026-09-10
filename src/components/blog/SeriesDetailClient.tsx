'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Layers,
  BookOpen,
  Clock,
  Calendar,
  ArrowRight,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';
import { useLanguage } from '@/lib/i18n/context';

export interface SeriesDetailPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  seriesOrder: number;
  publishedAt: string;
  readTime: string;
  tags: string[];
  thumbnailUrl?: string;
}

export interface SeriesDetailData {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  coverUrl?: string | null;
  createdAt: string;
  updatedAt: string;
  translations?: {
    en?: {
      title?: string;
      description?: string;
    };
  };
  blogs: SeriesDetailPost[];
}

interface SeriesDetailClientProps {
  series: SeriesDetailData;
}

export function SeriesDetailClient({ series }: SeriesDetailClientProps) {
  const { t, isEn } = useLanguage();

  const title =
    isEn && series.translations?.en?.title
      ? series.translations.en.title
      : series.title;

  const description =
    isEn && series.translations?.en?.description !== undefined
      ? series.translations.en.description
      : series.description;

  // Compute total read time in minutes
  const totalMinutes = series.blogs.reduce((acc, b) => {
    const mins = parseInt(b.readTime.split(' ')[0], 10) || 3;
    return acc + mins;
  }, 0);

  const firstPost = series.blogs[0];

  return (
    <div className="space-y-12">
      {/* ── Series Hero Banner ── */}
      <div className="relative rounded-3xl overflow-hidden border border-border/80 bg-card shadow-lg">
        {/* Cover Background / Image */}
        {series.coverUrl ? (
          <div className="relative h-64 sm:h-80 w-full overflow-hidden">
            <Image
              src={series.coverUrl}
              alt={title}
              fill
              priority
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-card via-card/75 to-transparent" />
          </div>
        ) : (
          <div className="h-28 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent" />
        )}

        {/* Hero Content */}
        <div className="p-6 sm:p-10 -mt-12 relative z-10">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-primary/15 text-primary border border-primary/20">
              <Layers className="w-3.5 h-3.5" />
              {series.blogs.length}{' '}
              {series.blogs.length === 1 ? t('common.part') : t('common.parts')}
            </span>
            <span className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              ~{totalMinutes} {t('common.readingTime')}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-foreground tracking-tight mb-4 leading-tight">
            {title}
          </h1>

          {description && (
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-3xl mb-8">
              {description}
            </p>
          )}

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            {firstPost && (
              <Link
                href={`/blog/${firstPost.slug}`}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold bg-primary text-primary-foreground hover:opacity-90 shadow-md hover:shadow-primary/25 transition-all"
              >
                <span>{t('seriesPage.startSeries') || 'Start Part 1'}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}

            <Link
              href="/blog/series"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-medium border border-border/80 bg-background/60 hover:bg-muted/60 text-foreground transition-colors shadow-xs"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{t('seriesPage.backToSeries') || 'Back to all series'}</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ── Curriculum / Timeline Section ── */}
      <div>
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-border/80">
          <div>
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <span>Curriculum Roadmap</span>
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Follow the ordered roadmap below to get the most out of this series.
            </p>
          </div>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-muted text-foreground">
            {series.blogs.length} articles
          </span>
        </div>

        {series.blogs.length > 0 ? (
          <div className="relative pl-6 sm:pl-10 space-y-8 before:absolute before:left-3 sm:before:left-5 before:top-4 before:bottom-4 before:w-0.5 before:bg-gradient-to-b before:from-primary before:via-border before:to-border">
            {series.blogs.map((blog, index) => {
              const partNumber = index + 1;
              const formattedPart = partNumber < 10 ? `0${partNumber}` : `${partNumber}`;

              return (
                <div key={blog.id} className="relative group">
                  {/* Step Marker */}
                  <div className="absolute -left-6 sm:-left-10 top-5 -translate-x-1/2 flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-card border-2 border-primary text-primary font-bold text-xs shadow-xs group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-200">
                    {formattedPart}
                  </div>

                  {/* Article Card */}
                  <Link href={`/blog/${blog.slug}`} className="block">
                    <article className="p-6 sm:p-7 rounded-2xl border border-border/80 bg-card hover:border-primary/50 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200">
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                        <span className="text-xs font-extrabold uppercase tracking-wider text-primary">
                          Part {partNumber}
                        </span>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {blog.readTime}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {new Date(blog.publishedAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                      </div>

                      <h3 className="text-lg sm:text-xl font-bold text-foreground group-hover:text-primary transition-colors mb-2">
                        {blog.title}
                      </h3>

                      {blog.excerpt && (
                        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed mb-4">
                          {blog.excerpt}
                        </p>
                      )}

                      <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-border/60">
                        <div className="flex flex-wrap gap-1.5">
                          {blog.tags.slice(0, 3).map(tag => (
                            <span
                              key={tag}
                              className="px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-muted text-muted-foreground"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>

                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-primary group-hover:underline">
                          <span>{t('common.readMore') || 'Read article'}</span>
                          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                        </span>
                      </div>
                    </article>
                  </Link>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 rounded-2xl border border-border bg-card p-8 shadow-xs">
            <BookOpen className="w-10 h-10 mx-auto mb-3 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">
              No published articles in this series yet. Check back soon!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
