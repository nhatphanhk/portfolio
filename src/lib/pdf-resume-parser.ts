export interface ParsedProfile {
  name?: string;
  title?: string;
  email?: string;
  phone?: string;
  location?: string;
  bio?: string;
  careerObjective?: string;
  softSkills?: string;
}

export interface ParsedExperience {
  company: string;
  position: string;
  startDate?: string;
  endDate?: string;
  isCurrent?: boolean;
  description?: string;
  achievements?: string;
  techStack?: string;
}

export interface ParsedEducation {
  institution: string;
  degree: string;
  fieldOfStudy?: string;
  startDate?: string;
  endDate?: string;
  isCurrent?: boolean;
  gpa?: string;
  description?: string;
}

export interface ParsedSkill {
  name: string;
  category: 'FRONTEND' | 'BACKEND' | 'DATABASE' | 'DEVOPS' | 'TOOLS' | 'OTHER';
  level?: number;
}

export interface ParsedLanguage {
  language: string;
  level?: string;
}

export interface ParsedSocialLink {
  platform: string;
  url: string;
}

export interface ParsedResumeData {
  profile: ParsedProfile;
  experiences: ParsedExperience[];
  education: ParsedEducation[];
  skills: ParsedSkill[];
  spokenLanguages: ParsedLanguage[];
  socialLinks: ParsedSocialLink[];
  rawText: string;
}

// ── Known Technology Database for Categorization ────────────────
const TECH_CATEGORIES: Record<ParsedSkill['category'], string[]> = {
  FRONTEND: [
    'React', 'Next.js', 'Vue.js', 'Vue', 'Angular', 'TypeScript', 'JavaScript', 'HTML5', 'HTML',
    'CSS3', 'CSS', 'Tailwind CSS', 'Tailwind', 'Sass', 'SCSS', 'Redux', 'Zustand', 'GraphQL',
    'Bootstrap', 'Material UI', 'MUI', 'Shadcn', 'Webpack', 'Vite', 'Three.js', 'Framer Motion'
  ],
  BACKEND: [
    'Node.js', 'Express', 'Express.js', 'NestJS', 'Nest.js', 'Python', 'Django', 'FastAPI', 'Flask',
    'Java', 'Spring Boot', 'Spring', 'Go', 'Golang', 'C#', '.NET', 'ASP.NET', 'PHP', 'Laravel',
    'Ruby', 'Ruby on Rails', 'Rust', 'C++', 'gRPC', 'REST API', 'GraphQL API', 'Microservices'
  ],
  DATABASE: [
    'PostgreSQL', 'Postgres', 'MySQL', 'MongoDB', 'Redis', 'Prisma', 'TypeORM', 'Mongoose',
    'SQLite', 'Supabase', 'Firebase', 'DynamoDB', 'Cassandra', 'Elasticsearch', 'MSSQL', 'SQL Server'
  ],
  DEVOPS: [
    'Docker', 'Kubernetes', 'K8s', 'AWS', 'Amazon Web Services', 'GCP', 'Google Cloud', 'Azure',
    'CI/CD', 'GitHub Actions', 'GitLab CI', 'Linux', 'Nginx', 'Terraform', 'Vercel', 'Cloudflare'
  ],
  TOOLS: [
    'Git', 'GitHub', 'GitLab', 'Bitbucket', 'Postman', 'Figma', 'Jira', 'Trello', 'Confluence',
    'VS Code', 'Swagger', 'Jest', 'Cypress', 'Playwright', 'Vitest'
  ],
  OTHER: []
};

// ── Language Map ────────────────────────────────────────────────
const COMMON_LANGUAGES = [
  { match: /english|tiếng anh/i, name: 'English' },
  { match: /vietnamese|tiếng việt/i, name: 'Vietnamese' },
  { match: /japanese|tiếng nhật/i, name: 'Japanese' },
  { match: /chinese|tiếng trung/i, name: 'Chinese' },
  { match: /french|tiếng pháp/i, name: 'French' },
  { match: /german|tiếng đức/i, name: 'German' },
  { match: /korean|tiếng hàn/i, name: 'Korean' },
];

/**
 * Main parser function to convert raw PDF text to structured CV data
 */
export function parseResumePdfText(rawText: string): ParsedResumeData {
  const normalized = rawText.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const lines = normalized.split('\n').map(l => l.trim()).filter(Boolean);

  const profile: ParsedProfile = {};
  const socialLinks: ParsedSocialLink[] = [];

  // 1. Extract Email
  const emailMatch = normalized.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
  if (emailMatch) {
    profile.email = emailMatch[1].toLowerCase();
  }

  // 2. Extract Phone Number (Vietnam & International formats)
  const phoneMatch = normalized.match(/(?:(?:\+|00)?84|0)(?:\s*\d{2,3}[\s.-]?\d{3}[\s.-]?\d{3,4}|\d{9,10})/);
  if (phoneMatch) {
    profile.phone = phoneMatch[0].replace(/[\s.-]/g, '');
  }

  // 3. Extract Links
  const githubMatch = normalized.match(/(?:https?:\/\/)?(?:www\.)?github\.com\/([a-zA-Z0-9_-]+)/i);
  if (githubMatch) {
    socialLinks.push({
      platform: 'GitHub',
      url: githubMatch[0].startsWith('http') ? githubMatch[0] : `https://${githubMatch[0]}`,
    });
  }

  const linkedinMatch = normalized.match(/(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/([a-zA-Z0-9_-]+)/i);
  if (linkedinMatch) {
    socialLinks.push({
      platform: 'LinkedIn',
      url: linkedinMatch[0].startsWith('http') ? linkedinMatch[0] : `https://${linkedinMatch[0]}`,
    });
  }

  const websiteMatch = normalized.match(/(?:https?:\/\/)(?:[a-zA-Z0-9_-]+\.)+[a-zA-Z]{2,}(?:\/[^\s]*)?/i);
  if (websiteMatch && !websiteMatch[0].includes('github.com') && !websiteMatch[0].includes('linkedin.com')) {
    socialLinks.push({
      platform: 'Portfolio',
      url: websiteMatch[0],
    });
  }

  // 4. Extract Location
  const locationMatch = normalized.match(/(?:location|address|địa chỉ|nơi ở)[:\s]+([^\n,]+(?:,\s*[^\n,]+)*)/i)
    || normalized.match(/(Hà Nội|Hồ Chí Minh|Ho Chi Minh|Da Nang|Đà Nẵng|Vietnam|Việt Nam)/i);
  if (locationMatch) {
    profile.location = locationMatch[1].trim();
  }

  // 5. Extract Candidate Name & Title from top lines
  // Usually name is within the first 1-3 lines
  for (let i = 0; i < Math.min(5, lines.length); i++) {
    const line = lines[i];
    if (
      !profile.name &&
      line.length >= 3 &&
      line.length <= 40 &&
      !line.includes('@') &&
      !line.match(/^https?:/i) &&
      !line.match(/curriculum vitae|resume|cv/i) &&
      !line.match(/phone|email|address|contact/i)
    ) {
      profile.name = line;
      continue;
    }

    // Title often follows the name
    if (
      profile.name &&
      !profile.title &&
      line.length >= 3 &&
      line.length <= 50 &&
      !line.includes('@') &&
      !line.match(/^https?:/i) &&
      (line.match(/developer|engineer|designer|manager|specialist|architect|lập trình viên|kỹ sư|intern/i) || i <= 3)
    ) {
      profile.title = line;
    }
  }

  // 6. Section Partitioning
  const sections = splitIntoSections(normalized);

  // 7. Parse Bio / Summary
  const summaryText = sections['summary'] || sections['about'] || sections['profile'] || sections['objective'] || '';
  if (summaryText) {
    const cleanBio = summaryText.split('\n').map(l => l.trim()).filter(Boolean).join(' ');
    profile.bio = cleanBio.slice(0, 1500);
    if (sections['objective']) {
      profile.careerObjective = sections['objective'].split('\n').map(l => l.trim()).filter(Boolean).join(' ').slice(0, 1000);
    }
  }

  // 8. Parse Experiences
  const experiences = parseExperiences(sections['experience'] || '');

  // 9. Parse Education
  const education = parseEducation(sections['education'] || '');

  // 10. Parse Skills
  const skills = parseSkills(sections['skills'] || '', normalized);

  // 11. Parse Soft Skills
  const softSkillsMatch = sections['softSkills'] || normalized.match(/(?:soft skills|kỹ năng mềm)[:\s]+([^\n]+)/i);
  if (softSkillsMatch) {
    const softText = typeof softSkillsMatch === 'string' ? softSkillsMatch : softSkillsMatch[1];
    profile.softSkills = softText.replace(/\n/g, ', ').replace(/\s+/g, ' ').slice(0, 500);
  }

  // 12. Parse Spoken Languages
  const spokenLanguages = parseLanguages(sections['languages'] || '');

  return {
    profile,
    experiences,
    education,
    skills,
    spokenLanguages,
    socialLinks,
    rawText: normalized,
  };
}

// ── Section Splitting Helper ────────────────────────────────────
function splitIntoSections(text: string): Record<string, string> {
  const result: Record<string, string> = {};

  const sectionPatterns: Array<{ key: string; regex: RegExp }> = [
    {
      key: 'summary',
      regex: /^(?:professional\s+summary|summary|profile|about\s+me|giới\s+thiệu|tóm\s+tắt)/im,
    },
    {
      key: 'objective',
      regex: /^(?:career\s+objective|objective|mục\s+tiêu\s+nghề\s+nghiệp|mục\s+tiêu)/im,
    },
    {
      key: 'experience',
      regex: /^(?:work\s+experience|professional\s+experience|employment\s+history|experience|kinh\s+nghiệm(?:\s+làm\s+việc)?|quá\s+trình\s+công\s+tác)/im,
    },
    {
      key: 'education',
      regex: /^(?:education|academic\s+background|học\s+vấn|trình\s+độ\s+học\s+vấn|bằng\s+cấp)/im,
    },
    {
      key: 'skills',
      regex: /^(?:technical\s+skills|skills|core\s+competencies|kỹ\s+năng(?:\s+chuyên\s+môn)?|technologies)/im,
    },
    {
      key: 'softSkills',
      regex: /^(?:soft\s+skills|kỹ\s+năng\s+mềm|kỹ\s+năng\s+bổ\s+trợ)/im,
    },
    {
      key: 'languages',
      regex: /^(?:languages|spoken\s+languages|ngoại\s+ngữ|ngôn\s+ngữ)/im,
    },
    {
      key: 'projects',
      regex: /^(?:projects|personal\s+projects|dự\s+án|dự\s+án\s+tiêu\s+biểu)/im,
    },
    {
      key: 'certifications',
      regex: /^(?:certifications|certificates|chứng\s+chỉ|bằng\s+khen)/im,
    },
  ];

  const lines = text.split('\n');
  let currentKey: string | null = null;
  let currentContent: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Check if line is a section header (usually short, <= 40 chars)
    let foundKey: string | null = null;
    if (trimmed.length <= 40) {
      for (const p of sectionPatterns) {
        if (p.regex.test(trimmed)) {
          foundKey = p.key;
          break;
        }
      }
    }

    if (foundKey) {
      if (currentKey && currentContent.length > 0) {
        result[currentKey] = currentContent.join('\n');
      }
      currentKey = foundKey;
      currentContent = [];
    } else {
      if (currentKey) {
        currentContent.push(trimmed);
      }
    }
  }

  if (currentKey && currentContent.length > 0) {
    result[currentKey] = currentContent.join('\n');
  }

  return result;
}

// ── Experience Parsing Helper ───────────────────────────────────
function parseExperiences(text: string): ParsedExperience[] {
  if (!text) return [];

  const items: ParsedExperience[] = [];
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

  // Date pattern: "2020 - 2022", "Jan 2021 - Present", "01/2022 - Nay", "2023 - Current"
  const dateRegex = /((?:(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*|\d{1,2}\/)?\s*\d{4})\s*[-–—to\s]+\s*(\d{4}|present|current|nay|hiện\s*tại|(?:(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*|\d{1,2}\/)?\s*\d{4})/i;

  let currentExp: Partial<ParsedExperience> | null = null;
  let bulletPoints: string[] = [];

  const finalizeCurrent = () => {
    if (currentExp && (currentExp.company || currentExp.position)) {
      items.push({
        company: currentExp.company || 'Công ty',
        position: currentExp.position || 'Nhân viên',
        startDate: currentExp.startDate,
        endDate: currentExp.endDate,
        isCurrent: currentExp.isCurrent ?? false,
        description: currentExp.description,
        achievements: bulletPoints.length > 0 ? bulletPoints.join('\n') : undefined,
        techStack: currentExp.techStack,
      });
    }
    currentExp = null;
    bulletPoints = [];
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const dateMatch = line.match(dateRegex);

    if (dateMatch) {
      // New experience entry encountered
      finalizeCurrent();

      const startRaw = dateMatch[1].trim();
      const endRaw = dateMatch[2].trim();
      const isCurrent = /present|current|nay|hiện/i.test(endRaw);

      // Clean the line by removing the date string
      const remainingLine = line.replace(dateMatch[0], '').replace(/[|•–—()]/g, ' ').trim();

      currentExp = {
        startDate: formatMonthYear(startRaw),
        endDate: isCurrent ? undefined : formatMonthYear(endRaw),
        isCurrent,
      };

      if (remainingLine) {
        // Can be "Company - Position" or just "Position"
        const parts = remainingLine.split(/[-–—|]/).map(p => p.trim()).filter(Boolean);
        if (parts.length >= 2) {
          currentExp.position = parts[0];
          currentExp.company = parts[1];
        } else {
          currentExp.position = parts[0];
        }
      } else {
        // Look at previous or next line for position/company
        if (i + 1 < lines.length && !lines[i + 1].match(dateRegex)) {
          const nextLine = lines[i + 1];
          const parts = nextLine.split(/[-–—|]/).map(p => p.trim()).filter(Boolean);
          if (parts.length >= 2) {
            currentExp.position = parts[0];
            currentExp.company = parts[1];
          } else {
            currentExp.company = nextLine;
          }
          i++;
        }
      }
    } else if (currentExp) {
      // Collect bullet points or descriptions
      if (/^[•\-*+]\s*/.test(line)) {
        bulletPoints.push(line.replace(/^[•\-*+]\s*/, ''));
      } else if (/^(?:technologies|tech\s*stack|công\s*nghệ)[:\s]+/i.test(line)) {
        currentExp.techStack = line.replace(/^(?:technologies|tech\s*stack|công\s*nghệ)[:\s]+/i, '').trim();
      } else if (!currentExp.company && line.length < 50) {
        currentExp.company = line;
      } else if (!currentExp.position && line.length < 50) {
        currentExp.position = line;
      } else {
        if (!currentExp.description) {
          currentExp.description = line;
        } else {
          bulletPoints.push(line);
        }
      }
    }
  }

  finalizeCurrent();
  return items;
}

// ── Education Parsing Helper ────────────────────────────────────
function parseEducation(text: string): ParsedEducation[] {
  if (!text) return [];

  const items: ParsedEducation[] = [];
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const dateRegex = /((?:(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*|\d{1,2}\/)?\s*\d{4})\s*[-–—to\s]+\s*(\d{4}|present|current|nay|hiện\s*tại|(?:(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*|\d{1,2}\/)?\s*\d{4})/i;

  let currentEdu: Partial<ParsedEducation> | null = null;

  const finalize = () => {
    if (currentEdu && currentEdu.institution) {
      items.push({
        institution: currentEdu.institution,
        degree: currentEdu.degree || 'Cử nhân / Kỹ sư',
        fieldOfStudy: currentEdu.fieldOfStudy,
        startDate: currentEdu.startDate,
        endDate: currentEdu.endDate,
        isCurrent: currentEdu.isCurrent ?? false,
        gpa: currentEdu.gpa,
      });
    }
    currentEdu = null;
  };

  for (const line of lines) {
    const isInstitution = /(?:đại\s*học|học\s*viện|university|college|institute|trường)/i.test(line);
    const dateMatch = line.match(dateRegex);

    if (isInstitution) {
      finalize();
      currentEdu = {
        institution: line.replace(dateRegex, '').replace(/[-–—|()]/g, ' ').trim(),
      };
      if (dateMatch) {
        currentEdu.startDate = formatMonthYear(dateMatch[1]);
        currentEdu.endDate = formatMonthYear(dateMatch[2]);
      }
    } else if (currentEdu) {
      if (dateMatch && !currentEdu.startDate) {
        currentEdu.startDate = formatMonthYear(dateMatch[1]);
        currentEdu.endDate = formatMonthYear(dateMatch[2]);
      } else if (/(?:gpa|điểm|grade)[:\s]*([\d.]+(?:\s*\/\s*[\d.]+)?)/i.test(line)) {
        const gpaMatch = line.match(/(?:gpa|điểm|grade)[:\s]*([\d.]+(?:\s*\/\s*[\d.]+)?)/i);
        if (gpaMatch) currentEdu.gpa = gpaMatch[1];
      } else if (/(?:major|chuyên\s*ngành|ngành)[:\s]*([^\n]+)/i.test(line)) {
        const majorMatch = line.match(/(?:major|chuyên\s*ngành|ngành)[:\s]*([^\n]+)/i);
        if (majorMatch) currentEdu.fieldOfStudy = majorMatch[1].trim();
      } else if (!currentEdu.degree && line.length < 60) {
        currentEdu.degree = line;
      }
    }
  }

  finalize();
  return items;
}

// ── Skills Parsing Helper ───────────────────────────────────────
function parseSkills(skillsSectionText: string, fullText: string): ParsedSkill[] {
  const foundSkills = new Map<string, ParsedSkill>();
  const searchCorpus = `${skillsSectionText} \n ${fullText}`.toLowerCase();

  for (const [category, keywords] of Object.entries(TECH_CATEGORIES) as [ParsedSkill['category'], string[]][]) {
    for (const kw of keywords) {
      // Word boundary regex check
      const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const reg = new RegExp(`(?:^|[^a-zA-Z0-9_#+])${escaped}(?:$|[^a-zA-Z0-9_#+])`, 'i');
      if (reg.test(searchCorpus)) {
        foundSkills.set(kw.toLowerCase(), {
          name: kw,
          category,
          level: 80,
        });
      }
    }
  }

  // Also parse comma-separated custom skills in the skills section
  if (skillsSectionText) {
    const rawTokens = skillsSectionText
      .split(/[,•|;\n]/)
      .map(s => s.trim().replace(/^[-*+]\s*/, ''))
      .filter(s => s.length >= 2 && s.length <= 30);

    for (const token of rawTokens) {
      if (!token.includes(':') && !foundSkills.has(token.toLowerCase())) {
        foundSkills.set(token.toLowerCase(), {
          name: token,
          category: 'OTHER',
          level: 75,
        });
      }
    }
  }

  return Array.from(foundSkills.values());
}

// ── Languages Parsing Helper ────────────────────────────────────
function parseLanguages(text: string): ParsedLanguage[] {
  if (!text) return [];

  const list: ParsedLanguage[] = [];
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

  for (const line of lines) {
    for (const item of COMMON_LANGUAGES) {
      if (item.match.test(line)) {
        // Look for level (e.g., Native, Fluent, B2, IELTS 7.5, etc.)
        const levelMatch = line.match(/(native|bản ngữ|fluent|thành thạo|professional|chuyên nghiệp|intermediate|trung cấp|basic|cơ bản|ielts\s*[\d.]+|toeic\s*\d+|jlpt\s*n\d)/i);
        list.push({
          language: item.name,
          level: levelMatch ? levelMatch[0].trim() : 'Professional Working',
        });
        break;
      }
    }
  }

  return list;
}

// ── Date Formatter Helper ───────────────────────────────────────
function formatMonthYear(raw: string): string {
  if (!raw) return '';
  const clean = raw.trim();
  const yearMatch = clean.match(/\d{4}/);
  if (!yearMatch) return clean;

  const year = yearMatch[0];
  const monthMatch = clean.match(/^(?:0?([1-9]|1[0-2])\/|(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec))/i);
  if (monthMatch) {
    let monthNum = '01';
    if (monthMatch[1]) {
      monthNum = monthMatch[1].padStart(2, '0');
    } else if (monthMatch[2]) {
      const monthNames = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
      const idx = monthNames.indexOf(monthMatch[2].toLowerCase());
      if (idx >= 0) monthNum = String(idx + 1).padStart(2, '0');
    }
    return `${year}-${monthNum}`;
  }

  return `${year}-01`;
}
