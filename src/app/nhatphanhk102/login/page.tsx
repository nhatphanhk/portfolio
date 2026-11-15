'use client';

import { Suspense, useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Lock, Mail, AlertCircle } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  // Length rules belong to "change password"; at sign-in only require a value
  password: z.string().min(1, 'Vui lòng nhập mật khẩu'),
});

type LoginFormData = z.infer<typeof loginSchema>;

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // NextAuth appends ?callbackUrl= when the proxy redirects a deep link; only same-origin paths are honoured
  const rawCallback = searchParams.get('callbackUrl') || '';
  const callbackUrl = rawCallback.startsWith('/') && !rawCallback.startsWith('//') ? rawCallback : '/nhatphanhk102';
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(
    searchParams.get('error') ? 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại.' : null
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: LoginFormData) => {
    setError(null);
    try {
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        setError('Email hoặc mật khẩu không đúng. Vui lòng thử lại.');
        return;
      }

      // Mark device as verified admin to permanently bypass visitor modal
      if (typeof window !== 'undefined') {
        localStorage.setItem('is_admin', 'true');
        localStorage.setItem('visitor_logged', 'true');
        sessionStorage.setItem('visitor_logged', 'true');
      }

      router.push(callbackUrl);
      router.refresh();
    } catch {
      setError('Đã xảy ra lỗi không mong muốn. Vui lòng thử lại.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-foreground mb-4">
            <Lock className="h-6 w-6 text-background" aria-hidden="true" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Đăng nhập quản trị</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Đăng nhập để vào trang quản trị
          </p>
        </div>

        {/* Form */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <form id="admin-login-form" onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
            {/* Error Alert */}
            {error && (
              <div role="alert" className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
                {error}
              </div>
            )}

            {/* Email */}
            <div>
              <label htmlFor="admin-email" className="block text-sm font-medium text-foreground mb-1.5">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
                <input
                  id="admin-email"
                  type="email"
                  placeholder="admin@example.com"
                  autoComplete="email"
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? 'admin-email-error' : undefined}
                  {...register('email')}
                  className={`w-full pl-10 pr-4 py-2.5 rounded-lg border bg-muted/40 text-foreground text-sm outline-none focus:bg-card focus:ring-2 focus:ring-ring transition-colors ${
                    errors.email ? 'border-destructive' : 'border-input hover:border-foreground/30'
                  }`}
                />
              </div>
              {errors.email && (
                <p id="admin-email-error" className="mt-1 text-xs text-destructive">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="admin-password" className="block text-sm font-medium text-foreground mb-1.5">
                Mật khẩu
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
                <input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  aria-invalid={!!errors.password}
                  aria-describedby={errors.password ? 'admin-password-error' : undefined}
                  {...register('password')}
                  className={`w-full pl-10 pr-10 py-2.5 rounded-lg border bg-muted/40 text-foreground text-sm outline-none focus:bg-card focus:ring-2 focus:ring-ring transition-colors ${
                    errors.password ? 'border-destructive' : 'border-input hover:border-foreground/30'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
                </button>
              </div>
              {errors.password && (
                <p id="admin-password-error" className="mt-1 text-xs text-destructive">{errors.password.message}</p>
              )}
            </div>

            {/* Submit */}
            <button
              id="admin-login-submit"
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 bg-foreground text-background rounded-lg font-medium text-sm hover:bg-foreground/90 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
            >
              {isSubmitting ? 'Đang đăng nhập…' : 'Đăng nhập'}
            </button>
          </form>
        </div>

        {/* Back to site */}
        <div className="text-center mt-4">
          <Link href="/" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
            ← Về trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
