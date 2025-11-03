import { z } from 'zod';

/**
 * Blog Post Validation Schema
 */

export const blogPostSchema = z.object({
  slug: z
    .string()
    .min(1, 'Slug is required')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be URL-friendly'),
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title must be less than 200 characters'),
  excerpt: z
    .string()
    .min(1, 'Excerpt is required')
    .max(500, 'Excerpt must be less than 500 characters'),
  content: z.string().min(1, 'Content is required'),
  date: z
    .string()
    .refine(date => !isNaN(Date.parse(date)), 'Invalid date format'),
  readTime: z.string().min(1, 'Read time is required'),
  tags: z
    .array(z.string())
    .min(1, 'At least one tag is required')
    .max(10, 'Maximum 10 tags allowed'),
});

export const blogPostCreateSchema = blogPostSchema.omit({ slug: true });
export const blogPostUpdateSchema = blogPostSchema.partial();

export type BlogPostFormData = z.infer<typeof blogPostSchema>;
export type BlogPostCreateData = z.infer<typeof blogPostCreateSchema>;
export type BlogPostUpdateData = z.infer<typeof blogPostUpdateSchema>;
