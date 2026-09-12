export interface SiteContentItem {
  id: string;
  key: string;
  value: string;
  type: string;
  label: string | null;
  grp: string | null;
}

export const DEFAULT_SITE_CONTENT: Array<{
  key: string;
  value: string;
  type: string;
  label: string;
  grp: string;
}> = [
  // Hero section
  { key: 'hero_greeting', value: "Hi, I'm", type: 'text', label: 'Hero Greeting', grp: 'hero' },
  { key: 'hero_cta_projects', value: 'View Projects', type: 'text', label: 'Projects Button Label', grp: 'hero' },
  { key: 'hero_cta_resume', value: 'Resume', type: 'text', label: 'Resume Button Label', grp: 'hero' },

  // About section
  { key: 'about_badge', value: 'About Me', type: 'text', label: 'About Badge Text', grp: 'about' },
  { key: 'about_heading', value: 'Building the web, one project at a time.', type: 'text', label: 'About Main Heading', grp: 'about' },
  { key: 'about_skills_badge', value: 'Core Technologies', type: 'text', label: 'Skills Section Badge', grp: 'about' },
  { key: 'about_top_stack_badge', value: 'Top Stack', type: 'text', label: 'Top Stack Badge', grp: 'about' },

  // Author Photo Gallery in About section
  { key: 'about_author_image_1', value: '', type: 'url', label: 'Author Portrait Photo (URL)', grp: 'about' },
  { key: 'about_author_image_2', value: '', type: 'url', label: 'Author Workspace / Desk Setup (URL)', grp: 'about' },
  { key: 'about_author_image_3', value: '', type: 'url', label: 'Author Coding / Tech Activity (URL)', grp: 'about' },
  { key: 'about_author_role', value: 'Full-Stack Software Engineer', type: 'text', label: 'Author Role Badge', grp: 'about' },
  { key: 'about_author_quote', value: 'Passionate about crafting scalable software architectures, elegant reactive UIs, and AI-driven developer tooling.', type: 'text', label: 'Author Quote / Philosophy', grp: 'about' },

  // Counter Statistics
  { key: 'stat_years_value', value: '5', type: 'number', label: 'Years of Experience (Number)', grp: 'stats' },
  { key: 'stat_years_label', value: 'Years Exp', type: 'text', label: 'Years Experience Label', grp: 'stats' },
  { key: 'stat_projects_value', value: '20', type: 'number', label: 'Completed Projects (Number)', grp: 'stats' },
  { key: 'stat_projects_label', value: 'Projects', type: 'text', label: 'Projects Label', grp: 'stats' },
  { key: 'stat_clients_value', value: '15', type: 'number', label: 'Satisfied Clients (Number)', grp: 'stats' },
  { key: 'stat_clients_label', value: 'Clients', type: 'text', label: 'Clients Label', grp: 'stats' },

  // BPSC section (Highlights)
  { key: 'bpsc_projects_badge', value: 'Portfolio Highlights', type: 'text', label: 'Projects Section Badge', grp: 'bpsc' },
  { key: 'bpsc_projects_title', value: 'Featured Projects', type: 'text', label: 'Projects Section Title', grp: 'bpsc' },
  { key: 'bpsc_blogs_badge', value: 'Articles & Thoughts', type: 'text', label: 'Blogs Section Badge', grp: 'bpsc' },
  { key: 'bpsc_blogs_title', value: 'Latest Publications', type: 'text', label: 'Blogs Section Title', grp: 'bpsc' },
  { key: 'bpsc_certs_badge', value: 'Credentials & Badges', type: 'text', label: 'Certs Section Badge', grp: 'bpsc' },
  { key: 'bpsc_certs_title', value: 'Verified Certifications', type: 'text', label: 'Certs Section Title', grp: 'bpsc' },
];

export const TRANSLATABLE_SITE_CONTENT_KEYS = [
  'hero_greeting',
  'hero_cta_projects',
  'hero_cta_resume',
  'about_badge',
  'about_heading',
  'about_skills_badge',
  'about_top_stack_badge',
  'about_author_role',
  'about_author_quote',
  'stat_years_label',
  'stat_projects_label',
  'stat_clients_label',
  'bpsc_projects_badge',
  'bpsc_projects_title',
  'bpsc_blogs_badge',
  'bpsc_blogs_title',
  'bpsc_certs_badge',
  'bpsc_certs_title',
] as const;

export const DEFAULT_VI_SITE_CONTENT: Record<string, string> = {
  hero_greeting: 'Xin chào, tôi là',
  hero_cta_projects: 'Khám phá dự án',
  hero_cta_resume: 'Hồ sơ cá nhân',
  about_badge: 'Về tôi',
  about_heading: 'Kiến tạo website, vững bước qua từng dự án.',
  about_skills_badge: 'Công nghệ cốt lõi',
  about_top_stack_badge: 'Công nghệ hàng đầu',
  about_author_role: 'Kỹ Sư Phần Mềm Full-Stack',
  about_author_quote: 'Đam mê kiến tạo kiến trúc phần mềm mở rộng, giao diện phản hồi mượt mà và công cụ phát triển tối ưu bằng AI.',
  stat_years_label: 'Năm kinh nghiệm',
  stat_projects_label: 'Dự án hoàn thành',
  stat_clients_label: 'Khách hàng',
  bpsc_projects_badge: 'Dự Án Nổi Bật',
  bpsc_projects_title: 'Dự Án Tiêu Biểu',
  bpsc_blogs_badge: 'Góc Nhìn & Chia Sẻ',
  bpsc_blogs_title: 'Bài Viết Mới Nhất',
  bpsc_certs_badge: 'Chứng Chỉ & Thành Tích',
  bpsc_certs_title: 'Chứng Chỉ Đã Xác Minh',
};

