import type { Metadata } from 'next';
import SignInForm from './sign-in-form';

export const metadata: Metadata = { title: 'Sign In' };

export default function SignInPage() {
  return (
    <div className="w-full max-w-sm">
      <div className="bg-white border border-gray-300 rounded-lg p-6 shadow-sm">
        <h1 className="text-2xl font-medium mb-5">Sign In</h1>
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
