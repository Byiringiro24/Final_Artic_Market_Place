import type { Metadata } from 'next';
import SignUpClient from './sign-up-client';

export const metadata: Metadata = { title: 'Create Account' };

export default function SignUpPage() {
  return <SignUpClient />;
}
