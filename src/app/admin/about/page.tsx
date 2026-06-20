import { PROFILE, EXPERIENCES, EDUCATION } from '@/data/content';
import { UserRound, MapPin, Mail, Globe } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'About — Admin' };

export default function AdminAboutPage() {
  return (
    <main className="flex flex-1 flex-col gap-6 p-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">About & Profile</h1>
          <p className="text-sm text-muted-foreground">Manage your public profile information</p>
        </div>
        <button type="button" className="inline-flex items-center gap-2 px-4 py-2 bg-foreground text-background rounded-lg text-sm font-medium hover:bg-foreground/90 transition-colors">
          Edit Profile
        </button>
      </div>

      {/* Profile Summary */}
      <div className="p-6 rounded-xl border border-border bg-card">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
            <UserRound className="h-5 w-5 text-muted-foreground" />
          </div>
          <div>
            <p className="font-semibold text-foreground">{PROFILE.name}</p>
            <p className="text-sm text-muted-foreground">{PROFILE.title}</p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-4 w-4" />
            {PROFILE.location}
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Mail className="h-4 w-4" />
            {PROFILE.email}
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-border">
          <p className="text-sm text-muted-foreground leading-relaxed">{PROFILE.bio}</p>
        </div>
      </div>

      {/* Social Links */}
      <div className="p-6 rounded-xl border border-border bg-card">
        <h2 className="font-semibold text-foreground mb-4">Social Links</h2>
        <div className="space-y-3">
          {PROFILE.socialLinks.map(link => (
            <div key={link.platform} className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium text-foreground">{link.platform}</span>
              </div>
              <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">
                {link.url}
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* Experience */}
      <div className="p-6 rounded-xl border border-border bg-card">
        <h2 className="font-semibold text-foreground mb-4">Experience ({EXPERIENCES.length})</h2>
        <div className="space-y-4">
          {EXPERIENCES.map(exp => (
            <div key={exp.id} className="flex items-start justify-between gap-4 py-3 border-b border-border last:border-0">
              <div>
                <p className="font-medium text-foreground">{exp.position}</p>
                <p className="text-sm text-muted-foreground">{exp.company}</p>
              </div>
              <p className="text-xs text-muted-foreground shrink-0">
                {new Date(exp.startDate).getFullYear()} — {exp.isCurrent ? 'Present' : exp.endDate ? new Date(exp.endDate).getFullYear() : ''}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Education */}
      <div className="p-6 rounded-xl border border-border bg-card">
        <h2 className="font-semibold text-foreground mb-4">Education ({EDUCATION.length})</h2>
        <div className="space-y-3">
          {EDUCATION.map(edu => (
            <div key={edu.id} className="py-3 border-b border-border last:border-0">
              <p className="font-medium text-foreground">{edu.degree}</p>
              <p className="text-sm text-muted-foreground">{edu.institution}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {new Date(edu.startDate).getFullYear()} — {new Date(edu.endDate).getFullYear()}
              </p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
