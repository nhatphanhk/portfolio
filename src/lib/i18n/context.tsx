'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { en, type TranslationDict } from './locales/en';
import { vi } from './locales/vi';

export type Locale = 'en' | 'vi';

const translations: Record<Locale, TranslationDict> = { en, vi };

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
  t: (path: string) => string;
  isVi: boolean;
  isEn: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = 'portfolio_locale';
const COOKIE_NAME = 'NEXT_LOCALE';

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en');

  useEffect(() => {
    // 1. Read from localStorage or cookie
    const stored = (typeof window !== 'undefined' && localStorage.getItem(STORAGE_KEY)) as Locale | null;
    if (stored === 'en' || stored === 'vi') {
      setLocaleState(stored);
    } else {
      // Check browser language
      const browserLang = navigator.language?.toLowerCase();
      if (browserLang?.startsWith('vi')) {
        setLocaleState('vi');
      }
    }
  }, []);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, newLocale);
      document.cookie = `${COOKIE_NAME}=${newLocale}; path=/; max-age=31536000; SameSite=Lax`;
    }
  }, []);

  const toggleLocale = useCallback(() => {
    setLocale(locale === 'en' ? 'vi' : 'en');
  }, [locale, setLocale]);

  const t = useCallback(
    (path: string): string => {
      const activeDict = translations[locale] || translations.en;
      const parts = path.split('.');
      let current: unknown = activeDict;

      for (const part of parts) {
        if (current && typeof current === 'object' && part in current) {
          current = (current as Record<string, unknown>)[part];
        } else {
          // Fallback to English
          let fallback: unknown = translations.en;
          for (const fallbackPart of parts) {
            if (fallback && typeof fallback === 'object' && fallbackPart in fallback) {
              fallback = (fallback as Record<string, unknown>)[fallbackPart];
            } else {
              return path;
            }
          }
          return typeof fallback === 'string' ? fallback : path;
        }
      }

      return typeof current === 'string' ? current : path;
    },
    [locale]
  );

  return (
    <LanguageContext.Provider
      value={{
        locale,
        setLocale,
        toggleLocale,
        t,
        isVi: locale === 'vi',
        isEn: locale === 'en',
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
