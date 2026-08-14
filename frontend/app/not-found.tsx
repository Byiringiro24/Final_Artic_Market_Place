// Root not-found — redirects to locale-specific 404
import { redirect } from 'next/navigation';
export default function RootNotFound() {
  redirect('/en-US');
}
