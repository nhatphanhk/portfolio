'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';

export type ItemType =
  | 'experience'
  | 'education'
  | 'achievement'
  | 'language'
  | 'activity'
  | 'skill'
  | 'social';

interface ResumeItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: ItemType | null;
  item?: any;
  onSave: (type: ItemType, data: any) => Promise<void>;
}

const SKILL_CATEGORIES = [
  'LANGUAGE',
  'FRAMEWORK',
  'FRONTEND',
  'BACKEND',
  'DATABASE',
  'CLOUD',
  'DEVOPS',
  'IAC',
  'MONITORING',
  'VERSION_CONTROL',
  'TOOLS',
  'OTHER',
];

export function ResumeItemDialog({
  open,
  onOpenChange,
  type,
  item,
  onSave,
}: ResumeItemDialogProps) {
  const [formData, setFormData] = useState<any>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open || !type) {
      setFormData({});
      return;
    }

    if (item) {
      // Format dates for input type="month" or "date"
      const formatMonth = (d: any) => {
        if (!d) return '';
        try {
          const date = new Date(d);
          return date.toISOString().slice(0, 7);
        } catch {
          return '';
        }
      };

      setFormData({
        ...item,
        startDate: formatMonth(item.startDate),
        endDate: formatMonth(item.endDate),
        date: formatMonth(item.date),
      });
    } else {
      // Defaults for new item
      switch (type) {
        case 'experience':
          setFormData({
            company: '',
            position: '',
            startDate: '',
            endDate: '',
            isCurrent: false,
            description: '',
            achievements: '',
            techStack: '',
          });
          break;
        case 'education':
          setFormData({
            institution: '',
            degree: '',
            fieldOfStudy: '',
            startDate: '',
            endDate: '',
            isCurrent: false,
            gpa: '',
            description: '',
          });
          break;
        case 'achievement':
          setFormData({
            title: '',
            date: '',
            description: '',
            category: '',
          });
          break;
        case 'language':
          setFormData({
            language: '',
            level: 'Native',
          });
          break;
        case 'activity':
          setFormData({
            title: '',
            startDate: '',
            endDate: '',
            type: '',
            description: '',
          });
          break;
        case 'skill':
          setFormData({
            name: '',
            category: 'FRAMEWORK',
            level: 80,
          });
          break;
        case 'social':
          setFormData({
            platform: '',
            url: '',
            iconName: '',
          });
          break;
      }
    }
  }, [open, type, item]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!type) return;
    setSaving(true);
    try {
      await onSave(type, formData);
      onOpenChange(false);
    } catch (err) {
      console.error('Failed to save item:', err);
    } finally {
      setSaving(false);
    }
  };

  const titles: Record<ItemType, string> = {
    experience: item ? 'Chỉnh sửa Kinh nghiệm' : 'Thêm Kinh nghiệm mới',
    education: item ? 'Chỉnh sửa Học vấn' : 'Thêm Học vấn mới',
    achievement: item ? 'Chỉnh sửa Thành tích' : 'Thêm Thành tích mới',
    language: item ? 'Chỉnh sửa Ngoại ngữ' : 'Thêm Ngoại ngữ mới',
    activity: item ? 'Chỉnh sửa Hoạt động' : 'Thêm Hoạt động mới',
    skill: item ? 'Chỉnh sửa Kỹ năng' : 'Thêm Kỹ năng mới',
    social: item ? 'Chỉnh sửa Liên kết' : 'Thêm Liên kết mới',
  };

  if (!type) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{titles[type]}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* ── EXPERIENCE FORM ── */}
          {type === 'experience' && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Vị trí / Chức danh *</label>
                  <Input
                    required
                    value={formData.position || ''}
                    onChange={e => setFormData({ ...formData, position: e.target.value })}
                    placeholder="VD: Senior Full-Stack Engineer"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Công ty *</label>
                  <Input
                    required
                    value={formData.company || ''}
                    onChange={e => setFormData({ ...formData, company: e.target.value })}
                    placeholder="VD: Tech Company Inc."
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Bắt đầu *</label>
                  <Input
                    type="month"
                    required
                    value={formData.startDate || ''}
                    onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-muted-foreground uppercase">Kết thúc</label>
                    <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer">
                      <input
                        type="checkbox"
                        checked={Boolean(formData.isCurrent)}
                        onChange={e =>
                          setFormData({
                            ...formData,
                            isCurrent: e.target.checked,
                            endDate: e.target.checked ? '' : formData.endDate,
                          })
                        }
                        className="rounded border-border"
                      />
                      Đang làm việc
                    </label>
                  </div>
                  <Input
                    type="month"
                    disabled={formData.isCurrent}
                    value={formData.endDate || ''}
                    onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Mô tả tổng quát</label>
                <Textarea
                  rows={2}
                  value={formData.description || ''}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Mô tả tóm tắt trách nhiệm chính và đóng góp tại công ty..."
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase">
                  Thành tích nổi bật (Mỗi dòng là 1 bullet point)
                </label>
                <Textarea
                  rows={3}
                  value={formData.achievements || ''}
                  onChange={e => setFormData({ ...formData, achievements: e.target.value })}
                  placeholder="Tối ưu hiệu năng ứng dụng tăng 40%&#10;Dẫn dắt đội ngũ 5 kỹ sư phát triển microservices..."
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase">
                  Công nghệ sử dụng (Phân cách bằng dấu phẩy)
                </label>
                <Input
                  value={formData.techStack || ''}
                  onChange={e => setFormData({ ...formData, techStack: e.target.value })}
                  placeholder="React, Next.js, TypeScript, PostgreSQL, Docker"
                />
              </div>
            </>
          )}

          {/* ── EDUCATION FORM ── */}
          {type === 'education' && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Trường / Học viện *</label>
                  <Input
                    required
                    value={formData.institution || ''}
                    onChange={e => setFormData({ ...formData, institution: e.target.value })}
                    placeholder="VD: Đại học Bách Khoa"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Bằng cấp *</label>
                  <Input
                    required
                    value={formData.degree || ''}
                    onChange={e => setFormData({ ...formData, degree: e.target.value })}
                    placeholder="VD: Cử nhân / Kỹ sư"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Chuyên ngành</label>
                  <Input
                    value={formData.fieldOfStudy || ''}
                    onChange={e => setFormData({ ...formData, fieldOfStudy: e.target.value })}
                    placeholder="VD: Khoa học máy tính"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">GPA / Xếp loại</label>
                  <Input
                    value={formData.gpa || ''}
                    onChange={e => setFormData({ ...formData, gpa: e.target.value })}
                    placeholder="VD: 3.6 / 4.0 (Giỏi)"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Bắt đầu *</label>
                  <Input
                    type="month"
                    required
                    value={formData.startDate || ''}
                    onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-muted-foreground uppercase">Tốt nghiệp</label>
                    <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer">
                      <input
                        type="checkbox"
                        checked={Boolean(formData.isCurrent)}
                        onChange={e =>
                          setFormData({
                            ...formData,
                            isCurrent: e.target.checked,
                            endDate: e.target.checked ? '' : formData.endDate,
                          })
                        }
                        className="rounded border-border"
                      />
                      Đang theo học
                    </label>
                  </div>
                  <Input
                    type="month"
                    disabled={formData.isCurrent}
                    value={formData.endDate || ''}
                    onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Mô tả / Đề tài tốt nghiệp</label>
                <Textarea
                  rows={2}
                  value={formData.description || ''}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Học bổng khuyến khích, nghiên cứu khoa học..."
                />
              </div>
            </>
          )}

          {/* ── ACHIEVEMENT FORM ── */}
          {type === 'achievement' && (
            <>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Tên giải thưởng / Thành tích *</label>
                <Input
                  required
                  value={formData.title || ''}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  placeholder="VD: Quán quân Hackathon Quốc gia 2024"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Thời gian</label>
                  <Input
                    type="month"
                    value={formData.date || ''}
                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Phân loại</label>
                  <Input
                    value={formData.category || ''}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    placeholder="VD: Cuộc thi / Danh hiệu"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Chi tiết thành tích</label>
                <Textarea
                  rows={2}
                  value={formData.description || ''}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Mô tả dự án hoặc đóng góp để đạt giải thưởng..."
                />
              </div>
            </>
          )}

          {/* ── SPOKEN LANGUAGE FORM ── */}
          {type === 'language' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Ngôn ngữ *</label>
                <Input
                  required
                  value={formData.language || ''}
                  onChange={e => setFormData({ ...formData, language: e.target.value })}
                  placeholder="VD: Tiếng Anh, Tiếng Nhật"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Trình độ *</label>
                <select
                  value={formData.level || 'Fluent'}
                  onChange={e => setFormData({ ...formData, level: e.target.value })}
                  className="w-full h-9 px-3 text-sm rounded-md border border-input bg-background text-foreground shadow-xs focus:ring-2 focus:ring-primary/25 focus:border-primary transition"
                >
                  <option value="Native">Bản ngữ (Native)</option>
                  <option value="Fluent">Thành thạo (Fluent / C1-C2)</option>
                  <option value="Professional Working">Giao tiếp tốt trong công việc (B2)</option>
                  <option value="Intermediate">Trung cấp (Intermediate / B1)</option>
                  <option value="Elementary">Cơ bản (Elementary / A1-A2)</option>
                </select>
              </div>
            </div>
          )}

          {/* ── ACTIVITY FORM ── */}
          {type === 'activity' && (
            <>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Tên hoạt động / Tổ chức *</label>
                <Input
                  required
                  value={formData.title || ''}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  placeholder="VD: Diễn giả GDG DevFest / Đóng góp mã nguồn mở"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Bắt đầu</label>
                  <Input
                    type="month"
                    value={formData.startDate || ''}
                    onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Kết thúc</label>
                  <Input
                    type="month"
                    value={formData.endDate || ''}
                    onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Mô tả hoạt động</label>
                <Textarea
                  rows={2}
                  value={formData.description || ''}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Chia sẻ kiến thức cộng đồng, tổ chức workshop..."
                />
              </div>
            </>
          )}

          {/* ── SKILL FORM ── */}
          {type === 'skill' && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Tên kỹ năng *</label>
                  <Input
                    required
                    value={formData.name || ''}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder="VD: React, TypeScript, AWS"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Danh mục *</label>
                  <select
                    value={formData.category || 'FRAMEWORK'}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    className="w-full h-9 px-3 text-sm rounded-md border border-input bg-background text-foreground shadow-xs focus:ring-2 focus:ring-primary/25 focus:border-primary transition"
                  >
                    {SKILL_CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span className="font-semibold uppercase">Mức độ thành thạo</span>
                  <span>{formData.level || 80}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  step="5"
                  value={formData.level || 80}
                  onChange={e => setFormData({ ...formData, level: parseInt(e.target.value, 10) })}
                  className="w-full accent-primary cursor-pointer"
                />
              </div>
            </>
          )}

          {/* ── SOCIAL FORM ── */}
          {type === 'social' && (
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Nền tảng / Tên *</label>
                <Input
                  required
                  value={formData.platform || ''}
                  onChange={e => setFormData({ ...formData, platform: e.target.value })}
                  placeholder="VD: GitHub, LinkedIn, Twitter"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Đường dẫn URL *</label>
                <Input
                  required
                  value={formData.url || ''}
                  onChange={e => setFormData({ ...formData, url: e.target.value })}
                  placeholder="https://..."
                />
              </div>
            </div>
          )}

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
              Hủy
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {item ? 'Cập nhật' : 'Thêm mới'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
