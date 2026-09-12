import { getAllSiteContent } from '@/lib/actions/site-content';
import { AdminLandingClient } from './client';

export const metadata = {
  title: 'Landing Page Content — Admin',
};

export default async function AdminLandingPage() {
  const items = await getAllSiteContent();

  return <AdminLandingClient initialItems={items} />;
}
