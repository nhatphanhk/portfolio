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
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

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
      className="border-r border-sidebar-border bg-sidebar text-sidebar-foreground shadow-md"
      {...props}
    >
      <SidebarHeader className="border-b border-sidebar-border/80 pb-3 pt-3">
        <div className="flex items-center justify-between px-3 py-1">
          <Link
            href="/admin"
            className="flex items-center gap-2.5 font-bold text-sidebar-foreground hover:opacity-90 transition"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-xl overflow-hidden border border-sidebar-border/80 shadow-xs bg-sidebar-accent">
              <Image src="/icon.png" alt="nhatphanhk102" width={32} height={32} className="h-full w-full object-cover" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-extrabold tracking-tight text-sidebar-foreground">nhatphanhk102</span>
              <span className="text-[10px] text-sidebar-foreground/60 font-medium">Admin CMS Hub</span>
            </div>
          </Link>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-1 py-2">
        <NavMain groups={navGroups} />
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border/80 pt-2">
        <NavUser user={{ name: 'Administrator', email: userEmail, avatar: '' }} />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
