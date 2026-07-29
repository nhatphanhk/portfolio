import React from 'react';
import { FileText, Code, Users, Layers, Award, BarChart3, TrendingUp, Mail } from 'lucide-react';
import { getAllBlogsFromDb } from '@/lib/actions/blog';
import { getAllProjectsFromDb } from '@/lib/actions/project';
import { getAllSkillsFromDb } from '@/lib/actions/skill';
import { getAllCertificationsFromDb } from '@/lib/actions/certification';
import { getAllContactsFromDb } from '@/lib/actions/contact';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Dashboard — Admin' };

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
}

function StatCard({ title, value, icon: Icon, description }: StatCardProps) {
  return (
    <div className="p-6 rounded-xl border border-border bg-card">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <div className="p-2 rounded-lg bg-muted">
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>
      <p className="text-3xl font-bold text-foreground">{value}</p>
      {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
    </div>
  );
}

export default async function DashboardPage() {
  const blogs = await getAllBlogsFromDb();
  const projects = await getAllProjectsFromDb();
  const certifications = await getAllCertificationsFromDb();
  const skills = await getAllSkillsFromDb();
  const contacts = await getAllContactsFromDb();

  const stats = [
    { title: 'Blog Posts', value: blogs.length, icon: FileText, description: 'Total articles' },
    { title: 'Projects', value: projects.length, icon: Code, description: 'Total projects' },
    { title: 'Skills', value: skills.length, icon: Layers, description: 'Tracked technologies' },
    { title: 'Certifications', value: certifications.length, icon: Award, description: 'Credentials earned' },
    { title: 'Messages', value: contacts.filter(c => c.status === 'UNREAD').length, icon: Mail, description: 'Unread contact messages' },
    { title: 'Page Views', value: 0, icon: BarChart3, description: 'All time (analytics pending)' },
  ] as const;

  const recentPosts = blogs.slice(0, 3);
  const recentProjects = projects.slice(0, 3);

  return (
    <main className="flex flex-1 flex-col gap-6 p-6 max-w-6xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Overview of your portfolio content</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {stats.map(stat => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Recent Posts */}
        <div className="p-6 rounded-xl border border-border bg-card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-foreground">Recent Blog Posts</h2>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="space-y-3">
            {recentPosts.map(post => (
              <div key={post.id} className="flex items-start gap-3 py-2 border-b border-border last:border-0">
                <FileText className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground truncate">{post.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(post.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                </div>
                <span className={`px-2 py-0.5 text-xs rounded-full shrink-0 ${post.status === 'PUBLISHED' ? 'bg-green-500/10 text-green-600 dark:text-green-400' : 'bg-muted text-muted-foreground'}`}>
                  {post.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Projects */}
        <div className="p-6 rounded-xl border border-border bg-card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-foreground">Recent Projects</h2>
            <Users className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="space-y-3">
            {recentProjects.map(project => (
              <div key={project.id} className="flex items-start gap-3 py-2 border-b border-border last:border-0">
                <Code className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground truncate">{project.title}</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {project.tags.slice(0, 2).map(pt => (
                      <span key={pt.tag.name} className="text-xs text-muted-foreground">{pt.tag.name}</span>
                    ))}
                  </div>
                </div>
                <span className={`px-2 py-0.5 text-xs rounded-full shrink-0 ${
                  project.featured
                    ? 'bg-primary/10 text-primary'
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {project.featured ? 'Featured' : 'Active'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
