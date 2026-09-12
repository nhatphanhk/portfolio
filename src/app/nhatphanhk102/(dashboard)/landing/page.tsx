import { getAllSiteContent, getSiteContentBundle } from '@/lib/actions/site-content';
import { AdminLandingClient } from './client';

export const metadata = {
  title: 'Landing Page Content — Admin',
};

export default async function AdminLandingPage() {
  const [items, bundle] = await Promise.all([
    getAllSiteContent(),
    getSiteContentBundle(),
  ]);

  return <AdminLandingClient initialItems={items} initialBundle={bundle} />;
}
