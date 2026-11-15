import { MainLayout } from '@/components';
import { getPublicSkillsByCategory } from '@/lib/actions/skill';
import { UserBreadcrumb } from '@/components/UserBreadcrumb';
import SkillsClient from '@/components/skill/SkillsClient';
import type { Metadata } from 'next';
import { buildOpenGraph } from '@/lib/constants';

import { getServerLocale } from '@/lib/i18n/server';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const isVi = locale === 'vi';
  const title = isVi ? 'Kỹ năng chuyên môn' : 'Skills';
  const description = isVi
    ? 'Tổng quan toàn diện về kỹ năng kỹ thuật, framework, ngôn ngữ và công cụ trong phát triển phần mềm full-stack.'
    : 'Comprehensive overview of technical skills, frameworks, languages, and tools I use in full-stack engineering.';
  return {
    title,
    description,
    openGraph: buildOpenGraph({ title, description, path: '/skills', locale }),
  };
}

export const revalidate = 3600;

export default async function SkillsPage() {
  const skillsByCategory = await getPublicSkillsByCategory();

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 pt-32">
        {/* Breadcrumb aligned with Header */}
        <UserBreadcrumb items={[{ label: 'Skills' }]} className="mb-6" />

        <SkillsClient skillsByCategory={skillsByCategory} />
      </div>
    </MainLayout>
  );
}

