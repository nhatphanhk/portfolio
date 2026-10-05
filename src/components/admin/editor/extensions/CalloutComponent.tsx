'use client';

import { NodeViewWrapper, NodeViewContent, type NodeViewProps } from '@tiptap/react';
import { Info, Lightbulb, AlertTriangle, AlertOctagon, ChevronDown } from 'lucide-react';
import { useState } from 'react';

const VARIANTS = [
  { value: 'note', label: 'Note', icon: Info, color: 'text-blue-500 border-blue-500/30 bg-blue-500/10' },
  { value: 'tip', label: 'Tip', icon: Lightbulb, color: 'text-emerald-500 border-emerald-500/30 bg-emerald-500/10' },
  { value: 'warning', label: 'Warning', icon: AlertTriangle, color: 'text-amber-500 border-amber-500/30 bg-amber-500/10' },
  { value: 'danger', label: 'Danger', icon: AlertOctagon, color: 'text-rose-500 border-rose-500/30 bg-rose-500/10' },
];

export function CalloutComponent({ node, updateAttributes }: NodeViewProps) {
  const currentVariant = node.attrs.type || 'note';
  const variantObj = VARIANTS.find(v => v.value === currentVariant) || VARIANTS[0];
  const Icon = variantObj.icon;
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <NodeViewWrapper className={`relative my-4 rounded-xl border p-4 transition-all ${variantObj.color}`}>
      <div className="flex items-center justify-between mb-2 select-none" contentEditable={false}>
        <div className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen(v => !v)}
            className="flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-semibold hover:bg-black/10 dark:hover:bg-white/10 transition-colors cursor-pointer"
          >
            <Icon className="w-4 h-4" />
            <span>{variantObj.label}</span>
            <ChevronDown className="w-3 h-3 opacity-60" />
          </button>

          {menuOpen && (
            <div className="absolute top-full left-0 mt-1 z-30 w-32 rounded-lg border border-border bg-card shadow-lg p-1 space-y-0.5">
              {VARIANTS.map(v => {
                const ItemIcon = v.icon;
                return (
                  <button
                    key={v.value}
                    type="button"
                    onClick={() => {
                      updateAttributes({ type: v.value });
                      setMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-2 px-2 py-1.5 text-xs rounded-md transition-colors text-left ${
                      v.value === currentVariant
                        ? 'bg-primary/10 text-primary font-bold'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                  >
                    <ItemIcon className="w-3.5 h-3.5" />
                    <span>{v.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="callout-content text-foreground/90 text-sm">
        <NodeViewContent />
      </div>
    </NodeViewWrapper>
  );
}
