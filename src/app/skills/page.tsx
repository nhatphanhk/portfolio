import { MainLayout } from '@/components';
import { getPublicSkillsByCategory } from '@/lib/actions/skill';
import { UserBreadcrumb } from '@/components/UserBreadcrumb';
import SkillsClient from '@/components/skill/SkillsClient';
import type { Metadata } from 'next';

import { getServerLocale } from '@/lib/i18n/server';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const isVi = locale === 'vi';
  return {
    title: isVi ? 'Kỹ năng chuyên môn' : 'Skills',
    description: isVi
      ? 'Tổng quan toàn diện về kỹ năng kỹ thuật, framework, ngôn ngữ và công cụ trong phát triển phần mềm full-stack.'
      : 'Comprehensive overview of technical skills, frameworks, languages, and tools I use in full-stack engineering.',
    openGraph: {
      title: isVi ? 'Kỹ năng chuyên môn | nhatphanhk102' : 'Skills | nhatphanhk102',
      description: isVi
        ? 'Tổng quan toàn diện về kỹ năng kỹ thuật, framework, ngôn ngữ và công cụ trong phát triển phần mềm full-stack.'
        : 'Comprehensive overview of technical skills, frameworks, languages, and tools I use in full-stack engineering.',
      locale: isVi ? 'vi_VN' : 'en_US',
    },
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

