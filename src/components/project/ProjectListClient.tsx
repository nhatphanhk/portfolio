'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { ArrowRight, ExternalLink, Github, Search, FolderCode } from 'lucide-react';
import { PaginationControl } from '@/components/ui/PaginationControl';
import { useLanguage } from '@/lib/i18n/context';

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
  translations?: {
    en?: {
      title?: string;
      description?: string;
      content?: string;
    };
  };
};

const ITEMS_PER_PAGE = 6;

interface ProjectListClientProps {
  projects: PublicProject[];
}

export function ProjectListClient({ projects }: ProjectListClientProps) {
  const { isEn, t } = useLanguage();
  const [search, setSearch] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('ALL');
  const [currentPage, setCurrentPage] = useState(1);

  // Extract all unique technologies
  const allTechnologies = useMemo(() => {
    const set = new Set<string>();
    projects.forEach(p => p.technologies.forEach(t => set.add(t)));
    return Array.from(set).sort();
  }, [projects]);

  // Filter projects
  const filteredProjects = useMemo(() => {
    return projects.filter(project => {
      // Tag filter
      if (selectedTag !== 'ALL' && !project.technologies.includes(selectedTag)) {
        return false;
      }

      // Search query (matches title, slug, description, or technologies, in both VI and EN)
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const transEn = project.translations?.en;
        const matchTitle =
          project.title.toLowerCase().includes(q) ||
          (transEn?.title ? transEn.title.toLowerCase().includes(q) : false);
        const matchSlug = project.slug.toLowerCase().includes(q);
        const matchDesc =
          (project.description ?? '').toLowerCase().includes(q) ||
          (transEn?.description ? transEn.description.toLowerCase().includes(q) : false);
        const matchTech = project.technologies.some(t => t.toLowerCase().includes(q));
        if (!matchTitle && !matchSlug && !matchDesc && !matchTech) return false;
      }

      return true;
    });
  }, [projects, selectedTag, search]);

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

  const handleSearchChange = (val: string) => {
    setSearch(val);
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setSearch('');
    setSelectedTag('ALL');
    setCurrentPage(1);
  };

  const isFiltering = search.trim() !== '' || selectedTag !== 'ALL';

  return (
    <div className="space-y-8">
      {/* Search & Filter Controls */}
      <div className="p-4 rounded-2xl border border-border/70 bg-card shadow-sm space-y-3">
        {/* Search input */}
        <div className="relative w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            placeholder={t('project.searchPlaceholder')}
            value={search}
            onChange={e => handleSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
          />
        </div>

        {/* Technology Tag Pills */}
        {allTechnologies.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-border/50">
            <span className="text-xs font-semibold text-muted-foreground mr-0.5">{t('project.filterByTech')}:</span>
            <button
              type="button"
              onClick={() => handleTagClick('ALL')}
              className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-all ${
                selectedTag === 'ALL'
                  ? 'bg-foreground text-background'
                  : 'bg-muted/70 hover:bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              {t('common.all')} ({projects.length})
            </button>
            {allTechnologies.map(tech => {
              const count = projects.filter(p => p.technologies.includes(tech)).length;
              return (
                <button
                  key={tech}
                  type="button"
                  onClick={() => handleTagClick(tech)}
                  className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-all ${
                    selectedTag === tech
                      ? 'bg-primary text-primary-foreground'
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
            {t('project.foundProjects')} <span className="font-semibold text-foreground">{filteredProjects.length}</span>{' '}
            {filteredProjects.length === 1 ? t('project.matchingProject') : t('project.matchingProjects')}
            {selectedTag !== 'ALL' && (
              <span className="ml-1 text-primary">
                {t('project.withTech')} <span className="font-bold">#{selectedTag}</span>
              </span>
            )}
          </p>
          <button
            type="button"
            onClick={handleClearFilters}
            className="text-primary hover:underline font-semibold cursor-pointer"
          >
            {t('common.clearFilters')}
          </button>
        </div>
      )}

      {/* Projects Grid */}
      {paginatedProjects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center rounded-2xl border border-border bg-card p-8">
          <FolderCode className="h-10 w-10 mb-3 text-muted-foreground/40" />
          <h3 className="text-base font-semibold text-foreground mb-1">{t('project.noProjectsFound')}</h3>
          <p className="text-sm text-muted-foreground max-w-sm mb-4">
            {t('project.noProjectsDesc')}
          </p>
          <button
            type="button"
            onClick={handleClearFilters}
            className="px-4 py-2 text-xs font-semibold rounded-xl border border-border bg-muted/60 hover:bg-muted text-foreground transition-colors cursor-pointer"
          >
            {t('common.clearFilters')}
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-5">
          {paginatedProjects.map(project => {
            const projectTitle =
              isEn && project.translations?.en?.title
                ? project.translations.en.title
                : project.title;
            const projectDesc =
              isEn && project.translations?.en?.description !== undefined
                ? project.translations.en.description
                : project.description;

            return (
              <article
                key={project.id}
                className={`group flex flex-col justify-between p-6 rounded-2xl border bg-card hover:shadow-md transition-all duration-200 ${
                  project.featured
                    ? 'border-primary/30 hover:border-primary/50'
                    : 'border-border/70 hover:border-border'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2.5">
                    <div className="flex items-center gap-2 flex-wrap min-w-0">
                      <Link
                        href={`/project/${project.slug}`}
                        className="text-lg font-bold text-foreground hover:text-primary transition-colors line-clamp-1"
                      >
                        {projectTitle}
                      </Link>
                      {project.featured && (
                        <span className="px-2 py-0.5 text-[10px] font-black uppercase tracking-wider rounded-full bg-primary/10 text-primary border border-primary/20 shrink-0">
                          ★ {t('project.featured')}
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
                          aria-label={t('project.code')}
                          title={t('project.code')}
                          className="p-1.5 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted"
                        >
                          <Github className="h-4 w-4" />
                        </a>
                      )}
                      {project.demoUrl && (
                        <a
                          href={project.demoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={t('project.demo')}
                          title={t('project.demo')}
                          className="p-1.5 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                  </div>

                  {projectDesc && (
                    <p className="text-sm text-muted-foreground mb-4 leading-relaxed line-clamp-2">
                      {projectDesc}
                    </p>
                  )}
                </div>

                <div>
                  {/* Tech tags */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {project.technologies.map(tech => (
                      <span
                        key={tech}
                        onClick={() => handleTagClick(tech)}
                        className={`px-2 py-0.5 text-xs rounded-md cursor-pointer transition-colors font-medium ${
                          selectedTag === tech
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80'
                        }`}
                      >
                        {tech}
                      </span>
                    ))}
                  </div>

                  {/* Footer link */}
                  <div className="pt-3.5 border-t border-border/50 flex items-center justify-end">
                    <Link
                      href={`/project/${project.slug}`}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-primary hover:gap-2.5 transition-all duration-200"
                    >
                      {t('project.viewDetails')} <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
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
          className="pt-4"
        />
      )}
    </div>
  );
}
