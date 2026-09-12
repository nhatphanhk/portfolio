'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowRight, MapPin, Mail, Sparkles, Code2, Quote } from 'lucide-react';
import type { getProfile } from '@/lib/actions/about';
import type { getPublicSkillsByCategory } from '@/lib/actions/skill';
import { useLanguage } from '@/lib/i18n/context';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface AboutSectionProps {
  profile: Awaited<ReturnType<typeof getProfile>>;
  skillsByCategory: Awaited<ReturnType<typeof getPublicSkillsByCategory>>;
  content?: Record<string, string>;
}

export function AboutSection({ profile, skillsByCategory, content }: AboutSectionProps) {
  const { isEn, t } = useLanguage();
  const getC = (key: string, fallback: string) => {
    if (isEn) {
      return (content as any)?.en?.[key] || content?.[key] || fallback;
    }
    return (content as any)?.vi?.[key] || fallback;
  };
  const allSkills = Object.values(skillsByCategory).flat();
  const highLevelSkills = allSkills.filter(s => s.level >= 4);
  const topSkills = (highLevelSkills.length > 0 ? highLevelSkills : allSkills).slice(0, 10);

  const sectionRef = useRef<HTMLElement>(null);
  const glowOrbRef = useRef<HTMLDivElement>(null);

  // Author Gallery Image Fallbacks (Curated high-res images)
  const authorImg1 = content?.about_author_image_1 || profile.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80';
  const authorImg2 = content?.about_author_image_2 || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80';
  const authorImg3 = content?.about_author_image_3 || 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80';

  useEffect(() => {
    if (!sectionRef.current) return;
    const ctx = gsap.context(() => {
      // ── Ambient background parallax orb ──
      if (glowOrbRef.current && sectionRef.current) {
        gsap.to(glowOrbRef.current, {
          y: 120,
          x: -40,
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1.5,
          },
        });
      }

      // ── Left column timeline: label -> heading -> line -> bio -> meta -> cta ──
      const contentCol = sectionRef.current?.querySelector('[data-about="content-col"]') as HTMLElement | null;
      const leftTl = gsap.timeline({
        scrollTrigger: {
          trigger: contentCol ?? '[data-about="content-col"]',
          start: 'top 82%',
        },
      });

      leftTl
        .fromTo(
          '[data-about="label"]',
          { opacity: 0, x: -35 },
          { opacity: 1, x: 0, duration: 0.6, ease: 'power3.out' }
        )
        .fromTo(
          '[data-about="heading"]',
          { opacity: 0, y: 30, scale: 0.98 },
          { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: 'power3.out' },
          '-=0.4'
        )
        .fromTo(
          '[data-about="accent-line"]',
          { scaleX: 0, transformOrigin: 'left center' },
          { scaleX: 1, duration: 0.7, ease: 'power2.out' },
          '-=0.5'
        )
        .fromTo(
          '[data-about="bio"]',
          { opacity: 0, y: 24 },
          { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' },
          '-=0.4'
        );

      const metaItems = sectionRef.current?.querySelectorAll('[data-about="meta-item"]') ?? [];
      if (metaItems.length > 0) {
        leftTl.fromTo(
          metaItems,
          { opacity: 0, x: -20 },
          { opacity: 1, x: 0, duration: 0.5, stagger: 0.1, ease: 'power2.out' },
          '-=0.4'
        );
      }

      leftTl.fromTo(
        '[data-about="cta"]',
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'back.out(1.7)' },
        '-=0.3'
      );

      // ── Right column: Card wrapper & Skill tags stagger with elastic pop ──
      const skillsCol = sectionRef.current?.querySelector('[data-about="skills-col"]') as HTMLElement | null;
      const rightTl = gsap.timeline({
        scrollTrigger: {
          trigger: skillsCol ?? '[data-about="skills-col"]',
          start: 'top 80%',
        },
      });

      rightTl.fromTo(
        '[data-about="skills-card"]',
        { opacity: 0, y: 40, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: 'power3.out' }
      );

      const skillTags = sectionRef.current?.querySelectorAll('[data-about="skill-tag"]') ?? [];
      if (skillTags.length > 0) {
        rightTl.fromTo(
          skillTags,
          { opacity: 0, scale: 0.7, y: 18, rotate: -4 },
          {
            opacity: 1,
            scale: 1,
            y: 0,
            rotate: 0,
            duration: 0.5,
            stagger: 0.05,
            ease: 'back.out(1.8)',
          },
          '-=0.5'
        );
      }

      const statCards = sectionRef.current?.querySelectorAll('[data-about="stat-card"]') ?? [];
      if (statCards.length > 0) {
        rightTl.fromTo(
          statCards,
          { opacity: 0, y: 30, scale: 0.9 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.6,
            stagger: 0.12,
            ease: 'power3.out',
          },
          '-=0.3'
        );
      }

      // ── Numbers Counter Animation ──
      const statEls = gsap.utils.toArray<HTMLElement>('[data-about="stat-number"]', sectionRef.current ?? undefined);
      statEls.forEach(el => {
        const target = parseInt(el.dataset.target ?? '0', 10);
        const obj = { val: 0 };

        gsap.to(obj, {
          val: target,
          duration: 2.0,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 88%',
          },
          onUpdate: () => {
            el.textContent = Math.round(obj.val) + '+';
          },
        });
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="about"
      className="relative py-20 overflow-hidden bg-gradient-to-br from-background via-background to-primary/5"
    >
      {/* Background ambient floating glow orb (Parallax) */}
      <div
        ref={glowOrbRef}
        className="absolute top-12 -right-24 w-80 h-80 rounded-full pointer-events-none opacity-30 blur-3xl"
        style={{
          background: 'radial-gradient(circle, oklch(0.72 0.18 78 / 30%) 0%, oklch(0.42 0.22 255 / 10%) 60%, transparent 80%)',
        }}
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* ══ Section Header ══ */}
        <div data-about="content-col" className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-5 pb-6 border-b border-border/60">
          <div>
            <div
              data-about="label"
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-3 bg-primary/10 text-primary border border-primary/20"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{getC('about_badge', t.landing.aboutBadge)}</span>
            </div>

            <h2
              data-about="heading"
              className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-[1.15] text-foreground mb-3"
            >
              {getC('about_heading', t.landing.aboutHeading)}
            </h2>

            <div
              data-about="accent-line"
              className="h-1 w-20 rounded-full bg-gradient-to-r from-primary to-accent"
            />
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-700 dark:text-emerald-400 text-xs sm:text-sm font-semibold self-start md:self-auto">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>{isEn ? 'Open for new challenges & projects' : 'Sẵn sàng cho dự án & thử thách mới'}</span>
          </div>
        </div>

        {/* ══ Balanced 2-col Grid ══ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* ── LEFT COLUMN: Portrait + Quote + Meta ── */}
          <div className="flex flex-col gap-4">
            {/* Portrait Card */}
            <div className="relative group rounded-2xl overflow-hidden shadow-lg border border-border/70 bg-card">
              <div className="relative aspect-[3/4] w-full overflow-hidden bg-muted">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={authorImg1}
                  alt={profile.name}
                  className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/10 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/15 backdrop-blur-md border border-white/25 text-[11px] font-bold mb-1.5">
                    <Sparkles className="w-3 h-3 text-amber-300" />
                    <span>{getC('about_author_role', isEn ? 'Lead Engineer' : 'Kỹ Sư Phần Mềm')}</span>
                  </div>
                  <h4 className="text-xl sm:text-2xl font-black tracking-tight">{profile.name}</h4>
                  <p className="text-xs text-slate-300 line-clamp-1 mt-0.5">{profile.title}</p>
                </div>
              </div>
            </div>

            {/* Quote Card */}
            <div className="p-5 rounded-2xl bg-card border border-border/70 shadow-sm flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0 mt-0.5">
                <Quote className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-muted-foreground italic leading-relaxed">
                  &ldquo;{getC('about_author_quote', isEn ? 'Passionate about crafting scalable software architectures, elegant reactive UIs, and AI-driven developer tooling.' : 'Đam mê kiến tạo các hệ thống phần mềm mở rộng, giao diện người dùng mượt mà và ứng dụng AI vào quy trình phát triển.')}&rdquo;
                </p>
                <p className="text-xs font-bold text-muted-foreground/60 mt-1.5">— {profile.name}</p>
              </div>
            </div>

            {/* Meta + CTA */}
            <div className="p-5 rounded-2xl bg-card border border-border/70 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-2">
                {profile.location && (
                  <div data-about="meta-item" className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
                    <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600">
                      <MapPin className="h-3.5 w-3.5" />
                    </div>
                    <span>{profile.location}</span>
                  </div>
                )}
                {profile.email && (
                  <div data-about="meta-item" className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
                    <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-600">
                      <Mail className="h-3.5 w-3.5" />
                    </div>
                    <a href={`mailto:${profile.email}`} className="hover:text-primary transition-colors truncate max-w-[200px]">
                      {profile.email}
                    </a>
                  </div>
                )}
              </div>

              <Link
                data-about="cta"
                href="/resume"
                className="group inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm bg-primary text-primary-foreground shadow-md shadow-primary/20 hover:gap-3 hover:opacity-90 active:scale-95 transition-all duration-200 shrink-0"
              >
                <span>{t.landing.aboutCta}</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>

          {/* ── RIGHT COLUMN: Bio + Skills + Stats + Photos ── */}
          <div data-about="skills-col" className="flex flex-col gap-4">
            {/* Bio Card */}
            <div className="p-6 rounded-2xl bg-card border border-border/70 shadow-sm">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider text-blue-600 bg-blue-500/10 border border-blue-500/20 mb-4">
                <Code2 className="w-3.5 h-3.5" />
                <span>{isEn ? 'Engineering Story' : 'Câu Chuyện Nghề Nghiệp'}</span>
              </div>
              <p
                data-about="bio"
                className="text-sm sm:text-base text-foreground/80 leading-relaxed"
              >
                {(isEn && (profile as any)?.translations?.en?.bio) || profile.bio}
              </p>
            </div>

            {/* Skills Card */}
            <div
              data-about="skills-card"
              className="p-6 rounded-2xl bg-card border border-border/70 shadow-sm"
            >
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Code2 className="w-4 h-4 text-primary" />
                  <span>{getC('about_skills_badge', t.landing.aboutSkillsBadge)}</span>
                </p>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                  {getC('about_top_stack_badge', t.landing.aboutTopStackBadge)}
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                {topSkills.map(skill => (
                  <span
                    data-about="skill-tag"
                    key={skill.id}
                    className="px-3 py-1.5 text-xs font-bold rounded-lg bg-primary/8 border border-primary/20 text-primary cursor-default transition-all duration-200 hover:scale-105 hover:bg-primary/15"
                  >
                    {skill.name}
                  </span>
                ))}
              </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-3">
              <div
                data-about="stat-card"
                className="p-4 rounded-2xl bg-card border border-border/70 shadow-sm text-center hover:border-amber-500/30 hover:shadow-md transition-all"
              >
                <p data-about="stat-number" data-target={content?.stat_years_value || '5'} className="text-2xl sm:text-3xl font-black text-amber-500">0+</p>
                <p className="text-[11px] font-semibold text-muted-foreground mt-1 leading-tight">{getC('stat_years_label', t.landing.statYearsLabel)}</p>
              </div>
              <div
                data-about="stat-card"
                className="p-4 rounded-2xl bg-card border border-border/70 shadow-sm text-center hover:border-blue-500/30 hover:shadow-md transition-all"
              >
                <p data-about="stat-number" data-target={content?.stat_projects_value || '20'} className="text-2xl sm:text-3xl font-black text-blue-600">0+</p>
                <p className="text-[11px] font-semibold text-muted-foreground mt-1 leading-tight">{getC('stat_projects_label', t.landing.statProjectsLabel)}</p>
              </div>
              <div
                data-about="stat-card"
                className="p-4 rounded-2xl bg-card border border-border/70 shadow-sm text-center hover:border-teal-500/30 hover:shadow-md transition-all"
              >
                <p data-about="stat-number" data-target={content?.stat_clients_value || '15'} className="text-2xl sm:text-3xl font-black text-teal-600">0+</p>
                <p className="text-[11px] font-semibold text-muted-foreground mt-1 leading-tight">{getC('stat_clients_label', t.landing.statClientsLabel)}</p>
              </div>
            </div>

            {/* Workspace Photos */}
            <div className="grid grid-cols-2 gap-3">
              <div className="group relative rounded-2xl overflow-hidden border border-border/70 bg-card aspect-[4/3]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={authorImg2}
                  alt="Workspace Setup"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/65 via-transparent to-transparent" />
                <div className="absolute bottom-2.5 left-3 right-3 text-white">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-amber-300">{isEn ? 'Workspace' : 'Làm việc'}</p>
                  <p className="text-[11px] font-semibold text-slate-100 leading-tight">{isEn ? 'Clean Setup' : 'Tối giản'}</p>
                </div>
              </div>

              <div className="group relative rounded-2xl overflow-hidden border border-border/70 bg-card aspect-[4/3]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={authorImg3}
                  alt="Coding & Architecture"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/65 via-transparent to-transparent" />
                <div className="absolute bottom-2.5 left-3 right-3 text-white">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-blue-300">{isEn ? 'In Action' : 'Thực chiến'}</p>
                  <p className="text-[11px] font-semibold text-slate-100 leading-tight">{isEn ? 'Architecture & AI' : 'Kiến trúc & AI'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
