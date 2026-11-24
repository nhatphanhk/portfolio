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
  ChartLine,
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
    label: 'Tổng quan',
    items: [
      {
        title: 'Bảng điều khiển',
        url: '/nhatphanhk102',
        icon: LayoutDashboard,
      },
    ],
  },
  {
    label: 'Quản lý nội dung',
    items: [
      {
        title: 'Trang chủ',
        url: '/nhatphanhk102/landing',
        icon: LayoutTemplate,
      },
      {
        title: 'Hồ sơ / CV',
        url: '/nhatphanhk102/resume',
        icon: UserRound,
      },
      {
        title: 'Bài viết',
        url: '/nhatphanhk102/blogs',
        icon: BookOpen,
        items: [
          {
            title: 'Tất cả bài viết',
            url: '/nhatphanhk102/blogs',
          },
          {
            title: 'Series',
            url: '/nhatphanhk102/blogs/series',
          },
          {
            title: 'Thống kê',
            url: '/nhatphanhk102/blogs/dashboard',
          },
        ],
      },
      {
        title: 'Dự án',
        url: '/nhatphanhk102/projects',
        icon: Code,
        items: [
          {
            title: 'Tất cả dự án',
            url: '/nhatphanhk102/projects',
          },
          {
            title: 'Thống kê',
            url: '/nhatphanhk102/projects/dashboard',
          },
        ],
      },
      {
        title: 'Thư viện ảnh',
        url: '/nhatphanhk102/media',
        icon: Images,
      },
    ],
  },
  {
    label: 'Năng lực',
    items: [
      {
        title: 'Kỹ năng',
        url: '/nhatphanhk102/skills',
        icon: Layers,
      },
      {
        title: 'Chứng chỉ',
        url: '/nhatphanhk102/certifications',
        icon: Award,
      },
    ],
  },
  {
    label: 'Người xem & liên hệ',
    items: [
      {
        title: 'Thống kê truy cập',
        url: '/nhatphanhk102/analytics',
        icon: ChartLine,
      },
      {
        title: 'Hộp thư liên hệ',
        url: '/nhatphanhk102/contacts',
        icon: Mail,
      },
      {
        title: 'Khách truy cập',
        url: '/nhatphanhk102/visitors',
        icon: Map,
      },
    ],
  },
];

export function AppSidebar({
  userEmail,
  userName,
  ...props
}: React.ComponentProps<typeof Sidebar> & { userEmail: string; userName: string }) {
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
              <Image src="/icon.png" alt="" width={32} height={32} className="h-full w-full object-cover" />
            </div>
            <div className="flex flex-col min-w-0 group-data-[collapsible=icon]:hidden transition-all duration-200">
              <span className="text-sm font-extrabold tracking-tight text-sidebar-foreground truncate">nhatphanhk102</span>
              <span className="text-[10px] text-sidebar-foreground/60 font-medium truncate">Trang quản trị</span>
            </div>
          </Link>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-1 py-2">
        <NavMain groups={navGroups} />
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border/80 pt-2">
        <NavUser user={{ name: userName, email: userEmail }} />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
