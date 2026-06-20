'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Send, Mail, MapPin, Github, Linkedin, Twitter } from 'lucide-react';
import { PROFILE } from '@/data/content';

const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  subject: z.string().min(3, 'Subject must be at least 3 characters'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

type ContactFormData = z.infer<typeof contactSchema>;

const SOCIAL_ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Github,
  Linkedin,
  Twitter,
};

/**
 * ContactSection with validated form that submits to the /api/contact endpoint.
 * Uses react-hook-form + zod for validation, sonner for toast notifications.
 */
export default function ContactSection() {
  const [isSubmitting, setIsSubmitting] = useState(false);

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
        throw new Error(errorData?.error?.message ?? 'Failed to send message');
      }

      toast.success('Message sent!', {
        description: "Thanks for reaching out. I'll get back to you soon.",
      });
      reset();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong';
      toast.error('Failed to send message', { description: message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-24 bg-muted/30">
      <div className="max-w-5xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-3">
            Contact
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Let&apos;s Work Together
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Have a project in mind or just want to say hello? Send me a message and I&apos;ll get
            back to you as soon as possible.
          </p>
        </div>

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
                    Name <span className="text-destructive">*</span>
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    placeholder="Your name"
                    {...register('name')}
                    className={`w-full px-4 py-2.5 rounded-lg border bg-background text-foreground text-sm transition-colors outline-none focus:ring-2 focus:ring-ring ${
                      errors.name ? 'border-destructive' : 'border-border hover:border-foreground/30'
                    }`}
                  />
                  {errors.name && (
                    <p className="mt-1 text-xs text-destructive">{errors.name.message}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="contact-email" className="block text-sm font-medium text-foreground mb-1.5">
                    Email <span className="text-destructive">*</span>
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    placeholder="your@email.com"
                    {...register('email')}
                    className={`w-full px-4 py-2.5 rounded-lg border bg-background text-foreground text-sm transition-colors outline-none focus:ring-2 focus:ring-ring ${
                      errors.email ? 'border-destructive' : 'border-border hover:border-foreground/30'
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
                  Subject <span className="text-destructive">*</span>
                </label>
                <input
                  id="contact-subject"
                  type="text"
                  placeholder="What's this about?"
                  {...register('subject')}
                  className={`w-full px-4 py-2.5 rounded-lg border bg-background text-foreground text-sm transition-colors outline-none focus:ring-2 focus:ring-ring ${
                    errors.subject ? 'border-destructive' : 'border-border hover:border-foreground/30'
                  }`}
                />
                {errors.subject && (
                  <p className="mt-1 text-xs text-destructive">{errors.subject.message}</p>
                )}
              </div>

              {/* Message */}
              <div>
                <label htmlFor="contact-message" className="block text-sm font-medium text-foreground mb-1.5">
                  Message <span className="text-destructive">*</span>
                </label>
                <textarea
                  id="contact-message"
                  rows={5}
                  placeholder="Tell me about your project or just say hello..."
                  {...register('message')}
                  className={`w-full px-4 py-2.5 rounded-lg border bg-background text-foreground text-sm resize-none transition-colors outline-none focus:ring-2 focus:ring-ring ${
                    errors.message ? 'border-destructive' : 'border-border hover:border-foreground/30'
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
                {isSubmitting ? 'Sending…' : 'Send Message'}
              </button>
            </form>
          </div>

          {/* Info — 2 columns */}
          <div className="lg:col-span-2 space-y-8">
            <div>
              <h3 className="font-semibold text-foreground mb-4">Contact Info</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4 shrink-0" />
                  <a href={`mailto:${PROFILE.email}`} className="hover:text-foreground transition-colors">
                    {PROFILE.email}
                  </a>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4 shrink-0" />
                  {PROFILE.location}
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-foreground mb-4">Follow Me</h3>
              <div className="flex flex-wrap gap-3">
                {PROFILE.socialLinks.map(social => {
                  const Icon = SOCIAL_ICON_MAP[social.iconName];
                  return (
                    <a
                      key={social.platform}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={social.platform}
                      className="inline-flex items-center gap-2 px-4 py-2 border border-border rounded-lg text-sm text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
                    >
                      {Icon && <Icon className="h-4 w-4" />}
                      {social.platform}
                    </a>
                  );
                })}
              </div>
            </div>

            <div className="p-5 rounded-xl border border-border bg-card">
              <p className="text-sm font-medium text-foreground mb-1">Response Time</p>
              <p className="text-sm text-muted-foreground">
                I typically respond within 24–48 hours. For urgent inquiries, reach out directly via
                email.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
