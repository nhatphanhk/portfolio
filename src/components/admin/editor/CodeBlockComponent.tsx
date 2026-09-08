'use client';

import { NodeViewWrapper, NodeViewContent, type NodeViewProps } from '@tiptap/react';
import { useState, useCallback } from 'react';
import { Check, Copy, ChevronDown } from 'lucide-react';

const LANGUAGES = [
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

export function CodeBlockComponent({ node, updateAttributes, extension }: NodeViewProps) {
  const language = node.attrs.language as string || '';
  const [copied, setCopied] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const copyCode = useCallback(() => {
    const code = node.textContent;
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [node.textContent]);

  const selectedLabel = LANGUAGES.find(l => l.value === language)?.label ?? 'Plain Text';

  return (
    <NodeViewWrapper className="relative group my-4">
      {/* Header bar */}
      <div className="flex items-center justify-between bg-zinc-800 dark:bg-zinc-900 px-3 py-1.5 rounded-t-md border border-b-0 border-zinc-700">
        {/* Language selector */}
        <div className="relative">
          <button
            type="button"
            contentEditable={false}
            onClick={() => setDropdownOpen(v => !v)}
            className="flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-200 transition-colors font-mono"
          >
            {selectedLabel}
            <ChevronDown className="w-3 h-3" />
          </button>
          {dropdownOpen && (
            <div
              contentEditable={false}
              className="absolute top-full left-0 mt-1 z-50 w-44 bg-zinc-800 border border-zinc-700 rounded-md shadow-xl overflow-y-auto max-h-60"
            >
              {LANGUAGES.map(lang => (
                <button
                  key={lang.value}
                  type="button"
                  onClick={() => {
                    updateAttributes({ language: lang.value });
                    setDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 text-xs hover:bg-zinc-700 transition-colors font-mono ${
                    lang.value === language ? 'text-blue-400' : 'text-zinc-300'
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Copy button */}
        <button
          type="button"
          contentEditable={false}
          onClick={copyCode}
          className="flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
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

      {/* Code content */}
      <pre className="rounded-b-md rounded-t-none overflow-x-auto !mt-0 border border-zinc-700 border-t-0">
        <NodeViewContent as="div" className={language ? `language-${language} hljs` : 'hljs'} />
      </pre>
    </NodeViewWrapper>
  );
}
