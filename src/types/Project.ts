/**
 * Project Types
 * Used for portfolio projects display and admin management
 */

export interface Project {
  id: string;
  title: string;
  description: string;
  shortDescription?: string;
  slug: string;
  thumbnail?: string;
  images?: string[];
  technologies: string[];
  category: ProjectCategory;
  status: ProjectStatus;
  startDate: string;
  endDate?: string;
  githubUrl?: string;
  liveUrl?: string;
  demoUrl?: string;
  featured: boolean;
  order?: number;
  createdAt: string;
  updatedAt: string;
}

export type ProjectCategory =
  | 'web'
  | 'mobile'
  | 'desktop'
  | 'ai-ml'
  | 'data-science'
  | 'devops'
  | 'other';

export type ProjectStatus =
  | 'in-progress'
  | 'completed'
  | 'archived'
  | 'planning';

export interface ProjectDocument {
  id: string;
  projectId: string;
  name: string;
  url: string;
  type: string;
  size: number;
  uploadedAt: string;
}

/**
 * Form types for creating/editing projects
 */
export interface ProjectFormData {
  title: string;
  description: string;
  shortDescription?: string;
  technologies: string[];
  category: ProjectCategory;
  status: ProjectStatus;
  startDate: string;
  endDate?: string;
  githubUrl?: string;
  liveUrl?: string;
  demoUrl?: string;
  featured: boolean;
}
