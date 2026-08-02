// src/data/skills.ts
// Display-label lookup only. The actual skills list is DB-backed
// (see src/lib/actions/skill.ts, Prisma model Skill / enum SkillCategory) —
// this map just gives a few common categories a nicer heading than the raw
// enum value. Categories not listed here fall back to the raw enum string
// (see src/app/skills/page.tsx).

export type SkillCategory = 'FRONTEND' | 'BACKEND' | 'DEVOPS' | 'TOOLS';

export const SKILL_CATEGORY_LABELS: Record<SkillCategory, string> = {
  FRONTEND: 'Frontend',
  BACKEND: 'Backend',
  DEVOPS: 'DevOps & Cloud',
  TOOLS: 'Tools & Workflow',
};
