import { getAllProjectsFromDb } from '@/lib/actions/project';
import { Code, Star, BarChart3, Archive, TrendingUp, Tag, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Projects Dashboard — Admin' };

function StatCard({ title, value, icon: Icon, color = 'default', sub }: {
  title: string; value: number | string; icon: React.ComponentType<{ className?: string }>;
  color?: 'default' | 'green' | 'yellow' | 'blue' | 'purple' | 'orange'; sub?: string;
}) {
  const colors = {
    default: 'bg-muted text-muted-foreground',
    green: 'bg-green-500/10 text-green-600 dark:text-green-400',
    yellow: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400',
    blue: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    purple: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
    orange: 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
  };
  return (
    <div className="p-5 rounded-xl border border-border bg-card">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <div className={`p-2 rounded-lg ${colors[color]}`}>
          <Icon className="h-4 w-4" />
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
    return { label: d.toLocaleString('en-US', { month: 'short' }), year: d.getFullYear(), month: d.getMonth() };
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
    <main className="flex flex-1 flex-col gap-6 p-6 max-w-6xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Projects Dashboard</h1>
          <p className="text-sm text-muted-foreground">Overview and analytics for your projects</p>
        </div>
        <Link
          href="/admin/projects"
          className="inline-flex items-center gap-2 px-4 py-2 border border-border rounded-lg text-sm font-medium hover:bg-muted transition-colors"
        >
          <Code className="h-4 w-4" /> View All Projects
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard title="Total" value={total} icon={Code} />
        <StatCard title="Published" value={published} icon={TrendingUp} color="green" sub="Live" />
        <StatCard title="Draft" value={draft} icon={BarChart3} color="yellow" />
        <StatCard title="Archived" value={archived} icon={Archive} color="purple" />
        <StatCard title="Featured" value={featured} icon={Star} color="orange" sub="Highlighted" />
        <StatCard title="With Demo" value={withDemo} icon={ExternalLink} color="blue" sub="Has live URL" />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Projects by month */}
        <div className="p-6 rounded-xl border border-border bg-card">
          <div className="flex items-center gap-2 mb-5">
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
            <h2 className="font-semibold text-foreground">Projects Added</h2>
            <span className="text-xs text-muted-foreground ml-auto">Last 6 months</span>
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
            <Tag className="h-4 w-4 text-muted-foreground" />
            <h2 className="font-semibold text-foreground">Top Technologies</h2>
          </div>
          {topTags.length === 0 ? (
            <p className="text-sm text-muted-foreground">No tags yet</p>
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
          <h2 className="font-semibold text-foreground mb-4">Status Breakdown</h2>
          {total === 0 ? (
            <p className="text-sm text-muted-foreground">No projects yet. <Link href="/admin/projects" className="text-primary underline">Add your first project.</Link></p>
          ) : (
            <div className="space-y-3">
              <MiniBar label="Published" value={published} max={total} color="bg-green-500" />
              <MiniBar label="Draft" value={draft} max={total} color="bg-yellow-500" />
              <MiniBar label="Archived" value={archived} max={total} color="bg-purple-500" />
              <MiniBar label="Featured" value={featured} max={total} color="bg-orange-500" />
            </div>
          )}
        </div>

        {/* Featured projects */}
        <div className="p-6 rounded-xl border border-border bg-card">
          <div className="flex items-center gap-2 mb-4">
            <Star className="h-4 w-4 text-orange-500" />
            <h2 className="font-semibold text-foreground">Featured Projects</h2>
          </div>
          {featuredProjects.length === 0 ? (
            <p className="text-sm text-muted-foreground">No featured projects yet.</p>
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
                    <a href={p.demoUrl} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground ml-2">
                      <ExternalLink className="h-3.5 w-3.5" />
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
        <h2 className="font-semibold text-foreground mb-4">Recently Added</h2>
        {recent.length === 0 ? (
          <p className="text-sm text-muted-foreground">No projects yet.</p>
        ) : (
          <div className="divide-y divide-border">
            {recent.map(project => (
              <div key={project.id} className="flex items-center justify-between py-3 gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-foreground truncate">{project.title}</p>
                    {project.featured && (
                      <Star className="h-3 w-3 text-orange-500 shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {project.createdAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
                <span className={`px-2 py-0.5 text-xs rounded-full shrink-0 ${
                  project.status === 'PUBLISHED' ? 'bg-green-500/10 text-green-600 dark:text-green-400'
                  : project.status === 'DRAFT' ? 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400'
                  : 'bg-muted text-muted-foreground'
                }`}>{project.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
