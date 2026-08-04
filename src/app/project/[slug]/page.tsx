import { notFound } from 'next/navigation';
import { MainLayout } from '@/components';
import { getPublicProjectBySlug, getPublicProjects } from '@/lib/actions/project';
import Link from 'next/link';
import { ArrowLeft, ExternalLink, Github, Calendar } from 'lucide-react';
import type { Metadata } from 'next';

interface ProjectDetailPageProps {
  params: Promise<{ slug: string }>;
}

// Force per-request rendering: with static params, Next.js caches unmatched
// slugs from notFound() with a 200 status instead of 404.
export const dynamic = 'force-dynamic';

export async function generateStaticParams() {
  try {
    const projects = await getPublicProjects();
    return projects.map(p => ({ slug: p.slug }));
  } catch (error) {
    console.error('Error generating static params for projects:', error);
    return [];
  }
}

export async function generateMetadata({ params }: ProjectDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = await getPublicProjectBySlug(slug);

  if (!project) return { title: 'Project Not Found' };

  return {
    title: project.title,
    description: project.description,
    openGraph: {
      title: project.title,
      description: project.description ?? undefined,
      type: 'website',
    },
  };
}

export default async function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const { slug } = await params;
  const project = await getPublicProjectBySlug(slug);

  if (!project) notFound();

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto px-6 py-24 pt-32">
        {/* Back link */}
        <Link
          href="/project"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-10 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          All Projects
        </Link>

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
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4 leading-tight">
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
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-foreground text-background rounded-lg font-medium text-sm hover:bg-foreground/90 transition-colors"
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
                className="inline-flex items-center gap-2 px-5 py-2.5 border border-border rounded-lg font-medium text-sm text-foreground hover:bg-accent transition-colors"
              >
                <Github className="h-4 w-4" />
                View Code
              </a>
            )}
          </div>
        </div>

        <hr className="border-border mb-10" />

        {/* Meta */}
        <div className="grid sm:grid-cols-2 gap-6 mb-10">
          {project.publishedAt && (
            <div className="flex items-center gap-3 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-muted-foreground">Published</p>
                <p className="text-foreground font-medium">
                  {new Date(project.publishedAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>
              </div>
            </div>
          )}
          <div>
            <p className="text-sm text-muted-foreground mb-2">Technologies</p>
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
          </div>
        </div>

        {/* Content */}
        {project.content && (
          <div
            className="prose prose-neutral dark:prose-invert max-w-none
              prose-headings:font-bold prose-headings:tracking-tight
              prose-h2:text-2xl prose-h3:text-xl
              prose-p:text-muted-foreground prose-p:leading-relaxed
              prose-a:text-primary prose-a:no-underline hover:prose-a:underline
              prose-code:text-sm prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
              prose-pre:bg-muted prose-pre:border prose-pre:border-border
              prose-strong:text-foreground
              prose-li:text-muted-foreground"
            dangerouslySetInnerHTML={{ __html: project.content }}
          />
        )}
      </div>
    </MainLayout>
  );
}
