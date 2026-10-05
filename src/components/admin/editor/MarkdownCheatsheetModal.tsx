'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { BookOpen, Blocks, Type, Keyboard, ScrollText } from 'lucide-react';

/**
 * A single Markdown rule: what to type, how it triggers, and what it produces.
 * Every rule listed here MUST match an actual input rule / keymap registered in
 * TipTapEditor (StarterKit, Highlight, Mathematics, Callout, code-block-shortcuts).
 */
interface Rule {
  syntax: string;
  trigger: string;
  result: string;
  example?: string;
}

interface RuleGroup {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  rules: Rule[];
}

const GROUPS: RuleGroup[] = [
  {
    id: 'blocks',
    label: 'Khối đặc biệt',
    icon: Blocks,
    rules: [
      { syntax: '> [!NOTE]', trigger: 'Space', result: 'Callout Note (xanh dương)', example: 'Cũng nhận [!INFO]' },
      { syntax: '> [!TIP]', trigger: 'Space', result: 'Callout Tip (xanh lá)', example: 'Cũng nhận [!IMPORTANT]' },
      { syntax: '> [!WARNING]', trigger: 'Space', result: 'Callout Warning (vàng)' },
      { syntax: '> [!DANGER]', trigger: 'Space', result: 'Callout Danger (đỏ)', example: 'Cũng nhận [!CAUTION]' },
      { syntax: ':::note  :::tip  :::warning  :::danger', trigger: 'Space', result: 'Callout tương ứng (cú pháp directive)' },
      { syntax: '```ts', trigger: 'Space / Enter', result: 'Code block TypeScript', example: 'Alias: ts, js, py, sh, yml, md, rs, rb, cs, go…' },
      { syntax: '```', trigger: 'Space / Enter', result: 'Code block không ngôn ngữ (Plain Text)', example: '~~~ cũng hoạt động' },
      { syntax: '```mermaid', trigger: 'Space / Enter', result: 'Sơ đồ Mermaid + mẫu sẵn, xem trước trực tiếp', example: 'Alias: uml, flowchart, sequence' },
      { syntax: '$$$E = mc^2$$$', trigger: 'Gõ $$$ đóng', result: 'Công thức toán dạng khối (KaTeX)', example: 'Gõ ở dòng riêng' },
      { syntax: '> ', trigger: 'Space', result: 'Trích dẫn (Blockquote)' },
      { syntax: '---', trigger: 'Tự động sau ký tự thứ 3', result: 'Đường kẻ ngang', example: '*** hoặc ___ + Space' },
    ],
  },
  {
    id: 'structure',
    label: 'Cấu trúc',
    icon: ScrollText,
    rules: [
      { syntax: '# ', trigger: 'Space', result: 'Tiêu đề H1 (dùng hạn chế, tiêu đề bài đã là H1)' },
      { syntax: '## ', trigger: 'Space', result: 'Tiêu đề H2 — mục chính, hiện trong Mục lục' },
      { syntax: '### ', trigger: 'Space', result: 'Tiêu đề H3 — mục con' },
      { syntax: '- ', trigger: 'Space', result: 'Danh sách gạch đầu dòng', example: '* hoặc + cũng được' },
      { syntax: '1. ', trigger: 'Space', result: 'Danh sách đánh số', example: 'Bắt đầu từ số bất kỳ: 3. ' },
      { syntax: 'Tab / Shift+Tab', trigger: 'Trong danh sách', result: 'Thụt vào / lùi ra một cấp' },
      { syntax: '/table', trigger: 'Gõ / rồi chọn', result: 'Bảng (hoặc dán bảng Markdown | a | b |)' },
      { syntax: '/image', trigger: 'Gõ / rồi chọn', result: 'Chèn ảnh (hoặc dán ảnh từ clipboard)' },
    ],
  },
  {
    id: 'inline',
    label: 'Định dạng chữ',
    icon: Type,
    rules: [
      { syntax: '**chữ đậm**', trigger: 'Gõ ** đóng', result: 'Chữ đậm', example: '__chữ__ cũng được' },
      { syntax: '*chữ nghiêng*', trigger: 'Gõ * đóng', result: 'Chữ nghiêng', example: '_chữ_ cũng được' },
      { syntax: '~~gạch ngang~~', trigger: 'Gõ ~~ đóng', result: 'Gạch ngang' },
      { syntax: '==đánh dấu==', trigger: 'Gõ == đóng', result: 'Highlight (tô nền)' },
      { syntax: '`code`', trigger: 'Gõ ` đóng', result: 'Inline code (font mono, nền riêng)' },
      { syntax: '$$x^2$$', trigger: 'Gõ $$ đóng', result: 'Công thức toán nội dòng' },
      { syntax: 'https://…', trigger: 'Space sau URL', result: 'Tự động tạo liên kết' },
    ],
  },
  {
    id: 'keys',
    label: 'Phím tắt',
    icon: Keyboard,
    rules: [
      { syntax: 'Ctrl + B / I', trigger: 'Bôi đen chữ', result: 'Đậm / Nghiêng' },
      { syntax: 'Ctrl + E', trigger: 'Bôi đen chữ', result: 'Inline code' },
      { syntax: 'Ctrl + Shift + X', trigger: 'Bôi đen chữ', result: 'Gạch ngang' },
      { syntax: 'Ctrl + Shift + H', trigger: 'Bôi đen chữ', result: 'Highlight' },
      { syntax: 'Ctrl + Alt + 1 / 2 / 3', trigger: 'Trên dòng', result: 'Chuyển thành H1 / H2 / H3' },
      { syntax: 'Ctrl + Shift + 8 / 7', trigger: 'Trên dòng', result: 'Danh sách gạch đầu dòng / đánh số' },
      { syntax: 'Ctrl + Shift + B', trigger: 'Trên dòng', result: 'Trích dẫn' },
      { syntax: 'Ctrl + Alt + C', trigger: 'Trên dòng', result: 'Code block' },
      { syntax: 'Shift + Enter', trigger: 'Bất kỳ', result: 'Xuống dòng trong cùng đoạn' },
      { syntax: 'Ctrl + Z / Ctrl + Shift + Z', trigger: 'Bất kỳ', result: 'Hoàn tác / Làm lại' },
    ],
  },
];

const GENERAL_RULES: { title: string; desc: string }[] = [
  { title: 'Gõ ở đầu dòng', desc: 'Cú pháp khối (#, >, -, 1., ```, :::, > [!NOTE]) chỉ kích hoạt khi gõ ở ĐẦU một dòng mới.' },
  { title: 'Phải có phím kích hoạt', desc: 'Sau ký tự, nhấn Space (hoặc Enter với code block) thì khối mới được tạo.' },
  { title: 'Định dạng chữ cần ký tự đóng', desc: '**, *, ~~, ==, ` chỉ áp dụng khi gõ ký tự đóng ngay sau chữ (không có khoảng trắng trước ký tự đóng).' },
  { title: 'Hoàn tác chuyển đổi', desc: 'Nhấn Backspace ngay sau khi khối được tạo để trả lại ký tự gốc nếu bạn không muốn chuyển đổi.' },
  { title: 'Thoát khỏi khối', desc: 'Callout / trích dẫn / danh sách: nhấn Enter trên dòng trống. Code block: Enter 3 lần ở cuối, hoặc mũi tên ↓.' },
  { title: 'Dán Markdown', desc: 'Dán nội dung từ file .md: tiêu đề, bảng, code, > [!NOTE]… đều được tự động chuyển đổi.' },
];

interface MarkdownCheatsheetModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MarkdownCheatsheetModal({ open, onOpenChange }: MarkdownCheatsheetModalProps) {
  const [activeId, setActiveId] = useState<string>('rules');
  const activeGroup = GROUPS.find(g => g.id === activeId);

  const tabs = [{ id: 'rules', label: 'Luật chung', icon: BookOpen }, ...GROUPS];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[85vh] flex flex-col gap-0 p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border">
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            Hướng dẫn & Luật viết nhanh Markdown
          </DialogTitle>
          <DialogDescription>
            Gõ các ký tự đặc biệt như trong file .md — editor sẽ tự chuyển thành khối tương ứng.
          </DialogDescription>
        </DialogHeader>

        {/* Tabs */}
        <div className="flex gap-1 px-6 py-2 border-b border-border overflow-x-auto bg-muted/30">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = tab.id === activeId;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveId(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-card text-foreground shadow-xs border border-border'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {activeId === 'rules' ? (
            <ol className="space-y-3">
              {GENERAL_RULES.map((r, i) => (
                <li key={r.title} className="flex gap-3 p-3 rounded-xl border border-border bg-card">
                  <span className="w-6 h-6 shrink-0 rounded-full bg-primary/15 text-primary text-xs font-bold flex items-center justify-center">
                    {i + 1}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{r.title}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">{r.desc}</p>
                  </div>
                </li>
              ))}
            </ol>
          ) : activeGroup ? (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wider text-muted-foreground border-b border-border">
                  <th className="py-2 pr-3 font-semibold">Gõ</th>
                  <th className="py-2 pr-3 font-semibold">Kích hoạt</th>
                  <th className="py-2 font-semibold">Kết quả</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {activeGroup.rules.map(rule => (
                  <tr key={rule.syntax} className="align-top">
                    <td className="py-2.5 pr-3">
                      <code className="inline-block px-2 py-0.5 rounded-md bg-muted border border-border font-mono text-xs text-foreground whitespace-pre">
                        {rule.syntax}
                      </code>
                    </td>
                    <td className="py-2.5 pr-3 text-xs text-muted-foreground whitespace-nowrap">{rule.trigger}</td>
                    <td className="py-2.5">
                      <p className="text-xs font-medium text-foreground">{rule.result}</p>
                      {rule.example && <p className="text-[11px] text-muted-foreground mt-0.5">{rule.example}</p>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
