import type { Metadata } from 'next';
import { GoogleSignInButton } from '@/components/auth/google-signin-button';
import SignInForm from './sign-in-form';

export const metadata: Metadata = { title: 'Sign In' };

export default function SignInPage() {
  return (
    <div className="w-full max-w-sm">
      <div className="bg-white border border-gray-300 rounded-lg p-6 shadow-sm">
        <h1 className="text-2xl font-medium mb-5">Sign In</h1>
        <div className="mb-4">
          <GoogleSignInButton />
        </div>
        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-gray-500">or continue with email</span>
          </div>
        </div>
        <SignInForm />
      </div>

      <div className="mt-4 text-center">
        <div className="flex items-center gap-3 my-4">
          <div className="flex-1 h-px bg-gray-300" />
          <span className="text-xs text-gray-500">New to ARTIC Marketplace?</span>
          <div className="flex-1 h-px bg-gray-300" />
        </div>
        <a
          href="./sign-up"
          className="block w-full border border-gray-300 rounded-full py-2 text-sm text-center bg-gradient-to-b from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 transition-all"
        >
          Create your ARTIC account
        </a>
      </div>
    </div>
  );
}
