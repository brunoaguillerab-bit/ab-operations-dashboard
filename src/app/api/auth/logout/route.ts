import { NextResponse } from 'next/server';
import { COOKIE_ACCESS, COOKIE_REFRESH } from '@/lib/auth';

/**
 * POST /api/auth/logout
 *
 * Clears both the access and refresh token cookies.
 */
export async function POST() {
  const res = NextResponse.json({ ok: true });

  res.cookies.set(COOKIE_ACCESS, '', {
    httpOnly: true,
    sameSite: 'strict',
    path:     '/',
    maxAge:   0,
  });

  res.cookies.set(COOKIE_REFRESH, '', {
    httpOnly: true,
    sameSite: 'strict',
    path:     '/api/auth/refresh',
    maxAge:   0,
  });

  return res;
}
