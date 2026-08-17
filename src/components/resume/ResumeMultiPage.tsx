'use client';

import React, { useState } from 'react';
import { ResumeCard3D } from '@/components/ui/ResumeCard3D';
import { MapPin, Mail, Download, Layers, FileText, ChevronLeft, ChevronRight } from 'lucide-react';
import * as Icons from 'lucide-react';

const ICON_MAP = Icons as unknown as Record<string, React.ComponentType<{ className?: string }>>;

const LEVEL_LABELS = ['', 'Beginner', 'Elementary', 'Intermediate', 'Advanced', 'Expert'];
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

export interface ProfileData {
  name: string;
  title: string;
  location?: string | null;
  email?: string | null;
  bio?: string | null;
  bio2?: string | null;
  careerObjective?: string | null;
  resumeUrl?: string | null;
  softSkills?: string | null;
  interests?: string | null;
}

export interface ExperienceData {
  id: string;
  company: string;
  position: string;
  description?: string | null;
  achievements?: string | null;
  techStack?: string | null;
  startDate: Date | string;
  endDate?: Date | string | null;
  isCurrent: boolean;
}

export interface EducationData {
  id: string;
  institution: string;
  degree: string;
  fieldOfStudy?: string | null;
  startDate: Date | string;
  endDate?: Date | string | null;
  isCurrent: boolean;
  description?: string | null;
}

export interface SocialLinkData {
  id: string;
  platform: string;
  url: string;
  iconName?: string | null;
}

export interface SkillItem {
  id: string;
  name: string;
  level: number | null;
}

export type SkillsByCategoryData = Record<string, SkillItem[]>;

export interface AchievementData {
  id: string;
  title: string;
  description?: string | null;
  date?: Date | string | null;
  category?: string | null;
}

export interface SpokenLanguageData {
  id: string;
  language: string;
  level: string;
}

export interface ActivityData {
  id: string;
  title: string;
  description?: string | null;
  type?: string | null;
  startDate?: Date | string | null;
  endDate?: Date | string | null;
}

interface ResumeMultiPageProps {
  profile: ProfileData;
  experiences: ExperienceData[];
  socialLinks: SocialLinkData[];
  education: EducationData[];
  skillsByCategory: SkillsByCategoryData;
  achievements?: AchievementData[];
  spokenLanguages?: SpokenLanguageData[];
  activities?: ActivityData[];
}

function SkillDots({ level }: { level: number }) {
  return (
    <div className="flex gap-1" aria-label={`Skill level ${level} of 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className={`w-1.5 h-1.5 rounded-full transition-colors ${
            i < level ? 'bg-primary' : 'bg-gray-200'
          }`}
        />
      ))}
    </div>
  );
}

// ── Content height estimator for pagination ──────────────────────────────
function estimateExperienceWeight(exp: ExperienceData): number {
  let score = 90; // Base: title, company, dates
  if (exp.description) score += Math.min(exp.description.length / 3, 70);
  if (exp.achievements) {
    const lines = exp.achievements.split('\n').filter(Boolean).length;
    score += lines * 22;
  }
  if (exp.techStack) score += 28;
  return score;
}

function estimateEducationWeight(edu: EducationData): number {
  let score = 75;
  if (edu.fieldOfStudy) score += 18;
  if (edu.description) score += 35;
  return score;
}

function estimateSkillCatWeight(skills: SkillItem[]): number {
  return 32 + skills.length * 20;
}

/**
 * Multi-Page Dynamic Pagination System for Resume
 * Splits content into multiple physical 3D sheets when content reaches page limit.
 */
export function ResumeMultiPage({
  profile,
  experiences,
  socialLinks,
  education,
  skillsByCategory,
  achievements = [],
  spokenLanguages = [],
  activities = [],
}: ResumeMultiPageProps) {
  const [activePageTab, setActivePageTab] = useState<number>(1);
  const [viewMode, setViewMode] = useState<'stack' | 'paged'>('stack');

  // ── Compute intelligent pagination ──────────────────────────────────────
  // Page 1 budget: ~680 units (left side), ~720 units (right side)
  // Page 2+ budget: ~900 units (left side), ~920 units (right side)
  const PAGE1_LEFT_LIMIT = 520;
  const PAGE1_RIGHT_LIMIT = 560;
  const SUBSEQUENT_PAGE_LIMIT = 880;

  // 1. Partition Left Column Items (Experiences, Education)
  const leftPageGroups: Array<{
    experiences: ExperienceData[];
    education: EducationData[];
  }> = [];

  let currentLeftPage = 0;
  let currentLeftWeight = 0;
  leftPageGroups.push({ experiences: [], education: [] });

  // Distribute experiences
  experiences.forEach(exp => {
    const weight = estimateExperienceWeight(exp);
    const limit = currentLeftPage === 0 ? PAGE1_LEFT_LIMIT : SUBSEQUENT_PAGE_LIMIT;

    if (currentLeftWeight + weight > limit && leftPageGroups[currentLeftPage].experiences.length > 0) {
      currentLeftPage++;
      currentLeftWeight = 0;
      leftPageGroups.push({ experiences: [], education: [] });
    }

    leftPageGroups[currentLeftPage].experiences.push(exp);
    currentLeftWeight += weight;
  });

  // Distribute education
  education.forEach(edu => {
    const weight = estimateEducationWeight(edu);
    const limit = currentLeftPage === 0 ? PAGE1_LEFT_LIMIT : SUBSEQUENT_PAGE_LIMIT;

    if (currentLeftWeight + weight > limit && (leftPageGroups[currentLeftPage].experiences.length > 0 || leftPageGroups[currentLeftPage].education.length > 0)) {
      currentLeftPage++;
      currentLeftWeight = 0;
      leftPageGroups.push({ experiences: [], education: [] });
    }

    leftPageGroups[currentLeftPage].education.push(edu);
    currentLeftWeight += weight;
  });

  // 2. Partition Right Column Items (Skills, Soft Skills, Languages, Achievements, Activities)
  const skillCategories = Object.keys(skillsByCategory);
  const rightPageGroups: Array<{
    skillCats: string[];
    showSoftSkills: boolean;
    spokenLanguages: SpokenLanguageData[];
    achievements: AchievementData[];
    activities: ActivityData[];
  }> = [];

  let currentRightPage = 0;
  let currentRightWeight = 0;
  rightPageGroups.push({
    skillCats: [],
    showSoftSkills: false,
    spokenLanguages: [],
    achievements: [],
    activities: [],
  });

  // Distribute skill categories
  skillCategories.forEach(cat => {
    const skills = skillsByCategory[cat] ?? [];
    const weight = estimateSkillCatWeight(skills);
    const limit = currentRightPage === 0 ? PAGE1_RIGHT_LIMIT : SUBSEQUENT_PAGE_LIMIT;

    if (currentRightWeight + weight > limit && rightPageGroups[currentRightPage].skillCats.length > 0) {
      currentRightPage++;
      currentRightWeight = 0;
      rightPageGroups.push({
        skillCats: [],
        showSoftSkills: false,
        spokenLanguages: [],
        achievements: [],
        activities: [],
      });
    }

    rightPageGroups[currentRightPage].skillCats.push(cat);
    currentRightWeight += weight;
  });

  // Soft skills placement
  if (profile.softSkills) {
    const weight = 60;
    const limit = currentRightPage === 0 ? PAGE1_RIGHT_LIMIT : SUBSEQUENT_PAGE_LIMIT;
    if (currentRightWeight + weight > limit) {
      currentRightPage++;
      currentRightWeight = 0;
      rightPageGroups.push({
        skillCats: [],
        showSoftSkills: false,
        spokenLanguages: [],
        achievements: [],
        activities: [],
      });
    }
    rightPageGroups[currentRightPage].showSoftSkills = true;
    currentRightWeight += weight;
  }

  // Spoken languages placement
  if (spokenLanguages.length > 0) {
    const weight = 40 + spokenLanguages.length * 20;
    const limit = currentRightPage === 0 ? PAGE1_RIGHT_LIMIT : SUBSEQUENT_PAGE_LIMIT;
    if (currentRightWeight + weight > limit) {
      currentRightPage++;
      currentRightWeight = 0;
      rightPageGroups.push({
        skillCats: [],
        showSoftSkills: false,
        spokenLanguages: [],
        achievements: [],
        activities: [],
      });
    }
    rightPageGroups[currentRightPage].spokenLanguages = spokenLanguages;
    currentRightWeight += weight;
  }

  // Achievements placement
  if (achievements.length > 0) {
    const weight = 45 + achievements.length * 40;
    const limit = currentRightPage === 0 ? PAGE1_RIGHT_LIMIT : SUBSEQUENT_PAGE_LIMIT;
    if (currentRightWeight + weight > limit) {
      currentRightPage++;
      currentRightWeight = 0;
      rightPageGroups.push({
        skillCats: [],
        showSoftSkills: false,
        spokenLanguages: [],
        achievements: [],
        activities: [],
      });
    }
    rightPageGroups[currentRightPage].achievements = achievements;
    currentRightWeight += weight;
  }

  // Activities placement
  if (activities.length > 0) {
    const weight = 45 + activities.length * 40;
    const limit = currentRightPage === 0 ? PAGE1_RIGHT_LIMIT : SUBSEQUENT_PAGE_LIMIT;
    if (currentRightWeight + weight > limit) {
      currentRightPage++;
      currentRightWeight = 0;
      rightPageGroups.push({
        skillCats: [],
        showSoftSkills: false,
        spokenLanguages: [],
        achievements: [],
        activities: [],
      });
    }
    rightPageGroups[currentRightPage].activities = activities;
    currentRightWeight += weight;
  }

  // Total pages is the max of left and right pages
  const totalPages = Math.max(leftPageGroups.length, rightPageGroups.length, 1);

  // Normalize pages
  const pages = Array.from({ length: totalPages }, (_, pageIndex) => {
    return {
      pageNumber: pageIndex + 1,
      left: leftPageGroups[pageIndex] ?? { experiences: [], education: [] },
      right: rightPageGroups[pageIndex] ?? {
        skillCats: [],
        showSoftSkills: false,
        spokenLanguages: [],
        achievements: [],
        activities: [],
      },
    };
  });

  return (
    <div className="w-full">
      {/* ── Document Toolbar & Page Controls ── */}
      <div className="max-w-5xl mx-auto mb-6 flex flex-wrap items-center justify-between gap-3 bg-card/60 backdrop-blur-sm border border-border px-4 py-2.5 rounded-xl print:hidden shadow-xs">
        <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
          <FileText className="w-4 h-4 text-primary" />
          <span>Document format: <strong className="text-foreground font-semibold">Standard Executive</strong></span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[11px] font-semibold">
            {totalPages === 1 ? '1 Page' : `${totalPages} Pages (Auto-paginated)`}
          </span>
        </div>

        {/* Multi-page controls */}
        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-muted/60 p-0.5 rounded-lg border border-border/50 text-xs">
              <button
                type="button"
                onClick={() => setViewMode('stack')}
                className={`px-2.5 py-1 rounded-md transition-colors flex items-center gap-1.5 ${
                  viewMode === 'stack' ? 'bg-card text-foreground font-medium shadow-xs' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>All Pages</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('paged')}
                className={`px-2.5 py-1 rounded-md transition-colors flex items-center gap-1.5 ${
                  viewMode === 'paged' ? 'bg-card text-foreground font-medium shadow-xs' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Page Tabs</span>
              </button>
            </div>

            {/* Page Tab Selector (when in paged mode) */}
            {viewMode === 'paged' && (
              <div className="flex items-center gap-1 bg-muted/40 p-0.5 rounded-lg border border-border/50">
                <button
                  type="button"
                  disabled={activePageTab === 1}
                  onClick={() => setActivePageTab(prev => Math.max(prev - 1, 1))}
                  className="p-1 rounded text-muted-foreground hover:text-foreground disabled:opacity-30"
                  aria-label="Previous Page"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setActivePageTab(i + 1)}
                    className={`px-2 py-0.5 rounded text-xs transition-colors ${
                      activePageTab === i + 1
                        ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Page {i + 1}
                  </button>
                ))}
                <button
                  type="button"
                  disabled={activePageTab === totalPages}
                  onClick={() => setActivePageTab(prev => Math.min(prev + 1, totalPages))}
                  className="p-1 rounded text-muted-foreground hover:text-foreground disabled:opacity-30"
                  aria-label="Next Page"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Render Pages ── */}
      <div className="space-y-10 print:space-y-0">
        {pages.map((page, idx) => {
          const isVisible = viewMode === 'stack' || activePageTab === page.pageNumber;
          if (!isVisible) return null;

          return (
            <div
              key={page.pageNumber}
              className="relative print:break-after-page print:mb-0"
              style={{ breakAfter: idx < totalPages - 1 ? 'page' : 'auto' }}
            >
              {/* Page Number Badge above card for multi-page mode */}
              {totalPages > 1 && (
                <div className="max-w-5xl mx-auto flex items-center justify-between mb-2 px-1 text-xs text-muted-foreground print:hidden">
                  <span className="font-semibold uppercase tracking-wider text-[11px] text-primary/80">
                    Sheet {page.pageNumber} of {totalPages}
                  </span>
                  <span className="text-[11px] opacity-70">
                    {page.pageNumber === 1 ? 'Primary Overview' : 'Experience & Additional Credentials'}
                  </span>
                </div>
              )}

              <ResumeCard3D>
                <div className="bg-white text-gray-800 p-8 sm:p-12 rounded-sm font-sans min-h-[850px] flex flex-col justify-between">
                  <div>
                    {/* ── HEADER ─────────────────────────────── */}
                    {page.pageNumber === 1 ? (
                      /* Page 1 Full Executive Header */
                      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-6 border-b-2 border-gray-900 mb-8">
                        <div>
                          <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-900 leading-none mb-2">
                            {profile.name}
                          </h2>
                          <p className="text-lg text-blue-600 font-semibold tracking-wide">{profile.title}</p>
                        </div>
                        <div className="flex flex-col gap-1.5 text-sm text-gray-500 sm:text-right shrink-0">
                          {profile.location && (
                            <div className="flex sm:justify-end items-center gap-1.5">
                              <MapPin className="w-3.5 h-3.5 shrink-0 text-gray-400" />
                              <span>{profile.location}</span>
                            </div>
                          )}
                          {profile.email && (
                            <div className="flex sm:justify-end items-center gap-1.5">
                              <Mail className="w-3.5 h-3.5 shrink-0 text-gray-400" />
                              <a href={`mailto:${profile.email}`} className="hover:text-blue-600 transition-colors">
                                {profile.email}
                              </a>
                            </div>
                          )}
                          {socialLinks.map(social => {
                            const Icon = social.iconName ? ICON_MAP[social.iconName] || Icons.Link : Icons.Link;
                            return (
                              <div key={social.platform} className="flex sm:justify-end items-center gap-1.5">
                                <Icon className="w-3.5 h-3.5 shrink-0 text-gray-400" />
                                <a href={social.url} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 transition-colors">
                                  {social.platform}
                                </a>
                              </div>
                            );
                          })}
                        </div>
                      </header>
                    ) : (
                      /* Page 2+ Running Minimal Header */
                      <header className="flex items-center justify-between pb-4 border-b border-gray-200 mb-6 text-xs text-gray-500">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-900 text-sm">{profile.name}</span>
                          <span className="text-gray-300">|</span>
                          <span className="text-blue-600 font-medium">{profile.title}</span>
                        </div>
                        <div className="font-medium text-gray-400">
                          Curriculum Vitae · Page {page.pageNumber} of {totalPages}
                        </div>
                      </header>
                    )}

                    {/* ── BODY ────────────────────────────────── */}
                    <div className="grid grid-cols-1 md:grid-cols-[2fr_1px_1fr] gap-8">
                      {/* LEFT COLUMN */}
                      <div className="flex flex-col gap-7">
                        {/* Profile Bio (Page 1 Only) */}
                        {page.pageNumber === 1 && (profile.bio || profile.careerObjective) && (
                          <section>
                            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2.5">Profile</h3>
                            {profile.bio && <p className="text-sm text-gray-600 leading-relaxed">{profile.bio}</p>}
                            {profile.careerObjective && (
                              <p className="text-sm text-gray-600 leading-relaxed mt-2 italic">{profile.careerObjective}</p>
                            )}
                          </section>
                        )}

                        {/* Experience Section for this page */}
                        {page.left.experiences.length > 0 && (
                          <section>
                            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">
                              {page.pageNumber === 1 ? 'Experience' : 'Experience (Continued)'}
                            </h3>
                            <div className="space-y-5">
                              {page.left.experiences.map(exp => (
                                <div key={exp.id} className="relative pl-4 border-l-2 border-gray-200 hover:border-blue-400 transition-colors">
                                  <div className="flex flex-wrap justify-between items-baseline gap-2 mb-0.5">
                                    <h4 className="font-bold text-gray-900 text-sm">{exp.position}</h4>
                                    <span className="text-xs text-gray-400 font-mono">
                                      {new Date(exp.startDate).getFullYear()} –{' '}
                                      {exp.isCurrent ? 'Present' : exp.endDate ? new Date(exp.endDate).getFullYear() : ''}
                                    </span>
                                  </div>
                                  <p className="text-xs font-semibold text-blue-600 mb-1.5">{exp.company}</p>
                                  {exp.description && (
                                    <p className="text-xs text-gray-500 leading-relaxed">{exp.description}</p>
                                  )}
                                  {exp.achievements && (
                                    <ul className="mt-1.5 space-y-0.5">
                                      {exp.achievements.split('\n').filter(Boolean).map((a, i) => (
                                        <li key={i} className="text-xs text-gray-500 flex gap-1.5">
                                          <span className="text-blue-400 mt-0.5">•</span>
                                          <span>{a}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  )}
                                  {exp.techStack && (
                                    <div className="flex flex-wrap gap-1 mt-2">
                                      {exp.techStack.split(',').map(t => t.trim()).filter(Boolean).map(t => (
                                        <span key={t} className="px-1.5 py-0.5 text-[10px] bg-gray-100 rounded text-gray-500 font-medium">
                                          {t}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </section>
                        )}

                        {/* Education Section for this page */}
                        {page.left.education.length > 0 && (
                          <section>
                            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Education</h3>
                            <div className="space-y-4">
                              {page.left.education.map(edu => (
                                <div key={edu.id} className="relative pl-4 border-l-2 border-gray-200 hover:border-blue-400 transition-colors">
                                  <div className="flex flex-wrap justify-between items-baseline gap-2 mb-0.5">
                                    <h4 className="font-bold text-gray-900 text-sm">{edu.degree}</h4>
                                    <span className="text-xs text-gray-400 font-mono">
                                      {new Date(edu.startDate).getFullYear()} –{' '}
                                      {edu.isCurrent ? 'Present' : edu.endDate ? new Date(edu.endDate).getFullYear() : ''}
                                    </span>
                                  </div>
                                  <p className="text-xs text-blue-600 font-semibold">{edu.institution}</p>
                                  {edu.fieldOfStudy && <p className="text-xs text-gray-400">{edu.fieldOfStudy}</p>}
                                  {edu.description && <p className="text-xs text-gray-500 leading-relaxed mt-1">{edu.description}</p>}
                                </div>
                              ))}
                            </div>
                          </section>
                        )}
                      </div>

                      {/* Divider */}
                      <div className="hidden md:block bg-gray-100 w-px" />

                      {/* RIGHT COLUMN */}
                      <div className="flex flex-col gap-6">
                        {/* Skills Categories for this page */}
                        {page.right.skillCats.length > 0 && (
                          <section>
                            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3.5">
                              {page.pageNumber === 1 ? 'Technical Skills' : 'Additional Skills'}
                            </h3>
                            <div className="space-y-4">
                              {page.right.skillCats.map(cat => (
                                <div key={cat}>
                                  <h4 className="text-xs font-semibold text-gray-700 uppercase mb-1.5">
                                    {CATEGORY_LABELS[cat] ?? cat}
                                  </h4>
                                  <div className="space-y-1.5">
                                    {(skillsByCategory[cat] ?? []).map(skill => (
                                      <div key={skill.id} className="flex items-center justify-between gap-2">
                                        <span className="text-xs text-gray-600 font-medium">{skill.name}</span>
                                        <div className="flex flex-col items-end gap-0.5">
                                          <SkillDots level={skill.level ?? 0} />
                                          <span className="text-[9px] text-gray-400">
                                            {LEVEL_LABELS[skill.level ?? 0]}
                                          </span>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </section>
                        )}

                        {/* Soft Skills */}
                        {page.right.showSoftSkills && profile.softSkills && (
                          <section>
                            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2.5">Soft Skills</h3>
                            <div className="flex flex-wrap gap-1.5">
                              {profile.softSkills.split(',').map(s => s.trim()).filter(Boolean).map(s => (
                                <span key={s} className="px-2 py-0.5 text-xs bg-blue-50 text-blue-700 rounded-full font-medium">
                                  {s}
                                </span>
                              ))}
                            </div>
                          </section>
                        )}

                        {/* Spoken Languages */}
                        {page.right.spokenLanguages.length > 0 && (
                          <section>
                            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2.5">Languages</h3>
                            <div className="space-y-1.5">
                              {page.right.spokenLanguages.map(lang => (
                                <div key={lang.id} className="flex justify-between items-center text-xs">
                                  <span className="text-gray-700 font-medium">{lang.language}</span>
                                  <span className="text-gray-400 text-[11px]">{lang.level}</span>
                                </div>
                              ))}
                            </div>
                          </section>
                        )}

                        {/* Achievements */}
                        {page.right.achievements.length > 0 && (
                          <section>
                            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2.5">Achievements</h3>
                            <div className="space-y-2">
                              {page.right.achievements.map(ach => (
                                <div key={ach.id} className="text-xs">
                                  <p className="font-semibold text-gray-800">{ach.title}</p>
                                  {ach.description && <p className="text-gray-500 text-[11px] mt-0.5">{ach.description}</p>}
                                </div>
                              ))}
                            </div>
                          </section>
                        )}

                        {/* Activities */}
                        {page.right.activities.length > 0 && (
                          <section>
                            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2.5">Activities</h3>
                            <div className="space-y-2">
                              {page.right.activities.map(act => (
                                <div key={act.id} className="text-xs">
                                  <p className="font-semibold text-gray-800">{act.title}</p>
                                  {act.description && <p className="text-gray-500 text-[11px] mt-0.5">{act.description}</p>}
                                </div>
                              ))}
                            </div>
                          </section>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* ── PAGE FOOTER ─────────────────────────── */}
                  <footer className="mt-8 pt-4 border-t border-gray-100 flex items-center justify-between text-[10px] text-gray-400">
                    <span>{profile.name} — Curriculum Vitae</span>
                    <span className="font-medium">
                      Page {page.pageNumber} of {totalPages}
                    </span>
                  </footer>
                </div>
              </ResumeCard3D>
            </div>
          );
        })}
      </div>
    </div>
  );
}
