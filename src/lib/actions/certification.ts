'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import { ensureAdmin } from '@/lib/auth-utils';

const certSchema = z.object({
  name: z.string().min(3).max(255),
  issuer: z.string().min(1).max(255),
  issueDate: z.string().min(1, 'Issue date required'),
  expiryDate: z.string().optional().or(z.literal('')),
  credentialId: z.string().max(255).optional().or(z.literal('')),
  credentialUrl: z.string().url().optional().or(z.literal('')),
  description: z.string().max(1000).optional().or(z.literal('')),
  status: z.enum(['ACTIVE', 'EXPIRED']),
});

export type CertificationFormData = z.infer<typeof certSchema>;

export async function createCertification(formData: CertificationFormData) {
  await ensureAdmin();
  const parsed = certSchema.safeParse(formData);
  if (!parsed.success)
    return { ok: false, error: parsed.error.flatten().fieldErrors };

  const { expiryDate, credentialId, credentialUrl, description, ...rest } =
    parsed.data;
  await prisma.certification.create({
    data: {
      ...rest,
      issueDate: new Date(rest.issueDate),
      expiryDate: expiryDate ? new Date(expiryDate) : undefined,
      credentialId: credentialId || undefined,
      credentialUrl: credentialUrl || undefined,
      description: description || undefined,
    },
  });

  revalidatePath('/admin/certifications');
  revalidatePath('/certifications');
  return { ok: true };
}

export async function updateCertification(
  id: string,
  formData: CertificationFormData
) {
  await ensureAdmin();
  const parsed = certSchema.safeParse(formData);
  if (!parsed.success)
    return { ok: false, error: parsed.error.flatten().fieldErrors };

  const { expiryDate, credentialId, credentialUrl, description, ...rest } =
    parsed.data;
  await prisma.certification.update({
    where: { id },
    data: {
      ...rest,
      issueDate: new Date(rest.issueDate),
      expiryDate: expiryDate ? new Date(expiryDate) : null,
      credentialId: credentialId || null,
      credentialUrl: credentialUrl || null,
      description: description || null,
    },
  });

  revalidatePath('/admin/certifications');
  revalidatePath('/certifications');
  return { ok: true };
}

export async function deleteCertification(id: string) {
  await ensureAdmin();
  await prisma.certification.delete({ where: { id } });
  revalidatePath('/admin/certifications');
  revalidatePath('/certifications');
  return { ok: true };
}

export async function getAllCertificationsFromDb() {
  return prisma.certification.findMany({
    orderBy: [{ status: 'asc' }, { issueDate: 'desc' }],
  });
}
