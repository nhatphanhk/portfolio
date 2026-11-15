'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Menu,
  X,
  FileText,
  BookOpen,
  Briefcase,
  Cpu,
  Award,
  Mail,
  Sparkles,
  Layers,
} from 'lucide-react';
import { NAV_LINKS } from '@/lib/constants';
import { useLanguage } from '@/lib/i18n/context';
import { LanguageToggle } from '@/components/ui/LanguageToggle';

const NAV_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Resume: FileText,
  Blog: BookOpen,
  Blogs: BookOpen,
  Series: Layers,
  Projects: Briefcase,
  Skills: Cpu,
  Certifications: Award,
  Contact: Mail,
};

/**
 * Site-wide navigation header with edge-to-edge full-width bar,
 * scroll-aware transparency, eye-catching logo, and clean navigation links.
 */
const Header = () => {
  const pathname = usePathname();
  const { t } = useLanguage();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const getNavLabel = (name: string): string => {
    switch (name) {
      case 'Resume': return t('nav.resume');
      case 'Blogs':
      case 'Blog': return t('nav.blogs');
      case 'Series': return t('nav.series');
      case 'Projects': return t('nav.projects');
      case 'Skills': return t('nav.skills');
      case 'Certifications': return t('nav.certifications');
      case 'Contact': return t('nav.contact');
      default: return name;
    }
  };

  const isHome = pathname === '/';
  const isDarkHero = isHome && !isScrolled;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY >= 80);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Close mobile menu on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const isItemActive = (href: string) => {
    if (href === '/blog') {
      return (
        pathname === '/blog' ||
        (pathname.startsWith('/blog/') && !pathname.startsWith('/blog/series'))
      );
    }
    if (href === '/blog/series') {
      return pathname.startsWith('/blog/series');
    }
    return pathname === href || (href !== '/' && pathname.startsWith(href));
  };

  const headerContent = (
    <>
      {/* Mobile Drawer Backdrop Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm xl:hidden transition-opacity duration-300"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out ${
          isDarkHero
            ? 'bg-transparent'
            : 'backdrop-blur-md border-b border-border/80 shadow-sm'
        }`}
        style={
          isDarkHero
            ? {}
            : {
                background: 'oklch(0.98 0.01 85 / 93%)',
                borderColor: 'oklch(0.88 0.03 80 / 80%)',
              }
        }
      >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 min-w-0">
          {/* ── Brand Logo & Eye-Catching Name ── */}
          <Link
            href="/"
            className="group flex items-center gap-3 transition-all duration-300 hover:scale-105 shrink-0"
            aria-label="nhatphanhk102 — Home"
          >
            {/* Glowing Luxury Logo Badge */}
            <div className="relative flex items-center justify-center">
              <div
                className="absolute inset-0 rounded-full blur-[6px] opacity-70 group-hover:opacity-100 transition-opacity duration-300"
                style={{
                  background: 'linear-gradient(135deg, oklch(0.85 0.22 84), oklch(0.68 0.24 74))',
                }}
              />
              <div
                className="relative w-9 h-9 rounded-full flex items-center justify-center overflow-hidden border border-amber-300/40 transition-transform duration-300 shadow-md group-hover:scale-105 bg-[#ece5dc]"
                style={{
                  boxShadow: '0 2px 14px rgba(234, 179, 8, 0.45), inset 0 1px 1px rgba(255, 255, 255, 0.6)',
                }}
              >
                <Image
                  src="/icon.png"
                  alt="nhatphanhk102 logo"
                  width={36}
                  height={36}
                  className="w-full h-full object-cover"
                  priority
                />
              </div>
            </div>

            {/* Eye-Catching Name Typography */}
            <div className="flex items-center gap-1.5">
              <span
                className={`text-lg font-black tracking-tight transition-colors ${isDarkHero ? 'text-white' : 'text-slate-900'
                  }`}
                style={{
                  textShadow: isDarkHero
                    ? '0 2px 16px rgba(0,0,0,0.8), 0 0 20px rgba(251,191,36,0.2)'
                    : 'none',
                }}
              >
                nhatphan
              </span>
              <span className="text-lg font-black tracking-tight text-gold-shimmer">
                hk102
              </span>
              <span
                className="w-2 h-2 rounded-full animate-pulse inline-block"
                style={{
                  background: 'radial-gradient(circle, #fde047 0%, #eab308 100%)',
                  boxShadow: '0 0 10px #fbbf24, 0 0 18px rgba(245, 158, 11, 0.6)',
                }}
              />
            </div>
          </Link>

          {/* ── Navigation Links (Open & Seamless) ── */}
          <div className="hidden xl:flex items-center gap-1 xl:gap-1.5 min-w-0">
            {NAV_LINKS.map(item => {
              const isActive = isItemActive(item.href);
              const Icon = NAV_ICONS[item.name] || Sparkles;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group relative flex items-center gap-1.5 px-2.5 xl:px-3 py-1.5 text-xs font-bold tracking-wide rounded-full transition-all duration-200 whitespace-nowrap ${isActive
                    ? isDarkHero
                      ? 'bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950 shadow-[0_4px_16px_rgba(245,158,11,0.45)] scale-105'
                      : 'bg-primary text-primary-foreground shadow-sm scale-105'
                    : isDarkHero
                      ? 'text-white/80 hover:text-white hover:bg-white/10 hover:scale-105 border border-transparent hover:border-amber-400/20'
                      : 'text-slate-600 hover:text-slate-950 hover:bg-black/5 hover:scale-105 border border-transparent hover:border-amber-500/20'
                    }`}
                >
                  <Icon
                    className={`w-3.5 h-3.5 flex-shrink-0 transition-transform duration-200 group-hover:rotate-6 ${isActive
                      ? isDarkHero
                        ? 'text-slate-950'
                        : 'text-primary-foreground'
                      : isDarkHero
                        ? 'text-amber-300/90 group-hover:text-amber-300'
                        : 'text-amber-600 group-hover:text-amber-500'
                      }`}
                  />
                  <span>{getNavLabel(item.name)}</span>
                </Link>
              );
            })}

            {/* Language Switcher (Desktop) */}
            <LanguageToggle isDarkHero={isDarkHero} className="ml-1" />
          </div>

          {/* ── Mobile Actions (Language Toggle & Menu Button) ── */}
          <div className="flex xl:hidden items-center gap-2">
            <LanguageToggle isDarkHero={isDarkHero} />
            <button
              id="mobile-menu-toggle"
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`p-2 rounded-xl border transition-all duration-200 ${isDarkHero
                ? 'bg-white/10 border-white/20 text-white hover:bg-white/20'
                : 'bg-black/5 border-black/10 text-gray-900 hover:bg-black/10'
                }`}
              aria-label={isMobileMenuOpen ? t('nav.closeMenu') : t('nav.openMenu')}
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-nav-drawer"
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" aria-hidden="true" />
              ) : (
                <Menu className="h-5 w-5" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        {/* ── Mobile Navigation Drawer ── */}
        <div
          id="mobile-nav-drawer"
          className={`xl:hidden transition-all duration-300 ease-in-out overflow-hidden ${isMobileMenuOpen
            ? 'max-h-[calc(100dvh-5rem)] opacity-100 pb-4 overflow-y-auto'
            : 'max-h-0 opacity-0 pointer-events-none invisible'
            }`}
        >
          <div
            className={`p-3 rounded-2xl border shadow-2xl flex flex-col gap-1.5 ${isDarkHero
              ? 'bg-slate-950/95 backdrop-blur-2xl border-white/20 text-white shadow-[0_12px_40px_rgba(0,0,0,0.8)]'
              : 'bg-white/95 backdrop-blur-2xl border-black/10 text-gray-900 shadow-xl'
              }`}
          >
            {NAV_LINKS.map(item => {
              const isActive = isItemActive(item.href);
              const Icon = NAV_ICONS[item.name] || Sparkles;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-4 py-2.5 text-xs font-bold rounded-xl transition-all ${isActive
                    ? isDarkHero
                      ? 'bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950 shadow-md font-extrabold'
                      : 'bg-primary text-primary-foreground shadow-sm font-extrabold'
                    : isDarkHero
                      ? 'text-white/85 hover:text-white hover:bg-white/10 active:bg-white/15'
                      : 'text-gray-700 hover:text-gray-950 hover:bg-black/5 active:bg-black/10'
                    }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon
                      className={`w-4 h-4 ${isActive
                        ? isDarkHero
                          ? 'text-slate-950'
                          : 'text-primary-foreground'
                        : isDarkHero
                          ? 'text-amber-400'
                          : 'text-amber-600'
                        }`}
                    />
                    <span>{getNavLabel(item.name)}</span>
                  </div>
                  {isActive && (
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${isDarkHero ? 'bg-slate-950' : 'bg-primary-foreground'
                        }`}
                    />
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
    </header>
  </>
  );

  if (mounted && typeof document !== 'undefined') {
    return createPortal(headerContent, document.body);
  }

  return headerContent;
};

export default Header;
