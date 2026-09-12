import { Suspense } from 'react';
import { MainLayout } from '@/components';
import { getPublicSeries } from '@/lib/actions/series';
import { SeriesListClient } from '@/components/blog/SeriesListClient';
import { UserBreadcrumb } from '@/components/UserBreadcrumb';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Article Series',
  description:
    'Structured multi-part learning roadmaps and article series covering in-depth web development, system design, and software engineering.',
};

export const revalidate = 3600;

import { getServerLocale } from '@/lib/i18n/server';
import { SeriesHeaderClient } from '@/components/blog/SeriesHeaderClient';

export default async function SeriesDirectoryPage() {
  const locale = await getServerLocale();
  const seriesList = await getPublicSeries(locale);

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 pt-32">
        {/* Breadcrumbs: Home > Blogs > Series */}
        <UserBreadcrumb
          items={[
            { label: 'Blogs', href: '/blog' },
            { label: 'Series' },
          ]}
          className="mb-6"
        />

        {/* Page Header */}
        <SeriesHeaderClient />

        {/* Interactive Series List & Search */}
        <Suspense
          fallback={
            <div className="py-16 text-center text-muted-foreground">
              Loading series directory...
            </div>
          }
        >
          <SeriesListClient seriesList={seriesList} />
        </Suspense>
      </div>
    </MainLayout>
  );
}
