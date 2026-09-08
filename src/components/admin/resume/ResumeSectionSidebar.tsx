'use client';

import React from 'react';
import {
  UserRound,
  FileText,
  Briefcase,
  GraduationCap,
  Cpu,
  Globe2,
  Trophy,
  Activity,
  Share2,
  Sparkles,
  Plus,
  ChevronRight,
  SlidersHorizontal,
  ArrowUp,
  ArrowDown,
  ArrowLeftRight,
  EyeOff,
  RotateCcw,
  Eye,
  CheckCircle2,
} from 'lucide-react';
import { ItemType } from './ResumeItemDialog';
import { SectionId, ResumeSectionLayout } from '@/lib/resume-layout';

interface SectionConfig {
  id: SectionId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  canAdd: boolean;
  dialogType?: ItemType;
  targetId: string;
}

const SECTION_CONFIGS: Record<SectionId, SectionConfig> = {
  bio: {
    id: 'bio',
    label: 'Giới thiệu & Mục tiêu',
    icon: FileText,
    canAdd: false,
    targetId: 'section-bio',
  },
  experience: {
    id: 'experience',
    label: 'Kinh nghiệm làm việc',
    icon: Briefcase,
    canAdd: true,
    dialogType: 'experience',
    targetId: 'section-experience',
  },
  education: {
    id: 'education',
    label: 'Học vấn & Bằng cấp',
    icon: GraduationCap,
    canAdd: true,
    dialogType: 'education',
    targetId: 'section-education',
  },
  skills: {
    id: 'skills',
    label: 'Kỹ năng chuyên môn',
    icon: Cpu,
    canAdd: true,
    dialogType: 'skill',
    targetId: 'section-skills',
  },
  softSkills: {
    id: 'softSkills',
    label: 'Kỹ năng mềm',
    icon: Sparkles,
    canAdd: false,
    targetId: 'section-softskills',
  },
  languages: {
    id: 'languages',
    label: 'Ngoại ngữ',
    icon: Globe2,
    canAdd: true,
    dialogType: 'language',
    targetId: 'section-languages',
  },
  achievements: {
    id: 'achievements',
    label: 'Giải thưởng & Thành tích',
    icon: Trophy,
    canAdd: true,
    dialogType: 'achievement',
    targetId: 'section-achievements',
  },
  activities: {
    id: 'activities',
    label: 'Hoạt động & Dự án',
    icon: Activity,
    canAdd: true,
    dialogType: 'activity',
    targetId: 'section-activities',
  },
};

interface ResumeSectionSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  sectionLayout: ResumeSectionLayout;
  onMoveSection: (id: SectionId, direction: 'up' | 'down') => void;
  onSwitchSectionColumn: (id: SectionId) => void;
  onToggleHideSection: (id: SectionId) => void;
  onResetLayout: () => void;
  experienceCount: number;
  educationCount: number;
  skillsCount: number;
  socialCount: number;
  languageCount: number;
  achievementCount: number;
  activityCount: number;
  onOpenDialog: (type: ItemType) => void;
  onScrollToSection: (sectionId: string) => void;
  activeSection?: string;
}

export function ResumeSectionSidebar({
  isOpen,
  onToggle,
  sectionLayout,
  onMoveSection,
  onSwitchSectionColumn,
  onToggleHideSection,
  onResetLayout,
  experienceCount,
  educationCount,
  skillsCount,
  socialCount,
  languageCount,
  achievementCount,
  activityCount,
  onOpenDialog,
  onScrollToSection,
  activeSection,
}: ResumeSectionSidebarProps) {
  const getItemCount = (id: SectionId): number | undefined => {
    switch (id) {
      case 'experience':
        return experienceCount;
      case 'education':
        return educationCount;
      case 'skills':
        return skillsCount;
      case 'languages':
        return languageCount;
      case 'achievements':
        return achievementCount;
      case 'activities':
        return activityCount;
      default:
        return undefined;
    }
  };

  if (!isOpen) {
    return (
      <div className="border-r border-border bg-card/60 p-2 flex flex-col items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={onToggle}
          className="p-2 rounded-xl bg-muted/80 hover:bg-muted text-foreground transition-all shadow-xs"
          title="Mở thanh Quản lý Sections"
        >
          <SlidersHorizontal className="w-4 h-4" />
        </button>
      </div>
    );
  }

  const renderSectionCard = (
    secId: SectionId,
    column: 'left' | 'right',
    idx: number,
    totalInCol: number
  ) => {
    const config = SECTION_CONFIGS[secId];
    if (!config) return null;
    const Icon = config.icon;
    const count = getItemCount(secId);
    const isActive = activeSection === secId;

    return (
      <div
        key={secId}
        className={`group flex items-center justify-between gap-1.5 px-2.5 py-1.5 rounded-xl text-xs transition-all border border-transparent ${
          isActive
            ? 'bg-primary/15 border-primary/30 text-primary font-semibold'
            : 'hover:bg-muted/70 hover:border-border/60 text-foreground bg-card/50'
        }`}
      >
        {/* Click to scroll */}
        <button
          type="button"
          onClick={() => onScrollToSection(config.targetId)}
          className="flex items-center gap-2 flex-1 text-left min-w-0 py-0.5"
          title="Nhấp để cuộn đến mục này trên CV"
        >
          <div className="p-1 rounded-md bg-muted text-muted-foreground group-hover:text-foreground shrink-0">
            <Icon className="w-3.5 h-3.5" />
          </div>
          <span className="truncate flex-1 font-medium">{config.label}</span>
          {count !== undefined && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-muted text-muted-foreground shrink-0">
              {count}
            </span>
          )}
        </button>

        {/* Action Controls */}
        <div className="flex items-center gap-0.5 opacity-60 group-hover:opacity-100 transition-opacity">
          {/* Quick Add item */}
          {config.canAdd && config.dialogType && (
            <button
              type="button"
              onClick={() => onOpenDialog(config.dialogType as ItemType)}
              className="p-1 rounded-md hover:bg-primary/20 text-muted-foreground hover:text-primary transition-colors shrink-0"
              title={`Thêm ${config.label}`}
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Move Up */}
          <button
            type="button"
            disabled={idx === 0}
            onClick={() => onMoveSection(secId, 'up')}
            className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground disabled:opacity-20 transition-colors"
            title="Lên trên"
          >
            <ArrowUp className="w-3 h-3" />
          </button>

          {/* Move Down */}
          <button
            type="button"
            disabled={idx === totalInCol - 1}
            onClick={() => onMoveSection(secId, 'down')}
            className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground disabled:opacity-20 transition-colors"
            title="Xuống dưới"
          >
            <ArrowDown className="w-3 h-3" />
          </button>

          {/* Switch Column */}
          <button
            type="button"
            onClick={() => onSwitchSectionColumn(secId)}
            className="p-1 rounded hover:bg-muted text-blue-500 hover:text-blue-600 transition-colors"
            title={`Chuyển sang ${column === 'left' ? 'Cột Phải' : 'Cột Trái'}`}
          >
            <ArrowLeftRight className="w-3 h-3" />
          </button>

          {/* Hide Section */}
          <button
            type="button"
            onClick={() => onToggleHideSection(secId)}
            className="p-1 rounded hover:bg-red-50 text-muted-foreground hover:text-red-500 transition-colors"
            title="Ẩn mục này khỏi CV"
          >
            <EyeOff className="w-3 h-3" />
          </button>
        </div>
      </div>
    );
  };

  const leftSections = sectionLayout.left.filter(id => !sectionLayout.hidden.includes(id));
  const rightSections = sectionLayout.right.filter(id => !sectionLayout.hidden.includes(id));
  const hiddenSections = sectionLayout.hidden;

  return (
    <aside className="w-72 sm:w-80 shrink-0 border-r border-border bg-card/95 backdrop-blur-md flex flex-col h-full select-none z-10">
      {/* Sidebar Header */}
      <div className="p-3.5 border-b border-border/80 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary/15 text-primary">
            <SlidersHorizontal className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
              Bố Cục & Sections
            </h3>
            <span className="text-[11px] text-muted-foreground">
              Kéo & sắp xếp vị trí các phần
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={onToggle}
          className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          title="Thu gọn thanh Sections"
        >
          <ChevronRight className="w-4 h-4 rotate-180" />
        </button>
      </div>

      {/* Quick Action Button */}
      <div className="p-3 border-b border-border/60">
        <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-2 px-1">
          Thêm Mục Nhanh
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          <button
            type="button"
            onClick={() => onOpenDialog('experience')}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-primary/10 hover:bg-primary/20 text-primary transition-colors text-left"
          >
            <Plus className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Kinh nghiệm</span>
          </button>
          <button
            type="button"
            onClick={() => onOpenDialog('education')}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-primary/10 hover:bg-primary/20 text-primary transition-colors text-left"
          >
            <Plus className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Học vấn</span>
          </button>
          <button
            type="button"
            onClick={() => onOpenDialog('skill')}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-muted hover:bg-muted/80 text-foreground transition-colors text-left"
          >
            <Plus className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Kỹ năng</span>
          </button>
          <button
            type="button"
            onClick={() => onOpenDialog('achievement')}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-muted hover:bg-muted/80 text-foreground transition-colors text-left"
          >
            <Plus className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Thành tích</span>
          </button>
        </div>
      </div>

      {/* Sections List by Column */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {/* Header Elements */}
        <div>
          <div className="text-[10px] font-bold text-muted-foreground/70 uppercase tracking-wider px-1 mb-1.5">
            Phần Đầu Trang (Cố định)
          </div>
          <div className="space-y-1">
            <button
              type="button"
              onClick={() => onScrollToSection('section-profile')}
              className="w-full flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-xl text-xs hover:bg-muted/70 text-foreground text-left"
            >
              <div className="flex items-center gap-2">
                <div className="p-1 rounded-md bg-muted text-muted-foreground">
                  <UserRound className="w-3.5 h-3.5" />
                </div>
                <span>Thông tin cá nhân & Tiêu đề</span>
              </div>
            </button>
            <div className="flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs hover:bg-muted/70 text-foreground">
              <button
                type="button"
                onClick={() => onScrollToSection('section-social')}
                className="flex items-center gap-2 flex-1 text-left"
              >
                <div className="p-1 rounded-md bg-muted text-muted-foreground">
                  <Share2 className="w-3.5 h-3.5" />
                </div>
                <span>Liên kết mạng xã hội</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-muted text-muted-foreground">
                  {socialCount}
                </span>
              </button>
              <button
                type="button"
                onClick={() => onOpenDialog('social')}
                className="p-1 rounded-md hover:bg-primary/20 text-muted-foreground hover:text-primary transition-colors"
                title="Thêm liên kết mạng xã hội"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* ── Left Column Sections ── */}
        <div>
          <div className="flex items-center justify-between px-1 mb-1.5">
            <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider flex items-center gap-1">
              <span>Cột Trái (Left)</span>
              <span className="text-[10px] text-muted-foreground">({leftSections.length})</span>
            </span>
            <span className="text-[10px] text-muted-foreground">Khổ 2/3</span>
          </div>

          <div className="space-y-1">
            {leftSections.map((secId, idx) =>
              renderSectionCard(secId, 'left', idx, leftSections.length)
            )}
            {leftSections.length === 0 && (
              <div className="text-[11px] text-muted-foreground/60 italic p-2 border border-dashed rounded-lg text-center">
                Không có mục nào ở cột trái
              </div>
            )}
          </div>
        </div>

        {/* ── Right Column Sections ── */}
        <div>
          <div className="flex items-center justify-between px-1 mb-1.5">
            <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider flex items-center gap-1">
              <span>Cột Phải (Right)</span>
              <span className="text-[10px] text-muted-foreground">({rightSections.length})</span>
            </span>
            <span className="text-[10px] text-muted-foreground">Khổ 1/3</span>
          </div>

          <div className="space-y-1">
            {rightSections.map((secId, idx) =>
              renderSectionCard(secId, 'right', idx, rightSections.length)
            )}
            {rightSections.length === 0 && (
              <div className="text-[11px] text-muted-foreground/60 italic p-2 border border-dashed rounded-lg text-center">
                Không có mục nào ở cột phải
              </div>
            )}
          </div>
        </div>

        {/* ── Hidden Sections (if any) ── */}
        {hiddenSections.length > 0 && (
          <div>
            <div className="flex items-center justify-between px-1 mb-1.5">
              <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1">
                <span>Mục Đã Ẩn</span>
                <span className="text-[10px] text-muted-foreground">({hiddenSections.length})</span>
              </span>
            </div>

            <div className="space-y-1">
              {hiddenSections.map(secId => {
                const config = SECTION_CONFIGS[secId];
                if (!config) return null;
                const Icon = config.icon;

                return (
                  <div
                    key={secId}
                    className="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-xl text-xs bg-muted/40 text-muted-foreground border border-dashed border-border/70"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <Icon className="w-3.5 h-3.5 shrink-0 opacity-60" />
                      <span className="truncate">{config.label}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => onToggleHideSection(secId)}
                      className="px-2 py-0.5 rounded-md bg-primary/10 hover:bg-primary/20 text-primary font-medium text-[11px] flex items-center gap-1 shrink-0 transition-colors"
                      title="Hiển thị lại mục này trên CV"
                    >
                      <Eye className="w-3 h-3" />
                      <span>Hiện lại</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Reset Layout */}
        <div className="pt-2">
          <button
            type="button"
            onClick={onResetLayout}
            className="w-full py-1.5 px-3 text-[11px] font-medium text-muted-foreground hover:text-foreground border border-border/60 hover:border-border rounded-lg flex items-center justify-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Khôi phục bố cục mặc định</span>
          </button>
        </div>
      </div>

      {/* Footer Info */}
      <div className="p-3 border-t border-border/80 text-[11px] text-muted-foreground/80 flex items-center justify-between">
        <span className="flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3 text-emerald-500" />
          Live Preview Sync
        </span>
        <span className="font-mono">WYSIWYG Hub</span>
      </div>
    </aside>
  );
}
