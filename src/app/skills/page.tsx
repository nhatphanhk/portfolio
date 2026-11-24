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
  const title = isVi ? 'Kỹ năng' : 'Skills';
  const description = isVi
    ? 'Kỹ năng trong và ngoài công việc — mỗi kỹ năng ghi nhận những gì làm được, kèm khóa học, chứng chỉ và bằng chứng.'
    : 'Skills at work and beyond — each with what I can actually do, backed by courses, certificates and other proof.';
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

