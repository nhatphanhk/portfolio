'use client';

import { useLanguage } from '@/lib/i18n/context';

export function ProjectHeaderClient() {
  const { t } = useLanguage();

  return (
    <div className="mb-10">
      <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 tracking-tight">
        {t('project.title')}
      </h1>
      <p className="text-lg text-muted-foreground max-w-3xl">
        {t('project.subtitle')}
      </p>
    </div>
  );
}
