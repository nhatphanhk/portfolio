import { z } from 'zod';

/**
 * Project Validation Schema
 */

export const projectCategoryEnum = z.enum([
  'web',
  'mobile',
  'desktop',
  'ai-ml',
  'data-science',
  'devops',
  'other',
]);

export const projectStatusEnum = z.enum([
  'in-progress',
  'completed',
  'archived',
  'planning',
]);

export const projectSchema = z.object({
  id: z.string().optional(),
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title must be less than 200 characters'),
  description: z.string().min(1, 'Description is required'),
  shortDescription: z
    .string()
    .max(300, 'Short description must be less than 300 characters')
    .optional(),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be URL-friendly'),
  thumbnail: z.string().url('Invalid URL').optional().or(z.literal('')),
  images: z.array(z.string().url('Invalid image URL')).optional(),
  technologies: z
    .array(z.string())
    .min(1, 'At least one technology is required'),
  category: projectCategoryEnum,
  status: projectStatusEnum,
  startDate: z
    .string()
    .refine(date => !isNaN(Date.parse(date)), 'Invalid start date'),
  endDate: z
    .string()
    .refine(date => !isNaN(Date.parse(date)), 'Invalid end date')
    .optional()
    .or(z.literal('')),
  githubUrl: z.string().url('Invalid GitHub URL').optional().or(z.literal('')),
  liveUrl: z.string().url('Invalid live URL').optional().or(z.literal('')),
  demoUrl: z.string().url('Invalid demo URL').optional().or(z.literal('')),
  featured: z.boolean().default(false),
  order: z.number().int().nonnegative().optional(),
});

export const projectCreateSchema = projectSchema.omit({ id: true, slug: true });
export const projectUpdateSchema = projectSchema.partial();

export type ProjectFormData = z.infer<typeof projectSchema>;
export type ProjectCreateData = z.infer<typeof projectCreateSchema>;
export type ProjectUpdateData = z.infer<typeof projectUpdateSchema>;
