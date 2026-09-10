'use client';

import React from 'react';
import {
  Save,
  RotateCcw,
  Eye,
  Edit3,
  ExternalLink,
  Download,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Layers,
  SlidersHorizontal,
  FileUp,
  Sparkles,
  Languages,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

import { ResumeTemplateStyle } from '@/lib/resume-layout';

interface ResumeToolbarProps {
  isEditMode: boolean;
  onToggleEditMode: () => void;
  hasUnsavedChanges: boolean;
  isSaving: boolean;
  onSave: () => void;
  onReset: () => void;
  totalPages: number;
  activePage: number;
  onSelectPage: (page: number) => void;
  viewMode: 'stack' | 'paged';
  onToggleViewMode: (mode: 'stack' | 'paged') => void;
  resumeUrl?: string | null;
  isSectionSidebarOpen?: boolean;
  onToggleSectionSidebar?: () => void;
  onOpenPdfDialog?: () => void;
  onOpenConvertDialog?: () => void;
  onOpenTranslateDialog?: () => void;
  templateStyle?: ResumeTemplateStyle;
  onSelectTemplateStyle?: (style: ResumeTemplateStyle) => void;
}

export function ResumeToolbar({
  isEditMode,
  onToggleEditMode,
  hasUnsavedChanges,
  isSaving,
  onSave,
  onReset,
  totalPages,
  activePage,
  onSelectPage,
  viewMode,
  onToggleViewMode,
  resumeUrl,
  isSectionSidebarOpen,
  onToggleSectionSidebar,
  onOpenPdfDialog,
  onOpenConvertDialog,
  onOpenTranslateDialog,
  templateStyle = 'harvard',
  onSelectTemplateStyle,
}: ResumeToolbarProps) {
  return (
    <div className="w-full bg-card/95 backdrop-blur-md border-b border-border shadow-2xs px-4 py-2.5 z-10 shrink-0">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Left: Section Sidebar toggle, Mode toggle & Document navigation */}
        <div className="flex items-center flex-wrap gap-2.5">
          {onToggleSectionSidebar && (
            <Button
              type="button"
              variant={isSectionSidebarOpen ? 'secondary' : 'outline'}
              size="sm"
              onClick={onToggleSectionSidebar}
              className="text-xs h-8 gap-1.5 font-medium border-border"
              title="Đóng / Mở thanh Sections"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-primary" />
              <span className="hidden sm:inline">Sections</span>
            </Button>
          )}

          {/* Edit / Preview Mode toggle */}
          <div className="flex items-center bg-muted/80 p-1 rounded-xl border border-border/60 text-xs font-semibold">
            <button
              type="button"
              onClick={() => isEditMode || onToggleEditMode()}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                isEditMode
                  ? 'bg-primary text-primary-foreground shadow-xs font-bold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Chỉnh sửa Canvas</span>
            </button>
            <button
              type="button"
              onClick={() => !isEditMode || onToggleEditMode()}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                !isEditMode
                  ? 'bg-primary text-primary-foreground shadow-xs font-bold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Xem trước sạch</span>
            </button>
          </div>

          {/* Template Style Switcher */}
          {onSelectTemplateStyle && (
            <div className="flex items-center bg-muted/80 p-1 rounded-xl border border-border/60 text-xs font-semibold">
              <button
                type="button"
                onClick={() => onSelectTemplateStyle('harvard')}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg transition-all ${
                  templateStyle !== 'modern'
                    ? 'bg-amber-800 dark:bg-amber-700 text-white shadow-xs font-bold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                title="Bố cục chuẩn Harvard / Ivy League (Đơn cột, Phông Serif, Gạch ngang toàn phần, Hành văn chuẩn OCS)"
              >
                <span>🏛️ Chuẩn Harvard</span>
              </button>
              <button
                type="button"
                onClick={() => onSelectTemplateStyle('modern')}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg transition-all ${
                  templateStyle === 'modern'
                    ? 'bg-primary text-primary-foreground shadow-xs font-bold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                title="Bố cục 2 Cột Hiện Đại (Khổ 2:1, Phông Sans-serif)"
              >
                <span>📐 2 Cột Modern</span>
              </button>
            </div>
          )}

          {/* Multi-page controls */}
          {totalPages > 1 && (
            <div className="flex items-center gap-1.5 bg-muted/50 p-1 rounded-xl border border-border/50 text-xs">
              <button
                type="button"
                onClick={() => onToggleViewMode('stack')}
                className={`px-2.5 py-1 rounded-lg flex items-center gap-1 transition ${
                  viewMode === 'stack'
                    ? 'bg-white text-foreground shadow-xs font-semibold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                title="Hiển thị cuộn tất cả các trang"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Tất cả</span>
              </button>
              <div className="h-3.5 w-px bg-border" />
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  type="button"
                  onClick={() => {
                    onToggleViewMode('paged');
                    onSelectPage(p);
                  }}
                  className={`px-2 py-1 rounded-lg transition ${
                    viewMode === 'paged' && activePage === p
                      ? 'bg-white text-foreground shadow-xs font-bold'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Trang {p}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Save, Reset, Public link */}
        <div className="flex items-center flex-wrap gap-2.5">
          {/* Status Indicator */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border border-border/60">
            {hasUnsavedChanges ? (
              <span className="flex items-center gap-1 text-amber-600 font-semibold animate-pulse">
                <AlertCircle className="w-3.5 h-3.5" />
                Có thay đổi chưa lưu
              </span>
            ) : (
              <span className="flex items-center gap-1 text-emerald-600">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Đã lưu
              </span>
            )}
          </div>

          {/* Reset button */}
          {hasUnsavedChanges && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onReset}
              disabled={isSaving}
              className="text-xs h-8 gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Khôi phục</span>
            </Button>
          )}

          {/* Save All button */}
          <Button
            type="button"
            size="sm"
            onClick={onSave}
            disabled={isSaving || !hasUnsavedChanges}
            className={`text-xs h-8 gap-1.5 shadow-sm transition-all ${
              hasUnsavedChanges
                ? 'bg-primary text-primary-foreground font-bold hover:opacity-90 shadow-primary/25'
                : 'opacity-70 cursor-not-allowed'
            }`}
          >
            {isSaving ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Đang lưu...</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Lưu thay đổi</span>
              </>
            )}
          </Button>

          <div className="hidden md:block h-5 w-px bg-border/80 mx-1" />

          {/* AI Translation Dialog Button */}
          {onOpenTranslateDialog && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onOpenTranslateDialog}
              className="text-xs h-8 gap-1.5 border-primary/30 text-primary hover:bg-primary/10 font-semibold transition-all"
              title="Quản lý và tạo bản dịch Tiếng Anh (EN) cho CV / Resume"
            >
              <Languages className="w-3.5 h-3.5" />
              <span>Dịch AI (EN)</span>
            </Button>
          )}

          {/* Convert PDF to CV Button */}
          {onOpenConvertDialog && (
            <Button
              type="button"
              size="sm"
              onClick={onOpenConvertDialog}
              className="text-xs h-8 gap-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold shadow-xs transition-all border border-amber-400/30"
              title="Trích xuất và chuyển đổi file PDF thành bản CV trên canvas"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-200" />
              <span>Chuyển PDF sang CV</span>
            </Button>
          )}

          {/* Import / Manage PDF Button */}
          {onOpenPdfDialog && (
            <Button
              type="button"
              variant={resumeUrl ? 'outline' : 'default'}
              size="sm"
              onClick={onOpenPdfDialog}
              className={`text-xs h-8 gap-1.5 transition-all ${
                resumeUrl
                  ? 'border-emerald-500/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10'
                  : 'bg-primary text-primary-foreground font-semibold shadow-xs'
              }`}
              title="Quản lý & Đính kèm file PDF Resume tải về"
            >
              <FileUp className="w-3.5 h-3.5" />
              <span>{resumeUrl ? 'Đổi File PDF' : 'Đính kèm PDF'}</span>
              {resumeUrl && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
              )}
            </Button>
          )}

          {/* External links */}
          <div className="flex items-center gap-1.5">
            <Button asChild variant="ghost" size="sm" className="text-xs h-8 gap-1 text-muted-foreground hover:text-foreground">
              <Link href="/resume" target="_blank">
                <ExternalLink className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Xem CV công khai</span>
              </Link>
            </Button>

            {resumeUrl && (
              <Button asChild variant="ghost" size="sm" className="text-xs h-8 gap-1 text-muted-foreground hover:text-foreground">
                <a href={resumeUrl} download>
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Tải PDF</span>
                </a>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
