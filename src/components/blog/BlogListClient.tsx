'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { ArrowRight, Clock, Layers, Search, BookOpen, FileText, Link as LinkIcon, ChevronDown } from 'lucide-react';
import { PaginationControl } from '@/components/ui/PaginationControl';

export type PublicBlog = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  publishedAt: string;
  readTime: string;
  tags: string[];
  thumbnailUrl?: string;
  status: string;
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
  const [search, setSearch] = useState('');
  const [slugFilter, setSlugFilter] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('ALL');
  const [selectedSeriesId, setSelectedSeriesId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Extract all unique tags
  const allTags = useMemo(() => {
    const set = new Set<string>();
    posts.forEach(p => p.tags.forEach(t => set.add(t)));
    return Array.from(set).sort();
  }, [posts]);

  // Extract all unique slugs for selection
  const allSlugs = useMemo(() => {
    return Array.from(new Set(posts.map(p => p.slug).filter(Boolean))).sort();
  }, [posts]);

  // Filter posts
  const filteredPosts = useMemo(() => {
    return posts.filter(post => {
      // Tag filter
      if (selectedTag !== 'ALL' && !post.tags.includes(selectedTag)) {
        return false;
      }

      // Slug filter (exact match from selectable list)
      if (slugFilter) {
        if (post.slug !== slugFilter) return false;
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
  }, [posts, selectedTag, slugFilter, search]);

  const isFiltering =
    search.trim() !== '' || slugFilter.trim() !== '' || selectedTag !== 'ALL' || selectedSeriesId !== null;

  // If not filtering, separate into featured (first) and rest
  const featured = !isFiltering && currentPage === 1 && posts.length > 0 ? posts[0] : null;
  const displayPosts = useMemo(() => {
    if (featured) {
      return filteredPosts.slice(1);
    }
    return filteredPosts;
  }, [filteredPosts, featured]);

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

  const handleSearchChange = (val: string) => {
    setSearch(val);
    setCurrentPage(1);
  };

  const handleSlugFilterChange = (val: string) => {
    setSlugFilter(val);
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setSearch('');
    setSlugFilter('');
    setSelectedTag('ALL');
    setSelectedSeriesId(null);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-12">
      {/* Series Section (if any) */}
      {seriesList.length > 0 && (
        <div className="p-6 rounded-2xl border border-primary/20 bg-primary/5">
          <h2 className="text-xs font-black uppercase tracking-widest text-primary mb-3 flex items-center gap-1.5">
            <Layers className="w-4 h-4" />
            Article Series
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {seriesList.map(s => (
              <div
                key={s.id}
                className="p-4 rounded-xl border border-border bg-card hover:border-primary/40 transition-colors shadow-xs"
              >
                <h3 className="font-bold text-sm text-foreground mb-1 line-clamp-1">{s.title}</h3>
                {s.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{s.description}</p>
                )}
                <div className="flex items-center justify-between mt-auto">
                  <p className="text-[11px] text-primary font-semibold flex items-center gap-1">
                    <BookOpen className="w-3 h-3" />
                    {s.blogs.length} {s.blogs.length === 1 ? 'part' : 'parts'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search & Tag Filter Bar */}
      <div className="space-y-4 p-5 rounded-2xl border border-border bg-card shadow-xs">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Search Input (clean white background) */}
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              placeholder="Search articles by title, keywords, or tags..."
              value={search}
              onChange={e => handleSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-border bg-white text-foreground placeholder:text-muted-foreground shadow-xs focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
            />
          </div>

          {/* Slug Filter Select Dropdown */}
          <div className="relative w-full sm:w-60">
            <LinkIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
            <select
              id="blog-slug-filter"
              value={slugFilter}
              onChange={e => handleSlugFilterChange(e.target.value)}
              className="w-full pl-9 pr-8 py-2.5 text-xs rounded-xl border border-border bg-white text-foreground shadow-xs focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all font-mono appearance-none cursor-pointer truncate"
            >
              <option value="">All Slugs ({allSlugs.length})</option>
              {allSlugs.map(slug => (
                <option key={slug} value={slug}>
                  /{slug}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
          </div>
        </div>

        {/* Tag Pills */}
        {allTags.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-border/60">
            <span className="text-xs font-medium text-muted-foreground mr-1">Tags:</span>
            <button
              type="button"
              onClick={() => handleTagClick('ALL')}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                selectedTag === 'ALL'
                  ? 'bg-foreground text-background shadow-xs font-semibold'
                  : 'bg-muted/70 hover:bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              All ({posts.length})
            </button>
            {allTags.map(tag => {
              const count = posts.filter(p => p.tags.includes(tag)).length;
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleTagClick(tag)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
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
        <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
          <p>
            Found <span className="font-semibold text-foreground">{filteredPosts.length}</span> matching{' '}
            {filteredPosts.length === 1 ? 'article' : 'articles'}
            {slugFilter && (
              <span className="ml-1 text-primary">
                (slug: <span className="font-mono">{slugFilter}</span>)
              </span>
            )}
          </p>
          <button
            type="button"
            onClick={handleClearFilters}
            className="text-primary hover:underline font-medium"
          >
            Clear all filters
          </button>
        </div>
      )}

      {/* Featured Post (Only shown when not searching/filtering & on page 1) */}
      {featured && (
        <div className="mb-12">
          <div className="text-xs font-semibold uppercase tracking-widest text-primary mb-4 flex items-center gap-1.5">
            <span>Featured Article</span>
          </div>
          <Link href={`/blog/${featured.slug}`} className="group block">
            <article className="p-8 rounded-2xl border border-border bg-card hover:border-foreground/20 hover:shadow-md transition-all duration-200">
              <div className="flex flex-wrap gap-2 mb-3">
                {featured.tags.map(tag => (
                  <span
                    key={tag}
                    onClick={e => {
                      e.preventDefault();
                      handleTagClick(tag);
                    }}
                    className="px-2.5 py-0.5 text-xs bg-primary/10 text-primary rounded-full hover:bg-primary/20 transition-colors"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
                {featured.title}
              </h2>
              {featured.excerpt && (
                <p className="text-muted-foreground mb-6 leading-relaxed text-sm line-clamp-2">
                  {featured.excerpt}
                </p>
              )}
              <div className="flex items-center justify-between text-sm text-muted-foreground pt-4 border-t border-border/60">
                <div className="flex items-center gap-4 text-xs">
                  <span>
                    {new Date(featured.publishedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {featured.readTime}
                  </span>
                </div>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-foreground group-hover:gap-2 transition-all">
                  Read article <ArrowRight className="h-4 w-4" />
                </span>
              </div>
            </article>
          </Link>
        </div>
      )}

      {/* All Posts Section */}
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-widest text-primary mb-6">
          {isFiltering ? 'Search Results' : 'Recent Articles'}
        </h2>

        {paginatedPosts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center rounded-2xl border border-border bg-card p-8 shadow-xs">
            <FileText className="h-12 w-12 mb-3 text-muted-foreground/40" />
            <h3 className="text-lg font-semibold text-foreground mb-1">No articles found</h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              We couldn&apos;t find any articles matching your search or tag selection.
            </p>
            <button
              type="button"
              onClick={handleClearFilters}
              className="mt-5 px-4 py-2 text-xs font-medium rounded-xl border border-border bg-muted/60 hover:bg-muted text-foreground transition-colors"
            >
              Reset filters
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {paginatedPosts.map(post => (
              <Link key={post.id} href={`/blog/${post.slug}`} className="group block">
                <article className="h-full flex flex-col justify-between p-6 rounded-xl border border-border bg-card hover:border-foreground/20 hover:shadow-md transition-all duration-200">
                  <div>
                    <div className="flex flex-wrap gap-1.5 mb-2.5">
                      {post.tags.slice(0, 3).map(tag => (
                        <span
                          key={tag}
                          onClick={e => {
                            e.preventDefault();
                            handleTagClick(tag);
                          }}
                          className="px-2 py-0.5 text-xs bg-muted rounded-md text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <h3 className="font-semibold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">
                      {post.title}
                    </h3>
                    {post.excerpt && (
                      <p className="text-xs text-muted-foreground mb-4 line-clamp-2 leading-relaxed">
                        {post.excerpt}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted-foreground pt-4 border-t border-border/60 mt-auto">
                    <span>
                      {new Date(post.publishedAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {post.readTime}
                    </span>
                  </div>
                </article>
              </Link>
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
