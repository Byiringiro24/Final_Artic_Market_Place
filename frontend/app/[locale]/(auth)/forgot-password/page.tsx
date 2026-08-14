'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, MailCheck } from 'lucide-react';
import { post } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const schema = z.object({ email: z.string().email('Enter a valid email') });
type F = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<F>({ resolver: zodResolver(schema) });

  async function onSubmit(data: F) {
    await post('/auth/forgot-password', data);
    setSent(true);
  }

  if (sent) {
    return (
      <div className="w-full max-w-sm bg-white border rounded-lg p-6 text-center space-y-4">
        <MailCheck className="h-14 w-14 text-green-500 mx-auto" />
        <h2 className="text-xl font-semibold">Check your email</h2>
        <p className="text-gray-600 text-sm">
          If that email is registered, a reset link has been sent. Check your inbox.
        </p>
        <a href="../sign-in" className="text-artic-link hover:underline text-sm">
          Back to sign in
        </a>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm bg-white border rounded-lg p-6 shadow-sm">
      <h1 className="text-2xl font-medium mb-2">Forgot your password?</h1>
      <p className="text-sm text-gray-600 mb-5">
        Enter your email and we&apos;ll send you a reset link.
      </p>
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <div>
          <Label htmlFor="email">Email address</Label>
          <Input id="email" type="email" className="mt-1" autoFocus {...register('email')} />
          {errors.email && <p className="text-sm text-destructive mt-1">{errors.email.message}</p>}
        </div>
        <Button type="submit" disabled={isSubmitting} className="w-full bg-artic-orange hover:bg-artic-orange-dark text-black rounded-full">
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Send reset link'}
        </Button>
      </form>
    </div>
  );
}
