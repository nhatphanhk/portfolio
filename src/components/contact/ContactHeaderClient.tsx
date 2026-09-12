'use client';

import { useLanguage } from '@/lib/i18n/context';

export function ContactHeaderClient() {
  const { t } = useLanguage();

  return (
    <div className="mb-12">
      <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
        {t('contact.title')}
      </h1>
      <p className="text-lg text-muted-foreground max-w-2xl">
        {t('contact.subtitle')}
      </p>
    </div>
  );
}
