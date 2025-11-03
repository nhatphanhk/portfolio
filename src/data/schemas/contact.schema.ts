import { z } from 'zod';

/**
 * Contact Form Validation Schema
 */

export const contactStatusEnum = z.enum([
  'new',
  'in-progress',
  'resolved',
  'spam',
  'archived',
]);

export const contactPriorityEnum = z.enum(['low', 'medium', 'high', 'urgent']);

export const contactSchema = z.object({
  id: z.string().optional(),
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters'),
  email: z.string().email('Invalid email address'),
  subject: z
    .string()
    .max(200, 'Subject must be less than 200 characters')
    .optional(),
  message: z
    .string()
    .min(10, 'Message must be at least 10 characters')
    .max(2000, 'Message must be less than 2000 characters'),
  phone: z
    .string()
    .regex(/^[\d\s+()-]*$/, 'Invalid phone number format')
    .optional()
    .or(z.literal('')),
  company: z
    .string()
    .max(100, 'Company name must be less than 100 characters')
    .optional(),
  status: contactStatusEnum.default('new'),
  priority: contactPriorityEnum.default('medium'),
  read: z.boolean().default(false),
  replied: z.boolean().default(false),
});

export const contactSubmitSchema = contactSchema.pick({
  name: true,
  email: true,
  subject: true,
  message: true,
  phone: true,
  company: true,
});

export const contactUpdateSchema = z.object({
  status: contactStatusEnum.optional(),
  priority: contactPriorityEnum.optional(),
  read: z.boolean().optional(),
  replied: z.boolean().optional(),
});

export type ContactFormData = z.infer<typeof contactSchema>;
export type ContactSubmitData = z.infer<typeof contactSubmitSchema>;
export type ContactUpdateData = z.infer<typeof contactUpdateSchema>;
