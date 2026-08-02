'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import { ensureAdmin } from '@/lib/auth-utils';

const contactStatusSchema = z.enum(['UNREAD', 'READ', 'REPLIED']);

const visitorSchema = z.object({
  name: z.string().min(1).max(255),
  email: z.string().email(),
  reason: z.string().min(1).max(1000),
});

export type VisitorFormData = z.infer<typeof visitorSchema>;

export async function updateContactStatus(
  id: string,
  status: 'UNREAD' | 'READ' | 'REPLIED'
) {
  await ensureAdmin();
  const parsed = contactStatusSchema.safeParse(status);
  if (!parsed.success) return { ok: false };

  await prisma.contact.update({
    where: { id },
    data: { status: parsed.data },
  });

  revalidatePath('/admin/contacts');
  return { ok: true };
}

export async function deleteContact(id: string) {
  await ensureAdmin();
  await prisma.contact.delete({ where: { id } });
  revalidatePath('/admin/contacts');
  return { ok: true };
}

export async function logVisitor(formData: VisitorFormData) {
  const parsed = visitorSchema.safeParse(formData);
  if (!parsed.success)
    return { ok: false, error: parsed.error.flatten().fieldErrors };

  await prisma.contact.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      subject: 'Visitor Log',
      message: parsed.data.reason,
      status: 'UNREAD',
    },
  });

  return { ok: true };
}

export async function getAllContactsFromDb() {
  return prisma.contact.findMany({
    where: { NOT: { subject: 'Visitor Log' } },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getVisitorLogsFromDb() {
  return prisma.contact.findMany({
    where: { subject: 'Visitor Log' },
    orderBy: { createdAt: 'desc' },
  });
}

export async function deleteVisitorLog(id: string) {
  await ensureAdmin();
  await prisma.contact.delete({ where: { id } });
  revalidatePath('/admin/visitors');
  return { ok: true };
}
