import { Suspense } from 'react';
import { MainLayout } from '@/components';
import { getPublicProjects } from '@/lib/actions/project';
import { ProjectListClient } from '@/components/project/ProjectListClient';
import { ProjectHeaderClient } from '@/components/project/ProjectHeaderClient';
import { UserBreadcrumb } from '@/components/UserBreadcrumb';
import { CardGridSkeleton } from '@/components/ui/CardGridSkeleton';
import type { Metadata } from 'next';
import { buildOpenGraph } from '@/lib/constants';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const isVi = locale === 'vi';
  const title = isVi ? 'Dự án' : 'Projects';
  const description = isVi
    ? 'Danh mục các dự án phát triển phần mềm nổi bật, từ ứng dụng web đến công cụ lập trình hiện đại.'
    : 'A showcase of my full-stack projects — from web applications to developer tools, built with modern technologies.';
  return {
    title,
    description,
    openGraph: buildOpenGraph({ title, description, path: '/project', locale }),
  };
}

export const revalidate = 3600;

import { getServerLocale } from '@/lib/i18n/server';

export default async function ProjectPage() {
  const locale = await getServerLocale();
  const projects = await getPublicProjects(locale);

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 pt-32">
        {/* Breadcrumb aligned with Header */}
        <UserBreadcrumb items={[{ label: 'Projects' }]} className="mb-6" />

        {/* Dynamic Header */}
        <ProjectHeaderClient />

        {/* Interactive List with Search, Filter & Pagination */}
        <Suspense fallback={<CardGridSkeleton />}>
          <ProjectListClient projects={projects} />
        </Suspense>
      </div>
    </MainLayout>
  );
}
