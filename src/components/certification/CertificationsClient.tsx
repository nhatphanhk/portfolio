'use client';

import React from 'react';
import { ExternalLink, Calendar, CheckCircle, XCircle } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/context';

interface CertificationItem {
  id: string;
  name: string;
  issuer: string;
  issueDate: Date | string;
  expiryDate?: Date | string | null;
  credentialId?: string | null;
  credentialUrl?: string | null;
  description?: string | null;
  logoUrl?: string | null;
  status: string;
}

interface CertificationsClientProps {
  certifications: CertificationItem[];
}

export default function CertificationsClient({ certifications }: CertificationsClientProps) {
  const { t, locale } = useLanguage();
  const active = certifications.filter(c => c.status === 'ACTIVE');
  const expired = certifications.filter(c => c.status === 'EXPIRED');
  const dateLocale = locale === 'vi' ? 'vi-VN' : 'en-US';

  return (
    <>
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-3 tracking-tight">
          {t('certifications.title')}
        </h1>
        <p className="text-base text-muted-foreground max-w-2xl leading-relaxed mb-6">
          {t('certifications.subtitle')}
        </p>

        {/* Stats — pill style */}
        <div className="flex flex-wrap gap-3">
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400">
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm font-bold">{active.length}</span>
            <span className="text-xs font-medium opacity-80">{t('certifications.active')}</span>
          </div>
          {expired.length > 0 && (
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-muted border border-border text-muted-foreground">
              <XCircle className="w-4 h-4" />
              <span className="text-sm font-bold">{expired.length}</span>
              <span className="text-xs font-medium opacity-80">{t('certifications.expired')}</span>
            </div>
          )}
        </div>
      </div>

      {/* Active Certifications */}
      {active.length > 0 && (
        <div className="mb-12">
          <h2 className="text-xs font-black uppercase tracking-widest text-primary mb-6 flex items-center gap-2">
            <span className="w-1 h-4 rounded-full bg-primary" />
            {t('certifications.active')}
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {active.map(cert => (
              <article
                key={cert.id}
                className="p-5 rounded-2xl border border-border/70 bg-card hover:border-primary/25 hover:shadow-md transition-all duration-200 flex flex-col justify-between gap-4"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-semibold text-sm text-foreground leading-snug">{cert.name}</h3>
                    <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                  </div>

                  <p className="text-xs font-semibold text-primary bg-primary/8 border border-primary/20 rounded-md px-2 py-0.5 inline-flex mb-3">
                    {cert.issuer}
                  </p>

                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {t('certifications.issued')}{' '}
                      {new Date(cert.issueDate).toLocaleDateString(dateLocale, {
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                    {cert.expiryDate && (
                      <span className="text-muted-foreground/60">
                        · {t('certifications.expired')}{' '}
                        {new Date(cert.expiryDate).toLocaleDateString(dateLocale, {
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    )}
                  </div>

                  {cert.description && (
                    <p className="text-xs text-muted-foreground mt-2 leading-relaxed line-clamp-2">
                      {cert.description}
                    </p>
                  )}
                </div>

                {(cert.credentialId || cert.credentialUrl) && (
                  <div className="flex items-center justify-between pt-3 border-t border-border/50 gap-2">
                    {cert.credentialId && (
                      <span className="text-[10px] text-muted-foreground font-mono truncate">
                        {cert.credentialId}
                      </span>
                    )}
                    {cert.credentialUrl && (
                      <a
                        href={cert.credentialUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-semibold shrink-0 ml-auto"
                      >
                        {t('certifications.viewCredential')} <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                )}
              </article>
            ))}
          </div>
        </div>
      )}

      {/* Expired Certifications */}
      {expired.length > 0 && (
        <div>
          <h2 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-6 flex items-center gap-2">
            <span className="w-1 h-4 rounded-full bg-muted-foreground/40" />
            {t('certifications.expired')}
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 opacity-55">
            {expired.map(cert => (
              <article
                key={cert.id}
                className="p-5 rounded-2xl border border-border bg-muted/20"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-semibold text-sm text-foreground leading-snug">{cert.name}</h3>
                  <XCircle className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                </div>
                <p className="text-xs font-medium text-muted-foreground mb-2">{cert.issuer}</p>
                <div className="text-xs text-muted-foreground/70">
                  <span>
                    {t('certifications.issued')}{' '}
                    {new Date(cert.issueDate).toLocaleDateString(dateLocale, {
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                  {cert.expiryDate && (
                    <span>
                      {' '}
                      · {t('certifications.expired')}{' '}
                      {new Date(cert.expiryDate).toLocaleDateString(dateLocale, {
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  )}
                </div>
              </article>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
