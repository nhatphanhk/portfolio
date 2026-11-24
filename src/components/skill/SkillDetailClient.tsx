'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Award,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileText,
  GraduationCap,
  Image as ImageIcon,
  Link2,
  Rocket,
  Layers,
  ShieldCheck,
} from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { useLanguage } from '@/lib/i18n/context';
import { cn, formatDate } from '@/lib/utils';
import type { PublicEvidence, PublicSkillDetail } from '@/lib/actions/skill';
import { CATEGORY_ICONS, STATUS_STYLES } from './SkillsClient';

const EVIDENCE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  COURSE: GraduationCap,
  CERTIFICATE: Award,
  IMAGE: ImageIcon,
  LINK: Link2,
  DOCUMENT: FileText,
  PROJECT: Rocket,
};

const isImageUrl = (url?: string) => !!url && /\.(jpe?g|png|gif|webp|avif)(\?|$)/i.test(url);

function EvidenceCard({ evidence, onPreview }: { evidence: PublicEvidence; onPreview: (e: PublicEvidence) => void }) {
  const { t, locale } = useLanguage();
  const Icon = EVIDENCE_ICONS[evidence.type] ?? Link2;
  const image = isImageUrl(evidence.fileUrl) ? evidence.fileUrl : undefined;
  const href = evidence.fileUrl || evidence.url;

  return (
    <div className="flex flex-col rounded-xl border border-border/70 bg-card overflow-hidden hover:border-primary/30 hover:shadow-sm transition-all">
      {image && (
        <button
          type="button"
          onClick={() => onPreview(evidence)}
          className="block aspect-video bg-muted overflow-hidden cursor-zoom-in"
          aria-label={evidence.title}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={image} alt={evidence.title} loading="lazy" className="w-full h-full object-cover hover:scale-[1.02] transition-transform" />
        </button>
      )}
      <div className="p-3.5 flex-1 flex flex-col gap-1.5">
        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-primary">
          <Icon className="w-3.5 h-3.5" aria-hidden="true" />
          {t(`skills.detail.evidenceTypes.${evidence.type}`)}
        </div>
        <p className="text-sm font-semibold text-foreground leading-snug">{evidence.title}</p>
        {(evidence.provider || evidence.issuedAt) && (
          <p className="text-xs text-muted-foreground">
            {[evidence.provider, evidence.issuedAt ? formatDate(evidence.issuedAt, locale) : null].filter(Boolean).join(' · ')}
          </p>
        )}
        {evidence.certification?.credentialId && (
          <p className="text-[11px] text-muted-foreground font-mono">ID: {evidence.certification.credentialId}</p>
        )}
        {evidence.description && <p className="text-xs text-muted-foreground line-clamp-3">{evidence.description}</p>}
        {href && !image && (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-auto pt-1 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline w-fit"
          >
            {evidence.certification ? (
              <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
            ) : (
              <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
            )}
            {evidence.certification ? t('skills.detail.verify') : t('skills.detail.open')}
          </a>
        )}
        {image && evidence.url && (
          <a href={evidence.url} target="_blank" rel="noopener noreferrer" className="mt-auto pt-1 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline w-fit">
            <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
            {t('skills.detail.open')}
          </a>
        )}
      </div>
    </div>
  );
}

function EvidenceGrid({ items, onPreview }: { items: PublicEvidence[]; onPreview: (e: PublicEvidence) => void }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {items.map(e => (
        <EvidenceCard key={e.id} evidence={e} onPreview={onPreview} />
      ))}
    </div>
  );
}

export default function SkillDetailClient({ skill }: { skill: PublicSkillDetail }) {
  const { t, locale } = useLanguage();
  const [preview, setPreview] = useState<PublicEvidence | null>(null);
  const CatIcon = CATEGORY_ICONS[skill.category] ?? Layers;
  const catLabel = t(`skills.categories.${skill.category}`);

  return (
    <article className="space-y-10">
      {/* Header */}
      <header className="space-y-4">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-2xl bg-primary/10 text-primary border border-primary/15 shrink-0">
            {skill.iconUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={skill.iconUrl} alt="" className="w-7 h-7 object-contain" />
            ) : (
              <CatIcon className="w-7 h-7" aria-hidden="true" />
            )}
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="text-xs font-semibold text-muted-foreground">{catLabel}</span>
              <span className={cn('text-[11px] font-semibold px-2 py-0.5 rounded-full border', STATUS_STYLES[skill.status])}>
                {t(`skills.status.${skill.status}`)}
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground">{skill.name}</h1>
          </div>
        </div>
        {skill.summary && <p className="text-base sm:text-lg text-muted-foreground max-w-3xl">{skill.summary}</p>}

        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
          {skill.startedAt && (
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="w-4 h-4" aria-hidden="true" />
              {t('skills.detail.started')}: {formatDate(skill.startedAt, locale, 'monthYear')}
            </span>
          )}
          {skill.achievedAt && skill.status !== 'LEARNING' && (
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
              {t('skills.detail.achievedSince')}: {formatDate(skill.achievedAt, locale, 'monthYear')}
            </span>
          )}
          {skill.totalHours > 0 && (
            <span className="inline-flex items-center gap-1.5">
              <Clock className="w-4 h-4" aria-hidden="true" />
              {Math.round(skill.totalHours * 10) / 10} {t('skills.detail.totalHours')}
            </span>
          )}
        </div>
      </header>

      {/* What I can do */}
      <section aria-labelledby="can-do-heading" className="space-y-4">
        <h2 id="can-do-heading" className="text-xl font-bold text-foreground">
          {t('skills.detail.canDo')}
        </h2>
        {skill.capabilities.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t('skills.detail.noCapabilities')}</p>
        ) : (
          <ol className="space-y-4">
            {skill.capabilities.map(cap => (
              <li key={cap.id} className="p-5 rounded-2xl border border-border/70 bg-card shadow-sm space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" aria-hidden="true" />
                  <div className="min-w-0">
                    <p className="font-semibold text-foreground">{cap.statement}</p>
                    {cap.description && <p className="text-sm text-muted-foreground mt-1 whitespace-pre-line">{cap.description}</p>}
                    {cap.achievedAt && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {t('skills.detail.since')} {formatDate(cap.achievedAt, locale, 'monthYear')}
                      </p>
                    )}
                  </div>
                </div>
                {cap.evidences.length > 0 && (
                  <div className="sm:pl-8">
                    <EvidenceGrid items={cap.evidences} onPreview={setPreview} />
                  </div>
                )}
              </li>
            ))}
          </ol>
        )}
      </section>

      {skill.generalEvidences.length > 0 && (
        <section aria-labelledby="evidence-heading" className="space-y-4">
          <h2 id="evidence-heading" className="text-xl font-bold text-foreground">
            {t('skills.detail.generalEvidence')}
          </h2>
          <EvidenceGrid items={skill.generalEvidences} onPreview={setPreview} />
        </section>
      )}

      {/* Learning journal */}
      {skill.logs.length > 0 && (
        <section aria-labelledby="journal-heading" className="space-y-4">
          <h2 id="journal-heading" className="text-xl font-bold text-foreground inline-flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" aria-hidden="true" />
            {t('skills.detail.journal')}
          </h2>
          <ol className="relative border-l border-border ml-2 space-y-5">
            {skill.logs.map(log => (
              <li key={log.id} className="ml-5">
                <span className="absolute -left-1.5 mt-1.5 h-3 w-3 rounded-full border-2 border-background bg-primary" aria-hidden="true" />
                <p className="text-xs text-muted-foreground">
                  <time dateTime={log.date}>{formatDate(log.date, locale, 'long')}</time>
                  {log.hours ? ` · ${log.hours} ${t('skills.detail.hours')}` : ''}
                </p>
                <p className="text-sm font-semibold text-foreground">{log.title}</p>
                {log.note && <p className="text-sm text-muted-foreground whitespace-pre-line mt-0.5">{log.note}</p>}
              </li>
            ))}
          </ol>
        </section>
      )}

      <Link href="/skills" className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground">
        <ArrowLeft className="w-4 h-4" aria-hidden="true" />
        {t('skills.detail.back')}
      </Link>

      <Dialog open={!!preview} onOpenChange={o => !o && setPreview(null)}>
        <DialogContent className="max-w-4xl p-2 sm:p-3">
          <DialogTitle className="sr-only">{preview?.title}</DialogTitle>
          {preview?.fileUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview.fileUrl} alt={preview.title} className="w-full max-h-[80vh] object-contain rounded-lg" />
          )}
          {preview && <p className="text-sm font-medium text-center text-foreground px-2 pb-1">{preview.title}</p>}
        </DialogContent>
      </Dialog>
    </article>
  );
}
