import { Suspense } from 'react';
import type { Metadata } from 'next';
import { MainLayout } from '@/components';
import { UserBreadcrumb } from '@/components/UserBreadcrumb';
import { CardGridSkeleton } from '@/components/ui/CardGridSkeleton';
import JourneyClient from '@/components/journey/JourneyClient';
import { getPublicJourney } from '@/lib/journey';
import { buildOpenGraph } from '@/lib/constants';
import { getServerLocale } from '@/lib/i18n/server';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const isVi = locale === 'vi';
  const title = isVi ? 'Hành trình' : 'Journey';
  const description = isVi
    ? 'Mọi thứ mình học, làm và viết trên một dòng thời gian: nhật ký học tập, kỹ năng mới, chứng chỉ, bài viết và dự án.'
    : 'Everything I learn, build and write on one timeline: journal entries, new capabilities, certificates, posts and projects.';
  return {
    title,
    description,
    alternates: { canonical: '/journey' },
    openGraph: buildOpenGraph({ title, description, path: '/journey', locale }),
  };
}

async function Journey() {
  const locale = await getServerLocale();
  const data = await getPublicJourney(locale);
  return <JourneyClient data={data} />;
}

export default function JourneyPage() {
  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-24 pt-32">
        <UserBreadcrumb items={[{ label: 'Journey' }]} className="mb-6" />
        {/* In-page Suspense, not a route loading.tsx (KNOWN_ISSUES #1) */}
        <Suspense fallback={<CardGridSkeleton cards={3} />}>
          <Journey />
        </Suspense>
      </div>
    </MainLayout>
  );
}
