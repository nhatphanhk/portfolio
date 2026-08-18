import { getVisitorLogsFromDb } from '@/lib/actions/contact';
import { VisitorLogsClient } from './client';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Visitor Logs — Admin' };

export default async function VisitorLogsPage() {
  const logs = await getVisitorLogsFromDb();
  return <VisitorLogsClient logs={logs} />;
}
