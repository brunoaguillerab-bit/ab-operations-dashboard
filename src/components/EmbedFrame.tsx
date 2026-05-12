'use client';

import { useState, useEffect } from 'react';

interface EmbedFrameProps {
  /** URL base do dashboard externo (ex: http://localhost:3001) */
  baseUrl: string;
  /** Hash da seção a exibir (ex: overview, meta-ads, google-ads) */
  hash: string;
  /** Título para exibir no loading state */
  title: string;
}

/**
 * EmbedFrame
 * Embeds an external dashboard in an iframe with ?embed=true to hide its
 * internal sidebar. Hash-based navigation switches the internal section.
 */
export default function EmbedFrame({ baseUrl, hash, title }: EmbedFrameProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [iframeUrl, setIframeUrl] = useState('');

  useEffect(() => {
    // ?embed=true hides the marketing dashboard's internal sidebar
    setIframeUrl(`${baseUrl}?embed=true#${hash}`);
    setIsLoading(true);
  }, [baseUrl, hash]);

  return (
    <div className="flex-1 overflow-hidden relative bg-[#0F1117]">
      {/* Loading state */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#0F1117] z-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-red-600 border-t-transparent mx-auto mb-4" />
            <p className="text-[#A1A1AA] text-sm">Carregando {title}...</p>
          </div>
        </div>
      )}

      {/* iFrame */}
      {iframeUrl && (
        <iframe
          key={iframeUrl}
          src={iframeUrl}
          className="w-full h-full border-0"
          title={title}
          onLoad={() => setIsLoading(false)}
          allow="clipboard-write"
        />
      )}
    </div>
  );
}
