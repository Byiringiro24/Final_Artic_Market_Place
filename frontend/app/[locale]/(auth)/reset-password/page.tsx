'use client';

import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Loader2, CheckCircle2 } from 'lucide-react';
import { post } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const schema = z
  .object({
    password: z
      .string()
      .min(8, 'At least 8 characters')
      .regex(/[A-Z]/, 'Include at least one uppercase letter')
      .regex(/[0-9]/, 'Include at least one number'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type FormData = z.infer<typeof schema>;

export default function ResetPasswordPage() {
  const router = useRouter();
  const locale = useLocale();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [done, setDone] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  if (!token) {
    return (
      <div className="w-full max-w-sm bg-white border rounded-lg p-6 text-center space-y-3">
        <p className="text-red-600 font-medium">Invalid or missing reset token.</p>
        <a href={`/${locale}/forgot-password`} className="text-artic-link hover:underline text-sm">
          Request a new reset link
        </a>
      </div>
    );
  }

  if (done) {
    return (
      <div className="w-full max-w-sm bg-white border rounded-lg p-6 text-center space-y-4">
        <CheckCircle2 className="h-14 w-14 text-green-500 mx-auto" />
        <h2 className="text-xl font-semibold">Password reset!</h2>
        <p className="text-gray-600 text-sm">Your password has been changed. You can now sign in.</p>
        <Button
          onClick={() => router.push(`/${locale}/sign-in`)}
          className="w-full bg-artic-teal hover:bg-artic-teal-dark text-black rounded-full"
        >
          Sign In
        </Button>
      </div>
    );
  }

  async function onSubmit(data: FormData) {
    try {
      await post('/auth/reset-password', { token, password: data.password });
      setDone(true);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Reset failed. The link may have expired.';
      toast({ title: 'Error', description: msg, variant: 'destructive' });
    }
  }

  return (
    <div className="w-full max-w-sm bg-white border rounded-lg p-6 shadow-sm">
      <h1 className="text-2xl font-medium mb-1">Create new password</h1>
      <p className="text-sm text-gray-600 mb-5">
        Your new password must be different from previously used passwords.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <div>
          <Label htmlFor="password">New password</Label>
          <div className="relative mt-1">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              autoFocus
              className="pr-10"
              {...register('password')}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              aria-label="Toggle password visibility"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-sm text-destructive mt-1">{errors.password.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="confirmPassword">Confirm new password</Label>
          <Input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            className="mt-1"
            {...register('confirmPassword')}
          />
          {errors.confirmPassword && (
            <p className="text-sm text-destructive mt-1">{errors.confirmPassword.message}</p>
          )}
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-artic-teal hover:bg-artic-teal-dark text-black font-medium rounded-full"
        >
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Reset Password'}
        </Button>
      </form>
    </div>
  );
}
