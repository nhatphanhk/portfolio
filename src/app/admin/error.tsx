'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

/**
 * Error Boundary for Admin Routes
 */
export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Admin panel error:', error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6 text-center">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-red-600">Admin Error</h1>
          <p className="text-muted-foreground">
            An error occurred in the admin panel
          </p>
        </div>

        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-800">
            {error.message || 'An unexpected error occurred'}
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <Button onClick={reset} variant="default" className="w-full">
            Try Again
          </Button>

          <Button
            onClick={() => (window.location.href = '/admin')}
            variant="outline"
            className="w-full"
          >
            Go to Admin Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
