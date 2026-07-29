'use client';

import { useState, useTransition } from 'react';
import {
  UserRound, Briefcase, GraduationCap, Trophy, Globe2,
  Activity, Info, Cpu, FileText, Plus, Pencil, Trash2,
  Save, X, Loader2, CheckCircle2,
  MapPin, Mail, Phone, Link as LinkIcon, Github, Linkedin, Eye,
  GripVertical, LayoutGrid, ArrowUp, ArrowDown,
} from 'lucide-react';
import { ResumeCard3D } from '@/components/ui/ResumeCard3D';

import {
  updateProfile, upsertSocialLink,
  createExperience, updateExperience, deleteExperience,
  createEducation, updateEducation, deleteEducation,
  createAchievement, updateAchievement, deleteAchievement,
  createSpokenLanguage, updateSpokenLanguage, deleteSpokenLanguage,
  createActivity, updateActivity, deleteActivity,
} from '@/lib/actions/about';

import type {
  ProfileFormData, ExperienceFormData, EducationFormData,
  AchievementFormData, SpokenLanguageFormData, ActivityFormData,
} from '@/lib/actions/about';

// ─── Types ────────────────────────────────────────────────────────────────────
type Profile = { id: string | null; name: string; handle: string; title: string; tagline: string; bio: string; bio2: string; careerObjective: string | null; location: string; email: string; phone: string | null; resumeUrl: string; avatarUrl: string; softSkills: string | null; interests: string | null; fromDb: boolean; };
type Experience = { id: string; company: string; position: string; description: string | null; achievements: string | null; techStack: string | null; startDate: Date; endDate: Date | null; isCurrent: boolean; };
type Education = { id: string; institution: string; degree: string; fieldOfStudy: string | null; startDate: Date; endDate: Date | null; isCurrent: boolean; gpa: string | null; description: string | null; };
type Achievement = { id: string; title: string; description: string | null; date: Date | null; category: string | null; };
type SpokenLanguage = { id: string; language: string; level: string; };
type Activity = { id: string; title: string; description: string | null; type: string | null; startDate: Date | null; endDate: Date | null; };
type SocialLink = { id: string; platform: string; url: string; iconName: string | null | undefined; };
type SkillsByCategory = Record<string, { id: string; name: string; level: number | null; }[]>;

interface Props {
  profile: Profile;
  experiences: Experience[];
  socialLinks: SocialLink[];
  education: Education[];
  achievements: Achievement[];
  spokenLanguages: SpokenLanguage[];
  activities: Activity[];
  skillsByCategory: SkillsByCategory;
}

// ─── UI Primitives ─────────────────────────────────────────────────────────────
function Field({ label, children, className = '' }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{label}</label>
      {children}
    </div>
  );
}

function Input({ value, onChange, placeholder, type = 'text', disabled }: {
  value: string; onChange: (v: string) => void; placeholder?: string; type?: string; disabled?: boolean;
}) {
  return (
    <input
      type={type}
      value={value ?? ''}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50 transition"
    />
  );
}

function Textarea({ value, onChange, placeholder, rows = 3 }: {
  value: string; onChange: (v: string) => void; placeholder?: string; rows?: number;
}) {
  return (
    <textarea
      rows={rows}
      value={value ?? ''}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-y transition"
    />
  );
}

function Select({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: string[]; }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)}
      className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition">
      <option value="">— Select —</option>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

function SaveBtn({ onClick, pending, label = 'Save' }: { onClick: () => void; pending: boolean; label?: string; }) {
  return (
    <button type="button" onClick={onClick} disabled={pending}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-xs font-medium hover:bg-primary/90 disabled:opacity-60 transition">
      {pending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}{label}
    </button>
  );
}

function CancelBtn({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-border rounded-lg text-xs font-medium hover:bg-muted transition">
      <X className="h-3 w-3" />Cancel
    </button>
  );
}

function AddBtn({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button type="button" onClick={onClick}
      className="inline-flex items-center gap-1.5 px-3 py-2 border border-dashed border-border rounded-lg text-sm text-muted-foreground hover:border-primary/50 hover:text-primary hover:bg-primary/5 transition w-full justify-center">
      <Plus className="h-4 w-4" />{label}
    </button>
  );
}

function DeleteBtn({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick}
      className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition">
      <Trash2 className="h-3.5 w-3.5" />
    </button>
  );
}

function SavedBadge({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <span className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400 animate-in fade-in">
      <CheckCircle2 className="h-3.5 w-3.5" />Saved!
    </span>
  );
}

function SectionCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`p-6 rounded-xl border border-border bg-card space-y-4 ${className}`}>{children}</div>;
}

function fmtDate(d: Date | null) {
  if (!d) return '';
  const dt = new Date(d);
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}`;
}

function dateToInput(d: Date | null | undefined) {
  if (!d) return '';
  return fmtDate(d);
}

const CATEGORY_LABELS: Record<string, string> = {
  LANGUAGE: 'Programming Languages', FRAMEWORK: 'Frameworks / Libraries',
  FRONTEND: 'Frontend', BACKEND: 'Backend', DATABASE: 'Databases',
  CLOUD: 'Cloud Platforms', DEVOPS: 'DevOps & CI/CD', IAC: 'Infrastructure as Code',
  MONITORING: 'Monitoring & Logging', VERSION_CONTROL: 'Version Control',
  TOOLS: 'Tools & Technologies', OTHER: 'Other',
};

const TABS = [
  { id: 'personal', label: 'Personal', icon: UserRound },
  { id: 'summary', label: 'Summary', icon: FileText },
  { id: 'skills', label: 'Skills', icon: Cpu },
  { id: 'experience', label: 'Experience', icon: Briefcase },
  { id: 'education', label: 'Education', icon: GraduationCap },
  { id: 'achievements', label: 'Achievements', icon: Trophy },
  { id: 'languages', label: 'Languages', icon: Globe2 },
  { id: 'activities', label: 'Activities', icon: Activity },
  { id: 'additional', label: 'Additional', icon: Info },
  { id: 'layout', label: 'Layout', icon: LayoutGrid },
];

// Section definitions for reordering
type SectionId = 'profile' | 'experience' | 'education' | 'skills' | 'achievements' | 'softSkills';
const DEFAULT_SECTION_ORDER: SectionId[] = ['profile', 'experience', 'education', 'skills', 'achievements', 'softSkills'];
const SECTION_LABELS: Record<SectionId, string> = {
  profile: 'Profile / Bio',
  experience: 'Work Experience',
  education: 'Education',
  skills: 'Technical Skills',
  achievements: 'Achievements',
  softSkills: 'Soft Skills',
};

// ─── Main Component ───────────────────────────────────────────────────────────
export function AdminResumeClient({ profile, experiences: initialExp, socialLinks, education: initialEdu,
  achievements: initialAch, spokenLanguages: initialLang, activities: initialAct, skillsByCategory }: Props) {

  const [activeTab, setActiveTab] = useState('personal');
  const [saved, setSaved] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [sectionOrder, setSectionOrder] = useState<SectionId[]>(DEFAULT_SECTION_ORDER);
  const [dragId, setDragId] = useState<SectionId | null>(null);
  const [dragOverId, setDragOverId] = useState<SectionId | null>(null);
  const isDragging = dragId !== null;

  function moveSection(id: SectionId, dir: -1 | 1) {
    setSectionOrder(prev => {
      const idx = prev.indexOf(id);
      const next = idx + dir;
      if (next < 0 || next >= prev.length) return prev;
      const arr = [...prev];
      [arr[idx], arr[next]] = [arr[next], arr[idx]];
      return arr;
    });
  }

  function handleDrop(targetId: SectionId) {
    if (!dragId || dragId === targetId) return;
    setSectionOrder(prev => {
      const from = prev.indexOf(dragId);
      const to = prev.indexOf(targetId);
      if (from === -1 || to === -1) return prev;
      const arr = [...prev];
      arr.splice(from, 1);
      arr.splice(to, 0, dragId);
      return arr;
    });
    setDragId(null);
    setDragOverId(null);
  }


  function showSaved(key: string) {
    setSaved(key);
    setTimeout(() => setSaved(null), 2500);
  }

  function withSave(key: string, fn: () => Promise<void>) {
    startTransition(async () => { await fn(); showSaved(key); });
  }

  // ── State ──────────────────────────────────────────────────────────────────
  const [pForm, setPForm] = useState<ProfileFormData>({
    name: profile.name, handle: profile.handle, title: profile.title,
    tagline: profile.tagline, bio: profile.bio, bio2: profile.bio2,
    careerObjective: profile.careerObjective ?? '',
    location: profile.location, email: profile.email, phone: profile.phone ?? '',
    resumeUrl: profile.resumeUrl, avatarUrl: profile.avatarUrl,
    softSkills: profile.softSkills ?? '', interests: profile.interests ?? '',
  });

  const SOCIAL_DEFAULTS = ['GitHub', 'LinkedIn', 'Portfolio'];
  const [socialForm, setSocialForm] = useState<Record<string, string>>(
    Object.fromEntries([
      ...SOCIAL_DEFAULTS.map(p => [p, '']),
      ...socialLinks.map(l => [l.platform, l.url]),
    ])
  );

  const [experiences, setExperiences] = useState(initialExp);
  const [education, setEducation] = useState(initialEdu);
  const [achievements, setAchievements] = useState(initialAch);
  const [spokenLanguages, setSpokenLanguages] = useState(initialLang);
  const [activities, setActivities] = useState(initialAct);

  // ── CRUD state helpers ─────────────────────────────────────────────────────
  const [editExpId, setEditExpId] = useState<string | null>(null);
  const [addingExp, setAddingExp] = useState(false);
  const [editEduId, setEditEduId] = useState<string | null>(null);
  const [addingEdu, setAddingEdu] = useState(false);
  const [editAchId, setEditAchId] = useState<string | null>(null);
  const [addingAch, setAddingAch] = useState(false);
  const [editLangId, setEditLangId] = useState<string | null>(null);
  const [addingLang, setAddingLang] = useState(false);
  const [editActId, setEditActId] = useState<string | null>(null);
  const [addingAct, setAddingAct] = useState(false);

  // blank forms
  const blankExp = (): ExperienceFormData => ({ company: '', position: '', description: '', achievements: '', techStack: '', startDate: '', endDate: '', isCurrent: false });
  const blankEdu = (): EducationFormData => ({ institution: '', degree: '', fieldOfStudy: '', startDate: '', endDate: '', isCurrent: false, gpa: '', description: '' });
  const blankAch = (): AchievementFormData => ({ title: '', description: '', date: '', category: '' });
  const blankLang = (): SpokenLanguageFormData => ({ language: '', level: '' });
  const blankAct = (): ActivityFormData => ({ title: '', description: '', type: '', startDate: '', endDate: '' });

  const [expForm, setExpForm] = useState<ExperienceFormData>(blankExp());
  const [eduForm, setEduForm] = useState<EducationFormData>(blankEdu());
  const [achForm, setAchForm] = useState<AchievementFormData>(blankAch());
  const [langForm, setLangForm] = useState<SpokenLanguageFormData>(blankLang());
  const [actForm, setActForm] = useState<ActivityFormData>(blankAct());

  // ── Tab: Personal Info ─────────────────────────────────────────────────────
  function TabPersonal() {
    return (
      <div className="space-y-4">
        <SectionCard>
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Personal Information</h2>
            <div className="flex items-center gap-2">
              <SavedBadge show={saved === 'personal'} />
              <SaveBtn label="Save Personal Info" pending={isPending} onClick={() => withSave('personal', async () => {
                await updateProfile(pForm);
                const allLinks = Object.entries(socialForm);
                for (const [platform, url] of allLinks) {
                  if (url) {
                    const link = socialLinks.find(l => l.platform === platform);
                    await upsertSocialLink(platform, url, link?.iconName ?? undefined);
                  }
                }
              })} />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Full Name">
              <div className="flex items-center gap-2"><UserRound className="h-4 w-4 text-muted-foreground shrink-0" />
                <Input value={pForm.name ?? ''} onChange={v => setPForm(p => ({ ...p, name: v }))} placeholder="Nguyen Van A" />
              </div>
            </Field>
            <Field label="Handle / Username">
              <Input value={pForm.handle ?? ''} onChange={v => setPForm(p => ({ ...p, handle: v }))} placeholder="nguyenvana" />
            </Field>
            <Field label="Phone Number">
              <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                <Input value={pForm.phone ?? ''} onChange={v => setPForm(p => ({ ...p, phone: v }))} placeholder="+84 123 456 789" type="tel" />
              </div>
            </Field>
            <Field label="Email">
              <div className="flex items-center gap-2"><Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                <Input value={pForm.email ?? ''} onChange={v => setPForm(p => ({ ...p, email: v }))} placeholder="you@example.com" type="email" />
              </div>
            </Field>
            <Field label="Location">
              <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                <Input value={pForm.location ?? ''} onChange={v => setPForm(p => ({ ...p, location: v }))} placeholder="Ho Chi Minh City, Vietnam" />
              </div>
            </Field>
            <Field label="Resume / CV URL">
              <div className="flex items-center gap-2"><LinkIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                <Input value={pForm.resumeUrl ?? ''} onChange={v => setPForm(p => ({ ...p, resumeUrl: v }))} placeholder="/resume.pdf" />
              </div>
            </Field>
          </div>
        </SectionCard>

        <SectionCard>
          <h2 className="font-semibold">Social & Online Presence</h2>
          <div className="space-y-3">
            {SOCIAL_DEFAULTS.map(platform => {
              const icon = platform === 'GitHub' ? <Github className="h-4 w-4 text-muted-foreground shrink-0" />
                : platform === 'LinkedIn' ? <Linkedin className="h-4 w-4 text-muted-foreground shrink-0" />
                : <Globe2 className="h-4 w-4 text-muted-foreground shrink-0" />;
              return (
                <Field key={platform} label={platform}>
                  <div className="flex items-center gap-2">{icon}
                    <Input value={socialForm[platform] ?? ''} onChange={v => setSocialForm(p => ({ ...p, [platform]: v }))} placeholder={`https://${platform.toLowerCase()}.com/...`} />
                  </div>
                </Field>
              );
            })}
            {/* Other social links */}
            {socialLinks.filter(l => !SOCIAL_DEFAULTS.includes(l.platform)).map(link => (
              <Field key={link.platform} label={link.platform}>
                <div className="flex items-center gap-2"><Globe2 className="h-4 w-4 text-muted-foreground shrink-0" />
                  <Input value={socialForm[link.platform] ?? ''} onChange={v => setSocialForm(p => ({ ...p, [link.platform]: v }))} placeholder={`https://...`} />
                </div>
              </Field>
            ))}
          </div>
        </SectionCard>
      </div>
    );
  }

  // ── Tab: Professional Summary ──────────────────────────────────────────────
  function TabSummary() {
    return (
      <div className="space-y-4">
        <SectionCard>
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Professional Summary</h2>
            <div className="flex items-center gap-2">
              <SavedBadge show={saved === 'summary'} />
              <SaveBtn label="Save Summary" pending={isPending} onClick={() => withSave('summary', async () => { await updateProfile(pForm); })} />
            </div>
          </div>

          <Field label="Current Role / Title">
            <Input value={pForm.title ?? ''} onChange={v => setPForm(p => ({ ...p, title: v }))} placeholder="Full-Stack Developer" />
          </Field>
          <Field label="Tagline (1 sentence)">
            <Input value={pForm.tagline ?? ''} onChange={v => setPForm(p => ({ ...p, tagline: v }))} placeholder="Building modern web experiences with clean code and great UX." />
          </Field>
          <Field label="Professional Bio (3–5 lines — main paragraph)">
            <Textarea rows={5} value={pForm.bio ?? ''} onChange={v => setPForm(p => ({ ...p, bio: v }))} placeholder="Briefly introduce yourself, your expertise, notable achievements, and what makes you stand out..." />
          </Field>
          <Field label="Bio — Second Paragraph (optional)">
            <Textarea rows={3} value={pForm.bio2 ?? ''} onChange={v => setPForm(p => ({ ...p, bio2: v }))} placeholder="Additional context, personal interests related to work, etc." />
          </Field>
          <Field label="Career Objective / Goal">
            <Textarea rows={3} value={pForm.careerObjective ?? ''} onChange={v => setPForm(p => ({ ...p, careerObjective: v }))} placeholder="Seeking a Senior Developer role where I can leverage my expertise in cloud architecture and full-stack development to build scalable products..." />
          </Field>
        </SectionCard>
      </div>
    );
  }

  // ── Tab: Technical Skills ──────────────────────────────────────────────────
  function TabSkills() {
    const cats = Object.keys(skillsByCategory);
    return (
      <div className="space-y-4">
        <SectionCard>
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Technical Skills</h2>
            <a href="/admin/skills" className="text-xs text-primary hover:underline">Manage Skills →</a>
          </div>
          <p className="text-xs text-muted-foreground">Skills are grouped by category. To add, edit, or delete skills, go to the Skills management page.</p>
          {cats.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Cpu className="h-10 w-10 mx-auto mb-2 opacity-30" />
              <p>No skills yet. <a href="/admin/skills" className="text-primary underline">Add your first skill.</a></p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {cats.map(cat => (
                <div key={cat} className="p-4 rounded-lg border border-border bg-muted/30">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                    {CATEGORY_LABELS[cat] ?? cat}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {skillsByCategory[cat].map(s => (
                      <span key={s.id} className="px-2 py-0.5 text-xs bg-background border border-border rounded-md text-foreground">
                        {s.name}{s.level ? ` (${s.level}/5)` : ''}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </div>
    );
  }

  // ── Tab: Work Experience ───────────────────────────────────────────────────
  function ExperienceForm({ data, onSave, onCancel }: {
    data: ExperienceFormData;
    onSave: (d: ExperienceFormData) => void;
    onCancel: () => void;
  }) {
    const [f, setF] = useState<ExperienceFormData>(data);
    const [p, start] = useTransition();
    return (
      <div className="border border-primary/30 rounded-xl p-4 space-y-3 bg-primary/5">
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="Job Title / Position">
            <Input value={f.position} onChange={v => setF(x => ({ ...x, position: v }))} placeholder="Senior Full-Stack Developer" />
          </Field>
          <Field label="Company">
            <Input value={f.company} onChange={v => setF(x => ({ ...x, company: v }))} placeholder="Company Name" />
          </Field>
          <Field label="Start Date (YYYY-MM)">
            <Input value={f.startDate} onChange={v => setF(x => ({ ...x, startDate: v }))} placeholder="2022-01" type="month" />
          </Field>
          <Field label="End Date (leave empty if current)">
            <div className="flex items-center gap-2">
              <Input value={f.endDate ?? ''} onChange={v => setF(x => ({ ...x, endDate: v }))} placeholder="2024-06" type="month" disabled={f.isCurrent} />
              <label className="flex items-center gap-1 text-xs text-muted-foreground whitespace-nowrap cursor-pointer">
                <input type="checkbox" checked={f.isCurrent} onChange={e => setF(x => ({ ...x, isCurrent: e.target.checked, endDate: e.target.checked ? '' : x.endDate }))} />
                Current
              </label>
            </div>
          </Field>
        </div>
        <Field label="Description / Responsibilities">
          <Textarea rows={3} value={f.description ?? ''} onChange={v => setF(x => ({ ...x, description: v }))} placeholder="Led development of... Built... Managed..." />
        </Field>
        <Field label="Key Achievements (one per line, use numbers when possible)">
          <Textarea rows={4} value={f.achievements ?? ''} onChange={v => setF(x => ({ ...x, achievements: v }))} placeholder={"Reduced load time by 40% by optimizing database queries\nLed a team of 5 engineers to ship feature X on time\nIncreased test coverage from 30% to 85%"} />
        </Field>
        <Field label="Tech Stack Used (comma-separated)">
          <Input value={f.techStack ?? ''} onChange={v => setF(x => ({ ...x, techStack: v }))} placeholder="React, Node.js, PostgreSQL, AWS, Docker" />
        </Field>
        <div className="flex gap-2 pt-1">
          <SaveBtn pending={p} onClick={() => start(async () => { await onSave(f); })} />
          <CancelBtn onClick={onCancel} />
        </div>
      </div>
    );
  }

  function TabExperience() {
    return (
      <div className="space-y-4">
        <SectionCard>
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Work Experience ({experiences.length})</h2>
            <SavedBadge show={saved === 'exp'} />
          </div>
          <div className="space-y-3">
            {experiences.map(exp => (
              editExpId === exp.id ? (
                <ExperienceForm key={exp.id}
                  data={{ company: exp.company, position: exp.position, description: exp.description ?? '', achievements: exp.achievements ?? '', techStack: exp.techStack ?? '', startDate: dateToInput(exp.startDate), endDate: dateToInput(exp.endDate), isCurrent: exp.isCurrent }}
                  onSave={async (d) => { await updateExperience(exp.id, d); setExperiences(prev => prev.map(e => e.id === exp.id ? { ...e, ...d, startDate: new Date(d.startDate), endDate: d.endDate ? new Date(d.endDate) : null } : e)); setEditExpId(null); showSaved('exp'); }}
                  onCancel={() => setEditExpId(null)} />
              ) : (
                <div key={exp.id} className="p-4 rounded-xl border border-border bg-card">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-foreground">{exp.position}</p>
                        {exp.isCurrent && <span className="px-1.5 py-0.5 text-xs bg-green-500/10 text-green-600 dark:text-green-400 rounded">Current</span>}
                      </div>
                      <p className="text-sm text-muted-foreground">{exp.company}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{fmtDate(exp.startDate)} — {exp.isCurrent ? 'Present' : fmtDate(exp.endDate)}</p>
                      {exp.description && <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{exp.description}</p>}
                      {exp.techStack && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {exp.techStack.split(',').map(t => t.trim()).filter(Boolean).slice(0, 6).map(t => (
                            <span key={t} className="px-1.5 py-0.5 text-xs bg-muted rounded border border-border text-muted-foreground">{t}</span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <button type="button" onClick={() => setEditExpId(exp.id)} className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition"><Pencil className="h-3.5 w-3.5" /></button>
                      <DeleteBtn onClick={() => startTransition(async () => { await deleteExperience(exp.id); setExperiences(prev => prev.filter(e => e.id !== exp.id)); showSaved('exp'); })} />
                    </div>
                  </div>
                </div>
              )
            ))}

            {addingExp ? (
              <ExperienceForm data={expForm}
                onSave={async (d) => { await createExperience(d); setExperiences(prev => [...prev, { id: Date.now().toString(), ...d, startDate: new Date(d.startDate), endDate: d.endDate ? new Date(d.endDate) : null, description: d.description ?? null, achievements: d.achievements ?? null, techStack: d.techStack ?? null, logoUrl: null, order: prev.length, createdAt: new Date(), updatedAt: new Date() }]); setAddingExp(false); setExpForm(blankExp()); showSaved('exp'); }}
                onCancel={() => { setAddingExp(false); setExpForm(blankExp()); }} />
            ) : (
              <AddBtn label="Add Work Experience" onClick={() => { setAddingExp(true); setEditExpId(null); }} />
            )}
          </div>
        </SectionCard>
      </div>
    );
  }

  // ── Tab: Education ─────────────────────────────────────────────────────────
  function EduForm({ data, onSave, onCancel }: { data: EducationFormData; onSave: (d: EducationFormData) => void; onCancel: () => void; }) {
    const [f, setF] = useState<EducationFormData>(data);
    const [p, start] = useTransition();
    return (
      <div className="border border-primary/30 rounded-xl p-4 space-y-3 bg-primary/5">
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="Institution / School" className="sm:col-span-2">
            <Input value={f.institution} onChange={v => setF(x => ({ ...x, institution: v }))} placeholder="University of Technology" />
          </Field>
          <Field label="Degree">
            <Input value={f.degree} onChange={v => setF(x => ({ ...x, degree: v }))} placeholder="Bachelor of Science" />
          </Field>
          <Field label="Field of Study">
            <Input value={f.fieldOfStudy ?? ''} onChange={v => setF(x => ({ ...x, fieldOfStudy: v }))} placeholder="Computer Science" />
          </Field>
          <Field label="Start Date">
            <Input value={f.startDate} onChange={v => setF(x => ({ ...x, startDate: v }))} type="month" placeholder="2018-09" />
          </Field>
          <Field label="End Date">
            <div className="flex items-center gap-2">
              <Input value={f.endDate ?? ''} onChange={v => setF(x => ({ ...x, endDate: v }))} type="month" placeholder="2022-06" disabled={f.isCurrent} />
              <label className="flex items-center gap-1 text-xs text-muted-foreground whitespace-nowrap cursor-pointer">
                <input type="checkbox" checked={f.isCurrent} onChange={e => setF(x => ({ ...x, isCurrent: e.target.checked, endDate: e.target.checked ? '' : x.endDate }))} />Current
              </label>
            </div>
          </Field>
          <Field label="GPA (optional)">
            <Input value={f.gpa ?? ''} onChange={v => setF(x => ({ ...x, gpa: v }))} placeholder="3.8/4.0" />
          </Field>
        </div>
        <Field label="Description (honors, thesis, activities...)">
          <Textarea value={f.description ?? ''} onChange={v => setF(x => ({ ...x, description: v }))} placeholder="Dean's List, thesis on distributed systems..." />
        </Field>
        <div className="flex gap-2 pt-1">
          <SaveBtn pending={p} onClick={() => start(async () => { await onSave(f); })} />
          <CancelBtn onClick={onCancel} />
        </div>
      </div>
    );
  }

  function TabEducation() {
    return (
      <div className="space-y-4">
        <SectionCard>
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Education ({education.length})</h2>
            <SavedBadge show={saved === 'edu'} />
          </div>
          <div className="space-y-3">
            {education.map(edu => (
              editEduId === edu.id ? (
                <EduForm key={edu.id}
                  data={{ institution: edu.institution, degree: edu.degree, fieldOfStudy: edu.fieldOfStudy ?? '', startDate: dateToInput(edu.startDate), endDate: dateToInput(edu.endDate), isCurrent: edu.isCurrent, gpa: edu.gpa ?? '', description: edu.description ?? '' }}
                  onSave={async (d) => { await updateEducation(edu.id, d); setEducation(prev => prev.map(e => e.id === edu.id ? { ...e, ...d, startDate: new Date(d.startDate), endDate: d.endDate ? new Date(d.endDate) : null } : e)); setEditEduId(null); showSaved('edu'); }}
                  onCancel={() => setEditEduId(null)} />
              ) : (
                <div key={edu.id} className="p-4 rounded-xl border border-border bg-card">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-foreground">{edu.degree}{edu.fieldOfStudy ? ` — ${edu.fieldOfStudy}` : ''}</p>
                      <p className="text-sm text-muted-foreground">{edu.institution}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{fmtDate(edu.startDate)} — {edu.isCurrent ? 'Present' : fmtDate(edu.endDate)}{edu.gpa ? ` · GPA: ${edu.gpa}` : ''}</p>
                      {edu.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{edu.description}</p>}
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <button type="button" onClick={() => setEditEduId(edu.id)} className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition"><Pencil className="h-3.5 w-3.5" /></button>
                      <DeleteBtn onClick={() => startTransition(async () => { await deleteEducation(edu.id); setEducation(prev => prev.filter(e => e.id !== edu.id)); showSaved('edu'); })} />
                    </div>
                  </div>
                </div>
              )
            ))}
            {addingEdu ? (
              <EduForm data={eduForm}
                onSave={async (d) => { await createEducation(d); setEducation(prev => [...prev, { id: Date.now().toString(), ...d, startDate: new Date(d.startDate), endDate: d.endDate ? new Date(d.endDate) : null, fieldOfStudy: d.fieldOfStudy ?? null, gpa: d.gpa ?? null, description: d.description ?? null, order: prev.length, createdAt: new Date(), updatedAt: new Date() }]); setAddingEdu(false); setEduForm(blankEdu()); showSaved('edu'); }}
                onCancel={() => { setAddingEdu(false); setEduForm(blankEdu()); }} />
            ) : (
              <AddBtn label="Add Education" onClick={() => { setAddingEdu(true); setEditEduId(null); }} />
            )}
          </div>
        </SectionCard>
      </div>
    );
  }

  // ── Tab: Achievements ──────────────────────────────────────────────────────
  const ACH_CATEGORIES = ['Award', 'Hackathon', 'Academic', 'Work', 'Open Source', 'Other'];

  function AchForm({ data, onSave, onCancel }: { data: AchievementFormData; onSave: (d: AchievementFormData) => void; onCancel: () => void; }) {
    const [f, setF] = useState<AchievementFormData>(data);
    const [p, start] = useTransition();
    return (
      <div className="border border-primary/30 rounded-xl p-4 space-y-3 bg-primary/5">
        <Field label="Achievement Title">
          <Input value={f.title} onChange={v => setF(x => ({ ...x, title: v }))} placeholder="1st Place — National Hackathon 2023" />
        </Field>
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="Category">
            <Select value={f.category ?? ''} onChange={v => setF(x => ({ ...x, category: v }))} options={ACH_CATEGORIES} />
          </Field>
          <Field label="Date">
            <Input value={f.date ?? ''} onChange={v => setF(x => ({ ...x, date: v }))} type="month" placeholder="2023-05" />
          </Field>
        </div>
        <Field label="Description">
          <Textarea value={f.description ?? ''} onChange={v => setF(x => ({ ...x, description: v }))} placeholder="Won among 200 teams by building a real-time collaboration tool..." />
        </Field>
        <div className="flex gap-2 pt-1">
          <SaveBtn pending={p} onClick={() => start(async () => { await onSave(f); })} />
          <CancelBtn onClick={onCancel} />
        </div>
      </div>
    );
  }

  function TabAchievements() {
    return (
      <div className="space-y-4">
        <SectionCard>
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Achievements ({achievements.length})</h2>
            <SavedBadge show={saved === 'ach'} />
          </div>
          <div className="space-y-3">
            {achievements.map(ach => (
              editAchId === ach.id ? (
                <AchForm key={ach.id}
                  data={{ title: ach.title, description: ach.description ?? '', date: ach.date ? fmtDate(ach.date) : '', category: ach.category ?? '' }}
                  onSave={async (d) => { await updateAchievement(ach.id, d); setAchievements(prev => prev.map(a => a.id === ach.id ? { ...a, ...d, date: d.date ? new Date(d.date) : null } : a)); setEditAchId(null); showSaved('ach'); }}
                  onCancel={() => setEditAchId(null)} />
              ) : (
                <div key={ach.id} className="p-4 rounded-xl border border-border bg-card">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-foreground">{ach.title}</p>
                        {ach.category && <span className="px-1.5 py-0.5 text-xs bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 rounded">{ach.category}</span>}
                      </div>
                      {ach.date && <p className="text-xs text-muted-foreground mt-0.5">{fmtDate(ach.date)}</p>}
                      {ach.description && <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{ach.description}</p>}
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <button type="button" onClick={() => setEditAchId(ach.id)} className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition"><Pencil className="h-3.5 w-3.5" /></button>
                      <DeleteBtn onClick={() => startTransition(async () => { await deleteAchievement(ach.id); setAchievements(prev => prev.filter(a => a.id !== ach.id)); showSaved('ach'); })} />
                    </div>
                  </div>
                </div>
              )
            ))}
            {addingAch ? (
              <AchForm data={achForm}
                onSave={async (d) => { await createAchievement(d); setAchievements(prev => [...prev, { id: Date.now().toString(), ...d, date: d.date ? new Date(d.date) : null, description: d.description ?? null, category: d.category ?? null, order: prev.length, createdAt: new Date(), updatedAt: new Date() }]); setAddingAch(false); setAchForm(blankAch()); showSaved('ach'); }}
                onCancel={() => { setAddingAch(false); setAchForm(blankAch()); }} />
            ) : (
              <AddBtn label="Add Achievement" onClick={() => { setAddingAch(true); setEditAchId(null); }} />
            )}
          </div>
        </SectionCard>
      </div>
    );
  }

  // ── Tab: Spoken Languages ──────────────────────────────────────────────────
  const LEVELS = ['Native', 'Fluent', 'Professional', 'Intermediate', 'Basic'];

  function LangForm({ data, onSave, onCancel }: { data: SpokenLanguageFormData; onSave: (d: SpokenLanguageFormData) => void; onCancel: () => void; }) {
    const [f, setF] = useState<SpokenLanguageFormData>(data);
    const [p, start] = useTransition();
    return (
      <div className="border border-primary/30 rounded-xl p-4 space-y-3 bg-primary/5">
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="Language">
            <Input value={f.language} onChange={v => setF(x => ({ ...x, language: v }))} placeholder="English" />
          </Field>
          <Field label="Proficiency Level">
            <Select value={f.level} onChange={v => setF(x => ({ ...x, level: v }))} options={LEVELS} />
          </Field>
        </div>
        <div className="flex gap-2 pt-1">
          <SaveBtn pending={p} onClick={() => start(async () => { await onSave(f); })} />
          <CancelBtn onClick={onCancel} />
        </div>
      </div>
    );
  }

  function TabLanguages() {
    return (
      <div className="space-y-4">
        <SectionCard>
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Languages ({spokenLanguages.length})</h2>
            <SavedBadge show={saved === 'lang'} />
          </div>
          <div className="space-y-3">
            {spokenLanguages.map(lang => (
              editLangId === lang.id ? (
                <LangForm key={lang.id} data={{ language: lang.language, level: lang.level }}
                  onSave={async (d) => { await updateSpokenLanguage(lang.id, d); setSpokenLanguages(prev => prev.map(l => l.id === lang.id ? { ...l, ...d } : l)); setEditLangId(null); showSaved('lang'); }}
                  onCancel={() => setEditLangId(null)} />
              ) : (
                <div key={lang.id} className="flex items-center justify-between p-4 rounded-xl border border-border bg-card">
                  <div className="flex items-center gap-3">
                    <Globe2 className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-foreground">{lang.language}</p>
                      <p className="text-xs text-muted-foreground">{lang.level}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button type="button" onClick={() => setEditLangId(lang.id)} className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition"><Pencil className="h-3.5 w-3.5" /></button>
                    <DeleteBtn onClick={() => startTransition(async () => { await deleteSpokenLanguage(lang.id); setSpokenLanguages(prev => prev.filter(l => l.id !== lang.id)); showSaved('lang'); })} />
                  </div>
                </div>
              )
            ))}
            {addingLang ? (
              <LangForm data={langForm}
                onSave={async (d) => { await createSpokenLanguage(d); setSpokenLanguages(prev => [...prev, { id: Date.now().toString(), ...d, order: prev.length, createdAt: new Date(), updatedAt: new Date() }]); setAddingLang(false); setLangForm(blankLang()); showSaved('lang'); }}
                onCancel={() => { setAddingLang(false); setLangForm(blankLang()); }} />
            ) : (
              <AddBtn label="Add Language" onClick={() => { setAddingLang(true); setEditLangId(null); }} />
            )}
          </div>
        </SectionCard>
      </div>
    );
  }

  // ── Tab: Activities ────────────────────────────────────────────────────────
  const ACT_TYPES = ['Club', 'Volunteer', 'Mentoring', 'Open Source', 'Other'];

  function ActForm({ data, onSave, onCancel }: { data: ActivityFormData; onSave: (d: ActivityFormData) => void; onCancel: () => void; }) {
    const [f, setF] = useState<ActivityFormData>(data);
    const [p, start] = useTransition();
    return (
      <div className="border border-primary/30 rounded-xl p-4 space-y-3 bg-primary/5">
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="Activity Title" className="sm:col-span-2">
            <Input value={f.title} onChange={v => setF(x => ({ ...x, title: v }))} placeholder="Open Source Contributor — React" />
          </Field>
          <Field label="Type">
            <Select value={f.type ?? ''} onChange={v => setF(x => ({ ...x, type: v }))} options={ACT_TYPES} />
          </Field>
          <Field label="Start Date">
            <Input value={f.startDate ?? ''} onChange={v => setF(x => ({ ...x, startDate: v }))} type="month" placeholder="2021-01" />
          </Field>
        </div>
        <Field label="Description">
          <Textarea value={f.description ?? ''} onChange={v => setF(x => ({ ...x, description: v }))} placeholder="Contributed 50+ PRs to the React ecosystem..." />
        </Field>
        <div className="flex gap-2 pt-1">
          <SaveBtn pending={p} onClick={() => start(async () => { await onSave(f); })} />
          <CancelBtn onClick={onCancel} />
        </div>
      </div>
    );
  }

  function TabActivities() {
    return (
      <div className="space-y-4">
        <SectionCard>
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Activities ({activities.length})</h2>
            <SavedBadge show={saved === 'act'} />
          </div>
          <div className="space-y-3">
            {activities.map(act => (
              editActId === act.id ? (
                <ActForm key={act.id}
                  data={{ title: act.title, description: act.description ?? '', type: act.type ?? '', startDate: act.startDate ? fmtDate(act.startDate) : '', endDate: act.endDate ? fmtDate(act.endDate) : '' }}
                  onSave={async (d) => { await updateActivity(act.id, d); setActivities(prev => prev.map(a => a.id === act.id ? { ...a, ...d, startDate: d.startDate ? new Date(d.startDate) : null, endDate: d.endDate ? new Date(d.endDate) : null } : a)); setEditActId(null); showSaved('act'); }}
                  onCancel={() => setEditActId(null)} />
              ) : (
                <div key={act.id} className="p-4 rounded-xl border border-border bg-card">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-foreground">{act.title}</p>
                        {act.type && <span className="px-1.5 py-0.5 text-xs bg-muted rounded border border-border text-muted-foreground">{act.type}</span>}
                      </div>
                      {act.startDate && <p className="text-xs text-muted-foreground mt-0.5">{fmtDate(act.startDate)}{act.endDate ? ` — ${fmtDate(act.endDate)}` : ''}</p>}
                      {act.description && <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{act.description}</p>}
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <button type="button" onClick={() => setEditActId(act.id)} className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition"><Pencil className="h-3.5 w-3.5" /></button>
                      <DeleteBtn onClick={() => startTransition(async () => { await deleteActivity(act.id); setActivities(prev => prev.filter(a => a.id !== act.id)); showSaved('act'); })} />
                    </div>
                  </div>
                </div>
              )
            ))}
            {addingAct ? (
              <ActForm data={actForm}
                onSave={async (d) => { await createActivity(d); setActivities(prev => [...prev, { id: Date.now().toString(), ...d, startDate: d.startDate ? new Date(d.startDate) : null, endDate: d.endDate ? new Date(d.endDate) : null, description: d.description ?? null, type: d.type ?? null, order: prev.length, createdAt: new Date(), updatedAt: new Date() }]); setAddingAct(false); setActForm(blankAct()); showSaved('act'); }}
                onCancel={() => { setAddingAct(false); setActForm(blankAct()); }} />
            ) : (
              <AddBtn label="Add Activity" onClick={() => { setAddingAct(true); setEditActId(null); }} />
            )}
          </div>
        </SectionCard>
      </div>
    );
  }

  // ── Tab: Additional Info ───────────────────────────────────────────────────
  function TabAdditional() {
    return (
      <div className="space-y-4">
        <SectionCard>
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Additional Information</h2>
            <div className="flex items-center gap-2">
              <SavedBadge show={saved === 'additional'} />
              <SaveBtn label="Save" pending={isPending} onClick={() => withSave('additional', async () => { await updateProfile(pForm); })} />
            </div>
          </div>
          <Field label="Soft Skills (comma-separated)">
            <Textarea rows={2} value={pForm.softSkills ?? ''} onChange={v => setPForm(p => ({ ...p, softSkills: v }))} placeholder="Team Leadership, Problem Solving, Communication, Agile, Mentoring, Critical Thinking" />
          </Field>
          <Field label="Interests / Hobbies relevant to work">
            <Textarea rows={2} value={pForm.interests ?? ''} onChange={v => setPForm(p => ({ ...p, interests: v }))} placeholder="Open source contribution, Tech blogging, System design, Cloud architecture..." />
          </Field>
          <div className="p-4 rounded-lg bg-muted/40 border border-border">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Resume Best Practices</p>
            <ul className="space-y-1 text-xs text-muted-foreground list-disc list-inside">
              <li>Prioritize achievements over job descriptions — use action verbs + metrics</li>
              <li>Tailor content for each job application</li>
              <li>Keep it concise: 1 page for under 5 years experience, max 2 pages</li>
              <li>Use numbers to quantify impact (%, $, time saved, team size)</li>
            </ul>
          </div>
        </SectionCard>
      </div>
    );
  }

  // ── Tab: Live Preview ─────────────────────────────────────────────────────
  const LEVEL_LABELS = ['', 'Beginner', 'Elementary', 'Intermediate', 'Advanced', 'Expert'];

  function SkillDots({ level }: { level: number }) {
    return (
      <div className="flex gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className={`w-2 h-2 rounded-full ${i < level ? 'bg-blue-600' : 'bg-gray-200'}`} />
        ))}
      </div>
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- kept for future "preview" tab
  function TabPreview() {
    const skillCats = Object.keys(skillsByCategory);
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
          <Eye className="h-4 w-4 text-blue-600 shrink-0" />
          <p className="text-sm text-blue-700 dark:text-blue-300">
            This is a <strong>live preview</strong> of your public resume using the current saved data.
            Save your changes in other tabs first, then return here to see updates.
          </p>
          <a href="/resume" target="_blank" className="ml-auto shrink-0 text-xs text-blue-600 hover:underline font-medium whitespace-nowrap">
            Open public page →
          </a>
        </div>

        <ResumeCard3D>
          <div className="bg-white text-gray-800 p-8 sm:p-12 font-sans">
            {/* Header */}
            <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-5 border-b-2 border-gray-900 mb-7">
              <div>
                <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 leading-none mb-1.5">{pForm.name}</h2>
                <p className="text-base text-blue-600 font-semibold">{pForm.title}</p>
              </div>
              <div className="flex flex-col gap-1 text-xs text-gray-500 sm:text-right">
                {pForm.location && <div className="flex sm:justify-end items-center gap-1"><MapPin className="w-3 h-3" />{pForm.location}</div>}
                {pForm.email && <div className="flex sm:justify-end items-center gap-1"><Mail className="w-3 h-3" />{pForm.email}</div>}
                {Object.entries(socialForm).filter(([, url]) => url).map(([platform, url]) => (
                  <div key={platform} className="flex sm:justify-end items-center gap-1">
                    <Globe2 className="w-3 h-3" />
                    <span>{platform}: {url}</span>
                  </div>
                ))}
              </div>
            </header>

            {/* Body */}
            <div className="grid grid-cols-1 md:grid-cols-[2fr_1px_1fr] gap-7">
              {/* Left */}
              <div className="flex flex-col gap-7">
                {/* Profile */}
                {(pForm.bio || pForm.careerObjective) && (
                  <section>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Profile</h3>
                    {pForm.bio && <p className="text-xs text-gray-600 leading-relaxed">{pForm.bio}</p>}
                    {pForm.careerObjective && <p className="text-xs text-gray-500 leading-relaxed mt-1 italic">{pForm.careerObjective}</p>}
                  </section>
                )}
                {/* Experience */}
                {experiences.length > 0 && (
                  <section>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Experience</h3>
                    <div className="space-y-4">
                      {experiences.map(exp => (
                        <div key={exp.id} className="pl-3 border-l-2 border-gray-200">
                          <div className="flex justify-between gap-2">
                            <p className="text-xs font-bold text-gray-900">{exp.position}</p>
                            <span className="text-[10px] text-gray-400 font-mono whitespace-nowrap">
                              {new Date(exp.startDate).getFullYear()} – {exp.isCurrent ? 'Present' : exp.endDate ? new Date(exp.endDate).getFullYear() : ''}
                            </span>
                          </div>
                          <p className="text-[11px] text-blue-600 font-semibold mb-1">{exp.company}</p>
                          {exp.description && <p className="text-[10px] text-gray-500 leading-relaxed">{exp.description}</p>}
                        </div>
                      ))}
                    </div>
                  </section>
                )}
                {/* Education */}
                {education.length > 0 && (
                  <section>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Education</h3>
                    <div className="space-y-3">
                      {education.map(edu => (
                        <div key={edu.id} className="pl-3 border-l-2 border-gray-200">
                          <div className="flex justify-between gap-2">
                            <p className="text-xs font-bold text-gray-900">{edu.degree}</p>
                            <span className="text-[10px] text-gray-400 font-mono whitespace-nowrap">
                              {new Date(edu.startDate).getFullYear()} – {edu.isCurrent ? 'Present' : edu.endDate ? new Date(edu.endDate).getFullYear() : ''}
                            </span>
                          </div>
                          <p className="text-[11px] text-blue-600 font-semibold">{edu.institution}</p>
                        </div>
                      ))}
                    </div>
                  </section>
                )}
              </div>

              {/* Divider */}
              <div className="hidden md:block bg-gray-100 w-px" />

              {/* Right — Skills */}
              <div className="flex flex-col gap-4">
                {skillCats.length > 0 && (
                  <section>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Skills</h3>
                    <div className="space-y-4">
                      {skillCats.map(cat => (
                        <div key={cat}>
                          <p className="text-[10px] font-semibold text-gray-600 uppercase mb-1.5">{CATEGORY_LABELS[cat] ?? cat}</p>
                          <div className="space-y-1.5">
                            {skillsByCategory[cat].map(skill => (
                              <div key={skill.id} className="flex items-center justify-between gap-2">
                                <span className="text-[11px] text-gray-600">{skill.name}</span>
                                <div className="flex flex-col items-end">
                                  <SkillDots level={skill.level ?? 0} />
                                  <span className="text-[9px] text-gray-400">{LEVEL_LABELS[skill.level ?? 0]}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}
                {pForm.softSkills && (
                  <section>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Soft Skills</h3>
                    <div className="flex flex-wrap gap-1">
                      {pForm.softSkills.split(',').map(s => s.trim()).filter(Boolean).map(s => (
                        <span key={s} className="px-1.5 py-0.5 text-[10px] bg-blue-50 text-blue-700 rounded-full">{s}</span>
                      ))}
                    </div>
                  </section>
                )}
              </div>
            </div>
          </div>
        </ResumeCard3D>
      </div>
    );
  }

  // ── Tab: Layout / Section Reorder ─────────────────────────────────────────
  function TabLayout() {
    return (
      <div className="space-y-4">
        <SectionCard>
          <div>
            <h2 className="font-semibold mb-1">Section Order</h2>
            <p className="text-xs text-muted-foreground">Drag sections up/down to change their order on the resume card.</p>
          </div>
          <div className="space-y-2 mt-4">
            {sectionOrder.map((id, idx) => (
              <div key={id} className="flex items-center gap-3 p-3 rounded-lg border border-border bg-background hover:bg-muted/50 transition-colors">
                <GripVertical className="h-4 w-4 text-muted-foreground" />
                <span className="flex-1 text-sm font-medium">{SECTION_LABELS[id]}</span>
                <div className="flex gap-1">
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => moveSection(id, -1)}
                    className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30 transition"
                  >
                    <ArrowUp className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={idx === sectionOrder.length - 1}
                    onClick={() => moveSection(id, 1)}
                    className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30 transition"
                  >
                    <ArrowDown className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground pt-2 border-t border-border">
            ✦ The preview on the right updates instantly. The public resume page reflects these changes after save.
          </p>
        </SectionCard>
      </div>
    );
  }

  // ── Live 3D Preview Panel (with drag-and-drop directly on card) ─────────────

  function ResumePreviewPanel() {
    const skillCats = Object.keys(skillsByCategory);

    // Content renderer per section (returns the inner JSX, not wrapped in draggable)
    function renderSectionContent(id: SectionId): React.ReactNode {
      switch (id) {
        case 'profile':
          if (!pForm.bio && !pForm.careerObjective) return null;
          return (
            <>
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">Profile</h3>
              {pForm.bio && <p className="text-[11px] text-gray-600 leading-relaxed">{pForm.bio}</p>}
              {pForm.careerObjective && <p className="text-[11px] text-gray-500 leading-relaxed mt-1 italic">{pForm.careerObjective}</p>}
            </>
          );
        case 'experience':
          if (experiences.length === 0) return null;
          return (
            <>
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Experience</h3>
              <div className="space-y-3">
                {experiences.map(exp => (
                  <div key={exp.id} className="pl-3 border-l-2 border-gray-200">
                    <div className="flex justify-between gap-1 mb-0.5">
                      <p className="text-[11px] font-bold text-gray-900 leading-tight">{exp.position}</p>
                      <span className="text-[9px] text-gray-400 font-mono whitespace-nowrap">
                        {new Date(exp.startDate).getFullYear()}–{exp.isCurrent ? 'Now' : exp.endDate ? new Date(exp.endDate).getFullYear() : ''}
                      </span>
                    </div>
                    <p className="text-[10px] text-blue-600 font-semibold">{exp.company}</p>
                    {exp.description && <p className="text-[10px] text-gray-500 leading-snug mt-0.5">{exp.description}</p>}
                  </div>
                ))}
              </div>
            </>
          );
        case 'education':
          if (education.length === 0) return null;
          return (
            <>
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Education</h3>
              <div className="space-y-2">
                {education.map(edu => (
                  <div key={edu.id} className="pl-3 border-l-2 border-gray-200">
                    <div className="flex justify-between gap-1">
                      <p className="text-[11px] font-bold text-gray-900 leading-tight">{edu.degree}</p>
                      <span className="text-[9px] text-gray-400 font-mono whitespace-nowrap">
                        {new Date(edu.startDate).getFullYear()}–{edu.isCurrent ? 'Now' : edu.endDate ? new Date(edu.endDate).getFullYear() : ''}
                      </span>
                    </div>
                    <p className="text-[10px] text-blue-600 font-semibold">{edu.institution}</p>
                  </div>
                ))}
              </div>
            </>
          );
        case 'skills':
          if (skillCats.length === 0) return null;
          return (
            <>
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Skills</h3>
              <div className="space-y-2.5">
                {skillCats.slice(0, 4).map(cat => (
                  <div key={cat}>
                    <p className="text-[9px] font-semibold text-gray-500 uppercase mb-1">{CATEGORY_LABELS[cat] ?? cat}</p>
                    <div className="space-y-1">
                      {skillsByCategory[cat].slice(0, 4).map(skill => (
                        <div key={skill.id} className="flex items-center justify-between gap-1">
                          <span className="text-[10px] text-gray-600">{skill.name}</span>
                          <SkillDots level={skill.level ?? 0} />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </>
          );
        case 'achievements':
          if (achievements.length === 0) return null;
          return (
            <>
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Achievements</h3>
              <div className="space-y-1.5">
                {achievements.slice(0, 3).map(ach => (
                  <div key={ach.id} className="flex gap-1.5">
                    <span className="text-blue-400 mt-0.5 text-[10px]">★</span>
                    <div>
                      <p className="text-[11px] font-semibold text-gray-800">{ach.title}</p>
                      {ach.description && <p className="text-[10px] text-gray-500">{ach.description}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </>
          );
        case 'softSkills':
          if (!pForm.softSkills) return null;
          return (
            <>
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">Soft Skills</h3>
              <div className="flex flex-wrap gap-1">
                {pForm.softSkills.split(',').map(s => s.trim()).filter(Boolean).map(s => (
                  <span key={s} className="px-1.5 py-0.5 text-[9px] bg-blue-50 text-blue-700 rounded-full">{s}</span>
                ))}
              </div>
            </>
          );
        default:
          return null;
      }
    }

    return (
      <div className="sticky top-0 flex flex-col gap-3 pt-2">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Live Preview</p>
          <a href="/resume" target="_blank" className="text-xs text-primary hover:underline">Open →</a>
        </div>

        {/* Drag hint */}
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground bg-muted/50 rounded-md px-2.5 py-1.5">
          <GripVertical className="h-3 w-3 shrink-0" />
          <span>Kéo các section trên thẻ để sắp xếp lại</span>
        </div>

        <ResumeCard3D disableTilt={isDragging}>
          <div className="bg-white text-gray-800 p-5 font-sans min-h-[500px]">
            {/* Header — not draggable */}
            <header className="pb-3 border-b-2 border-gray-900 mb-4">
              <h2 className="text-xl font-extrabold text-gray-900 leading-none mb-0.5">{pForm.name || 'Your Name'}</h2>
              <p className="text-sm text-blue-600 font-semibold mb-2">{pForm.title || 'Your Title'}</p>
              <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-gray-500">
                {pForm.location && <span className="flex items-center gap-0.5"><MapPin className="w-2.5 h-2.5" />{pForm.location}</span>}
                {pForm.email && <span className="flex items-center gap-0.5"><Mail className="w-2.5 h-2.5" />{pForm.email}</span>}
                {Object.entries(socialForm).filter(([, url]) => url).slice(0, 2).map(([p]) => (
                  <span key={p} className="flex items-center gap-0.5"><Globe2 className="w-2.5 h-2.5" />{p}</span>
                ))}
              </div>
            </header>

            {/* Draggable sections */}
            <div
              className="space-y-1"
              onDragOver={e => e.preventDefault()}
              onDrop={e => {
                e.preventDefault();
                const target = (e.target as HTMLElement).closest('[data-section-id]');
                const targetId = target?.getAttribute('data-section-id') as SectionId | null;
                if (targetId) handleDrop(targetId);
              }}
            >
              {sectionOrder.map(id => {
                const content = renderSectionContent(id);
                if (!content) return null;
                const isDragSource = dragId === id;
                const isDragTarget = dragOverId === id && dragId !== id;
                return (
                  <div
                    key={id}
                    data-section-id={id}
                    draggable
                    onDragStart={() => { setDragId(id); setDragOverId(null); }}
                    onDragEnd={() => { setDragId(null); setDragOverId(null); }}
                    onDragEnter={() => setDragOverId(id)}
                    onDragLeave={e => {
                      if (!(e.currentTarget as HTMLElement).contains(e.relatedTarget as Node)) {
                        setDragOverId(null);
                      }
                    }}
                    className={[
                      'group relative rounded-md px-2 py-2 transition-all cursor-grab active:cursor-grabbing select-none',
                      isDragSource ? 'opacity-40 scale-[0.98] bg-blue-50 ring-1 ring-blue-300' : '',
                      isDragTarget ? 'ring-2 ring-blue-500 bg-blue-50/60' : '',
                      !isDragSource && !isDragTarget ? 'hover:bg-gray-50' : '',
                    ].join(' ')}
                    style={{ userSelect: 'none' }}
                  >
                    {/* Drag handle indicator — visible on hover / drag */}
                    <div className={[
                      'absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 flex flex-col gap-0.5 transition-opacity',
                      isDragSource || dragOverId === id ? 'opacity-100' : 'opacity-0 group-hover:opacity-60',
                    ].join(' ')}>
                      <GripVertical className="h-4 w-4 text-blue-400" />
                    </div>

                    {/* Drop indicator line on top */}
                    {isDragTarget && (
                      <div className="absolute -top-0.5 left-2 right-2 h-0.5 bg-blue-500 rounded-full" />
                    )}

                    {content}
                  </div>
                );
              })}
            </div>
          </div>
        </ResumeCard3D>

        <p className="text-[11px] text-muted-foreground text-center">
          Cập nhật ngay khi gõ · Kéo section để sắp xếp
        </p>
      </div>
    );
  }


  // ── Render ─────────────────────────────────────────────────────────────────
  const activeContent = {
    personal: TabPersonal(),
    summary: TabSummary(),
    skills: TabSkills(),
    experience: TabExperience(),
    education: TabEducation(),
    achievements: TabAchievements(),
    languages: TabLanguages(),
    activities: TabActivities(),
    additional: TabAdditional(),
    layout: TabLayout(),
  }[activeTab];

  return (
    <main className="flex flex-1 flex-col gap-0 w-full">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Resume Editor</h1>
            <p className="text-sm text-muted-foreground">
              Edit fields on the left — live 3D preview on the right
              {!profile.fromDb && (
                <span className="ml-2 px-2 py-0.5 text-xs bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 rounded-full">
                  Using static data — save to persist in DB
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1 overflow-x-auto pb-px">
          {TABS.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? tab.id === 'layout' ? 'bg-violet-600 text-white' : 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Split-pane body */}
      <div className="flex flex-1 min-h-0">
        {/* LEFT: Editor panel */}
        <div className="flex-1 min-w-0 overflow-y-auto p-6">
          {activeContent}
        </div>

        {/* RIGHT: Sticky 3D Preview panel */}
        <div className="hidden xl:block w-[420px] shrink-0 border-l border-border bg-muted/20 overflow-y-auto p-4">
          {ResumePreviewPanel()}
        </div>
      </div>
    </main>
  );
}
