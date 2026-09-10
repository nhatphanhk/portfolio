import { prisma } from '@/lib/db';

export interface TranslatedBlogData {
  title: string;
  excerpt: string;
  content: string;
}

export interface TranslationResult {
  ok: boolean;
  data?: TranslatedBlogData;
  error?: string;
}

const CANDIDATE_MODELS = [
  'gemini-flash-latest',
  'gemini-3.6-flash',
  'gemini-flash-lite-latest',
  'gemini-3.5-flash',
];

/**
 * Translates blog content using Google Gemini REST API with candidate models and timeout protection.
 * Returns detailed success or error information for display in the admin preview dialog.
 */
export async function generateBlogTranslationWithDetails(
  sourceData: { title: string; excerpt?: string | null; content: string },
  targetLocale: 'vi' | 'en' = 'vi',
  customApiKey?: string
): Promise<TranslationResult> {
  const apiKey = customApiKey || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return {
      ok: false,
      error: 'GEMINI_API_KEY chưa được cấu hình trong .env hoặc không hợp lệ.',
    };
  }

  const title = (sourceData.title || '').trim() || 'Untitled Post';
  const excerpt = (sourceData.excerpt || '').trim();
  const rawContent = sourceData.content ?? '';
  const textOnly = rawContent.replace(/<[^>]*>/g, '').trim();
  const hasContent = textOnly.length > 0;

  const targetLangName = targetLocale === 'vi' ? 'Vietnamese (Tiếng Việt)' : 'English';

  const prompt = `You are a professional software engineering translator and technical writer.
Translate the following blog post into natural, idiomatic, high-quality ${targetLangName}.

CRITICAL REQUIREMENTS:
1. Preserve technical terminology naturally (e.g., React, TypeScript, Docker, API, Backend, Frontend, Next.js, Cloud, etc.).
2. For HTML content: PRESERVE ALL HTML tags, attributes, class names, and code syntax intact. ONLY translate the readable human text between the tags.
3. Keep code blocks and inline code (<pre>, <code>) completely untranslated, keeping the original code intact.
4. If content is empty, return empty string for content.
5. Return ONLY a valid JSON object matching this schema:
{
  "title": "Translated title",
  "excerpt": "Translated excerpt / summary",
  "content": "Translated HTML content"
}

ORIGINAL BLOG DATA:
Title: ${title}
Excerpt: ${excerpt}
Content (HTML):
${hasContent ? rawContent : '(No content)'}
`;

  let lastErrorMessage = 'Unknown error';

  for (const model of CANDIDATE_MODELS) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.2,
            responseMimeType: 'application/json',
          },
        }),
        signal: AbortSignal.timeout(8000),
      });

      const data = await res.json();
      if (!res.ok) {
        lastErrorMessage = data.error?.message || `HTTP ${res.status}: ${res.statusText}`;
        console.warn(`Gemini model ${model} failed (${lastErrorMessage}), trying fallback...`);
        continue;
      }

      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) {
        lastErrorMessage = `Model ${model} returned empty content`;
        continue;
      }

      // Clean JSON fences
      const cleaned = rawText
        .replace(/^```json\s*/i, '')
        .replace(/\s*```$/i, '')
        .trim();

      let parsed: Partial<TranslatedBlogData> = {};
      try {
        parsed = JSON.parse(cleaned);
      } catch (_parseErr) {
        // Fallback simple extraction if JSON had formatting quirks
        const titleMatch = cleaned.match(/"title"\s*:\s*"([^"]+)"/);
        const excerptMatch = cleaned.match(/"excerpt"\s*:\s*"([^"]*)"/);
        const contentMatch = cleaned.match(/"content"\s*:\s*"([\s\S]*)"/);
        parsed = {
          title: titleMatch ? titleMatch[1] : undefined,
          excerpt: excerptMatch ? excerptMatch[1] : undefined,
          content: contentMatch ? contentMatch[1] : undefined,
        };
      }

      return {
        ok: true,
        data: {
          title: (parsed.title || title).trim(),
          excerpt: (parsed.excerpt ?? excerpt).trim(),
          content: hasContent ? (parsed.content ?? rawContent) : rawContent,
        },
      };
    } catch (err: any) {
      lastErrorMessage = err.message || 'Connection failed';
      console.warn(`Gemini model ${model} exception (${lastErrorMessage}), trying fallback...`);
    }
  }

  console.error('All Gemini candidate models failed:', lastErrorMessage);
  return {
    ok: false,
    error: `AI translation failed: ${lastErrorMessage}`,
  };
}

/**
 * Generates translated blog content using Google Gemini AI without saving to DB yet.
 * Returns the translated { title, excerpt, content } for preview and editing.
 */
export async function generateBlogTranslation(
  sourceData: { title: string; excerpt?: string | null; content: string },
  targetLocale: 'vi' | 'en' = 'vi',
  customApiKey?: string
): Promise<TranslatedBlogData | null> {
  const result = await generateBlogTranslationWithDetails(sourceData, targetLocale, customApiKey);
  return result.ok && result.data ? result.data : null;
}

/**
 * Saves or updates a translation in the PostgreSQL database for instant loading.
 */
export async function saveBlogTranslationToDb(
  blogId: string,
  data: TranslatedBlogData,
  targetLocale: 'vi' | 'en' = 'vi'
): Promise<boolean> {
  try {
    await prisma.contentTranslation.upsert({
      where: {
        entityType_entityId_locale: {
          entityType: 'blog',
          entityId: blogId,
          locale: targetLocale,
        },
      },
      create: {
        entityType: 'blog',
        entityId: blogId,
        locale: targetLocale,
        title: data.title,
        excerpt: data.excerpt,
        content: data.content,
      },
      update: {
        title: data.title,
        excerpt: data.excerpt,
        content: data.content,
        updatedAt: new Date(),
      },
    });
    return true;
  } catch (err) {
    console.error('Error saving blog translation to DB:', err);
    return false;
  }
}

/**
 * Translates a blog post and immediately saves the result to the database.
 */
export async function translateAndSaveBlogPost(
  blogId: string,
  sourceData: { title: string; excerpt?: string | null; content: string },
  targetLocale: 'vi' | 'en' = 'vi',
  customApiKey?: string
): Promise<TranslatedBlogData | null> {
  const result = await generateBlogTranslation(sourceData, targetLocale, customApiKey);
  if (!result) return null;

  await saveBlogTranslationToDb(blogId, result, targetLocale);
  return result;
}

/**
 * Retrieves cached translation from DB, or triggers AI translation on-demand and saves it.
 */
export async function getOrTranslateBlog(
  blogId: string,
  sourceData: { title: string; excerpt?: string | null; content: string },
  targetLocale: 'vi' | 'en'
): Promise<TranslatedBlogData> {
  // 1. Check database first (0 ms wait if pre-translated)
  try {
    const cached = await prisma.contentTranslation.findUnique({
      where: {
        entityType_entityId_locale: {
          entityType: 'blog',
          entityId: blogId,
          locale: targetLocale,
        },
      },
    });

    if (cached?.content && cached?.title) {
      return {
        title: cached.title,
        excerpt: cached.excerpt || sourceData.excerpt || '',
        content: cached.content,
      };
    }
  } catch (dbErr) {
    console.warn('Could not query contentTranslation table:', dbErr);
  }

  // 2. If not found in DB, translate with AI and save to DB
  const aiResult = await translateAndSaveBlogPost(blogId, sourceData, targetLocale);
  if (aiResult) {
    return aiResult;
  }

  // 3. Fallback to original
  return {
    title: sourceData.title,
    excerpt: sourceData.excerpt || '',
    content: sourceData.content,
  };
}
