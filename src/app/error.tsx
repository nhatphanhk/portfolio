'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

/**
 * Global Error Boundary
 * Catches errors that occur anywhere in the application
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6 text-center">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-red-600">Oops!</h1>
          <h2 className="text-2xl font-semibold">Something went wrong</h2>
        </div>

        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-800">
            {error.message || 'An unexpected error occurred'}
          </p>
          {error.digest && (
            <p className="mt-2 text-xs text-red-600">
              Error ID: {error.digest}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-3">
          <Button onClick={reset} variant="default" className="w-full">
            Try Again
          </Button>

          <Button
            onClick={() => (window.location.href = '/')}
            variant="outline"
            className="w-full"
          >
            Go to Homepage
          </Button>
        </div>

        <p className="text-sm text-muted-foreground">
          If this problem persists, please contact support.
        </p>
      </div>
    </div>
  );
}
