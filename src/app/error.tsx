'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  error:  Error & { digest?: string };
  reset:  () => void;
}

/**
 * Next.js App Router global error boundary.
 * Shown when an unhandled error is thrown in a page or layout.
 */
export default function GlobalError({ error, reset }: Props) {
  useEffect(() => {
    // Log to console for local debugging
    console.error('[GlobalError]', error);

    // Forward to Sentry if available (uncomment after npm install @sentry/nextjs)
    // import('@sentry/nextjs').then(({ captureException }) => captureException(error));
  }, [error]);

  return (
    <div className="min-h-screen bg-[#0F1117] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="w-16 h-16 rounded-2xl bg-red-900/20 border border-red-600/40 flex items-center justify-center mx-auto mb-6">
          <AlertTriangle size={28} className="text-red-400" />
        </div>

        <h1 className="text-xl font-bold text-white mb-2">Algo deu errado</h1>
        <p className="text-[#A1A1AA] text-sm mb-2">
          Ocorreu um erro inesperado na aplicação.
        </p>

        {/* Show error digest in development */}
        {process.env.NODE_ENV !== 'production' && (
          <p className="text-[#6B7280] text-xs font-mono bg-[#181C25] border border-[#2A2F3A] rounded-lg px-3 py-2 mb-6 break-all">
            {error.message || error.digest || 'Unknown error'}
          </p>
        )}

        <button
          onClick={reset}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#EF4444] hover:bg-[#DC2626] text-white text-sm font-medium rounded-lg transition-colors"
        >
          <RefreshCw size={15} />
          Tentar novamente
        </button>
      </div>
    </div>
  );
}
