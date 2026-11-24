'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Award,
  BookOpen,
  CheckCircle2,
  Clock,
  Flame,
  FileText,
  Rocket,
  Route,
  Sprout,
  Trophy,
  X,
  CalendarDays,
} from 'lucide-react';
import { useLanguage } from '@/lib/i18n/context';
import { PublicPageHeader } from '@/components/ui/PublicPageHeader';
import { cn, formatDate } from '@/lib/utils';
import type { JourneyData, JourneyEvent, JourneyEventType } from '@/lib/journey';

const TYPE_ICONS: Record<JourneyEventType, React.ComponentType<{ className?: string }>> = {
  log: BookOpen,
  capability: CheckCircle2,
  'skill-achieved': Trophy,
  'skill-started': Sprout,
  certification: Award,
  post: FileText,
  project: Rocket,
};

const TYPE_ORDER: JourneyEventType[] = ['log', 'capability', 'skill-achieved', 'skill-started', 'certification', 'post', 'project'];
const PAGE_SIZE = 30;
const DAY_MS = 24 * 60 * 60 * 1000;

/** One sequential hue (primary), light → dark. */
const LEVEL_CLASSES = ['bg-muted', 'bg-primary/25', 'bg-primary/45', 'bg-primary/70', 'bg-primary'];

function levelOf(count: number, hours: number): number {
  const score = hours > 0 ? hours : count;
  if (score <= 0) return 0;
  if (score <= 1) return 1;
  if (score <= 2) return 2;
  if (score <= 4) return 3;
  return 4;
}

interface Cell {
  day: string;
  count: number;
  hours: number;
}

/** Year grid: one column per week (Monday first), leading blanks before 1 January. */
function buildYear(year: number, activity: JourneyData['activity']) {
  const start = Date.UTC(year, 0, 1);
  const end = Date.UTC(year + 1, 0, 1);
  const lead = (new Date(start).getUTCDay() + 6) % 7;
  const cells: (Cell | null)[] = Array.from({ length: lead }, () => null);
  const monthColumns: { month: number; col: number }[] = [];
  for (let t = start; t < end; t += DAY_MS) {
    const d = new Date(t);
    const day = d.toISOString().slice(0, 10);
    if (d.getUTCDate() === 1) monthColumns.push({ month: d.getUTCMonth(), col: Math.floor(cells.length / 7) });
    const a = activity[day];
    cells.push({ day, count: a?.count ?? 0, hours: a?.hours ?? 0 });
  }
  return { cells, weeks: Math.ceil(cells.length / 7), monthColumns };
}

function EventItem({ event }: { event: JourneyEvent }) {
  const { t, locale } = useLanguage();
  const Icon = TYPE_ICONS[event.type];
  const body = (
    <>
      <span className="absolute -left-[13px] top-0.5 flex h-6 w-6 items-center justify-center rounded-full border-2 border-background bg-primary/10 text-primary">
        <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      </span>
      <p className="text-xs text-muted-foreground">
        <span className="font-semibold text-primary">{t(`journey.types.${event.type}`)}</span>
        {' · '}
        <time dateTime={event.date}>{formatDate(event.date, locale, 'long')}</time>
        {event.hours ? ` · ${event.hours} ${t('journey.hours')}` : ''}
      </p>
      <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
        {event.type === 'capability' ? `${t('journey.canNow')} ${event.title}` : event.title}
      </p>
      {event.subtitle && <p className="text-xs font-medium text-muted-foreground">{event.subtitle}</p>}
      {event.note && <p className="text-sm text-muted-foreground line-clamp-2 mt-0.5 whitespace-pre-line">{event.note}</p>}
    </>
  );
  return (
    <li className="relative ml-4 pl-5">
      {event.href ? (
        <Link href={event.href} className="group block rounded-lg -m-2 p-2 hover:bg-muted/50 transition-colors">
          {body}
        </Link>
      ) : (
        <div className="-m-2 p-2">{body}</div>
      )}
    </li>
  );
}

export default function JourneyClient({ data }: { data: JourneyData }) {
  const { t, locale } = useLanguage();
  const [year, setYear] = useState(data.years[0]);
  const [type, setType] = useState<JourneyEventType | 'all'>('all');
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [visible, setVisible] = useState(PAGE_SIZE);

  const grid = useMemo(() => buildYear(year, data.activity), [year, data.activity]);

  const yearEvents = useMemo(() => data.events.filter(e => e.date.startsWith(String(year))), [data.events, year]);
  const typeCounts = useMemo(() => {
    const counts = new Map<JourneyEventType, number>();
    for (const e of yearEvents) counts.set(e.type, (counts.get(e.type) ?? 0) + 1);
    return counts;
  }, [yearEvents]);

  const filtered = useMemo(
    () =>
      yearEvents.filter(
        e => (type === 'all' || e.type === type) && (!selectedDay || e.date.slice(0, 10) === selectedDay)
      ),
    [yearEvents, type, selectedDay]
  );

  const groups = useMemo(() => {
    const out: { key: string; events: JourneyEvent[] }[] = [];
    for (const e of filtered.slice(0, visible)) {
      const key = e.date.slice(0, 7);
      const last = out[out.length - 1];
      if (last?.key === key) last.events.push(e);
      else out.push({ key, events: [e] });
    }
    return out;
  }, [filtered, visible]);

  const yearActiveDays = grid.cells.filter(c => c && c.count > 0).length;

  const changeYear = (y: number) => {
    setYear(y);
    setSelectedDay(null);
    setVisible(PAGE_SIZE);
  };

  const stats = [
    { icon: Clock, value: data.stats.totalHours, label: t('journey.stats.hours') },
    { icon: BookOpen, value: data.stats.journalEntries, label: t('journey.stats.entries') },
    { icon: CheckCircle2, value: data.stats.capabilitiesAchieved, label: t('journey.stats.capabilities') },
    { icon: Flame, value: data.stats.currentStreak, label: t('journey.stats.currentStreak') },
    { icon: Trophy, value: data.stats.longestStreak, label: t('journey.stats.longestStreak') },
  ];

  const monthName = (m: number) => new Date(Date.UTC(2000, m, 1)).toLocaleDateString(locale === 'vi' ? 'vi-VN' : 'en-US', { month: 'short', timeZone: 'UTC' });

  return (
    <div>
      <PublicPageHeader badge={{ label: t('journey.badge'), icon: Route }} title={t('journey.title')} subtitle={t('journey.subtitle')} />

      {/* Stats */}
      <dl className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-8">
        {stats.map(s => (
          <div key={s.label} className="rounded-xl border border-border bg-card p-4">
            <dt className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
              <s.icon className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
              {s.label}
            </dt>
            <dd className="text-2xl font-black text-foreground mt-1 tabular-nums">{s.value.toLocaleString(locale === 'vi' ? 'vi-VN' : 'en-US')}</dd>
          </div>
        ))}
      </dl>

      {/* Heatmap */}
      <section aria-labelledby="activity-heading" className="rounded-2xl border border-border bg-card p-4 sm:p-6 mb-10">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h2 id="activity-heading" className="text-lg font-bold text-foreground">
            {t('journey.heatmap.title')}{' '}
            <span className="text-sm font-medium text-muted-foreground">
              · {yearActiveDays} {t('journey.stats.activeDays')}
            </span>
          </h2>
          <div className="flex flex-wrap gap-1" role="group" aria-label={t('journey.heatmap.year')}>
            {data.years.map(y => (
              <button
                key={y}
                type="button"
                onClick={() => changeYear(y)}
                aria-pressed={y === year}
                className={cn(
                  'px-3 py-1 rounded-full text-xs font-semibold transition-colors cursor-pointer',
                  y === year ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'
                )}
              >
                {y}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto pb-2">
          <div className="inline-block min-w-max">
            <div
              className="grid gap-[3px] text-[10px] text-muted-foreground mb-1"
              style={{ gridTemplateColumns: `repeat(${grid.weeks}, 12px)` }}
              aria-hidden="true"
            >
              {grid.monthColumns.map(m => (
                <span key={m.month} style={{ gridColumnStart: m.col + 1 }} className="whitespace-nowrap">
                  {monthName(m.month)}
                </span>
              ))}
            </div>
            <div className="grid grid-flow-col grid-rows-7 gap-[3px]" style={{ gridAutoColumns: '12px' }}>
              {grid.cells.map((c, i) => {
                if (!c) return <span key={`blank-${i}`} className="h-3 w-3" aria-hidden="true" />;
                const label = `${formatDate(c.day, locale, 'long')}: ${
                  c.count > 0
                    ? `${c.count} ${t('journey.heatmap.activities')}${c.hours ? `, ${c.hours} ${t('journey.hours')}` : ''}`
                    : t('journey.heatmap.noActivity')
                }`;
                const level = levelOf(c.count, c.hours);
                return (
                  <button
                    key={c.day}
                    type="button"
                    title={label}
                    aria-label={label}
                    disabled={c.count === 0}
                    aria-pressed={selectedDay === c.day}
                    onClick={() => {
                      setSelectedDay(selectedDay === c.day ? null : c.day);
                      setVisible(PAGE_SIZE);
                    }}
                    className={cn(
                      'h-3 w-3 rounded-[3px] transition-shadow',
                      LEVEL_CLASSES[level],
                      c.count > 0 && 'cursor-pointer hover:ring-2 hover:ring-primary/40',
                      selectedDay === c.day && 'ring-2 ring-foreground'
                    )}
                  />
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-1.5 mt-3 text-[11px] text-muted-foreground" aria-hidden="true">
          {t('journey.heatmap.less')}
          {LEVEL_CLASSES.map(c => (
            <span key={c} className={cn('h-3 w-3 rounded-[3px]', c)} />
          ))}
          {t('journey.heatmap.more')}
        </div>
      </section>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 mb-6" role="group" aria-label={t('journey.filterLabel')}>
        {(['all', ...TYPE_ORDER] as const).map(k => {
          const count = k === 'all' ? yearEvents.length : (typeCounts.get(k) ?? 0);
          if (k !== 'all' && count === 0) return null;
          const Icon = k === 'all' ? null : TYPE_ICONS[k];
          return (
            <button
              key={k}
              type="button"
              onClick={() => {
                setType(k);
                setVisible(PAGE_SIZE);
              }}
              aria-pressed={type === k}
              className={cn(
                'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors cursor-pointer',
                type === k ? 'bg-primary text-primary-foreground border-primary' : 'bg-card text-muted-foreground border-border hover:text-foreground'
              )}
            >
              {Icon && <Icon className="h-3.5 w-3.5" aria-hidden="true" />}
              {k === 'all' ? t('journey.filters.all') : t(`journey.types.${k}`)}
              <span className="opacity-70 tabular-nums">{count}</span>
            </button>
          );
        })}
        {selectedDay && (
          <button
            type="button"
            onClick={() => setSelectedDay(null)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-foreground text-background cursor-pointer"
          >
            <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
            {formatDate(selectedDay, locale, 'medium')}
            <X className="h-3.5 w-3.5" aria-label={t('journey.clearDay')} />
          </button>
        )}
      </div>

      {/* Timeline */}
      {filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground py-12 text-center rounded-2xl border border-dashed border-border">
          {data.events.length === 0 ? t('journey.empty') : t('journey.emptyFilter')}
        </p>
      ) : (
        <div className="space-y-8">
          {groups.map(g => (
            <section key={g.key} aria-label={formatDate(`${g.key}-01`, locale, 'monthYear')}>
              <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground mb-4">
                {formatDate(`${g.key}-01`, locale, { year: 'numeric', month: 'long' })}
              </h3>
              <ol className="relative border-l border-border ml-3 space-y-5">
                {g.events.map(e => (
                  <EventItem key={e.id} event={e} />
                ))}
              </ol>
            </section>
          ))}
          {filtered.length > visible && (
            <div className="text-center">
              <button
                type="button"
                onClick={() => setVisible(v => v + PAGE_SIZE)}
                className="px-5 py-2 rounded-full border border-border text-sm font-semibold text-foreground hover:bg-muted transition-colors cursor-pointer"
              >
                {t('journey.loadMore')} ({filtered.length - visible})
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
