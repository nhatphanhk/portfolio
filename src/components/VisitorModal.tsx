'use client';

import { useState, useEffect } from 'react';
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
import {
  User,
  Mail,
  MessageSquare,
  Sparkles,
  ArrowRight,
  Lock,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';

const schema = z.object({
  name: z.string().min(2, 'Please enter your name'),
  email: z.string().email('Please enter a valid email address'),
  reason: z.string().min(3, 'Please briefly share why you are visiting'),
});

type FormData = z.infer<typeof schema>;

function saveVisitorSession(visitorName?: string) {
  if (typeof window === 'undefined') return;
  // 1. Persistent LocalStorage (never expires unless cleared)
  localStorage.setItem('visitor_logged', 'true');
  if (visitorName) {
    localStorage.setItem('visitor_name', visitorName);
  }
  // 2. SessionStorage
  sessionStorage.setItem('visitor_logged', 'true');
  // 3. Persistent Cookie (valid for 1 full year)
  document.cookie = 'visitor_logged=true; path=/; max-age=31536000; SameSite=Lax';
}

export function VisitorModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // ── Layer 1: Check Admin LocalStorage Flag (Set upon logging in via /admin/login) ──
    const isAdmin = localStorage.getItem('is_admin') === 'true';
    if (isAdmin) {
      return;
    }

    // ── Layer 2: Check NextAuth Admin Session Cookie ──
    const hasAuthCookie =
      document.cookie.includes('authjs.session-token') ||
      document.cookie.includes('next-auth.session-token') ||
      document.cookie.includes('__Secure-authjs.session-token');

    if (hasAuthCookie) {
      localStorage.setItem('is_admin', 'true');
      return;
    }

    // ── Layer 4: Check if Visitor Already Logged (localStorage, cookie, sessionStorage) ──
    const hasVisited =
      localStorage.getItem('visitor_logged') === 'true' ||
      sessionStorage.getItem('visitor_logged') === 'true' ||
      document.cookie.includes('visitor_logged=true');

    if (!hasVisited) {
      const timer = setTimeout(() => setOpen(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const markVisitorAsLogged = (visitorName?: string) => {
    saveVisitorSession(visitorName);
    setOpen(false);
  };


  const onSubmit = async (data: FormData) => {
    try {
      const res = await fetch('/api/visitor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        toast.success(`Welcome, ${data.name}! Enjoy exploring the portfolio.`);
        markVisitorAsLogged(data.name);
      } else {
        toast.error('Could not submit details. Please check your information and try again.');
      }
    } catch (_e) {
      toast.error('Network error. Please try again in a moment.');
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        // Required modal: Prevent closing via outside interactions until submitted
        if (!val && !sessionStorage.getItem('visitor_logged')) {
          return;
        }
        setOpen(val);
      }}
    >
      <DialogContent
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        className="max-w-md p-0 overflow-hidden border border-amber-500/20 bg-white/95 backdrop-blur-2xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] rounded-3xl [&>button]:hidden sm:rounded-3xl"
      >
        {/* Top Decorative Ambient Header */}
        <div className="relative pt-8 pb-6 px-6 sm:px-8 bg-gradient-to-b from-amber-500/10 via-amber-500/5 to-transparent border-b border-amber-500/10 text-center">
          {/* Glowing Avatar / Sparkle Icon */}
          <div className="relative mx-auto w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/25 mb-4 group">
            <div
              className="absolute inset-0 rounded-2xl blur-md opacity-70"
              style={{
                background: 'linear-gradient(135deg, #fde047 0%, #eab308 100%)',
              }}
            />
            <div
              className="relative w-full h-full rounded-2xl flex items-center justify-center border border-white/40 font-black text-slate-950 text-xl"
              style={{
                background: 'linear-gradient(135deg, #fde047 0%, #eab308 50%, #ca8a04 100%)',
              }}
            >
              <Sparkles className="w-7 h-7 text-slate-950" />
            </div>
          </div>

          <DialogHeader className="space-y-1.5 text-center sm:text-center">
            <DialogTitle className="text-2xl font-black text-slate-900 tracking-tight">
              Welcome to{' '}
              <span className="text-gold-shimmer font-black">Nhat Phan&apos;s</span>{' '}
              Portfolio
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm text-slate-600 font-medium max-w-sm mx-auto leading-relaxed">
              Please introduce yourself below to unlock full access to projects, resume, and experience.
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 sm:p-8 space-y-4">
          {/* Name Field */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Your Full Name <span className="text-amber-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <User className="h-4 w-4" />
              </div>
              <input
                {...register('name')}
                placeholder="e.g. Alex Morgan"
                disabled={isSubmitting}
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl border bg-slate-50/70 text-slate-900 text-sm font-medium placeholder:text-slate-400 focus:bg-white focus:outline-none transition-all ${
                  errors.name
                    ? 'border-red-400 focus:ring-2 focus:ring-red-400/20'
                    : 'border-slate-200 focus:border-amber-400 focus:ring-3 focus:ring-amber-400/15'
                }`}
              />
            </div>
            {errors.name && (
              <p className="text-xs font-semibold text-red-500 mt-1 pl-1">
                {errors.name.message}
              </p>
            )}
          </div>

          {/* Email Field */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Email Address <span className="text-amber-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail className="h-4 w-4" />
              </div>
              <input
                {...register('email')}
                type="email"
                placeholder="alex@company.com"
                disabled={isSubmitting}
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl border bg-slate-50/70 text-slate-900 text-sm font-medium placeholder:text-slate-400 focus:bg-white focus:outline-none transition-all ${
                  errors.email
                    ? 'border-red-400 focus:ring-2 focus:ring-red-400/20'
                    : 'border-slate-200 focus:border-amber-400 focus:ring-3 focus:ring-amber-400/15'
                }`}
              />
            </div>
            {errors.email && (
              <p className="text-xs font-semibold text-red-500 mt-1 pl-1">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Reason Field */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Reason For Visiting <span className="text-amber-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute top-3 left-3.5 flex items-center pointer-events-none text-slate-400">
                <MessageSquare className="h-4 w-4" />
              </div>
              <textarea
                {...register('reason')}
                rows={3}
                placeholder="e.g. Exploring potential hire, reviewing projects, collaboration..."
                disabled={isSubmitting}
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl border bg-slate-50/70 text-slate-900 text-sm font-medium placeholder:text-slate-400 focus:bg-white focus:outline-none transition-all resize-none ${
                  errors.reason
                    ? 'border-red-400 focus:ring-2 focus:ring-red-400/20'
                    : 'border-slate-200 focus:border-amber-400 focus:ring-3 focus:ring-amber-400/15'
                }`}
              />
            </div>
            {errors.reason && (
              <p className="text-xs font-semibold text-red-500 mt-1 pl-1">
                {errors.reason.message}
              </p>
            )}
          </div>

          {/* Submit Action Button (Required, No Skip) */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-6 rounded-xl font-extrabold text-sm tracking-wide text-slate-950 flex items-center justify-center gap-2 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:hover:scale-100 shadow-lg shadow-amber-500/25"
              style={{
                background: 'linear-gradient(135deg, #fde047 0%, #f59e0b 60%, #d97706 100%)',
              }}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                  <span>Verifying & Entering...</span>
                </>
              ) : (
                <>
                  <span>Enter Portfolio</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

          {/* Trust / Privacy Badge */}
          <div className="flex items-center justify-center gap-1.5 pt-1 text-[11px] font-semibold text-slate-400">
            <Lock className="w-3 h-3 text-slate-400" />
            <span>Information is private & only used to greet you</span>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
