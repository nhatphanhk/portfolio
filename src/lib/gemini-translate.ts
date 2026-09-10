import { GoogleGenerativeAI } from '@google/generative-ai';
import { prisma } from '@/lib/db';

export interface TranslatedBlogData {
  title: string;
  excerpt: string;
  content: string;
}

const CANDIDATE_MODELS = [
  'gemini-3.6-flash',
  'gemini-3.7-flash',
  'gemini-flash-latest',
  'gemini-2.5-flash-lite',
  'gemini-2.5-flash',
];

/**
 * Generates translated blog content using Google Gemini AI without saving to DB yet.
 * Returns the translated { title, excerpt, content } for preview and editing.
 */
export async function generateBlogTranslation(
  sourceData: { title: string; excerpt?: string | null; content: string },
  targetLocale: 'vi' | 'en' = 'vi',
  customApiKey?: string
): Promise<TranslatedBlogData | null> {
  const apiKey = customApiKey || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('GEMINI_API_KEY is not configured; cannot translate.');
    return null;
  }

  const targetLangName = targetLocale === 'vi' ? 'Vietnamese (Tiếng Việt)' : 'English';
  const prompt = `You are a professional software engineering translator and technical writer.
Translate the following blog post into natural, idiomatic, high-quality ${targetLangName}.

CRITICAL REQUIREMENTS:
1. Preserve technical terminology naturally (e.g., React, TypeScript, Docker, API, Backend, Frontend, Next.js, etc.).
2. For HTML content: PRESERVE ALL HTML tags, attributes, class names, and code syntax intact. ONLY translate the readable text content between the tags.
3. Keep code blocks and inline code (<pre>, <code>) completely untranslated, keeping the original code intact.
4. Return ONLY a valid JSON object matching this schema:
{
  "title": "Translated title",
  "excerpt": "Translated excerpt / summary",
  "content": "Translated HTML content"
}

ORIGINAL BLOG DATA:
Title: ${sourceData.title}
Excerpt: ${sourceData.excerpt || ''}
Content (HTML):
${sourceData.content}
`;

  const genAI = new GoogleGenerativeAI(apiKey);
  let lastError: any = null;

  for (const modelName of CANDIDATE_MODELS) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: {
          temperature: 0.2,
          responseMimeType: 'application/json',
        },
      });

      const result = await model.generateContent(prompt);
      const text = result.response.text();
      if (!text) continue;

      // Strip potential markdown fences if present
      const cleaned = text.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
      const parsed: TranslatedBlogData = JSON.parse(cleaned);

      if (parsed.title && parsed.content) {
        return {
          title: parsed.title,
          excerpt: parsed.excerpt || '',
          content: parsed.content,
        };
      }
    } catch (err: any) {
      lastError = err;
      console.warn(`Gemini model ${modelName} failed (${err.message}), trying fallback...`);
    }
  }

  console.error('All Gemini candidate models failed for translation:', lastError);
  return null;
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
