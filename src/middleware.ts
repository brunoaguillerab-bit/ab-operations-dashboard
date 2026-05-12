import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, COOKIE_ACCESS } from '@/lib/auth';
import { checkRateLimit, rateLimitHeaders } from '@/lib/rateLimit';

// ── Public paths (no auth required) ───────────────────────────────────────
const PUBLIC_PREFIXES = [
  '/login',
  '/api/auth/',
  '/api/windsor',        // /api/windsor e /api/windsor-proxy — chamados pelo marketing-dashboard (sem cookie)
  '/_next/',
  '/favicon.ico',
];

function isPublic(pathname: string): boolean {
  return PUBLIC_PREFIXES.some(p => pathname === p || pathname.startsWith(p));
}

// ── RBAC: which roles can access which API paths ───────────────────────────
const ROLE_RESTRICTIONS: Record<string, string[]> = {
  '/api/n8n-trigger': ['admin', 'editor'],  // viewer cannot trigger
};

// ── Middleware ─────────────────────────────────────────────────────────────
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1. Allow public routes immediately
  if (isPublic(pathname)) return NextResponse.next();

  // 2. Global rate limit for all API routes: 120 req/min per IP
  if (pathname.startsWith('/api/')) {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? '127.0.0.1';
    const rl = checkRateLimit(`api:${ip}`, 120, 60_000);
    if (!rl.ok) {
      return NextResponse.json(
        { error: 'Taxa de requisições excedida. Aguarde e tente novamente.' },
        { status: 429, headers: rateLimitHeaders(rl, 120) }
      );
    }
  }

  // 3. Verify access token from cookie
  const token   = req.cookies.get(COOKIE_ACCESS)?.value;
  const payload = token ? await verifyToken(token) : null;
  const valid   = payload?.type === 'access';

  if (!valid) {
    // API routes → 401 JSON
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { error: 'Não autenticado', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }
    // Pages → redirect to /login with return URL
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('from', pathname);
    const res = NextResponse.redirect(url);
    res.cookies.delete(COOKIE_ACCESS);
    return res;
  }

  // 4. RBAC check
  const allowedRoles = ROLE_RESTRICTIONS[pathname];
  if (allowedRoles && !allowedRoles.includes(payload!.role)) {
    return NextResponse.json(
      { error: 'Permissão insuficiente para esta ação' },
      { status: 403 }
    );
  }

  // 5. Inject user identity into downstream headers
  const headers = new Headers(req.headers);
  headers.set('x-user-id',   payload!.sub);
  headers.set('x-user-role', payload!.role);
  headers.set('x-username',  payload!.username);

  return NextResponse.next({ request: { headers } });
}

export const config = {
  // Run on every route except static assets
  matcher: ['/((?!_next/static|_next/image|favicon\\.ico).*)'],
};
