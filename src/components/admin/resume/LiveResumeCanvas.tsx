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
  X,
} from 'lucide-react';
import DynamicIcon from '@/components/ui/DynamicIcon';

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

type LeftPageGroup = { experiences: any[]; education: any[] };
type RightPageGroup = {
  skillCats: string[];
  showSoftSkills: boolean;
  showInterests: boolean;
  spokenLanguages: any[];
  achievements: any[];
  activities: any[];
};

function newRightGroup(): RightPageGroup {
  return {
    skillCats: [],
    showSoftSkills: false,
    showInterests: false,
    spokenLanguages: [],
    achievements: [],
    activities: [],
  };
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
  // Pagination
  const pages = useMemo(() => {
    const PAGE1_LEFT = 500;
    const PAGE1_RIGHT = 540;
    const EXTRA_LIMIT = 860;

    const leftGroups: LeftPageGroup[] = [{ experiences: [], education: [] }];
    let lPage = 0;
    let lWeight = 0;

    for (const exp of experiences) {
      const w = estimateExperienceWeight(exp);
      const limit = lPage === 0 ? PAGE1_LEFT : EXTRA_LIMIT;
      const hasContent = leftGroups[lPage].experiences.length > 0 || leftGroups[lPage].education.length > 0;
      if (lWeight + w > limit && hasContent) {
        lPage++;
        lWeight = 0;
        leftGroups.push({ experiences: [], education: [] });
      }
      leftGroups[lPage].experiences.push(exp);
      lWeight += w;
    }

    for (const edu of education) {
      const w = estimateEducationWeight(edu);
      const limit = lPage === 0 ? PAGE1_LEFT : EXTRA_LIMIT;
      const hasContent = leftGroups[lPage].experiences.length > 0 || leftGroups[lPage].education.length > 0;
      if (lWeight + w > limit && hasContent) {
        lPage++;
        lWeight = 0;
        leftGroups.push({ experiences: [], education: [] });
      }
      leftGroups[lPage].education.push(edu);
      lWeight += w;
    }

    const rightGroups: RightPageGroup[] = [newRightGroup()];
    let rPage = 0;
    let rWeight = 0;

    function ensureRightSpace(needed: number) {
      const limit = rPage === 0 ? PAGE1_RIGHT : EXTRA_LIMIT;
      const hasContent =
        rightGroups[rPage].skillCats.length > 0 ||
        rightGroups[rPage].showSoftSkills ||
        rightGroups[rPage].showInterests ||
        rightGroups[rPage].spokenLanguages.length > 0 ||
        rightGroups[rPage].achievements.length > 0 ||
        rightGroups[rPage].activities.length > 0;

      if (rWeight + needed > limit && hasContent) {
        rPage++;
        rWeight = 0;
        rightGroups.push(newRightGroup());
      }
    }

    for (const cat of Object.keys(skillsByCategory)) {
      const skills = skillsByCategory[cat] ?? [];
      const w = estimateSkillCatWeight(skills);
      ensureRightSpace(w);
      rightGroups[rPage].skillCats.push(cat);
      rWeight += w;
    }

    if (profile.softSkills || isEditMode) {
      ensureRightSpace(65);
      rightGroups[rPage].showSoftSkills = true;
      rWeight += 65;
    }

    if (spokenLanguages.length > 0 || isEditMode) {
      const w = 48 + Math.max(spokenLanguages.length, 1) * 22;
      ensureRightSpace(w);
      rightGroups[rPage].spokenLanguages = spokenLanguages;
      rWeight += w;
    }

    if (achievements.length > 0 || isEditMode) {
      const w = 48 + Math.max(achievements.length, 1) * 42;
      ensureRightSpace(w);
      rightGroups[rPage].achievements = achievements;
      rWeight += w;
    }

    if (activities.length > 0 || isEditMode) {
      const w = 48 + Math.max(activities.length, 1) * 42;
      ensureRightSpace(w);
      rightGroups[rPage].activities = activities;
      rWeight += w;
    }

    const total = Math.max(leftGroups.length, rightGroups.length, 1);
    return Array.from({ length: total }, (_, i) => ({
      pageNumber: i + 1,
      left: leftGroups[i] ?? { experiences: [], education: [] },
      right: rightGroups[i] ?? newRightGroup(),
    }));
  }, [experiences, education, skillsByCategory, profile, spokenLanguages, achievements, activities, isEditMode]);

  React.useEffect(() => {
    onSetTotalPages(pages.length);
  }, [pages.length, onSetTotalPages]);

  return (
    <div className="w-full space-y-10">
      {pages.map(page => {
        const isVisible = viewMode === 'stack' || activePage === page.pageNumber;
        if (!isVisible) return null;

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

                        {/* Social links */}
                        {socialLinks.map(social => (
                          <div key={social.id} className="group/social flex sm:justify-end items-center gap-1.5">
                            <DynamicIcon name={social.iconName} className="w-3.5 h-3.5 shrink-0 text-gray-400" />
                            <a
                              href={social.url}
                              target="_blank"
                              rel="noreferrer"
                              className="hover:text-blue-600 transition"
                            >
                              {social.platform}
                            </a>
                            {isEditMode && (
                              <div className="opacity-0 group-hover/social:opacity-100 transition-opacity flex items-center gap-1 ml-1">
                                <button
                                  type="button"
                                  onClick={() => onOpenDialog('social', social)}
                                  className="p-0.5 hover:text-blue-600 text-gray-400"
                                  title="Sửa liên kết"
                                >
                                  <Edit className="w-3 h-3" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => onDeleteItem('social', social.id)}
                                  className="p-0.5 hover:text-red-600 text-gray-400"
                                  title="Xóa liên kết"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            )}
                          </div>
                        ))}

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
                    <div className="flex flex-col gap-7">
                      {/* Bio & Career Objective (Page 1 Only) */}
                      {page.pageNumber === 1 && (
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
                      )}

                      {/* Experience Section */}
                      {(page.left.experiences.length > 0 || isEditMode) && (
                        <section id="section-experience" className="scroll-mt-6">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400">
                              {page.pageNumber === 1 ? 'Experience' : 'Experience (Continued)'}
                            </h3>
                          </div>

                          <div className="space-y-6">
                            {page.left.experiences.map((exp: any, expIdx: number) => {
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
                                    <div className="absolute top-0 right-0 opacity-0 group-hover/exp:opacity-100 transition-opacity bg-white/90 backdrop-blur-xs border border-gray-200 rounded-md p-0.5 flex items-center gap-1 shadow-xs z-20">
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
                                        disabled={expIdx === page.left.experiences.length - 1}
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
                      )}

                      {/* Education Section */}
                      {(page.left.education.length > 0 || isEditMode) && (
                        <section id="section-education" className="scroll-mt-6">
                          <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">
                            {page.pageNumber === 1 && page.left.experiences.length > 0
                              ? 'Education'
                              : 'Education & Credentials'}
                          </h3>

                          <div className="space-y-4">
                            {page.left.education.map((edu: any, eduIdx: number) => (
                              <div
                                key={edu.id}
                                className="group/edu relative pl-4 border-l-2 border-gray-200 hover:border-blue-400 transition-colors"
                              >
                                {isEditMode && (
                                  <div className="absolute top-0 right-0 opacity-0 group-hover/edu:opacity-100 transition-opacity bg-white/90 backdrop-blur-xs border border-gray-200 rounded-md p-0.5 flex items-center gap-1 shadow-xs z-20">
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
                                      disabled={eduIdx === page.left.education.length - 1}
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
                      )}
                    </div>

                    {/* ── VERTICAL DIVIDER ── */}
                    <div className="hidden md:block bg-gray-100 self-stretch" />

                    {/* ── RIGHT COLUMN ── */}
                    <div className="flex flex-col gap-6">
                      {/* Skills by Category */}
                      {page.right.skillCats.length > 0 && (
                        <div id="section-skills" className="scroll-mt-6">
                          <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">
                            Technical Skills
                          </h3>

                          <div className="space-y-4">
                            {page.right.skillCats.map(cat => {
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
                          </div>
                        </div>
                      )}

                      {/* Soft Skills */}
                      {(page.right.showSoftSkills || isEditMode) && (
                        <div id="section-softskills" className="scroll-mt-6">
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
                        </div>
                      )}

                      {/* Spoken Languages */}
                      {(page.right.spokenLanguages.length > 0 || isEditMode) && (
                        <div id="section-languages" className="scroll-mt-6">
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
                            {page.right.spokenLanguages.map((lang: any) => (
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
                          </div>
                        </div>
                      )}

                      {/* Achievements */}
                      {(page.right.achievements.length > 0 || isEditMode) && (
                        <div id="section-achievements" className="scroll-mt-6">
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
                            {page.right.achievements.map((ach: any) => (
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
                          </div>
                        </div>
                      )}

                      {/* Activities */}
                      {(page.right.activities.length > 0 || isEditMode) && (
                        <div id="section-activities" className="scroll-mt-6">
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
                            {page.right.activities.map((act: any) => (
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
                          </div>
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
