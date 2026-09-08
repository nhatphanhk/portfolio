import { getBlogById } from '@/lib/actions/blog';
import { getAllSeries } from '@/lib/actions/series';
import { notFound } from 'next/navigation';
import { BlogEditorClient } from './BlogEditorClient';
import type { Metadata } from 'next';

interface EditorPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: EditorPageProps): Promise<Metadata> {
  const { id } = await params;
  const blog = await getBlogById(id);
  return {
    title: blog ? `Editing: ${blog.title} — Admin` : 'Blog Editor — Admin',
  };
}

export default async function BlogEditorPage({ params }: EditorPageProps) {
  const { id } = await params;
  const [blog, seriesList] = await Promise.all([getBlogById(id), getAllSeries()]);

  if (!blog) notFound();

  return (
    <BlogEditorClient
      blog={{
        id: blog.id,
        title: blog.title,
        slug: blog.slug,
        content: blog.content,
        excerpt: blog.excerpt ?? '',
        thumbnailUrl: blog.thumbnailUrl ?? '',
        status: blog.status as 'DRAFT' | 'PUBLISHED' | 'ARCHIVED',
        tags: blog.tags.map(t => t.tag.name).join(', '),
        seriesId: blog.seriesId ?? '',
        seriesOrder: blog.seriesOrder ?? 0,
      }}
      seriesList={seriesList.map((s: { id: string; title: string }) => ({ id: s.id, title: s.title }))}
    />
  );
}
