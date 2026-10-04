'use client';

import { type Editor } from '@tiptap/react';
import {
  Bold,
  Italic,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Code2,
  Quote,
  Link as LinkIcon,
  ImageIcon,
  Minus,
  Undo,
  Redo,
  Highlighter,
  AlignLeft,
  Table as TableIcon,
  GitFork,
  Sigma,
  Info,
  Trash2,
} from 'lucide-react';
import { useCallback } from 'react';

interface EditorToolbarProps {
  editor: Editor | null;
  onInsertImage?: () => void;
}

function Divider() {
  return <div className="w-px h-5 bg-border mx-0.5 shrink-0" />;
}

function IconButton({
  onClick,
  isActive = false,
  disabled = false,
  children,
  title,
}: {
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  title?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`p-1.5 rounded-md transition-colors cursor-pointer ${
        isActive ? 'bg-primary/15 text-primary font-bold' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
      } ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
    >
      {children}
    </button>
  );
}

export function EditorToolbar({ editor, onInsertImage }: EditorToolbarProps) {
  const setLink = useCallback(() => {
    if (!editor) return;
    const previousUrl = editor.getAttributes('link').href as string | undefined;
    const url = window.prompt('URL liên kết:', previousUrl);

    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  const insertMermaid = useCallback(() => {
    if (!editor) return;
    const template = `graph TD\n    A[Bắt đầu] --> B{Điều kiện}\n    B -->|Đúng| C[Xử lý]\n    B -->|Sai| D[Kết thúc]\n    C --> D`;
    editor.chain().focus().toggleCodeBlock({ language: 'mermaid' }).insertContent(template).run();
  }, [editor]);

  const insertMath = useCallback(() => {
    if (!editor) return;
    const latex = window.prompt('Nhập công thức LaTeX (hoặc gõ $$ trong văn bản):', 'E = mc^2');
    if (latex) {
      (editor.chain().focus() as any)
        .insertContent({
          type: 'blockMath',
          attrs: { latex },
        })
        .run();
    }
  }, [editor]);

  const insertTable = useCallback(() => {
    if (!editor) return;
    (editor.chain().focus() as any).insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  }, [editor]);

  if (!editor) return null;

  const isTableActive = editor.isActive('table');

  return (
    <div className="flex flex-wrap items-center gap-0.5 p-2 border-b border-border bg-muted/30">
      {/* Undo / Redo */}
      <IconButton
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        title="Undo (Ctrl+Z)"
      >
        <Undo className="w-4 h-4" />
      </IconButton>
      <IconButton
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        title="Redo (Ctrl+Shift+Z)"
      >
        <Redo className="w-4 h-4" />
      </IconButton>

      <Divider />

      {/* Headings */}
      <IconButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        isActive={editor.isActive('heading', { level: 1 })}
        title="Heading 1"
      >
        <Heading1 className="w-4 h-4" />
      </IconButton>
      <IconButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        isActive={editor.isActive('heading', { level: 2 })}
        title="Heading 2"
      >
        <Heading2 className="w-4 h-4" />
      </IconButton>
      <IconButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        isActive={editor.isActive('heading', { level: 3 })}
        title="Heading 3"
      >
        <Heading3 className="w-4 h-4" />
      </IconButton>

      <Divider />

      {/* Text formatting */}
      <IconButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().toggleBold()}
        isActive={editor.isActive('bold')}
        title="Bold (Ctrl+B)"
      >
        <Bold className="w-4 h-4" />
      </IconButton>
      <IconButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().toggleItalic()}
        isActive={editor.isActive('italic')}
        title="Italic (Ctrl+I)"
      >
        <Italic className="w-4 h-4" />
      </IconButton>
      <IconButton
        onClick={() => editor.chain().focus().toggleStrike().run()}
        disabled={!editor.can().toggleStrike()}
        isActive={editor.isActive('strike')}
        title="Strikethrough"
      >
        <Strikethrough className="w-4 h-4" />
      </IconButton>
      <IconButton
        onClick={() => editor.chain().focus().toggleHighlight().run()}
        isActive={editor.isActive('highlight')}
        title="Highlight"
      >
        <Highlighter className="w-4 h-4" />
      </IconButton>

      <Divider />

      {/* Lists */}
      <IconButton
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        isActive={editor.isActive('bulletList')}
        title="Bullet List"
      >
        <List className="w-4 h-4" />
      </IconButton>
      <IconButton
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        isActive={editor.isActive('orderedList')}
        title="Ordered List"
      >
        <ListOrdered className="w-4 h-4" />
      </IconButton>

      <Divider />

      {/* Code, Mermaid, Math, Callout */}
      <IconButton
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        isActive={editor.isActive('codeBlock') && !editor.isActive('codeBlock', { language: 'mermaid' })}
        title="Code Block"
      >
        <Code2 className="w-4 h-4" />
      </IconButton>
      <IconButton
        onClick={insertMermaid}
        isActive={editor.isActive('codeBlock', { language: 'mermaid' })}
        title="Sơ đồ Mermaid (Flowchart, Sequence...)"
      >
        <GitFork className="w-4 h-4 text-cyan-500" />
      </IconButton>
      <IconButton onClick={insertMath} title="Công thức toán LaTeX / KaTeX">
        <Sigma className="w-4 h-4 text-purple-500" />
      </IconButton>
      <IconButton
        onClick={() => (editor.chain().focus() as any).toggleCallout({ type: 'note' }).run()}
        isActive={editor.isActive('callout')}
        title="Hộp ghi chú (Callout)"
      >
        <Info className="w-4 h-4 text-blue-500" />
      </IconButton>

      <Divider />

      {/* Table & controls */}
      <IconButton
        onClick={insertTable}
        isActive={isTableActive}
        title="Chèn bảng dữ liệu (3x3)"
      >
        <TableIcon className="w-4 h-4 text-emerald-500" />
      </IconButton>

      {isTableActive && (
        <div className="flex items-center gap-1 bg-emerald-500/10 px-1.5 py-0.5 rounded-lg border border-emerald-500/20 text-xs">
          <button
            type="button"
            onClick={() => (editor.chain().focus() as any).addRowAfter().run()}
            className="px-1.5 py-0.5 rounded hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-medium"
            title="Thêm hàng dưới"
          >
            +Hàng
          </button>
          <button
            type="button"
            onClick={() => (editor.chain().focus() as any).addColumnAfter().run()}
            className="px-1.5 py-0.5 rounded hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-medium"
            title="Thêm cột phải"
          >
            +Cột
          </button>
          <button
            type="button"
            onClick={() => (editor.chain().focus() as any).deleteRow().run()}
            className="px-1.5 py-0.5 rounded hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300"
            title="Xóa hàng"
          >
            -Hàng
          </button>
          <button
            type="button"
            onClick={() => (editor.chain().focus() as any).deleteColumn().run()}
            className="px-1.5 py-0.5 rounded hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300"
            title="Xóa cột"
          >
            -Cột
          </button>
          <button
            type="button"
            onClick={() => (editor.chain().focus() as any).deleteTable().run()}
            className="p-1 rounded hover:bg-rose-500/20 text-rose-600"
            title="Xóa bảng"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <IconButton
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        isActive={editor.isActive('blockquote')}
        title="Blockquote"
      >
        <Quote className="w-4 h-4" />
      </IconButton>
      <IconButton
        onClick={() => editor.chain().focus().setParagraph().run()}
        isActive={editor.isActive('paragraph')}
        title="Paragraph"
      >
        <AlignLeft className="w-4 h-4" />
      </IconButton>

      <Divider />

      {/* Links & Media */}
      <IconButton onClick={setLink} isActive={editor.isActive('link')} title="Chèn liên kết">
        <LinkIcon className="w-4 h-4" />
      </IconButton>
      <IconButton onClick={() => onInsertImage?.()} title="Chèn ảnh (Tải lên hoặc Thư viện)">
        <ImageIcon className="w-4 h-4" />
      </IconButton>

      <Divider />

      {/* Horizontal rule */}
      <IconButton onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Đường kẻ ngang">
        <Minus className="w-4 h-4" />
      </IconButton>
    </div>
  );
}
