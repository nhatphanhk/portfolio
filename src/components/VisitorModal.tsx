'use client';

import { useState, useEffect, useMemo } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { User, Mail, MessageSquare, Sparkles, ArrowRight, Lock, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { SITE_NAME } from '@/lib/constants';
import { useLanguage } from '@/lib/i18n/context';

function saveVisitorSession() {
  if (typeof window === 'undefined') return;
  localStorage.setItem('visitor_logged', 'true');
  sessionStorage.setItem('visitor_logged', 'true');
  // Cookie (1 year) so the flag survives a cleared localStorage
  document.cookie = 'visitor_logged=true; path=/; max-age=31536000; SameSite=Lax';
}

/**
 * Mandatory visitor greeting (product decision: no skip button).
 * Admins are recognised by the `is_admin` flag set on the login page; the NextAuth session
 * cookie is httpOnly, so it cannot be read here.
 */
export function VisitorModal() {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (localStorage.getItem('is_admin') === 'true') return;

    const hasVisited =
      localStorage.getItem('visitor_logged') === 'true' ||
      sessionStorage.getItem('visitor_logged') === 'true' ||
      document.cookie.includes('visitor_logged=true');

    if (!hasVisited) {
      const timer = setTimeout(() => setOpen(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  const schema = useMemo(
    () =>
      z.object({
        name: z.string().trim().min(2, t('visitor.valName')),
        email: z.string().trim().email(t('visitor.valEmail')),
        reason: z.string().trim().min(3, t('visitor.valReason')),
      }),
    [t]
  );
  type FormData = z.infer<typeof schema>;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    try {
      const res = await fetch('/api/visitor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        toast.success(`${t('visitor.welcome')}, ${data.name}!`);
        saveVisitorSession();
        setOpen(false);
      } else {
        toast.error(t('visitor.submitError'));
      }
    } catch {
      toast.error(t('visitor.networkError'));
    }
  };

  const inputClass = (hasError: boolean) =>
    `w-full pl-9 pr-3.5 py-2 sm:py-2.5 rounded-xl border bg-muted/50 text-foreground text-xs sm:text-sm font-medium placeholder:text-muted-foreground focus:bg-card focus:outline-none transition-all ${
      hasError
        ? 'border-destructive focus:ring-2 focus:ring-destructive/20'
        : 'border-input hover:border-foreground/30 focus:border-amber-400 focus:ring-3 focus:ring-amber-400/15'
    }`;

  const required = (
    <span className="text-amber-600" aria-hidden="true">
      *
    </span>
  );

  return (
    <Dialog
      open={open}
      onOpenChange={val => {
        // Mandatory: Esc / outside click never close it; only a successful submit does
        if (val) setOpen(val);
      }}
    >
      <DialogContent
        hideCloseButton
        onPointerDownOutside={e => e.preventDefault()}
        onEscapeKeyDown={e => e.preventDefault()}
        className="w-[calc(100%-2rem)] max-w-[420px] p-0 gap-0 overflow-hidden border border-amber-500/25 bg-card text-foreground shadow-[0_25px_60px_-15px_rgba(0,0,0,0.35)] rounded-2xl sm:rounded-3xl max-h-[calc(100dvh-2.5rem)] flex flex-col my-auto print:hidden"
      >
        {/* Header */}
        <div className="relative pt-5 pb-3.5 px-5 sm:pt-6 sm:pb-4 sm:px-6 bg-gradient-to-b from-amber-500/10 via-amber-500/5 to-transparent border-b border-amber-500/10 text-center flex-shrink-0">
          <div
            aria-hidden="true"
            className="relative mx-auto w-11 h-11 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-md shadow-amber-500/20 mb-2.5 sm:mb-3"
          >
            <div
              className="absolute inset-0 rounded-xl sm:rounded-2xl blur-md opacity-70"
              style={{ background: 'linear-gradient(135deg, #fde047 0%, #eab308 100%)' }}
            />
            <div
              className="relative w-full h-full rounded-xl sm:rounded-2xl flex items-center justify-center border border-white/40"
              style={{ background: 'linear-gradient(135deg, #fde047 0%, #eab308 50%, #ca8a04 100%)' }}
            >
              <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-slate-950" />
            </div>
          </div>

          <DialogHeader className="space-y-1 text-center sm:text-center">
            <DialogTitle className="text-lg sm:text-xl font-black text-foreground tracking-tight">
              {t('visitor.titleBefore')} <span className="text-gold-shimmer font-black">{SITE_NAME}</span>
              {t('visitor.titleAfter')}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground font-medium max-w-xs sm:max-w-sm mx-auto leading-relaxed">
              {t('visitor.description')}
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="p-4 sm:p-6 space-y-3 sm:space-y-3.5 overflow-y-auto overscroll-contain flex-grow"
        >
          <div>
            <label htmlFor="visitor-name" className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
              {t('visitor.nameLabel')} {required}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                <User className="h-4 w-4" aria-hidden="true" />
              </div>
              <input
                id="visitor-name"
                {...register('name')}
                autoComplete="name"
                placeholder={t('visitor.namePlaceholder')}
                disabled={isSubmitting}
                aria-required="true"
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? 'visitor-name-error' : undefined}
                className={inputClass(!!errors.name)}
              />
            </div>
            {errors.name && (
              <p id="visitor-name-error" className="text-[11px] font-semibold text-destructive mt-1 pl-1">
                {errors.name.message}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="visitor-email" className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
              {t('visitor.emailLabel')} {required}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                <Mail className="h-4 w-4" aria-hidden="true" />
              </div>
              <input
                id="visitor-email"
                {...register('email')}
                type="email"
                autoComplete="email"
                placeholder={t('visitor.emailPlaceholder')}
                disabled={isSubmitting}
                aria-required="true"
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? 'visitor-email-error' : undefined}
                className={inputClass(!!errors.email)}
              />
            </div>
            {errors.email && (
              <p id="visitor-email-error" className="text-[11px] font-semibold text-destructive mt-1 pl-1">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="visitor-reason" className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
              {t('visitor.reasonLabel')} {required}
            </label>
            <div className="relative">
              <div className="absolute top-2.5 left-3 flex items-center pointer-events-none text-muted-foreground">
                <MessageSquare className="h-4 w-4" aria-hidden="true" />
              </div>
              <textarea
                id="visitor-reason"
                {...register('reason')}
                rows={2}
                placeholder={t('visitor.reasonPlaceholder')}
                disabled={isSubmitting}
                aria-required="true"
                aria-invalid={!!errors.reason}
                aria-describedby={errors.reason ? 'visitor-reason-error' : undefined}
                className={`${inputClass(!!errors.reason)} resize-none`}
              />
            </div>
            {errors.reason && (
              <p id="visitor-reason-error" className="text-[11px] font-semibold text-destructive mt-1 pl-1">
                {errors.reason.message}
              </p>
            )}
          </div>

          <div className="pt-1">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 sm:py-3 px-5 rounded-xl font-extrabold text-xs sm:text-sm tracking-wide text-slate-950 flex items-center justify-center gap-2 transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-70 disabled:hover:scale-100 shadow-md shadow-amber-500/25"
              style={{ background: 'linear-gradient(135deg, #fde047 0%, #f59e0b 60%, #d97706 100%)' }}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                  <span>{t('visitor.submitting')}</span>
                </>
              ) : (
                <>
                  <span>{t('visitor.submit')}</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </>
              )}
            </button>
          </div>

          <p className="flex items-center justify-center gap-1.5 pt-0.5 text-[10px] sm:text-[11px] font-semibold text-muted-foreground">
            <Lock className="w-3 h-3" aria-hidden="true" />
            <span>{t('visitor.privacy')}</span>
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
}
