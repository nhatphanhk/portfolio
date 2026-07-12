'use client';

import { useState, useMemo } from 'react';
import { Users, Trash2, Search, Calendar, Mail, MessageSquare, TrendingUp, Clock } from 'lucide-react';
import { deleteVisitorLog } from '@/lib/actions/contact';
import { DeleteDialog } from '@/components/admin/DeleteDialog';

type VisitorLog = {
  id: string;
  name: string;
  email: string;
  message: string;
  status: string;
  createdAt: Date;
  ipAddress: string | null;
};

interface Props {
  logs: VisitorLog[];
}

function StatCard({ title, value, icon: Icon }: {
  title: string; value: number | string; icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="p-5 rounded-xl border border-border bg-card">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <div className="p-2 rounded-lg bg-muted">
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>
      <p className="text-3xl font-bold text-foreground">{value}</p>
    </div>
  );
}

export function VisitorLogsClient({ logs }: Props) {
  const [search, setSearch] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<VisitorLog | null>(null);

  const now = new Date();
  const today = logs.filter(l => {
    const d = new Date(l.createdAt);
    return d.toDateString() === now.toDateString();
  }).length;
  const thisWeek = logs.filter(l => {
    const d = new Date(l.createdAt);
    const diff = (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24);
    return diff <= 7;
  }).length;
  const thisMonth = logs.filter(l => {
    const d = new Date(l.createdAt);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return logs;
    return logs.filter(l =>
      l.name.toLowerCase().includes(q) ||
      l.email.toLowerCase().includes(q) ||
      l.message.toLowerCase().includes(q)
    );
  }, [logs, search]);

  return (
    <main className="flex flex-1 flex-col gap-6 p-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Visitor Logs</h1>
          <p className="text-sm text-muted-foreground">Track and manage visitors who registered via the visitor modal</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Total Visitors" value={logs.length} icon={Users} />
        <StatCard title="Today" value={today} icon={Clock} />
        <StatCard title="This Week" value={thisWeek} icon={TrendingUp} />
        <StatCard title="This Month" value={thisMonth} icon={Calendar} />
      </div>

      {/* Search & Table */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <input
              id="visitor-search"
              type="text"
              placeholder="Search by name, email, or reason..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <span className="text-sm text-muted-foreground">
            {filtered.length} of {logs.length}
          </span>
        </div>

        <div className="rounded-xl border border-border overflow-hidden">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
              <Users className="h-10 w-10 mb-3 opacity-30" />
              <p>{logs.length === 0 ? 'No visitors logged yet' : 'No results match your search'}</p>
              {logs.length === 0 && (
                <p className="text-sm opacity-60 mt-1">Visitors will appear here after they register via the visitor modal on your site</p>
              )}
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Visitor</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">
                    <span className="flex items-center gap-1"><MessageSquare className="h-3.5 w-3.5" /> Reason</span>
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">
                    <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> Date</span>
                  </th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map(log => (
                  <tr key={log.id} className="bg-card hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-foreground">{log.name}</p>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                          <Mail className="h-3 w-3" />
                          <span>{log.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <p className="text-sm text-muted-foreground line-clamp-2 max-w-xs">{log.message}</p>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs hidden sm:table-cell">
                      <div>
                        <p>{new Date(log.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                        <p className="opacity-60">{new Date(log.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        aria-label={`Delete log from ${log.name}`}
                        onClick={() => setDeleteTarget(log)}
                        className="p-1.5 text-muted-foreground hover:text-destructive transition-colors rounded-md hover:bg-destructive/10"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Delete dialog */}
      {deleteTarget && (
        <DeleteDialog
          open={!!deleteTarget}
          onOpenChange={open => !open && setDeleteTarget(null)}
          title={`Delete log from "${deleteTarget.name}"?`}
          description="This will permanently remove this visitor log entry."
          onConfirm={() => deleteVisitorLog(deleteTarget.id)}
        />
      )}
    </main>
  );
}
