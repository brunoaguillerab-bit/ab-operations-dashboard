/**
 * Sentry — client-side configuration.
 *
 * To activate:
 *   1. Create a free project at https://sentry.io
 *   2. npm install @sentry/nextjs
 *   3. Add to .env.local:
 *        NEXT_PUBLIC_SENTRY_DSN=https://xxx@oXXX.ingest.sentry.io/XXX
 *   4. Uncomment the code below and restart the dev server.
 */

// import * as Sentry from '@sentry/nextjs';
//
// Sentry.init({
//   dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
//
//   // Recommended: sample only 10% of performance transactions in production
//   tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
//
//   // Session replays: sample 10% of sessions, 100% with errors
//   replaysSessionSampleRate:   0.1,
//   replaysOnErrorSampleRate:   1.0,
//
//   // Don't send events in development (set to true to test)
//   enabled: process.env.NODE_ENV === 'production',
//
//   integrations: [
//     Sentry.replayIntegration(),
//   ],
// });
