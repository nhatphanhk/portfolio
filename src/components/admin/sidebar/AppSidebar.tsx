'use client';

import * as React from 'react';
import {
  Award,
  BookOpen,
  Code,
  UserRound,
  Layers,
  Map,
  Users,
} from 'lucide-react';


import { NavMain } from './NavMain';
import { NavUser } from './NavUser';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@/components/ui/sidebar';

// This is sample data.
// Remove static user data, we'll pass it from layout
const data = {
  navMain: [
    {
      title: 'Resume',
      url: '/admin/resume',
      icon: UserRound,
    },
    {
      title: 'Blogs',
      url: '#',
      icon: BookOpen,
      isActive: true,
      items: [
        {
          title: 'Dashboard',
          url: '/admin/blogs/dashboard',
        },
        {
          title: 'All Posts',
          url: '/admin/blogs',
        },
      ],
    },
    {
      title: 'Projects',
      url: '#',
      icon: Code,
      items: [
        {
          title: 'Dashboard',
          url: '/admin/projects/dashboard',
        },
        {
          title: 'All Projects',
          url: '/admin/projects',
        },
      ],
    },
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
    {
      title: 'Contacts',
      url: '/admin/contacts',
      icon: Users,
    },
    {
      title: 'Visitor Logs',
      url: '/admin/visitors',
      icon: Map,
    },
  ],
};


export function AppSidebar({ userEmail, ...props }: React.ComponentProps<typeof Sidebar> & { userEmail: string }) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <NavUser user={{ name: 'Admin', email: userEmail, avatar: '' }} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>Nhatphanhk102</SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
