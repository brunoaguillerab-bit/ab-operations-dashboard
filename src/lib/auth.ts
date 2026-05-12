import { SignJWT, jwtVerify, type JWTPayload } from 'jose';

// ── Secret ─────────────────────────────────────────────────────────────────
const getSecret = () => {
  const s = process.env.JWT_SECRET;
  if (!s) throw new Error('JWT_SECRET não definido no .env.local');
  return new TextEncoder().encode(s);
};

// ── Types ──────────────────────────────────────────────────────────────────
export type Role = 'admin' | 'editor' | 'viewer';

export interface AuthPayload extends JWTPayload {
  sub:      string;
  username: string;
  role:     Role;
  type:     'access' | 'refresh';
}

// ── TTLs ───────────────────────────────────────────────────────────────────
const ACCESS_TTL  = '15m';
const REFRESH_TTL = '7d';

// ── Token signing ──────────────────────────────────────────────────────────
export async function signAccessToken(
  payload: Pick<AuthPayload, 'sub' | 'username' | 'role'>
): Promise<string> {
  return new SignJWT({ ...payload, type: 'access' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(ACCESS_TTL)
    .sign(getSecret());
}

export async function signRefreshToken(
  payload: Pick<AuthPayload, 'sub' | 'username' | 'role'>
): Promise<string> {
  return new SignJWT({ ...payload, type: 'refresh' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(REFRESH_TTL)
    .sign(getSecret());
}

// ── Token verification ─────────────────────────────────────────────────────
export async function verifyToken(token: string): Promise<AuthPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload as AuthPayload;
  } catch {
    return null;
  }
}

// ── Cookie helpers ─────────────────────────────────────────────────────────
export const COOKIE_ACCESS  = 'ab_access';
export const COOKIE_REFRESH = 'ab_refresh';

export const ACCESS_COOKIE_OPTS = {
  httpOnly: true,
  sameSite: 'strict' as const,
  secure:   process.env.NODE_ENV === 'production',
  path:     '/',
  maxAge:   15 * 60,           // 15 min
};

export const REFRESH_COOKIE_OPTS = {
  httpOnly: true,
  sameSite: 'strict' as const,
  secure:   process.env.NODE_ENV === 'production',
  path:     '/api/auth/refresh', // scope: only sent to refresh endpoint
  maxAge:   7 * 24 * 60 * 60,  // 7 days
};
