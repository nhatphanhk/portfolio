import { MainLayout } from '@/components';
import { notFound } from 'next/navigation';
import { getPublicProjectBySlug } from '@/lib/actions/project';
import { UserBreadcrumb } from '@/components/UserBreadcrumb';
import { ProjectDetailClient } from '@/components/project/ProjectDetailClient';
import type { Metadata } from 'next';

export const revalidate = 3600;

interface Props {
  params: Promise<{ slug: string }>;
}

import { getServerLocale } from '@/lib/i18n/server';

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const locale = await getServerLocale();
  const project = await getPublicProjectBySlug(slug, locale);

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
  const locale = await getServerLocale();
  const project = await getPublicProjectBySlug(slug, locale);

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

        <ProjectDetailClient project={project} />
      </div>
    </MainLayout>
  );
}
