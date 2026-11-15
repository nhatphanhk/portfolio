import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { ensureAdmin } from '@/lib/auth-utils';
import { checkRateLimit, getClientIp, RATE_LIMIT_PRESETS, isSafePublicUrl } from '@/lib/rate-limit';
import { prisma } from '@/lib/db';
import path from 'path';
import fs from 'fs/promises';

const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const MAX_PDF_BYTES = 15 * 1024 * 1024;
/** Folder prefix inside the blob store / Media.fileType; anything else falls back to 'blog'. */
const FILE_TYPE_PATTERN = /^[a-z0-9_-]{1,32}$/;

/**
 * Sniffs the real file type from magic bytes. The client-declared MIME type and extension are
 * not trusted: a "PDF" uploaded as text/html, or an SVG carrying scripts, would otherwise be
 * served from this origin. SVG is deliberately not accepted.
 */
function sniffFileType(buf: Buffer): { mime: string; ext: string; kind: 'image' | 'pdf' } | null {
  if (buf.length < 12) return null;
  const ascii = (from: number, to: number) => buf.subarray(from, to).toString('ascii');
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return { mime: 'image/jpeg', ext: 'jpg', kind: 'image' };
  if (buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) {
    return { mime: 'image/png', ext: 'png', kind: 'image' };
  }
  if (ascii(0, 4) === 'GIF8') return { mime: 'image/gif', ext: 'gif', kind: 'image' };
  if (ascii(0, 4) === 'RIFF' && ascii(8, 12) === 'WEBP') return { mime: 'image/webp', ext: 'webp', kind: 'image' };
  if (ascii(4, 8) === 'ftyp' && (ascii(8, 12).startsWith('avif') || ascii(8, 12) === 'avis')) {
    return { mime: 'image/avif', ext: 'avif', kind: 'image' };
  }
  if (ascii(0, 5) === '%PDF-') return { mime: 'application/pdf', ext: 'pdf', kind: 'pdf' };
  return null;
}

/** Timestamped, filesystem/URL-safe name; the extension always reflects the sniffed type. */
function safeFileName(originalName: string, ext: string): string {
  const stem = originalName.replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 80) || 'file';
  return `${Date.now()}-${stem}.${ext}`;
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  if (!checkRateLimit(`upload:${ip}`, RATE_LIMIT_PRESETS.UPLOAD.limit, RATE_LIMIT_PRESETS.UPLOAD.windowMs)) {
    return NextResponse.json({ error: 'Too many upload requests. Please try again later.' }, { status: 429 });
  }

  let adminEmail: string | null | undefined;
  try {
    adminEmail = (await ensureAdmin()).email;
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const reqContentType = request.headers.get('content-type') || '';
    let fileBuffer: Buffer;
    let originalName: string;
    let fileType = 'blog';

    if (reqContentType.includes('application/json')) {
      // Re-host an external image (used by the editor's smart paste)
      const body = (await request.json().catch(() => null)) as { imageUrl?: unknown; fileType?: unknown } | null;
      const imageUrl = body?.imageUrl;
      if (!imageUrl || typeof imageUrl !== 'string' || !isSafePublicUrl(imageUrl)) {
        return NextResponse.json({ error: 'Invalid, insecure, or private image URL' }, { status: 400 });
      }
      if (typeof body?.fileType === 'string') fileType = body.fileType;

      const res = await fetch(imageUrl, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          Accept: 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
        },
        signal: AbortSignal.timeout(15_000),
      });
      // Redirects are followed, so the final URL must still point at a public host
      if (!res.ok || !isSafePublicUrl(res.url || imageUrl)) {
        return NextResponse.json(
          { error: `Failed to fetch external image (${res.status} ${res.statusText})` },
          { status: 400 }
        );
      }
      if (Number(res.headers.get('content-length') || 0) > MAX_IMAGE_BYTES) {
        return NextResponse.json({ error: 'Image size exceeds 10MB limit' }, { status: 400 });
      }
      fileBuffer = Buffer.from(await res.arrayBuffer());
      originalName = imageUrl.split('?')[0].split('/').pop() || `rehosted-${Date.now()}`;
    } else {
      const formData = await request.formData();
      const file = formData.get('file') as File | null;
      const requestedType = formData.get('fileType');
      if (typeof requestedType === 'string') fileType = requestedType;
      if (!file) {
        return NextResponse.json({ error: 'No file provided' }, { status: 400 });
      }
      if (file.size > MAX_PDF_BYTES) {
        return NextResponse.json({ error: 'File size must be less than 15MB' }, { status: 400 });
      }
      fileBuffer = Buffer.from(await file.arrayBuffer());
      originalName = file.name;
    }

    if (!FILE_TYPE_PATTERN.test(fileType)) fileType = 'blog';

    const sniffed = sniffFileType(fileBuffer);
    if (!sniffed) {
      return NextResponse.json(
        { error: 'File must be a JPEG, PNG, GIF, WebP or AVIF image, or a PDF document' },
        { status: 400 }
      );
    }
    const maxSize = sniffed.kind === 'pdf' ? MAX_PDF_BYTES : MAX_IMAGE_BYTES;
    if (fileBuffer.length > maxSize) {
      return NextResponse.json(
        { error: `File size must be less than ${sniffed.kind === 'pdf' ? '15MB' : '10MB'}` },
        { status: 400 }
      );
    }

    const fileMime = sniffed.mime;
    const fileSize = fileBuffer.length;
    const fileName = safeFileName(originalName, sniffed.ext);

    let publicUrl: string;
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      const blob = await put(`${fileType}/${fileName}`, fileBuffer, {
        access: 'public',
        contentType: fileMime,
        addRandomSuffix: true,
      });
      publicUrl = blob.url;
    } else if (process.env.VERCEL) {
      // The deployed filesystem is read-only and files written at runtime are never served
      return NextResponse.json(
        { error: 'Upload storage is not configured (BLOB_READ_WRITE_TOKEN is missing)' },
        { status: 503 }
      );
    } else {
      // Local development fallback: save to public/uploads
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
      await fs.mkdir(uploadsDir, { recursive: true });
      await fs.writeFile(path.join(uploadsDir, fileName), fileBuffer);
      publicUrl = `/uploads/${fileName}`;
    }

    // Save metadata to the Media table (non-fatal if it fails)
    let mediaId: string | undefined;
    const dbUser = adminEmail
      ? await prisma.user.findFirst({ where: { email: adminEmail }, select: { id: true } })
      : null;
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
