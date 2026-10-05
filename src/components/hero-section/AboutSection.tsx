'use client';

import { useEffect, useRef } from 'react';
import { Sparkles, Code2 } from 'lucide-react';
import type { getProfile } from '@/lib/actions/about';
import { useLanguage } from '@/lib/i18n/context';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface AboutSectionProps {
  profile: Awaited<ReturnType<typeof getProfile>>;
  content?: Record<string, string>;
}

export function AboutSection({ profile, content }: AboutSectionProps) {
  const { isEn, t } = useLanguage();
  const getC = (key: string, fallback: string) => {
    if (isEn) {
      return (content as any)?.en?.[key] || content?.[key] || fallback;
    }
    return (content as any)?.vi?.[key] || fallback;
  };

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

      // ── Header & Left Column timeline ──
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
        );

      const portraitCard = sectionRef.current?.querySelector('[data-about="portrait-card"]');
      if (portraitCard) {
        leftTl.fromTo(
          portraitCard,
          { opacity: 0, y: 35, scale: 0.96 },
          { opacity: 1, y: 0, scale: 1, duration: 0.7, ease: 'power3.out' },
          '-=0.3'
        );
      }

      // ── Right column: Bio -> Stats -> Photos ──
      const rightCol = sectionRef.current?.querySelector('[data-about="right-col"]') as HTMLElement | null;
      const rightTl = gsap.timeline({
        scrollTrigger: {
          trigger: rightCol ?? '[data-about="right-col"]',
          start: 'top 80%',
        },
      });

      rightTl.fromTo(
        '[data-about="bio-card"]',
        { opacity: 0, y: 30, scale: 0.97 },
        { opacity: 1, y: 0, scale: 1, duration: 0.7, ease: 'power3.out' }
      );

      const statCards = sectionRef.current?.querySelectorAll('[data-about="stat-card"]') ?? [];
      if (statCards.length > 0) {
        rightTl.fromTo(
          statCards,
          { opacity: 0, y: 25, scale: 0.92 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.5,
            stagger: 0.1,
            ease: 'power3.out',
          },
          '-=0.3'
        );
      }

      const photoCards = sectionRef.current?.querySelectorAll('[data-about="photo-card"]') ?? [];
      if (photoCards.length > 0) {
        rightTl.fromTo(
          photoCards,
          { opacity: 0, y: 25, scale: 0.95 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.55,
            stagger: 0.1,
            ease: 'power3.out',
          },
          '-=0.2'
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

        {/* ══ Symmetrical 2-col Grid ══ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          {/* ── LEFT COLUMN: Portrait Card (Matches Right Column Natural Height) ── */}
          <div
            data-about="portrait-card"
            className="relative group rounded-2xl overflow-hidden shadow-lg border border-border/70 bg-card min-h-[380px] lg:min-h-0"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={authorImg1}
              alt={profile.name}
              className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 text-white">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/15 backdrop-blur-md border border-white/25 text-xs font-bold mb-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>{getC('about_author_role', isEn ? 'Lead Engineer' : 'Kỹ Sư Phần Mềm')}</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black tracking-tight">{profile.name}</h3>
              <p className="text-xs sm:text-sm text-slate-300 line-clamp-1 mt-1">{profile.title}</p>
            </div>
          </div>

          {/* ── RIGHT COLUMN: Bio + Stats + Photos (Defines Natural Row Height) ── */}
          <div data-about="right-col" className="flex flex-col gap-4">
            {/* Bio Card (Clean Natural Spacing) */}
            <div data-about="bio-card" className="p-6 rounded-2xl bg-card border border-border/70 shadow-sm">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider text-blue-600 bg-blue-500/10 border border-blue-500/20 mb-3 w-fit">
                <Code2 className="w-3.5 h-3.5" />
                <span>{isEn ? 'Engineering Story' : 'Câu Chuyện Nghề Nghiệp'}</span>
              </div>
              <p className="text-sm sm:text-base text-foreground/80 leading-relaxed">
                {(isEn && (profile as any)?.translations?.en?.bio) || profile.bio}
              </p>
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
              <div data-about="photo-card" className="group relative rounded-2xl overflow-hidden border border-border/70 bg-card aspect-[4/3] sm:aspect-[16/10]">
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

              <div data-about="photo-card" className="group relative rounded-2xl overflow-hidden border border-border/70 bg-card aspect-[4/3] sm:aspect-[16/10]">
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
