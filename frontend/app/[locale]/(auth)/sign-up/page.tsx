import type { Metadata } from 'next';
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
        <SignUpForm />
      </div>
    </div>
  );
}
