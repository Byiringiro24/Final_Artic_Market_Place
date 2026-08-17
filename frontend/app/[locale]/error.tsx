'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: Props) {
  useEffect(() => {
    // Log to error reporting service in production
    console.error('Page error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-artic-light-bg flex flex-col items-center justify-center px-4 text-center">
      <div className="text-artic-teal text-3xl font-black mb-6">ARTIC</div>

      <div className="bg-white border rounded-2xl p-10 max-w-md w-full shadow-sm">
        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="h-8 w-8 text-red-500" />
        </div>
        <h1 className="text-xl font-bold text-gray-800 mb-2">Something went wrong</h1>
        <p className="text-gray-500 text-sm mb-6">
          We encountered an unexpected error. Please try again, or return to the homepage.
        </p>

        {process.env.NODE_ENV === 'development' && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-left text-xs text-red-700 mb-6 font-mono">
            {error.message}
          </div>
        )}

        <div className="flex gap-3 justify-center">
          <Button
            onClick={reset}
            className="gap-2 bg-artic-teal hover:bg-artic-teal-dark text-black rounded-full"
          >
            <RefreshCw className="h-4 w-4" /> Try Again
          </Button>
          <Button
            variant="outline"
            onClick={() => (window.location.href = '/')}
            className="gap-2 rounded-full"
          >
            <Home className="h-4 w-4" /> Home
          </Button>
        </div>
      </div>
    </div>
  );
}
