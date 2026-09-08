'use client';

import React, { useMemo } from 'react';
import { ResumeCard3D } from '@/components/ui/ResumeCard3D';
import { InlineEditable } from './InlineEditable';
import { ItemType } from './ResumeItemDialog';
import {
  MapPin,
  Mail,
  Phone,
  Plus,
  Trash2,
  Edit,
  ArrowUp,
  ArrowDown,
  ArrowLeftRight,
  EyeOff,
  GripVertical,
  X,
} from 'lucide-react';
import DynamicIcon from '@/components/ui/DynamicIcon';
import {
  SectionId,
  ResumeSectionLayout,
  SECTION_META,
  DEFAULT_HARVARD_ORDER,
} from '@/lib/resume-layout';

const CATEGORY_LABELS: Record<string, string> = {
  LANGUAGE: 'Programming Languages',
  FRAMEWORK: 'Frameworks / Libraries',
  FRONTEND: 'Frontend',
  BACKEND: 'Backend',
  DATABASE: 'Databases',
  CLOUD: 'Cloud Platforms',
  DEVOPS: 'DevOps & CI/CD',
  IAC: 'Infrastructure as Code',
  MONITORING: 'Monitoring & Logging',
  VERSION_CONTROL: 'Version Control',
  TOOLS: 'Tools & Technologies',
  OTHER: 'Other',
};

const HARVARD_SECTION_TITLES: Record<SectionId, string> = {
  education: 'EDUCATION',
  experience: 'PROFESSIONAL EXPERIENCE',
  skills: 'TECHNICAL SKILLS',
  softSkills: 'CORE COMPETENCIES & LEADERSHIP',
  achievements: 'HONORS & AWARDS',
  activities: 'ACTIVITIES & LEADERSHIP',
  languages: 'LANGUAGES',
  bio: 'PROFESSIONAL SUMMARY',
};

// ── Weight estimation for pagination ─────────────────────────
function estimateExperienceWeight(exp: any): number {
  let score = 90;
  if (exp.description) score += Math.min(exp.description.length / 3.5, 70);
  if (exp.achievements) {
    const lines = exp.achievements.split('\n').filter(Boolean).length;
    score += lines * 22;
  }
  if (exp.techStack) score += 24;
  return score;
}

function estimateEducationWeight(edu: any): number {
  let score = 70;
  if (edu.fieldOfStudy) score += 16;
  if (edu.description) score += 32;
  return score;
}

function estimateSkillCatWeight(skills: any[]): number {
  const rows = Math.ceil(skills.length / 2.5);
  return 36 + rows * 24;
}

// ── Two-Column Modern Page Data ──────────────────────────────
interface ColumnPageData {
  sections: SectionId[];
  experiences: any[];
  education: any[];
  skillCats: string[];
  spokenLanguages: any[];
  achievements: any[];
  activities: any[];
  showBio: boolean;
  showSoftSkills: boolean;
}

function emptyColPage(): ColumnPageData {
  return {
    sections: [],
    experiences: [],
    education: [],
    skillCats: [],
    spokenLanguages: [],
    achievements: [],
    activities: [],
    showBio: false,
    showSoftSkills: false,
  };
}

// ── Single-Column Harvard Page Data ──────────────────────────
interface HarvardSectionSlice {
  id: SectionId;
  isContinued?: boolean;
  experiences?: any[];
  education?: any[];
  skillCats?: string[];
  spokenLanguages?: any[];
  achievements?: any[];
  activities?: any[];
  showBio?: boolean;
  showSoftSkills?: boolean;
}

interface HarvardPageData {
  pageNumber: number;
  sections: HarvardSectionSlice[];
}

interface ModernPageData {
  pageNumber: number;
  left: ColumnPageData;
  right: ColumnPageData;
}

interface LiveResumeCanvasProps {
  profile: any;
  experiences: any[];
  education: any[];
  socialLinks: any[];
  achievements: any[];
  spokenLanguages: any[];
  activities: any[];
  skillsByCategory: Record<string, any[]>;
  sectionLayout: ResumeSectionLayout;
  onMoveSection: (id: SectionId, direction: 'up' | 'down') => void;
  onSwitchSectionColumn: (id: SectionId) => void;
  onToggleHideSection: (id: SectionId) => void;
  isEditMode: boolean;
  activePage: number;
  viewMode: 'stack' | 'paged';
  onUpdateProfile: (field: string, value: any) => void;
  onOpenDialog: (type: ItemType, item?: any) => void;
  onDeleteItem: (type: ItemType, id: string) => void;
  onMoveItem: (type: 'experience' | 'education', id: string, direction: 'up' | 'down') => void;
  onUpdateExperienceAchievements: (id: string, achievements: string) => void;
  onUpdateExperienceTechStack: (id: string, techStack: string) => void;
  onQuickAddSkill: (category: string) => void;
  onDeleteSkill: (id: string) => void;
  onSetTotalPages: (pages: number) => void;
}

export function LiveResumeCanvas({
  profile,
  experiences,
  education,
  socialLinks,
  achievements,
  spokenLanguages,
  activities,
  skillsByCategory,
  sectionLayout,
  onMoveSection,
  onSwitchSectionColumn,
  onToggleHideSection,
  isEditMode,
  activePage,
  viewMode,
  onUpdateProfile,
  onOpenDialog,
  onDeleteItem,
  onMoveItem,
  onUpdateExperienceAchievements,
  onUpdateExperienceTechStack,
  onQuickAddSkill,
  onDeleteSkill,
  onSetTotalPages,
}: LiveResumeCanvasProps) {
  const isHarvard = sectionLayout.templateStyle !== 'modern';

  // ── 1. Harvard Single-Column Pagination ──────────────────────
  const harvardPages = useMemo((): HarvardPageData[] => {
    const orderedSections = (sectionLayout.order || DEFAULT_HARVARD_ORDER).filter(
      id => !sectionLayout.hidden.includes(id)
    );

    const PAGE1_USABLE = 650;
    const EXTRA_USABLE = 860;

    const pages: HarvardPageData[] = [{ pageNumber: 1, sections: [] }];
    let currentPage = 0;
    let currentWeight = 0;

    const ensureSpace = (weightNeeded: number) => {
      const limit = currentPage === 0 ? PAGE1_USABLE : EXTRA_USABLE;
      if (currentWeight + weightNeeded > limit && pages[currentPage].sections.length > 0) {
        currentPage++;
        currentWeight = 0;
        pages.push({ pageNumber: currentPage + 1, sections: [] });
      }
    };

    for (const secId of orderedSections) {
      switch (secId) {
        case 'bio': {
          if (profile.bio || profile.careerObjective || isEditMode) {
            ensureSpace(85);
            pages[currentPage].sections.push({ id: 'bio', showBio: true });
            currentWeight += 85;
          }
          break;
        }

        case 'education': {
          if (education.length === 0) {
            if (isEditMode) {
              ensureSpace(60);
              pages[currentPage].sections.push({ id: 'education', education: [] });
              currentWeight += 60;
            }
          } else {
            let currentList: any[] = [];
            for (const edu of education) {
              const w = estimateEducationWeight(edu);
              const limit = currentPage === 0 ? PAGE1_USABLE : EXTRA_USABLE;
              if (currentWeight + w > limit && (pages[currentPage].sections.length > 0 || currentList.length > 0)) {
                if (currentList.length > 0) {
                  pages[currentPage].sections.push({
                    id: 'education',
                    education: currentList,
                    isContinued: pages.some(p => p.sections.some(s => s.id === 'education')),
                  });
                  currentList = [];
                }
                currentPage++;
                currentWeight = 0;
                pages.push({ pageNumber: currentPage + 1, sections: [] });
              }
              currentList.push(edu);
              currentWeight += w;
            }
            if (currentList.length > 0) {
              pages[currentPage].sections.push({
                id: 'education',
                education: currentList,
                isContinued: pages.slice(0, currentPage).some(p => p.sections.some(s => s.id === 'education')),
              });
            }
          }
          break;
        }

        case 'experience': {
          if (experiences.length === 0) {
            if (isEditMode) {
              ensureSpace(80);
              pages[currentPage].sections.push({ id: 'experience', experiences: [] });
              currentWeight += 80;
            }
          } else {
            let currentList: any[] = [];
            for (const exp of experiences) {
              const w = estimateExperienceWeight(exp);
              const limit = currentPage === 0 ? PAGE1_USABLE : EXTRA_USABLE;
              if (currentWeight + w > limit && (pages[currentPage].sections.length > 0 || currentList.length > 0)) {
                if (currentList.length > 0) {
                  pages[currentPage].sections.push({
                    id: 'experience',
                    experiences: currentList,
                    isContinued: pages.some(p => p.sections.some(s => s.id === 'experience')),
                  });
                  currentList = [];
                }
                currentPage++;
                currentWeight = 0;
                pages.push({ pageNumber: currentPage + 1, sections: [] });
              }
              currentList.push(exp);
              currentWeight += w;
            }
            if (currentList.length > 0) {
              pages[currentPage].sections.push({
                id: 'experience',
                experiences: currentList,
                isContinued: pages.slice(0, currentPage).some(p => p.sections.some(s => s.id === 'experience')),
              });
            }
          }
          break;
        }

        case 'skills': {
          const cats = Object.keys(skillsByCategory);
          if (cats.length === 0) {
            if (isEditMode) {
              ensureSpace(50);
              pages[currentPage].sections.push({ id: 'skills', skillCats: [] });
              currentWeight += 50;
            }
          } else {
            const w = 35 + cats.length * 25;
            ensureSpace(w);
            pages[currentPage].sections.push({ id: 'skills', skillCats: cats });
            currentWeight += w;
          }
          break;
        }

        case 'softSkills': {
          if (profile.softSkills || isEditMode) {
            ensureSpace(45);
            pages[currentPage].sections.push({ id: 'softSkills', showSoftSkills: true });
            currentWeight += 45;
          }
          break;
        }

        case 'achievements': {
          if (achievements.length > 0 || isEditMode) {
            const w = 35 + Math.max(achievements.length, 1) * 32;
            ensureSpace(w);
            pages[currentPage].sections.push({ id: 'achievements', achievements });
            currentWeight += w;
          }
          break;
        }

        case 'activities': {
          if (activities.length > 0 || isEditMode) {
            const w = 35 + Math.max(activities.length, 1) * 32;
            ensureSpace(w);
            pages[currentPage].sections.push({ id: 'activities', activities });
            currentWeight += w;
          }
          break;
        }

        case 'languages': {
          if (spokenLanguages.length > 0 || isEditMode) {
            const w = 35 + Math.max(spokenLanguages.length, 1) * 20;
            ensureSpace(w);
            pages[currentPage].sections.push({ id: 'languages', spokenLanguages });
            currentWeight += w;
          }
          break;
        }
      }
    }

    return pages;
  }, [
    sectionLayout,
    experiences,
    education,
    skillsByCategory,
    profile,
    spokenLanguages,
    achievements,
    activities,
    isEditMode,
  ]);

  // ── 2. Modern 2-Column Pagination ────────────────────────────
  const modernPages = useMemo((): ModernPageData[] => {
    const PAGE1_LEFT = 500;
    const PAGE1_RIGHT = 540;
    const EXTRA_LIMIT = 860;

    const paginateCol = (col: 'left' | 'right'): ColumnPageData[] => {
      const colSections = (col === 'left' ? sectionLayout.left : sectionLayout.right).filter(
        id => !sectionLayout.hidden.includes(id)
      );

      const colPages: ColumnPageData[] = [emptyColPage()];
      let currentPage = 0;
      let currentWeight = 0;

      const ensureSpace = (weightNeeded: number) => {
        const limit = currentPage === 0 ? (col === 'left' ? PAGE1_LEFT : PAGE1_RIGHT) : EXTRA_LIMIT;
        const hasContent = colPages[currentPage].sections.length > 0;
        if (currentWeight + weightNeeded > limit && hasContent) {
          currentPage++;
          currentWeight = 0;
          colPages.push(emptyColPage());
        }
      };

      for (const id of colSections) {
        switch (id) {
          case 'bio': {
            if (profile.bio || profile.careerObjective || isEditMode) {
              ensureSpace(85);
              colPages[currentPage].showBio = true;
              if (!colPages[currentPage].sections.includes('bio')) {
                colPages[currentPage].sections.push('bio');
              }
              currentWeight += 85;
            }
            break;
          }

          case 'experience': {
            if (experiences.length === 0) {
              if (isEditMode) {
                if (!colPages[currentPage].sections.includes('experience')) {
                  colPages[currentPage].sections.push('experience');
                }
              }
            } else {
              for (const exp of experiences) {
                const w = estimateExperienceWeight(exp);
                ensureSpace(w);
                if (!colPages[currentPage].sections.includes('experience')) {
                  colPages[currentPage].sections.push('experience');
                }
                colPages[currentPage].experiences.push(exp);
                currentWeight += w;
              }
            }
            break;
          }

          case 'education': {
            if (education.length === 0) {
              if (isEditMode) {
                if (!colPages[currentPage].sections.includes('education')) {
                  colPages[currentPage].sections.push('education');
                }
              }
            } else {
              for (const edu of education) {
                const w = estimateEducationWeight(edu);
                ensureSpace(w);
                if (!colPages[currentPage].sections.includes('education')) {
                  colPages[currentPage].sections.push('education');
                }
                colPages[currentPage].education.push(edu);
                currentWeight += w;
              }
            }
            break;
          }

          case 'skills': {
            const cats = Object.keys(skillsByCategory);
            if (cats.length === 0) {
              if (isEditMode) {
                if (!colPages[currentPage].sections.includes('skills')) {
                  colPages[currentPage].sections.push('skills');
                }
              }
            } else {
              for (const cat of cats) {
                const skills = skillsByCategory[cat] ?? [];
                const w = estimateSkillCatWeight(skills);
                ensureSpace(w);
                if (!colPages[currentPage].sections.includes('skills')) {
                  colPages[currentPage].sections.push('skills');
                }
                colPages[currentPage].skillCats.push(cat);
                currentWeight += w;
              }
            }
            break;
          }

          case 'softSkills': {
            if (profile.softSkills || isEditMode) {
              ensureSpace(65);
              colPages[currentPage].showSoftSkills = true;
              if (!colPages[currentPage].sections.includes('softSkills')) {
                colPages[currentPage].sections.push('softSkills');
              }
              currentWeight += 65;
            }
            break;
          }

          case 'languages': {
            if (spokenLanguages.length > 0 || isEditMode) {
              const w = 48 + Math.max(spokenLanguages.length, 1) * 22;
              ensureSpace(w);
              colPages[currentPage].spokenLanguages = spokenLanguages;
              if (!colPages[currentPage].sections.includes('languages')) {
                colPages[currentPage].sections.push('languages');
              }
              currentWeight += w;
            }
            break;
          }

          case 'achievements': {
            if (achievements.length > 0 || isEditMode) {
              const w = 48 + Math.max(achievements.length, 1) * 42;
              ensureSpace(w);
              colPages[currentPage].achievements = achievements;
              if (!colPages[currentPage].sections.includes('achievements')) {
                colPages[currentPage].sections.push('achievements');
              }
              currentWeight += w;
            }
            break;
          }

          case 'activities': {
            if (activities.length > 0 || isEditMode) {
              const w = 48 + Math.max(activities.length, 1) * 42;
              ensureSpace(w);
              colPages[currentPage].activities = activities;
              if (!colPages[currentPage].sections.includes('activities')) {
                colPages[currentPage].sections.push('activities');
              }
              currentWeight += w;
            }
            break;
          }
        }
      }

      return colPages;
    };

    const leftPages = paginateCol('left');
    const rightPages = paginateCol('right');
    const total = Math.max(leftPages.length, rightPages.length, 1);

    return Array.from({ length: total }, (_, i) => ({
      pageNumber: i + 1,
      left: leftPages[i] ?? emptyColPage(),
      right: rightPages[i] ?? emptyColPage(),
    }));
  }, [
    sectionLayout,
    experiences,
    education,
    skillsByCategory,
    profile,
    spokenLanguages,
    achievements,
    activities,
    isEditMode,
  ]);

  const totalPages = isHarvard ? harvardPages.length : modernPages.length;

  React.useEffect(() => {
    onSetTotalPages(totalPages);
  }, [totalPages, onSetTotalPages]);

  // ══════════════════════════════════════════════════════════════
  // ── HARVARD TEMPLATE SECTION RENDERER ─────────────────────────
  // ══════════════════════════════════════════════════════════════
  const renderHarvardSection = (
    sec: HarvardSectionSlice,
    _pageNumber: number,
    isFirstInDoc: boolean,
    isLastInDoc: boolean
  ) => {
    const rawTitle = HARVARD_SECTION_TITLES[sec.id] || sec.id.toUpperCase();
    const title = sec.isContinued ? `${rawTitle} (CONTINUED)` : rawTitle;

    let bodyContent: React.ReactNode = null;

    switch (sec.id) {
      case 'bio': {
        bodyContent = (
          <div className="text-xs sm:text-[13px] font-serif text-gray-800 leading-relaxed space-y-2">
            <InlineEditable
              as="p"
              multiline
              isEditMode={isEditMode}
              value={profile.bio || ''}
              onChange={v => onUpdateProfile('bio', v)}
              placeholder="Giới thiệu tóm tắt hồ sơ chuyên môn và định hướng sự nghiệp theo chuẩn Harvard..."
              className="block"
            />
            {(profile.careerObjective || isEditMode) && (
              <p className="italic text-gray-700">
                <span className="font-semibold not-italic text-gray-900">Career Objective: </span>
                <InlineEditable
                  isEditMode={isEditMode}
                  value={profile.careerObjective || ''}
                  onChange={v => onUpdateProfile('careerObjective', v)}
                  placeholder="Mục tiêu nghề nghiệp..."
                />
              </p>
            )}
          </div>
        );
        break;
      }

      case 'education': {
        const edus = sec.education || [];
        bodyContent = (
          <div className="space-y-3">
            {edus.map((edu: any, eduIdx: number) => (
              <div key={edu.id} className="group/edu relative">
                {/* Action Bar on hover in Edit Mode */}
                {isEditMode && (
                  <div className="absolute -top-1 right-0 opacity-0 group-hover/edu:opacity-100 transition-opacity bg-white/95 border border-gray-300 rounded px-1 py-0.5 flex items-center gap-1 shadow-xs z-20">
                    <button
                      type="button"
                      onClick={() => onMoveItem('education', edu.id, 'up')}
                      disabled={eduIdx === 0}
                      className="p-0.5 hover:text-blue-600 text-gray-500 disabled:opacity-20"
                      title="Chuyển lên"
                    >
                      <ArrowUp className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onMoveItem('education', edu.id, 'down')}
                      disabled={eduIdx === edus.length - 1}
                      className="p-0.5 hover:text-blue-600 text-gray-500 disabled:opacity-20"
                      title="Chuyển xuống"
                    >
                      <ArrowDown className="w-3 h-3" />
                    </button>
                    <div className="w-px h-3 bg-gray-200" />
                    <button
                      type="button"
                      onClick={() => onOpenDialog('education', edu)}
                      className="p-0.5 hover:text-blue-600 text-gray-500"
                      title="Sửa chi tiết"
                    >
                      <Edit className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteItem('education', edu.id)}
                      className="p-0.5 hover:text-red-600 text-gray-500"
                      title="Xóa học vấn"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                )}

                {/* Line 1: Institution (Bold left) — Date (Right) */}
                <div className="flex justify-between items-baseline gap-2">
                  <span className="font-bold font-serif text-xs sm:text-[13px] text-gray-950">
                    <InlineEditable
                      isEditMode={isEditMode}
                      value={edu.institution}
                      onChange={v => {
                        edu.institution = v;
                        onUpdateProfile('_touch', Date.now());
                      }}
                      placeholder="Tên trường Đại học / Học viện"
                    />
                  </span>
                  <span
                    onClick={() => isEditMode && onOpenDialog('education', edu)}
                    className={`text-xs font-serif font-medium text-gray-800 shrink-0 ${
                      isEditMode ? 'cursor-pointer hover:text-blue-600' : ''
                    }`}
                    title={isEditMode ? 'Nhấp để đổi mốc thời gian' : undefined}
                  >
                    {edu.startDate ? new Date(edu.startDate).getFullYear() : ''} –{' '}
                    {edu.isCurrent ? 'Present' : edu.endDate ? new Date(edu.endDate).getFullYear() : ''}
                  </span>
                </div>

                {/* Line 2: Degree in Field (Italic left) — GPA / Location (Right) */}
                <div className="flex justify-between items-baseline gap-2">
                  <span className="font-serif italic text-xs sm:text-[13px] text-gray-800">
                    <InlineEditable
                      isEditMode={isEditMode}
                      value={edu.degree}
                      onChange={v => {
                        edu.degree = v;
                        onUpdateProfile('_touch', Date.now());
                      }}
                      placeholder="Bằng cấp (VD: Bachelor of Science)"
                    />
                    {edu.fieldOfStudy && (
                      <span>
                        {' '}in{' '}
                        <InlineEditable
                          isEditMode={isEditMode}
                          value={edu.fieldOfStudy}
                          onChange={v => {
                            edu.fieldOfStudy = v;
                            onUpdateProfile('_touch', Date.now());
                          }}
                          placeholder="Chuyên ngành"
                        />
                      </span>
                    )}
                  </span>
                  {(edu.gpa || isEditMode) && (
                    <span className="font-serif text-xs text-gray-700 shrink-0">
                      GPA:{' '}
                      <InlineEditable
                        isEditMode={isEditMode}
                        value={edu.gpa || ''}
                        onChange={v => {
                          edu.gpa = v;
                          onUpdateProfile('_touch', Date.now());
                        }}
                        placeholder="GPA..."
                      />
                    </span>
                  )}
                </div>

                {/* Description / Coursework */}
                {(edu.description || isEditMode) && (
                  <InlineEditable
                    as="p"
                    multiline
                    isEditMode={isEditMode}
                    value={edu.description || ''}
                    onChange={v => {
                      edu.description = v;
                      onUpdateProfile('_touch', Date.now());
                    }}
                    placeholder="Môn học tiêu biểu, đề tài nghiên cứu hoặc thành tích..."
                    className="text-xs font-serif text-gray-700 leading-relaxed mt-0.5 block"
                  />
                )}
              </div>
            ))}

            {edus.length === 0 && (
              <div className="text-xs font-serif text-gray-400 italic py-1">Chưa có thông tin học vấn</div>
            )}

            {isEditMode && (
              <button
                type="button"
                onClick={() => onOpenDialog('education')}
                className="w-full py-1.5 border border-dashed border-gray-300 hover:border-gray-900 text-gray-600 hover:text-gray-950 text-xs font-serif rounded flex items-center justify-center gap-1 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                Thêm học vấn / bằng cấp
              </button>
            )}
          </div>
        );
        break;
      }

      case 'experience': {
        const exps = sec.experiences || [];
        bodyContent = (
          <div className="space-y-4">
            {exps.map((exp: any, expIdx: number) => {
              const bulletPoints = (exp.achievements || '')
                .split('\n')
                .map((s: string) => s.trim())
                .filter(Boolean);

              return (
                <div key={exp.id} className="group/exp relative">
                  {/* Action Bar on hover in Edit Mode */}
                  {isEditMode && (
                    <div className="absolute -top-1 right-0 opacity-0 group-hover/exp:opacity-100 transition-opacity bg-white/95 border border-gray-300 rounded px-1 py-0.5 flex items-center gap-1 shadow-xs z-20">
                      <button
                        type="button"
                        onClick={() => onMoveItem('experience', exp.id, 'up')}
                        disabled={expIdx === 0}
                        className="p-0.5 hover:text-blue-600 text-gray-500 disabled:opacity-20"
                        title="Chuyển lên"
                      >
                        <ArrowUp className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onMoveItem('experience', exp.id, 'down')}
                        disabled={expIdx === exps.length - 1}
                        className="p-0.5 hover:text-blue-600 text-gray-500 disabled:opacity-20"
                        title="Chuyển xuống"
                      >
                        <ArrowDown className="w-3 h-3" />
                      </button>
                      <div className="w-px h-3 bg-gray-200" />
                      <button
                        type="button"
                        onClick={() => onOpenDialog('experience', exp)}
                        className="p-0.5 hover:text-blue-600 text-gray-500"
                        title="Sửa chi tiết"
                      >
                        <Edit className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteItem('experience', exp.id)}
                        className="p-0.5 hover:text-red-600 text-gray-500"
                        title="Xóa kinh nghiệm"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  )}

                  {/* Line 1: Company (Bold left) — Date (Right) */}
                  <div className="flex justify-between items-baseline gap-2">
                    <span className="font-bold font-serif text-xs sm:text-[13px] text-gray-950">
                      <InlineEditable
                        isEditMode={isEditMode}
                        value={exp.company}
                        onChange={v => {
                          exp.company = v;
                          onUpdateProfile('_touch', Date.now());
                        }}
                        placeholder="Tên công ty / Tổ chức"
                      />
                    </span>
                    <span
                      onClick={() => isEditMode && onOpenDialog('experience', exp)}
                      className={`text-xs font-serif font-medium text-gray-800 shrink-0 ${
                        isEditMode ? 'cursor-pointer hover:text-blue-600' : ''
                      }`}
                      title={isEditMode ? 'Nhấp để đổi mốc thời gian' : undefined}
                    >
                      {exp.startDate
                        ? new Date(exp.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
                        : ''}{' '}
                      –{' '}
                      {exp.isCurrent
                        ? 'Present'
                        : exp.endDate
                        ? new Date(exp.endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
                        : ''}
                    </span>
                  </div>

                  {/* Line 2: Position (Italic left) — Location (Right) */}
                  <div className="flex justify-between items-baseline gap-2">
                    <span className="font-serif italic text-xs sm:text-[13px] text-gray-800">
                      <InlineEditable
                        isEditMode={isEditMode}
                        value={exp.position}
                        onChange={v => {
                          exp.position = v;
                          onUpdateProfile('_touch', Date.now());
                        }}
                        placeholder="Vị trí / Chức danh"
                      />
                    </span>
                    {profile.location && (
                      <span className="font-serif italic text-xs text-gray-600 shrink-0">
                        {profile.location}
                      </span>
                    )}
                  </div>

                  {/* Optional Summary */}
                  {(exp.description || isEditMode) && (
                    <InlineEditable
                      as="p"
                      multiline
                      isEditMode={isEditMode}
                      value={exp.description || ''}
                      onChange={v => {
                        exp.description = v;
                        onUpdateProfile('_touch', Date.now());
                      }}
                      placeholder="Mô tả phạm vi trách nhiệm tổng quát..."
                      className="text-xs font-serif text-gray-700 leading-relaxed mt-0.5 block"
                    />
                  )}

                  {/* Bullet points with Action Verbs */}
                  <ul className="mt-1 list-disc pl-5 space-y-0.5 text-xs sm:text-[13px] font-serif text-gray-800 leading-relaxed">
                    {bulletPoints.map((point: string, pIdx: number) => (
                      <li key={pIdx} className="group/bullet">
                        <div className="flex items-start justify-between gap-1">
                          <div className="flex-1">
                            <InlineEditable
                              isEditMode={isEditMode}
                              value={point}
                              onChange={newVal => {
                                const updated = [...bulletPoints];
                                updated[pIdx] = newVal;
                                onUpdateExperienceAchievements(exp.id, updated.join('\n'));
                              }}
                              placeholder="Thành tích hành động (Action Verb + Scope + Quantifiable Metric)..."
                              className="block"
                            />
                          </div>
                          {isEditMode && (
                            <button
                              type="button"
                              onClick={() => {
                                const updated = bulletPoints.filter((_: any, i: number) => i !== pIdx);
                                onUpdateExperienceAchievements(exp.id, updated.join('\n'));
                              }}
                              className="opacity-0 group-hover/bullet:opacity-100 p-0.5 text-gray-300 hover:text-red-500 shrink-0 transition"
                              title="Xóa bullet"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>

                  {/* Add bullet button */}
                  {isEditMode && (
                    <button
                      type="button"
                      onClick={() => {
                        const updated = [...bulletPoints, 'Đạt kết quả cụ thể thông qua triển khai giải pháp mới'];
                        onUpdateExperienceAchievements(exp.id, updated.join('\n'));
                      }}
                      className="text-[11px] font-serif text-gray-500 hover:text-gray-900 flex items-center gap-1 mt-1 opacity-70 hover:opacity-100 transition"
                    >
                      <Plus className="w-3 h-3" />
                      Thêm bullet thành tích
                    </button>
                  )}

                  {/* Technologies (Harvard inline format) */}
                  {(exp.techStack || isEditMode) && (
                    <p className="mt-1 text-xs font-serif text-gray-700">
                      <span className="font-semibold text-gray-900">Technologies: </span>
                      <InlineEditable
                        isEditMode={isEditMode}
                        value={exp.techStack || ''}
                        onChange={v => onUpdateExperienceTechStack(exp.id, v)}
                        placeholder="React, Next.js, Node.js, Docker..."
                        className="inline"
                      />
                    </p>
                  )}
                </div>
              );
            })}

            {exps.length === 0 && (
              <div className="text-xs font-serif text-gray-400 italic py-1">Chưa có thông tin kinh nghiệm</div>
            )}

            {isEditMode && (
              <button
                type="button"
                onClick={() => onOpenDialog('experience')}
                className="w-full py-1.5 border border-dashed border-gray-300 hover:border-gray-900 text-gray-600 hover:text-gray-950 text-xs font-serif rounded flex items-center justify-center gap-1 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                Thêm vị trí kinh nghiệm
              </button>
            )}
          </div>
        );
        break;
      }

      case 'skills': {
        const cats = sec.skillCats || [];
        bodyContent = (
          <div className="space-y-1 text-xs sm:text-[13px] font-serif text-gray-800 leading-relaxed">
            {cats.map(cat => {
              const skills = skillsByCategory[cat] ?? [];
              return (
                <div key={cat} className="group/skillrow flex flex-wrap items-baseline gap-1">
                  <span className="font-bold text-gray-950">
                    {CATEGORY_LABELS[cat] ?? cat}:{' '}
                  </span>
                  <span>
                    {skills.map(s => s.name).join(', ')}
                  </span>
                  {isEditMode && (
                    <button
                      type="button"
                      onClick={() => onQuickAddSkill(cat)}
                      className="text-[10px] font-sans text-blue-600 hover:underline inline-flex items-center gap-0.5 ml-1 opacity-0 group-hover/skillrow:opacity-100 transition"
                    >
                      <Plus className="w-2.5 h-2.5" />
                      <span>Thêm</span>
                    </button>
                  )}
                </div>
              );
            })}

            {cats.length === 0 && (
              <div className="text-xs font-serif text-gray-400 italic py-1">Chưa có kỹ năng kỹ thuật</div>
            )}
          </div>
        );
        break;
      }

      case 'softSkills': {
        bodyContent = (
          <div className="text-xs sm:text-[13px] font-serif text-gray-800 leading-relaxed">
            <span className="font-bold text-gray-950">Core Competencies: </span>
            <InlineEditable
              isEditMode={isEditMode}
              value={profile.softSkills || ''}
              onChange={v => onUpdateProfile('softSkills', v)}
              placeholder="Leadership, Team Collaboration, Problem Solving, Agile..."
              className="inline"
            />
          </div>
        );
        break;
      }

      case 'achievements': {
        const achs = sec.achievements || [];
        bodyContent = (
          <div className="space-y-1.5 text-xs sm:text-[13px] font-serif text-gray-800">
            {achs.map((ach: any) => (
              <div key={ach.id} className="group/ach flex justify-between items-baseline gap-2">
                <div className="flex-1">
                  <span className="font-bold text-gray-950">
                    <InlineEditable
                      isEditMode={isEditMode}
                      value={ach.title}
                      onChange={v => {
                        ach.title = v;
                        onUpdateProfile('_touch', Date.now());
                      }}
                      placeholder="Tên giải thưởng / thành tích"
                    />
                  </span>
                  {(ach.description || isEditMode) && (
                    <span className="text-gray-700">
                      {' '}—{' '}
                      <InlineEditable
                        isEditMode={isEditMode}
                        value={ach.description || ''}
                        onChange={v => {
                          ach.description = v;
                          onUpdateProfile('_touch', Date.now());
                        }}
                        placeholder="Đơn vị trao giải hoặc chi tiết thành tích..."
                      />
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {ach.date && (
                    <span className="text-xs text-gray-600">
                      {new Date(ach.date).getFullYear()}
                    </span>
                  )}
                  {isEditMode && (
                    <button
                      type="button"
                      onClick={() => onDeleteItem('achievement', ach.id)}
                      className="opacity-0 group-hover/ach:opacity-100 hover:text-red-500 text-gray-400 p-0.5 transition"
                    >
                      <Trash2 className="w-2.5 h-2.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}

            {achs.length === 0 && (
              <div className="text-xs font-serif text-gray-400 italic py-1">Chưa có giải thưởng / thành tích</div>
            )}
          </div>
        );
        break;
      }

      case 'activities': {
        const acts = sec.activities || [];
        bodyContent = (
          <div className="space-y-2 text-xs sm:text-[13px] font-serif text-gray-800">
            {acts.map((act: any) => (
              <div key={act.id} className="group/act">
                <div className="flex justify-between items-baseline gap-2">
                  <span className="font-bold text-gray-950">
                    <InlineEditable
                      isEditMode={isEditMode}
                      value={act.title}
                      onChange={v => {
                        act.title = v;
                        onUpdateProfile('_touch', Date.now());
                      }}
                      placeholder="Tên hoạt động / Dự án cộng đồng"
                    />
                  </span>
                  <div className="flex items-center gap-1 shrink-0">
                    {act.startDate && (
                      <span className="text-xs text-gray-600">
                        {new Date(act.startDate).getFullYear()}
                      </span>
                    )}
                    {isEditMode && (
                      <button
                        type="button"
                        onClick={() => onDeleteItem('activity', act.id)}
                        className="opacity-0 group-hover/act:opacity-100 hover:text-red-500 text-gray-400 p-0.5 transition"
                      >
                        <Trash2 className="w-2.5 h-2.5" />
                      </button>
                    )}
                  </div>
                </div>
                {(act.description || isEditMode) && (
                  <InlineEditable
                    as="p"
                    multiline
                    isEditMode={isEditMode}
                    value={act.description || ''}
                    onChange={v => {
                      act.description = v;
                      onUpdateProfile('_touch', Date.now());
                    }}
                    placeholder="Mô tả vai trò đóng góp và kết quả..."
                    className="text-xs text-gray-700 leading-relaxed mt-0.5 block"
                  />
                )}
              </div>
            ))}

            {acts.length === 0 && (
              <div className="text-xs font-serif text-gray-400 italic py-1">Chưa có hoạt động / dự án</div>
            )}
          </div>
        );
        break;
      }

      case 'languages': {
        const langs = sec.spokenLanguages || [];
        bodyContent = (
          <div className="text-xs sm:text-[13px] font-serif text-gray-800 leading-relaxed">
            <span className="font-bold text-gray-950">Languages: </span>
            {langs.map((lang: any, lIdx: number) => (
              <span key={lang.id} className="group/lang">
                {lIdx > 0 && '; '}
                <span className="font-medium text-gray-900">{lang.language}</span> ({lang.level})
                {isEditMode && (
                  <button
                    type="button"
                    onClick={() => onDeleteItem('language', lang.id)}
                    className="opacity-0 group-hover/lang:opacity-100 text-gray-400 hover:text-red-500 ml-0.5 p-0.5"
                  >
                    <X className="w-2.5 h-2.5 inline" />
                  </button>
                )}
              </span>
            ))}
            {isEditMode && (
              <button
                type="button"
                onClick={() => onOpenDialog('language')}
                className="text-[10px] font-sans text-blue-600 hover:underline inline-flex items-center gap-0.5 ml-1.5"
              >
                <Plus className="w-2.5 h-2.5" />
                <span>Thêm</span>
              </button>
            )}
            {langs.length === 0 && (
              <span className="italic text-gray-400">Chưa có thông tin ngoại ngữ</span>
            )}
          </div>
        );
        break;
      }
    }

    return (
      <section
        key={`${sec.id}-${sec.isContinued ? 'cont' : 'main'}`}
        id={`section-${sec.id}`}
        className="group/sec relative scroll-mt-6 mb-4"
      >
        {/* Harvard Section Heading: Uppercase, bold, serif, solid 1px full-width border */}
        <div className="border-b border-gray-950 pb-0.5 mt-3 mb-2 flex items-baseline justify-between">
          <h3 className="text-xs sm:text-sm font-bold font-serif uppercase tracking-wider text-gray-950 select-text">
            {title}
          </h3>

          {/* Reorder & Visibility controls in edit mode */}
          {isEditMode && (
            <div className="opacity-0 group-hover/sec:opacity-100 transition-opacity flex items-center gap-1 bg-white/95 border border-gray-300 rounded px-1.5 py-0.5 shadow-xs text-xs font-sans">
              <span className="text-[10px] text-gray-500 font-semibold uppercase mr-1">
                {SECTION_META[sec.id]?.label || sec.id}
              </span>
              <button
                type="button"
                disabled={isFirstInDoc}
                onClick={() => onMoveSection(sec.id, 'up')}
                className="p-0.5 hover:text-blue-600 text-gray-500 disabled:opacity-25"
                title="Đưa lên trên"
              >
                <ArrowUp className="w-3 h-3" />
              </button>
              <button
                type="button"
                disabled={isLastInDoc}
                onClick={() => onMoveSection(sec.id, 'down')}
                className="p-0.5 hover:text-blue-600 text-gray-500 disabled:opacity-25"
                title="Đưa xuống dưới"
              >
                <ArrowDown className="w-3 h-3" />
              </button>
              <button
                type="button"
                onClick={() => onToggleHideSection(sec.id)}
                className="p-0.5 hover:text-red-500 text-gray-400 ml-0.5"
                title="Ẩn mục này khỏi CV"
              >
                <EyeOff className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>

        {/* Section Body */}
        {bodyContent}
      </section>
    );
  };

  // ══════════════════════════════════════════════════════════════
  // ── MODERN TEMPLATE SECTION RENDERER ──────────────────────────
  // ══════════════════════════════════════════════════════════════
  const renderModernSection = (
    sectionId: SectionId,
    col: 'left' | 'right',
    pageColData: ColumnPageData,
    pageNumber: number
  ) => {
    const colSections = (col === 'left' ? sectionLayout.left : sectionLayout.right).filter(
      id => !sectionLayout.hidden.includes(id)
    );
    const secIdx = colSections.indexOf(sectionId);
    const isFirst = secIdx <= 0;
    const isLast = secIdx >= colSections.length - 1;

    let content: React.ReactNode = null;

    switch (sectionId) {
      case 'bio': {
        content = (
          <section id="section-bio" className="group/profile relative scroll-mt-6">
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2.5">Profile</h3>
            <InlineEditable
              as="p"
              multiline
              isEditMode={isEditMode}
              value={profile.bio || ''}
              onChange={v => onUpdateProfile('bio', v)}
              placeholder="Giới thiệu tóm tắt kinh nghiệm và định hướng nghề nghiệp..."
              className="text-sm text-gray-600 leading-relaxed block"
            />
            {(profile.careerObjective || isEditMode) && (
              <div className="mt-2.5">
                <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">
                  Mục tiêu nghề nghiệp
                </span>
                <InlineEditable
                  as="p"
                  multiline
                  isEditMode={isEditMode}
                  value={profile.careerObjective || ''}
                  onChange={v => onUpdateProfile('careerObjective', v)}
                  placeholder="Mục tiêu nghề nghiệp ngắn hạn và dài hạn..."
                  className="text-sm text-gray-600 leading-relaxed italic block"
                />
              </div>
            )}
          </section>
        );
        break;
      }

      case 'experience': {
        const expsToRender = pageColData.experiences;
        content = (
          <section id="section-experience" className="scroll-mt-6">
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">
              {pageNumber === 1 ? 'Experience' : 'Experience (Continued)'}
            </h3>
            <div className="space-y-6">
              {expsToRender.map((exp: any, expIdx: number) => {
                const bulletPoints = (exp.achievements || '')
                  .split('\n')
                  .map((s: string) => s.trim())
                  .filter(Boolean);

                const techTags = (exp.techStack || '')
                  .split(',')
                  .map((s: string) => s.trim())
                  .filter(Boolean);

                return (
                  <div
                    key={exp.id}
                    className="group/exp relative pl-4 border-l-2 border-gray-200 hover:border-blue-400 transition-colors"
                  >
                    {isEditMode && (
                      <div className="absolute top-0 right-0 opacity-0 group-hover/exp:opacity-100 transition-opacity bg-white/95 border border-gray-200 rounded-md p-0.5 flex items-center gap-1 shadow-xs z-20">
                        <button
                          type="button"
                          onClick={() => onMoveItem('experience', exp.id, 'up')}
                          disabled={expIdx === 0}
                          className="p-1 hover:text-blue-600 text-gray-500 disabled:opacity-30"
                          title="Chuyển lên"
                        >
                          <ArrowUp className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onMoveItem('experience', exp.id, 'down')}
                          disabled={expIdx === expsToRender.length - 1}
                          className="p-1 hover:text-blue-600 text-gray-500 disabled:opacity-30"
                          title="Chuyển xuống"
                        >
                          <ArrowDown className="w-3 h-3" />
                        </button>
                        <div className="w-px h-3 bg-gray-200" />
                        <button
                          type="button"
                          onClick={() => onOpenDialog('experience', exp)}
                          className="p-1 hover:text-blue-600 text-gray-500"
                          title="Sửa chi tiết"
                        >
                          <Edit className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteItem('experience', exp.id)}
                          className="p-1 hover:text-red-600 text-gray-500"
                          title="Xóa kinh nghiệm"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}

                    <div className="flex flex-wrap justify-between items-baseline gap-2 mb-0.5">
                      <h4 className="font-bold text-gray-900 text-sm">
                        <InlineEditable
                          isEditMode={isEditMode}
                          value={exp.position}
                          onChange={v => {
                            exp.position = v;
                            onUpdateProfile('_touch', Date.now());
                          }}
                          placeholder="Vị trí / Chức danh"
                        />
                      </h4>
                      <span
                        onClick={() => isEditMode && onOpenDialog('experience', exp)}
                        className={`text-xs text-gray-400 font-mono ${
                          isEditMode ? 'cursor-pointer hover:text-blue-600' : ''
                        }`}
                      >
                        {exp.startDate ? new Date(exp.startDate).getFullYear() : ''} –{' '}
                        {exp.isCurrent ? 'Present' : exp.endDate ? new Date(exp.endDate).getFullYear() : ''}
                      </span>
                    </div>

                    <p className="text-xs font-semibold text-blue-600 mb-1.5">
                      <InlineEditable
                        isEditMode={isEditMode}
                        value={exp.company}
                        onChange={v => {
                          exp.company = v;
                          onUpdateProfile('_touch', Date.now());
                        }}
                        placeholder="Tên công ty"
                      />
                    </p>

                    {(exp.description || isEditMode) && (
                      <InlineEditable
                        as="p"
                        multiline
                        isEditMode={isEditMode}
                        value={exp.description || ''}
                        onChange={v => {
                          exp.description = v;
                          onUpdateProfile('_touch', Date.now());
                        }}
                        placeholder="Mô tả công việc..."
                        className="text-xs text-gray-500 leading-relaxed block"
                      />
                    )}

                    <ul className="mt-2 space-y-1">
                      {bulletPoints.map((point: string, pIdx: number) => (
                        <li key={pIdx} className="group/bullet text-xs text-gray-500 flex items-start gap-1.5">
                          <span className="text-blue-400 mt-0.5 select-none">•</span>
                          <div className="flex-1">
                            <InlineEditable
                              isEditMode={isEditMode}
                              value={point}
                              onChange={newVal => {
                                const updated = [...bulletPoints];
                                updated[pIdx] = newVal;
                                onUpdateExperienceAchievements(exp.id, updated.join('\n'));
                              }}
                              placeholder="Thành tích nổi bật..."
                              className="block"
                            />
                          </div>
                          {isEditMode && (
                            <button
                              type="button"
                              onClick={() => {
                                const updated = bulletPoints.filter((_: any, i: number) => i !== pIdx);
                                onUpdateExperienceAchievements(exp.id, updated.join('\n'));
                              }}
                              className="opacity-0 group-hover/bullet:opacity-100 p-0.5 text-gray-300 hover:text-red-500 transition-opacity"
                              title="Xóa bullet"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          )}
                        </li>
                      ))}
                    </ul>

                    <div className="flex flex-wrap gap-1 mt-2.5 items-center">
                      {techTags.map((tech: string, tIdx: number) => (
                        <span
                          key={tIdx}
                          className="group/chip text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded font-mono flex items-center gap-1"
                        >
                          <span>{tech}</span>
                          {isEditMode && (
                            <button
                              type="button"
                              onClick={() => {
                                const updated = techTags.filter((_: any, i: number) => i !== tIdx);
                                onUpdateExperienceTechStack(exp.id, updated.join(', '));
                              }}
                              className="opacity-40 hover:opacity-100 hover:text-red-500"
                            >
                              <X className="w-2.5 h-2.5" />
                            </button>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}

              {expsToRender.length === 0 && (
                <div className="text-xs text-gray-400 italic py-2">Chưa có thông tin kinh nghiệm</div>
              )}
            </div>
          </section>
        );
        break;
      }

      case 'education': {
        const edusToRender = pageColData.education;
        content = (
          <section id="section-education" className="scroll-mt-6">
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">
              Education & Credentials
            </h3>
            <div className="space-y-4">
              {edusToRender.map((edu: any, eduIdx: number) => (
                <div
                  key={edu.id}
                  className="group/edu relative pl-4 border-l-2 border-gray-200 hover:border-blue-400 transition-colors"
                >
                  {isEditMode && (
                    <div className="absolute top-0 right-0 opacity-0 group-hover/edu:opacity-100 transition-opacity bg-white/95 border border-gray-200 rounded-md p-0.5 flex items-center gap-1 shadow-xs z-20">
                      <button
                        type="button"
                        onClick={() => onMoveItem('education', edu.id, 'up')}
                        disabled={eduIdx === 0}
                        className="p-1 hover:text-blue-600 text-gray-500 disabled:opacity-30"
                        title="Chuyển lên"
                      >
                        <ArrowUp className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onMoveItem('education', edu.id, 'down')}
                        disabled={eduIdx === edusToRender.length - 1}
                        className="p-1 hover:text-blue-600 text-gray-500 disabled:opacity-30"
                        title="Chuyển xuống"
                      >
                        <ArrowDown className="w-3 h-3" />
                      </button>
                      <div className="w-px h-3 bg-gray-200" />
                      <button
                        type="button"
                        onClick={() => onOpenDialog('education', edu)}
                        className="p-1 hover:text-blue-600 text-gray-500"
                        title="Sửa chi tiết"
                      >
                        <Edit className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteItem('education', edu.id)}
                        className="p-1 hover:text-red-600 text-gray-500"
                        title="Xóa học vấn"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  )}

                  <div className="flex flex-wrap justify-between items-baseline gap-2 mb-0.5">
                    <h4 className="font-bold text-gray-900 text-sm">
                      <InlineEditable
                        isEditMode={isEditMode}
                        value={edu.degree}
                        onChange={v => {
                          edu.degree = v;
                          onUpdateProfile('_touch', Date.now());
                        }}
                        placeholder="Bằng cấp"
                      />
                      {edu.fieldOfStudy && (
                        <span className="font-normal text-gray-500">
                          {' '}in{' '}
                          <InlineEditable
                            isEditMode={isEditMode}
                            value={edu.fieldOfStudy}
                            onChange={v => {
                              edu.fieldOfStudy = v;
                              onUpdateProfile('_touch', Date.now());
                            }}
                            placeholder="Chuyên ngành"
                          />
                        </span>
                      )}
                    </h4>
                    <span className="text-xs text-gray-400 font-mono">
                      {edu.startDate ? new Date(edu.startDate).getFullYear() : ''} –{' '}
                      {edu.isCurrent ? 'Present' : edu.endDate ? new Date(edu.endDate).getFullYear() : ''}
                    </span>
                  </div>

                  <p className="text-xs font-semibold text-blue-600 mb-1">
                    <InlineEditable
                      isEditMode={isEditMode}
                      value={edu.institution}
                      onChange={v => {
                        edu.institution = v;
                        onUpdateProfile('_touch', Date.now());
                      }}
                      placeholder="Tên trường / học viện"
                    />
                  </p>

                  {(edu.gpa || isEditMode) && (
                    <p className="text-xs text-gray-500">
                      GPA:{' '}
                      <InlineEditable
                        isEditMode={isEditMode}
                        value={edu.gpa || ''}
                        onChange={v => {
                          edu.gpa = v;
                          onUpdateProfile('_touch', Date.now());
                        }}
                        placeholder="GPA..."
                      />
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        );
        break;
      }

      case 'skills': {
        const catsToRender = pageColData.skillCats;
        content = (
          <section id="section-skills" className="scroll-mt-6">
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">
              Technical Skills
            </h3>
            <div className="space-y-4">
              {catsToRender.map(cat => {
                const skills = skillsByCategory[cat] ?? [];
                return (
                  <div key={cat}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] font-bold text-gray-700 uppercase tracking-wide">
                        {CATEGORY_LABELS[cat] ?? cat}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {skills.map(skill => (
                        <span
                          key={skill.id}
                          className="group/skill text-xs px-2 py-0.5 bg-gray-50 border border-gray-200 text-gray-700 rounded-md font-medium flex items-center gap-1 hover:border-blue-300 transition"
                        >
                          <span>{skill.name}</span>
                          {isEditMode && (
                            <button
                              type="button"
                              onClick={() => onDeleteSkill(skill.id)}
                              className="opacity-30 group-hover/skill:opacity-100 hover:text-red-500"
                              title="Xóa kỹ năng"
                            >
                              <X className="w-2.5 h-2.5" />
                            </button>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        );
        break;
      }

      case 'softSkills': {
        content = (
          <section id="section-softskills" className="scroll-mt-6">
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Soft Skills</h3>
            <InlineEditable
              as="p"
              multiline
              isEditMode={isEditMode}
              value={profile.softSkills || ''}
              onChange={v => onUpdateProfile('softSkills', v)}
              placeholder="Kỹ năng mềm..."
              className="text-xs text-gray-600 leading-relaxed block"
            />
          </section>
        );
        break;
      }

      case 'languages': {
        const langsToRender = pageColData.spokenLanguages;
        content = (
          <section id="section-languages" className="scroll-mt-6">
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Languages</h3>
            <div className="space-y-1.5">
              {langsToRender.map((lang: any) => (
                <div key={lang.id} className="group/lang flex items-center justify-between text-xs py-0.5">
                  <span className="font-medium text-gray-800">{lang.language}</span>
                  <span className="text-gray-400 font-mono text-[11px]">{lang.level}</span>
                </div>
              ))}
            </div>
          </section>
        );
        break;
      }

      case 'achievements': {
        const achsToRender = pageColData.achievements;
        content = (
          <section id="section-achievements" className="scroll-mt-6">
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Honors & Awards</h3>
            <div className="space-y-3">
              {achsToRender.map((ach: any) => (
                <div key={ach.id} className="text-xs">
                  <h4 className="font-semibold text-gray-800">{ach.title}</h4>
                  {ach.description && <p className="text-gray-500 text-[11px] mt-0.5">{ach.description}</p>}
                </div>
              ))}
            </div>
          </section>
        );
        break;
      }

      case 'activities': {
        const actsToRender = pageColData.activities;
        content = (
          <section id="section-activities" className="scroll-mt-6">
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Activities</h3>
            <div className="space-y-3">
              {actsToRender.map((act: any) => (
                <div key={act.id} className="text-xs">
                  <h4 className="font-semibold text-gray-800">{act.title}</h4>
                  {act.description && <p className="text-gray-500 text-[11px] mt-0.5">{act.description}</p>}
                </div>
              ))}
            </div>
          </section>
        );
        break;
      }
    }

    if (!isEditMode) {
      return <div key={sectionId} className="scroll-mt-6">{content}</div>;
    }

    return (
      <div
        key={sectionId}
        className="relative group/section rounded-xl transition-all duration-150 p-2 -m-2 hover:bg-slate-50/70 hover:ring-1 hover:ring-blue-300/50 scroll-mt-6"
      >
        <div className="opacity-0 group-hover/section:opacity-100 focus-within:opacity-100 transition-opacity flex items-center justify-between gap-2 bg-slate-900/95 text-white px-3 py-1.5 rounded-lg text-xs shadow-lg mb-2 z-20 border border-slate-700 select-none">
          <div className="flex items-center gap-1.5 min-w-0">
            <GripVertical className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="font-semibold text-[11px] uppercase tracking-wider text-slate-200 truncate">
              {SECTION_META[sectionId]?.label || sectionId}
            </span>
            <span className="text-[10px] text-slate-400 font-mono px-1 py-0.2 bg-slate-800 rounded shrink-0">
              {col === 'left' ? 'Cột Trái' : 'Cột Phải'}
            </span>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              disabled={isFirst}
              onClick={e => {
                e.stopPropagation();
                onMoveSection(sectionId, 'up');
              }}
              className="p-1 hover:bg-slate-800 rounded text-slate-300 hover:text-white disabled:opacity-25 transition-colors"
              title="Di chuyển lên trên"
            >
              <ArrowUp className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              disabled={isLast}
              onClick={e => {
                e.stopPropagation();
                onMoveSection(sectionId, 'down');
              }}
              className="p-1 hover:bg-slate-800 rounded text-slate-300 hover:text-white disabled:opacity-25 transition-colors"
              title="Di chuyển xuống dưới"
            >
              <ArrowDown className="w-3.5 h-3.5" />
            </button>

            <div className="w-px h-3.5 bg-slate-700 mx-0.5" />

            <button
              type="button"
              onClick={e => {
                e.stopPropagation();
                onSwitchSectionColumn(sectionId);
              }}
              className="px-2 py-0.5 hover:bg-slate-800 rounded text-[11px] font-medium text-blue-300 hover:text-blue-200 flex items-center gap-1 transition-colors"
            >
              <ArrowLeftRight className="w-3 h-3" />
              <span>{col === 'left' ? 'Sang phải' : 'Sang trái'}</span>
            </button>

            <div className="w-px h-3.5 bg-slate-700 mx-0.5" />

            <button
              type="button"
              onClick={e => {
                e.stopPropagation();
                onToggleHideSection(sectionId);
              }}
              className="p-1 hover:bg-red-500/30 rounded text-slate-400 hover:text-red-300 transition-colors"
              title="Ẩn mục này khỏi CV"
            >
              <EyeOff className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {content}
      </div>
    );
  };

  // ══════════════════════════════════════════════════════════════
  // ── MAIN CANVAS RENDER ────────────────────────────────────────
  // ══════════════════════════════════════════════════════════════
  return (
    <div className="w-full space-y-10">
      {isHarvard ? (
        // ── 🏛️ HARVARD SINGLE-COLUMN LAYOUT ─────────────────────
        harvardPages.map((page, pIdx) => {
          const isVisible = viewMode === 'stack' || activePage === page.pageNumber;
          if (!isVisible) return null;

          return (
            <div key={`harvard-page-${page.pageNumber}`} className="relative">
              {/* Sheet Header Badge */}
              {totalPages > 1 && (
                <div className="max-w-4xl mx-auto flex items-center justify-between mb-2 px-2 text-xs text-muted-foreground">
                  <span className="font-bold uppercase tracking-wider text-[11px] text-amber-800 dark:text-amber-500">
                    Harvard CV · Trang {page.pageNumber} / {totalPages}
                  </span>
                  <span className="text-[11px] italic font-serif">
                    {page.pageNumber === 1 ? 'Primary Credentials & Experience' : 'Credentials & Continued Sections'}
                  </span>
                </div>
              )}

              <ResumeCard3D>
                <div className="bg-white text-gray-900 p-8 sm:p-12 rounded-sm font-serif min-h-[920px] flex flex-col justify-between select-text shadow-sm">
                  <div>
                    {/* ── Page 1: Centered Harvard Ivy League Header ── */}
                    {page.pageNumber === 1 ? (
                      <header id="section-profile" className="text-center pb-3 border-b-2 border-gray-950 mb-5 scroll-mt-6">
                        {/* Candidate Full Name */}
                        <InlineEditable
                          as="h1"
                          isEditMode={isEditMode}
                          value={profile.name}
                          onChange={v => onUpdateProfile('name', v)}
                          placeholder="HỌ VÀ TÊN CỦA BẠN"
                          className="text-2xl sm:text-3xl font-bold font-serif uppercase tracking-widest text-gray-950 mb-1.5 block"
                        />

                        {/* Professional Title / Subtitle */}
                        {profile.title && (
                          <InlineEditable
                            as="p"
                            isEditMode={isEditMode}
                            value={profile.title}
                            onChange={v => onUpdateProfile('title', v)}
                            placeholder="Chức danh nghề nghiệp (VD: Senior Software Engineer)"
                            className="text-xs sm:text-sm font-serif italic text-gray-700 mb-2 block"
                          />
                        )}

                        {/* Centered Contact Bar with Bullets (•) */}
                        <div id="section-social" className="flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1 text-xs font-serif text-gray-700 scroll-mt-6">
                          {profile.location && (
                            <span className="inline-flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-gray-500 shrink-0" />
                              <InlineEditable
                                isEditMode={isEditMode}
                                value={profile.location}
                                onChange={v => onUpdateProfile('location', v)}
                                placeholder="Địa điểm"
                              />
                            </span>
                          )}

                          {profile.location && profile.phone && <span>•</span>}

                          {(profile.phone || isEditMode) && (
                            <span className="inline-flex items-center gap-1">
                              <Phone className="w-3 h-3 text-gray-500 shrink-0" />
                              <InlineEditable
                                isEditMode={isEditMode}
                                value={profile.phone || ''}
                                onChange={v => onUpdateProfile('phone', v)}
                                placeholder="Số điện thoại"
                              />
                            </span>
                          )}

                          {((profile.phone || profile.location) && profile.email) && <span>•</span>}

                          {profile.email && (
                            <span className="inline-flex items-center gap-1">
                              <Mail className="w-3 h-3 text-gray-500 shrink-0" />
                              <InlineEditable
                                isEditMode={isEditMode}
                                value={profile.email}
                                onChange={v => onUpdateProfile('email', v)}
                                placeholder="Email"
                              />
                            </span>
                          )}

                          {/* Social Links as clean text links with dots */}
                          {socialLinks.map((link: any) => (
                            <React.Fragment key={link.id}>
                              <span>•</span>
                              <span className="group/link inline-flex items-center gap-0.5">
                                <a
                                  href={link.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="underline hover:text-gray-950 font-serif"
                                >
                                  {link.platform}
                                </a>
                                {isEditMode && (
                                  <button
                                    type="button"
                                    onClick={() => onDeleteItem('social', link.id)}
                                    className="opacity-0 group-hover/link:opacity-100 hover:text-red-500 text-gray-400 p-0.5"
                                    title="Xóa link"
                                  >
                                    <Trash2 className="w-2.5 h-2.5" />
                                  </button>
                                )}
                              </span>
                            </React.Fragment>
                          ))}

                          {isEditMode && (
                            <button
                              type="button"
                              onClick={() => onOpenDialog('social')}
                              className="text-[11px] font-sans text-blue-600 hover:underline inline-flex items-center gap-0.5 ml-1"
                            >
                              <Plus className="w-3 h-3" />
                              <span>Link</span>
                            </button>
                          )}
                        </div>
                      </header>
                    ) : (
                      /* ── Page 2+: Harvard Continuation Header ── */
                      <header className="flex items-center justify-between pb-1.5 border-b border-gray-950 mb-5 text-xs font-serif text-gray-600">
                        <span className="font-bold text-gray-950 uppercase tracking-wider">
                          {profile.name}
                        </span>
                        <span className="italic">
                          Curriculum Vitae — Trang {page.pageNumber} / {totalPages}
                        </span>
                      </header>
                    )}

                    {/* ── Harvard Flow: 100% Single-Column Flow ── */}
                    <div className="space-y-4">
                      {page.sections.map((secSlice, sIdx) =>
                        renderHarvardSection(
                          secSlice,
                          page.pageNumber,
                          pIdx === 0 && sIdx === 0,
                          pIdx === harvardPages.length - 1 && sIdx === page.sections.length - 1
                        )
                      )}

                      {page.sections.length === 0 && (
                        <div className="text-center py-12 text-gray-400 italic text-xs">
                          Trang này chưa có mục nội dung nào.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* ── Harvard Subtle Page Footer ── */}
                  <footer className="mt-8 pt-2.5 border-t border-gray-200 flex items-center justify-between text-[10px] font-serif text-gray-500">
                    <span>{profile.name} — Curriculum Vitae</span>
                    <span>Trang {page.pageNumber} / {totalPages}</span>
                  </footer>
                </div>
              </ResumeCard3D>
            </div>
          );
        })
      ) : (
        // ── 📐 MODERN 2-COLUMN LAYOUT ───────────────────────────
        modernPages.map(page => {
          const isVisible = viewMode === 'stack' || activePage === page.pageNumber;
          if (!isVisible) return null;

          const leftSections = page.left.sections;
          const rightSections = page.right.sections;

          return (
            <div key={`modern-page-${page.pageNumber}`} className="relative">
              {totalPages > 1 && (
                <div className="max-w-5xl mx-auto flex items-center justify-between mb-2 px-2 text-xs text-muted-foreground">
                  <span className="font-bold uppercase tracking-wider text-[11px] text-primary">
                    Sheet {page.pageNumber} / {totalPages}
                  </span>
                  <span className="text-[11px]">
                    {page.pageNumber === 1 ? 'Primary Profile & Overview' : 'Experience & Credentials'}
                  </span>
                </div>
              )}

              <ResumeCard3D>
                <div className="bg-white text-gray-800 p-8 sm:p-12 rounded-sm font-sans min-h-[850px] flex flex-col justify-between select-text">
                  <div>
                    {page.pageNumber === 1 ? (
                      <header id="section-profile" className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-6 border-b-2 border-gray-900 mb-8 scroll-mt-6">
                        <div className="flex-1">
                          <InlineEditable
                            as="h2"
                            isEditMode={isEditMode}
                            value={profile.name}
                            onChange={v => onUpdateProfile('name', v)}
                            placeholder="Họ và tên của bạn"
                            className="text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-900 leading-none mb-2 block"
                          />
                          <InlineEditable
                            as="p"
                            isEditMode={isEditMode}
                            value={profile.title}
                            onChange={v => onUpdateProfile('title', v)}
                            placeholder="Chức danh nghề nghiệp"
                            className="text-lg text-blue-600 font-semibold tracking-wide block"
                          />
                        </div>

                        <div id="section-social" className="flex flex-col gap-1.5 text-sm text-gray-500 sm:text-right shrink-0 scroll-mt-6">
                          <div className="flex sm:justify-end items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 shrink-0 text-gray-400" />
                            <InlineEditable
                              isEditMode={isEditMode}
                              value={profile.location || ''}
                              onChange={v => onUpdateProfile('location', v)}
                              placeholder="Địa điểm..."
                            />
                          </div>

                          <div className="flex sm:justify-end items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5 shrink-0 text-gray-400" />
                            <InlineEditable
                              isEditMode={isEditMode}
                              value={profile.email || ''}
                              onChange={v => onUpdateProfile('email', v)}
                              placeholder="Email..."
                            />
                          </div>

                          {(profile.phone || isEditMode) && (
                            <div className="flex sm:justify-end items-center gap-1.5">
                              <Phone className="w-3.5 h-3.5 shrink-0 text-gray-400" />
                              <InlineEditable
                                isEditMode={isEditMode}
                                value={profile.phone || ''}
                                onChange={v => onUpdateProfile('phone', v)}
                                placeholder="Số điện thoại..."
                              />
                            </div>
                          )}

                          <div className="flex flex-wrap sm:justify-end gap-3 mt-1 items-center">
                            {socialLinks.map((link: any) => (
                              <div key={link.id} className="group/link flex items-center gap-1">
                                <DynamicIcon name={link.icon} className="w-3.5 h-3.5 text-gray-500" />
                                <a
                                  href={link.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-blue-600 hover:underline"
                                >
                                  {link.platform}
                                </a>
                                {isEditMode && (
                                  <button
                                    type="button"
                                    onClick={() => onDeleteItem('social', link.id)}
                                    className="opacity-0 group-hover/link:opacity-100 hover:text-red-500 text-gray-400 p-0.5"
                                    title="Xóa link"
                                  >
                                    <Trash2 className="w-2.5 h-2.5" />
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </header>
                    ) : (
                      <header className="flex items-center justify-between pb-4 border-b border-gray-200 mb-6 text-xs text-gray-500">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-900 text-sm">{profile.name}</span>
                          <span className="text-gray-300">|</span>
                          <span className="text-blue-600 font-medium">{profile.title}</span>
                        </div>
                        <div className="font-medium text-gray-400">
                          Curriculum Vitae · Trang {page.pageNumber} / {totalPages}
                        </div>
                      </header>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-[2fr_1px_1fr] gap-8">
                      <div className="flex flex-col gap-7 min-h-[50px]">
                        {leftSections.map(secId =>
                          renderModernSection(secId, 'left', page.left, page.pageNumber)
                        )}
                      </div>
                      <div className="hidden md:block bg-gray-100 self-stretch" />
                      <div className="flex flex-col gap-6 min-h-[50px]">
                        {rightSections.map(secId =>
                          renderModernSection(secId, 'right', page.right, page.pageNumber)
                        )}
                      </div>
                    </div>
                  </div>

                  {page.pageNumber === 1 && (
                    <footer className="mt-8 pt-4 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400 font-mono">
                      <span>Generated via Admin WYSIWYG Hub</span>
                      <span>{profile.name} — Curriculum Vitae</span>
                    </footer>
                  )}
                </div>
              </ResumeCard3D>
            </div>
          );
        })
      )}
    </div>
  );
}
