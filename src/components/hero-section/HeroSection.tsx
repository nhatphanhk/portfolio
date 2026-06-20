'use client';

import Link from 'next/link';
import { Github, Linkedin, Twitter, ArrowRight, Download } from 'lucide-react';
import { PROFILE } from '@/data/content';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Github,
  Linkedin,
  Twitter,
};

/**
 * Hero section — the first thing visitors see on the homepage.
 * Introduces the portfolio owner with CTA buttons and social links.
 */
export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-background" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      </div>

      <div className="max-w-5xl mx-auto px-6 py-24 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-border bg-muted/50 text-sm text-muted-foreground mb-8">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          Available for new opportunities
        </div>

        {/* Name */}
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-foreground mb-6">
          Hi, I&apos;m{' '}
          <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            {PROFILE.name}
          </span>
        </h1>

        {/* Title */}
        <p className="text-2xl md:text-3xl text-muted-foreground font-light mb-6">
          {PROFILE.title}
        </p>

        {/* Tagline */}
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed">
          {PROFILE.tagline}
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-12">
          <Link
            id="hero-view-projects"
            href="/project"
            className="inline-flex items-center gap-2 px-6 py-3 bg-foreground text-background rounded-lg font-medium hover:bg-foreground/90 transition-all duration-200 hover:gap-3"
          >
            View Projects
            <ArrowRight className="h-4 w-4" />
          </Link>
          <a
            id="hero-download-resume"
            href={PROFILE.resumeUrl}
            download
            className="inline-flex items-center gap-2 px-6 py-3 border border-border rounded-lg font-medium text-foreground hover:bg-accent transition-all duration-200"
          >
            <Download className="h-4 w-4" />
            Download Resume
          </a>
        </div>

        {/* Social Links */}
        <div className="flex items-center justify-center gap-4">
          {PROFILE.socialLinks.map(social => {
            const Icon = ICON_MAP[social.iconName];
            return (
              <a
                key={social.platform}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.platform}
                className="p-3 rounded-full border border-border text-muted-foreground hover:text-foreground hover:border-foreground hover:bg-accent transition-all duration-200"
              >
                {Icon ? <Icon className="h-5 w-5" /> : null}
              </a>
            );
          })}
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 rounded-full border-2 border-border flex items-start justify-center pt-1.5">
            <div className="w-1.5 h-3 rounded-full bg-muted-foreground/50" />
          </div>
        </div>
      </div>
    </section>
  );
}
