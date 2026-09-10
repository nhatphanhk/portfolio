'use client';

import React from 'react';
import { ExternalLink, Github } from 'lucide-react';
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
    <div className="max-w-4xl">
      {/* Header */}
      <div className="mb-10">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          {project.featured && (
            <span className="px-2.5 py-0.5 text-xs font-medium bg-primary/10 text-primary rounded-full">
              ★ Featured
            </span>
          )}
          <span className="px-2.5 py-0.5 text-xs bg-muted rounded-full text-muted-foreground capitalize">
            {project.status}
          </span>
          <span className="font-mono text-xs text-muted-foreground">
            /project/{project.slug}
          </span>
        </div>

        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4 leading-tight tracking-tight">
          {title}
        </h1>

        {description && (
          <p className="text-lg text-muted-foreground leading-relaxed mb-6">
            {description}
          </p>
        )}

        {/* Actions */}
        <div className="flex flex-wrap gap-3">
          {project.demoUrl && (
            <a
              href={project.demoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-foreground text-background rounded-xl font-medium text-sm hover:bg-foreground/90 transition-colors shadow-xs"
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
              className="inline-flex items-center gap-2 px-5 py-2.5 border border-border bg-card rounded-xl font-medium text-sm hover:bg-muted transition-colors shadow-xs"
            >
              <Github className="h-4 w-4" />
              Source Code
            </a>
          )}
        </div>
      </div>

      {/* Tech stack */}
      {project.technologies.length > 0 && (
        <div className="mb-10 p-6 rounded-2xl border border-border bg-card shadow-xs">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
            {t('project.technologies') || 'Technologies Used'}
          </h2>
          <div className="flex flex-wrap gap-2">
            {project.technologies.map(tech => (
              <span
                key={tech}
                className="px-3 py-1 text-xs bg-muted rounded-lg font-medium text-muted-foreground border border-border/50"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Content / Case Study */}
      {content && (
        <div className="prose prose-neutral dark:prose-invert max-w-none">
          <div dangerouslySetInnerHTML={{ __html: content }} />
        </div>
      )}
    </div>
  );
}
