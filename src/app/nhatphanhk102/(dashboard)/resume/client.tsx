'use client';

import React, { useState, useTransition, useCallback } from 'react';
import { toast } from 'sonner';
import { ResumeToolbar } from '@/components/admin/resume/ResumeToolbar';
import { LiveResumeCanvas } from '@/components/admin/resume/LiveResumeCanvas';
import { ResumeSectionSidebar } from '@/components/admin/resume/ResumeSectionSidebar';
import { ResumeItemDialog, ItemType } from '@/components/admin/resume/ResumeItemDialog';
import { ResumePdfDialog } from '@/components/admin/resume/ResumePdfDialog';
import { ResumePdfConvertDialog } from '@/components/admin/resume/ResumePdfConvertDialog';
import { ResumeTranslateDialog } from '@/components/admin/resume/ResumeTranslateDialog';
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
} from '@/lib/actions/about';
import { createSkill, deleteSkill } from '@/lib/actions/skill';

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

  const handleSavePdfUrl = useCallback(
    async (url: string | null) => {
      setProfile((prev: any) => ({
        ...prev,
        resumeUrl: url,
      }));
      try {
        await updateProfile({
          ...profile,
          resumeUrl: url || undefined,
        });
        setHasUnsavedChanges(false);
      } catch (e) {
        console.error('Failed to update profile resumeUrl', e);
        throw e;
      }
    },
    [profile]
  );

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
              level: sk.level || 80,
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
                  level: sk.level || 80,
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
  const handleSaveAll = () => {
    startSavingTransition(async () => {
      try {
        const layoutJson = JSON.stringify(sectionLayout);

        // Delete items queued for deletion (from replace mode)
        for (const id of deletedExpIds) {
          try { await deleteExperience(id); } catch (_e) {}
        }
        for (const id of deletedEduIds) {
          try { await deleteEducation(id); } catch (_e) {}
        }
        for (const id of deletedSkillIds) {
          try { await deleteSkill(id); } catch (_e) {}
        }
        for (const id of deletedLangIds) {
          try { await deleteSpokenLanguage(id); } catch (_e) {}
        }
        setDeletedExpIds([]);
        setDeletedEduIds([]);
        setDeletedSkillIds([]);
        setDeletedLangIds([]);

        // Save profile
        const profileRes = await updateProfile({
          name: profile.name,
          handle: profile.handle || undefined,
          title: profile.title,
          tagline: profile.tagline || undefined,
          bio: profile.bio || undefined,
          bio2: profile.bio2 || undefined,
          careerObjective: profile.careerObjective || undefined,
          location: profile.location || undefined,
          email: profile.email || undefined,
          phone: profile.phone || undefined,
          resumeUrl: profile.resumeUrl || undefined,
          avatarUrl: profile.avatarUrl || undefined,
          softSkills: profile.softSkills || undefined,
          interests: layoutJson,
        });

        if (!profileRes.ok) {
          toast.error('Lỗi khi lưu thông tin profile');
          return;
        }

        // Save inline-modified or newly added experiences
        for (const exp of experiences) {
          const sDate = exp.startDate
            ? (typeof exp.startDate === 'string' ? exp.startDate : new Date(exp.startDate).toISOString().slice(0, 7))
            : new Date().toISOString().slice(0, 7);
          const eDate = exp.endDate
            ? (typeof exp.endDate === 'string' ? exp.endDate : new Date(exp.endDate).toISOString().slice(0, 7))
            : undefined;

          if (exp.id && !exp.id.startsWith('temp-')) {
            await updateExperience(exp.id, {
              company: exp.company,
              position: exp.position,
              description: exp.description || undefined,
              achievements: exp.achievements || undefined,
              techStack: exp.techStack || undefined,
              startDate: sDate,
              endDate: exp.isCurrent ? undefined : eDate,
              isCurrent: exp.isCurrent,
            });
          } else {
            await createExperience({
              company: exp.company,
              position: exp.position,
              description: exp.description || undefined,
              achievements: exp.achievements || undefined,
              techStack: exp.techStack || undefined,
              startDate: sDate,
              endDate: exp.isCurrent ? undefined : eDate,
              isCurrent: exp.isCurrent ?? false,
            });
          }
        }

        // Save inline-modified or newly added education
        for (const edu of education) {
          const sDate = edu.startDate
            ? (typeof edu.startDate === 'string' ? edu.startDate : new Date(edu.startDate).toISOString().slice(0, 7))
            : new Date().toISOString().slice(0, 7);
          const eDate = edu.endDate
            ? (typeof edu.endDate === 'string' ? edu.endDate : new Date(edu.endDate).toISOString().slice(0, 7))
            : undefined;

          if (edu.id && !edu.id.startsWith('temp-')) {
            await updateEducation(edu.id, {
              institution: edu.institution,
              degree: edu.degree,
              fieldOfStudy: edu.fieldOfStudy || undefined,
              startDate: sDate,
              endDate: edu.isCurrent ? undefined : eDate,
              isCurrent: edu.isCurrent,
              gpa: edu.gpa || undefined,
              description: edu.description || undefined,
            });
          } else {
            await createEducation({
              institution: edu.institution,
              degree: edu.degree,
              fieldOfStudy: edu.fieldOfStudy || undefined,
              startDate: sDate,
              endDate: edu.isCurrent ? undefined : eDate,
              isCurrent: edu.isCurrent ?? false,
              gpa: edu.gpa || undefined,
              description: edu.description || undefined,
            });
          }
        }

        // Save newly added skills from PDF or manual additions
        for (const [cat, skillList] of Object.entries(skillsByCategory)) {
          for (const sk of skillList) {
            if (sk.id && sk.id.startsWith('temp-')) {
              try {
                await createSkill({
                  name: sk.name,
                  category: cat as any,
                  level: sk.level || 80,
                  order: 0,
                });
              } catch (_err) {
                console.error('Failed to create skill during Save All:', _err);
              }
            }
          }
        }

        // Save newly added spoken languages
        for (const lang of spokenLanguages) {
          if (lang.id && lang.id.startsWith('temp-')) {
            try {
              await createSpokenLanguage({
                language: lang.language,
                level: lang.level || 'Professional',
              });
            } catch (_err) {
              console.error('Failed to create spoken language during Save All:', _err);
            }
          }
        }

        // Save newly added social links
        for (const social of socialLinks) {
          if (social.id && social.id.startsWith('temp-')) {
            try {
              await upsertSocialLink(social.platform, social.url, social.iconName);
            } catch (_err) {
              console.error('Failed to upsert social link during Save All:', _err);
            }
          }
        }

        setProfile((prev: any) => ({ ...prev, interests: layoutJson }));
        setHasUnsavedChanges(false);
        toast.success('Đã lưu tất cả thay đổi trên CV thành công!');
      } catch (error) {
        console.error('Error saving CV changes:', error);
        toast.error('Có lỗi xảy ra khi lưu thay đổi.');
      }
    });
  };

  // ── Reset to Initial Data ──────────────────────────────────
  const handleReset = () => {
    if (window.confirm('Bạn có chắc muốn hoàn tác các thay đổi chưa lưu trên CV?')) {
      setProfile(initialProfile);
      setExperiences(initialExperiences);
      setEducation(initialEducation);
      setSocialLinks(initialSocialLinks);
      setAchievements(initialAchievements);
      setSpokenLanguages(initialSpokenLanguages);
      setActivities(initialActivities);
      setSkillsByCategory(initialSkillsByCategory);
      setSectionLayout(parseSectionLayout(initialProfile.interests));
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

  const handleSaveDialogItem = async (type: ItemType, data: any) => {
    switch (type) {
      case 'experience': {
        if (data.id) {
          await updateExperience(data.id, {
            company: data.company,
            position: data.position,
            startDate: data.startDate,
            endDate: data.endDate || undefined,
            isCurrent: data.isCurrent,
            description: data.description || undefined,
            achievements: data.achievements || undefined,
            techStack: data.techStack || undefined,
          });
          setExperiences(prev =>
            prev.map(item => (item.id === data.id ? { ...item, ...data } : item))
          );
          toast.success('Đã cập nhật kinh nghiệm!');
        } else {
          await createExperience({
            company: data.company,
            position: data.position,
            startDate: data.startDate,
            endDate: data.endDate || undefined,
            isCurrent: data.isCurrent,
            description: data.description || undefined,
            achievements: data.achievements || undefined,
            techStack: data.techStack || undefined,
          });
          setExperiences(prev => [
            ...prev,
            { ...data, id: `temp-${Date.now()}`, startDate: new Date(data.startDate) },
          ]);
          toast.success('Đã thêm kinh nghiệm mới!');
        }
        break;
      }

      case 'education': {
        if (data.id) {
          await updateEducation(data.id, {
            institution: data.institution,
            degree: data.degree,
            fieldOfStudy: data.fieldOfStudy || undefined,
            startDate: data.startDate,
            endDate: data.endDate || undefined,
            isCurrent: data.isCurrent,
            gpa: data.gpa || undefined,
            description: data.description || undefined,
          });
          setEducation(prev =>
            prev.map(item => (item.id === data.id ? { ...item, ...data } : item))
          );
          toast.success('Đã cập nhật học vấn!');
        } else {
          await createEducation({
            institution: data.institution,
            degree: data.degree,
            fieldOfStudy: data.fieldOfStudy || undefined,
            startDate: data.startDate,
            endDate: data.endDate || undefined,
            isCurrent: data.isCurrent,
            gpa: data.gpa || undefined,
            description: data.description || undefined,
          });
          setEducation(prev => [
            ...prev,
            { ...data, id: `temp-${Date.now()}`, startDate: new Date(data.startDate) },
          ]);
          toast.success('Đã thêm học vấn mới!');
        }
        break;
      }

      case 'achievement': {
        if (data.id) {
          await updateAchievement(data.id, {
            title: data.title,
            description: data.description || undefined,
            date: data.date || undefined,
            category: data.category || undefined,
          });
          setAchievements(prev =>
            prev.map(item => (item.id === data.id ? { ...item, ...data } : item))
          );
          toast.success('Đã cập nhật thành tích!');
        } else {
          await createAchievement({
            title: data.title,
            description: data.description || undefined,
            date: data.date || undefined,
            category: data.category || undefined,
          });
          setAchievements(prev => [
            ...prev,
            { ...data, id: `temp-${Date.now()}`, date: data.date ? new Date(data.date) : null },
          ]);
          toast.success('Đã thêm thành tích mới!');
        }
        break;
      }

      case 'language': {
        if (data.id) {
          await updateSpokenLanguage(data.id, {
            language: data.language,
            level: data.level,
          });
          setSpokenLanguages(prev =>
            prev.map(item => (item.id === data.id ? { ...item, ...data } : item))
          );
          toast.success('Đã cập nhật ngoại ngữ!');
        } else {
          await createSpokenLanguage({
            language: data.language,
            level: data.level,
          });
          setSpokenLanguages(prev => [...prev, { ...data, id: `temp-${Date.now()}` }]);
          toast.success('Đã thêm ngoại ngữ mới!');
        }
        break;
      }

      case 'activity': {
        if (data.id) {
          await updateActivity(data.id, {
            title: data.title,
            description: data.description || undefined,
            type: data.type || undefined,
            startDate: data.startDate || undefined,
            endDate: data.endDate || undefined,
          });
          setActivities(prev =>
            prev.map(item => (item.id === data.id ? { ...item, ...data } : item))
          );
          toast.success('Đã cập nhật hoạt động!');
        } else {
          await createActivity({
            title: data.title,
            description: data.description || undefined,
            type: data.type || undefined,
            startDate: data.startDate || undefined,
            endDate: data.endDate || undefined,
          });
          setActivities(prev => [...prev, { ...data, id: `temp-${Date.now()}` }]);
          toast.success('Đã thêm hoạt động mới!');
        }
        break;
      }

      case 'skill': {
        await createSkill({
          name: data.name,
          category: data.category,
          level: data.level || 80,
          order: 0,
        });
        setSkillsByCategory(prev => {
          const cat = data.category;
          const current = prev[cat] || [];
          return {
            ...prev,
            [cat]: [...current, { id: `temp-${Date.now()}`, name: data.name, level: data.level }],
          };
        });
        toast.success(`Đã thêm kỹ năng ${data.name}!`);
        break;
      }

      case 'social': {
        await upsertSocialLink(data.platform, data.url, data.iconName);
        setSocialLinks(prev => {
          const idx = prev.findIndex(s => s.platform.toLowerCase() === data.platform.toLowerCase());
          if (idx >= 0) {
            const updated = [...prev];
            updated[idx] = { ...updated[idx], ...data };
            return updated;
          }
          return [...prev, { id: `temp-${Date.now()}`, ...data }];
        });
        toast.success(`Đã lưu liên kết ${data.platform}!`);
        break;
      }
    }
  };

  // ── Item Actions: Delete ───────────────────────────────────
  const handleDeleteItem = async (type: ItemType, id: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa mục này?')) return;

    try {
      switch (type) {
        case 'experience':
          if (!id.startsWith('temp-')) await deleteExperience(id);
          setExperiences(prev => prev.filter(e => e.id !== id));
          break;
        case 'education':
          if (!id.startsWith('temp-')) await deleteEducation(id);
          setEducation(prev => prev.filter(e => e.id !== id));
          break;
        case 'achievement':
          if (!id.startsWith('temp-')) await deleteAchievement(id);
          setAchievements(prev => prev.filter(a => a.id !== id));
          break;
        case 'language':
          if (!id.startsWith('temp-')) await deleteSpokenLanguage(id);
          setSpokenLanguages(prev => prev.filter(l => l.id !== id));
          break;
        case 'activity':
          if (!id.startsWith('temp-')) await deleteActivity(id);
          setActivities(prev => prev.filter(a => a.id !== id));
          break;
        case 'social':
          setSocialLinks(prev => prev.filter(s => s.id !== id));
          break;
      }
      toast.success('Đã xóa thành công!');
    } catch (err) {
      console.error('Delete item failed:', err);
      toast.error('Không thể xóa mục này.');
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
      item: { category, level: 80 },
    });
  };

  const handleDeleteSkill = async (id: string) => {
    if (!window.confirm('Xóa kỹ năng này khỏi CV?')) return;
    try {
      if (!id.startsWith('temp-')) {
        await deleteSkill(id);
      }
      setSkillsByCategory(prev => {
        const next: Record<string, any[]> = {};
        for (const [cat, skills] of Object.entries(prev)) {
          next[cat] = skills.filter(s => s.id !== id);
        }
        return next;
      });
      toast.success('Đã xóa kỹ năng!');
    } catch (err) {
      console.error('Failed to delete skill:', err);
      toast.error('Không thể xóa kỹ năng.');
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
    </div>
  );
}
