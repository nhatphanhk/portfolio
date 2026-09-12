'use client';

import { useLanguage } from '@/lib/i18n/context';
import { Layers } from 'lucide-react';

export function SeriesHeaderClient() {
  const { t } = useLanguage();

  return (
    <div className="mb-12">
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20 mb-4">
        <Layers className="w-3.5 h-3.5" />
        <span>{t('seriesPage.badge')}</span>
      </div>
      <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 tracking-tight">
        {t('seriesPage.title')}
      </h1>
      <p className="text-lg text-muted-foreground max-w-3xl leading-relaxed">
        {t('seriesPage.subtitle')}
      </p>
    </div>
  );
}
