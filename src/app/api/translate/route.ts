import { NextResponse } from 'next/server';
import { translateAndSaveBlogPost } from '@/lib/gemini-translate';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { blogId, title, excerpt, content, targetLocale } = body;

    if (!blogId || !title || !content) {
      return NextResponse.json(
        { ok: false, error: 'Missing required blog fields' },
        { status: 400 }
      );
    }

    const translation = await translateAndSaveBlogPost(
      blogId,
      { title, excerpt, content },
      targetLocale || 'vi'
    );

    if (!translation) {
      return NextResponse.json(
        { ok: false, error: 'AI translation failed' },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, translation });
  } catch (err) {
    console.error('API /api/translate error:', err);
    return NextResponse.json(
      { ok: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
