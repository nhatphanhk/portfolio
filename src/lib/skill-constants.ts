/**
 * Shared enum values + labels for skills. Plain module (no 'use server') so both server
 * actions and client components can import it.
 */

export const WORK_SKILL_CATEGORIES = [
  'LANGUAGE',
  'FRAMEWORK',
  'FRONTEND',
  'BACKEND',
  'DATABASE',
  'CLOUD',
  'DEVOPS',
  'IAC',
  'MONITORING',
  'VERSION_CONTROL',
  'TOOLS',
  'OTHER',
] as const;

export const LIFE_SKILL_CATEGORIES = [
  'SOFT_SKILL',
  'FOREIGN_LANGUAGE',
  'DESIGN_ART',
  'MUSIC',
  'SPORTS_HEALTH',
  'LIFE_SKILL',
  'BUSINESS',
] as const;

export const SKILL_CATEGORY_VALUES = [...WORK_SKILL_CATEGORIES, ...LIFE_SKILL_CATEGORIES] as const;
export type SkillCategoryValue = (typeof SKILL_CATEGORY_VALUES)[number];

export const isLifeSkillCategory = (cat: string) => (LIFE_SKILL_CATEGORIES as readonly string[]).includes(cat);

export const SKILL_STATUS_VALUES = ['LEARNING', 'ACHIEVED', 'PAUSED'] as const;
export type SkillStatusValue = (typeof SKILL_STATUS_VALUES)[number];

export const EVIDENCE_TYPE_VALUES = ['COURSE', 'CERTIFICATE', 'IMAGE', 'LINK', 'DOCUMENT', 'PROJECT'] as const;
export type EvidenceTypeValue = (typeof EVIDENCE_TYPE_VALUES)[number];

/** Vietnamese labels for the admin dashboard (admin UI is Vietnamese-only). */
export const SKILL_CATEGORY_ADMIN_LABELS: Record<SkillCategoryValue, string> = {
  LANGUAGE: 'Ngôn ngữ lập trình',
  FRAMEWORK: 'Framework',
  FRONTEND: 'Frontend',
  BACKEND: 'Backend',
  DATABASE: 'Cơ sở dữ liệu',
  CLOUD: 'Cloud',
  DEVOPS: 'DevOps',
  IAC: 'IaC',
  MONITORING: 'Giám sát',
  VERSION_CONTROL: 'Quản lý phiên bản',
  TOOLS: 'Công cụ',
  OTHER: 'Khác (kỹ thuật)',
  SOFT_SKILL: 'Kỹ năng mềm',
  FOREIGN_LANGUAGE: 'Ngoại ngữ',
  DESIGN_ART: 'Thiết kế & nghệ thuật',
  MUSIC: 'Âm nhạc',
  SPORTS_HEALTH: 'Thể thao & sức khỏe',
  LIFE_SKILL: 'Kỹ năng sống',
  BUSINESS: 'Kinh doanh & tài chính',
};

export const SKILL_STATUS_ADMIN: Record<SkillStatusValue, { label: string; className: string }> = {
  ACHIEVED: { label: 'Đã làm được', className: 'bg-green-500/10 text-green-700 border-green-500/20' },
  LEARNING: { label: 'Đang học', className: 'bg-blue-500/10 text-blue-700 border-blue-500/20' },
  PAUSED: { label: 'Tạm dừng', className: 'bg-muted text-muted-foreground border-border' },
};

export const EVIDENCE_TYPE_ADMIN_LABELS: Record<EvidenceTypeValue, string> = {
  COURSE: 'Khóa học',
  CERTIFICATE: 'Chứng chỉ',
  IMAGE: 'Hình ảnh',
  LINK: 'Liên kết',
  DOCUMENT: 'Tài liệu (PDF)',
  PROJECT: 'Sản phẩm / dự án',
};
