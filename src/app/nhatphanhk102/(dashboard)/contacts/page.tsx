import { getAllContactsFromDb } from '@/lib/actions/contact';
import { AdminContactsClient } from './client';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Contacts — Admin' };

export default async function AdminContactsPage() {
  const contacts = await getAllContactsFromDb();
  return <AdminContactsClient contacts={contacts} />;
}
