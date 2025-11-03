import React from 'react';
import { columns } from '@/components/shared/admin/table/blog/column';
import { DataTable } from '@/components/shared/admin/table/DataTable';
import { BlogPost } from '@/types/BlogData';

async function getData(): Promise<BlogPost[]> {
  // TODO: Replace with actual API call
  // Example: const data = await blogApi.getAll();

  // Temporary mock data for development
  return [
    {
      slug: 'getting-started-nextjs',
      title: 'Getting Started with Next.js',
      excerpt: 'Learn how to build modern web applications with Next.js',
      content: 'Full content here...',
      date: '2024-01-15',
      readTime: '5 min read',
      tags: ['Next.js', 'React', 'Web Development'],
    },
  ];
}

export default async function BlogAdminPage() {
  const data = await getData();

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Manage Blog Posts</h1>
        <p className="text-muted-foreground mt-2">
          Create, edit, and manage your blog posts
        </p>
      </div>
      <DataTable columns={columns} data={data} />
    </div>
  );
}
