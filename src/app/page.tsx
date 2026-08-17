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

export const metadata: Metadata = {
  title: 'Nhat Phan — Full-Stack Developer',
  description: SITE_DESCRIPTION,
};

export default async function Home() {
  const profile = await getProfile();
  const socialLinks = await getSocialLinks();
  const projects = await getPublicProjects();
  const blogs = await getPublicBlogs();
  const certs = await getPublicCertifications();
  const skillsByCategory = await getPublicSkillsByCategory();

  return (
    <MainLayout>
      <HeroSection profile={profile} socialLinks={socialLinks} />
      <AboutSection profile={profile} skillsByCategory={skillsByCategory} />
      <BPSCSection projects={projects} blogs={blogs} certs={certs} />
    </MainLayout>
  );
}
