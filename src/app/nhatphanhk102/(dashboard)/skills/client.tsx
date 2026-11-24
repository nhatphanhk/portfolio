'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Layers, Plus, Pencil, Trash2, Search, Filter, Star } from 'lucide-react';
import { SkillDialog } from '@/components/admin/SkillDialog';
import { DeleteDialog } from '@/components/admin/DeleteDialog';
import { SkillStatusBadge } from '@/components/admin/skill/SkillStatusBadge';
import { AdminPageHeader, ADMIN_PAGE_CLASS } from '@/components/admin/AdminPageHeader';
import { PaginationControl } from '@/components/ui/PaginationControl';
import { deleteSkill } from '@/lib/actions/skill';
import {
  SKILL_CATEGORY_ADMIN_LABELS,
  SKILL_STATUS_ADMIN,
  SKILL_STATUS_VALUES,
  isLifeSkillCategory,
  type SkillCategoryValue,
  type SkillStatusValue,
} from '@/lib/skill-constants';

export type AdminSkillRow = {
  id: string;
  name: string;
  slug: string | null;
  summary: string | null;
  category: SkillCategoryValue;
  status: SkillStatusValue;
  startedAt: Date | null;
  achievedAt: Date | null;
  featured: boolean;
  iconUrl: string | null;
  order: number;
  _count: { capabilities: number; evidences: number; logs: number };
};

const ITEMS_PER_PAGE = 10;
const SELECT_WRAP =
  'flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border bg-card shadow-xs text-xs text-muted-foreground w-full sm:w-auto transition-colors';

/** yyyy-mm-dd for <input type="date">. */
export const toDateInput = (d: Date | string | null | undefined) => (d ? new Date(d).toISOString().slice(0, 10) : '');

export function AdminSkillsClient({ skills }: { skills: AdminSkillRow[] }) {
  const router = useRouter();
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<AdminSkillRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminSkillRow | null>(null);

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);

  const categories = useMemo(() => Array.from(new Set(skills.map(s => s.category))), [skills]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return skills.filter(skill => {
      if (categoryFilter === 'WORK' && isLifeSkillCategory(skill.category)) return false;
      if (categoryFilter === 'LIFE' && !isLifeSkillCategory(skill.category)) return false;
      if (!['ALL', 'WORK', 'LIFE'].includes(categoryFilter) && skill.category !== categoryFilter) return false;
      if (statusFilter !== 'ALL' && skill.status !== statusFilter) return false;
      if (q && !skill.name.toLowerCase().includes(q) && !(skill.summary ?? '').toLowerCase().includes(q)) return false;
      return true;
    });
  }, [skills, categoryFilter, statusFilter, search]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE) || 1;
  // Keep the page in range when rows are deleted or filters shrink the list
  useEffect(() => {
    setCurrentPage(p => Math.min(p, totalPages));
  }, [totalPages]);
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filtered.slice(start, start + ITEMS_PER_PAGE);
  }, [filtered, currentPage]);

  const learning = skills.filter(s => s.status === 'LEARNING').length;
  const noEvidence = skills.filter(s => s._count.evidences === 0).length;

  return (
    <main className={ADMIN_PAGE_CLASS}>
      <AdminPageHeader
        title="Kỹ năng"
        description={`${skills.length} kỹ năng · ${learning} đang học · ${noEvidence} chưa có bằng chứng`}
        actions={
          <button
            id="create-skill-btn"
            type="button"
            onClick={() => setCreateOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-foreground text-background rounded-lg text-sm font-medium hover:bg-foreground/90 transition-colors cursor-pointer"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Thêm kỹ năng
          </button>
        }
      />

      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            placeholder="Tìm theo tên hoặc tóm tắt…"
            aria-label="Tìm kỹ năng"
            value={search}
            onChange={e => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-border bg-card shadow-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-colors"
          />
        </div>

        <div className={SELECT_WRAP}>
          <Filter className="h-3.5 w-3.5" />
          <span className="font-medium">Nhóm:</span>
          <select
            value={categoryFilter}
            aria-label="Lọc theo nhóm"
            onChange={e => {
              setCategoryFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-transparent text-foreground outline-none font-medium cursor-pointer"
          >
            <option value="ALL">Tất cả nhóm</option>
            <option value="WORK">— Công việc</option>
            <option value="LIFE">— Ngoài công việc</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {SKILL_CATEGORY_ADMIN_LABELS[cat] ?? cat}
              </option>
            ))}
          </select>
        </div>

        <div className={SELECT_WRAP}>
          <span className="font-medium">Trạng thái:</span>
          <select
            value={statusFilter}
            aria-label="Lọc theo trạng thái"
            onChange={e => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-transparent text-foreground outline-none font-medium cursor-pointer"
          >
            <option value="ALL">Tất cả</option>
            {SKILL_STATUS_VALUES.map(s => (
              <option key={s} value={s}>{SKILL_STATUS_ADMIN[s].label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card shadow-xs overflow-hidden">
        {paginated.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground bg-card">
            <Layers className="h-10 w-10 mb-3 opacity-30" />
            <p className="font-medium text-foreground">Không có kỹ năng nào</p>
            <p className="text-xs text-muted-foreground mt-1">
              {search || categoryFilter !== 'ALL' || statusFilter !== 'ALL'
                ? 'Thử đổi từ khóa hoặc bộ lọc'
                : 'Nhấn "Thêm kỹ năng" để tạo kỹ năng đầu tiên'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/60 border-b border-border text-foreground/80 font-semibold text-xs uppercase tracking-wider">
                <tr>
                  <th className="text-left px-4 py-3.5 font-semibold">Tên</th>
                  <th className="text-left px-4 py-3.5 font-semibold hidden md:table-cell">Nhóm</th>
                  <th className="text-left px-4 py-3.5 font-semibold">Trạng thái</th>
                  <th className="text-left px-4 py-3.5 font-semibold hidden lg:table-cell">Năng lực · Bằng chứng · Nhật ký</th>
                  <th className="px-4 py-3.5 text-right font-semibold">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-card">
                {paginated.map(skill => (
                  <tr
                    key={skill.id}
                    onClick={() => router.push(`/nhatphanhk102/skills/${skill.id}`)}
                    className="hover:bg-primary/5 cursor-pointer transition-colors group"
                  >
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2.5 min-w-0">
                        {skill.iconUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={skill.iconUrl} alt="" className="h-5 w-5 object-contain shrink-0" />
                        ) : (
                          <div className="h-6 w-6 rounded bg-muted flex items-center justify-center shrink-0">
                            <Layers className="h-3.5 w-3.5 text-muted-foreground" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <Link
                            href={`/nhatphanhk102/skills/${skill.id}`}
                            onClick={e => e.stopPropagation()}
                            className="font-medium text-foreground group-hover:text-primary transition-colors inline-flex items-center gap-1"
                          >
                            {skill.name}
                            {skill.featured && <Star className="h-3 w-3 fill-amber-400 text-amber-400" aria-label="Nổi bật" />}
                          </Link>
                          {skill.summary && <p className="text-xs text-muted-foreground line-clamp-1">{skill.summary}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 hidden md:table-cell">
                      <span className="px-2 py-0.5 text-xs bg-muted/80 rounded-md font-medium text-muted-foreground border border-border/50 whitespace-nowrap">
                        {SKILL_CATEGORY_ADMIN_LABELS[skill.category] ?? skill.category}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <SkillStatusBadge status={skill.status} />
                    </td>
                    <td className="px-4 py-3.5 hidden lg:table-cell text-muted-foreground tabular-nums">
                      {skill._count.capabilities} · {' '}
                      <span className={skill._count.evidences === 0 ? 'text-amber-600 font-medium' : ''}>
                        {skill._count.evidences}
                      </span>{' '}
                      · {skill._count.logs}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center gap-1 justify-end">
                        <button
                          type="button"
                          aria-label={`Sửa ${skill.name}`}
                          onClick={e => {
                            e.stopPropagation();
                            setEditTarget(skill);
                          }}
                          className="p-1.5 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted cursor-pointer"
                        >
                          <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          aria-label={`Xóa ${skill.name}`}
                          onClick={e => {
                            e.stopPropagation();
                            setDeleteTarget(skill);
                          }}
                          className="p-1.5 text-muted-foreground hover:text-destructive transition-colors rounded-lg hover:bg-destructive/10 cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {filtered.length > 0 && (
          <div className="p-4 bg-card border-t border-border">
            <PaginationControl
              locale="vi"
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filtered.length}
              pageSize={ITEMS_PER_PAGE}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>

      <SkillDialog mode="create" open={createOpen} onOpenChange={setCreateOpen} />

      {editTarget && (
        <SkillDialog
          key={editTarget.id}
          mode="edit"
          open={!!editTarget}
          onOpenChange={open => !open && setEditTarget(null)}
          initialData={skillToForm(editTarget)}
        />
      )}

      {deleteTarget && (
        <DeleteDialog
          open={!!deleteTarget}
          onOpenChange={open => !open && setDeleteTarget(null)}
          title={`Xóa kỹ năng "${deleteTarget.name}"?`}
          description="Toàn bộ năng lực, bằng chứng và nhật ký học của kỹ năng này cũng sẽ bị xóa. Thao tác không thể hoàn tác."
          successMessage="Đã xóa kỹ năng."
          onConfirm={() => deleteSkill(deleteTarget.id) as Promise<{ ok: boolean; error?: string }>}
        />
      )}
    </main>
  );
}

export function skillToForm(s: Omit<AdminSkillRow, '_count'>) {
  return {
    id: s.id,
    name: s.name,
    category: s.category,
    summary: s.summary ?? '',
    status: s.status,
    startedAt: toDateInput(s.startedAt),
    achievedAt: toDateInput(s.achievedAt),
    featured: s.featured,
    iconUrl: s.iconUrl ?? '',
    order: s.order,
  };
}
