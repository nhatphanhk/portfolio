'use client';

import React, { useRef, useState } from 'react';

interface ResumeCard3DProps {
  children: React.ReactNode;
  /** When true (e.g. during drag), tilt effect is disabled */
  disableTilt?: boolean;
}

export function ResumeCard3D({ children, disableTilt = false }: ResumeCard3DProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current || disableTilt) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2);
    const y = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2);
    const maxRotation = 8;
    setTilt({ x: -y * maxRotation, y: x * maxRotation });
  };

  const handleMouseEnter = () => !disableTilt && setIsHovering(true);
  const handleMouseLeave = () => {
    setIsHovering(false);
    setTilt({ x: 0, y: 0 });
  };

  const effectiveTilt = disableTilt ? { x: 0, y: 0 } : tilt;

  return (
    <div
      style={{ perspective: '1400px' }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div
        ref={cardRef}
        className="relative bg-white rounded-sm transition-transform ease-out"
        style={{
          transform: `rotateX(${effectiveTilt.x}deg) rotateY(${effectiveTilt.y}deg)`,
          transitionDuration: disableTilt ? '0ms' : '200ms',
          boxShadow: (isHovering && !disableTilt)
            ? `${-effectiveTilt.y * 3}px ${effectiveTilt.x * 3 + 28}px 60px rgba(0,0,0,0.22), 0 4px 16px rgba(0,0,0,0.1)`
            : '0 20px 50px rgba(0,0,0,0.15), 0 4px 12px rgba(0,0,0,0.08)',
          transformStyle: 'preserve-3d',
        }}
      >
        {children}
        {/* Sheen overlay */}
        <div
          className="absolute inset-0 pointer-events-none rounded-sm transition-opacity duration-200"
          style={{
            background: `linear-gradient(
              ${120 + effectiveTilt.y * 3}deg,
              rgba(255,255,255,0.35) 0%,
              rgba(255,255,255,0) 40%,
              rgba(0,0,0,0.04) 100%
            )`,
            opacity: (isHovering && !disableTilt) ? 1 : 0,
          }}
        />
      </div>
    </div>
  );
}
