'use client'; // Error boundaries must be Client Components

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/context';

export default function GlobalError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  const { t } = useLanguage();

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-background">
      <div role="alert" className="text-center max-w-md">
        <div className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
          <AlertTriangle className="h-6 w-6 text-destructive" aria-hidden="true" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-3">{t('errorPage.title')}</h1>
        <p className="text-muted-foreground mb-8">{t('errorPage.message')}</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            type="button"
            onClick={() => retry()}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity"
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            {t('errorPage.retry')}
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-border rounded-lg font-medium text-foreground hover:bg-accent transition-colors"
          >
            <Home className="h-4 w-4" aria-hidden="true" />
            {t('notFound.backHome')}
          </Link>
        </div>
      </div>
    </div>
  );
}
