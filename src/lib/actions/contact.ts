'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import { ensureAdmin } from '@/lib/auth-utils';

const contactStatusSchema = z.enum(['UNREAD', 'READ', 'REPLIED']);

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

  revalidatePath('/nhatphanhk102/contacts');
  return { ok: true };
}

export async function deleteContact(id: string) {
  await ensureAdmin();
  await prisma.contact.delete({ where: { id } });
  revalidatePath('/nhatphanhk102/contacts');
  return { ok: true };
}

export async function getAllContactsFromDb() {
  await ensureAdmin();
  return prisma.contact.findMany({
    where: { type: 'MESSAGE' },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getVisitorLogsFromDb() {
  await ensureAdmin();
  return prisma.contact.findMany({
    where: { type: 'VISITOR_LOG' },
    orderBy: { createdAt: 'desc' },
  });
}

export async function deleteVisitorLog(id: string) {
  await ensureAdmin();
  await prisma.contact.delete({ where: { id } });
  revalidatePath('/nhatphanhk102/visitors');
  return { ok: true };
}
