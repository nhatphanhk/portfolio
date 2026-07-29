'use client';

import React, { useRef, useState } from 'react';
import { ZoomIn, ZoomOut, Download, Printer, RotateCcw } from 'lucide-react';

interface Resume3DViewerProps {
  children: React.ReactNode;
  resumeUrl?: string;
}

export function Resume3DViewer({ children, resumeUrl }: Resume3DViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const paperRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  // Mouse move handler for 3D tilt effect
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current || !isHovering) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    
    // Calculate mouse position relative to container center (-1 to 1)
    const x = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2);
    const y = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2);
    
    // Max rotation in degrees
    const maxRotation = 10;
    
    setTilt({
      x: -y * maxRotation, // Mouse up (y < 0) -> tilt up (rotateX > 0)
      y: x * maxRotation   // Mouse right (x > 0) -> tilt right (rotateY > 0)
    });
  };

  const handleMouseEnter = () => setIsHovering(true);
  
  const handleMouseLeave = () => {
    setIsHovering(false);
    // Smooth reset
    setTilt({ x: 0, y: 0 });
  };

  const zoomIn = () => setZoom(prev => Math.min(prev + 0.1, 2));
  const zoomOut = () => setZoom(prev => Math.max(prev - 0.1, 0.5));
  const resetZoom = () => setZoom(1);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#323639] overflow-hidden print:bg-white print:min-h-0">
      {/* PDF Viewer Toolbar */}
      <div className="h-14 bg-[#323639] border-b border-white/10 flex items-center justify-between px-4 sticky top-0 z-50 print:hidden shadow-md">
        <div className="flex items-center gap-4">
          <div className="text-white/90 font-medium text-sm hidden sm:block">
            Resume.pdf
          </div>
        </div>
        
        <div className="flex items-center gap-2 bg-[#202124] rounded-md px-2 py-1 border border-white/10">
          <button onClick={zoomOut} className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded transition-colors" title="Zoom Out">
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-white/90 text-xs w-12 text-center font-mono">
            {Math.round(zoom * 100)}%
          </span>
          <button onClick={zoomIn} className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded transition-colors" title="Zoom In">
            <ZoomIn className="w-4 h-4" />
          </button>
          <div className="w-px h-4 bg-white/20 mx-1" />
          <button onClick={resetZoom} className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded transition-colors" title="Reset Zoom">
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={handlePrint} className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors" title="Print">
            <Printer className="w-5 h-5" />
          </button>
          {resumeUrl && (
            <a 
              href={resumeUrl} 
              download 
              className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors" 
              title="Download PDF"
            >
              <Download className="w-5 h-5" />
            </a>
          )}
        </div>
      </div>

      {/* 3D Canvas Area */}
      <div 
        ref={containerRef}
        className="flex-1 flex items-center justify-center p-4 sm:p-12 overflow-auto relative"
        style={{ perspective: '1200px' }}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div
          ref={paperRef}
          className="relative bg-white w-[210mm] min-h-[297mm] max-w-full transition-transform duration-200 ease-out origin-center print:shadow-none print:w-full print:transform-none print:min-h-0"
          style={{
            transform: `scale(${zoom}) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
            // Dynamic shadow based on tilt
            boxShadow: isHovering 
              ? `${-tilt.y * 2}px ${tilt.x * 2 + 20}px 40px rgba(0,0,0,0.5)`
              : '0 20px 40px rgba(0,0,0,0.4)',
            transformStyle: 'preserve-3d'
          }}
        >
          {/* Paper content */}
          <div className="absolute inset-0 p-8 sm:p-12 print:p-0 print:relative text-black">
            {children}
          </div>
          
          {/* Subtle lighting reflection overlay */}
          <div 
            className="absolute inset-0 pointer-events-none transition-opacity duration-200 print:hidden"
            style={{
              background: `linear-gradient(135deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 50%, rgba(0,0,0,0.05) 100%)`,
              opacity: isHovering ? 1 : 0
            }}
          />
        </div>
      </div>
    </div>
  );
}
