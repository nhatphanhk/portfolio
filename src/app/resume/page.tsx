import { MainLayout } from '@/components';
import { ResumeCard3D } from '@/components/ui/ResumeCard3D';
import {
  getProfile,
  getExperiences,
  getSocialLinks,
  getEducation,
  getSkillsByCategory,
} from '@/lib/actions/about';
import { Github, Linkedin, Twitter, MapPin, Mail, Download } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Resume',
  description: 'Interactive 3D Resume',
};

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Github,
  Linkedin,
  Twitter,
};

const LEVEL_LABELS = ['', 'Beginner', 'Elementary', 'Intermediate', 'Advanced', 'Expert'];
const CATEGORY_LABELS: Record<string, string> = {
  LANGUAGE: 'Programming Languages', FRAMEWORK: 'Frameworks / Libraries',
  FRONTEND: 'Frontend', BACKEND: 'Backend', DATABASE: 'Databases',
  CLOUD: 'Cloud Platforms', DEVOPS: 'DevOps & CI/CD', IAC: 'Infrastructure as Code',
  MONITORING: 'Monitoring & Logging', VERSION_CONTROL: 'Version Control',
  TOOLS: 'Tools & Technologies', OTHER: 'Other',
};

function SkillDots({ level }: { level: number }) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className={`w-2 h-2 rounded-full ${i < level ? 'bg-blue-600' : 'bg-gray-200'}`}
        />
      ))}
    </div>
  );
}

export default async function ResumePage() {
  const [profile, experiences, socialLinks, education, skillsByCategory] = await Promise.all([
    getProfile(),
    getExperiences(),
    getSocialLinks(),
    getEducation(),
    getSkillsByCategory(),
  ]);

  const skillCats = Object.keys(skillsByCategory);

  return (
    <MainLayout>
      <div className="pt-28 pb-16 px-4 sm:px-6 bg-gradient-to-b from-background to-muted/30">
        {/* Page header */}
        <div className="max-w-5xl mx-auto mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-1">Resume</h1>
            <p className="text-muted-foreground text-sm">Hover the card for an interactive 3D preview</p>
          </div>
          <a
            href={profile.resumeUrl}
            download
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 active:scale-95 transition-all shadow-sm"
          >
            <Download className="w-4 h-4" />
            Download PDF
          </a>
        </div>

        {/* 3D Resume Card */}
        <div className="max-w-5xl mx-auto">
          <ResumeCard3D>
            <div className="bg-white text-gray-800 p-8 sm:p-12 rounded-sm font-sans">

              {/* ── HEADER ─────────────────────────────── */}
              <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-6 border-b-2 border-gray-900 mb-8">
                <div>
                  <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-900 leading-none mb-2">
                    {profile.name}
                  </h2>
                  <p className="text-lg text-blue-600 font-semibold tracking-wide">{profile.title}</p>
                </div>
                <div className="flex flex-col gap-1.5 text-sm text-gray-500 sm:text-right shrink-0">
                  <div className="flex sm:justify-end items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                    <span>{profile.location}</span>
                  </div>
                  <div className="flex sm:justify-end items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 shrink-0" />
                    <a href={`mailto:${profile.email}`} className="hover:text-blue-600 transition-colors">
                      {profile.email}
                    </a>
                  </div>
                  {socialLinks.map(social => {
                    const Icon = ICON_MAP[social.iconName ?? ''];
                    return (
                      <div key={social.platform} className="flex sm:justify-end items-center gap-1.5">
                        {Icon && <Icon className="w-3.5 h-3.5 shrink-0" />}
                        <a href={social.url} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 transition-colors">
                          {social.platform}
                        </a>
                      </div>
                    );
                  })}
                </div>
              </header>

              {/* ── BODY ────────────────────────────────── */}
              <div className="grid grid-cols-1 md:grid-cols-[2fr_1px_1fr] gap-8">

                {/* LEFT */}
                <div className="flex flex-col gap-8">

                  {/* Profile Bio */}
                  {(profile.bio || profile.careerObjective) && (
                    <section>
                      <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Profile</h3>
                      {profile.bio && <p className="text-sm text-gray-600 leading-relaxed">{profile.bio}</p>}
                      {profile.careerObjective && (
                        <p className="text-sm text-gray-600 leading-relaxed mt-2 italic">{profile.careerObjective}</p>
                      )}
                    </section>
                  )}

                  {/* Experience */}
                  {experiences.length > 0 && (
                    <section>
                      <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Experience</h3>
                      <div className="space-y-5">
                        {experiences.map(exp => (
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
                                    <span className="text-blue-400 mt-0.5">•</span>{a}
                                  </li>
                                ))}
                              </ul>
                            )}
                            {exp.techStack && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {exp.techStack.split(',').map(t => t.trim()).filter(Boolean).map(t => (
                                  <span key={t} className="px-1.5 py-0.5 text-[10px] bg-gray-100 rounded text-gray-500">{t}</span>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  {/* Education */}
                  {education.length > 0 && (
                    <section>
                      <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Education</h3>
                      <div className="space-y-4">
                        {education.map(edu => (
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

                {/* RIGHT — Skills */}
                <div className="flex flex-col gap-6">
                  {skillCats.length > 0 && (
                    <section>
                      <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Skills</h3>
                      <div className="space-y-5">
                        {skillCats.map(cat => (
                          <div key={cat}>
                            <h4 className="text-xs font-semibold text-gray-700 uppercase mb-2">
                              {CATEGORY_LABELS[cat] ?? cat}
                            </h4>
                            <div className="space-y-2">
                              {skillsByCategory[cat].map(skill => (
                                <div key={skill.id} className="flex items-center justify-between gap-2">
                                  <span className="text-xs text-gray-600">{skill.name}</span>
                                  <div className="flex flex-col items-end gap-0.5">
                                    <SkillDots level={skill.level ?? 0} />
                                    <span className="text-[10px] text-gray-400">
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
                  {profile.softSkills && (
                    <section>
                      <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Soft Skills</h3>
                      <div className="flex flex-wrap gap-1.5">
                        {profile.softSkills.split(',').map(s => s.trim()).filter(Boolean).map(s => (
                          <span key={s} className="px-2 py-0.5 text-xs bg-blue-50 text-blue-700 rounded-full">{s}</span>
                        ))}
                      </div>
                    </section>
                  )}
                </div>
              </div>
            </div>
          </ResumeCard3D>
        </div>
      </div>
    </MainLayout>
  );
}
