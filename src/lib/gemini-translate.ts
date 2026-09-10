import { GoogleGenerativeAI } from '@google/generative-ai';
import { prisma } from '@/lib/db';

export interface TranslatedBlogData {
  title: string;
  excerpt: string;
  content: string;
}

/**
 * Translates a blog post (title, excerpt, content) using Google Gemini AI
 * and saves the result to the database for instant future loading.
 */
export async function translateAndSaveBlogPost(
  blogId: string,
  sourceData: { title: string; excerpt?: string | null; content: string },
  targetLocale: 'vi' | 'en' = 'vi',
  customApiKey?: string
): Promise<TranslatedBlogData | null> {
  const apiKey = customApiKey || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('GEMINI_API_KEY is not configured; cannot translate.');
    return null;
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      generationConfig: {
        temperature: 0.2,
        responseMimeType: 'application/json',
      },
    });

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

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const parsed: TranslatedBlogData = JSON.parse(responseText);

    // Save/Upsert into PostgreSQL database
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
        title: parsed.title,
        excerpt: parsed.excerpt,
        content: parsed.content,
      },
      update: {
        title: parsed.title,
        excerpt: parsed.excerpt,
        content: parsed.content,
        updatedAt: new Date(),
      },
    });

    return parsed;
  } catch (err) {
    console.error('Gemini AI translation error:', err);
    return null;
  }
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
