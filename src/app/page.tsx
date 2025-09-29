import { MainLayout } from '@/components';
import { AboutSection } from '@/components/hero-section/AboutSection';
import { BPSCSection } from '@/components/hero-section/BPSCSection';
import ContactSection from '@/components/hero-section/ContactSection';
import { HeroSection } from '@/components/hero-section/HeroSection';

export default function Home() {
  return (
    <MainLayout>
      <div className="h-full flex flex-col">
        <div className="h-screen flex flex-col">
          <HeroSection />
        </div>
        <div className="h-screen flex flex-col">
          <AboutSection />
        </div>
        <div className="h-screen flex flex-col">
          <BPSCSection />
        </div>
        <div className="h-screen flex flex-col">
          <ContactSection />
        </div>
      </div>
    </MainLayout>
  );
}
