import { MainLayout } from '@/components';
import { getPublicProjects } from '@/lib/actions/project';
import { ProjectListClient } from '@/components/project/ProjectListClient';
import { ProjectHeaderClient } from '@/components/project/ProjectHeaderClient';
import { UserBreadcrumb } from '@/components/UserBreadcrumb';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const isVi = locale === 'vi';
  return {
    title: isVi ? 'Dự án' : 'Projects',
    description: isVi
      ? 'Danh mục các dự án phát triển phần mềm nổi bật, từ ứng dụng web đến công cụ lập trình hiện đại.'
      : 'A showcase of my full-stack projects — from web applications to developer tools, built with modern technologies.',
    openGraph: {
      title: isVi ? 'Dự án | nhatphanhk102' : 'Projects | nhatphanhk102',
      description: isVi
        ? 'Danh mục các dự án phát triển phần mềm nổi bật, từ ứng dụng web đến công cụ lập trình hiện đại.'
        : 'A showcase of my full-stack projects — from web applications to developer tools, built with modern technologies.',
      locale: isVi ? 'vi_VN' : 'en_US',
    },
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
        <ProjectListClient projects={projects} />
      </div>
    </MainLayout>
  );
}
