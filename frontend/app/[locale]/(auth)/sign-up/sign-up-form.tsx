'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Enter a valid email address'),
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

const strengthLevels = [
  { label: 'Very weak', color: 'bg-red-500' },
  { label: 'Weak', color: 'bg-orange-500' },
  { label: 'Fair', color: 'bg-yellow-500' },
  { label: 'Good', color: 'bg-blue-500' },
  { label: 'Strong', color: 'bg-green-500' },
];

function getStrength(pwd: string): number {
  let s = 0;
  if (pwd.length >= 8) s++;
  if (/[A-Z]/.test(pwd)) s++;
  if (/[a-z]/.test(pwd)) s++;
  if (/[0-9]/.test(pwd)) s++;
  if (/[^A-Za-z0-9]/.test(pwd)) s++;
  return s;
}

export default function SignUpForm() {
  const router = useRouter();
  const locale = useLocale();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [done, setDone] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const password = watch('password', '');
  const strength = getStrength(password);

  async function onSubmit(data: FormData) {
    try {
      await post('/auth/register', {
        name: data.name,
        email: data.email,
        password: data.password,
      });
      setDone(true);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Registration failed. Please try again.';
      toast({ title: 'Error', description: msg, variant: 'destructive' });
    }
  }

  if (done) {
    return (
      <div className="text-center space-y-4 py-4">
        <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto" />
        <h2 className="text-xl font-semibold">Account created!</h2>
        <p className="text-gray-600 text-sm">
          We sent a verification link to your email. Please verify to activate your account.
        </p>
        <Button
          onClick={() => router.push(`/${locale}/sign-in`)}
          className="w-full bg-artic-orange hover:bg-artic-orange-dark text-black rounded-full"
        >
          Go to Sign In
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <div>
        <Label htmlFor="name">Your name</Label>
        <Input id="name" autoComplete="name" className="mt-1" {...register('name')} />
        {errors.name && <p className="text-sm text-destructive mt-1">{errors.name.message}</p>}
      </div>

      <div>
        <Label htmlFor="email">Email address</Label>
        <Input id="email" type="email" autoComplete="email" className="mt-1" {...register('email')} />
        {errors.email && <p className="text-sm text-destructive mt-1">{errors.email.message}</p>}
      </div>

      <div>
        <Label htmlFor="password">Password</Label>
        <div className="relative mt-1">
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            className="pr-10"
            {...register('password')}
          />
          <button
            type="button"
            onClick={() => setShowPassword((p) => !p)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
            aria-label="Toggle password visibility"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {/* Strength meter */}
        {password.length > 0 && (
          <div className="mt-2">
            <div className="flex gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className={`h-1 flex-1 rounded-full transition-colors ${
                    i < strength ? strengthLevels[strength - 1].color : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-1">{strengthLevels[strength - 1]?.label}</p>
          </div>
        )}
        {errors.password && <p className="text-sm text-destructive mt-1">{errors.password.message}</p>}
      </div>

      <div>
        <Label htmlFor="confirmPassword">Re-enter password</Label>
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
        className="w-full bg-artic-orange hover:bg-artic-orange-dark text-black font-medium rounded-full"
      >
        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create your ARTIC account'}
      </Button>
    </form>
  );
}
