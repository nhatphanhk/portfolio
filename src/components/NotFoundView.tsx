import Link from 'next/link';
import { Home, ArrowRight } from 'lucide-react';
import { MainLayout } from '@/components';
import { getServerLocale } from '@/lib/i18n/server';
import { en } from '@/lib/i18n/locales/en';
import { vi } from '@/lib/i18n/locales/vi';

/** Shared 404 body for the root and the blog-post not-found pages. */
export async function NotFoundView({ variant = 'page' }: { variant?: 'page' | 'blog' }) {
  const locale = await getServerLocale();
  const d = (locale === 'vi' ? vi : en).notFound;
  const isBlog = variant === 'blog';

  const secondary = isBlog
    ? { href: '/blog', label: d.backToBlog }
    : { href: '/project', label: d.viewProjects };

  return (
    <MainLayout>
      <div className="min-h-[70vh] flex items-center justify-center px-6 pt-24">
        <div className="text-center max-w-md">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-3">404</p>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground mb-4">
            {isBlog ? d.blogTitle : d.title}
          </h1>
          <p className="text-muted-foreground mb-8">{isBlog ? d.blogMessage : d.message}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity"
            >
              <Home className="h-4 w-4" aria-hidden="true" />
              {d.backHome}
            </Link>
            <Link
              href={secondary.href}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-border rounded-lg font-medium text-foreground hover:bg-accent transition-colors"
            >
              {secondary.label}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
