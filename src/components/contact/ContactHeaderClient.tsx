'use client';

import { useLanguage } from '@/lib/i18n/context';
import { PublicPageHeader } from '@/components/ui/PublicPageHeader';

export function ContactHeaderClient() {
  const { t } = useLanguage();

  return <PublicPageHeader title={t('contact.title')} subtitle={t('contact.subtitle')} />;
}
