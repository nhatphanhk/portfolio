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

// ── Weight estimation for pagination ─────────────────────────
function estimateExperienceWeight(exp: any): number {
  let score = 95;
  if (exp.description) score += Math.min(exp.description.length / 3.5, 80);
  if (exp.achievements) {
    const lines = exp.achievements.split('\n').filter(Boolean).length;
    score += lines * 24;
  }
  if (exp.techStack) score += 30;
  return score;
}

function estimateEducationWeight(edu: any): number {
  let score = 80;
  if (edu.fieldOfStudy) score += 20;
  if (edu.description) score += 38;
  return score;
}

function estimateSkillCatWeight(skills: any[]): number {
  const rows = Math.ceil(skills.length / 2.5);
  return 40 + rows * 26;
}

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

interface SectionWrapperProps {
  sectionId: SectionId;
  currentCol: 'left' | 'right';
  isFirst: boolean;
  isLast: boolean;
  isEditMode: boolean;
  onMoveSection: (id: SectionId, dir: 'up' | 'down') => void;
  onSwitchSectionColumn: (id: SectionId) => void;
  onToggleHideSection: (id: SectionId) => void;
  children: React.ReactNode;
}

function SectionWrapper({
  sectionId,
  currentCol,
  isFirst,
  isLast,
  isEditMode,
  onMoveSection,
  onSwitchSectionColumn,
  onToggleHideSection,
  children,
}: SectionWrapperProps) {
  if (!isEditMode) {
    return <div className="scroll-mt-6">{children}</div>;
  }

  return (
    <div className="relative group/section rounded-xl transition-all duration-150 p-2 -m-2 hover:bg-slate-50/70 hover:ring-1 hover:ring-blue-300/50 scroll-mt-6">
      {/* Section Reorder Control Bar */}
      <div className="opacity-0 group-hover/section:opacity-100 focus-within:opacity-100 transition-opacity flex items-center justify-between gap-2 bg-slate-900/95 text-white px-3 py-1.5 rounded-lg text-xs shadow-lg mb-2 z-20 border border-slate-700 select-none">
        <div className="flex items-center gap-1.5 min-w-0">
          <GripVertical className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="font-semibold text-[11px] uppercase tracking-wider text-slate-200 truncate">
            {SECTION_META[sectionId]?.label || sectionId}
          </span>
          <span className="text-[10px] text-slate-400 font-mono px-1 py-0.2 bg-slate-800 rounded shrink-0">
            {currentCol === 'left' ? 'Cột Trái' : 'Cột Phải'}
          </span>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {/* Move Up */}
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

          {/* Move Down */}
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

          {/* Switch Column */}
          <button
            type="button"
            onClick={e => {
              e.stopPropagation();
              onSwitchSectionColumn(sectionId);
            }}
            className="px-2 py-0.5 hover:bg-slate-800 rounded text-[11px] font-medium text-blue-300 hover:text-blue-200 flex items-center gap-1 transition-colors"
            title={`Chuyển sang ${currentCol === 'left' ? 'Cột Phải' : 'Cột Trái'}`}
          >
            <ArrowLeftRight className="w-3 h-3" />
            <span>{currentCol === 'left' ? 'Sang phải' : 'Sang trái'}</span>
          </button>

          <div className="w-px h-3.5 bg-slate-700 mx-0.5" />

          {/* Hide Section */}
          <button
            type="button"
            onClick={e => {
              e.stopPropagation();
              onToggleHideSection(sectionId);
            }}
            className="p-1 hover:bg-red-500/30 rounded text-slate-400 hover:text-red-300 transition-colors"
            title="Ẩn mục này khỏi CV (có thể hiển thị lại từ thanh Sections bên trái)"
          >
            <EyeOff className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Section Content */}
      {children}
    </div>
  );
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
  // ── Dynamic Pagination for both columns based on sectionLayout ───────────────
  const pages = useMemo(() => {
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

  React.useEffect(() => {
    onSetTotalPages(pages.length);
  }, [pages.length, onSetTotalPages]);

  // ── Render Section Content ───────────────────────────────────
  const renderSection = (
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
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400">
                {pageNumber === 1 ? 'Experience' : 'Experience (Continued)'}
              </h3>
            </div>

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
                    {/* Item Action Bar (on hover in Edit Mode) */}
                    {isEditMode && (
                      <div className="absolute top-0 right-0 opacity-0 group-hover/exp:opacity-100 transition-opacity bg-white/95 backdrop-blur-xs border border-gray-200 rounded-md p-0.5 flex items-center gap-1 shadow-xs z-20">
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

                    {/* Position & Dates */}
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
                        title={isEditMode ? 'Nhấp để đổi mốc thời gian' : undefined}
                      >
                        {exp.startDate ? new Date(exp.startDate).getFullYear() : ''} –{' '}
                        {exp.isCurrent ? 'Present' : exp.endDate ? new Date(exp.endDate).getFullYear() : ''}
                      </span>
                    </div>

                    {/* Company */}
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

                    {/* Description */}
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

                    {/* Bullet point achievements */}
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

                    {/* Add bullet button */}
                    {isEditMode && (
                      <button
                        type="button"
                        onClick={() => {
                          const updated = [...bulletPoints, 'Thành tích mới'];
                          onUpdateExperienceAchievements(exp.id, updated.join('\n'));
                        }}
                        className="text-[11px] text-blue-500 hover:text-blue-700 flex items-center gap-1 mt-1.5 opacity-70 hover:opacity-100 transition"
                      >
                        <Plus className="w-3 h-3" />
                        Thêm gạch đầu dòng
                      </button>
                    )}

                    {/* Tech stack chips */}
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

                      {isEditMode && (
                        <button
                          type="button"
                          onClick={() => {
                            const tech = window.prompt('Nhập tên công nghệ mới:');
                            if (tech && tech.trim()) {
                              const updated = [...techTags, tech.trim()];
                              onUpdateExperienceTechStack(exp.id, updated.join(', '));
                            }
                          }}
                          className="text-[10px] px-1.5 py-0.5 border border-dashed border-gray-300 text-gray-400 hover:text-blue-600 hover:border-blue-400 rounded flex items-center gap-0.5"
                        >
                          <Plus className="w-2.5 h-2.5" />
                          <span>Tag</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}

              {expsToRender.length === 0 && (
                <div className="text-xs text-gray-400 italic py-2">Chưa có thông tin kinh nghiệm</div>
              )}
            </div>

            {isEditMode && (
              <button
                type="button"
                onClick={() => onOpenDialog('experience')}
                className="w-full mt-5 py-2.5 border-2 border-dashed border-gray-200 hover:border-blue-400 hover:bg-blue-50/20 text-gray-500 hover:text-blue-600 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all"
              >
                <Plus className="w-4 h-4" />
                Thêm vị trí kinh nghiệm
              </button>
            )}
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
                    <div className="absolute top-0 right-0 opacity-0 group-hover/edu:opacity-100 transition-opacity bg-white/95 backdrop-blur-xs border border-gray-200 rounded-md p-0.5 flex items-center gap-1 shadow-xs z-20">
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
                          {' '}
                          in{' '}
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
                    <span
                      onClick={() => isEditMode && onOpenDialog('education', edu)}
                      className={`text-xs text-gray-400 font-mono ${
                        isEditMode ? 'cursor-pointer hover:text-blue-600' : ''
                      }`}
                    >
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
                      placeholder="Mô tả học vấn..."
                      className="text-xs text-gray-500 leading-relaxed mt-1 block"
                    />
                  )}
                </div>
              ))}

              {edusToRender.length === 0 && (
                <div className="text-xs text-gray-400 italic py-2">Chưa có thông tin học vấn</div>
              )}
            </div>

            {isEditMode && (
              <button
                type="button"
                onClick={() => onOpenDialog('education')}
                className="w-full mt-4 py-2 border-2 border-dashed border-gray-200 hover:border-blue-400 hover:bg-blue-50/20 text-gray-500 hover:text-blue-600 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all"
              >
                <Plus className="w-4 h-4" />
                Thêm học vấn / bằng cấp
              </button>
            )}
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
                      {isEditMode && (
                        <button
                          type="button"
                          onClick={() => onQuickAddSkill(cat)}
                          className="text-[10px] text-blue-600 hover:underline flex items-center gap-0.5"
                        >
                          <Plus className="w-2.5 h-2.5" />
                          Thêm
                        </button>
                      )}
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
                      {skills.length === 0 && (
                        <span className="text-[11px] text-gray-400 italic">Chưa có kỹ năng</span>
                      )}
                    </div>
                  </div>
                );
              })}

              {catsToRender.length === 0 && (
                <div className="text-xs text-gray-400 italic py-2">Chưa có nhóm kỹ năng</div>
              )}
            </div>
          </section>
        );
        break;
      }

      case 'softSkills': {
        content = (
          <section id="section-softskills" className="scroll-mt-6">
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
              Soft Skills
            </h3>
            <InlineEditable
              as="p"
              multiline
              isEditMode={isEditMode}
              value={profile.softSkills || ''}
              onChange={v => onUpdateProfile('softSkills', v)}
              placeholder="Kỹ năng mềm (VD: Lãnh đạo, Giao tiếp, Tư duy phản biện, Quản lý thời gian...)"
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
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400">Languages</h3>
              {isEditMode && (
                <button
                  type="button"
                  onClick={() => onOpenDialog('language')}
                  className="text-[10px] text-blue-600 hover:underline flex items-center gap-0.5"
                >
                  <Plus className="w-2.5 h-2.5" />
                  Thêm
                </button>
              )}
            </div>

            <div className="space-y-1.5">
              {langsToRender.map((lang: any) => (
                <div
                  key={lang.id}
                  className="group/lang flex items-center justify-between text-xs py-0.5"
                >
                  <InlineEditable
                    isEditMode={isEditMode}
                    value={lang.language}
                    onChange={v => {
                      lang.language = v;
                      onUpdateProfile('_touch', Date.now());
                    }}
                    placeholder="Ngôn ngữ"
                    className="font-medium text-gray-800"
                  />
                  <div className="flex items-center gap-1">
                    <span className="text-gray-400 font-mono text-[11px]">{lang.level}</span>
                    {isEditMode && (
                      <button
                        type="button"
                        onClick={() => onDeleteItem('language', lang.id)}
                        className="opacity-0 group-hover/lang:opacity-100 p-0.5 hover:text-red-500 text-gray-400"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {langsToRender.length === 0 && (
                <div className="text-xs text-gray-400 italic py-1">Chưa có thông tin ngoại ngữ</div>
              )}
            </div>
          </section>
        );
        break;
      }

      case 'achievements': {
        const achsToRender = pageColData.achievements;
        content = (
          <section id="section-achievements" className="scroll-mt-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400">
                Honors & Awards
              </h3>
              {isEditMode && (
                <button
                  type="button"
                  onClick={() => onOpenDialog('achievement')}
                  className="text-[10px] text-blue-600 hover:underline flex items-center gap-0.5"
                >
                  <Plus className="w-2.5 h-2.5" />
                  Thêm
                </button>
              )}
            </div>

            <div className="space-y-3">
              {achsToRender.map((ach: any) => (
                <div key={ach.id} className="group/ach text-xs">
                  <div className="flex items-baseline justify-between gap-1">
                    <h4 className="font-semibold text-gray-800">
                      <InlineEditable
                        isEditMode={isEditMode}
                        value={ach.title}
                        onChange={v => {
                          ach.title = v;
                          onUpdateProfile('_touch', Date.now());
                        }}
                        placeholder="Tên giải thưởng"
                      />
                    </h4>
                    <div className="flex items-center gap-1">
                      {ach.date && (
                        <span className="text-gray-400 font-mono text-[10px]">
                          {new Date(ach.date).getFullYear()}
                        </span>
                      )}
                      {isEditMode && (
                        <button
                          type="button"
                          onClick={() => onDeleteItem('achievement', ach.id)}
                          className="opacity-0 group-hover/ach:opacity-100 p-0.5 hover:text-red-500 text-gray-400"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                  {(ach.description || isEditMode) && (
                    <InlineEditable
                      as="p"
                      multiline
                      isEditMode={isEditMode}
                      value={ach.description || ''}
                      onChange={v => {
                        ach.description = v;
                        onUpdateProfile('_touch', Date.now());
                      }}
                      placeholder="Chi tiết thành tích..."
                      className="text-gray-500 text-[11px] leading-relaxed block mt-0.5"
                    />
                  )}
                </div>
              ))}

              {achsToRender.length === 0 && (
                <div className="text-xs text-gray-400 italic py-1">Chưa có thành tích / giải thưởng</div>
              )}
            </div>
          </section>
        );
        break;
      }

      case 'activities': {
        const actsToRender = pageColData.activities;
        content = (
          <section id="section-activities" className="scroll-mt-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400">Activities</h3>
              {isEditMode && (
                <button
                  type="button"
                  onClick={() => onOpenDialog('activity')}
                  className="text-[10px] text-blue-600 hover:underline flex items-center gap-0.5"
                >
                  <Plus className="w-2.5 h-2.5" />
                  Thêm
                </button>
              )}
            </div>

            <div className="space-y-3">
              {actsToRender.map((act: any) => (
                <div key={act.id} className="group/act text-xs">
                  <div className="flex items-baseline justify-between gap-1">
                    <h4 className="font-semibold text-gray-800">
                      <InlineEditable
                        isEditMode={isEditMode}
                        value={act.title}
                        onChange={v => {
                          act.title = v;
                          onUpdateProfile('_touch', Date.now());
                        }}
                        placeholder="Tên hoạt động"
                      />
                    </h4>
                    {isEditMode && (
                      <button
                        type="button"
                        onClick={() => onDeleteItem('activity', act.id)}
                        className="opacity-0 group-hover/act:opacity-100 p-0.5 hover:text-red-500 text-gray-400"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
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
                      placeholder="Mô tả hoạt động..."
                      className="text-gray-500 text-[11px] leading-relaxed block mt-0.5"
                    />
                  )}
                </div>
              ))}

              {actsToRender.length === 0 && (
                <div className="text-xs text-gray-400 italic py-1">Chưa có hoạt động ngoại khóa</div>
              )}
            </div>
          </section>
        );
        break;
      }
    }

    return (
      <SectionWrapper
        key={sectionId}
        sectionId={sectionId}
        currentCol={col}
        isFirst={isFirst}
        isLast={isLast}
        isEditMode={isEditMode}
        onMoveSection={onMoveSection}
        onSwitchSectionColumn={onSwitchSectionColumn}
        onToggleHideSection={onToggleHideSection}
      >
        {content}
      </SectionWrapper>
    );
  };

  return (
    <div className="w-full space-y-10">
      {pages.map(page => {
        const isVisible = viewMode === 'stack' || activePage === page.pageNumber;
        if (!isVisible) return null;

        // Sections to render for each column on this page
        const leftSections = page.left.sections;
        const rightSections = page.right.sections;

        return (
          <div key={page.pageNumber} className="relative">
            {/* Sheet Badge */}
            {pages.length > 1 && (
              <div className="max-w-5xl mx-auto flex items-center justify-between mb-2 px-2 text-xs text-muted-foreground">
                <span className="font-bold uppercase tracking-wider text-[11px] text-primary">
                  Sheet {page.pageNumber} / {pages.length}
                </span>
                <span className="text-[11px]">
                  {page.pageNumber === 1 ? 'Primary Profile & Overview' : 'Experience & Credentials'}
                </span>
              </div>
            )}

            <ResumeCard3D>
              <div className="bg-white text-gray-800 p-8 sm:p-12 rounded-sm font-sans min-h-[850px] flex flex-col justify-between select-text">
                <div>
                  {/* ── HEADER ──────────────────────────────────────────────── */}
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
                          placeholder="Chức danh nghề nghiệp (VD: Full-Stack Developer)"
                          className="text-lg text-blue-600 font-semibold tracking-wide block"
                        />
                      </div>

                      {/* Contact & Social Links */}
                      <div id="section-social" className="flex flex-col gap-1.5 text-sm text-gray-500 sm:text-right shrink-0 scroll-mt-6">
                        {/* Location */}
                        <div className="flex sm:justify-end items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 shrink-0 text-gray-400" />
                          <InlineEditable
                            isEditMode={isEditMode}
                            value={profile.location || ''}
                            onChange={v => onUpdateProfile('location', v)}
                            placeholder="Địa điểm..."
                          />
                        </div>

                        {/* Email */}
                        <div className="flex sm:justify-end items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 shrink-0 text-gray-400" />
                          <InlineEditable
                            isEditMode={isEditMode}
                            value={profile.email || ''}
                            onChange={v => onUpdateProfile('email', v)}
                            placeholder="Email..."
                          />
                        </div>

                        {/* Phone */}
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

                        {/* Social Links */}
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

                        {isEditMode && (
                          <button
                            type="button"
                            onClick={() => onOpenDialog('social')}
                            className="text-xs text-blue-600 font-medium hover:underline flex sm:justify-end items-center gap-1 mt-1"
                          >
                            <Plus className="w-3 h-3" />
                            Thêm liên kết mạng xã hội
                          </button>
                        )}
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
                        Curriculum Vitae · Trang {page.pageNumber} / {pages.length}
                      </div>
                    </header>
                  )}

                  {/* ── BODY ────────────────────────────────────────────────── */}
                  <div className="grid grid-cols-1 md:grid-cols-[2fr_1px_1fr] gap-8">
                    {/* ── LEFT COLUMN ── */}
                    <div className="flex flex-col gap-7 min-h-[50px]">
                      {leftSections.map(secId =>
                        renderSection(secId, 'left', page.left, page.pageNumber)
                      )}
                      {leftSections.length === 0 && isEditMode && (
                        <div className="border border-dashed border-gray-300 rounded-lg p-6 text-center text-xs text-gray-400">
                          Cột trái đang trống. Hãy dùng nút &quot;Sang trái&quot; trên các mục ở cột phải hoặc mở thanh Sections để chuyển mục sang đây.
                        </div>
                      )}
                    </div>

                    {/* ── VERTICAL DIVIDER ── */}
                    <div className="hidden md:block bg-gray-100 self-stretch" />

                    {/* ── RIGHT COLUMN ── */}
                    <div className="flex flex-col gap-6 min-h-[50px]">
                      {rightSections.map(secId =>
                        renderSection(secId, 'right', page.right, page.pageNumber)
                      )}
                      {rightSections.length === 0 && isEditMode && (
                        <div className="border border-dashed border-gray-300 rounded-lg p-6 text-center text-xs text-gray-400">
                          Cột phải đang trống. Hãy dùng nút &quot;Sang phải&quot; trên các mục ở cột trái hoặc mở thanh Sections để chuyển mục sang đây.
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* ── FOOTER (Page 1 Only) ── */}
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
      })}
    </div>
  );
}
