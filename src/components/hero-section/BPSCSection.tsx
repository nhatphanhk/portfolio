'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowRight, Briefcase, BookOpen, Award, ExternalLink, Calendar, Clock } from 'lucide-react';
import type { getPublicProjects } from '@/lib/actions/project';
import type { getPublicBlogs } from '@/lib/actions/blog';
import type { getPublicCertifications } from '@/lib/actions/certification';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface BPSCSectionProps {
  projects: Awaited<ReturnType<typeof getPublicProjects>>;
  blogs: Awaited<ReturnType<typeof getPublicBlogs>>;
  certs: Awaited<ReturnType<typeof getPublicCertifications>>;
}

export function BPSCSection({ projects, blogs, certs }: BPSCSectionProps) {
  const featuredProjects = projects.filter(p => p.featured);
  const recentPosts = blogs.slice(0, 3);
  const certifications = certs.filter(c => c.status === 'ACTIVE').slice(0, 3);

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
    <section ref={sectionRef} id="highlights" className="relative py-28 overflow-hidden bg-background">
      {/* Parallax ambient background glows */}
      <div
        ref={orb1Ref}
        className="absolute top-1/4 -left-20 w-80 h-80 rounded-full pointer-events-none opacity-30 blur-3xl"
        style={{
          background: 'radial-gradient(circle, oklch(0.72 0.18 78 / 30%) 0%, transparent 70%)',
        }}
        aria-hidden="true"
      />
      <div
        ref={orb2Ref}
        className="absolute top-2/3 -right-20 w-96 h-96 rounded-full pointer-events-none opacity-25 blur-3xl"
        style={{
          background: 'radial-gradient(circle, oklch(0.42 0.22 255 / 25%) 0%, transparent 70%)',
        }}
        aria-hidden="true"
      />

      <div className="max-w-6xl mx-auto px-6 space-y-24 relative z-10">
        {/* ══ FEATURED PROJECTS ══ */}
        <div>
          <div
            data-bpsc="section-header"
            className="flex items-end justify-between mb-10 pb-4 border-b border-border/70"
          >
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600">
                  <Briefcase className="w-4 h-4" />
                </span>
                <p className="text-xs font-black uppercase tracking-widest text-amber-600">
                  Portfolio Highlights
                </p>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                Featured Projects
              </h2>
            </div>
            <Link
              href="/project"
              className="group inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-600 hover:text-primary transition-colors"
            >
              <span>Explore all</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          <div data-bpsc="projects-grid" className="grid md:grid-cols-2 gap-6">
            {featuredProjects.map(project => (
              <Link
                data-bpsc="project-card"
                key={project.id}
                href={`/project/${project.slug}`}
                className="group relative p-7 rounded-3xl bg-white border border-border/80 shadow-md shadow-slate-900/5 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300 hover:-translate-y-1.5"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-extrabold text-lg sm:text-xl text-slate-900 group-hover:text-primary transition-colors">
                    {project.title}
                  </h3>
                  <div className="p-2 rounded-full bg-slate-100 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-200">
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </div>
                </div>

                <p className="text-sm text-slate-600 mb-6 line-clamp-2 leading-relaxed">
                  {project.description}
                </p>

                <div className="flex flex-wrap gap-1.5">
                  {project.technologies?.slice(0, 4).map((tech: string) => (
                    <span
                      key={tech}
                      className="px-2.5 py-1 text-xs rounded-lg font-bold"
                      style={{
                        background: 'oklch(0.72 0.18 78 / 10%)',
                        color: 'oklch(0.40 0.16 78)',
                      }}
                    >
                      {tech}
                    </span>
                  ))}
                  {project.technologies.length > 4 && (
                    <span
                      className="px-2.5 py-1 text-xs rounded-lg font-semibold bg-slate-100 text-slate-600"
                    >
                      +{project.technologies.length - 4}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* ══ RECENT BLOG POSTS ══ */}
        <div>
          <div
            data-bpsc="section-header"
            className="flex items-end justify-between mb-10 pb-4 border-b border-border/70"
          >
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="p-1.5 rounded-lg bg-blue-500/10 text-blue-600">
                  <BookOpen className="w-4 h-4" />
                </span>
                <p className="text-xs font-black uppercase tracking-widest text-blue-600">
                  Articles & Thoughts
                </p>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                Latest Publications
              </h2>
            </div>
            <Link
              href="/blog"
              className="group inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors"
            >
              <span>View all posts</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          <div data-bpsc="blogs-list" className="space-y-3">
            {recentPosts.map(post => (
              <Link
                data-bpsc="blog-row"
                key={post.id}
                href={`/blog/${post.slug}`}
                className="group flex items-center justify-between p-5 rounded-2xl bg-white border border-border/70 shadow-xs hover:border-blue-500/40 hover:shadow-lg hover:shadow-blue-500/5 transition-all duration-200"
              >
                <div className="flex-1 min-w-0 pr-6">
                  <h3 className="font-bold text-base sm:text-lg text-slate-900 group-hover:text-blue-600 transition-colors truncate mb-1.5">
                    {post.title}
                  </h3>
                  <div className="flex items-center gap-4 text-xs text-slate-500 font-medium">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {new Date(post.publishedAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {post.readTime}
                    </span>
                  </div>
                </div>

                <div className="p-2 rounded-xl bg-slate-50 group-hover:bg-blue-50 text-slate-400 group-hover:text-blue-600 transition-colors shrink-0">
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* ══ CERTIFICATIONS ══ */}
        <div>
          <div
            data-bpsc="section-header"
            className="flex items-end justify-between mb-10 pb-4 border-b border-border/70"
          >
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="p-1.5 rounded-lg bg-teal-500/10 text-teal-600">
                  <Award className="w-4 h-4" />
                </span>
                <p className="text-xs font-black uppercase tracking-widest text-teal-600">
                  Credentials & Badges
                </p>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                Verified Certifications
              </h2>
            </div>
            <Link
              href="/certifications"
              className="group inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-600 hover:text-teal-600 transition-colors"
            >
              <span>View all certs</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          <div data-bpsc="certs-grid" className="grid sm:grid-cols-2 md:grid-cols-3 gap-5">
            {certifications.map(cert => (
              <div
                data-bpsc="cert-card"
                key={cert.id}
                className="p-6 rounded-2xl bg-white border border-border/80 shadow-xs hover:border-teal-500/40 hover:shadow-lg hover:shadow-teal-500/5 transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="w-8 h-8 rounded-xl bg-teal-500/10 text-teal-600 flex items-center justify-center mb-3">
                    <Award className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-sm text-slate-900 line-clamp-2 mb-1">
                    {cert.name}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mb-4">{cert.issuer}</p>
                </div>

                {cert.credentialUrl && (
                  <a
                    href={cert.credentialUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-600 hover:text-teal-700 transition-colors"
                  >
                    <span>Verify Credential</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
