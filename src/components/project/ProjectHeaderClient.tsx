'use client';

import { FolderCode } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/context';
import { PublicPageHeader } from '@/components/ui/PublicPageHeader';

export function ProjectHeaderClient() {
  const { t } = useLanguage();

  return (
    <PublicPageHeader
      badge={{ label: t('project.badge'), icon: FolderCode }}
      title={t('project.title')}
      subtitle={t('project.subtitle')}
    />
  );
}
