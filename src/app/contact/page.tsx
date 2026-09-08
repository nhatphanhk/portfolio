import { MainLayout } from '@/components';
import ContactSection from '@/components/hero-section/ContactSection';
import type { Metadata } from 'next';
import { getProfile, getSocialLinks } from '@/lib/actions/about';

export const metadata: Metadata = {
  title: 'Contact',
  description:
    "Get in touch — I'm open to new projects, collaborations, and conversations about web development.",
};

export default async function ContactPage() {
  const [profile, socialLinks] = await Promise.all([
    getProfile(),
    getSocialLinks(),
  ]);

  return (
    <MainLayout>
      <div className="pt-16">
        <ContactSection profile={profile} socialLinks={socialLinks} />
      </div>
    </MainLayout>
  );
}
