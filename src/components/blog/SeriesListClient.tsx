'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { isVercelBlobUrl } from '@/lib/utils';
import { Layers, Search, BookOpen, ArrowRight, Sparkles } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/context';

export interface SeriesListItem {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  coverUrl?: string | null;
  translations?: {
    en?: {
      title?: string;
      description?: string;
    };
  };
  blogs: {
    id: string;
    title: string;
    slug: string;
    seriesOrder: number | null;
  }[];
}

interface SeriesListClientProps {
  seriesList: SeriesListItem[];
}

export function SeriesListClient({ seriesList }: SeriesListClientProps) {
  const { t, isEn } = useLanguage();
  const [search, setSearch] = useState('');

  const filteredSeries = useMemo(() => {
    if (!search.trim()) return seriesList;
    const q = search.toLowerCase().trim();
    return seriesList.filter(s => {
      const transEn = s.translations?.en;
      const matchTitle =
        s.title.toLowerCase().includes(q) ||
        (transEn?.title ? transEn.title.toLowerCase().includes(q) : false);
      const matchDesc =
        (s.description && s.description.toLowerCase().includes(q)) ||
        (transEn?.description ? transEn.description.toLowerCase().includes(q) : false);
      return matchTitle || matchDesc;
    });
  }, [seriesList, search]);

  return (
    <div className="space-y-10">
      {/* ── Search Bar ── */}
      <div className="relative max-w-xl mx-auto">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" aria-hidden="true" />
        <input
          type="search"
          aria-label={t('common.search')}
          placeholder={t('seriesPage.searchPlaceholder')}
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-11 pr-4 py-3 text-sm rounded-2xl border border-border/80 bg-card text-foreground placeholder:text-muted-foreground shadow-xs focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
        />
      </div>

      {/* ── Series Grid ── */}
      {filteredSeries.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {filteredSeries.map(series => {
            const firstBlog = series.blogs[0];
            return (
              // Title link is stretched over the card; "start series" sits above it (z-10)
              <article
                key={series.id}
                className="group relative flex flex-col rounded-2xl border border-border/70 bg-card overflow-hidden shadow-sm hover:shadow-xl hover:border-primary/40 transition-all duration-300 hover:-translate-y-1 focus-within:ring-2 focus-within:ring-ring"
              >
                {/* Series Banner / Cover Image */}
                <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-gradient-to-br from-primary/15 via-muted to-primary/5">
                  {series.coverUrl ? (
                    <Image
                      src={series.coverUrl}
                      unoptimized={!isVercelBlobUrl(series.coverUrl)}
                      alt=""
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20 text-primary group-hover:scale-110 transition-transform duration-300">
                        <Layers className="w-10 h-10" aria-hidden="true" />
                      </div>
                    </div>
                  )}
                  {/* Badge */}
                  <div className="absolute top-4 right-4">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-background/90 text-primary backdrop-blur-md border border-border shadow-xs">
                      <BookOpen className="w-3.5 h-3.5" aria-hidden="true" />
                      {series.blogs.length}{' '}
                      {series.blogs.length === 1 ? t('common.part') : t('common.parts')}
                    </span>
                  </div>
                </div>

                {/* Series Content */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    {(() => {
                      const seriesTitle =
                        isEn && series.translations?.en?.title
                          ? series.translations.en.title
                          : series.title;
                      const seriesDesc =
                        isEn && series.translations?.en?.description !== undefined
                          ? series.translations.en.description
                          : series.description;
                      return (
                        <>
                          <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-1">
                            <Link
                              href={`/blog/series/${series.slug}`}
                              className="after:absolute after:inset-0 after:rounded-2xl focus:outline-none"
                            >
                              {seriesTitle}
                            </Link>
                          </h2>

                          {seriesDesc && (
                            <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed mb-6">
                              {seriesDesc}
                            </p>
                          )}
                        </>
                      );
                    })()}

                    {/* Preview of Parts */}
                    {series.blogs.length > 0 && (
                      <div className="mb-6 p-3.5 rounded-2xl bg-muted/40 border border-border/60">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                          <Sparkles className="w-3 h-3 text-primary" aria-hidden="true" />
                          <span>{t('seriesPage.curriculumPreview')}</span>
                        </p>
                        <ol className="space-y-1.5 text-xs">
                          {series.blogs.slice(0, 3).map((blog, idx) => (
                            <li key={blog.id} className="flex items-center gap-2 text-foreground/80 truncate">
                              <span className="w-4 h-4 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-[10px] shrink-0">
                                {idx + 1}
                              </span>
                              <span className="truncate">{blog.title}</span>
                            </li>
                          ))}
                          {series.blogs.length > 3 && (
                            <li className="text-[11px] text-muted-foreground pl-6 italic">
                              + {series.blogs.length - 3} {t('seriesPage.moreArticles')}
                            </li>
                          )}
                        </ol>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-4 border-t border-border/70 gap-3">
                    <span
                      aria-hidden="true"
                      className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-primary group-hover:underline"
                    >
                      <span>{t('seriesPage.exploreCurriculum')}</span>
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </span>

                    {firstBlog && (
                      <Link
                        href={`/blog/${firstBlog.slug}`}
                        className="relative z-10 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-foreground text-background hover:bg-foreground/90 transition-colors shadow-xs"
                      >
                        <span>{t('seriesPage.startSeries')}</span>
                      </Link>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 rounded-3xl border border-border bg-card p-8 shadow-xs">
          <Layers className="w-12 h-12 mx-auto mb-3 text-muted-foreground/40" aria-hidden="true" />
          <h3 className="text-lg font-bold text-foreground mb-1">
            {t('seriesPage.noSeriesFound')}
          </h3>
          <p className="text-sm text-muted-foreground">{t('seriesPage.tryDifferent')}</p>
        </div>
      )}
    </div>
  );
}
