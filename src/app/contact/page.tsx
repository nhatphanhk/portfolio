import { MainLayout } from '@/components';
import ContactSection from '@/components/hero-section/ContactSection';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact',
  description:
    "Get in touch — I'm open to new projects, collaborations, and conversations about web development.",
};

export default function ContactPage() {
  return (
    <MainLayout>
      <div className="pt-16">
        <ContactSection />
      </div>
    </MainLayout>
  );
}
