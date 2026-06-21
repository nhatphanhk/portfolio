import { getApiDocs } from '@/lib/swagger';
import SwaggerUIClient from '@/components/SwaggerUIClient';

export default async function ApiDocPage() {
  const spec = await getApiDocs();

  return (
    <section className="container mx-auto p-4 max-w-5xl bg-white min-h-screen">
      <div className="rounded-xl overflow-hidden">
        <SwaggerUIClient spec={spec} />
      </div>
    </section>
  );
}
