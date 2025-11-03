/**
 * Resume Types
 * Used for resume/CV management
 */

export interface Resume {
  id: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  version: string;
  isActive: boolean;
  downloadCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ResumeFormData {
  fileName: string;
  version: string;
  isActive: boolean;
}

/**
 * Work Experience Types
 */
export interface WorkExperience {
  id: string;
  company: string;
  position: string;
  location?: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  description: string;
  achievements?: string[];
  technologies?: string[];
  order?: number;
}

/**
 * Education Types
 */
export interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  location?: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  gpa?: string;
  description?: string;
  achievements?: string[];
  order?: number;
}
