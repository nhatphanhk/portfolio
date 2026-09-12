import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { parseResumePdfText } from '@/lib/pdf-resume-parser';
import { checkRateLimit, getClientIp, RATE_LIMIT_PRESETS } from '@/lib/rate-limit';
import { put } from '@vercel/blob';
import path from 'path';
import fs from 'fs/promises';

// pdf-parse dynamic import to avoid any build-time packaging conflicts
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const ip = getClientIp(request);
    if (!checkRateLimit(`parse-pdf:${ip}`, RATE_LIMIT_PRESETS.AI_PARSING.limit, RATE_LIMIT_PRESETS.AI_PARSING.windowMs)) {
      return NextResponse.json(
        { error: 'Quá nhiều yêu cầu xử lý CV. Vui lòng thử lại sau.' },
        { status: 429 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const url = formData.get('url') as string | null;

    let buffer: Buffer;
    let fileName = 'resume.pdf';
    let fileSize = 0;
    let fileUrl: string | undefined;

    if (file) {
      const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
      if (!isPdf) {
        return NextResponse.json(
          { error: 'Tệp tải lên phải có định dạng PDF (.pdf)' },
          { status: 400 }
        );
      }

      if (file.size > 15 * 1024 * 1024) {
        return NextResponse.json(
          { error: 'Kích thước tệp vượt quá giới hạn 15MB' },
          { status: 400 }
        );
      }

      fileName = file.name;
      fileSize = file.size;
      const arrayBuffer = await file.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);

      // Save file for persistence / resumeUrl attachment
      try {
        if (process.env.BLOB_READ_WRITE_TOKEN) {
          const blob = await put(file.name, file, { access: 'public' });
          fileUrl = blob.url;
        } else {
          const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
          await fs.mkdir(uploadsDir, { recursive: true });
          const safeName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
          const filePath = path.join(uploadsDir, safeName);
          await fs.writeFile(filePath, buffer);
          fileUrl = `/uploads/${safeName}`;
        }
      } catch (saveError) {
        console.warn('Could not persist file to uploads directory, continuing with parsed data', saveError);
      }
    } else if (url) {
      const trimmedUrl = url.trim();
      fileUrl = trimmedUrl;
      if (trimmedUrl.startsWith('/uploads/')) {
        const filePath = path.join(process.cwd(), 'public', trimmedUrl);
        buffer = await fs.readFile(filePath);
        fileName = path.basename(filePath);
        fileSize = buffer.length;
      } else if (trimmedUrl.startsWith('http')) {
        const fetchRes = await fetch(trimmedUrl);
        if (!fetchRes.ok) {
          return NextResponse.json({ error: 'Không thể tải file PDF từ URL này' }, { status: 400 });
        }
        const arrayBuffer = await fetchRes.arrayBuffer();
        buffer = Buffer.from(arrayBuffer);
        fileName = trimmedUrl.split('/').pop() || 'resume.pdf';
        fileSize = buffer.length;
      } else {
        return NextResponse.json({ error: 'Đường dẫn URL không hợp lệ' }, { status: 400 });
      }
    } else {
      return NextResponse.json({ error: 'Vui lòng cung cấp file hoặc URL của file PDF' }, { status: 400 });
    }

    const useAi = formData.get('useAi') === 'true' || formData.get('useAi') === '1';
    const apiKey = (formData.get('apiKey') as string | null) || undefined;

    // Parse PDF text using pdf-parse
    const pdfParse = require('pdf-parse/lib/pdf-parse');
    const parsedPdf = await pdfParse(buffer);
    const rawText = parsedPdf.text || '';

    if (!rawText.trim()) {
      return NextResponse.json(
        {
          error:
            'Không thể đọc nội dung văn bản từ file PDF (có thể là file scan/ảnh). Vui lòng sử dụng file PDF chứa văn bản có thể chọn được.',
        },
        { status: 422 }
      );
    }

    // Extract structured CV data: Try Gemini AI if enabled or key available, fallback to regex
    let parsedData;
    let aiEnhanced = false;
    let aiError: string | undefined;

    const hasGeminiKey = Boolean(apiKey || process.env.GEMINI_API_KEY);
    if (useAi || hasGeminiKey) {
      try {
        const { parseResumeWithGemini } = await import('@/lib/gemini-resume-parser');
        parsedData = await parseResumeWithGemini(rawText, apiKey);
        aiEnhanced = true;
      } catch (err: any) {
        console.warn('Gemini parsing failed, falling back to rule-based parser:', err);
        aiError = err.message;
        parsedData = parseResumePdfText(rawText);
      }
    } else {
      parsedData = parseResumePdfText(rawText);
    }

    return NextResponse.json({
      ok: true,
      data: parsedData,
      aiEnhanced,
      aiError,
      fileUrl,
      fileName,
      fileSize,
      pages: parsedPdf.numpages || 1,
    });
  } catch (error: any) {
    console.error('Error parsing PDF resume:', error);
    return NextResponse.json(
      {
        error: error.message || 'Có lỗi xảy ra khi phân tích tệp PDF CV.',
      },
      { status: 500 }
    );
  }
}
