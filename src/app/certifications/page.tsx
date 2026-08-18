import { MainLayout } from '@/components';
import { getPublicCertifications } from '@/lib/actions/certification';
import { ExternalLink, Calendar, CheckCircle, XCircle } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Certifications',
  description:
    'Professional certifications and credentials from AWS, Google Cloud, Meta, and other platforms.',
};

export default async function CertificationsPage() {
  const certifications = await getPublicCertifications();
  const active = certifications.filter(c => c.status === 'ACTIVE');
  const expired = certifications.filter(c => c.status === 'EXPIRED');

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto px-6 py-24 pt-32">
        {/* Header */}
        <div className="mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Certifications</h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Professional credentials that validate my expertise across cloud platforms, frontend
            development, and software engineering.
          </p>

          {/* Stats */}
          <div className="flex gap-8 mt-8">
            <div>
              <p className="text-3xl font-bold text-foreground">{active.length}</p>
              <p className="text-sm text-muted-foreground">Active</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-muted-foreground">{expired.length}</p>
              <p className="text-sm text-muted-foreground">Expired</p>
            </div>
          </div>
        </div>

        {/* Active Certifications */}
        {active.length > 0 && (
          <div className="mb-16">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-primary mb-8">
              Active
            </h2>
            <div className="grid md:grid-cols-2 gap-5">
              {active.map(cert => (
                <article
                  key={cert.id}
                  className="p-6 rounded-xl border border-border bg-card hover:border-foreground/20 hover:shadow-sm transition-all duration-200"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <h3 className="font-semibold text-foreground leading-snug">{cert.name}</h3>
                    <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                  </div>

                  <p className="text-sm font-medium text-muted-foreground mb-4">{cert.issuer}</p>

                  <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>
                        Issued{' '}
                        {new Date(cert.issueDate).toLocaleDateString('en-US', {
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                    {cert.expiryDate && (
                      <span className="text-muted-foreground/60">
                        · Expires{' '}
                        {new Date(cert.expiryDate).toLocaleDateString('en-US', {
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    )}
                  </div>

                  {cert.description && (
                    <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                      {cert.description}
                    </p>
                  )}

                  {(cert.credentialId || cert.credentialUrl) && (
                    <div className="flex items-center justify-between pt-3 border-t border-border">
                      {cert.credentialId && (
                        <span className="text-xs text-muted-foreground font-mono">
                          ID: {cert.credentialId}
                        </span>
                      )}
                      {cert.credentialUrl && (
                        <a
                          href={cert.credentialUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                        >
                          Verify <ExternalLink className="h-3 w-3" />
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
            <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-8">
              Expired
            </h2>
            <div className="grid md:grid-cols-2 gap-5 opacity-60">
              {expired.map(cert => (
                <article
                  key={cert.id}
                  className="p-6 rounded-xl border border-border bg-muted/30"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <h3 className="font-semibold text-foreground leading-snug">{cert.name}</h3>
                    <XCircle className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{cert.issuer}</p>
                  <div className="text-xs text-muted-foreground">
                    <span>
                      Issued{' '}
                      {new Date(cert.issueDate).toLocaleDateString('en-US', {
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                    {cert.expiryDate && (
                      <span>
                        {' '}
                        · Expired{' '}
                        {new Date(cert.expiryDate).toLocaleDateString('en-US', {
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
      </div>
    </MainLayout>
  );
}
