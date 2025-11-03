import { z } from 'zod';

/**
 * Skill Validation Schema
 */

export const skillCategoryEnum = z.enum([
  'frontend',
  'backend',
  'database',
  'devops',
  'mobile',
  'design',
  'tools',
  'soft-skills',
  'other',
]);

export const skillLevelEnum = z.enum([
  'beginner',
  'intermediate',
  'advanced',
  'expert',
]);

export const skillSchema = z.object({
  id: z.string().optional(),
  name: z
    .string()
    .min(1, 'Skill name is required')
    .max(100, 'Name must be less than 100 characters'),
  category: skillCategoryEnum,
  level: skillLevelEnum,
  icon: z.string().optional(),
  description: z
    .string()
    .max(500, 'Description must be less than 500 characters')
    .optional(),
  yearsOfExperience: z
    .number()
    .int()
    .nonnegative('Years must be non-negative')
    .max(50, 'Maximum 50 years')
    .optional(),
  order: z.number().int().nonnegative().optional(),
  featured: z.boolean().default(false),
});

export const skillCreateSchema = skillSchema.omit({ id: true });
export const skillUpdateSchema = skillSchema.partial();

export type SkillFormData = z.infer<typeof skillSchema>;
export type SkillCreateData = z.infer<typeof skillCreateSchema>;
export type SkillUpdateData = z.infer<typeof skillUpdateSchema>;
