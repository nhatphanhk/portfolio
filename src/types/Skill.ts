/**
 * Skill Types
 * Used for skills display and admin management
 */

export interface Skill {
  id: string;
  name: string;
  category: SkillCategory;
  level: SkillLevel;
  icon?: string;
  description?: string;
  yearsOfExperience?: number;
  order?: number;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}

export type SkillCategory =
  | 'frontend'
  | 'backend'
  | 'database'
  | 'devops'
  | 'mobile'
  | 'design'
  | 'tools'
  | 'soft-skills'
  | 'other';

export type SkillLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export interface SkillGroup {
  category: SkillCategory;
  skills: Skill[];
}

/**
 * Form types for creating/editing skills
 */
export interface SkillFormData {
  name: string;
  category: SkillCategory;
  level: SkillLevel;
  icon?: string;
  description?: string;
  yearsOfExperience?: number;
  featured: boolean;
}
