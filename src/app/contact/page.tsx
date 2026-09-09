import { MainLayout } from '@/components';
import ContactSection from '@/components/hero-section/ContactSection';
import { UserBreadcrumb } from '@/components/UserBreadcrumb';
import type { Metadata } from 'next';
import { getProfile, getSocialLinks } from '@/lib/actions/about';

export const metadata: Metadata = {
  title: 'Contact',
  description:
    "Get in touch — I'm open to new projects, collaborations, and conversations about web development.",
};

export const revalidate = 300;

export default async function ContactPage() {
  const [profile, socialLinks] = await Promise.all([
    getProfile(),
    getSocialLinks(),
  ]);

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 pt-32">
        <UserBreadcrumb items={[{ label: 'Contact' }]} className="mb-6" />
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Get in Touch
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Have a project in mind, collaboration opportunities, or just want to say hello? Send me a message and I&apos;ll get back to you as soon as possible.
          </p>
        </div>
        <ContactSection profile={profile} socialLinks={socialLinks} hideHeader />
      </div>
    </MainLayout>
  );
}
