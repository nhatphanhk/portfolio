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

    const reqContentType = request.headers.get('content-type') || '';
    let fileBuffer: Buffer;
    let fileName: string;
    let fileMime: string;
    let fileSize: number;
    let fileType = 'blog';

    if (reqContentType.includes('application/json')) {
      const body = await request.json();
      const imageUrl = body.imageUrl;
      if (!imageUrl || typeof imageUrl !== 'string' || !/^https?:\/\//i.test(imageUrl)) {
        return NextResponse.json({ error: 'Invalid or missing image URL' }, { status: 400 });
      }
      fileType = body.fileType || 'blog';

      const res = await fetch(imageUrl, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          Accept: 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        },
      });

      if (!res.ok) {
        return NextResponse.json(
          { error: `Failed to fetch external image (${res.status} ${res.statusText})` },
          { status: 400 }
        );
      }

      const mime = res.headers.get('content-type')?.split(';')[0].trim().toLowerCase() || 'image/jpeg';
      if (!mime.startsWith('image/')) {
        return NextResponse.json({ error: 'Target URL is not an image' }, { status: 400 });
      }

      const arrayBuf = await res.arrayBuffer();
      fileBuffer = Buffer.from(arrayBuf);
      fileSize = fileBuffer.length;
      if (fileSize > 10 * 1024 * 1024) {
        return NextResponse.json({ error: 'Image size exceeds 10MB limit' }, { status: 400 });
      }

      fileMime = mime;
      const ext = mime.split('/')[1]?.replace('svg+xml', 'svg').replace('jpeg', 'jpg') || 'jpg';
      const cleanUrl = imageUrl.split('?')[0];
      const urlBase = cleanUrl.split('/').pop() || `rehosted-${Date.now()}`;
      fileName = urlBase.includes('.') ? urlBase : `${urlBase}.${ext}`;
    } else {
      const formData = await request.formData();
      const file = formData.get('file') as File | null;
      fileType = (formData.get('fileType') as string) || 'blog';

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

      const arrayBuf = await file.arrayBuffer();
      fileBuffer = Buffer.from(arrayBuf);
      fileSize = file.size;
      fileName = file.name;
      fileMime = file.type;
    }

    // Resolve uploader DB id
    const dbUser = await prisma.user.findFirst({
      where: { email: session.user?.email ?? '' },
      select: { id: true },
    });

    let publicUrl: string;

    if (process.env.BLOB_READ_WRITE_TOKEN) {
      const safeName = `${fileType}/${Date.now()}-${fileName.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
      const blob = await put(safeName, fileBuffer, {
        access: 'public',
        contentType: fileMime,
      });
      publicUrl = blob.url;
    } else {
      // Local fallback: save to public/uploads
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
      await fs.mkdir(uploadsDir, { recursive: true });

      const safeName = `${Date.now()}-${fileName.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
      const filePath = path.join(uploadsDir, safeName);
      await fs.writeFile(filePath, fileBuffer);
      publicUrl = `/uploads/${safeName}`;
    }

    // Save metadata to Media table (non-fatal if fails)
    let mediaId: string | undefined;
    if (dbUser) {
      try {
        const media = await prisma.media.create({
          data: {
            url: publicUrl,
            filename: fileName,
            mimetype: fileMime,
            size: fileSize,
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
      filename: fileName,
      size: fileSize,
      type: fileMime,
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
  }
}
