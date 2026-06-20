import { MainLayout } from '@/components';
import { HeroSection } from '@/components/hero-section/HeroSection';
import { AboutSection } from '@/components/hero-section/AboutSection';
import { BPSCSection } from '@/components/hero-section/BPSCSection';
import ContactSection from '@/components/hero-section/ContactSection';
import type { Metadata } from 'next';
import { SITE_DESCRIPTION } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Nhat Phan — Full-Stack Developer',
  description: SITE_DESCRIPTION,
};

export default function Home() {
  return (
    <MainLayout>
      <HeroSection />
      <AboutSection />
      <BPSCSection />
      <ContactSection />
    </MainLayout>
  );
}
