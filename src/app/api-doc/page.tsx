import { getApiDocs } from '@/lib/swagger';
import SwaggerUIClient from '@/components/SwaggerUIClient';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';

export default async function ApiDocPage() {
  const session = await auth();
  if (!session) {
    redirect('/admin/login');
  }

  const spec = await getApiDocs();

  return (
    <section className="container mx-auto p-4 max-w-5xl bg-white min-h-screen">
      <div className="rounded-xl overflow-hidden">
        <SwaggerUIClient spec={spec} />
      </div>
    </section>
  );
}
