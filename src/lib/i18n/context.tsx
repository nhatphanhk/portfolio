'use client';

import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { en, type TranslationDict } from './locales/en';
import { vi } from './locales/vi';

export type Locale = 'en' | 'vi';

const translations: Record<Locale, TranslationDict> = { en, vi };

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
  t: ((path: string) => string) & TranslationDict;
  dict: TranslationDict;
  isVi: boolean;
  isEn: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const COOKIE_NAME = 'NEXT_LOCALE';

/**
 * The NEXT_LOCALE cookie is the single source of truth for the active language.
 * The server reads it (or Accept-Language on a first visit) in `getServerLocale()` and
 * passes the result in as `initialLocale`, so server and client always render the same
 * language and there is no post-hydration flash.
 */
export function LanguageProvider({
  children,
  initialLocale = 'en',
}: {
  children: React.ReactNode;
  initialLocale?: Locale;
}) {
  const router = useRouter();
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  const setLocale = useCallback(
    (newLocale: Locale) => {
      setLocaleState(newLocale);
      if (typeof window === 'undefined') return;
      document.cookie = `${COOKIE_NAME}=${newLocale}; path=/; max-age=31536000; SameSite=Lax`;
      document.documentElement.lang = newLocale;
      // Server-rendered, localized data (project titles, series, profile, metadata) must be
      // re-fetched for the new cookie value; client dictionaries switch immediately above.
      router.refresh();
    },
    [router]
  );

  const toggleLocale = useCallback(() => {
    setLocale(locale === 'en' ? 'vi' : 'en');
  }, [locale, setLocale]);

  const activeDict = translations[locale] || translations.en;

  const t = useMemo(() => {
    const fn = (path: string): string => {
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
    };

    return Object.assign(fn, activeDict) as ((path: string) => string) & TranslationDict;
  }, [activeDict]);

  return (
    <LanguageContext.Provider
      value={{
        locale,
        setLocale,
        toggleLocale,
        t,
        dict: activeDict,
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
