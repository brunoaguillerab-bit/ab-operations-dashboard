/**
 * In-memory rate limiter — works in both Node.js and Edge runtimes.
 * State resets when the process restarts; for multi-instance production
 * deployments, replace with Upstash Redis (@upstash/ratelimit).
 */

interface Entry {
  count:   number;
  resetAt: number;
}

// Module-level store (persists within a single server process)
const store = new Map<string, Entry>();

export interface RateLimitResult {
  ok:        boolean;
  remaining: number;
  resetAt:   number;   // epoch ms
}

/**
 * Check and increment the rate limit counter for a given key.
 *
 * @param key       Unique identifier (e.g. `login:${ip}`, `api:${ip}`)
 * @param limit     Max requests allowed in the window
 * @param windowMs  Window duration in milliseconds (default: 60 000)
 */
export function checkRateLimit(
  key:      string,
  limit:    number,
  windowMs: number = 60_000
): RateLimitResult {
  const now   = Date.now();
  let   entry = store.get(key);

  // Expired window → reset
  if (!entry || now > entry.resetAt) {
    entry = { count: 0, resetAt: now + windowMs };
    store.set(key, entry);
  }

  if (entry.count >= limit) {
    return { ok: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count++;
  return { ok: true, remaining: limit - entry.count, resetAt: entry.resetAt };
}

/**
 * Build the standard rate-limit response headers.
 */
export function rateLimitHeaders(result: RateLimitResult, limit: number) {
  return {
    'X-RateLimit-Limit':     String(limit),
    'X-RateLimit-Remaining': String(result.remaining),
    'X-RateLimit-Reset':     String(Math.ceil(result.resetAt / 1000)),
    ...(result.ok ? {} : { 'Retry-After': String(Math.ceil((result.resetAt - Date.now()) / 1000)) }),
  };
}
