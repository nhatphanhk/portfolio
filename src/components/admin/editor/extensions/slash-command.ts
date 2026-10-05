import { Extension } from '@tiptap/core';
import Suggestion from '@tiptap/suggestion';
import { ReactRenderer } from '@tiptap/react';
import { SlashCommandMenu, type SlashCommandMenuRef } from './SlashCommandMenu';
import { SLASH_ITEMS, type SlashItem } from './slash-items';

interface SlashCommandOptions {
  onOpenImageModal?: () => void;
}

export const SlashCommand = Extension.create<SlashCommandOptions>({
  name: 'slashCommand',

  addOptions() {
    return {
      onOpenImageModal: undefined,
    };
  },

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        char: '/',
        startOfLine: false,

        items: ({ query }: { query: string }) => {
          const q = query.toLowerCase().trim();
          if (!q) return SLASH_ITEMS;

          return SLASH_ITEMS.filter(item => {
            if (item.title.toLowerCase().includes(q)) return true;
            if (item.description.toLowerCase().includes(q)) return true;
            return item.searchTerms.some(term => term.toLowerCase().includes(q));
          });
        },

        command: ({ editor, range, props }: { editor: any; range: any; props: SlashItem }) => {
          // Delete the slash trigger text
          editor.chain().focus().deleteRange(range).run();
          // Execute the selected item command
          props.command(editor, { onOpenImageModal: this.options.onOpenImageModal });
        },

        render: () => {
          let component: ReactRenderer<SlashCommandMenuRef> | null = null;
          let popupEl: HTMLDivElement | null = null;

          const updatePosition = (clientRect: (() => DOMRect | null) | null | undefined) => {
            if (!popupEl || !clientRect) return;
            const rect = clientRect();
            if (!rect) return;

            const top = rect.bottom + window.scrollY + 6;
            const left = Math.min(rect.left + window.scrollX, window.innerWidth - 340);

            popupEl.style.top = `${top}px`;
            popupEl.style.left = `${Math.max(16, left)}px`;
          };

          return {
            onStart: props => {
              component = new ReactRenderer(SlashCommandMenu, {
                props,
                editor: props.editor,
              });

              popupEl = document.createElement('div');
              popupEl.style.position = 'absolute';
              popupEl.style.zIndex = '9999';
              popupEl.appendChild(component.element);
              document.body.appendChild(popupEl);

              updatePosition(props.clientRect);
            },

            onUpdate: props => {
              component?.updateProps(props);
              updatePosition(props.clientRect);
            },

            onKeyDown: props => {
              if (props.event.key === 'Escape') {
                popupEl?.remove();
                component?.destroy();
                return true;
              }

              return component?.ref?.onKeyDown(props) ?? false;
            },

            onExit: () => {
              popupEl?.remove();
              component?.destroy();
              popupEl = null;
              component = null;
            },
          };
        },
      }),
    ];
  },
});
