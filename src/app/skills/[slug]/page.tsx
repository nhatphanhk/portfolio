import { MainLayout } from '@/components';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getPublicSkillBySlug } from '@/lib/actions/skill';
import { UserBreadcrumb } from '@/components/UserBreadcrumb';
import SkillDetailClient from '@/components/skill/SkillDetailClient';
import { buildOpenGraph } from '@/lib/constants';
import { getServerLocale } from '@/lib/i18n/server';

export const revalidate = 3600;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const locale = await getServerLocale();
  const skill = await getPublicSkillBySlug(slug);
  if (!skill) return { title: locale === 'vi' ? 'Không tìm thấy kỹ năng' : 'Skill Not Found' };

  const description =
    skill.summary ??
    (skill.capabilities.length > 0
      ? skill.capabilities.slice(0, 3).map(c => c.statement).join(' · ')
      : undefined);
  return {
    title: skill.name,
    description,
    alternates: { canonical: `/skills/${slug}` },
    openGraph: buildOpenGraph({ title: skill.name, description, path: `/skills/${slug}`, locale }),
  };
}

export default async function SkillDetailPage({ params }: Props) {
  const { slug } = await params;
  // notFound() runs before any Suspense boundary so a missing slug is a real HTTP 404 (KNOWN_ISSUES #1)
  const skill = await getPublicSkillBySlug(slug);
  if (!skill) notFound();

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-24 pt-32">
        <UserBreadcrumb items={[{ label: 'Skills', href: '/skills' }, { label: skill.name }]} className="mb-8" />
        <SkillDetailClient skill={skill} />
      </div>
    </MainLayout>
  );
}
