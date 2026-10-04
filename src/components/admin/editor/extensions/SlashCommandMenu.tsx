'use client';

import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import type { SlashItem } from './slash-items';

interface SlashCommandMenuProps {
  items: SlashItem[];
  command: (item: SlashItem) => void;
}

export interface SlashCommandMenuRef {
  onKeyDown: (props: { event: KeyboardEvent }) => boolean;
}

export const SlashCommandMenu = forwardRef<SlashCommandMenuRef, SlashCommandMenuProps>(
  ({ items, command }, ref) => {
    const [selectedIndex, setSelectedIndex] = useState(0);

    useEffect(() => {
      setSelectedIndex(0);
    }, [items]);

    const selectItem = (index: number) => {
      const item = items[index];
      if (item) {
        command(item);
      }
    };

    useImperativeHandle(ref, () => ({
      onKeyDown: ({ event }) => {
        if (event.key === 'ArrowUp') {
          setSelectedIndex(prev => (prev + items.length - 1) % items.length);
          return true;
        }

        if (event.key === 'ArrowDown') {
          setSelectedIndex(prev => (prev + 1) % items.length);
          return true;
        }

        if (event.key === 'Enter') {
          selectItem(selectedIndex);
          return true;
        }

        return false;
      },
    }));

    if (items.length === 0) {
      return (
        <div className="z-50 w-72 rounded-xl border border-border bg-card/95 backdrop-blur-md shadow-2xl p-3 text-center text-xs text-muted-foreground animate-in fade-in zoom-in-95 duration-100">
          Không tìm thấy khối phù hợp
        </div>
      );
    }

    return (
      <div className="z-50 w-80 max-h-80 overflow-y-auto rounded-xl border border-border bg-card/95 backdrop-blur-md shadow-2xl p-1.5 space-y-0.5 animate-in fade-in zoom-in-95 duration-100">
        <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">
          Khối nội dung & công cụ
        </div>
        {items.map((item, index) => {
          const Icon = item.icon;
          const isSelected = index === selectedIndex;

          return (
            <button
              key={item.title}
              type="button"
              onClick={() => selectItem(index)}
              onMouseEnter={() => setSelectedIndex(index)}
              className={`w-full flex items-center gap-3 px-2.5 py-2 rounded-lg text-left transition-all cursor-pointer ${
                isSelected
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'text-foreground hover:bg-muted/80'
              }`}
            >
              <div
                className={`p-1.5 rounded-md ${
                  isSelected ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-muted text-muted-foreground'
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold truncate leading-tight">{item.title}</p>
                <p
                  className={`text-[11px] truncate leading-tight mt-0.5 ${
                    isSelected ? 'text-primary-foreground/80' : 'text-muted-foreground'
                  }`}
                >
                  {item.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    );
  }
);

SlashCommandMenu.displayName = 'SlashCommandMenu';
