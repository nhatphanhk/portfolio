import { MainLayout } from '@/components';
import Link from 'next/link';
import { Home, ArrowRight } from 'lucide-react';

export default function NotFound() {
  return (
    <MainLayout>
      <div className="min-h-[70vh] flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-3">
            404
          </p>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Page not found
          </h1>
          <p className="text-muted-foreground mb-8">
            The page you&apos;re looking for doesn&apos;t exist or may have been moved.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity"
            >
              <Home className="h-4 w-4" />
              Back to home
            </Link>
            <Link
              href="/project"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-border rounded-lg font-medium text-foreground hover:bg-accent transition-colors"
            >
              View projects
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
