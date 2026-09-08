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
  // Default to gemini-2.0-flash with fallback to gemini-1.5-flash
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
    generationConfig: {
      temperature: 0.2,
      responseMimeType: 'application/json',
    },
  });

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
   - Extract GitHub, LinkedIn, Personal Website/Portfolio URLs.

Output must be ONLY a valid JSON object matching this schema:
{
  "profile": {
    "name": "Full Name",
    "title": "Professional Title / Headline",
    "bio": "Refined executive summary",
    "careerObjective": "Career objective (optional)",
    "email": "email@example.com",
    "phone": "+84 987654321",
    "location": "City, Country",
    "softSkills": "Leadership, Problem Solving, Agile, etc."
  },
  "experiences": [
    {
      "company": "Company Name",
      "position": "Job Title",
      "startDate": "YYYY-MM",
      "endDate": "YYYY-MM",
      "isCurrent": false,
      "description": "Short summary of role",
      "achievements": "Bullet point 1 with quantifiable impact\\nBullet point 2\\nBullet point 3",
      "techStack": "React, TypeScript, Go, PostgreSQL"
    }
  ],
  "education": [
    {
      "institution": "University / College Name",
      "degree": "Degree (e.g. Bachelor of Science)",
      "fieldOfStudy": "Computer Science / Software Engineering",
      "startDate": "YYYY-MM",
      "endDate": "YYYY-MM",
      "isCurrent": false,
      "gpa": "3.8/4.0",
      "description": "Relevant honors or coursework"
    }
  ],
  "skills": [
    {
      "name": "Skill / Technology Name",
      "category": "FRONTEND" | "BACKEND" | "DATABASE" | "DEVOPS" | "TOOLS" | "OTHER",
      "level": 80
    }
  ],
  "spokenLanguages": [
    {
      "language": "English",
      "level": "Fluent / Professional Working"
    }
  ],
  "socialLinks": [
    {
      "platform": "GitHub" | "LinkedIn" | "Portfolio",
      "url": "https://..."
    }
  ]
}

Raw CV Text to analyze:
---
${rawText.slice(0, 30000)}
---`;

  try {
    const response = await model.generateContent(prompt);
    const text = response.response.text();
    const parsed = JSON.parse(text);

    return {
      profile: parsed.profile || {},
      experiences: Array.isArray(parsed.experiences) ? parsed.experiences : [],
      education: Array.isArray(parsed.education) ? parsed.education : [],
      skills: Array.isArray(parsed.skills) ? parsed.skills : [],
      spokenLanguages: Array.isArray(parsed.spokenLanguages) ? parsed.spokenLanguages : [],
      socialLinks: Array.isArray(parsed.socialLinks) ? parsed.socialLinks : [],
      rawText,
    };
  } catch (primaryError: any) {
    // Attempt fallback to gemini-1.5-flash if 2.0-flash is unavailable
    console.warn('Gemini 2.0 Flash failed, falling back to Gemini 1.5 Flash:', primaryError);
    try {
      const fallbackModel = genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
        generationConfig: {
          temperature: 0.2,
          responseMimeType: 'application/json',
        },
      });
      const fallbackResponse = await fallbackModel.generateContent(prompt);
      const fallbackText = fallbackResponse.response.text();
      const parsed = JSON.parse(fallbackText);

      return {
        profile: parsed.profile || {},
        experiences: Array.isArray(parsed.experiences) ? parsed.experiences : [],
        education: Array.isArray(parsed.education) ? parsed.education : [],
        skills: Array.isArray(parsed.skills) ? parsed.skills : [],
        spokenLanguages: Array.isArray(parsed.spokenLanguages) ? parsed.spokenLanguages : [],
        socialLinks: Array.isArray(parsed.socialLinks) ? parsed.socialLinks : [],
        rawText,
      };
    } catch (fallbackError: any) {
      console.error('Gemini AI parsing failed:', fallbackError);
      throw new Error(
        `Gemini AI gặp lỗi khi phân tích CV: ${fallbackError.message || primaryError.message}`
      );
    }
  }
}
