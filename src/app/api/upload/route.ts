import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { auth } from '@/auth';
import { checkRateLimit, getClientIp, RATE_LIMIT_PRESETS } from '@/lib/rate-limit';
import { prisma } from '@/lib/db';
import path from 'path';
import fs from 'fs/promises';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const ip = getClientIp(request);
    if (!checkRateLimit(`upload:${ip}`, RATE_LIMIT_PRESETS.UPLOAD.limit, RATE_LIMIT_PRESETS.UPLOAD.windowMs)) {
      return NextResponse.json(
        { error: 'Too many upload requests. Please try again later.' },
        { status: 429 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const fileType = (formData.get('fileType') as string) || 'blog';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    const isImage = file.type.startsWith('image/');

    if (!isImage && !isPdf) {
      return NextResponse.json(
        { error: 'File must be an image or a PDF document' },
        { status: 400 }
      );
    }

    const maxSize = isPdf ? 15 * 1024 * 1024 : 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: `File size must be less than ${isPdf ? '15MB' : '10MB'}` },
        { status: 400 }
      );
    }

    // Resolve uploader DB id
    const dbUser = await prisma.user.findFirst({
      where: { email: session.user?.email ?? '' },
      select: { id: true },
    });

    let publicUrl: string;

    if (process.env.BLOB_READ_WRITE_TOKEN) {
      const safeName = `${fileType}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
      const blob = await put(safeName, file, {
        access: 'public',
        contentType: file.type,
      });
      publicUrl = blob.url;
    } else {
      // Local fallback: save to public/uploads
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
      await fs.mkdir(uploadsDir, { recursive: true });

      const safeName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
      const filePath = path.join(uploadsDir, safeName);
      const buffer = Buffer.from(await file.arrayBuffer());
      await fs.writeFile(filePath, buffer);
      publicUrl = `/uploads/${safeName}`;
    }

    // Save metadata to Media table (non-fatal if fails)
    let mediaId: string | undefined;
    if (dbUser) {
      try {
        const media = await prisma.media.create({
          data: {
            url: publicUrl,
            filename: file.name,
            mimetype: file.type,
            size: file.size,
            fileType,
            uploadedById: dbUser.id,
          },
        });
        mediaId = media.id;
      } catch (dbErr) {
        console.warn('Media DB record failed (non-fatal):', dbErr);
      }
    }

    return NextResponse.json({
      id: mediaId,
      url: publicUrl,
      filename: file.name,
      size: file.size,
      type: file.type,
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
  }
}
