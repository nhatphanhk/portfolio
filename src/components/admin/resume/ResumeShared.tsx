import React from 'react';
import { Loader2, Save, X, Plus, Trash2, CheckCircle2 } from 'lucide-react';

export function Field({
  label,
  children,
  className = '',
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
        {label}
      </label>
      {children}
    </div>
  );
}

export function Input({
  value,
  onChange,
  placeholder,
  type = 'text',
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  disabled?: boolean;
}) {
  return (
    <input
      type={type}
      value={value ?? ''}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground shadow-xs hover:border-foreground/30 focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary disabled:opacity-50 transition"
    />
  );
}

export function Textarea({
  value,
  onChange,
  placeholder,
  rows = 3,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <textarea
      rows={rows}
      value={value ?? ''}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground shadow-xs hover:border-foreground/30 focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary resize-y transition"
    />
  );
}

export function Select({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-card text-foreground shadow-xs hover:border-foreground/30 focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary transition"
    >
      <option value="">— Select —</option>
      {options.map(o => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  );
}

export function SaveBtn({
  onClick,
  pending,
  label = 'Save',
}: {
  onClick: () => void;
  pending: boolean;
  label?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-primary text-primary-foreground rounded-lg text-xs font-semibold hover:opacity-90 disabled:opacity-50 transition shadow-xs"
    >
      {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
      {label}
    </button>
  );
}

export function CancelBtn({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-border rounded-lg text-xs font-medium hover:bg-muted transition"
    >
      <X className="h-3 w-3" />
      Cancel
    </button>
  );
}

export function AddBtn({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-2 px-4 py-2.5 border border-dashed border-primary/40 rounded-xl text-sm font-medium text-primary hover:bg-primary/5 transition w-full justify-center"
    >
      <Plus className="h-4 w-4" />
      {label}
    </button>
  );
}

export function DeleteBtn({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition"
      title="Delete"
    >
      <Trash2 className="h-3.5 w-3.5" />
    </button>
  );
}

export function SavedBadge({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <span className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400 font-medium animate-in fade-in">
      <CheckCircle2 className="h-3.5 w-3.5" />
      Saved!
    </span>
  );
}

export function SectionCard({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`p-6 rounded-2xl border border-border bg-card shadow-xs space-y-4 ${className}`}>
      {children}
    </div>
  );
}

export function fmtDate(d: Date | null) {
  if (!d) return '';
  const dt = new Date(d);
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}`;
}

export function dateToInput(d: Date | null | undefined) {
  if (!d) return '';
  return fmtDate(d);
}

export const CATEGORY_LABELS: Record<string, string> = {
  LANGUAGE: 'Programming Languages',
  FRAMEWORK: 'Frameworks / Libraries',
  FRONTEND: 'Frontend',
  BACKEND: 'Backend',
  DATABASE: 'Databases',
  CLOUD: 'Cloud Platforms',
  DEVOPS: 'DevOps & CI/CD',
  IAC: 'Infrastructure as Code',
  MONITORING: 'Monitoring & Logging',
  VERSION_CONTROL: 'Version Control',
  TOOLS: 'Tools & Technologies',
  OTHER: 'Other',
};
