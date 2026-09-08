'use client';

import * as React from 'react';
import {
  Award,
  BookOpen,
  Code,
  UserRound,
  Layers,
  Map,
  Mail,
  LayoutDashboard,
  LayoutTemplate,
  ShieldCheck,
} from 'lucide-react';
import Link from 'next/link';

import { NavMain, type NavGroup } from './NavMain';
import { NavUser } from './NavUser';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@/components/ui/sidebar';

const navGroups: NavGroup[] = [
  {
    label: 'Overview',
    items: [
      {
        title: 'Dashboard',
        url: '/admin',
        icon: LayoutDashboard,
      },
    ],
  },
  {
    label: 'Content Management',
    items: [
      {
        title: 'Landing Page',
        url: '/admin/landing',
        icon: LayoutTemplate,
      },
      {
        title: 'Resume / CV',
        url: '/admin/resume',
        icon: UserRound,
      },
      {
        title: 'Blogs',
        url: '/admin/blogs',
        icon: BookOpen,
        items: [
          {
            title: 'All Posts',
            url: '/admin/blogs',
          },
          {
            title: 'Series',
            url: '/admin/blogs/series',
          },
          {
            title: 'Analytics',
            url: '/admin/blogs/dashboard',
          },
        ],
      },
      {
        title: 'Projects',
        url: '/admin/projects',
        icon: Code,
        items: [
          {
            title: 'All Projects',
            url: '/admin/projects',
          },
          {
            title: 'Analytics',
            url: '/admin/projects/dashboard',
          },
        ],
      },
    ],
  },
  {
    label: 'Competencies',
    items: [
      {
        title: 'Skills',
        url: '/admin/skills',
        icon: Layers,
      },
      {
        title: 'Certifications',
        url: '/admin/certifications',
        icon: Award,
      },
    ],
  },
  {
    label: 'Audience & Logs',
    items: [
      {
        title: 'Contact Inbox',
        url: '/admin/contacts',
        icon: Mail,
      },
      {
        title: 'Visitor Logs',
        url: '/admin/visitors',
        icon: Map,
      },
    ],
  },
];

export function AppSidebar({
  userEmail,
  ...props
}: React.ComponentProps<typeof Sidebar> & { userEmail: string }) {
  return (
    <Sidebar
      collapsible="icon"
      className="border-r border-border/80 bg-sidebar-background text-sidebar-foreground shadow-xs"
      {...props}
    >
      <SidebarHeader className="border-b border-border/60 pb-3 pt-3">
        <div className="flex items-center justify-between px-3 py-1">
          <Link
            href="/admin"
            className="flex items-center gap-2.5 font-bold text-foreground hover:opacity-90 transition"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-xs shadow-primary/30">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-extrabold tracking-tight">Admin CMS</span>
              <span className="text-[10px] text-muted-foreground font-medium">Portfolio Hub</span>
            </div>
          </Link>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-1 py-2">
        <NavMain groups={navGroups} />
      </SidebarContent>

      <SidebarFooter className="border-t border-border/60 pt-2">
        <NavUser user={{ name: 'Administrator', email: userEmail, avatar: '' }} />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
