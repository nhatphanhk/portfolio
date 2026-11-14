import { MainLayout } from '@/components';
import { UserBreadcrumb } from '@/components/UserBreadcrumb';
import { getPublicCertifications } from '@/lib/actions/certification';
import CertificationsClient from '@/components/certification/CertificationsClient';
import type { Metadata } from 'next';
import { buildOpenGraph } from '@/lib/constants';

import { getServerLocale } from '@/lib/i18n/server';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const isVi = locale === 'vi';
  const title = isVi ? 'Chứng chỉ nghề nghiệp' : 'Certifications';
  const description = isVi
    ? 'Các chứng chỉ chuyên môn từ AWS, Google Cloud, Meta và các nền tảng công nghệ uy tín.'
    : 'Professional certifications and credentials from AWS, Google Cloud, Meta, and other platforms.';
  return {
    title,
    description,
    openGraph: buildOpenGraph({ title, description, path: '/certifications', locale }),
  };
}

export const revalidate = 3600;

export default async function CertificationsPage() {
  const certifications = await getPublicCertifications();

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 pt-32">
        <UserBreadcrumb items={[{ label: 'Certifications' }]} className="mb-6" />
        <CertificationsClient certifications={certifications} />
      </div>
    </MainLayout>
  );
}

