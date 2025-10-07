'use client';

import * as React from 'react';
import {
  Award,
  BookOpen,
  Code,
  Frame,
  UserRound,
  Layers,
  Map,
  PieChart,
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
const data = {
  user: {
    name: 'shadcn',
    email: 'm@example.com',
    avatar: '/avatars/shadcn.jpg',
  },
  navMain: [
    {
      title: 'About',
      url: '/admin/about',
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
          url: '#',
        },
        {
          title: 'Lists',
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
          url: '#',
        },
        {
          title: 'Lists',
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
  ],
  projects: [
    {
      name: 'Design Engineering',
      url: '#',
      icon: Frame,
    },
    {
      name: 'Sales & Marketing',
      url: '#',
      icon: PieChart,
    },
    {
      name: 'Travel',
      url: '#',
      icon: Map,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <NavUser user={data.user} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>Nhatphanhk102</SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
