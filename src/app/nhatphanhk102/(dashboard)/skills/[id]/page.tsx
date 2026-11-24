import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getSkillDetailAdmin } from '@/lib/actions/skill';
import { getAllCertificationsFromDb } from '@/lib/actions/certification';
import { AdminSkillDetailClient } from './client';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const skill = await getSkillDetailAdmin(id);
  return { title: skill ? `${skill.name} — Kỹ năng — Admin` : 'Kỹ năng — Admin' };
}

export default async function AdminSkillDetailPage({ params }: Props) {
  const { id } = await params;
  const [skill, certifications] = await Promise.all([getSkillDetailAdmin(id), getAllCertificationsFromDb()]);
  if (!skill) notFound();

  return (
    <AdminSkillDetailClient
      skill={skill}
      certifications={certifications.map(c => ({
        id: c.id,
        name: c.name,
        issuer: c.issuer,
        issueDate: c.issueDate.toISOString(),
        credentialUrl: c.credentialUrl,
      }))}
    />
  );
}
