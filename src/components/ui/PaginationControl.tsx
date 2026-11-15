'use client';

import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/lib/i18n/context';
import { en } from '@/lib/i18n/locales/en';
import { vi } from '@/lib/i18n/locales/vi';

interface PaginationControlProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems?: number;
  pageSize?: number;
  className?: string;
  /** Force a language (the admin is always Vietnamese); defaults to the visitor's locale. */
  locale?: 'en' | 'vi';
}

export function PaginationControl({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  pageSize,
  className,
  locale,
}: PaginationControlProps) {
  const { locale: siteLocale } = useLanguage();
  const l = ((locale ?? siteLocale) === 'vi' ? vi : en).pagination;

  if (totalPages <= 1) return null;

  // Generate page numbers with ellipsis
  const getPageNumbers = (): (number | 'ellipsis')[] => {
    const pages: (number | 'ellipsis')[] = [];
    const delta = 1; // Number of pages to show around current page

    const left = Math.max(2, currentPage - delta);
    const right = Math.min(totalPages - 1, currentPage + delta);

    // Always include page 1
    pages.push(1);

    if (left > 2) {
      pages.push('ellipsis');
    }

    for (let i = left; i <= right; i++) {
      pages.push(i);
    }

    if (right < totalPages - 1) {
      pages.push('ellipsis');
    }

    // Always include last page if totalPages > 1
    if (totalPages > 1) {
      pages.push(totalPages);
    }

    return pages;
  };

  const pages = getPageNumbers();
  const startItem = totalItems && pageSize ? (currentPage - 1) * pageSize + 1 : null;
  const endItem =
    totalItems && pageSize ? Math.min(currentPage * pageSize, totalItems) : null;

  return (
    <nav
      aria-label={l.label}
      className={cn(
        'flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-border/80 text-sm',
        className
      )}
    >
      {/* Information text */}
      <div className="text-xs text-muted-foreground">
        {totalItems !== undefined && startItem !== null && endItem !== null ? (
          <span>
            {l.showing} <span className="font-semibold text-foreground">{startItem}</span>–
            <span className="font-semibold text-foreground">{endItem}</span> {l.of}{' '}
            <span className="font-semibold text-foreground">{totalItems}</span> {l.results}
          </span>
        ) : (
          <span>
            {l.page} <span className="font-semibold text-foreground">{currentPage}</span> {l.of}{' '}
            <span className="font-semibold text-foreground">{totalPages}</span>
          </span>
        )}
      </div>

      {/* Pagination buttons */}
      <div className="flex items-center gap-1 flex-wrap justify-center">
        {/* First page button */}
        <button
          type="button"
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          aria-label={l.first}
          className="hidden sm:inline-flex p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-40 disabled:pointer-events-none transition-colors"
        >
          <ChevronsLeft className="h-4 w-4" aria-hidden="true" />
        </button>

        {/* Previous button */}
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          aria-label={l.previous}
          className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-40 disabled:pointer-events-none transition-colors"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        </button>

        {/* Page numbers */}
        <div className="flex items-center gap-1 mx-0.5 sm:mx-1 flex-wrap justify-center">
          {pages.map((p, idx) => {
            if (p === 'ellipsis') {
              return (
                <span
                  key={`ellipsis-${idx}`}
                  aria-hidden="true"
                  className="px-2 py-1 text-xs text-muted-foreground"
                >
                  …
                </span>
              );
            }

            const isActive = p === currentPage;
            return (
              <button
                key={p}
                type="button"
                onClick={() => onPageChange(p)}
                aria-current={isActive ? 'page' : undefined}
                aria-label={`${l.page} ${p}`}
                className={cn(
                  'min-w-[32px] h-8 px-2.5 rounded-lg text-xs font-medium transition-all',
                  isActive
                    ? 'bg-foreground text-background shadow-xs font-semibold'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                )}
              >
                {p}
              </button>
            );
          })}
        </div>

        {/* Next button */}
        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          aria-label={l.next}
          className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-40 disabled:pointer-events-none transition-colors"
        >
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </button>

        {/* Last page button */}
        <button
          type="button"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          aria-label={l.last}
          className="hidden sm:inline-flex p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-40 disabled:pointer-events-none transition-colors"
        >
          <ChevronsRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </nav>
  );
}
