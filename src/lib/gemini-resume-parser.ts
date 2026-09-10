import { GoogleGenerativeAI } from '@google/generative-ai';
import { ParsedResumeData } from './pdf-resume-parser';

/**
 * Parses raw CV/Resume text using Google Gemini AI, structuring and refining
 * the content to match Harvard & Oxford University Career Services standards.
 */
export async function parseResumeWithGemini(
  rawText: string,
  customApiKey?: string
): Promise<ParsedResumeData> {
  const apiKey = customApiKey || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      'Chưa cấu hình GEMINI_API_KEY trong .env hoặc chưa cung cấp API Key để sử dụng AI.'
    );
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const candidateModels = [
    'gemini-3.6-flash',
    'gemini-3.7-flash',
    'gemini-flash-latest',
    'gemini-2.5-flash-lite',
    'gemini-2.5-flash',
  ];

  const prompt = `You are a Senior Career Services Advisor at Harvard University and Oxford University.
Analyze the following raw CV/Resume text. Extract all sections into a pristine, structured JSON matching the schema below.

Important Instructions:
1. Candidate Name: Extract exact full name (usually in the top 1-3 lines).
2. Professional Profile / Summary: Polish into a concise, high-impact 2-4 sentence executive summary.
3. Work Experience:
   - For each role, extract company name, position/title, start date (YYYY-MM), end date (YYYY-MM or omit if current), and isCurrent (true/false).
   - Transform or polish achievements/bullet points into Harvard action-oriented bullet statements (Action Verb + Task/Scope + Quantifiable Result).
   - Extract key technologies (comma-separated).
4. Education:
   - Extract institution, degree, field of study, start date (YYYY-MM), end date (YYYY-MM), GPA (if present), and any relevant honors/coursework.
5. Technical Skills:
   - Categorize each skill into one of the following exact categories: 'FRONTEND', 'BACKEND', 'DATABASE', 'DEVOPS', 'TOOLS', or 'OTHER'.
6. Spoken Languages:
   - Extract languages with proficiency level (e.g., Native, Fluent, Professional Working, Intermediate).
7. Social Links:
   - Detect platform (e.g., GITHUB, LINKEDIN, TWITTER, PORTFOLIO) and full URL.
8. Output Format:
   - STRICT JSON matching the following schema only (no markdown, no extra commentary):
{
  "profile": {
    "name": "string",
    "title": "string",
    "tagline": "string",
    "email": "string",
    "phone": "string",
    "location": "string",
    "bio": "string",
    "careerObjective": "string"
  },
  "experiences": [
    {
      "company": "string",
      "position": "string",
      "location": "string",
      "startDate": "YYYY-MM",
      "endDate": "YYYY-MM",
      "isCurrent": boolean,
      "description": "string (Harvard bullets joined with newlines)",
      "technologies": "string (comma-separated)"
    }
  ],
  "education": [
    {
      "institution": "string",
      "degree": "string",
      "fieldOfStudy": "string",
      "startDate": "YYYY-MM",
      "endDate": "YYYY-MM",
      "grade": "string",
      "description": "string"
    }
  ],
  "skills": [
    {
      "name": "string",
      "category": "FRONTEND" | "BACKEND" | "DATABASE" | "DEVOPS" | "TOOLS" | "OTHER",
      "level": number (1-5)
    }
  ],
  "spokenLanguages": [
    {
      "language": "string",
      "proficiency": "string"
    }
  ],
  "socialLinks": [
    {
      "platform": "string",
      "url": "string"
    }
  ]
}

Raw CV Text to analyze:
---
${rawText.slice(0, 30000)}
---`;

  let lastError: any = null;
  for (const modelName of candidateModels) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: {
          temperature: 0.2,
          responseMimeType: 'application/json',
        },
      });
      const response = await model.generateContent(prompt);
      const text = response.response.text();
      const cleaned = text.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
      const parsed = JSON.parse(cleaned);

      return {
        profile: parsed.profile || {},
        experiences: Array.isArray(parsed.experiences) ? parsed.experiences : [],
        education: Array.isArray(parsed.education) ? parsed.education : [],
        skills: Array.isArray(parsed.skills) ? parsed.skills : [],
        spokenLanguages: Array.isArray(parsed.spokenLanguages) ? parsed.spokenLanguages : [],
        socialLinks: Array.isArray(parsed.socialLinks) ? parsed.socialLinks : [],
        rawText,
      };
    } catch (err: any) {
      lastError = err;
      console.warn(`Resume parsing model ${modelName} failed, trying fallback...`, err.message);
    }
  }

  console.error('Gemini AI resume parsing failed across all candidate models:', lastError);
  throw new Error(`Gemini AI gặp lỗi khi phân tích CV: ${lastError?.message || 'Unknown error'}`);
}
