import Link from 'next/link';
import { ArrowRight, MapPin, Mail } from 'lucide-react';
import { PROFILE } from '@/data/content';
import { SKILLS } from '@/data/skills';

/**
 * About snapshot section on the homepage — a teaser that drives visitors
 * to the full /about page.
 */
export function AboutSection() {
  const topSkills = SKILLS.filter(s => s.level >= 4).slice(0, 8);

  return (
    <section id="about" className="py-24 bg-muted/30">
      <div className="max-w-5xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Text */}
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-3">
              About Me
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              Building the web,{' '}
              <span className="text-muted-foreground font-light">one project at a time.</span>
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-6">{PROFILE.bio}</p>

            <div className="flex flex-col gap-2 text-sm text-muted-foreground mb-8">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                {PROFILE.location}
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <a href={`mailto:${PROFILE.email}`} className="hover:text-foreground transition-colors">
                  {PROFILE.email}
                </a>
              </div>
            </div>

            <Link
              href="/about"
              className="inline-flex items-center gap-2 text-sm font-medium text-foreground hover:gap-3 transition-all duration-200"
            >
              Read full bio
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Skills preview */}
          <div>
            <p className="text-sm font-semibold text-muted-foreground mb-4">Core Technologies</p>
            <div className="flex flex-wrap gap-2">
              {topSkills.map(skill => (
                <span
                  key={skill.id}
                  className="px-3 py-1.5 text-sm bg-background border border-border rounded-md text-foreground hover:border-foreground transition-colors"
                >
                  {skill.name}
                </span>
              ))}
            </div>

            <div className="mt-8 pt-8 border-t border-border grid grid-cols-3 gap-6">
              <div>
                <p className="text-3xl font-bold text-foreground">5+</p>
                <p className="text-xs text-muted-foreground mt-1">Years Experience</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-foreground">20+</p>
                <p className="text-xs text-muted-foreground mt-1">Projects Delivered</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-foreground">15+</p>
                <p className="text-xs text-muted-foreground mt-1">Happy Clients</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
