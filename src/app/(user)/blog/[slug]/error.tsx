'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

/**
 * Error Boundary for Blog Slug Route
 */
export default function BlogError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Blog post error:', error);
  }, [error]);

  return (
    <div className="container mx-auto flex min-h-[60vh] items-center justify-center px-4 py-16">
      <div className="w-full max-w-lg space-y-6 text-center">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Unable to Load Blog Post</h1>
          <p className="text-muted-foreground">
            We encountered an error while loading this blog post.
          </p>
        </div>

        {process.env.NODE_ENV === 'development' && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-left">
            <p className="text-sm text-red-800">{error.message}</p>
          </div>
        )}

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button onClick={reset} variant="default">
            Try Again
          </Button>

          <Button asChild variant="outline">
            <Link href="/blog">View All Posts</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
