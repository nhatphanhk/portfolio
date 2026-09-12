'use client';

import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import {
  Save,
  Loader2,
  RefreshCw,
  LayoutTemplate,
  Sparkles,
  BarChart3,
  Layers,
  Languages,
} from 'lucide-react';
import { saveSiteContentBundle, type SiteContentBundle } from '@/lib/actions/site-content';
import {
  DEFAULT_SITE_CONTENT,
  DEFAULT_VI_SITE_CONTENT,
  TRANSLATABLE_SITE_CONTENT_KEYS,
  type SiteContentItem,
} from '@/lib/site-content-defaults';

interface Props {
  initialItems: SiteContentItem[];
  initialBundle?: SiteContentBundle;
}

export function AdminLandingClient({ initialItems, initialBundle }: Props) {
  const [activeTab, setActiveTab] = useState<'en' | 'vi'>('en');
  const [isTranslating, setIsTranslating] = useState(false);
  const [isPending, startTransition] = useTransition();

  // English content state
  const [itemsEn, setItemsEn] = useState<Record<string, string>>(() => {
    const map: Record<string, string> = {};
    for (const def of DEFAULT_SITE_CONTENT) {
      map[def.key] = def.value;
    }
    for (const item of initialItems) {
      map[item.key] = item.value;
    }
    if (initialBundle?.en) {
      Object.assign(map, initialBundle.en);
    }
    return map;
  });

  // Vietnamese content state
  const [itemsVi, setItemsVi] = useState<Record<string, string>>(() => {
    const map: Record<string, string> = { ...itemsEn, ...DEFAULT_VI_SITE_CONTENT };
    if (initialBundle?.vi) {
      Object.assign(map, initialBundle.vi);
    }
    return map;
  });

  const isTranslatable = (key: string) => {
    return (TRANSLATABLE_SITE_CONTENT_KEYS as readonly string[]).includes(key);
  };

  const currentItems = activeTab === 'en' ? itemsEn : itemsVi;

  const handleChange = (key: string, value: string) => {
    // If it's a non-translatable field (image URLs, numeric stat counts), sync across both languages
    if (!isTranslatable(key)) {
      setItemsEn(prev => ({ ...prev, [key]: value }));
      setItemsVi(prev => ({ ...prev, [key]: value }));
      return;
    }

    if (activeTab === 'en') {
      setItemsEn(prev => ({ ...prev, [key]: value }));
    } else {
      setItemsVi(prev => ({ ...prev, [key]: value }));
    }
  };

  const handleResetSection = (grp: string) => {
    const defaults = DEFAULT_SITE_CONTENT.filter(d => d.grp === grp);
    if (activeTab === 'en') {
      setItemsEn(prev => {
        const next = { ...prev };
        for (const d of defaults) {
          next[d.key] = d.value;
        }
        return next;
      });
      toast.info(`Reset ${grp} (English) to defaults`);
    } else {
      setItemsVi(prev => {
        const next = { ...prev };
        for (const d of defaults) {
          if (DEFAULT_VI_SITE_CONTENT[d.key]) {
            next[d.key] = DEFAULT_VI_SITE_CONTENT[d.key];
          } else {
            next[d.key] = d.value;
          }
        }
        return next;
      });
      toast.info(`Reset ${grp} (Tiếng Việt) to defaults`);
    }
  };

  // AI Translation with Google Gemini via /api/translate
  const handleAiTranslate = async () => {
    const targetLocale = activeTab === 'en' ? 'vi' : 'en';
    const sourceData = activeTab === 'en' ? itemsEn : itemsVi;

    setIsTranslating(true);
    const toastId = toast.loading(
      `Đang dịch toàn bộ landing page sang ${targetLocale === 'vi' ? 'Tiếng Việt' : 'Tiếng Anh'} bằng Gemini AI...`
    );

    try {
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entityType: 'site_content',
          targetLocale,
          action: 'preview',
          siteData: sourceData,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.ok || !json.data) {
        throw new Error(json.error || 'Dịch tự động thất bại');
      }

      if (targetLocale === 'vi') {
        setItemsVi(prev => ({ ...prev, ...json.data }));
        setActiveTab('vi');
        toast.success('Đã chuyển ngữ thành công sang Tiếng Việt! Vui lòng xem lại và bấm Lưu.', {
          id: toastId,
        });
      } else {
        setItemsEn(prev => ({ ...prev, ...json.data }));
        setActiveTab('en');
        toast.success('Translated successfully to English! Please review and click Save.', {
          id: toastId,
        });
      }
    } catch (err: any) {
      console.error('AI translation error:', err);
      toast.error(err.message || 'Lỗi khi dịch nội dung với AI', { id: toastId });
    } finally {
      setIsTranslating(false);
    }
  };

  const handleSave = () => {
    startTransition(async () => {
      const result = await saveSiteContentBundle({
        en: itemsEn,
        vi: itemsVi,
      });

      if (result.ok) {
        toast.success('Đã lưu nội dung và bản dịch Landing Page thành công!');
      } else {
        toast.error(result.error || 'Lỗi khi lưu dữ liệu. Vui lòng thử lại.');
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
      title: 'About Section & Author Showcase',
      desc: 'Introductory bio, author portrait & workspace photos, and philosophy quote',
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
      {/* Header & Main Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2.5">
            <span>Landing Page Content</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-semibold border border-primary/20">
              AI i18n
            </span>
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Quản lý và chuyển ngữ toàn diện các tiêu đề, mô tả, ảnh tác giả và nhãn hiển thị trên trang chủ
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* AI Translate Button */}
          <button
            id="ai-translate-landing-btn"
            type="button"
            onClick={handleAiTranslate}
            disabled={isTranslating || isPending}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white rounded-xl text-sm font-semibold hover:opacity-95 active:scale-95 disabled:opacity-50 transition shadow-md shadow-indigo-500/25 cursor-pointer"
            title={`Dịch tự động sang ${activeTab === 'en' ? 'Tiếng Việt' : 'Tiếng Anh'} bằng Gemini AI`}
          >
            {isTranslating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4 text-amber-300" />
            )}
            <span>
              {isTranslating
                ? 'Đang dịch AI...'
                : activeTab === 'en'
                ? 'Dịch sang Tiếng Việt (AI)'
                : 'Dịch sang Tiếng Anh (AI)'}
            </span>
          </button>

          {/* Save All Changes Button */}
          <button
            id="save-landing-btn"
            type="button"
            onClick={handleSave}
            disabled={isPending || isTranslating}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:opacity-90 active:scale-95 disabled:opacity-50 transition shadow-md shadow-primary/20 cursor-pointer"
          >
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{isPending ? 'Đang lưu...' : 'Lưu Tất Cả'}</span>
          </button>
        </div>
      </div>

      {/* Language Tabs Switcher */}
      <div className="flex items-center justify-between p-1.5 rounded-2xl bg-muted/70 border border-border">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setActiveTab('en')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'en'
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <span className="text-base">🇬🇧</span>
            <span>English (Tiếng Anh)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('vi')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'vi'
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <span className="text-base">🇻🇳</span>
            <span>Tiếng Việt (Bản dịch)</span>
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-2 pr-3 text-xs text-muted-foreground">
          <Languages className="w-3.5 h-3.5 text-primary" />
          <span>Đang chỉnh sửa: <strong>{activeTab === 'en' ? 'Bản gốc Tiếng Anh' : 'Bản dịch Tiếng Việt'}</strong></span>
        </div>
      </div>

      {/* Sections Accordions / Cards */}
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
                  className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition px-2.5 py-1 rounded-md hover:bg-muted cursor-pointer"
                  title="Đặt lại mục này về mặc định"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Defaults ({activeTab.toUpperCase()})</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {section.fields.map(field => {
                  const isMultiline =
                    field.key === 'about_heading' || field.key === 'about_author_quote';
                  const translatable = isTranslatable(field.key);
                  const enRefValue = itemsEn[field.key] ?? '';

                  return (
                    <div key={field.key} className={isMultiline ? 'md:col-span-2' : ''}>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                          {field.label}
                        </label>
                        {!translatable && (
                          <span className="text-[10px] text-muted-foreground px-1.5 py-0.5 rounded bg-muted">
                            Dùng chung
                          </span>
                        )}
                      </div>

                      {isMultiline ? (
                        <textarea
                          rows={2}
                          value={currentItems[field.key] ?? ''}
                          onChange={e => handleChange(field.key, e.target.value)}
                          className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-card shadow-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition resize-y"
                        />
                      ) : (
                        <input
                          type={field.type === 'number' ? 'number' : 'text'}
                          value={currentItems[field.key] ?? ''}
                          onChange={e => handleChange(field.key, e.target.value)}
                          placeholder={field.type === 'url' ? 'https://...' : ''}
                          className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-card shadow-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition"
                        />
                      )}

                      {/* Helpful reference context when editing Vietnamese tab */}
                      {activeTab === 'vi' && translatable && enRefValue && (
                        <p className="mt-1 text-[11px] text-muted-foreground truncate" title={enRefValue}>
                          <span className="font-semibold text-slate-500">Bản tiếng Anh:</span> &ldquo;{enRefValue}&rdquo;
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}
