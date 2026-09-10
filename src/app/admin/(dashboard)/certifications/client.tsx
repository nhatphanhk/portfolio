'use client';

import { useState, useMemo } from 'react';
import { Award, Plus, Pencil, Trash2, ExternalLink, Search, Filter } from 'lucide-react';
import { CertificationDialog } from '@/components/admin/CertificationDialog';
import { DeleteDialog } from '@/components/admin/DeleteDialog';
import { PaginationControl } from '@/components/ui/PaginationControl';
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

const ITEMS_PER_PAGE = 10;

export function AdminCertificationsClient({ certifications }: { certifications: Certification[] }) {
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Certification | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Certification | null>(null);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  const toInputDate = (date: Date) => {
    return new Date(date).toISOString().split('T')[0];
  };

  const filtered = useMemo(() => {
    return certifications.filter(cert => {
      if (statusFilter !== 'ALL' && cert.status !== statusFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const matchName = cert.name.toLowerCase().includes(q);
        const matchIssuer = cert.issuer.toLowerCase().includes(q);
        const matchCred = (cert.credentialId ?? '').toLowerCase().includes(q);
        if (!matchName && !matchIssuer && !matchCred) return false;
      }
      return true;
    });
  }, [certifications, statusFilter, search]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE) || 1;
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filtered.slice(start, start + ITEMS_PER_PAGE);
  }, [filtered, currentPage]);

  return (
    <main className="flex flex-1 flex-col gap-6 p-6 w-full max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Certifications</h1>
          <p className="text-sm text-muted-foreground">{certifications.length} records total</p>
        </div>
        <button
          id="create-cert-btn"
          type="button"
          onClick={() => setCreateOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-foreground text-background rounded-lg text-sm font-medium hover:bg-foreground/90 transition-colors self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          Add Certification
        </button>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            placeholder="Search by certification name, issuer, credential ID..."
            value={search}
            onChange={e => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-border bg-card shadow-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-colors"
          />
        </div>

        <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border bg-card shadow-xs text-xs text-muted-foreground w-full sm:w-auto transition-colors">
          <Filter className="h-3.5 w-3.5" />
          <span className="font-medium">Status:</span>
          <select
            value={statusFilter}
            onChange={e => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-transparent text-foreground outline-none font-medium cursor-pointer"
          >
            <option value="ALL">All</option>
            <option value="ACTIVE">Active</option>
            <option value="EXPIRED">Expired</option>
          </select>
        </div>
      </div>

      {/* Table Container */}
      <div className="rounded-xl border border-border bg-card shadow-xs overflow-hidden">
        {paginated.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground bg-card">
            <Award className="h-10 w-10 mb-3 opacity-30" />
            <p className="font-medium text-foreground">No certifications found</p>
            <p className="text-xs text-muted-foreground mt-1">
              {search || statusFilter !== 'ALL'
                ? 'Try adjusting your search or filter'
                : 'Add your first certification to showcase your credentials'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-100/90 dark:bg-slate-800/90 border-b border-border text-slate-700 dark:text-slate-300 font-semibold text-xs uppercase tracking-wider">
                <tr>
                  <th className="text-left px-4 py-3.5 font-semibold text-slate-700 dark:text-slate-300">Certification</th>
                  <th className="text-left px-4 py-3.5 font-semibold text-slate-700 dark:text-slate-300 hidden sm:table-cell">Dates</th>
                  <th className="text-left px-4 py-3.5 font-semibold text-slate-700 dark:text-slate-300 hidden md:table-cell">Credential</th>
                  <th className="text-left px-4 py-3.5 font-semibold text-slate-700 dark:text-slate-300">Status</th>
                  <th className="px-4 py-3.5 text-right font-semibold text-slate-700 dark:text-slate-300">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-card">
                {paginated.map(cert => (
                  <tr
                    key={cert.id}
                    onClick={() => setEditTarget(cert)}
                    className="hover:bg-primary/5 cursor-pointer transition-colors group"
                  >
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <Award className="h-4 w-4 text-primary shrink-0" />
                        <div>
                          <p className="font-medium text-foreground group-hover:text-primary transition-colors">{cert.name}</p>
                          <p className="text-xs text-muted-foreground">{cert.issuer}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 hidden sm:table-cell text-muted-foreground">
                      <div>{formatDate(cert.issueDate)}</div>
                      {cert.expiryDate && (
                        <div className="text-xs opacity-75">Expires: {formatDate(cert.expiryDate)}</div>
                      )}
                    </td>
                    <td className="px-4 py-3.5 hidden md:table-cell">
                      {cert.credentialId ? (
                        <div className="flex items-center gap-1">
                          <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded text-muted-foreground">
                            {cert.credentialId}
                          </span>
                          {cert.credentialUrl && (
                            <a
                              href={cert.credentialUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="text-muted-foreground hover:text-foreground inline-flex"
                            >
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                        </div>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`px-2 py-0.5 text-xs rounded-full font-medium ${
                          cert.status === 'ACTIVE'
                            ? 'bg-green-500/10 text-green-700 dark:text-green-400'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {cert.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center gap-1 justify-end">
                        <button
                          type="button"
                          aria-label={`Edit ${cert.name}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditTarget(cert);
                          }}
                          className="p-1.5 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted cursor-pointer"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          aria-label={`Delete ${cert.name}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteTarget(cert);
                          }}
                          className="p-1.5 text-muted-foreground hover:text-destructive transition-colors rounded-lg hover:bg-destructive/10 cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {filtered.length > 0 && (
          <div className="p-4 bg-card border-t border-border">
            <PaginationControl
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filtered.length}
              pageSize={ITEMS_PER_PAGE}
              onPageChange={setCurrentPage}
            />
          </div>
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
          description="Are you sure you want to delete this certification? This action cannot be undone."
          onConfirm={() => deleteCertification(deleteTarget.id)}
        />
      )}
    </main>
  );
}
