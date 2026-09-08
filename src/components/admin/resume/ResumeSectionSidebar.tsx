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
  CheckCircle2,
} from 'lucide-react';
import { ItemType } from './ResumeItemDialog';

interface SectionItem {
  id: string;
  label: string;
  type: ItemType | 'profile' | 'bio' | 'softSkills';
  icon: React.ComponentType<{ className?: string }>;
  count?: number;
  canAdd: boolean;
  targetId: string;
}

interface ResumeSectionSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
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
  const sections: SectionItem[] = [
    {
      id: 'profile',
      label: 'Thông tin cá nhân',
      type: 'profile',
      icon: UserRound,
      canAdd: false,
      targetId: 'section-profile',
    },
    {
      id: 'bio',
      label: 'Giới thiệu & Mục tiêu',
      type: 'bio',
      icon: FileText,
      canAdd: false,
      targetId: 'section-bio',
    },
    {
      id: 'experience',
      label: 'Kinh nghiệm làm việc',
      type: 'experience',
      icon: Briefcase,
      count: experienceCount,
      canAdd: true,
      targetId: 'section-experience',
    },
    {
      id: 'education',
      label: 'Học vấn & Bằng cấp',
      type: 'education',
      icon: GraduationCap,
      count: educationCount,
      canAdd: true,
      targetId: 'section-education',
    },
    {
      id: 'skills',
      label: 'Kỹ năng chuyên môn',
      type: 'skill',
      icon: Cpu,
      count: skillsCount,
      canAdd: true,
      targetId: 'section-skills',
    },
    {
      id: 'softSkills',
      label: 'Kỹ năng mềm',
      type: 'softSkills',
      icon: Sparkles,
      canAdd: false,
      targetId: 'section-softskills',
    },
    {
      id: 'languages',
      label: 'Ngoại ngữ',
      type: 'language',
      icon: Globe2,
      count: languageCount,
      canAdd: true,
      targetId: 'section-languages',
    },
    {
      id: 'achievements',
      label: 'Giải thưởng & Thành tích',
      type: 'achievement',
      icon: Trophy,
      count: achievementCount,
      canAdd: true,
      targetId: 'section-achievements',
    },
    {
      id: 'activities',
      label: 'Hoạt động & Dự án',
      type: 'activity',
      icon: Activity,
      count: activityCount,
      canAdd: true,
      targetId: 'section-activities',
    },
    {
      id: 'social',
      label: 'Liên kết mạng xã hội',
      type: 'social',
      icon: Share2,
      count: socialCount,
      canAdd: true,
      targetId: 'section-social',
    },
  ];

  if (!isOpen) {
    return (
      <div className="border-r border-border bg-card/60 p-2 flex flex-col items-center gap-2">
        <button
          type="button"
          onClick={onToggle}
          className="p-2 rounded-xl bg-muted/80 hover:bg-muted text-foreground transition-all shadow-xs"
          title="Mở thanh Sections"
        >
          <SlidersHorizontal className="w-4 h-4" />
        </button>
      </div>
    );
  }

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
              Các Phần Trên CV
            </h3>
            <span className="text-[11px] text-muted-foreground">
              {sections.length} phần có sẵn
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={onToggle}
          className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          title="Thu gọn thanh công cụ"
        >
          <ChevronRight className="w-4 h-4 rotate-180" />
        </button>
      </div>

      {/* Quick Action Button */}
      <div className="p-3 border-b border-border/60">
        <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-2 px-1">
          Thêm Mục Vào CV Nhanh
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

      {/* Sections List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        <div className="text-[10px] font-bold text-muted-foreground/70 uppercase tracking-wider px-2 py-1">
          Danh mục section
        </div>
        {sections.map(section => {
          const Icon = section.icon;
          const isActive = activeSection === section.id;

          return (
            <div
              key={section.id}
              className={`group flex items-center justify-between gap-2 px-2.5 py-2 rounded-xl text-xs transition-all ${
                isActive
                  ? 'bg-primary/15 text-primary font-semibold'
                  : 'hover:bg-muted/70 text-foreground'
              }`}
            >
              <button
                type="button"
                onClick={() => onScrollToSection(section.targetId)}
                className="flex items-center gap-2.5 flex-1 text-left min-w-0"
              >
                <div className="p-1 rounded-md bg-muted text-muted-foreground group-hover:text-foreground shrink-0">
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <span className="truncate flex-1">{section.label}</span>
                {section.count !== undefined && (
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono bg-muted text-muted-foreground shrink-0">
                    {section.count}
                  </span>
                )}
              </button>

              {section.canAdd && (
                <button
                  type="button"
                  onClick={() => onOpenDialog(section.type as ItemType)}
                  className="p-1 rounded-md hover:bg-primary/20 text-muted-foreground hover:text-primary transition-colors shrink-0"
                  title={`Thêm ${section.label}`}
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer Info */}
      <div className="p-3 border-t border-border/80 text-[11px] text-muted-foreground/80 flex items-center justify-between">
        <span className="flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3 text-emerald-500" />
          Live Preview Sync
        </span>
        <span className="font-mono">WYSIWYG</span>
      </div>
    </aside>
  );
}
