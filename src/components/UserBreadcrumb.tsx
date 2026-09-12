'use client';

import React from 'react';
import Link from 'next/link';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Home } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/context';

export interface BreadcrumbItemData {
  label: string;
  href?: string;
}

interface UserBreadcrumbProps {
  items: BreadcrumbItemData[];
  className?: string;
}

export function UserBreadcrumb({ items, className }: UserBreadcrumbProps) {
  const { t } = useLanguage();

  const getLabel = (label: string) => {
    switch (label.toLowerCase()) {
      case 'contact':
        return t('nav.contact');
      case 'skills':
        return t('nav.skills');
      case 'certifications':
        return t('nav.certifications');
      case 'projects':
        return t('nav.projects');
      case 'resume':
        return t('nav.resume');
      case 'blogs':
      case 'blog':
        return t('nav.blogs');
      case 'series':
        return t('nav.series');
      default:
        return label;
    }
  };

  return (
    <Breadcrumb className={className}>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href="/" className="inline-flex items-center gap-1.5 hover:text-foreground transition-colors">
              <Home className="h-3.5 w-3.5" />
              <span>{t('nav.home')}</span>
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>

        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const displayLabel = getLabel(item.label);
          return (
            <React.Fragment key={`${item.label}-${index}`}>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                {isLast || !item.href ? (
                  <BreadcrumbPage className="font-medium text-foreground line-clamp-1 max-w-[280px] sm:max-w-none">
                    {displayLabel}
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link href={item.href} className="hover:text-foreground transition-colors">
                      {displayLabel}
                    </Link>
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
