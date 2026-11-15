'use client';

import { useLanguage } from '@/lib/i18n/context';
import { Layers } from 'lucide-react';
import { PublicPageHeader } from '@/components/ui/PublicPageHeader';

export function SeriesHeaderClient() {
  const { t } = useLanguage();

  return (
    <PublicPageHeader
      badge={{ label: t('seriesPage.badge'), icon: Layers }}
      title={t('seriesPage.title')}
      subtitle={t('seriesPage.subtitle')}
    />
  );
}
