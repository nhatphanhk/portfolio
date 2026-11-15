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
  { key: 'hero_badge', value: 'Available for new opportunities', type: 'text', label: 'Nhãn trạng thái (không bắt buộc)', grp: 'hero' },
  { key: 'hero_greeting', value: "Hi, I'm", type: 'text', label: 'Lời chào', grp: 'hero' },
  { key: 'hero_name_highlight', value: 'Phan', type: 'text', label: 'Tên / từ được làm nổi bật', grp: 'hero' },
  { key: 'hero_name_rest', value: 'Huu Nhat', type: 'text', label: 'Phần còn lại của tên', grp: 'hero' },
  { key: 'hero_title', value: 'Full-Stack Software Engineer', type: 'text', label: 'Chức danh', grp: 'hero' },
  { key: 'hero_tagline', value: 'Passionate about crafting scalable software architectures, elegant reactive UIs, and AI-driven developer tooling.', type: 'text', label: 'Câu giới thiệu ngắn', grp: 'hero' },
  { key: 'hero_cta_projects', value: 'View Projects', type: 'text', label: 'Nhãn nút Dự án', grp: 'hero' },
  { key: 'hero_cta_projects_url', value: '/project', type: 'url', label: 'Liên kết nút Dự án (URL)', grp: 'hero' },
  { key: 'hero_cta_resume', value: 'Resume', type: 'text', label: 'Nhãn nút CV', grp: 'hero' },
  { key: 'hero_cta_resume_url', value: '', type: 'url', label: 'Liên kết nút CV (URL)', grp: 'hero' },
  { key: 'hero_scroll_text', value: 'Scroll Down', type: 'text', label: 'Chữ gợi ý cuộn xuống', grp: 'hero' },

  // About section
  { key: 'about_badge', value: 'About Me', type: 'text', label: 'Nhãn phần Giới thiệu', grp: 'about' },
  { key: 'about_heading', value: 'Building the web, one project at a time.', type: 'text', label: 'Tiêu đề chính phần Giới thiệu', grp: 'about' },
  { key: 'about_skills_badge', value: 'Core Technologies', type: 'text', label: 'Nhãn phần Kỹ năng', grp: 'about' },
  { key: 'about_top_stack_badge', value: 'Top Stack', type: 'text', label: 'Nhãn công nghệ chính', grp: 'about' },

  // Author Photo Gallery in About section
  { key: 'about_author_image_1', value: '', type: 'url', label: 'Ảnh chân dung tác giả (URL)', grp: 'about' },
  { key: 'about_author_image_2', value: '', type: 'url', label: 'Ảnh góc làm việc (URL)', grp: 'about' },
  { key: 'about_author_image_3', value: '', type: 'url', label: 'Ảnh hoạt động lập trình (URL)', grp: 'about' },
  { key: 'about_author_role', value: 'Full-Stack Software Engineer', type: 'text', label: 'Nhãn vai trò tác giả', grp: 'about' },
  { key: 'about_author_quote', value: 'Passionate about crafting scalable software architectures, elegant reactive UIs, and AI-driven developer tooling.', type: 'text', label: 'Câu trích dẫn / triết lý', grp: 'about' },

  // Counter Statistics
  { key: 'stat_years_value', value: '5', type: 'number', label: 'Số năm kinh nghiệm (số)', grp: 'stats' },
  { key: 'stat_years_label', value: 'Years Exp', type: 'text', label: 'Nhãn số năm kinh nghiệm', grp: 'stats' },
  { key: 'stat_projects_value', value: '20', type: 'number', label: 'Số dự án hoàn thành (số)', grp: 'stats' },
  { key: 'stat_projects_label', value: 'Projects', type: 'text', label: 'Nhãn số dự án', grp: 'stats' },
  { key: 'stat_clients_value', value: '15', type: 'number', label: 'Số khách hàng hài lòng (số)', grp: 'stats' },
  { key: 'stat_clients_label', value: 'Clients', type: 'text', label: 'Nhãn số khách hàng', grp: 'stats' },

  // BPSC section (Highlights)
  { key: 'bpsc_projects_badge', value: 'Portfolio Highlights', type: 'text', label: 'Nhãn khối Dự án', grp: 'bpsc' },
  { key: 'bpsc_projects_title', value: 'Featured Projects', type: 'text', label: 'Tiêu đề khối Dự án', grp: 'bpsc' },
  { key: 'bpsc_blogs_badge', value: 'Articles & Thoughts', type: 'text', label: 'Nhãn khối Bài viết', grp: 'bpsc' },
  { key: 'bpsc_blogs_title', value: 'Latest Publications', type: 'text', label: 'Tiêu đề khối Bài viết', grp: 'bpsc' },
  { key: 'bpsc_certs_badge', value: 'Credentials & Badges', type: 'text', label: 'Nhãn khối Chứng chỉ', grp: 'bpsc' },
  { key: 'bpsc_certs_title', value: 'Verified Certifications', type: 'text', label: 'Tiêu đề khối Chứng chỉ', grp: 'bpsc' },
];

export const TRANSLATABLE_SITE_CONTENT_KEYS = [
  'hero_badge',
  'hero_greeting',
  'hero_name_highlight',
  'hero_name_rest',
  'hero_title',
  'hero_tagline',
  'hero_cta_projects',
  'hero_cta_resume',
  'hero_scroll_text',
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
  hero_badge: 'Sẵn sàng đón nhận cơ hội mới',
  hero_greeting: 'Xin chào, tôi là',
  hero_name_highlight: 'Phan',
  hero_name_rest: 'Hữu Nhật',
  hero_title: 'Kỹ Sư Phần Mềm Full-Stack',
  hero_tagline: 'Đam mê kiến tạo kiến trúc phần mềm mở rộng, giao diện người dùng mượt mà và công cụ phát triển tối ưu bằng AI.',
  hero_cta_projects: 'Khám phá dự án',
  hero_cta_resume: 'Hồ sơ cá nhân',
  hero_scroll_text: 'Cuộn xuống',
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

