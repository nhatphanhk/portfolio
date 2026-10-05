'use client';

import { useEditor, EditorContent, ReactNodeViewRenderer } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { common, createLowlight } from 'lowlight';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import Highlight from '@tiptap/extension-highlight';
import Heading from '@tiptap/extension-heading';
import { TableKit } from '@tiptap/extension-table';
import { Mathematics } from '@tiptap/extension-mathematics';
import { Markdown } from '@tiptap/markdown';

import { EditorToolbar } from './EditorToolbar';
import { CodeBlockComponent } from './CodeBlockComponent';
import { Callout } from './extensions/callout';
import { SlashCommand } from './extensions/slash-command';
import { SmartPaste } from './extensions/smart-paste';
import { useEffect, useState } from 'react';
import { ImageUploadModal } from './ImageUploadModal';
import { MarkdownCheatsheetModal } from './MarkdownCheatsheetModal';
import { codeBlockInputRules } from './extensions/code-block-shortcuts';

import 'katex/dist/katex.min.css';

const lowlight = createLowlight(common);

interface TipTapEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export function TipTapEditor({
  content,
  onChange,
  placeholder = 'Gõ / để chèn khối (bảng, sơ đồ, công thức...), hoặc dán bất cứ thứ gì: ảnh clipboard, Markdown, code...',
}: TipTapEditorProps) {
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [cheatsheetOpen, setCheatsheetOpen] = useState(false);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        codeBlock: false,
        heading: false,
        link: false,
      }),
      Heading.configure({ levels: [1, 2, 3] }),
      CodeBlockLowlight.extend({
        addNodeView() {
          return ReactNodeViewRenderer(CodeBlockComponent);
        },
        // ```ts / ```py / ```mermaid ... with alias normalization + Mermaid starter
        addInputRules() {
          return codeBlockInputRules(this.type);
        },
      }).configure({ lowlight }),
      Image.configure({
        inline: false,
        allowBase64: true, // Allow initial parsing of Word/Docs images; SmartPaste immediately uploads & replaces
        HTMLAttributes: {
          class: 'rounded-xl max-w-full my-4 border border-border shadow-sm mx-auto',
        },
      }),
      Link.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder }),
      Highlight,
      Markdown,
      TableKit.configure({
        table: {
          resizable: true,
          HTMLAttributes: {
            class: 'border-collapse table-auto w-full my-4 text-sm',
          },
        },
      }),
      Mathematics.configure({
        katexOptions: {
          throwOnError: false,
        },
      }),
      Callout,
      SlashCommand.configure({
        onOpenImageModal: () => setImageModalOpen(true),
      }),
      SmartPaste,
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          'prose prose-sm sm:prose-base dark:prose-invert max-w-none focus:outline-none min-h-[600px] p-8 sm:p-10 bg-card text-card-foreground',
      },
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content, { emitUpdate: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content]);

  const handleImageSelect = (url: string, alt?: string) => {
    editor?.chain().focus().setImage({ src: url, alt: alt ?? '' }).run();
  };

  return (
    <div className="w-full border border-border/80 rounded-2xl overflow-hidden bg-card shadow-lg shadow-slate-900/5 ring-1 ring-black/5">
      <EditorToolbar
        editor={editor}
        onInsertImage={() => setImageModalOpen(true)}
        onOpenCheatsheet={() => setCheatsheetOpen(true)}
      />
      <EditorContent editor={editor} />
      <div className="flex items-center justify-between gap-3 px-4 py-2 border-t border-border/60 bg-muted/30 text-[11px] text-muted-foreground">
        <span>
          Gõ <kbd className="px-1 py-0.5 rounded border border-border bg-card font-mono">/</kbd> để chèn khối ·{' '}
          <kbd className="px-1 py-0.5 rounded border border-border bg-card font-mono">&gt; [!NOTE]</kbd>{' '}
          <kbd className="px-1 py-0.5 rounded border border-border bg-card font-mono">```ts</kbd>{' '}
          <kbd className="px-1 py-0.5 rounded border border-border bg-card font-mono">## </kbd> để viết nhanh
        </span>
        <button
          type="button"
          onClick={() => setCheatsheetOpen(true)}
          className="shrink-0 font-semibold text-primary hover:underline cursor-pointer"
        >
          Xem luật Markdown →
        </button>
      </div>
      <ImageUploadModal
        open={imageModalOpen}
        onClose={() => setImageModalOpen(false)}
        onSelect={handleImageSelect}
      />
      <MarkdownCheatsheetModal open={cheatsheetOpen} onOpenChange={setCheatsheetOpen} />
    </div>
  );
}

export default TipTapEditor;
