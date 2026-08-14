'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, User, Lock, Bell } from 'lucide-react';
import { put, post } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phoneNumber: z.string().optional(),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Required'),
    newPassword: z
      .string()
      .min(8, 'At least 8 characters')
      .regex(/[A-Z]/, 'Include one uppercase letter')
      .regex(/[0-9]/, 'Include one number'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type ProfileForm = z.infer<typeof profileSchema>;
type PasswordForm = z.infer<typeof passwordSchema>;

type Tab = 'profile' | 'security';

export default function AccountSettingsPage() {
  const { user, updateUser } = useAuthStore();
  const { toast } = useToast();
  const [tab, setTab] = useState<Tab>('profile');

  const profileForm = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user?.name || '', phoneNumber: '' },
  });

  const passwordForm = useForm<PasswordForm>({ resolver: zodResolver(passwordSchema) });

  const { mutate: saveProfile, isPending: savingProfile } = useMutation({
    mutationFn: (d: ProfileForm) => put('/users/profile', d),
    onSuccess: (_, vars) => {
      updateUser({ name: vars.name });
      toast({ title: 'Profile updated successfully' });
    },
    onError: () => toast({ title: 'Failed to update profile', variant: 'destructive' }),
  });

  const { mutate: changePassword, isPending: changingPwd } = useMutation({
    mutationFn: (d: PasswordForm) =>
      post('/auth/change-password', {
        currentPassword: d.currentPassword,
        newPassword: d.newPassword,
      }),
    onSuccess: () => {
      toast({ title: 'Password changed successfully' });
      passwordForm.reset();
    },
    onError: (err: unknown) => {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Failed to change password';
      toast({ title: 'Error', description: msg, variant: 'destructive' });
    },
  });

  const TABS: Array<{ id: Tab; label: string; icon: React.ReactNode }> = [
    { id: 'profile', label: 'Profile', icon: <User className="h-4 w-4" /> },
    { id: 'security', label: 'Security', icon: <Lock className="h-4 w-4" /> },
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Account Settings</h1>

      {/* Tabs */}
      <div className="flex gap-0 border-b mb-6">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-5 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              tab === t.id
                ? 'border-artic-orange text-artic-orange'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Profile tab */}
      {tab === 'profile' && (
        <div className="bg-white border rounded-lg p-6">
          <h2 className="font-semibold mb-5">Personal Information</h2>

          {/* Avatar */}
          <div className="flex items-center gap-4 mb-6 pb-6 border-b">
            <div className="w-16 h-16 rounded-full bg-artic-orange flex items-center justify-center text-black font-bold text-2xl">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <p className="font-medium">{user?.name}</p>
              <p className="text-sm text-gray-500">{user?.email}</p>
              <span className={`text-xs mt-1 inline-block px-2 py-0.5 rounded-full ${user?.emailVerified ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                {user?.emailVerified ? '✓ Email verified' : 'Email not verified'}
              </span>
            </div>
          </div>

          <form onSubmit={profileForm.handleSubmit((d) => saveProfile(d))} className="space-y-4">
            <div>
              <Label htmlFor="name">Full name</Label>
              <Input id="name" className="mt-1" {...profileForm.register('name')} />
              {profileForm.formState.errors.name && (
                <p className="text-destructive text-sm mt-1">{profileForm.formState.errors.name.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                value={user?.email}
                disabled
                className="mt-1 bg-gray-50 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-1">Email changes require contacting support.</p>
            </div>

            <div>
              <Label htmlFor="phone">Phone number</Label>
              <Input
                id="phone"
                type="tel"
                className="mt-1"
                placeholder="+1 (555) 000-0000"
                {...profileForm.register('phoneNumber')}
              />
            </div>

            <Button
              type="submit"
              disabled={savingProfile}
              className="bg-artic-orange hover:bg-artic-orange-dark text-black rounded-full"
            >
              {savingProfile ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Save Changes
            </Button>
          </form>
        </div>
      )}

      {/* Security tab */}
      {tab === 'security' && (
        <div className="bg-white border rounded-lg p-6">
          <h2 className="font-semibold mb-5">Change Password</h2>
          <form onSubmit={passwordForm.handleSubmit((d) => changePassword(d))} className="space-y-4">
            <div>
              <Label htmlFor="currentPassword">Current password</Label>
              <Input
                id="currentPassword"
                type="password"
                autoComplete="current-password"
                className="mt-1"
                {...passwordForm.register('currentPassword')}
              />
              {passwordForm.formState.errors.currentPassword && (
                <p className="text-destructive text-sm mt-1">{passwordForm.formState.errors.currentPassword.message}</p>
              )}
            </div>

            <Separator />

            <div>
              <Label htmlFor="newPassword">New password</Label>
              <Input
                id="newPassword"
                type="password"
                autoComplete="new-password"
                className="mt-1"
                {...passwordForm.register('newPassword')}
              />
              {passwordForm.formState.errors.newPassword && (
                <p className="text-destructive text-sm mt-1">{passwordForm.formState.errors.newPassword.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="confirmPassword">Confirm new password</Label>
              <Input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                className="mt-1"
                {...passwordForm.register('confirmPassword')}
              />
              {passwordForm.formState.errors.confirmPassword && (
                <p className="text-destructive text-sm mt-1">{passwordForm.formState.errors.confirmPassword.message}</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={changingPwd}
              className="bg-artic-orange hover:bg-artic-orange-dark text-black rounded-full"
            >
              {changingPwd ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Update Password
            </Button>
          </form>
        </div>
      )}
    </div>
  );
}
