import { MainLayout } from '@/components';
import ContactSection from '@/components/hero-section/ContactSection';
import { UserBreadcrumb } from '@/components/UserBreadcrumb';
import { ContactHeaderClient } from '@/components/contact/ContactHeaderClient';
import type { Metadata } from 'next';
import { getProfile, getSocialLinks } from '@/lib/actions/about';

import { getServerLocale } from '@/lib/i18n/server';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const isVi = locale === 'vi';
  return {
    title: isVi ? 'Liên hệ' : 'Contact',
    description: isVi
      ? 'Liên hệ trao đổi công việc, hợp tác dự án phát triển phần mềm và công nghệ web.'
      : "Get in touch — I'm open to new projects, collaborations, and conversations about web development.",
    openGraph: {
      title: isVi ? 'Liên hệ | nhatphanhk102' : 'Contact | nhatphanhk102',
      description: isVi
        ? 'Liên hệ trao đổi công việc, hợp tác dự án phát triển phần mềm và công nghệ web.'
        : "Get in touch — I'm open to new projects, collaborations, and conversations about web development.",
      locale: isVi ? 'vi_VN' : 'en_US',
    },
  };
}

export const revalidate = 3600;

export default async function ContactPage() {
  const [profile, socialLinks] = await Promise.all([
    getProfile(),
    getSocialLinks(),
  ]);

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 pt-32">
        <UserBreadcrumb items={[{ label: 'Contact' }]} className="mb-6" />
        <ContactHeaderClient />
        <ContactSection profile={profile} socialLinks={socialLinks} hideHeader />
      </div>
    </MainLayout>
  );
}
