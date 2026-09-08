export type SectionId =
  | 'bio'
  | 'experience'
  | 'education'
  | 'skills'
  | 'softSkills'
  | 'languages'
  | 'achievements'
  | 'activities';

export type ResumeTemplateStyle = 'harvard' | 'modern';

export interface ResumeSectionLayout {
  templateStyle?: ResumeTemplateStyle;
  order?: SectionId[]; // Ordered list of sections for Harvard single-column layout
  left: SectionId[];
  right: SectionId[];
  hidden: SectionId[];
}

export const DEFAULT_HARVARD_ORDER: SectionId[] = [
  'bio',
  'education',
  'experience',
  'skills',
  'softSkills',
  'achievements',
  'activities',
  'languages',
];

export const DEFAULT_SECTION_LAYOUT: ResumeSectionLayout = {
  templateStyle: 'harvard',
  order: DEFAULT_HARVARD_ORDER,
  left: ['bio', 'education', 'experience'],
  right: ['skills', 'softSkills', 'achievements', 'activities', 'languages'],
  hidden: [],
};

export const SECTION_META: Record<
  SectionId,
  { label: string; defaultColumn: 'left' | 'right' }
> = {
  bio: { label: 'Giới thiệu & Mục tiêu', defaultColumn: 'left' },
  education: { label: 'Học vấn & Bằng cấp', defaultColumn: 'left' },
  experience: { label: 'Kinh nghiệm làm việc', defaultColumn: 'left' },
  skills: { label: 'Kỹ năng chuyên môn', defaultColumn: 'right' },
  softSkills: { label: 'Kỹ năng mềm', defaultColumn: 'right' },
  achievements: { label: 'Giải thưởng & Thành tích', defaultColumn: 'right' },
  activities: { label: 'Hoạt động & Dự án', defaultColumn: 'right' },
  languages: { label: 'Ngoại ngữ', defaultColumn: 'right' },
};

export function parseSectionLayout(raw: string | null | undefined): ResumeSectionLayout {
  if (!raw) return DEFAULT_SECTION_LAYOUT;
  try {
    const parsed = JSON.parse(raw);
    const knownIds = new Set<SectionId>([
      'bio',
      'education',
      'experience',
      'skills',
      'softSkills',
      'languages',
      'achievements',
      'activities',
    ]);

    const templateStyle: ResumeTemplateStyle =
      parsed.templateStyle === 'modern' ? 'modern' : 'harvard';

    const left = Array.isArray(parsed.left)
      ? parsed.left.filter((id: any): id is SectionId => knownIds.has(id))
      : ['bio', 'education', 'experience'];

    const right = Array.isArray(parsed.right)
      ? parsed.right.filter((id: any): id is SectionId => knownIds.has(id))
      : ['skills', 'softSkills', 'achievements', 'activities', 'languages'];

    const hidden = Array.isArray(parsed.hidden)
      ? parsed.hidden.filter((id: any): id is SectionId => knownIds.has(id))
      : [];

    let order: SectionId[] = [];
    if (Array.isArray(parsed.order) && parsed.order.length > 0) {
      order = parsed.order.filter((id: any): id is SectionId => knownIds.has(id));
    } else {
      // Build order from left then right
      order = [...left, ...right];
    }

    // Ensure all known IDs are present in order
    for (const id of knownIds) {
      if (!order.includes(id) && !hidden.includes(id)) {
        order.push(id);
      }
    }

    return { templateStyle, order, left, right, hidden };
  } catch {
    // fallback
  }
  return DEFAULT_SECTION_LAYOUT;
}
