'use client';

import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Send, Mail, MapPin } from 'lucide-react';
import type { getProfile } from '@/lib/actions/about';
import DynamicIcon from '@/components/ui/DynamicIcon';
import { useLanguage } from '@/lib/i18n/context';

interface ContactSectionProps {
  profile: Awaited<ReturnType<typeof getProfile>>;
  socialLinks: Array<{ platform: string; url: string; iconName?: string | null }>;
  hideHeader?: boolean;
}

type ContactFormData = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

/**
 * ContactSection with validated form that submits to the /api/contact endpoint.
 * Uses react-hook-form + zod for validation, sonner for toast notifications, and i18n.
 */
export default function ContactSection({ profile, socialLinks, hideHeader = false }: ContactSectionProps) {
  const { t } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const contactSchema = useMemo(
    () =>
      z.object({
        name: z.string().min(2, t('contact.valName')),
        email: z.string().email(t('contact.valEmail')),
        subject: z.string().min(3, t('contact.valSubject')),
        message: z.string().min(10, t('contact.valMessage')),
      }),
    [t]
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData?.error?.message ?? t('contact.error'));
      }

      toast.success(t('contact.success'), {
        description: t('contact.successDesc'),
      });
      reset();
    } catch (err) {
      const message = err instanceof Error ? err.message : t('contact.error');
      toast.error(t('contact.error'), { description: message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formAndInfo = (
    <div className="grid lg:grid-cols-5 gap-12">
      {/* Form — 3 columns */}
      <div className="lg:col-span-3">
            <form
              id="contact-form"
              onSubmit={handleSubmit(onSubmit)}
              noValidate
              className="space-y-5"
            >
              <div className="grid sm:grid-cols-2 gap-4">
                {/* Name */}
                <div>
                  <label htmlFor="contact-name" className="block text-sm font-medium text-foreground mb-1.5">
                    {t('contact.name')} <span className="text-destructive">*</span>
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    placeholder={t('contact.namePlaceholder')}
                    {...register('name')}
                    className={`w-full px-4 py-2.5 rounded-lg border bg-white text-foreground text-sm shadow-xs transition-colors outline-none focus:ring-2 focus:ring-ring ${
                      errors.name ? 'border-destructive' : 'border-border/80 hover:border-foreground/40'
                    }`}
                  />
                  {errors.name && (
                    <p className="mt-1 text-xs text-destructive">{errors.name.message}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="contact-email" className="block text-sm font-medium text-foreground mb-1.5">
                    {t('contact.email')} <span className="text-destructive">*</span>
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    placeholder={t('contact.emailPlaceholder')}
                    {...register('email')}
                    className={`w-full px-4 py-2.5 rounded-lg border bg-white text-foreground text-sm shadow-xs transition-colors outline-none focus:ring-2 focus:ring-ring ${
                      errors.email ? 'border-destructive' : 'border-border/80 hover:border-foreground/40'
                    }`}
                  />
                  {errors.email && (
                    <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>
                  )}
                </div>
              </div>

              {/* Subject */}
              <div>
                <label htmlFor="contact-subject" className="block text-sm font-medium text-foreground mb-1.5">
                  {t('contact.subject')} <span className="text-destructive">*</span>
                </label>
                <input
                  id="contact-subject"
                  type="text"
                  placeholder={t('contact.subjectPlaceholder')}
                  {...register('subject')}
                  className={`w-full px-4 py-2.5 rounded-lg border bg-white text-foreground text-sm shadow-xs transition-colors outline-none focus:ring-2 focus:ring-ring ${
                    errors.subject ? 'border-destructive' : 'border-border/80 hover:border-foreground/40'
                  }`}
                />
                {errors.subject && (
                  <p className="mt-1 text-xs text-destructive">{errors.subject.message}</p>
                )}
              </div>

              {/* Message */}
              <div>
                <label htmlFor="contact-message" className="block text-sm font-medium text-foreground mb-1.5">
                  {t('contact.message')} <span className="text-destructive">*</span>
                </label>
                <textarea
                  id="contact-message"
                  rows={5}
                  placeholder={t('contact.messagePlaceholder')}
                  {...register('message')}
                  className={`w-full px-4 py-2.5 rounded-lg border bg-white text-foreground text-sm shadow-xs resize-none transition-colors outline-none focus:ring-2 focus:ring-ring ${
                    errors.message ? 'border-destructive' : 'border-border/80 hover:border-foreground/40'
                  }`}
                />
                {errors.message && (
                  <p className="mt-1 text-xs text-destructive">{errors.message.message}</p>
                )}
              </div>

              <button
                id="contact-submit"
                type="submit"
                disabled={isSubmitting}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-foreground text-background rounded-lg font-medium hover:bg-foreground/90 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200"
              >
                <Send className="h-4 w-4" />
                {isSubmitting ? t('contact.sending') : t('contact.send')}
              </button>
            </form>
          </div>

          {/* Info — 2 columns */}
          <div className="lg:col-span-2 space-y-8">
            <div>
              <h3 className="font-semibold text-foreground mb-4">{t('contact.directContact')}</h3>
              <div className="space-y-3">
                {profile.email && (
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4 shrink-0" />
                    <a href={`mailto:${profile.email}`} className="hover:text-foreground transition-colors">
                      {profile.email}
                    </a>
                  </div>
                )}
                {profile.location && (
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 shrink-0" />
                    {profile.location}
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-foreground mb-4">{t('footer.connect')}</h3>
              <div className="flex flex-wrap gap-2.5">
                {socialLinks.map(social => {
                  return (
                    <a
                      key={social.platform}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={social.platform}
                      title={social.platform}
                      className="p-3 rounded-xl border border-border bg-white text-muted-foreground hover:text-foreground hover:border-amber-500/50 hover:bg-amber-500/5 hover:scale-105 active:scale-95 transition-all shadow-xs"
                    >
                      <DynamicIcon name={social.iconName} className="h-5 w-5" />
                    </a>
                  );
                })}
              </div>
            </div>

            <div className="p-5 rounded-xl border border-border bg-card">
              <p className="text-sm font-medium text-foreground mb-1">{t('contact.responseTimeTitle')}</p>
              <p className="text-sm text-muted-foreground">
                {t('contact.responseTimeDesc')}
              </p>
            </div>
          </div>
        </div>
  );

  if (hideHeader) {
    return <div id="contact" className="w-full">{formAndInfo}</div>;
  }

  return (
    <section id="contact" className="py-24 bg-muted/30">
      <div className="max-w-5xl mx-auto px-6">
        <div className="text-center mb-16">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-3">
            {t('nav.contact')}
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {t('contact.letsWork')}
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            {t('contact.subtitle')}
          </p>
        </div>
        {formAndInfo}
      </div>
    </section>
  );
}
