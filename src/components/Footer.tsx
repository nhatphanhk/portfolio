import Link from 'next/link';
import { NAV_LINKS } from '@/lib/constants';
import { getProfile, getSocialLinks } from '@/lib/actions/about';
import * as Icons from 'lucide-react';

const ICON_MAP = Icons as unknown as Record<string, React.ComponentType<{ className?: string }>>;

const Footer = async () => {
  const year = new Date().getFullYear();
  const profile = await getProfile();
  const socialLinks = await getSocialLinks();

  return (
    <footer
      style={{
        background: 'linear-gradient(180deg, oklch(0.15 0.06 255) 0%, oklch(0.10 0.05 255) 100%)',
        borderTop: '1px solid oklch(0.72 0.18 78 / 25%)',
      }}
    >
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div>
            <Link
              href="/"
              className="text-lg font-bold transition-colors"
              style={{ color: 'oklch(0.82 0.2 82)' }}
            >
              {profile.name}
            </Link>
            <p className="text-sm mt-2 leading-relaxed max-w-xs" style={{ color: 'oklch(0.65 0.08 255)' }}>
              {profile.tagline}
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-sm font-semibold mb-4" style={{ color: 'oklch(0.72 0.18 78)' }}>
              Navigation
            </h4>
            <ul className="space-y-2">
              {NAV_LINKS.map(link => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm transition-colors hover:text-amber-300"
                    style={{ color: 'oklch(0.60 0.07 255)' }}
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Social Links */}
          <div>
            <h4 className="text-sm font-semibold mb-4" style={{ color: 'oklch(0.55 0.22 255)' }}>
              Connect
            </h4>
            <div className="flex flex-col gap-2">
              {socialLinks.map(social => {
                const Icon = social.iconName ? ICON_MAP[social.iconName] || Icons.Link : Icons.Link;
                return (
                  <a
                    key={social.platform}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm transition-colors hover:text-blue-300"
                    style={{ color: 'oklch(0.60 0.07 255)' }}
                  >
                    <Icon className="h-4 w-4" />
                    {social.platform}
                  </a>
                );
              })}
            </div>
          </div>
        </div>

        <div
          className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm"
          style={{
            borderTop: '1px solid oklch(0.72 0.18 78 / 20%)',
            color: 'oklch(0.50 0.06 255)',
          }}
        >
          <p>© {year} {profile.name}. All rights reserved.</p>
          <p>Built with Next.js &amp; Tailwind CSS</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
