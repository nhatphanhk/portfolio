'use client';

import React from 'react';

interface ResumeCard3DProps {
  children: React.ReactNode;
  /** Kept for backwards compatibility */
  disableTilt?: boolean;
  className?: string;
}

/**
 * 3D Paper Document Presentation
 * Gives the resume an authentic, physical 3D paper aesthetic with layered depth,
 * multi-tier ambient occlusion shadows, and subtle paper edge highlights,
 * without interactive motion, wobbling, or mouse/touch movement.
 */
export function ResumeCard3D({ children, className = '' }: ResumeCard3DProps) {
  return (
    <div className={`relative mx-auto max-w-5xl my-4 sm:my-6 ${className}`}>
      {/* ── Stacked Paper Layer 2 (Bottom-most sheet) ── */}
      <div
        className="absolute inset-0 bg-white/70 rounded-sm pointer-events-none transform translate-x-2.5 translate-y-3 -rotate-[0.6deg]"
        style={{
          boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.12), 0 0 0 1px rgba(226, 232, 240, 0.7)',
        }}
        aria-hidden="true"
      />

      {/* ── Stacked Paper Layer 1 (Middle sheet) ── */}
      <div
        className="absolute inset-0 bg-white/90 rounded-sm pointer-events-none transform translate-x-1.5 translate-y-1.5 rotate-[0.35deg]"
        style={{
          boxShadow: '0 20px 40px -10px rgba(15, 23, 42, 0.14), 0 0 0 1px rgba(226, 232, 240, 0.85)',
        }}
        aria-hidden="true"
      />

      {/* ── Main Front Resume Document ── */}
      <div
        className="relative bg-white rounded-sm overflow-hidden"
        style={{
          // Multi-layer realistic physical depth shadow
          boxShadow: `
            0 1px 3px rgba(0, 0, 0, 0.05),
            0 6px 16px -2px rgba(15, 23, 42, 0.08),
            0 16px 36px -4px rgba(15, 23, 42, 0.14),
            0 32px 64px -8px rgba(15, 23, 42, 0.18),
            0 0 0 1px rgba(0, 0, 0, 0.07)
          `,
        }}
      >
        {/* Subtle top-down paper texture / ambient lighting */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'linear-gradient(175deg, rgba(255,255,255,0.75) 0%, rgba(248,250,252,0.15) 35%, rgba(15,23,42,0.02) 100%)',
          }}
          aria-hidden="true"
        />

        {/* Paper top edge crisp highlight */}
        <div
          className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white to-transparent pointer-events-none"
          aria-hidden="true"
        />

        {/* Paper left spine subtle ambient occlusion */}
        <div
          className="absolute top-0 bottom-0 left-0 w-2.5 bg-gradient-to-r from-black/[0.03] to-transparent pointer-events-none"
          aria-hidden="true"
        />

        {/* Main Document Content */}
        <div className="relative z-10">
          {children}
        </div>
      </div>
    </div>
  );
}
