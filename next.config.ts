import type { NextConfig } from 'next';

// ── Security headers applied to every response ─────────────────────────────
const securityHeaders = [
  // Prevent DNS pre-fetching leaks
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  // Prevent clickjacking — only allow same-origin frames (needed for EmbedFrame iframes)
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  // Prevent MIME-type sniffing
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  // Legacy XSS filter (browsers)
  { key: 'X-XSS-Protection', value: '1; mode=block' },
  // Limit referrer info sent to external sites
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // Disable permissions that this app doesn't need
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()' },
];

const nextConfig: NextConfig = {
  // ── Security headers ──────────────────────────────────────────────────────
  async headers() {
    return [
      {
        source:  '/(.*)',
        headers: securityHeaders,
      },
      // CORS: restrict API routes — only allow same-origin by default
      {
        source:  '/api/(.*)',
        headers: [
          {
            key:   'Access-Control-Allow-Origin',
            value: process.env.NODE_ENV === 'production'
              ? process.env.ALLOWED_ORIGIN ?? 'https://your-domain.com'
              : 'http://localhost:3000',
          },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
        ],
      },
      // Windsor proxy routes — chamados pelo marketing-dashboard (localhost:3001) via fetch cross-origin
      // Este bloco deve vir DEPOIS do /api/(.*) para sobrescrever o CORS com origem aberta
      {
        source:  '/api/windsor(.*)',
        headers: [
          { key: 'Access-Control-Allow-Origin',  value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type' },
          // Remove credential header — credentials não funcionam com origin: *
          { key: 'Access-Control-Allow-Credentials', value: 'false' },
        ],
      },
    ];
  },

  // ── Redirect root to /clientes (or /login if not authed — middleware handles) ─
  async redirects() {
    return [
      {
        source:      '/',
        destination: '/clientes',
        permanent:   false,
      },
    ];
  },
};

export default nextConfig;
