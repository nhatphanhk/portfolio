import {
  getProfile,
  getExperiences,
  getSocialLinks,
  getEducation,
  getAchievements,
  getSpokenLanguages,
  getActivities,
  getSkillsByCategory,
} from '@/lib/actions/about';
import { AdminResumeClient } from './client';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Resume — Admin' };

export default async function AdminAboutPage() {
  const [profile, experiences, socialLinks, education, achievements, spokenLanguages, activities, skillsByCategory] =
    await Promise.all([
      getProfile(),
      getExperiences(),
      getSocialLinks(),
      getEducation(),
      getAchievements(),
      getSpokenLanguages(),
      getActivities(),
      getSkillsByCategory(),
    ]);

  return (
    <AdminResumeClient
      profile={profile}
      experiences={experiences}
      socialLinks={socialLinks}
      education={education}
      achievements={achievements}
      spokenLanguages={spokenLanguages}
      activities={activities}
      skillsByCategory={skillsByCategory}
    />
  );
}
