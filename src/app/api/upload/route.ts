import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { auth } from '@/auth';
import { checkRateLimit, getClientIp, RATE_LIMIT_PRESETS } from '@/lib/rate-limit';
import path from 'path';
import fs from 'fs/promises';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
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

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    const isImage = file.type.startsWith('image/');

    if (!isImage && !isPdf) {
      return NextResponse.json(
        { error: 'File must be an image or a PDF document' },
        { status: 400 }
      );
    }

    const maxSize = isPdf ? 15 * 1024 * 1024 : 5 * 1024 * 1024; // 15MB for PDF, 5MB for image
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: `File size must be less than ${isPdf ? '15MB' : '5MB'}` },
        { status: 400 }
      );
    }

    // If Vercel Blob token is configured, upload to Blob
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      const blob = await put(file.name, file, {
        access: 'public',
      });
      return NextResponse.json({
        url: blob.url,
        filename: file.name,
        size: file.size,
        type: file.type,
      });
    }

    // Local fallback: save to public/uploads
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    await fs.mkdir(uploadsDir, { recursive: true });

    const safeName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const filePath = path.join(uploadsDir, safeName);
    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(filePath, buffer);

    const publicUrl = `/uploads/${safeName}`;

    return NextResponse.json({
      url: publicUrl,
      filename: file.name,
      size: file.size,
      type: file.type,
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}

