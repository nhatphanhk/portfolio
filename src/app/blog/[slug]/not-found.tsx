import { MainLayout } from '@/components';
import Link from 'next/link';

export default function NotFound() {
  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 pt-32">
        <div className="py-20 text-center">
          <h1 className="text-6xl font-bold text-foreground mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-foreground mb-6">Blog Post Not Found</h2>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            The blog post you&apos;re looking for doesn&apos;t exist or may have been moved.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/blog"
              className="px-6 py-3 bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition-opacity font-semibold text-sm"
            >
              Back to Blog
            </Link>
            <Link
              href="/"
              className="px-6 py-3 border border-border bg-card text-foreground rounded-xl hover:bg-muted transition-colors font-semibold text-sm"
            >
              Go Home
            </Link>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
