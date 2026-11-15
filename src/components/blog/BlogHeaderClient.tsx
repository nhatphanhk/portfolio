'use client';

import { useLanguage } from '@/lib/i18n/context';
import { PublicPageHeader } from '@/components/ui/PublicPageHeader';

export function BlogHeaderClient() {
  const { t } = useLanguage();
  return <PublicPageHeader title={t('blog.title')} subtitle={t('blog.subtitle')} />;
}
