'use client';

import { useState, useSyncExternalStore, type ComponentType } from 'react';
import { Check, Facebook, Link2, Linkedin, Mail, Share2, Smartphone, Twitter } from 'lucide-react';
import { toast } from 'sonner';
import { useLanguage } from '@/lib/i18n/context';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

/** Web Share API only exists in secure contexts on supporting browsers (mostly mobile). */
const subscribeNoop = () => () => {};
const canNativeShare = () => typeof navigator !== 'undefined' && typeof navigator.share === 'function';

interface ResumeShareMenuProps {
  /** Owner's name, used in the share text. */
  name: string;
}

interface ShareTarget {
  label: string;
  icon: ComponentType<{ className?: string }>;
  href: (url: string, text: string) => string;
}

const enc = encodeURIComponent;

const SOCIAL_TARGETS: ShareTarget[] = [
  {
    label: 'LinkedIn',
    icon: Linkedin,
    href: url => `https://www.linkedin.com/sharing/share-offsite/?url=${enc(url)}`,
  },
  {
    label: 'Facebook',
    icon: Facebook,
    href: url => `https://www.facebook.com/sharer/sharer.php?u=${enc(url)}`,
  },
  {
    label: 'X (Twitter)',
    icon: Twitter,
    href: (url, text) => `https://twitter.com/intent/tweet?url=${enc(url)}&text=${enc(text)}`,
  },
];

export function ResumeShareMenu({ name }: ResumeShareMenuProps) {
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);
  // false on the server and during hydration, real value afterwards: no mismatch.
  const nativeShare = useSyncExternalStore(subscribeNoop, canNativeShare, () => false);

  const shareText = t('resume.shareText').replace('{name}', name);

  /** Resolved at click time so it always points at the current deployment, without query noise. */
  const resumeUrl = () => `${window.location.origin}/resume`;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(resumeUrl());
      setCopied(true);
      toast.success(t('blog.linkCopied'));
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error(t('blog.linkCopyFailed'));
    }
  };

  const shareNative = async () => {
    try {
      await navigator.share({ title: shareText, text: shareText, url: resumeUrl() });
    } catch (err) {
      // Closing the share sheet rejects with AbortError — not a failure worth reporting.
      if (err instanceof DOMException && err.name === 'AbortError') return;
      await copyLink();
    }
  };

  const openPopup = (target: ShareTarget) => {
    window.open(target.href(resumeUrl(), shareText), '_blank', 'noopener,noreferrer,width=600,height=640');
  };

  const shareEmail = () => {
    window.location.assign(`mailto:?subject=${enc(shareText)}&body=${enc(`${shareText}\n${resumeUrl()}`)}`);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold border border-border bg-card text-foreground shadow-xs hover:bg-muted active:scale-95 transition-all shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring data-[state=open]:bg-muted"
      >
        {copied ? (
          <Check className="w-4 h-4 text-green-600" aria-hidden="true" />
        ) : (
          <Share2 className="w-4 h-4" aria-hidden="true" />
        )}
        {copied ? t('common.copied') : t('common.share')}
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="text-xs text-muted-foreground font-medium">
          {t('resume.shareTitle')}
        </DropdownMenuLabel>

        {nativeShare && (
          <DropdownMenuItem onSelect={shareNative} className="cursor-pointer">
            <Smartphone aria-hidden="true" />
            {t('resume.shareVia')}
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onSelect={copyLink} className="cursor-pointer">
          <Link2 aria-hidden="true" />
          {t('resume.copyLink')}
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {SOCIAL_TARGETS.map(target => (
          <DropdownMenuItem key={target.label} onSelect={() => openPopup(target)} className="cursor-pointer">
            <target.icon aria-hidden="true" />
            {target.label}
          </DropdownMenuItem>
        ))}
        <DropdownMenuItem onSelect={shareEmail} className="cursor-pointer">
          <Mail aria-hidden="true" />
          {t('resume.shareEmail')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
