import { getAllBlogsFromDb } from '@/lib/actions/blog';
import { AdminBlogsClient } from './client';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Blogs — Admin' };

export default async function AdminBlogsPage() {
  const blogs = await getAllBlogsFromDb();

  return <AdminBlogsClient blogs={blogs} />;
}
