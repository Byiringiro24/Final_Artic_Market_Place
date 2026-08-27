import type { Metadata } from 'next';
import { GoogleSignInButton } from '@/components/auth/google-signin-button';
import SignUpForm from './sign-up-form';

export const metadata: Metadata = { title: 'Create Account' };

export default function SignUpPage() {
  return (
    <div className="w-full max-w-sm">
      <div className="bg-white border border-gray-300 rounded-lg p-6 shadow-sm">
        <h1 className="text-2xl font-medium mb-1">Create account</h1>
        <p className="text-sm text-gray-600 mb-5">
          Already have an account?{' '}
          <a href="./sign-in" className="text-artic-link hover:underline">
            Sign in
          </a>
        </p>
        <div className="mb-4">
          <GoogleSignInButton label="Sign up with Google" />
        </div>
        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-gray-500">or register manually</span>
          </div>
        </div>
        <SignUpForm />
      </div>
    </div>
  );
}
