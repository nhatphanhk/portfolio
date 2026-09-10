'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  previewTranslateProfileAction,
  saveProfileTranslationAction,
  getProfileTranslations,
  previewTranslateExperienceAction,
  saveExperienceTranslationAction,
  getExperienceTranslations,
} from '@/lib/actions/about';
import { Sparkles, Languages, CheckCircle2, Loader2, Briefcase, UserCheck } from 'lucide-react';

interface ResumeTranslateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: any;
  experiences: any[];
  onSuccess?: () => void;
}

export function ResumeTranslateDialog({
  open,
  onOpenChange,
  profile,
  experiences,
  onSuccess,
}: ResumeTranslateDialogProps) {
  const [activeTab, setActiveTab] = useState<'profile' | 'experiences'>('profile');

  // Profile translation states
  const [isTranslatingProfile, setIsTranslatingProfile] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [hasProfileTrans, setHasProfileTrans] = useState(false);
  const [profileTrans, setProfileTrans] = useState({
    title: '',
    tagline: '',
    bio: '',
    careerObjective: '',
    softSkills: '',
  });

  // Experiences translation states
  const [translatingExpId, setTranslatingExpId] = useState<string | null>(null);
  const [savingExpId, setSavingExpId] = useState<string | null>(null);
  const [expTranslations, setExpTranslations] = useState<Record<string, { position: string; description: string; achievements: string }>>({});
  const [savedExpIds, setSavedExpIds] = useState<Set<string>>(new Set());

  // Load existing translations on open
  useEffect(() => {
    if (!open) return;

    if (profile?.id) {
      getProfileTranslations(profile.id).then(list => {
        const en = list.find(t => t.locale === 'en');
        if (en) {
          setHasProfileTrans(true);
          setProfileTrans({
            title: en.title || profile.title || '',
            tagline: profile.tagline || '',
            bio: en.description || profile.bio || '',
            careerObjective: en.content || profile.careerObjective || '',
            softSkills: en.excerpt || profile.softSkills || '',
          });
        } else {
          setHasProfileTrans(false);
          setProfileTrans({
            title: profile.title || '',
            tagline: profile.tagline || '',
            bio: profile.bio || '',
            careerObjective: profile.careerObjective || '',
            softSkills: profile.softSkills || '',
          });
        }
      });
    }

    if (experiences?.length) {
      Promise.all(
        experiences.map(async exp => {
          const trans = await getExperienceTranslations(exp.id);
          const en = trans.find(t => t.locale === 'en');
          return { expId: exp.id, en };
        })
      ).then(results => {
        const saved = new Set<string>();
        const transMap: Record<string, any> = {};
        for (const res of results) {
          if (res.en) {
            saved.add(res.expId);
            transMap[res.expId] = {
              position: res.en.title || '',
              description: res.en.description || '',
              achievements: res.en.content || '',
            };
          }
        }
        setSavedExpIds(saved);
        setExpTranslations(prev => ({ ...prev, ...transMap }));
      });
    }
  }, [open, profile, experiences]);

  const handleTranslateProfile = async () => {
    if (!profile?.id) {
      toast.error('Vui lòng lưu hồ sơ cá nhân trước khi dịch.');
      return;
    }
    setIsTranslatingProfile(true);
    try {
      const res = await previewTranslateProfileAction(profile.id, 'en', {
        title: profile.title,
        tagline: profile.tagline,
        bio: profile.bio,
        careerObjective: profile.careerObjective,
        softSkills: profile.softSkills,
      });
      if (res.ok && res.data) {
        setProfileTrans(res.data);
        toast.success('Bản dịch AI cho Hồ sơ cá nhân đã tạo xong! Xem trước và bấm Lưu.');
      } else {
        toast.error(res.error || 'Dịch hồ sơ thất bại');
      }
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi dịch hồ sơ');
    } finally {
      setIsTranslatingProfile(false);
    }
  };

  const handleSaveProfileTranslation = async () => {
    if (!profile?.id) return;
    setIsSavingProfile(true);
    try {
      const res = await saveProfileTranslationAction(profile.id, profileTrans, 'en');
      if (res.ok) {
        setHasProfileTrans(true);
        toast.success('Đã lưu bản dịch Hồ sơ cá nhân (EN)!');
        onSuccess?.();
      } else {
        toast.error(res.error || 'Lỗi khi lưu bản dịch hồ sơ');
      }
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi lưu bản dịch');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleTranslateExperience = async (exp: any) => {
    setTranslatingExpId(exp.id);
    try {
      const res = await previewTranslateExperienceAction(exp.id, 'en', {
        position: exp.position,
        description: exp.description,
        achievements: exp.achievements,
      });
      if (res.ok && res.data) {
        setExpTranslations(prev => ({
          ...prev,
          [exp.id]: res.data,
        }));
        toast.success(`Đã dịch kinh nghiệm tại ${exp.company}!`);
      } else {
        toast.error(res.error || 'Dịch kinh nghiệm thất bại');
      }
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi dịch kinh nghiệm');
    } finally {
      setTranslatingExpId(null);
    }
  };

  const handleSaveExperienceTranslation = async (expId: string) => {
    const data = expTranslations[expId];
    if (!data) return;
    setSavingExpId(expId);
    try {
      const res = await saveExperienceTranslationAction(expId, data, 'en');
      if (res.ok) {
        setSavedExpIds(prev => new Set(prev).add(expId));
        toast.success('Đã lưu bản dịch kinh nghiệm (EN)!');
        onSuccess?.();
      } else {
        toast.error(res.error || 'Lỗi khi lưu bản dịch kinh nghiệm');
      }
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi lưu bản dịch');
    } finally {
      setSavingExpId(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Languages className="w-5 h-5 text-primary" />
            <DialogTitle>Quản lý Chuyển ngữ CV / Resume (Tiếng Anh)</DialogTitle>
          </div>
        </DialogHeader>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 border-b border-border pb-2 pt-1">
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'profile'
                ? 'bg-primary text-primary-foreground shadow-xs'
                : 'text-muted-foreground hover:bg-muted'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Hồ sơ & Tóm tắt</span>
            {hasProfileTrans && <span className="w-2 h-2 rounded-full bg-green-500" />}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('experiences')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'experiences'
                ? 'bg-primary text-primary-foreground shadow-xs'
                : 'text-muted-foreground hover:bg-muted'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Kinh nghiệm làm việc ({savedExpIds.size}/{experiences?.length || 0})</span>
          </button>
        </div>

        {/* Tab Content: Profile */}
        {activeTab === 'profile' && (
          <div className="space-y-4 py-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-semibold text-foreground">Bản dịch Hồ sơ (Headline, Bio, Mục tiêu)</h4>
                <p className="text-xs text-muted-foreground">
                  {hasProfileTrans ? '✓ Đã có bản dịch trong cơ sở dữ liệu' : 'Chưa có bản dịch Tiếng Anh'}
                </p>
              </div>

              <Button
                type="button"
                size="sm"
                disabled={isTranslatingProfile}
                onClick={handleTranslateProfile}
                className="gap-1.5 text-xs font-bold"
              >
                {isTranslatingProfile ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Đang dịch...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{hasProfileTrans ? 'Dịch lại AI (EN)' : 'Dịch AI (EN)'}</span>
                  </>
                )}
              </Button>
            </div>

            <div className="space-y-3 pt-2">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Chức danh / Headline (EN)</label>
                <input
                  type="text"
                  value={profileTrans.title}
                  onChange={e => setProfileTrans({ ...profileTrans, title: e.target.value })}
                  placeholder="Senior Full Stack Software Engineer"
                  className="w-full px-3 py-2 rounded-lg border border-border bg-card text-foreground text-sm shadow-xs focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Tóm tắt / Professional Bio (EN)</label>
                <textarea
                  rows={3}
                  value={profileTrans.bio}
                  onChange={e => setProfileTrans({ ...profileTrans, bio: e.target.value })}
                  placeholder="Professional Summary..."
                  className="w-full px-3 py-2 rounded-lg border border-border bg-card text-foreground text-sm shadow-xs focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Mục tiêu nghề nghiệp / Career Objective (EN)</label>
                <textarea
                  rows={2}
                  value={profileTrans.careerObjective}
                  onChange={e => setProfileTrans({ ...profileTrans, careerObjective: e.target.value })}
                  placeholder="Career Objective..."
                  className="w-full px-3 py-2 rounded-lg border border-border bg-card text-foreground text-sm shadow-xs focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Kỹ năng mềm / Core Competencies (EN)</label>
                <input
                  type="text"
                  value={profileTrans.softSkills}
                  onChange={e => setProfileTrans({ ...profileTrans, softSkills: e.target.value })}
                  placeholder="Problem-solving, Leadership, Agile, Communication"
                  className="w-full px-3 py-2 rounded-lg border border-border bg-card text-foreground text-sm shadow-xs focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  type="button"
                  disabled={isSavingProfile || !profileTrans.title}
                  onClick={handleSaveProfileTranslation}
                  className="gap-1.5 text-xs font-bold bg-green-600 hover:bg-green-700 text-white"
                >
                  {isSavingProfile ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                  <span>Lưu bản dịch Hồ sơ EN</span>
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Tab Content: Experiences */}
        {activeTab === 'experiences' && (
          <div className="space-y-4 py-3">
            <p className="text-xs text-muted-foreground">
              Dịch chức danh, mô tả công việc và danh sách thành tích của từng vị trí làm việc sang Tiếng Anh.
            </p>

            <div className="space-y-4">
              {experiences?.map(exp => {
                const isSaved = savedExpIds.has(exp.id);
                const isTranslating = translatingExpId === exp.id;
                const isSaving = savingExpId === exp.id;
                const currentTrans = expTranslations[exp.id] || {
                  position: exp.position,
                  description: exp.description || '',
                  achievements: exp.achievements || '',
                };

                return (
                  <div key={exp.id} className="p-4 rounded-xl border border-border bg-card space-y-3 shadow-xs">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-primary">{exp.company}</span>
                        <h5 className="text-sm font-semibold text-foreground">{exp.position}</h5>
                      </div>

                      <div className="flex items-center gap-2">
                        {isSaved && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20">
                            <CheckCircle2 className="w-3 h-3" /> Đã dịch EN
                          </span>
                        )}

                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          disabled={isTranslating}
                          onClick={() => handleTranslateExperience(exp)}
                          className="h-7 text-[11px] gap-1"
                        >
                          {isTranslating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                          <span>{isSaved ? 'Dịch lại' : 'Dịch AI'}</span>
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2 pt-1">
                      <div>
                        <label className="block text-[11px] font-semibold text-foreground mb-0.5">Vị trí (EN)</label>
                        <input
                          type="text"
                          value={currentTrans.position}
                          onChange={e =>
                            setExpTranslations(prev => ({
                              ...prev,
                              [exp.id]: { ...currentTrans, position: e.target.value },
                            }))
                          }
                          className="w-full px-2.5 py-1.5 rounded-md border border-border bg-background text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-foreground mb-0.5">Mô tả (EN)</label>
                        <textarea
                          rows={2}
                          value={currentTrans.description}
                          onChange={e =>
                            setExpTranslations(prev => ({
                              ...prev,
                              [exp.id]: { ...currentTrans, description: e.target.value },
                            }))
                          }
                          className="w-full px-2.5 py-1.5 rounded-md border border-border bg-background text-xs resize-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-foreground mb-0.5">Thành tích / Achievements (EN)</label>
                        <textarea
                          rows={2}
                          value={currentTrans.achievements}
                          onChange={e =>
                            setExpTranslations(prev => ({
                              ...prev,
                              [exp.id]: { ...currentTrans, achievements: e.target.value },
                            }))
                          }
                          className="w-full px-2.5 py-1.5 rounded-md border border-border bg-background text-xs resize-none"
                        />
                      </div>

                      <div className="flex justify-end pt-1">
                        <Button
                          type="button"
                          size="sm"
                          disabled={isSaving}
                          onClick={() => handleSaveExperienceTranslation(exp.id)}
                          className="h-7 text-[11px] font-bold bg-green-600 hover:bg-green-700 text-white gap-1"
                        >
                          {isSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}
                          <span>Lưu bản dịch vị trí này</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
