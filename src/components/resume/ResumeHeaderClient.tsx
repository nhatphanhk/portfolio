'use client';

import { useLanguage } from '@/lib/i18n/context';
import { Download } from 'lucide-react';

interface ResumeHeaderClientProps {
  resumeUrl?: string | null;
}

export function ResumeHeaderClient({ resumeUrl }: ResumeHeaderClientProps) {
  const { t } = useLanguage();

  return (
    <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-1 tracking-tight">
          {t('resume.title')}
        </h1>
        <p className="text-muted-foreground text-sm">
          {t('resume.subtitle')}
        </p>
      </div>
      {resumeUrl && (
        <a
          href={resumeUrl}
          download
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:opacity-90 active:scale-95 transition-all shadow-md shadow-primary/20 shrink-0"
        >
          <Download className="w-4 h-4" />
          {t('resume.downloadPdf')}
        </a>
      )}
    </div>
  );
}
