import { getAllSeries } from '@/lib/actions/series';
import { BlogEditorClient } from '../[id]/BlogEditorClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'New Blog Post — Admin',
};

export default async function NewBlogEditorPage() {
  const seriesList = await getAllSeries();

  return (
    <BlogEditorClient
      blog={{
        id: '',
        title: '',
        slug: '',
        content: '',
        excerpt: '',
        thumbnailUrl: '',
        status: 'DRAFT',
        tags: '',
        seriesId: '',
        seriesOrder: null,
      }}
      seriesList={seriesList.map(s => ({
        id: s.id,
        title: s.title,
        blogs: s.blogs
          ? s.blogs.map(b => ({
              id: b.id,
              title: b.title,
              seriesOrder: b.seriesOrder,
            }))
          : [],
      }))}
    />
  );
}
