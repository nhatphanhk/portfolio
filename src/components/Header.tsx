'use client';

import { useState, useEffect } from 'react';
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
  Search,
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
      setIsScrolled(window.scrollY > 40);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

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

  const handleOpenSearch = () => {
    document.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'k', metaKey: true })
    );
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out ${
        isDarkHero
          ? 'bg-transparent'
          : 'bg-white/90 backdrop-blur-md border-b border-border/80 shadow-xs'
      }`}
      style={
        isDarkHero
          ? {}
          : {
              background: 'oklch(0.98 0.01 85 / 90%)',
              borderColor: 'oklch(0.88 0.03 80 / 80%)',
            }
      }
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* ── Brand Logo & Eye-Catching Name ── */}
          <Link
            href="/"
            className="group flex items-center gap-3 transition-all duration-300 hover:scale-105"
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
                className={`text-lg font-black tracking-tight transition-colors ${
                  isDarkHero ? 'text-white' : 'text-slate-900'
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
          <div className="hidden md:flex items-center gap-1 sm:gap-1.5">
            {NAV_LINKS.map(item => {
              const isActive = isItemActive(item.href);
              const Icon = NAV_ICONS[item.name] || Sparkles;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group relative flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold tracking-wide rounded-full transition-all duration-200 ${
                    isActive
                      ? isDarkHero
                        ? 'bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950 shadow-[0_4px_16px_rgba(245,158,11,0.4)] scale-105'
                        : 'bg-primary text-primary-foreground shadow-sm scale-105'
                      : isDarkHero
                      ? 'text-white/80 hover:text-white hover:bg-white/10 hover:scale-105'
                      : 'text-slate-600 hover:text-slate-950 hover:bg-black/5 hover:scale-105'
                  }`}
                >
                  <Icon
                    className={`w-3.5 h-3.5 transition-transform duration-200 group-hover:rotate-6 ${
                      isActive
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

            {/* Quick Search Shortcut */}
            <button
              type="button"
              onClick={handleOpenSearch}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-medium border transition-all cursor-pointer ${
                isDarkHero
                  ? 'bg-white/10 hover:bg-white/20 border-white/20 text-white'
                  : 'bg-muted/60 hover:bg-muted border-border/80 text-muted-foreground hover:text-foreground'
              }`}
              aria-label="Quick search (Ctrl+K)"
              title="Quick search (Ctrl+K)"
            >
              <Search className="w-3.5 h-3.5" />
              <kbd className="hidden lg:inline-flex items-center px-1 text-[10px] font-mono font-semibold rounded bg-background/60 border border-border/60">
                ⌘K
              </kbd>
            </button>

            {/* Language Switcher (Desktop) */}
            <LanguageToggle isDarkHero={isDarkHero} className="ml-1" />
          </div>

          {/* ── Mobile Actions (Search, Language Toggle & Menu Button) ── */}
          <div className="flex md:hidden items-center gap-2">
            <button
              type="button"
              onClick={handleOpenSearch}
              className={`p-2 rounded-xl border transition-all duration-200 ${
                isDarkHero
                  ? 'bg-white/10 border-white/20 text-white hover:bg-white/20'
                  : 'bg-black/5 border-black/10 text-gray-900 hover:bg-black/10'
              }`}
              aria-label="Quick search (Ctrl+K)"
            >
              <Search className="h-4 w-4" />
            </button>
            <LanguageToggle isDarkHero={isDarkHero} />
            <button
              id="mobile-menu-toggle"
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`p-2 rounded-xl border transition-all duration-200 ${
                isDarkHero
                  ? 'bg-white/10 border-white/20 text-white hover:bg-white/20'
                  : 'bg-black/5 border-black/10 text-gray-900 hover:bg-black/10'
              }`}
              aria-label="Toggle navigation menu"
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* ── Mobile Navigation Drawer ── */}
        <div
          className={`md:hidden transition-all duration-300 ease-in-out overflow-hidden ${
            isMobileMenuOpen
              ? 'max-h-[32rem] opacity-100 pb-4'
              : 'max-h-0 opacity-0 pointer-events-none'
          }`}
        >
          <div
            className={`p-3 rounded-2xl border shadow-2xl flex flex-col gap-1.5 ${
              isDarkHero
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
                  className={`flex items-center justify-between px-4 py-2.5 text-xs font-bold rounded-xl transition-all ${
                    isActive
                      ? isDarkHero
                        ? 'bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950 shadow-md'
                        : 'bg-primary text-primary-foreground shadow-sm'
                      : isDarkHero
                      ? 'text-white/80 hover:text-white hover:bg-white/10'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-black/5'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon
                      className={`w-4 h-4 ${
                        isActive
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
                      className={`w-1.5 h-1.5 rounded-full ${
                        isDarkHero ? 'bg-slate-950' : 'bg-primary-foreground'
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
  );
};

export default Header;
