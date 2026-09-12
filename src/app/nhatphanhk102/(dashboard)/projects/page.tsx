import { getAllProjectsFromDb } from '@/lib/actions/project';
import { AdminProjectsClient } from './client';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Projects — Admin' };

export default async function AdminProjectsPage() {
  const projects = await getAllProjectsFromDb();
  return <AdminProjectsClient projects={projects} />;
}
