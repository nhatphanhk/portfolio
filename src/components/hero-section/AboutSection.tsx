'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowRight, MapPin, Mail, Sparkles, Code2 } from 'lucide-react';
import type { getProfile } from '@/lib/actions/about';
import type { getPublicSkillsByCategory } from '@/lib/actions/skill';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface AboutSectionProps {
  profile: Awaited<ReturnType<typeof getProfile>>;
  skillsByCategory: Awaited<ReturnType<typeof getPublicSkillsByCategory>>;
}

export function AboutSection({ profile, skillsByCategory }: AboutSectionProps) {
  const allSkills = Object.values(skillsByCategory).flat();
  const topSkills = allSkills.filter(s => s.level >= 4).slice(0, 10);

  const sectionRef = useRef<HTMLElement>(null);
  const glowOrbRef = useRef<HTMLDivElement>(null);

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
      const leftTl = gsap.timeline({
        scrollTrigger: {
          trigger: '[data-about="content-col"]',
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
        )
        .fromTo(
          '[data-about="meta-item"]',
          { opacity: 0, x: -20 },
          { opacity: 1, x: 0, duration: 0.5, stagger: 0.1, ease: 'power2.out' },
          '-=0.4'
        )
        .fromTo(
          '[data-about="cta"]',
          { opacity: 0, y: 15 },
          { opacity: 1, y: 0, duration: 0.6, ease: 'back.out(1.7)' },
          '-=0.3'
        );

      // ── Right column: Card wrapper & Skill tags stagger with elastic pop ──
      const rightTl = gsap.timeline({
        scrollTrigger: {
          trigger: '[data-about="skills-col"]',
          start: 'top 80%',
        },
      });

      rightTl
        .fromTo(
          '[data-about="skills-card"]',
          { opacity: 0, y: 40, scale: 0.95 },
          { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: 'power3.out' }
        )
        .fromTo(
          '[data-about="skill-tag"]',
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
        )
        .fromTo(
          '[data-about="stat-card"]',
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
      className="relative py-28 overflow-hidden"
      style={{
        background: 'linear-gradient(165deg, oklch(0.96 0.02 80) 0%, oklch(0.98 0.01 85) 45%, oklch(0.95 0.02 255 / 20%) 100%)',
      }}
    >
      {/* Background ambient floating glow orb (Parallax) */}
      <div
        ref={glowOrbRef}
        className="absolute top-12 -right-24 w-96 h-96 rounded-full pointer-events-none opacity-40 blur-3xl"
        style={{
          background: 'radial-gradient(circle, oklch(0.72 0.18 78 / 35%) 0%, oklch(0.42 0.22 255 / 15%) 60%, transparent 80%)',
        }}
        aria-hidden="true"
      />

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-14 items-center">
          {/* ══ Left Column (Content) ══ */}
          <div data-about="content-col" className="lg:col-span-6">
            {/* Section Badge */}
            <div
              data-about="label"
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-4 shadow-xs"
              style={{
                background: 'oklch(0.72 0.18 78 / 15%)',
                color: 'oklch(0.55 0.2 78)',
                border: '1px solid oklch(0.72 0.18 78 / 30%)',
              }}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>About Me</span>
            </div>

            {/* Heading */}
            <h2
              data-about="heading"
              className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-[1.15] mb-4"
              style={{ color: 'oklch(0.16 0.04 255)' }}
            >
              Building the web,{' '}
              <span className="text-gold-shimmer font-black">one project at a time.</span>
            </h2>

            {/* Expanding Accent Line */}
            <div
              data-about="accent-line"
              className="h-1 w-24 rounded-full mb-6"
              style={{
                background: 'linear-gradient(90deg, oklch(0.72 0.18 78), oklch(0.42 0.22 255))',
                boxShadow: '0 0 12px oklch(0.72 0.18 78 / 40%)',
              }}
            />

            {/* Bio Paragraph */}
            <p
              data-about="bio"
              className="text-base sm:text-lg text-slate-700 leading-relaxed mb-6 font-normal"
            >
              {profile.bio}
            </p>

            {/* Meta Information */}
            <div className="flex flex-col sm:flex-row gap-4 text-sm text-slate-600 mb-8">
              {profile.location && (
                <div data-about="meta-item" className="flex items-center gap-2 font-medium">
                  <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <span>{profile.location}</span>
                </div>
              )}
              {profile.email && (
                <div data-about="meta-item" className="flex items-center gap-2 font-medium">
                  <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-600">
                    <Mail className="h-4 w-4" />
                  </div>
                  <a href={`mailto:${profile.email}`} className="hover:text-primary transition-colors">
                    {profile.email}
                  </a>
                </div>
              )}
            </div>

            {/* CTA Button */}
            <Link
              data-about="cta"
              href="/resume"
              className="group inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm bg-primary text-primary-foreground shadow-md shadow-primary/25 hover:gap-3 hover:scale-105 active:scale-95 transition-all duration-200"
            >
              <span>Read Full Resume & Bio</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          {/* ══ Right Column (Skills & Dynamic Stats) ══ */}
          <div data-about="skills-col" className="lg:col-span-6">
            <div
              data-about="skills-card"
              className="p-7 sm:p-9 rounded-3xl bg-white border border-border/80 shadow-xl shadow-slate-900/5 relative overflow-hidden"
            >
              <div className="flex items-center justify-between mb-5">
                <p className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Code2 className="w-4 h-4 text-primary" />
                  <span>Core Technologies</span>
                </p>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                  Top Stack
                </span>
              </div>

              {/* Skill Tags */}
              <div className="flex flex-wrap gap-2 mb-8">
                {topSkills.map(skill => (
                  <span
                    data-about="skill-tag"
                    key={skill.id}
                    className="group px-3.5 py-2 text-xs font-bold rounded-xl cursor-default transition-all duration-200"
                    style={{
                      background: 'oklch(0.72 0.18 78 / 10%)',
                      border: '1px solid oklch(0.72 0.18 78 / 30%)',
                      color: 'oklch(0.35 0.14 78)',
                    }}
                    onMouseEnter={e => {
                      const el = e.currentTarget as HTMLElement;
                      el.style.background = 'oklch(0.72 0.18 78)';
                      el.style.color = '#0f172a';
                      el.style.borderColor = 'oklch(0.72 0.18 78)';
                      el.style.boxShadow = '0 4px 16px oklch(0.72 0.18 78 / 45%)';
                      el.style.transform = 'translateY(-2px) scale(1.05)';
                    }}
                    onMouseLeave={e => {
                      const el = e.currentTarget as HTMLElement;
                      el.style.background = 'oklch(0.72 0.18 78 / 10%)';
                      el.style.color = 'oklch(0.35 0.14 78)';
                      el.style.borderColor = 'oklch(0.72 0.18 78 / 30%)';
                      el.style.boxShadow = '';
                      el.style.transform = '';
                    }}
                  >
                    {skill.name}
                  </span>
                ))}
              </div>

              {/* Stats Row with Animated Number Counters */}
              <div className="pt-6 border-t border-border/70 grid grid-cols-3 gap-3 sm:gap-4 text-center">
                {/* Stat 1 */}
                <div
                  data-about="stat-card"
                  className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 transition-all hover:bg-amber-500/5 hover:border-amber-500/20"
                >
                  <p
                    data-about="stat-number"
                    data-target="5"
                    className="text-2xl sm:text-3xl font-black text-amber-500"
                  >
                    0+
                  </p>
                  <p className="text-[11px] font-semibold text-slate-500 mt-1">Years Exp</p>
                </div>

                {/* Stat 2 */}
                <div
                  data-about="stat-card"
                  className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 transition-all hover:bg-blue-500/5 hover:border-blue-500/20"
                >
                  <p
                    data-about="stat-number"
                    data-target="20"
                    className="text-2xl sm:text-3xl font-black text-blue-600"
                  >
                    0+
                  </p>
                  <p className="text-[11px] font-semibold text-slate-500 mt-1">Projects</p>
                </div>

                {/* Stat 3 */}
                <div
                  data-about="stat-card"
                  className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 transition-all hover:bg-teal-500/5 hover:border-teal-500/20"
                >
                  <p
                    data-about="stat-number"
                    data-target="15"
                    className="text-2xl sm:text-3xl font-black text-teal-600"
                  >
                    0+
                  </p>
                  <p className="text-[11px] font-semibold text-slate-500 mt-1">Clients</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
