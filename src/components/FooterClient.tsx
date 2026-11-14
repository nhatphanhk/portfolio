'use client';

import Link from 'next/link';
import { NAV_LINKS } from '@/lib/constants';
import DynamicIcon from '@/components/ui/DynamicIcon';
import { useLanguage } from '@/lib/i18n/context';

interface FooterClientProps {
  year: number;
  profileName: string;
  profileTagline?: string | null;
  socialLinks: Array<{ platform: string; url: string; iconName?: string | null }>;
}

export default function FooterClient({
  year,
  profileName,
  profileTagline,
  socialLinks,
}: FooterClientProps) {
  const { t } = useLanguage();

  const getNavLabel = (name: string): string => {
    switch (name) {
      case 'Resume':
        return t('nav.resume');
      case 'Blogs':
      case 'Blog':
        return t('nav.blogs');
      case 'Series':
        return t('nav.series');
      case 'Projects':
        return t('nav.projects');
      case 'Skills':
        return t('nav.skills');
      case 'Certifications':
        return t('nav.certifications');
      case 'Contact':
        return t('nav.contact');
      default:
        return name;
    }
  };

  return (
    <footer
      style={{
        background: 'linear-gradient(180deg, oklch(0.15 0.06 255) 0%, oklch(0.10 0.05 255) 100%)',
        borderTop: '1px solid oklch(0.72 0.18 78 / 25%)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8 min-w-0">
          {/* Brand */}
          <div className="min-w-0 break-words">
            <Link
              href="/"
              className="text-lg font-black tracking-tight transition-colors hover:text-amber-300"
              style={{ color: 'oklch(0.85 0.18 84)' }}
            >
              {profileName}
            </Link>
            {profileTagline && (
              <p
                className="text-sm mt-2 leading-relaxed max-w-xs break-words"
                style={{ color: 'oklch(0.68 0.08 255)' }}
              >
                {profileTagline}
              </p>
            )}
          </div>

          {/* Navigation */}
          <div className="min-w-0">
            <h4 className="text-sm font-semibold mb-4" style={{ color: 'oklch(0.72 0.18 78)' }}>
              {t('footer.navigation')}
            </h4>
            <ul className="space-y-2">
              {NAV_LINKS.map(link => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm transition-colors hover:text-amber-300"
                    style={{ color: 'oklch(0.60 0.07 255)' }}
                  >
                    {getNavLabel(link.name)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Social Links */}
          <div className="min-w-0">
            <h4 className="text-sm font-semibold mb-4" style={{ color: 'oklch(0.55 0.22 255)' }}>
              {t('footer.connect')}
            </h4>
            <div className="flex flex-wrap items-center gap-2.5">
              {socialLinks.map(social => (
                <a
                  key={social.platform}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.platform}
                  title={social.platform}
                  className="p-2.5 rounded-xl border border-white/10 bg-white/5 transition-all duration-200 hover:bg-white/15 hover:scale-110 hover:border-amber-400/40 hover:text-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-400"
                  style={{ color: 'oklch(0.75 0.12 255)' }}
                >
                  <DynamicIcon name={social.iconName} className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div
          className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left text-sm"
          style={{
            borderTop: '1px solid oklch(0.72 0.18 78 / 20%)',
            color: 'oklch(0.50 0.06 255)',
          }}
        >
          <p>
            © {year} {profileName}. {t('footer.rights')}
          </p>
          <p>{t('footer.builtWith')}</p>
        </div>
      </div>
    </footer>
  );
}
