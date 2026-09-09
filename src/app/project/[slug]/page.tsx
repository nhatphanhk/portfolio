import { MainLayout } from '@/components';
import { notFound } from 'next/navigation';
import { getPublicProjectBySlug } from '@/lib/actions/project';
import { ExternalLink, Github } from 'lucide-react';
import { UserBreadcrumb } from '@/components/UserBreadcrumb';
import type { Metadata } from 'next';

export const revalidate = 300;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = await getPublicProjectBySlug(slug);

  if (!project) {
    return { title: 'Project Not Found' };
  }

  return {
    title: project.title,
    description: project.description ?? undefined,
    openGraph: {
      title: project.title,
      description: project.description ?? undefined,
      type: 'article',
      images: project.thumbnailUrl ? [{ url: project.thumbnailUrl }] : [],
    },
  };
}

export default async function ProjectDetailPage({ params }: Props) {
  const { slug } = await params;
  const project = await getPublicProjectBySlug(slug);

  if (!project) notFound();

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 pt-32">
        {/* Breadcrumb aligned with Header */}
        <UserBreadcrumb
          items={[
            { label: 'Projects', href: '/project' },
            { label: project.title },
          ]}
          className="mb-8"
        />

        <div className="max-w-4xl">
          {/* Header */}
          <div className="mb-10">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              {project.featured && (
                <span className="px-2.5 py-0.5 text-xs font-medium bg-primary/10 text-primary rounded-full">
                  Featured
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
              {project.title}
            </h1>

            <p className="text-lg text-muted-foreground leading-relaxed mb-6">
              {project.description}
            </p>

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
                Technologies Used
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
          {project.content && (
            <div className="prose prose-neutral dark:prose-invert max-w-none">
              <div dangerouslySetInnerHTML={{ __html: project.content }} />
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
