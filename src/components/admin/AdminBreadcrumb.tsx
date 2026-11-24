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
  nhatphanhk102: 'Tổng quan',
  admin: 'Tổng quan',
  blogs: 'Bài viết',
  editor: 'Trình soạn thảo',
  new: 'Bài mới',
  dashboard: 'Thống kê',
  series: 'Series',
  projects: 'Dự án',
  contacts: 'Liên hệ',
  visitors: 'Khách truy cập',
  skills: 'Kỹ năng',
  certifications: 'Chứng chỉ',
  media: 'Thư viện ảnh',
  resume: 'Hồ sơ CV',
  landing: 'Trang chủ',
};

/** Path segments that have no page of their own (rendered as plain text, not links). */
const NON_ROUTABLE = new Set(['editor']);

export function AdminBreadcrumb() {
  const pathname = usePathname();

  // Split path, e.g. /nhatphanhk102/blogs/editor/123 -> ['nhatphanhk102', 'blogs', 'editor', '123']
  const segments = pathname.split('/').filter(Boolean);

  if (segments.length === 0 || (segments.length === 1 && (segments[0] === 'nhatphanhk102' || segments[0] === 'admin'))) {
    return (
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage>Tổng quan</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    );
  }

  // Generate breadcrumb items
  // segments[0] is the admin root (Tổng quan)
  const items: { label: string; href: string; isCurrent: boolean; plain: boolean }[] = [];
  let accumulatedPath = '';

  segments.forEach((seg, idx) => {
    accumulatedPath += `/${seg}`;
    const isCurrent = idx === segments.length - 1;

    // Don't show raw ids: name them after the section they belong to
    let label = SEGMENT_NAMES[seg];
    if (!label) {
      if (seg.length > 20 || /^[0-9a-fA-F-]+$/.test(seg)) {
        label = segments[idx - 1] === 'skills' ? 'Chi tiết kỹ năng' : 'Sửa bài viết';
      } else {
        label = seg.charAt(0).toUpperCase() + seg.slice(1);
      }
    }

    items.push({
      label,
      href: accumulatedPath,
      isCurrent,
      plain: NON_ROUTABLE.has(seg),
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
                {isLast || item.plain ? (
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
