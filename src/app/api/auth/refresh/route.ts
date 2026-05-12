import { NextRequest, NextResponse } from 'next/server';
import {
  verifyToken,
  signAccessToken,
  COOKIE_ACCESS,
  COOKIE_REFRESH,
  ACCESS_COOKIE_OPTS,
} from '@/lib/auth';

/**
 * POST /api/auth/refresh
 *
 * Reads the refresh token from the HttpOnly cookie (path-restricted to this route),
 * verifies it, and issues a fresh access token.
 */
export async function POST(req: NextRequest) {
  const refreshToken = req.cookies.get(COOKIE_REFRESH)?.value;

  if (!refreshToken) {
    return NextResponse.json({ error: 'Sessão expirada. Faça login novamente.' }, { status: 401 });
  }

  const payload = await verifyToken(refreshToken);

  if (!payload || payload.type !== 'refresh') {
    // Clear the stale refresh cookie
    const res = NextResponse.json({ error: 'Sessão inválida ou expirada.' }, { status: 401 });
    res.cookies.delete(COOKIE_REFRESH);
    return res;
  }

  const newAccessToken = await signAccessToken({
    sub:      payload.sub,
    username: payload.username,
    role:     payload.role,
  });

  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_ACCESS, newAccessToken, ACCESS_COOKIE_OPTS);
  return res;
}
