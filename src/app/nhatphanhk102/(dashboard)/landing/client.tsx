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
import { UnsavedChangesDialog } from '@/components/admin/UnsavedChangesDialog';
import { useConfirmDialog } from '@/components/admin/DeleteDialog';
import { AdminPageHeader, ADMIN_PAGE_CLASS } from '@/components/admin/AdminPageHeader';
import { useUnsavedChangesGuard } from '@/hooks/use-unsaved-changes-guard';
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

  // What the server currently holds; the page is dirty whenever the editors differ from it.
  const [savedSnapshot, setSavedSnapshot] = useState(() => JSON.stringify({ en: itemsEn, vi: itemsVi }));
  const isDirty = JSON.stringify({ en: itemsEn, vi: itemsVi }) !== savedSnapshot;
  const leaveGuard = useUnsavedChangesGuard(isDirty);
  const { confirm, confirmDialog } = useConfirmDialog();

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

  const handleResetSection = async (grp: string, title: string) => {
    const ok = await confirm({
      title: `Khôi phục mặc định cho "${title}"?`,
      description: 'Các chỉnh sửa chưa lưu trong mục này sẽ bị thay bằng nội dung mặc định.',
      confirmLabel: 'Khôi phục',
    });
    if (!ok) return;
    const defaults = DEFAULT_SITE_CONTENT.filter(d => d.grp === grp);
    const shared = defaults.filter(d => !isTranslatable(d.key));
    const applyShared = (prev: Record<string, string>) => {
      const next = { ...prev };
      for (const d of shared) next[d.key] = d.value;
      return next;
    };
    if (activeTab === 'en') {
      setItemsEn(prev => {
        const next = applyShared(prev);
        for (const d of defaults) next[d.key] = d.value;
        return next;
      });
      setItemsVi(applyShared); // URLs / numbers are shared between both languages
      toast.info(`Đã khôi phục "${title}" (tiếng Anh) về mặc định.`);
    } else {
      setItemsVi(prev => {
        const next = applyShared(prev);
        for (const d of defaults) next[d.key] = DEFAULT_VI_SITE_CONTENT[d.key] ?? d.value;
        return next;
      });
      setItemsEn(applyShared);
      toast.info(`Đã khôi phục "${title}" (tiếng Việt) về mặc định.`);
    }
  };

  // AI Translation with Google Gemini via /api/translate
  const handleAiTranslate = async () => {
    const targetLocale = activeTab === 'en' ? 'vi' : 'en';
    // Only text fields go to the model; URLs and numbers are shared and must not be "translated"
    const sourceData = Object.fromEntries(
      Object.entries(activeTab === 'en' ? itemsEn : itemsVi).filter(([key]) => isTranslatable(key))
    );
    const ok = await confirm({
      title: `Dịch sang ${targetLocale === 'vi' ? 'tiếng Việt' : 'tiếng Anh'} bằng AI?`,
      description: `Bản dịch AI sẽ ghi đè các trường văn bản hiện có ở tab ${targetLocale === 'vi' ? 'Tiếng Việt' : 'Tiếng Anh'}.`,
      confirmLabel: 'Dịch và ghi đè',
    });
    if (!ok) return;

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
      const translated = Object.fromEntries(
        Object.entries(json.data as Record<string, string>).filter(([key]) => isTranslatable(key))
      );

      if (targetLocale === 'vi') {
        setItemsVi(prev => ({ ...prev, ...translated }));
        setActiveTab('vi');
        toast.success('Đã dịch sang tiếng Việt. Hãy xem lại rồi bấm Lưu.', {
          id: toastId,
        });
      } else {
        setItemsEn(prev => ({ ...prev, ...translated }));
        setActiveTab('en');
        toast.success('Đã dịch sang tiếng Anh. Hãy xem lại rồi bấm Lưu.', {
          id: toastId,
        });
      }
    } catch (err) {
      console.error('AI translation error:', err);
      const message = err instanceof Error ? err.message : '';
      toast.error(`Không thể dịch bằng AI: ${message || 'Vui lòng thử lại.'}`, { id: toastId });
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
        setSavedSnapshot(JSON.stringify({ en: itemsEn, vi: itemsVi }));
        toast.success('Đã lưu nội dung trang chủ.');
      } else {
        toast.error(`Không thể lưu nội dung: ${result.error || 'Vui lòng thử lại.'}`);
      }
    });
  };

  const sections = [
    {
      id: 'hero',
      title: 'Phần mở đầu (Hero)',
      desc: 'Khu vực chào mừng ở đầu trang',
      icon: Sparkles,
      fields: DEFAULT_SITE_CONTENT.filter(d => d.grp === 'hero'),
    },
    {
      id: 'about',
      title: 'Giới thiệu & tác giả',
      desc: 'Tiểu sử, ảnh chân dung, ảnh không gian làm việc và câu trích dẫn',
      icon: LayoutTemplate,
      fields: DEFAULT_SITE_CONTENT.filter(d => d.grp === 'about'),
    },
    {
      id: 'stats',
      title: 'Số liệu thống kê',
      desc: 'Các con số thành tích chạy hiệu ứng trong phần Giới thiệu',
      icon: BarChart3,
      fields: DEFAULT_SITE_CONTENT.filter(d => d.grp === 'stats'),
    },
    {
      id: 'bpsc',
      title: 'Nổi bật (Dự án, Bài viết, Chứng chỉ)',
      desc: 'Tiêu đề và nhãn cho các khối nổi bật',
      icon: Layers,
      fields: DEFAULT_SITE_CONTENT.filter(d => d.grp === 'bpsc'),
    },
  ];

  return (
    <main className={ADMIN_PAGE_CLASS}>
      <AdminPageHeader
        title="Nội dung trang chủ"
        description="Quản lý và chuyển ngữ tiêu đề, mô tả, ảnh tác giả và nhãn hiển thị trên trang chủ"
        actions={
        <>
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
              <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
            ) : (
              <Sparkles className="w-4 h-4 text-amber-300" aria-hidden="true" />
            )}
            <span>
              {isTranslating
                ? 'Đang dịch AI…'
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
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> : <Save className="w-4 h-4" aria-hidden="true" />}
            <span>{isPending ? 'Đang lưu…' : 'Lưu tất cả'}</span>
          </button>
        </>
        }
      />

      {/* Language Tabs Switcher */}
      <div className="flex items-center justify-between p-1.5 rounded-2xl bg-muted/70 border border-border">
        <div className="flex items-center gap-1.5" role="tablist" aria-label="Ngôn ngữ đang chỉnh sửa">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'en'}
            onClick={() => setActiveTab('en')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'en'
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <span className="text-base" aria-hidden="true">🇬🇧</span>
            <span>Tiếng Anh (bản gốc)</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'vi'}
            onClick={() => setActiveTab('vi')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'vi'
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <span className="text-base" aria-hidden="true">🇻🇳</span>
            <span>Tiếng Việt (bản dịch)</span>
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-2 pr-3 text-xs text-muted-foreground">
          <Languages className="w-3.5 h-3.5 text-primary" aria-hidden="true" />
          <span>Đang chỉnh sửa: <strong>{activeTab === 'en' ? 'Bản gốc tiếng Anh' : 'Bản dịch tiếng Việt'}</strong></span>
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
                    <Icon className="w-5 h-5" aria-hidden="true" />
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-foreground">{section.title}</h2>
                    <p className="text-xs text-muted-foreground">{section.desc}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleResetSection(section.id, section.title)}
                  className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition px-2.5 py-1 rounded-md hover:bg-muted cursor-pointer"
                  title="Đặt lại mục này về mặc định"
                >
                  <RefreshCw className="w-3 h-3" aria-hidden="true" />
                  <span>Mặc định ({activeTab.toUpperCase()})</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {section.fields.map(field => {
                  const isMultiline =
                    field.key === 'about_heading' ||
                    field.key === 'about_author_quote' ||
                    field.key === 'hero_tagline';
                  const translatable = isTranslatable(field.key);
                  const enRefValue = itemsEn[field.key] ?? '';

                  return (
                    <div key={field.key} className={isMultiline ? 'md:col-span-2' : ''}>
                      <div className="flex items-center justify-between mb-1.5">
                        <label htmlFor={`site-${field.key}`} className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide">
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
                          id={`site-${field.key}`}
                          rows={2}
                          value={currentItems[field.key] ?? ''}
                          onChange={e => handleChange(field.key, e.target.value)}
                          className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-card shadow-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition resize-y"
                        />
                      ) : (
                        <input
                          id={`site-${field.key}`}
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
                          <span className="font-semibold">Bản tiếng Anh:</span> &ldquo;{enRefValue}&rdquo;
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

      <UnsavedChangesDialog
        open={leaveGuard.isBlocking}
        onOpenChange={open => {
          if (!open) leaveGuard.cancel();
        }}
        onConfirmLeave={leaveGuard.confirmLeave}
      />
      {confirmDialog}
    </main>
  );
}
