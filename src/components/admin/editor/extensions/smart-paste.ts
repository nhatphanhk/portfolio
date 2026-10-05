import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { toast } from 'sonner';
import { uploadBlogImage, rehostExternalImage, dataUriToFile } from '@/lib/upload';
import { looksLikeMarkdown, transformMarkdownJson } from './markdown-transform';

/**
 * Checks whether an image URL is already hosted locally or on Vercel Blob
 */
function isSelfHosted(url: string): boolean {
  if (!url) return true;
  if (url.startsWith('/') || url.startsWith('blob:')) return true;
  if (url.includes('.public.blob.vercel-storage.com') || url.includes('/uploads/')) return true;
  return false;
}

export const SmartPaste = Extension.create({
  name: 'smartPaste',

  addProseMirrorPlugins() {
    const editor = this.editor;

    return [
      new Plugin({
        key: new PluginKey('smartPastePlugin'),
        props: {
          handleDrop(view, event, _slice, moved) {
            if (moved) return false;
            const files = event.dataTransfer?.files;
            if (!files || files.length === 0) return false;

            const imageFiles = Array.from(files).filter(f => f.type.startsWith('image/'));
            if (imageFiles.length === 0) return false;

            event.preventDefault();
            const coords = view.posAtCoords({ left: event.clientX, top: event.clientY });
            const insertPos = coords?.pos ?? view.state.selection.from;

            for (const file of imageFiles) {
              const toastId = toast.loading(`Đang tải ảnh "${file.name}"...`);
              uploadBlogImage(file)
                .then(result => {
                  toast.success('Đã tải ảnh lên!', { id: toastId });
                  editor
                    .chain()
                    .focus()
                    .insertContentAt(insertPos, {
                      type: 'image',
                      attrs: { src: result.url, alt: file.name.replace(/\.[^.]+$/, '') },
                    })
                    .run();
                })
                .catch(err => {
                  toast.error(`Lỗi tải ảnh: ${err.message}`, { id: toastId });
                });
            }

            return true;
          },

          handlePaste(view, event) {
            const clipboardData = event.clipboardData;
            if (!clipboardData) return false;

            // 1. DIRECT IMAGE FILES (e.g. Screenshot Win+Shift+S, copied image file)
            const files = Array.from(clipboardData.files || []);
            const imageFiles = files.filter(f => f.type.startsWith('image/'));
            if (imageFiles.length > 0) {
              event.preventDefault();
              for (const file of imageFiles) {
                const toastId = toast.loading('Đang tải ảnh từ clipboard...');
                uploadBlogImage(file)
                  .then(result => {
                    toast.success('Đã dán ảnh thành công!', { id: toastId });
                    editor
                      .chain()
                      .focus()
                      .setImage({ src: result.url, alt: file.name.replace(/\.[^.]+$/, '') })
                      .run();
                  })
                  .catch(err => {
                    toast.error(`Lỗi tải ảnh: ${err.message}`, { id: toastId });
                  });
              }
              return true;
            }

            const html = clipboardData.getData('text/html');
            const text = clipboardData.getData('text/plain') || '';

            // 2. DETECT SINGLE IMAGE URL PASTED AS TEXT
            const trimmedText = text.trim();
            const isSingleImageUrl =
              /^https?:\/\/[^\s]+?\.(png|jpg|jpeg|gif|webp|svg)(\?[^\s]*)?$/i.test(trimmedText) ||
              (/^https?:\/\/[^\s]+(notion\.so|amazonaws\.com|s3\.)[^\s]+image[^\s]*/i.test(trimmedText) && !trimmedText.includes(' '));

            if (!html && isSingleImageUrl) {
              event.preventDefault();
              const toastId = toast.loading('Đang re-host ảnh sang bộ nhớ lưu trữ...');
              rehostExternalImage(trimmedText)
                .then(result => {
                  toast.success('Đã lưu trữ ảnh thành công!', { id: toastId });
                  editor.chain().focus().setImage({ src: result.url, alt: result.filename }).run();
                })
                .catch(() => {
                  // Fallback to inserting direct URL if rehost fails
                  toast.info('Chèn link ảnh trực tiếp.');
                  editor.chain().focus().setImage({ src: trimmedText }).run();
                });
              return true;
            }

            // 3. MARKDOWN PASTING (from ChatGPT, Notion, GitHub, Claude, etc.)
            // When there is NO rich HTML (or html is just plain text wrapped in <pre>)
            const isVsCodeHtml = html.includes('vscode-editor-data');
            if (!isVsCodeHtml && (!html || html.length < text.length * 1.2) && looksLikeMarkdown(text)) {
              try {
                const markdownManager = (editor as any).markdown || (editor.storage as any).markdown?.manager;
                if (markdownManager && typeof markdownManager.parse === 'function') {
                  const parsedJson = markdownManager.parse(text);
                  const transformed = transformMarkdownJson(parsedJson);

                  // Asynchronously scan for external images in transformed markdown to rehost them
                  rehostImagesInDoc(editor, transformed);

                  editor.chain().focus().insertContent(transformed).run();
                  event.preventDefault();
                  toast.success('Đã tự động nhận diện & chuyển đổi cú pháp Markdown!');
                  return true;
                }
              } catch (mdErr) {
                console.warn('Failed to parse Markdown via TipTap markdown manager:', mdErr);
              }
            }

            // 4. HTML PASTING (with embedded base64 images from Word/Google Docs or Notion external URLs)
            if (html && (html.includes('data:image/') || html.includes('<img'))) {
              // Let TipTap insert the HTML first, then immediately scan & re-host
              setTimeout(() => {
                scanAndRehostDocumentImages(editor);
              }, 100);
            }

            return false;
          },
        },
      }),
    ];
  },
});

/**
 * Scans an AST doc object for external image URLs and rehosts them
 */
function rehostImagesInDoc(editor: any, node: any) {
  if (!node) return;
  if (node.type === 'image' && node.attrs?.src) {
    const src = node.attrs.src;
    if (!isSelfHosted(src)) {
      rehostExternalImage(src)
        .then(result => {
          // Update all image nodes matching this old src in the active editor
          updateImageSrcInEditor(editor, src, result.url);
        })
        .catch(err => console.warn('Could not rehost image in doc:', err));
    }
  }

  if (Array.isArray(node.content)) {
    node.content.forEach((child: any) => rehostImagesInDoc(editor, child));
  }
}

/**
 * Scans the current editor document for data: URI or external image URLs and uploads/rehosts them
 */
export function scanAndRehostDocumentImages(editor: any) {
  const imagesToUpdate: Array<{ oldSrc: string; file?: File; isExternalUrl?: boolean }> = [];

  editor.state.doc.descendants((node: any) => {
    if (node.type.name === 'image' && node.attrs.src) {
      const src = node.attrs.src;
      if (src.startsWith('data:image/')) {
        try {
          const file = dataUriToFile(src);
          imagesToUpdate.push({ oldSrc: src, file });
        } catch {}
      } else if (!isSelfHosted(src) && src.startsWith('http')) {
        imagesToUpdate.push({ oldSrc: src, isExternalUrl: true });
      }
    }
  });

  if (imagesToUpdate.length === 0) return;

  const count = imagesToUpdate.length;
  const toastId = toast.loading(`Đang tải lên ${count} ảnh trong tài liệu...`);

  let completed = 0;
  imagesToUpdate.forEach(item => {
    const task = item.file ? uploadBlogImage(item.file) : rehostExternalImage(item.oldSrc);

    task
      .then(res => {
        updateImageSrcInEditor(editor, item.oldSrc, res.url);
        completed++;
        if (completed === count) {
          toast.success(`Đã lưu trữ ${count} ảnh vào hệ thống!`, { id: toastId });
        }
      })
      .catch(err => {
        console.warn('Rehost image error:', err);
        completed++;
        if (completed === count) {
          toast.info('Hoàn tất xử lý ảnh.', { id: toastId });
        }
      });
  });
}

/**
 * Updates all image nodes having `oldSrc` to `newSrc` in ProseMirror document
 */
function updateImageSrcInEditor(editor: any, oldSrc: string, newSrc: string) {
  const { tr } = editor.state;
  let modified = false;

  editor.state.doc.descendants((node: any, pos: number) => {
    if (node.type.name === 'image' && node.attrs.src === oldSrc) {
      tr.setNodeMarkup(pos, undefined, {
        ...node.attrs,
        src: newSrc,
      });
      modified = true;
    }
  });

  if (modified) {
    editor.view.dispatch(tr);
  }
}
