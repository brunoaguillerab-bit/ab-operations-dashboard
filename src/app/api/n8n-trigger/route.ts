import { NextResponse } from 'next/server';

const WEBHOOK_URL = process.env.N8N_WEBHOOK_URL;

export async function POST() {
  if (!WEBHOOK_URL) {
    return NextResponse.json(
      { error: 'N8N_WEBHOOK_URL não configurada no .env.local' },
      { status: 503 }
    );
  }

  try {
    const res = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ source: 'dashboard', triggeredAt: new Date().toISOString() }),
      signal: AbortSignal.timeout(10000),
    });

    const data = await res.json().catch(() => ({}));
    return NextResponse.json({ success: res.ok, status: res.status, data });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
