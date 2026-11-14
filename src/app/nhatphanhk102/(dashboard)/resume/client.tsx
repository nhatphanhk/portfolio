'use client';

import React, { useState, useTransition, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import { ResumeToolbar } from '@/components/admin/resume/ResumeToolbar';
import { LiveResumeCanvas } from '@/components/admin/resume/LiveResumeCanvas';
import { ResumeSectionSidebar } from '@/components/admin/resume/ResumeSectionSidebar';
import { ResumeItemDialog, ItemType } from '@/components/admin/resume/ResumeItemDialog';
import { ResumePdfDialog } from '@/components/admin/resume/ResumePdfDialog';
import { ResumePdfConvertDialog } from '@/components/admin/resume/ResumePdfConvertDialog';
import { ResumeTranslateDialog } from '@/components/admin/resume/ResumeTranslateDialog';
import { UnsavedChangesDialog } from '@/components/admin/UnsavedChangesDialog';
import { useUnsavedChangesGuard } from '@/hooks/use-unsaved-changes-guard';
import { ParsedResumeData } from '@/lib/pdf-resume-parser';
import {
  SectionId,
  ResumeSectionLayout,
  ResumeTemplateStyle,
  DEFAULT_SECTION_LAYOUT,
  DEFAULT_HARVARD_ORDER,
  SECTION_META,
  parseSectionLayout,
} from '@/lib/resume-layout';
import {
  updateProfile,
  upsertSocialLink,
  deleteSocialLink,
  reorderExperiences,
  reorderEducation,
  createExperience,
  updateExperience,
  deleteExperience,
  createEducation,
  updateEducation,
  deleteEducation,
  createAchievement,
  updateAchievement,
  deleteAchievement,
  createSpokenLanguage,
  updateSpokenLanguage,
  deleteSpokenLanguage,
  createActivity,
  updateActivity,
  deleteActivity,
  type ProfileFormData,
} from '@/lib/actions/about';
import { createSkill, deleteSkill } from '@/lib/actions/skill';

type ActionResult = { ok: boolean; id?: string; error?: unknown };

/** Rows that exist only on the client (PDF import) until "Save All" persists them. */
const isTempId = (id: unknown): boolean => typeof id === 'string' && id.startsWith('temp-');

/** Turns a failed server action into a readable error so the caller can toast it. */
function assertOk(res: ActionResult, what: string): void {
  if (!res.ok) {
    throw new Error(typeof res.error === 'string' ? res.error : `Không thể ${what}.`);
  }
}

/** Builds the payload updateProfile() expects from the profile state object. */
function buildProfilePayload(p: any, overrides: Partial<ProfileFormData> = {}): ProfileFormData {
  return {
    name: p.name,
    handle: p.handle || undefined,
    title: p.title,
    tagline: p.tagline || undefined,
    bio: p.bio || undefined,
    bio2: p.bio2 || undefined,
    careerObjective: p.careerObjective || undefined,
    location: p.location || undefined,
    email: p.email || undefined,
    phone: p.phone || undefined,
    resumeUrl: p.resumeUrl || undefined,
    avatarUrl: p.avatarUrl || undefined,
    softSkills: p.softSkills || undefined,
    interests: p.interests || undefined,
    ...overrides,
  };
}

/** Dates arrive as Date objects (DB rows) or strings (forms); the actions want strings. */
const toDateString = (d: unknown, precision: 'month' | 'day' = 'month'): string | undefined => {
  if (!d) return undefined;
  if (typeof d === 'string') return d;
  return new Date(d as Date).toISOString().slice(0, precision === 'month' ? 7 : 10);
};

interface AdminResumeClientProps {
  profile: any;
  experiences: any[];
  socialLinks: any[];
  education: any[];
  achievements: any[];
  spokenLanguages: any[];
  activities: any[];
  skillsByCategory: Record<string, any[]>;
}

export function AdminResumeClient({
  profile: initialProfile,
  experiences: initialExperiences,
  socialLinks: initialSocialLinks,
  education: initialEducation,
  achievements: initialAchievements,
  spokenLanguages: initialSpokenLanguages,
  activities: initialActivities,
  skillsByCategory: initialSkillsByCategory,
}: AdminResumeClientProps) {
  // ── Main State ─────────────────────────────────────────────
  const [profile, setProfile] = useState(initialProfile);
  const [experiences, setExperiences] = useState(initialExperiences);
  const [education, setEducation] = useState(initialEducation);
  const [socialLinks, setSocialLinks] = useState(initialSocialLinks);
  const [achievements, setAchievements] = useState(initialAchievements);
  const [spokenLanguages, setSpokenLanguages] = useState(initialSpokenLanguages);
  const [activities, setActivities] = useState(initialActivities);
  const [skillsByCategory, setSkillsByCategory] = useState(initialSkillsByCategory);

  // Last persisted snapshot of every collection. "Hoàn tác" restores this, and it moves
  // forward after every successful write (dialog saves hit the server immediately).
  const baseline = useRef({
    profile: initialProfile,
    experiences: initialExperiences,
    education: initialEducation,
    socialLinks: initialSocialLinks,
    achievements: initialAchievements,
    spokenLanguages: initialSpokenLanguages,
    activities: initialActivities,
    skillsByCategory: initialSkillsByCategory,
  });
  type ListKey = 'experiences' | 'education' | 'socialLinks' | 'achievements' | 'spokenLanguages' | 'activities';
  const listSetters: Record<ListKey, React.Dispatch<React.SetStateAction<any[]>>> = {
    experiences: setExperiences,
    education: setEducation,
    socialLinks: setSocialLinks,
    achievements: setAchievements,
    spokenLanguages: setSpokenLanguages,
    activities: setActivities,
  };
  /** Applies a persisted list change to both live state and the restore baseline. */
  const commitList = (key: ListKey, updater: (prev: any[]) => any[]) => {
    listSetters[key](updater);
    baseline.current = { ...baseline.current, [key]: updater(baseline.current[key]) };
  };
  const commitSkills = (updater: (prev: Record<string, any[]>) => Record<string, any[]>) => {
    setSkillsByCategory(updater);
    baseline.current = { ...baseline.current, skillsByCategory: updater(baseline.current.skillsByCategory) };
  };

  // ── Dynamic Sections Layout State ──────────────────────────
  const [sectionLayout, setSectionLayout] = useState<ResumeSectionLayout>(() =>
    parseSectionLayout(initialProfile.interests)
  );

  // ── UI Controls State ──────────────────────────────────────
  const [isEditMode, setIsEditMode] = useState(true);
  const [isSectionSidebarOpen, setIsSectionSidebarOpen] = useState(true);
  const [isPdfDialogOpen, setIsPdfDialogOpen] = useState(false);
  const [isConvertDialogOpen, setIsConvertDialogOpen] = useState(false);
  const [isTranslateDialogOpen, setIsTranslateDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'stack' | 'paged'>('stack');
  const [activePage, setActivePage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, startSavingTransition] = useTransition();
  const leaveGuard = useUnsavedChangesGuard(hasUnsavedChanges);

  // Pending deletion tracking for replaced items
  const [deletedExpIds, setDeletedExpIds] = useState<string[]>([]);
  const [deletedEduIds, setDeletedEduIds] = useState<string[]>([]);
  const [deletedSkillIds, setDeletedSkillIds] = useState<string[]>([]);
  const [deletedLangIds, setDeletedLangIds] = useState<string[]>([]);

  const handleScrollToSection = useCallback((sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  // ── Modal Dialog State ─────────────────────────────────────
  const [dialogState, setDialogState] = useState<{
    open: boolean;
    type: ItemType | null;
    item?: any;
  }>({
    open: false,
    type: null,
  });

  // ── Handlers for Profile ───────────────────────────────────
  const handleUpdateProfile = useCallback((field: string, value: any) => {
    setProfile((prev: any) => ({
      ...prev,
      [field]: value,
    }));
    setHasUnsavedChanges(true);
  }, []);

  // Persists only the PDF link (on top of the last saved profile), so pending inline edits are
  // neither silently saved nor silently marked as saved. Throws so the dialog can show the error.
  const handleSavePdfUrl = useCallback(async (url: string | null) => {
    const res = await updateProfile(buildProfilePayload(baseline.current.profile, { resumeUrl: url }));
    assertOk(res, 'cập nhật liên kết PDF');
    setProfile((prev: any) => ({ ...prev, resumeUrl: url }));
    baseline.current = {
      ...baseline.current,
      profile: { ...baseline.current.profile, resumeUrl: url },
    };
  }, []);

  // ── Template Style Selection ──────────────────────────────
  const handleSelectTemplateStyle = useCallback((style: ResumeTemplateStyle) => {
    setSectionLayout(prev => ({
      ...prev,
      templateStyle: style,
    }));
    setHasUnsavedChanges(true);
    toast.info(
      `Đã chuyển sang mẫu ${style === 'harvard' ? '🏛️ Chuẩn Harvard (Đơn cột)' : '📐 Hiện đại (2 cột)'}`
    );
  }, []);

  // ── Dynamic Sections Layout Handlers ───────────────────────
  const handleMoveSection = useCallback((id: SectionId, direction: 'up' | 'down') => {
    setSectionLayout(prev => {
      // Harvard single-column order reordering
      if (prev.templateStyle !== 'modern') {
        const list = [...(prev.order || DEFAULT_HARVARD_ORDER)];
        const idx = list.indexOf(id);
        if (idx === -1) return prev;
        const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
        if (targetIdx < 0 || targetIdx >= list.length) return prev;

        [list[idx], list[targetIdx]] = [list[targetIdx], list[idx]];
        return {
          ...prev,
          order: list,
        };
      }

      // Modern 2-column order reordering
      const inLeft = prev.left.includes(id);
      const inRight = prev.right.includes(id);
      const colKey = inLeft ? 'left' : inRight ? 'right' : null;
      if (!colKey) return prev;

      const list = [...prev[colKey]];
      const idx = list.indexOf(id);
      if (idx === -1) return prev;
      const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
      if (targetIdx < 0 || targetIdx >= list.length) return prev;

      [list[idx], list[targetIdx]] = [list[targetIdx], list[idx]];
      return {
        ...prev,
        [colKey]: list,
      };
    });
    setHasUnsavedChanges(true);
    toast.info(
      `Đã chuyển "${SECTION_META[id]?.label || id}" ${
        direction === 'up' ? 'lên trên' : 'xuống dưới'
      }`
    );
  }, []);

  const handleSwitchSectionColumn = useCallback((id: SectionId) => {
    setSectionLayout(prev => {
      const inLeft = prev.left.includes(id);
      const inRight = prev.right.includes(id);
      if (!inLeft && !inRight) return prev;

      if (inLeft) {
        return {
          ...prev,
          left: prev.left.filter(s => s !== id),
          right: [...prev.right, id],
        };
      } else {
        return {
          ...prev,
          right: prev.right.filter(s => s !== id),
          left: [...prev.left, id],
        };
      }
    });
    setHasUnsavedChanges(true);
    toast.info(`Đã đổi cột cho mục "${SECTION_META[id]?.label || id}"`);
  }, []);

  const handleToggleHideSection = useCallback((id: SectionId) => {
    setSectionLayout(prev => {
      const isHidden = prev.hidden.includes(id);
      if (isHidden) {
        const defCol = SECTION_META[id]?.defaultColumn || 'left';
        return {
          ...prev,
          hidden: prev.hidden.filter(s => s !== id),
          [defCol]: [...prev[defCol], id],
        };
      } else {
        return {
          ...prev,
          left: prev.left.filter(s => s !== id),
          right: prev.right.filter(s => s !== id),
          hidden: [...prev.hidden, id],
        };
      }
    });
    setHasUnsavedChanges(true);
    toast.info(`Đã cập nhật hiển thị của "${SECTION_META[id]?.label || id}"`);
  }, []);

  const handleResetLayout = useCallback(() => {
    if (window.confirm('Khôi phục lại bố cục và thứ tự mặc định của các mục trên CV?')) {
      setSectionLayout(DEFAULT_SECTION_LAYOUT);
      setHasUnsavedChanges(true);
      toast.info('Đã khôi phục bố cục mặc định.');
    }
  }, []);

  // ── Apply Parsed Data from PDF CV ──────────────────────────
  const handleApplyParsedResume = useCallback(
    (parsed: ParsedResumeData, mode: 'replace' | 'merge', newPdfUrl?: string | null) => {
      // 1. Profile fields
      if (parsed.profile && Object.keys(parsed.profile).length > 0) {
        setProfile((prev: any) => ({
          ...prev,
          ...(parsed.profile.name ? { name: parsed.profile.name } : {}),
          ...(parsed.profile.title ? { title: parsed.profile.title } : {}),
          ...(parsed.profile.email ? { email: parsed.profile.email } : {}),
          ...(parsed.profile.phone ? { phone: parsed.profile.phone } : {}),
          ...(parsed.profile.location ? { location: parsed.profile.location } : {}),
          ...(parsed.profile.bio ? { bio: parsed.profile.bio } : {}),
          ...(parsed.profile.careerObjective ? { careerObjective: parsed.profile.careerObjective } : {}),
          ...(parsed.profile.softSkills ? { softSkills: parsed.profile.softSkills } : {}),
          ...(newPdfUrl ? { resumeUrl: newPdfUrl } : {}),
        }));
      } else if (newPdfUrl) {
        setProfile((prev: any) => ({ ...prev, resumeUrl: newPdfUrl }));
      }

      // 2. Experiences
      if (parsed.experiences && parsed.experiences.length > 0) {
        const mappedExps = parsed.experiences.map((exp, idx) => ({
          id: `temp-exp-${Date.now()}-${idx}`,
          company: exp.company,
          position: exp.position,
          description: exp.description || null,
          achievements: exp.achievements || null,
          techStack: exp.techStack || null,
          startDate: exp.startDate ? new Date(exp.startDate) : new Date(),
          endDate: exp.endDate ? new Date(exp.endDate) : null,
          isCurrent: exp.isCurrent ?? false,
          order: idx,
        }));

        if (mode === 'replace') {
          setDeletedExpIds(prev => [
            ...prev,
            ...experiences.filter(e => e.id && !e.id.startsWith('temp-')).map(e => e.id),
          ]);
          setExperiences(mappedExps);
        } else {
          setExperiences(prev => [...prev, ...mappedExps]);
        }
      }

      // 3. Education
      if (parsed.education && parsed.education.length > 0) {
        const mappedEdu = parsed.education.map((edu, idx) => ({
          id: `temp-edu-${Date.now()}-${idx}`,
          institution: edu.institution,
          degree: edu.degree,
          fieldOfStudy: edu.fieldOfStudy || null,
          startDate: edu.startDate ? new Date(edu.startDate) : new Date(),
          endDate: edu.endDate ? new Date(edu.endDate) : null,
          isCurrent: edu.isCurrent ?? false,
          gpa: edu.gpa || null,
          description: edu.description || null,
          order: idx,
        }));

        if (mode === 'replace') {
          setDeletedEduIds(prev => [
            ...prev,
            ...education.filter(e => e.id && !e.id.startsWith('temp-')).map(e => e.id),
          ]);
          setEducation(mappedEdu);
        } else {
          setEducation(prev => [...prev, ...mappedEdu]);
        }
      }

      // 4. Skills
      if (parsed.skills && parsed.skills.length > 0) {
        if (mode === 'replace') {
          const existingIds: string[] = [];
          for (const list of Object.values(skillsByCategory)) {
            for (const sk of list) {
              if (sk.id && !sk.id.startsWith('temp-')) existingIds.push(sk.id);
            }
          }
          setDeletedSkillIds(prev => [...prev, ...existingIds]);

          const nextSkills: Record<string, any[]> = {};
          parsed.skills.forEach((sk, idx) => {
            const cat = sk.category || 'OTHER';
            if (!nextSkills[cat]) nextSkills[cat] = [];
            nextSkills[cat].push({
              id: `temp-skill-${Date.now()}-${idx}`,
              name: sk.name,
              category: cat,
              level: sk.level || 3,
              order: idx,
            });
          });
          setSkillsByCategory(nextSkills);
        } else {
          setSkillsByCategory(prev => {
            const next = { ...prev };
            parsed.skills.forEach((sk, idx) => {
              const cat = sk.category || 'OTHER';
              if (!next[cat]) next[cat] = [];
              const exists = next[cat].some(
                s => s.name.toLowerCase() === sk.name.toLowerCase()
              );
              if (!exists) {
                next[cat].push({
                  id: `temp-skill-${Date.now()}-${idx}`,
                  name: sk.name,
                  category: cat,
                  level: sk.level || 3,
                  order: next[cat].length,
                });
              }
            });
            return next;
          });
        }
      }

      // 5. Spoken Languages
      if (parsed.spokenLanguages && parsed.spokenLanguages.length > 0) {
        const mappedLangs = parsed.spokenLanguages.map((l, idx) => ({
          id: `temp-lang-${Date.now()}-${idx}`,
          language: l.language,
          level: l.level || 'Professional Working',
          order: idx,
        }));

        if (mode === 'replace') {
          setDeletedLangIds(prev => [
            ...prev,
            ...spokenLanguages.filter(l => l.id && !l.id.startsWith('temp-')).map(l => l.id),
          ]);
          setSpokenLanguages(mappedLangs);
        } else {
          setSpokenLanguages(prev => {
            const current = [...prev];
            for (const item of mappedLangs) {
              if (!current.some(c => c.language.toLowerCase() === item.language.toLowerCase())) {
                current.push(item);
              }
            }
            return current;
          });
        }
      }

      // 6. Social Links
      if (parsed.socialLinks && parsed.socialLinks.length > 0) {
        setSocialLinks(prev => {
          const current = [...prev];
          for (const s of parsed.socialLinks) {
            const idx = current.findIndex(
              c => c.platform.toLowerCase() === s.platform.toLowerCase()
            );
            if (idx >= 0) {
              current[idx] = { ...current[idx], url: s.url };
            } else {
              current.push({
                id: `temp-social-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
                platform: s.platform,
                url: s.url,
                order: current.length,
              });
            }
          }
          return current;
        });
      }

      setHasUnsavedChanges(true);
      toast.info('Đã tải dữ liệu PDF lên bản CV Studio. Bấm "Lưu thay đổi" để hoàn tất lưu trữ.');
    },
    [experiences, education, skillsByCategory, spokenLanguages]
  );

  // ── Save All Uncommitted Changes ───────────────────────────
  // Writes run first and queued deletions last, so a failure can never leave the CV emptier
  // than before. Every created row adopts its real id immediately, which is what stops the
  // next "Save All" from creating it again.
  const handleSaveAll = () => {
    startSavingTransition(async () => {
      const merge = <T,>(done: T[], all: T[]): T[] => [...done, ...all.slice(done.length)];
      const nowMonth = new Date().toISOString().slice(0, 7);

      const nextProfile = { ...profile, interests: JSON.stringify(sectionLayout) };
      const doneExp: any[] = [];
      const doneEdu: any[] = [];
      const doneAch: any[] = [];
      const doneAct: any[] = [];
      const doneLang: any[] = [];
      const doneSocial: any[] = [];
      const skillIdMap = new Map<string, string>();
      const pendingDeletes = {
        exp: [...deletedExpIds],
        edu: [...deletedEduIds],
        skill: [...deletedSkillIds],
        lang: [...deletedLangIds],
      };
      let profileSaved = false;
      let succeeded = false;

      try {
        assertOk(await updateProfile(buildProfilePayload(nextProfile)), 'lưu thông tin hồ sơ');
        profileSaved = true;

        for (const exp of experiences) {
          const payload = {
            company: exp.company,
            position: exp.position,
            description: exp.description || undefined,
            achievements: exp.achievements || undefined,
            techStack: exp.techStack || undefined,
            startDate: toDateString(exp.startDate) ?? nowMonth,
            endDate: exp.isCurrent ? undefined : toDateString(exp.endDate),
            isCurrent: exp.isCurrent ?? false,
          };
          if (isTempId(exp.id)) {
            const res = await createExperience(payload);
            assertOk(res, 'lưu kinh nghiệm');
            doneExp.push({ ...exp, id: res.id as string });
          } else {
            assertOk(await updateExperience(exp.id, payload), 'lưu kinh nghiệm');
            doneExp.push(exp);
          }
        }

        for (const edu of education) {
          const payload = {
            institution: edu.institution,
            degree: edu.degree,
            fieldOfStudy: edu.fieldOfStudy || undefined,
            startDate: toDateString(edu.startDate) ?? nowMonth,
            endDate: edu.isCurrent ? undefined : toDateString(edu.endDate),
            isCurrent: edu.isCurrent ?? false,
            gpa: edu.gpa || undefined,
            description: edu.description || undefined,
          };
          if (isTempId(edu.id)) {
            const res = await createEducation(payload);
            assertOk(res, 'lưu học vấn');
            doneEdu.push({ ...edu, id: res.id as string });
          } else {
            assertOk(await updateEducation(edu.id, payload), 'lưu học vấn');
            doneEdu.push(edu);
          }
        }

        // Inline edits on the canvas also touch achievements and activities
        for (const ach of achievements) {
          const payload = {
            title: ach.title,
            description: ach.description || undefined,
            date: toDateString(ach.date, 'day'),
            category: ach.category || undefined,
          };
          if (isTempId(ach.id)) {
            const res = await createAchievement(payload);
            assertOk(res, 'lưu thành tích');
            doneAch.push({ ...ach, id: res.id as string });
          } else {
            assertOk(await updateAchievement(ach.id, payload), 'lưu thành tích');
            doneAch.push(ach);
          }
        }

        for (const act of activities) {
          const payload = {
            title: act.title,
            description: act.description || undefined,
            type: act.type || undefined,
            startDate: toDateString(act.startDate, 'day'),
            endDate: toDateString(act.endDate, 'day'),
          };
          if (isTempId(act.id)) {
            const res = await createActivity(payload);
            assertOk(res, 'lưu hoạt động');
            doneAct.push({ ...act, id: res.id as string });
          } else {
            assertOk(await updateActivity(act.id, payload), 'lưu hoạt động');
            doneAct.push(act);
          }
        }

        for (const [cat, skillList] of Object.entries(skillsByCategory)) {
          for (const sk of skillList) {
            if (!isTempId(sk.id)) continue;
            const res = await createSkill({
              name: sk.name,
              category: cat as any,
              level: sk.level || 3,
              order: 0,
            });
            assertOk(res, `lưu kỹ năng ${sk.name}`);
            skillIdMap.set(sk.id, res.id as string);
          }
        }

        for (const lang of spokenLanguages) {
          if (isTempId(lang.id)) {
            const res = await createSpokenLanguage({
              language: lang.language,
              level: lang.level || 'Professional',
            });
            assertOk(res, `lưu ngoại ngữ ${lang.language}`);
            doneLang.push({ ...lang, id: res.id as string });
          } else {
            doneLang.push(lang);
          }
        }

        for (const social of socialLinks) {
          if (isTempId(social.id)) {
            const res = await upsertSocialLink(social.platform, social.url, social.iconName);
            assertOk(res, `lưu liên kết ${social.platform}`);
            doneSocial.push({ ...social, id: res.id as string });
          } else {
            doneSocial.push(social);
          }
        }

        // Persist the on-screen order (Move up / down)
        if (doneExp.length > 0) {
          assertOk(await reorderExperiences(doneExp.map(e => e.id)), 'lưu thứ tự kinh nghiệm');
        }
        if (doneEdu.length > 0) {
          assertOk(await reorderEducation(doneEdu.map(e => e.id)), 'lưu thứ tự học vấn');
        }

        // Deletions queued by a "replace" PDF import run last; failures stay queued for the next save
        const tryDelete = async (ids: string[], del: (id: string) => Promise<{ ok: boolean }>) => {
          const failed: string[] = [];
          for (const id of ids) {
            const ok = await del(id).then(r => r.ok, () => false);
            if (!ok) failed.push(id);
          }
          return failed;
        };
        pendingDeletes.exp = await tryDelete(pendingDeletes.exp, deleteExperience);
        pendingDeletes.edu = await tryDelete(pendingDeletes.edu, deleteEducation);
        pendingDeletes.skill = await tryDelete(pendingDeletes.skill, deleteSkill);
        pendingDeletes.lang = await tryDelete(pendingDeletes.lang, deleteSpokenLanguage);
        const failedDeletes =
          pendingDeletes.exp.length +
          pendingDeletes.edu.length +
          pendingDeletes.skill.length +
          pendingDeletes.lang.length;
        if (failedDeletes > 0) {
          throw new Error(
            `Đã lưu thay đổi nhưng chưa xóa được ${failedDeletes} mục cũ. Hãy bấm "Lưu thay đổi" lần nữa.`
          );
        }
        succeeded = true;
      } catch (error) {
        console.error('Error saving CV changes:', error);
        toast.error(error instanceof Error ? error.message : 'Có lỗi xảy ra khi lưu thay đổi.');
      } finally {
        // Commit whatever did persist (real ids included) so nothing is created twice later
        const finalProfile = profileSaved ? nextProfile : profile;
        const finalExp = merge(doneExp, experiences);
        const finalEdu = merge(doneEdu, education);
        const finalAch = merge(doneAch, achievements);
        const finalAct = merge(doneAct, activities);
        const finalLang = merge(doneLang, spokenLanguages);
        const finalSocial = merge(doneSocial, socialLinks);
        const finalSkills = Object.fromEntries(
          Object.entries(skillsByCategory).map(([cat, list]) => [
            cat,
            list.map(sk => (skillIdMap.has(sk.id) ? { ...sk, id: skillIdMap.get(sk.id) } : sk)),
          ])
        );
        setProfile(finalProfile);
        setExperiences(finalExp);
        setEducation(finalEdu);
        setAchievements(finalAch);
        setActivities(finalAct);
        setSpokenLanguages(finalLang);
        setSocialLinks(finalSocial);
        setSkillsByCategory(finalSkills);
        setDeletedExpIds(pendingDeletes.exp);
        setDeletedEduIds(pendingDeletes.edu);
        setDeletedSkillIds(pendingDeletes.skill);
        setDeletedLangIds(pendingDeletes.lang);

        if (succeeded) {
          baseline.current = {
            profile: finalProfile,
            experiences: finalExp,
            education: finalEdu,
            socialLinks: finalSocial,
            achievements: finalAch,
            spokenLanguages: finalLang,
            activities: finalAct,
            skillsByCategory: finalSkills,
          };
          setHasUnsavedChanges(false);
          toast.success('Đã lưu tất cả thay đổi trên CV thành công!');
        }
      }
    });
  };

  // ── Reset to Initial Data ──────────────────────────────────
  const handleReset = () => {
    if (window.confirm('Bạn có chắc muốn hoàn tác các thay đổi chưa lưu trên CV?')) {
      const b = baseline.current;
      setProfile(b.profile);
      setExperiences(b.experiences);
      setEducation(b.education);
      setSocialLinks(b.socialLinks);
      setAchievements(b.achievements);
      setSpokenLanguages(b.spokenLanguages);
      setActivities(b.activities);
      setSkillsByCategory(b.skillsByCategory);
      setSectionLayout(parseSectionLayout(b.profile.interests));
      setDeletedExpIds([]);
      setDeletedEduIds([]);
      setDeletedSkillIds([]);
      setDeletedLangIds([]);
      setHasUnsavedChanges(false);
      toast.info('Đã khôi phục dữ liệu ban đầu.');
    }
  };

  // ── Item Actions: Add / Edit Dialog ────────────────────────
  const handleOpenDialog = (type: ItemType, item?: any) => {
    setDialogState({
      open: true,
      type,
      item,
    });
  };

  // Dialog saves hit the server immediately. Created rows adopt the real id returned by the
  // action (so "Save All" never re-creates them) and the restore baseline moves with them.
  const handleSaveDialogItem = async (type: ItemType, data: any) => {
    const replaceById = (next: any) => (prev: any[]) =>
      prev.map(item => (item.id === next.id ? { ...item, ...next } : item));
    const append = (next: any) => (prev: any[]) => [...prev, next];

    switch (type) {
      case 'experience': {
        const payload = {
          company: data.company,
          position: data.position,
          startDate: data.startDate,
          endDate: data.endDate || undefined,
          isCurrent: data.isCurrent,
          description: data.description || undefined,
          achievements: data.achievements || undefined,
          techStack: data.techStack || undefined,
        };
        if (data.id) {
          assertOk(await updateExperience(data.id, payload), 'lưu kinh nghiệm');
          commitList('experiences', replaceById(data));
          toast.success('Đã cập nhật kinh nghiệm!');
        } else {
          const res = await createExperience(payload);
          assertOk(res, 'lưu kinh nghiệm');
          commitList('experiences', append({ ...data, id: res.id, startDate: new Date(data.startDate) }));
          toast.success('Đã thêm kinh nghiệm mới!');
        }
        break;
      }

      case 'education': {
        const payload = {
          institution: data.institution,
          degree: data.degree,
          fieldOfStudy: data.fieldOfStudy || undefined,
          startDate: data.startDate,
          endDate: data.endDate || undefined,
          isCurrent: data.isCurrent,
          gpa: data.gpa || undefined,
          description: data.description || undefined,
        };
        if (data.id) {
          assertOk(await updateEducation(data.id, payload), 'lưu học vấn');
          commitList('education', replaceById(data));
          toast.success('Đã cập nhật học vấn!');
        } else {
          const res = await createEducation(payload);
          assertOk(res, 'lưu học vấn');
          commitList('education', append({ ...data, id: res.id, startDate: new Date(data.startDate) }));
          toast.success('Đã thêm học vấn mới!');
        }
        break;
      }

      case 'achievement': {
        const payload = {
          title: data.title,
          description: data.description || undefined,
          date: data.date || undefined,
          category: data.category || undefined,
        };
        if (data.id) {
          assertOk(await updateAchievement(data.id, payload), 'lưu thành tích');
          commitList('achievements', replaceById(data));
          toast.success('Đã cập nhật thành tích!');
        } else {
          const res = await createAchievement(payload);
          assertOk(res, 'lưu thành tích');
          commitList('achievements', append({ ...data, id: res.id, date: data.date ? new Date(data.date) : null }));
          toast.success('Đã thêm thành tích mới!');
        }
        break;
      }

      case 'language': {
        const payload = { language: data.language, level: data.level };
        if (data.id) {
          assertOk(await updateSpokenLanguage(data.id, payload), 'lưu ngoại ngữ');
          commitList('spokenLanguages', replaceById(data));
          toast.success('Đã cập nhật ngoại ngữ!');
        } else {
          const res = await createSpokenLanguage(payload);
          assertOk(res, 'lưu ngoại ngữ');
          commitList('spokenLanguages', append({ ...data, id: res.id }));
          toast.success('Đã thêm ngoại ngữ mới!');
        }
        break;
      }

      case 'activity': {
        const payload = {
          title: data.title,
          description: data.description || undefined,
          type: data.type || undefined,
          startDate: data.startDate || undefined,
          endDate: data.endDate || undefined,
        };
        if (data.id) {
          assertOk(await updateActivity(data.id, payload), 'lưu hoạt động');
          commitList('activities', replaceById(data));
          toast.success('Đã cập nhật hoạt động!');
        } else {
          const res = await createActivity(payload);
          assertOk(res, 'lưu hoạt động');
          commitList('activities', append({ ...data, id: res.id }));
          toast.success('Đã thêm hoạt động mới!');
        }
        break;
      }

      case 'skill': {
        const level = data.level || 3;
        const res = await createSkill({ name: data.name, category: data.category, level, order: 0 });
        assertOk(res, `lưu kỹ năng ${data.name}`);
        commitSkills(prev => {
          const cat = data.category;
          return {
            ...prev,
            [cat]: [...(prev[cat] || []), { id: res.id, name: data.name, category: cat, level, order: 0 }],
          };
        });
        toast.success(`Đã thêm kỹ năng ${data.name}!`);
        break;
      }

      case 'social': {
        const res = await upsertSocialLink(data.platform, data.url, data.iconName);
        assertOk(res, `lưu liên kết ${data.platform}`);
        commitList('socialLinks', prev => {
          const idx = prev.findIndex(s => s.platform.toLowerCase() === data.platform.toLowerCase());
          if (idx >= 0) {
            const updated = [...prev];
            updated[idx] = { ...updated[idx], ...data, id: res.id };
            return updated;
          }
          return [...prev, { ...data, id: res.id }];
        });
        toast.success(`Đã lưu liên kết ${data.platform}!`);
        break;
      }
    }
  };

  // ── Item Actions: Delete ───────────────────────────────────
  const handleDeleteItem = async (type: ItemType, id: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa mục này?')) return;
    const removeById = (prev: any[]) => prev.filter(item => item.id !== id);

    try {
      switch (type) {
        case 'experience':
          if (!isTempId(id)) assertOk(await deleteExperience(id), 'xóa mục này');
          commitList('experiences', removeById);
          break;
        case 'education':
          if (!isTempId(id)) assertOk(await deleteEducation(id), 'xóa mục này');
          commitList('education', removeById);
          break;
        case 'achievement':
          if (!isTempId(id)) assertOk(await deleteAchievement(id), 'xóa mục này');
          commitList('achievements', removeById);
          break;
        case 'language':
          if (!isTempId(id)) assertOk(await deleteSpokenLanguage(id), 'xóa mục này');
          commitList('spokenLanguages', removeById);
          break;
        case 'activity':
          if (!isTempId(id)) assertOk(await deleteActivity(id), 'xóa mục này');
          commitList('activities', removeById);
          break;
        case 'social':
          if (!isTempId(id)) assertOk(await deleteSocialLink(id), 'xóa mục này');
          commitList('socialLinks', removeById);
          break;
        case 'skill':
          if (!isTempId(id)) assertOk(await deleteSkill(id), 'xóa kỹ năng');
          commitSkills(prev =>
            Object.fromEntries(Object.entries(prev).map(([cat, list]) => [cat, list.filter(s => s.id !== id)]))
          );
          break;
      }
      toast.success('Đã xóa thành công!');
    } catch (err) {
      console.error('Delete item failed:', err);
      toast.error(err instanceof Error ? err.message : 'Không thể xóa mục này.');
    }
  };

  // ── Move Item (Up / Down) ──────────────────────────────────
  const handleMoveItem = (type: 'experience' | 'education', id: string, direction: 'up' | 'down') => {
    const list = type === 'experience' ? experiences : education;
    const idx = list.findIndex(item => item.id === id);
    if (idx < 0) return;
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= list.length) return;

    const updated = [...list];
    const temp = updated[idx];
    updated[idx] = updated[targetIdx];
    updated[targetIdx] = temp;

    if (type === 'experience') {
      setExperiences(updated);
    } else {
      setEducation(updated);
    }
    setHasUnsavedChanges(true);
  };

  // ── Quick Inline Helpers for Experience ────────────────────
  const handleUpdateExperienceAchievements = (id: string, achievementsText: string) => {
    setExperiences(prev =>
      prev.map(exp => (exp.id === id ? { ...exp, achievements: achievementsText } : exp))
    );
    setHasUnsavedChanges(true);
  };

  const handleUpdateExperienceTechStack = (id: string, techStackText: string) => {
    setExperiences(prev =>
      prev.map(exp => (exp.id === id ? { ...exp, techStack: techStackText } : exp))
    );
    setHasUnsavedChanges(true);
  };

  // ── Skills Management ──────────────────────────────────────
  const handleQuickAddSkill = (category: string) => {
    setDialogState({
      open: true,
      type: 'skill',
      item: { category, level: 3 },
    });
  };

  const handleDeleteSkill = async (id: string) => {
    if (!window.confirm('Xóa kỹ năng này khỏi CV?')) return;
    try {
      if (!isTempId(id)) assertOk(await deleteSkill(id), 'xóa kỹ năng');
      commitSkills(prev =>
        Object.fromEntries(Object.entries(prev).map(([cat, skills]) => [cat, skills.filter(s => s.id !== id)]))
      );
      toast.success('Đã xóa kỹ năng!');
    } catch (err) {
      console.error('Failed to delete skill:', err);
      toast.error(err instanceof Error ? err.message : 'Không thể xóa kỹ năng.');
    }
  };

  return (
    <div className="h-full flex-1 flex flex-col min-h-0 overflow-hidden bg-muted/20">
      {/* ── Top Sticky WYSIWYG Toolbar ── */}
      <ResumeToolbar
        isEditMode={isEditMode}
        onToggleEditMode={() => setIsEditMode(!isEditMode)}
        hasUnsavedChanges={hasUnsavedChanges}
        isSaving={isSaving}
        onSave={handleSaveAll}
        onReset={handleReset}
        totalPages={totalPages}
        activePage={activePage}
        onSelectPage={setActivePage}
        viewMode={viewMode}
        onToggleViewMode={setViewMode}
        resumeUrl={profile.resumeUrl}
        isSectionSidebarOpen={isSectionSidebarOpen}
        onToggleSectionSidebar={() => setIsSectionSidebarOpen(prev => !prev)}
        onOpenPdfDialog={() => setIsPdfDialogOpen(true)}
        onOpenConvertDialog={() => setIsConvertDialogOpen(true)}
        onOpenTranslateDialog={() => setIsTranslateDialogOpen(true)}
        templateStyle={sectionLayout.templateStyle}
        onSelectTemplateStyle={handleSelectTemplateStyle}
      />

      {/* ── Workspace Area: Section Sidebar on Left + Dedicated Canvas on Right ── */}
      <div className="flex-1 min-h-0 flex overflow-hidden relative">
        {/* Left: Section Toolbox Sidebar */}
        <ResumeSectionSidebar
          isOpen={isSectionSidebarOpen}
          onToggle={() => setIsSectionSidebarOpen(prev => !prev)}
          sectionLayout={sectionLayout}
          onMoveSection={handleMoveSection}
          onSwitchSectionColumn={handleSwitchSectionColumn}
          onToggleHideSection={handleToggleHideSection}
          onResetLayout={handleResetLayout}
          experienceCount={experiences.length}
          educationCount={education.length}
          skillsCount={Object.values(skillsByCategory).reduce((acc, arr) => acc + arr.length, 0)}
          socialCount={socialLinks.length}
          languageCount={spokenLanguages.length}
          achievementCount={achievements.length}
          activityCount={activities.length}
          onOpenDialog={handleOpenDialog}
          onScrollToSection={handleScrollToSection}
          resumeUrl={profile.resumeUrl}
          onOpenPdfDialog={() => setIsPdfDialogOpen(true)}
          onOpenConvertDialog={() => setIsConvertDialogOpen(true)}
        />

        {/* Right: Isolated Scrollable Canvas Viewport */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 flex flex-col items-center scroll-smooth bg-muted/30">
          {/* Visual Helper Banner */}
          {isEditMode && (
            <div className="w-full max-w-5xl mb-6">
              <div className="bg-primary/10 border border-primary/20 rounded-xl px-4 py-2.5 flex items-center justify-between gap-3 text-xs text-primary shadow-2xs">
                <div className="flex items-center gap-2">
                  <span className="flex h-2 w-2 rounded-full bg-primary animate-ping" />
                  <span className="font-semibold">
                    Studio Canvas Tương tác:
                  </span>
                  <span className="hidden sm:inline opacity-90">
                    Dùng các nút [↑] [↓] [⇄] hoặc thanh Sections bên trái để đổi vị trí, chuyển cột hoặc ẩn các mục. Nhấp trực tiếp vào bất kỳ chữ nào để sửa.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsEditMode(false)}
                  className="text-[11px] font-bold underline hover:opacity-80 shrink-0"
                >
                  Ẩn hướng dẫn
                </button>
              </div>
            </div>
          )}

          {/* Main Live Canvas (Centered) */}
          <main className="w-full max-w-5xl">
            <LiveResumeCanvas
              profile={profile}
              experiences={experiences}
              education={education}
              socialLinks={socialLinks}
              achievements={achievements}
              spokenLanguages={spokenLanguages}
              activities={activities}
              skillsByCategory={skillsByCategory}
              sectionLayout={sectionLayout}
              onMoveSection={handleMoveSection}
              onSwitchSectionColumn={handleSwitchSectionColumn}
              onToggleHideSection={handleToggleHideSection}
              isEditMode={isEditMode}
              activePage={activePage}
              viewMode={viewMode}
              onUpdateProfile={handleUpdateProfile}
              onOpenDialog={handleOpenDialog}
              onDeleteItem={handleDeleteItem}
              onMoveItem={handleMoveItem}
              onUpdateExperienceAchievements={handleUpdateExperienceAchievements}
              onUpdateExperienceTechStack={handleUpdateExperienceTechStack}
              onQuickAddSkill={handleQuickAddSkill}
              onDeleteSkill={handleDeleteSkill}
              onSetTotalPages={setTotalPages}
            />
          </main>
        </div>
      </div>

      {/* ── Detailed Edit Modal Dialog ── */}
      <ResumeItemDialog
        open={dialogState.open}
        onOpenChange={open => setDialogState(prev => ({ ...prev, open }))}
        type={dialogState.type}
        item={dialogState.item}
        onSave={handleSaveDialogItem}
      />

      {/* ── PDF Resume Import & Management Dialog ── */}
      <ResumePdfDialog
        open={isPdfDialogOpen}
        onOpenChange={setIsPdfDialogOpen}
        currentResumeUrl={profile.resumeUrl}
        onSavePdfUrl={handleSavePdfUrl}
        onOpenConvertDialog={() => setIsConvertDialogOpen(true)}
      />

      {/* ── PDF to CV Conversion Modal Dialog ── */}
      <ResumePdfConvertDialog
        open={isConvertDialogOpen}
        onOpenChange={setIsConvertDialogOpen}
        currentResumeUrl={profile.resumeUrl}
        onApplyParsedData={handleApplyParsedResume}
      />

      {/* ── AI English Translation Dialog ── */}
      <ResumeTranslateDialog
        open={isTranslateDialogOpen}
        onOpenChange={setIsTranslateDialogOpen}
        profile={profile}
        experiences={experiences}
      />

      {/* ── Leave guard for unsaved canvas edits ── */}
      <UnsavedChangesDialog
        open={leaveGuard.isBlocking}
        onOpenChange={open => {
          if (!open) leaveGuard.cancel();
        }}
        onConfirmLeave={leaveGuard.confirmLeave}
      />
    </div>
  );
}
