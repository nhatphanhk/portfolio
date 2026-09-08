export type SectionId =
  | 'bio'
  | 'experience'
  | 'education'
  | 'skills'
  | 'softSkills'
  | 'languages'
  | 'achievements'
  | 'activities';

export interface ResumeSectionLayout {
  left: SectionId[];
  right: SectionId[];
  hidden: SectionId[];
}

export const DEFAULT_SECTION_LAYOUT: ResumeSectionLayout = {
  left: ['bio', 'experience', 'education'],
  right: ['skills', 'softSkills', 'languages', 'achievements', 'activities'],
  hidden: [],
};

export const SECTION_META: Record<
  SectionId,
  { label: string; defaultColumn: 'left' | 'right' }
> = {
  bio: { label: 'Giới thiệu & Mục tiêu', defaultColumn: 'left' },
  experience: { label: 'Kinh nghiệm làm việc', defaultColumn: 'left' },
  education: { label: 'Học vấn & Bằng cấp', defaultColumn: 'left' },
  skills: { label: 'Kỹ năng chuyên môn', defaultColumn: 'right' },
  softSkills: { label: 'Kỹ năng mềm', defaultColumn: 'right' },
  languages: { label: 'Ngoại ngữ', defaultColumn: 'right' },
  achievements: { label: 'Giải thưởng & Thành tích', defaultColumn: 'right' },
  activities: { label: 'Hoạt động & Dự án', defaultColumn: 'right' },
};

export function parseSectionLayout(raw: string | null | undefined): ResumeSectionLayout {
  if (!raw) return DEFAULT_SECTION_LAYOUT;
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed.left) && Array.isArray(parsed.right)) {
      // Ensure all valid section IDs are accounted for
      const knownIds = new Set<SectionId>([
        'bio',
        'experience',
        'education',
        'skills',
        'softSkills',
        'languages',
        'achievements',
        'activities',
      ]);
      const left = parsed.left.filter((id: any): id is SectionId => knownIds.has(id));
      const right = parsed.right.filter((id: any): id is SectionId => knownIds.has(id));
      const hidden = Array.isArray(parsed.hidden)
        ? parsed.hidden.filter((id: any): id is SectionId => knownIds.has(id))
        : [];

      // If any sections are missing, append them to their default column
      const assigned = new Set<SectionId>([...left, ...right, ...hidden]);
      for (const id of knownIds) {
        if (!assigned.has(id)) {
          if (SECTION_META[id].defaultColumn === 'left') {
            left.push(id);
          } else {
            right.push(id);
          }
        }
      }

      return { left, right, hidden };
    }
  } catch {
    // fallback
  }
  return DEFAULT_SECTION_LAYOUT;
}
