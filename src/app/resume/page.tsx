import { MainLayout } from '@/components';
import { ResumeMultiPage } from '@/components/resume/ResumeMultiPage';

// Always render fresh so admin updates via revalidatePath are immediately reflected
export const dynamic = 'force-dynamic';

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
import { Download } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Resume',
  description: 'Professional Curriculum Vitae & Experience Overview',
};

export default async function ResumePage() {
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
    getProfile(),
    getExperiences(),
    getSocialLinks(),
    getEducation(),
    getSkillsByCategory(),
    getAchievements(),
    getSpokenLanguages(),
    getActivities(),
  ]);

  return (
    <MainLayout>
      <div className="pt-28 pb-20 px-4 sm:px-6 bg-gradient-to-b from-background to-muted/30 min-h-screen">
        {/* Page header */}
        <div className="max-w-5xl mx-auto mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-1">Resume</h1>
            <p className="text-muted-foreground text-sm">Professional profile, experience, and technical competencies</p>
          </div>
          {profile.resumeUrl && (
            <a
              href={profile.resumeUrl}
              download
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:opacity-90 active:scale-95 transition-all shadow-md shadow-primary/20"
            >
              <Download className="w-4 h-4" />
              Download PDF
            </a>
          )}
        </div>

        {/* Dynamic Multi-Page Resume Presentation */}
        <div className="max-w-5xl mx-auto">
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
    </MainLayout>
  );
}
