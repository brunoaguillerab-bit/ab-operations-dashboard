import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/auth/me
 *
 * Returns the identity of the currently authenticated user.
 * User info is injected as request headers by middleware.ts.
 */
export async function GET(req: NextRequest) {
  const id       = req.headers.get('x-user-id');
  const role     = req.headers.get('x-user-role');
  const username = req.headers.get('x-username');

  if (!id || !role || !username) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
  }

  return NextResponse.json({
    user: { id, username, role },
  });
}
