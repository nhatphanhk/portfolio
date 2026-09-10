import { Suspense } from 'react';
import { MainLayout } from '@/components';
import { getPublicSeries } from '@/lib/actions/series';
import { SeriesListClient } from '@/components/blog/SeriesListClient';
import { UserBreadcrumb } from '@/components/UserBreadcrumb';
import { Layers } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Article Series',
  description:
    'Structured multi-part learning roadmaps and article series covering in-depth web development, system design, and software engineering.',
};

export const revalidate = 300;

export default async function SeriesDirectoryPage() {
  const seriesList = await getPublicSeries();

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
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20 mb-4">
            <Layers className="w-3.5 h-3.5" />
            <span>Curated Learning Roadmaps</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 tracking-tight">
            Article Series
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl leading-relaxed">
            In-depth, step-by-step multi-part series covering full-stack architecture, performance optimization,
            and real-world engineering solutions.
          </p>
        </div>

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
