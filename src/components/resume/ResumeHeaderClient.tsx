'use client';

import { useLanguage } from '@/lib/i18n/context';
import { Download } from 'lucide-react';
import { PublicPageHeader } from '@/components/ui/PublicPageHeader';

interface ResumeHeaderClientProps {
  resumeUrl?: string | null;
}

export function ResumeHeaderClient({ resumeUrl }: ResumeHeaderClientProps) {
  const { t } = useLanguage();

  return (
    <PublicPageHeader
      className="print:hidden"
      title={t('resume.title')}
      subtitle={t('resume.subtitle')}
      actions={
        resumeUrl && (
          <a
            href={resumeUrl}
            download
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:opacity-90 active:scale-95 transition-all shadow-md shadow-primary/20 shrink-0"
          >
            <Download className="w-4 h-4" aria-hidden="true" />
            {t('resume.downloadPdf')}
          </a>
        )
      }
    />
  );
}
