'use client';

import React, { useState, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Sparkles,
  UploadCloud,
  FileUp,
  CheckCircle2,
  Briefcase,
  GraduationCap,
  Cpu,
  Globe2,
  UserRound,
  Loader2,
  RefreshCw,
  ArrowRight,
  Bot,
} from 'lucide-react';
import { toast } from 'sonner';
import { ParsedResumeData } from '@/lib/pdf-resume-parser';

interface ResumePdfConvertDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentResumeUrl?: string | null;
  onApplyParsedData: (data: ParsedResumeData, mode: 'replace' | 'merge', fileUrl?: string | null) => void;
}

export function ResumePdfConvertDialog({
  open,
  onOpenChange,
  currentResumeUrl,
  onApplyParsedData,
}: ResumePdfConvertDialogProps) {
  const [step, setStep] = useState<'upload' | 'review'>('upload');
  const [isParsing, setIsParsing] = useState(false);
  const [parsedData, setParsedData] = useState<ParsedResumeData | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [importMode, setImportMode] = useState<'replace' | 'merge'>('replace');
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Gemini AI Options
  const [useAi, setUseAi] = useState(true);
  const [apiKey, setApiKey] = useState('');
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [aiEnhanced, setAiEnhanced] = useState(false);

  // Helper to get friendly filename
  const getDisplayFilename = (url: string) => {
    try {
      const parts = url.split('/');
      const last = parts[parts.length - 1];
      return decodeURIComponent(last.replace(/^\d+-/, ''));
    } catch {
      return url;
    }
  };

  // Section selection toggles
  const [selectedSections, setSelectedSections] = useState({
    profile: true,
    experiences: true,
    education: true,
    skills: true,
    spokenLanguages: true,
    socialLinks: true,
  });

  const resetState = () => {
    setStep('upload');
    setIsParsing(false);
    setParsedData(null);
    setFileUrl(null);
    setFileName('');
    setAiEnhanced(false);
  };

  const handleClose = (newOpen: boolean) => {
    if (!newOpen) resetState();
    onOpenChange(newOpen);
  };

  const handleFile = async (file: File) => {
    if (!file) return;
    if (!file.type.includes('pdf') && !file.name.toLowerCase().endsWith('.pdf')) {
      toast.error('Vui lòng chọn tệp định dạng PDF (.pdf)');
      return;
    }

    setIsParsing(true);
    setFileName(file.name);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('useAi', useAi ? 'true' : 'false');
    if (apiKey.trim()) formData.append('apiKey', apiKey.trim());

    try {
      const res = await fetch('/api/resume/parse-pdf', {
        method: 'POST',
        body: formData,
      });

      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.error || 'Lỗi khi phân tích tệp PDF CV');
      }

      setParsedData(resData.data);
      setFileUrl(resData.fileUrl || null);
      setAiEnhanced(Boolean(resData.aiEnhanced));
      setStep('review');
      if (resData.aiEnhanced) {
        toast.success('Google Gemini AI đã bóc tách & tối ưu câu từ chuẩn Harvard thành công!');
      } else {
        toast.success('Đã phân tích cấu trúc file PDF CV thành công!');
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Không thể đọc và phân tích file PDF');
    } finally {
      setIsParsing(false);
    }
  };

  const handleConvertFromUrl = async (url: string) => {
    if (!url) return;
    setIsParsing(true);
    setFileName(getDisplayFilename(url));

    const formData = new FormData();
    formData.append('url', url);
    formData.append('useAi', useAi ? 'true' : 'false');
    if (apiKey.trim()) formData.append('apiKey', apiKey.trim());

    try {
      const res = await fetch('/api/resume/parse-pdf', {
        method: 'POST',
        body: formData,
      });

      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.error || 'Lỗi khi phân tích tệp PDF CV');
      }

      setParsedData(resData.data);
      setFileUrl(resData.fileUrl || url);
      setAiEnhanced(Boolean(resData.aiEnhanced));
      setStep('review');
      if (resData.aiEnhanced) {
        toast.success('Google Gemini AI đã bóc tách & tối ưu câu từ chuẩn Harvard thành công!');
      } else {
        toast.success('Đã phân tích cấu trúc file PDF CV thành công!');
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Không thể đọc và phân tích file PDF');
    } finally {
      setIsParsing(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleApply = () => {
    if (!parsedData) return;

    // Filter parsed data based on user toggles
    const filtered: ParsedResumeData = {
      profile: selectedSections.profile ? parsedData.profile : {},
      experiences: selectedSections.experiences ? parsedData.experiences : [],
      education: selectedSections.education ? parsedData.education : [],
      skills: selectedSections.skills ? parsedData.skills : [],
      spokenLanguages: selectedSections.spokenLanguages ? parsedData.spokenLanguages : [],
      socialLinks: selectedSections.socialLinks ? parsedData.socialLinks : [],
      rawText: parsedData.rawText,
    };

    onApplyParsedData(filtered, importMode, fileUrl);
    toast.success('Đã cập nhật dữ liệu từ file PDF vào bản CV Live Canvas!');
    handleClose(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <div className="p-2 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <span>Chuyển Đổi File PDF Thành Bản CV</span>
          </DialogTitle>
          <DialogDescription className="text-xs">
            Trích xuất tự động thông tin từ file PDF (kinh nghiệm, học vấn, kỹ năng,...) và chuyển trực tiếp thành bản CV có thể chỉnh sửa trên canvas.
          </DialogDescription>
        </DialogHeader>

        {/* ── STEP 1: Upload / Select PDF ── */}
        {step === 'upload' && (
          <div className="space-y-4 pt-2">
            {/* Quick Option: Convert Currently Attached PDF */}
            {currentResumeUrl && (
              <div className="p-3.5 rounded-2xl border border-amber-500/30 bg-amber-500/10 flex items-center justify-between gap-3 shadow-2xs">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="p-2 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 shrink-0">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-foreground truncate">
                      {getDisplayFilename(currentResumeUrl)}
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                      File PDF Resume đang đính kèm trong hồ sơ hiện tại
                    </div>
                  </div>
                </div>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => handleConvertFromUrl(currentResumeUrl)}
                  disabled={isParsing}
                  className="text-xs h-8 gap-1.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold shrink-0 shadow-xs"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Chuyển đổi file này</span>
                </Button>
              </div>
            )}

            {/* Gemini AI Optimization Option */}
            <div className="p-3.5 rounded-2xl bg-violet-500/10 border border-violet-500/25 flex flex-col gap-2 text-xs">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-violet-900 dark:text-violet-300 font-semibold">
                  <div className="p-1.5 rounded-lg bg-violet-500/20 text-violet-600 dark:text-violet-400">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-xs">Google Gemini AI: Bóc tách & Chuẩn hóa Harvard / Oxford</div>
                    <div className="text-[10px] text-muted-foreground font-normal">Tự động viết lại gạch đầu dòng theo chuẩn Action Verb + Quantifiable Result</div>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={useAi}
                    onChange={e => setUseAi(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-8 h-4.5 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-violet-600"></div>
                </label>
              </div>

              {useAi && (
                <div className="pt-1 border-t border-violet-500/20 flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-muted-foreground">
                      Sử dụng GEMINI_API_KEY trong .env (hoặc nhập API Key tùy chỉnh)
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowApiKeyInput(!showApiKeyInput)}
                      className="text-violet-600 dark:text-violet-400 hover:underline font-semibold"
                    >
                      {showApiKeyInput ? 'Thu gọn' : 'Nhập API Key'}
                    </button>
                  </div>
                  {showApiKeyInput && (
                    <input
                      type="password"
                      placeholder="Dán Gemini API Key (ví dụ: AIzaSy...)"
                      value={apiKey}
                      onChange={e => setApiKey(e.target.value)}
                      className="w-full px-2.5 py-1 text-xs rounded-lg border border-border bg-white shadow-xs focus:outline-primary"
                    />
                  )}
                </div>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf,.pdf"
              className="hidden"
              onChange={e => {
                if (e.target.files && e.target.files[0]) {
                  handleFile(e.target.files[0]);
                }
              }}
            />

            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => !isParsing && fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                dragActive
                  ? 'border-primary bg-primary/10 scale-[0.99]'
                  : 'border-border/80 hover:border-primary/60 hover:bg-muted/30 bg-card/40'
              }`}
            >
              {isParsing ? (
                <div className="flex flex-col items-center gap-3">
                  <div className="relative">
                    <Loader2 className="w-10 h-10 text-primary animate-spin" />
                    <Sparkles className="w-4 h-4 text-amber-500 absolute -top-1 -right-1 animate-bounce" />
                  </div>
                  <div className="text-sm font-bold text-foreground">
                    Đang đọc & phân tích cấu trúc CV từ {fileName}...
                  </div>
                  <div className="text-xs text-muted-foreground max-w-sm">
                    Thuật toán đang bóc tách các mục: thông tin liên hệ, lịch sử làm việc, học vấn, và danh sách kỹ năng.
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <div className="p-4 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 shadow-xs">
                    <UploadCloud className="w-8 h-8" />
                  </div>
                  <div>
                    <div className="text-base font-bold text-foreground">
                      Kéo thả file PDF CV vào đây hoặc bấm để chọn
                    </div>
                    <div className="text-xs text-muted-foreground mt-1 max-w-md">
                      Hỗ trợ các mẫu CV tiếng Anh và tiếng Việt. Tự động nhận diện công ty, chức danh, kỹ năng và ngày tháng.
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="mt-2 text-xs h-8 gap-1.5 pointer-events-none font-semibold"
                  >
                    <FileUp className="w-3.5 h-3.5" />
                    <span>Chọn file PDF CV</span>
                  </Button>
                </div>
              )}
            </div>

            {/* Quick helper tip */}
            <div className="p-3 rounded-xl bg-muted/40 border border-border/60 text-xs text-muted-foreground flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
              <span>
                <strong>Mẹo:</strong> Bản CV dạng text thông thường sẽ cho kết quả trích xuất chính xác nhất. Sau khi nhập, bạn có thể chỉnh sửa thoải mái từng mục trên màn hình studio.
              </span>
            </div>
          </div>
        )}

        {/* ── STEP 2: Review & Apply ── */}
        {step === 'review' && parsedData && (
          <div className="space-y-4 pt-2">
            {/* Top Extraction Summary Badge */}
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 font-semibold flex-wrap">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Trích xuất thành công từ: {fileName}</span>
                {aiEnhanced && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-violet-500/20 text-violet-700 dark:text-violet-300 border border-violet-500/30 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-violet-500" />
                    Gemini AI Harvard
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={resetState}
                className="text-[11px] font-semibold text-muted-foreground hover:text-foreground flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Chọn file khác</span>
              </button>
            </div>

            {/* Import Mode Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">Chế độ áp dụng vào CV:</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setImportMode('replace')}
                  className={`p-3 rounded-xl border text-left transition-all flex flex-col gap-1 ${
                    importMode === 'replace'
                      ? 'border-primary bg-primary/10 text-foreground font-semibold shadow-xs'
                      : 'border-border bg-card/50 text-muted-foreground hover:bg-muted/40'
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-xs font-bold">
                    <span className="w-2 h-2 rounded-full bg-primary" />
                    <span>Thay thế bản CV hiện tại</span>
                  </div>
                  <span className="text-[11px] opacity-80">
                    Xóa các mục cũ và áp dụng toàn bộ nội dung mới từ file PDF.
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setImportMode('merge')}
                  className={`p-3 rounded-xl border text-left transition-all flex flex-col gap-1 ${
                    importMode === 'merge'
                      ? 'border-primary bg-primary/10 text-foreground font-semibold shadow-xs'
                      : 'border-border bg-card/50 text-muted-foreground hover:bg-muted/40'
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-xs font-bold">
                    <span className="w-2 h-2 rounded-full bg-primary" />
                    <span>Hợp nhất vào CV hiện tại</span>
                  </div>
                  <span className="text-[11px] opacity-80">
                    Giữ lại các mục hiện có và thêm các mục mới từ file PDF.
                  </span>
                </button>
              </div>
            </div>

            {/* Extracted Sections Preview Cards */}
            <div className="space-y-2.5">
              <div className="text-xs font-bold text-foreground">Chọn các phần muốn nhập vào CV:</div>

              {/* 1. Profile Section */}
              <div className="p-3 rounded-xl border border-border bg-card/60 flex items-start gap-3">
                <input
                  type="checkbox"
                  id="sec-profile"
                  checked={selectedSections.profile}
                  onChange={e => setSelectedSections(prev => ({ ...prev, profile: e.target.checked }))}
                  className="mt-1 rounded text-primary"
                />
                <label htmlFor="sec-profile" className="flex-1 cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                      <UserRound className="w-3.5 h-3.5 text-primary" />
                      <span>Thông tin cá nhân & Giới thiệu</span>
                    </div>
                    {parsedData.profile.name && (
                      <span className="text-[11px] text-muted-foreground font-mono">
                        {parsedData.profile.name}
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-1 flex flex-wrap gap-x-3 gap-y-0.5">
                    {parsedData.profile.title && <span>Chức danh: <strong>{parsedData.profile.title}</strong></span>}
                    {parsedData.profile.email && <span>Email: {parsedData.profile.email}</span>}
                    {parsedData.profile.phone && <span>SĐT: {parsedData.profile.phone}</span>}
                    {parsedData.profile.location && <span>Nơi ở: {parsedData.profile.location}</span>}
                  </div>
                  {parsedData.profile.bio && (
                    <p className="text-[11px] text-muted-foreground/80 mt-1 line-clamp-2 italic">
                      "{parsedData.profile.bio}"
                    </p>
                  )}
                </label>
              </div>

              {/* 2. Experiences Section */}
              <div className="p-3 rounded-xl border border-border bg-card/60 flex items-start gap-3">
                <input
                  type="checkbox"
                  id="sec-exp"
                  checked={selectedSections.experiences}
                  onChange={e => setSelectedSections(prev => ({ ...prev, experiences: e.target.checked }))}
                  className="mt-1 rounded text-primary"
                />
                <label htmlFor="sec-exp" className="flex-1 cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                      <Briefcase className="w-3.5 h-3.5 text-primary" />
                      <span>Kinh nghiệm làm việc</span>
                      <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-primary/20 text-primary font-mono">
                        {parsedData.experiences.length} vị trí
                      </span>
                    </div>
                  </div>
                  <div className="mt-1.5 space-y-1">
                    {parsedData.experiences.map((exp, idx) => (
                      <div key={idx} className="text-[11px] flex items-center justify-between text-muted-foreground border-t border-border/40 pt-1">
                        <span className="font-semibold text-foreground truncate max-w-[200px]">
                          {exp.position} - {exp.company}
                        </span>
                        <span className="text-[10px] font-mono">
                          {exp.startDate || ''} {exp.endDate ? `→ ${exp.endDate}` : exp.isCurrent ? '→ Hiện tại' : ''}
                        </span>
                      </div>
                    ))}
                    {parsedData.experiences.length === 0 && (
                      <span className="text-[11px] text-muted-foreground italic">Không tìm thấy mục kinh nghiệm</span>
                    )}
                  </div>
                </label>
              </div>

              {/* 3. Education Section */}
              <div className="p-3 rounded-xl border border-border bg-card/60 flex items-start gap-3">
                <input
                  type="checkbox"
                  id="sec-edu"
                  checked={selectedSections.education}
                  onChange={e => setSelectedSections(prev => ({ ...prev, education: e.target.checked }))}
                  className="mt-1 rounded text-primary"
                />
                <label htmlFor="sec-edu" className="flex-1 cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                      <GraduationCap className="w-3.5 h-3.5 text-primary" />
                      <span>Học vấn & Bằng cấp</span>
                      <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-primary/20 text-primary font-mono">
                        {parsedData.education.length} mục
                      </span>
                    </div>
                  </div>
                  <div className="mt-1.5 space-y-1">
                    {parsedData.education.map((edu, idx) => (
                      <div key={idx} className="text-[11px] flex items-center justify-between text-muted-foreground border-t border-border/40 pt-1">
                        <span className="font-semibold text-foreground truncate max-w-[240px]">
                          {edu.institution} {edu.degree ? `(${edu.degree})` : ''}
                        </span>
                        <span className="text-[10px] font-mono">
                          {edu.startDate || ''} {edu.endDate ? `→ ${edu.endDate}` : ''}
                        </span>
                      </div>
                    ))}
                    {parsedData.education.length === 0 && (
                      <span className="text-[11px] text-muted-foreground italic">Không tìm thấy mục học vấn</span>
                    )}
                  </div>
                </label>
              </div>

              {/* 4. Skills Section */}
              <div className="p-3 rounded-xl border border-border bg-card/60 flex items-start gap-3">
                <input
                  type="checkbox"
                  id="sec-skills"
                  checked={selectedSections.skills}
                  onChange={e => setSelectedSections(prev => ({ ...prev, skills: e.target.checked }))}
                  className="mt-1 rounded text-primary"
                />
                <label htmlFor="sec-skills" className="flex-1 cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                      <Cpu className="w-3.5 h-3.5 text-primary" />
                      <span>Kỹ năng chuyên môn</span>
                      <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-primary/20 text-primary font-mono">
                        {parsedData.skills.length} kỹ năng
                      </span>
                    </div>
                  </div>
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {parsedData.skills.slice(0, 16).map((sk, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded-md bg-muted text-[10px] font-medium text-foreground">
                        {sk.name}
                      </span>
                    ))}
                    {parsedData.skills.length > 16 && (
                      <span className="text-[10px] text-muted-foreground self-center">
                        +{parsedData.skills.length - 16} nữa...
                      </span>
                    )}
                    {parsedData.skills.length === 0 && (
                      <span className="text-[11px] text-muted-foreground italic">Không tìm thấy kỹ năng</span>
                    )}
                  </div>
                </label>
              </div>

              {/* 5. Languages Section */}
              {parsedData.spokenLanguages.length > 0 && (
                <div className="p-3 rounded-xl border border-border bg-card/60 flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="sec-lang"
                    checked={selectedSections.spokenLanguages}
                    onChange={e => setSelectedSections(prev => ({ ...prev, spokenLanguages: e.target.checked }))}
                    className="mt-1 rounded text-primary"
                  />
                  <label htmlFor="sec-lang" className="flex-1 cursor-pointer">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                      <Globe2 className="w-3.5 h-3.5 text-primary" />
                      <span>Ngoại ngữ ({parsedData.spokenLanguages.length})</span>
                    </div>
                    <div className="mt-1 flex flex-wrap gap-2 text-[11px] text-muted-foreground">
                      {parsedData.spokenLanguages.map((l, idx) => (
                        <span key={idx} className="font-semibold text-foreground">
                          {l.language}: <span className="font-normal text-muted-foreground">{l.level}</span>
                        </span>
                      ))}
                    </div>
                  </label>
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-border">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleClose(false)}
                className="text-xs h-8"
              >
                Hủy
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleApply}
                className="text-xs h-8 gap-1.5 bg-primary text-primary-foreground font-bold shadow-sm"
              >
                <span>Áp Dụng Vào Bản CV</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
