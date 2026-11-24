import React from 'react';
import Link from 'next/link';
import { FileText, Code, Layers, Award, BarChart3, TrendingUp, Mail, Eye, Users } from 'lucide-react';
import { getAllBlogsFromDb } from '@/lib/actions/blog';
import { getAllProjectsFromDb } from '@/lib/actions/project';
import { getAllSkillsFromDb } from '@/lib/actions/skill';
import { getAllCertificationsFromDb } from '@/lib/actions/certification';
import { getAllContactsFromDb } from '@/lib/actions/contact';
import { getRecentTraffic } from '@/lib/analytics';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { AdminPageHeader, ADMIN_PAGE_CLASS } from '@/components/admin/AdminPageHeader';
import type { Metadata } from 'next';
import { formatDate } from '@/lib/utils';

export const metadata: Metadata = { title: 'Tổng quan — Admin' };

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
  href: string;
}

function StatCard({ title, value, icon: Icon, description, href }: StatCardProps) {
  return (
    <Link
      href={href}
      className="p-6 rounded-xl border border-border bg-card hover:border-primary/40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <div className="p-2 rounded-lg bg-muted">
          <Icon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
        </div>
      </div>
      <p className="text-3xl font-bold text-foreground">{value.toLocaleString('vi-VN')}</p>
      {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
    </Link>
  );
}

export default async function DashboardPage() {
  const [blogs, projects, certifications, skills, contacts, traffic] = await Promise.all([
    getAllBlogsFromDb(),
    getAllProjectsFromDb(),
    getAllCertificationsFromDb(),
    getAllSkillsFromDb(),
    getAllContactsFromDb(),
    getRecentTraffic(7),
  ]);

  const stats: StatCardProps[] = [
    { title: 'Lượt xem trang', value: traffic.views, icon: Eye, description: '7 ngày gần nhất', href: '/nhatphanhk102/analytics?range=7' },
    { title: 'Khách truy cập', value: traffic.visitors, icon: Users, description: '7 ngày gần nhất (theo ngày)', href: '/nhatphanhk102/analytics?range=7' },
    { title: 'Bài viết', value: blogs.length, icon: FileText, description: 'Tổng số bài viết', href: '/nhatphanhk102/blogs' },
    { title: 'Dự án', value: projects.length, icon: Code, description: 'Tổng số dự án', href: '/nhatphanhk102/projects' },
    { title: 'Kỹ năng', value: skills.length, icon: Layers, description: 'Công nghệ đang theo dõi', href: '/nhatphanhk102/skills' },
    { title: 'Chứng chỉ', value: certifications.length, icon: Award, description: 'Chứng chỉ đã đạt', href: '/nhatphanhk102/certifications' },
    {
      title: 'Tin nhắn',
      value: contacts.filter(c => c.status === 'UNREAD').length,
      icon: Mail,
      description: 'Tin nhắn liên hệ chưa đọc',
      href: '/nhatphanhk102/contacts',
    },
    {
      title: 'Lượt xem',
      value: blogs.reduce((n, b) => n + (b.viewCount ?? 0), 0),
      icon: BarChart3,
      description: 'Tổng lượt xem bài viết',
      href: '/nhatphanhk102/blogs/dashboard',
    },
  ];

  const recentPosts = blogs.slice(0, 3);
  const recentProjects = projects.slice(0, 3);

  return (
    <main className={ADMIN_PAGE_CLASS}>
      <AdminPageHeader title="Tổng quan" description="Tóm tắt nội dung portfolio" />

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map(stat => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Recent Posts */}
        <section className="p-6 rounded-xl border border-border bg-card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-foreground">Bài viết gần đây</h2>
            <TrendingUp className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          </div>
          <div className="space-y-3">
            {recentPosts.length === 0 && (
              <p className="text-sm text-muted-foreground py-6 text-center">Chưa có bài viết nào.</p>
            )}
            {recentPosts.map(post => (
              <Link
                key={post.id}
                href={`/nhatphanhk102/blogs/editor/${post.id}`}
                className="flex items-start gap-3 py-2 border-b border-border last:border-0 group"
              >
                <FileText className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" aria-hidden="true" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
                    {post.title}
                  </p>
                  <p className="text-xs text-muted-foreground">{formatDate(post.createdAt, 'vi')}</p>
                </div>
                <StatusBadge status={post.status} className="shrink-0" />
              </Link>
            ))}
          </div>
        </section>

        {/* Recent Projects */}
        <section className="p-6 rounded-xl border border-border bg-card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-foreground">Dự án gần đây</h2>
            <Code className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          </div>
          <div className="space-y-3">
            {recentProjects.length === 0 && (
              <p className="text-sm text-muted-foreground py-6 text-center">Chưa có dự án nào.</p>
            )}
            {recentProjects.map(project => (
              <div key={project.id} className="flex items-start gap-3 py-2 border-b border-border last:border-0">
                <Code className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" aria-hidden="true" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground truncate">
                    {project.featured && <span aria-label="Nổi bật">★ </span>}
                    {project.title}
                  </p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {project.tags.slice(0, 2).map(pt => (
                      <span key={pt.tag.name} className="text-xs text-muted-foreground">
                        {pt.tag.name}
                      </span>
                    ))}
                  </div>
                </div>
                <StatusBadge status={project.status} className="shrink-0" />
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
