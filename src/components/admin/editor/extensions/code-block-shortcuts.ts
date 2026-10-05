import { InputRule } from '@tiptap/core';
import type { NodeType } from '@tiptap/pm/model';

/** Short language aliases typed after ``` → lowlight language names. */
export const CODE_LANGUAGE_ALIASES: Record<string, string> = {
  ts: 'typescript',
  js: 'javascript',
  jsx: 'javascript',
  py: 'python',
  sh: 'bash',
  shell: 'bash',
  zsh: 'bash',
  yml: 'yaml',
  md: 'markdown',
  rs: 'rust',
  rb: 'ruby',
  cs: 'csharp',
  'c#': 'csharp',
  'c++': 'cpp',
  docker: 'dockerfile',
  golang: 'go',
  text: '',
  txt: '',
  plain: '',
  // Mermaid aliases (kept consistent with markdown-transform.ts)
  uml: 'mermaid',
  flowchart: 'mermaid',
  sequence: 'mermaid',
};

export function normalizeCodeLanguage(raw?: string | null): string {
  const lang = (raw || '').trim().toLowerCase();
  return lang in CODE_LANGUAGE_ALIASES ? CODE_LANGUAGE_ALIASES[lang] : lang;
}

export const MERMAID_STARTER = `graph TD
    A[Bắt đầu] --> B{Điều kiện}
    B -->|Đúng| C[Xử lý]
    B -->|Sai| D[Kết thúc]
    C --> D`;

/** ```lang + Space/Enter, or ~~~lang + Space/Enter */
const backtickRegex = /^```([a-zA-Z0-9+#-]*)[\s\n]$/;
const tildeRegex = /^~~~([a-zA-Z0-9+#-]*)[\s\n]$/;

function codeBlockRule(find: RegExp, type: NodeType) {
  return new InputRule({
    find,
    handler: ({ state, range, match }) => {
      const language = normalizeCodeLanguage(match[1]);
      const $start = state.doc.resolve(range.from);
      if (!$start.node(-1).canReplaceWith($start.index(-1), $start.indexAfter(-1), type)) {
        return null;
      }
      const tr = state.tr.delete(range.from, range.to).setBlockType(range.from, range.from, type, { language });
      // Mermaid: drop a starter diagram so the live preview renders immediately.
      if (language === 'mermaid') {
        tr.insertText(MERMAID_STARTER, range.from);
      }
    },
  });
}

export function codeBlockInputRules(type: NodeType) {
  return [codeBlockRule(backtickRegex, type), codeBlockRule(tildeRegex, type)];
}
