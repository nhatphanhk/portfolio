'use client';

import { FolderCode } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/context';

export function ProjectHeaderClient() {
  const { t } = useLanguage();

  return (
    <div className="mb-10">
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-3 bg-primary/10 text-primary border border-primary/20">
        <FolderCode className="w-3.5 h-3.5" />
        <span>{t('project.badge') || 'Portfolio'}</span>
      </div>
      <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-2 tracking-tight">
        {t('project.title')}
      </h1>
      <p className="text-base text-muted-foreground max-w-2xl leading-relaxed">
        {t('project.subtitle')}
      </p>
    </div>
  );
}
