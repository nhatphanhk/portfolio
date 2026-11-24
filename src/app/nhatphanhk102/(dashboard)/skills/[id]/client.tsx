'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  BookOpen,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileText,
  Image as ImageIcon,
  Link2,
  Award,
  GraduationCap,
  Pencil,
  Plus,
  Rocket,
  Trash2,
  Paperclip,
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AdminPageHeader, ADMIN_PAGE_CLASS } from '@/components/admin/AdminPageHeader';
import { SkillDialog } from '@/components/admin/SkillDialog';
import { useConfirmDialog } from '@/components/admin/DeleteDialog';
import { SkillStatusBadge } from '@/components/admin/skill/SkillStatusBadge';
import { CapabilityDialog, type CapabilityDialogData } from '@/components/admin/skill/CapabilityDialog';
import { EvidenceDialog, type EvidenceDialogData, type CertificationOption } from '@/components/admin/skill/EvidenceDialog';
import { SkillLogDialog, type SkillLogDialogData } from '@/components/admin/skill/SkillLogDialog';
import { skillToForm, toDateInput } from '../client';
import {
  deleteCapability,
  deleteEvidence,
  deleteSkill,
  deleteSkillLog,
  reorderCapabilities,
} from '@/lib/actions/skill';
import {
  EVIDENCE_TYPE_ADMIN_LABELS,
  SKILL_CATEGORY_ADMIN_LABELS,
  type EvidenceTypeValue,
  type SkillCategoryValue,
  type SkillStatusValue,
} from '@/lib/skill-constants';
import { formatDate } from '@/lib/utils';

type Capability = {
  id: string;
  statement: string;
  description: string | null;
  achievedAt: Date | null;
  order: number;
};

type Evidence = {
  id: string;
  type: EvidenceTypeValue;
  title: string;
  capabilityId: string | null;
  url: string | null;
  fileUrl: string | null;
  provider: string | null;
  issuedAt: Date | null;
  description: string | null;
  certificationId: string | null;
  certification: { id: string; name: string; issuer: string } | null;
};

type Log = { id: string; date: Date; title: string; note: string | null; hours: number | null };

export type AdminSkillDetail = {
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
  capabilities: Capability[];
  evidences: Evidence[];
  logs: Log[];
};

export const EVIDENCE_ICONS: Record<EvidenceTypeValue, React.ComponentType<{ className?: string }>> = {
  COURSE: GraduationCap,
  CERTIFICATE: Award,
  IMAGE: ImageIcon,
  LINK: Link2,
  DOCUMENT: FileText,
  PROJECT: Rocket,
};

type ActionResult = { ok: boolean; error?: unknown };

/** Confirm → run → toast → refresh, shared by every delete on this page. */
function useConfirmedAction() {
  const router = useRouter();
  const { confirm, confirmDialog } = useConfirmDialog();
  const [, startTransition] = useTransition();

  const run = async (opts: { title: string; description?: string; success: string }, action: () => Promise<ActionResult>) => {
    if (!(await confirm({ title: opts.title, description: opts.description, confirmLabel: 'Xóa' }))) return;
    startTransition(async () => {
      const res = await action();
      if (res.ok) {
        toast.success(opts.success);
        router.refresh();
      } else {
        toast.error('Không thể xóa. Vui lòng thử lại.');
      }
    });
  };
  return { run, confirmDialog };
}

function EvidenceRow({
  evidence,
  capabilityLabel,
  onEdit,
  onDelete,
}: {
  evidence: Evidence;
  capabilityLabel?: string;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const Icon = EVIDENCE_ICONS[evidence.type];
  const href = evidence.fileUrl || evidence.url;
  return (
    <div className="flex items-start gap-3 p-3 rounded-lg border border-border/70 bg-card">
      <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-medium text-sm text-foreground">{evidence.title}</span>
          <span className="text-[11px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
            {EVIDENCE_TYPE_ADMIN_LABELS[evidence.type]}
          </span>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">
          {[
            evidence.certification ? `${evidence.certification.name} · ${evidence.certification.issuer}` : evidence.provider,
            evidence.issuedAt ? formatDate(evidence.issuedAt, 'vi') : null,
            capabilityLabel ? `→ ${capabilityLabel}` : null,
          ]
            .filter(Boolean)
            .join(' · ')}
        </p>
        {evidence.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{evidence.description}</p>}
      </div>
      <div className="flex items-center gap-1 shrink-0">
        {href && (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Mở bằng chứng"
            className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted"
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        )}
        <button type="button" aria-label={`Sửa ${evidence.title}`} onClick={onEdit} className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted">
          <Pencil className="h-3.5 w-3.5" />
        </button>
        <button type="button" aria-label={`Xóa ${evidence.title}`} onClick={onDelete} className="p-1.5 text-muted-foreground hover:text-destructive rounded-lg hover:bg-destructive/10">
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

function EmptyState({ icon: Icon, title, hint }: { icon: React.ComponentType<{ className?: string }>; title: string; hint: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center rounded-xl border border-dashed border-border">
      <Icon className="h-9 w-9 mb-2 text-muted-foreground/40" />
      <p className="font-medium text-foreground text-sm">{title}</p>
      <p className="text-xs text-muted-foreground mt-1 max-w-sm">{hint}</p>
    </div>
  );
}

const BTN_PRIMARY =
  'inline-flex items-center gap-2 px-3 py-1.5 bg-foreground text-background rounded-lg text-sm font-medium hover:bg-foreground/90 transition-colors cursor-pointer';
const BTN_OUTLINE =
  'inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-card text-sm font-medium hover:bg-muted transition-colors cursor-pointer';

export function AdminSkillDetailClient({
  skill,
  certifications,
}: {
  skill: AdminSkillDetail;
  certifications: CertificationOption[];
}) {
  const router = useRouter();
  const { run, confirmDialog } = useConfirmedAction();
  const [editSkillOpen, setEditSkillOpen] = useState(false);
  const [capDialog, setCapDialog] = useState<CapabilityDialogData | null>(null);
  const [evDialog, setEvDialog] = useState<EvidenceDialogData | null>(null);
  const [logDialog, setLogDialog] = useState<SkillLogDialogData | null>(null);
  const [reordering, startReorder] = useTransition();

  const capabilityLabel = (id: string | null) => skill.capabilities.find(c => c.id === id)?.statement;
  const totalHours = skill.logs.reduce((sum, l) => sum + (l.hours ?? 0), 0);
  const generalEvidences = skill.evidences.filter(e => !e.capabilityId);

  const openEvidence = (e: Evidence) =>
    setEvDialog({
      id: e.id,
      type: e.type,
      title: e.title,
      capabilityId: e.capabilityId ?? '',
      url: e.url ?? '',
      fileUrl: e.fileUrl ?? '',
      provider: e.provider ?? '',
      issuedAt: toDateInput(e.issuedAt),
      description: e.description ?? '',
      certificationId: e.certificationId ?? '',
    });

  const removeEvidence = (e: Evidence) =>
    run({ title: `Xóa bằng chứng "${e.title}"?`, success: 'Đã xóa bằng chứng.' }, () => deleteEvidence(e.id));

  const move = (index: number, delta: -1 | 1) => {
    const ids = skill.capabilities.map(c => c.id);
    const target = index + delta;
    if (target < 0 || target >= ids.length) return;
    [ids[index], ids[target]] = [ids[target], ids[index]];
    startReorder(async () => {
      const res = await reorderCapabilities(skill.id, ids);
      if (res.ok) router.refresh();
      else toast.error('Không thể đổi thứ tự.');
    });
  };

  return (
    <main className={ADMIN_PAGE_CLASS}>
      <Link href="/nhatphanhk102/skills" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground w-fit">
        <ArrowLeft className="h-4 w-4" /> Tất cả kỹ năng
      </Link>

      <AdminPageHeader
        title={skill.name}
        description={
          <span className="inline-flex flex-wrap items-center gap-2 mt-1">
            <SkillStatusBadge status={skill.status} />
            <span>{SKILL_CATEGORY_ADMIN_LABELS[skill.category]}</span>
            {skill.startedAt && <span>· Bắt đầu {formatDate(skill.startedAt, 'vi')}</span>}
            {skill.achievedAt && <span>· Làm được từ {formatDate(skill.achievedAt, 'vi')}</span>}
          </span>
        }
        actions={
          <>
            {skill.slug && (
              <a href={`/skills/${skill.slug}`} target="_blank" rel="noopener noreferrer" className={BTN_OUTLINE}>
                <ExternalLink className="h-4 w-4" /> Xem công khai
              </a>
            )}
            <button type="button" onClick={() => setEditSkillOpen(true)} className={BTN_OUTLINE}>
              <Pencil className="h-4 w-4" /> Sửa
            </button>
            <button
              type="button"
              onClick={() =>
                run(
                  {
                    title: `Xóa kỹ năng "${skill.name}"?`,
                    description: 'Toàn bộ năng lực, bằng chứng và nhật ký học cũng sẽ bị xóa.',
                    success: 'Đã xóa kỹ năng.',
                  },
                  async () => {
                    const res = await deleteSkill(skill.id);
                    if (res.ok) router.push('/nhatphanhk102/skills');
                    return res;
                  }
                )
              }
              className={BTN_OUTLINE + ' text-destructive hover:bg-destructive/10'}
            >
              <Trash2 className="h-4 w-4" /> Xóa
            </button>
          </>
        }
      />

      {skill.summary && <p className="text-sm text-foreground/80 -mt-2">{skill.summary}</p>}

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Năng lực', value: skill.capabilities.length, icon: CheckCircle2 },
          { label: 'Bằng chứng', value: skill.evidences.length, icon: Paperclip },
          { label: 'Giờ học đã ghi', value: Math.round(totalHours * 10) / 10, icon: Clock },
        ].map(s => (
          <div key={s.label} className="p-4 rounded-xl border border-border bg-card shadow-xs">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              {s.label}
              <s.icon className="h-4 w-4" />
            </div>
            <p className="text-2xl font-bold text-foreground mt-1 tabular-nums">{s.value}</p>
          </div>
        ))}
      </div>

      <Tabs defaultValue="capabilities" className="w-full">
        <TabsList>
          <TabsTrigger value="capabilities">Làm được gì ({skill.capabilities.length})</TabsTrigger>
          <TabsTrigger value="evidence">Bằng chứng ({skill.evidences.length})</TabsTrigger>
          <TabsTrigger value="logs">Nhật ký học ({skill.logs.length})</TabsTrigger>
        </TabsList>

        {/* ── Capabilities ── */}
        <TabsContent value="capabilities" className="space-y-3 mt-4">
          <div className="flex justify-between items-center gap-2">
            <p className="text-xs text-muted-foreground">Mỗi dòng là một việc cụ thể bạn làm được, kèm bằng chứng.</p>
            <button type="button" onClick={() => setCapDialog({ statement: '', description: '', achievedAt: '' })} className={BTN_PRIMARY}>
              <Plus className="h-4 w-4" /> Thêm năng lực
            </button>
          </div>

          {skill.capabilities.length === 0 ? (
            <EmptyState icon={CheckCircle2} title="Chưa có năng lực nào" hint='VD: "Đọc hiểu tài liệu kỹ thuật tiếng Anh", "Chơi trọn bài hát với hợp âm chặn".' />
          ) : (
            <ol className="space-y-3">
              {skill.capabilities.map((cap, i) => {
                const evs = skill.evidences.filter(e => e.capabilityId === cap.id);
                return (
                  <li key={cap.id} className="p-4 rounded-xl border border-border bg-card shadow-xs space-y-3">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground">{cap.statement}</p>
                        {cap.description && <p className="text-sm text-muted-foreground mt-0.5 whitespace-pre-line">{cap.description}</p>}
                        <p className="text-xs text-muted-foreground mt-1">
                          {cap.achievedAt ? `Từ ${formatDate(cap.achievedAt, 'vi')} · ` : ''}
                          {evs.length === 0 ? <span className="text-amber-600">Chưa có bằng chứng</span> : `${evs.length} bằng chứng`}
                        </p>
                      </div>
                      <div className="flex items-center gap-0.5 shrink-0">
                        <button type="button" disabled={i === 0 || reordering} aria-label="Lên" onClick={() => move(i, -1)} className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted disabled:opacity-30">
                          <ArrowUp className="h-3.5 w-3.5" />
                        </button>
                        <button type="button" disabled={i === skill.capabilities.length - 1 || reordering} aria-label="Xuống" onClick={() => move(i, 1)} className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted disabled:opacity-30">
                          <ArrowDown className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          aria-label={`Sửa ${cap.statement}`}
                          onClick={() =>
                            setCapDialog({
                              id: cap.id,
                              statement: cap.statement,
                              description: cap.description ?? '',
                              achievedAt: toDateInput(cap.achievedAt),
                            })
                          }
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          aria-label={`Xóa ${cap.statement}`}
                          onClick={() =>
                            run(
                              {
                                title: 'Xóa năng lực này?',
                                description: 'Bằng chứng gắn với năng lực sẽ được giữ lại và chuyển thành bằng chứng chung của kỹ năng.',
                                success: 'Đã xóa năng lực.',
                              },
                              () => deleteCapability(cap.id)
                            )
                          }
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    {evs.length > 0 && (
                      <div className="space-y-2 pl-8">
                        {evs.map(e => (
                          <EvidenceRow key={e.id} evidence={e} onEdit={() => openEvidence(e)} onDelete={() => removeEvidence(e)} />
                        ))}
                      </div>
                    )}
                    <div className="pl-8">
                      <button
                        type="button"
                        onClick={() => setEvDialog({ type: 'COURSE', title: '', capabilityId: cap.id })}
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
                      >
                        <Plus className="h-3.5 w-3.5" /> Thêm bằng chứng cho năng lực này
                      </button>
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </TabsContent>

        {/* ── Evidence ── */}
        <TabsContent value="evidence" className="space-y-3 mt-4">
          <div className="flex justify-between items-center gap-2">
            <p className="text-xs text-muted-foreground">Khóa học, chứng chỉ, hình ảnh, liên kết, tài liệu hoặc sản phẩm.</p>
            <button type="button" onClick={() => setEvDialog({ type: 'COURSE', title: '', capabilityId: '' })} className={BTN_PRIMARY}>
              <Plus className="h-4 w-4" /> Thêm bằng chứng
            </button>
          </div>
          {skill.evidences.length === 0 ? (
            <EmptyState icon={Paperclip} title="Chưa có bằng chứng" hint="Thêm chứng chỉ, khóa học đã hoàn thành, hình ảnh sản phẩm… để chứng minh kỹ năng." />
          ) : (
            <div className="space-y-2">
              {generalEvidences.length > 0 && <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Bằng chứng chung</p>}
              {generalEvidences.map(e => (
                <EvidenceRow key={e.id} evidence={e} onEdit={() => openEvidence(e)} onDelete={() => removeEvidence(e)} />
              ))}
              {skill.evidences.length > generalEvidences.length && (
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide pt-2">Theo năng lực</p>
              )}
              {skill.evidences
                .filter(e => e.capabilityId)
                .map(e => (
                  <EvidenceRow
                    key={e.id}
                    evidence={e}
                    capabilityLabel={capabilityLabel(e.capabilityId)}
                    onEdit={() => openEvidence(e)}
                    onDelete={() => removeEvidence(e)}
                  />
                ))}
            </div>
          )}
        </TabsContent>

        {/* ── Learning journal ── */}
        <TabsContent value="logs" className="space-y-3 mt-4">
          <div className="flex justify-between items-center gap-2">
            <p className="text-xs text-muted-foreground">Ghi lại mỗi buổi học / luyện tập để theo dõi tiến trình.</p>
            <button type="button" onClick={() => setLogDialog({ date: '', title: '', note: '', hours: null })} className={BTN_PRIMARY}>
              <Plus className="h-4 w-4" /> Ghi nhật ký
            </button>
          </div>
          {skill.logs.length === 0 ? (
            <EmptyState icon={BookOpen} title="Chưa có nhật ký học" hint="Mỗi lần học/luyện tập, ghi lại một dòng ngắn: đã học gì, mất bao lâu." />
          ) : (
            <ol className="relative border-l border-border ml-2 space-y-4">
              {skill.logs.map(log => (
                <li key={log.id} className="ml-5">
                  <span className="absolute -left-1.5 mt-1.5 h-3 w-3 rounded-full border-2 border-background bg-primary" />
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground">
                        {formatDate(log.date, 'vi', 'long')}
                        {log.hours ? ` · ${log.hours} giờ` : ''}
                      </p>
                      <p className="font-medium text-sm text-foreground">{log.title}</p>
                      {log.note && <p className="text-sm text-muted-foreground whitespace-pre-line mt-0.5">{log.note}</p>}
                    </div>
                    <div className="flex items-center gap-0.5 shrink-0">
                      <button
                        type="button"
                        aria-label="Sửa nhật ký"
                        onClick={() =>
                          setLogDialog({ id: log.id, date: toDateInput(log.date), title: log.title, note: log.note ?? '', hours: log.hours })
                        }
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        aria-label="Xóa nhật ký"
                        onClick={() => run({ title: 'Xóa mục nhật ký này?', success: 'Đã xóa nhật ký.' }, () => deleteSkillLog(log.id))}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </TabsContent>
      </Tabs>

      {editSkillOpen && (
        <SkillDialog mode="edit" open={editSkillOpen} onOpenChange={setEditSkillOpen} initialData={skillToForm(skill)} />
      )}
      {capDialog && (
        <CapabilityDialog
          key={capDialog.id ?? 'new'}
          skillId={skill.id}
          open={!!capDialog}
          onOpenChange={o => !o && setCapDialog(null)}
          initialData={capDialog}
        />
      )}
      {evDialog && (
        <EvidenceDialog
          key={evDialog.id ?? `new-${evDialog.capabilityId}`}
          skillId={skill.id}
          open={!!evDialog}
          onOpenChange={o => !o && setEvDialog(null)}
          capabilities={skill.capabilities.map(c => ({ id: c.id, statement: c.statement }))}
          certifications={certifications}
          initialData={evDialog}
        />
      )}
      {logDialog && (
        <SkillLogDialog
          key={logDialog.id ?? 'new'}
          skillId={skill.id}
          open={!!logDialog}
          onOpenChange={o => !o && setLogDialog(null)}
          initialData={logDialog.id ? logDialog : undefined}
        />
      )}
      {confirmDialog}
    </main>
  );
}
