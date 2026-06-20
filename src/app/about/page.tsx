import { MainLayout } from '@/components';
import { PROFILE, EXPERIENCES, EDUCATION } from '@/data/content';
import { getSkillsByCategory, SKILL_CATEGORY_LABELS } from '@/data/skills';
import { Download, MapPin, Mail, Github, Linkedin, Twitter } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About',
  description: `Learn more about ${PROFILE.name} — ${PROFILE.title} based in ${PROFILE.location}.`,
};

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Github,
  Linkedin,
  Twitter,
};

const LEVEL_LABEL: Record<number, string> = {
  1: 'Beginner',
  2: 'Elementary',
  3: 'Intermediate',
  4: 'Advanced',
  5: 'Expert',
};

export default function AboutPage() {
  const skillsByCategory = getSkillsByCategory();

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto px-6 py-24 pt-32">
        {/* Profile Header */}
        <div className="mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">{PROFILE.name}</h1>
          <p className="text-xl text-muted-foreground mb-6">{PROFILE.title}</p>

          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-6">
            <div className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4" />
              {PROFILE.location}
            </div>
            <div className="flex items-center gap-1.5">
              <Mail className="h-4 w-4" />
              <a href={`mailto:${PROFILE.email}`} className="hover:text-foreground transition-colors">
                {PROFILE.email}
              </a>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {PROFILE.socialLinks.map(social => {
              const Icon = ICON_MAP[social.iconName];
              return (
                <a
                  key={social.platform}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 border border-border rounded-lg text-sm text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
                >
                  {Icon && <Icon className="h-4 w-4" />}
                  {social.platform}
                </a>
              );
            })}
            <a
              href={PROFILE.resumeUrl}
              download
              className="inline-flex items-center gap-2 px-4 py-2 bg-foreground text-background rounded-lg text-sm font-medium hover:bg-foreground/90 transition-colors"
            >
              <Download className="h-4 w-4" />
              Download Resume
            </a>
          </div>
        </div>

        {/* Bio */}
        <section aria-labelledby="bio-heading" className="mb-16">
          <h2 id="bio-heading" className="text-sm font-semibold uppercase tracking-widest text-primary mb-4">
            About
          </h2>
          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <p>{PROFILE.bio}</p>
            <p>{PROFILE.bio2}</p>
          </div>
        </section>

        {/* Skills */}
        <section aria-labelledby="skills-heading" className="mb-16">
          <h2 id="skills-heading" className="text-sm font-semibold uppercase tracking-widest text-primary mb-8">
            Skills & Technologies
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            {(Object.keys(skillsByCategory) as Array<keyof typeof skillsByCategory>).map(cat => (
              <div key={cat}>
                <h3 className="text-base font-semibold text-foreground mb-4">
                  {SKILL_CATEGORY_LABELS[cat]}
                </h3>
                <div className="space-y-3">
                  {skillsByCategory[cat].map(skill => (
                    <div key={skill.id} className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">{skill.name}</span>
                      <div className="flex items-center gap-2">
                        <div className="flex gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <div
                              key={i}
                              className={`w-2 h-2 rounded-full ${
                                i < (skill.level ?? 0)
                                  ? 'bg-foreground'
                                  : 'bg-border'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-muted-foreground w-20 text-right">
                          {LEVEL_LABEL[skill.level ?? 0]}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Experience */}
        <section aria-labelledby="experience-heading" className="mb-16">
          <h2 id="experience-heading" className="text-sm font-semibold uppercase tracking-widest text-primary mb-8">
            Experience
          </h2>
          <div className="space-y-8">
            {EXPERIENCES.map(exp => (
              <div key={exp.id} className="relative pl-6 before:absolute before:left-0 before:top-2 before:h-full before:w-px before:bg-border">
                <div className="absolute left-0 top-2 -translate-x-1/2 w-2 h-2 rounded-full bg-foreground ring-2 ring-background" />
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div>
                    <h3 className="font-semibold text-foreground">{exp.position}</h3>
                    <p className="text-sm text-muted-foreground">{exp.company}</p>
                  </div>
                  <div className="text-right text-xs text-muted-foreground shrink-0">
                    <p>
                      {new Date(exp.startDate).getFullYear()} —{' '}
                      {exp.isCurrent ? 'Present' : exp.endDate ? new Date(exp.endDate).getFullYear() : ''}
                    </p>
                    {exp.isCurrent && (
                      <span className="px-2 py-0.5 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 text-xs">
                        Current
                      </span>
                    )}
                  </div>
                </div>
                {exp.description && (
                  <p className="text-sm text-muted-foreground leading-relaxed">{exp.description}</p>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Education */}
        <section aria-labelledby="education-heading">
          <h2 id="education-heading" className="text-sm font-semibold uppercase tracking-widest text-primary mb-8">
            Education
          </h2>
          <div className="space-y-6">
            {EDUCATION.map(edu => (
              <div key={edu.id} className="p-5 rounded-xl border border-border bg-card">
                <h3 className="font-semibold text-foreground mb-1">{edu.degree}</h3>
                <p className="text-sm text-muted-foreground mb-1">{edu.institution}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(edu.startDate).getFullYear()} — {new Date(edu.endDate).getFullYear()}
                </p>
                {edu.description && (
                  <p className="text-sm text-muted-foreground mt-3">{edu.description}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>
    </MainLayout>
  );
}
