'use client';

import { NodeViewWrapper, NodeViewContent, type NodeViewProps } from '@tiptap/react';
import { useState, useCallback, useEffect, useRef } from 'react';
import { Check, Copy, ChevronDown, Eye, Code, Columns, Loader2, AlertCircle } from 'lucide-react';
import { renderMermaid } from '@/lib/rich-content';

const LANGUAGES = [
  { label: 'Mermaid Diagram', value: 'mermaid' },
  { label: 'Plain Text', value: '' },
  { label: 'TypeScript', value: 'typescript' },
  { label: 'JavaScript', value: 'javascript' },
  { label: 'TSX / JSX', value: 'tsx' },
  { label: 'HTML', value: 'html' },
  { label: 'CSS', value: 'css' },
  { label: 'Python', value: 'python' },
  { label: 'Bash / Shell', value: 'bash' },
  { label: 'SQL', value: 'sql' },
  { label: 'JSON', value: 'json' },
  { label: 'YAML', value: 'yaml' },
  { label: 'Markdown', value: 'markdown' },
  { label: 'Go', value: 'go' },
  { label: 'Rust', value: 'rust' },
  { label: 'Java', value: 'java' },
  { label: 'C / C++', value: 'cpp' },
  { label: 'C#', value: 'csharp' },
  { label: 'PHP', value: 'php' },
  { label: 'Ruby', value: 'ruby' },
  { label: 'Docker', value: 'dockerfile' },
];

export function CodeBlockComponent({ node, updateAttributes }: NodeViewProps) {
  const language = (node.attrs.language as string) || '';
  const isMermaid = language === 'mermaid';

  const [copied, setCopied] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mermaidMode, setMermaidMode] = useState<'both' | 'code' | 'preview'>('both');
  const [mermaidSvg, setMermaidSvg] = useState<string>('');
  const [mermaidError, setMermaidError] = useState<string | null>(null);
  const [isRenderingMermaid, setIsRenderingMermaid] = useState(false);

  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const copyCode = useCallback(() => {
    const code = node.textContent;
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [node.textContent]);

  const selectedLabel = LANGUAGES.find(l => l.value === language)?.label ?? 'Plain Text';

  // Live render Mermaid preview
  useEffect(() => {
    if (!isMermaid) return;

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    const code = node.textContent.trim();
    if (!code) {
      setMermaidSvg('');
      setMermaidError(null);
      return;
    }

    debounceTimerRef.current = setTimeout(async () => {
      setIsRenderingMermaid(true);
      try {
        const isDark = document.documentElement.classList.contains('dark');
        const svg = await renderMermaid(code, isDark);
        setMermaidSvg(svg);
        setMermaidError(null);
      } catch (err: any) {
        setMermaidError(err?.message || 'Lỗi cú pháp Mermaid');
      } finally {
        setIsRenderingMermaid(false);
      }
    }, 400);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [node.textContent, isMermaid]);

  return (
    <NodeViewWrapper className="relative group my-4">
      {/* Header bar */}
      <div className="flex items-center justify-between bg-zinc-800 dark:bg-zinc-900 px-3 py-1.5 rounded-t-md border border-b-0 border-zinc-700">
        {/* Left: Language selector */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              type="button"
              contentEditable={false}
              onClick={() => setDropdownOpen(v => !v)}
              className="flex items-center gap-1 text-xs text-zinc-300 hover:text-white transition-colors font-mono font-medium"
            >
              <span className={isMermaid ? 'text-cyan-400 font-bold' : ''}>{selectedLabel}</span>
              <ChevronDown className="w-3 h-3 text-zinc-400" />
            </button>
            {dropdownOpen && (
              <div
                contentEditable={false}
                className="absolute top-full left-0 mt-1 z-50 w-48 bg-zinc-800 border border-zinc-700 rounded-md shadow-xl overflow-y-auto max-h-60 p-1"
              >
                {LANGUAGES.map(lang => (
                  <button
                    key={lang.value}
                    type="button"
                    onClick={() => {
                      updateAttributes({ language: lang.value });
                      setDropdownOpen(false);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 text-xs rounded hover:bg-zinc-700 transition-colors font-mono ${
                      lang.value === language ? 'text-cyan-400 font-bold bg-zinc-700/50' : 'text-zinc-300'
                    }`}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Mermaid view toggles */}
          {isMermaid && (
            <div className="flex items-center gap-0.5 ml-2 pl-2 border-l border-zinc-700" contentEditable={false}>
              <button
                type="button"
                onClick={() => setMermaidMode('both')}
                title="Split: Code + Sơ đồ"
                className={`p-1 rounded text-xs transition-colors ${
                  mermaidMode === 'both' ? 'bg-cyan-500/20 text-cyan-400 font-bold' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Columns className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setMermaidMode('code')}
                title="Chỉ xem Code"
                className={`p-1 rounded text-xs transition-colors ${
                  mermaidMode === 'code' ? 'bg-cyan-500/20 text-cyan-400 font-bold' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Code className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setMermaidMode('preview')}
                title="Chỉ xem Sơ đồ"
                className={`p-1 rounded text-xs transition-colors ${
                  mermaidMode === 'preview' ? 'bg-cyan-500/20 text-cyan-400 font-bold' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2" contentEditable={false}>
          {isMermaid && isRenderingMermaid && (
            <span className="flex items-center gap-1 text-[11px] text-cyan-400 animate-pulse">
              <Loader2 className="w-3 h-3 animate-spin" />
              <span>Rendering…</span>
            </span>
          )}

          <button
            type="button"
            onClick={copyCode}
            className="flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-green-400" />
                <span className="text-green-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Code Editor */}
      {(!isMermaid || mermaidMode !== 'preview') && (
        <pre
          className={`rounded-b-md rounded-t-none overflow-x-auto !mt-0 border border-zinc-700 border-t-0 font-mono text-sm leading-relaxed ${
            isMermaid && mermaidMode === 'both' ? 'rounded-b-none border-b-zinc-700' : ''
          }`}
        >
          <NodeViewContent as="div" className={language ? `language-${language} hljs` : 'hljs'} />
        </pre>
      )}

      {/* Mermaid Live Diagram Preview Box */}
      {isMermaid && mermaidMode !== 'code' && (
        <div
          contentEditable={false}
          className={`p-4 bg-card border border-zinc-700 ${
            mermaidMode === 'preview' ? 'rounded-b-md border-t-0' : 'rounded-b-md border-t border-t-zinc-700'
          }`}
        >
          {mermaidError ? (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-xs text-destructive flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold mb-0.5">Lỗi cú pháp Mermaid</p>
                <p className="font-mono text-[11px] opacity-90">{mermaidError}</p>
              </div>
            </div>
          ) : mermaidSvg ? (
            <div
              className="flex justify-center items-center overflow-x-auto p-2"
              dangerouslySetInnerHTML={{ __html: mermaidSvg }}
            />
          ) : (
            <p className="text-xs text-muted-foreground text-center py-2">
              Nhập mã Mermaid để xem sơ đồ trực quan…
            </p>
          )}
        </div>
      )}
    </NodeViewWrapper>
  );
}
