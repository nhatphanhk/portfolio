'use client';

import React from 'react';
import { useLanguage } from '@/lib/i18n/context';

interface LanguageToggleProps {
  className?: string;
  isDarkHero?: boolean;
}

export function LanguageToggle({ className = '', isDarkHero = false }: LanguageToggleProps) {
  const { locale, setLocale } = useLanguage();

  return (
    <div
      className={`inline-flex items-center p-0.5 rounded-full border transition-all duration-200 text-xs font-bold ${
        isDarkHero
          ? 'bg-white/10 border-white/20 text-white shadow-xs'
          : 'bg-muted/80 border-border/80 text-foreground shadow-2xs'
      } ${className}`}
      role="group"
      aria-label="Language selection"
    >
      <button
        type="button"
        onClick={() => setLocale('vi')}
        className={`flex items-center gap-1 px-2.5 py-1 rounded-full transition-all duration-200 cursor-pointer ${
          locale === 'vi'
            ? isDarkHero
              ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-sm font-black scale-105'
              : 'bg-primary text-primary-foreground shadow-xs font-black scale-105'
            : isDarkHero
            ? 'text-white/70 hover:text-white'
            : 'text-muted-foreground hover:text-foreground'
        }`}
        aria-pressed={locale === 'vi'}
      >
        <span className="text-xs">🇻🇳</span>
        <span>VI</span>
      </button>

      <button
        type="button"
        onClick={() => setLocale('en')}
        className={`flex items-center gap-1 px-2.5 py-1 rounded-full transition-all duration-200 cursor-pointer ${
          locale === 'en'
            ? isDarkHero
              ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-sm font-black scale-105'
              : 'bg-primary text-primary-foreground shadow-xs font-black scale-105'
            : isDarkHero
            ? 'text-white/70 hover:text-white'
            : 'text-muted-foreground hover:text-foreground'
        }`}
        aria-pressed={locale === 'en'}
      >
        <span className="text-xs">🇬🇧</span>
        <span>EN</span>
      </button>
    </div>
  );
}
