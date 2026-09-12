import { getAllSkillsFromDb } from '@/lib/actions/skill';
import { AdminSkillsClient } from './client';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Skills — Admin' };

export default async function AdminSkillsPage() {
  const skills = await getAllSkillsFromDb();
  return <AdminSkillsClient skills={skills} />;
}
