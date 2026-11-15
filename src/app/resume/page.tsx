import { MainLayout } from '@/components';
import { ResumeMultiPage } from '@/components/resume/ResumeMultiPage';
import { UserBreadcrumb } from '@/components/UserBreadcrumb';
import { ResumeHeaderClient } from '@/components/resume/ResumeHeaderClient';

// Background revalidation every 1 hour (Admin updates purge cache instantly via revalidatePath)
export const revalidate = 3600;

import {
  getProfile,
  getExperiences,
  getSocialLinks,
  getEducation,
  getSkillsByCategory,
  getAchievements,
  getSpokenLanguages,
  getActivities,
} from '@/lib/actions/about';
import type { Metadata } from 'next';
import { buildOpenGraph } from '@/lib/constants';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const isVi = locale === 'vi';
  const title = isVi ? 'Hồ sơ năng lực & CV' : 'Resume';
  const description = isVi
    ? 'Hồ sơ năng lực cá nhân, kinh nghiệm làm việc và các kỹ năng chuyên môn'
    : 'Professional Curriculum Vitae & Experience Overview';
  return {
    title,
    description,
    openGraph: buildOpenGraph({ title, description, path: '/resume', locale }),
  };
}

import { getServerLocale } from '@/lib/i18n/server';

export default async function ResumePage() {
  const locale = await getServerLocale();
  const [
    profile,
    experiences,
    socialLinks,
    education,
    skillsByCategory,
    achievements,
    spokenLanguages,
    activities,
  ] = await Promise.all([
    getProfile(locale),
    getExperiences(locale),
    getSocialLinks(),
    getEducation(),
    getSkillsByCategory(),
    getAchievements(),
    getSpokenLanguages(),
    getActivities(),
  ]);

  return (
    <MainLayout>
      <div className="pt-28 pb-20 bg-gradient-to-b from-background to-muted/30 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb aligned with Header */}
          <UserBreadcrumb items={[{ label: 'Resume' }]} className="mb-6" />

          {/* Page header aligned with Header logo */}
          <ResumeHeaderClient resumeUrl={profile.resumeUrl} name={profile.name} />

          {/* Dynamic Multi-Page Resume Presentation */}
          <div className="flex justify-center">
            <ResumeMultiPage
              profile={profile}
              experiences={experiences}
              socialLinks={socialLinks}
              education={education}
              skillsByCategory={skillsByCategory}
              achievements={achievements}
              spokenLanguages={spokenLanguages}
              activities={activities}
            />
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
