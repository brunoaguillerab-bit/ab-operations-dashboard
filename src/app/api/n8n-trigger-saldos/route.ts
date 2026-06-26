import { NextResponse } from 'next/server';

const WEBHOOK_URL =
  process.env.N8N_SALDOS_WEBHOOK_URL ||
  'https://n8n.abtracking.com.br/webhook/dashboard-monitor-saldo-ab';

export async function POST() {
  try {
    const res = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ source: 'dashboard-saldos', triggeredAt: new Date().toISOString() }),
      signal: AbortSignal.timeout(10000),
    });

    const data = await res.json().catch(() => ({}));
    return NextResponse.json({ success: res.ok, status: res.status, data });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
