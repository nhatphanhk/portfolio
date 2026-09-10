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
import { EditorToolbar } from './EditorToolbar';
import { CodeBlockComponent } from './CodeBlockComponent';
import { useEffect, useState } from 'react';
import { ImageUploadModal } from './ImageUploadModal';

const lowlight = createLowlight(common);

interface TipTapEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export function TipTapEditor({ content, onChange, placeholder = 'Write something...' }: TipTapEditorProps) {
  const [imageModalOpen, setImageModalOpen] = useState(false);

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
      }).configure({ lowlight }),
      Image.configure({
        inline: false,
        allowBase64: false,
        HTMLAttributes: {
          class: 'rounded-lg max-w-full my-4 border border-border shadow-sm',
        },
      }),
      Link.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder }),
      Highlight,
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
      handleDrop(view, event, _slice, moved) {
        if (!moved && event.dataTransfer?.files?.length) {
          const file = event.dataTransfer.files[0];
          if (!file.type.startsWith('image/')) return false;

          // Trigger upload via API
          const formData = new FormData();
          formData.append('file', file);
          formData.append('fileType', 'blog');

          fetch('/api/upload', { method: 'POST', body: formData })
            .then(r => r.json())
            .then(data => {
              if (data.url) {
                const { schema } = view.state;
                const coords = view.posAtCoords({ left: event.clientX, top: event.clientY });
                if (coords) {
                  const node = schema.nodes.image.create({ src: data.url, alt: file.name });
                  const transaction = view.state.tr.insert(coords.pos, node);
                  view.dispatch(transaction);
                }
              }
            })
            .catch(() => {});

          return true;
        }
        return false;
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
      <EditorToolbar editor={editor} onInsertImage={() => setImageModalOpen(true)} />
      <EditorContent editor={editor} />
      <ImageUploadModal
        open={imageModalOpen}
        onClose={() => setImageModalOpen(false)}
        onSelect={handleImageSelect}
      />
    </div>
  );
}

export default TipTapEditor;
