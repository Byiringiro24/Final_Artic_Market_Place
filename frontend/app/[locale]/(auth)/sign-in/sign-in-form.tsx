'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { post } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const schema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});
type FormData = z.infer<typeof schema>;

export default function SignInForm() {
  const router = useRouter();
  const locale = useLocale();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || `/${locale}`;
  const { setUser } = useAuthStore();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  async function onSubmit(data: FormData) {
    try {
      const res = await post<{ accessToken: string; user: Parameters<typeof setUser>[0] }>(
        '/auth/login',
        data
      );
      setUser(res.data.user, res.data.accessToken);
      toast({ title: `Welcome back, ${res.data.user.name.split(' ')[0]}!` });

      // Redirect admins to admin dashboard, users to their intended page
      if (res.data.user.role === 'ADMIN') {
        router.push(`/${locale}/admin/overview`);
      } else {
        router.push(redirect);
      }
      router.refresh();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Invalid email or password';
      toast({ title: 'Sign in failed', description: msg, variant: 'destructive' });
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <div>
        <Label htmlFor="email">Email address</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          autoFocus
          className="mt-1"
          {...register('email')}
          aria-describedby={errors.email ? 'email-error' : undefined}
        />
        {errors.email && (
          <p id="email-error" className="text-sm text-destructive mt-1">
            {errors.email.message}
          </p>
        )}
      </div>

      <div>
        <div className="flex justify-between items-baseline">
          <Label htmlFor="password">Password</Label>
          <Link
            href={`/${locale}/forgot-password`}
            className="text-xs text-artic-link hover:underline"
          >
            Forgot password?
          </Link>
        </div>
        <div className="relative mt-1">
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            className="pr-10"
            {...register('password')}
            aria-describedby={errors.password ? 'password-error' : undefined}
          />
          <button
            type="button"
            onClick={() => setShowPassword((p) => !p)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.password && (
          <p id="password-error" className="text-sm text-destructive mt-1">
            {errors.password.message}
          </p>
        )}
      </div>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-artic-orange hover:bg-artic-orange-dark text-black font-medium rounded-full"
      >
        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Sign In'}
      </Button>

      <p className="text-xs text-gray-500 text-center leading-snug">
        By signing in, you agree to ARTIC&apos;s{' '}
        <Link href={`/${locale}/page/terms-of-service`} className="text-artic-link hover:underline">
          Terms
        </Link>{' '}
        and{' '}
        <Link href={`/${locale}/page/privacy-policy`} className="text-artic-link hover:underline">
          Privacy Policy
        </Link>
        .
      </p>
    </form>
  );
}
