'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Home, User, Mail, FileText, Briefcase, Layers, Cpu, Award } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/context';

export function CommandPalette() {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();
  const { t } = useLanguage();

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(open => !open);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const runCommand = React.useCallback((command: () => unknown) => {
    setOpen(false);
    command();
  }, []);

  const items = [
    { href: '/', label: t('nav.home'), icon: Home },
    { href: '/blog', label: t('nav.blogs'), icon: FileText },
    { href: '/blog/series', label: t('nav.series'), icon: Layers },
    { href: '/project', label: t('nav.projects'), icon: Briefcase },
    { href: '/skills', label: t('nav.skills'), icon: Cpu },
    { href: '/certifications', label: t('nav.certifications'), icon: Award },
    { href: '/resume', label: t('nav.resume'), icon: User },
    { href: '/contact', label: t('nav.contact'), icon: Mail },
  ];

  return (
    <CommandDialog open={open} onOpenChange={setOpen} title={t('commandPalette.title')}>
      <CommandInput placeholder={t('commandPalette.placeholder')} />
      <CommandList>
        <CommandEmpty>{t('commandPalette.empty')}</CommandEmpty>

        <CommandGroup heading={t('commandPalette.navigation')}>
          {items.map(({ href, label, icon: Icon }) => (
            <CommandItem key={href} value={`${label} ${href}`} onSelect={() => runCommand(() => router.push(href))}>
              <Icon className="mr-2 h-4 w-4" aria-hidden="true" />
              <span>{label}</span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
