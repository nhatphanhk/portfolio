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
    <footer className="border-t border-border bg-background">
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div>
            <Link href="/" className="text-lg font-bold text-foreground hover:text-primary transition-colors">
              {profile.name}
            </Link>
            <p className="text-sm text-muted-foreground mt-2 leading-relaxed max-w-xs">
              {profile.tagline}
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-4">Navigation</h4>
            <ul className="space-y-2">
              {NAV_LINKS.map(link => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Social Links */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-4">Connect</h4>
            <div className="flex flex-col gap-2">
              {socialLinks.map(social => {
                const Icon = social.iconName ? ICON_MAP[social.iconName] || Icons.Link : Icons.Link;
                return (
                  <a
                    key={social.platform}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Icon className="h-4 w-4" />
                    {social.platform}
                  </a>
                );
              })}
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-muted-foreground">
          <p>© {year} {profile.name}. All rights reserved.</p>
          <p>Built with Next.js & Tailwind CSS</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
