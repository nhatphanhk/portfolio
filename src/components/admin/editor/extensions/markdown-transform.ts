import type { JSONContent } from '@tiptap/core';

/**
 * Checks if a plain text string looks like Markdown rather than regular plain text.
 */
export function looksLikeMarkdown(text: string): boolean {
  if (!text || text.length < 3) return false;

  // Check for common markdown syntax patterns
  const markdownPatterns = [
    /^#{1,6}\s+\S+/m,               // Headers: # H1, ## H2
    /^```[\s\S]*?```/m,             // Fenced code blocks
    /^\s*[-*+]\s+\S+/m,             // Bullet lists
    /^\s*\d+\.\s+\S+/m,             // Numbered lists
    /^\s*>\s+\S+/m,                 // Blockquotes / Alerts
    /\*\*[^*]+\*\*/,                // Bold **text**
    /\[.+\]\((?:https?:\/\/|\/|\.)/, // Links [text](url)
    /^\s*\|.+?\|.+?\|\s*$/m,        // Tables | a | b |
    /\$\$[\s\S]+?\$\$/,             // Block Math $$ ... $$
    /\$[^\$\n]+\$/,                 // Inline Math $ ... $
  ];

  return markdownPatterns.some(pattern => pattern.test(text));
}

/**
 * Transforms ProseMirror / TipTap JSON AST:
 * 1. Converts GitHub alerts (`> [!NOTE]`, `> [!TIP]`, `> [!WARNING]`, etc.) into `callout` nodes.
 * 2. Normalizes Mermaid code blocks.
 */
export function transformMarkdownJson(content: JSONContent): JSONContent {
  if (!content) return content;

  // Process array of content
  if (content.content && Array.isArray(content.content)) {
    const transformedChildren: JSONContent[] = [];

    for (const child of content.content) {
      // Check if child is a blockquote containing an alert pattern
      if (child.type === 'blockquote' && child.content && child.content.length > 0) {
        const firstParagraph = child.content[0];
        if (firstParagraph.type === 'paragraph' && firstParagraph.content && firstParagraph.content.length > 0) {
          const firstTextNode = firstParagraph.content[0];
          if (firstTextNode.type === 'text' && typeof firstTextNode.text === 'string') {
            const alertMatch = firstTextNode.text.match(/^\[!(NOTE|TIP|WARNING|CAUTION|IMPORTANT|DANGER)\]\s*/i);
            if (alertMatch) {
              const alertKeyword = alertMatch[1].toUpperCase();
              let calloutType: 'note' | 'tip' | 'warning' | 'danger' = 'note';
              if (alertKeyword === 'TIP') calloutType = 'tip';
              else if (alertKeyword === 'WARNING') calloutType = 'warning';
              else if (alertKeyword === 'CAUTION' || alertKeyword === 'DANGER') calloutType = 'danger';
              else if (alertKeyword === 'IMPORTANT') calloutType = 'tip';

              // Remove the alert keyword prefix from text
              const remainingText = firstTextNode.text.slice(alertMatch[0].length);
              const newParagraphContent = [...firstParagraph.content];
              if (remainingText.length > 0) {
                newParagraphContent[0] = { ...firstTextNode, text: remainingText };
              } else {
                newParagraphContent.shift(); // remove empty leading text node
              }

              const newChildContent = [...child.content];
              if (newParagraphContent.length > 0) {
                newChildContent[0] = { ...firstParagraph, content: newParagraphContent };
              } else {
                newChildContent.shift(); // remove empty first paragraph if nothing left
              }

              transformedChildren.push({
                type: 'callout',
                attrs: { type: calloutType },
                content: newChildContent.length > 0 ? newChildContent.map(transformMarkdownJson) : [{ type: 'paragraph' }],
              });
              continue;
            }
          }
        }
      }

      // Check codeblock language
      if (child.type === 'codeBlock') {
        const lang = (child.attrs?.language as string || '').toLowerCase();
        if (lang === 'uml' || lang === 'flowchart' || lang === 'sequence') {
          transformedChildren.push({
            ...child,
            attrs: { ...child.attrs, language: 'mermaid' },
          });
          continue;
        }
      }

      // Recurse into child
      transformedChildren.push(transformMarkdownJson(child));
    }

    return {
      ...content,
      content: transformedChildren,
    };
  }

  return content;
}
