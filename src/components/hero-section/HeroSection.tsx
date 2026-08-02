'use client';

import Link from 'next/link';
import { Download, ArrowRight } from 'lucide-react';
import * as Icons from 'lucide-react';

const ICON_MAP = Icons as unknown as Record<string, React.ComponentType<{ className?: string }>>;

interface HeroSectionProps {
  profile: {
    name: string;
    title: string;
    tagline?: string;
    resumeUrl?: string;
    avatarUrl?: string;
  };
  socialLinks: Array<{ platform: string; url: string; iconName?: string | null }>;
}

/**
 * Hero section — the first thing visitors see on the homepage.
 * Introduces the portfolio owner with CTA buttons and social links.
 */
export function HeroSection({ profile, socialLinks }: HeroSectionProps) {
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
          Hi, I&apos;m <span className="text-primary">{profile.name.split(' ')[0]}</span>
          <br />
          <span className="text-4xl md:text-5xl text-muted-foreground mt-2 inline-block">
            {profile.title}
          </span>
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-lg mx-auto mb-10 leading-relaxed">
          {profile.tagline}
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
          {profile.resumeUrl && (
            <a
              href={profile.resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 border-2 border-border text-foreground font-medium rounded-full hover:bg-muted transition-colors"
            >
              <Download className="h-4 w-4" />
              Resume
            </a>
          )}
        </div>

        {/* Socials */}
        <div className="flex items-center justify-center gap-4 pt-4">
          {socialLinks.map(link => {
            const Icon = link.iconName ? ICON_MAP[link.iconName] || Icons.Link : Icons.Link;
            return (
              <a
                key={link.platform}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={link.platform}
                className="p-2.5 text-muted-foreground bg-muted/50 rounded-full hover:bg-foreground hover:text-background transition-colors"
              >
                <Icon className="h-5 w-5" />
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
