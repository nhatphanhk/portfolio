import React from 'react';
import { columns } from '@/components/shared/admin/table/project/column';
import { DataTable } from '@/components/shared/admin/table/DataTable';
import { Project } from '@/types/Project';

async function getData(): Promise<Project[]> {
  // TODO: Replace with actual API call
  // Example: const data = await projectApi.getAll();

  // Temporary mock data for development
  return [
    {
      id: '1',
      title: 'Portfolio Website',
      description: 'A modern portfolio website built with Next.js',
      shortDescription: 'Modern portfolio with Next.js',
      slug: 'portfolio-website',
      technologies: ['Next.js', 'TypeScript', 'Tailwind CSS'],
      category: 'web',
      status: 'completed',
      startDate: '2024-01-01',
      featured: true,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-15',
    },
  ];
}

export default async function ProjectAdminPage() {
  const data = await getData();

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Manage Projects</h1>
        <p className="text-muted-foreground mt-2">
          Create, edit, and manage your portfolio projects
        </p>
      </div>
      <DataTable columns={columns} data={data} />
    </div>
  );
}
