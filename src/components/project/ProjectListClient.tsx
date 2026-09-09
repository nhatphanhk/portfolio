'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { ArrowRight, ExternalLink, Github, Search, Sparkles, FolderCode, Link as LinkIcon, ChevronDown } from 'lucide-react';
import { PaginationControl } from '@/components/ui/PaginationControl';

export type PublicProject = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  content: string;
  thumbnailUrl?: string;
  demoUrl?: string;
  repoUrl?: string;
  status: string;
  featured: boolean;
  technologies: string[];
  publishedAt: string;
};

const ITEMS_PER_PAGE = 6;

interface ProjectListClientProps {
  projects: PublicProject[];
}

export function ProjectListClient({ projects }: ProjectListClientProps) {
  const [search, setSearch] = useState('');
  const [slugFilter, setSlugFilter] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('ALL');
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Extract all unique technologies
  const allTechnologies = useMemo(() => {
    const set = new Set<string>();
    projects.forEach(p => p.technologies.forEach(t => set.add(t)));
    return Array.from(set).sort();
  }, [projects]);

  // Extract all unique slugs for selection
  const allSlugs = useMemo(() => {
    return Array.from(new Set(projects.map(p => p.slug).filter(Boolean))).sort();
  }, [projects]);

  // Filter projects
  const filteredProjects = useMemo(() => {
    return projects.filter(project => {
      // Featured filter
      if (featuredOnly && !project.featured) return false;

      // Tag filter
      if (selectedTag !== 'ALL' && !project.technologies.includes(selectedTag)) {
        return false;
      }

      // Slug filter (exact match from selectable list)
      if (slugFilter) {
        if (project.slug !== slugFilter) return false;
      }

      // Search query (matches title, slug, description, or technologies)
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const matchTitle = project.title.toLowerCase().includes(q);
        const matchSlug = project.slug.toLowerCase().includes(q);
        const matchDesc = (project.description ?? '').toLowerCase().includes(q);
        const matchTech = project.technologies.some(t => t.toLowerCase().includes(q));
        if (!matchTitle && !matchSlug && !matchDesc && !matchTech) return false;
      }

      return true;
    });
  }, [projects, featuredOnly, selectedTag, slugFilter, search]);

  // Pagination
  const totalPages = Math.ceil(filteredProjects.length / ITEMS_PER_PAGE) || 1;
  const paginatedProjects = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProjects.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredProjects, currentPage]);

  const handleTagClick = (tag: string) => {
    setSelectedTag(tag);
    setCurrentPage(1);
  };

  const handleFeaturedToggle = () => {
    setFeaturedOnly(prev => !prev);
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

  const isFiltering =
    search.trim() !== '' || slugFilter.trim() !== '' || selectedTag !== 'ALL' || featuredOnly;

  return (
    <div className="space-y-10">
      {/* Search & Filter Controls */}
      <div className="space-y-4 p-5 rounded-2xl border border-border bg-card shadow-xs">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Search input (Clean white background, distinctly separated from page background) */}
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              placeholder="Search by project name, description, or technology..."
              value={search}
              onChange={e => handleSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-border bg-white text-foreground placeholder:text-muted-foreground shadow-xs focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
            />
          </div>

          {/* Slug Filter Select Dropdown */}
          <div className="relative w-full sm:w-56">
            <LinkIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
            <select
              id="project-slug-filter"
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

          {/* Featured Toggle Button */}
          <button
            type="button"
            onClick={handleFeaturedToggle}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl border text-xs font-medium transition-all w-full sm:w-auto justify-center ${
              featuredOnly
                ? 'bg-primary/15 border-primary text-primary font-semibold shadow-xs'
                : 'border-border bg-white hover:bg-muted text-muted-foreground hover:text-foreground shadow-xs'
            }`}
          >
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            Featured Only
          </button>
        </div>

        {/* Technology Tag Pills */}
        {allTechnologies.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-border/60">
            <span className="text-xs font-medium text-muted-foreground mr-1">Filter by Tech:</span>
            <button
              type="button"
              onClick={() => handleTagClick('ALL')}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                selectedTag === 'ALL'
                  ? 'bg-foreground text-background shadow-xs font-semibold'
                  : 'bg-muted/70 hover:bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              All ({projects.length})
            </button>
            {allTechnologies.map(tech => {
              const count = projects.filter(p => p.technologies.includes(tech)).length;
              return (
                <button
                  key={tech}
                  type="button"
                  onClick={() => handleTagClick(tech)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                    selectedTag === tech
                      ? 'bg-primary text-primary-foreground shadow-xs font-semibold'
                      : 'bg-muted/70 hover:bg-muted text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {tech} <span className="opacity-60 text-[10px]">({count})</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Filter status / Reset hint */}
      {isFiltering && (
        <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
          <p>
            Found <span className="font-semibold text-foreground">{filteredProjects.length}</span> matching{' '}
            {filteredProjects.length === 1 ? 'project' : 'projects'}
            {slugFilter && (
              <span className="ml-1 text-primary">
                (slug: <span className="font-mono">{slugFilter}</span>)
              </span>
            )}
          </p>
          <button
            type="button"
            onClick={() => {
              setSearch('');
              setSlugFilter('');
              setSelectedTag('ALL');
              setFeaturedOnly(false);
              setCurrentPage(1);
            }}
            className="text-primary hover:underline font-medium"
          >
            Clear all filters
          </button>
        </div>
      )}

      {/* Projects Grid */}
      {paginatedProjects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center rounded-2xl border border-border bg-card p-8 shadow-xs">
          <FolderCode className="h-12 w-12 mb-3 text-muted-foreground/40" />
          <h3 className="text-lg font-semibold text-foreground mb-1">No projects found</h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            We couldn&apos;t find any projects matching your current search or filter criteria.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearch('');
              setSlugFilter('');
              setSelectedTag('ALL');
              setFeaturedOnly(false);
              setCurrentPage(1);
            }}
            className="mt-5 px-4 py-2 text-xs font-medium rounded-xl border border-border bg-muted/60 hover:bg-muted text-foreground transition-colors"
          >
            Reset filters
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {paginatedProjects.map(project => (
            <article
              key={project.id}
              className="group flex flex-col justify-between p-7 rounded-2xl border border-border bg-card hover:border-foreground/20 hover:shadow-md transition-all duration-200"
            >
              <div>
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Link
                      href={`/project/${project.slug}`}
                      className="text-xl font-semibold text-foreground hover:text-primary transition-colors line-clamp-1"
                    >
                      {project.title}
                    </Link>
                    {project.featured && (
                      <span className="px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider rounded-full bg-primary/10 text-primary border border-primary/20">
                        ★ Featured
                      </span>
                    )}
                  </div>

                  {/* External links */}
                  <div className="flex items-center gap-1 shrink-0">
                    {project.repoUrl && (
                      <a
                        href={project.repoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="GitHub repository"
                        className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted"
                      >
                        <Github className="h-4 w-4" />
                      </a>
                    )}
                    {project.demoUrl && (
                      <a
                        href={project.demoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Live demo"
                        className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                </div>

                {project.description && (
                  <p className="text-muted-foreground mb-6 leading-relaxed text-xs line-clamp-2">
                    {project.description}
                  </p>
                )}
              </div>

              <div>
                {/* Tech tags */}
                <div className="flex flex-wrap gap-1.5 mb-6">
                  {project.technologies.map(tech => (
                    <span
                      key={tech}
                      onClick={() => handleTagClick(tech)}
                      className={`px-2.5 py-1 text-xs rounded-md cursor-pointer transition-colors ${
                        selectedTag === tech
                          ? 'bg-primary text-primary-foreground font-medium'
                          : 'bg-muted text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {tech}
                    </span>
                  ))}
                </div>

                {/* Footer link */}
                <div className="pt-4 border-t border-border/60 flex items-center justify-end">
                  <Link
                    href={`/project/${project.slug}`}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-foreground hover:text-primary hover:gap-2.5 transition-all duration-200"
                  >
                    View project details <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Pagination */}
      {filteredProjects.length > 0 && (
        <PaginationControl
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredProjects.length}
          pageSize={ITEMS_PER_PAGE}
          onPageChange={setCurrentPage}
          className="pt-6"
        />
      )}
    </div>
  );
}
