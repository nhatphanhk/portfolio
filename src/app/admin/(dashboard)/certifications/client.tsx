'use client';

import { useState } from 'react';
import { Award, Plus, Pencil, Trash2, ExternalLink } from 'lucide-react';
import { CertificationDialog } from '@/components/admin/CertificationDialog';
import { DeleteDialog } from '@/components/admin/DeleteDialog';
import { deleteCertification } from '@/lib/actions/certification';

type Certification = {
  id: string;
  name: string;
  issuer: string;
  issueDate: Date;
  expiryDate: Date | null;
  credentialId: string | null;
  credentialUrl: string | null;
  description: string | null;
  status: string;
};

export function AdminCertificationsClient({ certifications }: { certifications: Certification[] }) {
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Certification | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Certification | null>(null);

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  const toInputDate = (date: Date) => {
    return new Date(date).toISOString().split('T')[0];
  };

  return (
    <main className="flex flex-1 flex-col gap-6 p-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Certifications</h1>
          <p className="text-sm text-muted-foreground">{certifications.length} records total</p>
        </div>
        <button
          id="create-cert-btn"
          type="button"
          onClick={() => setCreateOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-foreground text-background rounded-lg text-sm font-medium hover:bg-foreground/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Certification
        </button>
      </div>

      <div className="rounded-xl border border-border overflow-hidden">
        {certifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
            <Award className="h-10 w-10 mb-3 opacity-30" />
            <p>No certifications yet</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Certification</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">Dates</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Credential</th>
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
                        <p className="font-medium text-foreground">{cert.name}</p>
                        <p className="text-xs text-muted-foreground">{cert.issuer}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell text-muted-foreground">
                    <div>{formatDate(cert.issueDate)}</div>
                    {cert.expiryDate && (
                      <div className="text-xs">Expires: {formatDate(cert.expiryDate)}</div>
                    )}
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    {cert.credentialId ? (
                      <div className="flex items-center gap-1">
                        <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded text-muted-foreground">{cert.credentialId}</span>
                        {cert.credentialUrl && (
                          <a href={cert.credentialUrl} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                    ) : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 text-xs rounded-full ${
                      cert.status === 'ACTIVE' ? 'bg-green-500/10 text-green-600 dark:text-green-400'
                      : 'bg-muted text-muted-foreground'
                    }`}>{cert.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 justify-end">
                      <button type="button" aria-label={`Edit ${cert.name}`} onClick={() => setEditTarget(cert)} className="p-1.5 text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-muted">
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button type="button" aria-label={`Delete ${cert.name}`} onClick={() => setDeleteTarget(cert)} className="p-1.5 text-muted-foreground hover:text-destructive transition-colors rounded-md hover:bg-destructive/10">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <CertificationDialog mode="create" open={createOpen} onOpenChange={setCreateOpen} />

      {editTarget && (
        <CertificationDialog
          mode="edit"
          open={!!editTarget}
          onOpenChange={open => !open && setEditTarget(null)}
          initialData={{
            id: editTarget.id,
            name: editTarget.name,
            issuer: editTarget.issuer,
            issueDate: toInputDate(editTarget.issueDate),
            expiryDate: editTarget.expiryDate ? toInputDate(editTarget.expiryDate) : '',
            credentialId: editTarget.credentialId ?? '',
            credentialUrl: editTarget.credentialUrl ?? '',
            description: editTarget.description ?? '',
            status: editTarget.status as 'ACTIVE' | 'EXPIRED',
          }}
        />
      )}

      {deleteTarget && (
        <DeleteDialog
          open={!!deleteTarget}
          onOpenChange={open => !open && setDeleteTarget(null)}
          title={`Delete "${deleteTarget.name}"?`}
          onConfirm={() => deleteCertification(deleteTarget.id)}
        />
      )}
    </main>
  );
}
