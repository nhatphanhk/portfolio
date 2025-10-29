'use client';

import { MainLayout } from '@/components';
import { AboutSection } from '@/components/hero-section/AboutSection';
import ContactSection from '@/components/hero-section/ContactSection';
import { HeroSection } from '@/components/hero-section/HeroSection';
import BlogSection from '@/components/hero-section/BlogSection';
import ProjectSection from '@/components/hero-section/ProjectSection';
import SkillSection from '@/components/hero-section/SkillSection';
import CertificationSection from '@/components/hero-section/CertificationSection';

export default function Home() {
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

        <div className="h-screen  grid-cols-1 md:grid-cols-2 gap-2 grid px-4">
          <div className="section h-full ">
            <BlogSection />
          </div>
          <div className="section h-full ">
            <ProjectSection />
          </div>
          <div className="section h-full ">
            <SkillSection />
          </div>
          <div className="section h-full ">
            <CertificationSection />
          </div>
        </div>

        {/* Contact Section - Normal Scroll */}
        <div className="h-full w-full">
          <ContactSection />
        </div>
      </div>
    </MainLayout>
  );
}
