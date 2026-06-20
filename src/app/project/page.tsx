import { MainLayout } from '@/components';
import Link from 'next/link';
import { getAllProjects } from '@/data/projects';
import { ArrowRight, ExternalLink, Github } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Projects',
  description:
    'A showcase of my full-stack projects — from web applications to developer tools, built with modern technologies.',
};

export default function ProjectPage() {
  const projects = getAllProjects();
  const featured = projects.filter(p => p.featured);
  const others = projects.filter(p => !p.featured);

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto px-6 py-24 pt-32">
        {/* Header */}
        <div className="mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Projects</h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            A selection of projects I&apos;ve built — spanning full-stack web apps, developer tools,
            and design systems.
          </p>
        </div>

        {/* Featured Projects */}
        {featured.length > 0 && (
          <div className="mb-16">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-primary mb-8">
              Featured
            </h2>
            <div className="space-y-6">
              {featured.map(project => (
                <div
                  key={project.id}
                  className="group p-7 rounded-2xl border border-border bg-card hover:border-foreground/20 hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <Link
                      href={`/project/${project.slug}`}
                      className="text-xl font-semibold text-foreground hover:text-primary transition-colors"
                    >
                      {project.title}
                    </Link>
                    <div className="flex items-center gap-2 shrink-0">
                      {project.repoUrl && (
                        <a
                          href={project.repoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label="GitHub repository"
                          className="p-2 text-muted-foreground hover:text-foreground transition-colors"
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
                          className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                  </div>

                  <p className="text-muted-foreground mb-5 leading-relaxed">
                    {project.description}
                  </p>

                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex flex-wrap gap-2">
                      {project.technologies.map(tech => (
                        <span
                          key={tech}
                          className="px-2.5 py-1 text-xs bg-muted rounded-md text-muted-foreground"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                    <Link
                      href={`/project/${project.slug}`}
                      className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground hover:gap-2.5 transition-all duration-200"
                    >
                      View details <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Other Projects */}
        {others.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-widest text-primary mb-8">
              Other Projects
            </h2>
            <div className="grid md:grid-cols-2 gap-5">
              {others.map(project => (
                <div
                  key={project.id}
                  className="group p-5 rounded-xl border border-border bg-card hover:border-foreground/20 transition-all duration-200"
                >
                  <div className="flex items-start justify-between mb-3">
                    <Link
                      href={`/project/${project.slug}`}
                      className="font-semibold text-foreground hover:text-primary transition-colors"
                    >
                      {project.title}
                    </Link>
                    <div className="flex gap-1">
                      {project.repoUrl && (
                        <a
                          href={project.repoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 text-muted-foreground hover:text-foreground"
                        >
                          <Github className="h-3.5 w-3.5" />
                        </a>
                      )}
                      {project.demoUrl && (
                        <a
                          href={project.demoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 text-muted-foreground hover:text-foreground"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {project.description}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {project.technologies.slice(0, 3).map(tech => (
                      <span
                        key={tech}
                        className="px-2 py-0.5 text-xs bg-muted rounded text-muted-foreground"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
