// src/data/skills.ts
// Static skills data — replace with DB data in production

export type SkillCategory = 'FRONTEND' | 'BACKEND' | 'DEVOPS' | 'TOOLS';

export interface Skill {
  id: string;
  name: string;
  category: SkillCategory;
  level: number; // 1–5
  iconUrl?: string;
  order: number;
}

export const SKILLS: Skill[] = [
  // Frontend
  { id: '1', name: 'TypeScript', category: 'FRONTEND', level: 5, order: 1 },
  { id: '2', name: 'React', category: 'FRONTEND', level: 5, order: 2 },
  { id: '3', name: 'Next.js', category: 'FRONTEND', level: 5, order: 3 },
  { id: '4', name: 'Tailwind CSS', category: 'FRONTEND', level: 5, order: 4 },
  { id: '5', name: 'HTML5 / CSS3', category: 'FRONTEND', level: 5, order: 5 },
  { id: '6', name: 'Vue.js', category: 'FRONTEND', level: 3, order: 6 },

  // Backend
  { id: '7', name: 'Node.js', category: 'BACKEND', level: 4, order: 1 },
  { id: '8', name: 'Express.js', category: 'BACKEND', level: 4, order: 2 },
  { id: '9', name: 'PostgreSQL', category: 'BACKEND', level: 4, order: 3 },
  { id: '10', name: 'Prisma', category: 'BACKEND', level: 4, order: 4 },
  { id: '11', name: 'REST API', category: 'BACKEND', level: 5, order: 5 },
  { id: '12', name: 'GraphQL', category: 'BACKEND', level: 3, order: 6 },

  // DevOps
  { id: '13', name: 'Docker', category: 'DEVOPS', level: 3, order: 1 },
  { id: '14', name: 'AWS', category: 'DEVOPS', level: 3, order: 2 },
  { id: '15', name: 'Vercel', category: 'DEVOPS', level: 4, order: 3 },
  { id: '16', name: 'GitHub Actions', category: 'DEVOPS', level: 3, order: 4 },

  // Tools
  { id: '17', name: 'Git', category: 'TOOLS', level: 5, order: 1 },
  { id: '18', name: 'VS Code', category: 'TOOLS', level: 5, order: 2 },
  { id: '19', name: 'Figma', category: 'TOOLS', level: 3, order: 3 },
  { id: '20', name: 'Jest', category: 'TOOLS', level: 3, order: 4 },
];

export const SKILL_CATEGORY_LABELS: Record<SkillCategory, string> = {
  FRONTEND: 'Frontend',
  BACKEND: 'Backend',
  DEVOPS: 'DevOps & Cloud',
  TOOLS: 'Tools & Workflow',
};

/**
 * Returns skills grouped by category, sorted by order.
 */
export function getSkillsByCategory(): Record<SkillCategory, Skill[]> {
  const grouped: Record<SkillCategory, Skill[]> = {
    FRONTEND: [],
    BACKEND: [],
    DEVOPS: [],
    TOOLS: [],
  };

  for (const skill of SKILLS) {
    grouped[skill.category].push(skill);
  }

  // Sort each group by order
  for (const cat of Object.keys(grouped) as SkillCategory[]) {
    grouped[cat].sort((a, b) => a.order - b.order);
  }

  return grouped;
}
