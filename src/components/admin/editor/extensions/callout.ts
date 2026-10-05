import { Node, mergeAttributes, InputRule } from '@tiptap/core';
import { findWrapping } from '@tiptap/pm/transform';
import type { NodeType } from '@tiptap/pm/model';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { CalloutComponent } from './CalloutComponent';

export type CalloutType = 'note' | 'tip' | 'warning' | 'danger';

/**
 * Map Markdown/GitHub alert keywords to the 4 supported callout variants.
 * Kept consistent with markdown-transform.ts (paste/import of Markdown).
 */
export function normalizeCalloutType(keyword: string): CalloutType {
  switch (keyword.toUpperCase()) {
    case 'TIP':
    case 'IMPORTANT':
      return 'tip';
    case 'WARNING':
      return 'warning';
    case 'CAUTION':
    case 'DANGER':
      return 'danger';
    default:
      return 'note'; // NOTE, INFO
  }
}

const KEYWORDS = 'NOTE|INFO|TIP|IMPORTANT|WARNING|CAUTION|DANGER';

/** `> [!NOTE] ` or `[!NOTE] ` (after `> ` already became a blockquote) */
const githubAlertRegex = new RegExp(`^(?:>\\s?)?\\[!(${KEYWORDS})\\]\\s$`, 'i');
/** `:::note ` directive syntax */
const directiveRegex = new RegExp(`^:::(${KEYWORDS})\\s$`, 'i');

function calloutInputRule(find: RegExp, type: NodeType) {
  return new InputRule({
    find,
    handler: ({ state, range, match }) => {
      const attrs = { type: normalizeCalloutType(match[1]) };
      const tr = state.tr.delete(range.from, range.to);
      const $from = tr.doc.resolve(range.from);

      // Already inside a blockquote (user typed `> ` first): convert it to a callout.
      if ($from.depth >= 2 && $from.node($from.depth - 1).type.name === 'blockquote') {
        tr.setNodeMarkup($from.before($from.depth - 1), type, attrs);
        return;
      }

      const blockRange = $from.blockRange();
      const wrapping = blockRange && findWrapping(blockRange, type, attrs);
      if (!blockRange || !wrapping) return null;
      tr.wrap(blockRange, wrapping);
    },
  });
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    callout: {
      setCallout: (attributes?: { type?: 'note' | 'tip' | 'warning' | 'danger' }) => ReturnType;
      toggleCallout: (attributes?: { type?: 'note' | 'tip' | 'warning' | 'danger' }) => ReturnType;
    };
  }
}

export const Callout = Node.create({
  name: 'callout',
  group: 'block',
  content: 'block+',
  defining: true,

  addAttributes() {
    return {
      type: {
        default: 'note',
        parseHTML: element => element.getAttribute('data-callout') || 'note',
        renderHTML: attributes => ({
          'data-callout': attributes.type || 'note',
        }),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-callout]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const type = HTMLAttributes['data-callout'] || 'note';
    return [
      'div',
      mergeAttributes(HTMLAttributes, {
        class: `callout callout-${type}`,
      }),
      0,
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(CalloutComponent);
  },

  addInputRules() {
    return [calloutInputRule(githubAlertRegex, this.type), calloutInputRule(directiveRegex, this.type)];
  },

  addCommands() {
    return {
      setCallout:
        attributes =>
        ({ commands }) => {
          return commands.wrapIn(this.name, attributes);
        },
      toggleCallout:
        attributes =>
        ({ commands }) => {
          return commands.toggleWrap(this.name, attributes);
        },
    };
  },
});
