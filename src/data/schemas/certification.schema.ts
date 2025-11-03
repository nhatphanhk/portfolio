import { z } from 'zod';

/**
 * Certification Validation Schema
 */

export const certificationStatusEnum = z.enum(['active', 'expired', 'pending']);

export const certificationSchema = z.object({
  id: z.string().optional(),
  name: z
    .string()
    .min(1, 'Certification name is required')
    .max(200, 'Name must be less than 200 characters'),
  issuer: z
    .string()
    .min(1, 'Issuer is required')
    .max(100, 'Issuer must be less than 100 characters'),
  issuedDate: z
    .string()
    .refine(date => !isNaN(Date.parse(date)), 'Invalid issued date'),
  expiryDate: z
    .string()
    .refine(date => !isNaN(Date.parse(date)), 'Invalid expiry date')
    .optional()
    .or(z.literal('')),
  credentialId: z
    .string()
    .max(100, 'Credential ID must be less than 100 characters')
    .optional(),
  credentialUrl: z
    .string()
    .url('Invalid credential URL')
    .optional()
    .or(z.literal('')),
  description: z
    .string()
    .max(500, 'Description must be less than 500 characters')
    .optional(),
  icon: z.string().optional(),
  image: z.string().url('Invalid image URL').optional().or(z.literal('')),
  skills: z.array(z.string()).optional(),
  status: certificationStatusEnum.default('active'),
  featured: z.boolean().default(false),
  order: z.number().int().nonnegative().optional(),
});

export const certificationCreateSchema = certificationSchema.omit({ id: true });
export const certificationUpdateSchema = certificationSchema.partial();

export type CertificationFormData = z.infer<typeof certificationSchema>;
export type CertificationCreateData = z.infer<typeof certificationCreateSchema>;
export type CertificationUpdateData = z.infer<typeof certificationUpdateSchema>;
