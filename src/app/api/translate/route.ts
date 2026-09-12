import { NextResponse } from 'next/server';
import { ensureAdmin } from '@/lib/auth-utils';
import {
  generateBlogTranslationWithDetails,
  saveBlogTranslationToDb,
  translateAndSaveBlogPost,
  generateProjectTranslationWithDetails,
  generateSeriesTranslationWithDetails,
  generateProfileTranslationWithDetails,
  generateExperienceTranslationWithDetails,
  saveEntityTranslationToDb,
  generateSiteContentTranslationWithDetails,
  saveSiteContentTranslationsToDb,
} from '@/lib/gemini-translate';

export async function POST(req: Request) {
  try {
    await ensureAdmin();

    const body = await req.json();
    const {
      entityType = 'blog',
      entityId,
      blogId, // backward compatibility
      targetLocale,
      action,
      // Content fields
      title,
      excerpt,
      content,
      description,
      tagline,
      bio,
      careerObjective,
      softSkills,
      position,
      achievements,
      customApiKey,
    } = body;

    const id = entityId || blogId;
    const locale = (targetLocale === 'en' ? 'en' : 'vi') as 'vi' | 'en';

    // ── 1. BLOG ──────────────────────────────────────────────────────────
    if (entityType === 'blog') {
      if (action === 'preview') {
        const result = await generateBlogTranslationWithDetails(
          {
            title: title || 'Untitled Post',
            excerpt: excerpt || '',
            content: content || '',
          },
          locale,
          customApiKey
        );

        if (!result.ok || !result.data) {
          return NextResponse.json(
            { ok: false, error: result.error || 'AI translation failed' },
            { status: 500 }
          );
        }

        return NextResponse.json({ ok: true, data: result.data });
      }

      if (action === 'save') {
        if (!id) {
          return NextResponse.json({ ok: false, error: 'Missing blogId or entityId' }, { status: 400 });
        }

        const success = await saveBlogTranslationToDb(
          id,
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
      if (!id) {
        return NextResponse.json({ ok: false, error: 'Missing blogId or entityId' }, { status: 400 });
      }

      const translation = await translateAndSaveBlogPost(
        id,
        { title: title || '', excerpt: excerpt || '', content: content || '' },
        locale,
        customApiKey
      );

      if (!translation) {
        return NextResponse.json({ ok: false, error: 'AI translation failed' }, { status: 500 });
      }

      return NextResponse.json({ ok: true, translation, data: translation });
    }

    // ── 2. PROJECT ───────────────────────────────────────────────────────
    if (entityType === 'project') {
      if (action === 'preview') {
        const result = await generateProjectTranslationWithDetails(
          {
            title: title || '',
            description: description || '',
            content: content || '',
          },
          locale,
          customApiKey
        );

        if (!result.ok || !result.data) {
          return NextResponse.json(
            { ok: false, error: result.error || 'Project translation failed' },
            { status: 500 }
          );
        }

        return NextResponse.json({ ok: true, data: result.data });
      }

      if (action === 'save') {
        if (!id) {
          return NextResponse.json({ ok: false, error: 'Missing entityId' }, { status: 400 });
        }

        const success = await saveEntityTranslationToDb(
          'project',
          id,
          {
            title: title || undefined,
            description: description || undefined,
            content: content || undefined,
          },
          locale
        );

        if (!success) {
          return NextResponse.json(
            { ok: false, error: 'Failed to save project translation to database' },
            { status: 500 }
          );
        }

        return NextResponse.json({ ok: true });
      }
    }

    // ── 3. SERIES ────────────────────────────────────────────────────────
    if (entityType === 'series') {
      if (action === 'preview') {
        const result = await generateSeriesTranslationWithDetails(
          {
            title: title || '',
            description: description || '',
          },
          locale,
          customApiKey
        );

        if (!result.ok || !result.data) {
          return NextResponse.json(
            { ok: false, error: result.error || 'Series translation failed' },
            { status: 500 }
          );
        }

        return NextResponse.json({ ok: true, data: result.data });
      }

      if (action === 'save') {
        if (!id) {
          return NextResponse.json({ ok: false, error: 'Missing entityId' }, { status: 400 });
        }

        const success = await saveEntityTranslationToDb(
          'series',
          id,
          {
            title: title || undefined,
            description: description || undefined,
          },
          locale
        );

        if (!success) {
          return NextResponse.json(
            { ok: false, error: 'Failed to save series translation to database' },
            { status: 500 }
          );
        }

        return NextResponse.json({ ok: true });
      }
    }

    // ── 4. PROFILE ───────────────────────────────────────────────────────
    if (entityType === 'profile') {
      if (action === 'preview') {
        const result = await generateProfileTranslationWithDetails(
          {
            title,
            tagline,
            bio,
            careerObjective,
            softSkills,
          },
          locale,
          customApiKey
        );

        if (!result.ok || !result.data) {
          return NextResponse.json(
            { ok: false, error: result.error || 'Profile translation failed' },
            { status: 500 }
          );
        }

        return NextResponse.json({ ok: true, data: result.data });
      }

      if (action === 'save') {
        if (!id) {
          return NextResponse.json({ ok: false, error: 'Missing entityId' }, { status: 400 });
        }

        const success = await saveEntityTranslationToDb(
          'profile',
          id,
          {
            title: title ?? undefined,
            description: bio ?? undefined,
            content: careerObjective ?? undefined,
            excerpt: softSkills ?? undefined,
          },
          locale
        );

        if (!success) {
          return NextResponse.json(
            { ok: false, error: 'Failed to save profile translation to database' },
            { status: 500 }
          );
        }

        return NextResponse.json({ ok: true });
      }
    }

    // ── 5. EXPERIENCE ────────────────────────────────────────────────────
    if (entityType === 'experience') {
      if (action === 'preview') {
        const result = await generateExperienceTranslationWithDetails(
          {
            position: position || title || '',
            description: description || '',
            achievements: achievements || content || '',
          },
          locale,
          customApiKey
        );

        if (!result.ok || !result.data) {
          return NextResponse.json(
            { ok: false, error: result.error || 'Experience translation failed' },
            { status: 500 }
          );
        }

        return NextResponse.json({ ok: true, data: result.data });
      }

      if (action === 'save') {
        if (!id) {
          return NextResponse.json({ ok: false, error: 'Missing entityId' }, { status: 400 });
        }

        const success = await saveEntityTranslationToDb(
          'experience',
          id,
          {
            title: position || title || undefined,
            description: description || undefined,
            content: achievements || content || undefined,
          },
          locale
        );

        if (!success) {
          return NextResponse.json(
            { ok: false, error: 'Failed to save experience translation to database' },
            { status: 500 }
          );
        }

        return NextResponse.json({ ok: true });
      }
    }

    // ── 6. SITE CONTENT (LANDING PAGE) ───────────────────────────────────
    if (entityType === 'site_content') {
      const siteData = (body.siteData || body.items || {}) as Record<string, string>;

      if (action === 'preview') {
        const result = await generateSiteContentTranslationWithDetails(
          siteData,
          locale,
          customApiKey
        );

        if (!result.ok || !result.data) {
          return NextResponse.json(
            { ok: false, error: result.error || 'Landing page translation failed' },
            { status: 500 }
          );
        }

        return NextResponse.json({ ok: true, data: result.data });
      }

      if (action === 'save') {
        const translations = (body.translations || siteData) as Record<string, string>;
        const success = await saveSiteContentTranslationsToDb(locale, translations);

        if (!success) {
          return NextResponse.json(
            { ok: false, error: 'Failed to save landing page translation to database' },
            { status: 500 }
          );
        }

        return NextResponse.json({ ok: true });
      }
    }

    return NextResponse.json({ ok: false, error: `Unsupported entityType: ${entityType}` }, { status: 400 });
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
