'use client';

import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { Save, Loader2, RefreshCw, LayoutTemplate, Sparkles, BarChart3, Layers } from 'lucide-react';
import { updateSiteContentBatch } from '@/lib/actions/site-content';
import { DEFAULT_SITE_CONTENT, type SiteContentItem } from '@/lib/site-content-defaults';

interface Props {
  initialItems: SiteContentItem[];
}

export function AdminLandingClient({ initialItems }: Props) {
  const [items, setItems] = useState<Record<string, string>>(() => {
    const map: Record<string, string> = {};
    for (const def of DEFAULT_SITE_CONTENT) {
      map[def.key] = def.value;
    }
    for (const item of initialItems) {
      map[item.key] = item.value;
    }
    return map;
  });

  const [isPending, startTransition] = useTransition();

  const handleChange = (key: string, value: string) => {
    setItems(prev => ({ ...prev, [key]: value }));
  };

  const handleResetSection = (grp: string) => {
    const defaults = DEFAULT_SITE_CONTENT.filter(d => d.grp === grp);
    setItems(prev => {
      const next = { ...prev };
      for (const d of defaults) {
        next[d.key] = d.value;
      }
      return next;
    });
    toast.info(`Reset ${grp} to defaults (unsaved)`);
  };

  const handleSave = () => {
    startTransition(async () => {
      const updates = Object.entries(items).map(([key, value]) => ({ key, value }));
      const result = await updateSiteContentBatch(updates);

      if (result.ok) {
        toast.success('Landing page content saved successfully!');
      } else {
        toast.error('Failed to save changes. Please try again.');
      }
    });
  };

  const sections = [
    {
      id: 'hero',
      title: 'Hero Section',
      desc: 'Top welcoming section of the portfolio',
      icon: Sparkles,
      fields: DEFAULT_SITE_CONTENT.filter(d => d.grp === 'hero'),
    },
    {
      id: 'about',
      title: 'About Section',
      desc: 'Introductory bio and skills section heading',
      icon: LayoutTemplate,
      fields: DEFAULT_SITE_CONTENT.filter(d => d.grp === 'about'),
    },
    {
      id: 'stats',
      title: 'Counter Statistics',
      desc: 'Animated achievement statistics displayed in the About section',
      icon: BarChart3,
      fields: DEFAULT_SITE_CONTENT.filter(d => d.grp === 'stats'),
    },
    {
      id: 'bpsc',
      title: 'Highlights Section (BPSC)',
      desc: 'Titles and badges for Projects, Blogs, and Certifications highlights',
      icon: Layers,
      fields: DEFAULT_SITE_CONTENT.filter(d => d.grp === 'bpsc'),
    },
  ];

  return (
    <main className="flex flex-1 flex-col gap-6 p-6 w-full max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Landing Page Content</h1>
          <p className="text-sm text-muted-foreground">
            Customize all static text, labels, headings, and numbers on the homepage
          </p>
        </div>
        <button
          id="save-landing-btn"
          type="button"
          onClick={handleSave}
          disabled={isPending}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:opacity-90 active:scale-95 disabled:opacity-50 transition shadow-md shadow-primary/20"
        >
          {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {isPending ? 'Saving...' : 'Save All Changes'}
        </button>
      </div>

      <div className="space-y-6">
        {sections.map(section => {
          const Icon = section.icon;
          return (
            <div key={section.id} className="p-6 rounded-2xl border border-border bg-card shadow-xs">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-border/60">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-foreground">{section.title}</h2>
                    <p className="text-xs text-muted-foreground">{section.desc}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleResetSection(section.id)}
                  className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition px-2.5 py-1 rounded-md hover:bg-muted"
                  title="Reset this section to defaults"
                >
                  <RefreshCw className="w-3 h-3" />
                  Defaults
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {section.fields.map(field => (
                  <div key={field.key} className={field.key === 'about_heading' ? 'md:col-span-2' : ''}>
                    <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
                      {field.label}
                    </label>
                    {field.key === 'about_heading' ? (
                      <textarea
                        rows={2}
                        value={items[field.key] ?? ''}
                        onChange={e => handleChange(field.key, e.target.value)}
                        className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background shadow-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition resize-y"
                      />
                    ) : (
                      <input
                        type={field.type === 'number' ? 'number' : 'text'}
                        value={items[field.key] ?? ''}
                        onChange={e => handleChange(field.key, e.target.value)}
                        className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background shadow-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}
