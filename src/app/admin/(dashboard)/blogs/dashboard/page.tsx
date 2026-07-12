import { getAllBlogsFromDb } from '@/lib/actions/blog';
import { FileText, BarChart3, TrendingUp, Archive, Eye, Tag } from 'lucide-react';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Blog Dashboard — Admin' };

function StatCard({ title, value, icon: Icon, color = 'default', sub }: {
  title: string; value: number | string; icon: React.ComponentType<{ className?: string }>;
  color?: 'default' | 'green' | 'yellow' | 'blue' | 'purple'; sub?: string;
}) {
  const colors = {
    default: 'bg-muted text-muted-foreground',
    green: 'bg-green-500/10 text-green-600 dark:text-green-400',
    yellow: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400',
    blue: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    purple: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
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

export default async function BlogDashboardPage() {
  const blogs = await getAllBlogsFromDb();

  const total = blogs.length;
  const published = blogs.filter(b => b.status === 'PUBLISHED').length;
  const draft = blogs.filter(b => b.status === 'DRAFT').length;
  const archived = blogs.filter(b => b.status === 'ARCHIVED').length;
  const totalViews = blogs.reduce((sum, b) => sum + (b.viewCount ?? 0), 0);

  // Tag distribution
  const tagMap = new Map<string, number>();
  for (const blog of blogs) {
    for (const t of blog.tags) {
      tagMap.set(t.tag.name, (tagMap.get(t.tag.name) ?? 0) + 1);
    }
  }
  const topTags = [...tagMap.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8);
  const maxTagCount = topTags[0]?.[1] ?? 1;

  // Posts per month (last 6 months)
  const now = new Date();
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    return { label: d.toLocaleString('en-US', { month: 'short' }), year: d.getFullYear(), month: d.getMonth() };
  });
  const postsByMonth = months.map(m => ({
    ...m,
    count: blogs.filter(b => {
      const d = b.publishedAt ?? b.createdAt;
      return d.getFullYear() === m.year && d.getMonth() === m.month;
    }).length,
  }));
  const maxMonthCount = Math.max(...postsByMonth.map(m => m.count), 1);

  const recent = [...blogs].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, 5);

  return (
    <main className="flex flex-1 flex-col gap-6 p-6 max-w-6xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Blog Dashboard</h1>
          <p className="text-sm text-muted-foreground">Overview and analytics for your blog posts</p>
        </div>
        <Link
          href="/admin/blogs"
          className="inline-flex items-center gap-2 px-4 py-2 border border-border rounded-lg text-sm font-medium hover:bg-muted transition-colors"
        >
          <FileText className="h-4 w-4" /> View All Posts
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard title="Total Posts" value={total} icon={FileText} />
        <StatCard title="Published" value={published} icon={TrendingUp} color="green" sub="Live on site" />
        <StatCard title="Drafts" value={draft} icon={BarChart3} color="yellow" sub="In progress" />
        <StatCard title="Archived" value={archived} icon={Archive} color="purple" sub="Hidden" />
        <StatCard title="Total Views" value={totalViews.toLocaleString()} icon={Eye} color="blue" sub="All time" />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Posts by month */}
        <div className="p-6 rounded-xl border border-border bg-card">
          <div className="flex items-center gap-2 mb-5">
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
            <h2 className="font-semibold text-foreground">Posts by Month</h2>
            <span className="text-xs text-muted-foreground ml-auto">Last 6 months</span>
          </div>
          <div className="flex items-end gap-2 h-32">
            {postsByMonth.map(m => {
              const pct = maxMonthCount > 0 ? (m.count / maxMonthCount) * 100 : 0;
              return (
                <div key={`${m.year}-${m.month}`} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-xs text-muted-foreground">{m.count > 0 ? m.count : ''}</span>
                  <div className="w-full bg-muted rounded-t overflow-hidden" style={{ height: '80px' }}>
                    <div
                      className="w-full bg-primary/70 rounded-t transition-all"
                      style={{ height: `${pct}%`, marginTop: `${100 - pct}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">{m.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top tags */}
        <div className="p-6 rounded-xl border border-border bg-card">
          <div className="flex items-center gap-2 mb-5">
            <Tag className="h-4 w-4 text-muted-foreground" />
            <h2 className="font-semibold text-foreground">Top Tags</h2>
          </div>
          {topTags.length === 0 ? (
            <p className="text-sm text-muted-foreground">No tags yet</p>
          ) : (
            <div className="space-y-3">
              {topTags.map(([name, count]) => (
                <MiniBar key={name} label={name} value={count} max={maxTagCount} color="bg-primary/60" />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Status breakdown */}
      <div className="p-6 rounded-xl border border-border bg-card">
        <h2 className="font-semibold text-foreground mb-4">Status Breakdown</h2>
        {total === 0 ? (
          <p className="text-sm text-muted-foreground">No posts yet. <Link href="/admin/blogs" className="text-primary underline">Create your first post.</Link></p>
        ) : (
          <div className="space-y-3">
            <MiniBar label="Published" value={published} max={total} color="bg-green-500" />
            <MiniBar label="Draft" value={draft} max={total} color="bg-yellow-500" />
            <MiniBar label="Archived" value={archived} max={total} color="bg-purple-500" />
          </div>
        )}
      </div>

      {/* Recent posts */}
      <div className="p-6 rounded-xl border border-border bg-card">
        <h2 className="font-semibold text-foreground mb-4">Recent Posts</h2>
        {recent.length === 0 ? (
          <p className="text-sm text-muted-foreground">No posts yet.</p>
        ) : (
          <div className="space-y-0 divide-y divide-border">
            {recent.map(blog => (
              <div key={blog.id} className="flex items-center justify-between py-3 gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{blog.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {blog.createdAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {blog.viewCount > 0 && (
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Eye className="h-3 w-3" />{blog.viewCount}
                    </span>
                  )}
                  <span className={`px-2 py-0.5 text-xs rounded-full ${
                    blog.status === 'PUBLISHED' ? 'bg-green-500/10 text-green-600 dark:text-green-400'
                    : blog.status === 'DRAFT' ? 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400'
                    : 'bg-muted text-muted-foreground'
                  }`}>{blog.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
