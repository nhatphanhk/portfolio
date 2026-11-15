'use client';

import React from 'react';

interface ResumeCard3DProps {
  children: React.ReactNode;
  /** Kept for backwards compatibility */
  disableTilt?: boolean;
  className?: string;
}

/**
 * Clean Document Presentation
 * Displays the resume as a crisp, professional document sheet (flat PDF presentation)
 * without stacked paper layers behind or 3D skews.
 */
export function ResumeCard3D({ children, className = '' }: ResumeCard3DProps) {
  return (
    <div className={`relative mx-auto w-full max-w-4xl my-4 sm:my-6 box-border print:my-0 print:max-w-none ${className}`}>
      {/* ── Main Document Paper Sheet (Flat Clean PDF View) ── */}
      <div
        className="relative bg-white rounded-sm overflow-hidden border border-neutral-200/80 shadow-md print:shadow-none print:border-none"
        style={{
          boxShadow: '0 4px 20px -2px rgba(15, 23, 42, 0.08), 0 0 0 1px rgba(15, 23, 42, 0.06)',
        }}
      >
        {/* Main Document Content */}
        <div className="relative z-10">
          {children}
        </div>
      </div>
    </div>
  );
}

// Alias for semantic clarity
export { ResumeCard3D as ResumeDocumentSheet };
