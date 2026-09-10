'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Layers, Search, BookOpen, ArrowRight, Sparkles } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/context';

export interface SeriesListItem {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  coverUrl?: string | null;
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
  const { t } = useLanguage();
  const [search, setSearch] = useState('');

  const filteredSeries = useMemo(() => {
    if (!search.trim()) return seriesList;
    const q = search.toLowerCase().trim();
    return seriesList.filter(
      s =>
        s.title.toLowerCase().includes(q) ||
        (s.description && s.description.toLowerCase().includes(q))
    );
  }, [seriesList, search]);

  return (
    <div className="space-y-10">
      {/* ── Search Bar ── */}
      <div className="relative max-w-xl mx-auto">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <input
          type="text"
          placeholder={t('seriesPage.searchPlaceholder') || 'Search series by title or topic...'}
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-11 pr-4 py-3 text-sm rounded-2xl border border-border/80 bg-background text-foreground placeholder:text-muted-foreground shadow-xs focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
        />
      </div>

      {/* ── Series Grid ── */}
      {filteredSeries.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {filteredSeries.map(series => {
            const firstBlog = series.blogs[0];
            return (
              <div
                key={series.id}
                className="group flex flex-col rounded-3xl border border-border/80 bg-card overflow-hidden shadow-sm hover:shadow-xl hover:border-primary/40 transition-all duration-300 hover:-translate-y-1"
              >
                {/* Series Banner / Cover Image */}
                <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-gradient-to-br from-primary/15 via-muted to-primary/5">
                  {series.coverUrl ? (
                    <Image
                      src={series.coverUrl}
                      alt={series.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20 text-primary group-hover:scale-110 transition-transform duration-300">
                        <Layers className="w-10 h-10" />
                      </div>
                    </div>
                  )}
                  {/* Badge */}
                  <div className="absolute top-4 right-4">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-background/90 text-primary backdrop-blur-md border border-border shadow-xs">
                      <BookOpen className="w-3.5 h-3.5" />
                      {series.blogs.length}{' '}
                      {series.blogs.length === 1 ? t('common.part') : t('common.parts')}
                    </span>
                  </div>
                </div>

                {/* Series Content */}
                <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-1">
                      {series.title}
                    </h2>

                    {series.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed mb-6">
                        {series.description}
                      </p>
                    )}

                    {/* Preview of Parts */}
                    {series.blogs.length > 0 && (
                      <div className="mb-6 p-3.5 rounded-2xl bg-muted/40 border border-border/60">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                          <Sparkles className="w-3 h-3 text-primary" />
                          <span>Curriculum preview</span>
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
                              + {series.blogs.length - 3} more articles
                            </li>
                          )}
                        </ol>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-4 border-t border-border/70 gap-3">
                    <Link
                      href={`/blog/series/${series.slug}`}
                      className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-primary hover:underline"
                    >
                      <span>{t('seriesPage.exploreCurriculum') || 'Explore curriculum'}</span>
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </Link>

                    {firstBlog && (
                      <Link
                        href={`/blog/${firstBlog.slug}`}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-foreground text-background hover:bg-foreground/90 transition-colors shadow-xs"
                      >
                        <span>{t('seriesPage.startSeries') || 'Start Series'}</span>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 rounded-3xl border border-border bg-card p-8 shadow-xs">
          <Layers className="w-12 h-12 mx-auto mb-3 text-muted-foreground/40" />
          <h3 className="text-lg font-bold text-foreground mb-1">
            {t('seriesPage.noSeriesFound') || 'No series found matching your query.'}
          </h3>
          <p className="text-sm text-muted-foreground">
            Try searching for a different topic or keyword.
          </p>
        </div>
      )}
    </div>
  );
}
