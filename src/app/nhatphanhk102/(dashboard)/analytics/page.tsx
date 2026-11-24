import Link from 'next/link';
import type { Metadata } from 'next';
import { Eye, Users, Layers, BookOpen, UserPlus, Globe, MonitorSmartphone, Link2, FileText, ExternalLink } from 'lucide-react';
import { AdminPageHeader, ADMIN_PAGE_CLASS } from '@/components/admin/AdminPageHeader';
import { StatCard, percentChange } from '@/components/admin/stats/StatCard';
import { MiniBar } from '@/components/admin/stats/MiniBar';
import { DailyColumnChart } from '@/components/admin/stats/DailyColumnChart';
import { ANALYTICS_RANGES, getAnalytics, parseRange, type CountRow } from '@/lib/analytics';
import { cn, formatDate } from '@/lib/utils';

export const metadata: Metadata = { title: 'Thống kê truy cập — Admin' };

const DEVICE_LABELS: Record<string, string> = {
  desktop: 'Máy tính',
  mobile: 'Điện thoại',
  tablet: 'Máy tính bảng',
  other: 'Khác',
};

const regionNames = new Intl.DisplayNames(['vi'], { type: 'region' });
const countryLabel = (code: string) => {
  try {
    return regionNames.of(code) ?? code;
  } catch {
    return code;
  }
};

function Panel({
  title,
  icon: Icon,
  aside,
  children,
  className,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  aside?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn('p-6 rounded-xl border border-border bg-card', className)}>
      <div className="flex items-center gap-2 mb-5">
        <Icon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
        <h2 className="font-semibold text-foreground">{title}</h2>
        {aside && <span className="text-xs text-muted-foreground ml-auto">{aside}</span>}
      </div>
      {children}
    </section>
  );
}

function TopList({ rows, format = (s: string) => s, empty = 'Chưa có dữ liệu.' }: { rows: CountRow[]; format?: (s: string) => string; empty?: string }) {
  if (rows.length === 0) return <p className="text-sm text-muted-foreground py-4 text-center">{empty}</p>;
  const max = rows[0].count;
  return (
    <div className="space-y-3">
      {rows.map(r => (
        <MiniBar key={r.label} label={format(r.label)} value={r.count} max={max} labelClassName="w-32 sm:w-40" />
      ))}
    </div>
  );
}

const fmt = (n: number) => n.toLocaleString('vi-VN');

export default async function AnalyticsPage({ searchParams }: { searchParams: Promise<{ range?: string }> }) {
  const range = parseRange((await searchParams).range);
  const data = await getAnalytics(range);
  const { totals, previous } = data;
  const pagesPerVisitor = totals.visitors > 0 ? (totals.views / totals.visitors).toFixed(1) : '0';
  const prevPagesPerVisitor = previous.visitors > 0 ? previous.views / previous.visitors : 0;
  const hasViews = totals.views > 0;

  return (
    <main className={ADMIN_PAGE_CLASS}>
      <AdminPageHeader
        title="Thống kê truy cập"
        description="Lượt xem trang của khách (không cookie, không lưu IP; bỏ qua bot và quản trị viên)"
        actions={
          <nav aria-label="Khoảng thời gian" className="inline-flex rounded-lg border border-border p-0.5 bg-muted/40">
            {ANALYTICS_RANGES.map(r => (
              <Link
                key={r}
                href={`/nhatphanhk102/analytics?range=${r}`}
                aria-current={r === range ? 'page' : undefined}
                className={cn(
                  'px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
                  r === range ? 'bg-background text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {r} ngày
              </Link>
            ))}
          </nav>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard title="Lượt xem trang" value={fmt(totals.views)} icon={Eye} color="blue" delta={percentChange(totals.views, previous.views)} />
        <StatCard title="Khách (theo ngày)" value={fmt(totals.visitors)} icon={Users} color="green" delta={percentChange(totals.visitors, previous.visitors)} />
        <StatCard
          title="Trang / khách"
          value={pagesPerVisitor}
          icon={Layers}
          delta={percentChange(Number(pagesPerVisitor), Number(prevPagesPerVisitor.toFixed(1)))}
        />
        <StatCard title="Lượt đọc bài viết" value={fmt(totals.blogViews)} icon={BookOpen} color="purple" delta={percentChange(totals.blogViews, previous.blogViews)} />
        <StatCard title="Khách để lại thông tin" value={fmt(totals.signups)} icon={UserPlus} color="yellow" delta={percentChange(totals.signups, previous.signups)} />
      </div>

      <Panel title="Lượt xem trang theo ngày" icon={Eye} aside={`Từ ${formatDate(data.start, 'vi', 'numeric')}`}>
        {hasViews ? (
          <DailyColumnChart
            label="Lượt xem trang theo ngày"
            unit="lượt xem"
            data={data.daily.map(d => ({ day: d.day, value: d.views, details: [`${fmt(d.visitors)} khách`] }))}
          />
        ) : (
          <p className="text-sm text-muted-foreground py-10 text-center">
            Chưa có lượt xem nào trong khoảng này. Số liệu bắt đầu được ghi từ khi bản cập nhật này được triển khai.
          </p>
        )}
      </Panel>

      <div className="grid md:grid-cols-2 gap-6">
        <Panel title="Trang được xem nhiều" icon={FileText}>
          <TopList rows={data.topPages} />
        </Panel>
        <Panel title="Nguồn truy cập" icon={Link2} aside="Ngoài trang này">
          <TopList rows={data.referrers} empty="Chưa có nguồn bên ngoài (truy cập trực tiếp)." />
        </Panel>
        <Panel title="Quốc gia" icon={Globe}>
          <TopList rows={data.countries} format={countryLabel} empty="Chưa có dữ liệu (chỉ có khi chạy trên Vercel)." />
        </Panel>
        <Panel title="Thiết bị & trình duyệt" icon={MonitorSmartphone}>
          <TopList rows={data.devices} format={d => DEVICE_LABELS[d] ?? d} />
          {data.browsers.length > 0 && (
            <div className="mt-5 pt-5 border-t border-border">
              <TopList rows={data.browsers.slice(0, 5)} />
            </div>
          )}
        </Panel>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Panel title="Lượt đọc bài viết theo ngày" icon={BookOpen} aside="Lọc trùng mỗi người">
          <DailyColumnChart
            label="Lượt đọc bài viết theo ngày"
            unit="lượt đọc"
            barClassName="bg-primary/50 group-hover:bg-primary/80"
            data={data.daily.map(d => ({ day: d.day, value: d.blogViews }))}
          />
          <div className="mt-6 space-y-2">
            <h3 className="text-sm font-medium text-foreground">Bài được đọc nhiều</h3>
            {data.topPosts.length === 0 ? (
              <p className="text-sm text-muted-foreground">Chưa có lượt đọc nào.</p>
            ) : (
              <ol className="divide-y divide-border">
                {data.topPosts.map(p => (
                  <li key={p.id} className="flex items-center justify-between gap-3 py-2">
                    <Link
                      href={`/nhatphanhk102/blogs/editor/${p.id}`}
                      className="text-sm text-foreground hover:text-primary truncate"
                    >
                      {p.title}
                    </Link>
                    <span className="flex items-center gap-2 shrink-0 text-xs text-muted-foreground tabular-nums">
                      {fmt(p.views)}
                      <Link
                        href={`/blog/${p.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Xem "${p.title}" trên web`}
                        className="hover:text-foreground"
                      >
                        <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                      </Link>
                    </span>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </Panel>

        <Panel title="Khách để lại thông tin" icon={UserPlus}>
          <DailyColumnChart
            label="Khách để lại thông tin theo ngày"
            unit="khách"
            barClassName="bg-primary/50 group-hover:bg-primary/80"
            data={data.daily.map(d => ({ day: d.day, value: d.signups }))}
          />
          <div className="mt-6 space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-foreground">Gần đây</h3>
              <Link href="/nhatphanhk102/visitors" className="text-xs text-primary hover:underline">
                Xem tất cả
              </Link>
            </div>
            {data.latestSignups.length === 0 ? (
              <p className="text-sm text-muted-foreground">Chưa có khách nào trong khoảng này.</p>
            ) : (
              <ul className="divide-y divide-border">
                {data.latestSignups.map(s => (
                  <li key={s.id} className="py-2">
                    <p className="text-sm font-medium text-foreground">
                      {s.name}{' '}
                      <span className="text-xs font-normal text-muted-foreground">· {formatDate(s.createdAt, 'vi', 'numeric')}</span>
                    </p>
                    <p className="text-xs text-muted-foreground line-clamp-2">{s.message}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Panel>
      </div>
    </main>
  );
}
