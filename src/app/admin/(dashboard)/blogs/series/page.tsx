import { getAllSeries } from '@/lib/actions/series';
import { AdminSeriesClient } from './client';

export const metadata = {
  title: 'Blog Series — Admin',
};

export default async function AdminBlogSeriesPage() {
  const series = await getAllSeries();

  return <AdminSeriesClient initialSeries={series} />;
}
