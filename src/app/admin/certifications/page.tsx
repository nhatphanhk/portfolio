import { getAllCertifications } from '@/data/certifications';
import { Award, Plus, Pencil, Trash2, ExternalLink, CheckCircle, XCircle } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Certifications — Admin' };

export default function AdminCertificationsPage() {
  const certifications = getAllCertifications();

  return (
    <main className="flex flex-1 flex-col gap-6 p-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Certifications</h1>
          <p className="text-sm text-muted-foreground">{certifications.length} certifications total</p>
        </div>
        <button type="button" className="inline-flex items-center gap-2 px-4 py-2 bg-foreground text-background rounded-lg text-sm font-medium hover:bg-foreground/90 transition-colors">
          <Plus className="h-4 w-4" />
          Add Certification
        </button>
      </div>

      <div className="rounded-xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Certification</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Issuer</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">Issued</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {certifications.map(cert => (
              <tr key={cert.id} className="bg-card hover:bg-muted/20 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div>
                      <p className="font-medium text-foreground line-clamp-1">{cert.name}</p>
                      {cert.credentialUrl && (
                        <a href={cert.credentialUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-0.5 mt-0.5">
                          <ExternalLink className="h-3 w-3" /> Verify
                        </a>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{cert.issuer}</td>
                <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">
                  {new Date(cert.issueDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                </td>
                <td className="px-4 py-3">
                  {cert.status === 'ACTIVE' ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full bg-green-500/10 text-green-600 dark:text-green-400">
                      <CheckCircle className="h-3 w-3" /> Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full bg-muted text-muted-foreground">
                      <XCircle className="h-3 w-3" /> Expired
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1 justify-end">
                    <button type="button" aria-label={`Edit ${cert.name}`} className="p-1.5 text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-muted">
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button type="button" aria-label={`Delete ${cert.name}`} className="p-1.5 text-muted-foreground hover:text-destructive transition-colors rounded-md hover:bg-destructive/10">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
