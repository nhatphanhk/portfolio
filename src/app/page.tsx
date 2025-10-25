'use client';

import { MainLayout } from '@/components';
import { AboutSection } from '@/components/hero-section/AboutSection';
import ContactSection from '@/components/hero-section/ContactSection';
import { HeroSection } from '@/components/hero-section/HeroSection';
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import BlogSection from '@/components/hero-section/BlogSection';
import ProjectSection from '@/components/hero-section/ProjectSection';
import SkillSection from '@/components/hero-section/SkillSection';
import CertificationSection from '@/components/hero-section/CertificationSection';

gsap.registerPlugin(ScrollTrigger);

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const sectionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !sectionsRef.current) return;

    const sections = sectionsRef.current.querySelectorAll('.section');
    const totalWidth = sections.length * window.innerWidth;

    // Set up horizontal scroll
    const scrollTween = gsap.to(sections, {
      xPercent: -100 * (sections.length - 1),
      ease: 'none',
      scrollTrigger: {
        trigger: containerRef.current,
        pin: true,
        scrub: 1,
        snap: 1 / (sections.length - 1),
        end: () => `+=${totalWidth}`,
      },
    });

    return () => {
      scrollTween.kill();
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  return (
    <MainLayout>
      <div>
        {/* Hero Section - Normal Scroll */}
        <div className="h-screen w-full">
          <HeroSection />
        </div>

        {/* About Section - Normal Scroll */}
        <div className="h-screen w-full">
          <AboutSection />
        </div>

        {/* Horizontal Scroll Container */}
        <div ref={containerRef} className="h-screen overflow-hidden">
          <div ref={sectionsRef} className="flex h-full w-full">
            <div className="section h-full w-screen flex-shrink-0">
              <BlogSection />
            </div>
            <div className="section h-full w-screen flex-shrink-0">
              <ProjectSection />
            </div>
            <div className="section h-full w-screen flex-shrink-0">
              <SkillSection />
            </div>
            <div className="section h-full w-screen flex-shrink-0">
              <CertificationSection />
            </div>
          </div>
        </div>

        {/* Contact Section - Normal Scroll */}
        <div className="h-screen w-full">
          <ContactSection />
        </div>
      </div>
    </MainLayout>
  );
}
