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
  Images,
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
        url: '/nhatphanhk102',
        icon: LayoutDashboard,
      },
    ],
  },
  {
    label: 'Content Management',
    items: [
      {
        title: 'Landing Page',
        url: '/nhatphanhk102/landing',
        icon: LayoutTemplate,
      },
      {
        title: 'Resume / CV',
        url: '/nhatphanhk102/resume',
        icon: UserRound,
      },
      {
        title: 'Blogs',
        url: '/nhatphanhk102/blogs',
        icon: BookOpen,
        items: [
          {
            title: 'All Posts',
            url: '/nhatphanhk102/blogs',
          },
          {
            title: 'Series',
            url: '/nhatphanhk102/blogs/series',
          },
          {
            title: 'Analytics',
            url: '/nhatphanhk102/blogs/dashboard',
          },
        ],
      },
      {
        title: 'Projects',
        url: '/nhatphanhk102/projects',
        icon: Code,
        items: [
          {
            title: 'All Projects',
            url: '/nhatphanhk102/projects',
          },
          {
            title: 'Analytics',
            url: '/nhatphanhk102/projects/dashboard',
          },
        ],
      },
      {
        title: 'Media Library',
        url: '/nhatphanhk102/media',
        icon: Images,
      },
    ],
  },
  {
    label: 'Competencies',
    items: [
      {
        title: 'Skills',
        url: '/nhatphanhk102/skills',
        icon: Layers,
      },
      {
        title: 'Certifications',
        url: '/nhatphanhk102/certifications',
        icon: Award,
      },
    ],
  },
  {
    label: 'Audience & Logs',
    items: [
      {
        title: 'Contact Inbox',
        url: '/nhatphanhk102/contacts',
        icon: Mail,
      },
      {
        title: 'Visitor Logs',
        url: '/nhatphanhk102/visitors',
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
      <SidebarHeader className="border-b border-sidebar-border/80 pb-3 pt-3 overflow-hidden">
        <div className="flex items-center justify-between px-3 py-1 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:justify-center">
          <Link
            href="/nhatphanhk102"
            className="flex items-center gap-2.5 font-bold text-sidebar-foreground hover:opacity-90 transition min-w-0"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl overflow-hidden border border-sidebar-border/80 shadow-xs bg-sidebar-accent">
              <Image src="/icon.png" alt="nhatphanhk102" width={32} height={32} className="h-full w-full object-cover" />
            </div>
            <div className="flex flex-col min-w-0 group-data-[collapsible=icon]:hidden transition-all duration-200">
              <span className="text-sm font-extrabold tracking-tight text-sidebar-foreground truncate">nhatphanhk102</span>
              <span className="text-[10px] text-sidebar-foreground/60 font-medium truncate">Admin CMS Hub</span>
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
