import { NextResponse } from 'next/server';
import { ensureAdmin } from '@/lib/auth-utils';
import {
  generateBlogTranslationWithDetails,
  saveBlogTranslationToDb,
  translateAndSaveBlogPost,
} from '@/lib/gemini-translate';

export async function POST(req: Request) {
  try {
    await ensureAdmin();

    const body = await req.json();
    const { blogId, title, excerpt, content, targetLocale, action } = body;

    const locale = (targetLocale === 'en' ? 'en' : 'vi') as 'vi' | 'en';

    // Action: 'preview' (translate without saving)
    if (action === 'preview') {
      const result = await generateBlogTranslationWithDetails(
        {
          title: title || 'Untitled Post',
          excerpt: excerpt || '',
          content: content || '',
        },
        locale
      );

      if (!result.ok || !result.data) {
        return NextResponse.json(
          { ok: false, error: result.error || 'AI translation failed' },
          { status: 500 }
        );
      }

      return NextResponse.json({ ok: true, data: result.data });
    }

    // Action: 'save' (save approved translation to database)
    if (action === 'save') {
      if (!blogId) {
        return NextResponse.json({ ok: false, error: 'Missing blogId' }, { status: 400 });
      }

      const success = await saveBlogTranslationToDb(
        blogId,
        {
          title: title || '',
          excerpt: excerpt || '',
          content: content || '',
        },
        locale
      );

      if (!success) {
        return NextResponse.json(
          { ok: false, error: 'Failed to save translation to database' },
          { status: 500 }
        );
      }

      return NextResponse.json({ ok: true });
    }

    // Default: 'translateAndSave'
    if (!blogId) {
      return NextResponse.json(
        { ok: false, error: 'Missing blogId' },
        { status: 400 }
      );
    }

    const translation = await translateAndSaveBlogPost(
      blogId,
      { title: title || '', excerpt: excerpt || '', content: content || '' },
      locale
    );

    if (!translation) {
      return NextResponse.json(
        { ok: false, error: 'AI translation failed' },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, translation, data: translation });
  } catch (err: any) {
    console.error('API /api/translate error:', err);
    const status =
      err.message === 'Unauthorized' ? 401 : err.message === 'Forbidden' ? 403 : 500;
    return NextResponse.json(
      { ok: false, error: err.message || 'Internal server error' },
      { status }
    );
  }
}
