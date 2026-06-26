import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const SPREADSHEET_ID = process.env.SALDOS_SPREADSHEET_ID || '1lYCdwulvJPyBrH3UzwsTl4HzLN3FzfIXUHkjffi0s6I';
const SHEET_NAME = process.env.SALDOS_SHEET_NAME || '03 Agent - Monitor de Saldo AB';

type StatusSaldo = 'CRÍTICO' | 'ATENÇÃO' | 'OK' | 'Sem orçamento';

interface ClienteSaldo {
  cliente: string;
  account_id: string;
  account_name: string;
  orcamento: number;
  gasto: number;
  saldo: number;
  pct_gasto: number;
  status: StatusSaldo;
  plataformas: string;
  eur: boolean;
  g_spend: number;
  m_spend: number;
  media_diaria: number;
  dias_restantes: number | null;
  responsavel: string;
  insight: string;
  updated_at: string;
}

function parseCsv(text: string) {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];

    if (char === '"' && inQuotes && next === '"') {
      cell += '"';
      i += 1;
      continue;
    }

    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    if (char === ',' && !inQuotes) {
      row.push(cell);
      cell = '';
      continue;
    }

    if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && next === '\n') i += 1;
      row.push(cell);
      if (row.some(value => value.trim())) rows.push(row);
      row = [];
      cell = '';
      continue;
    }

    cell += char;
  }

  row.push(cell);
  if (row.some(value => value.trim())) rows.push(row);
  return rows;
}

function num(value: unknown) {
  const parsed = Number(String(value ?? '').replace(/[R$\s]/g, '').replace(/\./g, '').replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : 0;
}

function normalize(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

function mapStatus(value: string): StatusSaldo {
  const status = normalize(value).trim();
  if (['sem_saldo', 'critico', 'erro', 'moeda_incorreta'].includes(status)) return 'CRÍTICO';
  if (['atencao', 'risco_por_duracao'].includes(status)) return 'ATENÇÃO';
  if (!status) return 'Sem orçamento';
  return 'OK';
}

function platformType(value: string) {
  const normalized = normalize(value);
  if (normalized.includes('facebook') || normalized.includes('meta')) return 'meta';
  if (normalized.includes('google')) return 'google';
  return normalized || 'google';
}

export async function GET() {
  try {
    const url = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(SHEET_NAME)}`;
    const response = await fetch(url, { cache: 'no-store' });
    const csv = await response.text();

    if (!response.ok) {
      return NextResponse.json(
        { error: `Google Sheets retornou ${response.status}`, detail: csv.slice(0, 300) },
        { status: 502 }
      );
    }

    const [header = [], ...rows] = parseCsv(csv);
    const parsed = rows
      .map(cells => Object.fromEntries(header.map((key, index) => [key, cells[index] ?? ''])))
      .filter(row => row.dashboard_key || row.cliente);

    const latestRows = Array.from(parsed.reduce((acc, row) => {
      const key = String(row.dashboard_key || `${row.cliente}|${row.plataforma}|${row.account_id}`);
      const current = acc.get(key);
      const rowTime = Date.parse(String(row.updated_at || ''));
      const currentTime = Date.parse(String(current?.updated_at || ''));
      if (!current || rowTime >= currentTime) acc.set(key, row);
      return acc;
    }, new Map<string, Record<string, string>>()).values());

    const data: ClienteSaldo[] = latestRows.map(row => {
      const plataforma = platformType(String(row.plataforma || row.midia_nome || ''));
      const gasto = num(row.gasto_desde_saldo_base);
      const orcamento = num(row.saldo_base);
      const saldo = num(row.saldo_estimado);
      const pctGasto = orcamento > 0 ? Math.round((gasto / orcamento) * 1000) / 10 : 0;

      return {
        cliente: String(row.cliente || ''),
        account_id: String(row.account_id || ''),
        account_name: String(row.account_name || ''),
        orcamento,
        gasto,
        saldo,
        pct_gasto: pctGasto,
        status: mapStatus(String(row.status || '')),
        plataformas: plataforma,
        eur: false,
        g_spend: plataforma === 'google' ? gasto : 0,
        m_spend: plataforma === 'meta' ? gasto : 0,
        media_diaria: num(row.media_diaria),
        dias_restantes: String(row.dias_restantes || '').trim() ? num(row.dias_restantes) : null,
        responsavel: String(row.responsavel || ''),
        insight: String(row.motivo_alerta || row.mensagem_telegram || ''),
        updated_at: String(row.updated_at || ''),
      };
    });

    const order: Record<StatusSaldo, number> = { 'CRÍTICO': 0, 'ATENÇÃO': 1, 'Sem orçamento': 2, OK: 3 };
    data.sort((a, b) => order[a.status] - order[b.status] || a.cliente.localeCompare(b.cliente));

    const resumo = {
      criticos: data.filter(item => item.status === 'CRÍTICO').length,
      atencao: data.filter(item => item.status === 'ATENÇÃO').length,
      ok: data.filter(item => item.status === 'OK').length,
      semOrc: data.filter(item => item.status === 'Sem orçamento').length,
      total: data.length,
    };

    const updatedAt = data.reduce((latest, item) => {
      const itemTime = Date.parse(item.updated_at || '');
      const latestTime = Date.parse(latest || '');
      return itemTime > latestTime ? item.updated_at : latest;
    }, '');

    return NextResponse.json({
      data,
      resumo,
      periodo: { dateFrom: '', dateTo: '', diasNoMes: 0, totalDias: 0 },
      sheetName: SHEET_NAME,
      updatedAt: updatedAt || new Date().toISOString(),
    });
  } catch (err) {
    console.error('[alertas-saldos]', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
