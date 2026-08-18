import { getAllCertificationsFromDb } from '@/lib/actions/certification';
import { AdminCertificationsClient } from './client';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Certifications — Admin' };

export default async function AdminCertificationsPage() {
  const certifications = await getAllCertificationsFromDb();
  return <AdminCertificationsClient certifications={certifications} />;
}
