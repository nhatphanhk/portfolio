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
import { getServerLocale } from '@/lib/i18n/server';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const isEn = locale === 'en';

  const title = isEn ? 'nhatphanhk102 | Software Engineer & Tech Portfolio' : 'nhatphanhk102 | Kỹ Sư Phần Mềm & Portfolio';
  const description = isEn
    ? 'Full-stack software engineering portfolio, featured projects, technical blog series, and professional resume.'
    : SITE_DESCRIPTION || 'Portfolio cá nhân, các dự án tiêu biểu, chuỗi bài viết kỹ thuật và hồ sơ năng lực chuyên môn.';

  return {
    title: {
      absolute: title,
    },
    description,
    openGraph: {
      title,
      description,
      locale: isEn ? 'en_US' : 'vi_VN',
      type: 'website',
    },
  };
}

// Edge caching for high-traffic defense: revalidate every 1 hour.
// Content changes made in Admin are instantly refreshed via revalidatePath.
export const revalidate = 3600;

export default async function Home() {
  const locale = await getServerLocale();
  const [profile, socialLinks, projects, blogs, certs, skillsByCategory, siteContent] = await Promise.all([
    getProfile(locale),
    getSocialLinks(),
    getPublicProjects(locale),
    getPublicBlogs(locale),
    getPublicCertifications(),
    getPublicSkillsByCategory(),
    getSiteContentRecord(locale),
  ]);

  return (
    <MainLayout>
      <HeroSection profile={profile} socialLinks={socialLinks} content={siteContent} />
      <AboutSection profile={profile} skillsByCategory={skillsByCategory} content={siteContent} />
      <BPSCSection projects={projects} blogs={blogs} certs={certs} content={siteContent} />
    </MainLayout>
  );
}
