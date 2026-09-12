'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

const SEGMENT_NAMES: Record<string, string> = {
  nhatphanhk102: 'Dashboard',
  admin: 'Dashboard',
  blogs: 'Blogs',
  editor: 'Editor',
  series: 'Series',
  projects: 'Projects',
  contacts: 'Contacts',
  visitors: 'Visitor Logs',
  skills: 'Skills',
  certifications: 'Certifications',
  media: 'Media Library',
  resume: 'Resume Editor',
  landing: 'Landing Page',
};

export function AdminBreadcrumb() {
  const pathname = usePathname();

  // Split path, e.g. /nhatphanhk102/blogs/editor/123 -> ['nhatphanhk102', 'blogs', 'editor', '123']
  const segments = pathname.split('/').filter(Boolean);

  if (segments.length === 0 || (segments.length === 1 && (segments[0] === 'nhatphanhk102' || segments[0] === 'admin'))) {
    return (
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage>Dashboard</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    );
  }

  // Generate breadcrumb items
  // segments[0] is 'admin' (Dashboard)
  const items: { label: string; href: string; isCurrent: boolean }[] = [];
  let accumulatedPath = '';

  segments.forEach((seg, idx) => {
    accumulatedPath += `/${seg}`;
    const isCurrent = idx === segments.length - 1;

    // Skip showing uuid / ids as long hashes, show "Post" or "Item" instead if uuid
    let label = SEGMENT_NAMES[seg];
    if (!label) {
      if (seg.length > 20 || /^[0-9a-fA-F-]+$/.test(seg)) {
        label = 'Edit Post';
      } else {
        label = seg.charAt(0).toUpperCase() + seg.slice(1);
      }
    }

    items.push({
      label,
      href: accumulatedPath,
      isCurrent,
    });
  });

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {items.map((item, index) => {
          const isLast = item.isCurrent;

          return (
            <React.Fragment key={item.href}>
              {index > 0 && <BreadcrumbSeparator />}
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage>{item.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link href={item.href}>{item.label}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
