import { MainLayout } from '@/components';
import { getPublicProjects } from '@/lib/actions/project';
import { ProjectListClient } from '@/components/project/ProjectListClient';
import { UserBreadcrumb } from '@/components/UserBreadcrumb';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Projects',
  description:
    'A showcase of my full-stack projects — from web applications to developer tools, built with modern technologies.',
};

export const revalidate = 300;

export default async function ProjectPage() {
  const projects = await getPublicProjects();

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 pt-32">
        {/* Breadcrumb aligned with Header */}
        <UserBreadcrumb items={[{ label: 'Projects' }]} className="mb-6" />

        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 tracking-tight">Projects</h1>
          <p className="text-lg text-muted-foreground max-w-3xl">
            A selection of projects I&apos;ve built — spanning full-stack web apps, developer tools,
            and design systems.
          </p>
        </div>

        {/* Interactive List with Search, Filter & Pagination */}
        <ProjectListClient projects={projects} />
      </div>
    </MainLayout>
  );
}
