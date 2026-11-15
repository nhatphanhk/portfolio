'use client';

import { useLanguage } from '@/lib/i18n/context';
import { Download } from 'lucide-react';
import { PublicPageHeader } from '@/components/ui/PublicPageHeader';
import { ResumeShareMenu } from '@/components/resume/ResumeShareMenu';

interface ResumeHeaderClientProps {
  resumeUrl?: string | null;
  /** Resume owner's name, used in share text. */
  name: string;
}

export function ResumeHeaderClient({ resumeUrl, name }: ResumeHeaderClientProps) {
  const { t } = useLanguage();

  return (
    <PublicPageHeader
      className="print:hidden"
      title={t('resume.title')}
      subtitle={t('resume.subtitle')}
      actions={
        <div className="flex flex-wrap items-center gap-3">
          <ResumeShareMenu name={name} />
          {resumeUrl && (
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
          )}
        </div>
      }
    />
  );
}
