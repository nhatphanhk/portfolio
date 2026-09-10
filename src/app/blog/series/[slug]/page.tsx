import { notFound } from 'next/navigation';
import { MainLayout } from '@/components';
import { getPublicSeriesBySlug, getPublicSeries } from '@/lib/actions/series';
import { SeriesDetailClient } from '@/components/blog/SeriesDetailClient';
import { UserBreadcrumb } from '@/components/UserBreadcrumb';
import type { Metadata } from 'next';

interface SeriesPageProps {
  params: Promise<{ slug: string }>;
}

export const revalidate = 300;

export async function generateStaticParams() {
  const allSeries = await getPublicSeries();
  return allSeries.map(s => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: SeriesPageProps): Promise<Metadata> {
  const { slug } = await params;
  const series = await getPublicSeriesBySlug(slug);

  if (!series) {
    return {
      title: 'Series Not Found',
    };
  }

  return {
    title: `${series.title} | Series`,
    description:
      series.description ||
      `Explore all parts of the ${series.title} series on nhatphanhk102.`,
    openGraph: {
      title: `${series.title} | Series`,
      description:
        series.description ||
        `Explore all parts of the ${series.title} series on nhatphanhk102.`,
      images: series.coverUrl ? [{ url: series.coverUrl }] : undefined,
    },
  };
}

export default async function SeriesDetailPage({ params }: SeriesPageProps) {
  const { slug } = await params;
  const series = await getPublicSeriesBySlug(slug);

  if (!series) {
    notFound();
  }

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-24 pt-32">
        {/* Breadcrumb: Home > Blogs > Series > [Series Title] */}
        <UserBreadcrumb
          items={[
            { label: 'Blogs', href: '/blog' },
            { label: 'Series', href: '/blog/series' },
            { label: series.title },
          ]}
          className="mb-8"
        />

        {/* Series Detail & Curriculum Stepper */}
        <SeriesDetailClient series={series} />
      </div>
    </MainLayout>
  );
}
