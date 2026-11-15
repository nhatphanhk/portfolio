'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowRight, Clock, Layers, Search, FileText } from 'lucide-react';
import { PaginationControl } from '@/components/ui/PaginationControl';
import { useLanguage } from '@/lib/i18n/context';
import { formatDate } from '@/lib/utils';

export type PublicBlog = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  publishedAt: string;
  readTime: number;
  tags: string[];
  thumbnailUrl?: string;
  status: string;
  seriesId?: string;
  seriesOrder?: number;
  series?: { id: string; title: string; slug: string } | null;
};

export type PublicSeries = {
  id: string;
  title: string;
  slug?: string;
  description: string | null;
  blogs: unknown[];
};

const ITEMS_PER_PAGE = 6;

interface BlogListClientProps {
  posts: PublicBlog[];
  seriesList: PublicSeries[];
}

export function BlogListClient({ posts, seriesList }: BlogListClientProps) {
  const { t, locale } = useLanguage();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [search, setSearch] = useState(searchParams.get('q') ?? '');
  const [selectedTag, setSelectedTag] = useState<string>(searchParams.get('tag') ?? 'ALL');
  const [selectedSeriesSlug, setSelectedSeriesSlug] = useState<string | null>(searchParams.get('series'));
  const [currentPage, setCurrentPage] = useState(Math.max(1, Number(searchParams.get('page')) || 1));

  // Mirror the filters into the URL so Back/Forward and shared links keep them (replace, no scroll)
  useEffect(() => {
    const params = new URLSearchParams();
    if (search.trim()) params.set('q', search.trim());
    if (selectedTag !== 'ALL') params.set('tag', selectedTag);
    if (selectedSeriesSlug) params.set('series', selectedSeriesSlug);
    if (currentPage > 1) params.set('page', String(currentPage));
    const next = params.toString();
    if (next !== searchParams.toString()) {
      router.replace(next ? `?${next}` : window.location.pathname, { scroll: false });
    }
  }, [search, selectedTag, selectedSeriesSlug, currentPage, router, searchParams]);

  // Extract all unique tags
  const allTags = useMemo(() => {
    const set = new Set<string>();
    posts.forEach(p => p.tags.forEach(t => set.add(t)));
    return Array.from(set).sort();
  }, [posts]);

  // Filter posts
  const filteredPosts = useMemo(() => {
    return posts.filter(post => {
      // Series filter
      if (selectedSeriesSlug) {
        const matchesSeries =
          post.series?.slug === selectedSeriesSlug ||
          post.seriesId === selectedSeriesSlug;
        if (!matchesSeries) return false;
      }

      // Tag filter
      if (selectedTag !== 'ALL' && !post.tags.includes(selectedTag)) {
        return false;
      }

      // Search query
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const matchTitle = post.title.toLowerCase().includes(q);
        const matchSlug = post.slug.toLowerCase().includes(q);
        const matchExcerpt = post.excerpt.toLowerCase().includes(q);
        const matchTags = post.tags.some(t => t.toLowerCase().includes(q));
        if (!matchTitle && !matchSlug && !matchExcerpt && !matchTags) return false;
      }

      return true;
    });
  }, [posts, selectedTag, selectedSeriesSlug, search]);

  const isFiltering =
    search.trim() !== '' || selectedTag !== 'ALL' || selectedSeriesSlug !== null;

  // If not filtering, separate into featured (first) and rest
  // When not filtering, posts[0] is the featured post. It is excluded from the paginated
  // list on EVERY page (not just page 1) so the page count is stable and nothing repeats.
  const featured = !isFiltering && posts.length > 0 ? posts[0] : null;
  const displayPosts = useMemo(
    () => (featured ? filteredPosts.slice(1) : filteredPosts),
    [filteredPosts, featured]
  );

  // Pagination for display posts
  const totalPages = Math.ceil(displayPosts.length / ITEMS_PER_PAGE) || 1;
  const paginatedPosts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return displayPosts.slice(start, start + ITEMS_PER_PAGE);
  }, [displayPosts, currentPage]);

  const handleTagClick = (tag: string) => {
    setSelectedTag(tag);
    setCurrentPage(1);
  };

  const handleSeriesClick = (slugOrId: string | null) => {
    if (selectedSeriesSlug === slugOrId) {
      setSelectedSeriesSlug(null);
    } else {
      setSelectedSeriesSlug(slugOrId);
    }
    setCurrentPage(1);
  };

  const handleSearchChange = (val: string) => {
    setSearch(val);
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setSearch('');
    setSelectedTag('ALL');
    setSelectedSeriesSlug(null);
    setCurrentPage(1);
  };

  const selectedSeriesObject = useMemo(() => {
    if (!selectedSeriesSlug) return null;
    return seriesList.find(s => s.slug === selectedSeriesSlug || s.id === selectedSeriesSlug);
  }, [seriesList, selectedSeriesSlug]);

  return (
    <div className="space-y-12 min-w-0 w-full">
      {/* Search & Series / Tag Filter Bar */}
      <div className="space-y-4 p-4 sm:p-5 rounded-2xl border border-border bg-card shadow-xs min-w-0">
        {/* Search Input */}
        <div className="relative w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" aria-hidden="true" />
          <input
            type="search"
            aria-label={t('common.search')}
            placeholder={t('blog.searchPlaceholder')}
            value={search}
            onChange={e => handleSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground shadow-xs focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
          />
        </div>

        {/* ── 1-Row Series Tag Filter ── */}
        {seriesList.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-3 border-t border-border/60">
            <span className="text-xs font-bold text-primary flex items-center gap-1 mr-1 shrink-0">
              <Layers className="w-3.5 h-3.5" aria-hidden="true" /> {t('blog.series')}:
            </span>
            <button
              type="button"
              aria-pressed={selectedSeriesSlug === null}
              onClick={() => handleSeriesClick(null)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer shrink-0 ${
                selectedSeriesSlug === null
                  ? 'bg-foreground text-background shadow-xs font-semibold'
                  : 'bg-muted/70 hover:bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              {t('common.all')} ({posts.length})
            </button>
            {seriesList.map(s => {
              const count = posts.filter(
                p => p.seriesId === s.id || p.series?.slug === s.slug
              ).length;
              const isSelected = selectedSeriesSlug === (s.slug || s.id);
              return (
                <button
                  key={s.id}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => handleSeriesClick(s.slug || s.id)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer shrink-0 ${
                    isSelected
                      ? 'bg-primary text-primary-foreground shadow-xs font-semibold ring-2 ring-primary/30'
                      : 'bg-muted/70 hover:bg-muted text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {s.title} <span className="opacity-60 text-[10px]">({count})</span>
                </button>
              );
            })}

            {/* Direct Link to Series Directory */}
            <Link
              href="/blog/series"
              className="ml-auto inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline transition-colors pl-2 shrink-0"
            >
              <span>{t('seriesPage.viewAll')}</span>
              <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
            </Link>
          </div>
        )}

        {/* ── Topic Tag Pills ── */}
        {allTags.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-border/40">
            <span className="text-xs font-medium text-muted-foreground mr-1 shrink-0">{t('blog.tags')}:</span>
            <button
              type="button"
              aria-pressed={selectedTag === 'ALL'}
              onClick={() => handleTagClick('ALL')}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer shrink-0 ${
                selectedTag === 'ALL'
                  ? 'bg-foreground text-background shadow-xs font-semibold'
                  : 'bg-muted/70 hover:bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              {t('common.all')} ({posts.length})
            </button>
            {allTags.map(tag => {
              const count = posts.filter(p => p.tags.includes(tag)).length;
              return (
                <button
                  key={tag}
                  type="button"
                  aria-pressed={selectedTag === tag}
                  onClick={() => handleTagClick(tag)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer shrink-0 ${
                    selectedTag === tag
                      ? 'bg-primary text-primary-foreground shadow-xs font-semibold'
                      : 'bg-muted/70 hover:bg-muted text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {tag} <span className="opacity-60 text-[10px]">({count})</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Filter status header */}
      {isFiltering && (
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground px-1">
          <p aria-live="polite">
            {t('blog.foundArticles')} <span className="font-semibold text-foreground">{filteredPosts.length}</span>{' '}
            {filteredPosts.length === 1 ? t('blog.matchingArticle') : t('blog.matchingArticles')}
            {selectedSeriesObject && (
              <span className="ml-1 text-primary font-medium">
                {t('blog.inSeries')} <span className="font-bold">&ldquo;{selectedSeriesObject.title}&rdquo;</span>
              </span>
            )}
            {selectedTag !== 'ALL' && (
              <span className="ml-1 text-primary">
                {t('blog.withTag')} <span className="font-bold">#{selectedTag}</span>
              </span>
            )}
          </p>
          <button
            type="button"
            onClick={handleClearFilters}
            className="text-primary hover:underline font-medium cursor-pointer"
          >
            {t('common.clearFilters')}
          </button>
        </div>
      )}

      {/* Featured Post (Only shown when not searching/filtering & on page 1) */}
      {featured && currentPage === 1 && (
        <div className="mb-12">
          <div className="text-xs font-semibold uppercase tracking-widest text-primary mb-4 flex items-center gap-1.5">
            <span>{t('blog.featuredArticle')}</span>
          </div>
          {/* Stretched title link covers the card; tag chips sit above it as real buttons */}
          <article className="group relative p-6 md:p-8 rounded-2xl border border-border/70 bg-card hover:border-foreground/20 hover:shadow-md transition-all duration-200 focus-within:ring-2 focus-within:ring-ring">
              <div className="relative z-10 flex flex-wrap gap-2 mb-3">
                {featured.tags.map(tag => (
                  <button
                    type="button"
                    key={tag}
                    onClick={() => handleTagClick(tag)}
                    aria-label={`${t('blog.withTag')} #${tag}`}
                    className="px-2.5 py-0.5 text-xs bg-primary/10 text-primary rounded-full hover:bg-primary/20 transition-colors cursor-pointer"
                  >
                    {tag}
                  </button>
                ))}
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
                <Link href={`/blog/${featured.slug}`} className="after:absolute after:inset-0 after:rounded-2xl focus:outline-none">
                  {featured.title}
                </Link>
              </h2>
              {featured.excerpt && (
                <p className="text-muted-foreground mb-6 leading-relaxed text-sm line-clamp-2">
                  {featured.excerpt}
                </p>
              )}
              <div className="flex items-center justify-between text-sm text-muted-foreground pt-4 border-t border-border/60">
                <div className="flex items-center gap-4 text-xs">
                  <span>
                    {formatDate(featured.publishedAt, locale, 'long')}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                    {featured.readTime} {t('common.readingTime')}
                  </span>
                </div>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-foreground group-hover:gap-2 transition-all" aria-hidden="true">
                  {t('common.readMore')} <ArrowRight className="h-4 w-4" />
                </span>
              </div>
          </article>
        </div>
      )}

      {/* All Posts Section */}
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-widest text-primary mb-6">
          {isFiltering ? t('blog.searchResults') : t('blog.recentArticles')}
        </h2>

        {paginatedPosts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center rounded-2xl border border-border bg-card p-8 shadow-xs">
            <FileText className="h-12 w-12 mb-3 text-muted-foreground/40" aria-hidden="true" />
            <h3 className="text-lg font-semibold text-foreground mb-1">{t('blog.noArticlesTitle')}</h3>
            <p className="text-sm text-muted-foreground max-w-sm">{t('blog.noArticlesFound')}</p>
            {isFiltering && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="mt-5 px-4 py-2 text-xs font-medium rounded-xl border border-border bg-muted/60 hover:bg-muted text-foreground transition-colors"
              >
                {t('common.clearFilters')}
              </button>
            )}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {paginatedPosts.map(post => (
                <article key={post.id} className="group relative h-full flex flex-col justify-between p-6 rounded-2xl border border-border/70 bg-card hover:border-foreground/20 hover:shadow-md transition-all duration-200 focus-within:ring-2 focus-within:ring-ring">
                  <div>
                    <div className="relative z-10 flex flex-wrap gap-1.5 mb-2.5">
                      {post.tags.slice(0, 3).map(tag => (
                        <button
                          type="button"
                          key={tag}
                          onClick={() => handleTagClick(tag)}
                          aria-label={`${t('blog.withTag')} #${tag}`}
                          className="px-2 py-0.5 text-xs bg-muted rounded-md text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                    <h3 className="font-semibold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">
                      <Link href={`/blog/${post.slug}`} className="after:absolute after:inset-0 after:rounded-2xl focus:outline-none">
                        {post.title}
                      </Link>
                    </h3>
                    {post.excerpt && (
                      <p className="text-xs text-muted-foreground mb-4 line-clamp-2 leading-relaxed">
                        {post.excerpt}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted-foreground pt-4 border-t border-border/60 mt-auto">
                    <span>
                      {formatDate(post.publishedAt, locale)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" aria-hidden="true" />
                      {post.readTime} {t('common.readingTime')}
                    </span>
                  </div>
                </article>
            ))}
          </div>
        )}

        {/* Pagination */}
        {displayPosts.length > 0 && (
          <PaginationControl
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={displayPosts.length}
            pageSize={ITEMS_PER_PAGE}
            onPageChange={setCurrentPage}
            className="pt-8"
          />
        )}
      </div>
    </div>
  );
}
