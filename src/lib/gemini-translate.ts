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
  'gemini-3.6-flash',
  'gemini-flash-latest',
  'gemini-flash-lite-latest',
  'gemini-3.5-flash',
];

/**
 * Translates blog content using Google Gemini REST API with candidate models,
 * adaptive timeout, and maxOutputTokens protection for long articles.
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

  // Adaptive timeout based on content length:
  // Short posts: 15s. Long articles (4000+ chars): up to 60-75s to allow full generation without premature cutoff.
  const timeoutMs = Math.max(
    15000,
    Math.min(75000, Math.round(15000 + (textOnly.length / 100) * 800))
  );

  const targetLangName = targetLocale === 'vi' ? 'Vietnamese (Tiếng Việt)' : 'English';

  const prompt = `You are a professional software engineering translator and technical writer.
Translate the following blog post into natural, idiomatic, high-quality ${targetLangName}.

CRITICAL REQUIREMENTS:
1. Preserve technical terminology naturally (e.g., React, TypeScript, Docker, API, Backend, Frontend, Next.js, Cloud, Prisma, PostgreSQL, etc.).
2. For HTML content: PRESERVE ALL HTML tags, attributes, class names, and code syntax intact. ONLY translate the readable human text between the tags.
3. Keep code blocks and inline code (<pre>, <code>) completely untranslated, keeping the original code intact.
4. Translate the ENTIRE content without summarizing, truncating, or skipping any sections or paragraphs.
5. If content is empty, return empty string for content.
6. Return ONLY a valid JSON object matching this schema:
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
            maxOutputTokens: 8192,
            responseMimeType: 'application/json',
          },
        }),
        signal: AbortSignal.timeout(timeoutMs),
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
        // Resilient fallback regex extraction for large payloads with escaped characters
        const titleMatch = cleaned.match(/"title"\s*:\s*"([^"\\]*(?:\\.[^"\\]*)*)"/);
        const excerptMatch = cleaned.match(/"excerpt"\s*:\s*"([^"\\]*(?:\\.[^"\\]*)*)"/);
        const contentMatch = cleaned.match(/"content"\s*:\s*"([\s\S]*?)"\s*}/);
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

// ─────────────────────────────────────────────────────────────────────────────
// Generic Entity Translations (Project, Series, Profile, Resume)
// Preserves Blog functions untouched
// ─────────────────────────────────────────────────────────────────────────────

export interface TranslatedProjectData {
  title: string;
  description: string;
  content: string;
}

export interface TranslatedSeriesData {
  title: string;
  description: string;
}

export interface TranslatedProfileData {
  title?: string;
  tagline?: string;
  bio?: string;
  careerObjective?: string;
  softSkills?: string;
}

export interface TranslatedExperienceData {
  position: string;
  description: string;
  achievements: string;
}

export interface TranslatedEducationData {
  degree: string;
  fieldOfStudy: string;
  description: string;
}

/**
 * Saves or updates a translation for any entity type in PostgreSQL content_translations.
 */
export async function saveEntityTranslationToDb(
  entityType: string,
  entityId: string,
  data: {
    title?: string | null;
    description?: string | null;
    excerpt?: string | null;
    content?: string | null;
  },
  locale: string = 'en'
): Promise<boolean> {
  try {
    await prisma.contentTranslation.upsert({
      where: {
        entityType_entityId_locale: {
          entityType,
          entityId,
          locale,
        },
      },
      create: {
        entityType,
        entityId,
        locale,
        title: data.title ?? undefined,
        description: data.description ?? undefined,
        excerpt: data.excerpt ?? undefined,
        content: data.content ?? undefined,
      },
      update: {
        title: data.title ?? undefined,
        description: data.description ?? undefined,
        excerpt: data.excerpt ?? undefined,
        content: data.content ?? undefined,
        updatedAt: new Date(),
      },
    });
    return true;
  } catch (err) {
    console.error(`Error saving ${entityType} translation to DB:`, err);
    return false;
  }
}

/**
 * Retrieves a single translation record from DB.
 */
export async function getEntityTranslationFromDb(
  entityType: string,
  entityId: string,
  locale: string = 'en'
) {
  try {
    return await prisma.contentTranslation.findUnique({
      where: {
        entityType_entityId_locale: {
          entityType,
          entityId,
          locale,
        },
      },
    });
  } catch (err) {
    console.error(`Error fetching ${entityType} translation from DB:`, err);
    return null;
  }
}

/**
 * Batch retrieves translation records for a list of entity IDs.
 */
export async function getBatchEntityTranslationsFromDb(
  entityType: string,
  entityIds: string[],
  locale: string = 'en'
): Promise<Map<string, { title?: string | null; description?: string | null; excerpt?: string | null; content?: string | null }>> {
  const map = new Map<string, { title?: string | null; description?: string | null; excerpt?: string | null; content?: string | null }>();
  if (!entityIds.length) return map;

  try {
    const list = await prisma.contentTranslation.findMany({
      where: {
        entityType,
        entityId: { in: entityIds },
        locale,
      },
    });
    for (const item of list) {
      map.set(item.entityId, item);
    }
  } catch (err) {
    console.error(`Error fetching batch ${entityType} translations from DB:`, err);
  }
  return map;
}

/**
 * Internal runner to send structured JSON prompt to Gemini candidate models.
 */
async function runGeminiJsonPrompt<T>(
  prompt: string,
  timeoutMs: number = 30000,
  customApiKey?: string
): Promise<{ ok: boolean; data?: T; error?: string }> {
  const apiKey = customApiKey || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return {
      ok: false,
      error: 'GEMINI_API_KEY chưa được cấu hình trong .env hoặc không hợp lệ.',
    };
  }

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
            maxOutputTokens: 8192,
            responseMimeType: 'application/json',
          },
        }),
        signal: AbortSignal.timeout(timeoutMs),
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

      const cleaned = rawText
        .replace(/^```json\s*/i, '')
        .replace(/\s*```$/i, '')
        .trim();

      const parsed: T = JSON.parse(cleaned);
      return { ok: true, data: parsed };
    } catch (err: any) {
      lastErrorMessage = err.message || 'Connection failed';
      console.warn(`Gemini model ${model} exception (${lastErrorMessage}), trying fallback...`);
    }
  }

  return { ok: false, error: `AI translation failed: ${lastErrorMessage}` };
}

/**
 * Translates Project details (title, description, content) into targetLocale (default 'en').
 */
export async function generateProjectTranslationWithDetails(
  sourceData: { title: string; description?: string | null; content?: string | null },
  targetLocale: 'vi' | 'en' = 'en',
  customApiKey?: string
): Promise<{ ok: boolean; data?: TranslatedProjectData; error?: string }> {
  const targetLangName = targetLocale === 'vi' ? 'Vietnamese (Tiếng Việt)' : 'English';
  const prompt = `You are a professional software engineering translator.
Translate the following software project details into natural, idiomatic ${targetLangName}.

CRITICAL REQUIREMENTS:
1. Preserve technical terminology naturally (e.g., React, TypeScript, Docker, Next.js, API, etc.).
2. If HTML or Markdown is present in content, keep all tags, formatting, links, and code blocks intact. Only translate human-readable text.
3. Return ONLY a valid JSON object matching this schema:
{
  "title": "Translated project title",
  "description": "Translated short description",
  "content": "Translated full content"
}

ORIGINAL PROJECT DATA:
Title: ${sourceData.title || ''}
Description: ${sourceData.description || ''}
Content: ${sourceData.content || ''}
`;

  const result = await runGeminiJsonPrompt<TranslatedProjectData>(prompt, 35000, customApiKey);
  if (!result.ok || !result.data) {
    return { ok: false, error: result.error };
  }

  return {
    ok: true,
    data: {
      title: (result.data.title || sourceData.title).trim(),
      description: (result.data.description || sourceData.description || '').trim(),
      content: result.data.content || sourceData.content || '',
    },
  };
}

/**
 * Translates Blog Series details (title, description) into targetLocale (default 'en').
 */
export async function generateSeriesTranslationWithDetails(
  sourceData: { title: string; description?: string | null },
  targetLocale: 'vi' | 'en' = 'en',
  customApiKey?: string
): Promise<{ ok: boolean; data?: TranslatedSeriesData; error?: string }> {
  const targetLangName = targetLocale === 'vi' ? 'Vietnamese (Tiếng Việt)' : 'English';
  const prompt = `You are a professional technical writer and translator.
Translate the following article series/track information into natural, engaging ${targetLangName}.

CRITICAL REQUIREMENTS:
1. Preserve technical terminology naturally.
2. Return ONLY a valid JSON object matching this schema:
{
  "title": "Translated series title",
  "description": "Translated series overview description"
}

ORIGINAL SERIES DATA:
Title: ${sourceData.title || ''}
Description: ${sourceData.description || ''}
`;

  const result = await runGeminiJsonPrompt<TranslatedSeriesData>(prompt, 20000, customApiKey);
  if (!result.ok || !result.data) {
    return { ok: false, error: result.error };
  }

  return {
    ok: true,
    data: {
      title: (result.data.title || sourceData.title).trim(),
      description: (result.data.description || sourceData.description || '').trim(),
    },
  };
}

/**
 * Translates Profile fields (title, tagline, bio, careerObjective, softSkills) into targetLocale.
 */
export async function generateProfileTranslationWithDetails(
  sourceData: {
    title?: string | null;
    tagline?: string | null;
    bio?: string | null;
    careerObjective?: string | null;
    softSkills?: string | null;
  },
  targetLocale: 'vi' | 'en' = 'en',
  customApiKey?: string
): Promise<{ ok: boolean; data?: TranslatedProfileData; error?: string }> {
  const targetLangName = targetLocale === 'vi' ? 'Vietnamese (Tiếng Việt)' : 'English';
  const prompt = `You are a professional CV and resume translator.
Translate the following software engineer profile details into high-standard professional ${targetLangName}.

CRITICAL REQUIREMENTS:
1. Maintain strong, professional tone suitable for a senior developer resume.
2. Preserve skill names, technologies, and framework acronyms as-is.
3. Return ONLY a valid JSON object matching this schema:
{
  "title": "Translated professional headline/title",
  "tagline": "Translated short tagline",
  "bio": "Translated bio",
  "careerObjective": "Translated career objective",
  "softSkills": "Translated comma-separated soft skills"
}

ORIGINAL PROFILE DATA:
Title: ${sourceData.title || ''}
Tagline: ${sourceData.tagline || ''}
Bio: ${sourceData.bio || ''}
Career Objective: ${sourceData.careerObjective || ''}
Soft Skills: ${sourceData.softSkills || ''}
`;

  const result = await runGeminiJsonPrompt<TranslatedProfileData>(prompt, 25000, customApiKey);
  if (!result.ok || !result.data) {
    return { ok: false, error: result.error };
  }

  return {
    ok: true,
    data: {
      title: (result.data.title || sourceData.title || '').trim(),
      tagline: (result.data.tagline || sourceData.tagline || '').trim(),
      bio: (result.data.bio || sourceData.bio || '').trim(),
      careerObjective: (result.data.careerObjective || sourceData.careerObjective || '').trim(),
      softSkills: (result.data.softSkills || sourceData.softSkills || '').trim(),
    },
  };
}

/**
 * Translates Experience entry (position, description, achievements) into targetLocale.
 */
export async function generateExperienceTranslationWithDetails(
  sourceData: {
    position: string;
    description?: string | null;
    achievements?: string | null;
  },
  targetLocale: 'vi' | 'en' = 'en',
  customApiKey?: string
): Promise<{ ok: boolean; data?: TranslatedExperienceData; error?: string }> {
  const targetLangName = targetLocale === 'vi' ? 'Vietnamese (Tiếng Việt)' : 'English';
  const prompt = `You are a resume and career achievement translator.
Translate the following work experience into action-oriented professional ${targetLangName}.

CRITICAL REQUIREMENTS:
1. Use strong action verbs (e.g. Architected, Developed, Optimized, Led).
2. Keep metrics, numbers, and tech stack names intact.
3. Return ONLY a valid JSON object matching this schema:
{
  "position": "Translated position title",
  "description": "Translated role description",
  "achievements": "Translated newline-separated achievements"
}

ORIGINAL EXPERIENCE:
Position: ${sourceData.position}
Description: ${sourceData.description || ''}
Achievements: ${sourceData.achievements || ''}
`;

  const result = await runGeminiJsonPrompt<TranslatedExperienceData>(prompt, 25000, customApiKey);
  if (!result.ok || !result.data) {
    return { ok: false, error: result.error };
  }

  return {
    ok: true,
    data: {
      position: (result.data.position || sourceData.position).trim(),
      description: (result.data.description || sourceData.description || '').trim(),
      achievements: (result.data.achievements || sourceData.achievements || '').trim(),
    },
  };
}

