import { MainLayout } from '@/components';
import { HeroSection } from '@/components/hero-section/HeroSection';
import { AboutSection } from '@/components/hero-section/AboutSection';
import { BPSCSection } from '@/components/hero-section/BPSCSection';
import type { Metadata } from 'next';
import { SITE_DESCRIPTION } from '@/lib/constants';
import { getProfile, getSocialLinks } from '@/lib/actions/about';
import { getPublicProjects } from '@/lib/actions/project';
import { getPublicBlogs } from '@/lib/actions/blog';
import { getPublicCertifications } from '@/lib/actions/certification';
import { getPublicSkillsByCategory } from '@/lib/actions/skill';
import { getSiteContentRecord } from '@/lib/actions/site-content';

export const metadata: Metadata = {
  title: {
    absolute: 'nhatphanhk102',
  },
  description: SITE_DESCRIPTION,
};

// Edge caching for high-traffic defense: revalidate every 5 minutes.
// Content changes made in Admin are instantly refreshed via revalidatePath.
export const revalidate = 300;

export default async function Home() {
  const [profile, socialLinks, projects, blogs, certs, skillsByCategory, siteContent] = await Promise.all([
    getProfile(),
    getSocialLinks(),
    getPublicProjects(),
    getPublicBlogs(),
    getPublicCertifications(),
    getPublicSkillsByCategory(),
    getSiteContentRecord(),
  ]);

  return (
    <MainLayout>
      <HeroSection profile={profile} socialLinks={socialLinks} content={siteContent} />
      <AboutSection profile={profile} skillsByCategory={skillsByCategory} content={siteContent} />
      <BPSCSection projects={projects} blogs={blogs} certs={certs} content={siteContent} />
    </MainLayout>
  );
}
