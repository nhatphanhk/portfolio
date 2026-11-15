'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowRight, Briefcase, BookOpen, Award, ExternalLink, Calendar, Clock } from 'lucide-react';
import type { getPublicProjects } from '@/lib/actions/project';
import type { getPublicBlogs } from '@/lib/actions/blog';
import type { getPublicCertifications } from '@/lib/actions/certification';
import { useLanguage } from '@/lib/i18n/context';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { formatDate } from '@/lib/utils';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface BPSCSectionProps {
  projects: Awaited<ReturnType<typeof getPublicProjects>>;
  blogs: Awaited<ReturnType<typeof getPublicBlogs>>;
  certs: Awaited<ReturnType<typeof getPublicCertifications>>;
  content?: Record<string, string>;
}

export function BPSCSection({ projects, blogs, certs, content }: BPSCSectionProps) {
  const { isEn, t } = useLanguage();
  const getC = (key: string, fallback: string) => {
    if (isEn) {
      return (content as any)?.en?.[key] || content?.[key] || fallback;
    }
    return (content as any)?.vi?.[key] || fallback;
  };
  const featuredProjects = projects.filter(p => p.featured).slice(0, 3);
  const recentPosts = blogs.slice(0, 3);
  // Same rule as /certifications: a passed expiry date means expired even if the status was never flipped
  const now = Date.now();
  const certifications = certs
    .filter(c => c.status === 'ACTIVE' && !(c.expiryDate && new Date(c.expiryDate).getTime() < now))
    .slice(0, 3);

  const sectionRef = useRef<HTMLElement>(null);
  const orb1Ref = useRef<HTMLDivElement>(null);
  const orb2Ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;
    const ctx = gsap.context(() => {
      // ── Background parallax floating gradient orbs ──
      if (orb1Ref.current && sectionRef.current) {
        gsap.to(orb1Ref.current, {
          y: 180,
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1.2,
          },
        });
      }

      if (orb2Ref.current && sectionRef.current) {
        gsap.to(orb2Ref.current, {
          y: -140,
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1.5,
          },
        });
      }

      // ── Section Headers Animations ──
      const headers = gsap.utils.toArray<HTMLElement>('[data-bpsc="section-header"]', sectionRef.current ?? undefined);
      headers.forEach(el => {
        gsap.fromTo(
          el,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 0.7,
            ease: 'power3.out',
            scrollTrigger: { trigger: el, start: 'top 85%' },
          }
        );
      });

      // ── Project Cards 3D-Like Stagger Reveal ──
      const projectCards = gsap.utils.toArray<HTMLElement>('[data-bpsc="project-card"]', sectionRef.current ?? undefined);
      const projectsGrid = sectionRef.current?.querySelector('[data-bpsc="projects-grid"]') as HTMLElement | null;
      if (projectCards.length > 0) {
        gsap.fromTo(
          projectCards,
          { opacity: 0, scale: 0.92, y: 45 },
          {
            opacity: 1,
            scale: 1,
            y: 0,
            duration: 0.75,
            stagger: 0.15,
            ease: 'power3.out',
            scrollTrigger: { trigger: projectsGrid ?? projectCards[0], start: 'top 82%' },
          }
        );
      }

      // ── Blog Rows Staggered Slide In ──
      const blogRows = gsap.utils.toArray<HTMLElement>('[data-bpsc="blog-row"]', sectionRef.current ?? undefined);
      const blogsList = sectionRef.current?.querySelector('[data-bpsc="blogs-list"]') as HTMLElement | null;
      if (blogRows.length > 0) {
        gsap.fromTo(
          blogRows,
          { opacity: 0, x: -35 },
          {
            opacity: 1,
            x: 0,
            duration: 0.6,
            stagger: 0.12,
            ease: 'power2.out',
            scrollTrigger: { trigger: blogsList ?? blogRows[0], start: 'top 85%' },
          }
        );
      }

      // ── Certification Cards Spring In ──
      const certCards = gsap.utils.toArray<HTMLElement>('[data-bpsc="cert-card"]', sectionRef.current ?? undefined);
      const certsGrid = sectionRef.current?.querySelector('[data-bpsc="certs-grid"]') as HTMLElement | null;
      if (certCards.length > 0) {
        gsap.fromTo(
          certCards,
          { opacity: 0, y: 35, scale: 0.94 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.65,
            stagger: 0.12,
            ease: 'back.out(1.5)',
            scrollTrigger: { trigger: certsGrid ?? certCards[0], start: 'top 85%' },
          }
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="highlights"
      hidden={featuredProjects.length === 0 && recentPosts.length === 0 && certifications.length === 0}
      className="relative py-20 overflow-hidden bg-background"
    >
      {/* Parallax ambient background glows */}
      <div
        ref={orb1Ref}
        className="absolute top-1/4 -left-20 w-72 h-72 rounded-full pointer-events-none opacity-25 blur-3xl"
        style={{
          background: 'radial-gradient(circle, oklch(0.72 0.18 78 / 25%) 0%, transparent 70%)',
        }}
        aria-hidden="true"
      />
      <div
        ref={orb2Ref}
        className="absolute top-2/3 -right-20 w-80 h-80 rounded-full pointer-events-none opacity-20 blur-3xl"
        style={{
          background: 'radial-gradient(circle, oklch(0.42 0.22 255 / 20%) 0%, transparent 70%)',
        }}
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20 relative z-10">
        {/* ══ FEATURED PROJECTS ══ (each block hides itself when empty) */}
        {featuredProjects.length > 0 && (
        <div>
          <div
            data-bpsc="section-header"
            className="flex flex-wrap items-end justify-between mb-8 pb-4 border-b border-border/70 gap-3"
          >
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600">
                  <Briefcase className="w-4 h-4" aria-hidden="true" />
                </span>
                <p className="text-xs font-black uppercase tracking-widest text-amber-600">
                  {getC('bpsc_projects_badge', t.landing.bpscProjectsBadge)}
                </p>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                {getC('bpsc_projects_title', t.landing.bpscProjectsTitle)}
              </h2>
            </div>
            <Link
              href="/project"
              className="group inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-muted-foreground hover:text-primary transition-colors shrink-0"
            >
              <span>{t.landing.viewAllProjects}</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </Link>
          </div>

          <div data-bpsc="projects-grid" className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {featuredProjects.map(project => {
              const projectTitle = (isEn && (project as any).translations?.en?.title) || project.title;
              const projectDesc = (isEn && (project as any).translations?.en?.description) || project.description;
              return (
              <Link
                data-bpsc="project-card"
                key={project.id}
                href={`/project/${project.slug}`}
                className="group relative p-6 rounded-2xl bg-card border border-border/80 shadow-sm hover:shadow-xl hover:shadow-primary/10 hover:border-primary/40 transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between gap-4"
              >
                <div>
                  <div className="flex items-start justify-between mb-2.5">
                    <h3 className="font-extrabold text-base sm:text-lg text-foreground group-hover:text-primary transition-colors leading-snug">
                      {projectTitle}
                    </h3>
                    <div aria-hidden="true" className="p-2 rounded-full bg-muted/80 text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground group-hover:scale-110 transition-all duration-300 shrink-0 ml-2">
                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </div>
                  </div>

                  {projectDesc && (
                    <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                      {projectDesc}
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap gap-1.5 mt-1">
                  {project.technologies?.slice(0, 4).map((tech: string) => (
                    <span
                      key={tech}
                      className="px-2.5 py-1 text-xs rounded-lg font-medium bg-primary/10 text-primary border border-primary/25 transition-colors group-hover:border-primary/40"
                    >
                      {tech}
                    </span>
                  ))}
                  {project.technologies.length > 4 && (
                    <span className="px-2.5 py-1 text-xs rounded-lg font-medium bg-muted text-muted-foreground">
                      +{project.technologies.length - 4}
                    </span>
                  )}
                </div>
              </Link>
              );
            })}
          </div>
        </div>
        )}

        {/* ══ RECENT BLOG POSTS ══ */}
        {recentPosts.length > 0 && (
        <div>
          <div
            data-bpsc="section-header"
            className="flex flex-wrap items-end justify-between mb-8 pb-4 border-b border-border/70 gap-3"
          >
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="p-1.5 rounded-lg bg-blue-500/10 text-blue-600">
                  <BookOpen className="w-4 h-4" aria-hidden="true" />
                </span>
                <p className="text-xs font-black uppercase tracking-widest text-blue-600">
                  {getC('bpsc_blogs_badge', t.landing.bpscBlogsBadge)}
                </p>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                {getC('bpsc_blogs_title', t.landing.bpscBlogsTitle)}
              </h2>
            </div>
            <Link
              href="/blog"
              className="group inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-muted-foreground hover:text-blue-600 transition-colors shrink-0"
            >
              <span>{t.landing.viewAllBlogs}</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </Link>
          </div>

          <div data-bpsc="blogs-list" className="space-y-3">
            {recentPosts.map((post, idx) => (
              <Link
                data-bpsc="blog-row"
                key={post.id}
                href={`/blog/${post.slug}`}
                className="group flex items-center gap-3.5 sm:gap-5 p-3.5 sm:p-5 rounded-2xl bg-card border border-border/80 shadow-sm hover:border-blue-500/40 hover:shadow-lg hover:shadow-blue-500/8 hover:-translate-y-0.5 transition-all duration-300 min-w-0"
              >
                {/* Number badge */}
                <div aria-hidden="true" className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500/15 to-blue-600/5 text-blue-600 border border-blue-500/20 flex items-center justify-center text-xs font-black shrink-0">
                  {String(idx + 1).padStart(2, '0')}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-sm sm:text-base text-foreground group-hover:text-blue-600 transition-colors truncate mb-1">
                    {post.title}
                  </h3>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground font-medium">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-muted-foreground/60" aria-hidden="true" />
                      {formatDate(post.publishedAt, isEn ? 'en' : 'vi')}
                    </span>
                    <span className="text-border" aria-hidden="true">·</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-muted-foreground/60" aria-hidden="true" />
                      {post.readTime} {t('common.readingTime')}
                    </span>
                  </div>
                </div>

                <div aria-hidden="true" className="p-2 rounded-xl bg-muted/60 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 shrink-0">
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </div>
              </Link>
            ))}
          </div>
        </div>
        )}

        {/* ══ CERTIFICATIONS ══ */}
        {certifications.length > 0 && (
        <div>
          <div
            data-bpsc="section-header"
            className="flex flex-wrap items-end justify-between mb-8 pb-4 border-b border-border/70 gap-3"
          >
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="p-1.5 rounded-lg bg-teal-500/10 text-teal-600">
                  <Award className="w-4 h-4" aria-hidden="true" />
                </span>
                <p className="text-xs font-black uppercase tracking-widest text-teal-600">
                  {getC('bpsc_certs_badge', t.landing.bpscCertsBadge)}
                </p>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                {getC('bpsc_certs_title', t.landing.bpscCertsTitle)}
              </h2>
            </div>
            <Link
              href="/certifications"
              className="group inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-muted-foreground hover:text-teal-600 transition-colors shrink-0"
            >
              <span>{t.landing.viewAllCerts}</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </Link>
          </div>

          <div data-bpsc="certs-grid" className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {certifications.map(cert => (
              // With a credential URL the "verify" link is stretched over the whole card
              <article
                data-bpsc="cert-card"
                key={cert.id}
                className="group relative p-6 rounded-2xl bg-card border border-border/70 shadow-sm focus-within:ring-2 focus-within:ring-ring hover:border-teal-500/40 hover:shadow-lg hover:shadow-teal-500/8 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between gap-4"
              >
                <div>
                  <div className="flex items-start gap-3 mb-3">
                    <div aria-hidden="true" className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-600 border border-teal-500/20 flex items-center justify-center shrink-0">
                      <Award className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-sm text-foreground line-clamp-2 leading-snug">
                        {cert.name}
                      </h3>
                    </div>
                  </div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-muted text-muted-foreground border border-border/60">
                    {cert.issuer}
                  </span>
                </div>

                {cert.credentialUrl && (
                  <a
                    href={cert.credentialUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${t.landing.verifyCredential}: ${cert.name}`}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-700 hover:text-teal-800 transition-colors group-hover:translate-x-0.5 after:absolute after:inset-0 after:rounded-2xl focus:outline-none"
                  >
                    <span>{t.landing.verifyCredential}</span>
                    <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                  </a>
                )}
              </article>
            ))}
          </div>
        </div>
        )}
      </div>
    </section>
  );
}
