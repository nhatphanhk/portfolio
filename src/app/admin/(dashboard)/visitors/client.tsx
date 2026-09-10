'use client';

import { useState, useMemo } from 'react';
import { Users, Trash2, Search, Calendar, Mail, MessageSquare, TrendingUp, Clock, Filter } from 'lucide-react';
import { deleteVisitorLog } from '@/lib/actions/contact';
import { DeleteDialog } from '@/components/admin/DeleteDialog';
import { PaginationControl } from '@/components/ui/PaginationControl';

type VisitorLog = {
  id: string;
  name: string;
  email: string;
  message: string;
  status: string;
  createdAt: Date;
  ipAddress: string | null;
};

const ITEMS_PER_PAGE = 12;

interface Props {
  logs: VisitorLog[];
}

function StatCard({
  title,
  value,
  icon: Icon,
  isActive,
  onClick,
}: {
  title: string;
  value: number | string;
  icon: React.ComponentType<{ className?: string }>;
  isActive?: boolean;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={`p-5 rounded-xl border transition-all cursor-pointer ${
        isActive
          ? 'border-primary ring-2 ring-primary/20 bg-primary/5 shadow-xs'
          : 'border-border bg-card hover:border-primary/40 shadow-xs'
      }`}
    >
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
  const [timeFilter, setTimeFilter] = useState<'ALL' | 'TODAY' | 'WEEK' | 'MONTH'>('ALL');
  const [deleteTarget, setDeleteTarget] = useState<VisitorLog | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const now = useMemo(() => new Date(), []);
  const todayCount = useMemo(() => {
    return logs.filter(l => {
      const d = new Date(l.createdAt);
      return d.toDateString() === now.toDateString();
    }).length;
  }, [logs, now]);

  const thisWeekCount = useMemo(() => {
    return logs.filter(l => {
      const d = new Date(l.createdAt);
      const diff = (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24);
      return diff <= 7;
    }).length;
  }, [logs, now]);

  const thisMonthCount = useMemo(() => {
    return logs.filter(l => {
      const d = new Date(l.createdAt);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length;
  }, [logs, now]);

  const filtered = useMemo(() => {
    return logs.filter(l => {
      // Time filter
      if (timeFilter === 'TODAY') {
        const d = new Date(l.createdAt);
        if (d.toDateString() !== now.toDateString()) return false;
      } else if (timeFilter === 'WEEK') {
        const d = new Date(l.createdAt);
        const diff = (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24);
        if (diff > 7) return false;
      } else if (timeFilter === 'MONTH') {
        const d = new Date(l.createdAt);
        if (d.getMonth() !== now.getMonth() || d.getFullYear() !== now.getFullYear()) return false;
      }

      // Search query
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const matchName = l.name.toLowerCase().includes(q);
        const matchEmail = l.email.toLowerCase().includes(q);
        const matchMsg = l.message.toLowerCase().includes(q);
        if (!matchName && !matchEmail && !matchMsg) return false;
      }

      return true;
    });
  }, [logs, timeFilter, search, now]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE) || 1;
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filtered.slice(start, start + ITEMS_PER_PAGE);
  }, [filtered, currentPage]);

  const handleTimeFilter = (f: 'ALL' | 'TODAY' | 'WEEK' | 'MONTH') => {
    setTimeFilter(prev => (prev === f ? 'ALL' : f));
    setCurrentPage(1);
  };

  return (
    <main className="flex flex-1 flex-col gap-6 p-6 w-full max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Visitor Logs</h1>
          <p className="text-sm text-muted-foreground">Track and manage visitors who registered via the visitor modal</p>
        </div>
      </div>

      {/* Stats - clickable filters */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Visitors"
          value={logs.length}
          icon={Users}
          isActive={timeFilter === 'ALL'}
          onClick={() => handleTimeFilter('ALL')}
        />
        <StatCard
          title="Today"
          value={todayCount}
          icon={Clock}
          isActive={timeFilter === 'TODAY'}
          onClick={() => handleTimeFilter('TODAY')}
        />
        <StatCard
          title="This Week"
          value={thisWeekCount}
          icon={TrendingUp}
          isActive={timeFilter === 'WEEK'}
          onClick={() => handleTimeFilter('WEEK')}
        />
        <StatCard
          title="This Month"
          value={thisMonthCount}
          icon={Calendar}
          isActive={timeFilter === 'MONTH'}
          onClick={() => handleTimeFilter('MONTH')}
        />
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <input
            id="visitor-search"
            type="text"
            placeholder="Search by name, email, or reason..."
            value={search}
            onChange={e => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-border bg-white shadow-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border bg-card shadow-xs text-xs text-muted-foreground w-full sm:w-auto">
          <Filter className="h-3.5 w-3.5" />
          <span className="font-medium">Filter Time:</span>
          <select
            value={timeFilter}
            onChange={e => {
              setTimeFilter(e.target.value as any);
              setCurrentPage(1);
            }}
            className="bg-transparent text-foreground outline-none font-medium cursor-pointer"
          >
            <option value="ALL">All Time</option>
            <option value="TODAY">Today</option>
            <option value="WEEK">This Week</option>
            <option value="MONTH">This Month</option>
          </select>
        </div>
      </div>

      {/* Table Container */}
      <div className="rounded-xl border border-border bg-card shadow-xs overflow-hidden">
        {paginated.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground bg-card">
            <Users className="h-10 w-10 mb-3 opacity-30" />
            <p className="font-medium text-foreground">{logs.length === 0 ? 'No visitors logged yet' : 'No results match your filter'}</p>
            {logs.length === 0 ? (
              <p className="text-sm opacity-60 mt-1">Visitors will appear here after they register via the visitor modal on your site</p>
            ) : (
              <p className="text-xs text-muted-foreground mt-1">Try clearing your search query or selecting &quot;All Time&quot;</p>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-100/90 dark:bg-slate-800/90 border-b border-border text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300 font-semibold">
                <tr>
                  <th className="text-left px-4 py-3.5 font-semibold text-slate-700 dark:text-slate-300">Visitor</th>
                  <th className="text-left px-4 py-3.5 font-semibold text-slate-700 dark:text-slate-300 hidden md:table-cell">
                    <span className="flex items-center gap-1.5">
                      <MessageSquare className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" /> Reason
                    </span>
                  </th>
                  <th className="text-left px-4 py-3.5 font-semibold text-slate-700 dark:text-slate-300 hidden sm:table-cell">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" /> Date
                    </span>
                  </th>
                  <th className="px-4 py-3.5 text-right font-semibold text-slate-700 dark:text-slate-300">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-card">
                {paginated.map(log => (
                  <tr key={log.id} className="hover:bg-primary/5 transition-colors">
                    <td className="px-4 py-3.5">
                      <div>
                        <p className="font-medium text-foreground">{log.name}</p>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                          <Mail className="h-3 w-3" />
                          <span>{log.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 hidden md:table-cell">
                      <p className="text-sm text-muted-foreground line-clamp-2 max-w-xs">{log.message}</p>
                    </td>
                    <td className="px-4 py-3.5 text-muted-foreground text-xs hidden sm:table-cell">
                      <div>
                        <p>
                          {new Date(log.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </p>
                        <p className="opacity-60">
                          {new Date(log.createdAt).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <button
                        type="button"
                        aria-label={`Delete log from ${log.name}`}
                        onClick={() => setDeleteTarget(log)}
                        className="p-1.5 text-muted-foreground hover:text-destructive transition-colors rounded-lg hover:bg-destructive/10 cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
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
