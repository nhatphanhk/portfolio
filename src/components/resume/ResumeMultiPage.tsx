'use client';

import React, { useState, useMemo } from 'react';
import { ResumeCard3D } from '@/components/ui/ResumeCard3D';
import { MapPin, Mail, Layers, FileText, ChevronLeft, ChevronRight } from 'lucide-react';
import DynamicIcon from '@/components/ui/DynamicIcon';
import { SectionId, parseSectionLayout } from '@/lib/resume-layout';

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
  description?: string | null;
  startDate: Date | string;
  endDate?: Date | string | null;
  isCurrent: boolean;
  gpa?: string | null;
}

export interface SkillItem {
  id: string;
  name: string;
  category: string;
}

export type SkillsByCategoryData = Record<string, SkillItem[]>;

export interface SocialLinkData {
  id: string;
  platform: string;
  url: string;
  icon?: string | null;
  iconName?: string | null;
}

export interface AchievementData {
  id: string;
  title: string;
  description?: string | null;
  date?: Date | string | null;
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

// ── Content height estimators ───────────────────────────────────────────────
function estimateExperienceWeight(exp: ExperienceData): number {
  let score = 95;
  if (exp.description) score += Math.min(exp.description.length / 3.5, 80);
  if (exp.achievements) {
    const lines = exp.achievements.split('\n').filter(Boolean).length;
    score += lines * 24;
  }
  if (exp.techStack) score += 30;
  return score;
}

function estimateEducationWeight(edu: EducationData): number {
  let score = 80;
  if (edu.fieldOfStudy) score += 20;
  if (edu.description) score += 38;
  return score;
}

function estimateSkillCatWeight(skills: SkillItem[]): number {
  const rows = Math.ceil(skills.length / 2.5);
  return 40 + rows * 26;
}

interface ColumnPageData {
  sections: SectionId[];
  experiences: ExperienceData[];
  education: EducationData[];
  skillCats: string[];
  spokenLanguages: SpokenLanguageData[];
  achievements: AchievementData[];
  activities: ActivityData[];
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

  const sectionLayout = useMemo(
    () => parseSectionLayout(profile.interests),
    [profile.interests]
  );

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
            if (profile.bio || profile.careerObjective) {
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
            for (const exp of experiences) {
              const w = estimateExperienceWeight(exp);
              ensureSpace(w);
              if (!colPages[currentPage].sections.includes('experience')) {
                colPages[currentPage].sections.push('experience');
              }
              colPages[currentPage].experiences.push(exp);
              currentWeight += w;
            }
            break;
          }

          case 'education': {
            for (const edu of education) {
              const w = estimateEducationWeight(edu);
              ensureSpace(w);
              if (!colPages[currentPage].sections.includes('education')) {
                colPages[currentPage].sections.push('education');
              }
              colPages[currentPage].education.push(edu);
              currentWeight += w;
            }
            break;
          }

          case 'skills': {
            const cats = Object.keys(skillsByCategory);
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
            break;
          }

          case 'softSkills': {
            if (profile.softSkills) {
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
            if (spokenLanguages.length > 0) {
              const w = 48 + spokenLanguages.length * 22;
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
            if (achievements.length > 0) {
              const w = 48 + achievements.length * 42;
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
            if (activities.length > 0) {
              const w = 48 + activities.length * 42;
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
  ]);

  const totalPages = pages.length;

  const renderSection = (
    sectionId: SectionId,
    _col: 'left' | 'right',
    pageColData: ColumnPageData,
    pageNumber: number
  ) => {
    switch (sectionId) {
      case 'bio': {
        if (!pageColData.showBio || (!profile.bio && !profile.careerObjective)) return null;
        return (
          <section key="bio">
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2.5">Profile</h3>
            {profile.bio && <p className="text-sm text-gray-600 leading-relaxed">{profile.bio}</p>}
            {profile.careerObjective && (
              <p className="text-sm text-gray-600 leading-relaxed mt-2 italic">{profile.careerObjective}</p>
            )}
          </section>
        );
      }

      case 'experience': {
        if (pageColData.experiences.length === 0) return null;
        return (
          <section key="experience">
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">
              {pageNumber === 1 ? 'Experience' : 'Experience (Continued)'}
            </h3>
            <div className="space-y-5">
              {pageColData.experiences.map(exp => (
                <div
                  key={exp.id}
                  className="relative pl-4 border-l-2 border-gray-200 hover:border-blue-400 transition-colors"
                >
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
                      {exp.achievements
                        .split('\n')
                        .filter(Boolean)
                        .map((a, i) => (
                          <li key={i} className="text-xs text-gray-500 flex gap-1.5">
                            <span className="text-blue-400 mt-0.5">•</span>
                            <span>{a}</span>
                          </li>
                        ))}
                    </ul>
                  )}
                  {exp.techStack && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {exp.techStack
                        .split(',')
                        .map(t => t.trim())
                        .filter(Boolean)
                        .map(t => (
                          <span
                            key={t}
                            className="px-1.5 py-0.5 text-[10px] bg-gray-100 rounded text-gray-500 font-medium"
                          >
                            {t}
                          </span>
                        ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        );
      }

      case 'education': {
        if (pageColData.education.length === 0) return null;
        return (
          <section key="education">
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Education</h3>
            <div className="space-y-4">
              {pageColData.education.map(edu => (
                <div
                  key={edu.id}
                  className="relative pl-4 border-l-2 border-gray-200 hover:border-blue-400 transition-colors"
                >
                  <div className="flex flex-wrap justify-between items-baseline gap-2 mb-0.5">
                    <h4 className="font-bold text-gray-900 text-sm">{edu.degree}</h4>
                    <span className="text-xs text-gray-400 font-mono">
                      {new Date(edu.startDate).getFullYear()} –{' '}
                      {edu.isCurrent ? 'Present' : edu.endDate ? new Date(edu.endDate).getFullYear() : ''}
                    </span>
                  </div>
                  <p className="text-xs text-blue-600 font-semibold">{edu.institution}</p>
                  {edu.fieldOfStudy && <p className="text-xs text-gray-400">{edu.fieldOfStudy}</p>}
                  {edu.description && (
                    <p className="text-xs text-gray-500 leading-relaxed mt-1">{edu.description}</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        );
      }

      case 'skills': {
        if (pageColData.skillCats.length === 0) return null;
        return (
          <section key="skills">
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3.5">
              {pageNumber === 1 ? 'Technical Skills' : 'Additional Skills'}
            </h3>
            <div className="space-y-4">
              {pageColData.skillCats.map(cat => (
                <div key={cat}>
                  <h4 className="text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-2">
                    {CATEGORY_LABELS[cat] ?? cat}
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {(skillsByCategory[cat] ?? []).map(skill => (
                      <span
                        key={skill.id}
                        className="px-2 py-0.5 text-xs bg-gray-100 text-gray-700 rounded-md font-medium"
                      >
                        {skill.name}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        );
      }

      case 'softSkills': {
        if (!pageColData.showSoftSkills || !profile.softSkills) return null;
        return (
          <section key="softSkills">
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2.5">Soft Skills</h3>
            <div className="flex flex-wrap gap-1.5">
              {profile.softSkills
                .split(',')
                .map(s => s.trim())
                .filter(Boolean)
                .map(s => (
                  <span
                    key={s}
                    className="px-2 py-0.5 text-xs bg-blue-50 text-blue-700 rounded-full font-medium"
                  >
                    {s}
                  </span>
                ))}
            </div>
          </section>
        );
      }

      case 'languages': {
        if (pageColData.spokenLanguages.length === 0) return null;
        return (
          <section key="languages">
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2.5">Languages</h3>
            <div className="space-y-2">
              {pageColData.spokenLanguages.map(lang => (
                <div key={lang.id} className="flex justify-between items-center">
                  <span className="text-xs text-gray-700 font-semibold">{lang.language}</span>
                  <span className="text-[11px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                    {lang.level}
                  </span>
                </div>
              ))}
            </div>
          </section>
        );
      }

      case 'achievements': {
        if (pageColData.achievements.length === 0) return null;
        return (
          <section key="achievements">
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2.5">Achievements</h3>
            <div className="space-y-2">
              {pageColData.achievements.map(ach => (
                <div key={ach.id} className="text-xs">
                  <p className="font-semibold text-gray-800">{ach.title}</p>
                  {ach.description && (
                    <p className="text-gray-500 text-[11px] mt-0.5">{ach.description}</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        );
      }

      case 'activities': {
        if (pageColData.activities.length === 0) return null;
        return (
          <section key="activities">
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2.5">Activities</h3>
            <div className="space-y-2">
              {pageColData.activities.map(act => (
                <div key={act.id} className="text-xs">
                  <p className="font-semibold text-gray-800">{act.title}</p>
                  {act.description && (
                    <p className="text-gray-500 text-[11px] mt-0.5">{act.description}</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        );
      }
    }
  };

  return (
    <div className="w-full">
      {/* ── Document Toolbar & Page Controls ── */}
      <div className="max-w-5xl mx-auto mb-6 flex flex-wrap items-center justify-between gap-3 bg-card/60 backdrop-blur-sm border border-border px-4 py-2.5 rounded-xl print:hidden shadow-xs">
        <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
          <FileText className="w-4 h-4 text-primary" />
          <span>
            Document format: <strong className="text-foreground font-semibold">Standard Executive</strong>
          </span>
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
                <span>Continuous</span>
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

            {/* Page Tab Selector (paged mode) */}
            {viewMode === 'paged' && (
              <div className="flex items-center gap-1 bg-muted/40 p-0.5 rounded-lg border border-border/50">
                <button
                  type="button"
                  disabled={activePageTab === 1}
                  onClick={() => setActivePageTab(p => Math.max(p - 1, 1))}
                  className="p-1 rounded text-muted-foreground hover:text-foreground disabled:opacity-30"
                  aria-label="Previous Page"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i + 1}
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
                  onClick={() => setActivePageTab(p => Math.min(p + 1, totalPages))}
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
              {/* Page label badge */}
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
                              <span>{profile.email}</span>
                            </div>
                          )}
                          {socialLinks.length > 0 && (
                            <div className="flex flex-wrap sm:justify-end gap-3 mt-1">
                              {socialLinks.map(link => (
                                <a
                                  key={link.id}
                                  href={link.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                                >
                                  <DynamicIcon name={link.iconName || link.icon || 'link'} className="w-3.5 h-3.5 text-gray-500" />
                                  <span>{link.platform}</span>
                                </a>
                              ))}
                            </div>
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
                          Curriculum Vitae · Page {page.pageNumber} of {totalPages}
                        </div>
                      </header>
                    )}

                    {/* ── BODY ────────────────────────────────── */}
                    <div className="grid grid-cols-1 md:grid-cols-[2fr_1px_1fr] gap-8">
                      {/* LEFT COLUMN */}
                      <div className="flex flex-col gap-7 min-h-[50px]">
                        {page.left.sections.map(secId =>
                          renderSection(secId, 'left', page.left, page.pageNumber)
                        )}
                      </div>

                      {/* Divider */}
                      <div className="hidden md:block bg-gray-100 w-px" />

                      {/* RIGHT COLUMN */}
                      <div className="flex flex-col gap-6 min-h-[50px]">
                        {page.right.sections.map(secId =>
                          renderSection(secId, 'right', page.right, page.pageNumber)
                        )}
                      </div>
                    </div>
                  </div>

                  {/* ── PAGE FOOTER ─────────────────────────── */}
                  <footer className="mt-8 pt-4 border-t border-gray-100 flex items-center justify-between text-[10px] text-gray-400">
                    <span>{profile.name} — Curriculum Vitae</span>
                    <span className="font-medium">Page {page.pageNumber} of {totalPages}</span>
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
