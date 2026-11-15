import { getAllProjectsFromDb } from '@/lib/actions/project';
import { Code, Star, BarChart3, Archive, TrendingUp, Tag, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { formatDate } from '@/lib/utils';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { AdminPageHeader, ADMIN_PAGE_CLASS } from '@/components/admin/AdminPageHeader';

export const metadata: Metadata = { title: 'Thống kê dự án — Admin' };

function StatCard({ title, value, icon: Icon, color = 'default', sub }: {
  title: string; value: number | string; icon: React.ComponentType<{ className?: string }>;
  color?: 'default' | 'green' | 'yellow' | 'blue' | 'purple' | 'orange'; sub?: string;
}) {
  const colors = {
    default: 'bg-muted text-muted-foreground',
    green: 'bg-green-500/10 text-green-700',
    yellow: 'bg-amber-500/10 text-amber-700',
    blue: 'bg-blue-500/10 text-blue-700',
    purple: 'bg-purple-500/10 text-purple-700',
    orange: 'bg-orange-500/10 text-orange-700',
  };
  return (
    <div className="p-5 rounded-xl border border-border bg-card">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <div className={`p-2 rounded-lg ${colors[color]}`}>
          <Icon className="h-4 w-4" aria-hidden="true" />
        </div>
      </div>
      <p className="text-3xl font-bold text-foreground">{value}</p>
      {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
    </div>
  );
}

function MiniBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-muted-foreground w-20 shrink-0 truncate">{label}</span>
      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-medium text-foreground w-6 text-right">{value}</span>
    </div>
  );
}

export default async function ProjectsDashboardPage() {
  const projects = await getAllProjectsFromDb();

  const total = projects.length;
  const published = projects.filter(p => p.status === 'PUBLISHED').length;
  const draft = projects.filter(p => p.status === 'DRAFT').length;
  const archived = projects.filter(p => p.status === 'ARCHIVED').length;
  const featured = projects.filter(p => p.featured).length;
  const withDemo = projects.filter(p => p.demoUrl).length;

  // Tag distribution
  const tagMap = new Map<string, number>();
  for (const project of projects) {
    for (const t of project.tags) {
      tagMap.set(t.tag.name, (tagMap.get(t.tag.name) ?? 0) + 1);
    }
  }
  const topTags = [...tagMap.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8);
  const maxTagCount = topTags[0]?.[1] ?? 1;

  // Projects by month (last 6 months)
  const now = new Date();
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    return { label: `T${d.getMonth() + 1}`, year: d.getFullYear(), month: d.getMonth() };
  });
  const projectsByMonth = months.map(m => ({
    ...m,
    count: projects.filter(p => {
      const d = p.createdAt;
      return d.getFullYear() === m.year && d.getMonth() === m.month;
    }).length,
  }));
  const maxMonthCount = Math.max(...projectsByMonth.map(m => m.count), 1);

  const featuredProjects = projects.filter(p => p.featured);
  const recent = [...projects].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, 5);

  return (
    <main className={ADMIN_PAGE_CLASS}>
      <AdminPageHeader
        title="Thống kê dự án"
        description="Tổng quan và phân tích các dự án"
        actions={
          <Link
            href="/nhatphanhk102/projects"
            className="inline-flex items-center gap-2 px-4 py-2 border border-border rounded-lg text-sm font-medium hover:bg-muted transition-colors"
          >
            <Code className="h-4 w-4" aria-hidden="true" /> Xem tất cả dự án
          </Link>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard title="Tổng số" value={total} icon={Code} />
        <StatCard title="Đã xuất bản" value={published} icon={TrendingUp} color="green" sub="Đang hiển thị" />
        <StatCard title="Bản nháp" value={draft} icon={BarChart3} color="yellow" />
        <StatCard title="Lưu trữ" value={archived} icon={Archive} color="purple" />
        <StatCard title="Nổi bật" value={featured} icon={Star} color="orange" sub="Được làm nổi bật" />
        <StatCard title="Có demo" value={withDemo} icon={ExternalLink} color="blue" sub="Có URL chạy thử" />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Projects by month */}
        <div className="p-6 rounded-xl border border-border bg-card">
          <div className="flex items-center gap-2 mb-5">
            <BarChart3 className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            <h2 className="font-semibold text-foreground">Dự án mới thêm</h2>
            <span className="text-xs text-muted-foreground ml-auto">6 tháng gần nhất</span>
          </div>
          <div className="flex items-end gap-2 h-32">
            {projectsByMonth.map(m => {
              const pct = maxMonthCount > 0 ? (m.count / maxMonthCount) * 100 : 0;
              return (
                <div key={`${m.year}-${m.month}`} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-xs text-muted-foreground">{m.count > 0 ? m.count : ''}</span>
                  <div className="w-full bg-muted rounded-t overflow-hidden" style={{ height: '80px' }}>
                    <div
                      className="w-full bg-blue-500/60 rounded-t transition-all"
                      style={{ height: `${pct}%`, marginTop: `${100 - pct}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">{m.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top tech tags */}
        <div className="p-6 rounded-xl border border-border bg-card">
          <div className="flex items-center gap-2 mb-5">
            <Tag className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            <h2 className="font-semibold text-foreground">Công nghệ phổ biến</h2>
          </div>
          {topTags.length === 0 ? (
            <p className="text-sm text-muted-foreground">Chưa có thẻ nào.</p>
          ) : (
            <div className="space-y-3">
              {topTags.map(([name, count]) => (
                <MiniBar key={name} label={name} value={count} max={maxTagCount} color="bg-blue-500/60" />
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Status breakdown */}
        <div className="p-6 rounded-xl border border-border bg-card">
          <h2 className="font-semibold text-foreground mb-4">Phân bố trạng thái</h2>
          {total === 0 ? (
            <p className="text-sm text-muted-foreground">Chưa có dự án nào. <Link href="/nhatphanhk102/projects" className="text-primary underline">Thêm dự án đầu tiên.</Link></p>
          ) : (
            <div className="space-y-3">
              <MiniBar label="Đã xuất bản" value={published} max={total} color="bg-green-500" />
              <MiniBar label="Bản nháp" value={draft} max={total} color="bg-amber-500" />
              <MiniBar label="Lưu trữ" value={archived} max={total} color="bg-purple-500" />
              <MiniBar label="Nổi bật" value={featured} max={total} color="bg-orange-500" />
            </div>
          )}
        </div>

        {/* Featured projects */}
        <div className="p-6 rounded-xl border border-border bg-card">
          <div className="flex items-center gap-2 mb-4">
            <Star className="h-4 w-4 text-orange-500" aria-hidden="true" />
            <h2 className="font-semibold text-foreground">Dự án nổi bật</h2>
          </div>
          {featuredProjects.length === 0 ? (
            <p className="text-sm text-muted-foreground">Chưa có dự án nổi bật.</p>
          ) : (
            <div className="space-y-2">
              {featuredProjects.map(p => (
                <div key={p.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{p.title}</p>
                    <div className="flex gap-1 mt-0.5 flex-wrap">
                      {p.tags.slice(0, 2).map(t => (
                        <span key={t.tag.name} className="text-xs text-muted-foreground">{t.tag.name}</span>
                      ))}
                    </div>
                  </div>
                  {p.demoUrl && (
                    <a href={p.demoUrl} target="_blank" rel="noopener noreferrer" aria-label={`Mở demo ${p.title}`} className="text-muted-foreground hover:text-foreground ml-2">
                      <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent projects */}
      <div className="p-6 rounded-xl border border-border bg-card">
        <h2 className="font-semibold text-foreground mb-4">Mới thêm gần đây</h2>
        {recent.length === 0 ? (
          <p className="text-sm text-muted-foreground">Chưa có dự án nào.</p>
        ) : (
          <div className="divide-y divide-border">
            {recent.map(project => (
              <div key={project.id} className="flex items-center justify-between py-3 gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-foreground truncate">{project.title}</p>
                    {project.featured && (
                      <Star className="h-3 w-3 text-orange-500 shrink-0" aria-label="Nổi bật" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(project.createdAt, 'vi')}
                  </p>
                </div>
                <StatusBadge status={project.status} className="shrink-0" />
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
