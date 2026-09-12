'use client';

import React from 'react';
import { ExternalLink, Github, Calendar, Tag, CheckCircle } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/context';

interface ProjectDetailClientProps {
  project: {
    id: string;
    title: string;
    slug: string;
    description?: string | null;
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
}

export function ProjectDetailClient({ project }: ProjectDetailClientProps) {
  const { isEn, t } = useLanguage();

  const title =
    isEn && project.translations?.en?.title
      ? project.translations.en.title
      : project.title;

  const description =
    isEn && project.translations?.en?.description !== undefined
      ? project.translations.en.description
      : project.description;

  const content =
    isEn && project.translations?.en?.content
      ? project.translations.en.content
      : project.content;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-8 items-start">
      {/* Main Content */}
      <div>
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            {project.featured && (
              <span className="px-2.5 py-0.5 text-xs font-semibold bg-primary/10 text-primary rounded-full border border-primary/20">
                ★ {t('project.featured') || 'Featured'}
              </span>
            )}
            <span className="px-2.5 py-0.5 text-xs bg-muted rounded-full text-muted-foreground capitalize font-medium">
              {project.status}
            </span>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3 leading-tight tracking-tight">
            {title}
          </h1>

          {description && (
            <p className="text-base text-muted-foreground leading-relaxed">
              {description}
            </p>
          )}
        </div>

        {/* Actions — Mobile only */}
        <div className="flex flex-wrap gap-3 mb-8 lg:hidden">
          {project.demoUrl && (
            <a
              href={project.demoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl font-semibold text-sm hover:opacity-90 transition-opacity shadow-sm"
            >
              <ExternalLink className="h-4 w-4" />
              Live Demo
            </a>
          )}
          {project.repoUrl && (
            <a
              href={project.repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 border border-border bg-card rounded-xl font-semibold text-sm hover:bg-muted transition-colors shadow-sm"
            >
              <Github className="h-4 w-4" />
              Source Code
            </a>
          )}
        </div>

        {/* Content / Case Study */}
        {content && (
          <div className="prose prose-neutral dark:prose-invert max-w-none prose-headings:font-bold prose-a:text-primary prose-code:text-primary/80 prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:font-mono prose-code:text-sm prose-pre:bg-muted prose-pre:border prose-pre:border-border">
            <div dangerouslySetInnerHTML={{ __html: content }} />
          </div>
        )}
      </div>

      {/* Sidebar */}
      <aside className="lg:sticky lg:top-24 flex flex-col gap-4">
        {/* CTA buttons — Desktop */}
        <div className="hidden lg:flex flex-col gap-2.5">
          {project.demoUrl && (
            <a
              href={project.demoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl font-semibold text-sm hover:opacity-90 transition-opacity shadow-sm"
            >
              <ExternalLink className="h-4 w-4" />
              Live Demo
            </a>
          )}
          {project.repoUrl && (
            <a
              href={project.repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 border border-border bg-card rounded-xl font-semibold text-sm hover:bg-muted transition-colors shadow-sm"
            >
              <Github className="h-4 w-4" />
              Source Code
            </a>
          )}
        </div>

        {/* Tech Stack */}
        {project.technologies.length > 0 && (
          <div className="p-5 rounded-2xl border border-border/70 bg-card shadow-sm">
            <h2 className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-muted-foreground mb-4">
              <Tag className="w-3.5 h-3.5" />
              {t('project.technologies') || 'Tech Stack'}
            </h2>
            <div className="flex flex-wrap gap-2">
              {project.technologies.map(tech => (
                <span
                  key={tech}
                  className="px-2.5 py-1 text-xs bg-muted rounded-lg font-semibold text-foreground border border-border/60 hover:border-primary/25 hover:bg-primary/5 transition-colors cursor-default"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Project Meta */}
        <div className="p-5 rounded-2xl border border-border/70 bg-card shadow-sm">
          <h2 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-4">
            Details
          </h2>
          <div className="space-y-3">
            <div className="flex items-start gap-2.5 text-sm">
              <Calendar className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
              <div>
                <p className="text-[11px] font-semibold text-muted-foreground/70 uppercase tracking-wider">Published</p>
                <p className="font-medium text-foreground text-xs mt-0.5">
                  {new Date(project.publishedAt).toLocaleDateString(isEn ? 'en-US' : 'vi-VN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2.5 text-sm">
              <CheckCircle className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
              <div>
                <p className="text-[11px] font-semibold text-muted-foreground/70 uppercase tracking-wider">Status</p>
                <p className="font-medium text-foreground capitalize text-xs mt-0.5">{project.status}</p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
