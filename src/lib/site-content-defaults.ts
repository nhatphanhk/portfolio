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
