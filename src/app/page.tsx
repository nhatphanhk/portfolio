'use client';

import { MainLayout } from '@/components/shared';
import { AboutSection } from '@/components/sections/AboutSection';
import ContactSection from '@/components/sections/ContactSection';
import { HeroSection } from '@/components/sections/HeroSection';
import BlogSection from '@/components/sections/BlogSection';
import ProjectSection from '@/components/sections/ProjectSection';
import SkillSection from '@/components/sections/SkillSection';
import CertificationSection from '@/components/sections/CertificationSection';

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
