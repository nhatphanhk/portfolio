import type { Editor } from '@tiptap/core';
import {
  Heading1,
  Heading2,
  Heading3,
  Pilcrow,
  List,
  ListOrdered,
  Code,
  Code2,
  Quote,
  GitFork,
  Table,
  Sigma,
  Info,
  Lightbulb,
  AlertTriangle,
  AlertOctagon,
  Image as ImageIcon,
  Minus,
} from 'lucide-react';

export interface SlashItem {
  title: string;
  description: string;
  searchTerms: string[];
  icon: React.ComponentType<{ className?: string }>;
  command: (editor: Editor, options?: { onOpenImageModal?: () => void }) => void;
}

export const SLASH_ITEMS: SlashItem[] = [
  {
    title: 'Heading 1',
    description: 'Tiêu đề lớn nhất (H1)',
    searchTerms: ['h1', 'heading1', 'tieu de 1', 'large title'],
    icon: Heading1,
    command: editor => editor.chain().focus().toggleHeading({ level: 1 }).run(),
  },
  {
    title: 'Heading 2',
    description: 'Tiêu đề vừa (H2)',
    searchTerms: ['h2', 'heading2', 'tieu de 2', 'medium title'],
    icon: Heading2,
    command: editor => editor.chain().focus().toggleHeading({ level: 2 }).run(),
  },
  {
    title: 'Heading 3',
    description: 'Tiêu đề phụ nhỏ (H3)',
    searchTerms: ['h3', 'heading3', 'tieu de 3', 'small title'],
    icon: Heading3,
    command: editor => editor.chain().focus().toggleHeading({ level: 3 }).run(),
  },
  {
    title: 'Paragraph',
    description: 'Đoạn văn văn bản thông thường',
    searchTerms: ['p', 'paragraph', 'doan van', 'text'],
    icon: Pilcrow,
    command: editor => editor.chain().focus().setParagraph().run(),
  },
  {
    title: 'Bullet List',
    description: 'Danh sách dấu đầu dòng',
    searchTerms: ['ul', 'bullet', 'list', 'danh sach', 'cham'],
    icon: List,
    command: editor => editor.chain().focus().toggleBulletList().run(),
  },
  {
    title: 'Numbered List',
    description: 'Danh sách đánh số thứ tự',
    searchTerms: ['ol', 'number', 'numbered list', 'danh sach so', '123'],
    icon: ListOrdered,
    command: editor => editor.chain().focus().toggleOrderedList().run(),
  },
  {
    title: 'Inline Code',
    description: 'Mã nội dòng đánh dấu từ hoặc biểu thức code',
    searchTerms: ['code', 'inline', 'inline code', 'ma', 'noi dong'],
    icon: Code,
    command: editor => editor.chain().focus().toggleCode().run(),
  },
  {
    title: 'Code Block',
    description: 'Khối mã nguồn đa ngôn ngữ (TS, JS, Python, Go...)',
    searchTerms: ['code', 'block', 'programming', 'ma nguon'],
    icon: Code2,
    command: editor => editor.chain().focus().toggleCodeBlock({ language: 'typescript' }).run(),
  },
  {
    title: 'Quote (Trích dẫn)',
    description: 'Đoạn văn trích dẫn với đường viền bên trái nổi bật',
    searchTerms: ['quote', 'blockquote', 'trich dan'],
    icon: Quote,
    command: editor => editor.chain().focus().toggleBlockquote().run(),
  },
  {
    title: 'Mermaid Diagram',
    description: 'Sơ đồ luồng, sequence, flowchart, ER diagram',
    searchTerms: ['mermaid', 'diagram', 'chart', 'flowchart', 'so do', 'luu do'],
    icon: GitFork,
    command: editor => {
      const template = `graph TD\n    A[Bắt đầu] --> B{Điều kiện}\n    B -->|Đúng| C[Xử lý]\n    B -->|Sai| D[Kết thúc]\n    C --> D`;
      editor.chain().focus().toggleCodeBlock({ language: 'mermaid' }).insertContent(template).run();
    },
  },
  {
    title: 'Table (3x3)',
    description: 'Bảng dữ liệu hàng cột tùy biến',
    searchTerms: ['table', 'bang', 'cot', 'hang', 'grid'],
    icon: Table,
    command: editor => {
      (editor.chain().focus() as any).insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
    },
  },
  {
    title: 'Mathematical Formula',
    description: 'Công thức toán học LaTeX / KaTeX',
    searchTerms: ['math', 'latex', 'katex', 'toan', 'cong thuc', 'sigma'],
    icon: Sigma,
    command: editor => {
      const defaultLatex = 'E = mc^2';
      (editor.chain().focus() as any).insertContent({
        type: 'blockMath',
        attrs: { latex: defaultLatex },
      }).run();
    },
  },
  {
    title: 'Callout: Note',
    description: 'Hộp ghi chú thông tin (xanh dương)',
    searchTerms: ['callout', 'note', 'ghi chu', 'thong tin', 'info'],
    icon: Info,
    command: editor => (editor.chain().focus() as any).setCallout({ type: 'note' }).run(),
  },
  {
    title: 'Callout: Tip',
    description: 'Mẹo hay, gợi ý hữu ích (xanh lá)',
    searchTerms: ['callout', 'tip', 'meo', 'hint', 'goi y', 'success'],
    icon: Lightbulb,
    command: editor => (editor.chain().focus() as any).setCallout({ type: 'tip' }).run(),
  },
  {
    title: 'Callout: Warning',
    description: 'Cảnh báo lưu ý quan trọng (vàng)',
    searchTerms: ['callout', 'warning', 'canh bao', 'luu y', 'alert'],
    icon: AlertTriangle,
    command: editor => (editor.chain().focus() as any).setCallout({ type: 'warning' }).run(),
  },
  {
    title: 'Callout: Danger',
    description: 'Cảnh báo nguy hiểm / lỗi (đỏ)',
    searchTerms: ['callout', 'danger', 'nguy hiem', 'error', 'loi'],
    icon: AlertOctagon,
    command: editor => (editor.chain().focus() as any).setCallout({ type: 'danger' }).run(),
  },
  {
    title: 'Insert Image',
    description: 'Tải ảnh lên hoặc chọn từ thư viện',
    searchTerms: ['image', 'photo', 'picture', 'anh', 'hinh anh'],
    icon: ImageIcon,
    command: (editor, options) => {
      if (options?.onOpenImageModal) {
        options.onOpenImageModal();
      }
    },
  },
  {
    title: 'Horizontal Rule',
    description: 'Đường phân cách ngang',
    searchTerms: ['hr', 'divider', 'line', 'duong ke', 'phan cach'],
    icon: Minus,
    command: editor => editor.chain().focus().setHorizontalRule().run(),
  },
];
